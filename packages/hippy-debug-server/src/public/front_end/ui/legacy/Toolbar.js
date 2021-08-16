/*
 * Copyright (C) 2009 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import { Events as ActionEvents } from './ActionRegistration.js'; // eslint-disable-line no-unused-vars
import { ActionRegistry } from './ActionRegistry.js';
import * as ARIAUtils from './ARIAUtils.js';
import { ContextMenu } from './ContextMenu.js';
import { GlassPane, PointerEventsBehavior } from './GlassPane.js';
import { Icon } from './Icon.js';
import { bindCheckbox } from './SettingsUI.js';
import { Events as TextPromptEvents, TextPrompt } from './TextPrompt.js';
import { Tooltip } from './Tooltip.js';
import { CheckboxLabel, LongClickController } from './UIUtils.js';
import { createShadowRootWithCoreStyles } from './utils/create-shadow-root-with-core-styles.js';
const UIStrings = {
    /**
    *@description Announced screen reader message for ToolbarSettingToggle when the setting is toggled on.
    */
    pressed: 'pressed',
    /**
    *@description Announced screen reader message for ToolbarSettingToggle when the setting is toggled off.
    */
    notPressed: 'not pressed',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/Toolbar.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class Toolbar {
    _items;
    element;
    _enabled;
    _shadowRoot;
    _contentElement;
    _insertionPoint;
    constructor(className, parentElement) {
        this._items = [];
        this.element = (parentElement ? parentElement.createChild('div') : document.createElement('div'));
        this.element.className = className;
        this.element.classList.add('toolbar');
        this._enabled = true;
        this._shadowRoot = createShadowRootWithCoreStyles(this.element, { cssFile: 'ui/legacy/toolbar.css', enableLegacyPatching: false, delegatesFocus: undefined });
        this._contentElement = this._shadowRoot.createChild('div', 'toolbar-shadow');
        this._insertionPoint = this._contentElement.createChild('slot');
    }
    static createLongPressActionButton(action, toggledOptions, untoggledOptions) {
        const button = Toolbar.createActionButton(action);
        const mainButtonClone = Toolbar.createActionButton(action);
        let longClickController = null;
        let longClickButtons = null;
        let longClickGlyph = null;
        action.addEventListener(ActionEvents.Toggled, updateOptions);
        updateOptions();
        return button;
        function updateOptions() {
            const buttons = action.toggled() ? (toggledOptions || null) : (untoggledOptions || null);
            if (buttons && buttons.length) {
                if (!longClickController) {
                    longClickController = new LongClickController(button.element, showOptions);
                    longClickGlyph = Icon.create('largeicon-longclick-triangle', 'long-click-glyph');
                    button.element.appendChild(longClickGlyph);
                    longClickButtons = buttons;
                }
            }
            else {
                if (longClickController) {
                    longClickController.dispose();
                    longClickController = null;
                    if (longClickGlyph) {
                        longClickGlyph.remove();
                    }
                    longClickGlyph = null;
                    longClickButtons = null;
                }
            }
        }
        function showOptions() {
            let buttons = longClickButtons ? longClickButtons.slice() : [];
            buttons.push(mainButtonClone);
            const document = button.element.ownerDocument;
            document.documentElement.addEventListener('mouseup', mouseUp, false);
            const optionsGlassPane = new GlassPane();
            optionsGlassPane.setPointerEventsBehavior(PointerEventsBehavior.BlockedByGlassPane);
            optionsGlassPane.show(document);
            const optionsBar = new Toolbar('fill', optionsGlassPane.contentElement);
            optionsBar._contentElement.classList.add('floating');
            const buttonHeight = 26;
            const hostButtonPosition = button.element.boxInWindow().relativeToElement(GlassPane.container(document));
            const topNotBottom = hostButtonPosition.y + buttonHeight * buttons.length < document.documentElement.offsetHeight;
            if (topNotBottom) {
                buttons = buttons.reverse();
            }
            optionsBar.element.style.height = (buttonHeight * buttons.length) + 'px';
            if (topNotBottom) {
                optionsBar.element.style.top = (hostButtonPosition.y - 5) + 'px';
            }
            else {
                optionsBar.element.style.top = (hostButtonPosition.y - (buttonHeight * (buttons.length - 1)) - 6) + 'px';
            }
            optionsBar.element.style.left = (hostButtonPosition.x - 5) + 'px';
            for (let i = 0; i < buttons.length; ++i) {
                buttons[i].element.addEventListener('mousemove', mouseOver, false);
                buttons[i].element.addEventListener('mouseout', mouseOut, false);
                optionsBar.appendToolbarItem(buttons[i]);
            }
            const hostButtonIndex = topNotBottom ? 0 : buttons.length - 1;
            buttons[hostButtonIndex].element.classList.add('emulate-active');
            function mouseOver(e) {
                if (e.which !== 1) {
                    return;
                }
                if (e.target instanceof HTMLElement) {
                    const buttonElement = e.target.enclosingNodeOrSelfWithClass('toolbar-item');
                    buttonElement.classList.add('emulate-active');
                }
            }
            function mouseOut(e) {
                if (e.which !== 1) {
                    return;
                }
                if (e.target instanceof HTMLElement) {
                    const buttonElement = e.target.enclosingNodeOrSelfWithClass('toolbar-item');
                    buttonElement.classList.remove('emulate-active');
                }
            }
            function mouseUp(e) {
                if (e.which !== 1) {
                    return;
                }
                optionsGlassPane.hide();
                document.documentElement.removeEventListener('mouseup', mouseUp, false);
                for (let i = 0; i < buttons.length; ++i) {
                    if (buttons[i].element.classList.contains('emulate-active')) {
                        buttons[i].element.classList.remove('emulate-active');
                        buttons[i]._clicked(e);
                        break;
                    }
                }
            }
        }
    }
    static createActionButton(action, options = TOOLBAR_BUTTON_DEFAULT_OPTIONS) {
        const button = action.toggleable() ? makeToggle() : makeButton();
        if (options.showLabel) {
            button.setText(action.title());
        }
        let handler = (_event) => {
            action.execute();
        };
        if (options.userActionCode) {
            const actionCode = options.userActionCode;
            handler = () => {
                Host.userMetrics.actionTaken(actionCode);
                action.execute();
            };
        }
        button.addEventListener(ToolbarButton.Events.Click, handler, action);
        action.addEventListener(ActionEvents.Enabled, enabledChanged);
        button.setEnabled(action.enabled());
        return button;
        // @empty-line
        function makeButton() {
            const button = new ToolbarButton(action.title(), action.icon());
            if (action.title()) {
                Tooltip.install(button.element, action.title(), action.id(), {
                    anchorTooltipAtElement: true,
                });
            }
            return button;
        }
        function makeToggle() {
            const toggleButton = new ToolbarToggle(action.title(), action.icon(), action.toggledIcon());
            toggleButton.setToggleWithRedColor(action.toggleWithRedColor());
            action.addEventListener(ActionEvents.Toggled, toggled);
            toggled();
            return toggleButton;
            function toggled() {
                toggleButton.setToggled(action.toggled());
                if (action.title()) {
                    toggleButton.setTitle(action.title());
                    Tooltip.install(toggleButton.element, action.title(), action.id(), {
                        anchorTooltipAtElement: true,
                    });
                }
            }
        }
        function enabledChanged(event) {
            button.setEnabled(event.data);
        }
    }
    static createActionButtonForId(actionId, options = TOOLBAR_BUTTON_DEFAULT_OPTIONS) {
        const action = ActionRegistry.instance().action(actionId);
        return Toolbar.createActionButton(action, options);
    }
    gripElementForResize() {
        return this._contentElement;
    }
    makeWrappable(growVertically) {
        this._contentElement.classList.add('wrappable');
        if (growVertically) {
            this._contentElement.classList.add('toolbar-grow-vertical');
        }
    }
    makeVertical() {
        this._contentElement.classList.add('vertical');
    }
    makeBlueOnHover() {
        this._contentElement.classList.add('toolbar-blue-on-hover');
    }
    makeToggledGray() {
        this._contentElement.classList.add('toolbar-toggled-gray');
    }
    renderAsLinks() {
        this._contentElement.classList.add('toolbar-render-as-links');
    }
    empty() {
        return !this._items.length;
    }
    setEnabled(enabled) {
        this._enabled = enabled;
        for (const item of this._items) {
            item._applyEnabledState(this._enabled && item._enabled);
        }
    }
    appendToolbarItem(item) {
        this._items.push(item);
        item.toolbar = this;
        if (!this._enabled) {
            item._applyEnabledState(false);
        }
        this._contentElement.insertBefore(item.element, this._insertionPoint);
        this._hideSeparatorDupes();
    }
    appendSeparator() {
        this.appendToolbarItem(new ToolbarSeparator());
    }
    appendSpacer() {
        this.appendToolbarItem(new ToolbarSeparator(true));
    }
    appendText(text) {
        this.appendToolbarItem(new ToolbarText(text));
    }
    removeToolbarItems() {
        for (const item of this._items) {
            item.toolbar = null;
        }
        this._items = [];
        this._contentElement.removeChildren();
        this._insertionPoint = this._contentElement.createChild('slot');
    }
    setColor(color) {
        const style = document.createElement('style');
        style.textContent = '.toolbar-glyph { background-color: ' + color + ' !important }';
        this._shadowRoot.appendChild(style);
    }
    setToggledColor(color) {
        const style = document.createElement('style');
        style.textContent =
            '.toolbar-button.toolbar-state-on .toolbar-glyph { background-color: ' + color + ' !important }';
        this._shadowRoot.appendChild(style);
    }
    _hideSeparatorDupes() {
        if (!this._items.length) {
            return;
        }
        // Don't hide first and last separators if they were added explicitly.
        let previousIsSeparator = false;
        let lastSeparator;
        let nonSeparatorVisible = false;
        for (let i = 0; i < this._items.length; ++i) {
            if (this._items[i] instanceof ToolbarSeparator) {
                this._items[i].setVisible(!previousIsSeparator);
                previousIsSeparator = true;
                lastSeparator = this._items[i];
                continue;
            }
            if (this._items[i].visible()) {
                previousIsSeparator = false;
                lastSeparator = null;
                nonSeparatorVisible = true;
            }
        }
        if (lastSeparator && lastSeparator !== this._items[this._items.length - 1]) {
            lastSeparator.setVisible(false);
        }
        this.element.classList.toggle('hidden', lastSeparator !== null && lastSeparator !== undefined && lastSeparator.visible() && !nonSeparatorVisible);
    }
    async appendItemsAtLocation(location) {
        const extensions = getRegisteredToolbarItems();
        extensions.sort((extension1, extension2) => {
            const order1 = extension1.order || 0;
            const order2 = extension2.order || 0;
            return order1 - order2;
        });
        const filtered = extensions.filter(e => e.location === location);
        const items = await Promise.all(filtered.map(extension => {
            const { separator, actionId, showLabel, loadItem } = extension;
            if (separator) {
                return new ToolbarSeparator();
            }
            if (actionId) {
                return Toolbar.createActionButtonForId(actionId, { showLabel: Boolean(showLabel), userActionCode: undefined });
            }
            // TODO(crbug.com/1134103) constratint the case checked with this if using TS type definitions once UI is TS-authored.
            if (!loadItem) {
                throw new Error('Could not load a toolbar item registration with no loadItem function');
            }
            return loadItem().then(p => p.item());
        }));
        for (const item of items) {
            if (item) {
                this.appendToolbarItem(item);
            }
        }
    }
}
const TOOLBAR_BUTTON_DEFAULT_OPTIONS = {
    showLabel: false,
    userActionCode: undefined,
};
export class ToolbarItem extends Common.ObjectWrapper.ObjectWrapper {
    element;
    _visible;
    _enabled;
    toolbar;
    _title;
    constructor(element) {
        super();
        this.element = element;
        this.element.classList.add('toolbar-item');
        this._visible = true;
        this._enabled = true;
        /**
         * Set by the parent toolbar during appending.
         */
        this.toolbar = null;
    }
    setTitle(title, actionId = undefined) {
        if (this._title === title) {
            return;
        }
        this._title = title;
        ARIAUtils.setAccessibleName(this.element, title);
        Tooltip.install(this.element, title, actionId, {
            anchorTooltipAtElement: true,
        });
    }
    setEnabled(value) {
        if (this._enabled === value) {
            return;
        }
        this._enabled = value;
        this._applyEnabledState(this._enabled && (!this.toolbar || this.toolbar._enabled));
    }
    _applyEnabledState(enabled) {
        // @ts-ignore: Ignoring in favor of an `instanceof` check for all the different
        //             kind of HTMLElement classes that have a disabled attribute.
        this.element.disabled = !enabled;
    }
    /** x
       */
    visible() {
        return this._visible;
    }
    setVisible(x) {
        if (this._visible === x) {
            return;
        }
        this.element.classList.toggle('hidden', !x);
        this._visible = x;
        if (this.toolbar && !(this instanceof ToolbarSeparator)) {
            this.toolbar._hideSeparatorDupes();
        }
    }
    setRightAligned(alignRight) {
        this.element.classList.toggle('toolbar-item-right-aligned', alignRight);
    }
}
export class ToolbarText extends ToolbarItem {
    constructor(text) {
        const element = document.createElement('div');
        element.classList.add('toolbar-text');
        super(element);
        this.element.classList.add('toolbar-text');
        this.setText(text || '');
    }
    text() {
        return this.element.textContent || '';
    }
    setText(text) {
        this.element.textContent = text;
    }
}
export class ToolbarButton extends ToolbarItem {
    _glyphElement;
    _textElement;
    _title;
    _text;
    _glyph;
    /**
     * TODO(crbug.com/1126026): remove glyph parameter in favor of icon.
     */
    constructor(title, glyphOrIcon, text) {
        const element = document.createElement('button');
        element.classList.add('toolbar-button');
        super(element);
        this.element.addEventListener('click', this._clicked.bind(this), false);
        this.element.addEventListener('mousedown', this._mouseDown.bind(this), false);
        this._glyphElement = Icon.create('', 'toolbar-glyph hidden');
        this.element.appendChild(this._glyphElement);
        this._textElement = this.element.createChild('div', 'toolbar-text hidden');
        this.setTitle(title);
        if (glyphOrIcon instanceof HTMLElement) {
            glyphOrIcon.classList.add('toolbar-icon');
            this.element.append(glyphOrIcon);
        }
        else if (glyphOrIcon) {
            this.setGlyph(glyphOrIcon);
        }
        this.setText(text || '');
        this._title = '';
    }
    focus() {
        this.element.focus();
    }
    setText(text) {
        if (this._text === text) {
            return;
        }
        this._textElement.textContent = text;
        this._textElement.classList.toggle('hidden', !text);
        this._text = text;
    }
    setGlyph(glyph) {
        if (this._glyph === glyph) {
            return;
        }
        this._glyphElement.setIconType(glyph);
        this._glyphElement.classList.toggle('hidden', !glyph);
        this.element.classList.toggle('toolbar-has-glyph', Boolean(glyph));
        this._glyph = glyph;
    }
    setBackgroundImage(iconURL) {
        this.element.style.backgroundImage = 'url(' + iconURL + ')';
    }
    setSecondary() {
        this.element.classList.add('toolbar-button-secondary');
    }
    setDarkText() {
        this.element.classList.add('dark-text');
    }
    turnIntoSelect(shrinkable = false) {
        this.element.classList.add('toolbar-has-dropdown');
        if (shrinkable) {
            this.element.classList.add('toolbar-has-dropdown-shrinkable');
        }
        const dropdownArrowIcon = Icon.create('smallicon-triangle-down', 'toolbar-dropdown-arrow');
        this.element.appendChild(dropdownArrowIcon);
    }
    _clicked(event) {
        if (!this._enabled) {
            return;
        }
        this.dispatchEventToListeners(ToolbarButton.Events.Click, event);
        event.consume();
    }
    _mouseDown(event) {
        if (!this._enabled) {
            return;
        }
        this.dispatchEventToListeners(ToolbarButton.Events.MouseDown, event);
    }
}
(function (ToolbarButton) {
    // TODO(crbug.com/1167717): Make this a const enum again
    // eslint-disable-next-line rulesdir/const_enum
    let Events;
    (function (Events) {
        Events["Click"] = "Click";
        Events["MouseDown"] = "MouseDown";
    })(Events = ToolbarButton.Events || (ToolbarButton.Events = {}));
})(ToolbarButton || (ToolbarButton = {}));
export class ToolbarInput extends ToolbarItem {
    _prompt;
    _proxyElement;
    constructor(placeholder, accessiblePlaceholder, growFactor, shrinkFactor, tooltip, completions, dynamicCompletions) {
        const element = document.createElement('div');
        element.classList.add('toolbar-input');
        super(element);
        const internalPromptElement = this.element.createChild('div', 'toolbar-input-prompt');
        ARIAUtils.setAccessibleName(internalPromptElement, placeholder);
        internalPromptElement.addEventListener('focus', () => this.element.classList.add('focused'));
        internalPromptElement.addEventListener('blur', () => this.element.classList.remove('focused'));
        this._prompt = new TextPrompt();
        this._proxyElement = this._prompt.attach(internalPromptElement);
        this._proxyElement.classList.add('toolbar-prompt-proxy');
        this._proxyElement.addEventListener('keydown', (event) => this._onKeydownCallback(event));
        this._prompt.initialize(completions || (() => Promise.resolve([])), ' ', dynamicCompletions);
        if (tooltip) {
            this._prompt.setTitle(tooltip);
        }
        this._prompt.setPlaceholder(placeholder, accessiblePlaceholder);
        this._prompt.addEventListener(TextPromptEvents.TextChanged, this._onChangeCallback.bind(this));
        if (growFactor) {
            this.element.style.flexGrow = String(growFactor);
        }
        if (shrinkFactor) {
            this.element.style.flexShrink = String(shrinkFactor);
        }
        const clearButton = this.element.createChild('div', 'toolbar-input-clear-button');
        clearButton.appendChild(Icon.create('mediumicon-gray-cross-hover', 'search-cancel-button'));
        clearButton.addEventListener('click', () => {
            this.setValue('', true);
            this._prompt.focus();
        });
        this._updateEmptyStyles();
    }
    _applyEnabledState(enabled) {
        this._prompt.setEnabled(enabled);
    }
    setValue(value, notify) {
        this._prompt.setText(value);
        if (notify) {
            this._onChangeCallback();
        }
        this._updateEmptyStyles();
    }
    value() {
        return this._prompt.textWithCurrentSuggestion();
    }
    _onKeydownCallback(event) {
        if (event.key === 'Enter' && this._prompt.text()) {
            this.dispatchEventToListeners(ToolbarInput.Event.EnterPressed, this._prompt.text());
        }
        if (!isEscKey(event) || !this._prompt.text()) {
            return;
        }
        this.setValue('', true);
        event.consume(true);
    }
    _onChangeCallback() {
        this._updateEmptyStyles();
        this.dispatchEventToListeners(ToolbarInput.Event.TextChanged, this._prompt.text());
    }
    _updateEmptyStyles() {
        this.element.classList.toggle('toolbar-input-empty', !this._prompt.text());
    }
}
(function (ToolbarInput) {
    // TODO(crbug.com/1167717): Make this a const enum again
    // eslint-disable-next-line rulesdir/const_enum
    let Event;
    (function (Event) {
        Event["TextChanged"] = "TextChanged";
        Event["EnterPressed"] = "EnterPressed";
    })(Event = ToolbarInput.Event || (ToolbarInput.Event = {}));
})(ToolbarInput || (ToolbarInput = {}));
export class ToolbarToggle extends ToolbarButton {
    _toggled;
    _untoggledGlyph;
    _toggledGlyph;
    constructor(title, glyph, toggledGlyph) {
        super(title, glyph, '');
        this._toggled = false;
        this._untoggledGlyph = glyph;
        this._toggledGlyph = toggledGlyph;
        this.element.classList.add('toolbar-state-off');
        ARIAUtils.setPressed(this.element, false);
    }
    toggled() {
        return this._toggled;
    }
    setToggled(toggled) {
        if (this._toggled === toggled) {
            return;
        }
        this._toggled = toggled;
        this.element.classList.toggle('toolbar-state-on', toggled);
        this.element.classList.toggle('toolbar-state-off', !toggled);
        ARIAUtils.setPressed(this.element, toggled);
        if (this._toggledGlyph && this._untoggledGlyph) {
            this.setGlyph(toggled ? this._toggledGlyph : this._untoggledGlyph);
        }
    }
    setDefaultWithRedColor(withRedColor) {
        this.element.classList.toggle('toolbar-default-with-red-color', withRedColor);
    }
    setToggleWithRedColor(toggleWithRedColor) {
        this.element.classList.toggle('toolbar-toggle-with-red-color', toggleWithRedColor);
    }
}
export class ToolbarMenuButton extends ToolbarButton {
    _contextMenuHandler;
    _useSoftMenu;
    _triggerTimeout;
    _lastTriggerTime;
    constructor(contextMenuHandler, useSoftMenu) {
        super('', 'largeicon-menu');
        this._contextMenuHandler = contextMenuHandler;
        this._useSoftMenu = Boolean(useSoftMenu);
        ARIAUtils.markAsMenuButton(this.element);
    }
    _mouseDown(event) {
        if (event.buttons !== 1) {
            super._mouseDown(event);
            return;
        }
        if (!this._triggerTimeout) {
            this._triggerTimeout = window.setTimeout(this._trigger.bind(this, event), 200);
        }
    }
    _trigger(event) {
        delete this._triggerTimeout;
        // Throttling avoids entering a bad state on Macs when rapidly triggering context menus just
        // after the window gains focus. See crbug.com/655556
        if (this._lastTriggerTime && Date.now() - this._lastTriggerTime < 300) {
            return;
        }
        const contextMenu = new ContextMenu(event, this._useSoftMenu, this.element.totalOffsetLeft(), this.element.totalOffsetTop() + this.element.offsetHeight);
        this._contextMenuHandler(contextMenu);
        contextMenu.show();
        this._lastTriggerTime = Date.now();
    }
    _clicked(event) {
        if (this._triggerTimeout) {
            clearTimeout(this._triggerTimeout);
        }
        this._trigger(event);
    }
}
export class ToolbarSettingToggle extends ToolbarToggle {
    _defaultTitle;
    _setting;
    _willAnnounceState;
    constructor(setting, glyph, title) {
        super(title, glyph);
        this._defaultTitle = title;
        this._setting = setting;
        this._settingChanged();
        this._setting.addChangeListener(this._settingChanged, this);
        // Determines whether the toggle state will be announced to a screen reader
        this._willAnnounceState = false;
    }
    _settingChanged() {
        const toggled = this._setting.get();
        this.setToggled(toggled);
        const toggleAnnouncement = toggled ? i18nString(UIStrings.pressed) : i18nString(UIStrings.notPressed);
        if (this._willAnnounceState) {
            ARIAUtils.alert(toggleAnnouncement);
        }
        this._willAnnounceState = false;
        this.setTitle(this._defaultTitle);
    }
    _clicked(event) {
        this._willAnnounceState = true;
        this._setting.set(!this.toggled());
        super._clicked(event);
    }
}
export class ToolbarSeparator extends ToolbarItem {
    constructor(spacer) {
        const element = document.createElement('div');
        element.classList.add(spacer ? 'toolbar-spacer' : 'toolbar-divider');
        super(element);
    }
}
export class ToolbarComboBox extends ToolbarItem {
    _selectElement;
    constructor(changeHandler, title, className) {
        const element = document.createElement('span');
        element.classList.add('toolbar-select-container');
        super(element);
        this._selectElement = this.element.createChild('select', 'toolbar-item');
        const dropdownArrowIcon = Icon.create('smallicon-triangle-down', 'toolbar-dropdown-arrow');
        this.element.appendChild(dropdownArrowIcon);
        if (changeHandler) {
            this._selectElement.addEventListener('change', changeHandler, false);
        }
        ARIAUtils.setAccessibleName(this._selectElement, title);
        super.setTitle(title);
        if (className) {
            this._selectElement.classList.add(className);
        }
    }
    selectElement() {
        return this._selectElement;
    }
    size() {
        return this._selectElement.childElementCount;
    }
    options() {
        return Array.prototype.slice.call(this._selectElement.children, 0);
    }
    addOption(option) {
        this._selectElement.appendChild(option);
    }
    createOption(label, value) {
        const option = this._selectElement.createChild('option');
        option.text = label;
        if (typeof value !== 'undefined') {
            option.value = value;
        }
        return option;
    }
    _applyEnabledState(enabled) {
        super._applyEnabledState(enabled);
        this._selectElement.disabled = !enabled;
    }
    removeOption(option) {
        this._selectElement.removeChild(option);
    }
    removeOptions() {
        this._selectElement.removeChildren();
    }
    selectedOption() {
        if (this._selectElement.selectedIndex >= 0) {
            return this._selectElement[this._selectElement.selectedIndex];
        }
        return null;
    }
    select(option) {
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._selectElement.selectedIndex = Array.prototype.indexOf.call(this._selectElement, option);
    }
    setSelectedIndex(index) {
        this._selectElement.selectedIndex = index;
    }
    selectedIndex() {
        return this._selectElement.selectedIndex;
    }
    setMaxWidth(width) {
        this._selectElement.style.maxWidth = width + 'px';
    }
    setMinWidth(width) {
        this._selectElement.style.minWidth = width + 'px';
    }
}
export class ToolbarSettingComboBox extends ToolbarComboBox {
    _options;
    _setting;
    _muteSettingListener;
    constructor(options, setting, accessibleName) {
        super(null, accessibleName);
        this._options = options;
        this._setting = setting;
        this._selectElement.addEventListener('change', this._valueChanged.bind(this), false);
        this.setOptions(options);
        setting.addChangeListener(this._settingChanged, this);
    }
    setOptions(options) {
        this._options = options;
        this._selectElement.removeChildren();
        for (let i = 0; i < options.length; ++i) {
            const dataOption = options[i];
            const option = this.createOption(dataOption.label, dataOption.value);
            this._selectElement.appendChild(option);
            if (this._setting.get() === dataOption.value) {
                this.setSelectedIndex(i);
            }
        }
    }
    value() {
        return this._options[this.selectedIndex()].value;
    }
    _settingChanged() {
        if (this._muteSettingListener) {
            return;
        }
        const value = this._setting.get();
        for (let i = 0; i < this._options.length; ++i) {
            if (value === this._options[i].value) {
                this.setSelectedIndex(i);
                break;
            }
        }
    }
    _valueChanged(_event) {
        const option = this._options[this.selectedIndex()];
        this._muteSettingListener = true;
        this._setting.set(option.value);
        this._muteSettingListener = false;
    }
}
export class ToolbarCheckbox extends ToolbarItem {
    inputElement;
    constructor(text, tooltip, listener) {
        super(CheckboxLabel.create(text));
        this.element.classList.add('checkbox');
        this.inputElement = this.element.checkboxElement;
        if (tooltip) {
            // install on the checkbox
            Tooltip.install(this.inputElement, tooltip, undefined, {
                anchorTooltipAtElement: true,
            });
            Tooltip.install(this.element.textElement, tooltip, undefined, {
                anchorTooltipAtElement: true,
            });
        }
        if (listener) {
            this.inputElement.addEventListener('click', listener, false);
        }
    }
    checked() {
        return this.inputElement.checked;
    }
    setChecked(value) {
        this.inputElement.checked = value;
    }
    _applyEnabledState(enabled) {
        super._applyEnabledState(enabled);
        this.inputElement.disabled = !enabled;
    }
}
export class ToolbarSettingCheckbox extends ToolbarCheckbox {
    constructor(setting, tooltip, alternateTitle) {
        super(alternateTitle || setting.title() || '', tooltip);
        bindCheckbox(this.inputElement, setting);
    }
}
const registeredToolbarItems = [];
export function registerToolbarItem(registration) {
    registeredToolbarItems.push(registration);
}
function getRegisteredToolbarItems() {
    return registeredToolbarItems.filter(item => Root.Runtime.Runtime.isDescriptorEnabled({ experiment: undefined, condition: item.condition }));
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var ToolbarItemLocation;
(function (ToolbarItemLocation) {
    ToolbarItemLocation["FILES_NAVIGATION_TOOLBAR"] = "files-navigator-toolbar";
    ToolbarItemLocation["MAIN_TOOLBAR_RIGHT"] = "main-toolbar-right";
    ToolbarItemLocation["MAIN_TOOLBAR_LEFT"] = "main-toolbar-left";
    ToolbarItemLocation["STYLES_SIDEBARPANE_TOOLBAR"] = "styles-sidebarpane-toolbar";
})(ToolbarItemLocation || (ToolbarItemLocation = {}));
//# sourceMappingURL=Toolbar.js.map