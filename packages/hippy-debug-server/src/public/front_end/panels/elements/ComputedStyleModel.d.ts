import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
export declare class ComputedStyleModel extends Common.ObjectWrapper.ObjectWrapper {
    _node: SDK.DOMModel.DOMNode | null;
    _cssModel: SDK.CSSModel.CSSModel | null;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    _frameResizedTimer?: number;
    _computedStylePromise?: Promise<ComputedStyle | null>;
    constructor();
    node(): SDK.DOMModel.DOMNode | null;
    cssModel(): SDK.CSSModel.CSSModel | null;
    _onNodeChanged(event: Common.EventTarget.EventTargetEvent): void;
    _updateModel(cssModel: SDK.CSSModel.CSSModel | null): void;
    _onComputedStyleChanged(event: Common.EventTarget.EventTargetEvent | null): void;
    _onDOMModelChanged(event: Common.EventTarget.EventTargetEvent): void;
    _onFrameResized(_event: Common.EventTarget.EventTargetEvent): void;
    _elementNode(): SDK.DOMModel.DOMNode | null;
    fetchComputedStyle(): Promise<ComputedStyle | null>;
}
export declare const enum Events {
    ComputedStyleChanged = "ComputedStyleChanged"
}
export declare class ComputedStyle {
    node: SDK.DOMModel.DOMNode;
    computedStyle: Map<string, string>;
    constructor(node: SDK.DOMModel.DOMNode, computedStyle: Map<string, string>);
}
