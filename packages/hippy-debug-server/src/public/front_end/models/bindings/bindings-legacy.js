// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as BindingsModule from './bindings.js';
self.Bindings = self.Bindings || {};
Bindings = Bindings || {};
/** @constructor */
Bindings.IgnoreListManager = BindingsModule.IgnoreListManager.IgnoreListManager;
/** @constructor */
Bindings.BreakpointManager = BindingsModule.BreakpointManager.BreakpointManager;
/** @enum {symbol} */
Bindings.BreakpointManager.Events = BindingsModule.BreakpointManager.Events;
/** @constructor */
Bindings.BreakpointManager.Breakpoint = BindingsModule.BreakpointManager.Breakpoint;
Bindings.BreakpointManager.ModelBreakpoint = BindingsModule.BreakpointManager.ModelBreakpoint;
/** @constructor */
Bindings.CSSWorkspaceBinding = BindingsModule.CSSWorkspaceBinding.CSSWorkspaceBinding;
/** @interface */
Bindings.CSSWorkspaceBinding.SourceMapping = BindingsModule.CSSWorkspaceBinding.SourceMapping;
/** @constructor */
Bindings.CSSWorkspaceBinding.ModelInfo = BindingsModule.CSSWorkspaceBinding.ModelInfo;
/** @constructor */
Bindings.CompilerScriptMapping = BindingsModule.CompilerScriptMapping.CompilerScriptMapping;
/** @constructor */
Bindings.ContentProviderBasedProject = BindingsModule.ContentProviderBasedProject.ContentProviderBasedProject;
/** @constructor */
Bindings.DebuggerWorkspaceBinding = BindingsModule.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding;
/** @interface */
Bindings.DebuggerSourceMapping = BindingsModule.DebuggerWorkspaceBinding.DebuggerSourceMapping;
/** @constructor */
Bindings.DefaultScriptMapping = BindingsModule.DefaultScriptMapping.DefaultScriptMapping;
/** @interface */
Bindings.ChunkedReader = BindingsModule.FileUtils.ChunkedReader;
/** @constructor */
Bindings.ChunkedFileReader = BindingsModule.FileUtils.ChunkedFileReader;
/** @constructor */
Bindings.FileOutputStream = BindingsModule.FileUtils.FileOutputStream;
/** @interface */
Bindings.LiveLocation = BindingsModule.LiveLocation.LiveLocation;
/** @constructor */
Bindings.LiveLocationPool = BindingsModule.LiveLocation.LiveLocationPool;
/** @constructor */
Bindings.NetworkProjectManager = BindingsModule.NetworkProject.NetworkProjectManager;
Bindings.NetworkProjectManager.Events = BindingsModule.NetworkProject.Events;
/** @constructor */
Bindings.NetworkProject = BindingsModule.NetworkProject.NetworkProject;
/** @constructor */
Bindings.PresentationConsoleMessageManager =
    BindingsModule.PresentationConsoleMessageHelper.PresentationConsoleMessageManager;
/** @constructor */
Bindings.PresentationConsoleMessage = BindingsModule.PresentationConsoleMessageHelper.PresentationConsoleMessage;
/** @constructor */
Bindings.ResourceMapping = BindingsModule.ResourceMapping.ResourceMapping;
/** @constructor */
Bindings.ResourceScriptFile = BindingsModule.ResourceScriptMapping.ResourceScriptFile;
Bindings.resourceForURL = BindingsModule.ResourceUtils.resourceForURL;
Bindings.displayNameForURL = BindingsModule.ResourceUtils.displayNameForURL;
/** @constructor */
Bindings.SASSSourceMapping = BindingsModule.SASSSourceMapping.SASSSourceMapping;
/** @constructor */
Bindings.StylesSourceMapping = BindingsModule.StylesSourceMapping.StylesSourceMapping;
/** @constructor */
Bindings.StyleFile = BindingsModule.StylesSourceMapping.StyleFile;
/** @constructor */
Bindings.TempFile = BindingsModule.TempFile.TempFile;
/** @constructor */
Bindings.TempFileBackingStorage = BindingsModule.TempFile.TempFileBackingStorage;
//# sourceMappingURL=bindings-legacy.js.map