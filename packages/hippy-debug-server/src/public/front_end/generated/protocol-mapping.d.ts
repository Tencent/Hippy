// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This file is auto-generated, do not edit manually. *
 * Re-generate with: npm run generate-protocol-resources.
 */

/**
 * Mappings from protocol event and command names to the types required for them.
 */
export namespace ProtocolMapping {
  export interface Events {
    /**
     * Event for when an animation has been cancelled.
     */
    'Animation.animationCanceled': [Protocol.Animation.AnimationCanceledEvent];
    /**
     * Event for each animation that has been created.
     */
    'Animation.animationCreated': [Protocol.Animation.AnimationCreatedEvent];
    /**
     * Event for animation that has been started.
     */
    'Animation.animationStarted': [Protocol.Animation.AnimationStartedEvent];
    'ApplicationCache.applicationCacheStatusUpdated': [Protocol.ApplicationCache.ApplicationCacheStatusUpdatedEvent];
    'ApplicationCache.networkStateUpdated': [Protocol.ApplicationCache.NetworkStateUpdatedEvent];
    'Audits.issueAdded': [Protocol.Audits.IssueAddedEvent];
    /**
     * Called when the recording state for the service has been updated.
     */
    'BackgroundService.recordingStateChanged': [Protocol.BackgroundService.RecordingStateChangedEvent];
    /**
     * Called with all existing backgroundServiceEvents when enabled, and all new
     * events afterwards if enabled and recording.
     */
    'BackgroundService.backgroundServiceEventReceived':
        [Protocol.BackgroundService.BackgroundServiceEventReceivedEvent];
    /**
     * Fired when page is about to start a download.
     */
    'Browser.downloadWillBegin': [Protocol.Browser.DownloadWillBeginEvent];
    /**
     * Fired when download makes progress. Last call has |done| == true.
     */
    'Browser.downloadProgress': [Protocol.Browser.DownloadProgressEvent];
    /**
     * Fires whenever a web font is updated.  A non-empty font parameter indicates a successfully loaded
     * web font
     */
    'CSS.fontsUpdated': [Protocol.CSS.FontsUpdatedEvent];
    /**
     * Fires whenever a MediaQuery result changes (for example, after a browser window has been
     * resized.) The current implementation considers only viewport-dependent media features.
     */
    'CSS.mediaQueryResultChanged': [];
    /**
     * Fired whenever an active document stylesheet is added.
     */
    'CSS.styleSheetAdded': [Protocol.CSS.StyleSheetAddedEvent];
    /**
     * Fired whenever a stylesheet is changed as a result of the client operation.
     */
    'CSS.styleSheetChanged': [Protocol.CSS.StyleSheetChangedEvent];
    /**
     * Fired whenever an active document stylesheet is removed.
     */
    'CSS.styleSheetRemoved': [Protocol.CSS.StyleSheetRemovedEvent];
    /**
     * This is fired whenever the list of available sinks changes. A sink is a
     * device or a software surface that you can cast to.
     */
    'Cast.sinksUpdated': [Protocol.Cast.SinksUpdatedEvent];
    /**
     * This is fired whenever the outstanding issue/error message changes.
     * |issueMessage| is empty if there is no issue.
     */
    'Cast.issueUpdated': [Protocol.Cast.IssueUpdatedEvent];
    /**
     * Fired when `Element`'s attribute is modified.
     */
    'DOM.attributeModified': [Protocol.DOM.AttributeModifiedEvent];
    /**
     * Fired when `Element`'s attribute is removed.
     */
    'DOM.attributeRemoved': [Protocol.DOM.AttributeRemovedEvent];
    /**
     * Mirrors `DOMCharacterDataModified` event.
     */
    'DOM.characterDataModified': [Protocol.DOM.CharacterDataModifiedEvent];
    /**
     * Fired when `Container`'s child node count has changed.
     */
    'DOM.childNodeCountUpdated': [Protocol.DOM.ChildNodeCountUpdatedEvent];
    /**
     * Mirrors `DOMNodeInserted` event.
     */
    'DOM.childNodeInserted': [Protocol.DOM.ChildNodeInsertedEvent];
    /**
     * Mirrors `DOMNodeRemoved` event.
     */
    'DOM.childNodeRemoved': [Protocol.DOM.ChildNodeRemovedEvent];
    /**
     * Called when distribution is changed.
     */
    'DOM.distributedNodesUpdated': [Protocol.DOM.DistributedNodesUpdatedEvent];
    /**
     * Fired when `Document` has been totally updated. Node ids are no longer valid.
     */
    'DOM.documentUpdated': [];
    /**
     * Fired when `Element`'s inline style is modified via a CSS property modification.
     */
    'DOM.inlineStyleInvalidated': [Protocol.DOM.InlineStyleInvalidatedEvent];
    /**
     * Called when a pseudo element is added to an element.
     */
    'DOM.pseudoElementAdded': [Protocol.DOM.PseudoElementAddedEvent];
    /**
     * Called when a pseudo element is removed from an element.
     */
    'DOM.pseudoElementRemoved': [Protocol.DOM.PseudoElementRemovedEvent];
    /**
     * Fired when backend wants to provide client with the missing DOM structure. This happens upon
     * most of the calls requesting node ids.
     */
    'DOM.setChildNodes': [Protocol.DOM.SetChildNodesEvent];
    /**
     * Called when shadow root is popped from the element.
     */
    'DOM.shadowRootPopped': [Protocol.DOM.ShadowRootPoppedEvent];
    /**
     * Called when shadow root is pushed into the element.
     */
    'DOM.shadowRootPushed': [Protocol.DOM.ShadowRootPushedEvent];
    'DOMStorage.domStorageItemAdded': [Protocol.DOMStorage.DomStorageItemAddedEvent];
    'DOMStorage.domStorageItemRemoved': [Protocol.DOMStorage.DomStorageItemRemovedEvent];
    'DOMStorage.domStorageItemUpdated': [Protocol.DOMStorage.DomStorageItemUpdatedEvent];
    'DOMStorage.domStorageItemsCleared': [Protocol.DOMStorage.DomStorageItemsClearedEvent];
    'Database.addDatabase': [Protocol.Database.AddDatabaseEvent];
    /**
     * Notification sent after the virtual time budget for the current VirtualTimePolicy has run out.
     */
    'Emulation.virtualTimeBudgetExpired': [];
    /**
     * Issued when the target starts or stops needing BeginFrames.
     * Deprecated. Issue beginFrame unconditionally instead and use result from
     * beginFrame to detect whether the frames were suppressed.
     */
    'HeadlessExperimental.needsBeginFramesChanged': [Protocol.HeadlessExperimental.NeedsBeginFramesChangedEvent];
    /**
     * Emitted only when `Input.setInterceptDrags` is enabled. Use this data with `Input.dispatchDragEvent` to
     * restore normal drag and drop behavior.
     */
    'Input.dragIntercepted': [Protocol.Input.DragInterceptedEvent];
    /**
     * Fired when remote debugging connection is about to be terminated. Contains detach reason.
     */
    'Inspector.detached': [Protocol.Inspector.DetachedEvent];
    /**
     * Fired when debugging target has crashed
     */
    'Inspector.targetCrashed': [];
    /**
     * Fired when debugging target has reloaded after crash
     */
    'Inspector.targetReloadedAfterCrash': [];
    'LayerTree.layerPainted': [Protocol.LayerTree.LayerPaintedEvent];
    'LayerTree.layerTreeDidChange': [Protocol.LayerTree.LayerTreeDidChangeEvent];
    /**
     * Issued when new message was logged.
     */
    'Log.entryAdded': [Protocol.Log.EntryAddedEvent];
    /**
     * Fired when data chunk was received over the network.
     */
    'Network.dataReceived': [Protocol.Network.DataReceivedEvent];
    /**
     * Fired when EventSource message is received.
     */
    'Network.eventSourceMessageReceived': [Protocol.Network.EventSourceMessageReceivedEvent];
    /**
     * Fired when HTTP request has failed to load.
     */
    'Network.loadingFailed': [Protocol.Network.LoadingFailedEvent];
    /**
     * Fired when HTTP request has finished loading.
     */
    'Network.loadingFinished': [Protocol.Network.LoadingFinishedEvent];
    /**
     * Details of an intercepted HTTP request, which must be either allowed, blocked, modified or
     * mocked.
     * Deprecated, use Fetch.requestPaused instead.
     */
    'Network.requestIntercepted': [Protocol.Network.RequestInterceptedEvent];
    /**
     * Fired if request ended up loading from cache.
     */
    'Network.requestServedFromCache': [Protocol.Network.RequestServedFromCacheEvent];
    /**
     * Fired when page is about to send HTTP request.
     */
    'Network.requestWillBeSent': [Protocol.Network.RequestWillBeSentEvent];
    /**
     * Fired when resource loading priority is changed
     */
    'Network.resourceChangedPriority': [Protocol.Network.ResourceChangedPriorityEvent];
    /**
     * Fired when a signed exchange was received over the network
     */
    'Network.signedExchangeReceived': [Protocol.Network.SignedExchangeReceivedEvent];
    /**
     * Fired when HTTP response is available.
     */
    'Network.responseReceived': [Protocol.Network.ResponseReceivedEvent];
    /**
     * Fired when WebSocket is closed.
     */
    'Network.webSocketClosed': [Protocol.Network.WebSocketClosedEvent];
    /**
     * Fired upon WebSocket creation.
     */
    'Network.webSocketCreated': [Protocol.Network.WebSocketCreatedEvent];
    /**
     * Fired when WebSocket message error occurs.
     */
    'Network.webSocketFrameError': [Protocol.Network.WebSocketFrameErrorEvent];
    /**
     * Fired when WebSocket message is received.
     */
    'Network.webSocketFrameReceived': [Protocol.Network.WebSocketFrameReceivedEvent];
    /**
     * Fired when WebSocket message is sent.
     */
    'Network.webSocketFrameSent': [Protocol.Network.WebSocketFrameSentEvent];
    /**
     * Fired when WebSocket handshake response becomes available.
     */
    'Network.webSocketHandshakeResponseReceived': [Protocol.Network.WebSocketHandshakeResponseReceivedEvent];
    /**
     * Fired when WebSocket is about to initiate handshake.
     */
    'Network.webSocketWillSendHandshakeRequest': [Protocol.Network.WebSocketWillSendHandshakeRequestEvent];
    /**
     * Fired upon WebTransport creation.
     */
    'Network.webTransportCreated': [Protocol.Network.WebTransportCreatedEvent];
    /**
     * Fired when WebTransport handshake is finished.
     */
    'Network.webTransportConnectionEstablished': [Protocol.Network.WebTransportConnectionEstablishedEvent];
    /**
     * Fired when WebTransport is disposed.
     */
    'Network.webTransportClosed': [Protocol.Network.WebTransportClosedEvent];
    /**
     * Fired when additional information about a requestWillBeSent event is available from the
     * network stack. Not every requestWillBeSent event will have an additional
     * requestWillBeSentExtraInfo fired for it, and there is no guarantee whether requestWillBeSent
     * or requestWillBeSentExtraInfo will be fired first for the same request.
     */
    'Network.requestWillBeSentExtraInfo': [Protocol.Network.RequestWillBeSentExtraInfoEvent];
    /**
     * Fired when additional information about a responseReceived event is available from the network
     * stack. Not every responseReceived event will have an additional responseReceivedExtraInfo for
     * it, and responseReceivedExtraInfo may be fired before or after responseReceived.
     */
    'Network.responseReceivedExtraInfo': [Protocol.Network.ResponseReceivedExtraInfoEvent];
    /**
     * Fired exactly once for each Trust Token operation. Depending on
     * the type of the operation and whether the operation succeeded or
     * failed, the event is fired before the corresponding request was sent
     * or after the response was received.
     */
    'Network.trustTokenOperationDone': [Protocol.Network.TrustTokenOperationDoneEvent];
    /**
     * Fired once when parsing the .wbn file has succeeded.
     * The event contains the information about the web bundle contents.
     */
    'Network.subresourceWebBundleMetadataReceived': [Protocol.Network.SubresourceWebBundleMetadataReceivedEvent];
    /**
     * Fired once when parsing the .wbn file has failed.
     */
    'Network.subresourceWebBundleMetadataError': [Protocol.Network.SubresourceWebBundleMetadataErrorEvent];
    /**
     * Fired when handling requests for resources within a .wbn file.
     * Note: this will only be fired for resources that are requested by the webpage.
     */
    'Network.subresourceWebBundleInnerResponseParsed': [Protocol.Network.SubresourceWebBundleInnerResponseParsedEvent];
    /**
     * Fired when request for resources within a .wbn file failed.
     */
    'Network.subresourceWebBundleInnerResponseError': [Protocol.Network.SubresourceWebBundleInnerResponseErrorEvent];
    /**
     * Fired when the node should be inspected. This happens after call to `setInspectMode` or when
     * user manually inspects an element.
     */
    'Overlay.inspectNodeRequested': [Protocol.Overlay.InspectNodeRequestedEvent];
    /**
     * Fired when the node should be highlighted. This happens after call to `setInspectMode`.
     */
    'Overlay.nodeHighlightRequested': [Protocol.Overlay.NodeHighlightRequestedEvent];
    /**
     * Fired when user asks to capture screenshot of some area on the page.
     */
    'Overlay.screenshotRequested': [Protocol.Overlay.ScreenshotRequestedEvent];
    /**
     * Fired when user cancels the inspect mode.
     */
    'Overlay.inspectModeCanceled': [];
    'Page.domContentEventFired': [Protocol.Page.DomContentEventFiredEvent];
    /**
     * Emitted only when `page.interceptFileChooser` is enabled.
     */
    'Page.fileChooserOpened': [Protocol.Page.FileChooserOpenedEvent];
    /**
     * Fired when frame has been attached to its parent.
     */
    'Page.frameAttached': [Protocol.Page.FrameAttachedEvent];
    /**
     * Fired when frame no longer has a scheduled navigation.
     */
    'Page.frameClearedScheduledNavigation': [Protocol.Page.FrameClearedScheduledNavigationEvent];
    /**
     * Fired when frame has been detached from its parent.
     */
    'Page.frameDetached': [Protocol.Page.FrameDetachedEvent];
    /**
     * Fired once navigation of the frame has completed. Frame is now associated with the new loader.
     */
    'Page.frameNavigated': [Protocol.Page.FrameNavigatedEvent];
    /**
     * Fired when opening document to write to.
     */
    'Page.documentOpened': [Protocol.Page.DocumentOpenedEvent];
    'Page.frameResized': [];
    /**
     * Fired when a renderer-initiated navigation is requested.
     * Navigation may still be cancelled after the event is issued.
     */
    'Page.frameRequestedNavigation': [Protocol.Page.FrameRequestedNavigationEvent];
    /**
     * Fired when frame schedules a potential navigation.
     */
    'Page.frameScheduledNavigation': [Protocol.Page.FrameScheduledNavigationEvent];
    /**
     * Fired when frame has started loading.
     */
    'Page.frameStartedLoading': [Protocol.Page.FrameStartedLoadingEvent];
    /**
     * Fired when frame has stopped loading.
     */
    'Page.frameStoppedLoading': [Protocol.Page.FrameStoppedLoadingEvent];
    /**
     * Fired when page is about to start a download.
     * Deprecated. Use Browser.downloadWillBegin instead.
     */
    'Page.downloadWillBegin': [Protocol.Page.DownloadWillBeginEvent];
    /**
     * Fired when download makes progress. Last call has |done| == true.
     * Deprecated. Use Browser.downloadProgress instead.
     */
    'Page.downloadProgress': [Protocol.Page.DownloadProgressEvent];
    /**
     * Fired when interstitial page was hidden
     */
    'Page.interstitialHidden': [];
    /**
     * Fired when interstitial page was shown
     */
    'Page.interstitialShown': [];
    /**
     * Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) has been
     * closed.
     */
    'Page.javascriptDialogClosed': [Protocol.Page.JavascriptDialogClosedEvent];
    /**
     * Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) is about to
     * open.
     */
    'Page.javascriptDialogOpening': [Protocol.Page.JavascriptDialogOpeningEvent];
    /**
     * Fired for top level page lifecycle events such as navigation, load, paint, etc.
     */
    'Page.lifecycleEvent': [Protocol.Page.LifecycleEventEvent];
    /**
     * Fired for failed bfcache history navigations if BackForwardCache feature is enabled. Do
     * not assume any ordering with the Page.frameNavigated event. This event is fired only for
     * main-frame history navigation where the document changes (non-same-document navigations),
     * when bfcache navigation fails.
     */
    'Page.backForwardCacheNotUsed': [Protocol.Page.BackForwardCacheNotUsedEvent];
    'Page.loadEventFired': [Protocol.Page.LoadEventFiredEvent];
    /**
     * Fired when same-document navigation happens, e.g. due to history API usage or anchor navigation.
     */
    'Page.navigatedWithinDocument': [Protocol.Page.NavigatedWithinDocumentEvent];
    /**
     * Compressed image data requested by the `startScreencast`.
     */
    'Page.screencastFrame': [Protocol.Page.ScreencastFrameEvent];
    /**
     * Fired when the page with currently enabled screencast was shown or hidden `.
     */
    'Page.screencastVisibilityChanged': [Protocol.Page.ScreencastVisibilityChangedEvent];
    /**
     * Fired when a new window is going to be opened, via window.open(), link click, form submission,
     * etc.
     */
    'Page.windowOpen': [Protocol.Page.WindowOpenEvent];
    /**
     * Issued for every compilation cache generated. Is only available
     * if Page.setGenerateCompilationCache is enabled.
     */
    'Page.compilationCacheProduced': [Protocol.Page.CompilationCacheProducedEvent];
    /**
     * Current values of the metrics.
     */
    'Performance.metrics': [Protocol.Performance.MetricsEvent];
    /**
     * Sent when a performance timeline event is added. See reportPerformanceTimeline method.
     */
    'PerformanceTimeline.timelineEventAdded': [Protocol.PerformanceTimeline.TimelineEventAddedEvent];
    /**
     * There is a certificate error. If overriding certificate errors is enabled, then it should be
     * handled with the `handleCertificateError` command. Note: this event does not fire if the
     * certificate error has been allowed internally. Only one client per target should override
     * certificate errors at the same time.
     */
    'Security.certificateError': [Protocol.Security.CertificateErrorEvent];
    /**
     * The security state of the page changed.
     */
    'Security.visibleSecurityStateChanged': [Protocol.Security.VisibleSecurityStateChangedEvent];
    /**
     * The security state of the page changed.
     */
    'Security.securityStateChanged': [Protocol.Security.SecurityStateChangedEvent];
    'ServiceWorker.workerErrorReported': [Protocol.ServiceWorker.WorkerErrorReportedEvent];
    'ServiceWorker.workerRegistrationUpdated': [Protocol.ServiceWorker.WorkerRegistrationUpdatedEvent];
    'ServiceWorker.workerVersionUpdated': [Protocol.ServiceWorker.WorkerVersionUpdatedEvent];
    /**
     * A cache's contents have been modified.
     */
    'Storage.cacheStorageContentUpdated': [Protocol.Storage.CacheStorageContentUpdatedEvent];
    /**
     * A cache has been added/deleted.
     */
    'Storage.cacheStorageListUpdated': [Protocol.Storage.CacheStorageListUpdatedEvent];
    /**
     * The origin's IndexedDB object store has been modified.
     */
    'Storage.indexedDBContentUpdated': [Protocol.Storage.IndexedDBContentUpdatedEvent];
    /**
     * The origin's IndexedDB database list has been modified.
     */
    'Storage.indexedDBListUpdated': [Protocol.Storage.IndexedDBListUpdatedEvent];
    /**
     * Issued when attached to target because of auto-attach or `attachToTarget` command.
     */
    'Target.attachedToTarget': [Protocol.Target.AttachedToTargetEvent];
    /**
     * Issued when detached from target for any reason (including `detachFromTarget` command). Can be
     * issued multiple times per target if multiple sessions have been attached to it.
     */
    'Target.detachedFromTarget': [Protocol.Target.DetachedFromTargetEvent];
    /**
     * Notifies about a new protocol message received from the session (as reported in
     * `attachedToTarget` event).
     */
    'Target.receivedMessageFromTarget': [Protocol.Target.ReceivedMessageFromTargetEvent];
    /**
     * Issued when a possible inspection target is created.
     */
    'Target.targetCreated': [Protocol.Target.TargetCreatedEvent];
    /**
     * Issued when a target is destroyed.
     */
    'Target.targetDestroyed': [Protocol.Target.TargetDestroyedEvent];
    /**
     * Issued when a target has crashed.
     */
    'Target.targetCrashed': [Protocol.Target.TargetCrashedEvent];
    /**
     * Issued when some information about a target has changed. This only happens between
     * `targetCreated` and `targetDestroyed`.
     */
    'Target.targetInfoChanged': [Protocol.Target.TargetInfoChangedEvent];
    /**
     * Informs that port was successfully bound and got a specified connection id.
     */
    'Tethering.accepted': [Protocol.Tethering.AcceptedEvent];
    'Tracing.bufferUsage': [Protocol.Tracing.BufferUsageEvent];
    /**
     * Contains an bucket of collected trace events. When tracing is stopped collected events will be
     * send as a sequence of dataCollected events followed by tracingComplete event.
     */
    'Tracing.dataCollected': [Protocol.Tracing.DataCollectedEvent];
    /**
     * Signals that tracing is stopped and there is no trace buffers pending flush, all data were
     * delivered via dataCollected events.
     */
    'Tracing.tracingComplete': [Protocol.Tracing.TracingCompleteEvent];
    /**
     * Issued when the domain is enabled and the request URL matches the
     * specified filter. The request is paused until the client responds
     * with one of continueRequest, failRequest or fulfillRequest.
     * The stage of the request can be determined by presence of responseErrorReason
     * and responseStatusCode -- the request is at the response stage if either
     * of these fields is present and in the request stage otherwise.
     */
    'Fetch.requestPaused': [Protocol.Fetch.RequestPausedEvent];
    /**
     * Issued when the domain is enabled with handleAuthRequests set to true.
     * The request is paused until client responds with continueWithAuth.
     */
    'Fetch.authRequired': [Protocol.Fetch.AuthRequiredEvent];
    /**
     * Notifies that a new BaseAudioContext has been created.
     */
    'WebAudio.contextCreated': [Protocol.WebAudio.ContextCreatedEvent];
    /**
     * Notifies that an existing BaseAudioContext will be destroyed.
     */
    'WebAudio.contextWillBeDestroyed': [Protocol.WebAudio.ContextWillBeDestroyedEvent];
    /**
     * Notifies that existing BaseAudioContext has changed some properties (id stays the same)..
     */
    'WebAudio.contextChanged': [Protocol.WebAudio.ContextChangedEvent];
    /**
     * Notifies that the construction of an AudioListener has finished.
     */
    'WebAudio.audioListenerCreated': [Protocol.WebAudio.AudioListenerCreatedEvent];
    /**
     * Notifies that a new AudioListener has been created.
     */
    'WebAudio.audioListenerWillBeDestroyed': [Protocol.WebAudio.AudioListenerWillBeDestroyedEvent];
    /**
     * Notifies that a new AudioNode has been created.
     */
    'WebAudio.audioNodeCreated': [Protocol.WebAudio.AudioNodeCreatedEvent];
    /**
     * Notifies that an existing AudioNode has been destroyed.
     */
    'WebAudio.audioNodeWillBeDestroyed': [Protocol.WebAudio.AudioNodeWillBeDestroyedEvent];
    /**
     * Notifies that a new AudioParam has been created.
     */
    'WebAudio.audioParamCreated': [Protocol.WebAudio.AudioParamCreatedEvent];
    /**
     * Notifies that an existing AudioParam has been destroyed.
     */
    'WebAudio.audioParamWillBeDestroyed': [Protocol.WebAudio.AudioParamWillBeDestroyedEvent];
    /**
     * Notifies that two AudioNodes are connected.
     */
    'WebAudio.nodesConnected': [Protocol.WebAudio.NodesConnectedEvent];
    /**
     * Notifies that AudioNodes are disconnected. The destination can be null, and it means all the outgoing connections from the source are disconnected.
     */
    'WebAudio.nodesDisconnected': [Protocol.WebAudio.NodesDisconnectedEvent];
    /**
     * Notifies that an AudioNode is connected to an AudioParam.
     */
    'WebAudio.nodeParamConnected': [Protocol.WebAudio.NodeParamConnectedEvent];
    /**
     * Notifies that an AudioNode is disconnected to an AudioParam.
     */
    'WebAudio.nodeParamDisconnected': [Protocol.WebAudio.NodeParamDisconnectedEvent];
    /**
     * This can be called multiple times, and can be used to set / override /
     * remove player properties. A null propValue indicates removal.
     */
    'Media.playerPropertiesChanged': [Protocol.Media.PlayerPropertiesChangedEvent];
    /**
     * Send events as a list, allowing them to be batched on the browser for less
     * congestion. If batched, events must ALWAYS be in chronological order.
     */
    'Media.playerEventsAdded': [Protocol.Media.PlayerEventsAddedEvent];
    /**
     * Send a list of any messages that need to be delivered.
     */
    'Media.playerMessagesLogged': [Protocol.Media.PlayerMessagesLoggedEvent];
    /**
     * Send a list of any errors that need to be delivered.
     */
    'Media.playerErrorsRaised': [Protocol.Media.PlayerErrorsRaisedEvent];
    /**
     * Called whenever a player is created, or when a new agent joins and receives
     * a list of active players. If an agent is restored, it will receive the full
     * list of player ids and all events again.
     */
    'Media.playersCreated': [Protocol.Media.PlayersCreatedEvent];
    /**
     * Fired when breakpoint is resolved to an actual script and location.
     */
    'Debugger.breakpointResolved': [Protocol.Debugger.BreakpointResolvedEvent];
    /**
     * Fired when the virtual machine stopped on breakpoint or exception or any other stop criteria.
     */
    'Debugger.paused': [Protocol.Debugger.PausedEvent];
    /**
     * Fired when the virtual machine resumed execution.
     */
    'Debugger.resumed': [];
    /**
     * Fired when virtual machine fails to parse the script.
     */
    'Debugger.scriptFailedToParse': [Protocol.Debugger.ScriptFailedToParseEvent];
    /**
     * Fired when virtual machine parses script. This event is also fired for all known and uncollected
     * scripts upon enabling debugger.
     */
    'Debugger.scriptParsed': [Protocol.Debugger.ScriptParsedEvent];
    'HeapProfiler.addHeapSnapshotChunk': [Protocol.HeapProfiler.AddHeapSnapshotChunkEvent];
    /**
     * If heap objects tracking has been started then backend may send update for one or more fragments
     */
    'HeapProfiler.heapStatsUpdate': [Protocol.HeapProfiler.HeapStatsUpdateEvent];
    /**
     * If heap objects tracking has been started then backend regularly sends a current value for last
     * seen object id and corresponding timestamp. If the were changes in the heap since last event
     * then one or more heapStatsUpdate events will be sent before a new lastSeenObjectId event.
     */
    'HeapProfiler.lastSeenObjectId': [Protocol.HeapProfiler.LastSeenObjectIdEvent];
    'HeapProfiler.reportHeapSnapshotProgress': [Protocol.HeapProfiler.ReportHeapSnapshotProgressEvent];
    'HeapProfiler.resetProfiles': [];
    'Profiler.consoleProfileFinished': [Protocol.Profiler.ConsoleProfileFinishedEvent];
    /**
     * Sent when new profile recording is started using console.profile() call.
     */
    'Profiler.consoleProfileStarted': [Protocol.Profiler.ConsoleProfileStartedEvent];
    /**
     * Reports coverage delta since the last poll (either from an event like this, or from
     * `takePreciseCoverage` for the current isolate. May only be sent if precise code
     * coverage has been started. This event can be trigged by the embedder to, for example,
     * trigger collection of coverage data immediately at a certain point in time.
     */
    'Profiler.preciseCoverageDeltaUpdate': [Protocol.Profiler.PreciseCoverageDeltaUpdateEvent];
    /**
     * Notification is issued every time when binding is called.
     */
    'Runtime.bindingCalled': [Protocol.Runtime.BindingCalledEvent];
    /**
     * Issued when console API was called.
     */
    'Runtime.consoleAPICalled': [Protocol.Runtime.ConsoleAPICalledEvent];
    /**
     * Issued when unhandled exception was revoked.
     */
    'Runtime.exceptionRevoked': [Protocol.Runtime.ExceptionRevokedEvent];
    /**
     * Issued when exception was thrown and unhandled.
     */
    'Runtime.exceptionThrown': [Protocol.Runtime.ExceptionThrownEvent];
    /**
     * Issued when new execution context is created.
     */
    'Runtime.executionContextCreated': [Protocol.Runtime.ExecutionContextCreatedEvent];
    /**
     * Issued when execution context is destroyed.
     */
    'Runtime.executionContextDestroyed': [Protocol.Runtime.ExecutionContextDestroyedEvent];
    /**
     * Issued when all executionContexts were cleared in browser
     */
    'Runtime.executionContextsCleared': [];
    /**
     * Issued when object should be inspected (for example, as a result of inspect() command line API
     * call).
     */
    'Runtime.inspectRequested': [Protocol.Runtime.InspectRequestedEvent];
  }

