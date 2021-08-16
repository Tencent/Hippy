import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { MiddleWare } from './middleware-context';

export const onGetHeapMeta: MiddleWare = async (ctx, next) => {
  try {
    if (!('id' in ctx.msg)) {
      return next();
    }
    const fpath = path.join(config.cachePath, `${ctx.msg.id}.json`);
    await fs.promises.writeFile(fpath, JSON.stringify(ctx.msg));
    ctx.sendToDevtools(ctx.msg as Adapter.CDP.Res);
  } catch (e) {
    console.error('write heap failed!', e);
  }
};

export const onFetchHeapCache: MiddleWare = async (ctx, next) => {
  try {
    if (!('id' in ctx.msg)) {
      return next();
    }
    const req = ctx.msg as Adapter.CDP.Req;
    const fpath = path.join(config.cachePath, `${req.params.id}.json`);
    const cacheMsgStr = await fs.promises.readFile(fpath, 'utf8');
    const cacheMsg: Adapter.CDP.CommandRes = JSON.parse(cacheMsgStr);
    ctx.sendToDevtools({
      id: ctx.msg.id,
      method: ctx.msg.method,
      result: cacheMsg.result,
    });
  } catch (e) {
    console.error('write heap failed!', e);
  }
};
