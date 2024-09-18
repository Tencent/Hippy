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

/* eslint-disable no-param-reassign */
import {
  type CodegenResult,
  baseParse,
  parserOptions,
  transform,
  generate,
  type CompilerOptions,
  transformExpression,
  trackVForSlotScopes,
  trackSlotScopes,
  noopDirectiveTransform,
  transformBind,
  transformStyle,
  transformOn,
} from '@vue/compiler-dom';

import { ssrCodegenTransform } from './ssrCodegenTransform';
import { ssrInjectCssVars } from './transforms/ssrInjectCssVars';
import { ssrInjectFallthroughAttrs } from './transforms/ssrInjectFallthroughAttrs';
import {
  ssrTransformComponent,
  rawOptionsMap,
} from './transforms/ssrTransformComponent';
import { ssrTransformElement } from './transforms/ssrTransformElement';
import { ssrTransformSlotOutlet } from './transforms/ssrTransformSlotOutlet';
import { ssrTransformFor } from './transforms/ssrVFor';
import { ssrTransformIf } from './transforms/ssrVIf';
import { ssrTransformModel } from './transforms/ssrVModel';
import { ssrTransformShow } from './transforms/ssrVShow';

/**
 * ssr compile
 *
 * @param template - template string
 * @param options - compile options
 *
 * @public
 */
export function compile(
  template: string,
  options: CompilerOptions = {},
): CodegenResult {
  options = {
    ...options,
    // apply DOM-specific parsing options
    ...parserOptions,
    ssr: true,
    inSSR: true,
    scopeId: options.mode === 'function' ? null : options.scopeId,
    // always prefix since compiler-ssr doesn't have size concern
    prefixIdentifiers: true,
    // disable optimizations that are unnecessary for ssr
    cacheHandlers: false,
    hoistStatic: false,
  };

  const ast = baseParse(template, options);

  // Save raw options for AST. This is needed when performing sub-transforms
  // on slot vnode branches.
  rawOptionsMap.set(ast, options);

  transform(ast, {
    ...options,
    hoistStatic: false,
    nodeTransforms: [
      ssrTransformIf,
      ssrTransformFor,
      trackVForSlotScopes,
      transformExpression,
      ssrTransformSlotOutlet,
      ssrInjectFallthroughAttrs,
      ssrInjectCssVars,
      ssrTransformElement,
      ssrTransformComponent,
      trackSlotScopes,
      transformStyle,
      ...(options.nodeTransforms ?? []), // user custom transforms
    ],
    directiveTransforms: {
      // reusing core v-bind
      bind: transformBind,
      on: transformOn,
      // model and show has dedicated SSR handling
      model: ssrTransformModel,
      show: ssrTransformShow,
      // the following are ignored during SSR
      // on: noopDirectiveTransform,
      cloak: noopDirectiveTransform,
      once: noopDirectiveTransform,
      memo: noopDirectiveTransform,
      ...(options.directiveTransforms ?? {}), // user custom transforms
    },
  });

  // traverse the template AST and convert into SSR codegen AST
  // by replacing ast.codegenNode.
  ssrCodegenTransform(ast, options);

  return generate(ast, options);
}
