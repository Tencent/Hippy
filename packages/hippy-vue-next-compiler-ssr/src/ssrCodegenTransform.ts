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
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  type RootNode,
  type BlockStatement,
  type TemplateLiteral,
  createCallExpression,
  createTemplateLiteral,
  NodeTypes,
  type TemplateChildNode,
  ElementTypes,
  createBlockStatement,
  type CompilerOptions,
  type IfStatement,
  type CallExpression,
  isText,
  processExpression,
  createSimpleExpression,
  createCompoundExpression,
  createTransformContext,
  createRoot,
} from '@vue/compiler-dom';
import { isString } from '@vue/shared';

import { createSSRCompilerError, SSRErrorCodes } from './errors';
import { ssrHelpers } from './runtimeHelpers';
import { ssrProcessComponent } from './transforms/ssrTransformComponent';
import { ssrProcessElement } from './transforms/ssrTransformElement';
import { ssrProcessSlotOutlet } from './transforms/ssrTransformSlotOutlet';
import { ssrProcessFor } from './transforms/ssrVFor';
import { ssrProcessIf } from './transforms/ssrVIf';

// Because SSR codegen output is completely different from client-side output
// (e.g. multiple elements can be concatenated into a single template literal
// instead of each getting a corresponding call), we need to apply an extra
// transform pass to convert the template AST into a fresh JS AST before
// passing it to codegen.

export function ssrCodegenTransform(
  ast: RootNode,
  options: CompilerOptions,
): void {
  const context = createSSRTransformContext(ast, options);

  // inject SFC <style> CSS variables
  // we do this instead of inlining the expression to ensure the vars are
  // only resolved once per render
  if (options.ssrCssVars) {
    const varsExp = processExpression(
      createSimpleExpression(options.ssrCssVars, false),
      createTransformContext(createRoot([]), options),
    );
    context.body.push(createCompoundExpression(['const _cssVars = { style: ', varsExp, '}']));
  }

  const isFragment = ast.children.length > 1 && ast.children.some(c => !isText(c));
  processChildren(ast, context, isFragment);
  ast.codegenNode = createBlockStatement(context.body);

  // Finalize helpers.
  // We need to separate helpers imported from 'vue' vs. '@vue/server-renderer'
  ast.ssrHelpers = Array.from(new Set([
    ...Array.from(ast.helpers).filter(h => h in ssrHelpers),
    ...context.helpers,
  ]));

  ast.helpers = new Set(Array.from(ast.helpers).filter(h => !(h in ssrHelpers)));
}

export type SSRTransformContext = ReturnType<typeof createSSRTransformContext>;

function createSSRTransformContext(
  root: RootNode,
  options: CompilerOptions,
  helpers: Set<symbol> = new Set(),
  withSlotScopeId = false,
) {
  const body: BlockStatement['body'] = [];
  let currentString: TemplateLiteral | null = null;

  return {
    root,
    options,
    body,
    helpers,
    withSlotScopeId,
    onError:
      options.onError
      ?? ((e) => {
        throw e;
      }),
    helper<T extends symbol>(name: T): T {
      helpers.add(name);
      return name;
    },
    pushStringPart(part: TemplateLiteral['elements'][0]) {
      if (!currentString) {
        const currentCall = createCallExpression('_push');
        body.push(currentCall);
        currentString = createTemplateLiteral([]);
        currentCall.arguments.push(currentString);
      }
      const bufferedElements = currentString.elements;
      const lastItem = bufferedElements[bufferedElements.length - 1];
      if (isString(part) && isString(lastItem)) {
        bufferedElements[bufferedElements.length - 1] += part;
      } else {
        bufferedElements.push(part);
      }
    },
    pushStatement(statement: IfStatement | CallExpression) {
      // close current string
      currentString = null;
      body.push(statement);
    },
  };
}

function createChildContext(
  parent: SSRTransformContext,
  withSlotScopeId = parent.withSlotScopeId,
): SSRTransformContext {
  // ensure child inherits parent helpers
  return createSSRTransformContext(
    parent.root,
    parent.options,
    parent.helpers,
    withSlotScopeId,
  );
}

interface Container {
  children: TemplateChildNode[];
}

// eslint-disable-next-line complexity
export function processChildren(
  parent: Container,
  context: SSRTransformContext,
  asFragment = false,
  disableNestedFragments = false,
): void | never {
  if (asFragment) {
    // use hippy comment format instead vue format, eg. <!--[-->
    context.pushStringPart('{"id": -1,"name":"comment","props":{"text":"["}},');
  }
  const { children } = parent;
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    switch (child.type) {
      case NodeTypes.ELEMENT:
        switch (child.tagType) {
          case ElementTypes.ELEMENT:
            ssrProcessElement(child, context);
            break;
          case ElementTypes.COMPONENT:
            ssrProcessComponent(child, context, parent);
            break;
          case ElementTypes.SLOT:
            ssrProcessSlotOutlet(child, context);
            break;
          case ElementTypes.TEMPLATE:
            // TODO
            break;
          default: {
            context.onError(createSSRCompilerError(
              SSRErrorCodes.X_SSR_INVALID_AST_NODE,
              (child as any).loc,
            ));
            // make sure we exhaust all possible types
            return child;
          }
        }
        break;
      case NodeTypes.TEXT:
        // NodeTypes.TEXT like <div>content</div>. hippy do not support. just comment it,
        // we should used like <div><span>content</span></div>. span,p,label can use to wrap
        // text content
        // context.pushStringPart(`"${child.content}"`);
        break;
      case NodeTypes.COMMENT:
        // no need to escape comment here because the AST can only
        // contain valid comments.
        // hippy comment node
        context.pushStringPart(`{"id": -1,"name":"comment","props":{"text":"${child.content
          .replace(/\n/g, ' ')
          .replace(/"/g, '\\"')}"}},`);
        break;
      case NodeTypes.INTERPOLATION:
        // NodeTypes.INTERPOLATION like <div>{{content}}</div>. hippy do not support.
        // just comment it like TEXT
        // context.pushStringPart(
        //   createCallExpression(context.helper(SSR_INTERPOLATE), [
        //     child.content,
        //   ]),
        // );
        break;
      case NodeTypes.IF:
        ssrProcessIf(child, context, disableNestedFragments);
        break;
      case NodeTypes.FOR:
        ssrProcessFor(child, context, disableNestedFragments);
        break;
      case NodeTypes.IF_BRANCH:
        // no-op - handled by ssrProcessIf
        break;
      case NodeTypes.TEXT_CALL:
      case NodeTypes.COMPOUND_EXPRESSION:
        // no-op - these two types can never appear as template child node since
        // `transformText` is not used during SSR compile.
        break;
      default: {
        context.onError(createSSRCompilerError(
          SSRErrorCodes.X_SSR_INVALID_AST_NODE,
          (child as any).loc,
        ));
        // make sure we exhaust all possible types
        return child;
      }
    }
  }
  if (asFragment) {
    // use hippy comment format instead vue format, eg. <!--]-->
    context.pushStringPart('{"id": -1,"name":"comment","props":{"text":"]"}},');
  }
  return undefined;
}

export function processChildrenAsStatement(
  parent: Container,
  parentContext: SSRTransformContext,
  asFragment = false,
  withSlotScopeId = parentContext.withSlotScopeId,
): BlockStatement {
  const childContext = createChildContext(parentContext, withSlotScopeId);
  processChildren(parent, childContext, asFragment);
  return createBlockStatement(childContext.body);
}
