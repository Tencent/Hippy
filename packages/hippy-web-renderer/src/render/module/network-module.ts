import { HippyWebModule } from '../../base';
import { BaseModule, ModuleContext } from '../../types';
import { callbackToHippy } from '../common';
interface NetResponse {status: number, statusLine: string, body: string, respHeaders: any}
class NetworkModule extends HippyWebModule {
  public static moduleName = 'NetworkModule'

  public fetch(callBackId: number, data: any) {
    if (!data) {
      callbackToHippy(callBackId, 'invalid request param', false, 'fetch', NetworkModule.moduleName);
    }
    const { url } = data;
    const { method } = data;
    if (!url || !method) {
      callbackToHippy(callBackId, 'no valid url for request', false, 'fetch', NetworkModule.moduleName);
    }
    const { redirect, body, headers } = data;
    fetch(url, { redirect, headers, body }).then(async (response) => {
      if (response) {
        const dataString = await response.text();
        const respHeaders: any = {};
        for (const key of response.headers.keys()) {
          respHeaders[key] = respHeaders.headers.get(key);
        }
        const data: NetResponse = {
          status: response.status,
          statusLine: response.statusText,
          body: dataString,
          respHeaders,
        };
        data.status = response.status;
        callbackToHippy(callBackId, data, true, 'fetch', NetworkModule.moduleName);
        return;
      }
      callbackToHippy(callBackId, 'response null', false, 'fetch', NetworkModule.moduleName);
    }, (errorMsg) => {
      callbackToHippy(callBackId, errorMsg.toString(), false, 'fetch', NetworkModule.moduleName);
    })
      .catch((error) => {
        callbackToHippy(callBackId, error.toString(), false, 'fetch', NetworkModule.moduleName);
      });
  }

  public setCookie(callBackId: number, url: string, keyValue: string, expires: string): void {
    const cookieList = keyValue.split(';');
    cookieList.forEach((cookie) => {
      let expireStr = '';
      expireStr = expires;
      document.cookie = `${cookie}; expires=${expireStr};domain=${url}`;
    });
  }

  public getCookies(callBackId: number) {
    callbackToHippy(callBackId, document.cookie, true, 'getCookies', NetworkModule.moduleName);
  }

  public initialize() {

  }

  public destroy() {

  }
}
