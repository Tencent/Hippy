import * as TextUtils from '../../models/text_utils/text_utils.js';
import type * as Protocol from '../../generated/protocol.js';
import type { CSSModel, Edit } from './CSSModel.js';
import { CSSProperty } from './CSSProperty.js';
import type { CSSRule } from './CSSRule.js';
import type { Target } from './Target.js';
export declare class CSSStyleDeclaration {
    _cssModel: CSSModel;
    parentRule: CSSRule | null;
    _allProperties: CSSProperty[];
    styleSheetId: string | undefined;
    range: TextUtils.TextRange.TextRange | null;
    cssText: string | undefined;
    _shorthandValues: Map<string, string>;
    _shorthandIsImportant: Set<string>;
    _activePropertyMap: Map<string, CSSProperty>;
    _leadingProperties: CSSProperty[] | null;
    type: Type;
    constructor(cssModel: CSSModel, parentRule: CSSRule | null, payload: Protocol.CSS.CSSStyle, type: Type);
    rebase(edit: Edit): void;
    _reinitialize(payload: Protocol.CSS.CSSStyle): void;
    _generateSyntheticPropertiesIfNeeded(): void;
    _computeLeadingProperties(): CSSProperty[];
    leadingProperties(): CSSProperty[];
    target(): Target;
    cssModel(): CSSModel;
    _computeInactiveProperties(): void;
    allProperties(): CSSProperty[];
    getPropertyValue(name: string): string;
    isPropertyImplicit(name: string): boolean;
    longhandProperties(name: string): CSSProperty[];
    propertyAt(index: number): CSSProperty | null;
    pastLastSourcePropertyIndex(): number;
    _insertionRange(index: number): TextUtils.TextRange.TextRange;
    newBlankProperty(index?: number): CSSProperty;
    setText(text: string, majorChange: boolean): Promise<boolean>;
    insertPropertyAt(index: number, name: string, value: string, userCallback?: ((arg0: boolean) => void)): void;
    appendProperty(name: string, value: string, userCallback?: ((arg0: boolean) => void)): void;
}
export declare enum Type {
    Regular = "Regular",
    Inline = "Inline",
    Attributes = "Attributes"
}
