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
