// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _measuredScrollbarWidth;
export function measuredScrollbarWidth(document) {
    if (typeof _measuredScrollbarWidth === 'number') {
        return _measuredScrollbarWidth;
    }
    if (!document) {
        return 16;
    }
    const scrollDiv = document.createElement('div');
    const innerDiv = document.createElement('div');
    scrollDiv.setAttribute('style', 'display: block; width: 100px; height: 100px; overflow: scroll;');
    innerDiv.setAttribute('style', 'height: 200px');
    scrollDiv.appendChild(innerDiv);
    document.body.appendChild(scrollDiv);
    _measuredScrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return _measuredScrollbarWidth;
}
//# sourceMappingURL=measured-scrollbar-width.js.map