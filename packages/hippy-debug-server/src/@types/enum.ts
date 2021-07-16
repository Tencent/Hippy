export const enum DevicePlatform {
  Unkonw = '0',
  IOS = '1',
  Android = '2',
}

export const enum DeviceStatus {
  Connected = '1',
  Disconnected = '2',
}

export const TunnelEvent = {
  GetWebsocketPort: 'tunnel_get_websocket_port',
  AddDevice: 'tunnel_add_device',
  RemoveDevice: 'tunnel_remove_device',
  AppConnect: 'tunnel_app_connect',
  appDisconnect: 'tunnel_app_disconnect',
  ReceiveData: 'tunnel_recv_data',
};

export const enum DebuggerProtocolType {
  Unkonw,
  CDP,
  DAP,
}

export const enum ClientType {
  App = 'app',
  Devtools = 'devtools',
  Unknown = 'unknown',
}

export const enum ClientRole {
  Android = 'android_client',
}

export const enum ClientEvent {
  Message = 'message',
  Close = 'close',
}

export const enum AppClientType {
  Tunnel = 'tunnel',
  WS = 'ws',
  IosProxy = 'ios-proxy',
}

export enum PH {
  Begin = 'B',
  End = 'E',
  MetaData = 'M',
  Complete = 'X',
}

export enum DeviceManagerEvent {
  addDevice = 'addDevice',
  removeDevice = 'removeDevice',
  appDidDisConnect = 'appDidDisConnect',
  appDidConnect = 'appDidConnect',
  getDeviceList = 'getDeviceList',
}

export enum ChromePageType {
  Page = 'page',
  Node = 'node',
}
