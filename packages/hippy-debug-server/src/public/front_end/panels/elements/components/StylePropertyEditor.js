// Copyright (c) 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import { findFlexContainerIcon, findGridContainerIcon } from './CSSPropertyIconResolver.js';
const UIStrings = {
    /**
      * @description Title of the button that selects a flex property.
      * @example {flex-direction} propertyName
      * @example {column} propertyValue
      */
    selectButton: 'Add {propertyName}: {propertyValue}',
    /**
      * @description Title of the button that deselects a flex property.
      * @example {flex-direction} propertyName
      * @example {row} propertyValue
      */
    deselectButton: 'Remove {propertyName}: {propertyValue}',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/components/StylePropertyEditor.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const { render, html, Directives } = LitHtml;
export class PropertySelectedEvent extends Event {
    data;
    constructor(name, value) {
        super('propertyselected', {});
        this.data = { name, value };
    }
}
export class PropertyDeselectedEvent extends Event {
    data;
    constructor(name, value) {
        super('propertydeselected', {});
        this.data = { name, value };
    }
}
export class StylePropertyEditor extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    authoredProperties = new Map();
    computedProperties = new Map();
    editableProperties = [];
    constructor() {
        super();
    }
    getEditableProperties() {
        return this.editableProperties;
    }
    set data(data) {
        this.authoredProperties = data.authoredProperties;
        this.computedProperties = data.computedProperties;
        this.render();
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        render(html `
      <style>
        .container {
          padding: 12px;
          min-width: 170px;
        }

        .row {
          padding: 0;
          color: var(--color-text-primary);
          padding-bottom: 16px;
        }

        .row:last-child {
          padding-bottom: 0;
        }

        .property {
          padding-bottom: 4px;
          white-space: nowrap;
        }

        .property-name {
          color: var(--color-syntax-1);
        }

        .property-value {
          color: var(--color-text-primary);
        }

        .property-value.not-authored {
          color: var(--color-text-disabled);
        }

        .buttons {
          display: flex;
          flex-direction: row;
        }

        .buttons > :first-child {
          border-radius: 3px 0 0 3px;
        }

        .buttons > :last-child {
          border-radius: 0 3px 3px 0;
        }

        .button {
          border: 1px solid var(--color-background-elevation-2);
          background-color: var(--color-background);
          width: 24px;
          height: 24px;
          min-width: 24px;
          min-height: 24px;
          padding: 0;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }

        .button:focus-visible {
          outline: auto 5px -webkit-focus-ring-color;
        }

        .button devtools-icon {
          --icon-color: var(--color-text-secondary);
        }

        .button.selected {
          background-color: var(--color-background-elevation-1);
        }

        .button.selected devtools-icon {
          --icon-color: var(--color-primary);
        }
      </style>
      <div class="container">
        ${this.editableProperties.map(prop => this.renderProperty(prop))}
      </div>
    `, this.shadow, {
            host: this,
        });
        // clang-format on
    }
    renderProperty(prop) {
        const authoredValue = this.authoredProperties.get(prop.propertyName);
        const notAuthored = !authoredValue;
        const shownValue = authoredValue || this.computedProperties.get(prop.propertyName);
        const classes = Directives.classMap({
            'property-value': true,
            'not-authored': notAuthored,
        });
        return html `<div class="row">
      <div class="property">
        <span class="property-name">${prop.propertyName}</span>: <span class=${classes}>${shownValue}</span>
      </div>
      <div class="buttons">
        ${prop.propertyValues.map(value => this.renderButton(value, prop.propertyName, value === authoredValue))}
      </div>
    </div>`;
    }
    renderButton(propertyValue, propertyName, selected = false) {
        const query = `${propertyName}: ${propertyValue}`;
        const iconInfo = this.findIcon(query, this.computedProperties);
        if (!iconInfo) {
            throw new Error(`Icon for ${query} is not found`);
        }
        const transform = `transform: rotate(${iconInfo.rotate}deg) scale(${iconInfo.scaleX}, ${iconInfo.scaleY})`;
        const classes = Directives.classMap({
            'button': true,
            'selected': selected,
        });
        const title = i18nString(selected ? UIStrings.deselectButton : UIStrings.selectButton, { propertyName, propertyValue });
        return html `<button title=${title} class=${classes} @click=${() => this.onButtonClick(propertyName, propertyValue, selected)}>
       <${IconButton.Icon.Icon.litTagName} style=${transform} .data=${{ iconName: iconInfo.iconName, color: 'var(--icon-color)', width: '18px', height: '18px' }}></${IconButton.Icon.Icon.litTagName}>
    </button>`;
    }
    onButtonClick(propertyName, propertyValue, selected) {
        if (selected) {
            this.dispatchEvent(new PropertyDeselectedEvent(propertyName, propertyValue));
        }
        else {
            this.dispatchEvent(new PropertySelectedEvent(propertyName, propertyValue));
        }
    }
    findIcon(_query, _computedProperties) {
        throw new Error('Not implemented');
    }
}
export class FlexboxEditor extends StylePropertyEditor {
    editableProperties = FlexboxEditableProperties;
    findIcon(query, computedProperties) {
        return findFlexContainerIcon(query, computedProperties);
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-flexbox-editor', FlexboxEditor);
export class GridEditor extends StylePropertyEditor {
    editableProperties = GridEditableProperties;
    findIcon(query, computedProperties) {
        return findGridContainerIcon(query, computedProperties);
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-grid-editor', GridEditor);
export const FlexboxEditableProperties = [
    {
        propertyName: 'flex-direction',
        propertyValues: [
            'row',
            'column',
        ],
    },
    {
        propertyName: 'flex-wrap',
        propertyValues: [
            'nowrap',
            'wrap',
        ],
    },
    {
        propertyName: 'align-content',
        propertyValues: [
            'center',
            'flex-start',
            'flex-end',
            'space-around',
            'space-between',
            'stretch',
        ],
    },
    {
        propertyName: 'justify-content',
        propertyValues: [
            'center',
            'flex-start',
            'flex-end',
            'space-between',
            'space-around',
            'space-evenly',
        ],
    },
    {
        propertyName: 'align-items',
        propertyValues: [
            'center',
            'flex-start',
            'flex-end',
            'stretch',
            'baseline',
        ],
    },
];
export const GridEditableProperties = [
    {
        propertyName: 'align-content',
        propertyValues: [
            'center',
            'space-between',
            'space-around',
            'space-evenly',
            'stretch',
        ],
    },
    {
        propertyName: 'justify-content',
        propertyValues: [
            'center',
            'start',
            'end',
            'space-between',
            'space-around',
            'space-evenly',
        ],
    },
    {
        propertyName: 'align-items',
        propertyValues: [
            'center',
            'start',
            'end',
            'stretch',
            'baseline',
        ],
    },
    {
        propertyName: 'justify-items',
        propertyValues: [
            'center',
            'start',
            'end',
            'stretch',
        ],
    },
];
//# sourceMappingURL=StylePropertyEditor.js.map