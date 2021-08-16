// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Platform from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as UI from '../../legacy.js';
import { RemoteObjectPreviewFormatter } from './RemoteObjectPreviewFormatter.js';
export class JavaScriptREPL {
    static wrapObjectLiteral(code) {
        // Only parenthesize what appears to be an object literal.
        if (!(/^\s*\{/.test(code) && /\}\s*$/.test(code))) {
            return code;
        }
        const parse = (async () => 0).constructor;
        try {
            // Check if the code can be interpreted as an expression.
            parse('return ' + code + ';');
            // No syntax error! Does it work parenthesized?
            const wrappedCode = '(' + code + ')';
            parse(wrappedCode);
            return wrappedCode;
        }
        catch (e) {
            return code;
        }
    }
    static preprocessExpression(text) {
        return JavaScriptREPL.wrapObjectLiteral(text);
    }
    static async evaluateAndBuildPreview(text, throwOnSideEffect, timeout, allowErrors, objectGroup) {
        const executionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
        const isTextLong = text.length > maxLengthForEvaluation;
        if (!text || !executionContext || (throwOnSideEffect && isTextLong)) {
            return { preview: document.createDocumentFragment(), result: null };
        }
        const expression = JavaScriptREPL.preprocessExpression(text);
        const options = {
            expression: expression,
            generatePreview: true,
            includeCommandLineAPI: true,
            throwOnSideEffect: throwOnSideEffect,
            timeout: timeout,
            objectGroup: objectGroup,
            disableBreaks: true,
            replMode: true,
            silent: undefined,
            returnByValue: undefined,
            allowUnsafeEvalBlockedByCSP: undefined,
        };
        const result = await executionContext.evaluate(options, false /* userGesture */, false /* awaitPromise */);
        const preview = JavaScriptREPL._buildEvaluationPreview(result, allowErrors);
        return { preview, result };
    }
    static _buildEvaluationPreview(result, allowErrors) {
        const fragment = document.createDocumentFragment();
        if ('error' in result) {
            return fragment;
        }
        if (result.exceptionDetails && result.exceptionDetails.exception && result.exceptionDetails.exception.description) {
            const exception = result.exceptionDetails.exception.description;
            if (exception.startsWith('TypeError: ') || allowErrors) {
                fragment.createChild('span').textContent = result.exceptionDetails.text + ' ' + exception;
            }
            return fragment;
        }
        const formatter = new RemoteObjectPreviewFormatter();
        const { preview, type, subtype, className, description } = result.object;
        if (preview && type === 'object' && subtype !== 'node' && subtype !== 'trustedtype') {
            formatter.appendObjectPreview(fragment, preview, false /* isEntry */);
        }
        else {
            const nonObjectPreview = formatter.renderPropertyPreview(type, subtype, className, Platform.StringUtilities.trimEndWithMaxLength(description || '', 400));
            fragment.appendChild(nonObjectPreview);
        }
        return fragment;
    }
}
let maxLengthForEvaluation = 2000;
export function setMaxLengthForEvaluation(value) {
    maxLengthForEvaluation = value;
}
export function getMaxLengthForEvaluation() {
    return maxLengthForEvaluation;
}
//# sourceMappingURL=JavaScriptREPL.js.map