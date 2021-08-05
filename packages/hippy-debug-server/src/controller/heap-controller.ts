import fs from 'fs';
import path from 'path';
import { config } from '../config';

export const saveHeapMeta = (data) => {
  const fpath = path.join(config.cachePath, `${data.id}.json`);
  return fs.promises.writeFile(fpath, JSON.stringify(data)).catch((e) => {
    console.log('write heap failed!', e);
  });
};

export const getHeapMeta = (id) => {
  const fpath = path.join(config.cachePath, `${id}.json`);
  return fs.promises.readFile(fpath, 'utf8').then(JSON.parse);
};
