import createDebug from 'debug';
import { AppClientType, ClientEvent } from '../@types/enum';
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
    tunnel.sendMessage({
      module: 'jsDebugger',
      content: 'chrome_socket_closed',
    } as any);
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
