import { Tunnel } from '../@types/tunnel';
import { AppClientType, ClientEvent } from '../@types/enum';
import { sendMessage } from '../message-channel/tunnel';
import { AppClient } from './app-client';
import createDebug from 'debug';
import { emitter } from '../message-channel/tunnel';

const debug = createDebug('app-client:ws');

export class TunnelAppClient extends AppClient {
  constructor(id, option) {
    super(id, option);
    this.type = AppClientType.Tunnel;

    emitter.on('message', (msg) => {
      this.emit(ClientEvent.Message, msg);
    });
  }

  send(msg: Tunnel.Req) {
    if (!this.filter(msg)) return;

    sendMessage(msg);
  }

  resume() {
    debug('tunnel app client resume');
    sendMessage({
      module: 'jsDebugger',
      content: 'chrome_socket_closed',
    } as any);
  }
}
