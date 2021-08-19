declare namespace Application {
  interface StartServerArgv {
    host: string;
    port: number;
    static: string;
    entry: string;
    wsPath: string;
    iwdpPort: number;
    iwdpStartPort: number;
    iwdpEndPort: number;
    startAdb: boolean;
    startIWDP: boolean;
    clearAddrInUse: boolean;
    useTunnel: boolean;
    env: string;
    publicPath?: string;
  }
}
