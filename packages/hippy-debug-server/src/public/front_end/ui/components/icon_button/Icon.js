// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as Coordinator from '../render_coordinator/render_coordinator.js';
const isString = (value) => value !== undefined;
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
export class Icon extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-icon`;
    shadow = this.attachShadow({ mode: 'open' });
    iconPath = '';
    color = 'rgb(110 110 110)';
    width = '100%';
    height = '100%';
    iconName;
    set data(data) {
        const { width, height } = data;
        this.color = data.color;
        this.width = isString(width) ? width : (isString(height) ? height : this.width);
        this.height = isString(height) ? height : (isString(width) ? width : this.height);
        if ('iconPath' in data) {
            this.iconPath = data.iconPath;
        }
        else {
            this.iconPath = new URL(`../../../Images/${data.iconName}.svg`, import.meta.url).toString();
            this.iconName = data.iconName;
        }
        this.render();
    }
    get data() {
        const commonData = {
            color: this.color,
            width: this.width,
            height: this.height,
        };
        if (this.iconName) {
            return {
                ...commonData,
                iconName: this.iconName,
            };
        }
        return {
            ...commonData,
            iconPath: this.iconPath,
        };
    }
    getStyles() {
        const { iconPath, width, height, color } = this;
        const commonStyles = {
            width,
            height,
            display: 'block',
        };
        if (color) {
            return {
                ...commonStyles,
                webkitMaskImage: `url(${iconPath})`,
                webkitMaskPosition: 'center',
                webkitMaskRepeat: 'no-repeat',
                // We are setting this to 99% to work around an issue where non-standard zoom levels would cause the icon to clip.
                webkitMaskSize: '99%',
                backgroundColor: `var(--icon-color, ${color})`,
            };
        }
        return {
            ...commonStyles,
            backgroundImage: `url(${iconPath})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            // We are setting this to 99% to work around an issue where non-standard zoom levels would cause the icon to clip.
            backgroundSize: '99%',
        };
    }
    render() {
        coordinator.write(() => {
            // clang-format off
            LitHtml.render(LitHtml.html `
        <style>
          :host {
            display: inline-block;
            white-space: nowrap;
          }
        </style>
        <div class="icon-basic" style=${LitHtml.Directives.styleMap(this.getStyles())}></div>
      `, this.shadow);
            // clang-format on
        });
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-icon', Icon);
//# sourceMappingURL=Icon.js.map