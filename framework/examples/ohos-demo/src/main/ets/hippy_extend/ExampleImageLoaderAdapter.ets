/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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
import { HippyImageLocalLoaderAdapter, HippyImageRemoteLoaderAdapter, HippyImageRemoteLoaderListener} from 'hippy'

export class ExampleImageLocalLoader implements HippyImageLocalLoaderAdapter {
  fetchLocalPath(url: string): string {
    return "file:///data/storage/el1/bundle/entry/resources/resfile/demo.png";
    //return "";
  }
}

export class ExampleImageRemoteLoader implements HippyImageRemoteLoaderAdapter {
  fetchLocalPathAsync(url: string, listener: HippyImageRemoteLoaderListener): void {
    let path = "file:///data/storage/el1/bundle/entry/resources/resfile/demo.png";
    //let path = url;
    listener.onRequestSuccess(path);
  }
}
