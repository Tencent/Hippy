// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as Elements from '../../../../panels/elements/components/components.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();
const component = new Elements.StylePropertyEditor.GridEditor();
document.getElementById('container')?.appendChild(component);
const computedProperties = new Map([
    ['align-content', 'initial'],
    ['justify-content', 'flex-end'],
    ['align-items', 'normal'],
    ['justify-items', 'normal'],
]);
const originalComputedProperties = new Map(computedProperties);
const authoredProperties = new Map([
    ['justify-content', 'flex-end'],
]);
component.data = {
    computedProperties,
    authoredProperties,
};
component.addEventListener('propertyselected', (event) => {
    authoredProperties.set(event.data.name, event.data.value);
    computedProperties.set(event.data.name, event.data.value);
    component.data = {
        computedProperties,
        authoredProperties,
    };
});
component.addEventListener('propertydeselected', (event) => {
    authoredProperties.delete(event.data.name);
    computedProperties.set(event.data.name, originalComputedProperties.get(event.data.name));
    component.data = {
        computedProperties,
        authoredProperties,
    };
});
//# sourceMappingURL=grid.js.map