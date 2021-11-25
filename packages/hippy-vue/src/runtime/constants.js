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

/* eslint-disable import/prefer-default-export */

/**
 * hippy-vue-css-loader will translate the CSS texts to be AST
 * and attached at global[GLOBAL_STYLE_NAME]
 */
const GLOBAL_STYLE_NAME = '__HIPPY_VUE_STYLES__';

/**
 * Hippy debug address
 */
const HIPPY_DEBUG_ADDRESS = `http://127.0.0.1:${process.env.PORT}/`;

/**
 * Hippy static resources protocol
 */
const HIPPY_STATIC_PROTOCOL = 'hpfile://';

export {
  GLOBAL_STYLE_NAME,
  HIPPY_DEBUG_ADDRESS,
  HIPPY_STATIC_PROTOCOL,
};
