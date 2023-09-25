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
  * Global style store identifier name
  *
  * @public
  */
const HIPPY_GLOBAL_STYLE_NAME = '__HIPPY_VUE_STYLES__';

/**
  * The name of the global to-be-removed style store identifier
  * When using hot update, expired styles will be added to the global dispose style
  *
  * @public
  */
const HIPPY_GLOBAL_DISPOSE_STYLE_NAME = '__HIPPY_VUE_DISPOSE_STYLES__';

// hippy vue next package version
// eslint-disable-next-line
const HIPPY_VUE_VERSION = process.env.HIPPY_VUE_VERSION;

/**
 * the key of generate hippy unique id
 */
const HIPPY_UNIQUE_ID_KEY = 'hippyUniqueId';

export {
  HIPPY_DEBUG_ADDRESS,
  HIPPY_STATIC_PROTOCOL,
  NATIVE_COMPONENT_MAP,
  IS_PROD,
  HIPPY_GLOBAL_STYLE_NAME,
  HIPPY_GLOBAL_DISPOSE_STYLE_NAME,
  HIPPY_VUE_VERSION,
  HIPPY_UNIQUE_ID_KEY,
};
