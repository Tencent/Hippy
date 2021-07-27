// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
function WidgetfocusWidgetForNode(node) {
    while (node) {
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (node.__widget) {
            break;
        }
        node = node.parentNodeOrShadowHost();
    }
    if (!node) {
        return;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let widget = node.__widget;
    while (widget._parentWidget) {
        widget._parentWidget._defaultFocusedChild = widget;
        widget = widget._parentWidget;
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
function XWidgetfocusWidgetForNode(node) {
    node = node && node.parentNodeOrShadowHost();
    const XWidgetCtor = customElements.get('x-widget');
    let widget = null;
    while (node) {
        if (node instanceof XWidgetCtor) {
            if (widget) {
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                node._defaultFocusedElement = widget;
            }
            widget = node;
        }
        node = node.parentNodeOrShadowHost();
    }
}
export function focusChanged(event) {
    const target = event.target;
    const document = target ? target.ownerDocument : null;
    const element = document ? document.deepActiveElement() : null;
    WidgetfocusWidgetForNode(element);
    XWidgetfocusWidgetForNode(element);
}
//# sourceMappingURL=focus-changed.js.map