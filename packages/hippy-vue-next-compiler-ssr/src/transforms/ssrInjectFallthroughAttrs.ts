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

/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  type NodeTransform,
  NodeTypes,
  ElementTypes,
  locStub,
  createSimpleExpression,
  type RootNode,
  type TemplateChildNode,
  type ParentNode,
  findDir,
  isBuiltInType,
} from '@vue/compiler-dom';

const filterChild = (node: ParentNode) => node.children.filter(n => n.type !== NodeTypes.COMMENT);

const hasSingleChild = (node: ParentNode): boolean => filterChild(node).length === 1;

// eslint-disable-next-line complexity
export const ssrInjectFallthroughAttrs: NodeTransform = (node, context) => {
  // _attrs is provided as a function argument.
  // mark it as a known identifier so that it doesn't get prefixed by
  // transformExpression.
  if (node.type === NodeTypes.ROOT) {
    // eslint-disable-next-line no-param-reassign
    context.identifiers._attrs = 1;
  }

  if (
    node.type === NodeTypes.ELEMENT
    && node.tagType === ElementTypes.COMPONENT
    && (isBuiltInType(node.tag, 'Transition')
      || isBuiltInType(node.tag, 'KeepAlive'))
  ) {
    const rootChildren = filterChild(context.root);
    if (rootChildren.length === 1 && rootChildren[0] === node) {
      if (hasSingleChild(node)) {
        injectFallthroughAttrs(node.children[0]);
      }
      return;
    }
  }

  const { parent } = context;
  if (!parent || parent.type !== NodeTypes.ROOT) {
    return;
  }

  if (node.type === NodeTypes.IF_BRANCH && hasSingleChild(node)) {
    // detect cases where the parent v-if is not the only root level node
    let hasEncounteredIf = false;
    for (const c of filterChild(parent)) {
      if (
        c.type === NodeTypes.IF
        || (c.type === NodeTypes.ELEMENT && findDir(c, 'if'))
      ) {
        // multiple root v-if
        if (hasEncounteredIf) return;
        hasEncounteredIf = true;
      } else if (
        // node before v-if
        !hasEncounteredIf
        // non else nodes
        || !(c.type === NodeTypes.ELEMENT && findDir(c, /else/, true))
      ) {
        return;
      }
    }
    injectFallthroughAttrs(node.children[0]);
  } else if (hasSingleChild(parent)) {
    injectFallthroughAttrs(node);
  }
};

function injectFallthroughAttrs(node: RootNode | TemplateChildNode) {
  if (
    node.type === NodeTypes.ELEMENT
    && (node.tagType === ElementTypes.ELEMENT
      || node.tagType === ElementTypes.COMPONENT)
    && !findDir(node, 'for')
  ) {
    node.props.push({
      type: NodeTypes.DIRECTIVE,
      name: 'bind',
      arg: undefined,
      exp: createSimpleExpression('_attrs', false),
      modifiers: [],
      loc: locStub,
    });
  }
}
