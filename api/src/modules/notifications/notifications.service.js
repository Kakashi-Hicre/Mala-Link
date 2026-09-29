const prisma = require('../../prisma/prisma.client');
const { sendEmail } = require('../../common/utils/mailer');
const { sendSMS } = require('../../common/utils/sms');

// Human-friendly subject lines per status, used only for the EMAIL channel
const STATUS_SUBJECTS = {
  PROCESSING: 'Your application is now being processed',
  PRINTING:   'Your document is being printed',
  READY:      'Your document is ready for collection',
  COLLECTED:  'Application marked as collected',
  REJECTED:   'Update on your application',
};

// citizenEmail/subject are only needed when channel === 'EMAIL'.
// citizenPhone is only needed when channel === 'SMS'.
// For IN_APP they're simply ignored.
const sendNotification = async ({ citizenId, channel, message, citizenEmail, subject, citizenPhone }) => {
  // 1. Save to database so citizen can see their notification history
  //    (this always happens, regardless of whether the external send succeeds)
  const notification = await prisma.notification.create({
    data: {
      citizenId,
      channel,
      message,
    },
  });

  // 2. Fire the real provider for this channel
  if (channel === 'EMAIL') {
    if (!citizenEmail) {
      console.error(`[NOTIFICATION] EMAIL requested for citizen ${citizenId} but no email address was provided — skipping send.`);
    } else {
      try {
        await sendEmail({
          to: citizenEmail,
          subject: subject || 'Mala-Link Notification',
          text: message,
        });
      } catch (err) {
        // Don't let a failed email break the request/transaction —
        // the in-app record above is already saved either way.
        console.error(`[NOTIFICATION] Failed to send email to ${citizenEmail}:`, err.message);
      }
    }
  }

  if (channel === 'SMS') {
    if (!citizenPhone) {
      console.error(`[NOTIFICATION] SMS requested for citizen ${citizenId} but no phone number was provided — skipping send.`);
    } else {
      try {
        await sendSMS({ to: citizenPhone, message });
      } catch (err) {
        // Same principle as email: a failed SMS never blocks the request —
        // the in-app record above is already saved either way.
        console.error(`[NOTIFICATION] Failed to send SMS to ${citizenPhone}:`, err.message);
      }
    }
  }

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

  const subject = STATUS_SUBJECTS[status];

  // Send on all three channels — later you can make this configurable per citizen
  await sendNotification({
    citizenId:    citizen.id,
    channel:      'EMAIL',
    message,
    citizenEmail: citizen.email,
    subject,
  });

  await sendNotification({
    citizenId:    citizen.id,
    channel:      'SMS',
    message,
    citizenPhone: citizen.phone,
  });

  await sendNotification({
    citizenId: citizen.id,
    channel:   'IN_APP',
    message,
  });
};

module.exports = { sendNotification, notifyStatusChange };