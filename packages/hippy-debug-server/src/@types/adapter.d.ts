declare namespace Adapter {
  type DomainCallback = (msg: Adapter.CDP.Res) => void;
  declare namespace CDP {
    interface Req {
      id: number;
      method: string;
      params?: any;
    }

    interface EventRes {
      method: string;
      params: any;
    }

    interface CommandRes {
      id: number;
      result: any;
      method?: string;
    }

    interface ErrorRes {
      id: number;
      method?: string;
      error: {
        code: number;
        message: string;
      };
    }

    type Res = EventRes | CommandRes | ErrorRes;
  }
  declare namespace IWDP {}
  declare namespace Client {}

  type Channel = {
    sendMessage: (msg: Adapter.CDP.Req) => void;
    registerDomainCallback: (domain: string, cb: Adapter.DomainCallback) => void;
    registerModuleCallback: (module: string, cb: Adapter.DomainCallback) => void;
  };

  type Connection<T> = {
    ws: T;
    customDomains: string[];
  };
  type ConnectionList = Connection[];
  type ConnectionListMap<T> = Map<string, ConnectionList<T>>;
}
