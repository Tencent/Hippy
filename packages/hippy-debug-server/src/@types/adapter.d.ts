declare namespace Adapter {
  type DomainListener = (msg: Adapter.CDP.Res) => void;
  declare namespace CDP {
    interface Req {
      id: number;
      method: string;
      params: any;
    }

    interface EventRes {
      method: string;
      params: any;
    }

    // CommanRes/ErrorRes 接口统一在 onMessage 时把 method 字段补充上去了
    interface CommandRes {
      id: number;
      method?: string;
      result: any;
      method: string;
    }

    interface ErrorRes {
      id: number;
      method: string;
      error: {
        code: number;
        message: string;
      };
    }

    type Res = EventRes | CommandRes | ErrorRes;
    type Data = Req | Res;
  }
  declare namespace IWDP {}
  declare namespace Client {}

  type RegisterDomainListener = (domain: string, callback: Adapter.DomainListener) => void;

  type Channel = {
    sendMessage: (msg: Adapter.CDP.Req) => void;
    registerDomainListener: RegisterDomainListener;
  };

  type Connection<T> = {
    ws: T;
    customDomains: string[];
  };
  type ConnectionList = Connection[];
  type ConnectionListMap<T> = Map<string, ConnectionList<T>>;

  type RequestPromiseMap = Map<
    string | number,
    {
      resolve: Resolve;
      reject: Reject;
    }
  >;
}
