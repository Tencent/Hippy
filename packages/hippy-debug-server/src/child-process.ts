import { spawn } from 'child_process';
import { exec } from './utils/process';
import createDebug from 'debug';

const debug = createDebug('child process');
let proxyProcess;
let adbProcess;

export const startIosProxy = (iwdpPort: string) => {
  proxyProcess = spawn(
    'ios_webkit_debug_proxy',
    ['--no-frontend', `--config=null:${iwdpPort},:${iwdpPort + 100}-${iwdpPort + 200}`],
    { detached: false },
  );

  debug(`start IWDP on port ${iwdpPort}`);

  proxyProcess.on('error', (e) => {
    debug(`IWDP error: %j`, e);
  });
  proxyProcess.on('close', (code) => {
    debug(`IWDP close with code: ${code}`);
  });
  proxyProcess.stdout.on('data', (data) => {
    debug(`IWDP stdout: ${data.toString()}`);
  });
  proxyProcess.stderr.on('data', (data) => {
    debug(`IWDP stderr: ${data.toString()}`);
  });
};

export const startAdbProxy = (port: string) => {
  adbProcess = exec('adb', ['reverse', '--remove-all'])
    .then(() => exec('adb', ['reverse', `tcp:${port}`, `tcp:${port}`]))
    .catch((err: Error) => {
      debug('Port reverse failed, For iOS app debug only just ignore the message.');
      debug('Otherwise please check adb devices command working correctly');
      debug('start adb reverse error: %j', err);
    });
};

const onExit = () => {
  debug('on debug server exit, do some clean...');
  proxyProcess?.kill('SIGTERM');
  adbProcess?.kill('SIGTERM');
};
process.on('exit', onExit);
process.on('SIGINT', onExit);
