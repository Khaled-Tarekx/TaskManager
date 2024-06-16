import User from "../user/models.js";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import moment from "moment";
import { TaskInterface } from "./models";
import { NotFound } from "../custom-errors/main.js";

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

export const notifyUserOfUpcomingDeadline = async (task: TaskInterface) => {
  const currentTime: any = moment(new Date());
  const deadLine: any = moment(new Date(task.dead_line));
  const daysUntilDeadline = deadLine.diff(currentTime, "days");

  if (daysUntilDeadline === 0) {
    const hoursUntilDeadLine = deadLine.diff(currentTime, "hours");
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

export const sendNotification = async (
  message: string,
  task: TaskInterface
) => {
  const user = await User.findById(task.owner);
  if (!user) {
    return new NotFound(`User not found for task owner ID: ${task.owner}`);
  }
  await transporter.sendMail({
    from: `"${process.env.USERNAME}" <${process.env.ADMIN_EMAIL}>`,
    to: `${user?.email}`,
    subject: "reminder: task_deadline",
    text: message,
    date: moment(new Date()).format("DD MM YYYY hh:mm:ss"),
  });
};
