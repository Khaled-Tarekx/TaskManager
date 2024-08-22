import Queue from 'bull';
import transporter from './transporter';

const emailQueue = new Queue('email', {
	redis: {
		host: '127.0.0.1',
		port: 6379,
	},
});

emailQueue.process(async (job) => {
	const { to, subject, text, date } = job.data;
	await transporter.sendMail({
		from: `<"${process.env.ADMIN_USERNAME}">, <"${process.env.ADMIN_EMAIL}">`,
		to: to,
		subject: subject,
		text: text,
		date: date,
	});
});

export default emailQueue;
