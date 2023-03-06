/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  type NodeTransform,
  NodeTypes,
  ElementTypes,
  locStub,
  createSimpleExpression,
  type RootNode,
  type TemplateChildNode,
  findDir,
  isBuiltInType,
} from '@vue/compiler-dom';

export const ssrInjectCssVars: NodeTransform = (node, context) => {
  if (!context.ssrCssVars) {
    return;
  }

  // _cssVars is initialized once per render function
  // the code is injected in ssrCodegenTransform when creating the
  // ssr transform context
  if (node.type === NodeTypes.ROOT) {
    // eslint-disable-next-line no-param-reassign
    context.identifiers._cssVars = 1;
  }

  const { parent } = context;
  if (!parent || parent.type !== NodeTypes.ROOT) {
    return;
  }

  if (node.type === NodeTypes.IF_BRANCH) {
    for (const child of node.children) {
      injectCssVars(child);
    }
  } else {
    injectCssVars(node);
  }
};

function injectCssVars(node: RootNode | TemplateChildNode) {
  if (
    node.type === NodeTypes.ELEMENT
    && (node.tagType === ElementTypes.ELEMENT
      || node.tagType === ElementTypes.COMPONENT)
    && !findDir(node, 'for')
  ) {
    if (isBuiltInType(node.tag, 'Suspense')) {
      for (const child of node.children) {
        if (
          child.type === NodeTypes.ELEMENT
          && child.tagType === ElementTypes.TEMPLATE
        ) {
          // suspense slot
          child.children.forEach(injectCssVars);
        } else {
          injectCssVars(child);
        }
      }
    } else {
      node.props.push({
        type: NodeTypes.DIRECTIVE,
        name: 'bind',
        arg: undefined,
        exp: createSimpleExpression('_cssVars', false),
        modifiers: [],
        loc: locStub,
      });
    }
  }
}
