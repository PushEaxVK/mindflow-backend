import { createTransport } from 'nodemailer';
import { getEnvVar } from './getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';
import createHttpError from 'http-errors';

const mailClient = createTransport({
  host: getEnvVar(ENV_VARS.SMTP_HOST),
  port: getEnvVar(ENV_VARS.SMTP_PORT),
  auth: {
    user: getEnvVar(ENV_VARS.SMTP_USER),
    pass: getEnvVar(ENV_VARS.SMTP_PASSWORD),
  },
});

export const sendEmail = async ({ email, html, subject }) => {
  try {
    await mailClient.sendMail({
      from: getEnvVar(ENV_VARS.SMTP_FROM),
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error(error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
