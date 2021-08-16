// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This file is auto-generated, do not edit manually. *
 * Re-generate with: npm run generate-protocol-resources.
 */


import type * as Protocol from './protocol.js'

/**
 * API generated from Protocol commands and events.
 */
declare namespace ProtocolProxyApi {
  export interface ProtocolApi {
    Accessibility: AccessibilityApi;

    Animation: AnimationApi;

    ApplicationCache: ApplicationCacheApi;

    Audits: AuditsApi;

    BackgroundService: BackgroundServiceApi;

    Browser: BrowserApi;

    CSS: CSSApi;

    CacheStorage: CacheStorageApi;

    Cast: CastApi;

    DOM: DOMApi;

    DOMDebugger: DOMDebuggerApi;

    DOMSnapshot: DOMSnapshotApi;

    DOMStorage: DOMStorageApi;

    Database: DatabaseApi;

    DeviceOrientation: DeviceOrientationApi;

    Emulation: EmulationApi;

    HeadlessExperimental: HeadlessExperimentalApi;

    IO: IOApi;

    IndexedDB: IndexedDBApi;

    Input: InputApi;

    Inspector: InspectorApi;

    LayerTree: LayerTreeApi;

    Log: LogApi;

    Memory: MemoryApi;

    Network: NetworkApi;

    Overlay: OverlayApi;

    Page: PageApi;

    Performance: PerformanceApi;

    PerformanceTimeline: PerformanceTimelineApi;

    Security: SecurityApi;

    ServiceWorker: ServiceWorkerApi;

    Storage: StorageApi;

    SystemInfo: SystemInfoApi;

    Target: TargetApi;

    Tethering: TetheringApi;

    Tracing: TracingApi;

    Fetch: FetchApi;

    WebAudio: WebAudioApi;

    WebAuthn: WebAuthnApi;

    Media: MediaApi;

    Debugger: DebuggerApi;

    HeapProfiler: HeapProfilerApi;

    Profiler: ProfilerApi;

    Runtime: RuntimeApi;

    Schema: SchemaApi;
  }


  export interface AccessibilityApi {
    /**
     * Disables the accessibility domain.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables the accessibility domain which causes `AXNodeId`s to remain consistent between method calls.
     * This turns on accessibility for the page, which can impact performance until accessibility is disabled.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Fetches the accessibility node and partial accessibility tree for this DOM node, if it exists.
     */
    invoke_getPartialAXTree(params: Protocol.Accessibility.GetPartialAXTreeRequest):
        Promise<Protocol.Accessibility.GetPartialAXTreeResponse>;

    /**
     * Fetches the entire accessibility tree for the root Document
     */
    invoke_getFullAXTree(params: Protocol.Accessibility.GetFullAXTreeRequest):
        Promise<Protocol.Accessibility.GetFullAXTreeResponse>;

    /**
     * Fetches a particular accessibility node by AXNodeId.
     * Requires `enable()` to have been called previously.
     */
    invoke_getChildAXNodes(params: Protocol.Accessibility.GetChildAXNodesRequest):
        Promise<Protocol.Accessibility.GetChildAXNodesResponse>;

    /**
     * Query a DOM node's accessibility subtree for accessible name and role.
     * This command computes the name and role for all nodes in the subtree, including those that are
     * ignored for accessibility, and returns those that mactch the specified name and role. If no DOM
     * node is specified, or the DOM node does not exist, the command returns an error. If neither
     * `accessibleName` or `role` is specified, it returns all the accessibility nodes in the subtree.
     */
    invoke_queryAXTree(params: Protocol.Accessibility.QueryAXTreeRequest):
        Promise<Protocol.Accessibility.QueryAXTreeResponse>;
  }
  export interface AccessibilityDispatcher {}

  export interface AnimationApi {
    /**
     * Disables animation domain notifications.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables animation domain notifications.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns the current time of the an animation.
     */
    invoke_getCurrentTime(params: Protocol.Animation.GetCurrentTimeRequest):
        Promise<Protocol.Animation.GetCurrentTimeResponse>;

    /**
     * Gets the playback rate of the document timeline.
     */
    invoke_getPlaybackRate(): Promise<Protocol.Animation.GetPlaybackRateResponse>;