  export interface Commands {
    /**
     * Disables the accessibility domain.
     */
    'Accessibility.disable': {paramsType: []; returnType: void;};
    /**
     * Enables the accessibility domain which causes `AXNodeId`s to remain consistent between method calls.
     * This turns on accessibility for the page, which can impact performance until accessibility is disabled.
     */
    'Accessibility.enable': {paramsType: []; returnType: void;};
    /**
     * Fetches the accessibility node and partial accessibility tree for this DOM node, if it exists.
     */
    'Accessibility.getPartialAXTree': {
      paramsType: [Protocol.Accessibility.GetPartialAXTreeRequest?];
      returnType: Protocol.Accessibility.GetPartialAXTreeResponse;
    };
    /**
     * Fetches the entire accessibility tree for the root Document
     */
    'Accessibility.getFullAXTree': {
      paramsType: [Protocol.Accessibility.GetFullAXTreeRequest?];
      returnType: Protocol.Accessibility.GetFullAXTreeResponse;
    };
    /**
     * Fetches a particular accessibility node by AXNodeId.
     * Requires `enable()` to have been called previously.
     */
    'Accessibility.getChildAXNodes': {
      paramsType: [Protocol.Accessibility.GetChildAXNodesRequest];
      returnType: Protocol.Accessibility.GetChildAXNodesResponse;
    };
    /**
     * Query a DOM node's accessibility subtree for accessible name and role.
     * This command computes the name and role for all nodes in the subtree, including those that are
     * ignored for accessibility, and returns those that mactch the specified name and role. If no DOM
     * node is specified, or the DOM node does not exist, the command returns an error. If neither
     * `accessibleName` or `role` is specified, it returns all the accessibility nodes in the subtree.
     */
    'Accessibility.queryAXTree': {
      paramsType: [Protocol.Accessibility.QueryAXTreeRequest?]; returnType: Protocol.Accessibility.QueryAXTreeResponse;
    };
    /**
     * Disables animation domain notifications.
     */
    'Animation.disable': {paramsType: []; returnType: void;};
    /**
     * Enables animation domain notifications.
     */
    'Animation.enable': {paramsType: []; returnType: void;};
    /**
     * Returns the current time of the an animation.
     */
    'Animation.getCurrentTime': {
      paramsType: [Protocol.Animation.GetCurrentTimeRequest]; returnType: Protocol.Animation.GetCurrentTimeResponse;
    };
    /**
     * Gets the playback rate of the document timeline.
     */
    'Animation.getPlaybackRate': {paramsType: []; returnType: Protocol.Animation.GetPlaybackRateResponse;};
    /**
     * Releases a set of animations to no longer be manipulated.
     */
    'Animation.releaseAnimations': {paramsType: [Protocol.Animation.ReleaseAnimationsRequest]; returnType: void;};
    /**
     * Gets the remote object of the Animation.
     */
    'Animation.resolveAnimation': {
      paramsType: [Protocol.Animation.ResolveAnimationRequest]; returnType: Protocol.Animation.ResolveAnimationResponse;
    };
    /**
     * Seek a set of animations to a particular time within each animation.
     */
    'Animation.seekAnimations': {paramsType: [Protocol.Animation.SeekAnimationsRequest]; returnType: void;};
    /**
     * Sets the paused state of a set of animations.
     */
    'Animation.setPaused': {paramsType: [Protocol.Animation.SetPausedRequest]; returnType: void;};
    /**
     * Sets the playback rate of the document timeline.
     */
    'Animation.setPlaybackRate': {paramsType: [Protocol.Animation.SetPlaybackRateRequest]; returnType: void;};
    /**
     * Sets the timing of an animation node.
     */
    'Animation.setTiming': {paramsType: [Protocol.Animation.SetTimingRequest]; returnType: void;};
    /**
     * Enables application cache domain notifications.
     */
    'ApplicationCache.enable': {paramsType: []; returnType: void;};
    /**
     * Returns relevant application cache data for the document in given frame.
     */
    'ApplicationCache.getApplicationCacheForFrame': {
      paramsType: [Protocol.ApplicationCache.GetApplicationCacheForFrameRequest];
      returnType: Protocol.ApplicationCache.GetApplicationCacheForFrameResponse;
    };
    /**
     * Returns array of frame identifiers with manifest urls for each frame containing a document
     * associated with some application cache.
     */
    'ApplicationCache.getFramesWithManifests':
        {paramsType: []; returnType: Protocol.ApplicationCache.GetFramesWithManifestsResponse;};
    /**
     * Returns manifest URL for document in the given frame.
     */
    'ApplicationCache.getManifestForFrame': {
      paramsType: [Protocol.ApplicationCache.GetManifestForFrameRequest];
      returnType: Protocol.ApplicationCache.GetManifestForFrameResponse;
    };
    /**
     * Returns the response body and size if it were re-encoded with the specified settings. Only
     * applies to images.
     */
    'Audits.getEncodedResponse': {
      paramsType: [Protocol.Audits.GetEncodedResponseRequest]; returnType: Protocol.Audits.GetEncodedResponseResponse;
    };
    /**
     * Disables issues domain, prevents further issues from being reported to the client.
     */
    'Audits.disable': {paramsType: []; returnType: void;};
    /**
     * Enables issues domain, sends the issues collected so far to the client by means of the
     * `issueAdded` event.
     */
    'Audits.enable': {paramsType: []; returnType: void;};
    /**
     * Runs the contrast check for the target page. Found issues are reported
     * using Audits.issueAdded event.
     */
    'Audits.checkContrast': {paramsType: [Protocol.Audits.CheckContrastRequest?]; returnType: void;};
    /**
     * Enables event updates for the service.
     */
    'BackgroundService.startObserving':
        {paramsType: [Protocol.BackgroundService.StartObservingRequest]; returnType: void;};
    /**
     * Disables event updates for the service.
     */
    'BackgroundService.stopObserving':
        {paramsType: [Protocol.BackgroundService.StopObservingRequest]; returnType: void;};
    /**
     * Set the recording state for the service.
     */
    'BackgroundService.setRecording': {paramsType: [Protocol.BackgroundService.SetRecordingRequest]; returnType: void;};
    /**
     * Clears all stored data for the service.
     */
    'BackgroundService.clearEvents': {paramsType: [Protocol.BackgroundService.ClearEventsRequest]; returnType: void;};
    /**
     * Set permission settings for given origin.
     */
    'Browser.setPermission': {paramsType: [Protocol.Browser.SetPermissionRequest]; returnType: void;};
    /**
     * Grant specific permissions to the given origin and reject all others.
     */
    'Browser.grantPermissions': {paramsType: [Protocol.Browser.GrantPermissionsRequest]; returnType: void;};
    /**
     * Reset all permission management for all origins.
     */
    'Browser.resetPermissions': {paramsType: [Protocol.Browser.ResetPermissionsRequest?]; returnType: void;};
    /**
     * Set the behavior when downloading a file.
     */
    'Browser.setDownloadBehavior': {paramsType: [Protocol.Browser.SetDownloadBehaviorRequest]; returnType: void;};
    /**
     * Cancel a download if in progress
     */
    'Browser.cancelDownload': {paramsType: [Protocol.Browser.CancelDownloadRequest]; returnType: void;};
    /**
     * Close browser gracefully.
     */
    'Browser.close': {paramsType: []; returnType: void;};
    /**
     * Crashes browser on the main thread.
     */
    'Browser.crash': {paramsType: []; returnType: void;};
    /**
     * Crashes GPU process.
     */
    'Browser.crashGpuProcess': {paramsType: []; returnType: void;};
    /**
     * Returns version information.
     */
    'Browser.getVersion': {paramsType: []; returnType: Protocol.Browser.GetVersionResponse;};
    /**
     * Returns the command line switches for the browser process if, and only if
     * --enable-automation is on the commandline.
     */
    'Browser.getBrowserCommandLine': {paramsType: []; returnType: Protocol.Browser.GetBrowserCommandLineResponse;};
    /**
     * Get Chrome histograms.
     */
    'Browser.getHistograms':
        {paramsType: [Protocol.Browser.GetHistogramsRequest?]; returnType: Protocol.Browser.GetHistogramsResponse;};
    /**
     * Get a Chrome histogram by name.
     */
    'Browser.getHistogram':
        {paramsType: [Protocol.Browser.GetHistogramRequest]; returnType: Protocol.Browser.GetHistogramResponse;};
    /**
     * Get position and size of the browser window.
     */
    'Browser.getWindowBounds':
        {paramsType: [Protocol.Browser.GetWindowBoundsRequest]; returnType: Protocol.Browser.GetWindowBoundsResponse;};
    /**
     * Get the browser window that contains the devtools target.
     */
    'Browser.getWindowForTarget': {
      paramsType: [Protocol.Browser.GetWindowForTargetRequest?];
      returnType: Protocol.Browser.GetWindowForTargetResponse;
    };
    /**
     * Set position and/or size of the browser window.
     */
    'Browser.setWindowBounds': {paramsType: [Protocol.Browser.SetWindowBoundsRequest]; returnType: void;};
    /**
     * Set dock tile details, platform-specific.
     */
    'Browser.setDockTile': {paramsType: [Protocol.Browser.SetDockTileRequest?]; returnType: void;};
    /**
     * Invoke custom browser commands used by telemetry.
     */
    'Browser.executeBrowserCommand': {paramsType: [Protocol.Browser.ExecuteBrowserCommandRequest]; returnType: void;};
    /**
     * Inserts a new rule with the given `ruleText` in a stylesheet with given `styleSheetId`, at the
     * position specified by `location`.
     */
    'CSS.addRule': {paramsType: [Protocol.CSS.AddRuleRequest]; returnType: Protocol.CSS.AddRuleResponse;};
    /**
     * Returns all class names from specified stylesheet.
     */
    'CSS.collectClassNames':
        {paramsType: [Protocol.CSS.CollectClassNamesRequest]; returnType: Protocol.CSS.CollectClassNamesResponse;};
    /**
     * Creates a new special "via-inspector" stylesheet in the frame with given `frameId`.
     */
    'CSS.createStyleSheet':
        {paramsType: [Protocol.CSS.CreateStyleSheetRequest]; returnType: Protocol.CSS.CreateStyleSheetResponse;};
    /**
     * Disables the CSS agent for the given page.
     */
    'CSS.disable': {paramsType: []; returnType: void;};
    /**
     * Enables the CSS agent for the given page. Clients should not assume that the CSS agent has been
     * enabled until the result of this command is received.
     */
    'CSS.enable': {paramsType: []; returnType: void;};
    /**
     * Ensures that the given node will have specified pseudo-classes whenever its style is computed by
     * the browser.
     */
    'CSS.forcePseudoState': {paramsType: [Protocol.CSS.ForcePseudoStateRequest]; returnType: void;};
    'CSS.getBackgroundColors':
        {paramsType: [Protocol.CSS.GetBackgroundColorsRequest]; returnType: Protocol.CSS.GetBackgroundColorsResponse;};
    /**
     * Returns the computed style for a DOM node identified by `nodeId`.
     */
    'CSS.getComputedStyleForNode': {
      paramsType: [Protocol.CSS.GetComputedStyleForNodeRequest];
      returnType: Protocol.CSS.GetComputedStyleForNodeResponse;
    };
    /**
     * Returns the styles defined inline (explicitly in the "style" attribute and implicitly, using DOM
     * attributes) for a DOM node identified by `nodeId`.
     */
    'CSS.getInlineStylesForNode': {
      paramsType: [Protocol.CSS.GetInlineStylesForNodeRequest]; returnType: Protocol.CSS.GetInlineStylesForNodeResponse;
    };
    /**
     * Returns requested styles for a DOM node identified by `nodeId`.
     */
    'CSS.getMatchedStylesForNode': {
      paramsType: [Protocol.CSS.GetMatchedStylesForNodeRequest];
      returnType: Protocol.CSS.GetMatchedStylesForNodeResponse;
    };
    /**
     * Returns all media queries parsed by the rendering engine.
     */
    'CSS.getMediaQueries': {paramsType: []; returnType: Protocol.CSS.GetMediaQueriesResponse;};
    /**
     * Requests information about platform fonts which we used to render child TextNodes in the given
     * node.
     */
    'CSS.getPlatformFontsForNode': {
      paramsType: [Protocol.CSS.GetPlatformFontsForNodeRequest];
      returnType: Protocol.CSS.GetPlatformFontsForNodeResponse;
    };
    /**
     * Returns the current textual content for a stylesheet.
     */
    'CSS.getStyleSheetText':
        {paramsType: [Protocol.CSS.GetStyleSheetTextRequest]; returnType: Protocol.CSS.GetStyleSheetTextResponse;};
    /**
     * Starts tracking the given computed styles for updates. The specified array of properties
     * replaces the one previously specified. Pass empty array to disable tracking.
     * Use takeComputedStyleUpdates to retrieve the list of nodes that had properties modified.
     * The changes to computed style properties are only tracked for nodes pushed to the front-end
     * by the DOM agent. If no changes to the tracked properties occur after the node has been pushed
     * to the front-end, no updates will be issued for the node.
     */
    'CSS.trackComputedStyleUpdates': {paramsType: [Protocol.CSS.TrackComputedStyleUpdatesRequest]; returnType: void;};
    /**
     * Polls the next batch of computed style updates.
     */
    'CSS.takeComputedStyleUpdates': {paramsType: []; returnType: Protocol.CSS.TakeComputedStyleUpdatesResponse;};
    /**
     * Find a rule with the given active property for the given node and set the new value for this
     * property
     */
    'CSS.setEffectivePropertyValueForNode':
        {paramsType: [Protocol.CSS.SetEffectivePropertyValueForNodeRequest]; returnType: void;};
    /**
     * Modifies the keyframe rule key text.
     */
    'CSS.setKeyframeKey':
        {paramsType: [Protocol.CSS.SetKeyframeKeyRequest]; returnType: Protocol.CSS.SetKeyframeKeyResponse;};
    /**
     * Modifies the rule selector.
     */
    'CSS.setMediaText':
        {paramsType: [Protocol.CSS.SetMediaTextRequest]; returnType: Protocol.CSS.SetMediaTextResponse;};
    /**
     * Modifies the rule selector.
     */
    'CSS.setRuleSelector':
        {paramsType: [Protocol.CSS.SetRuleSelectorRequest]; returnType: Protocol.CSS.SetRuleSelectorResponse;};
    /**
     * Sets the new stylesheet text.
     */
    'CSS.setStyleSheetText':
        {paramsType: [Protocol.CSS.SetStyleSheetTextRequest]; returnType: Protocol.CSS.SetStyleSheetTextResponse;};
    /**
     * Applies specified style edits one after another in the given order.
     */
    'CSS.setStyleTexts':
        {paramsType: [Protocol.CSS.SetStyleTextsRequest]; returnType: Protocol.CSS.SetStyleTextsResponse;};
    /**
     * Enables the selector recording.
     */
    'CSS.startRuleUsageTracking': {paramsType: []; returnType: void;};
    /**
     * Stop tracking rule usage and return the list of rules that were used since last call to
     * `takeCoverageDelta` (or since start of coverage instrumentation)
     */
    'CSS.stopRuleUsageTracking': {paramsType: []; returnType: Protocol.CSS.StopRuleUsageTrackingResponse;};
    /**
     * Obtain list of rules that became used since last call to this method (or since start of coverage
     * instrumentation)
     */
    'CSS.takeCoverageDelta': {paramsType: []; returnType: Protocol.CSS.TakeCoverageDeltaResponse;};
    /**
     * Enables/disables rendering of local CSS fonts (enabled by default).
     */
    'CSS.setLocalFontsEnabled': {paramsType: [Protocol.CSS.SetLocalFontsEnabledRequest]; returnType: void;};
    /**
     * Deletes a cache.
     */
    'CacheStorage.deleteCache': {paramsType: [Protocol.CacheStorage.DeleteCacheRequest]; returnType: void;};
    /**
     * Deletes a cache entry.
     */
    'CacheStorage.deleteEntry': {paramsType: [Protocol.CacheStorage.DeleteEntryRequest]; returnType: void;};
    /**
     * Requests cache names.
     */
    'CacheStorage.requestCacheNames': {
      paramsType: [Protocol.CacheStorage.RequestCacheNamesRequest];
      returnType: Protocol.CacheStorage.RequestCacheNamesResponse;
    };
    /**
     * Fetches cache entry.
     */
    'CacheStorage.requestCachedResponse': {
      paramsType: [Protocol.CacheStorage.RequestCachedResponseRequest];
      returnType: Protocol.CacheStorage.RequestCachedResponseResponse;
    };
    /**
     * Requests data from cache.
     */
    'CacheStorage.requestEntries': {
      paramsType: [Protocol.CacheStorage.RequestEntriesRequest];
      returnType: Protocol.CacheStorage.RequestEntriesResponse;
    };
    /**
     * Starts observing for sinks that can be used for tab mirroring, and if set,
     * sinks compatible with |presentationUrl| as well. When sinks are found, a
     * |sinksUpdated| event is fired.
     * Also starts observing for issue messages. When an issue is added or removed,
     * an |issueUpdated| event is fired.
     */
    'Cast.enable': {paramsType: [Protocol.Cast.EnableRequest?]; returnType: void;};
    /**
     * Stops observing for sinks and issues.
     */
    'Cast.disable': {paramsType: []; returnType: void;};
    /**
     * Sets a sink to be used when the web page requests the browser to choose a
     * sink via Presentation API, Remote Playback API, or Cast SDK.
     */
    'Cast.setSinkToUse': {paramsType: [Protocol.Cast.SetSinkToUseRequest]; returnType: void;};
    /**
     * Starts mirroring the tab to the sink.
     */
    'Cast.startTabMirroring': {paramsType: [Protocol.Cast.StartTabMirroringRequest]; returnType: void;};
    /**
     * Stops the active Cast session on the sink.
     */
    'Cast.stopCasting': {paramsType: [Protocol.Cast.StopCastingRequest]; returnType: void;};
    /**
     * Collects class names for the node with given id and all of it's child nodes.
     */
    'DOM.collectClassNamesFromSubtree': {
      paramsType: [Protocol.DOM.CollectClassNamesFromSubtreeRequest];
      returnType: Protocol.DOM.CollectClassNamesFromSubtreeResponse;
    };
    /**
     * Creates a deep copy of the specified node and places it into the target container before the
     * given anchor.
     */
    'DOM.copyTo': {paramsType: [Protocol.DOM.CopyToRequest]; returnType: Protocol.DOM.CopyToResponse;};
    /**
     * Describes node given its id, does not require domain to be enabled. Does not start tracking any
     * objects, can be used for automation.
     */
    'DOM.describeNode':
        {paramsType: [Protocol.DOM.DescribeNodeRequest?]; returnType: Protocol.DOM.DescribeNodeResponse;};
    /**
     * Scrolls the specified rect of the given node into view if not already visible.
     * Note: exactly one between nodeId, backendNodeId and objectId should be passed
     * to identify the node.
     */
    'DOM.scrollIntoViewIfNeeded': {paramsType: [Protocol.DOM.ScrollIntoViewIfNeededRequest?]; returnType: void;};
    /**
     * Disables DOM agent for the given page.
     */
    'DOM.disable': {paramsType: []; returnType: void;};
    /**
     * Discards search results from the session with the given id. `getSearchResults` should no longer
     * be called for that search.
     */
    'DOM.discardSearchResults': {paramsType: [Protocol.DOM.DiscardSearchResultsRequest]; returnType: void;};
    /**
     * Enables DOM agent for the given page.
     */
    'DOM.enable': {paramsType: []; returnType: void;};
    /**
     * Focuses the given element.
     */
    'DOM.focus': {paramsType: [Protocol.DOM.FocusRequest?]; returnType: void;};
    /**
     * Returns attributes for the specified node.
     */
    'DOM.getAttributes':
        {paramsType: [Protocol.DOM.GetAttributesRequest]; returnType: Protocol.DOM.GetAttributesResponse;};
    /**
     * Returns boxes for the given node.
     */
    'DOM.getBoxModel': {paramsType: [Protocol.DOM.GetBoxModelRequest?]; returnType: Protocol.DOM.GetBoxModelResponse;};
    /**
     * Returns quads that describe node position on the page. This method
     * might return multiple quads for inline nodes.
     */
    'DOM.getContentQuads':
        {paramsType: [Protocol.DOM.GetContentQuadsRequest?]; returnType: Protocol.DOM.GetContentQuadsResponse;};
    /**
     * Returns the root DOM node (and optionally the subtree) to the caller.
     */
    'DOM.getDocument': {paramsType: [Protocol.DOM.GetDocumentRequest?]; returnType: Protocol.DOM.GetDocumentResponse;};
    /**
     * Returns the root DOM node (and optionally the subtree) to the caller.
     * Deprecated, as it is not designed to work well with the rest of the DOM agent.
     * Use DOMSnapshot.captureSnapshot instead.
     */
    'DOM.getFlattenedDocument': {
      paramsType: [Protocol.DOM.GetFlattenedDocumentRequest?]; returnType: Protocol.DOM.GetFlattenedDocumentResponse;
    };
    /**
     * Finds nodes with a given computed style in a subtree.
     */
    'DOM.getNodesForSubtreeByStyle': {
      paramsType: [Protocol.DOM.GetNodesForSubtreeByStyleRequest];
      returnType: Protocol.DOM.GetNodesForSubtreeByStyleResponse;
    };
    /**
     * Returns node id at given location. Depending on whether DOM domain is enabled, nodeId is
     * either returned or not.
     */
    'DOM.getNodeForLocation':
        {paramsType: [Protocol.DOM.GetNodeForLocationRequest]; returnType: Protocol.DOM.GetNodeForLocationResponse;};
    /**
     * Returns node's HTML markup.
     */
    'DOM.getOuterHTML':
        {paramsType: [Protocol.DOM.GetOuterHTMLRequest?]; returnType: Protocol.DOM.GetOuterHTMLResponse;};
    /**
     * Returns the id of the nearest ancestor that is a relayout boundary.
     */
    'DOM.getRelayoutBoundary':
        {paramsType: [Protocol.DOM.GetRelayoutBoundaryRequest]; returnType: Protocol.DOM.GetRelayoutBoundaryResponse;};
    /**
     * Returns search results from given `fromIndex` to given `toIndex` from the search with the given
     * identifier.
     */
    'DOM.getSearchResults':
        {paramsType: [Protocol.DOM.GetSearchResultsRequest]; returnType: Protocol.DOM.GetSearchResultsResponse;};
    /**
     * Hides any highlight.
     */
    'DOM.hideHighlight': {paramsType: []; returnType: void;};
    /**
     * Highlights DOM node.
     */
    'DOM.highlightNode': {paramsType: []; returnType: void;};
    /**
     * Highlights given rectangle.
     */
    'DOM.highlightRect': {paramsType: []; returnType: void;};
    /**
     * Marks last undoable state.
     */
    'DOM.markUndoableState': {paramsType: []; returnType: void;};
    /**
     * Moves node into the new container, places it before the given anchor.
     */
    'DOM.moveTo': {paramsType: [Protocol.DOM.MoveToRequest]; returnType: Protocol.DOM.MoveToResponse;};
    /**
     * Searches for a given string in the DOM tree. Use `getSearchResults` to access search results or
     * `cancelSearch` to end this search session.
     */
    'DOM.performSearch':
        {paramsType: [Protocol.DOM.PerformSearchRequest]; returnType: Protocol.DOM.PerformSearchResponse;};
    /**
     * Requests that the node is sent to the caller given its path. // FIXME, use XPath
     */
    'DOM.pushNodeByPathToFrontend': {
      paramsType: [Protocol.DOM.PushNodeByPathToFrontendRequest];
      returnType: Protocol.DOM.PushNodeByPathToFrontendResponse;
    };
    /**
     * Requests that a batch of nodes is sent to the caller given their backend node ids.
     */
    'DOM.pushNodesByBackendIdsToFrontend': {
      paramsType: [Protocol.DOM.PushNodesByBackendIdsToFrontendRequest];
      returnType: Protocol.DOM.PushNodesByBackendIdsToFrontendResponse;
    };
    /**
     * Executes `querySelector` on a given node.
     */
    'DOM.querySelector':
        {paramsType: [Protocol.DOM.QuerySelectorRequest]; returnType: Protocol.DOM.QuerySelectorResponse;};
    /**
     * Executes `querySelectorAll` on a given node.
     */
    'DOM.querySelectorAll':
        {paramsType: [Protocol.DOM.QuerySelectorAllRequest]; returnType: Protocol.DOM.QuerySelectorAllResponse;};
    /**
     * Re-does the last undone action.
     */
    'DOM.redo': {paramsType: []; returnType: void;};
    /**
     * Removes attribute with given name from an element with given id.
     */
    'DOM.removeAttribute': {paramsType: [Protocol.DOM.RemoveAttributeRequest]; returnType: void;};
    /**
     * Removes node with given id.
     */
    'DOM.removeNode': {paramsType: [Protocol.DOM.RemoveNodeRequest]; returnType: void;};
    /**
     * Requests that children of the node with given id are returned to the caller in form of
     * `setChildNodes` events where not only immediate children are retrieved, but all children down to
     * the specified depth.
     */
    'DOM.requestChildNodes': {paramsType: [Protocol.DOM.RequestChildNodesRequest]; returnType: void;};
    /**
     * Requests that the node is sent to the caller given the JavaScript node object reference. All
     * nodes that form the path from the node to the root are also sent to the client as a series of
     * `setChildNodes` notifications.
     */
    'DOM.requestNode': {paramsType: [Protocol.DOM.RequestNodeRequest]; returnType: Protocol.DOM.RequestNodeResponse;};
    /**
     * Resolves the JavaScript node object for a given NodeId or BackendNodeId.
     */
    'DOM.resolveNode': {paramsType: [Protocol.DOM.ResolveNodeRequest?]; returnType: Protocol.DOM.ResolveNodeResponse;};
    /**
     * Sets attribute for an element with given id.
     */
    'DOM.setAttributeValue': {paramsType: [Protocol.DOM.SetAttributeValueRequest]; returnType: void;};
    /**
     * Sets attributes on element with given id. This method is useful when user edits some existing
     * attribute value and types in several attribute name/value pairs.
     */
    'DOM.setAttributesAsText': {paramsType: [Protocol.DOM.SetAttributesAsTextRequest]; returnType: void;};
    /**
     * Sets files for the given file input element.
     */
    'DOM.setFileInputFiles': {paramsType: [Protocol.DOM.SetFileInputFilesRequest]; returnType: void;};
    /**
     * Sets if stack traces should be captured for Nodes. See `Node.getNodeStackTraces`. Default is disabled.
     */
    'DOM.setNodeStackTracesEnabled': {paramsType: [Protocol.DOM.SetNodeStackTracesEnabledRequest]; returnType: void;};
    /**
     * Gets stack traces associated with a Node. As of now, only provides stack trace for Node creation.
     */
    'DOM.getNodeStackTraces':
        {paramsType: [Protocol.DOM.GetNodeStackTracesRequest]; returnType: Protocol.DOM.GetNodeStackTracesResponse;};
    /**
     * Returns file information for the given
     * File wrapper.
     */
    'DOM.getFileInfo': {paramsType: [Protocol.DOM.GetFileInfoRequest]; returnType: Protocol.DOM.GetFileInfoResponse;};
    /**
     * Enables console to refer to the node with given id via $x (see Command Line API for more details
     * $x functions).
     */
    'DOM.setInspectedNode': {paramsType: [Protocol.DOM.SetInspectedNodeRequest]; returnType: void;};
    /**
     * Sets node name for a node with given id.
     */
    'DOM.setNodeName': {paramsType: [Protocol.DOM.SetNodeNameRequest]; returnType: Protocol.DOM.SetNodeNameResponse;};
    /**
     * Sets node value for a node with given id.
     */
    'DOM.setNodeValue': {paramsType: [Protocol.DOM.SetNodeValueRequest]; returnType: void;};
    /**
     * Sets node HTML markup, returns new node id.
     */
    'DOM.setOuterHTML': {paramsType: [Protocol.DOM.SetOuterHTMLRequest]; returnType: void;};
    /**
     * Undoes the last performed action.
     */
    'DOM.undo': {paramsType: []; returnType: void;};
    /**
     * Returns iframe node that owns iframe with the given domain.
     */
    'DOM.getFrameOwner':
        {paramsType: [Protocol.DOM.GetFrameOwnerRequest]; returnType: Protocol.DOM.GetFrameOwnerResponse;};
    /**
     * Returns event listeners of the given object.
     */
    'DOMDebugger.getEventListeners': {
      paramsType: [Protocol.DOMDebugger.GetEventListenersRequest];
      returnType: Protocol.DOMDebugger.GetEventListenersResponse;
    };
    /**
     * Removes DOM breakpoint that was set using `setDOMBreakpoint`.
     */
    'DOMDebugger.removeDOMBreakpoint':
        {paramsType: [Protocol.DOMDebugger.RemoveDOMBreakpointRequest]; returnType: void;};
    /**
     * Removes breakpoint on particular DOM event.
     */
    'DOMDebugger.removeEventListenerBreakpoint':
        {paramsType: [Protocol.DOMDebugger.RemoveEventListenerBreakpointRequest]; returnType: void;};
    /**
     * Removes breakpoint on particular native event.
     */
    'DOMDebugger.removeInstrumentationBreakpoint':
        {paramsType: [Protocol.DOMDebugger.RemoveInstrumentationBreakpointRequest]; returnType: void;};
    /**
     * Removes breakpoint from XMLHttpRequest.
     */
    'DOMDebugger.removeXHRBreakpoint':
        {paramsType: [Protocol.DOMDebugger.RemoveXHRBreakpointRequest]; returnType: void;};
    /**
     * Sets breakpoint on particular CSP violations.
     */
    'DOMDebugger.setBreakOnCSPViolation':
        {paramsType: [Protocol.DOMDebugger.SetBreakOnCSPViolationRequest]; returnType: void;};
    /**
     * Sets breakpoint on particular operation with DOM.
     */
    'DOMDebugger.setDOMBreakpoint': {paramsType: [Protocol.DOMDebugger.SetDOMBreakpointRequest]; returnType: void;};
    /**
     * Sets breakpoint on particular DOM event.
     */
    'DOMDebugger.setEventListenerBreakpoint':
        {paramsType: [Protocol.DOMDebugger.SetEventListenerBreakpointRequest]; returnType: void;};
    /**
     * Sets breakpoint on particular native event.
     */
    'DOMDebugger.setInstrumentationBreakpoint':
        {paramsType: [Protocol.DOMDebugger.SetInstrumentationBreakpointRequest]; returnType: void;};
    /**
     * Sets breakpoint on XMLHttpRequest.
     */
    'DOMDebugger.setXHRBreakpoint': {paramsType: [Protocol.DOMDebugger.SetXHRBreakpointRequest]; returnType: void;};
    /**
     * Disables DOM snapshot agent for the given page.
     */
    'DOMSnapshot.disable': {paramsType: []; returnType: void;};
    /**
     * Enables DOM snapshot agent for the given page.
     */
    'DOMSnapshot.enable': {paramsType: []; returnType: void;};
    /**
     * Returns a document snapshot, including the full DOM tree of the root node (including iframes,
     * template contents, and imported documents) in a flattened array, as well as layout and
     * white-listed computed style information for the nodes. Shadow DOM in the returned DOM tree is
     * flattened.
     */
    'DOMSnapshot.getSnapshot':
        {paramsType: [Protocol.DOMSnapshot.GetSnapshotRequest]; returnType: Protocol.DOMSnapshot.GetSnapshotResponse;};
    /**
     * Returns a document snapshot, including the full DOM tree of the root node (including iframes,
     * template contents, and imported documents) in a flattened array, as well as layout and
     * white-listed computed style information for the nodes. Shadow DOM in the returned DOM tree is
     * flattened.
     */
    'DOMSnapshot.captureSnapshot': {
      paramsType: [Protocol.DOMSnapshot.CaptureSnapshotRequest];
      returnType: Protocol.DOMSnapshot.CaptureSnapshotResponse;
    };
    'DOMStorage.clear': {paramsType: [Protocol.DOMStorage.ClearRequest]; returnType: void;};
    /**
     * Disables storage tracking, prevents storage events from being sent to the client.
     */
    'DOMStorage.disable': {paramsType: []; returnType: void;};
    /**
     * Enables storage tracking, storage events will now be delivered to the client.
     */
    'DOMStorage.enable': {paramsType: []; returnType: void;};
    'DOMStorage.getDOMStorageItems': {
      paramsType: [Protocol.DOMStorage.GetDOMStorageItemsRequest];
      returnType: Protocol.DOMStorage.GetDOMStorageItemsResponse;
    };
    'DOMStorage.removeDOMStorageItem':
        {paramsType: [Protocol.DOMStorage.RemoveDOMStorageItemRequest]; returnType: void;};
    'DOMStorage.setDOMStorageItem': {paramsType: [Protocol.DOMStorage.SetDOMStorageItemRequest]; returnType: void;};
    /**
     * Disables database tracking, prevents database events from being sent to the client.
     */
    'Database.disable': {paramsType: []; returnType: void;};
    /**
     * Enables database tracking, database events will now be delivered to the client.
     */
    'Database.enable': {paramsType: []; returnType: void;};
    'Database.executeSQL':
        {paramsType: [Protocol.Database.ExecuteSQLRequest]; returnType: Protocol.Database.ExecuteSQLResponse;};
    'Database.getDatabaseTableNames': {
      paramsType: [Protocol.Database.GetDatabaseTableNamesRequest];
      returnType: Protocol.Database.GetDatabaseTableNamesResponse;
    };
    /**
     * Clears the overridden Device Orientation.
     */
    'DeviceOrientation.clearDeviceOrientationOverride': {paramsType: []; returnType: void;};
    /**
     * Overrides the Device Orientation.
     */
    'DeviceOrientation.setDeviceOrientationOverride':
        {paramsType: [Protocol.DeviceOrientation.SetDeviceOrientationOverrideRequest]; returnType: void;};
    /**
     * Tells whether emulation is supported.
     */
    'Emulation.canEmulate': {paramsType: []; returnType: Protocol.Emulation.CanEmulateResponse;};
    /**
     * Clears the overridden device metrics.
     */
    'Emulation.clearDeviceMetricsOverride': {paramsType: []; returnType: void;};
    /**
     * Clears the overridden Geolocation Position and Error.
     */
    'Emulation.clearGeolocationOverride': {paramsType: []; returnType: void;};
    /**
     * Requests that page scale factor is reset to initial values.
     */
    'Emulation.resetPageScaleFactor': {paramsType: []; returnType: void;};
    /**
     * Enables or disables simulating a focused and active page.
     */
    'Emulation.setFocusEmulationEnabled':
        {paramsType: [Protocol.Emulation.SetFocusEmulationEnabledRequest]; returnType: void;};
    /**
     * Enables CPU throttling to emulate slow CPUs.
     */
    'Emulation.setCPUThrottlingRate': {paramsType: [Protocol.Emulation.SetCPUThrottlingRateRequest]; returnType: void;};
    /**
     * Sets or clears an override of the default background color of the frame. This override is used
     * if the content does not specify one.
     */
    'Emulation.setDefaultBackgroundColorOverride':
        {paramsType: [Protocol.Emulation.SetDefaultBackgroundColorOverrideRequest?]; returnType: void;};
    /**
     * Overrides the values of device screen dimensions (window.screen.width, window.screen.height,
     * window.innerWidth, window.innerHeight, and "device-width"/"device-height"-related CSS media
     * query results).
     */
    'Emulation.setDeviceMetricsOverride':
        {paramsType: [Protocol.Emulation.SetDeviceMetricsOverrideRequest]; returnType: void;};
    'Emulation.setScrollbarsHidden': {paramsType: [Protocol.Emulation.SetScrollbarsHiddenRequest]; returnType: void;};
    'Emulation.setDocumentCookieDisabled':
        {paramsType: [Protocol.Emulation.SetDocumentCookieDisabledRequest]; returnType: void;};
    'Emulation.setEmitTouchEventsForMouse':
        {paramsType: [Protocol.Emulation.SetEmitTouchEventsForMouseRequest]; returnType: void;};
    /**
     * Emulates the given media type or media feature for CSS media queries.
     */
    'Emulation.setEmulatedMedia': {paramsType: [Protocol.Emulation.SetEmulatedMediaRequest?]; returnType: void;};
    /**
     * Emulates the given vision deficiency.
     */
    'Emulation.setEmulatedVisionDeficiency':
        {paramsType: [Protocol.Emulation.SetEmulatedVisionDeficiencyRequest]; returnType: void;};
    /**
     * Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position
     * unavailable.
     */
    'Emulation.setGeolocationOverride':
        {paramsType: [Protocol.Emulation.SetGeolocationOverrideRequest?]; returnType: void;};
    /**
     * Overrides the Idle state.
     */
    'Emulation.setIdleOverride': {paramsType: [Protocol.Emulation.SetIdleOverrideRequest]; returnType: void;};
    /**
     * Clears Idle state overrides.
     */
    'Emulation.clearIdleOverride': {paramsType: []; returnType: void;};
    /**
     * Overrides value returned by the javascript navigator object.
     */
    'Emulation.setNavigatorOverrides':
        {paramsType: [Protocol.Emulation.SetNavigatorOverridesRequest]; returnType: void;};
    /**
     * Sets a specified page scale factor.
     */
    'Emulation.setPageScaleFactor': {paramsType: [Protocol.Emulation.SetPageScaleFactorRequest]; returnType: void;};
    /**
     * Switches script execution in the page.
     */
    'Emulation.setScriptExecutionDisabled':
        {paramsType: [Protocol.Emulation.SetScriptExecutionDisabledRequest]; returnType: void;};
    /**
     * Enables touch on platforms which do not support them.
     */
    'Emulation.setTouchEmulationEnabled':
        {paramsType: [Protocol.Emulation.SetTouchEmulationEnabledRequest]; returnType: void;};
    /**
     * Turns on virtual time for all frames (replacing real-time with a synthetic time source) and sets
     * the current virtual time policy.  Note this supersedes any previous time budget.
     */
    'Emulation.setVirtualTimePolicy': {
      paramsType: [Protocol.Emulation.SetVirtualTimePolicyRequest];
      returnType: Protocol.Emulation.SetVirtualTimePolicyResponse;
    };
    /**
     * Overrides default host system locale with the specified one.
     */
    'Emulation.setLocaleOverride': {paramsType: [Protocol.Emulation.SetLocaleOverrideRequest?]; returnType: void;};
    /**
     * Overrides default host system timezone with the specified one.
     */
    'Emulation.setTimezoneOverride': {paramsType: [Protocol.Emulation.SetTimezoneOverrideRequest]; returnType: void;};
    /**
     * Resizes the frame/viewport of the page. Note that this does not affect the frame's container
     * (e.g. browser window). Can be used to produce screenshots of the specified size. Not supported
     * on Android.
     */
    'Emulation.setVisibleSize': {paramsType: [Protocol.Emulation.SetVisibleSizeRequest]; returnType: void;};
    'Emulation.setDisabledImageTypes':
        {paramsType: [Protocol.Emulation.SetDisabledImageTypesRequest]; returnType: void;};
    /**
     * Allows overriding user agent with the given string.
     */
    'Emulation.setUserAgentOverride': {paramsType: [Protocol.Emulation.SetUserAgentOverrideRequest]; returnType: void;};
    /**
     * Sends a BeginFrame to the target and returns when the frame was completed. Optionally captures a
     * screenshot from the resulting frame. Requires that the target was created with enabled
     * BeginFrameControl. Designed for use with --run-all-compositor-stages-before-draw, see also
     * https://goo.gl/3zHXhB for more background.
     */
    'HeadlessExperimental.beginFrame': {
      paramsType: [Protocol.HeadlessExperimental.BeginFrameRequest?];
      returnType: Protocol.HeadlessExperimental.BeginFrameResponse;
    };
    /**
     * Disables headless events for the target.
     */
    'HeadlessExperimental.disable': {paramsType: []; returnType: void;};
    /**
     * Enables headless events for the target.
     */
    'HeadlessExperimental.enable': {paramsType: []; returnType: void;};
    /**
     * Close the stream, discard any temporary backing storage.
     */
    'IO.close': {paramsType: [Protocol.IO.CloseRequest]; returnType: void;};
    /**
     * Read a chunk of the stream
     */
    'IO.read': {paramsType: [Protocol.IO.ReadRequest]; returnType: Protocol.IO.ReadResponse;};
    /**
     * Return UUID of Blob object specified by a remote object id.
     */
    'IO.resolveBlob': {paramsType: [Protocol.IO.ResolveBlobRequest]; returnType: Protocol.IO.ResolveBlobResponse;};
    /**
     * Clears all entries from an object store.
     */
    'IndexedDB.clearObjectStore': {paramsType: [Protocol.IndexedDB.ClearObjectStoreRequest]; returnType: void;};
    /**
     * Deletes a database.
     */
    'IndexedDB.deleteDatabase': {paramsType: [Protocol.IndexedDB.DeleteDatabaseRequest]; returnType: void;};
    /**
     * Delete a range of entries from an object store
     */
    'IndexedDB.deleteObjectStoreEntries':
        {paramsType: [Protocol.IndexedDB.DeleteObjectStoreEntriesRequest]; returnType: void;};
    /**
     * Disables events from backend.
     */
    'IndexedDB.disable': {paramsType: []; returnType: void;};
    /**
     * Enables events from backend.
     */
    'IndexedDB.enable': {paramsType: []; returnType: void;};
    /**
     * Requests data from object store or index.
     */
    'IndexedDB.requestData':
        {paramsType: [Protocol.IndexedDB.RequestDataRequest]; returnType: Protocol.IndexedDB.RequestDataResponse;};
    /**
     * Gets metadata of an object store
     */
    'IndexedDB.getMetadata':
        {paramsType: [Protocol.IndexedDB.GetMetadataRequest]; returnType: Protocol.IndexedDB.GetMetadataResponse;};
    /**
     * Requests database with given name in given frame.
     */
    'IndexedDB.requestDatabase': {
      paramsType: [Protocol.IndexedDB.RequestDatabaseRequest]; returnType: Protocol.IndexedDB.RequestDatabaseResponse;
    };
    /**
     * Requests database names for given security origin.
     */
    'IndexedDB.requestDatabaseNames': {
      paramsType: [Protocol.IndexedDB.RequestDatabaseNamesRequest];
      returnType: Protocol.IndexedDB.RequestDatabaseNamesResponse;
    };
    /**
     * Dispatches a drag event into the page.
     */
    'Input.dispatchDragEvent': {paramsType: [Protocol.Input.DispatchDragEventRequest]; returnType: void;};
    /**
     * Dispatches a key event to the page.
     */
    'Input.dispatchKeyEvent': {paramsType: [Protocol.Input.DispatchKeyEventRequest]; returnType: void;};
    /**
     * This method emulates inserting text that doesn't come from a key press,
     * for example an emoji keyboard or an IME.
     */
    'Input.insertText': {paramsType: [Protocol.Input.InsertTextRequest]; returnType: void;};
    /**
     * Dispatches a mouse event to the page.
     */
    'Input.dispatchMouseEvent': {paramsType: [Protocol.Input.DispatchMouseEventRequest]; returnType: void;};
    /**
     * Dispatches a touch event to the page.
     */
    'Input.dispatchTouchEvent': {paramsType: [Protocol.Input.DispatchTouchEventRequest]; returnType: void;};
    /**
     * Emulates touch event from the mouse event parameters.
     */
    'Input.emulateTouchFromMouseEvent':
        {paramsType: [Protocol.Input.EmulateTouchFromMouseEventRequest]; returnType: void;};
    /**
     * Ignores input events (useful while auditing page).
     */
    'Input.setIgnoreInputEvents': {paramsType: [Protocol.Input.SetIgnoreInputEventsRequest]; returnType: void;};
    /**
     * Prevents default drag and drop behavior and instead emits `Input.dragIntercepted` events.
     * Drag and drop behavior can be directly controlled via `Input.dispatchDragEvent`.
     */
    'Input.setInterceptDrags': {paramsType: [Protocol.Input.SetInterceptDragsRequest]; returnType: void;};
    /**
     * Synthesizes a pinch gesture over a time period by issuing appropriate touch events.
     */
    'Input.synthesizePinchGesture': {paramsType: [Protocol.Input.SynthesizePinchGestureRequest]; returnType: void;};
    /**
     * Synthesizes a scroll gesture over a time period by issuing appropriate touch events.
     */
    'Input.synthesizeScrollGesture': {paramsType: [Protocol.Input.SynthesizeScrollGestureRequest]; returnType: void;};
    /**
     * Synthesizes a tap gesture over a time period by issuing appropriate touch events.
     */
    'Input.synthesizeTapGesture': {paramsType: [Protocol.Input.SynthesizeTapGestureRequest]; returnType: void;};
    /**
     * Disables inspector domain notifications.
     */
    'Inspector.disable': {paramsType: []; returnType: void;};
    /**
     * Enables inspector domain notifications.
     */
    'Inspector.enable': {paramsType: []; returnType: void;};
    /**
     * Provides the reasons why the given layer was composited.
     */
    'LayerTree.compositingReasons': {
      paramsType: [Protocol.LayerTree.CompositingReasonsRequest];
      returnType: Protocol.LayerTree.CompositingReasonsResponse;
    };
    /**
     * Disables compositing tree inspection.
     */
    'LayerTree.disable': {paramsType: []; returnType: void;};
    /**
     * Enables compositing tree inspection.
     */
    'LayerTree.enable': {paramsType: []; returnType: void;};
    /**
     * Returns the snapshot identifier.
     */
    'LayerTree.loadSnapshot':
        {paramsType: [Protocol.LayerTree.LoadSnapshotRequest]; returnType: Protocol.LayerTree.LoadSnapshotResponse;};
    /**
     * Returns the layer snapshot identifier.
     */
    'LayerTree.makeSnapshot':
        {paramsType: [Protocol.LayerTree.MakeSnapshotRequest]; returnType: Protocol.LayerTree.MakeSnapshotResponse;};
    'LayerTree.profileSnapshot': {
      paramsType: [Protocol.LayerTree.ProfileSnapshotRequest]; returnType: Protocol.LayerTree.ProfileSnapshotResponse;
    };
    /**
     * Releases layer snapshot captured by the back-end.
     */
    'LayerTree.releaseSnapshot': {paramsType: [Protocol.LayerTree.ReleaseSnapshotRequest]; returnType: void;};
    /**
     * Replays the layer snapshot and returns the resulting bitmap.
     */
    'LayerTree.replaySnapshot': {
      paramsType: [Protocol.LayerTree.ReplaySnapshotRequest]; returnType: Protocol.LayerTree.ReplaySnapshotResponse;
    };
    /**
     * Replays the layer snapshot and returns canvas log.
     */
    'LayerTree.snapshotCommandLog': {
      paramsType: [Protocol.LayerTree.SnapshotCommandLogRequest];
      returnType: Protocol.LayerTree.SnapshotCommandLogResponse;
    };
    /**
     * Clears the log.
     */
    'Log.clear': {paramsType: []; returnType: void;};
    /**
     * Disables log domain, prevents further log entries from being reported to the client.
     */
    'Log.disable': {paramsType: []; returnType: void;};
    /**
     * Enables log domain, sends the entries collected so far to the client by means of the
     * `entryAdded` notification.
     */
    'Log.enable': {paramsType: []; returnType: void;};
    /**
     * start violation reporting.
     */
    'Log.startViolationsReport': {paramsType: [Protocol.Log.StartViolationsReportRequest]; returnType: void;};
    /**
     * Stop violation reporting.
     */
    'Log.stopViolationsReport': {paramsType: []; returnType: void;};
    'Memory.getDOMCounters': {paramsType: []; returnType: Protocol.Memory.GetDOMCountersResponse;};
    'Memory.prepareForLeakDetection': {paramsType: []; returnType: void;};
    /**
     * Simulate OomIntervention by purging V8 memory.
     */
    'Memory.forciblyPurgeJavaScriptMemory': {paramsType: []; returnType: void;};
    /**
     * Enable/disable suppressing memory pressure notifications in all processes.
     */
    'Memory.setPressureNotificationsSuppressed':
        {paramsType: [Protocol.Memory.SetPressureNotificationsSuppressedRequest]; returnType: void;};
    /**
     * Simulate a memory pressure notification in all processes.
     */
    'Memory.simulatePressureNotification':
        {paramsType: [Protocol.Memory.SimulatePressureNotificationRequest]; returnType: void;};
    /**
     * Start collecting native memory profile.
     */
    'Memory.startSampling': {paramsType: [Protocol.Memory.StartSamplingRequest?]; returnType: void;};
    /**
     * Stop collecting native memory profile.
     */
    'Memory.stopSampling': {paramsType: []; returnType: void;};
    /**
     * Retrieve native memory allocations profile
     * collected since renderer process startup.
     */
    'Memory.getAllTimeSamplingProfile':
        {paramsType: []; returnType: Protocol.Memory.GetAllTimeSamplingProfileResponse;};
    /**
     * Retrieve native memory allocations profile
     * collected since browser process startup.
     */
    'Memory.getBrowserSamplingProfile':
        {paramsType: []; returnType: Protocol.Memory.GetBrowserSamplingProfileResponse;};
    /**
     * Retrieve native memory allocations profile collected since last
     * `startSampling` call.
     */
    'Memory.getSamplingProfile': {paramsType: []; returnType: Protocol.Memory.GetSamplingProfileResponse;};
    /**
     * Sets a list of content encodings that will be accepted. Empty list means no encoding is accepted.
     */
    'Network.setAcceptedEncodings': {paramsType: [Protocol.Network.SetAcceptedEncodingsRequest]; returnType: void;};
    /**
     * Clears accepted encodings set by setAcceptedEncodings
     */
    'Network.clearAcceptedEncodingsOverride': {paramsType: []; returnType: void;};
    /**
     * Tells whether clearing browser cache is supported.
     */
    'Network.canClearBrowserCache': {paramsType: []; returnType: Protocol.Network.CanClearBrowserCacheResponse;};
    /**
     * Tells whether clearing browser cookies is supported.
     */
    'Network.canClearBrowserCookies': {paramsType: []; returnType: Protocol.Network.CanClearBrowserCookiesResponse;};
    /**
     * Tells whether emulation of network conditions is supported.
     */
    'Network.canEmulateNetworkConditions':
        {paramsType: []; returnType: Protocol.Network.CanEmulateNetworkConditionsResponse;};
    /**
     * Clears browser cache.
     */
    'Network.clearBrowserCache': {paramsType: []; returnType: void;};
    /**
     * Clears browser cookies.
     */
    'Network.clearBrowserCookies': {paramsType: []; returnType: void;};
    /**
     * Response to Network.requestIntercepted which either modifies the request to continue with any
     * modifications, or blocks it, or completes it with the provided response bytes. If a network
     * fetch occurs as a result which encounters a redirect an additional Network.requestIntercepted
     * event will be sent with the same InterceptionId.
     * Deprecated, use Fetch.continueRequest, Fetch.fulfillRequest and Fetch.failRequest instead.
     */
    'Network.continueInterceptedRequest':
        {paramsType: [Protocol.Network.ContinueInterceptedRequestRequest]; returnType: void;};
    /**
     * Deletes browser cookies with matching name and url or domain/path pair.
     */
    'Network.deleteCookies': {paramsType: [Protocol.Network.DeleteCookiesRequest]; returnType: void;};
    /**
     * Disables network tracking, prevents network events from being sent to the client.
     */
    'Network.disable': {paramsType: []; returnType: void;};
    /**
     * Activates emulation of network conditions.
     */
    'Network.emulateNetworkConditions':
        {paramsType: [Protocol.Network.EmulateNetworkConditionsRequest]; returnType: void;};
    /**
     * Enables network tracking, network events will now be delivered to the client.
     */
    'Network.enable': {paramsType: [Protocol.Network.EnableRequest?]; returnType: void;};
    /**
     * Returns all browser cookies. Depending on the backend support, will return detailed cookie
     * information in the `cookies` field.
     */
    'Network.getAllCookies': {paramsType: []; returnType: Protocol.Network.GetAllCookiesResponse;};
    /**
     * Returns the DER-encoded certificate.
     */
    'Network.getCertificate':
        {paramsType: [Protocol.Network.GetCertificateRequest]; returnType: Protocol.Network.GetCertificateResponse;};
    /**
     * Returns all browser cookies for the current URL. Depending on the backend support, will return
     * detailed cookie information in the `cookies` field.
     */
    'Network.getCookies':
        {paramsType: [Protocol.Network.GetCookiesRequest?]; returnType: Protocol.Network.GetCookiesResponse;};
    /**
     * Returns content served for the given request.
     */
    'Network.getResponseBody':
        {paramsType: [Protocol.Network.GetResponseBodyRequest]; returnType: Protocol.Network.GetResponseBodyResponse;};
    /**
     * Returns post data sent with the request. Returns an error when no data was sent with the request.
     */
    'Network.getRequestPostData': {
      paramsType: [Protocol.Network.GetRequestPostDataRequest]; returnType: Protocol.Network.GetRequestPostDataResponse;
    };
    /**
     * Returns content served for the given currently intercepted request.
     */
    'Network.getResponseBodyForInterception': {
      paramsType: [Protocol.Network.GetResponseBodyForInterceptionRequest];
      returnType: Protocol.Network.GetResponseBodyForInterceptionResponse;
    };
    /**
     * Returns a handle to the stream representing the response body. Note that after this command,
     * the intercepted request can't be continued as is -- you either need to cancel it or to provide
     * the response body. The stream only supports sequential read, IO.read will fail if the position
     * is specified.
     */
    'Network.takeResponseBodyForInterceptionAsStream': {
      paramsType: [Protocol.Network.TakeResponseBodyForInterceptionAsStreamRequest];
      returnType: Protocol.Network.TakeResponseBodyForInterceptionAsStreamResponse;
    };
    /**
     * This method sends a new XMLHttpRequest which is identical to the original one. The following
     * parameters should be identical: method, url, async, request body, extra headers, withCredentials
     * attribute, user, password.
     */
    'Network.replayXHR': {paramsType: [Protocol.Network.ReplayXHRRequest]; returnType: void;};
    /**
     * Searches for given string in response content.
     */
    'Network.searchInResponseBody': {
      paramsType: [Protocol.Network.SearchInResponseBodyRequest];
      returnType: Protocol.Network.SearchInResponseBodyResponse;
    };
    /**
     * Blocks URLs from loading.
     */
    'Network.setBlockedURLs': {paramsType: [Protocol.Network.SetBlockedURLsRequest]; returnType: void;};
    /**
     * Toggles ignoring of service worker for each request.
     */
    'Network.setBypassServiceWorker': {paramsType: [Protocol.Network.SetBypassServiceWorkerRequest]; returnType: void;};
    /**
     * Toggles ignoring cache for each request. If `true`, cache will not be used.
     */
    'Network.setCacheDisabled': {paramsType: [Protocol.Network.SetCacheDisabledRequest]; returnType: void;};
    /**
     * Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.
     */
    'Network.setCookie':
        {paramsType: [Protocol.Network.SetCookieRequest]; returnType: Protocol.Network.SetCookieResponse;};
    /**
     * Sets given cookies.
     */
    'Network.setCookies': {paramsType: [Protocol.Network.SetCookiesRequest]; returnType: void;};
    /**
     * For testing.
     */
    'Network.setDataSizeLimitsForTest':
        {paramsType: [Protocol.Network.SetDataSizeLimitsForTestRequest]; returnType: void;};
    /**
     * Specifies whether to always send extra HTTP headers with the requests from this page.
     */
    'Network.setExtraHTTPHeaders': {paramsType: [Protocol.Network.SetExtraHTTPHeadersRequest]; returnType: void;};
    /**
     * Specifies whether to attach a page script stack id in requests
     */
    'Network.setAttachDebugStack': {paramsType: [Protocol.Network.SetAttachDebugStackRequest]; returnType: void;};
    /**
     * Sets the requests to intercept that match the provided patterns and optionally resource types.
     * Deprecated, please use Fetch.enable instead.
     */
    'Network.setRequestInterception': {paramsType: [Protocol.Network.SetRequestInterceptionRequest]; returnType: void;};
    /**
     * Allows overriding user agent with the given string.
     */
    'Network.setUserAgentOverride': {paramsType: [Protocol.Network.SetUserAgentOverrideRequest]; returnType: void;};
    /**
     * Returns information about the COEP/COOP isolation status.
     */
    'Network.getSecurityIsolationStatus': {
      paramsType: [Protocol.Network.GetSecurityIsolationStatusRequest?];
      returnType: Protocol.Network.GetSecurityIsolationStatusResponse;
    };
    /**
     * Fetches the resource and returns the content.
     */
    'Network.loadNetworkResource': {
      paramsType: [Protocol.Network.LoadNetworkResourceRequest];
      returnType: Protocol.Network.LoadNetworkResourceResponse;
    };
    /**
     * Disables domain notifications.
     */
    'Overlay.disable': {paramsType: []; returnType: void;};
    /**
     * Enables domain notifications.
     */
    'Overlay.enable': {paramsType: []; returnType: void;};
    /**
     * For testing.
     */
    'Overlay.getHighlightObjectForTest': {
      paramsType: [Protocol.Overlay.GetHighlightObjectForTestRequest];
      returnType: Protocol.Overlay.GetHighlightObjectForTestResponse;
    };
    /**
     * For Persistent Grid testing.
     */
    'Overlay.getGridHighlightObjectsForTest': {
      paramsType: [Protocol.Overlay.GetGridHighlightObjectsForTestRequest];
      returnType: Protocol.Overlay.GetGridHighlightObjectsForTestResponse;
    };
    /**
     * For Source Order Viewer testing.
     */
    'Overlay.getSourceOrderHighlightObjectForTest': {
      paramsType: [Protocol.Overlay.GetSourceOrderHighlightObjectForTestRequest];
      returnType: Protocol.Overlay.GetSourceOrderHighlightObjectForTestResponse;
    };
    /**
     * Hides any highlight.
     */
    'Overlay.hideHighlight': {paramsType: []; returnType: void;};
    /**
     * Highlights owner element of the frame with given id.
     */
    'Overlay.highlightFrame': {paramsType: [Protocol.Overlay.HighlightFrameRequest]; returnType: void;};
    /**
     * Highlights DOM node with given id or with the given JavaScript object wrapper. Either nodeId or
     * objectId must be specified.
     */
    'Overlay.highlightNode': {paramsType: [Protocol.Overlay.HighlightNodeRequest]; returnType: void;};
    /**
     * Highlights given quad. Coordinates are absolute with respect to the main frame viewport.
     */
    'Overlay.highlightQuad': {paramsType: [Protocol.Overlay.HighlightQuadRequest]; returnType: void;};
    /**
     * Highlights given rectangle. Coordinates are absolute with respect to the main frame viewport.
     */
    'Overlay.highlightRect': {paramsType: [Protocol.Overlay.HighlightRectRequest]; returnType: void;};
    /**
     * Highlights the source order of the children of the DOM node with given id or with the given
     * JavaScript object wrapper. Either nodeId or objectId must be specified.
     */
    'Overlay.highlightSourceOrder': {paramsType: [Protocol.Overlay.HighlightSourceOrderRequest]; returnType: void;};
    /**
     * Enters the 'inspect' mode. In this mode, elements that user is hovering over are highlighted.
     * Backend then generates 'inspectNodeRequested' event upon element selection.
     */
    'Overlay.setInspectMode': {paramsType: [Protocol.Overlay.SetInspectModeRequest]; returnType: void;};
    /**
     * Highlights owner element of all frames detected to be ads.
     */
    'Overlay.setShowAdHighlights': {paramsType: [Protocol.Overlay.SetShowAdHighlightsRequest]; returnType: void;};
    'Overlay.setPausedInDebuggerMessage':
        {paramsType: [Protocol.Overlay.SetPausedInDebuggerMessageRequest?]; returnType: void;};
    /**
     * Requests that backend shows debug borders on layers
     */
    'Overlay.setShowDebugBorders': {paramsType: [Protocol.Overlay.SetShowDebugBordersRequest]; returnType: void;};
    /**
     * Requests that backend shows the FPS counter
     */
    'Overlay.setShowFPSCounter': {paramsType: [Protocol.Overlay.SetShowFPSCounterRequest]; returnType: void;};
    /**
     * Highlight multiple elements with the CSS Grid overlay.
     */
    'Overlay.setShowGridOverlays': {paramsType: [Protocol.Overlay.SetShowGridOverlaysRequest]; returnType: void;};
    'Overlay.setShowFlexOverlays': {paramsType: [Protocol.Overlay.SetShowFlexOverlaysRequest]; returnType: void;};
    'Overlay.setShowScrollSnapOverlays':
        {paramsType: [Protocol.Overlay.SetShowScrollSnapOverlaysRequest]; returnType: void;};
    /**
     * Requests that backend shows paint rectangles
     */
    'Overlay.setShowPaintRects': {paramsType: [Protocol.Overlay.SetShowPaintRectsRequest]; returnType: void;};
    /**
     * Requests that backend shows layout shift regions
     */
    'Overlay.setShowLayoutShiftRegions':
        {paramsType: [Protocol.Overlay.SetShowLayoutShiftRegionsRequest]; returnType: void;};
    /**
     * Requests that backend shows scroll bottleneck rects
     */
    'Overlay.setShowScrollBottleneckRects':
        {paramsType: [Protocol.Overlay.SetShowScrollBottleneckRectsRequest]; returnType: void;};
    /**
     * Requests that backend shows hit-test borders on layers
     */
    'Overlay.setShowHitTestBorders': {paramsType: [Protocol.Overlay.SetShowHitTestBordersRequest]; returnType: void;};
    /**
     * Request that backend shows an overlay with web vital metrics.
     */
    'Overlay.setShowWebVitals': {paramsType: [Protocol.Overlay.SetShowWebVitalsRequest]; returnType: void;};
    /**
     * Paints viewport size upon main frame resize.
     */
    'Overlay.setShowViewportSizeOnResize':
        {paramsType: [Protocol.Overlay.SetShowViewportSizeOnResizeRequest]; returnType: void;};
    /**
     * Add a dual screen device hinge
     */
    'Overlay.setShowHinge': {paramsType: [Protocol.Overlay.SetShowHingeRequest?]; returnType: void;};
    /**
     * Deprecated, please use addScriptToEvaluateOnNewDocument instead.
     */
    'Page.addScriptToEvaluateOnLoad': {
      paramsType: [Protocol.Page.AddScriptToEvaluateOnLoadRequest];
      returnType: Protocol.Page.AddScriptToEvaluateOnLoadResponse;
    };
    /**
     * Evaluates given script in every frame upon creation (before loading frame's scripts).
     */
    'Page.addScriptToEvaluateOnNewDocument': {
      paramsType: [Protocol.Page.AddScriptToEvaluateOnNewDocumentRequest];
      returnType: Protocol.Page.AddScriptToEvaluateOnNewDocumentResponse;
    };
    /**
     * Brings page to front (activates tab).
     */
    'Page.bringToFront': {paramsType: []; returnType: void;};
    /**
     * Capture page screenshot.
     */
    'Page.captureScreenshot':
        {paramsType: [Protocol.Page.CaptureScreenshotRequest?]; returnType: Protocol.Page.CaptureScreenshotResponse;};
    /**
     * Returns a snapshot of the page as a string. For MHTML format, the serialization includes
     * iframes, shadow DOM, external resources, and element-inline styles.
     */
    'Page.captureSnapshot':
        {paramsType: [Protocol.Page.CaptureSnapshotRequest?]; returnType: Protocol.Page.CaptureSnapshotResponse;};
    /**
     * Clears the overridden device metrics.
     */
    'Page.clearDeviceMetricsOverride': {paramsType: []; returnType: void;};
    /**
     * Clears the overridden Device Orientation.
     */
    'Page.clearDeviceOrientationOverride': {paramsType: []; returnType: void;};
    /**
     * Clears the overridden Geolocation Position and Error.
     */
    'Page.clearGeolocationOverride': {paramsType: []; returnType: void;};
    /**
     * Creates an isolated world for the given frame.
     */
    'Page.createIsolatedWorld': {
      paramsType: [Protocol.Page.CreateIsolatedWorldRequest]; returnType: Protocol.Page.CreateIsolatedWorldResponse;
    };
    /**
     * Deletes browser cookie with given name, domain and path.
     */
    'Page.deleteCookie': {paramsType: [Protocol.Page.DeleteCookieRequest]; returnType: void;};
    /**
     * Disables page domain notifications.
     */
    'Page.disable': {paramsType: []; returnType: void;};
    /**
     * Enables page domain notifications.
     */
    'Page.enable': {paramsType: []; returnType: void;};
    'Page.getAppManifest': {paramsType: []; returnType: Protocol.Page.GetAppManifestResponse;};
    'Page.getInstallabilityErrors': {paramsType: []; returnType: Protocol.Page.GetInstallabilityErrorsResponse;};
    'Page.getManifestIcons': {paramsType: []; returnType: Protocol.Page.GetManifestIconsResponse;};
    /**
     * Returns all browser cookies. Depending on the backend support, will return detailed cookie
     * information in the `cookies` field.
     */
    'Page.getCookies': {paramsType: []; returnType: Protocol.Page.GetCookiesResponse;};
    /**
     * Returns present frame tree structure.
     */
    'Page.getFrameTree': {paramsType: []; returnType: Protocol.Page.GetFrameTreeResponse;};
    /**
     * Returns metrics relating to the layouting of the page, such as viewport bounds/scale.
     */
    'Page.getLayoutMetrics': {paramsType: []; returnType: Protocol.Page.GetLayoutMetricsResponse;};
    /**
     * Returns navigation history for the current page.
     */
    'Page.getNavigationHistory': {paramsType: []; returnType: Protocol.Page.GetNavigationHistoryResponse;};
    /**
     * Resets navigation history for the current page.
     */
    'Page.resetNavigationHistory': {paramsType: []; returnType: void;};
    /**
     * Returns content of the given resource.
     */
    'Page.getResourceContent':
        {paramsType: [Protocol.Page.GetResourceContentRequest]; returnType: Protocol.Page.GetResourceContentResponse;};
    /**
     * Returns present frame / resource tree structure.
     */
    'Page.getResourceTree': {paramsType: []; returnType: Protocol.Page.GetResourceTreeResponse;};
    /**
     * Accepts or dismisses a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload).
     */
    'Page.handleJavaScriptDialog': {paramsType: [Protocol.Page.HandleJavaScriptDialogRequest]; returnType: void;};
    /**
     * Navigates current page to the given URL.
     */
    'Page.navigate': {paramsType: [Protocol.Page.NavigateRequest]; returnType: Protocol.Page.NavigateResponse;};
    /**
     * Navigates current page to the given history entry.
     */
    'Page.navigateToHistoryEntry': {paramsType: [Protocol.Page.NavigateToHistoryEntryRequest]; returnType: void;};
    /**
     * Print page as PDF.
     */
    'Page.printToPDF': {paramsType: [Protocol.Page.PrintToPDFRequest?]; returnType: Protocol.Page.PrintToPDFResponse;};
    /**
     * Reloads given page optionally ignoring the cache.
     */
    'Page.reload': {paramsType: [Protocol.Page.ReloadRequest?]; returnType: void;};
    /**
     * Deprecated, please use removeScriptToEvaluateOnNewDocument instead.
     */
    'Page.removeScriptToEvaluateOnLoad':
        {paramsType: [Protocol.Page.RemoveScriptToEvaluateOnLoadRequest]; returnType: void;};
    /**
     * Removes given script from the list.
     */
    'Page.removeScriptToEvaluateOnNewDocument':
        {paramsType: [Protocol.Page.RemoveScriptToEvaluateOnNewDocumentRequest]; returnType: void;};
    /**
     * Acknowledges that a screencast frame has been received by the frontend.
     */
    'Page.screencastFrameAck': {paramsType: [Protocol.Page.ScreencastFrameAckRequest]; returnType: void;};
    /**
     * Searches for given string in resource content.
     */
    'Page.searchInResource':
        {paramsType: [Protocol.Page.SearchInResourceRequest]; returnType: Protocol.Page.SearchInResourceResponse;};
    /**
     * Enable Chrome's experimental ad filter on all sites.
     */
    'Page.setAdBlockingEnabled': {paramsType: [Protocol.Page.SetAdBlockingEnabledRequest]; returnType: void;};
    /**
     * Enable page Content Security Policy by-passing.
     */
    'Page.setBypassCSP': {paramsType: [Protocol.Page.SetBypassCSPRequest]; returnType: void;};
    /**
     * Get Permissions Policy state on given frame.
     */
    'Page.getPermissionsPolicyState': {
      paramsType: [Protocol.Page.GetPermissionsPolicyStateRequest];
      returnType: Protocol.Page.GetPermissionsPolicyStateResponse;
    };
    /**
     * Overrides the values of device screen dimensions (window.screen.width, window.screen.height,
     * window.innerWidth, window.innerHeight, and "device-width"/"device-height"-related CSS media
     * query results).
     */
    'Page.setDeviceMetricsOverride': {paramsType: [Protocol.Page.SetDeviceMetricsOverrideRequest]; returnType: void;};
    /**
     * Overrides the Device Orientation.
     */
    'Page.setDeviceOrientationOverride':
        {paramsType: [Protocol.Page.SetDeviceOrientationOverrideRequest]; returnType: void;};
    /**
     * Set generic font families.
     */
    'Page.setFontFamilies': {paramsType: [Protocol.Page.SetFontFamiliesRequest]; returnType: void;};
    /**
     * Set default font sizes.
     */
    'Page.setFontSizes': {paramsType: [Protocol.Page.SetFontSizesRequest]; returnType: void;};
    /**
     * Sets given markup as the document's HTML.
     */
    'Page.setDocumentContent': {paramsType: [Protocol.Page.SetDocumentContentRequest]; returnType: void;};
    /**
     * Set the behavior when downloading a file.
     */
    'Page.setDownloadBehavior': {paramsType: [Protocol.Page.SetDownloadBehaviorRequest]; returnType: void;};
    /**
     * Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position
     * unavailable.
     */
    'Page.setGeolocationOverride': {paramsType: [Protocol.Page.SetGeolocationOverrideRequest?]; returnType: void;};
    /**
     * Controls whether page will emit lifecycle events.
     */
    'Page.setLifecycleEventsEnabled': {paramsType: [Protocol.Page.SetLifecycleEventsEnabledRequest]; returnType: void;};
    /**
     * Toggles mouse event-based touch event emulation.
     */
    'Page.setTouchEmulationEnabled': {paramsType: [Protocol.Page.SetTouchEmulationEnabledRequest]; returnType: void;};
    /**
     * Starts sending each frame using the `screencastFrame` event.
     */
    'Page.startScreencast': {paramsType: [Protocol.Page.StartScreencastRequest?]; returnType: void;};
    /**
     * Force the page stop all navigations and pending resource fetches.
     */
    'Page.stopLoading': {paramsType: []; returnType: void;};
    /**
     * Crashes renderer on the IO thread, generates minidumps.
     */
    'Page.crash': {paramsType: []; returnType: void;};
    /**
     * Tries to close page, running its beforeunload hooks, if any.
     */
    'Page.close': {paramsType: []; returnType: void;};
    /**
     * Tries to update the web lifecycle state of the page.
     * It will transition the page to the given state according to:
     * https://github.com/WICG/web-lifecycle/
     */
    'Page.setWebLifecycleState': {paramsType: [Protocol.Page.SetWebLifecycleStateRequest]; returnType: void;};
    /**
     * Stops sending each frame in the `screencastFrame`.
     */
    'Page.stopScreencast': {paramsType: []; returnType: void;};
    /**
     * Forces compilation cache to be generated for every subresource script.
     * See also: `Page.produceCompilationCache`.
     */
    'Page.setProduceCompilationCache':
        {paramsType: [Protocol.Page.SetProduceCompilationCacheRequest]; returnType: void;};
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
    'Page.produceCompilationCache': {paramsType: [Protocol.Page.ProduceCompilationCacheRequest]; returnType: void;};
    /**
     * Seeds compilation cache for given url. Compilation cache does not survive
     * cross-process navigation.
     */
    'Page.addCompilationCache': {paramsType: [Protocol.Page.AddCompilationCacheRequest]; returnType: void;};
    /**
     * Clears seeded compilation cache.
     */
    'Page.clearCompilationCache': {paramsType: []; returnType: void;};
    /**
     * Generates a report for testing.
     */
    'Page.generateTestReport': {paramsType: [Protocol.Page.GenerateTestReportRequest]; returnType: void;};
    /**
     * Pauses page execution. Can be resumed using generic Runtime.runIfWaitingForDebugger.
     */
    'Page.waitForDebugger': {paramsType: []; returnType: void;};
    /**
     * Intercept file chooser requests and transfer control to protocol clients.
     * When file chooser interception is enabled, native file chooser dialog is not shown.
     * Instead, a protocol event `Page.fileChooserOpened` is emitted.
     */
    'Page.setInterceptFileChooserDialog':
        {paramsType: [Protocol.Page.SetInterceptFileChooserDialogRequest]; returnType: void;};
    /**
     * Disable collecting and reporting metrics.
     */
    'Performance.disable': {paramsType: []; returnType: void;};
    /**
     * Enable collecting and reporting metrics.
     */
    'Performance.enable': {paramsType: [Protocol.Performance.EnableRequest?]; returnType: void;};
    /**
     * Sets time domain to use for collecting and reporting duration metrics.
     * Note that this must be called before enabling metrics collection. Calling
     * this method while metrics collection is enabled returns an error.
     */
    'Performance.setTimeDomain': {paramsType: [Protocol.Performance.SetTimeDomainRequest]; returnType: void;};
    /**
     * Retrieve current values of run-time metrics.
     */
    'Performance.getMetrics': {paramsType: []; returnType: Protocol.Performance.GetMetricsResponse;};
    /**
     * Previously buffered events would be reported before method returns.
     * See also: timelineEventAdded
     */
    'PerformanceTimeline.enable': {paramsType: [Protocol.PerformanceTimeline.EnableRequest]; returnType: void;};
    /**
     * Disables tracking security state changes.
     */
    'Security.disable': {paramsType: []; returnType: void;};
    /**
     * Enables tracking security state changes.
     */
    'Security.enable': {paramsType: []; returnType: void;};
    /**
     * Enable/disable whether all certificate errors should be ignored.
     */
    'Security.setIgnoreCertificateErrors':
        {paramsType: [Protocol.Security.SetIgnoreCertificateErrorsRequest]; returnType: void;};
    /**
     * Handles a certificate error that fired a certificateError event.
     */
    'Security.handleCertificateError':
        {paramsType: [Protocol.Security.HandleCertificateErrorRequest]; returnType: void;};
    /**
     * Enable/disable overriding certificate errors. If enabled, all certificate error events need to
     * be handled by the DevTools client and should be answered with `handleCertificateError` commands.
     */
    'Security.setOverrideCertificateErrors':
        {paramsType: [Protocol.Security.SetOverrideCertificateErrorsRequest]; returnType: void;};
    'ServiceWorker.deliverPushMessage':
        {paramsType: [Protocol.ServiceWorker.DeliverPushMessageRequest]; returnType: void;};
    'ServiceWorker.disable': {paramsType: []; returnType: void;};
    'ServiceWorker.dispatchSyncEvent':
        {paramsType: [Protocol.ServiceWorker.DispatchSyncEventRequest]; returnType: void;};
    'ServiceWorker.dispatchPeriodicSyncEvent':
        {paramsType: [Protocol.ServiceWorker.DispatchPeriodicSyncEventRequest]; returnType: void;};
    'ServiceWorker.enable': {paramsType: []; returnType: void;};
    'ServiceWorker.inspectWorker': {paramsType: [Protocol.ServiceWorker.InspectWorkerRequest]; returnType: void;};
    'ServiceWorker.setForceUpdateOnPageLoad':
        {paramsType: [Protocol.ServiceWorker.SetForceUpdateOnPageLoadRequest]; returnType: void;};
    'ServiceWorker.skipWaiting': {paramsType: [Protocol.ServiceWorker.SkipWaitingRequest]; returnType: void;};
    'ServiceWorker.startWorker': {paramsType: [Protocol.ServiceWorker.StartWorkerRequest]; returnType: void;};
    'ServiceWorker.stopAllWorkers': {paramsType: []; returnType: void;};
    'ServiceWorker.stopWorker': {paramsType: [Protocol.ServiceWorker.StopWorkerRequest]; returnType: void;};
    'ServiceWorker.unregister': {paramsType: [Protocol.ServiceWorker.UnregisterRequest]; returnType: void;};
    'ServiceWorker.updateRegistration':
        {paramsType: [Protocol.ServiceWorker.UpdateRegistrationRequest]; returnType: void;};
    /**
     * Clears storage for origin.
     */
    'Storage.clearDataForOrigin': {paramsType: [Protocol.Storage.ClearDataForOriginRequest]; returnType: void;};
    /**
     * Returns all browser cookies.
     */
    'Storage.getCookies':
        {paramsType: [Protocol.Storage.GetCookiesRequest?]; returnType: Protocol.Storage.GetCookiesResponse;};
    /**
     * Sets given cookies.
     */
    'Storage.setCookies': {paramsType: [Protocol.Storage.SetCookiesRequest]; returnType: void;};
    /**
     * Clears cookies.
     */
    'Storage.clearCookies': {paramsType: [Protocol.Storage.ClearCookiesRequest?]; returnType: void;};
    /**
     * Returns usage and quota in bytes.
     */
    'Storage.getUsageAndQuota': {
      paramsType: [Protocol.Storage.GetUsageAndQuotaRequest]; returnType: Protocol.Storage.GetUsageAndQuotaResponse;
    };
    /**
     * Override quota for the specified origin
     */
    'Storage.overrideQuotaForOrigin': {paramsType: [Protocol.Storage.OverrideQuotaForOriginRequest]; returnType: void;};
    /**
     * Registers origin to be notified when an update occurs to its cache storage list.
     */
    'Storage.trackCacheStorageForOrigin':
        {paramsType: [Protocol.Storage.TrackCacheStorageForOriginRequest]; returnType: void;};
    /**
     * Registers origin to be notified when an update occurs to its IndexedDB.
     */
    'Storage.trackIndexedDBForOrigin':
        {paramsType: [Protocol.Storage.TrackIndexedDBForOriginRequest]; returnType: void;};
    /**
     * Unregisters origin from receiving notifications for cache storage.
     */
    'Storage.untrackCacheStorageForOrigin':
        {paramsType: [Protocol.Storage.UntrackCacheStorageForOriginRequest]; returnType: void;};
    /**
     * Unregisters origin from receiving notifications for IndexedDB.
     */
    'Storage.untrackIndexedDBForOrigin':
        {paramsType: [Protocol.Storage.UntrackIndexedDBForOriginRequest]; returnType: void;};
    /**
     * Returns the number of stored Trust Tokens per issuer for the
     * current browsing context.
     */
    'Storage.getTrustTokens': {paramsType: []; returnType: Protocol.Storage.GetTrustTokensResponse;};
    /**
     * Removes all Trust Tokens issued by the provided issuerOrigin.
     * Leaves other stored data, including the issuer's Redemption Records, intact.
     */
    'Storage.clearTrustTokens': {
      paramsType: [Protocol.Storage.ClearTrustTokensRequest]; returnType: Protocol.Storage.ClearTrustTokensResponse;
    };
    /**
     * Returns information about the system.
     */
    'SystemInfo.getInfo': {paramsType: []; returnType: Protocol.SystemInfo.GetInfoResponse;};
    /**
     * Returns information about all running processes.
     */
    'SystemInfo.getProcessInfo': {paramsType: []; returnType: Protocol.SystemInfo.GetProcessInfoResponse;};
    /**
     * Activates (focuses) the target.
     */
    'Target.activateTarget': {paramsType: [Protocol.Target.ActivateTargetRequest]; returnType: void;};
    /**
     * Attaches to the target with given id.
     */
    'Target.attachToTarget':
        {paramsType: [Protocol.Target.AttachToTargetRequest]; returnType: Protocol.Target.AttachToTargetResponse;};
    /**
     * Attaches to the browser target, only uses flat sessionId mode.
     */
    'Target.attachToBrowserTarget': {paramsType: []; returnType: Protocol.Target.AttachToBrowserTargetResponse;};
    /**
     * Closes the target. If the target is a page that gets closed too.
     */
    'Target.closeTarget':
        {paramsType: [Protocol.Target.CloseTargetRequest]; returnType: Protocol.Target.CloseTargetResponse;};
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
    'Target.exposeDevToolsProtocol': {paramsType: [Protocol.Target.ExposeDevToolsProtocolRequest]; returnType: void;};
    /**
     * Creates a new empty BrowserContext. Similar to an incognito profile but you can have more than
     * one.
     */
    'Target.createBrowserContext': {
      paramsType: [Protocol.Target.CreateBrowserContextRequest?];
      returnType: Protocol.Target.CreateBrowserContextResponse;
    };
    /**
     * Returns all browser contexts created with `Target.createBrowserContext` method.
     */
    'Target.getBrowserContexts': {paramsType: []; returnType: Protocol.Target.GetBrowserContextsResponse;};
    /**
     * Creates a new page.
     */
    'Target.createTarget':
        {paramsType: [Protocol.Target.CreateTargetRequest]; returnType: Protocol.Target.CreateTargetResponse;};
    /**
     * Detaches session with given id.
     */
    'Target.detachFromTarget': {paramsType: [Protocol.Target.DetachFromTargetRequest?]; returnType: void;};
    /**
     * Deletes a BrowserContext. All the belonging pages will be closed without calling their
     * beforeunload hooks.
     */
    'Target.disposeBrowserContext': {paramsType: [Protocol.Target.DisposeBrowserContextRequest]; returnType: void;};
    /**
     * Returns information about a target.
     */
    'Target.getTargetInfo':
        {paramsType: [Protocol.Target.GetTargetInfoRequest?]; returnType: Protocol.Target.GetTargetInfoResponse;};
    /**
     * Retrieves a list of available targets.
     */
    'Target.getTargets': {paramsType: []; returnType: Protocol.Target.GetTargetsResponse;};
    /**
     * Sends protocol message over session with given id.
     * Consider using flat mode instead; see commands attachToTarget, setAutoAttach,
     * and crbug.com/991325.
     */
    'Target.sendMessageToTarget': {paramsType: [Protocol.Target.SendMessageToTargetRequest]; returnType: void;};
    /**
     * Controls whether to automatically attach to new targets which are considered to be related to
     * this one. When turned on, attaches to all existing related targets as well. When turned off,
     * automatically detaches from all currently attached targets.
     */
    'Target.setAutoAttach': {paramsType: [Protocol.Target.SetAutoAttachRequest]; returnType: void;};
    /**
     * Controls whether to discover available targets and notify via
     * `targetCreated/targetInfoChanged/targetDestroyed` events.
     */
    'Target.setDiscoverTargets': {paramsType: [Protocol.Target.SetDiscoverTargetsRequest]; returnType: void;};
    /**
     * Enables target discovery for the specified locations, when `setDiscoverTargets` was set to
     * `true`.
     */
    'Target.setRemoteLocations': {paramsType: [Protocol.Target.SetRemoteLocationsRequest]; returnType: void;};
    /**
     * Request browser port binding.
     */
    'Tethering.bind': {paramsType: [Protocol.Tethering.BindRequest]; returnType: void;};
    /**
     * Request browser port unbinding.
     */
    'Tethering.unbind': {paramsType: [Protocol.Tethering.UnbindRequest]; returnType: void;};
    /**
     * Stop trace events collection.
     */
    'Tracing.end': {paramsType: []; returnType: void;};
    /**
     * Gets supported tracing categories.
     */
    'Tracing.getCategories': {paramsType: []; returnType: Protocol.Tracing.GetCategoriesResponse;};
    /**
     * Record a clock sync marker in the trace.
     */
    'Tracing.recordClockSyncMarker': {paramsType: [Protocol.Tracing.RecordClockSyncMarkerRequest]; returnType: void;};
    /**
     * Request a global memory dump.
     */
    'Tracing.requestMemoryDump': {
      paramsType: [Protocol.Tracing.RequestMemoryDumpRequest?]; returnType: Protocol.Tracing.RequestMemoryDumpResponse;
    };
    /**
     * Start trace events collection.
     */
    'Tracing.start': {paramsType: [Protocol.Tracing.StartRequest?]; returnType: void;};
    /**
     * Disables the fetch domain.
     */
    'Fetch.disable': {paramsType: []; returnType: void;};
    /**
     * Enables issuing of requestPaused events. A request will be paused until client
     * calls one of failRequest, fulfillRequest or continueRequest/continueWithAuth.
     */
    'Fetch.enable': {paramsType: [Protocol.Fetch.EnableRequest?]; returnType: void;};
    /**
     * Causes the request to fail with specified reason.
     */
    'Fetch.failRequest': {paramsType: [Protocol.Fetch.FailRequestRequest]; returnType: void;};
    /**
     * Provides response to the request.
     */
    'Fetch.fulfillRequest': {paramsType: [Protocol.Fetch.FulfillRequestRequest]; returnType: void;};
    /**
     * Continues the request, optionally modifying some of its parameters.
     */
    'Fetch.continueRequest': {paramsType: [Protocol.Fetch.ContinueRequestRequest]; returnType: void;};
    /**
     * Continues a request supplying authChallengeResponse following authRequired event.
     */
    'Fetch.continueWithAuth': {paramsType: [Protocol.Fetch.ContinueWithAuthRequest]; returnType: void;};
    /**
     * Causes the body of the response to be received from the server and
     * returned as a single string. May only be issued for a request that
     * is paused in the Response stage and is mutually exclusive with
     * takeResponseBodyForInterceptionAsStream. Calling other methods that
     * affect the request or disabling fetch domain before body is received
     * results in an undefined behavior.
     */
    'Fetch.getResponseBody':
        {paramsType: [Protocol.Fetch.GetResponseBodyRequest]; returnType: Protocol.Fetch.GetResponseBodyResponse;};
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
    'Fetch.takeResponseBodyAsStream': {
      paramsType: [Protocol.Fetch.TakeResponseBodyAsStreamRequest];
      returnType: Protocol.Fetch.TakeResponseBodyAsStreamResponse;
    };
    /**
     * Enables the WebAudio domain and starts sending context lifetime events.
     */
    'WebAudio.enable': {paramsType: []; returnType: void;};
    /**
     * Disables the WebAudio domain.
     */
    'WebAudio.disable': {paramsType: []; returnType: void;};
    /**
     * Fetch the realtime data from the registered contexts.
     */
    'WebAudio.getRealtimeData': {
      paramsType: [Protocol.WebAudio.GetRealtimeDataRequest]; returnType: Protocol.WebAudio.GetRealtimeDataResponse;
    };
    /**
     * Enable the WebAuthn domain and start intercepting credential storage and
     * retrieval with a virtual authenticator.
     */
    'WebAuthn.enable': {paramsType: []; returnType: void;};
    /**
     * Disable the WebAuthn domain.
     */
    'WebAuthn.disable': {paramsType: []; returnType: void;};
    /**
     * Creates and adds a virtual authenticator.
     */
    'WebAuthn.addVirtualAuthenticator': {
      paramsType: [Protocol.WebAuthn.AddVirtualAuthenticatorRequest];
      returnType: Protocol.WebAuthn.AddVirtualAuthenticatorResponse;
    };
    /**
     * Removes the given authenticator.
     */
    'WebAuthn.removeVirtualAuthenticator':
        {paramsType: [Protocol.WebAuthn.RemoveVirtualAuthenticatorRequest]; returnType: void;};
    /**
     * Adds the credential to the specified authenticator.
     */
    'WebAuthn.addCredential': {paramsType: [Protocol.WebAuthn.AddCredentialRequest]; returnType: void;};
    /**
     * Returns a single credential stored in the given virtual authenticator that
     * matches the credential ID.
     */
    'WebAuthn.getCredential':
        {paramsType: [Protocol.WebAuthn.GetCredentialRequest]; returnType: Protocol.WebAuthn.GetCredentialResponse;};
    /**
     * Returns all the credentials stored in the given virtual authenticator.
     */
    'WebAuthn.getCredentials':
        {paramsType: [Protocol.WebAuthn.GetCredentialsRequest]; returnType: Protocol.WebAuthn.GetCredentialsResponse;};
    /**
     * Removes a credential from the authenticator.
     */
    'WebAuthn.removeCredential': {paramsType: [Protocol.WebAuthn.RemoveCredentialRequest]; returnType: void;};
    /**
     * Clears all the credentials from the specified device.
     */
    'WebAuthn.clearCredentials': {paramsType: [Protocol.WebAuthn.ClearCredentialsRequest]; returnType: void;};
    /**
     * Sets whether User Verification succeeds or fails for an authenticator.
     * The default is true.
     */
    'WebAuthn.setUserVerified': {paramsType: [Protocol.WebAuthn.SetUserVerifiedRequest]; returnType: void;};
    /**
     * Sets whether tests of user presence will succeed immediately (if true) or fail to resolve (if false) for an authenticator.
     * The default is true.
     */
    'WebAuthn.setAutomaticPresenceSimulation':
        {paramsType: [Protocol.WebAuthn.SetAutomaticPresenceSimulationRequest]; returnType: void;};
    /**
     * Enables the Media domain
     */
    'Media.enable': {paramsType: []; returnType: void;};
    /**
     * Disables the Media domain.
     */
    'Media.disable': {paramsType: []; returnType: void;};
    /**
     * Continues execution until specific location is reached.
     */
    'Debugger.continueToLocation': {paramsType: [Protocol.Debugger.ContinueToLocationRequest]; returnType: void;};
    /**
     * Disables debugger for given page.
     */
    'Debugger.disable': {paramsType: []; returnType: void;};
    /**
     * Enables debugger for the given page. Clients should not assume that the debugging has been
     * enabled until the result for this command is received.
     */
    'Debugger.enable': {paramsType: [Protocol.Debugger.EnableRequest?]; returnType: Protocol.Debugger.EnableResponse;};
    /**
     * Evaluates expression on a given call frame.
     */
    'Debugger.evaluateOnCallFrame': {
      paramsType: [Protocol.Debugger.EvaluateOnCallFrameRequest];
      returnType: Protocol.Debugger.EvaluateOnCallFrameResponse;
    };
    /**
     * Returns possible locations for breakpoint. scriptId in start and end range locations should be
     * the same.
     */
    'Debugger.getPossibleBreakpoints': {
      paramsType: [Protocol.Debugger.GetPossibleBreakpointsRequest];
      returnType: Protocol.Debugger.GetPossibleBreakpointsResponse;
    };
    /**
     * Returns source for the script with given id.
     */
    'Debugger.getScriptSource': {
      paramsType: [Protocol.Debugger.GetScriptSourceRequest]; returnType: Protocol.Debugger.GetScriptSourceResponse;
    };
    /**
     * This command is deprecated. Use getScriptSource instead.
     */
    'Debugger.getWasmBytecode': {
      paramsType: [Protocol.Debugger.GetWasmBytecodeRequest]; returnType: Protocol.Debugger.GetWasmBytecodeResponse;
    };
    /**
     * Returns stack trace with given `stackTraceId`.
     */
    'Debugger.getStackTrace':
        {paramsType: [Protocol.Debugger.GetStackTraceRequest]; returnType: Protocol.Debugger.GetStackTraceResponse;};
    /**
     * Stops on the next JavaScript statement.
     */
    'Debugger.pause': {paramsType: []; returnType: void;};
    'Debugger.pauseOnAsyncCall': {paramsType: [Protocol.Debugger.PauseOnAsyncCallRequest]; returnType: void;};
    /**
     * Removes JavaScript breakpoint.
     */
    'Debugger.removeBreakpoint': {paramsType: [Protocol.Debugger.RemoveBreakpointRequest]; returnType: void;};
    /**
     * Restarts particular call frame from the beginning.
     */
    'Debugger.restartFrame':
        {paramsType: [Protocol.Debugger.RestartFrameRequest]; returnType: Protocol.Debugger.RestartFrameResponse;};
    /**
     * Resumes JavaScript execution.
     */
    'Debugger.resume': {paramsType: [Protocol.Debugger.ResumeRequest?]; returnType: void;};
    /**
     * Searches for given string in script content.
     */
    'Debugger.searchInContent': {
      paramsType: [Protocol.Debugger.SearchInContentRequest]; returnType: Protocol.Debugger.SearchInContentResponse;
    };
    /**
     * Enables or disables async call stacks tracking.
     */
    'Debugger.setAsyncCallStackDepth':
        {paramsType: [Protocol.Debugger.SetAsyncCallStackDepthRequest]; returnType: void;};
    /**
     * Replace previous blackbox patterns with passed ones. Forces backend to skip stepping/pausing in
     * scripts with url matching one of the patterns. VM will try to leave blackboxed script by
     * performing 'step in' several times, finally resorting to 'step out' if unsuccessful.
     */
    'Debugger.setBlackboxPatterns': {paramsType: [Protocol.Debugger.SetBlackboxPatternsRequest]; returnType: void;};
    /**
     * Makes backend skip steps in the script in blackboxed ranges. VM will try leave blacklisted
     * scripts by performing 'step in' several times, finally resorting to 'step out' if unsuccessful.
     * Positions array contains positions where blackbox state is changed. First interval isn't
     * blackboxed. Array should be sorted.
     */
    'Debugger.setBlackboxedRanges': {paramsType: [Protocol.Debugger.SetBlackboxedRangesRequest]; returnType: void;};
    /**
     * Sets JavaScript breakpoint at a given location.
     */
    'Debugger.setBreakpoint':
        {paramsType: [Protocol.Debugger.SetBreakpointRequest]; returnType: Protocol.Debugger.SetBreakpointResponse;};
    /**
     * Sets instrumentation breakpoint.
     */
    'Debugger.setInstrumentationBreakpoint': {
      paramsType: [Protocol.Debugger.SetInstrumentationBreakpointRequest];
      returnType: Protocol.Debugger.SetInstrumentationBreakpointResponse;
    };
    /**
     * Sets JavaScript breakpoint at given location specified either by URL or URL regex. Once this
     * command is issued, all existing parsed scripts will have breakpoints resolved and returned in
     * `locations` property. Further matching script parsing will result in subsequent
     * `breakpointResolved` events issued. This logical breakpoint will survive page reloads.
     */
    'Debugger.setBreakpointByUrl': {
      paramsType: [Protocol.Debugger.SetBreakpointByUrlRequest];
      returnType: Protocol.Debugger.SetBreakpointByUrlResponse;
    };
    /**
     * Sets JavaScript breakpoint before each call to the given function.
     * If another function was created from the same source as a given one,
     * calling it will also trigger the breakpoint.
     */
    'Debugger.setBreakpointOnFunctionCall': {
      paramsType: [Protocol.Debugger.SetBreakpointOnFunctionCallRequest];
      returnType: Protocol.Debugger.SetBreakpointOnFunctionCallResponse;
    };
    /**
     * Activates / deactivates all breakpoints on the page.
     */
    'Debugger.setBreakpointsActive': {paramsType: [Protocol.Debugger.SetBreakpointsActiveRequest]; returnType: void;};
    /**
     * Defines pause on exceptions state. Can be set to stop on all exceptions, uncaught exceptions or
     * no exceptions. Initial pause on exceptions state is `none`.
     */
    'Debugger.setPauseOnExceptions': {paramsType: [Protocol.Debugger.SetPauseOnExceptionsRequest]; returnType: void;};
    /**
     * Changes return value in top frame. Available only at return break position.
     */
    'Debugger.setReturnValue': {paramsType: [Protocol.Debugger.SetReturnValueRequest]; returnType: void;};
    /**
     * Edits JavaScript source live.
     */
    'Debugger.setScriptSource': {
      paramsType: [Protocol.Debugger.SetScriptSourceRequest]; returnType: Protocol.Debugger.SetScriptSourceResponse;
    };
    /**
     * Makes page not interrupt on any pauses (breakpoint, exception, dom exception etc).
     */
    'Debugger.setSkipAllPauses': {paramsType: [Protocol.Debugger.SetSkipAllPausesRequest]; returnType: void;};
    /**
     * Changes value of variable in a callframe. Object-based scopes are not supported and must be
     * mutated manually.
     */
    'Debugger.setVariableValue': {paramsType: [Protocol.Debugger.SetVariableValueRequest]; returnType: void;};
    /**
     * Steps into the function call.
     */
    'Debugger.stepInto': {paramsType: [Protocol.Debugger.StepIntoRequest?]; returnType: void;};
    /**
     * Steps out of the function call.
     */
    'Debugger.stepOut': {paramsType: []; returnType: void;};
    /**
     * Steps over the statement.
     */
    'Debugger.stepOver': {paramsType: [Protocol.Debugger.StepOverRequest?]; returnType: void;};
    /**
     * Enables console to refer to the node with given id via $x (see Command Line API for more details
     * $x functions).
     */
    'HeapProfiler.addInspectedHeapObject':
        {paramsType: [Protocol.HeapProfiler.AddInspectedHeapObjectRequest]; returnType: void;};
    'HeapProfiler.collectGarbage': {paramsType: []; returnType: void;};
    'HeapProfiler.disable': {paramsType: []; returnType: void;};
    'HeapProfiler.enable': {paramsType: []; returnType: void;};
    'HeapProfiler.getHeapObjectId': {
      paramsType: [Protocol.HeapProfiler.GetHeapObjectIdRequest];
      returnType: Protocol.HeapProfiler.GetHeapObjectIdResponse;
    };
    'HeapProfiler.getObjectByHeapObjectId': {
      paramsType: [Protocol.HeapProfiler.GetObjectByHeapObjectIdRequest];
      returnType: Protocol.HeapProfiler.GetObjectByHeapObjectIdResponse;
    };
    'HeapProfiler.getSamplingProfile': {paramsType: []; returnType: Protocol.HeapProfiler.GetSamplingProfileResponse;};
    'HeapProfiler.startSampling': {paramsType: [Protocol.HeapProfiler.StartSamplingRequest?]; returnType: void;};
    'HeapProfiler.startTrackingHeapObjects':
        {paramsType: [Protocol.HeapProfiler.StartTrackingHeapObjectsRequest?]; returnType: void;};
    'HeapProfiler.stopSampling': {paramsType: []; returnType: Protocol.HeapProfiler.StopSamplingResponse;};
    'HeapProfiler.stopTrackingHeapObjects':
        {paramsType: [Protocol.HeapProfiler.StopTrackingHeapObjectsRequest?]; returnType: void;};
    'HeapProfiler.takeHeapSnapshot': {paramsType: [Protocol.HeapProfiler.TakeHeapSnapshotRequest?]; returnType: void;};
    'Profiler.disable': {paramsType: []; returnType: void;};
    'Profiler.enable': {paramsType: []; returnType: void;};
    /**
     * Collect coverage data for the current isolate. The coverage data may be incomplete due to
     * garbage collection.
     */
    'Profiler.getBestEffortCoverage': {paramsType: []; returnType: Protocol.Profiler.GetBestEffortCoverageResponse;};
    /**
     * Changes CPU profiler sampling interval. Must be called before CPU profiles recording started.
     */
    'Profiler.setSamplingInterval': {paramsType: [Protocol.Profiler.SetSamplingIntervalRequest]; returnType: void;};
    'Profiler.start': {paramsType: []; returnType: void;};
    /**
     * Enable precise code coverage. Coverage data for JavaScript executed before enabling precise code
     * coverage may be incomplete. Enabling prevents running optimized code and resets execution
     * counters.
     */
    'Profiler.startPreciseCoverage': {
      paramsType: [Protocol.Profiler.StartPreciseCoverageRequest?];
      returnType: Protocol.Profiler.StartPreciseCoverageResponse;
    };
    /**
     * Enable type profile.
     */
    'Profiler.startTypeProfile': {paramsType: []; returnType: void;};
    'Profiler.stop': {paramsType: []; returnType: Protocol.Profiler.StopResponse;};
    /**
     * Disable precise code coverage. Disabling releases unnecessary execution count records and allows
     * executing optimized code.
     */
    'Profiler.stopPreciseCoverage': {paramsType: []; returnType: void;};
    /**
     * Disable type profile. Disabling releases type profile data collected so far.
     */
    'Profiler.stopTypeProfile': {paramsType: []; returnType: void;};
    /**
     * Collect coverage data for the current isolate, and resets execution counters. Precise code
     * coverage needs to have started.
     */
    'Profiler.takePreciseCoverage': {paramsType: []; returnType: Protocol.Profiler.TakePreciseCoverageResponse;};
    /**
     * Collect type profile.
     */
    'Profiler.takeTypeProfile': {paramsType: []; returnType: Protocol.Profiler.TakeTypeProfileResponse;};
    /**
     * Enable counters collection.
     */
    'Profiler.enableCounters': {paramsType: []; returnType: void;};
    /**
     * Disable counters collection.
     */
    'Profiler.disableCounters': {paramsType: []; returnType: void;};
    /**
     * Retrieve counters.
     */
    'Profiler.getCounters': {paramsType: []; returnType: Protocol.Profiler.GetCountersResponse;};
    /**
     * Enable run time call stats collection.
     */
    'Profiler.enableRuntimeCallStats': {paramsType: []; returnType: void;};
    /**
     * Disable run time call stats collection.
     */
    'Profiler.disableRuntimeCallStats': {paramsType: []; returnType: void;};
    /**
     * Retrieve run time call stats.
     */
    'Profiler.getRuntimeCallStats': {paramsType: []; returnType: Protocol.Profiler.GetRuntimeCallStatsResponse;};
    /**
     * Add handler to promise with given promise object id.
     */
    'Runtime.awaitPromise':
        {paramsType: [Protocol.Runtime.AwaitPromiseRequest]; returnType: Protocol.Runtime.AwaitPromiseResponse;};
    /**
     * Calls function with given declaration on the given object. Object group of the result is
     * inherited from the target object.
     */
    'Runtime.callFunctionOn':
        {paramsType: [Protocol.Runtime.CallFunctionOnRequest]; returnType: Protocol.Runtime.CallFunctionOnResponse;};
    /**
     * Compiles expression.
     */
    'Runtime.compileScript':
        {paramsType: [Protocol.Runtime.CompileScriptRequest]; returnType: Protocol.Runtime.CompileScriptResponse;};
    /**
     * Disables reporting of execution contexts creation.
     */
    'Runtime.disable': {paramsType: []; returnType: void;};
    /**
     * Discards collected exceptions and console API calls.
     */
    'Runtime.discardConsoleEntries': {paramsType: []; returnType: void;};
    /**
     * Enables reporting of execution contexts creation by means of `executionContextCreated` event.
     * When the reporting gets enabled the event will be sent immediately for each existing execution
     * context.
     */
    'Runtime.enable': {paramsType: []; returnType: void;};
    /**
     * Evaluates expression on global object.
     */
    'Runtime.evaluate':
        {paramsType: [Protocol.Runtime.EvaluateRequest]; returnType: Protocol.Runtime.EvaluateResponse;};
    /**
     * Returns the isolate id.
     */
    'Runtime.getIsolateId': {paramsType: []; returnType: Protocol.Runtime.GetIsolateIdResponse;};
    /**
     * Returns the JavaScript heap usage.
     * It is the total usage of the corresponding isolate not scoped to a particular Runtime.
     */
    'Runtime.getHeapUsage': {paramsType: []; returnType: Protocol.Runtime.GetHeapUsageResponse;};
    /**
     * Returns properties of a given object. Object group of the result is inherited from the target
     * object.
     */
    'Runtime.getProperties':
        {paramsType: [Protocol.Runtime.GetPropertiesRequest]; returnType: Protocol.Runtime.GetPropertiesResponse;};
    /**
     * Returns all let, const and class variables from global scope.
     */
    'Runtime.globalLexicalScopeNames': {
      paramsType: [Protocol.Runtime.GlobalLexicalScopeNamesRequest?];
      returnType: Protocol.Runtime.GlobalLexicalScopeNamesResponse;
    };
    'Runtime.queryObjects':
        {paramsType: [Protocol.Runtime.QueryObjectsRequest]; returnType: Protocol.Runtime.QueryObjectsResponse;};
    /**
     * Releases remote object with given id.
     */
    'Runtime.releaseObject': {paramsType: [Protocol.Runtime.ReleaseObjectRequest]; returnType: void;};
    /**
     * Releases all remote objects that belong to a given group.
     */
    'Runtime.releaseObjectGroup': {paramsType: [Protocol.Runtime.ReleaseObjectGroupRequest]; returnType: void;};
    /**
     * Tells inspected instance to run if it was waiting for debugger to attach.
     */
    'Runtime.runIfWaitingForDebugger': {paramsType: []; returnType: void;};
    /**
     * Runs script with given id in a given context.
     */
    'Runtime.runScript':
        {paramsType: [Protocol.Runtime.RunScriptRequest]; returnType: Protocol.Runtime.RunScriptResponse;};
    /**
     * Enables or disables async call stacks tracking.
     */
    'Runtime.setAsyncCallStackDepth': {paramsType: [Protocol.Runtime.SetAsyncCallStackDepthRequest]; returnType: void;};
    'Runtime.setCustomObjectFormatterEnabled':
        {paramsType: [Protocol.Runtime.SetCustomObjectFormatterEnabledRequest]; returnType: void;};
    'Runtime.setMaxCallStackSizeToCapture':
        {paramsType: [Protocol.Runtime.SetMaxCallStackSizeToCaptureRequest]; returnType: void;};
    /**
     * Terminate current or next JavaScript execution.
     * Will cancel the termination when the outer-most script execution ends.
     */
    'Runtime.terminateExecution': {paramsType: []; returnType: void;};
    /**
     * If executionContextId is empty, adds binding with the given name on the
     * global objects of all inspected contexts, including those created later,
     * bindings survive reloads.
     * Binding function takes exactly one argument, this argument should be string,
     * in case of any other input, function throws an exception.
     * Each binding function call produces Runtime.bindingCalled notification.
     */
    'Runtime.addBinding': {paramsType: [Protocol.Runtime.AddBindingRequest]; returnType: void;};
    /**
     * This method does not remove binding function from global object but
     * unsubscribes current runtime agent from Runtime.bindingCalled notifications.
     */
    'Runtime.removeBinding': {paramsType: [Protocol.Runtime.RemoveBindingRequest]; returnType: void;};
    /**
     * Returns supported domains.
     */
    'Schema.getDomains': {paramsType: []; returnType: Protocol.Schema.GetDomainsResponse;};
  }
}

export default ProtocolMapping;
