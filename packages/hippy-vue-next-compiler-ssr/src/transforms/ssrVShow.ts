import {
  type DirectiveTransform,
  DOMErrorCodes,
  createObjectProperty,
  createSimpleExpression,
  createConditionalExpression,
  createObjectExpression,
  createDOMCompilerError,
} from '@vue/compiler-dom';

export const ssrTransformShow: DirectiveTransform = (dir, node, context) => {
  if (!dir.exp) {
    context.onError(createDOMCompilerError(DOMErrorCodes.X_V_SHOW_NO_EXPRESSION));
  }
  return {
    props: [
      createObjectProperty(
        'style',
        createConditionalExpression(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          dir.exp!,
          createSimpleExpression('null', false),
          createObjectExpression([
            createObjectProperty(
              'display',
              createSimpleExpression('none', true),
            ),
          ]),
          false /* no newline */,
        ),
      ),
    ],
  };
};
