import {type NextFunction, type Request, type Response} from 'express';
import Task from './models.js';
import {StatusCodes} from 'http-status-codes';
import {BadRequest, Forbidden} from '../../../custom-errors/main.js';
import {notifyUserOfUpcomingDeadline} from './utilities.js';
import {
    checkResource,
    checkUser,
    findResourceById,
    getOrSetCache,
    validateObjectIds,
} from '../../setup/helpers.js';
import {asyncHandler} from '../auth/middleware.js';
import {type TypedRequestBody} from 'zod-express-middleware';
import {createTaskSchema, updateTaskSchema} from './validation.js';
import {isResourceOwner} from '../users/helpers.js';
import {Status} from './types.js';
import Member from '../work_space_members/models.js';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
    const tasks = await getOrSetCache('tasks', Task, (model) => model.find({}));
    res.status(StatusCodes.OK).json({data: tasks});
});

export const getTasksPage = asyncHandler(
    async (req: Request, res: Response) => {
        const tasks = await Task.find({});
        res.render('front_end/index', {tasks: tasks});
    }
);

export const getUserTasks = asyncHandler(
    async (req: Request, res: Response) => {
        const user = req.user;
        const {userId} = req.body;
        validateObjectIds([userId]);
        const loggedInUser = await checkUser(user);
        await isResourceOwner(loggedInUser.id, userId);

        const tasks = await Task.find({owner: loggedInUser.id});
        res.status(StatusCodes.OK).json({data: tasks, count: tasks.length});
    }
);

export const getUserTask = asyncHandler(
    async (req: Request, res: Response) => {
        const user = req.user;
        const {taskId} = req.params;
        validateObjectIds([taskId]);
        const loggedInUser = await checkUser(user);

        const task = await Task.findOne({
            owner: loggedInUser.id,
            _id: taskId,
        });

        await checkResource(task);
        res.status(StatusCodes.OK).json({data: task});
    }
);

export const getTask = asyncHandler(async (req: Request, res: Response) => {
    const {taskId} = req.params;
    validateObjectIds([taskId]);
    const task = await findResourceById(Task, taskId);
    res.status(StatusCodes.OK).json({data: task});
});

export const createTask = asyncHandler(
    async (
        req: TypedRequestBody<typeof createTaskSchema>,
        res: Response,
        next: NextFunction
    ) => {
        const user = req.user;
        const attachment = req.file;
		
        const {
            dead_line,
            dependants,
            priority,
            skill_set,
            status,
            workerId,
            workspaceId,
        } = req.body;
        const loggedInUser = await checkUser(user);
        const worker = await Member.findOne({member: workerId});
        const creator = await Member.findOne({member: loggedInUser.id});
        const validatedWorker = await checkResource(worker);
        const validateCreator = await checkResource(creator);

        if (
            validatedWorker.workspace.id !== workspaceId ||
            validateCreator.workspace.id !== workspaceId
        ) {
            return next(
                new Forbidden('Creator or worker does not belong to this workspace')
            );
        }

        const task = await Task.create({
            creator: loggedInUser.id,
            worker: validatedWorker.id,
            workspace: validateCreator.workspace.id,
            dead_line,
            dependants,
            priority,
            skill_set,
            status,
            attachment: attachment?.path,
        });
        const validatedResource = await checkResource(task);
        if (worker) {
            validatedResource.status = Status.InProgress;
            validatedResource.worker.id = worker;
            await validatedResource.save();
            try {
                await notifyUserOfUpcomingDeadline(validatedResource);
            } catch (err: any) {
                return next(
                    new BadRequest(
                        `Error notifying user of upcoming deadline: ${err.message}`
                    )
                );
            }
        }
        res.status(StatusCodes.CREATED).json({data: validatedResource});
    }
);

