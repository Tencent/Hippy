import { spawn } from 'child_process';

export const exec = (cmd: string, argv: any, options?: any) =>
  new Promise((resolve, reject) => {
    const cp = spawn(cmd, argv, options);
    cp.stdout.on('data', (log: any) => console.info(log.toString()));
    cp.stderr.on('data', (err: any) => console.error(err.toString()));
    cp.on('error', (err: any) => reject(err));
    cp.on('close', (code: any) => {
      if (code) {
        return reject(new Error(`Execting ${cmd} returns: ${code}`));
      }
    });
    return resolve(cp);
  });
