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
      performance?: Performance;
    }

    interface EventRes<T = any> {
      method: string;
      params: T;
      performance?: Performance;
    }

    interface CommandRes<T = any> {
      id: number;
      result: T;
      method: string;
      performance?: Performance;
    }

    interface ErrorRes {
      id: number;
      method: string;
      error: {
        code: number;
        message: string;
      };
      performance?: Performance;
    }

    type Res = EventRes | CommandRes | ErrorRes;
    type Data = Req | Res;
  }

  type Performance = {
    devtoolsToDebugServer: number;
    debugServerReceiveFromDevtools: number;
    debugServerToDevtools: number;
    devtoolsReceive: number;
  };

  type Resolve = (value: Adapter.CDP.Res | PromiseLike<Adapter.CDP.Res>) => void;
  type Reject = (reason?: any) => void;

  type RequestPromiseMap = Map<
    string | number,
    {
      resolve: Resolve;
      reject: Reject;
    }
  >;
}
