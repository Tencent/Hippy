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
/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  type Property,
  type TemplateLiteral,
  type DirectiveTransform,
  ElementTypes,
  transformModel,
  findProp,
  NodeTypes,
  createDOMCompilerError,
  DOMErrorCodes,
  createObjectProperty,
  createSimpleExpression,
  createCallExpression,
  type PlainElementNode,
  type ExpressionNode,
  createConditionalExpression,
  createInterpolation,
  hasDynamicKeyVBind,
} from '@vue/compiler-dom';

import {
  SSR_LOOSE_EQUAL,
  SSR_LOOSE_CONTAIN,
  SSR_RENDER_DYNAMIC_MODEL,
} from '../runtimeHelpers';
// import { DirectiveTransformResult } from 'packages/compiler-core/src/transform'

export interface DirectiveTransformResult {
  props: Property[];
  needRuntime?: boolean | symbol;
  ssrTagParts?: TemplateLiteral['elements'];
}

// eslint-disable-next-line complexity
export const ssrTransformModel: DirectiveTransform = (dir, node, context) => {
  const model = dir.exp!;

  function checkDuplicatedValue() {
    const value = findProp(node, 'value');
    if (value) {
      context.onError(createDOMCompilerError(
        DOMErrorCodes.X_V_MODEL_UNNECESSARY_VALUE,
        value.loc,
      ));
    }
  }

  if (node.tagType === ElementTypes.ELEMENT) {
    const res: DirectiveTransformResult = { props: [] };
    const defaultProps = [
      // default value binding for text type inputs
      createObjectProperty('value', model),
    ];
    if (node.tag === 'input') {
      const type = findProp(node, 'type');
      if (type) {
        const value = findValueBinding(node);
        if (type.type === NodeTypes.DIRECTIVE) {
          // dynamic type
          res.ssrTagParts = [
            createCallExpression(context.helper(SSR_RENDER_DYNAMIC_MODEL), [
              type.exp!,
              model,
              value,
            ]),
          ];
        } else if (type.value) {
          // static type
          switch (type.value.content) {
            case 'radio':
              res.props = [
                createObjectProperty(
                  'checked',
                  createCallExpression(context.helper(SSR_LOOSE_EQUAL), [
                    model,
                    value,
                  ]),
                ),
              ];
              break;
            case 'checkbox':
              // eslint-disable-next-line no-case-declarations
              const trueValueBinding = findProp(node, 'true-value');
              if (trueValueBinding) {
                const trueValue =                  trueValueBinding.type === NodeTypes.ATTRIBUTE
                  ? JSON.stringify(trueValueBinding.value!.content)
                  : trueValueBinding.exp!;
                res.props = [
                  createObjectProperty(
                    'checked',
                    createCallExpression(context.helper(SSR_LOOSE_EQUAL), [
                      model,
                      trueValue,
                    ]),
                  ),
                ];
              } else {
                res.props = [
                  createObjectProperty(
                    'checked',
                    createConditionalExpression(
                      createCallExpression('Array.isArray', [model]),
                      createCallExpression(context.helper(SSR_LOOSE_CONTAIN), [
                        model,
                        value,
                      ]),
                      model,
                    ),
                  ),
                ];
              }
              break;
            case 'file':
              context.onError(createDOMCompilerError(
                DOMErrorCodes.X_V_MODEL_ON_FILE_INPUT_ELEMENT,
                dir.loc,
              ));
              break;
            default:
              checkDuplicatedValue();
              res.props = defaultProps;
              break;
          }
        }
      } else if (hasDynamicKeyVBind(node)) {
        // dynamic type due to dynamic v-bind
        // NOOP, handled in ssrTransformElement due to need to rewrite
        // the entire props expression
      } else {
        // text type
        checkDuplicatedValue();
        res.props = defaultProps;
      }
    } else if (node.tag === 'textarea') {
      checkDuplicatedValue();
      // eslint-disable-next-line no-param-reassign
      node.children = [createInterpolation(model, model.loc)];
    } else if (node.tag === 'select') {
      // NOOP
      // select relies on client-side directive to set initial selected state.
    } else {
      context.onError(createDOMCompilerError(
        DOMErrorCodes.X_V_MODEL_ON_INVALID_ELEMENT,
        dir.loc,
      ));
    }

    return res;
  }
  // component v-model
  return transformModel(dir, node, context);
};

function findValueBinding(node: PlainElementNode): ExpressionNode {
  const valueBinding = findProp(node, 'value');
  // eslint-disable-next-line no-nested-ternary
  return valueBinding
    ? valueBinding.type === NodeTypes.DIRECTIVE
      ? valueBinding.exp!
      : createSimpleExpression(valueBinding.value!.content, true)
    : createSimpleExpression('null', false);
}
