import { Tunnel } from '../@types/tunnel';
import { AppClientType, ClientEvent } from '../@types/enum';
import { sendMessage, registerModuleCallback } from '../message-channel/tunnel';
import { AppClient } from './app-client';

export class TunnelAppClient extends AppClient {
  constructor(id) {
    super(id);
    this.type = AppClientType.Tunnel;

    registerModuleCallback('jsDebugger', (msg) => {
      this.emit(ClientEvent.Message, msg);
    });
  }

  send(msg: Tunnel.Req) {
    sendMessage({
      module: 'jsDebugger',
      content: msg,
    });
  }

  resume() {
    sendMessage({
      module: 'jsDebugger',
      content: 'chrome_socket_closed',
    } as any);
  }
}
