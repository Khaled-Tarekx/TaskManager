import nodemailer from 'nodemailer';

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
});

transporter.verify((error: Error | null, success: boolean) => {
	if (error) {
		console.log(error.message);
	} else {
		console.log(
			`success: ${success}`,
			'Server is ready to take our messages'
		);
	}
});

transporter.verify();

export default transporter;
