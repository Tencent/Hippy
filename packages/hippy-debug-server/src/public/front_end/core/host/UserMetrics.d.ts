export declare class UserMetrics {
    _panelChangedSinceLaunch: boolean;
    _firedLaunchHistogram: boolean;
    _launchPanelName: string;
    constructor();
    colorFixed(contrastThreshold: string): void;
    panelShown(panelName: string): void;
    /**
     * Fired when a panel is closed (regardless if it exists in the main panel or the drawer)
     */
    panelClosed(panelName: string): void;
    sidebarPaneShown(sidebarPaneName: string): void;
    settingsPanelShown(settingsViewId: string): void;
    actionTaken(action: Action): void;
    panelLoaded(panelName: string, histogramName: string): void;
    setLaunchPanel(panelName: string | null): void;
    keybindSetSettingChanged(keybindSet: string): void;
    keyboardShortcutFired(actionId: string): void;
    issuesPanelOpenedFrom(issueOpener: IssueOpener): void;
    issuesPanelIssueExpanded(issueExpandedCategory: string | undefined): void;
    issuesPanelResourceOpened(issueCategory: string, type: string): void;
    issueCreated(code: string): void;
    dualScreenDeviceEmulated(emulationAction: DualScreenDeviceEmulated): void;
    cssEditorOpened(editorName: string): void;
    experimentEnabledAtLaunch(experimentId: string): void;
    experimentChanged(experimentId: string, isEnabled: boolean): void;
    developerResourceLoaded(developerResourceLoaded: DeveloperResourceLoaded): void;
    developerResourceScheme(developerResourceScheme: DeveloperResourceScheme): void;
    linearMemoryInspectorRevealedFrom(linearMemoryInspectorRevealedFrom: LinearMemoryInspectorRevealedFrom): void;
    linearMemoryInspectorTarget(linearMemoryInspectorTarget: LinearMemoryInspectorTarget): void;
}
export declare enum Action {
    WindowDocked = 1,
    WindowUndocked = 2,
    ScriptsBreakpointSet = 3,
    TimelineStarted = 4,
    ProfilesCPUProfileTaken = 5,
    ProfilesHeapProfileTaken = 6,
    'LegacyAuditsStarted-deprecated' = 7,
    ConsoleEvaluated = 8,
    FileSavedInWorkspace = 9,
    DeviceModeEnabled = 10,
    AnimationsPlaybackRateChanged = 11,
    RevisionApplied = 12,
    FileSystemDirectoryContentReceived = 13,
    StyleRuleEdited = 14,
    CommandEvaluatedInConsolePanel = 15,
    DOMPropertiesExpanded = 16,
    ResizedViewInResponsiveMode = 17,
    TimelinePageReloadStarted = 18,
    ConnectToNodeJSFromFrontend = 19,
    ConnectToNodeJSDirectly = 20,
    CpuThrottlingEnabled = 21,
    CpuProfileNodeFocused = 22,
    CpuProfileNodeExcluded = 23,
    SelectFileFromFilePicker = 24,
    SelectCommandFromCommandMenu = 25,
    ChangeInspectedNodeInElementsPanel = 26,
    StyleRuleCopied = 27,
    CoverageStarted = 28,
    LighthouseStarted = 29,
    LighthouseFinished = 30,
    ShowedThirdPartyBadges = 31,
    LighthouseViewTrace = 32,
    FilmStripStartedRecording = 33,
    CoverageReportFiltered = 34,
    CoverageStartedPerBlock = 35,
    'SettingsOpenedFromGear-deprecated' = 36,
    'SettingsOpenedFromMenu-deprecated' = 37,
    'SettingsOpenedFromCommandMenu-deprecated' = 38,
    TabMovedToDrawer = 39,
    TabMovedToMainPanel = 40,
    CaptureCssOverviewClicked = 41,
    VirtualAuthenticatorEnvironmentEnabled = 42,
    SourceOrderViewActivated = 43,
    UserShortcutAdded = 44,
    ShortcutRemoved = 45,
    ShortcutModified = 46,
    CustomPropertyLinkClicked = 47,
    CustomPropertyEdited = 48,
    ServiceWorkerNetworkRequestClicked = 49,
    ServiceWorkerNetworkRequestClosedQuickly = 50,
    NetworkPanelServiceWorkerRespondWith = 51,
    NetworkPanelCopyValue = 52,
    ConsoleSidebarOpened = 53,
    PerfPanelTraceImported = 54,
    PerfPanelTraceExported = 55
}
export declare const ContrastThresholds: {
    [x: string]: number;
};
export declare const PanelCodes: {
    [x: string]: number;
};
export declare const SidebarPaneCodes: {
    [x: string]: number;
};
export declare const KeybindSetSettings: {
    [x: string]: number;
};
export declare const KeyboardShortcutAction: {
    [x: string]: number;
};
export declare enum IssueOpener {
    ConsoleInfoBar = 0,
    LearnMoreLinkCOEP = 1,
    StatusBarIssuesCounter = 2,
    HamburgerMenu = 3,
    Adorner = 4,
    CommandMenu = 5
}
export declare enum DualScreenDeviceEmulated {
    DualScreenDeviceSelected = 0,
    SpanButtonClicked = 1,
    PlatformSupportUsed = 2
}
export declare const CssEditorOpened: {
    [x: string]: number;
};
/**
 * This list should contain the currently active Devtools Experiments.
 * Therefore, it is possible that the id's will no longer be continuous
 * as experiemnts are removed.
 * When adding a new experiemnt:
 * 1. Add an entry to the bottom of the list before '__lastValidEnumPosition'
 * 2. Set the value of the new entry and '__lastValidEnumPosition' to
 *    __lastValidEnumPosition + 1
 * When removing an experiment, simply delete the line from the enum.
 */
export declare const DevtoolsExperiments: {
    [x: string]: number;
};
export declare const IssueExpanded: {
    [x: string]: number;
};
export declare const IssueResourceOpened: {
    [x: string]: number;
};
export declare const IssueCreated: {
    [x: string]: number;
};
export declare enum DeveloperResourceLoaded {
    LoadThroughPageViaTarget = 0,
    LoadThroughPageViaFrame = 1,
    LoadThroughPageFailure = 2,
    LoadThroughPageFallback = 3,
    FallbackAfterFailure = 4,
    FallbackPerOverride = 5,
    FallbackPerProtocol = 6,
    FallbackFailure = 7
}
export declare enum DeveloperResourceScheme {
    SchemeOther = 0,
    SchemeUnknown = 1,
    SchemeHttp = 2,
    SchemeHttps = 3,
    SchemeHttpLocalhost = 4,
    SchemeHttpsLocalhost = 5,
    SchemeData = 6,
    SchemeFile = 7,
    SchemeBlob = 8
}
export declare enum LinearMemoryInspectorRevealedFrom {
    ContextMenu = 0,
    MemoryIcon = 1
}
export declare enum LinearMemoryInspectorTarget {
    DWARFInspectableAddress = 0,
    ArrayBuffer = 1,
    DataView = 2,
    TypedArray = 3,
    WebAssemblyMemory = 4
}
