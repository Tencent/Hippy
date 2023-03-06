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
  escapeHtml,
  isBooleanAttr,
  isBuiltInDirective,
  isSSRSafeAttrName,
  propsToAttrMap,
} from '@vue/shared';

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

function getHippyTagName(tag: string): string {
  const NATIVE_COMPONENT_MAP = {
    View: 'View',
    Image: 'Image',
    ListView: 'ListView',
    ListViewItem: 'ListViewItem',
    Text: 'Text',
    TextInput: 'TextInput',
    WebView: 'WebView',
    VideoPlayer: 'VideoPlayer',
    // Native内置组件，与View组件属性方法基本一致，仅名称不同
    ScrollView: 'ScrollView',
    Swiper: 'ViewPager',
    SwiperSlide: 'ViewPagerItem',
    PullHeaderView: 'PullHeaderView',
    PullFooterView: 'PullFooterView',
  };
  switch (tag) {
    case 'div':
    case 'button':
    case 'form':
      return NATIVE_COMPONENT_MAP.View;
    case 'img':
      return NATIVE_COMPONENT_MAP.Image;
    case 'ul':
      return NATIVE_COMPONENT_MAP.ListView;
    case 'li':
      return NATIVE_COMPONENT_MAP.ListViewItem;
    case 'span':
    case 'label':
    case 'p':
    case 'a':
      return NATIVE_COMPONENT_MAP.Text;
    case 'textarea':
    case 'input':
      return NATIVE_COMPONENT_MAP.TextInput;
    case 'iframe':
      return NATIVE_COMPONENT_MAP.WebView;
    case 'swiper':
      return NATIVE_COMPONENT_MAP.Swiper;
    case 'swiper-slide':
      return NATIVE_COMPONENT_MAP.SwiperSlide;
    case 'pull-header':
      return NATIVE_COMPONENT_MAP.PullHeaderView;
    case 'pull-footer':
      return NATIVE_COMPONENT_MAP.PullFooterView;
    default:
      return tag;
  }
}
function praseHippyNativeComponentTagName(tagName: string): string {
  switch (tagName) {
    case 'pull-header':
      return 'hi-pull-header';
    case 'pull-footer':
      return 'hi-pull-footer';
    case 'swiper':
      return 'hi-swiper';
    default:
      return tagName;
  }
}

function getHippyEventKeyInSSR(event: string, tagName: string) {
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

  // eslint-disable-next-line
  return function ssrPostTransformElement() {
    const openTag: TemplateLiteral['elements'] = ['{"id":'];
    // 生成hippyId的函数
    openTag.push(createCallExpression(context.helper(SSR_GET_UNIQUEID), []));
    openTag.push(`,"index":0,"name":"${getHippyTagName(node.tag)}","tagName":"${praseHippyNativeComponentTagName(node.tag)}","props":{`);

    // v-bind="obj", v-bind:[key] and custom directives can potentially
    // overwrite other static attrs and can affect final rendering result,
    // so when they are present we need to bail out to full `renderAttrs`
    const hasDynamicVBind = hasDynamicKeyVBind(node);
    const hasCustomDir = node.props.some(p => p.type === NodeTypes.DIRECTIVE && !isBuiltInDirective(p.name));
    const needMergeProps = hasDynamicVBind || hasCustomDir;

    // hippy图片属性,安卓使用src=imgUrl,iOS使用source=[{"uri": imgUrl}]
    // numberOfRows will makes Image flicker on Android, 只能在ios使用

    // hippy所有属性(除id和class)都会存放在props中,另外方便调试,会存一份到attributes中
    // 需要生成的hippy mergedProps对象, 运行时再合并到props对象中
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

    // book keeping static/dynamic class merging.
    let dynamicClassBinding: CallExpression | undefined = undefined;
    let staticClassBinding: string | undefined = undefined;
    // all style bindings are converted to dynamic by transformStyle.
    // but we need to make sure to merge them.
    let dynamicStyleBinding: CallExpression | undefined = undefined;

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < node.props.length; i++) {
      const prop = node.props[i];
      // ignore true-value/false-value on input
      if (node.tag === 'input' && isTrueFalseValue(prop)) {
        continue;
      }
      // special cases with children override
      if (prop.type === NodeTypes.DIRECTIVE) {
        // hippy事件处理逻辑: ssr场景 on指令会直接忽略, 所以hippy需要自己处理
        if (prop.name === 'on') {
          const { arg } = prop;
          if (arg?.type === NodeTypes.SIMPLE_EXPRESSION && arg.isStatic) {
            openTag.push(`"${getHippyEventKeyInSSR(arg.content, node.tag)}": true,`);
          }
        } else if (prop.name === 'html' && prop.exp) {
          // v-html/v-text/v-textarea/ hippy不支持,不处理
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
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
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
                  attrName =                    node.tag.indexOf('-') > 0
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
          rawChildrenMap.set(node, escapeHtml(prop.value.content));
        } else if (!needMergeProps) {
          if (prop.name === 'key' || prop.name === 'ref') {
            continue;
          }
          // static prop
          if (prop.name === 'class' && prop.value) {
            staticClassBinding = JSON.stringify(prop.value.content);
          }

          openTag.push(`"${prop.name}":${
            prop.value ? `"${escapeHtml(prop.value.content)}",` : '"",'
          }`);
        }
      }
    }

    // handle co-existence of dynamic + static class bindings
    if (dynamicClassBinding && staticClassBinding) {
      mergeCall(dynamicClassBinding, staticClassBinding);
      removeStaticBinding(openTag, 'class');
    }

    // 转换hippy样式，静态class直接生成到style属性中，动态class生成getStyle函数
    // span/label/p,这三个在native都是text节点,有值直接设置成text属性
    if (node.tag === 'span' || node.tag === 'p' || node.tag === 'label') {
      const textChild = node.children.filter(item => item.type === NodeTypes.TEXT
        || item.type === NodeTypes.INTERPOLATION);
      if (textChild.length) {
        // 2(NodeTypes.TEXT),5(NodeTypes.INTERPOLATION) 这两种节点为text，直接设置在当前dom中
        openTag.push('"text":"');
        // 2(NodeTypes.TEXT),5(NodeTypes.INTERPOLATION) 这两种节点为text，直接设置在当前dom中
        textChild.forEach((child) => {
          if (child.type === 2 /* NodeTypes.TEXT */) {
            openTag.push(escapeHtml(child.content));
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
  return !!(
    node.tag === 'textarea'
    && prop.name === 'bind'
    && isStaticArgOf(prop.arg, 'value')
  );
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
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let j = 0; j < elementsToAdd.length; j++) {
    context.pushStringPart(elementsToAdd[j]);
  }

  // hippy暂不支持slot
  // Handle slot scopeId
  // if (context.withSlotScopeId) {
  //   context.pushStringPart(createSimpleExpression(`_scopeId`, false));
  // }

  // hippy树形结构，生成子节点
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
