import createDebug from 'debug';
import { EventEmitter } from 'events';
import { ClientEvent } from '../../@types/enum';
import { AppClient, DevtoolsClient } from '../../client';
import CssDomain from './domain/css';

const debugDown = createDebug('↓↓↓');
const debugUp = createDebug('↑↑↑');

export class AndroidTarget extends EventEmitter {
  devtoolsClient;
  appClients: AppClient[] = [];
  cssDomain;

  constructor(devtoolsClient: DevtoolsClient, appClients: AppClient[]) {
    super();
    this.devtoolsClient = devtoolsClient;
    this.appClients = appClients;
    this.cssDomain = new CssDomain();

    devtoolsClient.on(ClientEvent.Message, (msg) => {
      debugDown('%j', msg);

      const newMessage = this.cssDomain.handlerDown(msg) || msg;
      this.appClients.forEach((appClient) => {
        appClient.send(newMessage);
      });
    });

    this.appClients.forEach((appClient) => {
      appClient.on(ClientEvent.Message, (msg) => {
        debugUp('%j', msg);
        const newMessage = this.cssDomain.handlerUp(msg) || msg;
        devtoolsClient.send(newMessage);
      });
    });

    this.appClients.forEach((appClient) => {
      appClient.on(ClientEvent.Close, () => {
        devtoolsClient.close();
        debugUp('app client closed, close devtools ws now!');
      });
    });

    devtoolsClient.on(ClientEvent.Close, () => {
      this.appClients.forEach((appClient) => {
        appClient.resume();
      });
      debugDown('devtools client closed, resume v8/jsc now!');
    });
  }
}
