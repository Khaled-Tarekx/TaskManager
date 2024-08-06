import {NextFunction, Request, Response} from "express";
import Task, {TaskInterface} from "./models.js";
import {StatusCodes} from "http-status-codes";
import {BadRequest, NotFound} from "../../../custom-errors/main.js";
import {notifyUserOfUpcomingDeadline} from "./utilities.js";
import mongoose from "mongoose";
import {getOrSetCache} from "../../setup/helpers.js"
import {asyncHandler} from "../auth/middleware.js";
import { userSchemaWithId } from "../auth/validation.js";


export const getTasks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const tasks = await getOrSetCache('tasks', Task, (model) => model.find());
    res.status(StatusCodes.OK).json({data: tasks});
});

export const getTasksPage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const tasks = await Task.find();
    res.render('front_end/index', {tasks: tasks});

});

export const getUserTasks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const tasks = await Task.find({owner: (user as userSchemaWithId).id});
    res.status(StatusCodes.OK).json({data: tasks, count: tasks.length});
});

export const getUserTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const task = await Task.findOne({
        owner: (user as userSchemaWithId).id,
        _id: id,
    });
    if (!task) {
        return next(new NotFound("no task found"));
    }
    res.status(StatusCodes.OK).json({data: task});
});

export const getTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const task = await Task.findById(id);
    if (!task) {
        return next(new NotFound("no task found"));
    }
    res.status(StatusCodes.OK).json({data: task});

});


export const createTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {owner} = req.body;
    const task = await Task.create({...req.body});
    if (req.file) {
        task.attachment = req.file.path
        await task.save();
    }
    if (owner) {
        task.status = "inProgress";
        await task.save();
        try {
            await notifyUserOfUpcomingDeadline(task);

        } catch (err: any) {
            return next(new BadRequest(`Error notifying user of upcoming deadline: ${err.message}`))
        }
    }
    res.status(StatusCodes.CREATED).json({data: task});
});

export const updateTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const taskToUpdate = (await Task.findByIdAndUpdate(
        id,
        {...req.body, attachment: req.file?.path, owner: (req.user as userSchemaWithId).id},
        {new: true, runValidators: true}
    )) as TaskInterface;
    if (!taskToUpdate) {
        return next(new NotFound("no task found"));
    }
    await notifyUserOfUpcomingDeadline(taskToUpdate);
    res.status(StatusCodes.OK).json({msg: "task updated successfully", data: taskToUpdate});
});

export const deleteTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }
    const taskToDelete = await Task.findByIdAndDelete(id);
    if (!taskToDelete) {
        return next(new NotFound("no task found"));
    }
    res
        .status(StatusCodes.OK)
        .json({msg: "task deleted successfully", data: taskToDelete});
});

export const assignTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id, user_id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequest("Invalid ID format"));
    }

    const assignedTask = (await Task.findByIdAndUpdate(
        id,
        {owner: user_id, status: "inProgress"},
        {new: true, runValidators: true}
    )) as TaskInterface;

    if (!assignedTask) {
        return next(new NotFound("no task found"));
    }

    await notifyUserOfUpcomingDeadline(assignedTask);

    res.status(StatusCodes.OK).json({msg: "task assigned to user successfully", data: assignedTask});

});

export const markCompleted = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new BadRequest("Invalid ID format"));
        }
        const task = await Task.findById(id);
        if (!task) {
            return next(new NotFound("no task found"));
        }

        if (!task.owner) {
            return next(new BadRequest(`task must be assigned to a user first before` +
                    ` marking it as completed, task is ${task.status}`
                )
            );
        }

        if (task.dependants && task.dependants.length > 0) {
            const incompleteDependants = await Task.find({
                _id: {$in: task.dependants},
                status: {$ne: "completed"},
            });
            const incompleteDependantsIds = incompleteDependants
                .map((dep) => dep._id)
                .join(", ");
            if (incompleteDependants.length > 0) {
                return next(
                    new BadRequest(
                        `dependant tasks must be completed first ${incompleteDependantsIds}`
                    )
                );
            }
        }
        const taskToMark = await Task.findByIdAndUpdate(
            id,
            {status: "completed"},
            {new: true, runValidators: true}
        );

        if (!taskToMark) {
            return next(new NotFound("no task found to mark"));
        }

        // if a task is marked as completed remove it from being a dependent on other tasks
        await Task.updateMany({dependants: id}, {$pull: {dependants: id}});

        if (taskToMark.status === "completed") {
            return next(new BadRequest(`task already marked as completed before`));
        }

        res.status(StatusCodes.OK).json({
                msg: `task completed by user ${taskToMark.owner} successfully`,
                data: taskToMark,
            });
});
