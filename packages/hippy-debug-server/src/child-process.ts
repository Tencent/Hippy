import { spawn } from 'child_process';
import { exec } from './utils/process';

let proxyProcess;
let adbProcess;

export const startIosProxy = (iwdpPort: string) => {
  proxyProcess = spawn(
    'ios_webkit_debug_proxy',
    ['--no-frontend', `--config=null:${iwdpPort},:${iwdpPort + 100}-${iwdpPort + 200}`],
    { detached: false },
  );

  console.info(`start IWDP on port ${iwdpPort}`);

  proxyProcess.on('error', (e) => {
    console.error(`IWDP error: ${JSON.stringify(e)}`);
  });
  proxyProcess.on('close', (code) => {
    console.warn(`IWDP close with code: ${code}`);
  });
  proxyProcess.stdout.on('data', (data) => {
    console.info(`IWDP stdout: ${data.toString()}`);
  });
  proxyProcess.stderr.on('data', (data) => {
    console.warn(`IWDP stderr: ${data.toString()}`);
  });
};

export const startAdbProxy = (port: string) => {
  adbProcess = exec('adb', ['reverse', '--remove-all'])
    .then(() => exec('adb', ['reverse', `tcp:${port}`, `tcp:${port}`]))
    .catch((err: Error) => {
      console.warn('Port reverse failed, For iOS app debug only just ignore the message.');
      console.warn('Otherwise please check adb devices command working correctly');
      console.error('start adb reverse error:', err);
    });
};

const onExit = () => {
  console.warn('on debug server exit, do some clean...');
  proxyProcess?.kill('SIGTERM');
  adbProcess?.kill('SIGTERM');
};
process.on('exit', onExit);
process.on('SIGINT',onExit);
