// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as ComponentHelpers from '../components/helpers/helpers.js';
/* eslint-disable rulesdir/no_underscored_properties */
export class XElement extends HTMLElement {
    static get observedAttributes() {
        return [
            'flex', 'padding', 'padding-top', 'padding-bottom', 'padding-left',
            'padding-right', 'margin', 'margin-top', 'margin-bottom', 'margin-left',
            'margin-right', 'overflow', 'overflow-x', 'overflow-y', 'font-size',
            'color', 'background', 'background-color', 'border', 'border-top',
            'border-bottom', 'border-left', 'border-right', 'max-width', 'max-height',
        ];
    }
    attributeChangedCallback(attr, _oldValue, newValue) {
        if (attr === 'flex') {
            if (newValue === null) {
                this.style.removeProperty('flex');
            }
            else if (newValue === 'initial' || newValue === 'auto' || newValue === 'none' || newValue.indexOf(' ') !== -1) {
                this.style.setProperty('flex', newValue);
            }
            else {
                this.style.setProperty('flex', '0 0 ' + newValue);
            }
            return;
        }
        if (newValue === null) {
            this.style.removeProperty(attr);
            if (attr.startsWith('padding-') || attr.startsWith('margin-') || attr.startsWith('border-') ||
                attr.startsWith('background-') || attr.startsWith('overflow-')) {
                const shorthand = attr.substring(0, attr.indexOf('-'));
                const shorthandValue = this.getAttribute(shorthand);
                if (shorthandValue !== null) {
                    this.style.setProperty(shorthand, shorthandValue);
                }
            }
        }
        else {
            this.style.setProperty(attr, newValue);
        }
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
class _XBox extends XElement {
    constructor(direction) {
        super();
        this.style.setProperty('display', 'flex');
        this.style.setProperty('flex-direction', direction);
        this.style.setProperty('justify-content', 'flex-start');
    }
    static get observedAttributes() {
        return super.observedAttributes.concat(['x-start', 'x-center', 'x-stretch', 'x-baseline', 'justify-content']);
    }
    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'x-start' || attr === 'x-center' || attr === 'x-stretch' || attr === 'x-baseline') {
            if (newValue === null) {
                this.style.removeProperty('align-items');
            }
            else {
                this.style.setProperty('align-items', attr === 'x-start' ? 'flex-start' : attr.substr(2));
            }
            return;
        }
        super.attributeChangedCallback(attr, oldValue, newValue);
    }
}
class XVBox extends _XBox {
    constructor() {
        super('column');
    }
}
class XHBox extends _XBox {
    constructor() {
        super('row');
    }
}
class XCBox extends XElement {
    constructor() {
        super();
        this.style.setProperty('display', 'flex');
        this.style.setProperty('flex-direction', 'column');
        this.style.setProperty('justify-content', 'center');
        this.style.setProperty('align-items', 'center');
    }
}
class XDiv extends XElement {
    constructor() {
        super();
        this.style.setProperty('display', 'block');
    }
}
class XSpan extends XElement {
    constructor() {
        super();
        this.style.setProperty('display', 'inline');
    }
}
class XText extends XElement {
    constructor() {
        super();
        this.style.setProperty('display', 'inline');
        this.style.setProperty('white-space', 'pre');
    }
}
ComponentHelpers.CustomElements.defineComponent('x-vbox', XVBox);
ComponentHelpers.CustomElements.defineComponent('x-hbox', XHBox);
ComponentHelpers.CustomElements.defineComponent('x-cbox', XCBox);
ComponentHelpers.CustomElements.defineComponent('x-div', XDiv);
ComponentHelpers.CustomElements.defineComponent('x-span', XSpan);
ComponentHelpers.CustomElements.defineComponent('x-text', XText);
//# sourceMappingURL=XElement.js.map