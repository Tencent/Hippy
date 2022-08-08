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
 * project Configuration and constants
 */

// default debug port
const DEBUG_PORT = 38989;

// hippy debug address
const HIPPY_DEBUG_ADDRESS = `http://127.0.0.1:${
  typeof process !== 'undefined' ? process.env.PORT : DEBUG_PORT
}/`;

// whether the current environment is a production environment
const IS_PROD = process.env.NODE_ENV === 'production';

// component Map supported by the most basic version of native
const NATIVE_COMPONENT_MAP = {
  View: 'View',
  Image: 'Image',
  ListView: 'ListView',
  ListViewItem: 'ListViewItem',
  Text: 'Text',
  TextInput: 'TextInput',
  WebView: 'WebView',
  VideoPlayer: 'VideoPlayer',
  ScrollView: 'ScrollView',
};

// Hippy static file protocol address
const HIPPY_STATIC_PROTOCOL = 'hpfile://';


/**
 * @public
 */
type NeedToTyped = any;

/**
  * 全局的样式存储标识名称
  *
  * @public
  */
const HIPPY_GLOBAL_STYLE_NAME = '__HIPPY_VUE_STYLES__';

/**
  * 全局待移除样式存储标识名称
  * 当使用热更新时，过期的样式将会被添加到全局的dispose style中，即global[GLOBAL_DISPOSE_STYLE_NAME]
  *
  * @public
  */
const HIPPY_GLOBAL_DISPOSE_STYLE_NAME = '__HIPPY_VUE_DISPOSE_STYLES__';

/**
  * @public
  */
type CallbackType = Function;

/**
  * @public
  */
interface CommonMapParams {
  [key: string]: NeedToTyped;
}

export {
  HIPPY_DEBUG_ADDRESS,
  HIPPY_STATIC_PROTOCOL,
  NATIVE_COMPONENT_MAP,
  IS_PROD,
  HIPPY_GLOBAL_STYLE_NAME,
  HIPPY_GLOBAL_DISPOSE_STYLE_NAME,
  type CallbackType,
  type CommonMapParams,
  type NeedToTyped,
};
