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

/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-undef-init */
/* eslint-disable import/no-cycle */
import {
  type NodeTransform,
  NodeTypes,
  ElementTypes,
  type TemplateLiteral,
  createTemplateLiteral,
  createCallExpression,
  createConditionalExpression,
  createSimpleExpression,
  buildProps,
  type DirectiveNode,
  type PlainElementNode,
  createCompilerError,
  ErrorCodes,
  type CallExpression,
  createArrayExpression,
  type ExpressionNode,
  type JSChildNode,
  type ArrayExpression,
  hasDynamicKeyVBind,
  MERGE_PROPS,
  isStaticArgOf,
  isStaticExp,
  type AttributeNode,
  buildDirectiveArgs,
  type TransformContext,
  type PropsExpression,
} from '@vue/compiler-dom';
import {
  capitalize,
  isBooleanAttr,
  isBuiltInDirective,
  isSSRSafeAttrName,
  propsToAttrMap,
} from '@vue/shared';
import { getHippyNativeViewName, getHippyTagName } from '@hippy-vue-next-server-renderer/native';

import { createSSRCompilerError, SSRErrorCodes } from '../errors';
import {
  SSR_RENDER_CLASS,
  SSR_RENDER_STYLE,
  SSR_RENDER_DYNAMIC_ATTR,
  SSR_INTERPOLATE,
  SSR_INCLUDE_BOOLEAN_ATTR,
  SSR_GET_DIRECTIVE_PROPS,
  SSR_GET_UNIQUEID,
} from '../runtimeHelpers';
import {
  type SSRTransformContext,
  processChildren,
} from '../ssrCodegenTransform';

// for directives with children overwrite (e.g. v-html & v-text), we need to
// store the raw children so that they can be added in the 2nd pass.
const rawChildrenMap = new WeakMap<
PlainElementNode,
TemplateLiteral['elements'][0]
>();

/**
 * return tag is text or not
 *
 * @param tag - tag name
 */
function isTextTag(tag: string): boolean {
  return ['span', 'p', 'label', 'a'].includes(tag);
}

/**
 * get native real event listener name for binding event name
 *
 * @param event - event name
 * @param tagName - event target tag name
 */
function getHippyEventKeyInSSR(event: string, tagName: string): string {
  const eventMap = {
    div: {
      touchStart: 'onTouchDown',
      touchstart: 'onTouchDown',
      touchmove: 'onTouchMove',
      touchend: 'onTouchEnd',
      touchcancel: 'onTouchCancel',
    },
    ul: { listReady: 'initialListReady' },
    li: { disappear: 'onDisappear' },
    input: {
      change: 'onChangeText',
      select: 'onSelectionChange',
    },
    swiper: {
      dropped: 'onPageSelected',
      dragging: 'onPageScroll',
      stateChanged: 'onPageScrollStateChanged',
    },
  };
  let curEventMap = {};
  switch (tagName) {
    case 'div':
    case 'button':
    case 'img':
    case 'span':
    case 'label':
    case 'p':
    case 'a':
      curEventMap = eventMap.div;
      break;
    case 'ul':
      curEventMap = eventMap.ul;
      break;
    case 'li':
      curEventMap = eventMap.li;
      break;
    case 'textarea':
    case 'input':
      curEventMap = eventMap.input;
      break;
    case 'swiper':
      curEventMap = eventMap.swiper;
      break;
    default:
      break;
  }
  if (curEventMap[event]) {
    return curEventMap[event];
  }
  return `on${capitalize(event)}`;
}

