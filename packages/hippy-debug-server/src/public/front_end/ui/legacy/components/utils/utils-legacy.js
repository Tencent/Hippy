// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as ComponentsModule from './utils.js';
self.Components = self.Components || {};
Components = Components || {};
/** @constructor */
Components.ImagePreview = ComponentsModule.ImagePreview.ImagePreview;
Components.JSPresentationUtils = {};
Components.JSPresentationUtils.buildStackTracePreviewContents =
    ComponentsModule.JSPresentationUtils.buildStackTracePreviewContents;
/** @constructor */
Components.Linkifier = ComponentsModule.Linkifier.Linkifier;
/** @constructor */
Components.Linkifier.LinkContextMenuProvider = ComponentsModule.Linkifier.LinkContextMenuProvider;
/** @constructor */
Components.Linkifier.LinkHandlerSettingUI = ComponentsModule.Linkifier.LinkHandlerSettingUI;
/** @constructor */
Components.Linkifier.ContentProviderContextMenuProvider = ComponentsModule.Linkifier.ContentProviderContextMenuProvider;
/** @interface */
Components.LinkDecorator = ComponentsModule.Linkifier.LinkDecorator;
Components.reload = ComponentsModule.Reload.reload;
/** @constructor */
Components.TargetDetachedDialog = ComponentsModule.TargetDetachedDialog.TargetDetachedDialog;
//# sourceMappingURL=utils-legacy.js.map