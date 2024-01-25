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
