class TaskNotFound extends Error {
	constructor() {
		super('task not found');
		this.name = 'TaskNotFound';
	}
}

class TaskCreationFailed extends Error {
	constructor() {
		super('task creation failed');
		this.name = 'TaskCreationFailed';
	}
}

class TaskUpdatingFailed extends Error {
	constructor() {
		super('task updating failed');
		this.name = 'TaskUpdatingFailed';
	}
}

class TaskDeletionFailed extends Error {
	constructor() {
		super('task deletion failed');
		this.name = 'TaskDeletionFailed';
	}
}
class MailFailedToSend extends Error {
	constructor() {
		super('mail failed to send');
		this.name = 'MailFailedToSend';
	}
}
class TaskMarkedCompleted extends Error {
	constructor() {
		super('task already marked as completed before');
		this.name = 'TaskMarkedCompleted';
	}
}

class CompleteSubTasksFirst extends Error {
	constructor() {
		super(`subtasks must be completed first`);
		this.name = 'CompleteSubTasksFirst';
	}
}
class AssigneeNotFound extends Error {
	constructor() {
		super(
			`task must be assigned to a workspace member/members first before` +
				` marking it as completed`
		);
		this.name = 'AssigneeNotFound';
	}
}

export {
	TaskNotFound,
	TaskUpdatingFailed,
	TaskDeletionFailed,
	TaskCreationFailed,
	MailFailedToSend,
	TaskMarkedCompleted,
	CompleteSubTasksFirst,
	AssigneeNotFound,
};
