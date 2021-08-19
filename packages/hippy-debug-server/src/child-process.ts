import { spawn } from 'child_process';
import createDebug from 'debug';
import path from 'path';
import { TunnelEvent } from './@types/enum';
import deviceManager from './device-manager';
import { tunnel } from './tunnel';
import { exec } from './utils/process';

const debug = createDebug('child-process');
createDebug.enable('child-process');
let proxyProcess;

export const startTunnel = ({ port, iwdpPort, iwdpStartPort, iwdpEndPort }) => {
  try {
    import('./build/Tunnel.node').then((addon) => {
      global.addon = addon;
      addon.addEventListener((event, data) => {
        debug(`receive tunnel event: ${event}`);
        if (event === TunnelEvent.ReceiveData) {
          tunnel.onMessage(data);
        } else if ([TunnelEvent.RemoveDevice, TunnelEvent.AddDevice].indexOf(event) !== -1) {
          deviceManager.getDeviceList();
          if (event === TunnelEvent.AddDevice) {
            // 每次设备连接后，运行 adb reverse
            startAdbProxy(port);
          }
        }
      });

      const adbPath = path.join(__dirname, './build/adb');
      const iwdpParams = ['--no-frontend', `--config=null:${iwdpPort},:${iwdpStartPort}-${iwdpEndPort}`];
      addon.tunnelStart(adbPath, iwdpParams, iwdpPort);
    });
  } catch (e) {
    console.error(e);
  }
};

export const startIosProxy = ({ iwdpPort, iwdpStartPort, iwdpEndPort }) => {
  proxyProcess = spawn(
    'ios_webkit_debug_proxy',
    ['--no-frontend', `--config=null:${iwdpPort},:${iwdpStartPort}-${iwdpEndPort}`],
    { detached: false },
  );
  proxyProcess.unref();

  debug(`start IWDP on port ${iwdpPort}`);

  proxyProcess.on('error', (e) => {
    debug('IWDP error: %j', e);
  });
  proxyProcess.on('close', (code) => {
    debug(`IWDP close with code: ${code}`);
  });
};

export const startAdbProxy = (port: number) => {
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
  debug('on debug server exit, do some clean...');
  proxyProcess?.kill('SIGKILL');
  proxyProcess = null;
};
process.on('exit', onExit);
process.on('SIGINT', onExit);
process.on('SIGTERM', onExit);
