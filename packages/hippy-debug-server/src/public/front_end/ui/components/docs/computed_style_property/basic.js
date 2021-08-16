// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as Elements from '../../../../panels/elements/components/components.js';
await FrontendHelpers.initializeGlobalVars();
const component = new Elements.ComputedStyleProperty.ComputedStyleProperty();
const propertyName = document.createElement('span');
propertyName.textContent = 'display';
propertyName.slot = 'property-name';
component.appendChild(propertyName);
const propertyValue = document.createElement('span');
propertyValue.textContent = 'block';
propertyValue.slot = 'property-value';
component.appendChild(propertyValue);
document.getElementById('container')?.appendChild(component);
component.data = {
    inherited: true,
    traceable: false,
    onNavigateToSource: () => { },
};
//# sourceMappingURL=basic.js.map