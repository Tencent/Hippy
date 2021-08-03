import { spawn } from 'child_process';
import createDebug from 'debug';

const debug = createDebug('child-process');
createDebug.enable('child-process');

export const exec = (cmd: string, argv: any, options?: any) =>
  new Promise((resolve, reject) => {
    const cp = spawn(cmd, argv, options);
    cp.stdout.on('data', (log: any) => debug(log.toString()));
    cp.stderr.on('data', (err: any) => debug(err.toString()));
    cp.on('error', (err: any) => reject(err));
    cp.on('close', (code: any) => {
      if (code) {
        return reject(new Error(`Execting ${cmd} returns: ${code}`));
      }
    });
    return resolve(cp);
  });
