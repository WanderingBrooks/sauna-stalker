import nodemailer from 'nodemailer'

import log from './log';

const {
  EMAIL_SERVICE,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
} = process.env;

if (
  !EMAIL_SERVICE || !EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD
) {
  throw new Error(`Misconfigured email settings: ${JSON.stringify({
    EMAIL_SERVICE,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASSWORD
  }, null, 2)}`)
}

const emailPortAsNumber = Number.parseInt(EMAIL_PORT, 10);

if (Number.isNaN(emailPortAsNumber)) {
  throw new Error('EMAIL_PORT must be a parseable number')
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
  subject: "Sauna slot available!",
  text: "Sauna slot available!",
};


const alertSaunaAvailability = () => {
  log('Sending email alerting sauna is available');

  return transporter.sendMail(mailOptions).then(result => {
    log('Successfully sent email');

    return result;
  })
};

export { alertSaunaAvailability };
