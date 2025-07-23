import path from 'node:path';
import fs from 'node:fs/promises';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from '../constants/paths.js';
import { getEnvVar } from './getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';

export const saveFileToUploadDir = async (file) => {
  await fs.rename(
    path.join(TEMP_UPLOAD_DIR, file.filename),
    path.join(UPLOAD_DIR, file.filename),
  );

  return `${getEnvVar(ENV_VARS.BACKEND_URL)}/uploads/${file.filename}`;
};
