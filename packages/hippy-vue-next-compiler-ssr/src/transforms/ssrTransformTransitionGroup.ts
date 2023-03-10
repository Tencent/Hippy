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

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/no-cycle */
import {
  type AttributeNode,
  buildProps,
  type ComponentNode,
  createCallExpression,
  type DirectiveNode,
  findProp,
  type JSChildNode,
  NodeTypes,
  type TransformContext,
} from '@vue/compiler-dom';

import { SSR_RENDER_ATTRS } from '../runtimeHelpers';
import {
  processChildren,
  type SSRTransformContext,
} from '../ssrCodegenTransform';

import { buildSSRProps } from './ssrTransformElement';

const wipMap = new WeakMap<ComponentNode, WIPEntry>();

// eslint-disable-next-line @typescript-eslint/naming-convention
interface WIPEntry {
  tag: AttributeNode | DirectiveNode;
  propsExp: string | JSChildNode | null;
}

// phase 1: build props
export function ssrTransformTransitionGroup(
  node: ComponentNode,
  context: TransformContext,
) {
  return (): void => {
    const tag = findProp(node, 'tag');
    if (tag) {
      const otherProps = node.props.filter(p => p !== tag);
      const { props, directives } = buildProps(
        node,
        context,
        otherProps,
        true /* isComponent */,
        false /* isDynamicComponent */,
        true /* ssr (skip event listeners) */,
      );
      let propsExp;
      if (props || directives.length) {
        propsExp = createCallExpression(context.helper(SSR_RENDER_ATTRS), [
          buildSSRProps(props, directives, context),
        ]);
      }
      wipMap.set(node, {
        tag,
        propsExp,
      });
    }
  };
}

// phase 2: process children
export function ssrProcessTransitionGroup(
  node: ComponentNode,
  context: SSRTransformContext,
): void {
  const entry = wipMap.get(node);
  if (entry) {
    const { tag, propsExp } = entry;
    if (tag.type === NodeTypes.DIRECTIVE) {
      // dynamic :tag
      context.pushStringPart('<');
      context.pushStringPart(tag.exp!);
      if (propsExp) {
        context.pushStringPart(propsExp);
      }
      context.pushStringPart('>');

      processChildren(
        node,
        context,
        false,
        /**
         * TransitionGroup has the special runtime behavior of flattening and
         * concatenating all children into a single fragment (in order for them to
         * be patched using the same key map) so we need to account for that here
         * by disabling nested fragment wrappers from being generated.
         */
        true,
      );
      context.pushStringPart('</');
      context.pushStringPart(tag.exp!);
      context.pushStringPart('>');
    } else {
      // static tag
      context.pushStringPart(`<${tag.value!.content}`);
      if (propsExp) {
        context.pushStringPart(propsExp);
      }
      context.pushStringPart('>');
      processChildren(node, context, false, true);
      context.pushStringPart(`</${tag.value!.content}>`);
    }
  } else {
    // fragment
    processChildren(node, context, true, true);
  }
}
