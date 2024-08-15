import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const transporter = nodemailer.createTransport({
	host: process.env.MAILER_HOST,
	service: process.env.SERVICE,
	port: Number(process.env.PORT),
	secure: Boolean(process.env.SECURE),
	debug: Boolean(process.env.DEBUG),
	auth: {
		user: process.env.ADMIN_EMAIL,
		pass: process.env.ADMIN_PASSWORD,
	},
} as SMTPTransport.Options);

transporter.verify((error, success) => {
	if (error) {
		console.log(error.message);
	} else {
		console.log('Server is ready to take our messages');
	}
});

transporter.verify();

export default transporter;
