import type * as Platform from '../../../core/platform/platform.js';
import { AdornerCategories } from './AdornerManager.js';
export interface AdornerDefinition {
    name: string;
    category: AdornerCategories;
}
export interface AdornerData extends AdornerDefinition {
    content: HTMLElement;
}
export declare class Adorner extends HTMLElement {
    name: string;
    category: AdornerCategories;
    private readonly shadow;
    private isToggle;
    private ariaLabelDefault?;
    private ariaLabelActive?;
    set data(data: AdornerData);
    connectedCallback(): void;
    isActive(): boolean;
    /**
     * Toggle the active state of the adorner. Optionally pass `true` to force-set
     * an active state; pass `false` to force-set an inactive state.
     */
    toggle(forceActiveState?: boolean): void;
    show(): void;
    hide(): void;
    /**
     * Make adorner interactive by responding to click events with the provided action
     * and simulating ARIA-capable toggle button behavior.
     */
    addInteraction(action: EventListener, options: {
        ariaLabelDefault: Platform.UIString.LocalizedString;
        ariaLabelActive: Platform.UIString.LocalizedString;
        isToggle?: boolean;
        shouldPropagateOnKeydown?: boolean;
    }): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-adorner': Adorner;
    }
}
