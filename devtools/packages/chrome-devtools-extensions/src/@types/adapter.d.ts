/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

declare namespace Adapter {
  type DomainListener = (msg: Adapter.CDP.Res) => void;
  declare namespace CDP {
    interface Req<T = any> {
      id: number;
      method: string;
      params: T;
    }

    interface EventRes<T = any> {
      method: string;
      params: T;
    }

    interface CommandRes<T = any> {
      id: number;
      result: T;
      // CommandRes ErrorRes add method field in onMessage
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
