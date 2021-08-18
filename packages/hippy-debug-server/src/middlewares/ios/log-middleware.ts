import { ChromeCommand } from 'tdf-devtools-protocol/types/enum-chrome-mapping';
import { MiddleWareManager } from '../middleware-context';

export const logMiddleWareManager: MiddleWareManager = {
  upwardMiddleWareListMap: {
    'Console.messageAdded': ({ msg, sendToDevtools }) => {
      const eventRes = msg as Adapter.CDP.EventRes;
      const { message } = eventRes.params;
      let type;
      if (message.type === 'log') {
        switch (message.level) {
          case 'log':
            type = 'info';
            break;
          case 'info':
            type = 'info';
            break;
          case 'error':
            type = 'error';
            break;
          default:
            type = 'info';
        }
      } else {
        type = message.type;
      }

      const consoleMessage = {
        source: message.source,
        level: type,
        text: message.text,
        lineNumber: message.line,
        timestamp: new Date().getTime(),
        url: message.url,
        stackTrace: message.stackTrace
          ? {
              callFrames: message.stackTrace,
            }
          : undefined,
        networkRequestId: message.networkRequestId,
      };

      sendToDevtools({
        method: 'Log.entryAdded',
        params: {
          entry: consoleMessage,
        },
      });
    },
  },
  downwardMiddleWareListMap: {
    [ChromeCommand.LogClear]: ({ msg, sendToApp }) => {
      sendToApp({
        id: (msg as Adapter.CDP.Req).id,
        method: 'Console.clearMessages',
        params: {},
      });
    },
    'Log.disable': ({ msg, sendToApp }) => {
      sendToApp({
        id: (msg as Adapter.CDP.Req).id,
        method: 'Console.disable',
        params: {},
      });
    },
    'Log.enable': ({ msg, sendToApp, sendToDevtools }) => {
      sendToApp({
        id: (msg as Adapter.CDP.Req).id,
        method: 'Console.enable',
        params: {},
      });
      sendToDevtools({
        id: (msg as Adapter.CDP.Req).id,
        method: msg.method,
        result: {},
      });
    },
  },
};
