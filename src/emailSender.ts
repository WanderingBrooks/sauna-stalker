import nodemailer from 'nodemailer';

import log from './log';
import { Slot, Week } from './types';

const { EMAIL_SERVICE, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } =
  process.env;

if (
  !EMAIL_SERVICE ||
  !EMAIL_HOST ||
  !EMAIL_PORT ||
  !EMAIL_USER ||
  !EMAIL_PASSWORD
) {
  throw new Error(
    `Misconfigured email settings: ${JSON.stringify(
      {
        EMAIL_SERVICE,
        EMAIL_HOST,
        EMAIL_PORT,
        EMAIL_USER,
        EMAIL_PASSWORD,
      },
      null,
      2,
    )}`,
  );
}

const emailPortAsNumber = Number.parseInt(EMAIL_PORT, 10);

if (Number.isNaN(emailPortAsNumber)) {
  throw new Error('EMAIL_PORT must be a parseable number');
}

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  host: EMAIL_HOST,
  port: emailPortAsNumber,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

const mailOptions = {
  from: EMAIL_USER,
  to: EMAIL_USER,
};

const daysOfTheWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const getHeader = (week: Week) => {
  if (week === 'thisWeek') {
    return `Sauna slot available this week!`;
  }

  if (week === 'nextWeek') {
    return `Sauna slot available next week!`;
  }

  return `Got a weird week in [getHeader]: "${week}"`;
};

const prepareSlotsForEmail = (openSixOrEightSlots: Record<number, Slot[]>) =>
  Object.keys(openSixOrEightSlots).reduce((aggregatedText, day) => {
    const keyAsNumber = Number.parseInt(day, 10);
    const dayOfTheWeek = daysOfTheWeek[keyAsNumber];
    const availableTimes = openSixOrEightSlots[keyAsNumber]
      ?.map((slot) => slot.time)
      ?.join(', ');

    const newMessage = `${dayOfTheWeek}: [${availableTimes}]`;

    return `${aggregatedText}${newMessage}\n`;
  }, '');

const alertSaunaAvailability = (
  week: Week,
  openSixOrEightSlots: Record<number, Slot[]>,
) => {
  log(
    `Preparing to send email with slots: ${JSON.stringify(openSixOrEightSlots, null, 2)}`,
  );

  const message = prepareSlotsForEmail(openSixOrEightSlots);

  log(`Sending email alerting sauna is available: "${message}"`);

  return transporter
    .sendMail({ ...mailOptions, text: message, subject: getHeader(week) })
    .then((result) => {
      log('Successfully sent email');

      return result;
    });
};

export { alertSaunaAvailability };
