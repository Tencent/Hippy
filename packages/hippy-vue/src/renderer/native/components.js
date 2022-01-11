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

/**
 * All of component implemented by Native.
 */

const View = Symbol.for('View');
const Image = Symbol.for('Image');
const ListView = Symbol.for('ListView');
const ListViewItem = Symbol.for('ListViewItem');
const Text = Symbol.for('Text');
const TextInput = Symbol.for('TextInput');
const WebView = Symbol.for('WebView');
const VideoPlayer = Symbol.for('VideoPlayer');

const NATIVE_COMPONENT_NAME_MAP = {
  [View]: 'View',
  [Image]: 'Image',
  [ListView]: 'ListView',
  [ListViewItem]: 'ListViewItem',
  [Text]: 'Text',
  [TextInput]: 'TextInput',
  [WebView]: 'WebView',
  [VideoPlayer]: 'VideoPlayer',
};

export default NATIVE_COMPONENT_NAME_MAP;
export {
  View,
  Image,
  ListView,
  ListViewItem,
  Text,
  TextInput,
  WebView,
  VideoPlayer,
};
