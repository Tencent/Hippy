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
    }

    interface ErrorRes {
      id: number;
      error: {
        code: number;
        message: string;
      };
    }

    type Res = EventRes | CommandRes | ErrorRes;
  }
  declare namespace IWDP {}
  declare namespace Client {

  }
}
