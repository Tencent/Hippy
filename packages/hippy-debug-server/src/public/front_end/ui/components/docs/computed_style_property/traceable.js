// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Elements from '../../../../panels/elements/components/components.js';
const component = new Elements.ComputedStyleProperty.ComputedStyleProperty();
const propertyName = document.createElement('span');
propertyName.textContent = 'display';
propertyName.slot = 'property-name';
component.appendChild(propertyName);
const propertyValue = document.createElement('span');
propertyValue.textContent = 'grid';
propertyValue.slot = 'property-value';
component.appendChild(propertyValue);
const trace = document.createElement('pre');
trace.textContent = 'block    body         (style.css):42';
trace.slot = 'property-traces';
component.appendChild(trace);
document.getElementById('container')?.appendChild(component);
component.data = {
    inherited: false,
    traceable: true,
    onNavigateToSource: () => { },
};
//# sourceMappingURL=traceable.js.map