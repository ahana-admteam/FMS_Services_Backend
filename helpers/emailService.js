const transporter = require("../config/mailer");

const LIBRARY_EMAIL = "ahana.library@ahanait.com";
const FEEDBACK_LINK = process.env.FEEDBACK_FORM_LINK || "https://your-feedback-link.com";

// ─── Helper ───────────────────────────────────────────────────────────────────
// const send = (mailOptions) => transporter.sendMail(mailOptions);
const send = (mailOptions) => transporter.sendMail({
  from: `"Ahana Library" <${process.env.EMAIL_ID}>`,
  ...mailOptions,
});

// ─── STEP 2 : Issue Book ──────────────────────────────────────────────────────
// Status: "Issued" → email to requestor + cc library
exports.sendBookIssued = async ({ requestorEmail, bookName }) => {
  await send({
    to: requestorEmail,
    cc: LIBRARY_EMAIL,
    subject: "Ahana Library – Book Issued",
    html: `
      <p>Hi,</p>
      <p>We have issued the below book to you. Please <b>reply all</b> to this email to acknowledge receipt.</p>
      <p><b>Book Name:</b> ${bookName}</p>
      <p>Thank You!</p>
      <p><em>Note: This is a system generated email. Please do not reply directly.</em></p>
    `,
  });
};

// Status: "Not Issued" → email to requestor with reason
exports.sendBookNotIssued = async ({ requestorEmail, reason, responsiblePerson }) => {
  await send({
    to: requestorEmail,
    subject: "Ahana Library – Book Not Issued",
    html: `
      <p>Hi,</p>
      <p>Unfortunately, the requested book could not be issued at this time.</p>
      <p><b>Reason:</b> ${reason || "Please contact Admin team for details."}</p>
      <p><b>Responsible Person:</b> ${responsiblePerson}</p>
      <p>Thank You!</p>
      <p><em>Note: This is a system generated email. Please do not reply directly.</em></p>
    `,
  });
};

// ─── STEP 3 : Acknowledgement received from requestor ─────────────────────────
// Admin updates step 3 after receiving mail from requestor
exports.sendAcknowledgementConfirmed = async ({ requestorEmail, bookName, responsiblePerson }) => {
  await send({
    to: requestorEmail,
    subject: "Ahana Library – Acknowledgement Recorded",
    html: `
      <p>Hi Team,</p>
      <p>We have recorded your acknowledgement for the book received.</p>
      <p><b>Book Name:</b> ${bookName}</p>
      <p><b>Responsible Person:</b> ${responsiblePerson}</p>
      <p>Thank You!</p>
      <p><em>Note: This is a system generated email. Please do not reply directly.</em></p>
    `,
  });
};

// ─── STEP 4 : Due date reminder sent ─────────────────────────────────────────
// Admin marks step 4 done after auto mail generation
exports.sendDueDateReminderManual = async ({ requestorEmail, dueDate }) => {
  await send({
    to: requestorEmail,
    cc: LIBRARY_EMAIL,
    subject: "Ahana Library – Book Return Due Date Reminder",
    html: `
      <p>Hi,</p>
      <p>This is a reminder that your borrowed book is due for return.</p>
      <p><b>Due Date:</b> ${new Date(dueDate).toDateString()}</p>
      <p>Please return the book to the Admin team on time.</p>
      <p>Thank You!</p>
      <p><em>Note: This is a system generated email. Please do not reply directly.</em></p>
    `,
  });
};

// ─── STEP 5 : Book collected back ────────────────────────────────────────────
exports.sendBookCollected = async ({ requestorEmail, bookName, responsiblePerson }) => {
  await send({
    to: requestorEmail,
    subject: "Ahana Library – Book Returned Successfully",
    html: `
      <p>Hi,</p>
      <p>We have successfully collected the book from you. Thank you for returning it on time.</p>
      <p><b>Book Name:</b> ${bookName}</p>
      <p><b>Responsible Person:</b> ${responsiblePerson}</p>
      <p>Thank You!</p>
      <p><em>Note: This is a system generated email. Please do not reply directly.</em></p>
    `,
  });
};

// ─── STEP 6 : Feedback request ───────────────────────────────────────────────
exports.sendFeedbackRequest = async ({ requestorEmail, bookName, responsiblePerson, actualReturnDate }) => {
  await send({
    to: requestorEmail,
    cc: LIBRARY_EMAIL,
    subject: "Ahana Library – Share Your Feedback",
    html: `
      <p>Hi,</p>
      <p>We have received your book on <b>${new Date(actualReturnDate).toDateString()}</b>.</p>
      <p><b>Book Name:</b> ${bookName}</p>
      <p><b>Responsible Person:</b> ${responsiblePerson}</p>
      <p>We would love to hear your feedback:</p>
      <p><a href="${FEEDBACK_LINK}" style="padding:8px 16px;background:#007bff;color:white;border-radius:4px;text-decoration:none;">Give Feedback</a></p>
      <p>Thank You!</p>
      <p><em>Note: This is a system generated email. Please do not reply directly.</em></p>
    `,
  });
};

// ─── SCHEDULED : 1-day & 2-day before due date (from cron job) ───────────────
exports.sendScheduledReminder = async ({ requestorEmail, dueDate, daysLabel }) => {
  await send({
    to: requestorEmail,
    cc: LIBRARY_EMAIL,
    subject: "Ahana Library – Book Return Reminder",
    html: `
      <p>Hi,</p>
      <p>This is a reminder that your borrowed book is due for return in <b>${daysLabel}</b>.</p>
      <p><b>Due Date:</b> ${new Date(dueDate).toDateString()}</p>
      <p>Please return the book to the Admin team on time.</p>
      <p>Thank You!</p>
      <p><em>Note: This is a system generated email. Please do not reply directly.</em></p>
    `,
  });
};