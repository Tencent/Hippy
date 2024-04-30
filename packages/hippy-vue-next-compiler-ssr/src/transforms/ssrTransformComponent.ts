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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-else-return */
/* eslint-disable import/no-cycle */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  type NodeTransform,
  NodeTypes,
  ElementTypes,
  createCallExpression,
  resolveComponentType,
  buildProps,
  type ComponentNode,
  type SlotFnBuilder,
  createFunctionExpression,
  buildSlots,
  type FunctionExpression,
  type TemplateChildNode,
  createIfStatement,
  createSimpleExpression,
  getBaseTransformPreset,
  DOMNodeTransforms,
  DOMDirectiveTransforms,
  createReturnStatement,
  type ReturnStatement,
  Namespaces,
  locStub,
  type RootNode,
  type TransformContext,
  type CompilerOptions,
  type TransformOptions,
  createRoot,
  createTransformContext,
  traverseNode,
  type ExpressionNode,
  type TemplateNode,
  SUSPENSE,
  TELEPORT,
  TRANSITION_GROUP,
  CREATE_VNODE,
  type CallExpression,
  type JSChildNode,
  RESOLVE_DYNAMIC_COMPONENT,
  TRANSITION,
} from '@vue/compiler-dom';
import { isSymbol, isObject, isArray } from '@vue/shared';

import { SSR_RENDER_COMPONENT, SSR_RENDER_VNODE } from '../runtimeHelpers';
import {
  type SSRTransformContext,
  processChildren,
  processChildrenAsStatement,
} from '../ssrCodegenTransform';

import { buildSSRProps } from './ssrTransformElement';
import {
  ssrProcessSuspense,
  ssrTransformSuspense,
} from './ssrTransformSuspense';
import { ssrProcessTeleport } from './ssrTransformTeleport';
import {
  ssrProcessTransitionGroup,
  ssrTransformTransitionGroup,
} from './ssrTransformTransitionGroup';

// We need to construct the slot functions in the 1st pass to ensure proper
// scope tracking, but the children of each slot cannot be processed until
// the 2nd pass, so we store the WIP slot functions in a weakMap during the 1st
// pass and complete them in the 2nd pass.
const wipMap = new WeakMap<ComponentNode, WIPSlotEntry[]>();

// eslint-disable-next-line symbol-description
const WIP_SLOT = Symbol();

// eslint-disable-next-line @typescript-eslint/naming-convention
interface WIPSlotEntry {
  type: typeof WIP_SLOT;
  fn: FunctionExpression;
  children: TemplateChildNode[];
  vnodeBranch: ReturnStatement;
}

const componentTypeMap = new WeakMap<
ComponentNode,
string | symbol | CallExpression
>();

