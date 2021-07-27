import * as Common from '../../core/common/common.js';
import type * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import { Context } from './Context.js';
export interface ActionDelegate {
    handleAction(_context: Context, _actionId: string): boolean;
}
export declare class Action extends Common.ObjectWrapper.ObjectWrapper {
    _enabled: boolean;
    _toggled: boolean;
    private actionRegistration;
    constructor(actionRegistration: ActionRegistration);
    id(): string;
    execute(): Promise<boolean>;
    icon(): string | undefined;
    toggledIcon(): string | undefined;
    toggleWithRedColor(): boolean;
    setEnabled(enabled: boolean): void;
    enabled(): boolean;
    category(): string;
    tags(): string | void;
    toggleable(): boolean;
    title(): string;
    toggled(): boolean;
    setToggled(toggled: boolean): void;
    options(): undefined | Array<ExtensionOption>;
    contextTypes(): undefined | Array<unknown>;
    canInstantiate(): boolean;
    bindings(): Array<Binding> | undefined;
    experiment(): string | undefined;
    condition(): string | undefined;
    order(): number | undefined;
}
export declare function registerActionExtension(registration: ActionRegistration): void;
export declare function getRegisteredActionExtensions(): Array<Action>;
export declare function maybeRemoveActionExtension(actionId: string): boolean;
export declare const enum Platforms {
    All = "All platforms",
    Mac = "mac",
    WindowsLinux = "windows,linux",
    Android = "Android",
    Windows = "windows"
}
export declare const Events: {
    Enabled: symbol;
    Toggled: symbol;
};
export declare const ActionCategory: {
    ELEMENTS: string;
    SCREENSHOT: string;
    NETWORK: string;
    MEMORY: string;
    JAVASCRIPT_PROFILER: string;
    CONSOLE: string;
    PERFORMANCE: string;
    MOBILE: string;
    SENSORS: string;
    HELP: string;
    INPUTS: string;
    LAYERS: string;
    NAVIGATION: string;
    DRAWER: string;
    GLOBAL: string;
    RESOURCES: string;
    BACKGROUND_SERVICES: string;
    SETTINGS: string;
    DEBUGGER: string;
    RECORDER: string;
    SOURCES: string;
};
declare type ActionCategory = typeof ActionCategory[keyof typeof ActionCategory];
export declare const enum IconClass {
    LARGEICON_NODE_SEARCH = "largeicon-node-search",
    LARGEICON_START_RECORDING = "largeicon-start-recording",
    LARGEICON_STOP_RECORDING = "largeicon-stop-recording",
    LARGEICON_REFRESH = "largeicon-refresh",
    LARGEICON_CLEAR = "largeicon-clear",
    LARGEICON_VISIBILITY = "largeicon-visibility",
    LARGEICON_PHONE = "largeicon-phone",
    LARGEICON_PLAY = "largeicon-play",
    LARGEICON_DOWNLOAD = "largeicon-download",
    LARGEICON_PAUSE = "largeicon-pause",
    LARGEICON_RESUME = "largeicon-resume",
    LARGEICON_TRASH_BIN = "largeicon-trash-bin",
    LARGEICON_SETTINGS_GEAR = "largeicon-settings-gear",
    LARGEICON_STEP_OVER = "largeicon-step-over",
    LARGE_ICON_STEP_INTO = "largeicon-step-into",
    LARGE_ICON_STEP = "largeicon-step",
    LARGE_ICON_STEP_OUT = "largeicon-step-out",
    LARGE_ICON_DEACTIVATE_BREAKPOINTS = "largeicon-deactivate-breakpoints",
    LARGE_ICON_ADD = "largeicon-add"
}
export declare const enum KeybindSet {
    DEVTOOLS_DEFAULT = "devToolsDefault",
    VS_CODE = "vsCode"
}
export interface ExtensionOption {
    value: boolean;
    title: () => Platform.UIString.LocalizedString;
    text?: string;
}
export interface Binding {
    platform?: Platforms;
    shortcut: string;
    keybindSets?: Array<KeybindSet>;
}
/**
 * The representation of an action extension to be registered.
 */
