/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
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
 * @public
 */
export type NeedToTyped = any;

/**
 * 全局的样式存储标识名称
 *
 * @public
 */
export const HIPPY_GLOBAL_STYLE_NAME = '__HIPPY_VUE_STYLES__';

/**
 * 全局待移除样式存储标识名称
 * 当使用热更新时，过期的样式将会被添加到全局的dispose style中，即global[GLOBAL_DISPOSE_STYLE_NAME]
 *
 * @public
 */
export const HIPPY_GLOBAL_DISPOSE_STYLE_NAME = '__HIPPY_VUE_DISPOSE_STYLES__';

/**
 * Hippy静态文件协议地址
 *
 * @public
 */
export const HIPPY_STATIC_PROTOCOL = 'hpfile://';

/**
 * @public
 */
export type CallbackType = Function;

/**
 * @public
 */
export interface CommonMapParams {
  [key: string]: NeedToTyped;
}
