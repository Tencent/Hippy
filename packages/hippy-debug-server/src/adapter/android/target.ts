import { EventEmitter } from 'events';
import { AppClient, DevtoolsClient } from '../../client';
import { ClientEvent } from '../../@types/enum';

export class AndroidTarget extends EventEmitter {
  devtoolsClient;
  appClient;

  constructor(devtoolsClient: DevtoolsClient, appClient: AppClient) {
    super();
    this.devtoolsClient = devtoolsClient;
    this.appClient = appClient;

    devtoolsClient.on(ClientEvent.Message, (msg) => {
      appClient.send(msg);
    });
    appClient.on(ClientEvent.Message, (msg) => {
      devtoolsClient.send(msg);
    });
    appClient.on(ClientEvent.Close, () => {
      devtoolsClient.close();
    });
    devtoolsClient.on(ClientEvent.Close, () => {
      appClient.resume();
    });
  }
}
