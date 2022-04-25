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

declare namespace Channel {
  type Resolve<T> = (value: T) => TResult1 | PromiseLike<TResult1>;
  type Reject = (reason: any) => TResult2 | PromiseLike<TResult2>;
  type RequestData = {
    id?: number;
    method: string;
    params: unknown;
  };
  type RequestPromiseMap<T> = Map<
    string | number,
    {
      resolve: Resolve<T>;
      reject: Reject;
    }
  >;
  type EventListener = (res: Adapter.CDP.EventRes) => void;
}
