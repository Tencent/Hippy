import { MiddleWare } from './middleware-context';
import { ChromeEvent } from 'tdf-devtools-protocol/types/enum-chrome-mapping';

export const onGetTDFLog: MiddleWare = async (ctx) => {
  const eventRes = ctx.msg as Adapter.CDP.EventRes;
  const { params } = eventRes;
  try {
    params.log.forEach((log) => {
      const logPrefix = `[${log.timestamp}][${log.level}][${log.source}]`;
      const consoleMessage = {
        source: 'other',
        level: 'info',
        text: log.module ? `${logPrefix}[${log.module}]${log.message}` : `${logPrefix}${log.message}`,
        lineNumber: log.line_number,
        timestamp: new Date().getTime(),
        url: log.file_name,
      };
      ctx.sendToDevtools({
        method: ChromeEvent.LogEntryAdded,
        params: {
          entry: consoleMessage,
        },
      });
    });
  } catch (e) {
    console.error(`${ChromeEvent.LogEntryAdded} failed!`, e);
  }
};
