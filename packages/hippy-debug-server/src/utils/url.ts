import { ClientRole, DevicePlatform } from '../@types/enum';

export const parseWsUrl = (reqUrl: string) => {
  const url = new URL(reqUrl, 'http://0.0.0.0');
  const clientId = url.searchParams.get('clientId');
  const targetId = url.searchParams.get('targetId');
  let platform = url.searchParams.get('platform') as DevicePlatform;
  const clientRole = url.searchParams.get('role') as ClientRole;
  if (clientRole === ClientRole.Android) platform = DevicePlatform.Android;
  return {
    clientId,
    targetId,
    platform,
    clientRole,
    pathname: url.pathname,
  };
};

export const makeUrl = (baseUrl: string, query: unknown) => {
  let fullUrl = baseUrl;

  const keys = Object.keys(query);
  for (let i = 0; i < keys.length; i++) {
    if (i === 0) {
      if (fullUrl.indexOf('?') === -1) fullUrl += '?';
    } else {
      fullUrl += '&';
    }
    fullUrl += `${keys[i]}=${encodeURIComponent(query[keys[i]])}`;
  }
  return fullUrl;
};
