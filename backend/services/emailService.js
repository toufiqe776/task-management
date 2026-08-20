import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('Email transport not configured; skipping email.', { to, subject });
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Task Manager <noreply@example.com>',
    to,
    subject,
    html,
    text,
  });
};

export const sendTaskCreatedEmail = async ({ email, name, title }) => {
  await sendEmail({
    to: email,
    subject: 'Task Created Successfully',
    html: `
      <h2>Hi ${name},</h2>
      <p>Your task <strong>${title}</strong> has been created successfully.</p>
      <p>You can review and manage it from your dashboard.</p>
    `,
    text: `Hi ${name}, your task ${title} has been created successfully.`,
  });
};

export const sendTaskCompletedEmail = async ({ email, name, title }) => {
  await sendEmail({
    to: email,
    subject: 'Task Completed',
    html: `
      <h2>Hi ${name},</h2>
      <p>Great work! Your task <strong>${title}</strong> is marked as <strong>DONE</strong>.</p>
      <p>Keep up the momentum.</p>
    `,
    text: `Hi ${name}, your task ${title} is marked as DONE.`,
  });
};
