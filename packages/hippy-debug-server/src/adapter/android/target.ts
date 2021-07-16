import { EventEmitter } from 'events';
import { AppClient, DevtoolsClient } from '../../client';
import { ClientEvent } from '../../@types/enum';
import createDebug from 'debug';

const debugDown = createDebug('↓↓↓');
const debugUp = createDebug('↑↑↑');

export class AndroidTarget extends EventEmitter {
  devtoolsClient;
  appClient;

  constructor(devtoolsClient: DevtoolsClient, appClient: AppClient) {
    super();
    this.devtoolsClient = devtoolsClient;
    this.appClient = appClient;

    devtoolsClient.on(ClientEvent.Message, (msg) => {
      appClient.send(msg);
      debugDown('%j', msg);
    });
    appClient.on(ClientEvent.Message, (msg) => {
      devtoolsClient.send(msg);
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