    /**
     * Releases a set of animations to no longer be manipulated.
     */
    invoke_releaseAnimations(params: Protocol.Animation.ReleaseAnimationsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Gets the remote object of the Animation.
     */
    invoke_resolveAnimation(params: Protocol.Animation.ResolveAnimationRequest):
        Promise<Protocol.Animation.ResolveAnimationResponse>;

    /**
     * Seek a set of animations to a particular time within each animation.
     */
    invoke_seekAnimations(params: Protocol.Animation.SeekAnimationsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets the paused state of a set of animations.
     */
    invoke_setPaused(params: Protocol.Animation.SetPausedRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets the playback rate of the document timeline.
     */
    invoke_setPlaybackRate(params: Protocol.Animation.SetPlaybackRateRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets the timing of an animation node.
     */
    invoke_setTiming(params: Protocol.Animation.SetTimingRequest): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface AnimationDispatcher {
    /**
     * Event for when an animation has been cancelled.
     */
    animationCanceled(params: Protocol.Animation.AnimationCanceledEvent): void;

    /**
     * Event for each animation that has been created.
     */
    animationCreated(params: Protocol.Animation.AnimationCreatedEvent): void;

    /**
     * Event for animation that has been started.
     */
    animationStarted(params: Protocol.Animation.AnimationStartedEvent): void;
  }

  export interface ApplicationCacheApi {
    /**
     * Enables application cache domain notifications.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns relevant application cache data for the document in given frame.
     */
    invoke_getApplicationCacheForFrame(params: Protocol.ApplicationCache.GetApplicationCacheForFrameRequest):
        Promise<Protocol.ApplicationCache.GetApplicationCacheForFrameResponse>;

    /**
     * Returns array of frame identifiers with manifest urls for each frame containing a document
     * associated with some application cache.
     */
    invoke_getFramesWithManifests(): Promise<Protocol.ApplicationCache.GetFramesWithManifestsResponse>;

    /**
     * Returns manifest URL for document in the given frame.
     */
    invoke_getManifestForFrame(params: Protocol.ApplicationCache.GetManifestForFrameRequest):
        Promise<Protocol.ApplicationCache.GetManifestForFrameResponse>;
  }
  export interface ApplicationCacheDispatcher {
    applicationCacheStatusUpdated(params: Protocol.ApplicationCache.ApplicationCacheStatusUpdatedEvent): void;

    networkStateUpdated(params: Protocol.ApplicationCache.NetworkStateUpdatedEvent): void;
  }

  export interface AuditsApi {
    /**
     * Returns the response body and size if it were re-encoded with the specified settings. Only
     * applies to images.
     */
    invoke_getEncodedResponse(params: Protocol.Audits.GetEncodedResponseRequest):
        Promise<Protocol.Audits.GetEncodedResponseResponse>;

    /**
     * Disables issues domain, prevents further issues from being reported to the client.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables issues domain, sends the issues collected so far to the client by means of the
     * `issueAdded` event.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Runs the contrast check for the target page. Found issues are reported
     * using Audits.issueAdded event.
     */
    invoke_checkContrast(params: Protocol.Audits.CheckContrastRequest): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface AuditsDispatcher {
    issueAdded(params: Protocol.Audits.IssueAddedEvent): void;
  }

  export interface BackgroundServiceApi {
    /**
     * Enables event updates for the service.
     */
    invoke_startObserving(params: Protocol.BackgroundService.StartObservingRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disables event updates for the service.
     */
    invoke_stopObserving(params: Protocol.BackgroundService.StopObservingRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Set the recording state for the service.
     */
    invoke_setRecording(params: Protocol.BackgroundService.SetRecordingRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Clears all stored data for the service.
     */
    invoke_clearEvents(params: Protocol.BackgroundService.ClearEventsRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface BackgroundServiceDispatcher {
    /**
     * Called when the recording state for the service has been updated.
     */
    recordingStateChanged(params: Protocol.BackgroundService.RecordingStateChangedEvent): void;

    /**
     * Called with all existing backgroundServiceEvents when enabled, and all new
     * events afterwards if enabled and recording.
     */
    backgroundServiceEventReceived(params: Protocol.BackgroundService.BackgroundServiceEventReceivedEvent): void;
  }

  export interface BrowserApi {
    /**
     * Set permission settings for given origin.
     */
    invoke_setPermission(params: Protocol.Browser.SetPermissionRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Grant specific permissions to the given origin and reject all others.
     */
    invoke_grantPermissions(params: Protocol.Browser.GrantPermissionsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Reset all permission management for all origins.
     */
    invoke_resetPermissions(params: Protocol.Browser.ResetPermissionsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Set the behavior when downloading a file.
     */
    invoke_setDownloadBehavior(params: Protocol.Browser.SetDownloadBehaviorRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Cancel a download if in progress
     */
    invoke_cancelDownload(params: Protocol.Browser.CancelDownloadRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Close browser gracefully.
     */
    invoke_close(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Crashes browser on the main thread.
     */
    invoke_crash(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Crashes GPU process.
     */
    invoke_crashGpuProcess(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns version information.
     */
    invoke_getVersion(): Promise<Protocol.Browser.GetVersionResponse>;

    /**
     * Returns the command line switches for the browser process if, and only if
     * --enable-automation is on the commandline.
     */
    invoke_getBrowserCommandLine(): Promise<Protocol.Browser.GetBrowserCommandLineResponse>;

    /**
     * Get Chrome histograms.
     */
    invoke_getHistograms(params: Protocol.Browser.GetHistogramsRequest):
        Promise<Protocol.Browser.GetHistogramsResponse>;

    /**
     * Get a Chrome histogram by name.
     */
    invoke_getHistogram(params: Protocol.Browser.GetHistogramRequest): Promise<Protocol.Browser.GetHistogramResponse>;

    /**
     * Get position and size of the browser window.
     */
    invoke_getWindowBounds(params: Protocol.Browser.GetWindowBoundsRequest):
        Promise<Protocol.Browser.GetWindowBoundsResponse>;

    /**
     * Get the browser window that contains the devtools target.
     */
    invoke_getWindowForTarget(params: Protocol.Browser.GetWindowForTargetRequest):
        Promise<Protocol.Browser.GetWindowForTargetResponse>;

    /**
     * Set position and/or size of the browser window.
     */
    invoke_setWindowBounds(params: Protocol.Browser.SetWindowBoundsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Set dock tile details, platform-specific.
     */
    invoke_setDockTile(params: Protocol.Browser.SetDockTileRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Invoke custom browser commands used by telemetry.
     */
    invoke_executeBrowserCommand(params: Protocol.Browser.ExecuteBrowserCommandRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface BrowserDispatcher {
    /**
     * Fired when page is about to start a download.
     */
    downloadWillBegin(params: Protocol.Browser.DownloadWillBeginEvent): void;

    /**
     * Fired when download makes progress. Last call has |done| == true.
     */
    downloadProgress(params: Protocol.Browser.DownloadProgressEvent): void;
  }

  export interface CSSApi {
    /**
     * Inserts a new rule with the given `ruleText` in a stylesheet with given `styleSheetId`, at the
     * position specified by `location`.
     */
    invoke_addRule(params: Protocol.CSS.AddRuleRequest): Promise<Protocol.CSS.AddRuleResponse>;

    /**
     * Returns all class names from specified stylesheet.
     */
    invoke_collectClassNames(params: Protocol.CSS.CollectClassNamesRequest):
        Promise<Protocol.CSS.CollectClassNamesResponse>;

    /**
     * Creates a new special "via-inspector" stylesheet in the frame with given `frameId`.
     */
    invoke_createStyleSheet(params: Protocol.CSS.CreateStyleSheetRequest):
        Promise<Protocol.CSS.CreateStyleSheetResponse>;

    /**
     * Disables the CSS agent for the given page.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables the CSS agent for the given page. Clients should not assume that the CSS agent has been
     * enabled until the result of this command is received.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Ensures that the given node will have specified pseudo-classes whenever its style is computed by
     * the browser.
     */
    invoke_forcePseudoState(params: Protocol.CSS.ForcePseudoStateRequest): Promise<Protocol.ProtocolResponseWithError>;

    invoke_getBackgroundColors(params: Protocol.CSS.GetBackgroundColorsRequest):
        Promise<Protocol.CSS.GetBackgroundColorsResponse>;

    /**
     * Returns the computed style for a DOM node identified by `nodeId`.
     */
    invoke_getComputedStyleForNode(params: Protocol.CSS.GetComputedStyleForNodeRequest):
        Promise<Protocol.CSS.GetComputedStyleForNodeResponse>;

    /**
     * Returns the styles defined inline (explicitly in the "style" attribute and implicitly, using DOM
     * attributes) for a DOM node identified by `nodeId`.
     */
    invoke_getInlineStylesForNode(params: Protocol.CSS.GetInlineStylesForNodeRequest):
        Promise<Protocol.CSS.GetInlineStylesForNodeResponse>;

    /**
     * Returns requested styles for a DOM node identified by `nodeId`.
     */
    invoke_getMatchedStylesForNode(params: Protocol.CSS.GetMatchedStylesForNodeRequest):
        Promise<Protocol.CSS.GetMatchedStylesForNodeResponse>;

    /**
     * Returns all media queries parsed by the rendering engine.
     */
    invoke_getMediaQueries(): Promise<Protocol.CSS.GetMediaQueriesResponse>;

    /**
     * Requests information about platform fonts which we used to render child TextNodes in the given
     * node.
     */
    invoke_getPlatformFontsForNode(params: Protocol.CSS.GetPlatformFontsForNodeRequest):
        Promise<Protocol.CSS.GetPlatformFontsForNodeResponse>;

    /**
     * Returns the current textual content for a stylesheet.
     */
    invoke_getStyleSheetText(params: Protocol.CSS.GetStyleSheetTextRequest):
        Promise<Protocol.CSS.GetStyleSheetTextResponse>;

    /**
     * Starts tracking the given computed styles for updates. The specified array of properties
     * replaces the one previously specified. Pass empty array to disable tracking.
     * Use takeComputedStyleUpdates to retrieve the list of nodes that had properties modified.
     * The changes to computed style properties are only tracked for nodes pushed to the front-end
     * by the DOM agent. If no changes to the tracked properties occur after the node has been pushed
     * to the front-end, no updates will be issued for the node.
     */
    invoke_trackComputedStyleUpdates(params: Protocol.CSS.TrackComputedStyleUpdatesRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Polls the next batch of computed style updates.
     */
    invoke_takeComputedStyleUpdates(): Promise<Protocol.CSS.TakeComputedStyleUpdatesResponse>;

    /**
     * Find a rule with the given active property for the given node and set the new value for this
     * property
     */
    invoke_setEffectivePropertyValueForNode(params: Protocol.CSS.SetEffectivePropertyValueForNodeRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Modifies the keyframe rule key text.
     */
    invoke_setKeyframeKey(params: Protocol.CSS.SetKeyframeKeyRequest): Promise<Protocol.CSS.SetKeyframeKeyResponse>;

    /**
     * Modifies the rule selector.
     */
    invoke_setMediaText(params: Protocol.CSS.SetMediaTextRequest): Promise<Protocol.CSS.SetMediaTextResponse>;

    /**
     * Modifies the rule selector.
     */
    invoke_setRuleSelector(params: Protocol.CSS.SetRuleSelectorRequest): Promise<Protocol.CSS.SetRuleSelectorResponse>;

    /**
     * Sets the new stylesheet text.
     */
    invoke_setStyleSheetText(params: Protocol.CSS.SetStyleSheetTextRequest):
        Promise<Protocol.CSS.SetStyleSheetTextResponse>;

    /**
     * Applies specified style edits one after another in the given order.
     */
    invoke_setStyleTexts(params: Protocol.CSS.SetStyleTextsRequest): Promise<Protocol.CSS.SetStyleTextsResponse>;

    /**
     * Enables the selector recording.
     */
    invoke_startRuleUsageTracking(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Stop tracking rule usage and return the list of rules that were used since last call to
     * `takeCoverageDelta` (or since start of coverage instrumentation)
     */
    invoke_stopRuleUsageTracking(): Promise<Protocol.CSS.StopRuleUsageTrackingResponse>;

    /**
     * Obtain list of rules that became used since last call to this method (or since start of coverage
     * instrumentation)
     */
    invoke_takeCoverageDelta(): Promise<Protocol.CSS.TakeCoverageDeltaResponse>;

    /**
     * Enables/disables rendering of local CSS fonts (enabled by default).
     */
    invoke_setLocalFontsEnabled(params: Protocol.CSS.SetLocalFontsEnabledRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface CSSDispatcher {
    /**
     * Fires whenever a web font is updated.  A non-empty font parameter indicates a successfully loaded
     * web font
     */
    fontsUpdated(params: Protocol.CSS.FontsUpdatedEvent): void;

    /**
     * Fires whenever a MediaQuery result changes (for example, after a browser window has been
     * resized.) The current implementation considers only viewport-dependent media features.
     */
    mediaQueryResultChanged(): void;

    /**
     * Fired whenever an active document stylesheet is added.
     */
    styleSheetAdded(params: Protocol.CSS.StyleSheetAddedEvent): void;

    /**
     * Fired whenever a stylesheet is changed as a result of the client operation.
     */
    styleSheetChanged(params: Protocol.CSS.StyleSheetChangedEvent): void;

    /**
     * Fired whenever an active document stylesheet is removed.
     */
    styleSheetRemoved(params: Protocol.CSS.StyleSheetRemovedEvent): void;
  }

  export interface CacheStorageApi {
    /**
     * Deletes a cache.
     */
    invoke_deleteCache(params: Protocol.CacheStorage.DeleteCacheRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Deletes a cache entry.
     */
    invoke_deleteEntry(params: Protocol.CacheStorage.DeleteEntryRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests cache names.
     */
    invoke_requestCacheNames(params: Protocol.CacheStorage.RequestCacheNamesRequest):
        Promise<Protocol.CacheStorage.RequestCacheNamesResponse>;

    /**
     * Fetches cache entry.
     */
    invoke_requestCachedResponse(params: Protocol.CacheStorage.RequestCachedResponseRequest):
        Promise<Protocol.CacheStorage.RequestCachedResponseResponse>;

    /**
     * Requests data from cache.
     */
    invoke_requestEntries(params: Protocol.CacheStorage.RequestEntriesRequest):
        Promise<Protocol.CacheStorage.RequestEntriesResponse>;
  }
  export interface CacheStorageDispatcher {}

  export interface CastApi {
    /**
     * Starts observing for sinks that can be used for tab mirroring, and if set,
     * sinks compatible with |presentationUrl| as well. When sinks are found, a
     * |sinksUpdated| event is fired.
     * Also starts observing for issue messages. When an issue is added or removed,
     * an |issueUpdated| event is fired.
     */
    invoke_enable(params: Protocol.Cast.EnableRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Stops observing for sinks and issues.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets a sink to be used when the web page requests the browser to choose a
     * sink via Presentation API, Remote Playback API, or Cast SDK.
     */
    invoke_setSinkToUse(params: Protocol.Cast.SetSinkToUseRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Starts mirroring the tab to the sink.
     */
    invoke_startTabMirroring(params: Protocol.Cast.StartTabMirroringRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Stops the active Cast session on the sink.
     */
    invoke_stopCasting(params: Protocol.Cast.StopCastingRequest): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface CastDispatcher {
    /**
     * This is fired whenever the list of available sinks changes. A sink is a
     * device or a software surface that you can cast to.
     */
    sinksUpdated(params: Protocol.Cast.SinksUpdatedEvent): void;

    /**
     * This is fired whenever the outstanding issue/error message changes.
     * |issueMessage| is empty if there is no issue.
     */
    issueUpdated(params: Protocol.Cast.IssueUpdatedEvent): void;
  }

  export interface DOMApi {
    /**
     * Collects class names for the node with given id and all of it's child nodes.
     */
    invoke_collectClassNamesFromSubtree(params: Protocol.DOM.CollectClassNamesFromSubtreeRequest):
        Promise<Protocol.DOM.CollectClassNamesFromSubtreeResponse>;

    /**
     * Creates a deep copy of the specified node and places it into the target container before the
     * given anchor.
     */
    invoke_copyTo(params: Protocol.DOM.CopyToRequest): Promise<Protocol.DOM.CopyToResponse>;

    /**
     * Describes node given its id, does not require domain to be enabled. Does not start tracking any
     * objects, can be used for automation.
     */
    invoke_describeNode(params: Protocol.DOM.DescribeNodeRequest): Promise<Protocol.DOM.DescribeNodeResponse>;

    /**
     * Scrolls the specified rect of the given node into view if not already visible.
     * Note: exactly one between nodeId, backendNodeId and objectId should be passed
     * to identify the node.
     */
    invoke_scrollIntoViewIfNeeded(params: Protocol.DOM.ScrollIntoViewIfNeededRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disables DOM agent for the given page.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Discards search results from the session with the given id. `getSearchResults` should no longer
     * be called for that search.
     */
    invoke_discardSearchResults(params: Protocol.DOM.DiscardSearchResultsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables DOM agent for the given page.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Focuses the given element.
     */
    invoke_focus(params: Protocol.DOM.FocusRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns attributes for the specified node.
     */
    invoke_getAttributes(params: Protocol.DOM.GetAttributesRequest): Promise<Protocol.DOM.GetAttributesResponse>;

    /**
     * Returns boxes for the given node.
     */
    invoke_getBoxModel(params: Protocol.DOM.GetBoxModelRequest): Promise<Protocol.DOM.GetBoxModelResponse>;

    /**
     * Returns quads that describe node position on the page. This method
     * might return multiple quads for inline nodes.
     */
    invoke_getContentQuads(params: Protocol.DOM.GetContentQuadsRequest): Promise<Protocol.DOM.GetContentQuadsResponse>;

    /**
     * Returns the root DOM node (and optionally the subtree) to the caller.
     */
    invoke_getDocument(params: Protocol.DOM.GetDocumentRequest): Promise<Protocol.DOM.GetDocumentResponse>;

    /**
     * Returns the root DOM node (and optionally the subtree) to the caller.
     * Deprecated, as it is not designed to work well with the rest of the DOM agent.
     * Use DOMSnapshot.captureSnapshot instead.
     */
    invoke_getFlattenedDocument(params: Protocol.DOM.GetFlattenedDocumentRequest):
        Promise<Protocol.DOM.GetFlattenedDocumentResponse>;

    /**
     * Finds nodes with a given computed style in a subtree.
     */
    invoke_getNodesForSubtreeByStyle(params: Protocol.DOM.GetNodesForSubtreeByStyleRequest):
        Promise<Protocol.DOM.GetNodesForSubtreeByStyleResponse>;

    /**
     * Returns node id at given location. Depending on whether DOM domain is enabled, nodeId is
     * either returned or not.
     */
    invoke_getNodeForLocation(params: Protocol.DOM.GetNodeForLocationRequest):
        Promise<Protocol.DOM.GetNodeForLocationResponse>;

    /**
     * Returns node's HTML markup.
     */
    invoke_getOuterHTML(params: Protocol.DOM.GetOuterHTMLRequest): Promise<Protocol.DOM.GetOuterHTMLResponse>;

    /**
     * Returns the id of the nearest ancestor that is a relayout boundary.
     */
    invoke_getRelayoutBoundary(params: Protocol.DOM.GetRelayoutBoundaryRequest):
        Promise<Protocol.DOM.GetRelayoutBoundaryResponse>;

    /**
     * Returns search results from given `fromIndex` to given `toIndex` from the search with the given
     * identifier.
     */
    invoke_getSearchResults(params: Protocol.DOM.GetSearchResultsRequest):
        Promise<Protocol.DOM.GetSearchResultsResponse>;

    /**
     * Hides any highlight.
     */
    invoke_hideHighlight(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Highlights DOM node.
     */
    invoke_highlightNode(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Highlights given rectangle.
     */
    invoke_highlightRect(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Marks last undoable state.
     */
    invoke_markUndoableState(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Moves node into the new container, places it before the given anchor.
     */
    invoke_moveTo(params: Protocol.DOM.MoveToRequest): Promise<Protocol.DOM.MoveToResponse>;

    /**
     * Searches for a given string in the DOM tree. Use `getSearchResults` to access search results or
     * `cancelSearch` to end this search session.
     */
    invoke_performSearch(params: Protocol.DOM.PerformSearchRequest): Promise<Protocol.DOM.PerformSearchResponse>;

    /**
     * Requests that the node is sent to the caller given its path. // FIXME, use XPath
     */
    invoke_pushNodeByPathToFrontend(params: Protocol.DOM.PushNodeByPathToFrontendRequest):
        Promise<Protocol.DOM.PushNodeByPathToFrontendResponse>;

    /**
     * Requests that a batch of nodes is sent to the caller given their backend node ids.
     */
    invoke_pushNodesByBackendIdsToFrontend(params: Protocol.DOM.PushNodesByBackendIdsToFrontendRequest):
        Promise<Protocol.DOM.PushNodesByBackendIdsToFrontendResponse>;

    /**
     * Executes `querySelector` on a given node.
     */
    invoke_querySelector(params: Protocol.DOM.QuerySelectorRequest): Promise<Protocol.DOM.QuerySelectorResponse>;

    /**
     * Executes `querySelectorAll` on a given node.
     */
    invoke_querySelectorAll(params: Protocol.DOM.QuerySelectorAllRequest):
        Promise<Protocol.DOM.QuerySelectorAllResponse>;

    /**
     * Re-does the last undone action.
     */
    invoke_redo(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Removes attribute with given name from an element with given id.
     */
    invoke_removeAttribute(params: Protocol.DOM.RemoveAttributeRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Removes node with given id.
     */
    invoke_removeNode(params: Protocol.DOM.RemoveNodeRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests that children of the node with given id are returned to the caller in form of
     * `setChildNodes` events where not only immediate children are retrieved, but all children down to
     * the specified depth.
     */
    invoke_requestChildNodes(params: Protocol.DOM.RequestChildNodesRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests that the node is sent to the caller given the JavaScript node object reference. All
     * nodes that form the path from the node to the root are also sent to the client as a series of
     * `setChildNodes` notifications.
     */
    invoke_requestNode(params: Protocol.DOM.RequestNodeRequest): Promise<Protocol.DOM.RequestNodeResponse>;

    /**
     * Resolves the JavaScript node object for a given NodeId or BackendNodeId.
     */
    invoke_resolveNode(params: Protocol.DOM.ResolveNodeRequest): Promise<Protocol.DOM.ResolveNodeResponse>;

    /**
     * Sets attribute for an element with given id.
     */
    invoke_setAttributeValue(params: Protocol.DOM.SetAttributeValueRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets attributes on element with given id. This method is useful when user edits some existing
     * attribute value and types in several attribute name/value pairs.
     */
    invoke_setAttributesAsText(params: Protocol.DOM.SetAttributesAsTextRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets files for the given file input element.
     */
    invoke_setFileInputFiles(params: Protocol.DOM.SetFileInputFilesRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets if stack traces should be captured for Nodes. See `Node.getNodeStackTraces`. Default is disabled.
     */
    invoke_setNodeStackTracesEnabled(params: Protocol.DOM.SetNodeStackTracesEnabledRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Gets stack traces associated with a Node. As of now, only provides stack trace for Node creation.
     */
    invoke_getNodeStackTraces(params: Protocol.DOM.GetNodeStackTracesRequest):
        Promise<Protocol.DOM.GetNodeStackTracesResponse>;

    /**
     * Returns file information for the given
     * File wrapper.
     */
    invoke_getFileInfo(params: Protocol.DOM.GetFileInfoRequest): Promise<Protocol.DOM.GetFileInfoResponse>;

    /**
     * Enables console to refer to the node with given id via $x (see Command Line API for more details
     * $x functions).
     */
    invoke_setInspectedNode(params: Protocol.DOM.SetInspectedNodeRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets node name for a node with given id.
     */
    invoke_setNodeName(params: Protocol.DOM.SetNodeNameRequest): Promise<Protocol.DOM.SetNodeNameResponse>;

    /**
     * Sets node value for a node with given id.
     */
    invoke_setNodeValue(params: Protocol.DOM.SetNodeValueRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets node HTML markup, returns new node id.
     */
    invoke_setOuterHTML(params: Protocol.DOM.SetOuterHTMLRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Undoes the last performed action.
     */
    invoke_undo(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns iframe node that owns iframe with the given domain.
     */
    invoke_getFrameOwner(params: Protocol.DOM.GetFrameOwnerRequest): Promise<Protocol.DOM.GetFrameOwnerResponse>;
  }
  export interface DOMDispatcher {
    /**
     * Fired when `Element`'s attribute is modified.
     */
    attributeModified(params: Protocol.DOM.AttributeModifiedEvent): void;

    /**
     * Fired when `Element`'s attribute is removed.
     */
    attributeRemoved(params: Protocol.DOM.AttributeRemovedEvent): void;

    /**
     * Mirrors `DOMCharacterDataModified` event.
     */
    characterDataModified(params: Protocol.DOM.CharacterDataModifiedEvent): void;

    /**
     * Fired when `Container`'s child node count has changed.
     */
    childNodeCountUpdated(params: Protocol.DOM.ChildNodeCountUpdatedEvent): void;

    /**
     * Mirrors `DOMNodeInserted` event.
     */
    childNodeInserted(params: Protocol.DOM.ChildNodeInsertedEvent): void;

    /**
     * Mirrors `DOMNodeRemoved` event.
     */
    childNodeRemoved(params: Protocol.DOM.ChildNodeRemovedEvent): void;

    /**
     * Called when distribution is changed.
     */
    distributedNodesUpdated(params: Protocol.DOM.DistributedNodesUpdatedEvent): void;

    /**
     * Fired when `Document` has been totally updated. Node ids are no longer valid.
     */
    documentUpdated(): void;

    /**
     * Fired when `Element`'s inline style is modified via a CSS property modification.
     */
    inlineStyleInvalidated(params: Protocol.DOM.InlineStyleInvalidatedEvent): void;

    /**
     * Called when a pseudo element is added to an element.
     */
    pseudoElementAdded(params: Protocol.DOM.PseudoElementAddedEvent): void;

    /**
     * Called when a pseudo element is removed from an element.
     */
    pseudoElementRemoved(params: Protocol.DOM.PseudoElementRemovedEvent): void;

    /**
     * Fired when backend wants to provide client with the missing DOM structure. This happens upon
     * most of the calls requesting node ids.
     */
    setChildNodes(params: Protocol.DOM.SetChildNodesEvent): void;

    /**
     * Called when shadow root is popped from the element.
     */
    shadowRootPopped(params: Protocol.DOM.ShadowRootPoppedEvent): void;

    /**
     * Called when shadow root is pushed into the element.
     */
    shadowRootPushed(params: Protocol.DOM.ShadowRootPushedEvent): void;
  }

  export interface DOMDebuggerApi {
    /**
     * Returns event listeners of the given object.
     */
    invoke_getEventListeners(params: Protocol.DOMDebugger.GetEventListenersRequest):
        Promise<Protocol.DOMDebugger.GetEventListenersResponse>;

    /**
     * Removes DOM breakpoint that was set using `setDOMBreakpoint`.
     */
    invoke_removeDOMBreakpoint(params: Protocol.DOMDebugger.RemoveDOMBreakpointRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Removes breakpoint on particular DOM event.
     */
    invoke_removeEventListenerBreakpoint(params: Protocol.DOMDebugger.RemoveEventListenerBreakpointRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Removes breakpoint on particular native event.
     */
    invoke_removeInstrumentationBreakpoint(params: Protocol.DOMDebugger.RemoveInstrumentationBreakpointRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Removes breakpoint from XMLHttpRequest.
     */
    invoke_removeXHRBreakpoint(params: Protocol.DOMDebugger.RemoveXHRBreakpointRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets breakpoint on particular CSP violations.
     */
    invoke_setBreakOnCSPViolation(params: Protocol.DOMDebugger.SetBreakOnCSPViolationRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets breakpoint on particular operation with DOM.
     */
    invoke_setDOMBreakpoint(params: Protocol.DOMDebugger.SetDOMBreakpointRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets breakpoint on particular DOM event.
     */
    invoke_setEventListenerBreakpoint(params: Protocol.DOMDebugger.SetEventListenerBreakpointRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets breakpoint on particular native event.
     */
    invoke_setInstrumentationBreakpoint(params: Protocol.DOMDebugger.SetInstrumentationBreakpointRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets breakpoint on XMLHttpRequest.
     */
    invoke_setXHRBreakpoint(params: Protocol.DOMDebugger.SetXHRBreakpointRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface DOMDebuggerDispatcher {}

  export interface DOMSnapshotApi {
    /**
     * Disables DOM snapshot agent for the given page.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables DOM snapshot agent for the given page.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns a document snapshot, including the full DOM tree of the root node (including iframes,
     * template contents, and imported documents) in a flattened array, as well as layout and
     * white-listed computed style information for the nodes. Shadow DOM in the returned DOM tree is
     * flattened.
     */
    invoke_getSnapshot(params: Protocol.DOMSnapshot.GetSnapshotRequest):
        Promise<Protocol.DOMSnapshot.GetSnapshotResponse>;

    /**
     * Returns a document snapshot, including the full DOM tree of the root node (including iframes,
     * template contents, and imported documents) in a flattened array, as well as layout and
     * white-listed computed style information for the nodes. Shadow DOM in the returned DOM tree is
     * flattened.
     */
    invoke_captureSnapshot(params: Protocol.DOMSnapshot.CaptureSnapshotRequest):
        Promise<Protocol.DOMSnapshot.CaptureSnapshotResponse>;
  }
  export interface DOMSnapshotDispatcher {}

  export interface DOMStorageApi {
    invoke_clear(params: Protocol.DOMStorage.ClearRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disables storage tracking, prevents storage events from being sent to the client.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables storage tracking, storage events will now be delivered to the client.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_getDOMStorageItems(params: Protocol.DOMStorage.GetDOMStorageItemsRequest):
        Promise<Protocol.DOMStorage.GetDOMStorageItemsResponse>;

    invoke_removeDOMStorageItem(params: Protocol.DOMStorage.RemoveDOMStorageItemRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_setDOMStorageItem(params: Protocol.DOMStorage.SetDOMStorageItemRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface DOMStorageDispatcher {
    domStorageItemAdded(params: Protocol.DOMStorage.DomStorageItemAddedEvent): void;

    domStorageItemRemoved(params: Protocol.DOMStorage.DomStorageItemRemovedEvent): void;

    domStorageItemUpdated(params: Protocol.DOMStorage.DomStorageItemUpdatedEvent): void;

    domStorageItemsCleared(params: Protocol.DOMStorage.DomStorageItemsClearedEvent): void;
  }

  export interface DatabaseApi {
    /**
     * Disables database tracking, prevents database events from being sent to the client.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables database tracking, database events will now be delivered to the client.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_executeSQL(params: Protocol.Database.ExecuteSQLRequest): Promise<Protocol.Database.ExecuteSQLResponse>;

    invoke_getDatabaseTableNames(params: Protocol.Database.GetDatabaseTableNamesRequest):
        Promise<Protocol.Database.GetDatabaseTableNamesResponse>;
  }
  export interface DatabaseDispatcher {
    addDatabase(params: Protocol.Database.AddDatabaseEvent): void;
  }

  export interface DeviceOrientationApi {
    /**
     * Clears the overridden Device Orientation.
     */
    invoke_clearDeviceOrientationOverride(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Overrides the Device Orientation.
     */
    invoke_setDeviceOrientationOverride(params: Protocol.DeviceOrientation.SetDeviceOrientationOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface DeviceOrientationDispatcher {}

  export interface EmulationApi {
    /**
     * Tells whether emulation is supported.
     */
    invoke_canEmulate(): Promise<Protocol.Emulation.CanEmulateResponse>;

    /**
     * Clears the overridden device metrics.
     */
    invoke_clearDeviceMetricsOverride(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Clears the overridden Geolocation Position and Error.
     */
    invoke_clearGeolocationOverride(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests that page scale factor is reset to initial values.
     */
    invoke_resetPageScaleFactor(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables or disables simulating a focused and active page.
     */
    invoke_setFocusEmulationEnabled(params: Protocol.Emulation.SetFocusEmulationEnabledRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables CPU throttling to emulate slow CPUs.
     */
    invoke_setCPUThrottlingRate(params: Protocol.Emulation.SetCPUThrottlingRateRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets or clears an override of the default background color of the frame. This override is used
     * if the content does not specify one.
     */
    invoke_setDefaultBackgroundColorOverride(params: Protocol.Emulation.SetDefaultBackgroundColorOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Overrides the values of device screen dimensions (window.screen.width, window.screen.height,
     * window.innerWidth, window.innerHeight, and "device-width"/"device-height"-related CSS media
     * query results).
     */
    invoke_setDeviceMetricsOverride(params: Protocol.Emulation.SetDeviceMetricsOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_setScrollbarsHidden(params: Protocol.Emulation.SetScrollbarsHiddenRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_setDocumentCookieDisabled(params: Protocol.Emulation.SetDocumentCookieDisabledRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_setEmitTouchEventsForMouse(params: Protocol.Emulation.SetEmitTouchEventsForMouseRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Emulates the given media type or media feature for CSS media queries.
     */
    invoke_setEmulatedMedia(params: Protocol.Emulation.SetEmulatedMediaRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Emulates the given vision deficiency.
     */
    invoke_setEmulatedVisionDeficiency(params: Protocol.Emulation.SetEmulatedVisionDeficiencyRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position
     * unavailable.
     */
    invoke_setGeolocationOverride(params: Protocol.Emulation.SetGeolocationOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Overrides the Idle state.
     */
    invoke_setIdleOverride(params: Protocol.Emulation.SetIdleOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Clears Idle state overrides.
     */
    invoke_clearIdleOverride(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Overrides value returned by the javascript navigator object.
     */
    invoke_setNavigatorOverrides(params: Protocol.Emulation.SetNavigatorOverridesRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets a specified page scale factor.
     */
    invoke_setPageScaleFactor(params: Protocol.Emulation.SetPageScaleFactorRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Switches script execution in the page.
     */
    invoke_setScriptExecutionDisabled(params: Protocol.Emulation.SetScriptExecutionDisabledRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables touch on platforms which do not support them.
     */
    invoke_setTouchEmulationEnabled(params: Protocol.Emulation.SetTouchEmulationEnabledRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Turns on virtual time for all frames (replacing real-time with a synthetic time source) and sets
     * the current virtual time policy.  Note this supersedes any previous time budget.
     */
    invoke_setVirtualTimePolicy(params: Protocol.Emulation.SetVirtualTimePolicyRequest):
        Promise<Protocol.Emulation.SetVirtualTimePolicyResponse>;

    /**
     * Overrides default host system locale with the specified one.
     */
    invoke_setLocaleOverride(params: Protocol.Emulation.SetLocaleOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Overrides default host system timezone with the specified one.
     */
    invoke_setTimezoneOverride(params: Protocol.Emulation.SetTimezoneOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Resizes the frame/viewport of the page. Note that this does not affect the frame's container
     * (e.g. browser window). Can be used to produce screenshots of the specified size. Not supported
     * on Android.
     */
    invoke_setVisibleSize(params: Protocol.Emulation.SetVisibleSizeRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_setDisabledImageTypes(params: Protocol.Emulation.SetDisabledImageTypesRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Allows overriding user agent with the given string.
     */
    invoke_setUserAgentOverride(params: Protocol.Emulation.SetUserAgentOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface EmulationDispatcher {
    /**
     * Notification sent after the virtual time budget for the current VirtualTimePolicy has run out.
     */
    virtualTimeBudgetExpired(): void;
  }

  export interface HeadlessExperimentalApi {
    /**
     * Sends a BeginFrame to the target and returns when the frame was completed. Optionally captures a
     * screenshot from the resulting frame. Requires that the target was created with enabled
     * BeginFrameControl. Designed for use with --run-all-compositor-stages-before-draw, see also
     * https://goo.gl/3zHXhB for more background.
     */
    invoke_beginFrame(params: Protocol.HeadlessExperimental.BeginFrameRequest):
        Promise<Protocol.HeadlessExperimental.BeginFrameResponse>;

    /**
     * Disables headless events for the target.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables headless events for the target.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface HeadlessExperimentalDispatcher {
    /**
     * Issued when the target starts or stops needing BeginFrames.
     * Deprecated. Issue beginFrame unconditionally instead and use result from
     * beginFrame to detect whether the frames were suppressed.
     */
    needsBeginFramesChanged(params: Protocol.HeadlessExperimental.NeedsBeginFramesChangedEvent): void;
  }

  // eslint thinks this is us prefixing our interfaces but it's not!
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  export interface IOApi {
    /**
     * Close the stream, discard any temporary backing storage.
     */
    invoke_close(params: Protocol.IO.CloseRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Read a chunk of the stream
     */
    invoke_read(params: Protocol.IO.ReadRequest): Promise<Protocol.IO.ReadResponse>;

    /**
     * Return UUID of Blob object specified by a remote object id.
     */
    invoke_resolveBlob(params: Protocol.IO.ResolveBlobRequest): Promise<Protocol.IO.ResolveBlobResponse>;
  }
  export interface IODispatcher {}

  // eslint thinks this is us prefixing our interfaces but it's not!
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  export interface IndexedDBApi {
    /**
     * Clears all entries from an object store.
     */
    invoke_clearObjectStore(params: Protocol.IndexedDB.ClearObjectStoreRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Deletes a database.
     */
    invoke_deleteDatabase(params: Protocol.IndexedDB.DeleteDatabaseRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Delete a range of entries from an object store
     */
    invoke_deleteObjectStoreEntries(params: Protocol.IndexedDB.DeleteObjectStoreEntriesRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disables events from backend.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables events from backend.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests data from object store or index.
     */
    invoke_requestData(params: Protocol.IndexedDB.RequestDataRequest): Promise<Protocol.IndexedDB.RequestDataResponse>;

    /**
     * Gets metadata of an object store
     */
    invoke_getMetadata(params: Protocol.IndexedDB.GetMetadataRequest): Promise<Protocol.IndexedDB.GetMetadataResponse>;

    /**
     * Requests database with given name in given frame.
     */
    invoke_requestDatabase(params: Protocol.IndexedDB.RequestDatabaseRequest):
        Promise<Protocol.IndexedDB.RequestDatabaseResponse>;

    /**
     * Requests database names for given security origin.
     */
    invoke_requestDatabaseNames(params: Protocol.IndexedDB.RequestDatabaseNamesRequest):
        Promise<Protocol.IndexedDB.RequestDatabaseNamesResponse>;
  }
  export interface IndexedDBDispatcher {}

  // eslint thinks this is us prefixing our interfaces but it's not!
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  export interface InputApi {
    /**
     * Dispatches a drag event into the page.
     */
    invoke_dispatchDragEvent(params: Protocol.Input.DispatchDragEventRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Dispatches a key event to the page.
     */
    invoke_dispatchKeyEvent(params: Protocol.Input.DispatchKeyEventRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * This method emulates inserting text that doesn't come from a key press,
     * for example an emoji keyboard or an IME.
     */
    invoke_insertText(params: Protocol.Input.InsertTextRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Dispatches a mouse event to the page.
     */
    invoke_dispatchMouseEvent(params: Protocol.Input.DispatchMouseEventRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Dispatches a touch event to the page.
     */
    invoke_dispatchTouchEvent(params: Protocol.Input.DispatchTouchEventRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Emulates touch event from the mouse event parameters.
     */
    invoke_emulateTouchFromMouseEvent(params: Protocol.Input.EmulateTouchFromMouseEventRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Ignores input events (useful while auditing page).
     */
    invoke_setIgnoreInputEvents(params: Protocol.Input.SetIgnoreInputEventsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Prevents default drag and drop behavior and instead emits `Input.dragIntercepted` events.
     * Drag and drop behavior can be directly controlled via `Input.dispatchDragEvent`.
     */
    invoke_setInterceptDrags(params: Protocol.Input.SetInterceptDragsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Synthesizes a pinch gesture over a time period by issuing appropriate touch events.
     */
    invoke_synthesizePinchGesture(params: Protocol.Input.SynthesizePinchGestureRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Synthesizes a scroll gesture over a time period by issuing appropriate touch events.
     */
    invoke_synthesizeScrollGesture(params: Protocol.Input.SynthesizeScrollGestureRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Synthesizes a tap gesture over a time period by issuing appropriate touch events.
     */
    invoke_synthesizeTapGesture(params: Protocol.Input.SynthesizeTapGestureRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface InputDispatcher {
    /**
     * Emitted only when `Input.setInterceptDrags` is enabled. Use this data with `Input.dispatchDragEvent` to
     * restore normal drag and drop behavior.
     */
    dragIntercepted(params: Protocol.Input.DragInterceptedEvent): void;
  }

  // eslint thinks this is us prefixing our interfaces but it's not!
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  export interface InspectorApi {
    /**
     * Disables inspector domain notifications.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables inspector domain notifications.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface InspectorDispatcher {
    /**
     * Fired when remote debugging connection is about to be terminated. Contains detach reason.
     */
    detached(params: Protocol.Inspector.DetachedEvent): void;

    /**
     * Fired when debugging target has crashed
     */
    targetCrashed(): void;

    /**
     * Fired when debugging target has reloaded after crash
     */
    targetReloadedAfterCrash(): void;
  }

  export interface LayerTreeApi {
    /**
     * Provides the reasons why the given layer was composited.
     */
    invoke_compositingReasons(params: Protocol.LayerTree.CompositingReasonsRequest):
        Promise<Protocol.LayerTree.CompositingReasonsResponse>;

    /**
     * Disables compositing tree inspection.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables compositing tree inspection.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns the snapshot identifier.
     */
    invoke_loadSnapshot(params: Protocol.LayerTree.LoadSnapshotRequest):
        Promise<Protocol.LayerTree.LoadSnapshotResponse>;

    /**
     * Returns the layer snapshot identifier.
     */
    invoke_makeSnapshot(params: Protocol.LayerTree.MakeSnapshotRequest):
        Promise<Protocol.LayerTree.MakeSnapshotResponse>;

    invoke_profileSnapshot(params: Protocol.LayerTree.ProfileSnapshotRequest):
        Promise<Protocol.LayerTree.ProfileSnapshotResponse>;

    /**
     * Releases layer snapshot captured by the back-end.
     */
    invoke_releaseSnapshot(params: Protocol.LayerTree.ReleaseSnapshotRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Replays the layer snapshot and returns the resulting bitmap.
     */
    invoke_replaySnapshot(params: Protocol.LayerTree.ReplaySnapshotRequest):
        Promise<Protocol.LayerTree.ReplaySnapshotResponse>;

    /**
     * Replays the layer snapshot and returns canvas log.
     */
    invoke_snapshotCommandLog(params: Protocol.LayerTree.SnapshotCommandLogRequest):
        Promise<Protocol.LayerTree.SnapshotCommandLogResponse>;
  }
  export interface LayerTreeDispatcher {
    layerPainted(params: Protocol.LayerTree.LayerPaintedEvent): void;

    layerTreeDidChange(params: Protocol.LayerTree.LayerTreeDidChangeEvent): void;
  }

  export interface LogApi {
    /**
     * Clears the log.
     */
    invoke_clear(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disables log domain, prevents further log entries from being reported to the client.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables log domain, sends the entries collected so far to the client by means of the
     * `entryAdded` notification.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * start violation reporting.
     */
    invoke_startViolationsReport(params: Protocol.Log.StartViolationsReportRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Stop violation reporting.
     */
    invoke_stopViolationsReport(): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface LogDispatcher {
    /**
     * Issued when new message was logged.
     */
    entryAdded(params: Protocol.Log.EntryAddedEvent): void;
  }

  export interface MemoryApi {
    invoke_getDOMCounters(): Promise<Protocol.Memory.GetDOMCountersResponse>;

    invoke_prepareForLeakDetection(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Simulate OomIntervention by purging V8 memory.
     */
    invoke_forciblyPurgeJavaScriptMemory(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enable/disable suppressing memory pressure notifications in all processes.
     */
    invoke_setPressureNotificationsSuppressed(params: Protocol.Memory.SetPressureNotificationsSuppressedRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Simulate a memory pressure notification in all processes.
     */
    invoke_simulatePressureNotification(params: Protocol.Memory.SimulatePressureNotificationRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Start collecting native memory profile.
     */
    invoke_startSampling(params: Protocol.Memory.StartSamplingRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Stop collecting native memory profile.
     */
    invoke_stopSampling(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Retrieve native memory allocations profile
     * collected since renderer process startup.
     */
    invoke_getAllTimeSamplingProfile(): Promise<Protocol.Memory.GetAllTimeSamplingProfileResponse>;

    /**
     * Retrieve native memory allocations profile
     * collected since browser process startup.
     */
    invoke_getBrowserSamplingProfile(): Promise<Protocol.Memory.GetBrowserSamplingProfileResponse>;

    /**
     * Retrieve native memory allocations profile collected since last
     * `startSampling` call.
     */
    invoke_getSamplingProfile(): Promise<Protocol.Memory.GetSamplingProfileResponse>;
  }
  export interface MemoryDispatcher {}

  export interface NetworkApi {
    /**
     * Sets a list of content encodings that will be accepted. Empty list means no encoding is accepted.
     */
    invoke_setAcceptedEncodings(params: Protocol.Network.SetAcceptedEncodingsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Clears accepted encodings set by setAcceptedEncodings
     */
    invoke_clearAcceptedEncodingsOverride(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Tells whether clearing browser cache is supported.
     */
    invoke_canClearBrowserCache(): Promise<Protocol.Network.CanClearBrowserCacheResponse>;

    /**
     * Tells whether clearing browser cookies is supported.
     */
    invoke_canClearBrowserCookies(): Promise<Protocol.Network.CanClearBrowserCookiesResponse>;

    /**
     * Tells whether emulation of network conditions is supported.
     */
    invoke_canEmulateNetworkConditions(): Promise<Protocol.Network.CanEmulateNetworkConditionsResponse>;

    /**
     * Clears browser cache.
     */
    invoke_clearBrowserCache(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Clears browser cookies.
     */
    invoke_clearBrowserCookies(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Response to Network.requestIntercepted which either modifies the request to continue with any
     * modifications, or blocks it, or completes it with the provided response bytes. If a network
     * fetch occurs as a result which encounters a redirect an additional Network.requestIntercepted
     * event will be sent with the same InterceptionId.
     * Deprecated, use Fetch.continueRequest, Fetch.fulfillRequest and Fetch.failRequest instead.
     */
    invoke_continueInterceptedRequest(params: Protocol.Network.ContinueInterceptedRequestRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Deletes browser cookies with matching name and url or domain/path pair.
     */
    invoke_deleteCookies(params: Protocol.Network.DeleteCookiesRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disables network tracking, prevents network events from being sent to the client.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Activates emulation of network conditions.
     */
    invoke_emulateNetworkConditions(params: Protocol.Network.EmulateNetworkConditionsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables network tracking, network events will now be delivered to the client.
     */
    invoke_enable(params: Protocol.Network.EnableRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns all browser cookies. Depending on the backend support, will return detailed cookie
     * information in the `cookies` field.
     */
    invoke_getAllCookies(): Promise<Protocol.Network.GetAllCookiesResponse>;

    /**
     * Returns the DER-encoded certificate.
     */
    invoke_getCertificate(params: Protocol.Network.GetCertificateRequest):
        Promise<Protocol.Network.GetCertificateResponse>;

    /**
     * Returns all browser cookies for the current URL. Depending on the backend support, will return
     * detailed cookie information in the `cookies` field.
     */
    invoke_getCookies(params: Protocol.Network.GetCookiesRequest): Promise<Protocol.Network.GetCookiesResponse>;

    /**
     * Returns content served for the given request.
     */
    invoke_getResponseBody(params: Protocol.Network.GetResponseBodyRequest):
        Promise<Protocol.Network.GetResponseBodyResponse>;

    /**
     * Returns post data sent with the request. Returns an error when no data was sent with the request.
     */
    invoke_getRequestPostData(params: Protocol.Network.GetRequestPostDataRequest):
        Promise<Protocol.Network.GetRequestPostDataResponse>;

    /**
     * Returns content served for the given currently intercepted request.
     */
    invoke_getResponseBodyForInterception(params: Protocol.Network.GetResponseBodyForInterceptionRequest):
        Promise<Protocol.Network.GetResponseBodyForInterceptionResponse>;

    /**
     * Returns a handle to the stream representing the response body. Note that after this command,
     * the intercepted request can't be continued as is -- you either need to cancel it or to provide
     * the response body. The stream only supports sequential read, IO.read will fail if the position
     * is specified.
     */
    invoke_takeResponseBodyForInterceptionAsStream(params:
                                                       Protocol.Network.TakeResponseBodyForInterceptionAsStreamRequest):
        Promise<Protocol.Network.TakeResponseBodyForInterceptionAsStreamResponse>;

    /**
     * This method sends a new XMLHttpRequest which is identical to the original one. The following
     * parameters should be identical: method, url, async, request body, extra headers, withCredentials
     * attribute, user, password.
     */
    invoke_replayXHR(params: Protocol.Network.ReplayXHRRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Searches for given string in response content.
     */
    invoke_searchInResponseBody(params: Protocol.Network.SearchInResponseBodyRequest):
        Promise<Protocol.Network.SearchInResponseBodyResponse>;

    /**
     * Blocks URLs from loading.
     */
    invoke_setBlockedURLs(params: Protocol.Network.SetBlockedURLsRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Toggles ignoring of service worker for each request.
     */
    invoke_setBypassServiceWorker(params: Protocol.Network.SetBypassServiceWorkerRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Toggles ignoring cache for each request. If `true`, cache will not be used.
     */
    invoke_setCacheDisabled(params: Protocol.Network.SetCacheDisabledRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.
     */
    invoke_setCookie(params: Protocol.Network.SetCookieRequest): Promise<Protocol.Network.SetCookieResponse>;

    /**
     * Sets given cookies.
     */
    invoke_setCookies(params: Protocol.Network.SetCookiesRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * For testing.
     */
    invoke_setDataSizeLimitsForTest(params: Protocol.Network.SetDataSizeLimitsForTestRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Specifies whether to always send extra HTTP headers with the requests from this page.
     */
    invoke_setExtraHTTPHeaders(params: Protocol.Network.SetExtraHTTPHeadersRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Specifies whether to attach a page script stack id in requests
     */
    invoke_setAttachDebugStack(params: Protocol.Network.SetAttachDebugStackRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets the requests to intercept that match the provided patterns and optionally resource types.
     * Deprecated, please use Fetch.enable instead.
     */
    invoke_setRequestInterception(params: Protocol.Network.SetRequestInterceptionRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Allows overriding user agent with the given string.
     */
    invoke_setUserAgentOverride(params: Protocol.Network.SetUserAgentOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns information about the COEP/COOP isolation status.
     */
    invoke_getSecurityIsolationStatus(params: Protocol.Network.GetSecurityIsolationStatusRequest):
        Promise<Protocol.Network.GetSecurityIsolationStatusResponse>;

    /**
     * Fetches the resource and returns the content.
     */
    invoke_loadNetworkResource(params: Protocol.Network.LoadNetworkResourceRequest):
        Promise<Protocol.Network.LoadNetworkResourceResponse>;
  }
  export interface NetworkDispatcher {
    /**
     * Fired when data chunk was received over the network.
     */
    dataReceived(params: Protocol.Network.DataReceivedEvent): void;

    /**
     * Fired when EventSource message is received.
     */
    eventSourceMessageReceived(params: Protocol.Network.EventSourceMessageReceivedEvent): void;

    /**
     * Fired when HTTP request has failed to load.
     */
    loadingFailed(params: Protocol.Network.LoadingFailedEvent): void;

    /**
     * Fired when HTTP request has finished loading.
     */
    loadingFinished(params: Protocol.Network.LoadingFinishedEvent): void;

    /**
     * Details of an intercepted HTTP request, which must be either allowed, blocked, modified or
     * mocked.
     * Deprecated, use Fetch.requestPaused instead.
     */
    requestIntercepted(params: Protocol.Network.RequestInterceptedEvent): void;

    /**
     * Fired if request ended up loading from cache.
     */
    requestServedFromCache(params: Protocol.Network.RequestServedFromCacheEvent): void;

    /**
     * Fired when page is about to send HTTP request.
     */
    requestWillBeSent(params: Protocol.Network.RequestWillBeSentEvent): void;

    /**
     * Fired when resource loading priority is changed
     */
    resourceChangedPriority(params: Protocol.Network.ResourceChangedPriorityEvent): void;

    /**
     * Fired when a signed exchange was received over the network
     */
    signedExchangeReceived(params: Protocol.Network.SignedExchangeReceivedEvent): void;

    /**
     * Fired when HTTP response is available.
     */
    responseReceived(params: Protocol.Network.ResponseReceivedEvent): void;

    /**
     * Fired when WebSocket is closed.
     */
    webSocketClosed(params: Protocol.Network.WebSocketClosedEvent): void;

    /**
     * Fired upon WebSocket creation.
     */
    webSocketCreated(params: Protocol.Network.WebSocketCreatedEvent): void;

    /**
     * Fired when WebSocket message error occurs.
     */
    webSocketFrameError(params: Protocol.Network.WebSocketFrameErrorEvent): void;

    /**
     * Fired when WebSocket message is received.
     */
    webSocketFrameReceived(params: Protocol.Network.WebSocketFrameReceivedEvent): void;

    /**
     * Fired when WebSocket message is sent.
     */
    webSocketFrameSent(params: Protocol.Network.WebSocketFrameSentEvent): void;

    /**
     * Fired when WebSocket handshake response becomes available.
     */
    webSocketHandshakeResponseReceived(params: Protocol.Network.WebSocketHandshakeResponseReceivedEvent): void;

    /**
     * Fired when WebSocket is about to initiate handshake.
     */
    webSocketWillSendHandshakeRequest(params: Protocol.Network.WebSocketWillSendHandshakeRequestEvent): void;

    /**
     * Fired upon WebTransport creation.
     */
    webTransportCreated(params: Protocol.Network.WebTransportCreatedEvent): void;

    /**
     * Fired when WebTransport handshake is finished.
     */
    webTransportConnectionEstablished(params: Protocol.Network.WebTransportConnectionEstablishedEvent): void;

    /**
     * Fired when WebTransport is disposed.
     */
    webTransportClosed(params: Protocol.Network.WebTransportClosedEvent): void;

    /**
     * Fired when additional information about a requestWillBeSent event is available from the
     * network stack. Not every requestWillBeSent event will have an additional
     * requestWillBeSentExtraInfo fired for it, and there is no guarantee whether requestWillBeSent
     * or requestWillBeSentExtraInfo will be fired first for the same request.
     */
    requestWillBeSentExtraInfo(params: Protocol.Network.RequestWillBeSentExtraInfoEvent): void;

    /**
     * Fired when additional information about a responseReceived event is available from the network
     * stack. Not every responseReceived event will have an additional responseReceivedExtraInfo for
     * it, and responseReceivedExtraInfo may be fired before or after responseReceived.
     */
    responseReceivedExtraInfo(params: Protocol.Network.ResponseReceivedExtraInfoEvent): void;

    /**
     * Fired exactly once for each Trust Token operation. Depending on
     * the type of the operation and whether the operation succeeded or
     * failed, the event is fired before the corresponding request was sent
     * or after the response was received.
     */
    trustTokenOperationDone(params: Protocol.Network.TrustTokenOperationDoneEvent): void;

    /**
     * Fired once when parsing the .wbn file has succeeded.
     * The event contains the information about the web bundle contents.
     */
    subresourceWebBundleMetadataReceived(params: Protocol.Network.SubresourceWebBundleMetadataReceivedEvent): void;

    /**
     * Fired once when parsing the .wbn file has failed.
     */
    subresourceWebBundleMetadataError(params: Protocol.Network.SubresourceWebBundleMetadataErrorEvent): void;

    /**
     * Fired when handling requests for resources within a .wbn file.
     * Note: this will only be fired for resources that are requested by the webpage.
     */
    subresourceWebBundleInnerResponseParsed(params: Protocol.Network.SubresourceWebBundleInnerResponseParsedEvent):
        void;

    /**
     * Fired when request for resources within a .wbn file failed.
     */
    subresourceWebBundleInnerResponseError(params: Protocol.Network.SubresourceWebBundleInnerResponseErrorEvent): void;
  }

  export interface OverlayApi {
    /**
     * Disables domain notifications.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables domain notifications.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * For testing.
     */
    invoke_getHighlightObjectForTest(params: Protocol.Overlay.GetHighlightObjectForTestRequest):
        Promise<Protocol.Overlay.GetHighlightObjectForTestResponse>;

    /**
     * For Persistent Grid testing.
     */
    invoke_getGridHighlightObjectsForTest(params: Protocol.Overlay.GetGridHighlightObjectsForTestRequest):
        Promise<Protocol.Overlay.GetGridHighlightObjectsForTestResponse>;

    /**
     * For Source Order Viewer testing.
     */
    invoke_getSourceOrderHighlightObjectForTest(params: Protocol.Overlay.GetSourceOrderHighlightObjectForTestRequest):
        Promise<Protocol.Overlay.GetSourceOrderHighlightObjectForTestResponse>;

    /**
     * Hides any highlight.
     */
    invoke_hideHighlight(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Highlights owner element of the frame with given id.
     */
    invoke_highlightFrame(params: Protocol.Overlay.HighlightFrameRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Highlights DOM node with given id or with the given JavaScript object wrapper. Either nodeId or
     * objectId must be specified.
     */
    invoke_highlightNode(params: Protocol.Overlay.HighlightNodeRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Highlights given quad. Coordinates are absolute with respect to the main frame viewport.
     */
    invoke_highlightQuad(params: Protocol.Overlay.HighlightQuadRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Highlights given rectangle. Coordinates are absolute with respect to the main frame viewport.
     */
    invoke_highlightRect(params: Protocol.Overlay.HighlightRectRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Highlights the source order of the children of the DOM node with given id or with the given
     * JavaScript object wrapper. Either nodeId or objectId must be specified.
     */
    invoke_highlightSourceOrder(params: Protocol.Overlay.HighlightSourceOrderRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enters the 'inspect' mode. In this mode, elements that user is hovering over are highlighted.
     * Backend then generates 'inspectNodeRequested' event upon element selection.
     */
    invoke_setInspectMode(params: Protocol.Overlay.SetInspectModeRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Highlights owner element of all frames detected to be ads.
     */
    invoke_setShowAdHighlights(params: Protocol.Overlay.SetShowAdHighlightsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_setPausedInDebuggerMessage(params: Protocol.Overlay.SetPausedInDebuggerMessageRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests that backend shows debug borders on layers
     */
    invoke_setShowDebugBorders(params: Protocol.Overlay.SetShowDebugBordersRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests that backend shows the FPS counter
     */
    invoke_setShowFPSCounter(params: Protocol.Overlay.SetShowFPSCounterRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Highlight multiple elements with the CSS Grid overlay.
     */
    invoke_setShowGridOverlays(params: Protocol.Overlay.SetShowGridOverlaysRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_setShowFlexOverlays(params: Protocol.Overlay.SetShowFlexOverlaysRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_setShowScrollSnapOverlays(params: Protocol.Overlay.SetShowScrollSnapOverlaysRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests that backend shows paint rectangles
     */
    invoke_setShowPaintRects(params: Protocol.Overlay.SetShowPaintRectsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests that backend shows layout shift regions
     */
    invoke_setShowLayoutShiftRegions(params: Protocol.Overlay.SetShowLayoutShiftRegionsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests that backend shows scroll bottleneck rects
     */
    invoke_setShowScrollBottleneckRects(params: Protocol.Overlay.SetShowScrollBottleneckRectsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests that backend shows hit-test borders on layers
     */
    invoke_setShowHitTestBorders(params: Protocol.Overlay.SetShowHitTestBordersRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Request that backend shows an overlay with web vital metrics.
     */
    invoke_setShowWebVitals(params: Protocol.Overlay.SetShowWebVitalsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Paints viewport size upon main frame resize.
     */
    invoke_setShowViewportSizeOnResize(params: Protocol.Overlay.SetShowViewportSizeOnResizeRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Add a dual screen device hinge
     */
    invoke_setShowHinge(params: Protocol.Overlay.SetShowHingeRequest): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface OverlayDispatcher {
    /**
     * Fired when the node should be inspected. This happens after call to `setInspectMode` or when
     * user manually inspects an element.
     */
    inspectNodeRequested(params: Protocol.Overlay.InspectNodeRequestedEvent): void;

    /**
     * Fired when the node should be highlighted. This happens after call to `setInspectMode`.
     */
    nodeHighlightRequested(params: Protocol.Overlay.NodeHighlightRequestedEvent): void;

    /**
     * Fired when user asks to capture screenshot of some area on the page.
     */
    screenshotRequested(params: Protocol.Overlay.ScreenshotRequestedEvent): void;

    /**
     * Fired when user cancels the inspect mode.
     */
    inspectModeCanceled(): void;
  }

  export interface PageApi {
    /**
     * Deprecated, please use addScriptToEvaluateOnNewDocument instead.
     */
    invoke_addScriptToEvaluateOnLoad(params: Protocol.Page.AddScriptToEvaluateOnLoadRequest):
        Promise<Protocol.Page.AddScriptToEvaluateOnLoadResponse>;

    /**
     * Evaluates given script in every frame upon creation (before loading frame's scripts).
     */
    invoke_addScriptToEvaluateOnNewDocument(params: Protocol.Page.AddScriptToEvaluateOnNewDocumentRequest):
        Promise<Protocol.Page.AddScriptToEvaluateOnNewDocumentResponse>;

    /**
     * Brings page to front (activates tab).
     */
    invoke_bringToFront(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Capture page screenshot.
     */
    invoke_captureScreenshot(params: Protocol.Page.CaptureScreenshotRequest):
        Promise<Protocol.Page.CaptureScreenshotResponse>;

    /**
     * Returns a snapshot of the page as a string. For MHTML format, the serialization includes
     * iframes, shadow DOM, external resources, and element-inline styles.
     */
    invoke_captureSnapshot(params: Protocol.Page.CaptureSnapshotRequest):
        Promise<Protocol.Page.CaptureSnapshotResponse>;

    /**
     * Clears the overridden device metrics.
     */
    invoke_clearDeviceMetricsOverride(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Clears the overridden Device Orientation.
     */
    invoke_clearDeviceOrientationOverride(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Clears the overridden Geolocation Position and Error.
     */
    invoke_clearGeolocationOverride(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Creates an isolated world for the given frame.
     */
    invoke_createIsolatedWorld(params: Protocol.Page.CreateIsolatedWorldRequest):
        Promise<Protocol.Page.CreateIsolatedWorldResponse>;

    /**
     * Deletes browser cookie with given name, domain and path.
     */
    invoke_deleteCookie(params: Protocol.Page.DeleteCookieRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disables page domain notifications.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables page domain notifications.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_getAppManifest(): Promise<Protocol.Page.GetAppManifestResponse>;

    invoke_getInstallabilityErrors(): Promise<Protocol.Page.GetInstallabilityErrorsResponse>;

    invoke_getManifestIcons(): Promise<Protocol.Page.GetManifestIconsResponse>;

    /**
     * Returns all browser cookies. Depending on the backend support, will return detailed cookie
     * information in the `cookies` field.
     */
    invoke_getCookies(): Promise<Protocol.Page.GetCookiesResponse>;

    /**
     * Returns present frame tree structure.
     */
    invoke_getFrameTree(): Promise<Protocol.Page.GetFrameTreeResponse>;

    /**
     * Returns metrics relating to the layouting of the page, such as viewport bounds/scale.
     */
    invoke_getLayoutMetrics(): Promise<Protocol.Page.GetLayoutMetricsResponse>;

    /**
     * Returns navigation history for the current page.
     */
    invoke_getNavigationHistory(): Promise<Protocol.Page.GetNavigationHistoryResponse>;

    /**
     * Resets navigation history for the current page.
     */
    invoke_resetNavigationHistory(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns content of the given resource.
     */
    invoke_getResourceContent(params: Protocol.Page.GetResourceContentRequest):
        Promise<Protocol.Page.GetResourceContentResponse>;

    /**
     * Returns present frame / resource tree structure.
     */
    invoke_getResourceTree(): Promise<Protocol.Page.GetResourceTreeResponse>;

    /**
     * Accepts or dismisses a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload).
     */
    invoke_handleJavaScriptDialog(params: Protocol.Page.HandleJavaScriptDialogRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Navigates current page to the given URL.
     */
    invoke_navigate(params: Protocol.Page.NavigateRequest): Promise<Protocol.Page.NavigateResponse>;

    /**
     * Navigates current page to the given history entry.
     */
    invoke_navigateToHistoryEntry(params: Protocol.Page.NavigateToHistoryEntryRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Print page as PDF.
     */
    invoke_printToPDF(params: Protocol.Page.PrintToPDFRequest): Promise<Protocol.Page.PrintToPDFResponse>;

    /**
     * Reloads given page optionally ignoring the cache.
     */
    invoke_reload(params: Protocol.Page.ReloadRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Deprecated, please use removeScriptToEvaluateOnNewDocument instead.
     */
    invoke_removeScriptToEvaluateOnLoad(params: Protocol.Page.RemoveScriptToEvaluateOnLoadRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Removes given script from the list.
     */
    invoke_removeScriptToEvaluateOnNewDocument(params: Protocol.Page.RemoveScriptToEvaluateOnNewDocumentRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Acknowledges that a screencast frame has been received by the frontend.
     */
    invoke_screencastFrameAck(params: Protocol.Page.ScreencastFrameAckRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Searches for given string in resource content.
     */
    invoke_searchInResource(params: Protocol.Page.SearchInResourceRequest):
        Promise<Protocol.Page.SearchInResourceResponse>;

    /**
     * Enable Chrome's experimental ad filter on all sites.
     */
    invoke_setAdBlockingEnabled(params: Protocol.Page.SetAdBlockingEnabledRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enable page Content Security Policy by-passing.
     */
    invoke_setBypassCSP(params: Protocol.Page.SetBypassCSPRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Get Permissions Policy state on given frame.
     */
    invoke_getPermissionsPolicyState(params: Protocol.Page.GetPermissionsPolicyStateRequest):
        Promise<Protocol.Page.GetPermissionsPolicyStateResponse>;

    /**
     * Overrides the values of device screen dimensions (window.screen.width, window.screen.height,
     * window.innerWidth, window.innerHeight, and "device-width"/"device-height"-related CSS media
     * query results).
     */
    invoke_setDeviceMetricsOverride(params: Protocol.Page.SetDeviceMetricsOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Overrides the Device Orientation.
     */
    invoke_setDeviceOrientationOverride(params: Protocol.Page.SetDeviceOrientationOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Set generic font families.
     */
    invoke_setFontFamilies(params: Protocol.Page.SetFontFamiliesRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Set default font sizes.
     */
    invoke_setFontSizes(params: Protocol.Page.SetFontSizesRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets given markup as the document's HTML.
     */
    invoke_setDocumentContent(params: Protocol.Page.SetDocumentContentRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Set the behavior when downloading a file.
     */
    invoke_setDownloadBehavior(params: Protocol.Page.SetDownloadBehaviorRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position
     * unavailable.
     */
    invoke_setGeolocationOverride(params: Protocol.Page.SetGeolocationOverrideRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Controls whether page will emit lifecycle events.
     */
    invoke_setLifecycleEventsEnabled(params: Protocol.Page.SetLifecycleEventsEnabledRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Toggles mouse event-based touch event emulation.
     */
    invoke_setTouchEmulationEnabled(params: Protocol.Page.SetTouchEmulationEnabledRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Starts sending each frame using the `screencastFrame` event.
     */
    invoke_startScreencast(params: Protocol.Page.StartScreencastRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Force the page stop all navigations and pending resource fetches.
     */
    invoke_stopLoading(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Crashes renderer on the IO thread, generates minidumps.
     */
    invoke_crash(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Tries to close page, running its beforeunload hooks, if any.
     */
    invoke_close(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Tries to update the web lifecycle state of the page.
     * It will transition the page to the given state according to:
     * https://github.com/WICG/web-lifecycle/
     */
    invoke_setWebLifecycleState(params: Protocol.Page.SetWebLifecycleStateRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Stops sending each frame in the `screencastFrame`.
     */
    invoke_stopScreencast(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Forces compilation cache to be generated for every subresource script.
     * See also: `Page.produceCompilationCache`.
     */
    invoke_setProduceCompilationCache(params: Protocol.Page.SetProduceCompilationCacheRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Requests backend to produce compilation cache for the specified scripts.
     * Unlike setProduceCompilationCache, this allows client to only produce cache
     * for specific scripts. `scripts` are appeneded to the list of scripts
     * for which the cache for would produced. Disabling compilation cache with
     * `setProduceCompilationCache` would reset all pending cache requests.
     * The list may also be reset during page navigation.
     * When script with a matching URL is encountered, the cache is optionally
     * produced upon backend discretion, based on internal heuristics.
     * See also: `Page.compilationCacheProduced`.
     */
    invoke_produceCompilationCache(params: Protocol.Page.ProduceCompilationCacheRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Seeds compilation cache for given url. Compilation cache does not survive
     * cross-process navigation.
     */
    invoke_addCompilationCache(params: Protocol.Page.AddCompilationCacheRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Clears seeded compilation cache.
     */
    invoke_clearCompilationCache(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Generates a report for testing.
     */
    invoke_generateTestReport(params: Protocol.Page.GenerateTestReportRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Pauses page execution. Can be resumed using generic Runtime.runIfWaitingForDebugger.
     */
    invoke_waitForDebugger(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Intercept file chooser requests and transfer control to protocol clients.
     * When file chooser interception is enabled, native file chooser dialog is not shown.
     * Instead, a protocol event `Page.fileChooserOpened` is emitted.
     */
    invoke_setInterceptFileChooserDialog(params: Protocol.Page.SetInterceptFileChooserDialogRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface PageDispatcher {
    domContentEventFired(params: Protocol.Page.DomContentEventFiredEvent): void;

    /**
     * Emitted only when `page.interceptFileChooser` is enabled.
     */
    fileChooserOpened(params: Protocol.Page.FileChooserOpenedEvent): void;

    /**
     * Fired when frame has been attached to its parent.
     */
    frameAttached(params: Protocol.Page.FrameAttachedEvent): void;

    /**
     * Fired when frame no longer has a scheduled navigation.
     */
    frameClearedScheduledNavigation(params: Protocol.Page.FrameClearedScheduledNavigationEvent): void;

    /**
     * Fired when frame has been detached from its parent.
     */
    frameDetached(params: Protocol.Page.FrameDetachedEvent): void;

    /**
     * Fired once navigation of the frame has completed. Frame is now associated with the new loader.
     */
    frameNavigated(params: Protocol.Page.FrameNavigatedEvent): void;

    /**
     * Fired when opening document to write to.
     */
    documentOpened(params: Protocol.Page.DocumentOpenedEvent): void;

    frameResized(): void;

    /**
     * Fired when a renderer-initiated navigation is requested.
     * Navigation may still be cancelled after the event is issued.
     */
    frameRequestedNavigation(params: Protocol.Page.FrameRequestedNavigationEvent): void;

    /**
     * Fired when frame schedules a potential navigation.
     */
    frameScheduledNavigation(params: Protocol.Page.FrameScheduledNavigationEvent): void;

    /**
     * Fired when frame has started loading.
     */
    frameStartedLoading(params: Protocol.Page.FrameStartedLoadingEvent): void;

    /**
     * Fired when frame has stopped loading.
     */
    frameStoppedLoading(params: Protocol.Page.FrameStoppedLoadingEvent): void;

    /**
     * Fired when page is about to start a download.
     * Deprecated. Use Browser.downloadWillBegin instead.
     */
    downloadWillBegin(params: Protocol.Page.DownloadWillBeginEvent): void;

    /**
     * Fired when download makes progress. Last call has |done| == true.
     * Deprecated. Use Browser.downloadProgress instead.
     */
    downloadProgress(params: Protocol.Page.DownloadProgressEvent): void;

    /**
     * Fired when interstitial page was hidden
     */
    interstitialHidden(): void;

    /**
     * Fired when interstitial page was shown
     */
    interstitialShown(): void;

    /**
     * Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) has been
     * closed.
     */
    javascriptDialogClosed(params: Protocol.Page.JavascriptDialogClosedEvent): void;

    /**
     * Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) is about to
     * open.
     */
    javascriptDialogOpening(params: Protocol.Page.JavascriptDialogOpeningEvent): void;

    /**
     * Fired for top level page lifecycle events such as navigation, load, paint, etc.
     */
    lifecycleEvent(params: Protocol.Page.LifecycleEventEvent): void;

    /**
     * Fired for failed bfcache history navigations if BackForwardCache feature is enabled. Do
     * not assume any ordering with the Page.frameNavigated event. This event is fired only for
     * main-frame history navigation where the document changes (non-same-document navigations),
     * when bfcache navigation fails.
     */
    backForwardCacheNotUsed(params: Protocol.Page.BackForwardCacheNotUsedEvent): void;

    loadEventFired(params: Protocol.Page.LoadEventFiredEvent): void;

    /**
     * Fired when same-document navigation happens, e.g. due to history API usage or anchor navigation.
     */
    navigatedWithinDocument(params: Protocol.Page.NavigatedWithinDocumentEvent): void;

    /**
     * Compressed image data requested by the `startScreencast`.
     */
    screencastFrame(params: Protocol.Page.ScreencastFrameEvent): void;

    /**
     * Fired when the page with currently enabled screencast was shown or hidden `.
     */
    screencastVisibilityChanged(params: Protocol.Page.ScreencastVisibilityChangedEvent): void;

    /**
     * Fired when a new window is going to be opened, via window.open(), link click, form submission,
     * etc.
     */
    windowOpen(params: Protocol.Page.WindowOpenEvent): void;

    /**
     * Issued for every compilation cache generated. Is only available
     * if Page.setGenerateCompilationCache is enabled.
     */
    compilationCacheProduced(params: Protocol.Page.CompilationCacheProducedEvent): void;
  }

  export interface PerformanceApi {
    /**
     * Disable collecting and reporting metrics.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enable collecting and reporting metrics.
     */
    invoke_enable(params: Protocol.Performance.EnableRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets time domain to use for collecting and reporting duration metrics.
     * Note that this must be called before enabling metrics collection. Calling
     * this method while metrics collection is enabled returns an error.
     */
    invoke_setTimeDomain(params: Protocol.Performance.SetTimeDomainRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Retrieve current values of run-time metrics.
     */
    invoke_getMetrics(): Promise<Protocol.Performance.GetMetricsResponse>;
  }
  export interface PerformanceDispatcher {
    /**
     * Current values of the metrics.
     */
    metrics(params: Protocol.Performance.MetricsEvent): void;
  }

  export interface PerformanceTimelineApi {
    /**
     * Previously buffered events would be reported before method returns.
     * See also: timelineEventAdded
     */
    invoke_enable(params: Protocol.PerformanceTimeline.EnableRequest): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface PerformanceTimelineDispatcher {
    /**
     * Sent when a performance timeline event is added. See reportPerformanceTimeline method.
     */
    timelineEventAdded(params: Protocol.PerformanceTimeline.TimelineEventAddedEvent): void;
  }

  export interface SecurityApi {
    /**
     * Disables tracking security state changes.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables tracking security state changes.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enable/disable whether all certificate errors should be ignored.
     */
    invoke_setIgnoreCertificateErrors(params: Protocol.Security.SetIgnoreCertificateErrorsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Handles a certificate error that fired a certificateError event.
     */
    invoke_handleCertificateError(params: Protocol.Security.HandleCertificateErrorRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enable/disable overriding certificate errors. If enabled, all certificate error events need to
     * be handled by the DevTools client and should be answered with `handleCertificateError` commands.
     */
    invoke_setOverrideCertificateErrors(params: Protocol.Security.SetOverrideCertificateErrorsRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface SecurityDispatcher {
    /**
     * There is a certificate error. If overriding certificate errors is enabled, then it should be
     * handled with the `handleCertificateError` command. Note: this event does not fire if the
     * certificate error has been allowed internally. Only one client per target should override
     * certificate errors at the same time.
     */
    certificateError(params: Protocol.Security.CertificateErrorEvent): void;

    /**
     * The security state of the page changed.
     */
    visibleSecurityStateChanged(params: Protocol.Security.VisibleSecurityStateChangedEvent): void;

    /**
     * The security state of the page changed.
     */
    securityStateChanged(params: Protocol.Security.SecurityStateChangedEvent): void;
  }

  export interface ServiceWorkerApi {
    invoke_deliverPushMessage(params: Protocol.ServiceWorker.DeliverPushMessageRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_dispatchSyncEvent(params: Protocol.ServiceWorker.DispatchSyncEventRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_dispatchPeriodicSyncEvent(params: Protocol.ServiceWorker.DispatchPeriodicSyncEventRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_inspectWorker(params: Protocol.ServiceWorker.InspectWorkerRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_setForceUpdateOnPageLoad(params: Protocol.ServiceWorker.SetForceUpdateOnPageLoadRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_skipWaiting(params: Protocol.ServiceWorker.SkipWaitingRequest): Promise<Protocol.ProtocolResponseWithError>;

    invoke_startWorker(params: Protocol.ServiceWorker.StartWorkerRequest): Promise<Protocol.ProtocolResponseWithError>;

    invoke_stopAllWorkers(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_stopWorker(params: Protocol.ServiceWorker.StopWorkerRequest): Promise<Protocol.ProtocolResponseWithError>;

    invoke_unregister(params: Protocol.ServiceWorker.UnregisterRequest): Promise<Protocol.ProtocolResponseWithError>;

    invoke_updateRegistration(params: Protocol.ServiceWorker.UpdateRegistrationRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface ServiceWorkerDispatcher {
    workerErrorReported(params: Protocol.ServiceWorker.WorkerErrorReportedEvent): void;

    workerRegistrationUpdated(params: Protocol.ServiceWorker.WorkerRegistrationUpdatedEvent): void;

    workerVersionUpdated(params: Protocol.ServiceWorker.WorkerVersionUpdatedEvent): void;
  }

  export interface StorageApi {
    /**
     * Clears storage for origin.
     */
    invoke_clearDataForOrigin(params: Protocol.Storage.ClearDataForOriginRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns all browser cookies.
     */
    invoke_getCookies(params: Protocol.Storage.GetCookiesRequest): Promise<Protocol.Storage.GetCookiesResponse>;

    /**
     * Sets given cookies.
     */
    invoke_setCookies(params: Protocol.Storage.SetCookiesRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Clears cookies.
     */
    invoke_clearCookies(params: Protocol.Storage.ClearCookiesRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns usage and quota in bytes.
     */
    invoke_getUsageAndQuota(params: Protocol.Storage.GetUsageAndQuotaRequest):
        Promise<Protocol.Storage.GetUsageAndQuotaResponse>;

    /**
     * Override quota for the specified origin
     */
    invoke_overrideQuotaForOrigin(params: Protocol.Storage.OverrideQuotaForOriginRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Registers origin to be notified when an update occurs to its cache storage list.
     */
    invoke_trackCacheStorageForOrigin(params: Protocol.Storage.TrackCacheStorageForOriginRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Registers origin to be notified when an update occurs to its IndexedDB.
     */
    invoke_trackIndexedDBForOrigin(params: Protocol.Storage.TrackIndexedDBForOriginRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Unregisters origin from receiving notifications for cache storage.
     */
    invoke_untrackCacheStorageForOrigin(params: Protocol.Storage.UntrackCacheStorageForOriginRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Unregisters origin from receiving notifications for IndexedDB.
     */
    invoke_untrackIndexedDBForOrigin(params: Protocol.Storage.UntrackIndexedDBForOriginRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns the number of stored Trust Tokens per issuer for the
     * current browsing context.
     */
    invoke_getTrustTokens(): Promise<Protocol.Storage.GetTrustTokensResponse>;

    /**
     * Removes all Trust Tokens issued by the provided issuerOrigin.
     * Leaves other stored data, including the issuer's Redemption Records, intact.
     */
    invoke_clearTrustTokens(params: Protocol.Storage.ClearTrustTokensRequest):
        Promise<Protocol.Storage.ClearTrustTokensResponse>;
  }
  export interface StorageDispatcher {
    /**
     * A cache's contents have been modified.
     */
    cacheStorageContentUpdated(params: Protocol.Storage.CacheStorageContentUpdatedEvent): void;

    /**
     * A cache has been added/deleted.
     */
    cacheStorageListUpdated(params: Protocol.Storage.CacheStorageListUpdatedEvent): void;

    /**
     * The origin's IndexedDB object store has been modified.
     */
    indexedDBContentUpdated(params: Protocol.Storage.IndexedDBContentUpdatedEvent): void;

    /**
     * The origin's IndexedDB database list has been modified.
     */
    indexedDBListUpdated(params: Protocol.Storage.IndexedDBListUpdatedEvent): void;
  }

  export interface SystemInfoApi {
    /**
     * Returns information about the system.
     */
    invoke_getInfo(): Promise<Protocol.SystemInfo.GetInfoResponse>;

    /**
     * Returns information about all running processes.
     */
    invoke_getProcessInfo(): Promise<Protocol.SystemInfo.GetProcessInfoResponse>;
  }
  export interface SystemInfoDispatcher {}

  export interface TargetApi {
    /**
     * Activates (focuses) the target.
     */
    invoke_activateTarget(params: Protocol.Target.ActivateTargetRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Attaches to the target with given id.
     */
    invoke_attachToTarget(params: Protocol.Target.AttachToTargetRequest):
        Promise<Protocol.Target.AttachToTargetResponse>;

    /**
     * Attaches to the browser target, only uses flat sessionId mode.
     */
    invoke_attachToBrowserTarget(): Promise<Protocol.Target.AttachToBrowserTargetResponse>;

    /**
     * Closes the target. If the target is a page that gets closed too.
     */
    invoke_closeTarget(params: Protocol.Target.CloseTargetRequest): Promise<Protocol.Target.CloseTargetResponse>;

    /**
     * Inject object to the target's main frame that provides a communication
     * channel with browser target.
     *
     * Injected object will be available as `window[bindingName]`.
     *
     * The object has the follwing API:
     * - `binding.send(json)` - a method to send messages over the remote debugging protocol
     * - `binding.onmessage = json => handleMessage(json)` - a callback that will be called for the protocol notifications and command responses.
     */
    invoke_exposeDevToolsProtocol(params: Protocol.Target.ExposeDevToolsProtocolRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Creates a new empty BrowserContext. Similar to an incognito profile but you can have more than
     * one.
     */
    invoke_createBrowserContext(params: Protocol.Target.CreateBrowserContextRequest):
        Promise<Protocol.Target.CreateBrowserContextResponse>;

    /**
     * Returns all browser contexts created with `Target.createBrowserContext` method.
     */
    invoke_getBrowserContexts(): Promise<Protocol.Target.GetBrowserContextsResponse>;

    /**
     * Creates a new page.
     */
    invoke_createTarget(params: Protocol.Target.CreateTargetRequest): Promise<Protocol.Target.CreateTargetResponse>;

    /**
     * Detaches session with given id.
     */
    invoke_detachFromTarget(params: Protocol.Target.DetachFromTargetRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Deletes a BrowserContext. All the belonging pages will be closed without calling their
     * beforeunload hooks.
     */
    invoke_disposeBrowserContext(params: Protocol.Target.DisposeBrowserContextRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns information about a target.
     */
    invoke_getTargetInfo(params: Protocol.Target.GetTargetInfoRequest): Promise<Protocol.Target.GetTargetInfoResponse>;

    /**
     * Retrieves a list of available targets.
     */
    invoke_getTargets(): Promise<Protocol.Target.GetTargetsResponse>;

    /**
     * Sends protocol message over session with given id.
     * Consider using flat mode instead; see commands attachToTarget, setAutoAttach,
     * and crbug.com/991325.
     */
    invoke_sendMessageToTarget(params: Protocol.Target.SendMessageToTargetRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Controls whether to automatically attach to new targets which are considered to be related to
     * this one. When turned on, attaches to all existing related targets as well. When turned off,
     * automatically detaches from all currently attached targets.
     */
    invoke_setAutoAttach(params: Protocol.Target.SetAutoAttachRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Controls whether to discover available targets and notify via
     * `targetCreated/targetInfoChanged/targetDestroyed` events.
     */
    invoke_setDiscoverTargets(params: Protocol.Target.SetDiscoverTargetsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables target discovery for the specified locations, when `setDiscoverTargets` was set to
     * `true`.
     */
    invoke_setRemoteLocations(params: Protocol.Target.SetRemoteLocationsRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface TargetDispatcher {
    /**
     * Issued when attached to target because of auto-attach or `attachToTarget` command.
     */
    attachedToTarget(params: Protocol.Target.AttachedToTargetEvent): void;

    /**
     * Issued when detached from target for any reason (including `detachFromTarget` command). Can be
     * issued multiple times per target if multiple sessions have been attached to it.
     */
    detachedFromTarget(params: Protocol.Target.DetachedFromTargetEvent): void;

    /**
     * Notifies about a new protocol message received from the session (as reported in
     * `attachedToTarget` event).
     */
    receivedMessageFromTarget(params: Protocol.Target.ReceivedMessageFromTargetEvent): void;

    /**
     * Issued when a possible inspection target is created.
     */
    targetCreated(params: Protocol.Target.TargetCreatedEvent): void;

    /**
     * Issued when a target is destroyed.
     */
    targetDestroyed(params: Protocol.Target.TargetDestroyedEvent): void;

    /**
     * Issued when a target has crashed.
     */
    targetCrashed(params: Protocol.Target.TargetCrashedEvent): void;

    /**
     * Issued when some information about a target has changed. This only happens between
     * `targetCreated` and `targetDestroyed`.
     */
    targetInfoChanged(params: Protocol.Target.TargetInfoChangedEvent): void;
  }

  export interface TetheringApi {
    /**
     * Request browser port binding.
     */
    invoke_bind(params: Protocol.Tethering.BindRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Request browser port unbinding.
     */
    invoke_unbind(params: Protocol.Tethering.UnbindRequest): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface TetheringDispatcher {
    /**
     * Informs that port was successfully bound and got a specified connection id.
     */
    accepted(params: Protocol.Tethering.AcceptedEvent): void;
  }

  export interface TracingApi {
    /**
     * Stop trace events collection.
     */
    invoke_end(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Gets supported tracing categories.
     */
    invoke_getCategories(): Promise<Protocol.Tracing.GetCategoriesResponse>;

    /**
     * Record a clock sync marker in the trace.
     */
    invoke_recordClockSyncMarker(params: Protocol.Tracing.RecordClockSyncMarkerRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Request a global memory dump.
     */
    invoke_requestMemoryDump(params: Protocol.Tracing.RequestMemoryDumpRequest):
        Promise<Protocol.Tracing.RequestMemoryDumpResponse>;

    /**
     * Start trace events collection.
     */
    invoke_start(params: Protocol.Tracing.StartRequest): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface TracingDispatcher {
    bufferUsage(params: Protocol.Tracing.BufferUsageEvent): void;

    /**
     * Contains an bucket of collected trace events. When tracing is stopped collected events will be
     * send as a sequence of dataCollected events followed by tracingComplete event.
     */
    dataCollected(params: Protocol.Tracing.DataCollectedEvent): void;

    /**
     * Signals that tracing is stopped and there is no trace buffers pending flush, all data were
     * delivered via dataCollected events.
     */
    tracingComplete(params: Protocol.Tracing.TracingCompleteEvent): void;
  }

  export interface FetchApi {
    /**
     * Disables the fetch domain.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables issuing of requestPaused events. A request will be paused until client
     * calls one of failRequest, fulfillRequest or continueRequest/continueWithAuth.
     */
    invoke_enable(params: Protocol.Fetch.EnableRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Causes the request to fail with specified reason.
     */
    invoke_failRequest(params: Protocol.Fetch.FailRequestRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Provides response to the request.
     */
    invoke_fulfillRequest(params: Protocol.Fetch.FulfillRequestRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Continues the request, optionally modifying some of its parameters.
     */
    invoke_continueRequest(params: Protocol.Fetch.ContinueRequestRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Continues a request supplying authChallengeResponse following authRequired event.
     */
    invoke_continueWithAuth(params: Protocol.Fetch.ContinueWithAuthRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Causes the body of the response to be received from the server and
     * returned as a single string. May only be issued for a request that
     * is paused in the Response stage and is mutually exclusive with
     * takeResponseBodyForInterceptionAsStream. Calling other methods that
     * affect the request or disabling fetch domain before body is received
     * results in an undefined behavior.
     */
    invoke_getResponseBody(params: Protocol.Fetch.GetResponseBodyRequest):
        Promise<Protocol.Fetch.GetResponseBodyResponse>;

    /**
     * Returns a handle to the stream representing the response body.
     * The request must be paused in the HeadersReceived stage.
     * Note that after this command the request can't be continued
     * as is -- client either needs to cancel it or to provide the
     * response body.
     * The stream only supports sequential read, IO.read will fail if the position
     * is specified.
     * This method is mutually exclusive with getResponseBody.
     * Calling other methods that affect the request or disabling fetch
     * domain before body is received results in an undefined behavior.
     */
    invoke_takeResponseBodyAsStream(params: Protocol.Fetch.TakeResponseBodyAsStreamRequest):
        Promise<Protocol.Fetch.TakeResponseBodyAsStreamResponse>;
  }
  export interface FetchDispatcher {
    /**
     * Issued when the domain is enabled and the request URL matches the
     * specified filter. The request is paused until the client responds
     * with one of continueRequest, failRequest or fulfillRequest.
     * The stage of the request can be determined by presence of responseErrorReason
     * and responseStatusCode -- the request is at the response stage if either
     * of these fields is present and in the request stage otherwise.
     */
    requestPaused(params: Protocol.Fetch.RequestPausedEvent): void;

    /**
     * Issued when the domain is enabled with handleAuthRequests set to true.
     * The request is paused until client responds with continueWithAuth.
     */
    authRequired(params: Protocol.Fetch.AuthRequiredEvent): void;
  }

  export interface WebAudioApi {
    /**
     * Enables the WebAudio domain and starts sending context lifetime events.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disables the WebAudio domain.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Fetch the realtime data from the registered contexts.
     */
    invoke_getRealtimeData(params: Protocol.WebAudio.GetRealtimeDataRequest):
        Promise<Protocol.WebAudio.GetRealtimeDataResponse>;
  }
  export interface WebAudioDispatcher {
    /**
     * Notifies that a new BaseAudioContext has been created.
     */
    contextCreated(params: Protocol.WebAudio.ContextCreatedEvent): void;

    /**
     * Notifies that an existing BaseAudioContext will be destroyed.
     */
    contextWillBeDestroyed(params: Protocol.WebAudio.ContextWillBeDestroyedEvent): void;

    /**
     * Notifies that existing BaseAudioContext has changed some properties (id stays the same)..
     */
    contextChanged(params: Protocol.WebAudio.ContextChangedEvent): void;

    /**
     * Notifies that the construction of an AudioListener has finished.
     */
    audioListenerCreated(params: Protocol.WebAudio.AudioListenerCreatedEvent): void;

    /**
     * Notifies that a new AudioListener has been created.
     */
    audioListenerWillBeDestroyed(params: Protocol.WebAudio.AudioListenerWillBeDestroyedEvent): void;

    /**
     * Notifies that a new AudioNode has been created.
     */
    audioNodeCreated(params: Protocol.WebAudio.AudioNodeCreatedEvent): void;

    /**
     * Notifies that an existing AudioNode has been destroyed.
     */
    audioNodeWillBeDestroyed(params: Protocol.WebAudio.AudioNodeWillBeDestroyedEvent): void;

    /**
     * Notifies that a new AudioParam has been created.
     */
    audioParamCreated(params: Protocol.WebAudio.AudioParamCreatedEvent): void;

    /**
     * Notifies that an existing AudioParam has been destroyed.
     */
    audioParamWillBeDestroyed(params: Protocol.WebAudio.AudioParamWillBeDestroyedEvent): void;

    /**
     * Notifies that two AudioNodes are connected.
     */
    nodesConnected(params: Protocol.WebAudio.NodesConnectedEvent): void;

    /**
     * Notifies that AudioNodes are disconnected. The destination can be null, and it means all the outgoing connections from the source are disconnected.
     */
    nodesDisconnected(params: Protocol.WebAudio.NodesDisconnectedEvent): void;

    /**
     * Notifies that an AudioNode is connected to an AudioParam.
     */
    nodeParamConnected(params: Protocol.WebAudio.NodeParamConnectedEvent): void;

    /**
     * Notifies that an AudioNode is disconnected to an AudioParam.
     */
    nodeParamDisconnected(params: Protocol.WebAudio.NodeParamDisconnectedEvent): void;
  }

  export interface WebAuthnApi {
    /**
     * Enable the WebAuthn domain and start intercepting credential storage and
     * retrieval with a virtual authenticator.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disable the WebAuthn domain.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Creates and adds a virtual authenticator.
     */
    invoke_addVirtualAuthenticator(params: Protocol.WebAuthn.AddVirtualAuthenticatorRequest):
        Promise<Protocol.WebAuthn.AddVirtualAuthenticatorResponse>;

    /**
     * Removes the given authenticator.
     */
    invoke_removeVirtualAuthenticator(params: Protocol.WebAuthn.RemoveVirtualAuthenticatorRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Adds the credential to the specified authenticator.
     */
    invoke_addCredential(params: Protocol.WebAuthn.AddCredentialRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Returns a single credential stored in the given virtual authenticator that
     * matches the credential ID.
     */
    invoke_getCredential(params: Protocol.WebAuthn.GetCredentialRequest):
        Promise<Protocol.WebAuthn.GetCredentialResponse>;

    /**
     * Returns all the credentials stored in the given virtual authenticator.
     */
    invoke_getCredentials(params: Protocol.WebAuthn.GetCredentialsRequest):
        Promise<Protocol.WebAuthn.GetCredentialsResponse>;

    /**
     * Removes a credential from the authenticator.
     */
    invoke_removeCredential(params: Protocol.WebAuthn.RemoveCredentialRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Clears all the credentials from the specified device.
     */
    invoke_clearCredentials(params: Protocol.WebAuthn.ClearCredentialsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets whether User Verification succeeds or fails for an authenticator.
     * The default is true.
     */
    invoke_setUserVerified(params: Protocol.WebAuthn.SetUserVerifiedRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets whether tests of user presence will succeed immediately (if true) or fail to resolve (if false) for an authenticator.
     * The default is true.
     */
    invoke_setAutomaticPresenceSimulation(params: Protocol.WebAuthn.SetAutomaticPresenceSimulationRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface WebAuthnDispatcher {}

  export interface MediaApi {
    /**
     * Enables the Media domain
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disables the Media domain.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface MediaDispatcher {
    /**
     * This can be called multiple times, and can be used to set / override /
     * remove player properties. A null propValue indicates removal.
     */
    playerPropertiesChanged(params: Protocol.Media.PlayerPropertiesChangedEvent): void;

    /**
     * Send events as a list, allowing them to be batched on the browser for less
     * congestion. If batched, events must ALWAYS be in chronological order.
     */
    playerEventsAdded(params: Protocol.Media.PlayerEventsAddedEvent): void;

    /**
     * Send a list of any messages that need to be delivered.
     */
    playerMessagesLogged(params: Protocol.Media.PlayerMessagesLoggedEvent): void;

    /**
     * Send a list of any errors that need to be delivered.
     */
    playerErrorsRaised(params: Protocol.Media.PlayerErrorsRaisedEvent): void;

    /**
     * Called whenever a player is created, or when a new agent joins and receives
     * a list of active players. If an agent is restored, it will receive the full
     * list of player ids and all events again.
     */
    playersCreated(params: Protocol.Media.PlayersCreatedEvent): void;

  }

  export interface DebuggerApi {
    /**
     * Continues execution until specific location is reached.
     */
    invoke_continueToLocation(params: Protocol.Debugger.ContinueToLocationRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disables debugger for given page.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables debugger for the given page. Clients should not assume that the debugging has been
     * enabled until the result for this command is received.
     */
    invoke_enable(params: Protocol.Debugger.EnableRequest): Promise<Protocol.Debugger.EnableResponse>;

    /**
     * Evaluates expression on a given call frame.
     */
    invoke_evaluateOnCallFrame(params: Protocol.Debugger.EvaluateOnCallFrameRequest):
        Promise<Protocol.Debugger.EvaluateOnCallFrameResponse>;

    /**
     * Returns possible locations for breakpoint. scriptId in start and end range locations should be
     * the same.
     */
    invoke_getPossibleBreakpoints(params: Protocol.Debugger.GetPossibleBreakpointsRequest):
        Promise<Protocol.Debugger.GetPossibleBreakpointsResponse>;

    /**
     * Returns source for the script with given id.
     */
    invoke_getScriptSource(params: Protocol.Debugger.GetScriptSourceRequest):
        Promise<Protocol.Debugger.GetScriptSourceResponse>;

    /**
     * This command is deprecated. Use getScriptSource instead.
     */
    invoke_getWasmBytecode(params: Protocol.Debugger.GetWasmBytecodeRequest):
        Promise<Protocol.Debugger.GetWasmBytecodeResponse>;

    /**
     * Returns stack trace with given `stackTraceId`.
     */
    invoke_getStackTrace(params: Protocol.Debugger.GetStackTraceRequest):
        Promise<Protocol.Debugger.GetStackTraceResponse>;

    /**
     * Stops on the next JavaScript statement.
     */
    invoke_pause(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_pauseOnAsyncCall(params: Protocol.Debugger.PauseOnAsyncCallRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Removes JavaScript breakpoint.
     */
    invoke_removeBreakpoint(params: Protocol.Debugger.RemoveBreakpointRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Restarts particular call frame from the beginning.
     */
    invoke_restartFrame(params: Protocol.Debugger.RestartFrameRequest): Promise<Protocol.Debugger.RestartFrameResponse>;

    /**
     * Resumes JavaScript execution.
     */
    invoke_resume(params: Protocol.Debugger.ResumeRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Searches for given string in script content.
     */
    invoke_searchInContent(params: Protocol.Debugger.SearchInContentRequest):
        Promise<Protocol.Debugger.SearchInContentResponse>;

    /**
     * Enables or disables async call stacks tracking.
     */
    invoke_setAsyncCallStackDepth(params: Protocol.Debugger.SetAsyncCallStackDepthRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Replace previous blackbox patterns with passed ones. Forces backend to skip stepping/pausing in
     * scripts with url matching one of the patterns. VM will try to leave blackboxed script by
     * performing 'step in' several times, finally resorting to 'step out' if unsuccessful.
     */
    invoke_setBlackboxPatterns(params: Protocol.Debugger.SetBlackboxPatternsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Makes backend skip steps in the script in blackboxed ranges. VM will try leave blacklisted
     * scripts by performing 'step in' several times, finally resorting to 'step out' if unsuccessful.
     * Positions array contains positions where blackbox state is changed. First interval isn't
     * blackboxed. Array should be sorted.
     */
    invoke_setBlackboxedRanges(params: Protocol.Debugger.SetBlackboxedRangesRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Sets JavaScript breakpoint at a given location.
     */
    invoke_setBreakpoint(params: Protocol.Debugger.SetBreakpointRequest):
        Promise<Protocol.Debugger.SetBreakpointResponse>;

    /**
     * Sets instrumentation breakpoint.
     */
    invoke_setInstrumentationBreakpoint(params: Protocol.Debugger.SetInstrumentationBreakpointRequest):
        Promise<Protocol.Debugger.SetInstrumentationBreakpointResponse>;

    /**
     * Sets JavaScript breakpoint at given location specified either by URL or URL regex. Once this
     * command is issued, all existing parsed scripts will have breakpoints resolved and returned in
     * `locations` property. Further matching script parsing will result in subsequent
     * `breakpointResolved` events issued. This logical breakpoint will survive page reloads.
     */
    invoke_setBreakpointByUrl(params: Protocol.Debugger.SetBreakpointByUrlRequest):
        Promise<Protocol.Debugger.SetBreakpointByUrlResponse>;

    /**
     * Sets JavaScript breakpoint before each call to the given function.
     * If another function was created from the same source as a given one,
     * calling it will also trigger the breakpoint.
     */
    invoke_setBreakpointOnFunctionCall(params: Protocol.Debugger.SetBreakpointOnFunctionCallRequest):
        Promise<Protocol.Debugger.SetBreakpointOnFunctionCallResponse>;

    /**
     * Activates / deactivates all breakpoints on the page.
     */
    invoke_setBreakpointsActive(params: Protocol.Debugger.SetBreakpointsActiveRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Defines pause on exceptions state. Can be set to stop on all exceptions, uncaught exceptions or
     * no exceptions. Initial pause on exceptions state is `none`.
     */
    invoke_setPauseOnExceptions(params: Protocol.Debugger.SetPauseOnExceptionsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Changes return value in top frame. Available only at return break position.
     */
    invoke_setReturnValue(params: Protocol.Debugger.SetReturnValueRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Edits JavaScript source live.
     */
    invoke_setScriptSource(params: Protocol.Debugger.SetScriptSourceRequest):
        Promise<Protocol.Debugger.SetScriptSourceResponse>;

    /**
     * Makes page not interrupt on any pauses (breakpoint, exception, dom exception etc).
     */
    invoke_setSkipAllPauses(params: Protocol.Debugger.SetSkipAllPausesRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Changes value of variable in a callframe. Object-based scopes are not supported and must be
     * mutated manually.
     */
    invoke_setVariableValue(params: Protocol.Debugger.SetVariableValueRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Steps into the function call.
     */
    invoke_stepInto(params: Protocol.Debugger.StepIntoRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Steps out of the function call.
     */
    invoke_stepOut(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Steps over the statement.
     */
    invoke_stepOver(params: Protocol.Debugger.StepOverRequest): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface DebuggerDispatcher {
    /**
     * Fired when breakpoint is resolved to an actual script and location.
     */
    breakpointResolved(params: Protocol.Debugger.BreakpointResolvedEvent): void;

    /**
     * Fired when the virtual machine stopped on breakpoint or exception or any other stop criteria.
     */
    paused(params: Protocol.Debugger.PausedEvent): void;

    /**
     * Fired when the virtual machine resumed execution.
     */
    resumed(): void;

    /**
     * Fired when virtual machine fails to parse the script.
     */
    scriptFailedToParse(params: Protocol.Debugger.ScriptFailedToParseEvent): void;

    /**
     * Fired when virtual machine parses script. This event is also fired for all known and uncollected
     * scripts upon enabling debugger.
     */
    scriptParsed(params: Protocol.Debugger.ScriptParsedEvent): void;
  }

  export interface HeapProfilerApi {
    /**
     * Enables console to refer to the node with given id via $x (see Command Line API for more details
     * $x functions).
     */
    invoke_addInspectedHeapObject(params: Protocol.HeapProfiler.AddInspectedHeapObjectRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_collectGarbage(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_getHeapObjectId(params: Protocol.HeapProfiler.GetHeapObjectIdRequest):
        Promise<Protocol.HeapProfiler.GetHeapObjectIdResponse>;

    invoke_getObjectByHeapObjectId(params: Protocol.HeapProfiler.GetObjectByHeapObjectIdRequest):
        Promise<Protocol.HeapProfiler.GetObjectByHeapObjectIdResponse>;

    invoke_getSamplingProfile(): Promise<Protocol.HeapProfiler.GetSamplingProfileResponse>;

    invoke_startSampling(params: Protocol.HeapProfiler.StartSamplingRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_startTrackingHeapObjects(params: Protocol.HeapProfiler.StartTrackingHeapObjectsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_stopSampling(): Promise<Protocol.HeapProfiler.StopSamplingResponse>;

    invoke_stopTrackingHeapObjects(params: Protocol.HeapProfiler.StopTrackingHeapObjectsRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_takeHeapSnapshot(params: Protocol.HeapProfiler.TakeHeapSnapshotRequest):
        Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface HeapProfilerDispatcher {
    addHeapSnapshotChunk(params: Protocol.HeapProfiler.AddHeapSnapshotChunkEvent): void;

    /**
     * If heap objects tracking has been started then backend may send update for one or more fragments
     */
    heapStatsUpdate(params: Protocol.HeapProfiler.HeapStatsUpdateEvent): void;

    /**
     * If heap objects tracking has been started then backend regularly sends a current value for last
     * seen object id and corresponding timestamp. If the were changes in the heap since last event
     * then one or more heapStatsUpdate events will be sent before a new lastSeenObjectId event.
     */
    lastSeenObjectId(params: Protocol.HeapProfiler.LastSeenObjectIdEvent): void;

    reportHeapSnapshotProgress(params: Protocol.HeapProfiler.ReportHeapSnapshotProgressEvent): void;

    resetProfiles(): void;
  }

  export interface ProfilerApi {
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Collect coverage data for the current isolate. The coverage data may be incomplete due to
     * garbage collection.
     */
    invoke_getBestEffortCoverage(): Promise<Protocol.Profiler.GetBestEffortCoverageResponse>;

    /**
     * Changes CPU profiler sampling interval. Must be called before CPU profiles recording started.
     */
    invoke_setSamplingInterval(params: Protocol.Profiler.SetSamplingIntervalRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_start(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enable precise code coverage. Coverage data for JavaScript executed before enabling precise code
     * coverage may be incomplete. Enabling prevents running optimized code and resets execution
     * counters.
     */
    invoke_startPreciseCoverage(params: Protocol.Profiler.StartPreciseCoverageRequest):
        Promise<Protocol.Profiler.StartPreciseCoverageResponse>;

    /**
     * Enable type profile.
     */
    invoke_startTypeProfile(): Promise<Protocol.ProtocolResponseWithError>;

    invoke_stop(): Promise<Protocol.Profiler.StopResponse>;

    /**
     * Disable precise code coverage. Disabling releases unnecessary execution count records and allows
     * executing optimized code.
     */
    invoke_stopPreciseCoverage(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disable type profile. Disabling releases type profile data collected so far.
     */
    invoke_stopTypeProfile(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Collect coverage data for the current isolate, and resets execution counters. Precise code
     * coverage needs to have started.
     */
    invoke_takePreciseCoverage(): Promise<Protocol.Profiler.TakePreciseCoverageResponse>;

    /**
     * Collect type profile.
     */
    invoke_takeTypeProfile(): Promise<Protocol.Profiler.TakeTypeProfileResponse>;

    /**
     * Enable counters collection.
     */
    invoke_enableCounters(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disable counters collection.
     */
    invoke_disableCounters(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Retrieve counters.
     */
    invoke_getCounters(): Promise<Protocol.Profiler.GetCountersResponse>;

    /**
     * Enable run time call stats collection.
     */
    invoke_enableRuntimeCallStats(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Disable run time call stats collection.
     */
    invoke_disableRuntimeCallStats(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Retrieve run time call stats.
     */
    invoke_getRuntimeCallStats(): Promise<Protocol.Profiler.GetRuntimeCallStatsResponse>;
  }
  export interface ProfilerDispatcher {
    consoleProfileFinished(params: Protocol.Profiler.ConsoleProfileFinishedEvent): void;

    /**
     * Sent when new profile recording is started using console.profile() call.
     */
    consoleProfileStarted(params: Protocol.Profiler.ConsoleProfileStartedEvent): void;

    /**
     * Reports coverage delta since the last poll (either from an event like this, or from
     * `takePreciseCoverage` for the current isolate. May only be sent if precise code
     * coverage has been started. This event can be trigged by the embedder to, for example,
     * trigger collection of coverage data immediately at a certain point in time.
     */
    preciseCoverageDeltaUpdate(params: Protocol.Profiler.PreciseCoverageDeltaUpdateEvent): void;
  }

  export interface RuntimeApi {
    /**
     * Add handler to promise with given promise object id.
     */
    invoke_awaitPromise(params: Protocol.Runtime.AwaitPromiseRequest): Promise<Protocol.Runtime.AwaitPromiseResponse>;

    /**
     * Calls function with given declaration on the given object. Object group of the result is
     * inherited from the target object.
     */
    invoke_callFunctionOn(params: Protocol.Runtime.CallFunctionOnRequest):
        Promise<Protocol.Runtime.CallFunctionOnResponse>;

    /**
     * Compiles expression.
     */
    invoke_compileScript(params: Protocol.Runtime.CompileScriptRequest):
        Promise<Protocol.Runtime.CompileScriptResponse>;

    /**
     * Disables reporting of execution contexts creation.
     */
    invoke_disable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Discards collected exceptions and console API calls.
     */
    invoke_discardConsoleEntries(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Enables reporting of execution contexts creation by means of `executionContextCreated` event.
     * When the reporting gets enabled the event will be sent immediately for each existing execution
     * context.
     */
    invoke_enable(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Evaluates expression on global object.
     */
    invoke_evaluate(params: Protocol.Runtime.EvaluateRequest): Promise<Protocol.Runtime.EvaluateResponse>;

    /**
     * Returns the isolate id.
     */
    invoke_getIsolateId(): Promise<Protocol.Runtime.GetIsolateIdResponse>;

    /**
     * Returns the JavaScript heap usage.
     * It is the total usage of the corresponding isolate not scoped to a particular Runtime.
     */
    invoke_getHeapUsage(): Promise<Protocol.Runtime.GetHeapUsageResponse>;

    /**
     * Returns properties of a given object. Object group of the result is inherited from the target
     * object.
     */
    invoke_getProperties(params: Protocol.Runtime.GetPropertiesRequest):
        Promise<Protocol.Runtime.GetPropertiesResponse>;

    /**
     * Returns all let, const and class variables from global scope.
     */
    invoke_globalLexicalScopeNames(params: Protocol.Runtime.GlobalLexicalScopeNamesRequest):
        Promise<Protocol.Runtime.GlobalLexicalScopeNamesResponse>;

    invoke_queryObjects(params: Protocol.Runtime.QueryObjectsRequest): Promise<Protocol.Runtime.QueryObjectsResponse>;

    /**
     * Releases remote object with given id.
     */
    invoke_releaseObject(params: Protocol.Runtime.ReleaseObjectRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Releases all remote objects that belong to a given group.
     */
    invoke_releaseObjectGroup(params: Protocol.Runtime.ReleaseObjectGroupRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Tells inspected instance to run if it was waiting for debugger to attach.
     */
    invoke_runIfWaitingForDebugger(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Runs script with given id in a given context.
     */
    invoke_runScript(params: Protocol.Runtime.RunScriptRequest): Promise<Protocol.Runtime.RunScriptResponse>;

    /**
     * Enables or disables async call stacks tracking.
     */
    invoke_setAsyncCallStackDepth(params: Protocol.Runtime.SetAsyncCallStackDepthRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_setCustomObjectFormatterEnabled(params: Protocol.Runtime.SetCustomObjectFormatterEnabledRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    invoke_setMaxCallStackSizeToCapture(params: Protocol.Runtime.SetMaxCallStackSizeToCaptureRequest):
        Promise<Protocol.ProtocolResponseWithError>;

    /**
     * Terminate current or next JavaScript execution.
     * Will cancel the termination when the outer-most script execution ends.
     */
    invoke_terminateExecution(): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * If executionContextId is empty, adds binding with the given name on the
     * global objects of all inspected contexts, including those created later,
     * bindings survive reloads.
     * Binding function takes exactly one argument, this argument should be string,
     * in case of any other input, function throws an exception.
     * Each binding function call produces Runtime.bindingCalled notification.
     */
    invoke_addBinding(params: Protocol.Runtime.AddBindingRequest): Promise<Protocol.ProtocolResponseWithError>;

    /**
     * This method does not remove binding function from global object but
     * unsubscribes current runtime agent from Runtime.bindingCalled notifications.
     */
    invoke_removeBinding(params: Protocol.Runtime.RemoveBindingRequest): Promise<Protocol.ProtocolResponseWithError>;
  }
  export interface RuntimeDispatcher {
    /**
     * Notification is issued every time when binding is called.
     */
    bindingCalled(params: Protocol.Runtime.BindingCalledEvent): void;

    /**
     * Issued when console API was called.
     */
    consoleAPICalled(params: Protocol.Runtime.ConsoleAPICalledEvent): void;

    /**
     * Issued when unhandled exception was revoked.
     */
    exceptionRevoked(params: Protocol.Runtime.ExceptionRevokedEvent): void;

    /**
     * Issued when exception was thrown and unhandled.
     */
    exceptionThrown(params: Protocol.Runtime.ExceptionThrownEvent): void;

    /**
     * Issued when new execution context is created.
     */
    executionContextCreated(params: Protocol.Runtime.ExecutionContextCreatedEvent): void;

    /**
     * Issued when execution context is destroyed.
     */
    executionContextDestroyed(params: Protocol.Runtime.ExecutionContextDestroyedEvent): void;

    /**
     * Issued when all executionContexts were cleared in browser
     */
    executionContextsCleared(): void;

    /**
     * Issued when object should be inspected (for example, as a result of inspect() command line API
     * call).
     */
    inspectRequested(params: Protocol.Runtime.InspectRequestedEvent): void;
  }

  export interface SchemaApi {
    /**
     * Returns supported domains.
     */
    invoke_getDomains(): Promise<Protocol.Schema.GetDomainsResponse>;
  }
  export interface SchemaDispatcher {}
}

export = ProtocolProxyApi;
