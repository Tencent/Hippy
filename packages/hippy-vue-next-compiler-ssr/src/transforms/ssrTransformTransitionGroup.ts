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
