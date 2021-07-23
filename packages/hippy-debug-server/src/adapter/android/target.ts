import { EventEmitter } from 'events';
import { AppClient, DevtoolsClient } from '../../client';
import { ClientEvent } from '../../@types/enum';
import createDebug from 'debug';
import CssDomain from './domain/css';

const debugDown = createDebug('↓↓↓');
const debugUp = createDebug('↑↑↑');

export class AndroidTarget extends EventEmitter {
  devtoolsClient;
  appClient;
  cssDomain;

  constructor(devtoolsClient: DevtoolsClient, appClient: AppClient) {
    super();
    this.devtoolsClient = devtoolsClient;
    this.appClient = appClient;
    this.cssDomain = new CssDomain();

    devtoolsClient.on(ClientEvent.Message, (msg) => {
      const newMessage = this.cssDomain.handlerDown(msg) || msg;
      appClient.send(newMessage);
      debugDown('%j', msg);
    });
    appClient.on(ClientEvent.Message, (msg) => {
      const newMessage = this.cssDomain.handlerUp(msg) || msg;
      devtoolsClient.send(newMessage);
      debugUp('%j', msg);
    });
    appClient.on(ClientEvent.Close, () => {
      devtoolsClient.close();
      debugUp('app client closed, close devtools ws now!');
    });
    devtoolsClient.on(ClientEvent.Close, () => {
      appClient.resume();
      debugDown('devtools client closed, resume v8/jsc now!');
    });
  }
}