export interface ActionRegistration {
    /**
     * The unique id of an Action extension.
     */
    actionId: string;
    /**
     * The category with which the action is displayed in the UI.
     */
    category: ActionCategory;
    /**
     * The title with which the action is displayed in the UI.
     */
    title?: () => Platform.UIString.LocalizedString;
    /**
     * The type of the icon used to trigger the action.
     */
    iconClass?: IconClass;
    /**
     * Whether the style of the icon toggles on interaction.
     */
    toggledIconClass?: IconClass;
    /**
     * Whether the class 'toolbar-toggle-with-red-color' is toggled on the icon on interaction.
     */
    toggleWithRedColor?: boolean;
    /**
     * Words used to find an action in the Command Menu.
     */
    tags?: Array<() => Platform.UIString.LocalizedString>;
    /**
     * Whether the action is toggleable.
     */
    toggleable?: boolean;
    /**
     * Loads the class that handles the action when it is triggered. The common pattern for implementing
     * this function relies on having the module that contains the action’s handler lazily loaded. For example:
     * ```js
     *  let loadedElementsModule;
     *
     *  async function loadElementsModule() {
     *
     *    if (!loadedElementsModule) {
     *      loadedElementsModule = await import('./elements.js');
     *    }
     *    return loadedElementsModule;
     *  }
     *  UI.ActionRegistration.registerActionExtension({
     *   <...>
     *    async loadActionDelegate() {
     *      const Elements = await loadElementsModule();
     *      return Elements.ElementsPanel.ElementsActionDelegate.instance();
     *    },
     *   <...>
     *  });
     * ```
     */
    loadActionDelegate?: () => Promise<ActionDelegate>;
    /**
     * Returns the classes that represent the 'context flavors' under which the action is available for triggering.
     * The context of the application is described in 'flavors' that are usually views added and removed to the context
     * as the user interacts with the application (e.g when the user moves across views). (See UI.Context)
     * When the action is supposed to be available globally, that is, it does not depend on the application to have
     * a specific context, the value of this property should be undefined.
     *
     * Because the method is synchronous, context types should be already loaded when the method is invoked.
     * In the case that an action has context types it depends on, and they haven't been loaded yet, the function should
     * return an empty array. Once the context types have been loaded, the function should return an array with all types
     * that it depends on.
     *
     * The common pattern for implementing this function is relying on having the module with the corresponding context
     * types loaded and stored when the related 'view' extension is loaded asynchronously. As an example:
     *
     * ```js
     * let loadedElementsModule;
     *
     * async function loadElementsModule() {
     *
     *   if (!loadedElementsModule) {
     *     loadedElementsModule = await import('./elements.js');
     *   }
     *   return loadedElementsModule;
     * }
     * function maybeRetrieveContextTypes(getClassCallBack: (elementsModule: typeof Elements) => unknown[]): unknown[] {
     *
     *   if (loadedElementsModule === undefined) {
     *     return [];
     *   }
     *   return getClassCallBack(loadedElementsModule);
     * }
     * UI.ActionRegistration.registerActionExtension({
     *
     *   contextTypes() {
     *     return maybeRetrieveContextTypes(Elements => [Elements.ElementsPanel.ElementsPanel]);
     *   }
     *   <...>
     * });
     * ```
     */
    contextTypes?: () => Array<unknown>;
    /**
     * The descriptions for each of the two states in which a toggleable action can be.
     */
    options?: Array<ExtensionOption>;
    /**
     * The description of the variables (e.g. platform, keys and keybind sets) under which a keyboard shortcut triggers the action.
     * If a keybind must be available on all platforms, its 'platform' property must be undefined. The same applies to keybind sets
     * and the keybindSet property.
     *
     * Keybinds also depend on the context types of their corresponding action, and so they will only be available when such context types
     * are flavors of the current appliaction context.
     */
    bindings?: Array<Binding>;
    /**
     * The name of the experiment an action is associated with. Enabling and disabling the declared
     * experiment will enable and disable the action respectively.
     */
    experiment?: Root.Runtime.ExperimentName;
    /**
     * A condition represented as a string the action's availability depends on. Conditions come
     * from the queryParamsObject defined in Runtime and just as the experiment field, they determine the availability
     * of the setting. A condition can be negated by prepending a ‘!’ to the value of the condition
     * property and in that case the behaviour of the action's availability will be inverted.
     */
    condition?: Root.Runtime.ConditionName;
    /**
     * Used to sort actions when all registered actions are queried.
     */
    order?: number;
}
export {};
