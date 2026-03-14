const nodemailer = require("nodemailer");
const env = require("../config/env");
const logger = require("../config/logger");

const hasSmtpConfig =
  Boolean(env.SMTP_HOST) &&
  Boolean(env.SMTP_PORT) &&
  Boolean(env.SMTP_USER) &&
  Boolean(env.SMTP_PASS);

let transporter;

const getTransporter = () => {
  if (!hasSmtpConfig) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const from = env.EMAIL_FROM || env.SMTP_USER;
  const currentTransporter = getTransporter();

  if (!currentTransporter) {
    logger.warn("SMTP not configured. Email payload logged.", { to, subject, text });
    return { mocked: true };
  }

  const info = await currentTransporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  logger.info("Email sent", { to, subject, messageId: info.messageId });
  return info;
};

module.exports = {
  sendEmail,
};
