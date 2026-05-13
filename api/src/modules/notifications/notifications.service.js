const prisma = require('../../prisma/prisma.client');

// For now this logs to console and saves to DB
// Later you swap the console.log for Africa's Talking SMS or Nodemailer email
// The rest of the code stays exactly the same — that's why we isolate it here

const sendNotification = async ({ citizenId, channel, message }) => {
  // 1. Save to database so citizen can see their notification history
  const notification = await prisma.notification.create({
    data: {
      citizenId,
      channel,
      message,
    },
  });

  // 2. TODO: plug in real provider here later
  // For SMS:   await africasTalking.send({ to: phone, message })
  // For email: await sendgrid.send({ to: email, subject, text: message })
  console.log(`[NOTIFICATION] channel=${channel} citizenId=${citizenId}`);
  console.log(`[NOTIFICATION] message="${message}"`);

  return notification;
};

// Called whenever an application status changes
const notifyStatusChange = async ({ citizen, applicationType, status }) => {
  // Build a human-readable message based on the new status
  const statusMessages = {
    PROCESSING: `Hello ${citizen.fullName}, your ${applicationType.replace('_', ' ')} application is now being processed.`,
    PRINTING:   `Hello ${citizen.fullName}, your ${applicationType.replace('_', ' ')} is currently being printed.`,
    READY:      `Hello ${citizen.fullName}, your ${applicationType.replace('_', ' ')} is READY for collection. Please visit the office with this notification.`,
    COLLECTED:  `Hello ${citizen.fullName}, your ${applicationType.replace('_', ' ')} has been marked as collected. Thank you.`,
    REJECTED:   `Hello ${citizen.fullName}, unfortunately your ${applicationType.replace('_', ' ')} application has been rejected. Please visit the office for more information.`,
  };

  const message = statusMessages[status];
  if (!message) return; // PENDING does not trigger a notification

  // Send on both channels — later you can make this configurable per citizen
  await sendNotification({ citizenId: citizen.id, channel: 'EMAIL', message });
  await sendNotification({ citizenId: citizen.id, channel: 'IN_APP',  message });
};

module.exports = { sendNotification, notifyStatusChange };