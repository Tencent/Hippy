// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as ObjectUIModule from './object_ui.js';
self.ObjectUI = self.ObjectUI || {};
ObjectUI = ObjectUI || {};
/** @constructor */
ObjectUI.CustomPreviewComponent = ObjectUIModule.CustomPreviewComponent.CustomPreviewComponent;
/** @constructor */
ObjectUI.JavaScriptAutocomplete = ObjectUIModule.JavaScriptAutocomplete.JavaScriptAutocomplete;
/** @constructor */
ObjectUI.JavaScriptAutocompleteConfig = ObjectUIModule.JavaScriptAutocomplete.JavaScriptAutocompleteConfig;
ObjectUI.javaScriptAutocomplete = ObjectUIModule.javaScriptAutocomplete;
/** @constructor */
ObjectUI.JavaScriptREPL = ObjectUIModule.JavaScriptREPL.JavaScriptREPL;
Object.defineProperty(ObjectUI.JavaScriptREPL, '_MaxLengthForEvaluation', {
    set: ObjectUIModule.JavaScriptREPL.setMaxLengthForEvaluation,
    get: ObjectUIModule.JavaScriptREPL.getMaxLengthForEvaluation,
});
/** @constructor */
ObjectUI.ObjectPopoverHelper = ObjectUIModule.ObjectPopoverHelper.ObjectPopoverHelper;
ObjectUI.ArrayGroupingTreeElement = ObjectUIModule.ObjectPropertiesSection.ArrayGroupingTreeElement;
/** @constructor */
ObjectUI.ExpandableTextPropertyValue = ObjectUIModule.ObjectPropertiesSection.ExpandableTextPropertyValue;
/** @constructor */
ObjectUI.ObjectPropertiesSection = ObjectUIModule.ObjectPropertiesSection.ObjectPropertiesSection;
Object.defineProperty(ObjectUI.ObjectPropertiesSection, '_maxRenderableStringLength', {
    set: ObjectUIModule.ObjectPropertiesSection.setMaxRenderableStringLength,
    get: ObjectUIModule.ObjectPropertiesSection.getMaxRenderableStringLength,
});
ObjectUI.ObjectPropertiesSection.getObjectPropertiesSectionFrom =
    ObjectUIModule.ObjectPropertiesSection.getObjectPropertiesSectionFrom;
/** @constructor */
ObjectUI.ObjectPropertiesSectionsTreeOutline =
    ObjectUIModule.ObjectPropertiesSection.ObjectPropertiesSectionsTreeOutline;
/**
 * @constructor
 */
ObjectUI.ObjectPropertiesSection.RootElement = ObjectUIModule.ObjectPropertiesSection.RootElement;
/**
 * @constructor
 */
ObjectUI.ObjectPropertiesSection.Renderer = ObjectUIModule.ObjectPropertiesSection.Renderer;
/** @constructor */
ObjectUI.ObjectPropertyTreeElement = ObjectUIModule.ObjectPropertiesSection.ObjectPropertyTreeElement;
/** @constructor */
ObjectUI.ObjectPropertyPrompt = ObjectUIModule.ObjectPropertiesSection.ObjectPropertyPrompt;
/** @constructor */
ObjectUI.ObjectPropertiesSectionsTreeExpandController =
    ObjectUIModule.ObjectPropertiesSection.ObjectPropertiesSectionsTreeExpandController;
/** @constructor */
ObjectUI.RemoteObjectPreviewFormatter = ObjectUIModule.RemoteObjectPreviewFormatter.RemoteObjectPreviewFormatter;
//# sourceMappingURL=object_ui-legacy.js.map