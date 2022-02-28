import { BaseModule, ModuleContext } from '../../types';
import { dispatchModuleEventToHippy } from '../common';
type NetInfoType = 'NONE' | 'WIFI' | 'CELL' | 'UNKONWN';
type ConnectionType =
  | 'bluetooth'
  | 'cellular'
  | 'ethernet'
  | 'mixed'
  | 'none'
  | 'other'
  | 'unknown'
  | 'wifi'
  | 'wimax';

export class NetInfoModule implements BaseModule {
  private context!: ModuleContext;

  public constructor(context: ModuleContext) {
    this.context = context;
  }

  public get connection() {
    return  window.navigator?.connection;
  }

  public get state() {
    const isConnected = navigator.onLine;
    let networkState: NetInfoType = 'UNKONWN';
    if (!this.connection && !isConnected) {
      networkState = 'NONE';
    }
    if (this.connection) {
      const networkWifi: ConnectionType = 'wifi';
      const networkCell: ConnectionType = 'cellular';
      if (this.connection.type === networkWifi) {
        networkState = 'WIFI';
      }
      if (this.connection.type === networkCell) {
        networkState = 'CELL';
      }
    }
    return networkState;
  }

  public addListener(name: string) {
    if (name === 'change') {
      window.addEventListener('online', this.handleOnlineChange);
      window.addEventListener('offline', this.handleOnlineChange);
    }
  }

  public removeListener(name: string) {
    if (name === 'change') {
      window.removeEventListener('online', this.handleOnlineChange);
      window.removeEventListener('offline', this.handleOnlineChange);
    }
  }


  public initialize() {

  }

  public destroy() {
    this.removeListener('change');
  }

  private handleOnlineChange() {
    dispatchModuleEventToHippy(['networkStatusDidChange', { network_info: this.state }]);
  }
}
