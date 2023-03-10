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
  type SourceLocation,
  type CompilerError,
  createCompilerError,
  DOMErrorCodes,
} from '@vue/compiler-dom';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface SSRCompilerError extends CompilerError {
  code: SSRErrorCodes;
}

export function createSSRCompilerError(
  code: SSRErrorCodes,
  loc?: SourceLocation,
): SSRCompilerError {
  return createCompilerError(code, loc, SSRErrorMessages) as SSRCompilerError;
}

export const enum SSRErrorCodes {
  // eslint-disable-next-line @typescript-eslint/prefer-literal-enum-member
  X_SSR_UNSAFE_ATTR_NAME = DOMErrorCodes.__EXTEND_POINT__,
  X_SSR_NO_TELEPORT_TARGET,
  X_SSR_INVALID_AST_NODE,
}

export const SSRErrorMessages: { [code: number]: string } = {
  [SSRErrorCodes.X_SSR_UNSAFE_ATTR_NAME]: 'Unsafe attribute name for SSR.',
  [SSRErrorCodes.X_SSR_NO_TELEPORT_TARGET]:
    'Missing the \'to\' prop on teleport element.',
  [SSRErrorCodes.X_SSR_INVALID_AST_NODE]:
    'Invalid AST node during SSR transform.',
};
