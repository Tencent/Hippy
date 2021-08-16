import type * as SDK from '../../core/sdk/sdk.js';
import { StylePropertyTreeElement } from './StylePropertyTreeElement.js';
import type { StylePropertiesSection, StylesSidebarPane } from './StylesSidebarPane.js';
export declare class StylePropertyHighlighter {
    _styleSidebarPane: StylesSidebarPane;
    constructor(ssp: StylesSidebarPane);
    /**
     * Expand all shorthands, find the given property, scroll to it and highlight it.
     */
    highlightProperty(cssProperty: SDK.CSSProperty.CSSProperty): void;
    /**
     * Find the first non-overridden property that matches the provided name, scroll to it and highlight it.
     */
    findAndHighlightPropertyName(propertyName: string): void;
    /**
     * Traverse the styles pane tree, execute the provided callback for every tree element found, and
     * return the first tree element and corresponding section for which the callback returns a truthy value.
     */
    _findTreeElementAndSection(compareCb: (arg0: StylePropertyTreeElement) => boolean): {
        treeElement: StylePropertyTreeElement | null;
        section: StylePropertiesSection | null;
    };
    _scrollAndHighlightTreeElement(treeElement: StylePropertyTreeElement): void;
}
