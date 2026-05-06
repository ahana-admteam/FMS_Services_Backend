// jobs/reminderJob.js
const cron = require("node-cron");
const FmsRequest = require("../src/models/fmsTasks.model");
const { sendScheduledReminder } = require("../helpers/emailService");

const isSameDate = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const runReminderJob = () => {
  // Runs every day at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("Running daily reminder job...");

    try {
      const today = new Date();

      // Fetch all active FMS requests that haven't been returned yet
      // Step 5 not completed = book not yet returned
      const activeRequests = await FmsRequest.find({
        "steps.step5.status": { $ne: "Collected" }, // adjust to your schema
        "steps.step5.plannedDate": { $exists: true },
      });

      for (const request of activeRequests) {
        const dueDate = new Date(request.steps.step5.plannedDate);
        const requestorEmail = request.requestorEmail;

        // 1 day before due date
        const oneDayBefore = new Date(dueDate);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);

        // 2 days before due date
        const twoDaysBefore = new Date(dueDate);
        twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);

        if (isSameDate(oneDayBefore, today)) {
          await sendScheduledReminder({
            requestorEmail,
            dueDate,
            daysLabel: "1 day",
          });
          console.log(`1-day reminder sent to ${requestorEmail}`);
        }

        if (isSameDate(twoDaysBefore, today)) {
          await sendScheduledReminder({
            requestorEmail,
            dueDate,
            daysLabel: "2 days",
          });
          console.log(`2-day reminder sent to ${requestorEmail}`);
        }
      }
    } catch (err) {
      console.error("Reminder job error:", err);
    }
  });
};

module.exports = runReminderJob;