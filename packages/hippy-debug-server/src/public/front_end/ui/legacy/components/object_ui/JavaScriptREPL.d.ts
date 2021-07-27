import * as SDK from '../../../../core/sdk/sdk.js';
export declare class JavaScriptREPL {
    static wrapObjectLiteral(code: string): string;
    static preprocessExpression(text: string): string;
    static evaluateAndBuildPreview(text: string, throwOnSideEffect: boolean, timeout?: number, allowErrors?: boolean, objectGroup?: string): Promise<{
        preview: DocumentFragment;
        result: SDK.RuntimeModel.EvaluationResult | null;
    }>;
    static _buildEvaluationPreview(result: SDK.RuntimeModel.EvaluationResult, allowErrors?: boolean): DocumentFragment;
}
export declare function setMaxLengthForEvaluation(value: number): void;
export declare function getMaxLengthForEvaluation(): number;
