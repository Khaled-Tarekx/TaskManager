import User from '../users/models';
import moment from 'moment';
import { TaskSchema } from './models';
import { BadRequest } from '../../custom-errors/main';
import emailQueue from './queue';
import { findResourceById } from '../../setup/helpers';
import { Member } from '../work_spaces/models';

export const notifyUserOfUpcomingDeadline = async (task: TaskSchema) => {
	const currentTime = moment(new Date());
	const deadLine = moment(new Date(task.dead_line));
	const daysUntilDeadline = deadLine.diff(currentTime, 'days');

	if (daysUntilDeadline === 0) {
		const hoursUntilDeadLine = deadLine.diff(currentTime, 'hours');
		if (hoursUntilDeadLine <= 12 && hoursUntilDeadLine > 0) {
			return await sendNotification(
				`reminder: task deadLine is in ${hoursUntilDeadLine} hours`,
				task
			);
		}
	} else if (daysUntilDeadline === 1) {
		return await sendNotification(
			`reminder: task deadLine is in ${daysUntilDeadline} day`,
			task
		);
	} else if (daysUntilDeadline === 3) {
		return await sendNotification(
			`reminder: task deadLine is in ${daysUntilDeadline} days`,
			task
		);
	}
};

export const sendNotification = async (message: string, task: TaskSchema) => {
	try {
		const member = await findResourceById(Member, task.worker.id);
		const user = await findResourceById(User, member.member.id);

		await emailQueue.add({
			to: `${user.email}`,
			subject: 'reminder: task_deadline',
			text: message,
			date: moment(new Date()).format('DD MM YYYY hh:mm:ss'),
		});
	} catch (err: any) {
		return new BadRequest(
			`Failed to add email job to the queue: ${err.message}`
		);
	}
};
emailQueue.on('completed', (job) => {
	console.log(`Email job with id ${job.id} has been completed`);
});

emailQueue.on('failed', (job, err) => {
	console.log(
		`Email job with id ${job.id} has failed with error ${err.message}`
	);
});
