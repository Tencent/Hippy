// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Elements from '../../../../panels/elements/components/components.js';
const component = new Elements.ComputedStyleTrace.ComputedStyleTrace();
const traceValue = document.createElement('span');
traceValue.textContent = 'block';
traceValue.slot = 'trace-value';
component.appendChild(traceValue);
const traceLink = document.createElement('span');
traceLink.textContent = 'user agent stylesheet';
traceLink.slot = 'trace-link';
component.appendChild(traceLink);
document.getElementById('container')?.appendChild(component);
component.data = {
    selector: 'body',
    active: true,
    onNavigateToSource: () => { },
};
//# sourceMappingURL=basic.js.map