export const ssrTransformElement: NodeTransform = (node, context) => {
  if (
    node.type !== NodeTypes.ELEMENT
    || node.tagType !== ElementTypes.ELEMENT
  ) {
    return;
  }

  return function ssrPostTransformElement() {
    const openTag: TemplateLiteral['elements'] = ['{"id":'];
    // generate hippy uniqueId
    openTag.push(createCallExpression(context.helper(SSR_GET_UNIQUEID), []));
    // push name and tagName attr
    openTag.push(`,"index":0,"name":"${getHippyNativeViewName(node.tag)}","tagName":"${getHippyTagName(node.tag)}","props":{`);
    // v-bind="obj", v-bind:[key] and custom directives can potentially
    // overwrite other static attrs and can affect final rendering result,
    // so when they are present we need to bail out to full `renderAttrs`
    const hasDynamicVBind = hasDynamicKeyVBind(node);
    const hasCustomDir = node.props.some(p => p.type === NodeTypes.DIRECTIVE && !isBuiltInDirective(p.name));
    const needMergeProps = hasDynamicVBind || hasCustomDir;
    // hippy images source, Android use src=imgUrl, iOS use source=[{"uri": imgUrl}]
    // numberOfRows will makes Image flicker on Android, iOS only
    // all props of hippy node(except id and class) will store in "props" and "attributes"(for debug)
    // need merge props should merge in node props when at client runtime, not in ssr
    if (needMergeProps) {
      const { props, directives } = buildProps(
        node,
        context,
        node.props,
        false /* isComponent */,
        false /* isDynamicComponent */,
        true /* ssr */,
      );
      if (props || directives.length) {
        const mergedProps = buildSSRProps(props, directives, context);
        openTag.push('"mergedProps":');
        openTag.push(createCallExpression('JSON.stringify', [mergedProps]));
        openTag.push(',');
      }
    }

    // bookkeeping static/dynamic class merging.
    let dynamicClassBinding: CallExpression | undefined = undefined;
    let staticClassBinding: string | undefined = undefined;
    // all style bindings are converted to dynamic by transformStyle.
    // but we need to make sure to merge them.
    let dynamicStyleBinding: CallExpression | undefined = undefined;

    for (let i = 0; i < node.props.length; i++) {
      const prop = node.props[i];
      // ignore true-value/false-value on input
      if (node.tag === 'input' && isTrueFalseValue(prop)) {
        continue;
      }
      // special cases with children override
      if (prop.type === NodeTypes.DIRECTIVE) {
        if (prop.name === 'on') {
          // directive event handled for hippy.
          // hippy event handle: at ssr for web, onXXX will ignore, so we need to add Event listener
          // onXXX=true, so that hippy native should add event listener
          const { arg } = prop;
          if (arg?.type === NodeTypes.SIMPLE_EXPRESSION && arg.isStatic) {
            openTag.push(`"${getHippyEventKeyInSSR(arg.content, node.tag)}": true,`);
          }
        } else if (prop.name === 'html' && prop.exp) {
          // v-html/v-text/v-textarea/ hippy do not support
          // rawChildrenMap.set(node, prop.exp);
        } else if (prop.name === 'text' && prop.exp) {
          // node.children = [createInterpolation(prop.exp, prop.loc)];
        } else if (prop.name === 'slot') {
          context.onError(createCompilerError(ErrorCodes.X_V_SLOT_MISPLACED, prop.loc));
        } else if (isTextareaWithValue(node, prop) && prop.exp) {
          // if (!needMergeProps) {
          //   node.children = [createInterpolation(prop.exp, prop.loc)];
          // }
        } else if (!needMergeProps && prop.name !== 'on') {
          // Directive transforms.
          const directiveTransform = context.directiveTransforms[prop.name];
          if (directiveTransform) {
            const { props, ssrTagParts } = directiveTransform(
              prop,
              node,
              context,
            );
            if (ssrTagParts) {
              // openTag.push(...ssrTagParts);
            }
            for (let j = 0; j < props.length; j++) {
              const { key, value } = props[j];
              if (isStaticExp(key)) {
                let attrName = key.content;
                // static key attr
                if (attrName === 'key' || attrName === 'ref') {
                  continue;
                }
                if (attrName === 'class') {
                  openTag.push(
                    '"class":"',
                    (dynamicClassBinding = createCallExpression(
                      context.helper(SSR_RENDER_CLASS),
                      [value],
                    )),
                    '",',
                  );
                } else if (attrName === 'style') {
                  if (dynamicStyleBinding) {
                    // already has style binding, merge into it.
                    mergeCall(dynamicStyleBinding, value);
                  } else {
                    openTag.push(
                      '"style":',
                      (dynamicStyleBinding = createCallExpression(
                        context.helper(SSR_RENDER_STYLE),
                        [value],
                      )),
                      ',',
                    );
                  }
                } else {
                  attrName = node.tag.indexOf('-') > 0
                    ? attrName // preserve raw name on custom elements
                    : propsToAttrMap[attrName] ?? attrName.toLowerCase();
                  if (isBooleanAttr(attrName)) {
                    openTag.push(createConditionalExpression(
                      createCallExpression(
                        context.helper(SSR_INCLUDE_BOOLEAN_ATTR),
                        [value],
                      ),
                      createSimpleExpression(` ${attrName}`, true),
                      createSimpleExpression('', true),
                      false /* no newline */,
                    ));
                  } else if (isSSRSafeAttrName(attrName)) {
                    openTag.push(`"${key.content}":`);
                    openTag.push(createCallExpression('JSON.stringify', [value]));
                    openTag.push(',');
                  } else {
                    context.onError(createSSRCompilerError(
                      SSRErrorCodes.X_SSR_UNSAFE_ATTR_NAME,
                      key.loc,
                    ));
                  }
                }
              } else {
                // dynamic key attr
                // this branch is only encountered for custom directive
                // transforms that returns properties with dynamic keys
                const args: CallExpression['arguments'] = [key, value];
                // if (needTagForRuntime) {
                //   args.push(`"${node.tag}"`);
                // }
                openTag.push(createCallExpression(
                  context.helper(SSR_RENDER_DYNAMIC_ATTR),
                  args,
                ));
              }
            }
          }
        }
      } else {
        // special case: value on <textarea>
        // eslint-disable-next-line no-lonely-if
        if (node.tag === 'textarea' && prop.name === 'value' && prop.value) {
          rawChildrenMap.set(node, prop.value.content);
        } else if (!needMergeProps) {
          if (prop.name === 'key' || prop.name === 'ref') {
            continue;
          }
          // static prop
          if (prop.name === 'class' && prop.value) {
            staticClassBinding = JSON.stringify(prop.value.content);
          }

          openTag.push(`"${prop.name}":${
            prop.value ? `"${prop.value.content}",` : '"",'
          }`);
        }
      }
    }

    // handle co-existence of dynamic + static class bindings
    if (dynamicClassBinding && staticClassBinding) {
      // convert hippy style, static class insert to style props. dynamic class generate getStyle function
      mergeCall(dynamicClassBinding, staticClassBinding);
      removeStaticBinding(openTag, 'class');
    }
    // span/label/p/a, these tags are text node in native, so the value store in text props
    if (isTextTag(node.tag)) {
      const textChild = node.children.filter(item => item.type === NodeTypes.TEXT
        || item.type === NodeTypes.INTERPOLATION);
      if (textChild.length) {
        // 2(NodeTypes.TEXT),5(NodeTypes.INTERPOLATION) 2 and 5 are text node, store value in text props
        openTag.push('"text":"');
        textChild.forEach((child) => {
          if (child.type === 2 /* NodeTypes.TEXT */) {
            openTag.push(child.content);
          }
          if (child.type === 5 /* NodeTypes.INTERPOLATION */) {
            openTag.push(createCallExpression(context.helper(SSR_INTERPOLATE), [
              child.content,
            ]));
          }
        });
        openTag.push('",');
      }
    }

    if (context.scopeId) {
      // hippy scopeId just set props, like <div data-v-sdkfj12="" />
      openTag.push(`"${context.scopeId}":""`);
      openTag.push(',');
    }

    openTag.push('},');
    node.ssrCodegenNode = createTemplateLiteral(openTag);
  };
};

