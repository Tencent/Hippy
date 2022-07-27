export interface Network {
  getCookie: (url: string) => string;
  setCookie: (url: string, keyValue: string, expireStr: string) => void;
}
