Protocol.Accessibility = {};

/**
 * @constructor
 */
Protocol.AccessibilityAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.AccessibilityAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.AccessibilityAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.AccessibilityAgent.DisableResponse;
/**
 * @param {!Protocol.AccessibilityAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.AccessibilityAgent.DisableResponse>} */
Protocol.AccessibilityAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.AccessibilityAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.AccessibilityAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.AccessibilityAgent.EnableResponse;
/**
 * @param {!Protocol.AccessibilityAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.AccessibilityAgent.EnableResponse>} */
Protocol.AccessibilityAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId=} opt_nodeId
 * @param {Protocol.DOM.BackendNodeId=} opt_backendNodeId
 * @param {Protocol.Runtime.RemoteObjectId=} opt_objectId
 * @param {boolean=} opt_fetchRelatives
 * @return {!Promise<?Array<Protocol.Accessibility.AXNode>>}
 */
Protocol.AccessibilityAgent.prototype.getPartialAXTree = function (
  opt_nodeId,
  opt_backendNodeId,
  opt_objectId,
  opt_fetchRelatives,
) {};
/** @typedef {!{objectId: (Protocol.Runtime.RemoteObjectId|undefined), nodeId: (Protocol.DOM.NodeId|undefined), backendNodeId: (Protocol.DOM.BackendNodeId|undefined), fetchRelatives: (boolean|undefined)}} */
Protocol.AccessibilityAgent.GetPartialAXTreeRequest;
/** @typedef {!{nodes: !Array<Protocol.Accessibility.AXNode>}} */
Protocol.AccessibilityAgent.GetPartialAXTreeResponse;
/**
 * @param {!Protocol.AccessibilityAgent.GetPartialAXTreeRequest} obj
 * @return {!Promise<!Protocol.AccessibilityAgent.GetPartialAXTreeResponse>} */
Protocol.AccessibilityAgent.prototype.invoke_getPartialAXTree = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.Accessibility.AXNode>>}
 */
Protocol.AccessibilityAgent.prototype.getFullAXTree = function () {};
/** @typedef {Object|undefined} */
Protocol.AccessibilityAgent.GetFullAXTreeRequest;
/** @typedef {!{nodes: !Array<Protocol.Accessibility.AXNode>}} */
Protocol.AccessibilityAgent.GetFullAXTreeResponse;
/**
 * @param {!Protocol.AccessibilityAgent.GetFullAXTreeRequest} obj
 * @return {!Promise<!Protocol.AccessibilityAgent.GetFullAXTreeResponse>} */
Protocol.AccessibilityAgent.prototype.invoke_getFullAXTree = function (obj) {};

/** @typedef {string} */
Protocol.Accessibility.AXNodeId;

/** @enum {string} */
Protocol.Accessibility.AXValueType = {
  Boolean: 'boolean',
  Tristate: 'tristate',
  BooleanOrUndefined: 'booleanOrUndefined',
  Idref: 'idref',
  IdrefList: 'idrefList',
  Integer: 'integer',
  Node: 'node',
  NodeList: 'nodeList',
  Number: 'number',
  String: 'string',
  ComputedString: 'computedString',
  Token: 'token',
  TokenList: 'tokenList',
  DomRelation: 'domRelation',
  Role: 'role',
  InternalRole: 'internalRole',
  ValueUndefined: 'valueUndefined',
};

/** @enum {string} */
Protocol.Accessibility.AXValueSourceType = {
  Attribute: 'attribute',
  Implicit: 'implicit',
  Style: 'style',
  Contents: 'contents',
  Placeholder: 'placeholder',
  RelatedElement: 'relatedElement',
};

/** @enum {string} */
Protocol.Accessibility.AXValueNativeSourceType = {
  Figcaption: 'figcaption',
  Label: 'label',
  Labelfor: 'labelfor',
  Labelwrapped: 'labelwrapped',
  Legend: 'legend',
  Tablecaption: 'tablecaption',
  Title: 'title',
  Other: 'other',
};

/** @typedef {!{type:(Protocol.Accessibility.AXValueSourceType), value:(Protocol.Accessibility.AXValue|undefined), attribute:(string|undefined), attributeValue:(Protocol.Accessibility.AXValue|undefined), superseded:(boolean|undefined), nativeSource:(Protocol.Accessibility.AXValueNativeSourceType|undefined), nativeSourceValue:(Protocol.Accessibility.AXValue|undefined), invalid:(boolean|undefined), invalidReason:(string|undefined)}} */
Protocol.Accessibility.AXValueSource;

/** @typedef {!{backendDOMNodeId:(Protocol.DOM.BackendNodeId), idref:(string|undefined), text:(string|undefined)}} */
Protocol.Accessibility.AXRelatedNode;

/** @typedef {!{name:(Protocol.Accessibility.AXPropertyName), value:(Protocol.Accessibility.AXValue)}} */
Protocol.Accessibility.AXProperty;

/** @typedef {!{type:(Protocol.Accessibility.AXValueType), value:(*|undefined), relatedNodes:(!Array<Protocol.Accessibility.AXRelatedNode>|undefined), sources:(!Array<Protocol.Accessibility.AXValueSource>|undefined)}} */
Protocol.Accessibility.AXValue;

/** @enum {string} */
Protocol.Accessibility.AXPropertyName = {
  Busy: 'busy',
  Disabled: 'disabled',
  Editable: 'editable',
  Focusable: 'focusable',
  Focused: 'focused',
  Hidden: 'hidden',
  HiddenRoot: 'hiddenRoot',
  Invalid: 'invalid',
  Keyshortcuts: 'keyshortcuts',
  Settable: 'settable',
  Roledescription: 'roledescription',
  Live: 'live',
  Atomic: 'atomic',
  Relevant: 'relevant',
  Root: 'root',
  Autocomplete: 'autocomplete',
  HasPopup: 'hasPopup',
  Level: 'level',
  Multiselectable: 'multiselectable',
  Orientation: 'orientation',
  Multiline: 'multiline',
  Readonly: 'readonly',
  Required: 'required',
  Valuemin: 'valuemin',
  Valuemax: 'valuemax',
  Valuetext: 'valuetext',
  Checked: 'checked',
  Expanded: 'expanded',
  Modal: 'modal',
  Pressed: 'pressed',
  Selected: 'selected',
  Activedescendant: 'activedescendant',
  Controls: 'controls',
  Describedby: 'describedby',
  Details: 'details',
  Errormessage: 'errormessage',
  Flowto: 'flowto',
  Labelledby: 'labelledby',
  Owns: 'owns',
};

/** @typedef {!{nodeId:(Protocol.Accessibility.AXNodeId), ignored:(boolean), ignoredReasons:(!Array<Protocol.Accessibility.AXProperty>|undefined), role:(Protocol.Accessibility.AXValue|undefined), name:(Protocol.Accessibility.AXValue|undefined), description:(Protocol.Accessibility.AXValue|undefined), value:(Protocol.Accessibility.AXValue|undefined), properties:(!Array<Protocol.Accessibility.AXProperty>|undefined), childIds:(!Array<Protocol.Accessibility.AXNodeId>|undefined), backendDOMNodeId:(Protocol.DOM.BackendNodeId|undefined)}} */
Protocol.Accessibility.AXNode;
/** @interface */
Protocol.AccessibilityDispatcher = function () {};
Protocol.Animation = {};

/**
 * @constructor
 */
Protocol.AnimationAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.AnimationAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.AnimationAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.AnimationAgent.DisableResponse;
/**
 * @param {!Protocol.AnimationAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.AnimationAgent.DisableResponse>} */
Protocol.AnimationAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.AnimationAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.AnimationAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.AnimationAgent.EnableResponse;
/**
 * @param {!Protocol.AnimationAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.AnimationAgent.EnableResponse>} */
Protocol.AnimationAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {string} id
 * @return {!Promise<?number>}
 */
Protocol.AnimationAgent.prototype.getCurrentTime = function (id) {};
/** @typedef {!{id: string}} */
Protocol.AnimationAgent.GetCurrentTimeRequest;
/** @typedef {!{currentTime: number}} */
Protocol.AnimationAgent.GetCurrentTimeResponse;
/**
 * @param {!Protocol.AnimationAgent.GetCurrentTimeRequest} obj
 * @return {!Promise<!Protocol.AnimationAgent.GetCurrentTimeResponse>} */
Protocol.AnimationAgent.prototype.invoke_getCurrentTime = function (obj) {};

/**
 * @return {!Promise<?number>}
 */
Protocol.AnimationAgent.prototype.getPlaybackRate = function () {};
/** @typedef {Object|undefined} */
Protocol.AnimationAgent.GetPlaybackRateRequest;
/** @typedef {!{playbackRate: number}} */
Protocol.AnimationAgent.GetPlaybackRateResponse;
/**
 * @param {!Protocol.AnimationAgent.GetPlaybackRateRequest} obj
 * @return {!Promise<!Protocol.AnimationAgent.GetPlaybackRateResponse>} */
Protocol.AnimationAgent.prototype.invoke_getPlaybackRate = function (obj) {};

/**
 * @param {!Array<string>} animations
 * @return {!Promise<undefined>}
 */
Protocol.AnimationAgent.prototype.releaseAnimations = function (animations) {};
/** @typedef {!{animations: !Array<string>}} */
Protocol.AnimationAgent.ReleaseAnimationsRequest;
/** @typedef {Object|undefined} */
Protocol.AnimationAgent.ReleaseAnimationsResponse;
/**
 * @param {!Protocol.AnimationAgent.ReleaseAnimationsRequest} obj
 * @return {!Promise<!Protocol.AnimationAgent.ReleaseAnimationsResponse>} */
Protocol.AnimationAgent.prototype.invoke_releaseAnimations = function (obj) {};

/**
 * @param {string} animationId
 * @return {!Promise<?Protocol.Runtime.RemoteObject>}
 */
Protocol.AnimationAgent.prototype.resolveAnimation = function (animationId) {};
/** @typedef {!{animationId: string}} */
Protocol.AnimationAgent.ResolveAnimationRequest;
/** @typedef {!{remoteObject: Protocol.Runtime.RemoteObject}} */
Protocol.AnimationAgent.ResolveAnimationResponse;
/**
 * @param {!Protocol.AnimationAgent.ResolveAnimationRequest} obj
 * @return {!Promise<!Protocol.AnimationAgent.ResolveAnimationResponse>} */
Protocol.AnimationAgent.prototype.invoke_resolveAnimation = function (obj) {};

/**
 * @param {!Array<string>} animations
 * @param {number} currentTime
 * @return {!Promise<undefined>}
 */
Protocol.AnimationAgent.prototype.seekAnimations = function (animations, currentTime) {};
/** @typedef {!{currentTime: number, animations: !Array<string>}} */
Protocol.AnimationAgent.SeekAnimationsRequest;
/** @typedef {Object|undefined} */
Protocol.AnimationAgent.SeekAnimationsResponse;
/**
 * @param {!Protocol.AnimationAgent.SeekAnimationsRequest} obj
 * @return {!Promise<!Protocol.AnimationAgent.SeekAnimationsResponse>} */
Protocol.AnimationAgent.prototype.invoke_seekAnimations = function (obj) {};

/**
 * @param {!Array<string>} animations
 * @param {boolean} paused
 * @return {!Promise<undefined>}
 */
Protocol.AnimationAgent.prototype.setPaused = function (animations, paused) {};
/** @typedef {!{paused: boolean, animations: !Array<string>}} */
Protocol.AnimationAgent.SetPausedRequest;
/** @typedef {Object|undefined} */
Protocol.AnimationAgent.SetPausedResponse;
/**
 * @param {!Protocol.AnimationAgent.SetPausedRequest} obj
 * @return {!Promise<!Protocol.AnimationAgent.SetPausedResponse>} */
Protocol.AnimationAgent.prototype.invoke_setPaused = function (obj) {};

/**
 * @param {number} playbackRate
 * @return {!Promise<undefined>}
 */
Protocol.AnimationAgent.prototype.setPlaybackRate = function (playbackRate) {};
/** @typedef {!{playbackRate: number}} */
Protocol.AnimationAgent.SetPlaybackRateRequest;
/** @typedef {Object|undefined} */
Protocol.AnimationAgent.SetPlaybackRateResponse;
/**
 * @param {!Protocol.AnimationAgent.SetPlaybackRateRequest} obj
 * @return {!Promise<!Protocol.AnimationAgent.SetPlaybackRateResponse>} */
Protocol.AnimationAgent.prototype.invoke_setPlaybackRate = function (obj) {};

/**
 * @param {string} animationId
 * @param {number} duration
 * @param {number} delay
 * @return {!Promise<undefined>}
 */
Protocol.AnimationAgent.prototype.setTiming = function (animationId, duration, delay) {};
/** @typedef {!{duration: number, delay: number, animationId: string}} */
Protocol.AnimationAgent.SetTimingRequest;
/** @typedef {Object|undefined} */
Protocol.AnimationAgent.SetTimingResponse;
/**
 * @param {!Protocol.AnimationAgent.SetTimingRequest} obj
 * @return {!Promise<!Protocol.AnimationAgent.SetTimingResponse>} */
Protocol.AnimationAgent.prototype.invoke_setTiming = function (obj) {};

/** @enum {string} */
Protocol.Animation.AnimationType = {
  CSSTransition: 'CSSTransition',
  CSSAnimation: 'CSSAnimation',
  WebAnimation: 'WebAnimation',
};

/** @typedef {!{id:(string), name:(string), pausedState:(boolean), playState:(string), playbackRate:(number), startTime:(number), currentTime:(number), type:(Protocol.Animation.AnimationType), source:(Protocol.Animation.AnimationEffect|undefined), cssId:(string|undefined)}} */
Protocol.Animation.Animation;

/** @typedef {!{delay:(number), endDelay:(number), iterationStart:(number), iterations:(number), duration:(number), direction:(string), fill:(string), backendNodeId:(Protocol.DOM.BackendNodeId|undefined), keyframesRule:(Protocol.Animation.KeyframesRule|undefined), easing:(string)}} */
Protocol.Animation.AnimationEffect;

/** @typedef {!{name:(string|undefined), keyframes:(!Array<Protocol.Animation.KeyframeStyle>)}} */
Protocol.Animation.KeyframesRule;

/** @typedef {!{offset:(string), easing:(string)}} */
Protocol.Animation.KeyframeStyle;
/** @interface */
Protocol.AnimationDispatcher = function () {};
/**
 * @param {string} id
 */
Protocol.AnimationDispatcher.prototype.animationCanceled = function (id) {};
/**
 * @param {string} id
 */
Protocol.AnimationDispatcher.prototype.animationCreated = function (id) {};
/**
 * @param {Protocol.Animation.Animation} animation
 */
Protocol.AnimationDispatcher.prototype.animationStarted = function (animation) {};
Protocol.ApplicationCache = {};

/**
 * @constructor
 */
Protocol.ApplicationCacheAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ApplicationCacheAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.ApplicationCacheAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.ApplicationCacheAgent.EnableResponse;
/**
 * @param {!Protocol.ApplicationCacheAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.ApplicationCacheAgent.EnableResponse>} */
Protocol.ApplicationCacheAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {Protocol.Page.FrameId} frameId
 * @return {!Promise<?Protocol.ApplicationCache.ApplicationCache>}
 */
Protocol.ApplicationCacheAgent.prototype.getApplicationCacheForFrame = function (frameId) {};
/** @typedef {!{frameId: Protocol.Page.FrameId}} */
Protocol.ApplicationCacheAgent.GetApplicationCacheForFrameRequest;
/** @typedef {!{applicationCache: Protocol.ApplicationCache.ApplicationCache}} */
Protocol.ApplicationCacheAgent.GetApplicationCacheForFrameResponse;
/**
 * @param {!Protocol.ApplicationCacheAgent.GetApplicationCacheForFrameRequest} obj
 * @return {!Promise<!Protocol.ApplicationCacheAgent.GetApplicationCacheForFrameResponse>} */
Protocol.ApplicationCacheAgent.prototype.invoke_getApplicationCacheForFrame = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.ApplicationCache.FrameWithManifest>>}
 */
Protocol.ApplicationCacheAgent.prototype.getFramesWithManifests = function () {};
/** @typedef {Object|undefined} */
Protocol.ApplicationCacheAgent.GetFramesWithManifestsRequest;
/** @typedef {!{frameIds: !Array<Protocol.ApplicationCache.FrameWithManifest>}} */
Protocol.ApplicationCacheAgent.GetFramesWithManifestsResponse;
/**
 * @param {!Protocol.ApplicationCacheAgent.GetFramesWithManifestsRequest} obj
 * @return {!Promise<!Protocol.ApplicationCacheAgent.GetFramesWithManifestsResponse>} */
Protocol.ApplicationCacheAgent.prototype.invoke_getFramesWithManifests = function (obj) {};

/**
 * @param {Protocol.Page.FrameId} frameId
 * @return {!Promise<?string>}
 */
Protocol.ApplicationCacheAgent.prototype.getManifestForFrame = function (frameId) {};
/** @typedef {!{frameId: Protocol.Page.FrameId}} */
Protocol.ApplicationCacheAgent.GetManifestForFrameRequest;
/** @typedef {!{manifestURL: string}} */
Protocol.ApplicationCacheAgent.GetManifestForFrameResponse;
/**
 * @param {!Protocol.ApplicationCacheAgent.GetManifestForFrameRequest} obj
 * @return {!Promise<!Protocol.ApplicationCacheAgent.GetManifestForFrameResponse>} */
Protocol.ApplicationCacheAgent.prototype.invoke_getManifestForFrame = function (obj) {};

/** @typedef {!{url:(string), size:(number), type:(string)}} */
Protocol.ApplicationCache.ApplicationCacheResource;

/** @typedef {!{manifestURL:(string), size:(number), creationTime:(number), updateTime:(number), resources:(!Array<Protocol.ApplicationCache.ApplicationCacheResource>)}} */
Protocol.ApplicationCache.ApplicationCache;

/** @typedef {!{frameId:(Protocol.Page.FrameId), manifestURL:(string), status:(number)}} */
Protocol.ApplicationCache.FrameWithManifest;
/** @interface */
Protocol.ApplicationCacheDispatcher = function () {};
/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {string} manifestURL
 * @param {number} status
 */
Protocol.ApplicationCacheDispatcher.prototype.applicationCacheStatusUpdated = function (
  frameId,
  manifestURL,
  status,
) {};
/**
 * @param {boolean} isNowOnline
 */
Protocol.ApplicationCacheDispatcher.prototype.networkStateUpdated = function (isNowOnline) {};
Protocol.Audits = {};

/**
 * @constructor
 */
Protocol.AuditsAgent = function () {};

/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {string} encoding
 * @param {number=} opt_quality
 * @param {boolean=} opt_sizeOnly
 * @return {!Promise<?string>}
 */
Protocol.AuditsAgent.prototype.getEncodedResponse = function (requestId, encoding, opt_quality, opt_sizeOnly) {};
/** @typedef {!{sizeOnly: (boolean|undefined), quality: (number|undefined), requestId: Protocol.Network.RequestId, encoding: string}} */
Protocol.AuditsAgent.GetEncodedResponseRequest;
/** @typedef {!{body: string, encodedSize: number, originalSize: number}} */
Protocol.AuditsAgent.GetEncodedResponseResponse;
/**
 * @param {!Protocol.AuditsAgent.GetEncodedResponseRequest} obj
 * @return {!Promise<!Protocol.AuditsAgent.GetEncodedResponseResponse>} */
Protocol.AuditsAgent.prototype.invoke_getEncodedResponse = function (obj) {};
/** @interface */
Protocol.AuditsDispatcher = function () {};
Protocol.BackgroundService = {};

/**
 * @constructor
 */
Protocol.BackgroundServiceAgent = function () {};

/**
 * @param {Protocol.BackgroundService.ServiceName} service
 * @return {!Promise<undefined>}
 */
Protocol.BackgroundServiceAgent.prototype.startObserving = function (service) {};
/** @typedef {!{service: Protocol.BackgroundService.ServiceName}} */
Protocol.BackgroundServiceAgent.StartObservingRequest;
/** @typedef {Object|undefined} */
Protocol.BackgroundServiceAgent.StartObservingResponse;
/**
 * @param {!Protocol.BackgroundServiceAgent.StartObservingRequest} obj
 * @return {!Promise<!Protocol.BackgroundServiceAgent.StartObservingResponse>} */
Protocol.BackgroundServiceAgent.prototype.invoke_startObserving = function (obj) {};

/**
 * @param {Protocol.BackgroundService.ServiceName} service
 * @return {!Promise<undefined>}
 */
Protocol.BackgroundServiceAgent.prototype.stopObserving = function (service) {};
/** @typedef {!{service: Protocol.BackgroundService.ServiceName}} */
Protocol.BackgroundServiceAgent.StopObservingRequest;
/** @typedef {Object|undefined} */
Protocol.BackgroundServiceAgent.StopObservingResponse;
/**
 * @param {!Protocol.BackgroundServiceAgent.StopObservingRequest} obj
 * @return {!Promise<!Protocol.BackgroundServiceAgent.StopObservingResponse>} */
Protocol.BackgroundServiceAgent.prototype.invoke_stopObserving = function (obj) {};

/**
 * @param {boolean} shouldRecord
 * @param {Protocol.BackgroundService.ServiceName} service
 * @return {!Promise<undefined>}
 */
Protocol.BackgroundServiceAgent.prototype.setRecording = function (shouldRecord, service) {};
/** @typedef {!{shouldRecord: boolean, service: Protocol.BackgroundService.ServiceName}} */
Protocol.BackgroundServiceAgent.SetRecordingRequest;
/** @typedef {Object|undefined} */
Protocol.BackgroundServiceAgent.SetRecordingResponse;
/**
 * @param {!Protocol.BackgroundServiceAgent.SetRecordingRequest} obj
 * @return {!Promise<!Protocol.BackgroundServiceAgent.SetRecordingResponse>} */
Protocol.BackgroundServiceAgent.prototype.invoke_setRecording = function (obj) {};

/**
 * @param {Protocol.BackgroundService.ServiceName} service
 * @return {!Promise<undefined>}
 */
Protocol.BackgroundServiceAgent.prototype.clearEvents = function (service) {};
/** @typedef {!{service: Protocol.BackgroundService.ServiceName}} */
Protocol.BackgroundServiceAgent.ClearEventsRequest;
/** @typedef {Object|undefined} */
Protocol.BackgroundServiceAgent.ClearEventsResponse;
/**
 * @param {!Protocol.BackgroundServiceAgent.ClearEventsRequest} obj
 * @return {!Promise<!Protocol.BackgroundServiceAgent.ClearEventsResponse>} */
Protocol.BackgroundServiceAgent.prototype.invoke_clearEvents = function (obj) {};

/** @enum {string} */
Protocol.BackgroundService.ServiceName = {
  BackgroundFetch: 'backgroundFetch',
  BackgroundSync: 'backgroundSync',
  PushMessaging: 'pushMessaging',
  Notifications: 'notifications',
  PaymentHandler: 'paymentHandler',
  PeriodicBackgroundSync: 'periodicBackgroundSync',
};

/** @typedef {!{key:(string), value:(string)}} */
Protocol.BackgroundService.EventMetadata;

/** @typedef {!{timestamp:(Protocol.Network.TimeSinceEpoch), origin:(string), serviceWorkerRegistrationId:(Protocol.ServiceWorker.RegistrationID), service:(Protocol.BackgroundService.ServiceName), eventName:(string), instanceId:(string), eventMetadata:(!Array<Protocol.BackgroundService.EventMetadata>)}} */
Protocol.BackgroundService.BackgroundServiceEvent;
/** @interface */
Protocol.BackgroundServiceDispatcher = function () {};
/**
 * @param {boolean} isRecording
 * @param {Protocol.BackgroundService.ServiceName} service
 */
Protocol.BackgroundServiceDispatcher.prototype.recordingStateChanged = function (isRecording, service) {};
/**
 * @param {Protocol.BackgroundService.BackgroundServiceEvent} backgroundServiceEvent
 */
Protocol.BackgroundServiceDispatcher.prototype.backgroundServiceEventReceived = function (backgroundServiceEvent) {};
Protocol.Browser = {};

/**
 * @constructor
 */
Protocol.BrowserAgent = function () {};

/**
 * @param {string} origin
 * @param {Protocol.Browser.PermissionDescriptor} permission
 * @param {Protocol.Browser.PermissionSetting} setting
 * @param {Protocol.Target.TargetID=} opt_browserContextId
 * @return {!Promise<undefined>}
 */
Protocol.BrowserAgent.prototype.setPermission = function (origin, permission, setting, opt_browserContextId) {};
/** @typedef {!{origin: string, browserContextId: (Protocol.Target.TargetID|undefined), setting: Protocol.Browser.PermissionSetting, permission: Protocol.Browser.PermissionDescriptor}} */
Protocol.BrowserAgent.SetPermissionRequest;
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.SetPermissionResponse;
/**
 * @param {!Protocol.BrowserAgent.SetPermissionRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.SetPermissionResponse>} */
Protocol.BrowserAgent.prototype.invoke_setPermission = function (obj) {};

/**
 * @param {string} origin
 * @param {!Array<Protocol.Browser.PermissionType>} permissions
 * @param {Protocol.Target.BrowserContextID=} opt_browserContextId
 * @return {!Promise<undefined>}
 */
Protocol.BrowserAgent.prototype.grantPermissions = function (origin, permissions, opt_browserContextId) {};
/** @typedef {!{origin: string, browserContextId: (Protocol.Target.BrowserContextID|undefined), permissions: !Array<Protocol.Browser.PermissionType>}} */
Protocol.BrowserAgent.GrantPermissionsRequest;
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.GrantPermissionsResponse;
/**
 * @param {!Protocol.BrowserAgent.GrantPermissionsRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.GrantPermissionsResponse>} */
Protocol.BrowserAgent.prototype.invoke_grantPermissions = function (obj) {};

/**
 * @param {Protocol.Target.BrowserContextID=} opt_browserContextId
 * @return {!Promise<undefined>}
 */
Protocol.BrowserAgent.prototype.resetPermissions = function (opt_browserContextId) {};
/** @typedef {!{browserContextId: (Protocol.Target.BrowserContextID|undefined)}} */
Protocol.BrowserAgent.ResetPermissionsRequest;
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.ResetPermissionsResponse;
/**
 * @param {!Protocol.BrowserAgent.ResetPermissionsRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.ResetPermissionsResponse>} */
Protocol.BrowserAgent.prototype.invoke_resetPermissions = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.BrowserAgent.prototype.close = function () {};
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.CloseRequest;
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.CloseResponse;
/**
 * @param {!Protocol.BrowserAgent.CloseRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.CloseResponse>} */
Protocol.BrowserAgent.prototype.invoke_close = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.BrowserAgent.prototype.crash = function () {};
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.CrashRequest;
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.CrashResponse;
/**
 * @param {!Protocol.BrowserAgent.CrashRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.CrashResponse>} */
Protocol.BrowserAgent.prototype.invoke_crash = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.BrowserAgent.prototype.crashGpuProcess = function () {};
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.CrashGpuProcessRequest;
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.CrashGpuProcessResponse;
/**
 * @param {!Protocol.BrowserAgent.CrashGpuProcessRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.CrashGpuProcessResponse>} */
Protocol.BrowserAgent.prototype.invoke_crashGpuProcess = function (obj) {};

/**
 * @return {!Promise<?string>}
 */
Protocol.BrowserAgent.prototype.getVersion = function () {};
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.GetVersionRequest;
/** @typedef {!{userAgent: string, product: string, revision: string, jsVersion: string, protocolVersion: string}} */
Protocol.BrowserAgent.GetVersionResponse;
/**
 * @param {!Protocol.BrowserAgent.GetVersionRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.GetVersionResponse>} */
Protocol.BrowserAgent.prototype.invoke_getVersion = function (obj) {};

/**
 * @return {!Promise<?Array<string>>}
 */
Protocol.BrowserAgent.prototype.getBrowserCommandLine = function () {};
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.GetBrowserCommandLineRequest;
/** @typedef {!{arguments: !Array<string>}} */
Protocol.BrowserAgent.GetBrowserCommandLineResponse;
/**
 * @param {!Protocol.BrowserAgent.GetBrowserCommandLineRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.GetBrowserCommandLineResponse>} */
Protocol.BrowserAgent.prototype.invoke_getBrowserCommandLine = function (obj) {};

/**
 * @param {string=} opt_query
 * @param {boolean=} opt_delta
 * @return {!Promise<?Array<Protocol.Browser.Histogram>>}
 */
Protocol.BrowserAgent.prototype.getHistograms = function (opt_query, opt_delta) {};
/** @typedef {!{query: (string|undefined), delta: (boolean|undefined)}} */
Protocol.BrowserAgent.GetHistogramsRequest;
/** @typedef {!{histograms: !Array<Protocol.Browser.Histogram>}} */
Protocol.BrowserAgent.GetHistogramsResponse;
/**
 * @param {!Protocol.BrowserAgent.GetHistogramsRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.GetHistogramsResponse>} */
Protocol.BrowserAgent.prototype.invoke_getHistograms = function (obj) {};

/**
 * @param {string} name
 * @param {boolean=} opt_delta
 * @return {!Promise<?Protocol.Browser.Histogram>}
 */
Protocol.BrowserAgent.prototype.getHistogram = function (name, opt_delta) {};
/** @typedef {!{name: string, delta: (boolean|undefined)}} */
Protocol.BrowserAgent.GetHistogramRequest;
/** @typedef {!{histogram: Protocol.Browser.Histogram}} */
Protocol.BrowserAgent.GetHistogramResponse;
/**
 * @param {!Protocol.BrowserAgent.GetHistogramRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.GetHistogramResponse>} */
Protocol.BrowserAgent.prototype.invoke_getHistogram = function (obj) {};

/**
 * @param {Protocol.Browser.WindowID} windowId
 * @return {!Promise<?Protocol.Browser.Bounds>}
 */
Protocol.BrowserAgent.prototype.getWindowBounds = function (windowId) {};
/** @typedef {!{windowId: Protocol.Browser.WindowID}} */
Protocol.BrowserAgent.GetWindowBoundsRequest;
/** @typedef {!{bounds: Protocol.Browser.Bounds}} */
Protocol.BrowserAgent.GetWindowBoundsResponse;
/**
 * @param {!Protocol.BrowserAgent.GetWindowBoundsRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.GetWindowBoundsResponse>} */
Protocol.BrowserAgent.prototype.invoke_getWindowBounds = function (obj) {};

/**
 * @param {Protocol.Target.TargetID=} opt_targetId
 * @return {!Promise<?Protocol.Browser.WindowID>}
 */
Protocol.BrowserAgent.prototype.getWindowForTarget = function (opt_targetId) {};
/** @typedef {!{targetId: (Protocol.Target.TargetID|undefined)}} */
Protocol.BrowserAgent.GetWindowForTargetRequest;
/** @typedef {!{windowId: Protocol.Browser.WindowID, bounds: Protocol.Browser.Bounds}} */
Protocol.BrowserAgent.GetWindowForTargetResponse;
/**
 * @param {!Protocol.BrowserAgent.GetWindowForTargetRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.GetWindowForTargetResponse>} */
Protocol.BrowserAgent.prototype.invoke_getWindowForTarget = function (obj) {};

/**
 * @param {Protocol.Browser.WindowID} windowId
 * @param {Protocol.Browser.Bounds} bounds
 * @return {!Promise<undefined>}
 */
Protocol.BrowserAgent.prototype.setWindowBounds = function (windowId, bounds) {};
/** @typedef {!{windowId: Protocol.Browser.WindowID, bounds: Protocol.Browser.Bounds}} */
Protocol.BrowserAgent.SetWindowBoundsRequest;
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.SetWindowBoundsResponse;
/**
 * @param {!Protocol.BrowserAgent.SetWindowBoundsRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.SetWindowBoundsResponse>} */
Protocol.BrowserAgent.prototype.invoke_setWindowBounds = function (obj) {};

/**
 * @param {string=} opt_badgeLabel
 * @param {string=} opt_image
 * @return {!Promise<undefined>}
 */
Protocol.BrowserAgent.prototype.setDockTile = function (opt_badgeLabel, opt_image) {};
/** @typedef {!{image: (string|undefined), badgeLabel: (string|undefined)}} */
Protocol.BrowserAgent.SetDockTileRequest;
/** @typedef {Object|undefined} */
Protocol.BrowserAgent.SetDockTileResponse;
/**
 * @param {!Protocol.BrowserAgent.SetDockTileRequest} obj
 * @return {!Promise<!Protocol.BrowserAgent.SetDockTileResponse>} */
Protocol.BrowserAgent.prototype.invoke_setDockTile = function (obj) {};

/** @typedef {number} */
Protocol.Browser.WindowID;

/** @enum {string} */
Protocol.Browser.WindowState = {
  Normal: 'normal',
  Minimized: 'minimized',
  Maximized: 'maximized',
  Fullscreen: 'fullscreen',
};

/** @typedef {!{left:(number|undefined), top:(number|undefined), width:(number|undefined), height:(number|undefined), windowState:(Protocol.Browser.WindowState|undefined)}} */
Protocol.Browser.Bounds;

/** @enum {string} */
Protocol.Browser.PermissionType = {
  AccessibilityEvents: 'accessibilityEvents',
  AudioCapture: 'audioCapture',
  BackgroundSync: 'backgroundSync',
  BackgroundFetch: 'backgroundFetch',
  ClipboardRead: 'clipboardRead',
  ClipboardWrite: 'clipboardWrite',
  DurableStorage: 'durableStorage',
  Flash: 'flash',
  Geolocation: 'geolocation',
  Midi: 'midi',
  MidiSysex: 'midiSysex',
  Notifications: 'notifications',
  PaymentHandler: 'paymentHandler',
  PeriodicBackgroundSync: 'periodicBackgroundSync',
  ProtectedMediaIdentifier: 'protectedMediaIdentifier',
  Sensors: 'sensors',
  VideoCapture: 'videoCapture',
  IdleDetection: 'idleDetection',
  WakeLockScreen: 'wakeLockScreen',
  WakeLockSystem: 'wakeLockSystem',
};

/** @enum {string} */
Protocol.Browser.PermissionSetting = {
  Granted: 'granted',
  Denied: 'denied',
  Prompt: 'prompt',
};

/** @typedef {!{name:(string), sysex:(boolean|undefined), userVisibleOnly:(boolean|undefined), type:(string|undefined)}} */
Protocol.Browser.PermissionDescriptor;

/** @typedef {!{low:(number), high:(number), count:(number)}} */
Protocol.Browser.Bucket;

/** @typedef {!{name:(string), sum:(number), count:(number), buckets:(!Array<Protocol.Browser.Bucket>)}} */
Protocol.Browser.Histogram;
/** @interface */
Protocol.BrowserDispatcher = function () {};
Protocol.CSS = {};

/**
 * @constructor
 */
Protocol.CSSAgent = function () {};

/**
 * @param {Protocol.CSS.StyleSheetId} styleSheetId
 * @param {string} ruleText
 * @param {Protocol.CSS.SourceRange} location
 * @return {!Promise<?Protocol.CSS.CSSRule>}
 */
Protocol.CSSAgent.prototype.addRule = function (styleSheetId, ruleText, location) {};
/** @typedef {!{styleSheetId: Protocol.CSS.StyleSheetId, location: Protocol.CSS.SourceRange, ruleText: string}} */
Protocol.CSSAgent.AddRuleRequest;
/** @typedef {!{rule: Protocol.CSS.CSSRule}} */
Protocol.CSSAgent.AddRuleResponse;
/**
 * @param {!Protocol.CSSAgent.AddRuleRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.AddRuleResponse>} */
Protocol.CSSAgent.prototype.invoke_addRule = function (obj) {};

/**
 * @param {Protocol.CSS.StyleSheetId} styleSheetId
 * @return {!Promise<?Array<string>>}
 */
Protocol.CSSAgent.prototype.collectClassNames = function (styleSheetId) {};
/** @typedef {!{styleSheetId: Protocol.CSS.StyleSheetId}} */
Protocol.CSSAgent.CollectClassNamesRequest;
/** @typedef {!{classNames: !Array<string>}} */
Protocol.CSSAgent.CollectClassNamesResponse;
/**
 * @param {!Protocol.CSSAgent.CollectClassNamesRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.CollectClassNamesResponse>} */
Protocol.CSSAgent.prototype.invoke_collectClassNames = function (obj) {};

/**
 * @param {Protocol.Page.FrameId} frameId
 * @return {!Promise<?Protocol.CSS.StyleSheetId>}
 */
Protocol.CSSAgent.prototype.createStyleSheet = function (frameId) {};
/** @typedef {!{frameId: Protocol.Page.FrameId}} */
Protocol.CSSAgent.CreateStyleSheetRequest;
/** @typedef {!{styleSheetId: Protocol.CSS.StyleSheetId}} */
Protocol.CSSAgent.CreateStyleSheetResponse;
/**
 * @param {!Protocol.CSSAgent.CreateStyleSheetRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.CreateStyleSheetResponse>} */
Protocol.CSSAgent.prototype.invoke_createStyleSheet = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.CSSAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.CSSAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.CSSAgent.DisableResponse;
/**
 * @param {!Protocol.CSSAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.DisableResponse>} */
Protocol.CSSAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.CSSAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.CSSAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.CSSAgent.EnableResponse;
/**
 * @param {!Protocol.CSSAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.EnableResponse>} */
Protocol.CSSAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {!Array<string>} forcedPseudoClasses
 * @return {!Promise<undefined>}
 */
Protocol.CSSAgent.prototype.forcePseudoState = function (nodeId, forcedPseudoClasses) {};
/** @typedef {!{forcedPseudoClasses: !Array<string>, nodeId: Protocol.DOM.NodeId}} */
Protocol.CSSAgent.ForcePseudoStateRequest;
/** @typedef {Object|undefined} */
Protocol.CSSAgent.ForcePseudoStateResponse;
/**
 * @param {!Protocol.CSSAgent.ForcePseudoStateRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.ForcePseudoStateResponse>} */
Protocol.CSSAgent.prototype.invoke_forcePseudoState = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @return {!Promise<?Array<string>>}
 */
Protocol.CSSAgent.prototype.getBackgroundColors = function (nodeId) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.CSSAgent.GetBackgroundColorsRequest;
/** @typedef {!{backgroundColors: !Array<string>, computedFontWeight: string, computedFontSize: string}} */
Protocol.CSSAgent.GetBackgroundColorsResponse;
/**
 * @param {!Protocol.CSSAgent.GetBackgroundColorsRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.GetBackgroundColorsResponse>} */
Protocol.CSSAgent.prototype.invoke_getBackgroundColors = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @return {!Promise<?Array<Protocol.CSS.CSSComputedStyleProperty>>}
 */
Protocol.CSSAgent.prototype.getComputedStyleForNode = function (nodeId) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.CSSAgent.GetComputedStyleForNodeRequest;
/** @typedef {!{computedStyle: !Array<Protocol.CSS.CSSComputedStyleProperty>}} */
Protocol.CSSAgent.GetComputedStyleForNodeResponse;
/**
 * @param {!Protocol.CSSAgent.GetComputedStyleForNodeRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.GetComputedStyleForNodeResponse>} */
Protocol.CSSAgent.prototype.invoke_getComputedStyleForNode = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @return {!Promise<?Protocol.CSS.CSSStyle>}
 */
Protocol.CSSAgent.prototype.getInlineStylesForNode = function (nodeId) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.CSSAgent.GetInlineStylesForNodeRequest;
/** @typedef {!{inlineStyle: Protocol.CSS.CSSStyle, attributesStyle: Protocol.CSS.CSSStyle}} */
Protocol.CSSAgent.GetInlineStylesForNodeResponse;
/**
 * @param {!Protocol.CSSAgent.GetInlineStylesForNodeRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.GetInlineStylesForNodeResponse>} */
Protocol.CSSAgent.prototype.invoke_getInlineStylesForNode = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @return {!Promise<?Protocol.CSS.CSSStyle>}
 */
Protocol.CSSAgent.prototype.getMatchedStylesForNode = function (nodeId) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.CSSAgent.GetMatchedStylesForNodeRequest;
/** @typedef {!{inlineStyle: Protocol.CSS.CSSStyle, attributesStyle: Protocol.CSS.CSSStyle, cssKeyframesRules: !Array<Protocol.CSS.CSSKeyframesRule>, matchedCSSRules: !Array<Protocol.CSS.RuleMatch>, inherited: !Array<Protocol.CSS.InheritedStyleEntry>, pseudoElements: !Array<Protocol.CSS.PseudoElementMatches>}} */
Protocol.CSSAgent.GetMatchedStylesForNodeResponse;
/**
 * @param {!Protocol.CSSAgent.GetMatchedStylesForNodeRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.GetMatchedStylesForNodeResponse>} */
Protocol.CSSAgent.prototype.invoke_getMatchedStylesForNode = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.CSS.CSSMedia>>}
 */
Protocol.CSSAgent.prototype.getMediaQueries = function () {};
/** @typedef {Object|undefined} */
Protocol.CSSAgent.GetMediaQueriesRequest;
/** @typedef {!{medias: !Array<Protocol.CSS.CSSMedia>}} */
Protocol.CSSAgent.GetMediaQueriesResponse;
/**
 * @param {!Protocol.CSSAgent.GetMediaQueriesRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.GetMediaQueriesResponse>} */
Protocol.CSSAgent.prototype.invoke_getMediaQueries = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @return {!Promise<?Array<Protocol.CSS.PlatformFontUsage>>}
 */
Protocol.CSSAgent.prototype.getPlatformFontsForNode = function (nodeId) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.CSSAgent.GetPlatformFontsForNodeRequest;
/** @typedef {!{fonts: !Array<Protocol.CSS.PlatformFontUsage>}} */
Protocol.CSSAgent.GetPlatformFontsForNodeResponse;
/**
 * @param {!Protocol.CSSAgent.GetPlatformFontsForNodeRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.GetPlatformFontsForNodeResponse>} */
Protocol.CSSAgent.prototype.invoke_getPlatformFontsForNode = function (obj) {};

/**
 * @param {Protocol.CSS.StyleSheetId} styleSheetId
 * @return {!Promise<?string>}
 */
Protocol.CSSAgent.prototype.getStyleSheetText = function (styleSheetId) {};
/** @typedef {!{styleSheetId: Protocol.CSS.StyleSheetId}} */
Protocol.CSSAgent.GetStyleSheetTextRequest;
/** @typedef {!{text: string}} */
Protocol.CSSAgent.GetStyleSheetTextResponse;
/**
 * @param {!Protocol.CSSAgent.GetStyleSheetTextRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.GetStyleSheetTextResponse>} */
Protocol.CSSAgent.prototype.invoke_getStyleSheetText = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} propertyName
 * @param {string} value
 * @return {!Promise<undefined>}
 */
Protocol.CSSAgent.prototype.setEffectivePropertyValueForNode = function (nodeId, propertyName, value) {};
/** @typedef {!{propertyName: string, nodeId: Protocol.DOM.NodeId, value: string}} */
Protocol.CSSAgent.SetEffectivePropertyValueForNodeRequest;
/** @typedef {Object|undefined} */
Protocol.CSSAgent.SetEffectivePropertyValueForNodeResponse;
/**
 * @param {!Protocol.CSSAgent.SetEffectivePropertyValueForNodeRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.SetEffectivePropertyValueForNodeResponse>} */
Protocol.CSSAgent.prototype.invoke_setEffectivePropertyValueForNode = function (obj) {};

/**
 * @param {Protocol.CSS.StyleSheetId} styleSheetId
 * @param {Protocol.CSS.SourceRange} range
 * @param {string} keyText
 * @return {!Promise<?Protocol.CSS.Value>}
 */
Protocol.CSSAgent.prototype.setKeyframeKey = function (styleSheetId, range, keyText) {};
/** @typedef {!{range: Protocol.CSS.SourceRange, styleSheetId: Protocol.CSS.StyleSheetId, keyText: string}} */
Protocol.CSSAgent.SetKeyframeKeyRequest;
/** @typedef {!{keyText: Protocol.CSS.Value}} */
Protocol.CSSAgent.SetKeyframeKeyResponse;
/**
 * @param {!Protocol.CSSAgent.SetKeyframeKeyRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.SetKeyframeKeyResponse>} */
Protocol.CSSAgent.prototype.invoke_setKeyframeKey = function (obj) {};

/**
 * @param {Protocol.CSS.StyleSheetId} styleSheetId
 * @param {Protocol.CSS.SourceRange} range
 * @param {string} text
 * @return {!Promise<?Protocol.CSS.CSSMedia>}
 */
Protocol.CSSAgent.prototype.setMediaText = function (styleSheetId, range, text) {};
/** @typedef {!{text: string, range: Protocol.CSS.SourceRange, styleSheetId: Protocol.CSS.StyleSheetId}} */
Protocol.CSSAgent.SetMediaTextRequest;
/** @typedef {!{media: Protocol.CSS.CSSMedia}} */
Protocol.CSSAgent.SetMediaTextResponse;
/**
 * @param {!Protocol.CSSAgent.SetMediaTextRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.SetMediaTextResponse>} */
Protocol.CSSAgent.prototype.invoke_setMediaText = function (obj) {};

/**
 * @param {Protocol.CSS.StyleSheetId} styleSheetId
 * @param {Protocol.CSS.SourceRange} range
 * @param {string} selector
 * @return {!Promise<?Protocol.CSS.SelectorList>}
 */
Protocol.CSSAgent.prototype.setRuleSelector = function (styleSheetId, range, selector) {};
/** @typedef {!{range: Protocol.CSS.SourceRange, styleSheetId: Protocol.CSS.StyleSheetId, selector: string}} */
Protocol.CSSAgent.SetRuleSelectorRequest;
/** @typedef {!{selectorList: Protocol.CSS.SelectorList}} */
Protocol.CSSAgent.SetRuleSelectorResponse;
/**
 * @param {!Protocol.CSSAgent.SetRuleSelectorRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.SetRuleSelectorResponse>} */
Protocol.CSSAgent.prototype.invoke_setRuleSelector = function (obj) {};

/**
 * @param {Protocol.CSS.StyleSheetId} styleSheetId
 * @param {string} text
 * @return {!Promise<?string>}
 */
Protocol.CSSAgent.prototype.setStyleSheetText = function (styleSheetId, text) {};
/** @typedef {!{text: string, styleSheetId: Protocol.CSS.StyleSheetId}} */
Protocol.CSSAgent.SetStyleSheetTextRequest;
/** @typedef {!{sourceMapURL: string}} */
Protocol.CSSAgent.SetStyleSheetTextResponse;
/**
 * @param {!Protocol.CSSAgent.SetStyleSheetTextRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.SetStyleSheetTextResponse>} */
Protocol.CSSAgent.prototype.invoke_setStyleSheetText = function (obj) {};

/**
 * @param {!Array<Protocol.CSS.StyleDeclarationEdit>} edits
 * @return {!Promise<?Array<Protocol.CSS.CSSStyle>>}
 */
Protocol.CSSAgent.prototype.setStyleTexts = function (edits) {};
/** @typedef {!{edits: !Array<Protocol.CSS.StyleDeclarationEdit>}} */
Protocol.CSSAgent.SetStyleTextsRequest;
/** @typedef {!{styles: !Array<Protocol.CSS.CSSStyle>}} */
Protocol.CSSAgent.SetStyleTextsResponse;
/**
 * @param {!Protocol.CSSAgent.SetStyleTextsRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.SetStyleTextsResponse>} */
Protocol.CSSAgent.prototype.invoke_setStyleTexts = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.CSSAgent.prototype.startRuleUsageTracking = function () {};
/** @typedef {Object|undefined} */
Protocol.CSSAgent.StartRuleUsageTrackingRequest;
/** @typedef {Object|undefined} */
Protocol.CSSAgent.StartRuleUsageTrackingResponse;
/**
 * @param {!Protocol.CSSAgent.StartRuleUsageTrackingRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.StartRuleUsageTrackingResponse>} */
Protocol.CSSAgent.prototype.invoke_startRuleUsageTracking = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.CSS.RuleUsage>>}
 */
Protocol.CSSAgent.prototype.stopRuleUsageTracking = function () {};
/** @typedef {Object|undefined} */
Protocol.CSSAgent.StopRuleUsageTrackingRequest;
/** @typedef {!{ruleUsage: !Array<Protocol.CSS.RuleUsage>}} */
Protocol.CSSAgent.StopRuleUsageTrackingResponse;
/**
 * @param {!Protocol.CSSAgent.StopRuleUsageTrackingRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.StopRuleUsageTrackingResponse>} */
Protocol.CSSAgent.prototype.invoke_stopRuleUsageTracking = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.CSS.RuleUsage>>}
 */
Protocol.CSSAgent.prototype.takeCoverageDelta = function () {};
/** @typedef {Object|undefined} */
Protocol.CSSAgent.TakeCoverageDeltaRequest;
/** @typedef {!{coverage: !Array<Protocol.CSS.RuleUsage>}} */
Protocol.CSSAgent.TakeCoverageDeltaResponse;
/**
 * @param {!Protocol.CSSAgent.TakeCoverageDeltaRequest} obj
 * @return {!Promise<!Protocol.CSSAgent.TakeCoverageDeltaResponse>} */
Protocol.CSSAgent.prototype.invoke_takeCoverageDelta = function (obj) {};

/** @typedef {string} */
Protocol.CSS.StyleSheetId;

/** @enum {string} */
Protocol.CSS.StyleSheetOrigin = {
  Injected: 'injected',
  UserAgent: 'user-agent',
  Inspector: 'inspector',
  Regular: 'regular',
};

/** @typedef {!{pseudoType:(Protocol.DOM.PseudoType), matches:(!Array<Protocol.CSS.RuleMatch>)}} */
Protocol.CSS.PseudoElementMatches;

/** @typedef {!{inlineStyle:(Protocol.CSS.CSSStyle|undefined), matchedCSSRules:(!Array<Protocol.CSS.RuleMatch>)}} */
Protocol.CSS.InheritedStyleEntry;

/** @typedef {!{rule:(Protocol.CSS.CSSRule), matchingSelectors:(!Array<number>)}} */
Protocol.CSS.RuleMatch;

/** @typedef {!{text:(string), range:(Protocol.CSS.SourceRange|undefined)}} */
Protocol.CSS.Value;

/** @typedef {!{selectors:(!Array<Protocol.CSS.Value>), text:(string)}} */
Protocol.CSS.SelectorList;

/** @typedef {!{styleSheetId:(Protocol.CSS.StyleSheetId), frameId:(Protocol.Page.FrameId), sourceURL:(string), sourceMapURL:(string|undefined), origin:(Protocol.CSS.StyleSheetOrigin), title:(string), ownerNode:(Protocol.DOM.BackendNodeId|undefined), disabled:(boolean), hasSourceURL:(boolean|undefined), isInline:(boolean), startLine:(number), startColumn:(number), length:(number), endLine:(number), endColumn:(number)}} */
Protocol.CSS.CSSStyleSheetHeader;

/** @typedef {!{styleSheetId:(Protocol.CSS.StyleSheetId|undefined), selectorList:(Protocol.CSS.SelectorList), origin:(Protocol.CSS.StyleSheetOrigin), style:(Protocol.CSS.CSSStyle), media:(!Array<Protocol.CSS.CSSMedia>|undefined)}} */
Protocol.CSS.CSSRule;

/** @typedef {!{styleSheetId:(Protocol.CSS.StyleSheetId), startOffset:(number), endOffset:(number), used:(boolean)}} */
Protocol.CSS.RuleUsage;

/** @typedef {!{startLine:(number), startColumn:(number), endLine:(number), endColumn:(number)}} */
Protocol.CSS.SourceRange;

/** @typedef {!{name:(string), value:(string), important:(boolean|undefined)}} */
Protocol.CSS.ShorthandEntry;

/** @typedef {!{name:(string), value:(string)}} */
Protocol.CSS.CSSComputedStyleProperty;

/** @typedef {!{styleSheetId:(Protocol.CSS.StyleSheetId|undefined), cssProperties:(!Array<Protocol.CSS.CSSProperty>), shorthandEntries:(!Array<Protocol.CSS.ShorthandEntry>), cssText:(string|undefined), range:(Protocol.CSS.SourceRange|undefined)}} */
Protocol.CSS.CSSStyle;

/** @typedef {!{name:(string), value:(string), important:(boolean|undefined), implicit:(boolean|undefined), text:(string|undefined), parsedOk:(boolean|undefined), disabled:(boolean|undefined), range:(Protocol.CSS.SourceRange|undefined)}} */
Protocol.CSS.CSSProperty;

/** @enum {string} */
Protocol.CSS.CSSMediaSource = {
  MediaRule: 'mediaRule',
  ImportRule: 'importRule',
  LinkedSheet: 'linkedSheet',
  InlineSheet: 'inlineSheet',
};

/** @typedef {!{text:(string), source:(Protocol.CSS.CSSMediaSource), sourceURL:(string|undefined), range:(Protocol.CSS.SourceRange|undefined), styleSheetId:(Protocol.CSS.StyleSheetId|undefined), mediaList:(!Array<Protocol.CSS.MediaQuery>|undefined)}} */
Protocol.CSS.CSSMedia;

/** @typedef {!{expressions:(!Array<Protocol.CSS.MediaQueryExpression>), active:(boolean)}} */
Protocol.CSS.MediaQuery;

/** @typedef {!{value:(number), unit:(string), feature:(string), valueRange:(Protocol.CSS.SourceRange|undefined), computedLength:(number|undefined)}} */
Protocol.CSS.MediaQueryExpression;

/** @typedef {!{familyName:(string), isCustomFont:(boolean), glyphCount:(number)}} */
Protocol.CSS.PlatformFontUsage;

/** @typedef {!{fontFamily:(string), fontStyle:(string), fontVariant:(string), fontWeight:(string), fontStretch:(string), unicodeRange:(string), src:(string), platformFontFamily:(string)}} */
Protocol.CSS.FontFace;

/** @typedef {!{animationName:(Protocol.CSS.Value), keyframes:(!Array<Protocol.CSS.CSSKeyframeRule>)}} */
Protocol.CSS.CSSKeyframesRule;

/** @typedef {!{styleSheetId:(Protocol.CSS.StyleSheetId|undefined), origin:(Protocol.CSS.StyleSheetOrigin), keyText:(Protocol.CSS.Value), style:(Protocol.CSS.CSSStyle)}} */
Protocol.CSS.CSSKeyframeRule;

/** @typedef {!{styleSheetId:(Protocol.CSS.StyleSheetId), range:(Protocol.CSS.SourceRange), text:(string)}} */
Protocol.CSS.StyleDeclarationEdit;
/** @interface */
Protocol.CSSDispatcher = function () {};
/**
 * @param {Protocol.CSS.FontFace=} opt_font
 */
Protocol.CSSDispatcher.prototype.fontsUpdated = function (opt_font) {};
Protocol.CSSDispatcher.prototype.mediaQueryResultChanged = function () {};
/**
 * @param {Protocol.CSS.CSSStyleSheetHeader} header
 */
Protocol.CSSDispatcher.prototype.styleSheetAdded = function (header) {};
/**
 * @param {Protocol.CSS.StyleSheetId} styleSheetId
 */
Protocol.CSSDispatcher.prototype.styleSheetChanged = function (styleSheetId) {};
/**
 * @param {Protocol.CSS.StyleSheetId} styleSheetId
 */
Protocol.CSSDispatcher.prototype.styleSheetRemoved = function (styleSheetId) {};
Protocol.CacheStorage = {};

/**
 * @constructor
 */
Protocol.CacheStorageAgent = function () {};

/**
 * @param {Protocol.CacheStorage.CacheId} cacheId
 * @return {!Promise<undefined>}
 */
Protocol.CacheStorageAgent.prototype.deleteCache = function (cacheId) {};
/** @typedef {!{cacheId: Protocol.CacheStorage.CacheId}} */
Protocol.CacheStorageAgent.DeleteCacheRequest;
/** @typedef {Object|undefined} */
Protocol.CacheStorageAgent.DeleteCacheResponse;
/**
 * @param {!Protocol.CacheStorageAgent.DeleteCacheRequest} obj
 * @return {!Promise<!Protocol.CacheStorageAgent.DeleteCacheResponse>} */
Protocol.CacheStorageAgent.prototype.invoke_deleteCache = function (obj) {};

/**
 * @param {Protocol.CacheStorage.CacheId} cacheId
 * @param {string} request
 * @return {!Promise<undefined>}
 */
Protocol.CacheStorageAgent.prototype.deleteEntry = function (cacheId, request) {};
/** @typedef {!{cacheId: Protocol.CacheStorage.CacheId, request: string}} */
Protocol.CacheStorageAgent.DeleteEntryRequest;
/** @typedef {Object|undefined} */
Protocol.CacheStorageAgent.DeleteEntryResponse;
/**
 * @param {!Protocol.CacheStorageAgent.DeleteEntryRequest} obj
 * @return {!Promise<!Protocol.CacheStorageAgent.DeleteEntryResponse>} */
Protocol.CacheStorageAgent.prototype.invoke_deleteEntry = function (obj) {};

/**
 * @param {string} securityOrigin
 * @return {!Promise<?Array<Protocol.CacheStorage.Cache>>}
 */
Protocol.CacheStorageAgent.prototype.requestCacheNames = function (securityOrigin) {};
/** @typedef {!{securityOrigin: string}} */
Protocol.CacheStorageAgent.RequestCacheNamesRequest;
/** @typedef {!{caches: !Array<Protocol.CacheStorage.Cache>}} */
Protocol.CacheStorageAgent.RequestCacheNamesResponse;
/**
 * @param {!Protocol.CacheStorageAgent.RequestCacheNamesRequest} obj
 * @return {!Promise<!Protocol.CacheStorageAgent.RequestCacheNamesResponse>} */
Protocol.CacheStorageAgent.prototype.invoke_requestCacheNames = function (obj) {};

/**
 * @param {Protocol.CacheStorage.CacheId} cacheId
 * @param {string} requestURL
 * @param {!Array<Protocol.CacheStorage.Header>} requestHeaders
 * @return {!Promise<?Protocol.CacheStorage.CachedResponse>}
 */
Protocol.CacheStorageAgent.prototype.requestCachedResponse = function (cacheId, requestURL, requestHeaders) {};
/** @typedef {!{requestHeaders: !Array<Protocol.CacheStorage.Header>, cacheId: Protocol.CacheStorage.CacheId, requestURL: string}} */
Protocol.CacheStorageAgent.RequestCachedResponseRequest;
/** @typedef {!{response: Protocol.CacheStorage.CachedResponse}} */
Protocol.CacheStorageAgent.RequestCachedResponseResponse;
/**
 * @param {!Protocol.CacheStorageAgent.RequestCachedResponseRequest} obj
 * @return {!Promise<!Protocol.CacheStorageAgent.RequestCachedResponseResponse>} */
Protocol.CacheStorageAgent.prototype.invoke_requestCachedResponse = function (obj) {};

/**
 * @param {Protocol.CacheStorage.CacheId} cacheId
 * @param {number=} opt_skipCount
 * @param {number=} opt_pageSize
 * @param {string=} opt_pathFilter
 * @return {!Promise<?Array<Protocol.CacheStorage.DataEntry>>}
 */
Protocol.CacheStorageAgent.prototype.requestEntries = function (
  cacheId,
  opt_skipCount,
  opt_pageSize,
  opt_pathFilter,
) {};
/** @typedef {!{pathFilter: (string|undefined), cacheId: Protocol.CacheStorage.CacheId, skipCount: (number|undefined), pageSize: (number|undefined)}} */
Protocol.CacheStorageAgent.RequestEntriesRequest;
/** @typedef {!{returnCount: number, cacheDataEntries: !Array<Protocol.CacheStorage.DataEntry>}} */
Protocol.CacheStorageAgent.RequestEntriesResponse;
/**
 * @param {!Protocol.CacheStorageAgent.RequestEntriesRequest} obj
 * @return {!Promise<!Protocol.CacheStorageAgent.RequestEntriesResponse>} */
Protocol.CacheStorageAgent.prototype.invoke_requestEntries = function (obj) {};

/** @typedef {string} */
Protocol.CacheStorage.CacheId;

/** @enum {string} */
Protocol.CacheStorage.CachedResponseType = {
  Basic: 'basic',
  Cors: 'cors',
  Default: 'default',
  Error: 'error',
  OpaqueResponse: 'opaqueResponse',
  OpaqueRedirect: 'opaqueRedirect',
};

/** @typedef {!{requestURL:(string), requestMethod:(string), requestHeaders:(!Array<Protocol.CacheStorage.Header>), responseTime:(number), responseStatus:(number), responseStatusText:(string), responseType:(Protocol.CacheStorage.CachedResponseType), responseHeaders:(!Array<Protocol.CacheStorage.Header>)}} */
Protocol.CacheStorage.DataEntry;

/** @typedef {!{cacheId:(Protocol.CacheStorage.CacheId), securityOrigin:(string), cacheName:(string)}} */
Protocol.CacheStorage.Cache;

/** @typedef {!{name:(string), value:(string)}} */
Protocol.CacheStorage.Header;

/** @typedef {!{body:(string)}} */
Protocol.CacheStorage.CachedResponse;
/** @interface */
Protocol.CacheStorageDispatcher = function () {};
Protocol.Cast = {};

/**
 * @constructor
 */
Protocol.CastAgent = function () {};

/**
 * @param {string=} opt_presentationUrl
 * @return {!Promise<undefined>}
 */
Protocol.CastAgent.prototype.enable = function (opt_presentationUrl) {};
/** @typedef {!{presentationUrl: (string|undefined)}} */
Protocol.CastAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.CastAgent.EnableResponse;
/**
 * @param {!Protocol.CastAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.CastAgent.EnableResponse>} */
Protocol.CastAgent.prototype.invoke_enable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.CastAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.CastAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.CastAgent.DisableResponse;
/**
 * @param {!Protocol.CastAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.CastAgent.DisableResponse>} */
Protocol.CastAgent.prototype.invoke_disable = function (obj) {};

/**
 * @param {string} sinkName
 * @return {!Promise<undefined>}
 */
Protocol.CastAgent.prototype.setSinkToUse = function (sinkName) {};
/** @typedef {!{sinkName: string}} */
Protocol.CastAgent.SetSinkToUseRequest;
/** @typedef {Object|undefined} */
Protocol.CastAgent.SetSinkToUseResponse;
/**
 * @param {!Protocol.CastAgent.SetSinkToUseRequest} obj
 * @return {!Promise<!Protocol.CastAgent.SetSinkToUseResponse>} */
Protocol.CastAgent.prototype.invoke_setSinkToUse = function (obj) {};

/**
 * @param {string} sinkName
 * @return {!Promise<undefined>}
 */
Protocol.CastAgent.prototype.startTabMirroring = function (sinkName) {};
/** @typedef {!{sinkName: string}} */
Protocol.CastAgent.StartTabMirroringRequest;
/** @typedef {Object|undefined} */
Protocol.CastAgent.StartTabMirroringResponse;
/**
 * @param {!Protocol.CastAgent.StartTabMirroringRequest} obj
 * @return {!Promise<!Protocol.CastAgent.StartTabMirroringResponse>} */
Protocol.CastAgent.prototype.invoke_startTabMirroring = function (obj) {};

/**
 * @param {string} sinkName
 * @return {!Promise<undefined>}
 */
Protocol.CastAgent.prototype.stopCasting = function (sinkName) {};
/** @typedef {!{sinkName: string}} */
Protocol.CastAgent.StopCastingRequest;
/** @typedef {Object|undefined} */
Protocol.CastAgent.StopCastingResponse;
/**
 * @param {!Protocol.CastAgent.StopCastingRequest} obj
 * @return {!Promise<!Protocol.CastAgent.StopCastingResponse>} */
Protocol.CastAgent.prototype.invoke_stopCasting = function (obj) {};

/** @typedef {!{name:(string), id:(string), session:(string|undefined)}} */
Protocol.Cast.Sink;
/** @interface */
Protocol.CastDispatcher = function () {};
/**
 * @param {!Array<Protocol.Cast.Sink>} sinks
 */
Protocol.CastDispatcher.prototype.sinksUpdated = function (sinks) {};
/**
 * @param {string} issueMessage
 */
Protocol.CastDispatcher.prototype.issueUpdated = function (issueMessage) {};
Protocol.DOM = {};

/**
 * @constructor
 */
Protocol.DOMAgent = function () {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @return {!Promise<?Array<string>>}
 */
Protocol.DOMAgent.prototype.collectClassNamesFromSubtree = function (nodeId) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.CollectClassNamesFromSubtreeRequest;
/** @typedef {!{classNames: !Array<string>}} */
Protocol.DOMAgent.CollectClassNamesFromSubtreeResponse;
/**
 * @param {!Protocol.DOMAgent.CollectClassNamesFromSubtreeRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.CollectClassNamesFromSubtreeResponse>} */
Protocol.DOMAgent.prototype.invoke_collectClassNamesFromSubtree = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {Protocol.DOM.NodeId} targetNodeId
 * @param {Protocol.DOM.NodeId=} opt_insertBeforeNodeId
 * @return {!Promise<?Protocol.DOM.NodeId>}
 */
Protocol.DOMAgent.prototype.copyTo = function (nodeId, targetNodeId, opt_insertBeforeNodeId) {};
/** @typedef {!{targetNodeId: Protocol.DOM.NodeId, nodeId: Protocol.DOM.NodeId, insertBeforeNodeId: (Protocol.DOM.NodeId|undefined)}} */
Protocol.DOMAgent.CopyToRequest;
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.CopyToResponse;
/**
 * @param {!Protocol.DOMAgent.CopyToRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.CopyToResponse>} */
Protocol.DOMAgent.prototype.invoke_copyTo = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId=} opt_nodeId
 * @param {Protocol.DOM.BackendNodeId=} opt_backendNodeId
 * @param {Protocol.Runtime.RemoteObjectId=} opt_objectId
 * @param {number=} opt_depth
 * @param {boolean=} opt_pierce
 * @return {!Promise<?Protocol.DOM.Node>}
 */
Protocol.DOMAgent.prototype.describeNode = function (
  opt_nodeId,
  opt_backendNodeId,
  opt_objectId,
  opt_depth,
  opt_pierce,
) {};
/** @typedef {!{depth: (number|undefined), objectId: (Protocol.Runtime.RemoteObjectId|undefined), nodeId: (Protocol.DOM.NodeId|undefined), backendNodeId: (Protocol.DOM.BackendNodeId|undefined), pierce: (boolean|undefined)}} */
Protocol.DOMAgent.DescribeNodeRequest;
/** @typedef {!{node: Protocol.DOM.Node}} */
Protocol.DOMAgent.DescribeNodeResponse;
/**
 * @param {!Protocol.DOMAgent.DescribeNodeRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.DescribeNodeResponse>} */
Protocol.DOMAgent.prototype.invoke_describeNode = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.DisableResponse;
/**
 * @param {!Protocol.DOMAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.DisableResponse>} */
Protocol.DOMAgent.prototype.invoke_disable = function (obj) {};

/**
 * @param {string} searchId
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.discardSearchResults = function (searchId) {};
/** @typedef {!{searchId: string}} */
Protocol.DOMAgent.DiscardSearchResultsRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.DiscardSearchResultsResponse;
/**
 * @param {!Protocol.DOMAgent.DiscardSearchResultsRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.DiscardSearchResultsResponse>} */
Protocol.DOMAgent.prototype.invoke_discardSearchResults = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.EnableResponse;
/**
 * @param {!Protocol.DOMAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.EnableResponse>} */
Protocol.DOMAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId=} opt_nodeId
 * @param {Protocol.DOM.BackendNodeId=} opt_backendNodeId
 * @param {Protocol.Runtime.RemoteObjectId=} opt_objectId
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.focus = function (opt_nodeId, opt_backendNodeId, opt_objectId) {};
/** @typedef {!{objectId: (Protocol.Runtime.RemoteObjectId|undefined), nodeId: (Protocol.DOM.NodeId|undefined), backendNodeId: (Protocol.DOM.BackendNodeId|undefined)}} */
Protocol.DOMAgent.FocusRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.FocusResponse;
/**
 * @param {!Protocol.DOMAgent.FocusRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.FocusResponse>} */
Protocol.DOMAgent.prototype.invoke_focus = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @return {!Promise<?Array<string>>}
 */
Protocol.DOMAgent.prototype.getAttributes = function (nodeId) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.GetAttributesRequest;
/** @typedef {!{attributes: !Array<string>}} */
Protocol.DOMAgent.GetAttributesResponse;
/**
 * @param {!Protocol.DOMAgent.GetAttributesRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetAttributesResponse>} */
Protocol.DOMAgent.prototype.invoke_getAttributes = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId=} opt_nodeId
 * @param {Protocol.DOM.BackendNodeId=} opt_backendNodeId
 * @param {Protocol.Runtime.RemoteObjectId=} opt_objectId
 * @return {!Promise<?Protocol.DOM.BoxModel>}
 */
Protocol.DOMAgent.prototype.getBoxModel = function (opt_nodeId, opt_backendNodeId, opt_objectId) {};
/** @typedef {!{objectId: (Protocol.Runtime.RemoteObjectId|undefined), nodeId: (Protocol.DOM.NodeId|undefined), backendNodeId: (Protocol.DOM.BackendNodeId|undefined)}} */
Protocol.DOMAgent.GetBoxModelRequest;
/** @typedef {!{model: Protocol.DOM.BoxModel}} */
Protocol.DOMAgent.GetBoxModelResponse;
/**
 * @param {!Protocol.DOMAgent.GetBoxModelRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetBoxModelResponse>} */
Protocol.DOMAgent.prototype.invoke_getBoxModel = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId=} opt_nodeId
 * @param {Protocol.DOM.BackendNodeId=} opt_backendNodeId
 * @param {Protocol.Runtime.RemoteObjectId=} opt_objectId
 * @return {!Promise<?Array<Protocol.DOM.Quad>>}
 */
Protocol.DOMAgent.prototype.getContentQuads = function (opt_nodeId, opt_backendNodeId, opt_objectId) {};
/** @typedef {!{objectId: (Protocol.Runtime.RemoteObjectId|undefined), nodeId: (Protocol.DOM.NodeId|undefined), backendNodeId: (Protocol.DOM.BackendNodeId|undefined)}} */
Protocol.DOMAgent.GetContentQuadsRequest;
/** @typedef {!{quads: !Array<Protocol.DOM.Quad>}} */
Protocol.DOMAgent.GetContentQuadsResponse;
/**
 * @param {!Protocol.DOMAgent.GetContentQuadsRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetContentQuadsResponse>} */
Protocol.DOMAgent.prototype.invoke_getContentQuads = function (obj) {};

/**
 * @param {number=} opt_depth
 * @param {boolean=} opt_pierce
 * @return {!Promise<?Protocol.DOM.Node>}
 */
Protocol.DOMAgent.prototype.getDocument = function (opt_depth, opt_pierce) {};
/** @typedef {!{depth: (number|undefined), pierce: (boolean|undefined)}} */
Protocol.DOMAgent.GetDocumentRequest;
/** @typedef {!{root: Protocol.DOM.Node}} */
Protocol.DOMAgent.GetDocumentResponse;
/**
 * @param {!Protocol.DOMAgent.GetDocumentRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetDocumentResponse>} */
Protocol.DOMAgent.prototype.invoke_getDocument = function (obj) {};

/**
 * @param {number=} opt_depth
 * @param {boolean=} opt_pierce
 * @return {!Promise<?Array<Protocol.DOM.Node>>}
 */
Protocol.DOMAgent.prototype.getFlattenedDocument = function (opt_depth, opt_pierce) {};
/** @typedef {!{depth: (number|undefined), pierce: (boolean|undefined)}} */
Protocol.DOMAgent.GetFlattenedDocumentRequest;
/** @typedef {!{nodes: !Array<Protocol.DOM.Node>}} */
Protocol.DOMAgent.GetFlattenedDocumentResponse;
/**
 * @param {!Protocol.DOMAgent.GetFlattenedDocumentRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetFlattenedDocumentResponse>} */
Protocol.DOMAgent.prototype.invoke_getFlattenedDocument = function (obj) {};

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean=} opt_includeUserAgentShadowDOM
 * @param {boolean=} opt_ignorePointerEventsNone
 * @return {!Promise<?Protocol.DOM.BackendNodeId>}
 */
Protocol.DOMAgent.prototype.getNodeForLocation = function (
  x,
  y,
  opt_includeUserAgentShadowDOM,
  opt_ignorePointerEventsNone,
) {};
/** @typedef {!{y: number, x: number, ignorePointerEventsNone: (boolean|undefined), includeUserAgentShadowDOM: (boolean|undefined)}} */
Protocol.DOMAgent.GetNodeForLocationRequest;
/** @typedef {!{nodeId: Protocol.DOM.NodeId, backendNodeId: Protocol.DOM.BackendNodeId, frameId: Protocol.Page.FrameId}} */
Protocol.DOMAgent.GetNodeForLocationResponse;
/**
 * @param {!Protocol.DOMAgent.GetNodeForLocationRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetNodeForLocationResponse>} */
Protocol.DOMAgent.prototype.invoke_getNodeForLocation = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId=} opt_nodeId
 * @param {Protocol.DOM.BackendNodeId=} opt_backendNodeId
 * @param {Protocol.Runtime.RemoteObjectId=} opt_objectId
 * @return {!Promise<?string>}
 */
Protocol.DOMAgent.prototype.getOuterHTML = function (opt_nodeId, opt_backendNodeId, opt_objectId) {};
/** @typedef {!{objectId: (Protocol.Runtime.RemoteObjectId|undefined), nodeId: (Protocol.DOM.NodeId|undefined), backendNodeId: (Protocol.DOM.BackendNodeId|undefined)}} */
Protocol.DOMAgent.GetOuterHTMLRequest;
/** @typedef {!{outerHTML: string}} */
Protocol.DOMAgent.GetOuterHTMLResponse;
/**
 * @param {!Protocol.DOMAgent.GetOuterHTMLRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetOuterHTMLResponse>} */
Protocol.DOMAgent.prototype.invoke_getOuterHTML = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @return {!Promise<?Protocol.DOM.NodeId>}
 */
Protocol.DOMAgent.prototype.getRelayoutBoundary = function (nodeId) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.GetRelayoutBoundaryRequest;
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.GetRelayoutBoundaryResponse;
/**
 * @param {!Protocol.DOMAgent.GetRelayoutBoundaryRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetRelayoutBoundaryResponse>} */
Protocol.DOMAgent.prototype.invoke_getRelayoutBoundary = function (obj) {};

/**
 * @param {string} searchId
 * @param {number} fromIndex
 * @param {number} toIndex
 * @return {!Promise<?Array<Protocol.DOM.NodeId>>}
 */
Protocol.DOMAgent.prototype.getSearchResults = function (searchId, fromIndex, toIndex) {};
/** @typedef {!{toIndex: number, searchId: string, fromIndex: number}} */
Protocol.DOMAgent.GetSearchResultsRequest;
/** @typedef {!{nodeIds: !Array<Protocol.DOM.NodeId>}} */
Protocol.DOMAgent.GetSearchResultsResponse;
/**
 * @param {!Protocol.DOMAgent.GetSearchResultsRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetSearchResultsResponse>} */
Protocol.DOMAgent.prototype.invoke_getSearchResults = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.hideHighlight = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMAgent.HideHighlightRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.HideHighlightResponse;
/**
 * @param {!Protocol.DOMAgent.HideHighlightRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.HideHighlightResponse>} */
Protocol.DOMAgent.prototype.invoke_hideHighlight = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.highlightNode = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMAgent.HighlightNodeRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.HighlightNodeResponse;
/**
 * @param {!Protocol.DOMAgent.HighlightNodeRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.HighlightNodeResponse>} */
Protocol.DOMAgent.prototype.invoke_highlightNode = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.highlightRect = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMAgent.HighlightRectRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.HighlightRectResponse;
/**
 * @param {!Protocol.DOMAgent.HighlightRectRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.HighlightRectResponse>} */
Protocol.DOMAgent.prototype.invoke_highlightRect = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.markUndoableState = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMAgent.MarkUndoableStateRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.MarkUndoableStateResponse;
/**
 * @param {!Protocol.DOMAgent.MarkUndoableStateRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.MarkUndoableStateResponse>} */
Protocol.DOMAgent.prototype.invoke_markUndoableState = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {Protocol.DOM.NodeId} targetNodeId
 * @param {Protocol.DOM.NodeId=} opt_insertBeforeNodeId
 * @return {!Promise<?Protocol.DOM.NodeId>}
 */
Protocol.DOMAgent.prototype.moveTo = function (nodeId, targetNodeId, opt_insertBeforeNodeId) {};
/** @typedef {!{targetNodeId: Protocol.DOM.NodeId, nodeId: Protocol.DOM.NodeId, insertBeforeNodeId: (Protocol.DOM.NodeId|undefined)}} */
Protocol.DOMAgent.MoveToRequest;
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.MoveToResponse;
/**
 * @param {!Protocol.DOMAgent.MoveToRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.MoveToResponse>} */
Protocol.DOMAgent.prototype.invoke_moveTo = function (obj) {};

/**
 * @param {string} query
 * @param {boolean=} opt_includeUserAgentShadowDOM
 * @return {!Promise<?string>}
 */
Protocol.DOMAgent.prototype.performSearch = function (query, opt_includeUserAgentShadowDOM) {};
/** @typedef {!{query: string, includeUserAgentShadowDOM: (boolean|undefined)}} */
Protocol.DOMAgent.PerformSearchRequest;
/** @typedef {!{searchId: string, resultCount: number}} */
Protocol.DOMAgent.PerformSearchResponse;
/**
 * @param {!Protocol.DOMAgent.PerformSearchRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.PerformSearchResponse>} */
Protocol.DOMAgent.prototype.invoke_performSearch = function (obj) {};

/**
 * @param {string} path
 * @return {!Promise<?Protocol.DOM.NodeId>}
 */
Protocol.DOMAgent.prototype.pushNodeByPathToFrontend = function (path) {};
/** @typedef {!{path: string}} */
Protocol.DOMAgent.PushNodeByPathToFrontendRequest;
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.PushNodeByPathToFrontendResponse;
/**
 * @param {!Protocol.DOMAgent.PushNodeByPathToFrontendRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.PushNodeByPathToFrontendResponse>} */
Protocol.DOMAgent.prototype.invoke_pushNodeByPathToFrontend = function (obj) {};

/**
 * @param {!Array<Protocol.DOM.BackendNodeId>} backendNodeIds
 * @return {!Promise<?Array<Protocol.DOM.NodeId>>}
 */
Protocol.DOMAgent.prototype.pushNodesByBackendIdsToFrontend = function (backendNodeIds) {};
/** @typedef {!{backendNodeIds: !Array<Protocol.DOM.BackendNodeId>}} */
Protocol.DOMAgent.PushNodesByBackendIdsToFrontendRequest;
/** @typedef {!{nodeIds: !Array<Protocol.DOM.NodeId>}} */
Protocol.DOMAgent.PushNodesByBackendIdsToFrontendResponse;
/**
 * @param {!Protocol.DOMAgent.PushNodesByBackendIdsToFrontendRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.PushNodesByBackendIdsToFrontendResponse>} */
Protocol.DOMAgent.prototype.invoke_pushNodesByBackendIdsToFrontend = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} selector
 * @return {!Promise<?Protocol.DOM.NodeId>}
 */
Protocol.DOMAgent.prototype.querySelector = function (nodeId, selector) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId, selector: string}} */
Protocol.DOMAgent.QuerySelectorRequest;
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.QuerySelectorResponse;
/**
 * @param {!Protocol.DOMAgent.QuerySelectorRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.QuerySelectorResponse>} */
Protocol.DOMAgent.prototype.invoke_querySelector = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} selector
 * @return {!Promise<?Array<Protocol.DOM.NodeId>>}
 */
Protocol.DOMAgent.prototype.querySelectorAll = function (nodeId, selector) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId, selector: string}} */
Protocol.DOMAgent.QuerySelectorAllRequest;
/** @typedef {!{nodeIds: !Array<Protocol.DOM.NodeId>}} */
Protocol.DOMAgent.QuerySelectorAllResponse;
/**
 * @param {!Protocol.DOMAgent.QuerySelectorAllRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.QuerySelectorAllResponse>} */
Protocol.DOMAgent.prototype.invoke_querySelectorAll = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.redo = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMAgent.RedoRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.RedoResponse;
/**
 * @param {!Protocol.DOMAgent.RedoRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.RedoResponse>} */
Protocol.DOMAgent.prototype.invoke_redo = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} name
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.removeAttribute = function (nodeId, name) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId, name: string}} */
Protocol.DOMAgent.RemoveAttributeRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.RemoveAttributeResponse;
/**
 * @param {!Protocol.DOMAgent.RemoveAttributeRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.RemoveAttributeResponse>} */
Protocol.DOMAgent.prototype.invoke_removeAttribute = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.removeNode = function (nodeId) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.RemoveNodeRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.RemoveNodeResponse;
/**
 * @param {!Protocol.DOMAgent.RemoveNodeRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.RemoveNodeResponse>} */
Protocol.DOMAgent.prototype.invoke_removeNode = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {number=} opt_depth
 * @param {boolean=} opt_pierce
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.requestChildNodes = function (nodeId, opt_depth, opt_pierce) {};
/** @typedef {!{depth: (number|undefined), nodeId: Protocol.DOM.NodeId, pierce: (boolean|undefined)}} */
Protocol.DOMAgent.RequestChildNodesRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.RequestChildNodesResponse;
/**
 * @param {!Protocol.DOMAgent.RequestChildNodesRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.RequestChildNodesResponse>} */
Protocol.DOMAgent.prototype.invoke_requestChildNodes = function (obj) {};

/**
 * @param {Protocol.Runtime.RemoteObjectId} objectId
 * @return {!Promise<?Protocol.DOM.NodeId>}
 */
Protocol.DOMAgent.prototype.requestNode = function (objectId) {};
/** @typedef {!{objectId: Protocol.Runtime.RemoteObjectId}} */
Protocol.DOMAgent.RequestNodeRequest;
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.RequestNodeResponse;
/**
 * @param {!Protocol.DOMAgent.RequestNodeRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.RequestNodeResponse>} */
Protocol.DOMAgent.prototype.invoke_requestNode = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId=} opt_nodeId
 * @param {Protocol.DOM.BackendNodeId=} opt_backendNodeId
 * @param {string=} opt_objectGroup
 * @param {Protocol.Runtime.ExecutionContextId=} opt_executionContextId
 * @return {!Promise<?Protocol.Runtime.RemoteObject>}
 */
Protocol.DOMAgent.prototype.resolveNode = function (
  opt_nodeId,
  opt_backendNodeId,
  opt_objectGroup,
  opt_executionContextId,
) {};
/** @typedef {!{objectGroup: (string|undefined), executionContextId: (Protocol.Runtime.ExecutionContextId|undefined), nodeId: (Protocol.DOM.NodeId|undefined), backendNodeId: (Protocol.DOM.BackendNodeId|undefined)}} */
Protocol.DOMAgent.ResolveNodeRequest;
/** @typedef {!{object: Protocol.Runtime.RemoteObject}} */
Protocol.DOMAgent.ResolveNodeResponse;
/**
 * @param {!Protocol.DOMAgent.ResolveNodeRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.ResolveNodeResponse>} */
Protocol.DOMAgent.prototype.invoke_resolveNode = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} name
 * @param {string} value
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.setAttributeValue = function (nodeId, name, value) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId, value: string, name: string}} */
Protocol.DOMAgent.SetAttributeValueRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.SetAttributeValueResponse;
/**
 * @param {!Protocol.DOMAgent.SetAttributeValueRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.SetAttributeValueResponse>} */
Protocol.DOMAgent.prototype.invoke_setAttributeValue = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} text
 * @param {string=} opt_name
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.setAttributesAsText = function (nodeId, text, opt_name) {};
/** @typedef {!{text: string, nodeId: Protocol.DOM.NodeId, name: (string|undefined)}} */
Protocol.DOMAgent.SetAttributesAsTextRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.SetAttributesAsTextResponse;
/**
 * @param {!Protocol.DOMAgent.SetAttributesAsTextRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.SetAttributesAsTextResponse>} */
Protocol.DOMAgent.prototype.invoke_setAttributesAsText = function (obj) {};

/**
 * @param {!Array<string>} files
 * @param {Protocol.DOM.NodeId=} opt_nodeId
 * @param {Protocol.DOM.BackendNodeId=} opt_backendNodeId
 * @param {Protocol.Runtime.RemoteObjectId=} opt_objectId
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.setFileInputFiles = function (files, opt_nodeId, opt_backendNodeId, opt_objectId) {};
/** @typedef {!{files: !Array<string>, objectId: (Protocol.Runtime.RemoteObjectId|undefined), nodeId: (Protocol.DOM.NodeId|undefined), backendNodeId: (Protocol.DOM.BackendNodeId|undefined)}} */
Protocol.DOMAgent.SetFileInputFilesRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.SetFileInputFilesResponse;
/**
 * @param {!Protocol.DOMAgent.SetFileInputFilesRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.SetFileInputFilesResponse>} */
Protocol.DOMAgent.prototype.invoke_setFileInputFiles = function (obj) {};

/**
 * @param {boolean} enable
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.setNodeStackTracesEnabled = function (enable) {};
/** @typedef {!{enable: boolean}} */
Protocol.DOMAgent.SetNodeStackTracesEnabledRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.SetNodeStackTracesEnabledResponse;
/**
 * @param {!Protocol.DOMAgent.SetNodeStackTracesEnabledRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.SetNodeStackTracesEnabledResponse>} */
Protocol.DOMAgent.prototype.invoke_setNodeStackTracesEnabled = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @return {!Promise<?Protocol.Runtime.StackTrace>}
 */
Protocol.DOMAgent.prototype.getNodeStackTraces = function (nodeId) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.GetNodeStackTracesRequest;
/** @typedef {!{creation: Protocol.Runtime.StackTrace}} */
Protocol.DOMAgent.GetNodeStackTracesResponse;
/**
 * @param {!Protocol.DOMAgent.GetNodeStackTracesRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetNodeStackTracesResponse>} */
Protocol.DOMAgent.prototype.invoke_getNodeStackTraces = function (obj) {};

/**
 * @param {Protocol.Runtime.RemoteObjectId} objectId
 * @return {!Promise<?string>}
 */
Protocol.DOMAgent.prototype.getFileInfo = function (objectId) {};
/** @typedef {!{objectId: Protocol.Runtime.RemoteObjectId}} */
Protocol.DOMAgent.GetFileInfoRequest;
/** @typedef {!{path: string}} */
Protocol.DOMAgent.GetFileInfoResponse;
/**
 * @param {!Protocol.DOMAgent.GetFileInfoRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetFileInfoResponse>} */
Protocol.DOMAgent.prototype.invoke_getFileInfo = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.setInspectedNode = function (nodeId) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.SetInspectedNodeRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.SetInspectedNodeResponse;
/**
 * @param {!Protocol.DOMAgent.SetInspectedNodeRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.SetInspectedNodeResponse>} */
Protocol.DOMAgent.prototype.invoke_setInspectedNode = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} name
 * @return {!Promise<?Protocol.DOM.NodeId>}
 */
Protocol.DOMAgent.prototype.setNodeName = function (nodeId, name) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId, name: string}} */
Protocol.DOMAgent.SetNodeNameRequest;
/** @typedef {!{nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.SetNodeNameResponse;
/**
 * @param {!Protocol.DOMAgent.SetNodeNameRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.SetNodeNameResponse>} */
Protocol.DOMAgent.prototype.invoke_setNodeName = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} value
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.setNodeValue = function (nodeId, value) {};
/** @typedef {!{nodeId: Protocol.DOM.NodeId, value: string}} */
Protocol.DOMAgent.SetNodeValueRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.SetNodeValueResponse;
/**
 * @param {!Protocol.DOMAgent.SetNodeValueRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.SetNodeValueResponse>} */
Protocol.DOMAgent.prototype.invoke_setNodeValue = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} outerHTML
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.setOuterHTML = function (nodeId, outerHTML) {};
/** @typedef {!{outerHTML: string, nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMAgent.SetOuterHTMLRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.SetOuterHTMLResponse;
/**
 * @param {!Protocol.DOMAgent.SetOuterHTMLRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.SetOuterHTMLResponse>} */
Protocol.DOMAgent.prototype.invoke_setOuterHTML = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMAgent.prototype.undo = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMAgent.UndoRequest;
/** @typedef {Object|undefined} */
Protocol.DOMAgent.UndoResponse;
/**
 * @param {!Protocol.DOMAgent.UndoRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.UndoResponse>} */
Protocol.DOMAgent.prototype.invoke_undo = function (obj) {};

/**
 * @param {Protocol.Page.FrameId} frameId
 * @return {!Promise<?Protocol.DOM.BackendNodeId>}
 */
Protocol.DOMAgent.prototype.getFrameOwner = function (frameId) {};
/** @typedef {!{frameId: Protocol.Page.FrameId}} */
Protocol.DOMAgent.GetFrameOwnerRequest;
/** @typedef {!{nodeId: Protocol.DOM.NodeId, backendNodeId: Protocol.DOM.BackendNodeId}} */
Protocol.DOMAgent.GetFrameOwnerResponse;
/**
 * @param {!Protocol.DOMAgent.GetFrameOwnerRequest} obj
 * @return {!Promise<!Protocol.DOMAgent.GetFrameOwnerResponse>} */
Protocol.DOMAgent.prototype.invoke_getFrameOwner = function (obj) {};

/** @typedef {number} */
Protocol.DOM.NodeId;

/** @typedef {number} */
Protocol.DOM.BackendNodeId;

/** @typedef {!{nodeType:(number), nodeName:(string), backendNodeId:(Protocol.DOM.BackendNodeId)}} */
Protocol.DOM.BackendNode;

/** @enum {string} */
Protocol.DOM.PseudoType = {
  FirstLine: 'first-line',
  FirstLetter: 'first-letter',
  Before: 'before',
  After: 'after',
  Backdrop: 'backdrop',
  Selection: 'selection',
  FirstLineInherited: 'first-line-inherited',
  Scrollbar: 'scrollbar',
  ScrollbarThumb: 'scrollbar-thumb',
  ScrollbarButton: 'scrollbar-button',
  ScrollbarTrack: 'scrollbar-track',
  ScrollbarTrackPiece: 'scrollbar-track-piece',
  ScrollbarCorner: 'scrollbar-corner',
  Resizer: 'resizer',
  InputListButton: 'input-list-button',
};

/** @enum {string} */
Protocol.DOM.ShadowRootType = {
  UserAgent: 'user-agent',
  Open: 'open',
  Closed: 'closed',
};

/** @typedef {!{nodeId:(Protocol.DOM.NodeId), parentId:(Protocol.DOM.NodeId|undefined), backendNodeId:(Protocol.DOM.BackendNodeId), nodeType:(number), nodeName:(string), localName:(string), nodeValue:(string), childNodeCount:(number|undefined), children:(!Array<Protocol.DOM.Node>|undefined), attributes:(!Array<string>|undefined), documentURL:(string|undefined), baseURL:(string|undefined), publicId:(string|undefined), systemId:(string|undefined), internalSubset:(string|undefined), xmlVersion:(string|undefined), name:(string|undefined), value:(string|undefined), pseudoType:(Protocol.DOM.PseudoType|undefined), shadowRootType:(Protocol.DOM.ShadowRootType|undefined), frameId:(Protocol.Page.FrameId|undefined), contentDocument:(Protocol.DOM.Node|undefined), shadowRoots:(!Array<Protocol.DOM.Node>|undefined), templateContent:(Protocol.DOM.Node|undefined), pseudoElements:(!Array<Protocol.DOM.Node>|undefined), importedDocument:(Protocol.DOM.Node|undefined), distributedNodes:(!Array<Protocol.DOM.BackendNode>|undefined), isSVG:(boolean|undefined)}} */
Protocol.DOM.Node;

/** @typedef {!{r:(number), g:(number), b:(number), a:(number|undefined)}} */
Protocol.DOM.RGBA;

/** @typedef {!Array<!number>} */
Protocol.DOM.Quad;

/** @typedef {!{content:(Protocol.DOM.Quad), padding:(Protocol.DOM.Quad), border:(Protocol.DOM.Quad), margin:(Protocol.DOM.Quad), width:(number), height:(number), shapeOutside:(Protocol.DOM.ShapeOutsideInfo|undefined)}} */
Protocol.DOM.BoxModel;

/** @typedef {!{bounds:(Protocol.DOM.Quad), shape:(!Array<*>), marginShape:(!Array<*>)}} */
Protocol.DOM.ShapeOutsideInfo;

/** @typedef {!{x:(number), y:(number), width:(number), height:(number)}} */
Protocol.DOM.Rect;
/** @interface */
Protocol.DOMDispatcher = function () {};
/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} name
 * @param {string} value
 */
Protocol.DOMDispatcher.prototype.attributeModified = function (nodeId, name, value) {};
/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} name
 */
Protocol.DOMDispatcher.prototype.attributeRemoved = function (nodeId, name) {};
/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {string} characterData
 */
Protocol.DOMDispatcher.prototype.characterDataModified = function (nodeId, characterData) {};
/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {number} childNodeCount
 */
Protocol.DOMDispatcher.prototype.childNodeCountUpdated = function (nodeId, childNodeCount) {};
/**
 * @param {Protocol.DOM.NodeId} parentNodeId
 * @param {Protocol.DOM.NodeId} previousNodeId
 * @param {Protocol.DOM.Node} node
 */
Protocol.DOMDispatcher.prototype.childNodeInserted = function (parentNodeId, previousNodeId, node) {};
/**
 * @param {Protocol.DOM.NodeId} parentNodeId
 * @param {Protocol.DOM.NodeId} nodeId
 */
Protocol.DOMDispatcher.prototype.childNodeRemoved = function (parentNodeId, nodeId) {};
/**
 * @param {Protocol.DOM.NodeId} insertionPointId
 * @param {!Array<Protocol.DOM.BackendNode>} distributedNodes
 */
Protocol.DOMDispatcher.prototype.distributedNodesUpdated = function (insertionPointId, distributedNodes) {};
Protocol.DOMDispatcher.prototype.documentUpdated = function () {};
/**
 * @param {!Array<Protocol.DOM.NodeId>} nodeIds
 */
Protocol.DOMDispatcher.prototype.inlineStyleInvalidated = function (nodeIds) {};
/**
 * @param {Protocol.DOM.NodeId} parentId
 * @param {Protocol.DOM.Node} pseudoElement
 */
Protocol.DOMDispatcher.prototype.pseudoElementAdded = function (parentId, pseudoElement) {};
/**
 * @param {Protocol.DOM.NodeId} parentId
 * @param {Protocol.DOM.NodeId} pseudoElementId
 */
Protocol.DOMDispatcher.prototype.pseudoElementRemoved = function (parentId, pseudoElementId) {};
/**
 * @param {Protocol.DOM.NodeId} parentId
 * @param {!Array<Protocol.DOM.Node>} nodes
 */
Protocol.DOMDispatcher.prototype.setChildNodes = function (parentId, nodes) {};
/**
 * @param {Protocol.DOM.NodeId} hostId
 * @param {Protocol.DOM.NodeId} rootId
 */
Protocol.DOMDispatcher.prototype.shadowRootPopped = function (hostId, rootId) {};
/**
 * @param {Protocol.DOM.NodeId} hostId
 * @param {Protocol.DOM.Node} root
 */
Protocol.DOMDispatcher.prototype.shadowRootPushed = function (hostId, root) {};
Protocol.DOMDebugger = {};

/**
 * @constructor
 */
Protocol.DOMDebuggerAgent = function () {};

/**
 * @param {Protocol.Runtime.RemoteObjectId} objectId
 * @param {number=} opt_depth
 * @param {boolean=} opt_pierce
 * @return {!Promise<?Array<Protocol.DOMDebugger.EventListener>>}
 */
Protocol.DOMDebuggerAgent.prototype.getEventListeners = function (objectId, opt_depth, opt_pierce) {};
/** @typedef {!{depth: (number|undefined), pierce: (boolean|undefined), objectId: Protocol.Runtime.RemoteObjectId}} */
Protocol.DOMDebuggerAgent.GetEventListenersRequest;
/** @typedef {!{listeners: !Array<Protocol.DOMDebugger.EventListener>}} */
Protocol.DOMDebuggerAgent.GetEventListenersResponse;
/**
 * @param {!Protocol.DOMDebuggerAgent.GetEventListenersRequest} obj
 * @return {!Promise<!Protocol.DOMDebuggerAgent.GetEventListenersResponse>} */
Protocol.DOMDebuggerAgent.prototype.invoke_getEventListeners = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {Protocol.DOMDebugger.DOMBreakpointType} type
 * @return {!Promise<undefined>}
 */
Protocol.DOMDebuggerAgent.prototype.removeDOMBreakpoint = function (nodeId, type) {};
/** @typedef {!{type: Protocol.DOMDebugger.DOMBreakpointType, nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMDebuggerAgent.RemoveDOMBreakpointRequest;
/** @typedef {Object|undefined} */
Protocol.DOMDebuggerAgent.RemoveDOMBreakpointResponse;
/**
 * @param {!Protocol.DOMDebuggerAgent.RemoveDOMBreakpointRequest} obj
 * @return {!Promise<!Protocol.DOMDebuggerAgent.RemoveDOMBreakpointResponse>} */
Protocol.DOMDebuggerAgent.prototype.invoke_removeDOMBreakpoint = function (obj) {};

/**
 * @param {string} eventName
 * @param {string=} opt_targetName
 * @return {!Promise<undefined>}
 */
Protocol.DOMDebuggerAgent.prototype.removeEventListenerBreakpoint = function (eventName, opt_targetName) {};
/** @typedef {!{eventName: string, targetName: (string|undefined)}} */
Protocol.DOMDebuggerAgent.RemoveEventListenerBreakpointRequest;
/** @typedef {Object|undefined} */
Protocol.DOMDebuggerAgent.RemoveEventListenerBreakpointResponse;
/**
 * @param {!Protocol.DOMDebuggerAgent.RemoveEventListenerBreakpointRequest} obj
 * @return {!Promise<!Protocol.DOMDebuggerAgent.RemoveEventListenerBreakpointResponse>} */
Protocol.DOMDebuggerAgent.prototype.invoke_removeEventListenerBreakpoint = function (obj) {};

/**
 * @param {string} eventName
 * @return {!Promise<undefined>}
 */
Protocol.DOMDebuggerAgent.prototype.removeInstrumentationBreakpoint = function (eventName) {};
/** @typedef {!{eventName: string}} */
Protocol.DOMDebuggerAgent.RemoveInstrumentationBreakpointRequest;
/** @typedef {Object|undefined} */
Protocol.DOMDebuggerAgent.RemoveInstrumentationBreakpointResponse;
/**
 * @param {!Protocol.DOMDebuggerAgent.RemoveInstrumentationBreakpointRequest} obj
 * @return {!Promise<!Protocol.DOMDebuggerAgent.RemoveInstrumentationBreakpointResponse>} */
Protocol.DOMDebuggerAgent.prototype.invoke_removeInstrumentationBreakpoint = function (obj) {};

/**
 * @param {string} url
 * @return {!Promise<undefined>}
 */
Protocol.DOMDebuggerAgent.prototype.removeXHRBreakpoint = function (url) {};
/** @typedef {!{url: string}} */
Protocol.DOMDebuggerAgent.RemoveXHRBreakpointRequest;
/** @typedef {Object|undefined} */
Protocol.DOMDebuggerAgent.RemoveXHRBreakpointResponse;
/**
 * @param {!Protocol.DOMDebuggerAgent.RemoveXHRBreakpointRequest} obj
 * @return {!Promise<!Protocol.DOMDebuggerAgent.RemoveXHRBreakpointResponse>} */
Protocol.DOMDebuggerAgent.prototype.invoke_removeXHRBreakpoint = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {Protocol.DOMDebugger.DOMBreakpointType} type
 * @return {!Promise<undefined>}
 */
Protocol.DOMDebuggerAgent.prototype.setDOMBreakpoint = function (nodeId, type) {};
/** @typedef {!{type: Protocol.DOMDebugger.DOMBreakpointType, nodeId: Protocol.DOM.NodeId}} */
Protocol.DOMDebuggerAgent.SetDOMBreakpointRequest;
/** @typedef {Object|undefined} */
Protocol.DOMDebuggerAgent.SetDOMBreakpointResponse;
/**
 * @param {!Protocol.DOMDebuggerAgent.SetDOMBreakpointRequest} obj
 * @return {!Promise<!Protocol.DOMDebuggerAgent.SetDOMBreakpointResponse>} */
Protocol.DOMDebuggerAgent.prototype.invoke_setDOMBreakpoint = function (obj) {};

/**
 * @param {string} eventName
 * @param {string=} opt_targetName
 * @return {!Promise<undefined>}
 */
Protocol.DOMDebuggerAgent.prototype.setEventListenerBreakpoint = function (eventName, opt_targetName) {};
/** @typedef {!{eventName: string, targetName: (string|undefined)}} */
Protocol.DOMDebuggerAgent.SetEventListenerBreakpointRequest;
/** @typedef {Object|undefined} */
Protocol.DOMDebuggerAgent.SetEventListenerBreakpointResponse;
/**
 * @param {!Protocol.DOMDebuggerAgent.SetEventListenerBreakpointRequest} obj
 * @return {!Promise<!Protocol.DOMDebuggerAgent.SetEventListenerBreakpointResponse>} */
Protocol.DOMDebuggerAgent.prototype.invoke_setEventListenerBreakpoint = function (obj) {};

/**
 * @param {string} eventName
 * @return {!Promise<undefined>}
 */
Protocol.DOMDebuggerAgent.prototype.setInstrumentationBreakpoint = function (eventName) {};
/** @typedef {!{eventName: string}} */
Protocol.DOMDebuggerAgent.SetInstrumentationBreakpointRequest;
/** @typedef {Object|undefined} */
Protocol.DOMDebuggerAgent.SetInstrumentationBreakpointResponse;
/**
 * @param {!Protocol.DOMDebuggerAgent.SetInstrumentationBreakpointRequest} obj
 * @return {!Promise<!Protocol.DOMDebuggerAgent.SetInstrumentationBreakpointResponse>} */
Protocol.DOMDebuggerAgent.prototype.invoke_setInstrumentationBreakpoint = function (obj) {};

/**
 * @param {string} url
 * @return {!Promise<undefined>}
 */
Protocol.DOMDebuggerAgent.prototype.setXHRBreakpoint = function (url) {};
/** @typedef {!{url: string}} */
Protocol.DOMDebuggerAgent.SetXHRBreakpointRequest;
/** @typedef {Object|undefined} */
Protocol.DOMDebuggerAgent.SetXHRBreakpointResponse;
/**
 * @param {!Protocol.DOMDebuggerAgent.SetXHRBreakpointRequest} obj
 * @return {!Promise<!Protocol.DOMDebuggerAgent.SetXHRBreakpointResponse>} */
Protocol.DOMDebuggerAgent.prototype.invoke_setXHRBreakpoint = function (obj) {};

/** @enum {string} */
Protocol.DOMDebugger.DOMBreakpointType = {
  SubtreeModified: 'subtree-modified',
  AttributeModified: 'attribute-modified',
  NodeRemoved: 'node-removed',
};

/** @typedef {!{type:(string), useCapture:(boolean), passive:(boolean), once:(boolean), scriptId:(Protocol.Runtime.ScriptId), lineNumber:(number), columnNumber:(number), handler:(Protocol.Runtime.RemoteObject|undefined), originalHandler:(Protocol.Runtime.RemoteObject|undefined), backendNodeId:(Protocol.DOM.BackendNodeId|undefined)}} */
Protocol.DOMDebugger.EventListener;
/** @interface */
Protocol.DOMDebuggerDispatcher = function () {};
Protocol.DOMSnapshot = {};

/**
 * @constructor
 */
Protocol.DOMSnapshotAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMSnapshotAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMSnapshotAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.DOMSnapshotAgent.DisableResponse;
/**
 * @param {!Protocol.DOMSnapshotAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.DOMSnapshotAgent.DisableResponse>} */
Protocol.DOMSnapshotAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMSnapshotAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMSnapshotAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.DOMSnapshotAgent.EnableResponse;
/**
 * @param {!Protocol.DOMSnapshotAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.DOMSnapshotAgent.EnableResponse>} */
Protocol.DOMSnapshotAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {!Array<string>} computedStyleWhitelist
 * @param {boolean=} opt_includeEventListeners
 * @param {boolean=} opt_includePaintOrder
 * @param {boolean=} opt_includeUserAgentShadowTree
 * @return {!Promise<?Array<Protocol.DOMSnapshot.DOMNode>>}
 */
Protocol.DOMSnapshotAgent.prototype.getSnapshot = function (
  computedStyleWhitelist,
  opt_includeEventListeners,
  opt_includePaintOrder,
  opt_includeUserAgentShadowTree,
) {};
/** @typedef {!{includePaintOrder: (boolean|undefined), includeEventListeners: (boolean|undefined), computedStyleWhitelist: !Array<string>, includeUserAgentShadowTree: (boolean|undefined)}} */
Protocol.DOMSnapshotAgent.GetSnapshotRequest;
/** @typedef {!{layoutTreeNodes: !Array<Protocol.DOMSnapshot.LayoutTreeNode>, domNodes: !Array<Protocol.DOMSnapshot.DOMNode>, computedStyles: !Array<Protocol.DOMSnapshot.ComputedStyle>}} */
Protocol.DOMSnapshotAgent.GetSnapshotResponse;
/**
 * @param {!Protocol.DOMSnapshotAgent.GetSnapshotRequest} obj
 * @return {!Promise<!Protocol.DOMSnapshotAgent.GetSnapshotResponse>} */
Protocol.DOMSnapshotAgent.prototype.invoke_getSnapshot = function (obj) {};

/**
 * @param {!Array<string>} computedStyles
 * @param {boolean=} opt_includePaintOrder
 * @param {boolean=} opt_includeDOMRects
 * @return {!Promise<?Array<Protocol.DOMSnapshot.DocumentSnapshot>>}
 */
Protocol.DOMSnapshotAgent.prototype.captureSnapshot = function (
  computedStyles,
  opt_includePaintOrder,
  opt_includeDOMRects,
) {};
/** @typedef {!{includePaintOrder: (boolean|undefined), includeDOMRects: (boolean|undefined), computedStyles: !Array<string>}} */
Protocol.DOMSnapshotAgent.CaptureSnapshotRequest;
/** @typedef {!{documents: !Array<Protocol.DOMSnapshot.DocumentSnapshot>, strings: !Array<string>}} */
Protocol.DOMSnapshotAgent.CaptureSnapshotResponse;
/**
 * @param {!Protocol.DOMSnapshotAgent.CaptureSnapshotRequest} obj
 * @return {!Promise<!Protocol.DOMSnapshotAgent.CaptureSnapshotResponse>} */
Protocol.DOMSnapshotAgent.prototype.invoke_captureSnapshot = function (obj) {};

/** @typedef {!{nodeType:(number), nodeName:(string), nodeValue:(string), textValue:(string|undefined), inputValue:(string|undefined), inputChecked:(boolean|undefined), optionSelected:(boolean|undefined), backendNodeId:(Protocol.DOM.BackendNodeId), childNodeIndexes:(!Array<number>|undefined), attributes:(!Array<Protocol.DOMSnapshot.NameValue>|undefined), pseudoElementIndexes:(!Array<number>|undefined), layoutNodeIndex:(number|undefined), documentURL:(string|undefined), baseURL:(string|undefined), contentLanguage:(string|undefined), documentEncoding:(string|undefined), publicId:(string|undefined), systemId:(string|undefined), frameId:(Protocol.Page.FrameId|undefined), contentDocumentIndex:(number|undefined), pseudoType:(Protocol.DOM.PseudoType|undefined), shadowRootType:(Protocol.DOM.ShadowRootType|undefined), isClickable:(boolean|undefined), eventListeners:(!Array<Protocol.DOMDebugger.EventListener>|undefined), currentSourceURL:(string|undefined), originURL:(string|undefined), scrollOffsetX:(number|undefined), scrollOffsetY:(number|undefined)}} */
Protocol.DOMSnapshot.DOMNode;

/** @typedef {!{boundingBox:(Protocol.DOM.Rect), startCharacterIndex:(number), numCharacters:(number)}} */
Protocol.DOMSnapshot.InlineTextBox;

/** @typedef {!{domNodeIndex:(number), boundingBox:(Protocol.DOM.Rect), layoutText:(string|undefined), inlineTextNodes:(!Array<Protocol.DOMSnapshot.InlineTextBox>|undefined), styleIndex:(number|undefined), paintOrder:(number|undefined), isStackingContext:(boolean|undefined)}} */
Protocol.DOMSnapshot.LayoutTreeNode;

/** @typedef {!{properties:(!Array<Protocol.DOMSnapshot.NameValue>)}} */
Protocol.DOMSnapshot.ComputedStyle;

/** @typedef {!{name:(string), value:(string)}} */
Protocol.DOMSnapshot.NameValue;

/** @typedef {number} */
Protocol.DOMSnapshot.StringIndex;

/** @typedef {!Array<!Protocol.DOMSnapshot.StringIndex>} */
Protocol.DOMSnapshot.ArrayOfStrings;

/** @typedef {!{index:(!Array<number>), value:(!Array<Protocol.DOMSnapshot.StringIndex>)}} */
Protocol.DOMSnapshot.RareStringData;

/** @typedef {!{index:(!Array<number>)}} */
Protocol.DOMSnapshot.RareBooleanData;

/** @typedef {!{index:(!Array<number>), value:(!Array<number>)}} */
Protocol.DOMSnapshot.RareIntegerData;

/** @typedef {!Array<!number>} */
Protocol.DOMSnapshot.Rectangle;

/** @typedef {!{documentURL:(Protocol.DOMSnapshot.StringIndex), title:(Protocol.DOMSnapshot.StringIndex), baseURL:(Protocol.DOMSnapshot.StringIndex), contentLanguage:(Protocol.DOMSnapshot.StringIndex), encodingName:(Protocol.DOMSnapshot.StringIndex), publicId:(Protocol.DOMSnapshot.StringIndex), systemId:(Protocol.DOMSnapshot.StringIndex), frameId:(Protocol.DOMSnapshot.StringIndex), nodes:(Protocol.DOMSnapshot.NodeTreeSnapshot), layout:(Protocol.DOMSnapshot.LayoutTreeSnapshot), textBoxes:(Protocol.DOMSnapshot.TextBoxSnapshot), scrollOffsetX:(number|undefined), scrollOffsetY:(number|undefined), contentWidth:(number|undefined), contentHeight:(number|undefined)}} */
Protocol.DOMSnapshot.DocumentSnapshot;

/** @typedef {!{parentIndex:(!Array<number>|undefined), nodeType:(!Array<number>|undefined), nodeName:(!Array<Protocol.DOMSnapshot.StringIndex>|undefined), nodeValue:(!Array<Protocol.DOMSnapshot.StringIndex>|undefined), backendNodeId:(!Array<Protocol.DOM.BackendNodeId>|undefined), attributes:(!Array<Protocol.DOMSnapshot.ArrayOfStrings>|undefined), textValue:(Protocol.DOMSnapshot.RareStringData|undefined), inputValue:(Protocol.DOMSnapshot.RareStringData|undefined), inputChecked:(Protocol.DOMSnapshot.RareBooleanData|undefined), optionSelected:(Protocol.DOMSnapshot.RareBooleanData|undefined), contentDocumentIndex:(Protocol.DOMSnapshot.RareIntegerData|undefined), pseudoType:(Protocol.DOMSnapshot.RareStringData|undefined), isClickable:(Protocol.DOMSnapshot.RareBooleanData|undefined), currentSourceURL:(Protocol.DOMSnapshot.RareStringData|undefined), originURL:(Protocol.DOMSnapshot.RareStringData|undefined)}} */
Protocol.DOMSnapshot.NodeTreeSnapshot;

/** @typedef {!{nodeIndex:(!Array<number>), styles:(!Array<Protocol.DOMSnapshot.ArrayOfStrings>), bounds:(!Array<Protocol.DOMSnapshot.Rectangle>), text:(!Array<Protocol.DOMSnapshot.StringIndex>), stackingContexts:(Protocol.DOMSnapshot.RareBooleanData), paintOrders:(!Array<number>|undefined), offsetRects:(!Array<Protocol.DOMSnapshot.Rectangle>|undefined), scrollRects:(!Array<Protocol.DOMSnapshot.Rectangle>|undefined), clientRects:(!Array<Protocol.DOMSnapshot.Rectangle>|undefined)}} */
Protocol.DOMSnapshot.LayoutTreeSnapshot;

/** @typedef {!{layoutIndex:(!Array<number>), bounds:(!Array<Protocol.DOMSnapshot.Rectangle>), start:(!Array<number>), length:(!Array<number>)}} */
Protocol.DOMSnapshot.TextBoxSnapshot;
/** @interface */
Protocol.DOMSnapshotDispatcher = function () {};
Protocol.DOMStorage = {};

/**
 * @constructor
 */
Protocol.DOMStorageAgent = function () {};

/**
 * @param {Protocol.DOMStorage.StorageId} storageId
 * @return {!Promise<undefined>}
 */
Protocol.DOMStorageAgent.prototype.clear = function (storageId) {};
/** @typedef {!{storageId: Protocol.DOMStorage.StorageId}} */
Protocol.DOMStorageAgent.ClearRequest;
/** @typedef {Object|undefined} */
Protocol.DOMStorageAgent.ClearResponse;
/**
 * @param {!Protocol.DOMStorageAgent.ClearRequest} obj
 * @return {!Promise<!Protocol.DOMStorageAgent.ClearResponse>} */
Protocol.DOMStorageAgent.prototype.invoke_clear = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMStorageAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMStorageAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.DOMStorageAgent.DisableResponse;
/**
 * @param {!Protocol.DOMStorageAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.DOMStorageAgent.DisableResponse>} */
Protocol.DOMStorageAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DOMStorageAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.DOMStorageAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.DOMStorageAgent.EnableResponse;
/**
 * @param {!Protocol.DOMStorageAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.DOMStorageAgent.EnableResponse>} */
Protocol.DOMStorageAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {Protocol.DOMStorage.StorageId} storageId
 * @return {!Promise<?Array<Protocol.DOMStorage.Item>>}
 */
Protocol.DOMStorageAgent.prototype.getDOMStorageItems = function (storageId) {};
/** @typedef {!{storageId: Protocol.DOMStorage.StorageId}} */
Protocol.DOMStorageAgent.GetDOMStorageItemsRequest;
/** @typedef {!{entries: !Array<Protocol.DOMStorage.Item>}} */
Protocol.DOMStorageAgent.GetDOMStorageItemsResponse;
/**
 * @param {!Protocol.DOMStorageAgent.GetDOMStorageItemsRequest} obj
 * @return {!Promise<!Protocol.DOMStorageAgent.GetDOMStorageItemsResponse>} */
Protocol.DOMStorageAgent.prototype.invoke_getDOMStorageItems = function (obj) {};

/**
 * @param {Protocol.DOMStorage.StorageId} storageId
 * @param {string} key
 * @return {!Promise<undefined>}
 */
Protocol.DOMStorageAgent.prototype.removeDOMStorageItem = function (storageId, key) {};
/** @typedef {!{storageId: Protocol.DOMStorage.StorageId, key: string}} */
Protocol.DOMStorageAgent.RemoveDOMStorageItemRequest;
/** @typedef {Object|undefined} */
Protocol.DOMStorageAgent.RemoveDOMStorageItemResponse;
/**
 * @param {!Protocol.DOMStorageAgent.RemoveDOMStorageItemRequest} obj
 * @return {!Promise<!Protocol.DOMStorageAgent.RemoveDOMStorageItemResponse>} */
Protocol.DOMStorageAgent.prototype.invoke_removeDOMStorageItem = function (obj) {};

/**
 * @param {Protocol.DOMStorage.StorageId} storageId
 * @param {string} key
 * @param {string} value
 * @return {!Promise<undefined>}
 */
Protocol.DOMStorageAgent.prototype.setDOMStorageItem = function (storageId, key, value) {};
/** @typedef {!{value: string, storageId: Protocol.DOMStorage.StorageId, key: string}} */
Protocol.DOMStorageAgent.SetDOMStorageItemRequest;
/** @typedef {Object|undefined} */
Protocol.DOMStorageAgent.SetDOMStorageItemResponse;
/**
 * @param {!Protocol.DOMStorageAgent.SetDOMStorageItemRequest} obj
 * @return {!Promise<!Protocol.DOMStorageAgent.SetDOMStorageItemResponse>} */
Protocol.DOMStorageAgent.prototype.invoke_setDOMStorageItem = function (obj) {};

/** @typedef {!{securityOrigin:(string), isLocalStorage:(boolean)}} */
Protocol.DOMStorage.StorageId;

/** @typedef {!Array<!string>} */
Protocol.DOMStorage.Item;
/** @interface */
Protocol.DOMStorageDispatcher = function () {};
/**
 * @param {Protocol.DOMStorage.StorageId} storageId
 * @param {string} key
 * @param {string} newValue
 */
Protocol.DOMStorageDispatcher.prototype.domStorageItemAdded = function (storageId, key, newValue) {};
/**
 * @param {Protocol.DOMStorage.StorageId} storageId
 * @param {string} key
 */
Protocol.DOMStorageDispatcher.prototype.domStorageItemRemoved = function (storageId, key) {};
/**
 * @param {Protocol.DOMStorage.StorageId} storageId
 * @param {string} key
 * @param {string} oldValue
 * @param {string} newValue
 */
Protocol.DOMStorageDispatcher.prototype.domStorageItemUpdated = function (storageId, key, oldValue, newValue) {};
/**
 * @param {Protocol.DOMStorage.StorageId} storageId
 */
Protocol.DOMStorageDispatcher.prototype.domStorageItemsCleared = function (storageId) {};
Protocol.Database = {};

/**
 * @constructor
 */
Protocol.DatabaseAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DatabaseAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.DatabaseAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.DatabaseAgent.DisableResponse;
/**
 * @param {!Protocol.DatabaseAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.DatabaseAgent.DisableResponse>} */
Protocol.DatabaseAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DatabaseAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.DatabaseAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.DatabaseAgent.EnableResponse;
/**
 * @param {!Protocol.DatabaseAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.DatabaseAgent.EnableResponse>} */
Protocol.DatabaseAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {Protocol.Database.DatabaseId} databaseId
 * @param {string} query
 * @return {!Promise<?Array<string>>}
 */
Protocol.DatabaseAgent.prototype.executeSQL = function (databaseId, query) {};
/** @typedef {!{query: string, databaseId: Protocol.Database.DatabaseId}} */
Protocol.DatabaseAgent.ExecuteSQLRequest;
/** @typedef {!{columnNames: !Array<string>, values: !Array<*>, sqlError: Protocol.Database.Error}} */
Protocol.DatabaseAgent.ExecuteSQLResponse;
/**
 * @param {!Protocol.DatabaseAgent.ExecuteSQLRequest} obj
 * @return {!Promise<!Protocol.DatabaseAgent.ExecuteSQLResponse>} */
Protocol.DatabaseAgent.prototype.invoke_executeSQL = function (obj) {};

/**
 * @param {Protocol.Database.DatabaseId} databaseId
 * @return {!Promise<?Array<string>>}
 */
Protocol.DatabaseAgent.prototype.getDatabaseTableNames = function (databaseId) {};
/** @typedef {!{databaseId: Protocol.Database.DatabaseId}} */
Protocol.DatabaseAgent.GetDatabaseTableNamesRequest;
/** @typedef {!{tableNames: !Array<string>}} */
Protocol.DatabaseAgent.GetDatabaseTableNamesResponse;
/**
 * @param {!Protocol.DatabaseAgent.GetDatabaseTableNamesRequest} obj
 * @return {!Promise<!Protocol.DatabaseAgent.GetDatabaseTableNamesResponse>} */
Protocol.DatabaseAgent.prototype.invoke_getDatabaseTableNames = function (obj) {};

/** @typedef {string} */
Protocol.Database.DatabaseId;

/** @typedef {!{id:(Protocol.Database.DatabaseId), domain:(string), name:(string), version:(string)}} */
Protocol.Database.Database;

/** @typedef {!{message:(string), code:(number)}} */
Protocol.Database.Error;
/** @interface */
Protocol.DatabaseDispatcher = function () {};
/**
 * @param {Protocol.Database.Database} database
 */
Protocol.DatabaseDispatcher.prototype.addDatabase = function (database) {};
Protocol.DeviceOrientation = {};

/**
 * @constructor
 */
Protocol.DeviceOrientationAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DeviceOrientationAgent.prototype.clearDeviceOrientationOverride = function () {};
/** @typedef {Object|undefined} */
Protocol.DeviceOrientationAgent.ClearDeviceOrientationOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.DeviceOrientationAgent.ClearDeviceOrientationOverrideResponse;
/**
 * @param {!Protocol.DeviceOrientationAgent.ClearDeviceOrientationOverrideRequest} obj
 * @return {!Promise<!Protocol.DeviceOrientationAgent.ClearDeviceOrientationOverrideResponse>} */
Protocol.DeviceOrientationAgent.prototype.invoke_clearDeviceOrientationOverride = function (obj) {};

/**
 * @param {number} alpha
 * @param {number} beta
 * @param {number} gamma
 * @return {!Promise<undefined>}
 */
Protocol.DeviceOrientationAgent.prototype.setDeviceOrientationOverride = function (alpha, beta, gamma) {};
/** @typedef {!{alpha: number, beta: number, gamma: number}} */
Protocol.DeviceOrientationAgent.SetDeviceOrientationOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.DeviceOrientationAgent.SetDeviceOrientationOverrideResponse;
/**
 * @param {!Protocol.DeviceOrientationAgent.SetDeviceOrientationOverrideRequest} obj
 * @return {!Promise<!Protocol.DeviceOrientationAgent.SetDeviceOrientationOverrideResponse>} */
Protocol.DeviceOrientationAgent.prototype.invoke_setDeviceOrientationOverride = function (obj) {};
/** @interface */
Protocol.DeviceOrientationDispatcher = function () {};
Protocol.Emulation = {};

/**
 * @constructor
 */
Protocol.EmulationAgent = function () {};

/**
 * @return {!Promise<?boolean>}
 */
Protocol.EmulationAgent.prototype.canEmulate = function () {};
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.CanEmulateRequest;
/** @typedef {!{result: boolean}} */
Protocol.EmulationAgent.CanEmulateResponse;
/**
 * @param {!Protocol.EmulationAgent.CanEmulateRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.CanEmulateResponse>} */
Protocol.EmulationAgent.prototype.invoke_canEmulate = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.clearDeviceMetricsOverride = function () {};
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.ClearDeviceMetricsOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.ClearDeviceMetricsOverrideResponse;
/**
 * @param {!Protocol.EmulationAgent.ClearDeviceMetricsOverrideRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.ClearDeviceMetricsOverrideResponse>} */
Protocol.EmulationAgent.prototype.invoke_clearDeviceMetricsOverride = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.clearGeolocationOverride = function () {};
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.ClearGeolocationOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.ClearGeolocationOverrideResponse;
/**
 * @param {!Protocol.EmulationAgent.ClearGeolocationOverrideRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.ClearGeolocationOverrideResponse>} */
Protocol.EmulationAgent.prototype.invoke_clearGeolocationOverride = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.resetPageScaleFactor = function () {};
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.ResetPageScaleFactorRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.ResetPageScaleFactorResponse;
/**
 * @param {!Protocol.EmulationAgent.ResetPageScaleFactorRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.ResetPageScaleFactorResponse>} */
Protocol.EmulationAgent.prototype.invoke_resetPageScaleFactor = function (obj) {};

/**
 * @param {boolean} enabled
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setFocusEmulationEnabled = function (enabled) {};
/** @typedef {!{enabled: boolean}} */
Protocol.EmulationAgent.SetFocusEmulationEnabledRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetFocusEmulationEnabledResponse;
/**
 * @param {!Protocol.EmulationAgent.SetFocusEmulationEnabledRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetFocusEmulationEnabledResponse>} */
Protocol.EmulationAgent.prototype.invoke_setFocusEmulationEnabled = function (obj) {};

/**
 * @param {number} rate
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setCPUThrottlingRate = function (rate) {};
/** @typedef {!{rate: number}} */
Protocol.EmulationAgent.SetCPUThrottlingRateRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetCPUThrottlingRateResponse;
/**
 * @param {!Protocol.EmulationAgent.SetCPUThrottlingRateRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetCPUThrottlingRateResponse>} */
Protocol.EmulationAgent.prototype.invoke_setCPUThrottlingRate = function (obj) {};

/**
 * @param {Protocol.DOM.RGBA=} opt_color
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setDefaultBackgroundColorOverride = function (opt_color) {};
/** @typedef {!{color: (Protocol.DOM.RGBA|undefined)}} */
Protocol.EmulationAgent.SetDefaultBackgroundColorOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetDefaultBackgroundColorOverrideResponse;
/**
 * @param {!Protocol.EmulationAgent.SetDefaultBackgroundColorOverrideRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetDefaultBackgroundColorOverrideResponse>} */
Protocol.EmulationAgent.prototype.invoke_setDefaultBackgroundColorOverride = function (obj) {};

/**
 * @param {number} width
 * @param {number} height
 * @param {number} deviceScaleFactor
 * @param {boolean} mobile
 * @param {number=} opt_scale
 * @param {number=} opt_screenWidth
 * @param {number=} opt_screenHeight
 * @param {number=} opt_positionX
 * @param {number=} opt_positionY
 * @param {boolean=} opt_dontSetVisibleSize
 * @param {Protocol.Emulation.ScreenOrientation=} opt_screenOrientation
 * @param {Protocol.Page.Viewport=} opt_viewport
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setDeviceMetricsOverride = function (
  width,
  height,
  deviceScaleFactor,
  mobile,
  opt_scale,
  opt_screenWidth,
  opt_screenHeight,
  opt_positionX,
  opt_positionY,
  opt_dontSetVisibleSize,
  opt_screenOrientation,
  opt_viewport,
) {};
/** @typedef {!{deviceScaleFactor: number, positionX: (number|undefined), scale: (number|undefined), screenHeight: (number|undefined), mobile: boolean, screenOrientation: (Protocol.Emulation.ScreenOrientation|undefined), dontSetVisibleSize: (boolean|undefined), height: number, width: number, positionY: (number|undefined), screenWidth: (number|undefined), viewport: (Protocol.Page.Viewport|undefined)}} */
Protocol.EmulationAgent.SetDeviceMetricsOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetDeviceMetricsOverrideResponse;
/**
 * @param {!Protocol.EmulationAgent.SetDeviceMetricsOverrideRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetDeviceMetricsOverrideResponse>} */
Protocol.EmulationAgent.prototype.invoke_setDeviceMetricsOverride = function (obj) {};

/**
 * @param {boolean} hidden
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setScrollbarsHidden = function (hidden) {};
/** @typedef {!{hidden: boolean}} */
Protocol.EmulationAgent.SetScrollbarsHiddenRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetScrollbarsHiddenResponse;
/**
 * @param {!Protocol.EmulationAgent.SetScrollbarsHiddenRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetScrollbarsHiddenResponse>} */
Protocol.EmulationAgent.prototype.invoke_setScrollbarsHidden = function (obj) {};

/**
 * @param {boolean} disabled
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setDocumentCookieDisabled = function (disabled) {};
/** @typedef {!{disabled: boolean}} */
Protocol.EmulationAgent.SetDocumentCookieDisabledRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetDocumentCookieDisabledResponse;
/**
 * @param {!Protocol.EmulationAgent.SetDocumentCookieDisabledRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetDocumentCookieDisabledResponse>} */
Protocol.EmulationAgent.prototype.invoke_setDocumentCookieDisabled = function (obj) {};

/**
 * @param {boolean} enabled
 * @param {string=} opt_configuration
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setEmitTouchEventsForMouse = function (enabled, opt_configuration) {};
/** @typedef {!{configuration: (string|undefined), enabled: boolean}} */
Protocol.EmulationAgent.SetEmitTouchEventsForMouseRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetEmitTouchEventsForMouseResponse;
/**
 * @param {!Protocol.EmulationAgent.SetEmitTouchEventsForMouseRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetEmitTouchEventsForMouseResponse>} */
Protocol.EmulationAgent.prototype.invoke_setEmitTouchEventsForMouse = function (obj) {};

/**
 * @param {string=} opt_media
 * @param {!Array<Protocol.Emulation.MediaFeature>=} opt_features
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setEmulatedMedia = function (opt_media, opt_features) {};
/** @typedef {!{media: (string|undefined), features: (!Array<Protocol.Emulation.MediaFeature>|undefined)}} */
Protocol.EmulationAgent.SetEmulatedMediaRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetEmulatedMediaResponse;
/**
 * @param {!Protocol.EmulationAgent.SetEmulatedMediaRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetEmulatedMediaResponse>} */
Protocol.EmulationAgent.prototype.invoke_setEmulatedMedia = function (obj) {};

/**
 * @param {number=} opt_latitude
 * @param {number=} opt_longitude
 * @param {number=} opt_accuracy
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setGeolocationOverride = function (opt_latitude, opt_longitude, opt_accuracy) {};
/** @typedef {!{latitude: (number|undefined), longitude: (number|undefined), accuracy: (number|undefined)}} */
Protocol.EmulationAgent.SetGeolocationOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetGeolocationOverrideResponse;
/**
 * @param {!Protocol.EmulationAgent.SetGeolocationOverrideRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetGeolocationOverrideResponse>} */
Protocol.EmulationAgent.prototype.invoke_setGeolocationOverride = function (obj) {};

/**
 * @param {string} platform
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setNavigatorOverrides = function (platform) {};
/** @typedef {!{platform: string}} */
Protocol.EmulationAgent.SetNavigatorOverridesRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetNavigatorOverridesResponse;
/**
 * @param {!Protocol.EmulationAgent.SetNavigatorOverridesRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetNavigatorOverridesResponse>} */
Protocol.EmulationAgent.prototype.invoke_setNavigatorOverrides = function (obj) {};

/**
 * @param {number} pageScaleFactor
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setPageScaleFactor = function (pageScaleFactor) {};
/** @typedef {!{pageScaleFactor: number}} */
Protocol.EmulationAgent.SetPageScaleFactorRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetPageScaleFactorResponse;
/**
 * @param {!Protocol.EmulationAgent.SetPageScaleFactorRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetPageScaleFactorResponse>} */
Protocol.EmulationAgent.prototype.invoke_setPageScaleFactor = function (obj) {};

/**
 * @param {boolean} value
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setScriptExecutionDisabled = function (value) {};
/** @typedef {!{value: boolean}} */
Protocol.EmulationAgent.SetScriptExecutionDisabledRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetScriptExecutionDisabledResponse;
/**
 * @param {!Protocol.EmulationAgent.SetScriptExecutionDisabledRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetScriptExecutionDisabledResponse>} */
Protocol.EmulationAgent.prototype.invoke_setScriptExecutionDisabled = function (obj) {};

/**
 * @param {boolean} enabled
 * @param {number=} opt_maxTouchPoints
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setTouchEmulationEnabled = function (enabled, opt_maxTouchPoints) {};
/** @typedef {!{maxTouchPoints: (number|undefined), enabled: boolean}} */
Protocol.EmulationAgent.SetTouchEmulationEnabledRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetTouchEmulationEnabledResponse;
/**
 * @param {!Protocol.EmulationAgent.SetTouchEmulationEnabledRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetTouchEmulationEnabledResponse>} */
Protocol.EmulationAgent.prototype.invoke_setTouchEmulationEnabled = function (obj) {};

/**
 * @param {Protocol.Emulation.VirtualTimePolicy} policy
 * @param {number=} opt_budget
 * @param {number=} opt_maxVirtualTimeTaskStarvationCount
 * @param {boolean=} opt_waitForNavigation
 * @param {Protocol.Network.TimeSinceEpoch=} opt_initialVirtualTime
 * @return {!Promise<?number>}
 */
Protocol.EmulationAgent.prototype.setVirtualTimePolicy = function (
  policy,
  opt_budget,
  opt_maxVirtualTimeTaskStarvationCount,
  opt_waitForNavigation,
  opt_initialVirtualTime,
) {};
/** @typedef {!{policy: Protocol.Emulation.VirtualTimePolicy, initialVirtualTime: (Protocol.Network.TimeSinceEpoch|undefined), maxVirtualTimeTaskStarvationCount: (number|undefined), waitForNavigation: (boolean|undefined), budget: (number|undefined)}} */
Protocol.EmulationAgent.SetVirtualTimePolicyRequest;
/** @typedef {!{virtualTimeTicksBase: number}} */
Protocol.EmulationAgent.SetVirtualTimePolicyResponse;
/**
 * @param {!Protocol.EmulationAgent.SetVirtualTimePolicyRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetVirtualTimePolicyResponse>} */
Protocol.EmulationAgent.prototype.invoke_setVirtualTimePolicy = function (obj) {};

/**
 * @param {string} timezoneId
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setTimezoneOverride = function (timezoneId) {};
/** @typedef {!{timezoneId: string}} */
Protocol.EmulationAgent.SetTimezoneOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetTimezoneOverrideResponse;
/**
 * @param {!Protocol.EmulationAgent.SetTimezoneOverrideRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetTimezoneOverrideResponse>} */
Protocol.EmulationAgent.prototype.invoke_setTimezoneOverride = function (obj) {};

/**
 * @param {number} width
 * @param {number} height
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setVisibleSize = function (width, height) {};
/** @typedef {!{width: number, height: number}} */
Protocol.EmulationAgent.SetVisibleSizeRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetVisibleSizeResponse;
/**
 * @param {!Protocol.EmulationAgent.SetVisibleSizeRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetVisibleSizeResponse>} */
Protocol.EmulationAgent.prototype.invoke_setVisibleSize = function (obj) {};

/**
 * @param {string} userAgent
 * @param {string=} opt_acceptLanguage
 * @param {string=} opt_platform
 * @return {!Promise<undefined>}
 */
Protocol.EmulationAgent.prototype.setUserAgentOverride = function (userAgent, opt_acceptLanguage, opt_platform) {};
/** @typedef {!{acceptLanguage: (string|undefined), userAgent: string, platform: (string|undefined)}} */
Protocol.EmulationAgent.SetUserAgentOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.EmulationAgent.SetUserAgentOverrideResponse;
/**
 * @param {!Protocol.EmulationAgent.SetUserAgentOverrideRequest} obj
 * @return {!Promise<!Protocol.EmulationAgent.SetUserAgentOverrideResponse>} */
Protocol.EmulationAgent.prototype.invoke_setUserAgentOverride = function (obj) {};

/** @enum {string} */
Protocol.Emulation.ScreenOrientationType = {
  PortraitPrimary: 'portraitPrimary',
  PortraitSecondary: 'portraitSecondary',
  LandscapePrimary: 'landscapePrimary',
  LandscapeSecondary: 'landscapeSecondary',
};

/** @typedef {!{type:(Protocol.Emulation.ScreenOrientationType), angle:(number)}} */
Protocol.Emulation.ScreenOrientation;

/** @typedef {!{name:(string), value:(string)}} */
Protocol.Emulation.MediaFeature;

/** @enum {string} */
Protocol.Emulation.VirtualTimePolicy = {
  Advance: 'advance',
  Pause: 'pause',
  PauseIfNetworkFetchesPending: 'pauseIfNetworkFetchesPending',
};
/** @interface */
Protocol.EmulationDispatcher = function () {};
Protocol.EmulationDispatcher.prototype.virtualTimeBudgetExpired = function () {};
Protocol.HeadlessExperimental = {};

/**
 * @constructor
 */
Protocol.HeadlessExperimentalAgent = function () {};

/**
 * @param {number=} opt_frameTimeTicks
 * @param {number=} opt_interval
 * @param {boolean=} opt_noDisplayUpdates
 * @param {Protocol.HeadlessExperimental.ScreenshotParams=} opt_screenshot
 * @return {!Promise<?boolean>}
 */
Protocol.HeadlessExperimentalAgent.prototype.beginFrame = function (
  opt_frameTimeTicks,
  opt_interval,
  opt_noDisplayUpdates,
  opt_screenshot,
) {};
/** @typedef {!{interval: (number|undefined), frameTimeTicks: (number|undefined), noDisplayUpdates: (boolean|undefined), screenshot: (Protocol.HeadlessExperimental.ScreenshotParams|undefined)}} */
Protocol.HeadlessExperimentalAgent.BeginFrameRequest;
/** @typedef {!{hasDamage: boolean, screenshotData: string}} */
Protocol.HeadlessExperimentalAgent.BeginFrameResponse;
/**
 * @param {!Protocol.HeadlessExperimentalAgent.BeginFrameRequest} obj
 * @return {!Promise<!Protocol.HeadlessExperimentalAgent.BeginFrameResponse>} */
Protocol.HeadlessExperimentalAgent.prototype.invoke_beginFrame = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.HeadlessExperimentalAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.HeadlessExperimentalAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.HeadlessExperimentalAgent.DisableResponse;
/**
 * @param {!Protocol.HeadlessExperimentalAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.HeadlessExperimentalAgent.DisableResponse>} */
Protocol.HeadlessExperimentalAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.HeadlessExperimentalAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.HeadlessExperimentalAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.HeadlessExperimentalAgent.EnableResponse;
/**
 * @param {!Protocol.HeadlessExperimentalAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.HeadlessExperimentalAgent.EnableResponse>} */
Protocol.HeadlessExperimentalAgent.prototype.invoke_enable = function (obj) {};

/** @enum {string} */
Protocol.HeadlessExperimental.ScreenshotParamsFormat = {
  Jpeg: 'jpeg',
  Png: 'png',
};

/** @typedef {!{format:(Protocol.HeadlessExperimental.ScreenshotParamsFormat|undefined), quality:(number|undefined)}} */
Protocol.HeadlessExperimental.ScreenshotParams;
/** @interface */
Protocol.HeadlessExperimentalDispatcher = function () {};
/**
 * @param {boolean} needsBeginFrames
 */
Protocol.HeadlessExperimentalDispatcher.prototype.needsBeginFramesChanged = function (needsBeginFrames) {};
Protocol.IO = {};

/**
 * @constructor
 */
Protocol.IOAgent = function () {};

/**
 * @param {Protocol.IO.StreamHandle} handle
 * @return {!Promise<undefined>}
 */
Protocol.IOAgent.prototype.close = function (handle) {};
/** @typedef {!{handle: Protocol.IO.StreamHandle}} */
Protocol.IOAgent.CloseRequest;
/** @typedef {Object|undefined} */
Protocol.IOAgent.CloseResponse;
/**
 * @param {!Protocol.IOAgent.CloseRequest} obj
 * @return {!Promise<!Protocol.IOAgent.CloseResponse>} */
Protocol.IOAgent.prototype.invoke_close = function (obj) {};

/**
 * @param {Protocol.IO.StreamHandle} handle
 * @param {number=} opt_offset
 * @param {number=} opt_size
 * @return {!Promise<?boolean>}
 */
Protocol.IOAgent.prototype.read = function (handle, opt_offset, opt_size) {};
/** @typedef {!{size: (number|undefined), handle: Protocol.IO.StreamHandle, offset: (number|undefined)}} */
Protocol.IOAgent.ReadRequest;
/** @typedef {!{data: string, base64Encoded: boolean, eof: boolean}} */
Protocol.IOAgent.ReadResponse;
/**
 * @param {!Protocol.IOAgent.ReadRequest} obj
 * @return {!Promise<!Protocol.IOAgent.ReadResponse>} */
Protocol.IOAgent.prototype.invoke_read = function (obj) {};

/**
 * @param {Protocol.Runtime.RemoteObjectId} objectId
 * @return {!Promise<?string>}
 */
Protocol.IOAgent.prototype.resolveBlob = function (objectId) {};
/** @typedef {!{objectId: Protocol.Runtime.RemoteObjectId}} */
Protocol.IOAgent.ResolveBlobRequest;
/** @typedef {!{uuid: string}} */
Protocol.IOAgent.ResolveBlobResponse;
/**
 * @param {!Protocol.IOAgent.ResolveBlobRequest} obj
 * @return {!Promise<!Protocol.IOAgent.ResolveBlobResponse>} */
Protocol.IOAgent.prototype.invoke_resolveBlob = function (obj) {};

/** @typedef {string} */
Protocol.IO.StreamHandle;
/** @interface */
Protocol.IODispatcher = function () {};
Protocol.IndexedDB = {};

/**
 * @constructor
 */
Protocol.IndexedDBAgent = function () {};

/**
 * @param {string} securityOrigin
 * @param {string} databaseName
 * @param {string} objectStoreName
 * @return {!Promise<undefined>}
 */
Protocol.IndexedDBAgent.prototype.clearObjectStore = function (securityOrigin, databaseName, objectStoreName) {};
/** @typedef {!{objectStoreName: string, databaseName: string, securityOrigin: string}} */
Protocol.IndexedDBAgent.ClearObjectStoreRequest;
/** @typedef {Object|undefined} */
Protocol.IndexedDBAgent.ClearObjectStoreResponse;
/**
 * @param {!Protocol.IndexedDBAgent.ClearObjectStoreRequest} obj
 * @return {!Promise<!Protocol.IndexedDBAgent.ClearObjectStoreResponse>} */
Protocol.IndexedDBAgent.prototype.invoke_clearObjectStore = function (obj) {};

/**
 * @param {string} securityOrigin
 * @param {string} databaseName
 * @return {!Promise<undefined>}
 */
Protocol.IndexedDBAgent.prototype.deleteDatabase = function (securityOrigin, databaseName) {};
/** @typedef {!{databaseName: string, securityOrigin: string}} */
Protocol.IndexedDBAgent.DeleteDatabaseRequest;
/** @typedef {Object|undefined} */
Protocol.IndexedDBAgent.DeleteDatabaseResponse;
/**
 * @param {!Protocol.IndexedDBAgent.DeleteDatabaseRequest} obj
 * @return {!Promise<!Protocol.IndexedDBAgent.DeleteDatabaseResponse>} */
Protocol.IndexedDBAgent.prototype.invoke_deleteDatabase = function (obj) {};

/**
 * @param {string} securityOrigin
 * @param {string} databaseName
 * @param {string} objectStoreName
 * @param {Protocol.IndexedDB.KeyRange} keyRange
 * @return {!Promise<undefined>}
 */
Protocol.IndexedDBAgent.prototype.deleteObjectStoreEntries = function (
  securityOrigin,
  databaseName,
  objectStoreName,
  keyRange,
) {};
/** @typedef {!{objectStoreName: string, keyRange: Protocol.IndexedDB.KeyRange, databaseName: string, securityOrigin: string}} */
Protocol.IndexedDBAgent.DeleteObjectStoreEntriesRequest;
/** @typedef {Object|undefined} */
Protocol.IndexedDBAgent.DeleteObjectStoreEntriesResponse;
/**
 * @param {!Protocol.IndexedDBAgent.DeleteObjectStoreEntriesRequest} obj
 * @return {!Promise<!Protocol.IndexedDBAgent.DeleteObjectStoreEntriesResponse>} */
Protocol.IndexedDBAgent.prototype.invoke_deleteObjectStoreEntries = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.IndexedDBAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.IndexedDBAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.IndexedDBAgent.DisableResponse;
/**
 * @param {!Protocol.IndexedDBAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.IndexedDBAgent.DisableResponse>} */
Protocol.IndexedDBAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.IndexedDBAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.IndexedDBAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.IndexedDBAgent.EnableResponse;
/**
 * @param {!Protocol.IndexedDBAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.IndexedDBAgent.EnableResponse>} */
Protocol.IndexedDBAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {string} securityOrigin
 * @param {string} databaseName
 * @param {string} objectStoreName
 * @param {string} indexName
 * @param {number} skipCount
 * @param {number} pageSize
 * @param {Protocol.IndexedDB.KeyRange=} opt_keyRange
 * @return {!Promise<?Array<Protocol.IndexedDB.DataEntry>>}
 */
Protocol.IndexedDBAgent.prototype.requestData = function (
  securityOrigin,
  databaseName,
  objectStoreName,
  indexName,
  skipCount,
  pageSize,
  opt_keyRange,
) {};
/** @typedef {!{indexName: string, pageSize: number, objectStoreName: string, skipCount: number, keyRange: (Protocol.IndexedDB.KeyRange|undefined), databaseName: string, securityOrigin: string}} */
Protocol.IndexedDBAgent.RequestDataRequest;
/** @typedef {!{hasMore: boolean, objectStoreDataEntries: !Array<Protocol.IndexedDB.DataEntry>}} */
Protocol.IndexedDBAgent.RequestDataResponse;
/**
 * @param {!Protocol.IndexedDBAgent.RequestDataRequest} obj
 * @return {!Promise<!Protocol.IndexedDBAgent.RequestDataResponse>} */
Protocol.IndexedDBAgent.prototype.invoke_requestData = function (obj) {};

/**
 * @param {string} securityOrigin
 * @param {string} databaseName
 * @param {string} objectStoreName
 * @return {!Promise<?number>}
 */
Protocol.IndexedDBAgent.prototype.getMetadata = function (securityOrigin, databaseName, objectStoreName) {};
/** @typedef {!{objectStoreName: string, databaseName: string, securityOrigin: string}} */
Protocol.IndexedDBAgent.GetMetadataRequest;
/** @typedef {!{entriesCount: number, keyGeneratorValue: number}} */
Protocol.IndexedDBAgent.GetMetadataResponse;
/**
 * @param {!Protocol.IndexedDBAgent.GetMetadataRequest} obj
 * @return {!Promise<!Protocol.IndexedDBAgent.GetMetadataResponse>} */
Protocol.IndexedDBAgent.prototype.invoke_getMetadata = function (obj) {};

/**
 * @param {string} securityOrigin
 * @param {string} databaseName
 * @return {!Promise<?Protocol.IndexedDB.DatabaseWithObjectStores>}
 */
Protocol.IndexedDBAgent.prototype.requestDatabase = function (securityOrigin, databaseName) {};
/** @typedef {!{databaseName: string, securityOrigin: string}} */
Protocol.IndexedDBAgent.RequestDatabaseRequest;
/** @typedef {!{databaseWithObjectStores: Protocol.IndexedDB.DatabaseWithObjectStores}} */
Protocol.IndexedDBAgent.RequestDatabaseResponse;
/**
 * @param {!Protocol.IndexedDBAgent.RequestDatabaseRequest} obj
 * @return {!Promise<!Protocol.IndexedDBAgent.RequestDatabaseResponse>} */
Protocol.IndexedDBAgent.prototype.invoke_requestDatabase = function (obj) {};

/**
 * @param {string} securityOrigin
 * @return {!Promise<?Array<string>>}
 */
Protocol.IndexedDBAgent.prototype.requestDatabaseNames = function (securityOrigin) {};
/** @typedef {!{securityOrigin: string}} */
Protocol.IndexedDBAgent.RequestDatabaseNamesRequest;
/** @typedef {!{databaseNames: !Array<string>}} */
Protocol.IndexedDBAgent.RequestDatabaseNamesResponse;
/**
 * @param {!Protocol.IndexedDBAgent.RequestDatabaseNamesRequest} obj
 * @return {!Promise<!Protocol.IndexedDBAgent.RequestDatabaseNamesResponse>} */
Protocol.IndexedDBAgent.prototype.invoke_requestDatabaseNames = function (obj) {};

/** @typedef {!{name:(string), version:(number), objectStores:(!Array<Protocol.IndexedDB.ObjectStore>)}} */
Protocol.IndexedDB.DatabaseWithObjectStores;

/** @typedef {!{name:(string), keyPath:(Protocol.IndexedDB.KeyPath), autoIncrement:(boolean), indexes:(!Array<Protocol.IndexedDB.ObjectStoreIndex>)}} */
Protocol.IndexedDB.ObjectStore;

/** @typedef {!{name:(string), keyPath:(Protocol.IndexedDB.KeyPath), unique:(boolean), multiEntry:(boolean)}} */
Protocol.IndexedDB.ObjectStoreIndex;

/** @enum {string} */
Protocol.IndexedDB.KeyType = {
  Number: 'number',
  String: 'string',
  Date: 'date',
  Array: 'array',
};

/** @typedef {!{type:(Protocol.IndexedDB.KeyType), number:(number|undefined), string:(string|undefined), date:(number|undefined), array:(!Array<Protocol.IndexedDB.Key>|undefined)}} */
Protocol.IndexedDB.Key;

/** @typedef {!{lower:(Protocol.IndexedDB.Key|undefined), upper:(Protocol.IndexedDB.Key|undefined), lowerOpen:(boolean), upperOpen:(boolean)}} */
Protocol.IndexedDB.KeyRange;

/** @typedef {!{key:(Protocol.Runtime.RemoteObject), primaryKey:(Protocol.Runtime.RemoteObject), value:(Protocol.Runtime.RemoteObject)}} */
Protocol.IndexedDB.DataEntry;

/** @enum {string} */
Protocol.IndexedDB.KeyPathType = {
  Null: 'null',
  String: 'string',
  Array: 'array',
};

/** @typedef {!{type:(Protocol.IndexedDB.KeyPathType), string:(string|undefined), array:(!Array<string>|undefined)}} */
Protocol.IndexedDB.KeyPath;
/** @interface */
Protocol.IndexedDBDispatcher = function () {};
Protocol.Input = {};

/**
 * @constructor
 */
Protocol.InputAgent = function () {};

/**
 * @param {string} type
 * @param {number=} opt_modifiers
 * @param {Protocol.Input.TimeSinceEpoch=} opt_timestamp
 * @param {string=} opt_text
 * @param {string=} opt_unmodifiedText
 * @param {string=} opt_keyIdentifier
 * @param {string=} opt_code
 * @param {string=} opt_key
 * @param {number=} opt_windowsVirtualKeyCode
 * @param {number=} opt_nativeVirtualKeyCode
 * @param {boolean=} opt_autoRepeat
 * @param {boolean=} opt_isKeypad
 * @param {boolean=} opt_isSystemKey
 * @param {number=} opt_location
 * @return {!Promise<undefined>}
 */
Protocol.InputAgent.prototype.dispatchKeyEvent = function (
  type,
  opt_modifiers,
  opt_timestamp,
  opt_text,
  opt_unmodifiedText,
  opt_keyIdentifier,
  opt_code,
  opt_key,
  opt_windowsVirtualKeyCode,
  opt_nativeVirtualKeyCode,
  opt_autoRepeat,
  opt_isKeypad,
  opt_isSystemKey,
  opt_location,
) {};
/** @typedef {!{code: (string|undefined), keyIdentifier: (string|undefined), modifiers: (number|undefined), timestamp: (Protocol.Input.TimeSinceEpoch|undefined), autoRepeat: (boolean|undefined), isSystemKey: (boolean|undefined), unmodifiedText: (string|undefined), location: (number|undefined), key: (string|undefined), text: (string|undefined), nativeVirtualKeyCode: (number|undefined), windowsVirtualKeyCode: (number|undefined), type: string, isKeypad: (boolean|undefined)}} */
Protocol.InputAgent.DispatchKeyEventRequest;
/** @typedef {Object|undefined} */
Protocol.InputAgent.DispatchKeyEventResponse;
/**
 * @param {!Protocol.InputAgent.DispatchKeyEventRequest} obj
 * @return {!Promise<!Protocol.InputAgent.DispatchKeyEventResponse>} */
Protocol.InputAgent.prototype.invoke_dispatchKeyEvent = function (obj) {};

/**
 * @param {string} text
 * @return {!Promise<undefined>}
 */
Protocol.InputAgent.prototype.insertText = function (text) {};
/** @typedef {!{text: string}} */
Protocol.InputAgent.InsertTextRequest;
/** @typedef {Object|undefined} */
Protocol.InputAgent.InsertTextResponse;
/**
 * @param {!Protocol.InputAgent.InsertTextRequest} obj
 * @return {!Promise<!Protocol.InputAgent.InsertTextResponse>} */
Protocol.InputAgent.prototype.invoke_insertText = function (obj) {};

/**
 * @param {string} type
 * @param {number} x
 * @param {number} y
 * @param {number=} opt_modifiers
 * @param {Protocol.Input.TimeSinceEpoch=} opt_timestamp
 * @param {string=} opt_button
 * @param {number=} opt_buttons
 * @param {number=} opt_clickCount
 * @param {number=} opt_deltaX
 * @param {number=} opt_deltaY
 * @param {string=} opt_pointerType
 * @return {!Promise<undefined>}
 */
Protocol.InputAgent.prototype.dispatchMouseEvent = function (
  type,
  x,
  y,
  opt_modifiers,
  opt_timestamp,
  opt_button,
  opt_buttons,
  opt_clickCount,
  opt_deltaX,
  opt_deltaY,
  opt_pointerType,
) {};
/** @typedef {!{modifiers: (number|undefined), clickCount: (number|undefined), deltaX: (number|undefined), timestamp: (Protocol.Input.TimeSinceEpoch|undefined), button: (string|undefined), buttons: (number|undefined), pointerType: (string|undefined), deltaY: (number|undefined), y: number, x: number, type: string}} */
Protocol.InputAgent.DispatchMouseEventRequest;
/** @typedef {Object|undefined} */
Protocol.InputAgent.DispatchMouseEventResponse;
/**
 * @param {!Protocol.InputAgent.DispatchMouseEventRequest} obj
 * @return {!Promise<!Protocol.InputAgent.DispatchMouseEventResponse>} */
Protocol.InputAgent.prototype.invoke_dispatchMouseEvent = function (obj) {};

/**
 * @param {string} type
 * @param {!Array<Protocol.Input.TouchPoint>} touchPoints
 * @param {number=} opt_modifiers
 * @param {Protocol.Input.TimeSinceEpoch=} opt_timestamp
 * @return {!Promise<undefined>}
 */
Protocol.InputAgent.prototype.dispatchTouchEvent = function (type, touchPoints, opt_modifiers, opt_timestamp) {};
/** @typedef {!{timestamp: (Protocol.Input.TimeSinceEpoch|undefined), modifiers: (number|undefined), type: string, touchPoints: !Array<Protocol.Input.TouchPoint>}} */
Protocol.InputAgent.DispatchTouchEventRequest;
/** @typedef {Object|undefined} */
Protocol.InputAgent.DispatchTouchEventResponse;
/**
 * @param {!Protocol.InputAgent.DispatchTouchEventRequest} obj
 * @return {!Promise<!Protocol.InputAgent.DispatchTouchEventResponse>} */
Protocol.InputAgent.prototype.invoke_dispatchTouchEvent = function (obj) {};

/**
 * @param {string} type
 * @param {number} x
 * @param {number} y
 * @param {string} button
 * @param {Protocol.Input.TimeSinceEpoch=} opt_timestamp
 * @param {number=} opt_deltaX
 * @param {number=} opt_deltaY
 * @param {number=} opt_modifiers
 * @param {number=} opt_clickCount
 * @return {!Promise<undefined>}
 */
Protocol.InputAgent.prototype.emulateTouchFromMouseEvent = function (
  type,
  x,
  y,
  button,
  opt_timestamp,
  opt_deltaX,
  opt_deltaY,
  opt_modifiers,
  opt_clickCount,
) {};
/** @typedef {!{modifiers: (number|undefined), clickCount: (number|undefined), deltaX: (number|undefined), timestamp: (Protocol.Input.TimeSinceEpoch|undefined), button: string, deltaY: (number|undefined), y: number, x: number, type: string}} */
Protocol.InputAgent.EmulateTouchFromMouseEventRequest;
/** @typedef {Object|undefined} */
Protocol.InputAgent.EmulateTouchFromMouseEventResponse;
/**
 * @param {!Protocol.InputAgent.EmulateTouchFromMouseEventRequest} obj
 * @return {!Promise<!Protocol.InputAgent.EmulateTouchFromMouseEventResponse>} */
Protocol.InputAgent.prototype.invoke_emulateTouchFromMouseEvent = function (obj) {};

/**
 * @param {boolean} ignore
 * @return {!Promise<undefined>}
 */
Protocol.InputAgent.prototype.setIgnoreInputEvents = function (ignore) {};
/** @typedef {!{ignore: boolean}} */
Protocol.InputAgent.SetIgnoreInputEventsRequest;
/** @typedef {Object|undefined} */
Protocol.InputAgent.SetIgnoreInputEventsResponse;
/**
 * @param {!Protocol.InputAgent.SetIgnoreInputEventsRequest} obj
 * @return {!Promise<!Protocol.InputAgent.SetIgnoreInputEventsResponse>} */
Protocol.InputAgent.prototype.invoke_setIgnoreInputEvents = function (obj) {};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} scaleFactor
 * @param {number=} opt_relativeSpeed
 * @param {Protocol.Input.GestureSourceType=} opt_gestureSourceType
 * @return {!Promise<undefined>}
 */
Protocol.InputAgent.prototype.synthesizePinchGesture = function (
  x,
  y,
  scaleFactor,
  opt_relativeSpeed,
  opt_gestureSourceType,
) {};
/** @typedef {!{y: number, x: number, gestureSourceType: (Protocol.Input.GestureSourceType|undefined), relativeSpeed: (number|undefined), scaleFactor: number}} */
Protocol.InputAgent.SynthesizePinchGestureRequest;
/** @typedef {Object|undefined} */
Protocol.InputAgent.SynthesizePinchGestureResponse;
/**
 * @param {!Protocol.InputAgent.SynthesizePinchGestureRequest} obj
 * @return {!Promise<!Protocol.InputAgent.SynthesizePinchGestureResponse>} */
Protocol.InputAgent.prototype.invoke_synthesizePinchGesture = function (obj) {};

/**
 * @param {number} x
 * @param {number} y
 * @param {number=} opt_xDistance
 * @param {number=} opt_yDistance
 * @param {number=} opt_xOverscroll
 * @param {number=} opt_yOverscroll
 * @param {boolean=} opt_preventFling
 * @param {number=} opt_speed
 * @param {Protocol.Input.GestureSourceType=} opt_gestureSourceType
 * @param {number=} opt_repeatCount
 * @param {number=} opt_repeatDelayMs
 * @param {string=} opt_interactionMarkerName
 * @return {!Promise<undefined>}
 */
Protocol.InputAgent.prototype.synthesizeScrollGesture = function (
  x,
  y,
  opt_xDistance,
  opt_yDistance,
  opt_xOverscroll,
  opt_yOverscroll,
  opt_preventFling,
  opt_speed,
  opt_gestureSourceType,
  opt_repeatCount,
  opt_repeatDelayMs,
  opt_interactionMarkerName,
) {};
/** @typedef {!{xOverscroll: (number|undefined), yOverscroll: (number|undefined), preventFling: (boolean|undefined), yDistance: (number|undefined), interactionMarkerName: (string|undefined), xDistance: (number|undefined), repeatCount: (number|undefined), gestureSourceType: (Protocol.Input.GestureSourceType|undefined), repeatDelayMs: (number|undefined), y: number, x: number, speed: (number|undefined)}} */
Protocol.InputAgent.SynthesizeScrollGestureRequest;
/** @typedef {Object|undefined} */
Protocol.InputAgent.SynthesizeScrollGestureResponse;
/**
 * @param {!Protocol.InputAgent.SynthesizeScrollGestureRequest} obj
 * @return {!Promise<!Protocol.InputAgent.SynthesizeScrollGestureResponse>} */
Protocol.InputAgent.prototype.invoke_synthesizeScrollGesture = function (obj) {};

/**
 * @param {number} x
 * @param {number} y
 * @param {number=} opt_duration
 * @param {number=} opt_tapCount
 * @param {Protocol.Input.GestureSourceType=} opt_gestureSourceType
 * @return {!Promise<undefined>}
 */
Protocol.InputAgent.prototype.synthesizeTapGesture = function (
  x,
  y,
  opt_duration,
  opt_tapCount,
  opt_gestureSourceType,
) {};
/** @typedef {!{y: number, x: number, duration: (number|undefined), gestureSourceType: (Protocol.Input.GestureSourceType|undefined), tapCount: (number|undefined)}} */
Protocol.InputAgent.SynthesizeTapGestureRequest;
/** @typedef {Object|undefined} */
Protocol.InputAgent.SynthesizeTapGestureResponse;
/**
 * @param {!Protocol.InputAgent.SynthesizeTapGestureRequest} obj
 * @return {!Promise<!Protocol.InputAgent.SynthesizeTapGestureResponse>} */
Protocol.InputAgent.prototype.invoke_synthesizeTapGesture = function (obj) {};

/** @typedef {!{x:(number), y:(number), radiusX:(number|undefined), radiusY:(number|undefined), rotationAngle:(number|undefined), force:(number|undefined), id:(number|undefined)}} */
Protocol.Input.TouchPoint;

/** @enum {string} */
Protocol.Input.GestureSourceType = {
  Default: 'default',
  Touch: 'touch',
  Mouse: 'mouse',
};

/** @typedef {number} */
Protocol.Input.TimeSinceEpoch;
/** @interface */
Protocol.InputDispatcher = function () {};
Protocol.Inspector = {};

/**
 * @constructor
 */
Protocol.InspectorAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.InspectorAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.InspectorAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.InspectorAgent.DisableResponse;
/**
 * @param {!Protocol.InspectorAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.InspectorAgent.DisableResponse>} */
Protocol.InspectorAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.InspectorAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.InspectorAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.InspectorAgent.EnableResponse;
/**
 * @param {!Protocol.InspectorAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.InspectorAgent.EnableResponse>} */
Protocol.InspectorAgent.prototype.invoke_enable = function (obj) {};
/** @interface */
Protocol.InspectorDispatcher = function () {};
/**
 * @param {string} reason
 */
Protocol.InspectorDispatcher.prototype.detached = function (reason) {};
Protocol.InspectorDispatcher.prototype.targetCrashed = function () {};
Protocol.InspectorDispatcher.prototype.targetReloadedAfterCrash = function () {};
Protocol.LayerTree = {};

/**
 * @constructor
 */
Protocol.LayerTreeAgent = function () {};

/**
 * @param {Protocol.LayerTree.LayerId} layerId
 * @return {!Promise<?Array<string>>}
 */
Protocol.LayerTreeAgent.prototype.compositingReasons = function (layerId) {};
/** @typedef {!{layerId: Protocol.LayerTree.LayerId}} */
Protocol.LayerTreeAgent.CompositingReasonsRequest;
/** @typedef {!{compositingReasons: !Array<string>}} */
Protocol.LayerTreeAgent.CompositingReasonsResponse;
/**
 * @param {!Protocol.LayerTreeAgent.CompositingReasonsRequest} obj
 * @return {!Promise<!Protocol.LayerTreeAgent.CompositingReasonsResponse>} */
Protocol.LayerTreeAgent.prototype.invoke_compositingReasons = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.LayerTreeAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.LayerTreeAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.LayerTreeAgent.DisableResponse;
/**
 * @param {!Protocol.LayerTreeAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.LayerTreeAgent.DisableResponse>} */
Protocol.LayerTreeAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.LayerTreeAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.LayerTreeAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.LayerTreeAgent.EnableResponse;
/**
 * @param {!Protocol.LayerTreeAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.LayerTreeAgent.EnableResponse>} */
Protocol.LayerTreeAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {!Array<Protocol.LayerTree.PictureTile>} tiles
 * @return {!Promise<?Protocol.LayerTree.SnapshotId>}
 */
Protocol.LayerTreeAgent.prototype.loadSnapshot = function (tiles) {};
/** @typedef {!{tiles: !Array<Protocol.LayerTree.PictureTile>}} */
Protocol.LayerTreeAgent.LoadSnapshotRequest;
/** @typedef {!{snapshotId: Protocol.LayerTree.SnapshotId}} */
Protocol.LayerTreeAgent.LoadSnapshotResponse;
/**
 * @param {!Protocol.LayerTreeAgent.LoadSnapshotRequest} obj
 * @return {!Promise<!Protocol.LayerTreeAgent.LoadSnapshotResponse>} */
Protocol.LayerTreeAgent.prototype.invoke_loadSnapshot = function (obj) {};

/**
 * @param {Protocol.LayerTree.LayerId} layerId
 * @return {!Promise<?Protocol.LayerTree.SnapshotId>}
 */
Protocol.LayerTreeAgent.prototype.makeSnapshot = function (layerId) {};
/** @typedef {!{layerId: Protocol.LayerTree.LayerId}} */
Protocol.LayerTreeAgent.MakeSnapshotRequest;
/** @typedef {!{snapshotId: Protocol.LayerTree.SnapshotId}} */
Protocol.LayerTreeAgent.MakeSnapshotResponse;
/**
 * @param {!Protocol.LayerTreeAgent.MakeSnapshotRequest} obj
 * @return {!Promise<!Protocol.LayerTreeAgent.MakeSnapshotResponse>} */
Protocol.LayerTreeAgent.prototype.invoke_makeSnapshot = function (obj) {};

/**
 * @param {Protocol.LayerTree.SnapshotId} snapshotId
 * @param {number=} opt_minRepeatCount
 * @param {number=} opt_minDuration
 * @param {Protocol.DOM.Rect=} opt_clipRect
 * @return {!Promise<?Array<Protocol.LayerTree.PaintProfile>>}
 */
Protocol.LayerTreeAgent.prototype.profileSnapshot = function (
  snapshotId,
  opt_minRepeatCount,
  opt_minDuration,
  opt_clipRect,
) {};
/** @typedef {!{minRepeatCount: (number|undefined), snapshotId: Protocol.LayerTree.SnapshotId, clipRect: (Protocol.DOM.Rect|undefined), minDuration: (number|undefined)}} */
Protocol.LayerTreeAgent.ProfileSnapshotRequest;
/** @typedef {!{timings: !Array<Protocol.LayerTree.PaintProfile>}} */
Protocol.LayerTreeAgent.ProfileSnapshotResponse;
/**
 * @param {!Protocol.LayerTreeAgent.ProfileSnapshotRequest} obj
 * @return {!Promise<!Protocol.LayerTreeAgent.ProfileSnapshotResponse>} */
Protocol.LayerTreeAgent.prototype.invoke_profileSnapshot = function (obj) {};

/**
 * @param {Protocol.LayerTree.SnapshotId} snapshotId
 * @return {!Promise<undefined>}
 */
Protocol.LayerTreeAgent.prototype.releaseSnapshot = function (snapshotId) {};
/** @typedef {!{snapshotId: Protocol.LayerTree.SnapshotId}} */
Protocol.LayerTreeAgent.ReleaseSnapshotRequest;
/** @typedef {Object|undefined} */
Protocol.LayerTreeAgent.ReleaseSnapshotResponse;
/**
 * @param {!Protocol.LayerTreeAgent.ReleaseSnapshotRequest} obj
 * @return {!Promise<!Protocol.LayerTreeAgent.ReleaseSnapshotResponse>} */
Protocol.LayerTreeAgent.prototype.invoke_releaseSnapshot = function (obj) {};

/**
 * @param {Protocol.LayerTree.SnapshotId} snapshotId
 * @param {number=} opt_fromStep
 * @param {number=} opt_toStep
 * @param {number=} opt_scale
 * @return {!Promise<?string>}
 */
Protocol.LayerTreeAgent.prototype.replaySnapshot = function (snapshotId, opt_fromStep, opt_toStep, opt_scale) {};
/** @typedef {!{snapshotId: Protocol.LayerTree.SnapshotId, scale: (number|undefined), fromStep: (number|undefined), toStep: (number|undefined)}} */
Protocol.LayerTreeAgent.ReplaySnapshotRequest;
/** @typedef {!{dataURL: string}} */
Protocol.LayerTreeAgent.ReplaySnapshotResponse;
/**
 * @param {!Protocol.LayerTreeAgent.ReplaySnapshotRequest} obj
 * @return {!Promise<!Protocol.LayerTreeAgent.ReplaySnapshotResponse>} */
Protocol.LayerTreeAgent.prototype.invoke_replaySnapshot = function (obj) {};

/**
 * @param {Protocol.LayerTree.SnapshotId} snapshotId
 * @return {!Promise<?Array<!Object>>}
 */
Protocol.LayerTreeAgent.prototype.snapshotCommandLog = function (snapshotId) {};
/** @typedef {!{snapshotId: Protocol.LayerTree.SnapshotId}} */
Protocol.LayerTreeAgent.SnapshotCommandLogRequest;
/** @typedef {!{commandLog: !Array<!Object>}} */
Protocol.LayerTreeAgent.SnapshotCommandLogResponse;
/**
 * @param {!Protocol.LayerTreeAgent.SnapshotCommandLogRequest} obj
 * @return {!Promise<!Protocol.LayerTreeAgent.SnapshotCommandLogResponse>} */
Protocol.LayerTreeAgent.prototype.invoke_snapshotCommandLog = function (obj) {};

/** @typedef {string} */
Protocol.LayerTree.LayerId;

/** @typedef {string} */
Protocol.LayerTree.SnapshotId;

/** @enum {string} */
Protocol.LayerTree.ScrollRectType = {
  RepaintsOnScroll: 'RepaintsOnScroll',
  TouchEventHandler: 'TouchEventHandler',
  WheelEventHandler: 'WheelEventHandler',
};

/** @typedef {!{rect:(Protocol.DOM.Rect), type:(Protocol.LayerTree.ScrollRectType)}} */
Protocol.LayerTree.ScrollRect;

/** @typedef {!{stickyBoxRect:(Protocol.DOM.Rect), containingBlockRect:(Protocol.DOM.Rect), nearestLayerShiftingStickyBox:(Protocol.LayerTree.LayerId|undefined), nearestLayerShiftingContainingBlock:(Protocol.LayerTree.LayerId|undefined)}} */
Protocol.LayerTree.StickyPositionConstraint;

/** @typedef {!{x:(number), y:(number), picture:(string)}} */
Protocol.LayerTree.PictureTile;

/** @typedef {!{layerId:(Protocol.LayerTree.LayerId), parentLayerId:(Protocol.LayerTree.LayerId|undefined), backendNodeId:(Protocol.DOM.BackendNodeId|undefined), offsetX:(number), offsetY:(number), width:(number), height:(number), transform:(!Array<number>|undefined), anchorX:(number|undefined), anchorY:(number|undefined), anchorZ:(number|undefined), paintCount:(number), drawsContent:(boolean), invisible:(boolean|undefined), scrollRects:(!Array<Protocol.LayerTree.ScrollRect>|undefined), stickyPositionConstraint:(Protocol.LayerTree.StickyPositionConstraint|undefined)}} */
Protocol.LayerTree.Layer;

/** @typedef {!Array<!number>} */
Protocol.LayerTree.PaintProfile;
/** @interface */
Protocol.LayerTreeDispatcher = function () {};
/**
 * @param {Protocol.LayerTree.LayerId} layerId
 * @param {Protocol.DOM.Rect} clip
 */
Protocol.LayerTreeDispatcher.prototype.layerPainted = function (layerId, clip) {};
/**
 * @param {!Array<Protocol.LayerTree.Layer>=} opt_layers
 */
Protocol.LayerTreeDispatcher.prototype.layerTreeDidChange = function (opt_layers) {};
Protocol.Log = {};

/**
 * @constructor
 */
Protocol.LogAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.LogAgent.prototype.clear = function () {};
/** @typedef {Object|undefined} */
Protocol.LogAgent.ClearRequest;
/** @typedef {Object|undefined} */
Protocol.LogAgent.ClearResponse;
/**
 * @param {!Protocol.LogAgent.ClearRequest} obj
 * @return {!Promise<!Protocol.LogAgent.ClearResponse>} */
Protocol.LogAgent.prototype.invoke_clear = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.LogAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.LogAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.LogAgent.DisableResponse;
/**
 * @param {!Protocol.LogAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.LogAgent.DisableResponse>} */
Protocol.LogAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.LogAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.LogAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.LogAgent.EnableResponse;
/**
 * @param {!Protocol.LogAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.LogAgent.EnableResponse>} */
Protocol.LogAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {!Array<Protocol.Log.ViolationSetting>} config
 * @return {!Promise<undefined>}
 */
Protocol.LogAgent.prototype.startViolationsReport = function (config) {};
/** @typedef {!{config: !Array<Protocol.Log.ViolationSetting>}} */
Protocol.LogAgent.StartViolationsReportRequest;
/** @typedef {Object|undefined} */
Protocol.LogAgent.StartViolationsReportResponse;
/**
 * @param {!Protocol.LogAgent.StartViolationsReportRequest} obj
 * @return {!Promise<!Protocol.LogAgent.StartViolationsReportResponse>} */
Protocol.LogAgent.prototype.invoke_startViolationsReport = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.LogAgent.prototype.stopViolationsReport = function () {};
/** @typedef {Object|undefined} */
Protocol.LogAgent.StopViolationsReportRequest;
/** @typedef {Object|undefined} */
Protocol.LogAgent.StopViolationsReportResponse;
/**
 * @param {!Protocol.LogAgent.StopViolationsReportRequest} obj
 * @return {!Promise<!Protocol.LogAgent.StopViolationsReportResponse>} */
Protocol.LogAgent.prototype.invoke_stopViolationsReport = function (obj) {};

/** @enum {string} */
Protocol.Log.LogEntrySource = {
  XML: 'xml',
  Javascript: 'javascript',
  Network: 'network',
  Storage: 'storage',
  Appcache: 'appcache',
  Rendering: 'rendering',
  Security: 'security',
  Deprecation: 'deprecation',
  Worker: 'worker',
  Violation: 'violation',
  Intervention: 'intervention',
  Recommendation: 'recommendation',
  Other: 'other',
};

/** @enum {string} */
Protocol.Log.LogEntryLevel = {
  Verbose: 'verbose',
  Info: 'info',
  Warning: 'warning',
  Error: 'error',
};

/** @typedef {!{source:(Protocol.Log.LogEntrySource), level:(Protocol.Log.LogEntryLevel), text:(string), timestamp:(Protocol.Runtime.Timestamp), url:(string|undefined), lineNumber:(number|undefined), stackTrace:(Protocol.Runtime.StackTrace|undefined), networkRequestId:(Protocol.Network.RequestId|undefined), workerId:(string|undefined), args:(!Array<Protocol.Runtime.RemoteObject>|undefined)}} */
Protocol.Log.LogEntry;

/** @enum {string} */
Protocol.Log.ViolationSettingName = {
  LongTask: 'longTask',
  LongLayout: 'longLayout',
  BlockedEvent: 'blockedEvent',
  BlockedParser: 'blockedParser',
  DiscouragedAPIUse: 'discouragedAPIUse',
  Handler: 'handler',
  RecurringHandler: 'recurringHandler',
};

/** @typedef {!{name:(Protocol.Log.ViolationSettingName), threshold:(number)}} */
Protocol.Log.ViolationSetting;
/** @interface */
Protocol.LogDispatcher = function () {};
/**
 * @param {Protocol.Log.LogEntry} entry
 */
Protocol.LogDispatcher.prototype.entryAdded = function (entry) {};
Protocol.Memory = {};

/**
 * @constructor
 */
Protocol.MemoryAgent = function () {};

/**
 * @return {!Promise<?number>}
 */
Protocol.MemoryAgent.prototype.getDOMCounters = function () {};
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.GetDOMCountersRequest;
/** @typedef {!{nodes: number, documents: number, jsEventListeners: number}} */
Protocol.MemoryAgent.GetDOMCountersResponse;
/**
 * @param {!Protocol.MemoryAgent.GetDOMCountersRequest} obj
 * @return {!Promise<!Protocol.MemoryAgent.GetDOMCountersResponse>} */
Protocol.MemoryAgent.prototype.invoke_getDOMCounters = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.MemoryAgent.prototype.prepareForLeakDetection = function () {};
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.PrepareForLeakDetectionRequest;
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.PrepareForLeakDetectionResponse;
/**
 * @param {!Protocol.MemoryAgent.PrepareForLeakDetectionRequest} obj
 * @return {!Promise<!Protocol.MemoryAgent.PrepareForLeakDetectionResponse>} */
Protocol.MemoryAgent.prototype.invoke_prepareForLeakDetection = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.MemoryAgent.prototype.forciblyPurgeJavaScriptMemory = function () {};
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.ForciblyPurgeJavaScriptMemoryRequest;
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.ForciblyPurgeJavaScriptMemoryResponse;
/**
 * @param {!Protocol.MemoryAgent.ForciblyPurgeJavaScriptMemoryRequest} obj
 * @return {!Promise<!Protocol.MemoryAgent.ForciblyPurgeJavaScriptMemoryResponse>} */
Protocol.MemoryAgent.prototype.invoke_forciblyPurgeJavaScriptMemory = function (obj) {};

/**
 * @param {boolean} suppressed
 * @return {!Promise<undefined>}
 */
Protocol.MemoryAgent.prototype.setPressureNotificationsSuppressed = function (suppressed) {};
/** @typedef {!{suppressed: boolean}} */
Protocol.MemoryAgent.SetPressureNotificationsSuppressedRequest;
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.SetPressureNotificationsSuppressedResponse;
/**
 * @param {!Protocol.MemoryAgent.SetPressureNotificationsSuppressedRequest} obj
 * @return {!Promise<!Protocol.MemoryAgent.SetPressureNotificationsSuppressedResponse>} */
Protocol.MemoryAgent.prototype.invoke_setPressureNotificationsSuppressed = function (obj) {};

/**
 * @param {Protocol.Memory.PressureLevel} level
 * @return {!Promise<undefined>}
 */
Protocol.MemoryAgent.prototype.simulatePressureNotification = function (level) {};
/** @typedef {!{level: Protocol.Memory.PressureLevel}} */
Protocol.MemoryAgent.SimulatePressureNotificationRequest;
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.SimulatePressureNotificationResponse;
/**
 * @param {!Protocol.MemoryAgent.SimulatePressureNotificationRequest} obj
 * @return {!Promise<!Protocol.MemoryAgent.SimulatePressureNotificationResponse>} */
Protocol.MemoryAgent.prototype.invoke_simulatePressureNotification = function (obj) {};

/**
 * @param {number=} opt_samplingInterval
 * @param {boolean=} opt_suppressRandomness
 * @return {!Promise<undefined>}
 */
Protocol.MemoryAgent.prototype.startSampling = function (opt_samplingInterval, opt_suppressRandomness) {};
/** @typedef {!{samplingInterval: (number|undefined), suppressRandomness: (boolean|undefined)}} */
Protocol.MemoryAgent.StartSamplingRequest;
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.StartSamplingResponse;
/**
 * @param {!Protocol.MemoryAgent.StartSamplingRequest} obj
 * @return {!Promise<!Protocol.MemoryAgent.StartSamplingResponse>} */
Protocol.MemoryAgent.prototype.invoke_startSampling = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.MemoryAgent.prototype.stopSampling = function () {};
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.StopSamplingRequest;
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.StopSamplingResponse;
/**
 * @param {!Protocol.MemoryAgent.StopSamplingRequest} obj
 * @return {!Promise<!Protocol.MemoryAgent.StopSamplingResponse>} */
Protocol.MemoryAgent.prototype.invoke_stopSampling = function (obj) {};

/**
 * @return {!Promise<?Protocol.Memory.SamplingProfile>}
 */
Protocol.MemoryAgent.prototype.getAllTimeSamplingProfile = function () {};
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.GetAllTimeSamplingProfileRequest;
/** @typedef {!{profile: Protocol.Memory.SamplingProfile}} */
Protocol.MemoryAgent.GetAllTimeSamplingProfileResponse;
/**
 * @param {!Protocol.MemoryAgent.GetAllTimeSamplingProfileRequest} obj
 * @return {!Promise<!Protocol.MemoryAgent.GetAllTimeSamplingProfileResponse>} */
Protocol.MemoryAgent.prototype.invoke_getAllTimeSamplingProfile = function (obj) {};

/**
 * @return {!Promise<?Protocol.Memory.SamplingProfile>}
 */
Protocol.MemoryAgent.prototype.getBrowserSamplingProfile = function () {};
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.GetBrowserSamplingProfileRequest;
/** @typedef {!{profile: Protocol.Memory.SamplingProfile}} */
Protocol.MemoryAgent.GetBrowserSamplingProfileResponse;
/**
 * @param {!Protocol.MemoryAgent.GetBrowserSamplingProfileRequest} obj
 * @return {!Promise<!Protocol.MemoryAgent.GetBrowserSamplingProfileResponse>} */
Protocol.MemoryAgent.prototype.invoke_getBrowserSamplingProfile = function (obj) {};

/**
 * @return {!Promise<?Protocol.Memory.SamplingProfile>}
 */
Protocol.MemoryAgent.prototype.getSamplingProfile = function () {};
/** @typedef {Object|undefined} */
Protocol.MemoryAgent.GetSamplingProfileRequest;
/** @typedef {!{profile: Protocol.Memory.SamplingProfile}} */
Protocol.MemoryAgent.GetSamplingProfileResponse;
/**
 * @param {!Protocol.MemoryAgent.GetSamplingProfileRequest} obj
 * @return {!Promise<!Protocol.MemoryAgent.GetSamplingProfileResponse>} */
Protocol.MemoryAgent.prototype.invoke_getSamplingProfile = function (obj) {};

/** @enum {string} */
Protocol.Memory.PressureLevel = {
  Moderate: 'moderate',
  Critical: 'critical',
};

/** @typedef {!{size:(number), total:(number), stack:(!Array<string>)}} */
Protocol.Memory.SamplingProfileNode;

/** @typedef {!{samples:(!Array<Protocol.Memory.SamplingProfileNode>), modules:(!Array<Protocol.Memory.Module>)}} */
Protocol.Memory.SamplingProfile;

/** @typedef {!{name:(string), uuid:(string), baseAddress:(string), size:(number)}} */
Protocol.Memory.Module;
/** @interface */
Protocol.MemoryDispatcher = function () {};
Protocol.Network = {};

/**
 * @constructor
 */
Protocol.NetworkAgent = function () {};

/**
 * @return {!Promise<?boolean>}
 */
Protocol.NetworkAgent.prototype.canClearBrowserCache = function () {};
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.CanClearBrowserCacheRequest;
/** @typedef {!{result: boolean}} */
Protocol.NetworkAgent.CanClearBrowserCacheResponse;
/**
 * @param {!Protocol.NetworkAgent.CanClearBrowserCacheRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.CanClearBrowserCacheResponse>} */
Protocol.NetworkAgent.prototype.invoke_canClearBrowserCache = function (obj) {};

/**
 * @return {!Promise<?boolean>}
 */
Protocol.NetworkAgent.prototype.canClearBrowserCookies = function () {};
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.CanClearBrowserCookiesRequest;
/** @typedef {!{result: boolean}} */
Protocol.NetworkAgent.CanClearBrowserCookiesResponse;
/**
 * @param {!Protocol.NetworkAgent.CanClearBrowserCookiesRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.CanClearBrowserCookiesResponse>} */
Protocol.NetworkAgent.prototype.invoke_canClearBrowserCookies = function (obj) {};

/**
 * @return {!Promise<?boolean>}
 */
Protocol.NetworkAgent.prototype.canEmulateNetworkConditions = function () {};
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.CanEmulateNetworkConditionsRequest;
/** @typedef {!{result: boolean}} */
Protocol.NetworkAgent.CanEmulateNetworkConditionsResponse;
/**
 * @param {!Protocol.NetworkAgent.CanEmulateNetworkConditionsRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.CanEmulateNetworkConditionsResponse>} */
Protocol.NetworkAgent.prototype.invoke_canEmulateNetworkConditions = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.clearBrowserCache = function () {};
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.ClearBrowserCacheRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.ClearBrowserCacheResponse;
/**
 * @param {!Protocol.NetworkAgent.ClearBrowserCacheRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.ClearBrowserCacheResponse>} */
Protocol.NetworkAgent.prototype.invoke_clearBrowserCache = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.clearBrowserCookies = function () {};
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.ClearBrowserCookiesRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.ClearBrowserCookiesResponse;
/**
 * @param {!Protocol.NetworkAgent.ClearBrowserCookiesRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.ClearBrowserCookiesResponse>} */
Protocol.NetworkAgent.prototype.invoke_clearBrowserCookies = function (obj) {};

/**
 * @param {Protocol.Network.InterceptionId} interceptionId
 * @param {Protocol.Network.ErrorReason=} opt_errorReason
 * @param {string=} opt_rawResponse
 * @param {string=} opt_url
 * @param {string=} opt_method
 * @param {string=} opt_postData
 * @param {Protocol.Network.Headers=} opt_headers
 * @param {Protocol.Network.AuthChallengeResponse=} opt_authChallengeResponse
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.continueInterceptedRequest = function (
  interceptionId,
  opt_errorReason,
  opt_rawResponse,
  opt_url,
  opt_method,
  opt_postData,
  opt_headers,
  opt_authChallengeResponse,
) {};
/** @typedef {!{postData: (string|undefined), headers: (Protocol.Network.Headers|undefined), url: (string|undefined), authChallengeResponse: (Protocol.Network.AuthChallengeResponse|undefined), errorReason: (Protocol.Network.ErrorReason|undefined), interceptionId: Protocol.Network.InterceptionId, rawResponse: (string|undefined), method: (string|undefined)}} */
Protocol.NetworkAgent.ContinueInterceptedRequestRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.ContinueInterceptedRequestResponse;
/**
 * @param {!Protocol.NetworkAgent.ContinueInterceptedRequestRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.ContinueInterceptedRequestResponse>} */
Protocol.NetworkAgent.prototype.invoke_continueInterceptedRequest = function (obj) {};

/**
 * @param {string} name
 * @param {string=} opt_url
 * @param {string=} opt_domain
 * @param {string=} opt_path
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.deleteCookies = function (name, opt_url, opt_domain, opt_path) {};
/** @typedef {!{url: (string|undefined), path: (string|undefined), domain: (string|undefined), name: string}} */
Protocol.NetworkAgent.DeleteCookiesRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.DeleteCookiesResponse;
/**
 * @param {!Protocol.NetworkAgent.DeleteCookiesRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.DeleteCookiesResponse>} */
Protocol.NetworkAgent.prototype.invoke_deleteCookies = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.DisableResponse;
/**
 * @param {!Protocol.NetworkAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.DisableResponse>} */
Protocol.NetworkAgent.prototype.invoke_disable = function (obj) {};

/**
 * @param {boolean} offline
 * @param {number} latency
 * @param {number} downloadThroughput
 * @param {number} uploadThroughput
 * @param {Protocol.Network.ConnectionType=} opt_connectionType
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.emulateNetworkConditions = function (
  offline,
  latency,
  downloadThroughput,
  uploadThroughput,
  opt_connectionType,
) {};
/** @typedef {!{latency: number, offline: boolean, downloadThroughput: number, connectionType: (Protocol.Network.ConnectionType|undefined), uploadThroughput: number}} */
Protocol.NetworkAgent.EmulateNetworkConditionsRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.EmulateNetworkConditionsResponse;
/**
 * @param {!Protocol.NetworkAgent.EmulateNetworkConditionsRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.EmulateNetworkConditionsResponse>} */
Protocol.NetworkAgent.prototype.invoke_emulateNetworkConditions = function (obj) {};

/**
 * @param {number=} opt_maxTotalBufferSize
 * @param {number=} opt_maxResourceBufferSize
 * @param {number=} opt_maxPostDataSize
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.enable = function (
  opt_maxTotalBufferSize,
  opt_maxResourceBufferSize,
  opt_maxPostDataSize,
) {};
/** @typedef {!{maxTotalBufferSize: (number|undefined), maxPostDataSize: (number|undefined), maxResourceBufferSize: (number|undefined)}} */
Protocol.NetworkAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.EnableResponse;
/**
 * @param {!Protocol.NetworkAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.EnableResponse>} */
Protocol.NetworkAgent.prototype.invoke_enable = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.Network.Cookie>>}
 */
Protocol.NetworkAgent.prototype.getAllCookies = function () {};
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.GetAllCookiesRequest;
/** @typedef {!{cookies: !Array<Protocol.Network.Cookie>}} */
Protocol.NetworkAgent.GetAllCookiesResponse;
/**
 * @param {!Protocol.NetworkAgent.GetAllCookiesRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.GetAllCookiesResponse>} */
Protocol.NetworkAgent.prototype.invoke_getAllCookies = function (obj) {};

/**
 * @param {string} origin
 * @return {!Promise<?Array<string>>}
 */
Protocol.NetworkAgent.prototype.getCertificate = function (origin) {};
/** @typedef {!{origin: string}} */
Protocol.NetworkAgent.GetCertificateRequest;
/** @typedef {!{tableNames: !Array<string>}} */
Protocol.NetworkAgent.GetCertificateResponse;
/**
 * @param {!Protocol.NetworkAgent.GetCertificateRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.GetCertificateResponse>} */
Protocol.NetworkAgent.prototype.invoke_getCertificate = function (obj) {};

/**
 * @param {!Array<string>=} opt_urls
 * @return {!Promise<?Array<Protocol.Network.Cookie>>}
 */
Protocol.NetworkAgent.prototype.getCookies = function (opt_urls) {};
/** @typedef {!{urls: (!Array<string>|undefined)}} */
Protocol.NetworkAgent.GetCookiesRequest;
/** @typedef {!{cookies: !Array<Protocol.Network.Cookie>}} */
Protocol.NetworkAgent.GetCookiesResponse;
/**
 * @param {!Protocol.NetworkAgent.GetCookiesRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.GetCookiesResponse>} */
Protocol.NetworkAgent.prototype.invoke_getCookies = function (obj) {};

/**
 * @param {Protocol.Network.RequestId} requestId
 * @return {!Promise<?string>}
 */
Protocol.NetworkAgent.prototype.getResponseBody = function (requestId) {};
/** @typedef {!{requestId: Protocol.Network.RequestId}} */
Protocol.NetworkAgent.GetResponseBodyRequest;
/** @typedef {!{body: string, base64Encoded: boolean}} */
Protocol.NetworkAgent.GetResponseBodyResponse;
/**
 * @param {!Protocol.NetworkAgent.GetResponseBodyRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.GetResponseBodyResponse>} */
Protocol.NetworkAgent.prototype.invoke_getResponseBody = function (obj) {};

/**
 * @param {Protocol.Network.RequestId} requestId
 * @return {!Promise<?string>}
 */
Protocol.NetworkAgent.prototype.getRequestPostData = function (requestId) {};
/** @typedef {!{requestId: Protocol.Network.RequestId}} */
Protocol.NetworkAgent.GetRequestPostDataRequest;
/** @typedef {!{postData: string}} */
Protocol.NetworkAgent.GetRequestPostDataResponse;
/**
 * @param {!Protocol.NetworkAgent.GetRequestPostDataRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.GetRequestPostDataResponse>} */
Protocol.NetworkAgent.prototype.invoke_getRequestPostData = function (obj) {};

/**
 * @param {Protocol.Network.InterceptionId} interceptionId
 * @return {!Promise<?string>}
 */
Protocol.NetworkAgent.prototype.getResponseBodyForInterception = function (interceptionId) {};
/** @typedef {!{interceptionId: Protocol.Network.InterceptionId}} */
Protocol.NetworkAgent.GetResponseBodyForInterceptionRequest;
/** @typedef {!{body: string, base64Encoded: boolean}} */
Protocol.NetworkAgent.GetResponseBodyForInterceptionResponse;
/**
 * @param {!Protocol.NetworkAgent.GetResponseBodyForInterceptionRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.GetResponseBodyForInterceptionResponse>} */
Protocol.NetworkAgent.prototype.invoke_getResponseBodyForInterception = function (obj) {};

/**
 * @param {Protocol.Network.InterceptionId} interceptionId
 * @return {!Promise<?Protocol.IO.StreamHandle>}
 */
Protocol.NetworkAgent.prototype.takeResponseBodyForInterceptionAsStream = function (interceptionId) {};
/** @typedef {!{interceptionId: Protocol.Network.InterceptionId}} */
Protocol.NetworkAgent.TakeResponseBodyForInterceptionAsStreamRequest;
/** @typedef {!{stream: Protocol.IO.StreamHandle}} */
Protocol.NetworkAgent.TakeResponseBodyForInterceptionAsStreamResponse;
/**
 * @param {!Protocol.NetworkAgent.TakeResponseBodyForInterceptionAsStreamRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.TakeResponseBodyForInterceptionAsStreamResponse>} */
Protocol.NetworkAgent.prototype.invoke_takeResponseBodyForInterceptionAsStream = function (obj) {};

/**
 * @param {Protocol.Network.RequestId} requestId
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.replayXHR = function (requestId) {};
/** @typedef {!{requestId: Protocol.Network.RequestId}} */
Protocol.NetworkAgent.ReplayXHRRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.ReplayXHRResponse;
/**
 * @param {!Protocol.NetworkAgent.ReplayXHRRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.ReplayXHRResponse>} */
Protocol.NetworkAgent.prototype.invoke_replayXHR = function (obj) {};

/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {string} query
 * @param {boolean=} opt_caseSensitive
 * @param {boolean=} opt_isRegex
 * @return {!Promise<?Array<Protocol.Debugger.SearchMatch>>}
 */
Protocol.NetworkAgent.prototype.searchInResponseBody = function (requestId, query, opt_caseSensitive, opt_isRegex) {};
/** @typedef {!{query: string, isRegex: (boolean|undefined), requestId: Protocol.Network.RequestId, caseSensitive: (boolean|undefined)}} */
Protocol.NetworkAgent.SearchInResponseBodyRequest;
/** @typedef {!{result: !Array<Protocol.Debugger.SearchMatch>}} */
Protocol.NetworkAgent.SearchInResponseBodyResponse;
/**
 * @param {!Protocol.NetworkAgent.SearchInResponseBodyRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.SearchInResponseBodyResponse>} */
Protocol.NetworkAgent.prototype.invoke_searchInResponseBody = function (obj) {};

/**
 * @param {!Array<string>} urls
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.setBlockedURLs = function (urls) {};
/** @typedef {!{urls: !Array<string>}} */
Protocol.NetworkAgent.SetBlockedURLsRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.SetBlockedURLsResponse;
/**
 * @param {!Protocol.NetworkAgent.SetBlockedURLsRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.SetBlockedURLsResponse>} */
Protocol.NetworkAgent.prototype.invoke_setBlockedURLs = function (obj) {};

/**
 * @param {boolean} bypass
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.setBypassServiceWorker = function (bypass) {};
/** @typedef {!{bypass: boolean}} */
Protocol.NetworkAgent.SetBypassServiceWorkerRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.SetBypassServiceWorkerResponse;
/**
 * @param {!Protocol.NetworkAgent.SetBypassServiceWorkerRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.SetBypassServiceWorkerResponse>} */
Protocol.NetworkAgent.prototype.invoke_setBypassServiceWorker = function (obj) {};

/**
 * @param {boolean} cacheDisabled
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.setCacheDisabled = function (cacheDisabled) {};
/** @typedef {!{cacheDisabled: boolean}} */
Protocol.NetworkAgent.SetCacheDisabledRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.SetCacheDisabledResponse;
/**
 * @param {!Protocol.NetworkAgent.SetCacheDisabledRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.SetCacheDisabledResponse>} */
Protocol.NetworkAgent.prototype.invoke_setCacheDisabled = function (obj) {};

/**
 * @param {string} name
 * @param {string} value
 * @param {string=} opt_url
 * @param {string=} opt_domain
 * @param {string=} opt_path
 * @param {boolean=} opt_secure
 * @param {boolean=} opt_httpOnly
 * @param {Protocol.Network.CookieSameSite=} opt_sameSite
 * @param {Protocol.Network.TimeSinceEpoch=} opt_expires
 * @return {!Promise<?boolean>}
 */
Protocol.NetworkAgent.prototype.setCookie = function (
  name,
  value,
  opt_url,
  opt_domain,
  opt_path,
  opt_secure,
  opt_httpOnly,
  opt_sameSite,
  opt_expires,
) {};
/** @typedef {!{domain: (string|undefined), name: string, url: (string|undefined), expires: (Protocol.Network.TimeSinceEpoch|undefined), value: string, sameSite: (Protocol.Network.CookieSameSite|undefined), path: (string|undefined), httpOnly: (boolean|undefined), secure: (boolean|undefined)}} */
Protocol.NetworkAgent.SetCookieRequest;
/** @typedef {!{success: boolean}} */
Protocol.NetworkAgent.SetCookieResponse;
/**
 * @param {!Protocol.NetworkAgent.SetCookieRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.SetCookieResponse>} */
Protocol.NetworkAgent.prototype.invoke_setCookie = function (obj) {};

/**
 * @param {!Array<Protocol.Network.CookieParam>} cookies
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.setCookies = function (cookies) {};
/** @typedef {!{cookies: !Array<Protocol.Network.CookieParam>}} */
Protocol.NetworkAgent.SetCookiesRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.SetCookiesResponse;
/**
 * @param {!Protocol.NetworkAgent.SetCookiesRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.SetCookiesResponse>} */
Protocol.NetworkAgent.prototype.invoke_setCookies = function (obj) {};

/**
 * @param {number} maxTotalSize
 * @param {number} maxResourceSize
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.setDataSizeLimitsForTest = function (maxTotalSize, maxResourceSize) {};
/** @typedef {!{maxResourceSize: number, maxTotalSize: number}} */
Protocol.NetworkAgent.SetDataSizeLimitsForTestRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.SetDataSizeLimitsForTestResponse;
/**
 * @param {!Protocol.NetworkAgent.SetDataSizeLimitsForTestRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.SetDataSizeLimitsForTestResponse>} */
Protocol.NetworkAgent.prototype.invoke_setDataSizeLimitsForTest = function (obj) {};

/**
 * @param {Protocol.Network.Headers} headers
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.setExtraHTTPHeaders = function (headers) {};
/** @typedef {!{headers: Protocol.Network.Headers}} */
Protocol.NetworkAgent.SetExtraHTTPHeadersRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.SetExtraHTTPHeadersResponse;
/**
 * @param {!Protocol.NetworkAgent.SetExtraHTTPHeadersRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.SetExtraHTTPHeadersResponse>} */
Protocol.NetworkAgent.prototype.invoke_setExtraHTTPHeaders = function (obj) {};

/**
 * @param {!Array<Protocol.Network.RequestPattern>} patterns
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.setRequestInterception = function (patterns) {};
/** @typedef {!{patterns: !Array<Protocol.Network.RequestPattern>}} */
Protocol.NetworkAgent.SetRequestInterceptionRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.SetRequestInterceptionResponse;
/**
 * @param {!Protocol.NetworkAgent.SetRequestInterceptionRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.SetRequestInterceptionResponse>} */
Protocol.NetworkAgent.prototype.invoke_setRequestInterception = function (obj) {};

/**
 * @param {string} userAgent
 * @param {string=} opt_acceptLanguage
 * @param {string=} opt_platform
 * @return {!Promise<undefined>}
 */
Protocol.NetworkAgent.prototype.setUserAgentOverride = function (userAgent, opt_acceptLanguage, opt_platform) {};
/** @typedef {!{acceptLanguage: (string|undefined), userAgent: string, platform: (string|undefined)}} */
Protocol.NetworkAgent.SetUserAgentOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.NetworkAgent.SetUserAgentOverrideResponse;
/**
 * @param {!Protocol.NetworkAgent.SetUserAgentOverrideRequest} obj
 * @return {!Promise<!Protocol.NetworkAgent.SetUserAgentOverrideResponse>} */
Protocol.NetworkAgent.prototype.invoke_setUserAgentOverride = function (obj) {};

/** @enum {string} */
Protocol.Network.ResourceType = {
  Document: 'Document',
  Stylesheet: 'Stylesheet',
  Image: 'Image',
  Media: 'Media',
  Font: 'Font',
  Script: 'Script',
  TextTrack: 'TextTrack',
  XHR: 'XHR',
  Fetch: 'Fetch',
  EventSource: 'EventSource',
  WebSocket: 'WebSocket',
  Manifest: 'Manifest',
  SignedExchange: 'SignedExchange',
  Ping: 'Ping',
  CSPViolationReport: 'CSPViolationReport',
  Other: 'Other',
};

/** @typedef {string} */
Protocol.Network.LoaderId;

/** @typedef {string} */
Protocol.Network.RequestId;

/** @typedef {string} */
Protocol.Network.InterceptionId;

/** @enum {string} */
Protocol.Network.ErrorReason = {
  Failed: 'Failed',
  Aborted: 'Aborted',
  TimedOut: 'TimedOut',
  AccessDenied: 'AccessDenied',
  ConnectionClosed: 'ConnectionClosed',
  ConnectionReset: 'ConnectionReset',
  ConnectionRefused: 'ConnectionRefused',
  ConnectionAborted: 'ConnectionAborted',
  ConnectionFailed: 'ConnectionFailed',
  NameNotResolved: 'NameNotResolved',
  InternetDisconnected: 'InternetDisconnected',
  AddressUnreachable: 'AddressUnreachable',
  BlockedByClient: 'BlockedByClient',
  BlockedByResponse: 'BlockedByResponse',
};

/** @typedef {number} */
Protocol.Network.TimeSinceEpoch;

/** @typedef {number} */
Protocol.Network.MonotonicTime;

/** @typedef {!Object} */
Protocol.Network.Headers;

/** @enum {string} */
Protocol.Network.ConnectionType = {
  None: 'none',
  Cellular2g: 'cellular2g',
  Cellular3g: 'cellular3g',
  Cellular4g: 'cellular4g',
  Bluetooth: 'bluetooth',
  Ethernet: 'ethernet',
  Wifi: 'wifi',
  Wimax: 'wimax',
  Other: 'other',
};

/** @enum {string} */
Protocol.Network.CookieSameSite = {
  Strict: 'Strict',
  Lax: 'Lax',
  None: 'None',
};

/** @typedef {!{requestTime:(number), proxyStart:(number), proxyEnd:(number), dnsStart:(number), dnsEnd:(number), connectStart:(number), connectEnd:(number), sslStart:(number), sslEnd:(number), workerStart:(number), workerReady:(number), sendStart:(number), sendEnd:(number), pushStart:(number), pushEnd:(number), receiveHeadersEnd:(number)}} */
Protocol.Network.ResourceTiming;

/** @enum {string} */
Protocol.Network.ResourcePriority = {
  VeryLow: 'VeryLow',
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  VeryHigh: 'VeryHigh',
};

/** @enum {string} */
Protocol.Network.RequestReferrerPolicy = {
  UnsafeUrl: 'unsafe-url',
  NoReferrerWhenDowngrade: 'no-referrer-when-downgrade',
  NoReferrer: 'no-referrer',
  Origin: 'origin',
  OriginWhenCrossOrigin: 'origin-when-cross-origin',
  SameOrigin: 'same-origin',
  StrictOrigin: 'strict-origin',
  StrictOriginWhenCrossOrigin: 'strict-origin-when-cross-origin',
};

/** @typedef {!{url:(string), urlFragment:(string|undefined), method:(string), headers:(Protocol.Network.Headers), postData:(string|undefined), hasPostData:(boolean|undefined), mixedContentType:(Protocol.Security.MixedContentType|undefined), initialPriority:(Protocol.Network.ResourcePriority), referrerPolicy:(Protocol.Network.RequestReferrerPolicy), isLinkPreload:(boolean|undefined)}} */
Protocol.Network.Request;

/** @typedef {!{status:(string), origin:(string), logDescription:(string), logId:(string), timestamp:(Protocol.Network.TimeSinceEpoch), hashAlgorithm:(string), signatureAlgorithm:(string), signatureData:(string)}} */
Protocol.Network.SignedCertificateTimestamp;

/** @typedef {!{protocol:(string), keyExchange:(string), keyExchangeGroup:(string|undefined), cipher:(string), mac:(string|undefined), certificateId:(Protocol.Security.CertificateId), subjectName:(string), sanList:(!Array<string>), issuer:(string), validFrom:(Protocol.Network.TimeSinceEpoch), validTo:(Protocol.Network.TimeSinceEpoch), signedCertificateTimestampList:(!Array<Protocol.Network.SignedCertificateTimestamp>), certificateTransparencyCompliance:(Protocol.Network.CertificateTransparencyCompliance)}} */
Protocol.Network.SecurityDetails;

/** @enum {string} */
Protocol.Network.CertificateTransparencyCompliance = {
  Unknown: 'unknown',
  NotCompliant: 'not-compliant',
  Compliant: 'compliant',
};

/** @enum {string} */
Protocol.Network.BlockedReason = {
  Other: 'other',
  Csp: 'csp',
  MixedContent: 'mixed-content',
  Origin: 'origin',
  Inspector: 'inspector',
  SubresourceFilter: 'subresource-filter',
  ContentType: 'content-type',
  CollapsedByClient: 'collapsed-by-client',
};

/** @typedef {!{url:(string), status:(number), statusText:(string), headers:(Protocol.Network.Headers), headersText:(string|undefined), mimeType:(string), requestHeaders:(Protocol.Network.Headers|undefined), requestHeadersText:(string|undefined), connectionReused:(boolean), connectionId:(number), remoteIPAddress:(string|undefined), remotePort:(number|undefined), fromDiskCache:(boolean|undefined), fromServiceWorker:(boolean|undefined), fromPrefetchCache:(boolean|undefined), encodedDataLength:(number), timing:(Protocol.Network.ResourceTiming|undefined), protocol:(string|undefined), securityState:(Protocol.Security.SecurityState), securityDetails:(Protocol.Network.SecurityDetails|undefined)}} */
Protocol.Network.Response;

/** @typedef {!{headers:(Protocol.Network.Headers)}} */
Protocol.Network.WebSocketRequest;

/** @typedef {!{status:(number), statusText:(string), headers:(Protocol.Network.Headers), headersText:(string|undefined), requestHeaders:(Protocol.Network.Headers|undefined), requestHeadersText:(string|undefined)}} */
Protocol.Network.WebSocketResponse;

/** @typedef {!{opcode:(number), mask:(boolean), payloadData:(string)}} */
Protocol.Network.WebSocketFrame;

/** @typedef {!{url:(string), type:(Protocol.Network.ResourceType), response:(Protocol.Network.Response|undefined), bodySize:(number)}} */
Protocol.Network.CachedResource;

/** @enum {string} */
Protocol.Network.InitiatorType = {
  Parser: 'parser',
  Script: 'script',
  Preload: 'preload',
  SignedExchange: 'SignedExchange',
  Other: 'other',
};

/** @typedef {!{type:(Protocol.Network.InitiatorType), stack:(Protocol.Runtime.StackTrace|undefined), url:(string|undefined), lineNumber:(number|undefined)}} */
Protocol.Network.Initiator;

/** @typedef {!{name:(string), value:(string), domain:(string), path:(string), expires:(number), size:(number), httpOnly:(boolean), secure:(boolean), session:(boolean), sameSite:(Protocol.Network.CookieSameSite|undefined)}} */
Protocol.Network.Cookie;

/** @enum {string} */
Protocol.Network.SetCookieBlockedReason = {
  SecureOnly: 'SecureOnly',
  SameSiteStrict: 'SameSiteStrict',
  SameSiteLax: 'SameSiteLax',
  SameSiteExtended: 'SameSiteExtended',
  SameSiteUnspecifiedTreatedAsLax: 'SameSiteUnspecifiedTreatedAsLax',
  SameSiteNoneInsecure: 'SameSiteNoneInsecure',
  UserPreferences: 'UserPreferences',
  SyntaxError: 'SyntaxError',
  SchemeNotSupported: 'SchemeNotSupported',
  OverwriteSecure: 'OverwriteSecure',
  InvalidDomain: 'InvalidDomain',
  InvalidPrefix: 'InvalidPrefix',
  UnknownError: 'UnknownError',
};

/** @enum {string} */
Protocol.Network.CookieBlockedReason = {
  SecureOnly: 'SecureOnly',
  NotOnPath: 'NotOnPath',
  DomainMismatch: 'DomainMismatch',
  SameSiteStrict: 'SameSiteStrict',
  SameSiteLax: 'SameSiteLax',
  SameSiteExtended: 'SameSiteExtended',
  SameSiteUnspecifiedTreatedAsLax: 'SameSiteUnspecifiedTreatedAsLax',
  SameSiteNoneInsecure: 'SameSiteNoneInsecure',
  UserPreferences: 'UserPreferences',
  UnknownError: 'UnknownError',
};

/** @typedef {!{blockedReasons:(!Array<Protocol.Network.SetCookieBlockedReason>), cookieLine:(string), cookie:(Protocol.Network.Cookie|undefined)}} */
Protocol.Network.BlockedSetCookieWithReason;

/** @typedef {!{blockedReasons:(!Array<Protocol.Network.CookieBlockedReason>), cookie:(Protocol.Network.Cookie)}} */
Protocol.Network.BlockedCookieWithReason;

/** @typedef {!{name:(string), value:(string), url:(string|undefined), domain:(string|undefined), path:(string|undefined), secure:(boolean|undefined), httpOnly:(boolean|undefined), sameSite:(Protocol.Network.CookieSameSite|undefined), expires:(Protocol.Network.TimeSinceEpoch|undefined)}} */
Protocol.Network.CookieParam;

/** @enum {string} */
Protocol.Network.AuthChallengeSource = {
  Server: 'Server',
  Proxy: 'Proxy',
};

/** @typedef {!{source:(Protocol.Network.AuthChallengeSource|undefined), origin:(string), scheme:(string), realm:(string)}} */
Protocol.Network.AuthChallenge;

/** @enum {string} */
Protocol.Network.AuthChallengeResponseResponse = {
  Default: 'Default',
  CancelAuth: 'CancelAuth',
  ProvideCredentials: 'ProvideCredentials',
};

/** @typedef {!{response:(Protocol.Network.AuthChallengeResponseResponse), username:(string|undefined), password:(string|undefined)}} */
Protocol.Network.AuthChallengeResponse;

/** @enum {string} */
Protocol.Network.InterceptionStage = {
  Request: 'Request',
  HeadersReceived: 'HeadersReceived',
};

/** @typedef {!{urlPattern:(string|undefined), resourceType:(Protocol.Network.ResourceType|undefined), interceptionStage:(Protocol.Network.InterceptionStage|undefined)}} */
Protocol.Network.RequestPattern;

/** @typedef {!{label:(string), signature:(string), integrity:(string), certUrl:(string|undefined), certSha256:(string|undefined), validityUrl:(string), date:(number), expires:(number), certificates:(!Array<string>|undefined)}} */
Protocol.Network.SignedExchangeSignature;

/** @typedef {!{requestUrl:(string), responseCode:(number), responseHeaders:(Protocol.Network.Headers), signatures:(!Array<Protocol.Network.SignedExchangeSignature>), headerIntegrity:(string)}} */
Protocol.Network.SignedExchangeHeader;

/** @enum {string} */
Protocol.Network.SignedExchangeErrorField = {
  SignatureSig: 'signatureSig',
  SignatureIntegrity: 'signatureIntegrity',
  SignatureCertUrl: 'signatureCertUrl',
  SignatureCertSha256: 'signatureCertSha256',
  SignatureValidityUrl: 'signatureValidityUrl',
  SignatureTimestamps: 'signatureTimestamps',
};

/** @typedef {!{message:(string), signatureIndex:(number|undefined), errorField:(Protocol.Network.SignedExchangeErrorField|undefined)}} */
Protocol.Network.SignedExchangeError;

/** @typedef {!{outerResponse:(Protocol.Network.Response), header:(Protocol.Network.SignedExchangeHeader|undefined), securityDetails:(Protocol.Network.SecurityDetails|undefined), errors:(!Array<Protocol.Network.SignedExchangeError>|undefined)}} */
Protocol.Network.SignedExchangeInfo;
/** @interface */
Protocol.NetworkDispatcher = function () {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.MonotonicTime} timestamp
 * @param {number} dataLength
 * @param {number} encodedDataLength
 */
Protocol.NetworkDispatcher.prototype.dataReceived = function (requestId, timestamp, dataLength, encodedDataLength) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.MonotonicTime} timestamp
 * @param {string} eventName
 * @param {string} eventId
 * @param {string} data
 */
Protocol.NetworkDispatcher.prototype.eventSourceMessageReceived = function (
  requestId,
  timestamp,
  eventName,
  eventId,
  data,
) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.MonotonicTime} timestamp
 * @param {Protocol.Network.ResourceType} type
 * @param {string} errorText
 * @param {boolean=} opt_canceled
 * @param {Protocol.Network.BlockedReason=} opt_blockedReason
 */
Protocol.NetworkDispatcher.prototype.loadingFailed = function (
  requestId,
  timestamp,
  type,
  errorText,
  opt_canceled,
  opt_blockedReason,
) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.MonotonicTime} timestamp
 * @param {number} encodedDataLength
 * @param {boolean=} opt_shouldReportCorbBlocking
 */
Protocol.NetworkDispatcher.prototype.loadingFinished = function (
  requestId,
  timestamp,
  encodedDataLength,
  opt_shouldReportCorbBlocking,
) {};
/**
 * @param {Protocol.Network.InterceptionId} interceptionId
 * @param {Protocol.Network.Request} request
 * @param {Protocol.Page.FrameId} frameId
 * @param {Protocol.Network.ResourceType} resourceType
 * @param {boolean} isNavigationRequest
 * @param {boolean=} opt_isDownload
 * @param {string=} opt_redirectUrl
 * @param {Protocol.Network.AuthChallenge=} opt_authChallenge
 * @param {Protocol.Network.ErrorReason=} opt_responseErrorReason
 * @param {number=} opt_responseStatusCode
 * @param {Protocol.Network.Headers=} opt_responseHeaders
 * @param {Protocol.Network.RequestId=} opt_requestId
 */
Protocol.NetworkDispatcher.prototype.requestIntercepted = function (
  interceptionId,
  request,
  frameId,
  resourceType,
  isNavigationRequest,
  opt_isDownload,
  opt_redirectUrl,
  opt_authChallenge,
  opt_responseErrorReason,
  opt_responseStatusCode,
  opt_responseHeaders,
  opt_requestId,
) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 */
Protocol.NetworkDispatcher.prototype.requestServedFromCache = function (requestId) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.LoaderId} loaderId
 * @param {string} documentURL
 * @param {Protocol.Network.Request} request
 * @param {Protocol.Network.MonotonicTime} timestamp
 * @param {Protocol.Network.TimeSinceEpoch} wallTime
 * @param {Protocol.Network.Initiator} initiator
 * @param {Protocol.Network.Response=} opt_redirectResponse
 * @param {Protocol.Network.ResourceType=} opt_type
 * @param {Protocol.Page.FrameId=} opt_frameId
 * @param {boolean=} opt_hasUserGesture
 */
Protocol.NetworkDispatcher.prototype.requestWillBeSent = function (
  requestId,
  loaderId,
  documentURL,
  request,
  timestamp,
  wallTime,
  initiator,
  opt_redirectResponse,
  opt_type,
  opt_frameId,
  opt_hasUserGesture,
) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.ResourcePriority} newPriority
 * @param {Protocol.Network.MonotonicTime} timestamp
 */
Protocol.NetworkDispatcher.prototype.resourceChangedPriority = function (requestId, newPriority, timestamp) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.SignedExchangeInfo} info
 */
Protocol.NetworkDispatcher.prototype.signedExchangeReceived = function (requestId, info) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.LoaderId} loaderId
 * @param {Protocol.Network.MonotonicTime} timestamp
 * @param {Protocol.Network.ResourceType} type
 * @param {Protocol.Network.Response} response
 * @param {Protocol.Page.FrameId=} opt_frameId
 */
Protocol.NetworkDispatcher.prototype.responseReceived = function (
  requestId,
  loaderId,
  timestamp,
  type,
  response,
  opt_frameId,
) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.MonotonicTime} timestamp
 */
Protocol.NetworkDispatcher.prototype.webSocketClosed = function (requestId, timestamp) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {string} url
 * @param {Protocol.Network.Initiator=} opt_initiator
 */
Protocol.NetworkDispatcher.prototype.webSocketCreated = function (requestId, url, opt_initiator) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.MonotonicTime} timestamp
 * @param {string} errorMessage
 */
Protocol.NetworkDispatcher.prototype.webSocketFrameError = function (requestId, timestamp, errorMessage) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.MonotonicTime} timestamp
 * @param {Protocol.Network.WebSocketFrame} response
 */
Protocol.NetworkDispatcher.prototype.webSocketFrameReceived = function (requestId, timestamp, response) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.MonotonicTime} timestamp
 * @param {Protocol.Network.WebSocketFrame} response
 */
Protocol.NetworkDispatcher.prototype.webSocketFrameSent = function (requestId, timestamp, response) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.MonotonicTime} timestamp
 * @param {Protocol.Network.WebSocketResponse} response
 */
Protocol.NetworkDispatcher.prototype.webSocketHandshakeResponseReceived = function (requestId, timestamp, response) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {Protocol.Network.MonotonicTime} timestamp
 * @param {Protocol.Network.TimeSinceEpoch} wallTime
 * @param {Protocol.Network.WebSocketRequest} request
 */
Protocol.NetworkDispatcher.prototype.webSocketWillSendHandshakeRequest = function (
  requestId,
  timestamp,
  wallTime,
  request,
) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {!Array<Protocol.Network.BlockedCookieWithReason>} blockedCookies
 * @param {Protocol.Network.Headers} headers
 */
Protocol.NetworkDispatcher.prototype.requestWillBeSentExtraInfo = function (requestId, blockedCookies, headers) {};
/**
 * @param {Protocol.Network.RequestId} requestId
 * @param {!Array<Protocol.Network.BlockedSetCookieWithReason>} blockedCookies
 * @param {Protocol.Network.Headers} headers
 * @param {string=} opt_headersText
 */
Protocol.NetworkDispatcher.prototype.responseReceivedExtraInfo = function (
  requestId,
  blockedCookies,
  headers,
  opt_headersText,
) {};
Protocol.Overlay = {};

/**
 * @constructor
 */
Protocol.OverlayAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.DisableResponse;
/**
 * @param {!Protocol.OverlayAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.DisableResponse>} */
Protocol.OverlayAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.EnableResponse;
/**
 * @param {!Protocol.OverlayAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.EnableResponse>} */
Protocol.OverlayAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {Protocol.DOM.NodeId} nodeId
 * @param {boolean=} opt_includeDistance
 * @param {boolean=} opt_includeStyle
 * @return {!Promise<?Object>}
 */
Protocol.OverlayAgent.prototype.getHighlightObjectForTest = function (nodeId, opt_includeDistance, opt_includeStyle) {};
/** @typedef {!{includeDistance: (boolean|undefined), nodeId: Protocol.DOM.NodeId, includeStyle: (boolean|undefined)}} */
Protocol.OverlayAgent.GetHighlightObjectForTestRequest;
/** @typedef {!{highlight: !Object}} */
Protocol.OverlayAgent.GetHighlightObjectForTestResponse;
/**
 * @param {!Protocol.OverlayAgent.GetHighlightObjectForTestRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.GetHighlightObjectForTestResponse>} */
Protocol.OverlayAgent.prototype.invoke_getHighlightObjectForTest = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.hideHighlight = function () {};
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.HideHighlightRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.HideHighlightResponse;
/**
 * @param {!Protocol.OverlayAgent.HideHighlightRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.HideHighlightResponse>} */
Protocol.OverlayAgent.prototype.invoke_hideHighlight = function (obj) {};

/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {Protocol.DOM.RGBA=} opt_contentColor
 * @param {Protocol.DOM.RGBA=} opt_contentOutlineColor
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.highlightFrame = function (frameId, opt_contentColor, opt_contentOutlineColor) {};
/** @typedef {!{contentOutlineColor: (Protocol.DOM.RGBA|undefined), contentColor: (Protocol.DOM.RGBA|undefined), frameId: Protocol.Page.FrameId}} */
Protocol.OverlayAgent.HighlightFrameRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.HighlightFrameResponse;
/**
 * @param {!Protocol.OverlayAgent.HighlightFrameRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.HighlightFrameResponse>} */
Protocol.OverlayAgent.prototype.invoke_highlightFrame = function (obj) {};

/**
 * @param {Protocol.Overlay.HighlightConfig} highlightConfig
 * @param {Protocol.DOM.NodeId=} opt_nodeId
 * @param {Protocol.DOM.BackendNodeId=} opt_backendNodeId
 * @param {Protocol.Runtime.RemoteObjectId=} opt_objectId
 * @param {string=} opt_selector
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.highlightNode = function (
  highlightConfig,
  opt_nodeId,
  opt_backendNodeId,
  opt_objectId,
  opt_selector,
) {};
/** @typedef {!{selector: (string|undefined), objectId: (Protocol.Runtime.RemoteObjectId|undefined), highlightConfig: Protocol.Overlay.HighlightConfig, backendNodeId: (Protocol.DOM.BackendNodeId|undefined), nodeId: (Protocol.DOM.NodeId|undefined)}} */
Protocol.OverlayAgent.HighlightNodeRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.HighlightNodeResponse;
/**
 * @param {!Protocol.OverlayAgent.HighlightNodeRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.HighlightNodeResponse>} */
Protocol.OverlayAgent.prototype.invoke_highlightNode = function (obj) {};

/**
 * @param {Protocol.DOM.Quad} quad
 * @param {Protocol.DOM.RGBA=} opt_color
 * @param {Protocol.DOM.RGBA=} opt_outlineColor
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.highlightQuad = function (quad, opt_color, opt_outlineColor) {};
/** @typedef {!{color: (Protocol.DOM.RGBA|undefined), quad: Protocol.DOM.Quad, outlineColor: (Protocol.DOM.RGBA|undefined)}} */
Protocol.OverlayAgent.HighlightQuadRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.HighlightQuadResponse;
/**
 * @param {!Protocol.OverlayAgent.HighlightQuadRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.HighlightQuadResponse>} */
Protocol.OverlayAgent.prototype.invoke_highlightQuad = function (obj) {};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {Protocol.DOM.RGBA=} opt_color
 * @param {Protocol.DOM.RGBA=} opt_outlineColor
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.highlightRect = function (x, y, width, height, opt_color, opt_outlineColor) {};
/** @typedef {!{color: (Protocol.DOM.RGBA|undefined), height: number, width: number, y: number, x: number, outlineColor: (Protocol.DOM.RGBA|undefined)}} */
Protocol.OverlayAgent.HighlightRectRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.HighlightRectResponse;
/**
 * @param {!Protocol.OverlayAgent.HighlightRectRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.HighlightRectResponse>} */
Protocol.OverlayAgent.prototype.invoke_highlightRect = function (obj) {};

/**
 * @param {Protocol.Overlay.InspectMode} mode
 * @param {Protocol.Overlay.HighlightConfig=} opt_highlightConfig
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.setInspectMode = function (mode, opt_highlightConfig) {};
/** @typedef {!{mode: Protocol.Overlay.InspectMode, highlightConfig: (Protocol.Overlay.HighlightConfig|undefined)}} */
Protocol.OverlayAgent.SetInspectModeRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.SetInspectModeResponse;
/**
 * @param {!Protocol.OverlayAgent.SetInspectModeRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.SetInspectModeResponse>} */
Protocol.OverlayAgent.prototype.invoke_setInspectMode = function (obj) {};

/**
 * @param {boolean} show
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.setShowAdHighlights = function (show) {};
/** @typedef {!{show: boolean}} */
Protocol.OverlayAgent.SetShowAdHighlightsRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.SetShowAdHighlightsResponse;
/**
 * @param {!Protocol.OverlayAgent.SetShowAdHighlightsRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.SetShowAdHighlightsResponse>} */
Protocol.OverlayAgent.prototype.invoke_setShowAdHighlights = function (obj) {};

/**
 * @param {string=} opt_message
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.setPausedInDebuggerMessage = function (opt_message) {};
/** @typedef {!{message: (string|undefined)}} */
Protocol.OverlayAgent.SetPausedInDebuggerMessageRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.SetPausedInDebuggerMessageResponse;
/**
 * @param {!Protocol.OverlayAgent.SetPausedInDebuggerMessageRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.SetPausedInDebuggerMessageResponse>} */
Protocol.OverlayAgent.prototype.invoke_setPausedInDebuggerMessage = function (obj) {};

/**
 * @param {boolean} show
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.setShowDebugBorders = function (show) {};
/** @typedef {!{show: boolean}} */
Protocol.OverlayAgent.SetShowDebugBordersRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.SetShowDebugBordersResponse;
/**
 * @param {!Protocol.OverlayAgent.SetShowDebugBordersRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.SetShowDebugBordersResponse>} */
Protocol.OverlayAgent.prototype.invoke_setShowDebugBorders = function (obj) {};

/**
 * @param {boolean} show
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.setShowFPSCounter = function (show) {};
/** @typedef {!{show: boolean}} */
Protocol.OverlayAgent.SetShowFPSCounterRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.SetShowFPSCounterResponse;
/**
 * @param {!Protocol.OverlayAgent.SetShowFPSCounterRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.SetShowFPSCounterResponse>} */
Protocol.OverlayAgent.prototype.invoke_setShowFPSCounter = function (obj) {};

/**
 * @param {boolean} result
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.setShowPaintRects = function (result) {};
/** @typedef {!{result: boolean}} */
Protocol.OverlayAgent.SetShowPaintRectsRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.SetShowPaintRectsResponse;
/**
 * @param {!Protocol.OverlayAgent.SetShowPaintRectsRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.SetShowPaintRectsResponse>} */
Protocol.OverlayAgent.prototype.invoke_setShowPaintRects = function (obj) {};

/**
 * @param {boolean} result
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.setShowLayoutShiftRegions = function (result) {};
/** @typedef {!{result: boolean}} */
Protocol.OverlayAgent.SetShowLayoutShiftRegionsRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.SetShowLayoutShiftRegionsResponse;
/**
 * @param {!Protocol.OverlayAgent.SetShowLayoutShiftRegionsRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.SetShowLayoutShiftRegionsResponse>} */
Protocol.OverlayAgent.prototype.invoke_setShowLayoutShiftRegions = function (obj) {};

/**
 * @param {boolean} show
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.setShowScrollBottleneckRects = function (show) {};
/** @typedef {!{show: boolean}} */
Protocol.OverlayAgent.SetShowScrollBottleneckRectsRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.SetShowScrollBottleneckRectsResponse;
/**
 * @param {!Protocol.OverlayAgent.SetShowScrollBottleneckRectsRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.SetShowScrollBottleneckRectsResponse>} */
Protocol.OverlayAgent.prototype.invoke_setShowScrollBottleneckRects = function (obj) {};

/**
 * @param {boolean} show
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.setShowHitTestBorders = function (show) {};
/** @typedef {!{show: boolean}} */
Protocol.OverlayAgent.SetShowHitTestBordersRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.SetShowHitTestBordersResponse;
/**
 * @param {!Protocol.OverlayAgent.SetShowHitTestBordersRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.SetShowHitTestBordersResponse>} */
Protocol.OverlayAgent.prototype.invoke_setShowHitTestBorders = function (obj) {};

/**
 * @param {boolean} show
 * @return {!Promise<undefined>}
 */
Protocol.OverlayAgent.prototype.setShowViewportSizeOnResize = function (show) {};
/** @typedef {!{show: boolean}} */
Protocol.OverlayAgent.SetShowViewportSizeOnResizeRequest;
/** @typedef {Object|undefined} */
Protocol.OverlayAgent.SetShowViewportSizeOnResizeResponse;
/**
 * @param {!Protocol.OverlayAgent.SetShowViewportSizeOnResizeRequest} obj
 * @return {!Promise<!Protocol.OverlayAgent.SetShowViewportSizeOnResizeResponse>} */
Protocol.OverlayAgent.prototype.invoke_setShowViewportSizeOnResize = function (obj) {};

/** @typedef {!{showInfo:(boolean|undefined), showStyles:(boolean|undefined), showRulers:(boolean|undefined), showExtensionLines:(boolean|undefined), contentColor:(Protocol.DOM.RGBA|undefined), paddingColor:(Protocol.DOM.RGBA|undefined), borderColor:(Protocol.DOM.RGBA|undefined), marginColor:(Protocol.DOM.RGBA|undefined), eventTargetColor:(Protocol.DOM.RGBA|undefined), shapeColor:(Protocol.DOM.RGBA|undefined), shapeMarginColor:(Protocol.DOM.RGBA|undefined), cssGridColor:(Protocol.DOM.RGBA|undefined)}} */
Protocol.Overlay.HighlightConfig;

/** @enum {string} */
Protocol.Overlay.InspectMode = {
  SearchForNode: 'searchForNode',
  SearchForUAShadowDOM: 'searchForUAShadowDOM',
  CaptureAreaScreenshot: 'captureAreaScreenshot',
  ShowDistances: 'showDistances',
  None: 'none',
};
/** @interface */
Protocol.OverlayDispatcher = function () {};
/**
 * @param {Protocol.DOM.BackendNodeId} backendNodeId
 */
Protocol.OverlayDispatcher.prototype.inspectNodeRequested = function (backendNodeId) {};
/**
 * @param {Protocol.DOM.NodeId} nodeId
 */
Protocol.OverlayDispatcher.prototype.nodeHighlightRequested = function (nodeId) {};
/**
 * @param {Protocol.Page.Viewport} viewport
 */
Protocol.OverlayDispatcher.prototype.screenshotRequested = function (viewport) {};
Protocol.OverlayDispatcher.prototype.inspectModeCanceled = function () {};
Protocol.Page = {};

/**
 * @constructor
 */
Protocol.PageAgent = function () {};

/**
 * @param {string} scriptSource
 * @return {!Promise<?Protocol.Page.ScriptIdentifier>}
 */
Protocol.PageAgent.prototype.addScriptToEvaluateOnLoad = function (scriptSource) {};
/** @typedef {!{scriptSource: string}} */
Protocol.PageAgent.AddScriptToEvaluateOnLoadRequest;
/** @typedef {!{identifier: Protocol.Page.ScriptIdentifier}} */
Protocol.PageAgent.AddScriptToEvaluateOnLoadResponse;
/**
 * @param {!Protocol.PageAgent.AddScriptToEvaluateOnLoadRequest} obj
 * @return {!Promise<!Protocol.PageAgent.AddScriptToEvaluateOnLoadResponse>} */
Protocol.PageAgent.prototype.invoke_addScriptToEvaluateOnLoad = function (obj) {};

/**
 * @param {string} source
 * @param {string=} opt_worldName
 * @return {!Promise<?Protocol.Page.ScriptIdentifier>}
 */
Protocol.PageAgent.prototype.addScriptToEvaluateOnNewDocument = function (source, opt_worldName) {};
/** @typedef {!{source: string, worldName: (string|undefined)}} */
Protocol.PageAgent.AddScriptToEvaluateOnNewDocumentRequest;
/** @typedef {!{identifier: Protocol.Page.ScriptIdentifier}} */
Protocol.PageAgent.AddScriptToEvaluateOnNewDocumentResponse;
/**
 * @param {!Protocol.PageAgent.AddScriptToEvaluateOnNewDocumentRequest} obj
 * @return {!Promise<!Protocol.PageAgent.AddScriptToEvaluateOnNewDocumentResponse>} */
Protocol.PageAgent.prototype.invoke_addScriptToEvaluateOnNewDocument = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.bringToFront = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.BringToFrontRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.BringToFrontResponse;
/**
 * @param {!Protocol.PageAgent.BringToFrontRequest} obj
 * @return {!Promise<!Protocol.PageAgent.BringToFrontResponse>} */
Protocol.PageAgent.prototype.invoke_bringToFront = function (obj) {};

/**
 * @param {string=} opt_format
 * @param {number=} opt_quality
 * @param {Protocol.Page.Viewport=} opt_clip
 * @param {boolean=} opt_fromSurface
 * @return {!Promise<?string>}
 */
Protocol.PageAgent.prototype.captureScreenshot = function (opt_format, opt_quality, opt_clip, opt_fromSurface) {};
/** @typedef {!{fromSurface: (boolean|undefined), quality: (number|undefined), clip: (Protocol.Page.Viewport|undefined), format: (string|undefined)}} */
Protocol.PageAgent.CaptureScreenshotRequest;
/** @typedef {!{data: string}} */
Protocol.PageAgent.CaptureScreenshotResponse;
/**
 * @param {!Protocol.PageAgent.CaptureScreenshotRequest} obj
 * @return {!Promise<!Protocol.PageAgent.CaptureScreenshotResponse>} */
Protocol.PageAgent.prototype.invoke_captureScreenshot = function (obj) {};

/**
 * @param {string=} opt_format
 * @return {!Promise<?string>}
 */
Protocol.PageAgent.prototype.captureSnapshot = function (opt_format) {};
/** @typedef {!{format: (string|undefined)}} */
Protocol.PageAgent.CaptureSnapshotRequest;
/** @typedef {!{data: string}} */
Protocol.PageAgent.CaptureSnapshotResponse;
/**
 * @param {!Protocol.PageAgent.CaptureSnapshotRequest} obj
 * @return {!Promise<!Protocol.PageAgent.CaptureSnapshotResponse>} */
Protocol.PageAgent.prototype.invoke_captureSnapshot = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.clearDeviceMetricsOverride = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.ClearDeviceMetricsOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.ClearDeviceMetricsOverrideResponse;
/**
 * @param {!Protocol.PageAgent.ClearDeviceMetricsOverrideRequest} obj
 * @return {!Promise<!Protocol.PageAgent.ClearDeviceMetricsOverrideResponse>} */
Protocol.PageAgent.prototype.invoke_clearDeviceMetricsOverride = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.clearDeviceOrientationOverride = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.ClearDeviceOrientationOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.ClearDeviceOrientationOverrideResponse;
/**
 * @param {!Protocol.PageAgent.ClearDeviceOrientationOverrideRequest} obj
 * @return {!Promise<!Protocol.PageAgent.ClearDeviceOrientationOverrideResponse>} */
Protocol.PageAgent.prototype.invoke_clearDeviceOrientationOverride = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.clearGeolocationOverride = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.ClearGeolocationOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.ClearGeolocationOverrideResponse;
/**
 * @param {!Protocol.PageAgent.ClearGeolocationOverrideRequest} obj
 * @return {!Promise<!Protocol.PageAgent.ClearGeolocationOverrideResponse>} */
Protocol.PageAgent.prototype.invoke_clearGeolocationOverride = function (obj) {};

/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {string=} opt_worldName
 * @param {boolean=} opt_grantUniveralAccess
 * @return {!Promise<?Protocol.Runtime.ExecutionContextId>}
 */
Protocol.PageAgent.prototype.createIsolatedWorld = function (frameId, opt_worldName, opt_grantUniveralAccess) {};
/** @typedef {!{grantUniveralAccess: (boolean|undefined), worldName: (string|undefined), frameId: Protocol.Page.FrameId}} */
Protocol.PageAgent.CreateIsolatedWorldRequest;
/** @typedef {!{executionContextId: Protocol.Runtime.ExecutionContextId}} */
Protocol.PageAgent.CreateIsolatedWorldResponse;
/**
 * @param {!Protocol.PageAgent.CreateIsolatedWorldRequest} obj
 * @return {!Promise<!Protocol.PageAgent.CreateIsolatedWorldResponse>} */
Protocol.PageAgent.prototype.invoke_createIsolatedWorld = function (obj) {};

/**
 * @param {string} cookieName
 * @param {string} url
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.deleteCookie = function (cookieName, url) {};
/** @typedef {!{url: string, cookieName: string}} */
Protocol.PageAgent.DeleteCookieRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.DeleteCookieResponse;
/**
 * @param {!Protocol.PageAgent.DeleteCookieRequest} obj
 * @return {!Promise<!Protocol.PageAgent.DeleteCookieResponse>} */
Protocol.PageAgent.prototype.invoke_deleteCookie = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.DisableResponse;
/**
 * @param {!Protocol.PageAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.PageAgent.DisableResponse>} */
Protocol.PageAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.EnableResponse;
/**
 * @param {!Protocol.PageAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.PageAgent.EnableResponse>} */
Protocol.PageAgent.prototype.invoke_enable = function (obj) {};

/**
 * @return {!Promise<?string>}
 */
Protocol.PageAgent.prototype.getAppManifest = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.GetAppManifestRequest;
/** @typedef {!{url: string, errors: !Array<Protocol.Page.AppManifestError>, data: string}} */
Protocol.PageAgent.GetAppManifestResponse;
/**
 * @param {!Protocol.PageAgent.GetAppManifestRequest} obj
 * @return {!Promise<!Protocol.PageAgent.GetAppManifestResponse>} */
Protocol.PageAgent.prototype.invoke_getAppManifest = function (obj) {};

/**
 * @return {!Promise<?Array<string>>}
 */
Protocol.PageAgent.prototype.getInstallabilityErrors = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.GetInstallabilityErrorsRequest;
/** @typedef {!{errors: !Array<string>}} */
Protocol.PageAgent.GetInstallabilityErrorsResponse;
/**
 * @param {!Protocol.PageAgent.GetInstallabilityErrorsRequest} obj
 * @return {!Promise<!Protocol.PageAgent.GetInstallabilityErrorsResponse>} */
Protocol.PageAgent.prototype.invoke_getInstallabilityErrors = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.Network.Cookie>>}
 */
Protocol.PageAgent.prototype.getCookies = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.GetCookiesRequest;
/** @typedef {!{cookies: !Array<Protocol.Network.Cookie>}} */
Protocol.PageAgent.GetCookiesResponse;
/**
 * @param {!Protocol.PageAgent.GetCookiesRequest} obj
 * @return {!Promise<!Protocol.PageAgent.GetCookiesResponse>} */
Protocol.PageAgent.prototype.invoke_getCookies = function (obj) {};

/**
 * @return {!Promise<?Protocol.Page.FrameTree>}
 */
Protocol.PageAgent.prototype.getFrameTree = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.GetFrameTreeRequest;
/** @typedef {!{frameTree: Protocol.Page.FrameTree}} */
Protocol.PageAgent.GetFrameTreeResponse;
/**
 * @param {!Protocol.PageAgent.GetFrameTreeRequest} obj
 * @return {!Promise<!Protocol.PageAgent.GetFrameTreeResponse>} */
Protocol.PageAgent.prototype.invoke_getFrameTree = function (obj) {};

/**
 * @return {!Promise<?Protocol.Page.LayoutViewport>}
 */
Protocol.PageAgent.prototype.getLayoutMetrics = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.GetLayoutMetricsRequest;
/** @typedef {!{visualViewport: Protocol.Page.VisualViewport, layoutViewport: Protocol.Page.LayoutViewport, contentSize: Protocol.DOM.Rect}} */
Protocol.PageAgent.GetLayoutMetricsResponse;
/**
 * @param {!Protocol.PageAgent.GetLayoutMetricsRequest} obj
 * @return {!Promise<!Protocol.PageAgent.GetLayoutMetricsResponse>} */
Protocol.PageAgent.prototype.invoke_getLayoutMetrics = function (obj) {};

/**
 * @return {!Promise<?number>}
 */
Protocol.PageAgent.prototype.getNavigationHistory = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.GetNavigationHistoryRequest;
/** @typedef {!{currentIndex: number, entries: !Array<Protocol.Page.NavigationEntry>}} */
Protocol.PageAgent.GetNavigationHistoryResponse;
/**
 * @param {!Protocol.PageAgent.GetNavigationHistoryRequest} obj
 * @return {!Promise<!Protocol.PageAgent.GetNavigationHistoryResponse>} */
Protocol.PageAgent.prototype.invoke_getNavigationHistory = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.resetNavigationHistory = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.ResetNavigationHistoryRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.ResetNavigationHistoryResponse;
/**
 * @param {!Protocol.PageAgent.ResetNavigationHistoryRequest} obj
 * @return {!Promise<!Protocol.PageAgent.ResetNavigationHistoryResponse>} */
Protocol.PageAgent.prototype.invoke_resetNavigationHistory = function (obj) {};

/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {string} url
 * @return {!Promise<?string>}
 */
Protocol.PageAgent.prototype.getResourceContent = function (frameId, url) {};
/** @typedef {!{url: string, frameId: Protocol.Page.FrameId}} */
Protocol.PageAgent.GetResourceContentRequest;
/** @typedef {!{content: string, base64Encoded: boolean}} */
Protocol.PageAgent.GetResourceContentResponse;
/**
 * @param {!Protocol.PageAgent.GetResourceContentRequest} obj
 * @return {!Promise<!Protocol.PageAgent.GetResourceContentResponse>} */
Protocol.PageAgent.prototype.invoke_getResourceContent = function (obj) {};

/**
 * @return {!Promise<?Protocol.Page.FrameResourceTree>}
 */
Protocol.PageAgent.prototype.getResourceTree = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.GetResourceTreeRequest;
/** @typedef {!{frameTree: Protocol.Page.FrameResourceTree}} */
Protocol.PageAgent.GetResourceTreeResponse;
/**
 * @param {!Protocol.PageAgent.GetResourceTreeRequest} obj
 * @return {!Promise<!Protocol.PageAgent.GetResourceTreeResponse>} */
Protocol.PageAgent.prototype.invoke_getResourceTree = function (obj) {};

/**
 * @param {boolean} accept
 * @param {string=} opt_promptText
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.handleJavaScriptDialog = function (accept, opt_promptText) {};
/** @typedef {!{promptText: (string|undefined), accept: boolean}} */
Protocol.PageAgent.HandleJavaScriptDialogRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.HandleJavaScriptDialogResponse;
/**
 * @param {!Protocol.PageAgent.HandleJavaScriptDialogRequest} obj
 * @return {!Promise<!Protocol.PageAgent.HandleJavaScriptDialogResponse>} */
Protocol.PageAgent.prototype.invoke_handleJavaScriptDialog = function (obj) {};

/**
 * @param {string} url
 * @param {string=} opt_referrer
 * @param {Protocol.Page.TransitionType=} opt_transitionType
 * @param {Protocol.Page.FrameId=} opt_frameId
 * @return {!Promise<?Protocol.Page.FrameId>}
 */
Protocol.PageAgent.prototype.navigate = function (url, opt_referrer, opt_transitionType, opt_frameId) {};
/** @typedef {!{url: string, referrer: (string|undefined), frameId: (Protocol.Page.FrameId|undefined), transitionType: (Protocol.Page.TransitionType|undefined)}} */
Protocol.PageAgent.NavigateRequest;
/** @typedef {!{loaderId: Protocol.Network.LoaderId, errorText: string, frameId: Protocol.Page.FrameId}} */
Protocol.PageAgent.NavigateResponse;
/**
 * @param {!Protocol.PageAgent.NavigateRequest} obj
 * @return {!Promise<!Protocol.PageAgent.NavigateResponse>} */
Protocol.PageAgent.prototype.invoke_navigate = function (obj) {};

/**
 * @param {number} entryId
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.navigateToHistoryEntry = function (entryId) {};
/** @typedef {!{entryId: number}} */
Protocol.PageAgent.NavigateToHistoryEntryRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.NavigateToHistoryEntryResponse;
/**
 * @param {!Protocol.PageAgent.NavigateToHistoryEntryRequest} obj
 * @return {!Promise<!Protocol.PageAgent.NavigateToHistoryEntryResponse>} */
Protocol.PageAgent.prototype.invoke_navigateToHistoryEntry = function (obj) {};

/**
 * @param {boolean=} opt_landscape
 * @param {boolean=} opt_displayHeaderFooter
 * @param {boolean=} opt_printBackground
 * @param {number=} opt_scale
 * @param {number=} opt_paperWidth
 * @param {number=} opt_paperHeight
 * @param {number=} opt_marginTop
 * @param {number=} opt_marginBottom
 * @param {number=} opt_marginLeft
 * @param {number=} opt_marginRight
 * @param {string=} opt_pageRanges
 * @param {boolean=} opt_ignoreInvalidPageRanges
 * @param {string=} opt_headerTemplate
 * @param {string=} opt_footerTemplate
 * @param {boolean=} opt_preferCSSPageSize
 * @param {string=} opt_transferMode
 * @return {!Promise<?string>}
 */
Protocol.PageAgent.prototype.printToPDF = function (
  opt_landscape,
  opt_displayHeaderFooter,
  opt_printBackground,
  opt_scale,
  opt_paperWidth,
  opt_paperHeight,
  opt_marginTop,
  opt_marginBottom,
  opt_marginLeft,
  opt_marginRight,
  opt_pageRanges,
  opt_ignoreInvalidPageRanges,
  opt_headerTemplate,
  opt_footerTemplate,
  opt_preferCSSPageSize,
  opt_transferMode,
) {};
/** @typedef {!{paperHeight: (number|undefined), scale: (number|undefined), footerTemplate: (string|undefined), displayHeaderFooter: (boolean|undefined), transferMode: (string|undefined), marginBottom: (number|undefined), paperWidth: (number|undefined), headerTemplate: (string|undefined), marginLeft: (number|undefined), preferCSSPageSize: (boolean|undefined), printBackground: (boolean|undefined), marginRight: (number|undefined), ignoreInvalidPageRanges: (boolean|undefined), pageRanges: (string|undefined), marginTop: (number|undefined), landscape: (boolean|undefined)}} */
Protocol.PageAgent.PrintToPDFRequest;
/** @typedef {!{data: string, stream: Protocol.IO.StreamHandle}} */
Protocol.PageAgent.PrintToPDFResponse;
/**
 * @param {!Protocol.PageAgent.PrintToPDFRequest} obj
 * @return {!Promise<!Protocol.PageAgent.PrintToPDFResponse>} */
Protocol.PageAgent.prototype.invoke_printToPDF = function (obj) {};

/**
 * @param {boolean=} opt_ignoreCache
 * @param {string=} opt_scriptToEvaluateOnLoad
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.reload = function (opt_ignoreCache, opt_scriptToEvaluateOnLoad) {};
/** @typedef {!{scriptToEvaluateOnLoad: (string|undefined), ignoreCache: (boolean|undefined)}} */
Protocol.PageAgent.ReloadRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.ReloadResponse;
/**
 * @param {!Protocol.PageAgent.ReloadRequest} obj
 * @return {!Promise<!Protocol.PageAgent.ReloadResponse>} */
Protocol.PageAgent.prototype.invoke_reload = function (obj) {};

/**
 * @param {Protocol.Page.ScriptIdentifier} identifier
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.removeScriptToEvaluateOnLoad = function (identifier) {};
/** @typedef {!{identifier: Protocol.Page.ScriptIdentifier}} */
Protocol.PageAgent.RemoveScriptToEvaluateOnLoadRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.RemoveScriptToEvaluateOnLoadResponse;
/**
 * @param {!Protocol.PageAgent.RemoveScriptToEvaluateOnLoadRequest} obj
 * @return {!Promise<!Protocol.PageAgent.RemoveScriptToEvaluateOnLoadResponse>} */
Protocol.PageAgent.prototype.invoke_removeScriptToEvaluateOnLoad = function (obj) {};

/**
 * @param {Protocol.Page.ScriptIdentifier} identifier
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.removeScriptToEvaluateOnNewDocument = function (identifier) {};
/** @typedef {!{identifier: Protocol.Page.ScriptIdentifier}} */
Protocol.PageAgent.RemoveScriptToEvaluateOnNewDocumentRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.RemoveScriptToEvaluateOnNewDocumentResponse;
/**
 * @param {!Protocol.PageAgent.RemoveScriptToEvaluateOnNewDocumentRequest} obj
 * @return {!Promise<!Protocol.PageAgent.RemoveScriptToEvaluateOnNewDocumentResponse>} */
Protocol.PageAgent.prototype.invoke_removeScriptToEvaluateOnNewDocument = function (obj) {};

/**
 * @param {number} sessionId
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.screencastFrameAck = function (sessionId) {};
/** @typedef {!{sessionId: number}} */
Protocol.PageAgent.ScreencastFrameAckRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.ScreencastFrameAckResponse;
/**
 * @param {!Protocol.PageAgent.ScreencastFrameAckRequest} obj
 * @return {!Promise<!Protocol.PageAgent.ScreencastFrameAckResponse>} */
Protocol.PageAgent.prototype.invoke_screencastFrameAck = function (obj) {};

/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {string} url
 * @param {string} query
 * @param {boolean=} opt_caseSensitive
 * @param {boolean=} opt_isRegex
 * @return {!Promise<?Array<Protocol.Debugger.SearchMatch>>}
 */
Protocol.PageAgent.prototype.searchInResource = function (frameId, url, query, opt_caseSensitive, opt_isRegex) {};
/** @typedef {!{url: string, query: string, caseSensitive: (boolean|undefined), isRegex: (boolean|undefined), frameId: Protocol.Page.FrameId}} */
Protocol.PageAgent.SearchInResourceRequest;
/** @typedef {!{result: !Array<Protocol.Debugger.SearchMatch>}} */
Protocol.PageAgent.SearchInResourceResponse;
/**
 * @param {!Protocol.PageAgent.SearchInResourceRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SearchInResourceResponse>} */
Protocol.PageAgent.prototype.invoke_searchInResource = function (obj) {};

/**
 * @param {boolean} enabled
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setAdBlockingEnabled = function (enabled) {};
/** @typedef {!{enabled: boolean}} */
Protocol.PageAgent.SetAdBlockingEnabledRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetAdBlockingEnabledResponse;
/**
 * @param {!Protocol.PageAgent.SetAdBlockingEnabledRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetAdBlockingEnabledResponse>} */
Protocol.PageAgent.prototype.invoke_setAdBlockingEnabled = function (obj) {};

/**
 * @param {boolean} enabled
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setBypassCSP = function (enabled) {};
/** @typedef {!{enabled: boolean}} */
Protocol.PageAgent.SetBypassCSPRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetBypassCSPResponse;
/**
 * @param {!Protocol.PageAgent.SetBypassCSPRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetBypassCSPResponse>} */
Protocol.PageAgent.prototype.invoke_setBypassCSP = function (obj) {};

/**
 * @param {number} width
 * @param {number} height
 * @param {number} deviceScaleFactor
 * @param {boolean} mobile
 * @param {number=} opt_scale
 * @param {number=} opt_screenWidth
 * @param {number=} opt_screenHeight
 * @param {number=} opt_positionX
 * @param {number=} opt_positionY
 * @param {boolean=} opt_dontSetVisibleSize
 * @param {Protocol.Emulation.ScreenOrientation=} opt_screenOrientation
 * @param {Protocol.Page.Viewport=} opt_viewport
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setDeviceMetricsOverride = function (
  width,
  height,
  deviceScaleFactor,
  mobile,
  opt_scale,
  opt_screenWidth,
  opt_screenHeight,
  opt_positionX,
  opt_positionY,
  opt_dontSetVisibleSize,
  opt_screenOrientation,
  opt_viewport,
) {};
/** @typedef {!{deviceScaleFactor: number, positionX: (number|undefined), scale: (number|undefined), screenHeight: (number|undefined), mobile: boolean, screenOrientation: (Protocol.Emulation.ScreenOrientation|undefined), dontSetVisibleSize: (boolean|undefined), height: number, width: number, positionY: (number|undefined), screenWidth: (number|undefined), viewport: (Protocol.Page.Viewport|undefined)}} */
Protocol.PageAgent.SetDeviceMetricsOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetDeviceMetricsOverrideResponse;
/**
 * @param {!Protocol.PageAgent.SetDeviceMetricsOverrideRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetDeviceMetricsOverrideResponse>} */
Protocol.PageAgent.prototype.invoke_setDeviceMetricsOverride = function (obj) {};

/**
 * @param {number} alpha
 * @param {number} beta
 * @param {number} gamma
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setDeviceOrientationOverride = function (alpha, beta, gamma) {};
/** @typedef {!{alpha: number, beta: number, gamma: number}} */
Protocol.PageAgent.SetDeviceOrientationOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetDeviceOrientationOverrideResponse;
/**
 * @param {!Protocol.PageAgent.SetDeviceOrientationOverrideRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetDeviceOrientationOverrideResponse>} */
Protocol.PageAgent.prototype.invoke_setDeviceOrientationOverride = function (obj) {};

/**
 * @param {Protocol.Page.FontFamilies} fontFamilies
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setFontFamilies = function (fontFamilies) {};
/** @typedef {!{fontFamilies: Protocol.Page.FontFamilies}} */
Protocol.PageAgent.SetFontFamiliesRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetFontFamiliesResponse;
/**
 * @param {!Protocol.PageAgent.SetFontFamiliesRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetFontFamiliesResponse>} */
Protocol.PageAgent.prototype.invoke_setFontFamilies = function (obj) {};

/**
 * @param {Protocol.Page.FontSizes} fontSizes
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setFontSizes = function (fontSizes) {};
/** @typedef {!{fontSizes: Protocol.Page.FontSizes}} */
Protocol.PageAgent.SetFontSizesRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetFontSizesResponse;
/**
 * @param {!Protocol.PageAgent.SetFontSizesRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetFontSizesResponse>} */
Protocol.PageAgent.prototype.invoke_setFontSizes = function (obj) {};

/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {string} html
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setDocumentContent = function (frameId, html) {};
/** @typedef {!{html: string, frameId: Protocol.Page.FrameId}} */
Protocol.PageAgent.SetDocumentContentRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetDocumentContentResponse;
/**
 * @param {!Protocol.PageAgent.SetDocumentContentRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetDocumentContentResponse>} */
Protocol.PageAgent.prototype.invoke_setDocumentContent = function (obj) {};

/**
 * @param {string} behavior
 * @param {string=} opt_downloadPath
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setDownloadBehavior = function (behavior, opt_downloadPath) {};
/** @typedef {!{downloadPath: (string|undefined), behavior: string}} */
Protocol.PageAgent.SetDownloadBehaviorRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetDownloadBehaviorResponse;
/**
 * @param {!Protocol.PageAgent.SetDownloadBehaviorRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetDownloadBehaviorResponse>} */
Protocol.PageAgent.prototype.invoke_setDownloadBehavior = function (obj) {};

/**
 * @param {number=} opt_latitude
 * @param {number=} opt_longitude
 * @param {number=} opt_accuracy
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setGeolocationOverride = function (opt_latitude, opt_longitude, opt_accuracy) {};
/** @typedef {!{latitude: (number|undefined), longitude: (number|undefined), accuracy: (number|undefined)}} */
Protocol.PageAgent.SetGeolocationOverrideRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetGeolocationOverrideResponse;
/**
 * @param {!Protocol.PageAgent.SetGeolocationOverrideRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetGeolocationOverrideResponse>} */
Protocol.PageAgent.prototype.invoke_setGeolocationOverride = function (obj) {};

/**
 * @param {boolean} enabled
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setLifecycleEventsEnabled = function (enabled) {};
/** @typedef {!{enabled: boolean}} */
Protocol.PageAgent.SetLifecycleEventsEnabledRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetLifecycleEventsEnabledResponse;
/**
 * @param {!Protocol.PageAgent.SetLifecycleEventsEnabledRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetLifecycleEventsEnabledResponse>} */
Protocol.PageAgent.prototype.invoke_setLifecycleEventsEnabled = function (obj) {};

/**
 * @param {boolean} enabled
 * @param {string=} opt_configuration
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setTouchEmulationEnabled = function (enabled, opt_configuration) {};
/** @typedef {!{configuration: (string|undefined), enabled: boolean}} */
Protocol.PageAgent.SetTouchEmulationEnabledRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetTouchEmulationEnabledResponse;
/**
 * @param {!Protocol.PageAgent.SetTouchEmulationEnabledRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetTouchEmulationEnabledResponse>} */
Protocol.PageAgent.prototype.invoke_setTouchEmulationEnabled = function (obj) {};

/**
 * @param {string=} opt_format
 * @param {number=} opt_quality
 * @param {number=} opt_maxWidth
 * @param {number=} opt_maxHeight
 * @param {number=} opt_everyNthFrame
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.startScreencast = function (
  opt_format,
  opt_quality,
  opt_maxWidth,
  opt_maxHeight,
  opt_everyNthFrame,
) {};
/** @typedef {!{everyNthFrame: (number|undefined), quality: (number|undefined), maxHeight: (number|undefined), maxWidth: (number|undefined), format: (string|undefined)}} */
Protocol.PageAgent.StartScreencastRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.StartScreencastResponse;
/**
 * @param {!Protocol.PageAgent.StartScreencastRequest} obj
 * @return {!Promise<!Protocol.PageAgent.StartScreencastResponse>} */
Protocol.PageAgent.prototype.invoke_startScreencast = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.stopLoading = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.StopLoadingRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.StopLoadingResponse;
/**
 * @param {!Protocol.PageAgent.StopLoadingRequest} obj
 * @return {!Promise<!Protocol.PageAgent.StopLoadingResponse>} */
Protocol.PageAgent.prototype.invoke_stopLoading = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.crash = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.CrashRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.CrashResponse;
/**
 * @param {!Protocol.PageAgent.CrashRequest} obj
 * @return {!Promise<!Protocol.PageAgent.CrashResponse>} */
Protocol.PageAgent.prototype.invoke_crash = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.close = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.CloseRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.CloseResponse;
/**
 * @param {!Protocol.PageAgent.CloseRequest} obj
 * @return {!Promise<!Protocol.PageAgent.CloseResponse>} */
Protocol.PageAgent.prototype.invoke_close = function (obj) {};

/**
 * @param {string} state
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setWebLifecycleState = function (state) {};
/** @typedef {!{state: string}} */
Protocol.PageAgent.SetWebLifecycleStateRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetWebLifecycleStateResponse;
/**
 * @param {!Protocol.PageAgent.SetWebLifecycleStateRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetWebLifecycleStateResponse>} */
Protocol.PageAgent.prototype.invoke_setWebLifecycleState = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.stopScreencast = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.StopScreencastRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.StopScreencastResponse;
/**
 * @param {!Protocol.PageAgent.StopScreencastRequest} obj
 * @return {!Promise<!Protocol.PageAgent.StopScreencastResponse>} */
Protocol.PageAgent.prototype.invoke_stopScreencast = function (obj) {};

/**
 * @param {boolean} enabled
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setProduceCompilationCache = function (enabled) {};
/** @typedef {!{enabled: boolean}} */
Protocol.PageAgent.SetProduceCompilationCacheRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetProduceCompilationCacheResponse;
/**
 * @param {!Protocol.PageAgent.SetProduceCompilationCacheRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetProduceCompilationCacheResponse>} */
Protocol.PageAgent.prototype.invoke_setProduceCompilationCache = function (obj) {};

/**
 * @param {string} url
 * @param {string} data
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.addCompilationCache = function (url, data) {};
/** @typedef {!{url: string, data: string}} */
Protocol.PageAgent.AddCompilationCacheRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.AddCompilationCacheResponse;
/**
 * @param {!Protocol.PageAgent.AddCompilationCacheRequest} obj
 * @return {!Promise<!Protocol.PageAgent.AddCompilationCacheResponse>} */
Protocol.PageAgent.prototype.invoke_addCompilationCache = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.clearCompilationCache = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.ClearCompilationCacheRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.ClearCompilationCacheResponse;
/**
 * @param {!Protocol.PageAgent.ClearCompilationCacheRequest} obj
 * @return {!Promise<!Protocol.PageAgent.ClearCompilationCacheResponse>} */
Protocol.PageAgent.prototype.invoke_clearCompilationCache = function (obj) {};

/**
 * @param {string} message
 * @param {string=} opt_group
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.generateTestReport = function (message, opt_group) {};
/** @typedef {!{message: string, group: (string|undefined)}} */
Protocol.PageAgent.GenerateTestReportRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.GenerateTestReportResponse;
/**
 * @param {!Protocol.PageAgent.GenerateTestReportRequest} obj
 * @return {!Promise<!Protocol.PageAgent.GenerateTestReportResponse>} */
Protocol.PageAgent.prototype.invoke_generateTestReport = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.waitForDebugger = function () {};
/** @typedef {Object|undefined} */
Protocol.PageAgent.WaitForDebuggerRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.WaitForDebuggerResponse;
/**
 * @param {!Protocol.PageAgent.WaitForDebuggerRequest} obj
 * @return {!Promise<!Protocol.PageAgent.WaitForDebuggerResponse>} */
Protocol.PageAgent.prototype.invoke_waitForDebugger = function (obj) {};

/**
 * @param {boolean} enabled
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.setInterceptFileChooserDialog = function (enabled) {};
/** @typedef {!{enabled: boolean}} */
Protocol.PageAgent.SetInterceptFileChooserDialogRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.SetInterceptFileChooserDialogResponse;
/**
 * @param {!Protocol.PageAgent.SetInterceptFileChooserDialogRequest} obj
 * @return {!Promise<!Protocol.PageAgent.SetInterceptFileChooserDialogResponse>} */
Protocol.PageAgent.prototype.invoke_setInterceptFileChooserDialog = function (obj) {};

/**
 * @param {string} action
 * @param {!Array<string>=} opt_files
 * @return {!Promise<undefined>}
 */
Protocol.PageAgent.prototype.handleFileChooser = function (action, opt_files) {};
/** @typedef {!{action: string, files: (!Array<string>|undefined)}} */
Protocol.PageAgent.HandleFileChooserRequest;
/** @typedef {Object|undefined} */
Protocol.PageAgent.HandleFileChooserResponse;
/**
 * @param {!Protocol.PageAgent.HandleFileChooserRequest} obj
 * @return {!Promise<!Protocol.PageAgent.HandleFileChooserResponse>} */
Protocol.PageAgent.prototype.invoke_handleFileChooser = function (obj) {};

/** @typedef {string} */
Protocol.Page.FrameId;

/** @typedef {!{id:(Protocol.Page.FrameId), parentId:(string|undefined), loaderId:(Protocol.Network.LoaderId), name:(string|undefined), url:(string), urlFragment:(string|undefined), securityOrigin:(string), mimeType:(string), unreachableUrl:(string|undefined)}} */
Protocol.Page.Frame;

/** @typedef {!{url:(string), type:(Protocol.Network.ResourceType), mimeType:(string), lastModified:(Protocol.Network.TimeSinceEpoch|undefined), contentSize:(number|undefined), failed:(boolean|undefined), canceled:(boolean|undefined)}} */
Protocol.Page.FrameResource;

/** @typedef {!{frame:(Protocol.Page.Frame), childFrames:(!Array<Protocol.Page.FrameResourceTree>|undefined), resources:(!Array<Protocol.Page.FrameResource>)}} */
Protocol.Page.FrameResourceTree;

/** @typedef {!{frame:(Protocol.Page.Frame), childFrames:(!Array<Protocol.Page.FrameTree>|undefined)}} */
Protocol.Page.FrameTree;

/** @typedef {string} */
Protocol.Page.ScriptIdentifier;

/** @enum {string} */
Protocol.Page.TransitionType = {
  Link: 'link',
  Typed: 'typed',
  Address_bar: 'address_bar',
  Auto_bookmark: 'auto_bookmark',
  Auto_subframe: 'auto_subframe',
  Manual_subframe: 'manual_subframe',
  Generated: 'generated',
  Auto_toplevel: 'auto_toplevel',
  Form_submit: 'form_submit',
  Reload: 'reload',
  Keyword: 'keyword',
  Keyword_generated: 'keyword_generated',
  Other: 'other',
};

/** @typedef {!{id:(number), url:(string), userTypedURL:(string), title:(string), transitionType:(Protocol.Page.TransitionType)}} */
Protocol.Page.NavigationEntry;

/** @typedef {!{offsetTop:(number), pageScaleFactor:(number), deviceWidth:(number), deviceHeight:(number), scrollOffsetX:(number), scrollOffsetY:(number), timestamp:(Protocol.Network.TimeSinceEpoch|undefined)}} */
Protocol.Page.ScreencastFrameMetadata;

/** @enum {string} */
Protocol.Page.DialogType = {
  Alert: 'alert',
  Confirm: 'confirm',
  Prompt: 'prompt',
  Beforeunload: 'beforeunload',
};

/** @typedef {!{message:(string), critical:(number), line:(number), column:(number)}} */
Protocol.Page.AppManifestError;

/** @typedef {!{pageX:(number), pageY:(number), clientWidth:(number), clientHeight:(number)}} */
Protocol.Page.LayoutViewport;

/** @typedef {!{offsetX:(number), offsetY:(number), pageX:(number), pageY:(number), clientWidth:(number), clientHeight:(number), scale:(number), zoom:(number|undefined)}} */
Protocol.Page.VisualViewport;

/** @typedef {!{x:(number), y:(number), width:(number), height:(number), scale:(number)}} */
Protocol.Page.Viewport;

/** @typedef {!{standard:(string|undefined), fixed:(string|undefined), serif:(string|undefined), sansSerif:(string|undefined), cursive:(string|undefined), fantasy:(string|undefined), pictograph:(string|undefined)}} */
Protocol.Page.FontFamilies;

/** @typedef {!{standard:(number|undefined), fixed:(number|undefined)}} */
Protocol.Page.FontSizes;

/** @enum {string} */
Protocol.Page.ClientNavigationReason = {
  FormSubmissionGet: 'formSubmissionGet',
  FormSubmissionPost: 'formSubmissionPost',
  HttpHeaderRefresh: 'httpHeaderRefresh',
  ScriptInitiated: 'scriptInitiated',
  MetaTagRefresh: 'metaTagRefresh',
  PageBlockInterstitial: 'pageBlockInterstitial',
  Reload: 'reload',
};
/** @interface */
Protocol.PageDispatcher = function () {};
/**
 * @param {Protocol.Network.MonotonicTime} timestamp
 */
Protocol.PageDispatcher.prototype.domContentEventFired = function (timestamp) {};
/**
 * @param {string} mode
 */
Protocol.PageDispatcher.prototype.fileChooserOpened = function (mode) {};
/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {Protocol.Page.FrameId} parentFrameId
 * @param {Protocol.Runtime.StackTrace=} opt_stack
 */
Protocol.PageDispatcher.prototype.frameAttached = function (frameId, parentFrameId, opt_stack) {};
/**
 * @param {Protocol.Page.FrameId} frameId
 */
Protocol.PageDispatcher.prototype.frameClearedScheduledNavigation = function (frameId) {};
/**
 * @param {Protocol.Page.FrameId} frameId
 */
Protocol.PageDispatcher.prototype.frameDetached = function (frameId) {};
/**
 * @param {Protocol.Page.Frame} frame
 */
Protocol.PageDispatcher.prototype.frameNavigated = function (frame) {};
Protocol.PageDispatcher.prototype.frameResized = function () {};
/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {Protocol.Page.ClientNavigationReason} reason
 * @param {string} url
 */
Protocol.PageDispatcher.prototype.frameRequestedNavigation = function (frameId, reason, url) {};
/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {number} delay
 * @param {string} reason
 * @param {string} url
 */
Protocol.PageDispatcher.prototype.frameScheduledNavigation = function (frameId, delay, reason, url) {};
/**
 * @param {Protocol.Page.FrameId} frameId
 */
Protocol.PageDispatcher.prototype.frameStartedLoading = function (frameId) {};
/**
 * @param {Protocol.Page.FrameId} frameId
 */
Protocol.PageDispatcher.prototype.frameStoppedLoading = function (frameId) {};
/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {string} url
 */
Protocol.PageDispatcher.prototype.downloadWillBegin = function (frameId, url) {};
Protocol.PageDispatcher.prototype.interstitialHidden = function () {};
Protocol.PageDispatcher.prototype.interstitialShown = function () {};
/**
 * @param {boolean} result
 * @param {string} userInput
 */
Protocol.PageDispatcher.prototype.javascriptDialogClosed = function (result, userInput) {};
/**
 * @param {string} url
 * @param {string} message
 * @param {Protocol.Page.DialogType} type
 * @param {boolean} hasBrowserHandler
 * @param {string=} opt_defaultPrompt
 */
Protocol.PageDispatcher.prototype.javascriptDialogOpening = function (
  url,
  message,
  type,
  hasBrowserHandler,
  opt_defaultPrompt,
) {};
/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {Protocol.Network.LoaderId} loaderId
 * @param {string} name
 * @param {Protocol.Network.MonotonicTime} timestamp
 */
Protocol.PageDispatcher.prototype.lifecycleEvent = function (frameId, loaderId, name, timestamp) {};
/**
 * @param {Protocol.Network.MonotonicTime} timestamp
 */
Protocol.PageDispatcher.prototype.loadEventFired = function (timestamp) {};
/**
 * @param {Protocol.Page.FrameId} frameId
 * @param {string} url
 */
Protocol.PageDispatcher.prototype.navigatedWithinDocument = function (frameId, url) {};
/**
 * @param {string} data
 * @param {Protocol.Page.ScreencastFrameMetadata} metadata
 * @param {number} sessionId
 */
Protocol.PageDispatcher.prototype.screencastFrame = function (data, metadata, sessionId) {};
/**
 * @param {boolean} visible
 */
Protocol.PageDispatcher.prototype.screencastVisibilityChanged = function (visible) {};
/**
 * @param {string} url
 * @param {string} windowName
 * @param {!Array<string>} windowFeatures
 * @param {boolean} userGesture
 */
Protocol.PageDispatcher.prototype.windowOpen = function (url, windowName, windowFeatures, userGesture) {};
/**
 * @param {string} url
 * @param {string} data
 */
Protocol.PageDispatcher.prototype.compilationCacheProduced = function (url, data) {};
Protocol.Performance = {};

/**
 * @constructor
 */
Protocol.PerformanceAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PerformanceAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.PerformanceAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.PerformanceAgent.DisableResponse;
/**
 * @param {!Protocol.PerformanceAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.PerformanceAgent.DisableResponse>} */
Protocol.PerformanceAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.PerformanceAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.PerformanceAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.PerformanceAgent.EnableResponse;
/**
 * @param {!Protocol.PerformanceAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.PerformanceAgent.EnableResponse>} */
Protocol.PerformanceAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {string} timeDomain
 * @return {!Promise<undefined>}
 */
Protocol.PerformanceAgent.prototype.setTimeDomain = function (timeDomain) {};
/** @typedef {!{timeDomain: string}} */
Protocol.PerformanceAgent.SetTimeDomainRequest;
/** @typedef {Object|undefined} */
Protocol.PerformanceAgent.SetTimeDomainResponse;
/**
 * @param {!Protocol.PerformanceAgent.SetTimeDomainRequest} obj
 * @return {!Promise<!Protocol.PerformanceAgent.SetTimeDomainResponse>} */
Protocol.PerformanceAgent.prototype.invoke_setTimeDomain = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.Performance.Metric>>}
 */
Protocol.PerformanceAgent.prototype.getMetrics = function () {};
/** @typedef {Object|undefined} */
Protocol.PerformanceAgent.GetMetricsRequest;
/** @typedef {!{metrics: !Array<Protocol.Performance.Metric>}} */
Protocol.PerformanceAgent.GetMetricsResponse;
/**
 * @param {!Protocol.PerformanceAgent.GetMetricsRequest} obj
 * @return {!Promise<!Protocol.PerformanceAgent.GetMetricsResponse>} */
Protocol.PerformanceAgent.prototype.invoke_getMetrics = function (obj) {};

/** @typedef {!{name:(string), value:(number)}} */
Protocol.Performance.Metric;
/** @interface */
Protocol.PerformanceDispatcher = function () {};
/**
 * @param {!Array<Protocol.Performance.Metric>} metrics
 * @param {string} title
 */
Protocol.PerformanceDispatcher.prototype.metrics = function (metrics, title) {};
Protocol.Security = {};

/**
 * @constructor
 */
Protocol.SecurityAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.SecurityAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.SecurityAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.SecurityAgent.DisableResponse;
/**
 * @param {!Protocol.SecurityAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.SecurityAgent.DisableResponse>} */
Protocol.SecurityAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.SecurityAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.SecurityAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.SecurityAgent.EnableResponse;
/**
 * @param {!Protocol.SecurityAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.SecurityAgent.EnableResponse>} */
Protocol.SecurityAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {boolean} ignore
 * @return {!Promise<undefined>}
 */
Protocol.SecurityAgent.prototype.setIgnoreCertificateErrors = function (ignore) {};
/** @typedef {!{ignore: boolean}} */
Protocol.SecurityAgent.SetIgnoreCertificateErrorsRequest;
/** @typedef {Object|undefined} */
Protocol.SecurityAgent.SetIgnoreCertificateErrorsResponse;
/**
 * @param {!Protocol.SecurityAgent.SetIgnoreCertificateErrorsRequest} obj
 * @return {!Promise<!Protocol.SecurityAgent.SetIgnoreCertificateErrorsResponse>} */
Protocol.SecurityAgent.prototype.invoke_setIgnoreCertificateErrors = function (obj) {};

/**
 * @param {number} eventId
 * @param {Protocol.Security.CertificateErrorAction} action
 * @return {!Promise<undefined>}
 */
Protocol.SecurityAgent.prototype.handleCertificateError = function (eventId, action) {};
/** @typedef {!{eventId: number, action: Protocol.Security.CertificateErrorAction}} */
Protocol.SecurityAgent.HandleCertificateErrorRequest;
/** @typedef {Object|undefined} */
Protocol.SecurityAgent.HandleCertificateErrorResponse;
/**
 * @param {!Protocol.SecurityAgent.HandleCertificateErrorRequest} obj
 * @return {!Promise<!Protocol.SecurityAgent.HandleCertificateErrorResponse>} */
Protocol.SecurityAgent.prototype.invoke_handleCertificateError = function (obj) {};

/**
 * @param {boolean} override
 * @return {!Promise<undefined>}
 */
Protocol.SecurityAgent.prototype.setOverrideCertificateErrors = function (override) {};
/** @typedef {!{override: boolean}} */
Protocol.SecurityAgent.SetOverrideCertificateErrorsRequest;
/** @typedef {Object|undefined} */
Protocol.SecurityAgent.SetOverrideCertificateErrorsResponse;
/**
 * @param {!Protocol.SecurityAgent.SetOverrideCertificateErrorsRequest} obj
 * @return {!Promise<!Protocol.SecurityAgent.SetOverrideCertificateErrorsResponse>} */
Protocol.SecurityAgent.prototype.invoke_setOverrideCertificateErrors = function (obj) {};

/** @typedef {number} */
Protocol.Security.CertificateId;

/** @enum {string} */
Protocol.Security.MixedContentType = {
  Blockable: 'blockable',
  OptionallyBlockable: 'optionally-blockable',
  None: 'none',
};

/** @enum {string} */
Protocol.Security.SecurityState = {
  Unknown: 'unknown',
  Neutral: 'neutral',
  Insecure: 'insecure',
  Secure: 'secure',
  Info: 'info',
  InsecureBroken: 'insecure-broken',
};

/** @typedef {!{protocol:(string), keyExchange:(string), keyExchangeGroup:(string|undefined), cipher:(string), mac:(string|undefined), certificate:(!Array<string>), subjectName:(string), issuer:(string), validFrom:(Protocol.Network.TimeSinceEpoch), validTo:(Protocol.Network.TimeSinceEpoch), certifcateHasWeakSignature:(boolean), modernSSL:(boolean), obsoleteSslProtocol:(boolean), obsoleteSslKeyExchange:(boolean), obsoleteSslCipher:(boolean), obsoleteSslSignature:(boolean)}} */
Protocol.Security.CertificateSecurityState;

/** @typedef {!{securityState:(Protocol.Security.SecurityState), certificateSecurityState:(Protocol.Security.CertificateSecurityState|undefined), securityStateIssueIds:(!Array<string>)}} */
Protocol.Security.VisibleSecurityState;

/** @typedef {!{securityState:(Protocol.Security.SecurityState), title:(string), summary:(string), description:(string), mixedContentType:(Protocol.Security.MixedContentType), certificate:(!Array<string>), recommendations:(!Array<string>|undefined)}} */
Protocol.Security.SecurityStateExplanation;

/** @typedef {!{ranMixedContent:(boolean), displayedMixedContent:(boolean), containedMixedForm:(boolean), ranContentWithCertErrors:(boolean), displayedContentWithCertErrors:(boolean), ranInsecureContentStyle:(Protocol.Security.SecurityState), displayedInsecureContentStyle:(Protocol.Security.SecurityState)}} */
Protocol.Security.InsecureContentStatus;

/** @enum {string} */
Protocol.Security.CertificateErrorAction = {
  Continue: 'continue',
  Cancel: 'cancel',
};
/** @interface */
Protocol.SecurityDispatcher = function () {};
/**
 * @param {number} eventId
 * @param {string} errorType
 * @param {string} requestURL
 */
Protocol.SecurityDispatcher.prototype.certificateError = function (eventId, errorType, requestURL) {};
/**
 * @param {Protocol.Security.VisibleSecurityState} visibleSecurityState
 */
Protocol.SecurityDispatcher.prototype.visibleSecurityStateChanged = function (visibleSecurityState) {};
/**
 * @param {Protocol.Security.SecurityState} securityState
 * @param {boolean} schemeIsCryptographic
 * @param {!Array<Protocol.Security.SecurityStateExplanation>} explanations
 * @param {Protocol.Security.InsecureContentStatus} insecureContentStatus
 * @param {string=} opt_summary
 */
Protocol.SecurityDispatcher.prototype.securityStateChanged = function (
  securityState,
  schemeIsCryptographic,
  explanations,
  insecureContentStatus,
  opt_summary,
) {};
Protocol.ServiceWorker = {};

/**
 * @constructor
 */
Protocol.ServiceWorkerAgent = function () {};

/**
 * @param {string} origin
 * @param {Protocol.ServiceWorker.RegistrationID} registrationId
 * @param {string} data
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.deliverPushMessage = function (origin, registrationId, data) {};
/** @typedef {!{origin: string, registrationId: Protocol.ServiceWorker.RegistrationID, data: string}} */
Protocol.ServiceWorkerAgent.DeliverPushMessageRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.DeliverPushMessageResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.DeliverPushMessageRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.DeliverPushMessageResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_deliverPushMessage = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.DisableResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.DisableResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_disable = function (obj) {};

/**
 * @param {string} origin
 * @param {Protocol.ServiceWorker.RegistrationID} registrationId
 * @param {string} tag
 * @param {boolean} lastChance
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.dispatchSyncEvent = function (origin, registrationId, tag, lastChance) {};
/** @typedef {!{origin: string, registrationId: Protocol.ServiceWorker.RegistrationID, tag: string, lastChance: boolean}} */
Protocol.ServiceWorkerAgent.DispatchSyncEventRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.DispatchSyncEventResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.DispatchSyncEventRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.DispatchSyncEventResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_dispatchSyncEvent = function (obj) {};

/**
 * @param {string} origin
 * @param {Protocol.ServiceWorker.RegistrationID} registrationId
 * @param {string} tag
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.dispatchPeriodicSyncEvent = function (origin, registrationId, tag) {};
/** @typedef {!{origin: string, registrationId: Protocol.ServiceWorker.RegistrationID, tag: string}} */
Protocol.ServiceWorkerAgent.DispatchPeriodicSyncEventRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.DispatchPeriodicSyncEventResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.DispatchPeriodicSyncEventRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.DispatchPeriodicSyncEventResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_dispatchPeriodicSyncEvent = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.EnableResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.EnableResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {string} versionId
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.inspectWorker = function (versionId) {};
/** @typedef {!{versionId: string}} */
Protocol.ServiceWorkerAgent.InspectWorkerRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.InspectWorkerResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.InspectWorkerRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.InspectWorkerResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_inspectWorker = function (obj) {};

/**
 * @param {boolean} forceUpdateOnPageLoad
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.setForceUpdateOnPageLoad = function (forceUpdateOnPageLoad) {};
/** @typedef {!{forceUpdateOnPageLoad: boolean}} */
Protocol.ServiceWorkerAgent.SetForceUpdateOnPageLoadRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.SetForceUpdateOnPageLoadResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.SetForceUpdateOnPageLoadRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.SetForceUpdateOnPageLoadResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_setForceUpdateOnPageLoad = function (obj) {};

/**
 * @param {string} scopeURL
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.skipWaiting = function (scopeURL) {};
/** @typedef {!{scopeURL: string}} */
Protocol.ServiceWorkerAgent.SkipWaitingRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.SkipWaitingResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.SkipWaitingRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.SkipWaitingResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_skipWaiting = function (obj) {};

/**
 * @param {string} scopeURL
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.startWorker = function (scopeURL) {};
/** @typedef {!{scopeURL: string}} */
Protocol.ServiceWorkerAgent.StartWorkerRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.StartWorkerResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.StartWorkerRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.StartWorkerResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_startWorker = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.stopAllWorkers = function () {};
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.StopAllWorkersRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.StopAllWorkersResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.StopAllWorkersRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.StopAllWorkersResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_stopAllWorkers = function (obj) {};

/**
 * @param {string} versionId
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.stopWorker = function (versionId) {};
/** @typedef {!{versionId: string}} */
Protocol.ServiceWorkerAgent.StopWorkerRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.StopWorkerResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.StopWorkerRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.StopWorkerResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_stopWorker = function (obj) {};

/**
 * @param {string} scopeURL
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.unregister = function (scopeURL) {};
/** @typedef {!{scopeURL: string}} */
Protocol.ServiceWorkerAgent.UnregisterRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.UnregisterResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.UnregisterRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.UnregisterResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_unregister = function (obj) {};

/**
 * @param {string} scopeURL
 * @return {!Promise<undefined>}
 */
Protocol.ServiceWorkerAgent.prototype.updateRegistration = function (scopeURL) {};
/** @typedef {!{scopeURL: string}} */
Protocol.ServiceWorkerAgent.UpdateRegistrationRequest;
/** @typedef {Object|undefined} */
Protocol.ServiceWorkerAgent.UpdateRegistrationResponse;
/**
 * @param {!Protocol.ServiceWorkerAgent.UpdateRegistrationRequest} obj
 * @return {!Promise<!Protocol.ServiceWorkerAgent.UpdateRegistrationResponse>} */
Protocol.ServiceWorkerAgent.prototype.invoke_updateRegistration = function (obj) {};

/** @typedef {string} */
Protocol.ServiceWorker.RegistrationID;

/** @typedef {!{registrationId:(Protocol.ServiceWorker.RegistrationID), scopeURL:(string), isDeleted:(boolean)}} */
Protocol.ServiceWorker.ServiceWorkerRegistration;

/** @enum {string} */
Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus = {
  Stopped: 'stopped',
  Starting: 'starting',
  Running: 'running',
  Stopping: 'stopping',
};

/** @enum {string} */
Protocol.ServiceWorker.ServiceWorkerVersionStatus = {
  New: 'new',
  Installing: 'installing',
  Installed: 'installed',
  Activating: 'activating',
  Activated: 'activated',
  Redundant: 'redundant',
};

/** @typedef {!{versionId:(string), registrationId:(Protocol.ServiceWorker.RegistrationID), scriptURL:(string), runningStatus:(Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus), status:(Protocol.ServiceWorker.ServiceWorkerVersionStatus), scriptLastModified:(number|undefined), scriptResponseTime:(number|undefined), controlledClients:(!Array<Protocol.Target.TargetID>|undefined), targetId:(Protocol.Target.TargetID|undefined)}} */
Protocol.ServiceWorker.ServiceWorkerVersion;

/** @typedef {!{errorMessage:(string), registrationId:(Protocol.ServiceWorker.RegistrationID), versionId:(string), sourceURL:(string), lineNumber:(number), columnNumber:(number)}} */
Protocol.ServiceWorker.ServiceWorkerErrorMessage;
/** @interface */
Protocol.ServiceWorkerDispatcher = function () {};
/**
 * @param {Protocol.ServiceWorker.ServiceWorkerErrorMessage} errorMessage
 */
Protocol.ServiceWorkerDispatcher.prototype.workerErrorReported = function (errorMessage) {};
/**
 * @param {!Array<Protocol.ServiceWorker.ServiceWorkerRegistration>} registrations
 */
Protocol.ServiceWorkerDispatcher.prototype.workerRegistrationUpdated = function (registrations) {};
/**
 * @param {!Array<Protocol.ServiceWorker.ServiceWorkerVersion>} versions
 */
Protocol.ServiceWorkerDispatcher.prototype.workerVersionUpdated = function (versions) {};
Protocol.Storage = {};

/**
 * @constructor
 */
Protocol.StorageAgent = function () {};

/**
 * @param {string} origin
 * @param {string} storageTypes
 * @return {!Promise<undefined>}
 */
Protocol.StorageAgent.prototype.clearDataForOrigin = function (origin, storageTypes) {};
/** @typedef {!{origin: string, storageTypes: string}} */
Protocol.StorageAgent.ClearDataForOriginRequest;
/** @typedef {Object|undefined} */
Protocol.StorageAgent.ClearDataForOriginResponse;
/**
 * @param {!Protocol.StorageAgent.ClearDataForOriginRequest} obj
 * @return {!Promise<!Protocol.StorageAgent.ClearDataForOriginResponse>} */
Protocol.StorageAgent.prototype.invoke_clearDataForOrigin = function (obj) {};

/**
 * @param {string} origin
 * @return {!Promise<?number>}
 */
Protocol.StorageAgent.prototype.getUsageAndQuota = function (origin) {};
/** @typedef {!{origin: string}} */
Protocol.StorageAgent.GetUsageAndQuotaRequest;
/** @typedef {!{usage: number, usageBreakdown: !Array<Protocol.Storage.UsageForType>, quota: number}} */
Protocol.StorageAgent.GetUsageAndQuotaResponse;
/**
 * @param {!Protocol.StorageAgent.GetUsageAndQuotaRequest} obj
 * @return {!Promise<!Protocol.StorageAgent.GetUsageAndQuotaResponse>} */
Protocol.StorageAgent.prototype.invoke_getUsageAndQuota = function (obj) {};

/**
 * @param {string} origin
 * @return {!Promise<undefined>}
 */
Protocol.StorageAgent.prototype.trackCacheStorageForOrigin = function (origin) {};
/** @typedef {!{origin: string}} */
Protocol.StorageAgent.TrackCacheStorageForOriginRequest;
/** @typedef {Object|undefined} */
Protocol.StorageAgent.TrackCacheStorageForOriginResponse;
/**
 * @param {!Protocol.StorageAgent.TrackCacheStorageForOriginRequest} obj
 * @return {!Promise<!Protocol.StorageAgent.TrackCacheStorageForOriginResponse>} */
Protocol.StorageAgent.prototype.invoke_trackCacheStorageForOrigin = function (obj) {};

/**
 * @param {string} origin
 * @return {!Promise<undefined>}
 */
Protocol.StorageAgent.prototype.trackIndexedDBForOrigin = function (origin) {};
/** @typedef {!{origin: string}} */
Protocol.StorageAgent.TrackIndexedDBForOriginRequest;
/** @typedef {Object|undefined} */
Protocol.StorageAgent.TrackIndexedDBForOriginResponse;
/**
 * @param {!Protocol.StorageAgent.TrackIndexedDBForOriginRequest} obj
 * @return {!Promise<!Protocol.StorageAgent.TrackIndexedDBForOriginResponse>} */
Protocol.StorageAgent.prototype.invoke_trackIndexedDBForOrigin = function (obj) {};

/**
 * @param {string} origin
 * @return {!Promise<undefined>}
 */
Protocol.StorageAgent.prototype.untrackCacheStorageForOrigin = function (origin) {};
/** @typedef {!{origin: string}} */
Protocol.StorageAgent.UntrackCacheStorageForOriginRequest;
/** @typedef {Object|undefined} */
Protocol.StorageAgent.UntrackCacheStorageForOriginResponse;
/**
 * @param {!Protocol.StorageAgent.UntrackCacheStorageForOriginRequest} obj
 * @return {!Promise<!Protocol.StorageAgent.UntrackCacheStorageForOriginResponse>} */
Protocol.StorageAgent.prototype.invoke_untrackCacheStorageForOrigin = function (obj) {};

/**
 * @param {string} origin
 * @return {!Promise<undefined>}
 */
Protocol.StorageAgent.prototype.untrackIndexedDBForOrigin = function (origin) {};
/** @typedef {!{origin: string}} */
Protocol.StorageAgent.UntrackIndexedDBForOriginRequest;
/** @typedef {Object|undefined} */
Protocol.StorageAgent.UntrackIndexedDBForOriginResponse;
/**
 * @param {!Protocol.StorageAgent.UntrackIndexedDBForOriginRequest} obj
 * @return {!Promise<!Protocol.StorageAgent.UntrackIndexedDBForOriginResponse>} */
Protocol.StorageAgent.prototype.invoke_untrackIndexedDBForOrigin = function (obj) {};

/** @enum {string} */
Protocol.Storage.StorageType = {
  Appcache: 'appcache',
  Cookies: 'cookies',
  File_systems: 'file_systems',
  Indexeddb: 'indexeddb',
  Local_storage: 'local_storage',
  Shader_cache: 'shader_cache',
  Websql: 'websql',
  Service_workers: 'service_workers',
  Cache_storage: 'cache_storage',
  All: 'all',
  Other: 'other',
};

/** @typedef {!{storageType:(Protocol.Storage.StorageType), usage:(number)}} */
Protocol.Storage.UsageForType;
/** @interface */
Protocol.StorageDispatcher = function () {};
/**
 * @param {string} origin
 * @param {string} cacheName
 */
Protocol.StorageDispatcher.prototype.cacheStorageContentUpdated = function (origin, cacheName) {};
/**
 * @param {string} origin
 */
Protocol.StorageDispatcher.prototype.cacheStorageListUpdated = function (origin) {};
/**
 * @param {string} origin
 * @param {string} databaseName
 * @param {string} objectStoreName
 */
Protocol.StorageDispatcher.prototype.indexedDBContentUpdated = function (origin, databaseName, objectStoreName) {};
/**
 * @param {string} origin
 */
Protocol.StorageDispatcher.prototype.indexedDBListUpdated = function (origin) {};
Protocol.SystemInfo = {};

/**
 * @constructor
 */
Protocol.SystemInfoAgent = function () {};

/**
 * @return {!Promise<?Protocol.SystemInfo.GPUInfo>}
 */
Protocol.SystemInfoAgent.prototype.getInfo = function () {};
/** @typedef {Object|undefined} */
Protocol.SystemInfoAgent.GetInfoRequest;
/** @typedef {!{gpu: Protocol.SystemInfo.GPUInfo, commandLine: string, modelName: string, modelVersion: string}} */
Protocol.SystemInfoAgent.GetInfoResponse;
/**
 * @param {!Protocol.SystemInfoAgent.GetInfoRequest} obj
 * @return {!Promise<!Protocol.SystemInfoAgent.GetInfoResponse>} */
Protocol.SystemInfoAgent.prototype.invoke_getInfo = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.SystemInfo.ProcessInfo>>}
 */
Protocol.SystemInfoAgent.prototype.getProcessInfo = function () {};
/** @typedef {Object|undefined} */
Protocol.SystemInfoAgent.GetProcessInfoRequest;
/** @typedef {!{processInfo: !Array<Protocol.SystemInfo.ProcessInfo>}} */
Protocol.SystemInfoAgent.GetProcessInfoResponse;
/**
 * @param {!Protocol.SystemInfoAgent.GetProcessInfoRequest} obj
 * @return {!Promise<!Protocol.SystemInfoAgent.GetProcessInfoResponse>} */
Protocol.SystemInfoAgent.prototype.invoke_getProcessInfo = function (obj) {};

/** @typedef {!{vendorId:(number), deviceId:(number), subSysId:(number|undefined), revision:(number|undefined), vendorString:(string), deviceString:(string), driverVendor:(string), driverVersion:(string)}} */
Protocol.SystemInfo.GPUDevice;

/** @typedef {!{width:(number), height:(number)}} */
Protocol.SystemInfo.Size;

/** @typedef {!{profile:(string), maxResolution:(Protocol.SystemInfo.Size), minResolution:(Protocol.SystemInfo.Size)}} */
Protocol.SystemInfo.VideoDecodeAcceleratorCapability;

/** @typedef {!{profile:(string), maxResolution:(Protocol.SystemInfo.Size), maxFramerateNumerator:(number), maxFramerateDenominator:(number)}} */
Protocol.SystemInfo.VideoEncodeAcceleratorCapability;

/** @enum {string} */
Protocol.SystemInfo.SubsamplingFormat = {
  Yuv420: 'yuv420',
  Yuv422: 'yuv422',
  Yuv444: 'yuv444',
};

/** @enum {string} */
Protocol.SystemInfo.ImageType = {
  Jpeg: 'jpeg',
  Webp: 'webp',
  Unknown: 'unknown',
};

/** @typedef {!{imageType:(Protocol.SystemInfo.ImageType), maxDimensions:(Protocol.SystemInfo.Size), minDimensions:(Protocol.SystemInfo.Size), subsamplings:(!Array<Protocol.SystemInfo.SubsamplingFormat>)}} */
Protocol.SystemInfo.ImageDecodeAcceleratorCapability;

/** @typedef {!{devices:(!Array<Protocol.SystemInfo.GPUDevice>), auxAttributes:(!Object|undefined), featureStatus:(!Object|undefined), driverBugWorkarounds:(!Array<string>), videoDecoding:(!Array<Protocol.SystemInfo.VideoDecodeAcceleratorCapability>), videoEncoding:(!Array<Protocol.SystemInfo.VideoEncodeAcceleratorCapability>), imageDecoding:(!Array<Protocol.SystemInfo.ImageDecodeAcceleratorCapability>)}} */
Protocol.SystemInfo.GPUInfo;

/** @typedef {!{type:(string), id:(number), cpuTime:(number)}} */
Protocol.SystemInfo.ProcessInfo;
/** @interface */
Protocol.SystemInfoDispatcher = function () {};
Protocol.Target = {};

/**
 * @constructor
 */
Protocol.TargetAgent = function () {};

/**
 * @param {Protocol.Target.TargetID} targetId
 * @return {!Promise<undefined>}
 */
Protocol.TargetAgent.prototype.activateTarget = function (targetId) {};
/** @typedef {!{targetId: Protocol.Target.TargetID}} */
Protocol.TargetAgent.ActivateTargetRequest;
/** @typedef {Object|undefined} */
Protocol.TargetAgent.ActivateTargetResponse;
/**
 * @param {!Protocol.TargetAgent.ActivateTargetRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.ActivateTargetResponse>} */
Protocol.TargetAgent.prototype.invoke_activateTarget = function (obj) {};

/**
 * @param {Protocol.Target.TargetID} targetId
 * @param {boolean=} opt_flatten
 * @return {!Promise<?Protocol.Target.SessionID>}
 */
Protocol.TargetAgent.prototype.attachToTarget = function (targetId, opt_flatten) {};
/** @typedef {!{targetId: Protocol.Target.TargetID, flatten: (boolean|undefined)}} */
Protocol.TargetAgent.AttachToTargetRequest;
/** @typedef {!{sessionId: Protocol.Target.SessionID}} */
Protocol.TargetAgent.AttachToTargetResponse;
/**
 * @param {!Protocol.TargetAgent.AttachToTargetRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.AttachToTargetResponse>} */
Protocol.TargetAgent.prototype.invoke_attachToTarget = function (obj) {};

/**
 * @return {!Promise<?Protocol.Target.SessionID>}
 */
Protocol.TargetAgent.prototype.attachToBrowserTarget = function () {};
/** @typedef {Object|undefined} */
Protocol.TargetAgent.AttachToBrowserTargetRequest;
/** @typedef {!{sessionId: Protocol.Target.SessionID}} */
Protocol.TargetAgent.AttachToBrowserTargetResponse;
/**
 * @param {!Protocol.TargetAgent.AttachToBrowserTargetRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.AttachToBrowserTargetResponse>} */
Protocol.TargetAgent.prototype.invoke_attachToBrowserTarget = function (obj) {};

/**
 * @param {Protocol.Target.TargetID} targetId
 * @return {!Promise<?boolean>}
 */
Protocol.TargetAgent.prototype.closeTarget = function (targetId) {};
/** @typedef {!{targetId: Protocol.Target.TargetID}} */
Protocol.TargetAgent.CloseTargetRequest;
/** @typedef {!{success: boolean}} */
Protocol.TargetAgent.CloseTargetResponse;
/**
 * @param {!Protocol.TargetAgent.CloseTargetRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.CloseTargetResponse>} */
Protocol.TargetAgent.prototype.invoke_closeTarget = function (obj) {};

/**
 * @param {Protocol.Target.TargetID} targetId
 * @param {string=} opt_bindingName
 * @return {!Promise<undefined>}
 */
Protocol.TargetAgent.prototype.exposeDevToolsProtocol = function (targetId, opt_bindingName) {};
/** @typedef {!{targetId: Protocol.Target.TargetID, bindingName: (string|undefined)}} */
Protocol.TargetAgent.ExposeDevToolsProtocolRequest;
/** @typedef {Object|undefined} */
Protocol.TargetAgent.ExposeDevToolsProtocolResponse;
/**
 * @param {!Protocol.TargetAgent.ExposeDevToolsProtocolRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.ExposeDevToolsProtocolResponse>} */
Protocol.TargetAgent.prototype.invoke_exposeDevToolsProtocol = function (obj) {};

/**
 * @return {!Promise<?Protocol.Target.BrowserContextID>}
 */
Protocol.TargetAgent.prototype.createBrowserContext = function () {};
/** @typedef {Object|undefined} */
Protocol.TargetAgent.CreateBrowserContextRequest;
/** @typedef {!{browserContextId: Protocol.Target.BrowserContextID}} */
Protocol.TargetAgent.CreateBrowserContextResponse;
/**
 * @param {!Protocol.TargetAgent.CreateBrowserContextRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.CreateBrowserContextResponse>} */
Protocol.TargetAgent.prototype.invoke_createBrowserContext = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.Target.BrowserContextID>>}
 */
Protocol.TargetAgent.prototype.getBrowserContexts = function () {};
/** @typedef {Object|undefined} */
Protocol.TargetAgent.GetBrowserContextsRequest;
/** @typedef {!{browserContextIds: !Array<Protocol.Target.BrowserContextID>}} */
Protocol.TargetAgent.GetBrowserContextsResponse;
/**
 * @param {!Protocol.TargetAgent.GetBrowserContextsRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.GetBrowserContextsResponse>} */
Protocol.TargetAgent.prototype.invoke_getBrowserContexts = function (obj) {};

/**
 * @param {string} url
 * @param {number=} opt_width
 * @param {number=} opt_height
 * @param {Protocol.Target.BrowserContextID=} opt_browserContextId
 * @param {boolean=} opt_enableBeginFrameControl
 * @param {boolean=} opt_newWindow
 * @param {boolean=} opt_background
 * @return {!Promise<?Protocol.Target.TargetID>}
 */
Protocol.TargetAgent.prototype.createTarget = function (
  url,
  opt_width,
  opt_height,
  opt_browserContextId,
  opt_enableBeginFrameControl,
  opt_newWindow,
  opt_background,
) {};
/** @typedef {!{browserContextId: (Protocol.Target.BrowserContextID|undefined), url: string, newWindow: (boolean|undefined), width: (number|undefined), enableBeginFrameControl: (boolean|undefined), background: (boolean|undefined), height: (number|undefined)}} */
Protocol.TargetAgent.CreateTargetRequest;
/** @typedef {!{targetId: Protocol.Target.TargetID}} */
Protocol.TargetAgent.CreateTargetResponse;
/**
 * @param {!Protocol.TargetAgent.CreateTargetRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.CreateTargetResponse>} */
Protocol.TargetAgent.prototype.invoke_createTarget = function (obj) {};

/**
 * @param {Protocol.Target.SessionID=} opt_sessionId
 * @param {Protocol.Target.TargetID=} opt_targetId
 * @return {!Promise<undefined>}
 */
Protocol.TargetAgent.prototype.detachFromTarget = function (opt_sessionId, opt_targetId) {};
/** @typedef {!{sessionId: (Protocol.Target.SessionID|undefined), targetId: (Protocol.Target.TargetID|undefined)}} */
Protocol.TargetAgent.DetachFromTargetRequest;
/** @typedef {Object|undefined} */
Protocol.TargetAgent.DetachFromTargetResponse;
/**
 * @param {!Protocol.TargetAgent.DetachFromTargetRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.DetachFromTargetResponse>} */
Protocol.TargetAgent.prototype.invoke_detachFromTarget = function (obj) {};

/**
 * @param {Protocol.Target.BrowserContextID} browserContextId
 * @return {!Promise<undefined>}
 */
Protocol.TargetAgent.prototype.disposeBrowserContext = function (browserContextId) {};
/** @typedef {!{browserContextId: Protocol.Target.BrowserContextID}} */
Protocol.TargetAgent.DisposeBrowserContextRequest;
/** @typedef {Object|undefined} */
Protocol.TargetAgent.DisposeBrowserContextResponse;
/**
 * @param {!Protocol.TargetAgent.DisposeBrowserContextRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.DisposeBrowserContextResponse>} */
Protocol.TargetAgent.prototype.invoke_disposeBrowserContext = function (obj) {};

/**
 * @param {Protocol.Target.TargetID=} opt_targetId
 * @return {!Promise<?Protocol.Target.TargetInfo>}
 */
Protocol.TargetAgent.prototype.getTargetInfo = function (opt_targetId) {};
/** @typedef {!{targetId: (Protocol.Target.TargetID|undefined)}} */
Protocol.TargetAgent.GetTargetInfoRequest;
/** @typedef {!{targetInfo: Protocol.Target.TargetInfo}} */
Protocol.TargetAgent.GetTargetInfoResponse;
/**
 * @param {!Protocol.TargetAgent.GetTargetInfoRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.GetTargetInfoResponse>} */
Protocol.TargetAgent.prototype.invoke_getTargetInfo = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.Target.TargetInfo>>}
 */
Protocol.TargetAgent.prototype.getTargets = function () {};
/** @typedef {Object|undefined} */
Protocol.TargetAgent.GetTargetsRequest;
/** @typedef {!{targetInfos: !Array<Protocol.Target.TargetInfo>}} */
Protocol.TargetAgent.GetTargetsResponse;
/**
 * @param {!Protocol.TargetAgent.GetTargetsRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.GetTargetsResponse>} */
Protocol.TargetAgent.prototype.invoke_getTargets = function (obj) {};

/**
 * @param {string} message
 * @param {Protocol.Target.SessionID=} opt_sessionId
 * @param {Protocol.Target.TargetID=} opt_targetId
 * @return {!Promise<undefined>}
 */
Protocol.TargetAgent.prototype.sendMessageToTarget = function (message, opt_sessionId, opt_targetId) {};
/** @typedef {!{message: string, targetId: (Protocol.Target.TargetID|undefined), sessionId: (Protocol.Target.SessionID|undefined)}} */
Protocol.TargetAgent.SendMessageToTargetRequest;
/** @typedef {Object|undefined} */
Protocol.TargetAgent.SendMessageToTargetResponse;
/**
 * @param {!Protocol.TargetAgent.SendMessageToTargetRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.SendMessageToTargetResponse>} */
Protocol.TargetAgent.prototype.invoke_sendMessageToTarget = function (obj) {};

/**
 * @param {boolean} autoAttach
 * @param {boolean} waitForDebuggerOnStart
 * @param {boolean=} opt_flatten
 * @param {boolean=} opt_windowOpen
 * @return {!Promise<undefined>}
 */
Protocol.TargetAgent.prototype.setAutoAttach = function (
  autoAttach,
  waitForDebuggerOnStart,
  opt_flatten,
  opt_windowOpen,
) {};
/** @typedef {!{waitForDebuggerOnStart: boolean, autoAttach: boolean, flatten: (boolean|undefined), windowOpen: (boolean|undefined)}} */
Protocol.TargetAgent.SetAutoAttachRequest;
/** @typedef {Object|undefined} */
Protocol.TargetAgent.SetAutoAttachResponse;
/**
 * @param {!Protocol.TargetAgent.SetAutoAttachRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.SetAutoAttachResponse>} */
Protocol.TargetAgent.prototype.invoke_setAutoAttach = function (obj) {};

/**
 * @param {boolean} discover
 * @return {!Promise<undefined>}
 */
Protocol.TargetAgent.prototype.setDiscoverTargets = function (discover) {};
/** @typedef {!{discover: boolean}} */
Protocol.TargetAgent.SetDiscoverTargetsRequest;
/** @typedef {Object|undefined} */
Protocol.TargetAgent.SetDiscoverTargetsResponse;
/**
 * @param {!Protocol.TargetAgent.SetDiscoverTargetsRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.SetDiscoverTargetsResponse>} */
Protocol.TargetAgent.prototype.invoke_setDiscoverTargets = function (obj) {};

/**
 * @param {!Array<Protocol.Target.RemoteLocation>} locations
 * @return {!Promise<undefined>}
 */
Protocol.TargetAgent.prototype.setRemoteLocations = function (locations) {};
/** @typedef {!{locations: !Array<Protocol.Target.RemoteLocation>}} */
Protocol.TargetAgent.SetRemoteLocationsRequest;
/** @typedef {Object|undefined} */
Protocol.TargetAgent.SetRemoteLocationsResponse;
/**
 * @param {!Protocol.TargetAgent.SetRemoteLocationsRequest} obj
 * @return {!Promise<!Protocol.TargetAgent.SetRemoteLocationsResponse>} */
Protocol.TargetAgent.prototype.invoke_setRemoteLocations = function (obj) {};

/** @typedef {string} */
Protocol.Target.TargetID;

/** @typedef {string} */
Protocol.Target.SessionID;

/** @typedef {string} */
Protocol.Target.BrowserContextID;

/** @typedef {!{targetId:(Protocol.Target.TargetID), type:(string), title:(string), url:(string), attached:(boolean), openerId:(Protocol.Target.TargetID|undefined), browserContextId:(Protocol.Target.BrowserContextID|undefined)}} */
Protocol.Target.TargetInfo;

/** @typedef {!{host:(string), port:(number)}} */
Protocol.Target.RemoteLocation;
/** @interface */
Protocol.TargetDispatcher = function () {};
/**
 * @param {Protocol.Target.SessionID} sessionId
 * @param {Protocol.Target.TargetInfo} targetInfo
 * @param {boolean} waitingForDebugger
 */
Protocol.TargetDispatcher.prototype.attachedToTarget = function (sessionId, targetInfo, waitingForDebugger) {};
/**
 * @param {Protocol.Target.SessionID} sessionId
 * @param {Protocol.Target.TargetID=} opt_targetId
 */
Protocol.TargetDispatcher.prototype.detachedFromTarget = function (sessionId, opt_targetId) {};
/**
 * @param {Protocol.Target.SessionID} sessionId
 * @param {string} message
 * @param {Protocol.Target.TargetID=} opt_targetId
 */
Protocol.TargetDispatcher.prototype.receivedMessageFromTarget = function (sessionId, message, opt_targetId) {};
/**
 * @param {Protocol.Target.TargetInfo} targetInfo
 */
Protocol.TargetDispatcher.prototype.targetCreated = function (targetInfo) {};
/**
 * @param {Protocol.Target.TargetID} targetId
 */
Protocol.TargetDispatcher.prototype.targetDestroyed = function (targetId) {};
/**
 * @param {Protocol.Target.TargetID} targetId
 * @param {string} status
 * @param {number} errorCode
 */
Protocol.TargetDispatcher.prototype.targetCrashed = function (targetId, status, errorCode) {};
/**
 * @param {Protocol.Target.TargetInfo} targetInfo
 */
Protocol.TargetDispatcher.prototype.targetInfoChanged = function (targetInfo) {};
Protocol.Tethering = {};

/**
 * @constructor
 */
Protocol.TetheringAgent = function () {};

/**
 * @param {number} port
 * @return {!Promise<undefined>}
 */
Protocol.TetheringAgent.prototype.bind = function (port) {};
/** @typedef {!{port: number}} */
Protocol.TetheringAgent.BindRequest;
/** @typedef {Object|undefined} */
Protocol.TetheringAgent.BindResponse;
/**
 * @param {!Protocol.TetheringAgent.BindRequest} obj
 * @return {!Promise<!Protocol.TetheringAgent.BindResponse>} */
Protocol.TetheringAgent.prototype.invoke_bind = function (obj) {};

/**
 * @param {number} port
 * @return {!Promise<undefined>}
 */
Protocol.TetheringAgent.prototype.unbind = function (port) {};
/** @typedef {!{port: number}} */
Protocol.TetheringAgent.UnbindRequest;
/** @typedef {Object|undefined} */
Protocol.TetheringAgent.UnbindResponse;
/**
 * @param {!Protocol.TetheringAgent.UnbindRequest} obj
 * @return {!Promise<!Protocol.TetheringAgent.UnbindResponse>} */
Protocol.TetheringAgent.prototype.invoke_unbind = function (obj) {};
/** @interface */
Protocol.TetheringDispatcher = function () {};
/**
 * @param {number} port
 * @param {string} connectionId
 */
Protocol.TetheringDispatcher.prototype.accepted = function (port, connectionId) {};
Protocol.Tracing = {};

/**
 * @constructor
 */
Protocol.TracingAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.TracingAgent.prototype.end = function () {};
/** @typedef {Object|undefined} */
Protocol.TracingAgent.EndRequest;
/** @typedef {Object|undefined} */
Protocol.TracingAgent.EndResponse;
/**
 * @param {!Protocol.TracingAgent.EndRequest} obj
 * @return {!Promise<!Protocol.TracingAgent.EndResponse>} */
Protocol.TracingAgent.prototype.invoke_end = function (obj) {};

/**
 * @return {!Promise<?Array<string>>}
 */
Protocol.TracingAgent.prototype.getCategories = function () {};
/** @typedef {Object|undefined} */
Protocol.TracingAgent.GetCategoriesRequest;
/** @typedef {!{categories: !Array<string>}} */
Protocol.TracingAgent.GetCategoriesResponse;
/**
 * @param {!Protocol.TracingAgent.GetCategoriesRequest} obj
 * @return {!Promise<!Protocol.TracingAgent.GetCategoriesResponse>} */
Protocol.TracingAgent.prototype.invoke_getCategories = function (obj) {};

/**
 * @param {string} syncId
 * @return {!Promise<undefined>}
 */
Protocol.TracingAgent.prototype.recordClockSyncMarker = function (syncId) {};
/** @typedef {!{syncId: string}} */
Protocol.TracingAgent.RecordClockSyncMarkerRequest;
/** @typedef {Object|undefined} */
Protocol.TracingAgent.RecordClockSyncMarkerResponse;
/**
 * @param {!Protocol.TracingAgent.RecordClockSyncMarkerRequest} obj
 * @return {!Promise<!Protocol.TracingAgent.RecordClockSyncMarkerResponse>} */
Protocol.TracingAgent.prototype.invoke_recordClockSyncMarker = function (obj) {};

/**
 * @param {boolean=} opt_deterministic
 * @return {!Promise<?string>}
 */
Protocol.TracingAgent.prototype.requestMemoryDump = function (opt_deterministic) {};
/** @typedef {!{deterministic: (boolean|undefined)}} */
Protocol.TracingAgent.RequestMemoryDumpRequest;
/** @typedef {!{dumpGuid: string, success: boolean}} */
Protocol.TracingAgent.RequestMemoryDumpResponse;
/**
 * @param {!Protocol.TracingAgent.RequestMemoryDumpRequest} obj
 * @return {!Promise<!Protocol.TracingAgent.RequestMemoryDumpResponse>} */
Protocol.TracingAgent.prototype.invoke_requestMemoryDump = function (obj) {};

/**
 * @param {string=} opt_categories
 * @param {string=} opt_options
 * @param {number=} opt_bufferUsageReportingInterval
 * @param {string=} opt_transferMode
 * @param {Protocol.Tracing.StreamFormat=} opt_streamFormat
 * @param {Protocol.Tracing.StreamCompression=} opt_streamCompression
 * @param {Protocol.Tracing.TraceConfig=} opt_traceConfig
 * @return {!Promise<undefined>}
 */
Protocol.TracingAgent.prototype.start = function (
  opt_categories,
  opt_options,
  opt_bufferUsageReportingInterval,
  opt_transferMode,
  opt_streamFormat,
  opt_streamCompression,
  opt_traceConfig,
) {};
/** @typedef {!{traceConfig: (Protocol.Tracing.TraceConfig|undefined), transferMode: (string|undefined), bufferUsageReportingInterval: (number|undefined), streamFormat: (Protocol.Tracing.StreamFormat|undefined), options: (string|undefined), categories: (string|undefined), streamCompression: (Protocol.Tracing.StreamCompression|undefined)}} */
Protocol.TracingAgent.StartRequest;
/** @typedef {Object|undefined} */
Protocol.TracingAgent.StartResponse;
/**
 * @param {!Protocol.TracingAgent.StartRequest} obj
 * @return {!Promise<!Protocol.TracingAgent.StartResponse>} */
Protocol.TracingAgent.prototype.invoke_start = function (obj) {};

/** @typedef {!Object} */
Protocol.Tracing.MemoryDumpConfig;

/** @enum {string} */
Protocol.Tracing.TraceConfigRecordMode = {
  RecordUntilFull: 'recordUntilFull',
  RecordContinuously: 'recordContinuously',
  RecordAsMuchAsPossible: 'recordAsMuchAsPossible',
  EchoToConsole: 'echoToConsole',
};

/** @typedef {!{recordMode:(Protocol.Tracing.TraceConfigRecordMode|undefined), enableSampling:(boolean|undefined), enableSystrace:(boolean|undefined), enableArgumentFilter:(boolean|undefined), includedCategories:(!Array<string>|undefined), excludedCategories:(!Array<string>|undefined), syntheticDelays:(!Array<string>|undefined), memoryDumpConfig:(Protocol.Tracing.MemoryDumpConfig|undefined)}} */
Protocol.Tracing.TraceConfig;

/** @enum {string} */
Protocol.Tracing.StreamFormat = {
  Json: 'json',
  Proto: 'proto',
};

/** @enum {string} */
Protocol.Tracing.StreamCompression = {
  None: 'none',
  Gzip: 'gzip',
};
/** @interface */
Protocol.TracingDispatcher = function () {};
/**
 * @param {number=} opt_percentFull
 * @param {number=} opt_eventCount
 * @param {number=} opt_value
 */
Protocol.TracingDispatcher.prototype.bufferUsage = function (opt_percentFull, opt_eventCount, opt_value) {};
/**
 * @param {!Array<!Object>} value
 */
Protocol.TracingDispatcher.prototype.dataCollected = function (value) {};
/**
 * @param {boolean} dataLossOccurred
 * @param {Protocol.IO.StreamHandle=} opt_stream
 * @param {Protocol.Tracing.StreamFormat=} opt_traceFormat
 * @param {Protocol.Tracing.StreamCompression=} opt_streamCompression
 */
Protocol.TracingDispatcher.prototype.tracingComplete = function (
  dataLossOccurred,
  opt_stream,
  opt_traceFormat,
  opt_streamCompression,
) {};
Protocol.Fetch = {};

/**
 * @constructor
 */
Protocol.FetchAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.FetchAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.FetchAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.FetchAgent.DisableResponse;
/**
 * @param {!Protocol.FetchAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.FetchAgent.DisableResponse>} */
Protocol.FetchAgent.prototype.invoke_disable = function (obj) {};

/**
 * @param {!Array<Protocol.Fetch.RequestPattern>=} opt_patterns
 * @param {boolean=} opt_handleAuthRequests
 * @return {!Promise<undefined>}
 */
Protocol.FetchAgent.prototype.enable = function (opt_patterns, opt_handleAuthRequests) {};
/** @typedef {!{patterns: (!Array<Protocol.Fetch.RequestPattern>|undefined), handleAuthRequests: (boolean|undefined)}} */
Protocol.FetchAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.FetchAgent.EnableResponse;
/**
 * @param {!Protocol.FetchAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.FetchAgent.EnableResponse>} */
Protocol.FetchAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {Protocol.Fetch.RequestId} requestId
 * @param {Protocol.Network.ErrorReason} errorReason
 * @return {!Promise<undefined>}
 */
Protocol.FetchAgent.prototype.failRequest = function (requestId, errorReason) {};
/** @typedef {!{requestId: Protocol.Fetch.RequestId, errorReason: Protocol.Network.ErrorReason}} */
Protocol.FetchAgent.FailRequestRequest;
/** @typedef {Object|undefined} */
Protocol.FetchAgent.FailRequestResponse;
/**
 * @param {!Protocol.FetchAgent.FailRequestRequest} obj
 * @return {!Promise<!Protocol.FetchAgent.FailRequestResponse>} */
Protocol.FetchAgent.prototype.invoke_failRequest = function (obj) {};

/**
 * @param {Protocol.Fetch.RequestId} requestId
 * @param {number} responseCode
 * @param {!Array<Protocol.Fetch.HeaderEntry>=} opt_responseHeaders
 * @param {string=} opt_binaryResponseHeaders
 * @param {string=} opt_body
 * @param {string=} opt_responsePhrase
 * @return {!Promise<undefined>}
 */
Protocol.FetchAgent.prototype.fulfillRequest = function (
  requestId,
  responseCode,
  opt_responseHeaders,
  opt_binaryResponseHeaders,
  opt_body,
  opt_responsePhrase,
) {};
/** @typedef {!{body: (string|undefined), binaryResponseHeaders: (string|undefined), requestId: Protocol.Fetch.RequestId, responseCode: number, responsePhrase: (string|undefined), responseHeaders: (!Array<Protocol.Fetch.HeaderEntry>|undefined)}} */
Protocol.FetchAgent.FulfillRequestRequest;
/** @typedef {Object|undefined} */
Protocol.FetchAgent.FulfillRequestResponse;
/**
 * @param {!Protocol.FetchAgent.FulfillRequestRequest} obj
 * @return {!Promise<!Protocol.FetchAgent.FulfillRequestResponse>} */
Protocol.FetchAgent.prototype.invoke_fulfillRequest = function (obj) {};

/**
 * @param {Protocol.Fetch.RequestId} requestId
 * @param {string=} opt_url
 * @param {string=} opt_method
 * @param {string=} opt_postData
 * @param {!Array<Protocol.Fetch.HeaderEntry>=} opt_headers
 * @return {!Promise<undefined>}
 */
Protocol.FetchAgent.prototype.continueRequest = function (requestId, opt_url, opt_method, opt_postData, opt_headers) {};
/** @typedef {!{url: (string|undefined), headers: (!Array<Protocol.Fetch.HeaderEntry>|undefined), requestId: Protocol.Fetch.RequestId, postData: (string|undefined), method: (string|undefined)}} */
Protocol.FetchAgent.ContinueRequestRequest;
/** @typedef {Object|undefined} */
Protocol.FetchAgent.ContinueRequestResponse;
/**
 * @param {!Protocol.FetchAgent.ContinueRequestRequest} obj
 * @return {!Promise<!Protocol.FetchAgent.ContinueRequestResponse>} */
Protocol.FetchAgent.prototype.invoke_continueRequest = function (obj) {};

/**
 * @param {Protocol.Fetch.RequestId} requestId
 * @param {Protocol.Fetch.AuthChallengeResponse} authChallengeResponse
 * @return {!Promise<undefined>}
 */
Protocol.FetchAgent.prototype.continueWithAuth = function (requestId, authChallengeResponse) {};
/** @typedef {!{authChallengeResponse: Protocol.Fetch.AuthChallengeResponse, requestId: Protocol.Fetch.RequestId}} */
Protocol.FetchAgent.ContinueWithAuthRequest;
/** @typedef {Object|undefined} */
Protocol.FetchAgent.ContinueWithAuthResponse;
/**
 * @param {!Protocol.FetchAgent.ContinueWithAuthRequest} obj
 * @return {!Promise<!Protocol.FetchAgent.ContinueWithAuthResponse>} */
Protocol.FetchAgent.prototype.invoke_continueWithAuth = function (obj) {};

/**
 * @param {Protocol.Fetch.RequestId} requestId
 * @return {!Promise<?string>}
 */
Protocol.FetchAgent.prototype.getResponseBody = function (requestId) {};
/** @typedef {!{requestId: Protocol.Fetch.RequestId}} */
Protocol.FetchAgent.GetResponseBodyRequest;
/** @typedef {!{body: string, base64Encoded: boolean}} */
Protocol.FetchAgent.GetResponseBodyResponse;
/**
 * @param {!Protocol.FetchAgent.GetResponseBodyRequest} obj
 * @return {!Promise<!Protocol.FetchAgent.GetResponseBodyResponse>} */
Protocol.FetchAgent.prototype.invoke_getResponseBody = function (obj) {};

/**
 * @param {Protocol.Fetch.RequestId} requestId
 * @return {!Promise<?Protocol.IO.StreamHandle>}
 */
Protocol.FetchAgent.prototype.takeResponseBodyAsStream = function (requestId) {};
/** @typedef {!{requestId: Protocol.Fetch.RequestId}} */
Protocol.FetchAgent.TakeResponseBodyAsStreamRequest;
/** @typedef {!{stream: Protocol.IO.StreamHandle}} */
Protocol.FetchAgent.TakeResponseBodyAsStreamResponse;
/**
 * @param {!Protocol.FetchAgent.TakeResponseBodyAsStreamRequest} obj
 * @return {!Promise<!Protocol.FetchAgent.TakeResponseBodyAsStreamResponse>} */
Protocol.FetchAgent.prototype.invoke_takeResponseBodyAsStream = function (obj) {};

/** @typedef {string} */
Protocol.Fetch.RequestId;

/** @enum {string} */
Protocol.Fetch.RequestStage = {
  Request: 'Request',
  Response: 'Response',
};

/** @typedef {!{urlPattern:(string|undefined), resourceType:(Protocol.Network.ResourceType|undefined), requestStage:(Protocol.Fetch.RequestStage|undefined)}} */
Protocol.Fetch.RequestPattern;

/** @typedef {!{name:(string), value:(string)}} */
Protocol.Fetch.HeaderEntry;

/** @enum {string} */
Protocol.Fetch.AuthChallengeSource = {
  Server: 'Server',
  Proxy: 'Proxy',
};

/** @typedef {!{source:(Protocol.Fetch.AuthChallengeSource|undefined), origin:(string), scheme:(string), realm:(string)}} */
Protocol.Fetch.AuthChallenge;

/** @enum {string} */
Protocol.Fetch.AuthChallengeResponseResponse = {
  Default: 'Default',
  CancelAuth: 'CancelAuth',
  ProvideCredentials: 'ProvideCredentials',
};

/** @typedef {!{response:(Protocol.Fetch.AuthChallengeResponseResponse), username:(string|undefined), password:(string|undefined)}} */
Protocol.Fetch.AuthChallengeResponse;
/** @interface */
Protocol.FetchDispatcher = function () {};
/**
 * @param {Protocol.Fetch.RequestId} requestId
 * @param {Protocol.Network.Request} request
 * @param {Protocol.Page.FrameId} frameId
 * @param {Protocol.Network.ResourceType} resourceType
 * @param {Protocol.Network.ErrorReason=} opt_responseErrorReason
 * @param {number=} opt_responseStatusCode
 * @param {!Array<Protocol.Fetch.HeaderEntry>=} opt_responseHeaders
 * @param {Protocol.Fetch.RequestId=} opt_networkId
 */
Protocol.FetchDispatcher.prototype.requestPaused = function (
  requestId,
  request,
  frameId,
  resourceType,
  opt_responseErrorReason,
  opt_responseStatusCode,
  opt_responseHeaders,
  opt_networkId,
) {};
/**
 * @param {Protocol.Fetch.RequestId} requestId
 * @param {Protocol.Network.Request} request
 * @param {Protocol.Page.FrameId} frameId
 * @param {Protocol.Network.ResourceType} resourceType
 * @param {Protocol.Fetch.AuthChallenge} authChallenge
 */
Protocol.FetchDispatcher.prototype.authRequired = function (
  requestId,
  request,
  frameId,
  resourceType,
  authChallenge,
) {};
Protocol.WebAudio = {};

/**
 * @constructor
 */
Protocol.WebAudioAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.WebAudioAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.WebAudioAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.WebAudioAgent.EnableResponse;
/**
 * @param {!Protocol.WebAudioAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.WebAudioAgent.EnableResponse>} */
Protocol.WebAudioAgent.prototype.invoke_enable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.WebAudioAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.WebAudioAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.WebAudioAgent.DisableResponse;
/**
 * @param {!Protocol.WebAudioAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.WebAudioAgent.DisableResponse>} */
Protocol.WebAudioAgent.prototype.invoke_disable = function (obj) {};

/**
 * @param {Protocol.WebAudio.GraphObjectId} contextId
 * @return {!Promise<?Protocol.WebAudio.ContextRealtimeData>}
 */
Protocol.WebAudioAgent.prototype.getRealtimeData = function (contextId) {};
/** @typedef {!{contextId: Protocol.WebAudio.GraphObjectId}} */
Protocol.WebAudioAgent.GetRealtimeDataRequest;
/** @typedef {!{realtimeData: Protocol.WebAudio.ContextRealtimeData}} */
Protocol.WebAudioAgent.GetRealtimeDataResponse;
/**
 * @param {!Protocol.WebAudioAgent.GetRealtimeDataRequest} obj
 * @return {!Promise<!Protocol.WebAudioAgent.GetRealtimeDataResponse>} */
Protocol.WebAudioAgent.prototype.invoke_getRealtimeData = function (obj) {};

/** @typedef {string} */
Protocol.WebAudio.GraphObjectId;

/** @enum {string} */
Protocol.WebAudio.ContextType = {
  Realtime: 'realtime',
  Offline: 'offline',
};

/** @enum {string} */
Protocol.WebAudio.ContextState = {
  Suspended: 'suspended',
  Running: 'running',
  Closed: 'closed',
};

/** @typedef {string} */
Protocol.WebAudio.NodeType;

/** @enum {string} */
Protocol.WebAudio.ChannelCountMode = {
  ClampedMax: 'clamped-max',
  Explicit: 'explicit',
  Max: 'max',
};

/** @enum {string} */
Protocol.WebAudio.ChannelInterpretation = {
  Discrete: 'discrete',
  Speakers: 'speakers',
};

/** @typedef {string} */
Protocol.WebAudio.ParamType;

/** @enum {string} */
Protocol.WebAudio.AutomationRate = {
  ARate: 'a-rate',
  KRate: 'k-rate',
};

/** @typedef {!{currentTime:(number), renderCapacity:(number), callbackIntervalMean:(number), callbackIntervalVariance:(number)}} */
Protocol.WebAudio.ContextRealtimeData;

/** @typedef {!{contextId:(Protocol.WebAudio.GraphObjectId), contextType:(Protocol.WebAudio.ContextType), contextState:(Protocol.WebAudio.ContextState), realtimeData:(Protocol.WebAudio.ContextRealtimeData|undefined), callbackBufferSize:(number), maxOutputChannelCount:(number), sampleRate:(number)}} */
Protocol.WebAudio.BaseAudioContext;

/** @typedef {!{listenerId:(Protocol.WebAudio.GraphObjectId), contextId:(Protocol.WebAudio.GraphObjectId)}} */
Protocol.WebAudio.AudioListener;

/** @typedef {!{nodeId:(Protocol.WebAudio.GraphObjectId), contextId:(Protocol.WebAudio.GraphObjectId), nodeType:(Protocol.WebAudio.NodeType), numberOfInputs:(number), numberOfOutputs:(number), channelCount:(number), channelCountMode:(Protocol.WebAudio.ChannelCountMode), channelInterpretation:(Protocol.WebAudio.ChannelInterpretation)}} */
Protocol.WebAudio.AudioNode;

/** @typedef {!{paramId:(Protocol.WebAudio.GraphObjectId), nodeId:(Protocol.WebAudio.GraphObjectId), contextId:(Protocol.WebAudio.GraphObjectId), paramType:(Protocol.WebAudio.ParamType), rate:(Protocol.WebAudio.AutomationRate), defaultValue:(number), minValue:(number), maxValue:(number)}} */
Protocol.WebAudio.AudioParam;
/** @interface */
Protocol.WebAudioDispatcher = function () {};
/**
 * @param {Protocol.WebAudio.BaseAudioContext} context
 */
Protocol.WebAudioDispatcher.prototype.contextCreated = function (context) {};
/**
 * @param {Protocol.WebAudio.GraphObjectId} contextId
 */
Protocol.WebAudioDispatcher.prototype.contextWillBeDestroyed = function (contextId) {};
/**
 * @param {Protocol.WebAudio.BaseAudioContext} context
 */
Protocol.WebAudioDispatcher.prototype.contextChanged = function (context) {};
/**
 * @param {Protocol.WebAudio.AudioListener} listener
 */
Protocol.WebAudioDispatcher.prototype.audioListenerCreated = function (listener) {};
/**
 * @param {Protocol.WebAudio.GraphObjectId} contextId
 * @param {Protocol.WebAudio.GraphObjectId} listenerId
 */
Protocol.WebAudioDispatcher.prototype.audioListenerWillBeDestroyed = function (contextId, listenerId) {};
/**
 * @param {Protocol.WebAudio.AudioNode} node
 */
Protocol.WebAudioDispatcher.prototype.audioNodeCreated = function (node) {};
/**
 * @param {Protocol.WebAudio.GraphObjectId} contextId
 * @param {Protocol.WebAudio.GraphObjectId} nodeId
 */
Protocol.WebAudioDispatcher.prototype.audioNodeWillBeDestroyed = function (contextId, nodeId) {};
/**
 * @param {Protocol.WebAudio.AudioParam} param
 */
Protocol.WebAudioDispatcher.prototype.audioParamCreated = function (param) {};
/**
 * @param {Protocol.WebAudio.GraphObjectId} contextId
 * @param {Protocol.WebAudio.GraphObjectId} nodeId
 * @param {Protocol.WebAudio.GraphObjectId} paramId
 */
Protocol.WebAudioDispatcher.prototype.audioParamWillBeDestroyed = function (contextId, nodeId, paramId) {};
/**
 * @param {Protocol.WebAudio.GraphObjectId} contextId
 * @param {Protocol.WebAudio.GraphObjectId} sourceId
 * @param {Protocol.WebAudio.GraphObjectId} destinationId
 * @param {number=} opt_sourceOutputIndex
 * @param {number=} opt_destinationInputIndex
 */
Protocol.WebAudioDispatcher.prototype.nodesConnected = function (
  contextId,
  sourceId,
  destinationId,
  opt_sourceOutputIndex,
  opt_destinationInputIndex,
) {};
/**
 * @param {Protocol.WebAudio.GraphObjectId} contextId
 * @param {Protocol.WebAudio.GraphObjectId} sourceId
 * @param {Protocol.WebAudio.GraphObjectId} destinationId
 * @param {number=} opt_sourceOutputIndex
 * @param {number=} opt_destinationInputIndex
 */
Protocol.WebAudioDispatcher.prototype.nodesDisconnected = function (
  contextId,
  sourceId,
  destinationId,
  opt_sourceOutputIndex,
  opt_destinationInputIndex,
) {};
/**
 * @param {Protocol.WebAudio.GraphObjectId} contextId
 * @param {Protocol.WebAudio.GraphObjectId} sourceId
 * @param {Protocol.WebAudio.GraphObjectId} destinationId
 * @param {number=} opt_sourceOutputIndex
 */
Protocol.WebAudioDispatcher.prototype.nodeParamConnected = function (
  contextId,
  sourceId,
  destinationId,
  opt_sourceOutputIndex,
) {};
/**
 * @param {Protocol.WebAudio.GraphObjectId} contextId
 * @param {Protocol.WebAudio.GraphObjectId} sourceId
 * @param {Protocol.WebAudio.GraphObjectId} destinationId
 * @param {number=} opt_sourceOutputIndex
 */
Protocol.WebAudioDispatcher.prototype.nodeParamDisconnected = function (
  contextId,
  sourceId,
  destinationId,
  opt_sourceOutputIndex,
) {};
Protocol.WebAuthn = {};

/**
 * @constructor
 */
Protocol.WebAuthnAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.WebAuthnAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.WebAuthnAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.WebAuthnAgent.EnableResponse;
/**
 * @param {!Protocol.WebAuthnAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.WebAuthnAgent.EnableResponse>} */
Protocol.WebAuthnAgent.prototype.invoke_enable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.WebAuthnAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.WebAuthnAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.WebAuthnAgent.DisableResponse;
/**
 * @param {!Protocol.WebAuthnAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.WebAuthnAgent.DisableResponse>} */
Protocol.WebAuthnAgent.prototype.invoke_disable = function (obj) {};

/**
 * @param {Protocol.WebAuthn.VirtualAuthenticatorOptions} options
 * @return {!Promise<?Protocol.WebAuthn.AuthenticatorId>}
 */
Protocol.WebAuthnAgent.prototype.addVirtualAuthenticator = function (options) {};
/** @typedef {!{options: Protocol.WebAuthn.VirtualAuthenticatorOptions}} */
Protocol.WebAuthnAgent.AddVirtualAuthenticatorRequest;
/** @typedef {!{authenticatorId: Protocol.WebAuthn.AuthenticatorId}} */
Protocol.WebAuthnAgent.AddVirtualAuthenticatorResponse;
/**
 * @param {!Protocol.WebAuthnAgent.AddVirtualAuthenticatorRequest} obj
 * @return {!Promise<!Protocol.WebAuthnAgent.AddVirtualAuthenticatorResponse>} */
Protocol.WebAuthnAgent.prototype.invoke_addVirtualAuthenticator = function (obj) {};

/**
 * @param {Protocol.WebAuthn.AuthenticatorId} authenticatorId
 * @return {!Promise<undefined>}
 */
Protocol.WebAuthnAgent.prototype.removeVirtualAuthenticator = function (authenticatorId) {};
/** @typedef {!{authenticatorId: Protocol.WebAuthn.AuthenticatorId}} */
Protocol.WebAuthnAgent.RemoveVirtualAuthenticatorRequest;
/** @typedef {Object|undefined} */
Protocol.WebAuthnAgent.RemoveVirtualAuthenticatorResponse;
/**
 * @param {!Protocol.WebAuthnAgent.RemoveVirtualAuthenticatorRequest} obj
 * @return {!Promise<!Protocol.WebAuthnAgent.RemoveVirtualAuthenticatorResponse>} */
Protocol.WebAuthnAgent.prototype.invoke_removeVirtualAuthenticator = function (obj) {};

/**
 * @param {Protocol.WebAuthn.AuthenticatorId} authenticatorId
 * @param {Protocol.WebAuthn.Credential} credential
 * @return {!Promise<undefined>}
 */
Protocol.WebAuthnAgent.prototype.addCredential = function (authenticatorId, credential) {};
/** @typedef {!{authenticatorId: Protocol.WebAuthn.AuthenticatorId, credential: Protocol.WebAuthn.Credential}} */
Protocol.WebAuthnAgent.AddCredentialRequest;
/** @typedef {Object|undefined} */
Protocol.WebAuthnAgent.AddCredentialResponse;
/**
 * @param {!Protocol.WebAuthnAgent.AddCredentialRequest} obj
 * @return {!Promise<!Protocol.WebAuthnAgent.AddCredentialResponse>} */
Protocol.WebAuthnAgent.prototype.invoke_addCredential = function (obj) {};

/**
 * @param {Protocol.WebAuthn.AuthenticatorId} authenticatorId
 * @param {string} credentialId
 * @return {!Promise<?Protocol.WebAuthn.Credential>}
 */
Protocol.WebAuthnAgent.prototype.getCredential = function (authenticatorId, credentialId) {};
/** @typedef {!{credentialId: string, authenticatorId: Protocol.WebAuthn.AuthenticatorId}} */
Protocol.WebAuthnAgent.GetCredentialRequest;
/** @typedef {!{credential: Protocol.WebAuthn.Credential}} */
Protocol.WebAuthnAgent.GetCredentialResponse;
/**
 * @param {!Protocol.WebAuthnAgent.GetCredentialRequest} obj
 * @return {!Promise<!Protocol.WebAuthnAgent.GetCredentialResponse>} */
Protocol.WebAuthnAgent.prototype.invoke_getCredential = function (obj) {};

/**
 * @param {Protocol.WebAuthn.AuthenticatorId} authenticatorId
 * @return {!Promise<?Array<Protocol.WebAuthn.Credential>>}
 */
Protocol.WebAuthnAgent.prototype.getCredentials = function (authenticatorId) {};
/** @typedef {!{authenticatorId: Protocol.WebAuthn.AuthenticatorId}} */
Protocol.WebAuthnAgent.GetCredentialsRequest;
/** @typedef {!{credentials: !Array<Protocol.WebAuthn.Credential>}} */
Protocol.WebAuthnAgent.GetCredentialsResponse;
/**
 * @param {!Protocol.WebAuthnAgent.GetCredentialsRequest} obj
 * @return {!Promise<!Protocol.WebAuthnAgent.GetCredentialsResponse>} */
Protocol.WebAuthnAgent.prototype.invoke_getCredentials = function (obj) {};

/**
 * @param {Protocol.WebAuthn.AuthenticatorId} authenticatorId
 * @param {string} credentialId
 * @return {!Promise<undefined>}
 */
Protocol.WebAuthnAgent.prototype.removeCredential = function (authenticatorId, credentialId) {};
/** @typedef {!{credentialId: string, authenticatorId: Protocol.WebAuthn.AuthenticatorId}} */
Protocol.WebAuthnAgent.RemoveCredentialRequest;
/** @typedef {Object|undefined} */
Protocol.WebAuthnAgent.RemoveCredentialResponse;
/**
 * @param {!Protocol.WebAuthnAgent.RemoveCredentialRequest} obj
 * @return {!Promise<!Protocol.WebAuthnAgent.RemoveCredentialResponse>} */
Protocol.WebAuthnAgent.prototype.invoke_removeCredential = function (obj) {};

/**
 * @param {Protocol.WebAuthn.AuthenticatorId} authenticatorId
 * @return {!Promise<undefined>}
 */
Protocol.WebAuthnAgent.prototype.clearCredentials = function (authenticatorId) {};
/** @typedef {!{authenticatorId: Protocol.WebAuthn.AuthenticatorId}} */
Protocol.WebAuthnAgent.ClearCredentialsRequest;
/** @typedef {Object|undefined} */
Protocol.WebAuthnAgent.ClearCredentialsResponse;
/**
 * @param {!Protocol.WebAuthnAgent.ClearCredentialsRequest} obj
 * @return {!Promise<!Protocol.WebAuthnAgent.ClearCredentialsResponse>} */
Protocol.WebAuthnAgent.prototype.invoke_clearCredentials = function (obj) {};

/**
 * @param {Protocol.WebAuthn.AuthenticatorId} authenticatorId
 * @param {boolean} isUserVerified
 * @return {!Promise<undefined>}
 */
Protocol.WebAuthnAgent.prototype.setUserVerified = function (authenticatorId, isUserVerified) {};
/** @typedef {!{authenticatorId: Protocol.WebAuthn.AuthenticatorId, isUserVerified: boolean}} */
Protocol.WebAuthnAgent.SetUserVerifiedRequest;
/** @typedef {Object|undefined} */
Protocol.WebAuthnAgent.SetUserVerifiedResponse;
/**
 * @param {!Protocol.WebAuthnAgent.SetUserVerifiedRequest} obj
 * @return {!Promise<!Protocol.WebAuthnAgent.SetUserVerifiedResponse>} */
Protocol.WebAuthnAgent.prototype.invoke_setUserVerified = function (obj) {};

/** @typedef {string} */
Protocol.WebAuthn.AuthenticatorId;

/** @enum {string} */
Protocol.WebAuthn.AuthenticatorProtocol = {
  U2f: 'u2f',
  Ctap2: 'ctap2',
};

/** @enum {string} */
Protocol.WebAuthn.AuthenticatorTransport = {
  Usb: 'usb',
  Nfc: 'nfc',
  Ble: 'ble',
  Cable: 'cable',
  Internal: 'internal',
};

/** @typedef {!{protocol:(Protocol.WebAuthn.AuthenticatorProtocol), transport:(Protocol.WebAuthn.AuthenticatorTransport), hasResidentKey:(boolean|undefined), hasUserVerification:(boolean|undefined), automaticPresenceSimulation:(boolean|undefined), isUserVerified:(boolean|undefined)}} */
Protocol.WebAuthn.VirtualAuthenticatorOptions;

/** @typedef {!{credentialId:(string), isResidentCredential:(boolean), rpId:(string|undefined), privateKey:(string), userHandle:(string|undefined), signCount:(number)}} */
Protocol.WebAuthn.Credential;
/** @interface */
Protocol.WebAuthnDispatcher = function () {};
Protocol.Media = {};

/**
 * @constructor
 */
Protocol.MediaAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.MediaAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.MediaAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.MediaAgent.EnableResponse;
/**
 * @param {!Protocol.MediaAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.MediaAgent.EnableResponse>} */
Protocol.MediaAgent.prototype.invoke_enable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.MediaAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.MediaAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.MediaAgent.DisableResponse;
/**
 * @param {!Protocol.MediaAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.MediaAgent.DisableResponse>} */
Protocol.MediaAgent.prototype.invoke_disable = function (obj) {};

/** @typedef {string} */
Protocol.Media.PlayerId;

/** @typedef {number} */
Protocol.Media.Timestamp;

/** @typedef {!{name:(string), value:(string|undefined)}} */
Protocol.Media.PlayerProperty;

/** @enum {string} */
Protocol.Media.PlayerEventType = {
  PlaybackEvent: 'playbackEvent',
  SystemEvent: 'systemEvent',
  MessageEvent: 'messageEvent',
};

/** @typedef {!{type:(Protocol.Media.PlayerEventType), timestamp:(Protocol.Media.Timestamp), name:(string), value:(string)}} */
Protocol.Media.PlayerEvent;
/** @interface */
Protocol.MediaDispatcher = function () {};
/**
 * @param {Protocol.Media.PlayerId} playerId
 * @param {!Array<Protocol.Media.PlayerProperty>} properties
 */
Protocol.MediaDispatcher.prototype.playerPropertiesChanged = function (playerId, properties) {};
/**
 * @param {Protocol.Media.PlayerId} playerId
 * @param {!Array<Protocol.Media.PlayerEvent>} events
 */
Protocol.MediaDispatcher.prototype.playerEventsAdded = function (playerId, events) {};
/**
 * @param {!Array<Protocol.Media.PlayerId>} players
 */
Protocol.MediaDispatcher.prototype.playersCreated = function (players) {};
Protocol.Console = {};

/**
 * @constructor
 */
Protocol.ConsoleAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ConsoleAgent.prototype.clearMessages = function () {};
/** @typedef {Object|undefined} */
Protocol.ConsoleAgent.ClearMessagesRequest;
/** @typedef {Object|undefined} */
Protocol.ConsoleAgent.ClearMessagesResponse;
/**
 * @param {!Protocol.ConsoleAgent.ClearMessagesRequest} obj
 * @return {!Promise<!Protocol.ConsoleAgent.ClearMessagesResponse>} */
Protocol.ConsoleAgent.prototype.invoke_clearMessages = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ConsoleAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.ConsoleAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.ConsoleAgent.DisableResponse;
/**
 * @param {!Protocol.ConsoleAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.ConsoleAgent.DisableResponse>} */
Protocol.ConsoleAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ConsoleAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.ConsoleAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.ConsoleAgent.EnableResponse;
/**
 * @param {!Protocol.ConsoleAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.ConsoleAgent.EnableResponse>} */
Protocol.ConsoleAgent.prototype.invoke_enable = function (obj) {};

/** @enum {string} */
Protocol.Console.ConsoleMessageSource = {
  XML: 'xml',
  Javascript: 'javascript',
  Network: 'network',
  ConsoleAPI: 'console-api',
  Storage: 'storage',
  Appcache: 'appcache',
  Rendering: 'rendering',
  Security: 'security',
  Other: 'other',
  Deprecation: 'deprecation',
  Worker: 'worker',
};

/** @enum {string} */
Protocol.Console.ConsoleMessageLevel = {
  Log: 'log',
  Warning: 'warning',
  Error: 'error',
  Debug: 'debug',
  Info: 'info',
};

/** @typedef {!{source:(Protocol.Console.ConsoleMessageSource), level:(Protocol.Console.ConsoleMessageLevel), text:(string), url:(string|undefined), line:(number|undefined), column:(number|undefined)}} */
Protocol.Console.ConsoleMessage;
/** @interface */
Protocol.ConsoleDispatcher = function () {};
/**
 * @param {Protocol.Console.ConsoleMessage} message
 */
Protocol.ConsoleDispatcher.prototype.messageAdded = function (message) {};
Protocol.Debugger = {};

/**
 * @constructor
 */
Protocol.DebuggerAgent = function () {};

/**
 * @param {Protocol.Debugger.Location} location
 * @param {string=} opt_targetCallFrames
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.continueToLocation = function (location, opt_targetCallFrames) {};
/** @typedef {!{location: Protocol.Debugger.Location, targetCallFrames: (string|undefined)}} */
Protocol.DebuggerAgent.ContinueToLocationRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.ContinueToLocationResponse;
/**
 * @param {!Protocol.DebuggerAgent.ContinueToLocationRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.ContinueToLocationResponse>} */
Protocol.DebuggerAgent.prototype.invoke_continueToLocation = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.DisableResponse;
/**
 * @param {!Protocol.DebuggerAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.DisableResponse>} */
Protocol.DebuggerAgent.prototype.invoke_disable = function (obj) {};

/**
 * @param {number=} opt_maxScriptsCacheSize
 * @return {!Promise<?Protocol.Runtime.UniqueDebuggerId>}
 */
Protocol.DebuggerAgent.prototype.enable = function (opt_maxScriptsCacheSize) {};
/** @typedef {!{maxScriptsCacheSize: (number|undefined)}} */
Protocol.DebuggerAgent.EnableRequest;
/** @typedef {!{debuggerId: Protocol.Runtime.UniqueDebuggerId}} */
Protocol.DebuggerAgent.EnableResponse;
/**
 * @param {!Protocol.DebuggerAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.EnableResponse>} */
Protocol.DebuggerAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {Protocol.Debugger.CallFrameId} callFrameId
 * @param {string} expression
 * @param {string=} opt_objectGroup
 * @param {boolean=} opt_includeCommandLineAPI
 * @param {boolean=} opt_silent
 * @param {boolean=} opt_returnByValue
 * @param {boolean=} opt_generatePreview
 * @param {boolean=} opt_throwOnSideEffect
 * @param {Protocol.Runtime.TimeDelta=} opt_timeout
 * @return {!Promise<?Protocol.Runtime.RemoteObject>}
 */
Protocol.DebuggerAgent.prototype.evaluateOnCallFrame = function (
  callFrameId,
  expression,
  opt_objectGroup,
  opt_includeCommandLineAPI,
  opt_silent,
  opt_returnByValue,
  opt_generatePreview,
  opt_throwOnSideEffect,
  opt_timeout,
) {};
/** @typedef {!{objectGroup: (string|undefined), includeCommandLineAPI: (boolean|undefined), silent: (boolean|undefined), throwOnSideEffect: (boolean|undefined), generatePreview: (boolean|undefined), returnByValue: (boolean|undefined), callFrameId: Protocol.Debugger.CallFrameId, timeout: (Protocol.Runtime.TimeDelta|undefined), expression: string}} */
Protocol.DebuggerAgent.EvaluateOnCallFrameRequest;
/** @typedef {!{exceptionDetails: Protocol.Runtime.ExceptionDetails, result: Protocol.Runtime.RemoteObject}} */
Protocol.DebuggerAgent.EvaluateOnCallFrameResponse;
/**
 * @param {!Protocol.DebuggerAgent.EvaluateOnCallFrameRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.EvaluateOnCallFrameResponse>} */
Protocol.DebuggerAgent.prototype.invoke_evaluateOnCallFrame = function (obj) {};

/**
 * @param {Protocol.Debugger.Location} start
 * @param {Protocol.Debugger.Location=} opt_end
 * @param {boolean=} opt_restrictToFunction
 * @return {!Promise<?Array<Protocol.Debugger.BreakLocation>>}
 */
Protocol.DebuggerAgent.prototype.getPossibleBreakpoints = function (start, opt_end, opt_restrictToFunction) {};
/** @typedef {!{start: Protocol.Debugger.Location, end: (Protocol.Debugger.Location|undefined), restrictToFunction: (boolean|undefined)}} */
Protocol.DebuggerAgent.GetPossibleBreakpointsRequest;
/** @typedef {!{locations: !Array<Protocol.Debugger.BreakLocation>}} */
Protocol.DebuggerAgent.GetPossibleBreakpointsResponse;
/**
 * @param {!Protocol.DebuggerAgent.GetPossibleBreakpointsRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.GetPossibleBreakpointsResponse>} */
Protocol.DebuggerAgent.prototype.invoke_getPossibleBreakpoints = function (obj) {};

/**
 * @param {Protocol.Runtime.ScriptId} scriptId
 * @return {!Promise<?string>}
 */
Protocol.DebuggerAgent.prototype.getScriptSource = function (scriptId) {};
/** @typedef {!{scriptId: Protocol.Runtime.ScriptId}} */
Protocol.DebuggerAgent.GetScriptSourceRequest;
/** @typedef {!{scriptSource: string}} */
Protocol.DebuggerAgent.GetScriptSourceResponse;
/**
 * @param {!Protocol.DebuggerAgent.GetScriptSourceRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.GetScriptSourceResponse>} */
Protocol.DebuggerAgent.prototype.invoke_getScriptSource = function (obj) {};

/**
 * @param {Protocol.Runtime.ScriptId} scriptId
 * @return {!Promise<?string>}
 */
Protocol.DebuggerAgent.prototype.getWasmBytecode = function (scriptId) {};
/** @typedef {!{scriptId: Protocol.Runtime.ScriptId}} */
Protocol.DebuggerAgent.GetWasmBytecodeRequest;
/** @typedef {!{bytecode: string}} */
Protocol.DebuggerAgent.GetWasmBytecodeResponse;
/**
 * @param {!Protocol.DebuggerAgent.GetWasmBytecodeRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.GetWasmBytecodeResponse>} */
Protocol.DebuggerAgent.prototype.invoke_getWasmBytecode = function (obj) {};

/**
 * @param {Protocol.Runtime.StackTraceId} stackTraceId
 * @return {!Promise<?Protocol.Runtime.StackTrace>}
 */
Protocol.DebuggerAgent.prototype.getStackTrace = function (stackTraceId) {};
/** @typedef {!{stackTraceId: Protocol.Runtime.StackTraceId}} */
Protocol.DebuggerAgent.GetStackTraceRequest;
/** @typedef {!{stackTrace: Protocol.Runtime.StackTrace}} */
Protocol.DebuggerAgent.GetStackTraceResponse;
/**
 * @param {!Protocol.DebuggerAgent.GetStackTraceRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.GetStackTraceResponse>} */
Protocol.DebuggerAgent.prototype.invoke_getStackTrace = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.pause = function () {};
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.PauseRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.PauseResponse;
/**
 * @param {!Protocol.DebuggerAgent.PauseRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.PauseResponse>} */
Protocol.DebuggerAgent.prototype.invoke_pause = function (obj) {};

/**
 * @param {Protocol.Runtime.StackTraceId} parentStackTraceId
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.pauseOnAsyncCall = function (parentStackTraceId) {};
/** @typedef {!{parentStackTraceId: Protocol.Runtime.StackTraceId}} */
Protocol.DebuggerAgent.PauseOnAsyncCallRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.PauseOnAsyncCallResponse;
/**
 * @param {!Protocol.DebuggerAgent.PauseOnAsyncCallRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.PauseOnAsyncCallResponse>} */
Protocol.DebuggerAgent.prototype.invoke_pauseOnAsyncCall = function (obj) {};

/**
 * @param {Protocol.Debugger.BreakpointId} breakpointId
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.removeBreakpoint = function (breakpointId) {};
/** @typedef {!{breakpointId: Protocol.Debugger.BreakpointId}} */
Protocol.DebuggerAgent.RemoveBreakpointRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.RemoveBreakpointResponse;
/**
 * @param {!Protocol.DebuggerAgent.RemoveBreakpointRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.RemoveBreakpointResponse>} */
Protocol.DebuggerAgent.prototype.invoke_removeBreakpoint = function (obj) {};

/**
 * @param {Protocol.Debugger.CallFrameId} callFrameId
 * @return {!Promise<?Array<Protocol.Debugger.CallFrame>>}
 */
Protocol.DebuggerAgent.prototype.restartFrame = function (callFrameId) {};
/** @typedef {!{callFrameId: Protocol.Debugger.CallFrameId}} */
Protocol.DebuggerAgent.RestartFrameRequest;
/** @typedef {!{asyncStackTrace: Protocol.Runtime.StackTrace, asyncStackTraceId: Protocol.Runtime.StackTraceId, callFrames: !Array<Protocol.Debugger.CallFrame>}} */
Protocol.DebuggerAgent.RestartFrameResponse;
/**
 * @param {!Protocol.DebuggerAgent.RestartFrameRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.RestartFrameResponse>} */
Protocol.DebuggerAgent.prototype.invoke_restartFrame = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.resume = function () {};
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.ResumeRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.ResumeResponse;
/**
 * @param {!Protocol.DebuggerAgent.ResumeRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.ResumeResponse>} */
Protocol.DebuggerAgent.prototype.invoke_resume = function (obj) {};

/**
 * @param {Protocol.Runtime.ScriptId} scriptId
 * @param {string} query
 * @param {boolean=} opt_caseSensitive
 * @param {boolean=} opt_isRegex
 * @return {!Promise<?Array<Protocol.Debugger.SearchMatch>>}
 */
Protocol.DebuggerAgent.prototype.searchInContent = function (scriptId, query, opt_caseSensitive, opt_isRegex) {};
/** @typedef {!{query: string, scriptId: Protocol.Runtime.ScriptId, isRegex: (boolean|undefined), caseSensitive: (boolean|undefined)}} */
Protocol.DebuggerAgent.SearchInContentRequest;
/** @typedef {!{result: !Array<Protocol.Debugger.SearchMatch>}} */
Protocol.DebuggerAgent.SearchInContentResponse;
/**
 * @param {!Protocol.DebuggerAgent.SearchInContentRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SearchInContentResponse>} */
Protocol.DebuggerAgent.prototype.invoke_searchInContent = function (obj) {};

/**
 * @param {number} maxDepth
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.setAsyncCallStackDepth = function (maxDepth) {};
/** @typedef {!{maxDepth: number}} */
Protocol.DebuggerAgent.SetAsyncCallStackDepthRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.SetAsyncCallStackDepthResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetAsyncCallStackDepthRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetAsyncCallStackDepthResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setAsyncCallStackDepth = function (obj) {};

/**
 * @param {!Array<string>} patterns
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.setBlackboxPatterns = function (patterns) {};
/** @typedef {!{patterns: !Array<string>}} */
Protocol.DebuggerAgent.SetBlackboxPatternsRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.SetBlackboxPatternsResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetBlackboxPatternsRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetBlackboxPatternsResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setBlackboxPatterns = function (obj) {};

/**
 * @param {Protocol.Runtime.ScriptId} scriptId
 * @param {!Array<Protocol.Debugger.ScriptPosition>} positions
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.setBlackboxedRanges = function (scriptId, positions) {};
/** @typedef {!{positions: !Array<Protocol.Debugger.ScriptPosition>, scriptId: Protocol.Runtime.ScriptId}} */
Protocol.DebuggerAgent.SetBlackboxedRangesRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.SetBlackboxedRangesResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetBlackboxedRangesRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetBlackboxedRangesResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setBlackboxedRanges = function (obj) {};

/**
 * @param {Protocol.Debugger.Location} location
 * @param {string=} opt_condition
 * @return {!Promise<?Protocol.Debugger.BreakpointId>}
 */
Protocol.DebuggerAgent.prototype.setBreakpoint = function (location, opt_condition) {};
/** @typedef {!{location: Protocol.Debugger.Location, condition: (string|undefined)}} */
Protocol.DebuggerAgent.SetBreakpointRequest;
/** @typedef {!{actualLocation: Protocol.Debugger.Location, breakpointId: Protocol.Debugger.BreakpointId}} */
Protocol.DebuggerAgent.SetBreakpointResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetBreakpointRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetBreakpointResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setBreakpoint = function (obj) {};

/**
 * @param {string} instrumentation
 * @return {!Promise<?Protocol.Debugger.BreakpointId>}
 */
Protocol.DebuggerAgent.prototype.setInstrumentationBreakpoint = function (instrumentation) {};
/** @typedef {!{instrumentation: string}} */
Protocol.DebuggerAgent.SetInstrumentationBreakpointRequest;
/** @typedef {!{breakpointId: Protocol.Debugger.BreakpointId}} */
Protocol.DebuggerAgent.SetInstrumentationBreakpointResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetInstrumentationBreakpointRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetInstrumentationBreakpointResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setInstrumentationBreakpoint = function (obj) {};

/**
 * @param {number} lineNumber
 * @param {string=} opt_url
 * @param {string=} opt_urlRegex
 * @param {string=} opt_scriptHash
 * @param {number=} opt_columnNumber
 * @param {string=} opt_condition
 * @return {!Promise<?Protocol.Debugger.BreakpointId>}
 */
Protocol.DebuggerAgent.prototype.setBreakpointByUrl = function (
  lineNumber,
  opt_url,
  opt_urlRegex,
  opt_scriptHash,
  opt_columnNumber,
  opt_condition,
) {};
/** @typedef {!{columnNumber: (number|undefined), urlRegex: (string|undefined), url: (string|undefined), lineNumber: number, scriptHash: (string|undefined), condition: (string|undefined)}} */
Protocol.DebuggerAgent.SetBreakpointByUrlRequest;
/** @typedef {!{breakpointId: Protocol.Debugger.BreakpointId, locations: !Array<Protocol.Debugger.Location>}} */
Protocol.DebuggerAgent.SetBreakpointByUrlResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetBreakpointByUrlRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetBreakpointByUrlResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setBreakpointByUrl = function (obj) {};

/**
 * @param {Protocol.Runtime.RemoteObjectId} objectId
 * @param {string=} opt_condition
 * @return {!Promise<?Protocol.Debugger.BreakpointId>}
 */
Protocol.DebuggerAgent.prototype.setBreakpointOnFunctionCall = function (objectId, opt_condition) {};
/** @typedef {!{condition: (string|undefined), objectId: Protocol.Runtime.RemoteObjectId}} */
Protocol.DebuggerAgent.SetBreakpointOnFunctionCallRequest;
/** @typedef {!{breakpointId: Protocol.Debugger.BreakpointId}} */
Protocol.DebuggerAgent.SetBreakpointOnFunctionCallResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetBreakpointOnFunctionCallRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetBreakpointOnFunctionCallResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setBreakpointOnFunctionCall = function (obj) {};

/**
 * @param {boolean} active
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.setBreakpointsActive = function (active) {};
/** @typedef {!{active: boolean}} */
Protocol.DebuggerAgent.SetBreakpointsActiveRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.SetBreakpointsActiveResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetBreakpointsActiveRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetBreakpointsActiveResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setBreakpointsActive = function (obj) {};

/**
 * @param {string} state
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.setPauseOnExceptions = function (state) {};
/** @typedef {!{state: string}} */
Protocol.DebuggerAgent.SetPauseOnExceptionsRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.SetPauseOnExceptionsResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetPauseOnExceptionsRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetPauseOnExceptionsResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setPauseOnExceptions = function (obj) {};

/**
 * @param {Protocol.Runtime.CallArgument} newValue
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.setReturnValue = function (newValue) {};
/** @typedef {!{newValue: Protocol.Runtime.CallArgument}} */
Protocol.DebuggerAgent.SetReturnValueRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.SetReturnValueResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetReturnValueRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetReturnValueResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setReturnValue = function (obj) {};

/**
 * @param {Protocol.Runtime.ScriptId} scriptId
 * @param {string} scriptSource
 * @param {boolean=} opt_dryRun
 * @return {!Promise<?Array<Protocol.Debugger.CallFrame>>}
 */
Protocol.DebuggerAgent.prototype.setScriptSource = function (scriptId, scriptSource, opt_dryRun) {};
/** @typedef {!{scriptId: Protocol.Runtime.ScriptId, dryRun: (boolean|undefined), scriptSource: string}} */
Protocol.DebuggerAgent.SetScriptSourceRequest;
/** @typedef {!{stackChanged: boolean, asyncStackTrace: Protocol.Runtime.StackTrace, exceptionDetails: Protocol.Runtime.ExceptionDetails, callFrames: !Array<Protocol.Debugger.CallFrame>, asyncStackTraceId: Protocol.Runtime.StackTraceId}} */
Protocol.DebuggerAgent.SetScriptSourceResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetScriptSourceRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetScriptSourceResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setScriptSource = function (obj) {};

/**
 * @param {boolean} skip
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.setSkipAllPauses = function (skip) {};
/** @typedef {!{skip: boolean}} */
Protocol.DebuggerAgent.SetSkipAllPausesRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.SetSkipAllPausesResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetSkipAllPausesRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetSkipAllPausesResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setSkipAllPauses = function (obj) {};

/**
 * @param {number} scopeNumber
 * @param {string} variableName
 * @param {Protocol.Runtime.CallArgument} newValue
 * @param {Protocol.Debugger.CallFrameId} callFrameId
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.setVariableValue = function (scopeNumber, variableName, newValue, callFrameId) {};
/** @typedef {!{callFrameId: Protocol.Debugger.CallFrameId, scopeNumber: number, variableName: string, newValue: Protocol.Runtime.CallArgument}} */
Protocol.DebuggerAgent.SetVariableValueRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.SetVariableValueResponse;
/**
 * @param {!Protocol.DebuggerAgent.SetVariableValueRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.SetVariableValueResponse>} */
Protocol.DebuggerAgent.prototype.invoke_setVariableValue = function (obj) {};

/**
 * @param {boolean=} opt_breakOnAsyncCall
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.stepInto = function (opt_breakOnAsyncCall) {};
/** @typedef {!{breakOnAsyncCall: (boolean|undefined)}} */
Protocol.DebuggerAgent.StepIntoRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.StepIntoResponse;
/**
 * @param {!Protocol.DebuggerAgent.StepIntoRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.StepIntoResponse>} */
Protocol.DebuggerAgent.prototype.invoke_stepInto = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.stepOut = function () {};
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.StepOutRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.StepOutResponse;
/**
 * @param {!Protocol.DebuggerAgent.StepOutRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.StepOutResponse>} */
Protocol.DebuggerAgent.prototype.invoke_stepOut = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.DebuggerAgent.prototype.stepOver = function () {};
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.StepOverRequest;
/** @typedef {Object|undefined} */
Protocol.DebuggerAgent.StepOverResponse;
/**
 * @param {!Protocol.DebuggerAgent.StepOverRequest} obj
 * @return {!Promise<!Protocol.DebuggerAgent.StepOverResponse>} */
Protocol.DebuggerAgent.prototype.invoke_stepOver = function (obj) {};

/** @typedef {string} */
Protocol.Debugger.BreakpointId;

/** @typedef {string} */
Protocol.Debugger.CallFrameId;

/** @typedef {!{scriptId:(Protocol.Runtime.ScriptId), lineNumber:(number), columnNumber:(number|undefined)}} */
Protocol.Debugger.Location;

/** @typedef {!{lineNumber:(number), columnNumber:(number)}} */
Protocol.Debugger.ScriptPosition;

/** @typedef {!{callFrameId:(Protocol.Debugger.CallFrameId), functionName:(string), functionLocation:(Protocol.Debugger.Location|undefined), location:(Protocol.Debugger.Location), url:(string), scopeChain:(!Array<Protocol.Debugger.Scope>), this:(Protocol.Runtime.RemoteObject), returnValue:(Protocol.Runtime.RemoteObject|undefined)}} */
Protocol.Debugger.CallFrame;

/** @enum {string} */
Protocol.Debugger.ScopeType = {
  Global: 'global',
  Local: 'local',
  With: 'with',
  Closure: 'closure',
  Catch: 'catch',
  Block: 'block',
  Script: 'script',
  Eval: 'eval',
  Module: 'module',
};

/** @typedef {!{type:(Protocol.Debugger.ScopeType), object:(Protocol.Runtime.RemoteObject), name:(string|undefined), startLocation:(Protocol.Debugger.Location|undefined), endLocation:(Protocol.Debugger.Location|undefined)}} */
Protocol.Debugger.Scope;

/** @typedef {!{lineNumber:(number), lineContent:(string)}} */
Protocol.Debugger.SearchMatch;

/** @enum {string} */
Protocol.Debugger.BreakLocationType = {
  DebuggerStatement: 'debuggerStatement',
  Call: 'call',
  Return: 'return',
};

/** @typedef {!{scriptId:(Protocol.Runtime.ScriptId), lineNumber:(number), columnNumber:(number|undefined), type:(Protocol.Debugger.BreakLocationType|undefined)}} */
Protocol.Debugger.BreakLocation;
/** @constructor */
Protocol.DebuggerDispatcher = function () {};
/**
 * @param {Protocol.Debugger.BreakpointId} breakpointId
 * @param {Protocol.Debugger.Location} location
 */
Protocol.DebuggerDispatcher.prototype.breakpointResolved = function (breakpointId, location) {};
/**
 * @param {!Array<Protocol.Debugger.CallFrame>} callFrames
 * @param {string} reason
 * @param {!Object=} opt_data
 * @param {!Array<string>=} opt_hitBreakpoints
 * @param {Protocol.Runtime.StackTrace=} opt_asyncStackTrace
 * @param {Protocol.Runtime.StackTraceId=} opt_asyncStackTraceId
 * @param {Protocol.Runtime.StackTraceId=} opt_asyncCallStackTraceId
 */
Protocol.DebuggerDispatcher.prototype.paused = function (
  callFrames,
  reason,
  opt_data,
  opt_hitBreakpoints,
  opt_asyncStackTrace,
  opt_asyncStackTraceId,
  opt_asyncCallStackTraceId,
) {};
Protocol.DebuggerDispatcher.prototype.resumed = function () {};
/**
 * @param {Protocol.Runtime.ScriptId} scriptId
 * @param {string} url
 * @param {number} startLine
 * @param {number} startColumn
 * @param {number} endLine
 * @param {number} endColumn
 * @param {Protocol.Runtime.ExecutionContextId} executionContextId
 * @param {string} hash
 * @param {!Object=} opt_executionContextAuxData
 * @param {string=} opt_sourceMapURL
 * @param {boolean=} opt_hasSourceURL
 * @param {boolean=} opt_isModule
 * @param {number=} opt_length
 * @param {Protocol.Runtime.StackTrace=} opt_stackTrace
 */
Protocol.DebuggerDispatcher.prototype.scriptFailedToParse = function (
  scriptId,
  url,
  startLine,
  startColumn,
  endLine,
  endColumn,
  executionContextId,
  hash,
  opt_executionContextAuxData,
  opt_sourceMapURL,
  opt_hasSourceURL,
  opt_isModule,
  opt_length,
  opt_stackTrace,
) {};
/**
 * @param {Protocol.Runtime.ScriptId} scriptId
 * @param {string} url
 * @param {number} startLine
 * @param {number} startColumn
 * @param {number} endLine
 * @param {number} endColumn
 * @param {Protocol.Runtime.ExecutionContextId} executionContextId
 * @param {string} hash
 * @param {!Object=} opt_executionContextAuxData
 * @param {boolean=} opt_isLiveEdit
 * @param {string=} opt_sourceMapURL
 * @param {boolean=} opt_hasSourceURL
 * @param {boolean=} opt_isModule
 * @param {number=} opt_length
 * @param {Protocol.Runtime.StackTrace=} opt_stackTrace
 */
Protocol.DebuggerDispatcher.prototype.scriptParsed = function (
  scriptId,
  url,
  startLine,
  startColumn,
  endLine,
  endColumn,
  executionContextId,
  hash,
  opt_executionContextAuxData,
  opt_isLiveEdit,
  opt_sourceMapURL,
  opt_hasSourceURL,
  opt_isModule,
  opt_length,
  opt_stackTrace,
) {};
Protocol.HeapProfiler = {};

/**
 * @constructor
 */
Protocol.HeapProfilerAgent = function () {};

/**
 * @param {Protocol.HeapProfiler.HeapSnapshotObjectId} heapObjectId
 * @return {!Promise<undefined>}
 */
Protocol.HeapProfilerAgent.prototype.addInspectedHeapObject = function (heapObjectId) {};
/** @typedef {!{heapObjectId: Protocol.HeapProfiler.HeapSnapshotObjectId}} */
Protocol.HeapProfilerAgent.AddInspectedHeapObjectRequest;
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.AddInspectedHeapObjectResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.AddInspectedHeapObjectRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.AddInspectedHeapObjectResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_addInspectedHeapObject = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.HeapProfilerAgent.prototype.collectGarbage = function () {};
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.CollectGarbageRequest;
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.CollectGarbageResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.CollectGarbageRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.CollectGarbageResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_collectGarbage = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.HeapProfilerAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.DisableResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.DisableResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.HeapProfilerAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.EnableResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.EnableResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {Protocol.Runtime.RemoteObjectId} objectId
 * @return {!Promise<?Protocol.HeapProfiler.HeapSnapshotObjectId>}
 */
Protocol.HeapProfilerAgent.prototype.getHeapObjectId = function (objectId) {};
/** @typedef {!{objectId: Protocol.Runtime.RemoteObjectId}} */
Protocol.HeapProfilerAgent.GetHeapObjectIdRequest;
/** @typedef {!{heapSnapshotObjectId: Protocol.HeapProfiler.HeapSnapshotObjectId}} */
Protocol.HeapProfilerAgent.GetHeapObjectIdResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.GetHeapObjectIdRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.GetHeapObjectIdResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_getHeapObjectId = function (obj) {};

/**
 * @param {Protocol.HeapProfiler.HeapSnapshotObjectId} objectId
 * @param {string=} opt_objectGroup
 * @return {!Promise<?Protocol.Runtime.RemoteObject>}
 */
Protocol.HeapProfilerAgent.prototype.getObjectByHeapObjectId = function (objectId, opt_objectGroup) {};
/** @typedef {!{objectGroup: (string|undefined), objectId: Protocol.HeapProfiler.HeapSnapshotObjectId}} */
Protocol.HeapProfilerAgent.GetObjectByHeapObjectIdRequest;
/** @typedef {!{result: Protocol.Runtime.RemoteObject}} */
Protocol.HeapProfilerAgent.GetObjectByHeapObjectIdResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.GetObjectByHeapObjectIdRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.GetObjectByHeapObjectIdResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_getObjectByHeapObjectId = function (obj) {};

/**
 * @return {!Promise<?Protocol.HeapProfiler.SamplingHeapProfile>}
 */
Protocol.HeapProfilerAgent.prototype.getSamplingProfile = function () {};
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.GetSamplingProfileRequest;
/** @typedef {!{profile: Protocol.HeapProfiler.SamplingHeapProfile}} */
Protocol.HeapProfilerAgent.GetSamplingProfileResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.GetSamplingProfileRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.GetSamplingProfileResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_getSamplingProfile = function (obj) {};

/**
 * @param {number=} opt_samplingInterval
 * @return {!Promise<undefined>}
 */
Protocol.HeapProfilerAgent.prototype.startSampling = function (opt_samplingInterval) {};
/** @typedef {!{samplingInterval: (number|undefined)}} */
Protocol.HeapProfilerAgent.StartSamplingRequest;
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.StartSamplingResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.StartSamplingRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.StartSamplingResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_startSampling = function (obj) {};

/**
 * @param {boolean=} opt_trackAllocations
 * @return {!Promise<undefined>}
 */
Protocol.HeapProfilerAgent.prototype.startTrackingHeapObjects = function (opt_trackAllocations) {};
/** @typedef {!{trackAllocations: (boolean|undefined)}} */
Protocol.HeapProfilerAgent.StartTrackingHeapObjectsRequest;
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.StartTrackingHeapObjectsResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.StartTrackingHeapObjectsRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.StartTrackingHeapObjectsResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_startTrackingHeapObjects = function (obj) {};

/**
 * @return {!Promise<?Protocol.HeapProfiler.SamplingHeapProfile>}
 */
Protocol.HeapProfilerAgent.prototype.stopSampling = function () {};
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.StopSamplingRequest;
/** @typedef {!{profile: Protocol.HeapProfiler.SamplingHeapProfile}} */
Protocol.HeapProfilerAgent.StopSamplingResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.StopSamplingRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.StopSamplingResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_stopSampling = function (obj) {};

/**
 * @param {boolean=} opt_reportProgress
 * @return {!Promise<undefined>}
 */
Protocol.HeapProfilerAgent.prototype.stopTrackingHeapObjects = function (opt_reportProgress) {};
/** @typedef {!{reportProgress: (boolean|undefined)}} */
Protocol.HeapProfilerAgent.StopTrackingHeapObjectsRequest;
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.StopTrackingHeapObjectsResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.StopTrackingHeapObjectsRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.StopTrackingHeapObjectsResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_stopTrackingHeapObjects = function (obj) {};

/**
 * @param {boolean=} opt_reportProgress
 * @return {!Promise<undefined>}
 */
Protocol.HeapProfilerAgent.prototype.takeHeapSnapshot = function (opt_reportProgress) {};
/** @typedef {!{reportProgress: (boolean|undefined)}} */
Protocol.HeapProfilerAgent.TakeHeapSnapshotRequest;
/** @typedef {Object|undefined} */
Protocol.HeapProfilerAgent.TakeHeapSnapshotResponse;
/**
 * @param {!Protocol.HeapProfilerAgent.TakeHeapSnapshotRequest} obj
 * @return {!Promise<!Protocol.HeapProfilerAgent.TakeHeapSnapshotResponse>} */
Protocol.HeapProfilerAgent.prototype.invoke_takeHeapSnapshot = function (obj) {};

/** @typedef {string} */
Protocol.HeapProfiler.HeapSnapshotObjectId;

/** @typedef {!{callFrame:(Protocol.Runtime.CallFrame), selfSize:(number), id:(number), children:(!Array<Protocol.HeapProfiler.SamplingHeapProfileNode>)}} */
Protocol.HeapProfiler.SamplingHeapProfileNode;

/** @typedef {!{size:(number), nodeId:(number), ordinal:(number)}} */
Protocol.HeapProfiler.SamplingHeapProfileSample;

/** @typedef {!{head:(Protocol.HeapProfiler.SamplingHeapProfileNode), samples:(!Array<Protocol.HeapProfiler.SamplingHeapProfileSample>)}} */
Protocol.HeapProfiler.SamplingHeapProfile;
/** @constructor */
Protocol.HeapProfilerDispatcher = function () {};
/**
 * @param {string} chunk
 */
Protocol.HeapProfilerDispatcher.prototype.addHeapSnapshotChunk = function (chunk) {};
/**
 * @param {!Array<number>} statsUpdate
 */
Protocol.HeapProfilerDispatcher.prototype.heapStatsUpdate = function (statsUpdate) {};
/**
 * @param {number} lastSeenObjectId
 * @param {number} timestamp
 */
Protocol.HeapProfilerDispatcher.prototype.lastSeenObjectId = function (lastSeenObjectId, timestamp) {};
/**
 * @param {number} done
 * @param {number} total
 * @param {boolean=} opt_finished
 */
Protocol.HeapProfilerDispatcher.prototype.reportHeapSnapshotProgress = function (done, total, opt_finished) {};
Protocol.HeapProfilerDispatcher.prototype.resetProfiles = function () {};
Protocol.Profiler = {};

/**
 * @constructor
 */
Protocol.ProfilerAgent = function () {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ProfilerAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.DisableResponse;
/**
 * @param {!Protocol.ProfilerAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.DisableResponse>} */
Protocol.ProfilerAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ProfilerAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.EnableResponse;
/**
 * @param {!Protocol.ProfilerAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.EnableResponse>} */
Protocol.ProfilerAgent.prototype.invoke_enable = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.Profiler.ScriptCoverage>>}
 */
Protocol.ProfilerAgent.prototype.getBestEffortCoverage = function () {};
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.GetBestEffortCoverageRequest;
/** @typedef {!{result: !Array<Protocol.Profiler.ScriptCoverage>}} */
Protocol.ProfilerAgent.GetBestEffortCoverageResponse;
/**
 * @param {!Protocol.ProfilerAgent.GetBestEffortCoverageRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.GetBestEffortCoverageResponse>} */
Protocol.ProfilerAgent.prototype.invoke_getBestEffortCoverage = function (obj) {};

/**
 * @param {number} interval
 * @return {!Promise<undefined>}
 */
Protocol.ProfilerAgent.prototype.setSamplingInterval = function (interval) {};
/** @typedef {!{interval: number}} */
Protocol.ProfilerAgent.SetSamplingIntervalRequest;
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.SetSamplingIntervalResponse;
/**
 * @param {!Protocol.ProfilerAgent.SetSamplingIntervalRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.SetSamplingIntervalResponse>} */
Protocol.ProfilerAgent.prototype.invoke_setSamplingInterval = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ProfilerAgent.prototype.start = function () {};
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.StartRequest;
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.StartResponse;
/**
 * @param {!Protocol.ProfilerAgent.StartRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.StartResponse>} */
Protocol.ProfilerAgent.prototype.invoke_start = function (obj) {};

/**
 * @param {boolean=} opt_callCount
 * @param {boolean=} opt_detailed
 * @return {!Promise<undefined>}
 */
Protocol.ProfilerAgent.prototype.startPreciseCoverage = function (opt_callCount, opt_detailed) {};
/** @typedef {!{detailed: (boolean|undefined), callCount: (boolean|undefined)}} */
Protocol.ProfilerAgent.StartPreciseCoverageRequest;
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.StartPreciseCoverageResponse;
/**
 * @param {!Protocol.ProfilerAgent.StartPreciseCoverageRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.StartPreciseCoverageResponse>} */
Protocol.ProfilerAgent.prototype.invoke_startPreciseCoverage = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ProfilerAgent.prototype.startTypeProfile = function () {};
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.StartTypeProfileRequest;
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.StartTypeProfileResponse;
/**
 * @param {!Protocol.ProfilerAgent.StartTypeProfileRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.StartTypeProfileResponse>} */
Protocol.ProfilerAgent.prototype.invoke_startTypeProfile = function (obj) {};

/**
 * @return {!Promise<?Protocol.Profiler.Profile>}
 */
Protocol.ProfilerAgent.prototype.stop = function () {};
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.StopRequest;
/** @typedef {!{profile: Protocol.Profiler.Profile}} */
Protocol.ProfilerAgent.StopResponse;
/**
 * @param {!Protocol.ProfilerAgent.StopRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.StopResponse>} */
Protocol.ProfilerAgent.prototype.invoke_stop = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ProfilerAgent.prototype.stopPreciseCoverage = function () {};
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.StopPreciseCoverageRequest;
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.StopPreciseCoverageResponse;
/**
 * @param {!Protocol.ProfilerAgent.StopPreciseCoverageRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.StopPreciseCoverageResponse>} */
Protocol.ProfilerAgent.prototype.invoke_stopPreciseCoverage = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.ProfilerAgent.prototype.stopTypeProfile = function () {};
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.StopTypeProfileRequest;
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.StopTypeProfileResponse;
/**
 * @param {!Protocol.ProfilerAgent.StopTypeProfileRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.StopTypeProfileResponse>} */
Protocol.ProfilerAgent.prototype.invoke_stopTypeProfile = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.Profiler.ScriptCoverage>>}
 */
Protocol.ProfilerAgent.prototype.takePreciseCoverage = function () {};
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.TakePreciseCoverageRequest;
/** @typedef {!{result: !Array<Protocol.Profiler.ScriptCoverage>}} */
Protocol.ProfilerAgent.TakePreciseCoverageResponse;
/**
 * @param {!Protocol.ProfilerAgent.TakePreciseCoverageRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.TakePreciseCoverageResponse>} */
Protocol.ProfilerAgent.prototype.invoke_takePreciseCoverage = function (obj) {};

/**
 * @return {!Promise<?Array<Protocol.Profiler.ScriptTypeProfile>>}
 */
Protocol.ProfilerAgent.prototype.takeTypeProfile = function () {};
/** @typedef {Object|undefined} */
Protocol.ProfilerAgent.TakeTypeProfileRequest;
/** @typedef {!{result: !Array<Protocol.Profiler.ScriptTypeProfile>}} */
Protocol.ProfilerAgent.TakeTypeProfileResponse;
/**
 * @param {!Protocol.ProfilerAgent.TakeTypeProfileRequest} obj
 * @return {!Promise<!Protocol.ProfilerAgent.TakeTypeProfileResponse>} */
Protocol.ProfilerAgent.prototype.invoke_takeTypeProfile = function (obj) {};

/** @typedef {!{id:(number), callFrame:(Protocol.Runtime.CallFrame), hitCount:(number|undefined), children:(!Array<number>|undefined), deoptReason:(string|undefined), positionTicks:(!Array<Protocol.Profiler.PositionTickInfo>|undefined)}} */
Protocol.Profiler.ProfileNode;

/** @typedef {!{nodes:(!Array<Protocol.Profiler.ProfileNode>), startTime:(number), endTime:(number), samples:(!Array<number>|undefined), timeDeltas:(!Array<number>|undefined)}} */
Protocol.Profiler.Profile;

/** @typedef {!{line:(number), ticks:(number)}} */
Protocol.Profiler.PositionTickInfo;

/** @typedef {!{startOffset:(number), endOffset:(number), count:(number)}} */
Protocol.Profiler.CoverageRange;

/** @typedef {!{functionName:(string), ranges:(!Array<Protocol.Profiler.CoverageRange>), isBlockCoverage:(boolean)}} */
Protocol.Profiler.FunctionCoverage;

/** @typedef {!{scriptId:(Protocol.Runtime.ScriptId), url:(string), functions:(!Array<Protocol.Profiler.FunctionCoverage>)}} */
Protocol.Profiler.ScriptCoverage;

/** @typedef {!{name:(string)}} */
Protocol.Profiler.TypeObject;

/** @typedef {!{offset:(number), types:(!Array<Protocol.Profiler.TypeObject>)}} */
Protocol.Profiler.TypeProfileEntry;

/** @typedef {!{scriptId:(Protocol.Runtime.ScriptId), url:(string), entries:(!Array<Protocol.Profiler.TypeProfileEntry>)}} */
Protocol.Profiler.ScriptTypeProfile;
/** @interface */
Protocol.ProfilerDispatcher = function () {};
/**
 * @param {string} id
 * @param {Protocol.Debugger.Location} location
 * @param {Protocol.Profiler.Profile} profile
 * @param {string=} opt_title
 */
Protocol.ProfilerDispatcher.prototype.consoleProfileFinished = function (id, location, profile, opt_title) {};
/**
 * @param {string} id
 * @param {Protocol.Debugger.Location} location
 * @param {string=} opt_title
 */
Protocol.ProfilerDispatcher.prototype.consoleProfileStarted = function (id, location, opt_title) {};
Protocol.Runtime = {};

/**
 * @constructor
 */
Protocol.RuntimeAgent = function () {};

/**
 * @param {Protocol.Runtime.RemoteObjectId} promiseObjectId
 * @param {boolean=} opt_returnByValue
 * @param {boolean=} opt_generatePreview
 * @return {!Promise<?Protocol.Runtime.RemoteObject>}
 */
Protocol.RuntimeAgent.prototype.awaitPromise = function (promiseObjectId, opt_returnByValue, opt_generatePreview) {};
/** @typedef {!{returnByValue: (boolean|undefined), generatePreview: (boolean|undefined), promiseObjectId: Protocol.Runtime.RemoteObjectId}} */
Protocol.RuntimeAgent.AwaitPromiseRequest;
/** @typedef {!{exceptionDetails: Protocol.Runtime.ExceptionDetails, result: Protocol.Runtime.RemoteObject}} */
Protocol.RuntimeAgent.AwaitPromiseResponse;
/**
 * @param {!Protocol.RuntimeAgent.AwaitPromiseRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.AwaitPromiseResponse>} */
Protocol.RuntimeAgent.prototype.invoke_awaitPromise = function (obj) {};

/**
 * @param {string} functionDeclaration
 * @param {Protocol.Runtime.RemoteObjectId=} opt_objectId
 * @param {!Array<Protocol.Runtime.CallArgument>=} opt__arguments
 * @param {boolean=} opt_silent
 * @param {boolean=} opt_returnByValue
 * @param {boolean=} opt_generatePreview
 * @param {boolean=} opt_userGesture
 * @param {boolean=} opt_awaitPromise
 * @param {Protocol.Runtime.ExecutionContextId=} opt_executionContextId
 * @param {string=} opt_objectGroup
 * @return {!Promise<?Protocol.Runtime.RemoteObject>}
 */
Protocol.RuntimeAgent.prototype.callFunctionOn = function (
  functionDeclaration,
  opt_objectId,
  opt__arguments,
  opt_silent,
  opt_returnByValue,
  opt_generatePreview,
  opt_userGesture,
  opt_awaitPromise,
  opt_executionContextId,
  opt_objectGroup,
) {};
/** @typedef {!{objectGroup: (string|undefined), silent: (boolean|undefined), objectId: (Protocol.Runtime.RemoteObjectId|undefined), functionDeclaration: string, generatePreview: (boolean|undefined), executionContextId: (Protocol.Runtime.ExecutionContextId|undefined), returnByValue: (boolean|undefined), _arguments: (!Array<Protocol.Runtime.CallArgument>|undefined), userGesture: (boolean|undefined), awaitPromise: (boolean|undefined)}} */
Protocol.RuntimeAgent.CallFunctionOnRequest;
/** @typedef {!{exceptionDetails: Protocol.Runtime.ExceptionDetails, result: Protocol.Runtime.RemoteObject}} */
Protocol.RuntimeAgent.CallFunctionOnResponse;
/**
 * @param {!Protocol.RuntimeAgent.CallFunctionOnRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.CallFunctionOnResponse>} */
Protocol.RuntimeAgent.prototype.invoke_callFunctionOn = function (obj) {};

/**
 * @param {string} expression
 * @param {string} sourceURL
 * @param {boolean} persistScript
 * @param {Protocol.Runtime.ExecutionContextId=} opt_executionContextId
 * @return {!Promise<?Protocol.Runtime.ScriptId>}
 */
Protocol.RuntimeAgent.prototype.compileScript = function (
  expression,
  sourceURL,
  persistScript,
  opt_executionContextId,
) {};
/** @typedef {!{persistScript: boolean, sourceURL: string, expression: string, executionContextId: (Protocol.Runtime.ExecutionContextId|undefined)}} */
Protocol.RuntimeAgent.CompileScriptRequest;
/** @typedef {!{scriptId: Protocol.Runtime.ScriptId, exceptionDetails: Protocol.Runtime.ExceptionDetails}} */
Protocol.RuntimeAgent.CompileScriptResponse;
/**
 * @param {!Protocol.RuntimeAgent.CompileScriptRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.CompileScriptResponse>} */
Protocol.RuntimeAgent.prototype.invoke_compileScript = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.disable = function () {};
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.DisableRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.DisableResponse;
/**
 * @param {!Protocol.RuntimeAgent.DisableRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.DisableResponse>} */
Protocol.RuntimeAgent.prototype.invoke_disable = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.discardConsoleEntries = function () {};
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.DiscardConsoleEntriesRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.DiscardConsoleEntriesResponse;
/**
 * @param {!Protocol.RuntimeAgent.DiscardConsoleEntriesRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.DiscardConsoleEntriesResponse>} */
Protocol.RuntimeAgent.prototype.invoke_discardConsoleEntries = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.enable = function () {};
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.EnableRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.EnableResponse;
/**
 * @param {!Protocol.RuntimeAgent.EnableRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.EnableResponse>} */
Protocol.RuntimeAgent.prototype.invoke_enable = function (obj) {};

/**
 * @param {string} expression
 * @param {string=} opt_objectGroup
 * @param {boolean=} opt_includeCommandLineAPI
 * @param {boolean=} opt_silent
 * @param {Protocol.Runtime.ExecutionContextId=} opt_contextId
 * @param {boolean=} opt_returnByValue
 * @param {boolean=} opt_generatePreview
 * @param {boolean=} opt_userGesture
 * @param {boolean=} opt_awaitPromise
 * @param {boolean=} opt_throwOnSideEffect
 * @param {Protocol.Runtime.TimeDelta=} opt_timeout
 * @param {boolean=} opt_disableBreaks
 * @param {boolean=} opt_replMode
 * @return {!Promise<?Protocol.Runtime.RemoteObject>}
 */
Protocol.RuntimeAgent.prototype.evaluate = function (
  expression,
  opt_objectGroup,
  opt_includeCommandLineAPI,
  opt_silent,
  opt_contextId,
  opt_returnByValue,
  opt_generatePreview,
  opt_userGesture,
  opt_awaitPromise,
  opt_throwOnSideEffect,
  opt_timeout,
  opt_disableBreaks,
  opt_replMode,
) {};
/** @typedef {!{objectGroup: (string|undefined), includeCommandLineAPI: (boolean|undefined), contextId: (Protocol.Runtime.ExecutionContextId|undefined), silent: (boolean|undefined), throwOnSideEffect: (boolean|undefined), generatePreview: (boolean|undefined), replMode: (boolean|undefined), returnByValue: (boolean|undefined), timeout: (Protocol.Runtime.TimeDelta|undefined), expression: string, userGesture: (boolean|undefined), disableBreaks: (boolean|undefined), awaitPromise: (boolean|undefined)}} */
Protocol.RuntimeAgent.EvaluateRequest;
/** @typedef {!{exceptionDetails: Protocol.Runtime.ExceptionDetails, result: Protocol.Runtime.RemoteObject}} */
Protocol.RuntimeAgent.EvaluateResponse;
/**
 * @param {!Protocol.RuntimeAgent.EvaluateRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.EvaluateResponse>} */
Protocol.RuntimeAgent.prototype.invoke_evaluate = function (obj) {};

/**
 * @return {!Promise<?string>}
 */
Protocol.RuntimeAgent.prototype.getIsolateId = function () {};
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.GetIsolateIdRequest;
/** @typedef {!{id: string}} */
Protocol.RuntimeAgent.GetIsolateIdResponse;
/**
 * @param {!Protocol.RuntimeAgent.GetIsolateIdRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.GetIsolateIdResponse>} */
Protocol.RuntimeAgent.prototype.invoke_getIsolateId = function (obj) {};

/**
 * @return {!Promise<?number>}
 */
Protocol.RuntimeAgent.prototype.getHeapUsage = function () {};
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.GetHeapUsageRequest;
/** @typedef {!{totalSize: number, usedSize: number}} */
Protocol.RuntimeAgent.GetHeapUsageResponse;
/**
 * @param {!Protocol.RuntimeAgent.GetHeapUsageRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.GetHeapUsageResponse>} */
Protocol.RuntimeAgent.prototype.invoke_getHeapUsage = function (obj) {};

/**
 * @param {Protocol.Runtime.RemoteObjectId} objectId
 * @param {boolean=} opt_ownProperties
 * @param {boolean=} opt_accessorPropertiesOnly
 * @param {boolean=} opt_generatePreview
 * @return {!Promise<?Array<Protocol.Runtime.PropertyDescriptor>>}
 */
Protocol.RuntimeAgent.prototype.getProperties = function (
  objectId,
  opt_ownProperties,
  opt_accessorPropertiesOnly,
  opt_generatePreview,
) {};
/** @typedef {!{ownProperties: (boolean|undefined), generatePreview: (boolean|undefined), accessorPropertiesOnly: (boolean|undefined), objectId: Protocol.Runtime.RemoteObjectId}} */
Protocol.RuntimeAgent.GetPropertiesRequest;
/** @typedef {!{internalProperties: !Array<Protocol.Runtime.InternalPropertyDescriptor>, exceptionDetails: Protocol.Runtime.ExceptionDetails, result: !Array<Protocol.Runtime.PropertyDescriptor>, privateProperties: !Array<Protocol.Runtime.PrivatePropertyDescriptor>}} */
Protocol.RuntimeAgent.GetPropertiesResponse;
/**
 * @param {!Protocol.RuntimeAgent.GetPropertiesRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.GetPropertiesResponse>} */
Protocol.RuntimeAgent.prototype.invoke_getProperties = function (obj) {};

/**
 * @param {Protocol.Runtime.ExecutionContextId=} opt_executionContextId
 * @return {!Promise<?Array<string>>}
 */
Protocol.RuntimeAgent.prototype.globalLexicalScopeNames = function (opt_executionContextId) {};
/** @typedef {!{executionContextId: (Protocol.Runtime.ExecutionContextId|undefined)}} */
Protocol.RuntimeAgent.GlobalLexicalScopeNamesRequest;
/** @typedef {!{names: !Array<string>}} */
Protocol.RuntimeAgent.GlobalLexicalScopeNamesResponse;
/**
 * @param {!Protocol.RuntimeAgent.GlobalLexicalScopeNamesRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.GlobalLexicalScopeNamesResponse>} */
Protocol.RuntimeAgent.prototype.invoke_globalLexicalScopeNames = function (obj) {};

/**
 * @param {Protocol.Runtime.RemoteObjectId} prototypeObjectId
 * @param {string=} opt_objectGroup
 * @return {!Promise<?Protocol.Runtime.RemoteObject>}
 */
Protocol.RuntimeAgent.prototype.queryObjects = function (prototypeObjectId, opt_objectGroup) {};
/** @typedef {!{prototypeObjectId: Protocol.Runtime.RemoteObjectId, objectGroup: (string|undefined)}} */
Protocol.RuntimeAgent.QueryObjectsRequest;
/** @typedef {!{objects: Protocol.Runtime.RemoteObject}} */
Protocol.RuntimeAgent.QueryObjectsResponse;
/**
 * @param {!Protocol.RuntimeAgent.QueryObjectsRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.QueryObjectsResponse>} */
Protocol.RuntimeAgent.prototype.invoke_queryObjects = function (obj) {};

/**
 * @param {Protocol.Runtime.RemoteObjectId} objectId
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.releaseObject = function (objectId) {};
/** @typedef {!{objectId: Protocol.Runtime.RemoteObjectId}} */
Protocol.RuntimeAgent.ReleaseObjectRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.ReleaseObjectResponse;
/**
 * @param {!Protocol.RuntimeAgent.ReleaseObjectRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.ReleaseObjectResponse>} */
Protocol.RuntimeAgent.prototype.invoke_releaseObject = function (obj) {};

/**
 * @param {string} objectGroup
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.releaseObjectGroup = function (objectGroup) {};
/** @typedef {!{objectGroup: string}} */
Protocol.RuntimeAgent.ReleaseObjectGroupRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.ReleaseObjectGroupResponse;
/**
 * @param {!Protocol.RuntimeAgent.ReleaseObjectGroupRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.ReleaseObjectGroupResponse>} */
Protocol.RuntimeAgent.prototype.invoke_releaseObjectGroup = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.runIfWaitingForDebugger = function () {};
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.RunIfWaitingForDebuggerRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.RunIfWaitingForDebuggerResponse;
/**
 * @param {!Protocol.RuntimeAgent.RunIfWaitingForDebuggerRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.RunIfWaitingForDebuggerResponse>} */
Protocol.RuntimeAgent.prototype.invoke_runIfWaitingForDebugger = function (obj) {};

/**
 * @param {Protocol.Runtime.ScriptId} scriptId
 * @param {Protocol.Runtime.ExecutionContextId=} opt_executionContextId
 * @param {string=} opt_objectGroup
 * @param {boolean=} opt_silent
 * @param {boolean=} opt_includeCommandLineAPI
 * @param {boolean=} opt_returnByValue
 * @param {boolean=} opt_generatePreview
 * @param {boolean=} opt_awaitPromise
 * @return {!Promise<?Protocol.Runtime.RemoteObject>}
 */
Protocol.RuntimeAgent.prototype.runScript = function (
  scriptId,
  opt_executionContextId,
  opt_objectGroup,
  opt_silent,
  opt_includeCommandLineAPI,
  opt_returnByValue,
  opt_generatePreview,
  opt_awaitPromise,
) {};
/** @typedef {!{objectGroup: (string|undefined), includeCommandLineAPI: (boolean|undefined), silent: (boolean|undefined), generatePreview: (boolean|undefined), executionContextId: (Protocol.Runtime.ExecutionContextId|undefined), returnByValue: (boolean|undefined), scriptId: Protocol.Runtime.ScriptId, awaitPromise: (boolean|undefined)}} */
Protocol.RuntimeAgent.RunScriptRequest;
/** @typedef {!{exceptionDetails: Protocol.Runtime.ExceptionDetails, result: Protocol.Runtime.RemoteObject}} */
Protocol.RuntimeAgent.RunScriptResponse;
/**
 * @param {!Protocol.RuntimeAgent.RunScriptRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.RunScriptResponse>} */
Protocol.RuntimeAgent.prototype.invoke_runScript = function (obj) {};

/**
 * @param {number} maxDepth
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.setAsyncCallStackDepth = function (maxDepth) {};
/** @typedef {!{maxDepth: number}} */
Protocol.RuntimeAgent.SetAsyncCallStackDepthRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.SetAsyncCallStackDepthResponse;
/**
 * @param {!Protocol.RuntimeAgent.SetAsyncCallStackDepthRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.SetAsyncCallStackDepthResponse>} */
Protocol.RuntimeAgent.prototype.invoke_setAsyncCallStackDepth = function (obj) {};

/**
 * @param {boolean} enabled
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.setCustomObjectFormatterEnabled = function (enabled) {};
/** @typedef {!{enabled: boolean}} */
Protocol.RuntimeAgent.SetCustomObjectFormatterEnabledRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.SetCustomObjectFormatterEnabledResponse;
/**
 * @param {!Protocol.RuntimeAgent.SetCustomObjectFormatterEnabledRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.SetCustomObjectFormatterEnabledResponse>} */
Protocol.RuntimeAgent.prototype.invoke_setCustomObjectFormatterEnabled = function (obj) {};

/**
 * @param {number} size
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.setMaxCallStackSizeToCapture = function (size) {};
/** @typedef {!{size: number}} */
Protocol.RuntimeAgent.SetMaxCallStackSizeToCaptureRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.SetMaxCallStackSizeToCaptureResponse;
/**
 * @param {!Protocol.RuntimeAgent.SetMaxCallStackSizeToCaptureRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.SetMaxCallStackSizeToCaptureResponse>} */
Protocol.RuntimeAgent.prototype.invoke_setMaxCallStackSizeToCapture = function (obj) {};

/**
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.terminateExecution = function () {};
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.TerminateExecutionRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.TerminateExecutionResponse;
/**
 * @param {!Protocol.RuntimeAgent.TerminateExecutionRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.TerminateExecutionResponse>} */
Protocol.RuntimeAgent.prototype.invoke_terminateExecution = function (obj) {};

/**
 * @param {string} name
 * @param {Protocol.Runtime.ExecutionContextId=} opt_executionContextId
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.addBinding = function (name, opt_executionContextId) {};
/** @typedef {!{name: string, executionContextId: (Protocol.Runtime.ExecutionContextId|undefined)}} */
Protocol.RuntimeAgent.AddBindingRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.AddBindingResponse;
/**
 * @param {!Protocol.RuntimeAgent.AddBindingRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.AddBindingResponse>} */
Protocol.RuntimeAgent.prototype.invoke_addBinding = function (obj) {};

/**
 * @param {string} name
 * @return {!Promise<undefined>}
 */
Protocol.RuntimeAgent.prototype.removeBinding = function (name) {};
/** @typedef {!{name: string}} */
Protocol.RuntimeAgent.RemoveBindingRequest;
/** @typedef {Object|undefined} */
Protocol.RuntimeAgent.RemoveBindingResponse;
/**
 * @param {!Protocol.RuntimeAgent.RemoveBindingRequest} obj
 * @return {!Promise<!Protocol.RuntimeAgent.RemoveBindingResponse>} */
Protocol.RuntimeAgent.prototype.invoke_removeBinding = function (obj) {};

/** @typedef {string} */
Protocol.Runtime.ScriptId;

/** @typedef {string} */
Protocol.Runtime.RemoteObjectId;

/** @typedef {string} */
Protocol.Runtime.UnserializableValue;

/** @enum {string} */
Protocol.Runtime.RemoteObjectType = {
  Object: 'object',
  Function: 'function',
  Undefined: 'undefined',
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Symbol: 'symbol',
  Bigint: 'bigint',
};

/** @enum {string} */
Protocol.Runtime.RemoteObjectSubtype = {
  Array: 'array',
  Null: 'null',
  Node: 'node',
  Regexp: 'regexp',
  Date: 'date',
  Map: 'map',
  Set: 'set',
  Weakmap: 'weakmap',
  Weakset: 'weakset',
  Iterator: 'iterator',
  Generator: 'generator',
  Error: 'error',
  Proxy: 'proxy',
  Promise: 'promise',
  Typedarray: 'typedarray',
  Arraybuffer: 'arraybuffer',
  Dataview: 'dataview',
};

/** @typedef {!{type:(Protocol.Runtime.RemoteObjectType), subtype:(Protocol.Runtime.RemoteObjectSubtype|undefined), className:(string|undefined), value:(*|undefined), unserializableValue:(Protocol.Runtime.UnserializableValue|undefined), description:(string|undefined), objectId:(Protocol.Runtime.RemoteObjectId|undefined), preview:(Protocol.Runtime.ObjectPreview|undefined), customPreview:(Protocol.Runtime.CustomPreview|undefined)}} */
Protocol.Runtime.RemoteObject;

/** @typedef {!{header:(string), bodyGetterId:(Protocol.Runtime.RemoteObjectId|undefined)}} */
Protocol.Runtime.CustomPreview;

/** @enum {string} */
Protocol.Runtime.ObjectPreviewType = {
  Object: 'object',
  Function: 'function',
  Undefined: 'undefined',
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Symbol: 'symbol',
  Bigint: 'bigint',
};

/** @enum {string} */
Protocol.Runtime.ObjectPreviewSubtype = {
  Array: 'array',
  Null: 'null',
  Node: 'node',
  Regexp: 'regexp',
  Date: 'date',
  Map: 'map',
  Set: 'set',
  Weakmap: 'weakmap',
  Weakset: 'weakset',
  Iterator: 'iterator',
  Generator: 'generator',
  Error: 'error',
};

/** @typedef {!{type:(Protocol.Runtime.ObjectPreviewType), subtype:(Protocol.Runtime.ObjectPreviewSubtype|undefined), description:(string|undefined), overflow:(boolean), properties:(!Array<Protocol.Runtime.PropertyPreview>), entries:(!Array<Protocol.Runtime.EntryPreview>|undefined)}} */
Protocol.Runtime.ObjectPreview;

/** @enum {string} */
Protocol.Runtime.PropertyPreviewType = {
  Object: 'object',
  Function: 'function',
  Undefined: 'undefined',
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Symbol: 'symbol',
  Accessor: 'accessor',
  Bigint: 'bigint',
};

/** @enum {string} */
Protocol.Runtime.PropertyPreviewSubtype = {
  Array: 'array',
  Null: 'null',
  Node: 'node',
  Regexp: 'regexp',
  Date: 'date',
  Map: 'map',
  Set: 'set',
  Weakmap: 'weakmap',
  Weakset: 'weakset',
  Iterator: 'iterator',
  Generator: 'generator',
  Error: 'error',
};

/** @typedef {!{name:(string), type:(Protocol.Runtime.PropertyPreviewType), value:(string|undefined), valuePreview:(Protocol.Runtime.ObjectPreview|undefined), subtype:(Protocol.Runtime.PropertyPreviewSubtype|undefined)}} */
Protocol.Runtime.PropertyPreview;

/** @typedef {!{key:(Protocol.Runtime.ObjectPreview|undefined), value:(Protocol.Runtime.ObjectPreview)}} */
Protocol.Runtime.EntryPreview;

/** @typedef {!{name:(string), value:(Protocol.Runtime.RemoteObject|undefined), writable:(boolean|undefined), get:(Protocol.Runtime.RemoteObject|undefined), set:(Protocol.Runtime.RemoteObject|undefined), configurable:(boolean), enumerable:(boolean), wasThrown:(boolean|undefined), isOwn:(boolean|undefined), symbol:(Protocol.Runtime.RemoteObject|undefined)}} */
Protocol.Runtime.PropertyDescriptor;

/** @typedef {!{name:(string), value:(Protocol.Runtime.RemoteObject|undefined)}} */
Protocol.Runtime.InternalPropertyDescriptor;

/** @typedef {!{name:(string), value:(Protocol.Runtime.RemoteObject)}} */
Protocol.Runtime.PrivatePropertyDescriptor;

/** @typedef {!{value:(*|undefined), unserializableValue:(Protocol.Runtime.UnserializableValue|undefined), objectId:(Protocol.Runtime.RemoteObjectId|undefined)}} */
Protocol.Runtime.CallArgument;

/** @typedef {number} */
Protocol.Runtime.ExecutionContextId;

/** @typedef {!{id:(Protocol.Runtime.ExecutionContextId), origin:(string), name:(string), auxData:(!Object|undefined)}} */
Protocol.Runtime.ExecutionContextDescription;

/** @typedef {!{exceptionId:(number), text:(string), lineNumber:(number), columnNumber:(number), scriptId:(Protocol.Runtime.ScriptId|undefined), url:(string|undefined), stackTrace:(Protocol.Runtime.StackTrace|undefined), exception:(Protocol.Runtime.RemoteObject|undefined), executionContextId:(Protocol.Runtime.ExecutionContextId|undefined)}} */
Protocol.Runtime.ExceptionDetails;

/** @typedef {number} */
Protocol.Runtime.Timestamp;

/** @typedef {number} */
Protocol.Runtime.TimeDelta;

/** @typedef {!{functionName:(string), scriptId:(Protocol.Runtime.ScriptId), url:(string), lineNumber:(number), columnNumber:(number)}} */
Protocol.Runtime.CallFrame;

/** @typedef {!{description:(string|undefined), callFrames:(!Array<Protocol.Runtime.CallFrame>), parent:(Protocol.Runtime.StackTrace|undefined), parentId:(Protocol.Runtime.StackTraceId|undefined)}} */
Protocol.Runtime.StackTrace;

/** @typedef {string} */
Protocol.Runtime.UniqueDebuggerId;

/** @typedef {!{id:(string), debuggerId:(Protocol.Runtime.UniqueDebuggerId|undefined)}} */
Protocol.Runtime.StackTraceId;
/** @constructor */
Protocol.RuntimeDispatcher = function () {};
/**
 * @param {string} name
 * @param {string} payload
 * @param {Protocol.Runtime.ExecutionContextId} executionContextId
 */
Protocol.RuntimeDispatcher.prototype.bindingCalled = function (name, payload, executionContextId) {};
/**
 * @param {string} type
 * @param {!Array<Protocol.Runtime.RemoteObject>} args
 * @param {Protocol.Runtime.ExecutionContextId} executionContextId
 * @param {Protocol.Runtime.Timestamp} timestamp
 * @param {Protocol.Runtime.StackTrace=} opt_stackTrace
 * @param {string=} opt_context
 */
Protocol.RuntimeDispatcher.prototype.consoleAPICalled = function (
  type,
  args,
  executionContextId,
  timestamp,
  opt_stackTrace,
  opt_context,
) {};
/**
 * @param {string} reason
 * @param {number} exceptionId
 */
Protocol.RuntimeDispatcher.prototype.exceptionRevoked = function (reason, exceptionId) {};
/**
 * @param {Protocol.Runtime.Timestamp} timestamp
 * @param {Protocol.Runtime.ExceptionDetails} exceptionDetails
 */
Protocol.RuntimeDispatcher.prototype.exceptionThrown = function (timestamp, exceptionDetails) {};
/**
 * @param {Protocol.Runtime.ExecutionContextDescription} context
 */
Protocol.RuntimeDispatcher.prototype.executionContextCreated = function (context) {};
/**
 * @param {Protocol.Runtime.ExecutionContextId} executionContextId
 */
Protocol.RuntimeDispatcher.prototype.executionContextDestroyed = function (executionContextId) {};
Protocol.RuntimeDispatcher.prototype.executionContextsCleared = function () {};
/**
 * @param {Protocol.Runtime.RemoteObject} object
 * @param {!Object} hints
 */
Protocol.RuntimeDispatcher.prototype.inspectRequested = function (object, hints) {};
Protocol.Schema = {};

/**
 * @constructor
 */
Protocol.SchemaAgent = function () {};

/**
 * @return {!Promise<?Array<Protocol.Schema.Domain>>}
 */
Protocol.SchemaAgent.prototype.getDomains = function () {};
/** @typedef {Object|undefined} */
Protocol.SchemaAgent.GetDomainsRequest;
/** @typedef {!{domains: !Array<Protocol.Schema.Domain>}} */
Protocol.SchemaAgent.GetDomainsResponse;
/**
 * @param {!Protocol.SchemaAgent.GetDomainsRequest} obj
 * @return {!Promise<!Protocol.SchemaAgent.GetDomainsResponse>} */
Protocol.SchemaAgent.prototype.invoke_getDomains = function (obj) {};

/** @typedef {!{name:(string), version:(string)}} */
Protocol.Schema.Domain;
/** @interface */
Protocol.SchemaDispatcher = function () {};
/** @return {!Protocol.AccessibilityAgent}*/
Protocol.TargetBase.prototype.accessibilityAgent = function () {};
/**
 * @param {!Protocol.AccessibilityDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerAccessibilityDispatcher = function (dispatcher) {};
/** @return {!Protocol.AnimationAgent}*/
Protocol.TargetBase.prototype.animationAgent = function () {};
/**
 * @param {!Protocol.AnimationDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerAnimationDispatcher = function (dispatcher) {};
/** @return {!Protocol.ApplicationCacheAgent}*/
Protocol.TargetBase.prototype.applicationCacheAgent = function () {};
/**
 * @param {!Protocol.ApplicationCacheDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerApplicationCacheDispatcher = function (dispatcher) {};
/** @return {!Protocol.AuditsAgent}*/
Protocol.TargetBase.prototype.auditsAgent = function () {};
/**
 * @param {!Protocol.AuditsDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerAuditsDispatcher = function (dispatcher) {};
/** @return {!Protocol.BackgroundServiceAgent}*/
Protocol.TargetBase.prototype.backgroundServiceAgent = function () {};
/**
 * @param {!Protocol.BackgroundServiceDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerBackgroundServiceDispatcher = function (dispatcher) {};
/** @return {!Protocol.BrowserAgent}*/
Protocol.TargetBase.prototype.browserAgent = function () {};
/**
 * @param {!Protocol.BrowserDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerBrowserDispatcher = function (dispatcher) {};
/** @return {!Protocol.CSSAgent}*/
Protocol.TargetBase.prototype.cssAgent = function () {};
/**
 * @param {!Protocol.CSSDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerCSSDispatcher = function (dispatcher) {};
/** @return {!Protocol.CacheStorageAgent}*/
Protocol.TargetBase.prototype.cacheStorageAgent = function () {};
/**
 * @param {!Protocol.CacheStorageDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerCacheStorageDispatcher = function (dispatcher) {};
/** @return {!Protocol.CastAgent}*/
Protocol.TargetBase.prototype.castAgent = function () {};
/**
 * @param {!Protocol.CastDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerCastDispatcher = function (dispatcher) {};
/** @return {!Protocol.DOMAgent}*/
Protocol.TargetBase.prototype.domAgent = function () {};
/**
 * @param {!Protocol.DOMDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerDOMDispatcher = function (dispatcher) {};
/** @return {!Protocol.DOMDebuggerAgent}*/
Protocol.TargetBase.prototype.domdebuggerAgent = function () {};
/**
 * @param {!Protocol.DOMDebuggerDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerDOMDebuggerDispatcher = function (dispatcher) {};
/** @return {!Protocol.DOMSnapshotAgent}*/
Protocol.TargetBase.prototype.domsnapshotAgent = function () {};
/**
 * @param {!Protocol.DOMSnapshotDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerDOMSnapshotDispatcher = function (dispatcher) {};
/** @return {!Protocol.DOMStorageAgent}*/
Protocol.TargetBase.prototype.domstorageAgent = function () {};
/**
 * @param {!Protocol.DOMStorageDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerDOMStorageDispatcher = function (dispatcher) {};
/** @return {!Protocol.DatabaseAgent}*/
Protocol.TargetBase.prototype.databaseAgent = function () {};
/**
 * @param {!Protocol.DatabaseDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerDatabaseDispatcher = function (dispatcher) {};
/** @return {!Protocol.DeviceOrientationAgent}*/
Protocol.TargetBase.prototype.deviceOrientationAgent = function () {};
/**
 * @param {!Protocol.DeviceOrientationDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerDeviceOrientationDispatcher = function (dispatcher) {};
/** @return {!Protocol.EmulationAgent}*/
Protocol.TargetBase.prototype.emulationAgent = function () {};
/**
 * @param {!Protocol.EmulationDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerEmulationDispatcher = function (dispatcher) {};
/** @return {!Protocol.HeadlessExperimentalAgent}*/
Protocol.TargetBase.prototype.headlessExperimentalAgent = function () {};
/**
 * @param {!Protocol.HeadlessExperimentalDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerHeadlessExperimentalDispatcher = function (dispatcher) {};
/** @return {!Protocol.IOAgent}*/
Protocol.TargetBase.prototype.ioAgent = function () {};
/**
 * @param {!Protocol.IODispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerIODispatcher = function (dispatcher) {};
/** @return {!Protocol.IndexedDBAgent}*/
Protocol.TargetBase.prototype.indexedDBAgent = function () {};
/**
 * @param {!Protocol.IndexedDBDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerIndexedDBDispatcher = function (dispatcher) {};
/** @return {!Protocol.InputAgent}*/
Protocol.TargetBase.prototype.inputAgent = function () {};
/**
 * @param {!Protocol.InputDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerInputDispatcher = function (dispatcher) {};
/** @return {!Protocol.InspectorAgent}*/
Protocol.TargetBase.prototype.inspectorAgent = function () {};
/**
 * @param {!Protocol.InspectorDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerInspectorDispatcher = function (dispatcher) {};
/** @return {!Protocol.LayerTreeAgent}*/
Protocol.TargetBase.prototype.layerTreeAgent = function () {};
/**
 * @param {!Protocol.LayerTreeDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerLayerTreeDispatcher = function (dispatcher) {};
/** @return {!Protocol.LogAgent}*/
Protocol.TargetBase.prototype.logAgent = function () {};
/**
 * @param {!Protocol.LogDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerLogDispatcher = function (dispatcher) {};
/** @return {!Protocol.MemoryAgent}*/
Protocol.TargetBase.prototype.memoryAgent = function () {};
/**
 * @param {!Protocol.MemoryDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerMemoryDispatcher = function (dispatcher) {};
/** @return {!Protocol.NetworkAgent}*/
Protocol.TargetBase.prototype.networkAgent = function () {};
/**
 * @param {!Protocol.NetworkDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerNetworkDispatcher = function (dispatcher) {};
/** @return {!Protocol.OverlayAgent}*/
Protocol.TargetBase.prototype.overlayAgent = function () {};
/**
 * @param {!Protocol.OverlayDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerOverlayDispatcher = function (dispatcher) {};
/** @return {!Protocol.PageAgent}*/
Protocol.TargetBase.prototype.pageAgent = function () {};
/**
 * @param {!Protocol.PageDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerPageDispatcher = function (dispatcher) {};
/** @return {!Protocol.PerformanceAgent}*/
Protocol.TargetBase.prototype.performanceAgent = function () {};
/**
 * @param {!Protocol.PerformanceDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerPerformanceDispatcher = function (dispatcher) {};
/** @return {!Protocol.SecurityAgent}*/
Protocol.TargetBase.prototype.securityAgent = function () {};
/**
 * @param {!Protocol.SecurityDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerSecurityDispatcher = function (dispatcher) {};
/** @return {!Protocol.ServiceWorkerAgent}*/
Protocol.TargetBase.prototype.serviceWorkerAgent = function () {};
/**
 * @param {!Protocol.ServiceWorkerDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerServiceWorkerDispatcher = function (dispatcher) {};
/** @return {!Protocol.StorageAgent}*/
Protocol.TargetBase.prototype.storageAgent = function () {};
/**
 * @param {!Protocol.StorageDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerStorageDispatcher = function (dispatcher) {};
/** @return {!Protocol.SystemInfoAgent}*/
Protocol.TargetBase.prototype.systemInfoAgent = function () {};
/**
 * @param {!Protocol.SystemInfoDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerSystemInfoDispatcher = function (dispatcher) {};
/** @return {!Protocol.TargetAgent}*/
Protocol.TargetBase.prototype.targetAgent = function () {};
/**
 * @param {!Protocol.TargetDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerTargetDispatcher = function (dispatcher) {};
/** @return {!Protocol.TetheringAgent}*/
Protocol.TargetBase.prototype.tetheringAgent = function () {};
/**
 * @param {!Protocol.TetheringDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerTetheringDispatcher = function (dispatcher) {};
/** @return {!Protocol.TracingAgent}*/
Protocol.TargetBase.prototype.tracingAgent = function () {};
/**
 * @param {!Protocol.TracingDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerTracingDispatcher = function (dispatcher) {};
/** @return {!Protocol.FetchAgent}*/
Protocol.TargetBase.prototype.fetchAgent = function () {};
/**
 * @param {!Protocol.FetchDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerFetchDispatcher = function (dispatcher) {};
/** @return {!Protocol.WebAudioAgent}*/
Protocol.TargetBase.prototype.webAudioAgent = function () {};
/**
 * @param {!Protocol.WebAudioDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerWebAudioDispatcher = function (dispatcher) {};
/** @return {!Protocol.WebAuthnAgent}*/
Protocol.TargetBase.prototype.webAuthnAgent = function () {};
/**
 * @param {!Protocol.WebAuthnDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerWebAuthnDispatcher = function (dispatcher) {};
/** @return {!Protocol.MediaAgent}*/
Protocol.TargetBase.prototype.mediaAgent = function () {};
/**
 * @param {!Protocol.MediaDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerMediaDispatcher = function (dispatcher) {};
/** @return {!Protocol.ConsoleAgent}*/
Protocol.TargetBase.prototype.consoleAgent = function () {};
/**
 * @param {!Protocol.ConsoleDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerConsoleDispatcher = function (dispatcher) {};
/** @return {!Protocol.DebuggerAgent}*/
Protocol.TargetBase.prototype.debuggerAgent = function () {};
/**
 * @param {!Protocol.DebuggerDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerDebuggerDispatcher = function (dispatcher) {};
/** @return {!Protocol.HeapProfilerAgent}*/
Protocol.TargetBase.prototype.heapProfilerAgent = function () {};
/**
 * @param {!Protocol.HeapProfilerDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerHeapProfilerDispatcher = function (dispatcher) {};
/** @return {!Protocol.ProfilerAgent}*/
Protocol.TargetBase.prototype.profilerAgent = function () {};
/**
 * @param {!Protocol.ProfilerDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerProfilerDispatcher = function (dispatcher) {};
/** @return {!Protocol.RuntimeAgent}*/
Protocol.TargetBase.prototype.runtimeAgent = function () {};
/**
 * @param {!Protocol.RuntimeDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerRuntimeDispatcher = function (dispatcher) {};
/** @return {!Protocol.SchemaAgent}*/
Protocol.TargetBase.prototype.schemaAgent = function () {};
/**
 * @param {!Protocol.SchemaDispatcher} dispatcher
 */
Protocol.TargetBase.prototype.registerSchemaDispatcher = function (dispatcher) {};
