import { spawn } from 'child_process';
import { exec } from './utils/process';
import createDebug from 'debug';
import path from 'path';

const debug = createDebug('child-process');
let proxyProcess;

type TunnelParams = { iwdpPort: string; iwdpStartPort: string; iwdpEndPort: string };

export const startTunnel = ({ iwdpPort, iwdpStartPort, iwdpEndPort }: TunnelParams) => {
  const addon = require('./build/Tunnel.node');
  global.addon = addon;

  global.addon.addEventListener((event) => {
    debug(`receive tunnel event: ${event}`);
  });

  const adbPath = path.join(__dirname, './build/adb');
  const iwdpParams = [`--no-frontend`, `--config=null:${iwdpPort},:${iwdpStartPort}-${iwdpEndPort}`];
  addon.tunnelStart(adbPath, iwdpParams, iwdpPort);
};

export const startIosProxy = ({ iwdpPort, iwdpStartPort, iwdpEndPort }: TunnelParams) => {
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
  exec('adb', ['reverse', '--remove-all'])
    .then(() => exec('adb', ['reverse', `tcp:${port}`, `tcp:${port}`]))
    .catch((err: Error) => {
      debug('Port reverse failed, For iOS app debug only just ignore the message.');
      debug('Otherwise please check adb devices command working correctly');
      debug(`type 'adb reverse tcp:${port} tcp:${port}' retry!`);
      debug('start adb reverse error: %j', err);
    });
};

export const onExit = () => {
  if (!proxyProcess) return;
  console.warn('on debug server exit, do some clean...');
  proxyProcess?.kill('SIGKILL');
  proxyProcess = null;
};
process.on('exit', onExit);
process.on('SIGINT', onExit);
process.on('SIGTERM', onExit);