export function buildSSRProps(
  props: PropsExpression | undefined,
  directives: DirectiveNode[],
  context: TransformContext,
): JSChildNode {
  let mergePropsArgs: JSChildNode[] = [];
  if (props) {
    if (props.type === NodeTypes.JS_CALL_EXPRESSION) {
      // already a mergeProps call
      mergePropsArgs = props.arguments as JSChildNode[];
    } else {
      mergePropsArgs.push(props);
    }
  }
  if (directives.length) {
    for (const dir of directives) {
      mergePropsArgs.push(createCallExpression(context.helper(SSR_GET_DIRECTIVE_PROPS), [
        '_ctx',
        ...buildDirectiveArgs(dir, context).elements,
      ] as JSChildNode[]));
    }
  }

  return mergePropsArgs.length > 1
    ? createCallExpression(context.helper(MERGE_PROPS), mergePropsArgs)
    : mergePropsArgs[0];
}

function isTrueFalseValue(prop: DirectiveNode | AttributeNode) {
  if (prop.type === NodeTypes.DIRECTIVE) {
    return (
      prop.name === 'bind'
      && prop.arg
      && isStaticExp(prop.arg)
      && (prop.arg.content === 'true-value' || prop.arg.content === 'false-value')
    );
  }
  return prop.name === 'true-value' || prop.name === 'false-value';
}

function isTextareaWithValue(
  node: PlainElementNode,
  prop: DirectiveNode,
): boolean {
  return Boolean(node.tag === 'textarea'
    && prop.name === 'bind'
    && isStaticArgOf(prop.arg, 'value'));
}

function mergeCall(call: CallExpression, arg: string | JSChildNode) {
  const existing = call.arguments[0] as ExpressionNode | ArrayExpression;
  if (existing.type === NodeTypes.JS_ARRAY_EXPRESSION) {
    existing.elements.push(arg);
  } else {
    call.arguments[0] = createArrayExpression([existing, arg]);
  }
}

function removeStaticBinding(
  tag: TemplateLiteral['elements'],
  binding: string,
) {
  const regExp = new RegExp(`"${binding}":".*",$`);

  const i = tag.findIndex(e => typeof e === 'string' && regExp.test(e));

  if (i > -1) {
    tag.splice(i, 1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findVModel(node: PlainElementNode): DirectiveNode | undefined {
  return node.props.find(p => p.type === NodeTypes.DIRECTIVE && p.name === 'model' && p.exp) as DirectiveNode | undefined;
}

export function ssrProcessElement(
  node: PlainElementNode,
  context: SSRTransformContext,
): void {
  const elementsToAdd = node.ssrCodegenNode!.elements;
  for (let j = 0; j < elementsToAdd.length; j++) {
    context.pushStringPart(elementsToAdd[j]);
  }

  // Handle slot scopeId
  if (context.withSlotScopeId) {
    context.pushStringPart(createSimpleExpression('_scopeId', false));
  }

  // hippy children open tag
  context.pushStringPart('"children":[');

  const rawChildren = rawChildrenMap.get(node);
  if (rawChildren) {
    context.pushStringPart(rawChildren);
  } else if (node.children.length) {
    processChildren(node, context);
  }

  // closing tag
  context.pushStringPart(']},');
}
