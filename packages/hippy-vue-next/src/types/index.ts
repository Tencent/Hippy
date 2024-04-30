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
 * @public
 */
type NeedToTyped = any;

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

// global type
export {
  NeedToTyped,
  CallbackType,
  CommonMapParams,
};

// native node type
export {
  NativeNode,
  NativeNodeProps,
} from './native-node';

// native interface map type
export {
  AnimationStyle,
  NativeInterfaceMap,
} from './native-modules';

/**
 * SSR common type
 *
 * @public
 */
export interface SsrCommonParams {
  // props perhaps have any type, include string，number，boolean，object，function，array. etc
  [key: string]: NeedToTyped;
}

/**
 * SSR Node props type
 *
 * @public
 */
export type SsrNodeProps = SsrCommonParams;

/**
 * SSR Node type
 *
 * @public
 */
export interface SsrNode {
  id: number;
  pId?: number;
  index: number;
  name: string;
  props: SsrNodeProps;
  tagName?: string;
  children?: SsrNode[];
}
