import { MiddleWare } from './middleware-context';

export const defaultUpwardMiddleware: MiddleWare = async (ctx, next) => {
  await next();
  ctx.sendToDevtools(ctx.msg as Adapter.CDP.Res);
};

export const defaultDownwardMiddleware: MiddleWare = async (ctx, next) => {
  await next();
  ctx.sendToApp(ctx.msg as Adapter.CDP.Req);
};
