export declare function getRemoteBase(location?: string): {
    base: string;
    version: string;
} | null;
export declare const mappingForLayoutTests: Map<string, string>;
export declare class Runtime {
    _modules: Module[];
    _modulesMap: {
        [x: string]: Module;
    };
    _descriptorsMap: {
        [x: string]: ModuleDescriptor;
    };
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
        moduleDescriptors: Array<ModuleDescriptor> | null;
    } | undefined): Runtime;
    static removeInstance(): void;
    /**
     * http://tools.ietf.org/html/rfc3986#section-5.2.4
     */
    static normalizePath(path: string): string;
    static queryParam(name: string): string | null;
    static _experimentsSetting(): {
        [x: string]: boolean;
    };
    static _assert(value: any, message: string): void;
    static setPlatform(platform: string): void;
    static platform(): string;
    static isDescriptorEnabled(descriptor: {
        experiment: ((string | undefined) | null);
        condition: ((string | undefined) | null);
    }): boolean;
    static resolveSourceURL(path: string): string;
    module(moduleName: string): Module;
    _registerModule(descriptor: ModuleDescriptor): void;
    loadModulePromise(moduleName: string): Promise<boolean>;
    loadAutoStartModules(moduleNames: string[]): Promise<boolean[]>;
}
export declare class ModuleDescriptor {
    name: string;
    dependencies: string[] | undefined;
    modules: string[];
    resources: string[];
    condition: string | undefined;
    experiment: string | null;
    constructor();
}
export interface Option {
    title: string;
    value: string | boolean;
    raw?: boolean;
    text?: string;
}
export declare class Module {
    _manager: Runtime;
    _descriptor: ModuleDescriptor;
    _name: string;
    _loadedForTest: boolean;
    _pendingLoadPromise?: Promise<boolean>;
    constructor(manager: Runtime, descriptor: ModuleDescriptor);
    name(): string;
    enabled(): boolean;
    resource(name: string): string;
    _loadPromise(): Promise<boolean>;
    _loadModules(): Promise<void>;
    _modularizeURL(resourceName: string): string;
    fetchResource(resourceName: string): Promise<string>;
    substituteURL(value: string): string;
}
export declare class ExperimentsSupport {
    _experiments: Experiment[];
    _experimentNames: Set<string>;
    _enabledTransiently: Set<string>;
    _enabledByDefault: Set<string>;
    _serverEnabled: Set<string>;
    constructor();
    allConfigurableExperiments(): Experiment[];
    enabledExperiments(): Experiment[];
    _setExperimentsSetting(value: Object): void;
    register(experimentName: string, experimentTitle: string, unstable?: boolean): void;
    isEnabled(experimentName: string): boolean;
    setEnabled(experimentName: string, enabled: boolean): void;
    enableExperimentsTransiently(experimentNames: string[]): void;
    enableExperimentsByDefault(experimentNames: string[]): void;
    setServerEnabledExperiments(experimentNames: string[]): void;
    enableForTest(experimentName: string): void;
    clearForTest(): void;
    cleanUpStaleExperiments(): void;
    _checkExperiment(experimentName: string): void;
}
export declare class Experiment {
    name: string;
    title: string;
    unstable: boolean;
    _experiments: ExperimentsSupport;
    constructor(experiments: ExperimentsSupport, name: string, title: string, unstable: boolean);
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
}
export declare function loadResourcePromise(url: string): Promise<string>;
export declare const experiments: ExperimentsSupport;
export declare const cachedResources: Map<string, string>;
export declare let appStartedPromiseCallback: () => void;
export declare const appStarted: Promise<void>;
export declare enum ExperimentName {
    CAPTURE_NODE_CREATION_STACKS = "captureNodeCreationStacks",
    CSS_OVERVIEW = "cssOverview",
    LIVE_HEAP_PROFILE = "liveHeapProfile",
    DEVELOPER_RESOURCES_VIEW = "developerResourcesView",
    TIMELINE_REPLAY_EVENT = "timelineReplayEvent",
    CSP_VIOLATIONS_VIEW = "cspViolationsView",
    WASM_DWARF_DEBUGGING = "wasmDWARFDebugging",
    ALL = "*",
    PROTOCOL_MONITOR = "protocolMonitor",
    WEBAUTHN_PANE = "webauthnPane",
    RECORDER = "recorder",
    LOCALIZED_DEVTOOLS = "localizedDevTools"
}
export declare enum ConditionName {
    CAN_DOCK = "can_dock",
    NOT_SOURCES_HIDE_ADD_FOLDER = "!sources.hide_add_folder"
}
