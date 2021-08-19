import createDebug from 'debug';
import { AppClientType, ClientEvent, DevicePlatform } from '../@types/enum';
import { getRequestId } from '../middlewares';
import { Tunnel, tunnel } from '../tunnel';
import { AppClient } from './app-client';

const debug = createDebug('app-client:ws');

export class TunnelAppClient extends AppClient {
  constructor(id, option) {
    super(id, option);
    this.type = AppClientType.Tunnel;

    this.registerMessageListener();
  }

  public resumeApp() {
    debug('tunnel app client resume');
    if (this.platform === DevicePlatform.Android) {
      tunnel.sendMessage({
        id: getRequestId(),
        method: 'TDFRuntime.resume',
        params: {},
      });
    }
  }

  protected registerMessageListener() {
    Tunnel.tunnelMessageEmitter.on(ClientEvent.Message, (msg: Adapter.CDP.Res) => {
      this.onMessage(msg);
    });
  }

  protected sendToApp(msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res> {
    return tunnel.sendMessage(msg);
  }
}