// ssr component transform is done in two phases:
// In phase 1. we use `buildSlot` to analyze the children of the component into
// WIP slot functions (it must be done in phase 1 because `buildSlot` relies on
// the core transform context).
// In phase 2. we convert the WIP slots from phase 1 into ssr-specific codegen
// nodes.
export const ssrTransformComponent: NodeTransform = (node, context) => {
  if (
    node.type !== NodeTypes.ELEMENT
    || node.tagType !== ElementTypes.COMPONENT
  ) {
    return;
  }

  const component = resolveComponentType(node, context, true /* ssr */);
  const isDynamicComponent =    isObject(component) && component.callee === RESOLVE_DYNAMIC_COMPONENT;
  componentTypeMap.set(node, component);

  if (isSymbol(component)) {
    if (component === SUSPENSE) {
      return ssrTransformSuspense(node, context);
    }
    if (component === TRANSITION_GROUP) {
      return ssrTransformTransitionGroup(node, context);
    }
    return; // other built-in components: fallthrough
  }

  // Build the fallback vnode-based branch for the component's slots.
  // We need to clone the node into a fresh copy and use the buildSlots' logic
  // to get access to the children of each slot. We then compile them with
  // a child transform pipeline using vnode-based transforms (instead of ssr-
  // based ones), and save the result branch (a ReturnStatement) in an array.
  // The branch is retrieved when processing slots again in ssr mode.
  const vnodeBranches: ReturnStatement[] = [];
  const clonedNode = clone(node);

  return function ssrPostTransformComponent() {
    // Using the cloned node, build the normal VNode-based branches (for
    // fallback in case the child is render-fn based). Store them in an array
    // for later use.
    if (clonedNode.children.length) {
      buildSlots(clonedNode, context, (props, children) => {
        vnodeBranches.push(createVNodeSlotBranch(props, children, context));
        return createFunctionExpression(undefined);
      });
    }

    let propsExp: string | JSChildNode = 'null';
    if (node.props.length) {
      // note we are not passing ssr: true here because for components, v-on
      // handlers should still be passed
      const { props, directives } = buildProps(
        node,
        context,
        undefined,
        true,
        isDynamicComponent,
      );
      if (props || directives.length) {
        propsExp = buildSSRProps(props, directives, context);
      }
    }

    const wipEntries: WIPSlotEntry[] = [];
    wipMap.set(node, wipEntries);

    const buildSSRSlotFn: SlotFnBuilder = (props, children, loc) => {
      const fn = createFunctionExpression(
        [props ?? '_', '_push', '_parent', '_scopeId'],
        undefined, // no return, assign body later
        true, // newline
        true, // isSlot
        loc,
      );
      wipEntries.push({
        type: WIP_SLOT,
        fn,
        children,
        // also collect the corresponding vnode branch built earlier
        vnodeBranch: vnodeBranches[wipEntries.length],
      });
      return fn;
    };

    const slots = node.children.length
      ? buildSlots(node, context, buildSSRSlotFn).slots
      : 'null';

    if (typeof component !== 'string') {
      // dynamic component that resolved to a `resolveDynamicComponent` call
      // expression - since the resolved result may be a plain element (string)
      // or a VNode, handle it with `renderVNode`.
      node.ssrCodegenNode = createCallExpression(
        context.helper(SSR_RENDER_VNODE),
        [
          '_push',
          createCallExpression(context.helper(CREATE_VNODE), [
            component,
            propsExp,
            slots,
          ]),
          '_parent',
        ],
      );
    } else {
      node.ssrCodegenNode = createCallExpression(
        context.helper(SSR_RENDER_COMPONENT),
        [component, propsExp, slots, '_parent'],
      );
    }
  };
};

// eslint-disable-next-line complexity
export function ssrProcessComponent(
  node: ComponentNode,
  context: SSRTransformContext,
  parent: { children: TemplateChildNode[] },
): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const component = componentTypeMap.get(node)!;
  if (!node.ssrCodegenNode) {
    // this is a built-in component that fell-through.
    if (component === TELEPORT) {
      return ssrProcessTeleport(node, context);
    } else if (component === SUSPENSE) {
      return ssrProcessSuspense(node, context);
    } else if (component === TRANSITION_GROUP) {
      return ssrProcessTransitionGroup(node, context);
    } else {
      // real fall-through: Transition / KeepAlive
      // just render its children.
      // #5352: if is at root level of a slot, push an empty string.
      // this does not affect the final output, but avoids all-comment slot
      // content of being treated as empty by ssrRenderSlot().
      if ((parent as WIPSlotEntry).type === WIP_SLOT) {
        context.pushStringPart('');
      }
      // #5351: filter out comment children inside transition
      if (component === TRANSITION) {
        node.children = node.children.filter(c => c.type !== NodeTypes.COMMENT);
      }
      processChildren(node, context);
    }
  } else {
    // finish up slot function expressions from the 1st pass.
    const wipEntries = wipMap.get(node) ?? [];
    for (let i = 0; i < wipEntries.length; i++) {
      const { fn, vnodeBranch } = wipEntries[i];
      // For each slot, we generate two branches: one SSR-optimized branch and
      // one normal vnode-based branch. The branches are taken based on the
      // presence of the 2nd `_push` argument (which is only present if the slot
      // is called by `_ssrRenderSlot`.
      fn.body = createIfStatement(
        createSimpleExpression('_push', false),
        processChildrenAsStatement(
          wipEntries[i],
          context,
          false,
          true /* withSlotScopeId */,
        ),
        vnodeBranch,
      );
    }

    // component is inside a slot, inherit slot scope Id
    if (context.withSlotScopeId) {
      node.ssrCodegenNode.arguments.push('_scopeId');
    }

    if (typeof component === 'string') {
      // static component
      context.pushStatement(createCallExpression('_push', [node.ssrCodegenNode]));
    } else {
      // dynamic component (`resolveDynamicComponent` call)
      // the codegen node is a `renderVNode` call
      context.pushStatement(node.ssrCodegenNode);
    }
  }
}

