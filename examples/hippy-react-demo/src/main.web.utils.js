import queryString from 'qs';

export function getAllUrlParams() {
  return parseUrlSearch();
}

export function parseUrlSearch(str = (typeof window === 'object' && window.location && window.location.search) || '') {
  return (parseUrl(str) || {});
}

export function parseUrl(str = '') {
  return queryString.parse(getUrlParamStr(str));
}

export function getUrlParamStr(url = (typeof window === 'object' && window.location && window.location.search) || '') {
  return url
    .replace(/^[^?]+/, '')
    .replace(/^[?#/=]+/, '')
    .replace(/[?#/=]+$/, '');
}
