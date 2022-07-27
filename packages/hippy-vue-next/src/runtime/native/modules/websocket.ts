interface ConnectArgs {
  headers: {
    [x: string]: any;
  };
  url: string;
}

interface ConnectResp {
  id: number;
  code: number;
}

interface CloseArgs {
  id: number;
  reason: string;
  code: number;
}

interface SendArgs {
  id: number;
  data: string;
}

export interface Websocket {
  connect: (args: ConnectArgs) => ConnectResp;
  send: (args: SendArgs) => void;
  close: (args: CloseArgs) => void;
}
