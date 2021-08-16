// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
export class CLSRect {
    x;
    y;
    width;
    height;
    color;
    outlineColor;
    constructor([x, y, width, height]) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = { r: 238, g: 111, b: 99, a: 0.4 };
        this.outlineColor = { r: 238, g: 111, b: 99, a: 0.7 };
    }
}
let linkifierInstance;
export class Linkifier {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!linkifierInstance || forceNew) {
            linkifierInstance = new Linkifier();
        }
        return linkifierInstance;
    }
    linkify(object, _options) {
        const link = document.createElement('span');
        const rect = object;
        const { x, y, width, height } = rect;
        link.textContent = `Location: [${x},${y}], Size: [${width}x${height}]`;
        link.addEventListener('mouseover', () => SDK.OverlayModel.OverlayModel.highlightRect(rect));
        link.addEventListener('mouseleave', () => SDK.OverlayModel.OverlayModel.clearHighlight());
        return link;
    }
}
//# sourceMappingURL=CLSLinkifier.js.map