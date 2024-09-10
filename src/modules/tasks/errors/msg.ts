const TaskNotFound = 'couldnt find the requested task';
const AssigneeOrCreatorNotFound = 'task assignee or creator wasnt found';
const TaskCreationFailed = 'task creation failed';
const TaskUpdatingFailed = 'task updating failed';
const TaskDeletionFailed = 'task deletion failed';
const AssigneeNotFound =
	`task must be assigned to a user first before` + ` marking it as completed`;
const MailFailedToSend = 'mailing proccess wasnt successfull';
const CompleteSubTasksFirst = `subtasks must be completed first`;
const TaskAlreadyMarked = 'task already marked as completed before';
export {
	TaskNotFound,
	AssigneeOrCreatorNotFound,
	TaskCreationFailed,
	TaskUpdatingFailed,
	TaskDeletionFailed,
	MailFailedToSend,
	AssigneeNotFound,
	CompleteSubTasksFirst,
	TaskAlreadyMarked,
};
