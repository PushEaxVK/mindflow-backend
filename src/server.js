import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { getEnvVar } from './utils/getEnvVar.js';
import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import { ENV_VARS } from './constants/envVars.js';
import { UPLOAD_DIR } from './constants/paths.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = Number(getEnvVar(ENV_VARS.PORT, '3000'));

export const setupServer = () => {
  const app = express();

  app.use(
    express.json({
      type: ['application/json', 'application/vnd.api+json'],
      limit: '5mb',
    }),
  );

  const APP_DOMAIN = [
    'http://localhost:5173',
    'https://mindflow-frontend.onrender.com',
  ];

  app.use(
    cors({
      origin: (origin, allowOrDeny) => {
        if (!origin || APP_DOMAIN.includes(origin)) {
          allowOrDeny(null, true);
        } else {
          allowOrDeny(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );

  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
  });

  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use('/api-docs', swaggerDocs());

  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
