import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";


const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    service: process.env.SERVICE,
    port: process.env.PORT,
    secure: process.env.SECURE,
    debug: process.env.DEBUG,
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PASSWORD,
    },
  } as SMTPTransport.Options);
  
transporter.verify((error, success) => {
    if (error) {
      console.log(error.message);
    } else {
      console.log("Server is ready to take our messages");
    }
  });
  
 transporter.verify();
  
export default transporter