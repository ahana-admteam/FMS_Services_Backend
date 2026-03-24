/**
 * NOTIFICATIONS MODULE
 * Handles Step 5: welcome_notification
 *
 * In production this would call an email/Slack API.
 * Here we simulate the dispatch and advance the step,
 * completing the entire flow.
 */

const engine = require('../../../../engine/flowEngine');

async function sendWelcomeNotification(instanceId, actor = 'system') {
  const current = await engine.getInstance(instanceId);
  const { employeeId, employeeName, employeeEmail } = current.data;

  // ── Simulated notification dispatch ──────────────────────────
  const notification = {
    to:        employeeEmail,
    subject:   `Welcome aboard, ${employeeName}!`,
    body:      `Hi ${employeeName}, your accounts have been provisioned. Your employee ID is ${employeeId}.`,
    sentAt:    new Date(),
    channel:   'email',
    simulated: true,  // flip to false and plug in nodemailer/SendGrid in production
  };

  console.log(`[NOTIFY] Sending welcome email to ${employeeEmail}`);

  // Advance — this is the last step, so the instance will be completed
  const output = { welcomeNotification: notification };
  const instance = await engine.advanceStep(instanceId, 'welcome_notification', actor, output);

  return { instance, notification };
}

module.exports = { sendWelcomeNotification };
