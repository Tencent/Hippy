import fs from 'fs';
import { config } from './config';

export const initDir = () => {
  return fs.promises.mkdir(config.cachePath, { recursive: true });
};
