import { spawn } from 'child_process';
import { exec } from './utils/process';
import createDebug from 'debug';
import fs from 'fs';

const debug = createDebug('child-process');
let proxyProcess;

export const startIosProxy = (iwdpPort: string, iwdpStartPort: string, iwdpEndPort: string) => {
  const out = fs.openSync('./iwdp-out.log', 'a');
  const err = fs.openSync('./iwdp-err.log', 'a');
  proxyProcess = spawn(
    'ios_webkit_debug_proxy',
    ['--no-frontend', `--config=null:${iwdpPort},:${iwdpStartPort}-${iwdpEndPort}`],
    { detached: false },
  );
  proxyProcess.unref();

  debug(`start IWDP on port ${iwdpPort}`);

  proxyProcess.on('error', (e) => {
    debug(`IWDP error: %j`, e);
  });
  proxyProcess.on('close', (code) => {
    debug(`IWDP close with code: ${code}`);
  });
};

export const startAdbProxy = (port: string) => {
  exec('adb', ['reverse', '--remove-all'], { detached: true, stdio: 'ignore' })
    .then(() => exec('adb', ['reverse', `tcp:${port}`, `tcp:${port}`], { detached: true, stdio: 'ignore' }))
    .catch((err: Error) => {
      debug('Port reverse failed, For iOS app debug only just ignore the message.');
      debug('Otherwise please check adb devices command working correctly');
      debug(`type 'adb reverse tcp:${port} tcp:${port}' retry!`)
      debug('start adb reverse error: %j', err);
    });
};

export const onExit = () => {
  if(!proxyProcess) return;
  console.warn('on debug server exit, do some clean...');
  proxyProcess?.kill('SIGKILL');
  proxyProcess = null;
};
process.on('exit', onExit);
process.on('SIGINT', onExit);
process.on('SIGTERM', onExit);