export const updateTask = asyncHandler(
    async (
        req: TypedRequestBody<typeof updateTaskSchema>,
        res: Response,
        next: NextFunction
    ) => {
        const {priority, skill_set, dead_line} = req.body;
        const {taskId} = req.params;
        const user = req.user;
        validateObjectIds([taskId]);
        const loggedInUser = await checkUser(user);
        const attachment = req.file;

        // if (!attachment || !attachment.path) {
        // 	return next(new NotFound('No file uploaded or file path is missing'));
        // }

        const task = await findResourceById(Task, taskId);

        await isResourceOwner(loggedInUser.id, task.creator.id);

        const updatedTask = await Task.findByIdAndUpdate(
            task.id,
            {
                priority: priority,
                skill_set: skill_set,
                dead_line: dead_line,
                attachment: attachment?.path,
                owner: loggedInUser.id,
            },
            {new: true}
        );

        const validatedResource = await checkResource(updatedTask);
        try {
            await notifyUserOfUpcomingDeadline(validatedResource);
            res
                .status(StatusCodes.OK)
                .json({msg: 'task updated successfully', data: validatedResource});
        } catch (err: any) {
            next(new Forbidden(err.message));
        }
    }
);

export const deleteTask = asyncHandler(
    async (req: Request, res: Response) => {
        const user = req.user;
        const {taskId} = req.params;
        validateObjectIds([taskId]);
        const loggedInUser = await checkUser(user);
        const task = await findResourceById(Task, taskId);
        await isResourceOwner(loggedInUser.id, task.creator.id);

        await Task.findByIdAndDelete(task.id);

        res.status(StatusCodes.OK).json({msg: 'task deleted successfully'});
    }
);

export const assignTask = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {taskId, workerId} = req.params;
        const user = req.user;

        validateObjectIds([taskId, workerId]);
        const loggedInUser = await checkUser(user);
        const task = await findResourceById(Task, taskId);
        const creator = await Member.findOne({member: task.creator.id});
        const validateCreator = await checkResource(creator);

        await isResourceOwner(loggedInUser.id, validateCreator.member.id);
        const worker = await Member.findOne({member: workerId});
        const validatedWorker = await checkResource(worker);

        if (
            validatedWorker.workspace.id !== task.workspace.id ||
            validateCreator.workspace.id !== task.workspace.id
        ) {
            return next(
                new Forbidden('Creator or worker does not belong to this workspace')
            );
        }
        const assignedTask = await Task.findByIdAndUpdate(
            task.id,
            {worker: validatedWorker.id, status: 'inProgress'},
            {new: true}
        ).populate({
            path: 'worker',
            populate: {
                path: 'member',
                select: 'email position',
            },
        });

        const validatedResource = await checkResource(assignedTask);
        try {
            await notifyUserOfUpcomingDeadline(validatedResource);

            res.status(StatusCodes.OK).json({
                data: validatedResource,
            });
        } catch (err: any) {
            next(new Forbidden(err.message));
        }
    }
);

export const markCompleted = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {taskId} = req.params;
        const user = req.user;

        validateObjectIds([taskId]);
        const loggedInUser = await checkUser(user);
        const task = await findResourceById(Task, taskId);
        await isResourceOwner(loggedInUser.id, task.creator.id);

        if (!task.worker) {
            return next(
                new BadRequest(
                    `task must be assigned to a user first before` +
                    ` marking it as completed, task is ${task.status}`
                )
            );
        }

        if (task.dependants && task.dependants.length > 0) {
            const incompleteDependants = await Task.find({
                _id: {$in: task.dependants},
                status: {$ne: 'completed'},
            });
            const incompleteDependantsIds = incompleteDependants
                .map((dep) => dep._id)
                .join(', ');
            if (incompleteDependants.length > 0) {
                return next(
                    new BadRequest(
                        `dependant tasks must be completed first ${incompleteDependantsIds}`
                    )
                );
            }
        }
        const taskToMark = await Task.findByIdAndUpdate(
            task.id,
            {status: 'completed'},
            {new: true}
        );

        const validatedResource = await checkResource(taskToMark);

        // if a task is marked as completed remove it from being a dependent on other tasks
        await Task.updateMany(
            {dependants: task.id},
            {$pull: {dependants: task.id}}
        );

        if (validatedResource.status === 'completed') {
            return next(new BadRequest(`task already marked as completed before`));
        }

        res.status(StatusCodes.OK).json({data: validatedResource});
    }
);
