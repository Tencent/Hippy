// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as UI from '../../ui/legacy/legacy.js';
export class AccessibilitySubPane extends UI.View.SimpleView {
    _axNode;
    _node;
    constructor(name) {
        super(name);
        this._axNode = null;
        this.registerRequiredCSS('panels/accessibility/accessibilityProperties.css', { enableLegacyPatching: false });
    }
    setAXNode(_axNode) {
    }
    node() {
        return this._node || null;
    }
    setNode(node) {
        this._node = node;
    }
    createInfo(textContent, className) {
        const classNameOrDefault = className || 'gray-info-message';
        const info = this.element.createChild('div', classNameOrDefault);
        info.textContent = textContent;
        return info;
    }
    createTreeOutline() {
        const treeOutline = new UI.TreeOutline.TreeOutlineInShadow();
        treeOutline.registerRequiredCSS('panels/accessibility/accessibilityNode.css', { enableLegacyPatching: false });
        treeOutline.registerRequiredCSS('panels/accessibility/accessibilityProperties.css', { enableLegacyPatching: false });
        treeOutline.registerRequiredCSS('ui/legacy/components/object_ui/objectValue.css', { enableLegacyPatching: false });
        treeOutline.element.classList.add('hidden');
        treeOutline.hideOverflow();
        this.element.appendChild(treeOutline.element);
        return treeOutline;
    }
}
//# sourceMappingURL=AccessibilitySubPane.js.map