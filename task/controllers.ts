import { Request, Response, NextFunction, query } from 'express';
import Task, { TaskInterface } from "./models.js"
import User, { IUserDocument } from '../user/models.js';
import { StatusCodes } from "http-status-codes"
import { NotFound, BadRequest } from '../custom-errors/main.js';


export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const tasks = await Task.find()
     res.status(StatusCodes.OK).json({ data: tasks, count: tasks.length })
    } catch(err: any) {
        next(new BadRequest(err.message))
    }
}

export const getUserTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const user = req.user
    const tasks = await Task.find({owner:  (user as IUserDocument).id})
    res.status(StatusCodes.OK).json({ data: tasks, count: tasks.length })
} catch(err: any) {
    next(new BadRequest(err.message))
    }
}

export const getUserTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const { id } = req.params
        const task = await Task.findOne({ owner: (user as IUserDocument).id, _id: id })
        if (!task) {
            next(new NotFound('no task found'))
        }
        res.status(StatusCodes.OK).json({ data: task })
    } catch(err: any) {
        next(new BadRequest(err.message))
    }
}

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const { id } = req.params
    const task = await Task.findById(id)
    if (!task) {
        next(new NotFound('no task found'))
    }
     res.status(StatusCodes.OK).json({ data: task })
    } catch(err: any) {
        next(new BadRequest(err.message))
    }
}

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { owner } = req.body
        const task = await Task.create({...req.body })

        if (owner) {
            task.status = 'inProgress'
            task.save()
        res.status(StatusCodes.CREATED).json({ data: task })

        }
        res.status(StatusCodes.CREATED).json({ data: task })

    } catch (err: any) {
        next(new BadRequest(err.message))
    }
}

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const taskToUpdate = await Task.findByIdAndUpdate(id, { ...req.body , owner: (req.user as IUserDocument).id, }, 
        { new: true, runValidators: true })
        if (!taskToUpdate) {
            next(new NotFound('no task found'))
        }
    
     res.status(StatusCodes.OK).json({ msg: 'task updated successfully', data: taskToUpdate })

    } catch (err: any) {
        next(new BadRequest(err.message))
    }
}

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const taskToDelete = await Task.findByIdAndDelete(id)
        if (!taskToDelete) {
            next(new NotFound('no task found'))
        }
        res.status(StatusCodes.OK).json({ msg: 'task deleted successfully', data: taskToDelete })

    } catch (err: any) {
        next(new BadRequest(err.message))
    }
}


export const assignTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, user_id } = req.params
        
        const taskToAssign = await Task.findByIdAndUpdate(id, { owner: user_id, status: "inProgress" }, 
        { new: true, runValidators: true })
        if (!taskToAssign) {
            next(new NotFound('no task found'))
        }
    
     res.status(StatusCodes.OK).json({ msg: 'task assigned to user successfully', data: taskToAssign })

    } catch (err: any) {
        next(new BadRequest(err.message))
    }
}

export const markCompleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const task = await Task.findById(id)
        if (!task) {
           return next(new NotFound('no task found'))
        }

        if(!task.owner) {
            return next(new BadRequest(`task must be assigned to a user first before` +
                ` marking it as completed, task is ${task.status}`))
        }

        if (task.dependants && task.dependants.length > 0) {
            return next(new BadRequest(`dependant tasks must be completed first ${task.dependants}`))
        }

        const taskToMark = await Task.findByIdAndUpdate(id, { status: "completed" }, 
        { new: true, runValidators: true })

        if (!taskToMark) {
            return next(new NotFound('no task found to mark'))
        }
        
        // if a task is marked as completed remove it from being a dependant on other tasks
        await Task.updateMany(
            { dependants: id },
            { $pull: { dependants: id } }
        );

        if (taskToMark.status === 'completed') {
            return next(new BadRequest(`task already marked as completed before`))
        } 

     res.status(StatusCodes.OK).json({ msg: `task compeleted by user ${taskToMark.owner} successfully`
        , data: taskToMark })

    } catch (err: any) {
        next(new BadRequest(err.message))
    }
}