export const rawOptionsMap = new WeakMap<RootNode, CompilerOptions>();

const [baseNodeTransforms, baseDirectiveTransforms] =  getBaseTransformPreset(true);
const vnodeNodeTransforms = [...baseNodeTransforms, ...DOMNodeTransforms];
const vnodeDirectiveTransforms = {
  ...baseDirectiveTransforms,
  ...DOMDirectiveTransforms,
};

function createVNodeSlotBranch(
  props: ExpressionNode | undefined,
  children: TemplateChildNode[],
  parentContext: TransformContext,
): ReturnStatement {
  // apply a sub-transform using vnode-based transforms.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rawOptions = rawOptionsMap.get(parentContext.root)!;

  const subOptions = {
    ...rawOptions,
    // overwrite with vnode-based transforms
    nodeTransforms: [
      ...vnodeNodeTransforms,
      ...(rawOptions.nodeTransforms ?? []),
    ],
    directiveTransforms: {
      ...vnodeDirectiveTransforms,
      ...(rawOptions.directiveTransforms ?? {}),
    },
  };

  // wrap the children with a wrapper template for proper children treatment.
  const wrapperNode: TemplateNode = {
    type: NodeTypes.ELEMENT,
    ns: Namespaces.HTML,
    tag: 'template',
    tagType: ElementTypes.TEMPLATE,
    isSelfClosing: false,
    // important: provide v-slot="props" on the wrapper for proper
    // scope analysis
    props: [
      {
        type: NodeTypes.DIRECTIVE,
        name: 'slot',
        exp: props,
        arg: undefined,
        modifiers: [],
        loc: locStub,
      },
    ],
    children,
    loc: locStub,
    codegenNode: undefined,
  };
  subTransform(wrapperNode, subOptions, parentContext);
  return createReturnStatement(children);
}

function subTransform(
  node: TemplateChildNode,
  options: TransformOptions,
  parentContext: TransformContext,
) {
  const childRoot = createRoot([node]);
  const childContext = createTransformContext(childRoot, options);
  // this sub transform is for vnode fallback branch so it should be handled
  // like normal render functions
  childContext.ssr = false;
  // inherit parent scope analysis state
  childContext.scopes = { ...parentContext.scopes };
  childContext.identifiers = { ...parentContext.identifiers };
  childContext.imports = parentContext.imports;
  // traverse
  traverseNode(childRoot, childContext);
  // merge helpers/components/directives into parent context
  (['helpers', 'components', 'directives'] as const).forEach((key) => {
    childContext[key].forEach((value: any, helperKey: any) => {
      if (key === 'helpers') {
        const parentCount = parentContext.helpers.get(helperKey);
        if (parentCount === undefined) {
          parentContext.helpers.set(helperKey, value);
        } else {
          parentContext.helpers.set(helperKey, value + parentCount);
        }
      } else {
        (parentContext[key] as any).add(value);
      }
    });
  });
  // imports/hoists are not merged because:
  // - imports are only used for asset urls and should be consistent between
  //   node/client branches
  // - hoists are not enabled for the client branch here
}

function clone(v: any): any {
  if (isArray(v)) {
    return v.map(clone);
  } else if (isObject(v)) {
    const res: any = {};
    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (const key in v) {
      res[key] = clone(v[key]);
    }
    return res;
  } else {
    return v;
  }
}
