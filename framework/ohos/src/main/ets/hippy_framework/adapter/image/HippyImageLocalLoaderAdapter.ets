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

/**
 * 对于已经预下载的图片，可实现该adapter直接返回本地路径
 */
export interface HippyImageLocalLoaderAdapter {
  /**
   * 根据图片url同步返回本地路径
   *
   * @param url 图片url
   * @return 本地路径。如果找不到本地路径请返回空字符串，hippy内部进一步下载url。
   *         本地路径举例："file:///data/storage/el1/bundle/entry/resources/resfile/demo.png"
   */
  fetchLocalPath(url: string): string;
}
