import User from "../users/models.js";
import moment from "moment";
import { TaskInterface } from "./models.js";
import { BadRequest, NotFound } from "../../../custom-errors/main.js";
import emailQueue from "./queue.js";


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
  try {
    const user = await User.findById(task.owner);
    if (!user) {
      return new NotFound(`User not found for task owner ID: ${task.owner}`);
    }
      await emailQueue.add({
      to: `${user?.email}`,
      subject: "reminder: task_deadline",
      text: message,
      date: moment(new Date()).format("DD MM YYYY hh:mm:ss"),
    });
  } catch(err: any) {
    return new BadRequest(`Failed to add email job to the queue: ${err.message}`);
  }
 
};
emailQueue.on('completed', (job) => {
  console.log(`Email job with id ${job.id} has been completed`);
});

emailQueue.on('failed', (job, err) => {
  console.log(`Email job with id ${job.id} has failed with error ${err.message}`);
});
