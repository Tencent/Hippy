/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as ARIAUtils from './ARIAUtils.js';
import { AnchorBehavior, GlassPane, MarginBehavior, PointerEventsBehavior, SizeBehavior } from './GlassPane.js'; // eslint-disable-line no-unused-vars
import { Icon } from './Icon.js';
import * as ThemeSupport from './theme_support/theme_support.js'; // eslint-disable-line rulesdir/es_modules_import
import { createTextChild, ElementFocusRestorer } from './UIUtils.js';
const UIStrings = {
    /**
    *@description Text exposed to screen readers on checked items.
    */
    checked: 'checked',
    /**
    *@description Accessible text exposed to screen readers when the screen reader encounters an unchecked checkbox.
    */
    unchecked: 'unchecked',
    /**
    *@description Accessibility label for checkable SoftContextMenuItems with shortcuts
    *@example {Open File} PH1
    *@example {Ctrl + P} PH2
    *@example {checked} PH3
    */
    sSS: '{PH1}, {PH2}, {PH3}',
    /**
    *@description Generic text with two placeholders separated by a comma
    *@example {1 613 680} PH1
    *@example {44 %} PH2
    */
    sS: '{PH1}, {PH2}',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/SoftContextMenu.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class SoftContextMenu {
    _items;
    _itemSelectedCallback;
    _parentMenu;
    _highlightedMenuItemElement;
    detailsForElementMap;
    _document;
    _glassPane;
    _contextMenuElement;
    _focusRestorer;
    _hideOnUserGesture;
    _activeSubMenuElement;
    _subMenu;
    constructor(items, itemSelectedCallback, parentMenu) {
        this._items = items;
        this._itemSelectedCallback = itemSelectedCallback;
        this._parentMenu = parentMenu;
        this._highlightedMenuItemElement = null;
        this.detailsForElementMap = new WeakMap();
    }
    show(document, anchorBox) {
        if (!this._items.length) {
            return;
        }
        this._document = document;
        this._glassPane = new GlassPane();
        this._glassPane.setPointerEventsBehavior(this._parentMenu ? PointerEventsBehavior.PierceGlassPane : PointerEventsBehavior.BlockedByGlassPane);
        this._glassPane.registerRequiredCSS('ui/legacy/softContextMenu.css', { enableLegacyPatching: false });
        this._glassPane.setContentAnchorBox(anchorBox);
        this._glassPane.setSizeBehavior(SizeBehavior.MeasureContent);
        this._glassPane.setMarginBehavior(MarginBehavior.NoMargin);
        this._glassPane.setAnchorBehavior(this._parentMenu ? AnchorBehavior.PreferRight : AnchorBehavior.PreferBottom);
        this._contextMenuElement = this._glassPane.contentElement.createChild('div', 'soft-context-menu');
        this._contextMenuElement.tabIndex = -1;
        ARIAUtils.markAsMenu(this._contextMenuElement);
        this._contextMenuElement.addEventListener('mouseup', e => e.consume(), false);
        this._contextMenuElement.addEventListener('keydown', this._menuKeyDown.bind(this), false);
        for (let i = 0; i < this._items.length; ++i) {
            this._contextMenuElement.appendChild(this._createMenuItem(this._items[i]));
        }
        this._glassPane.show(document);
        this._focusRestorer = new ElementFocusRestorer(this._contextMenuElement);
        if (!this._parentMenu) {
            this._hideOnUserGesture = (event) => {
                // If a user clicks on any submenu, prevent the menu system from closing.
                let subMenu = this._subMenu;
                while (subMenu) {
                    if (subMenu._contextMenuElement === event.composedPath()[0]) {
                        return;
                    }
                    subMenu = subMenu._subMenu;
                }
                this.discard();
                event.consume(true);
            };
            this._document.body.addEventListener('mousedown', this._hideOnUserGesture, false);
            if (this._document.defaultView) {
                this._document.defaultView.addEventListener('resize', this._hideOnUserGesture, false);
            }
        }
    }
    discard() {
        if (this._subMenu) {
            this._subMenu.discard();
        }
        if (this._focusRestorer) {
            this._focusRestorer.restore();
        }
        if (this._glassPane) {
            this._glassPane.hide();
            delete this._glassPane;
            if (this._hideOnUserGesture) {
                if (this._document) {
                    this._document.body.removeEventListener('mousedown', this._hideOnUserGesture, false);
                    if (this._document.defaultView) {
                        this._document.defaultView.removeEventListener('resize', this._hideOnUserGesture, false);
                    }
                }
                delete this._hideOnUserGesture;
            }
        }
        if (this._parentMenu) {
            delete this._parentMenu._subMenu;
            if (this._parentMenu._activeSubMenuElement) {
                ARIAUtils.setExpanded(this._parentMenu._activeSubMenuElement, false);
                delete this._parentMenu._activeSubMenuElement;
            }
        }
    }
    _createMenuItem(item) {
        if (item.type === 'separator') {
            return this._createSeparator();
        }
        if (item.type === 'subMenu') {
            return this._createSubMenu(item);
        }
        const menuItemElement = document.createElement('div');
        menuItemElement.classList.add('soft-context-menu-item');
        menuItemElement.tabIndex = -1;
        ARIAUtils.markAsMenuItem(menuItemElement);
        const checkMarkElement = Icon.create('smallicon-checkmark', 'checkmark');
        menuItemElement.appendChild(checkMarkElement);
        if (!item.checked) {
            checkMarkElement.style.opacity = '0';
        }
        const detailsForElement = {
            actionId: undefined,
            isSeparator: undefined,
            customElement: undefined,
            subItems: undefined,
            subMenuTimer: undefined,
        };
        if (item.element) {
            const wrapper = menuItemElement.createChild('div', 'soft-context-menu-custom-item');
            wrapper.appendChild(item.element);
            detailsForElement.customElement = item.element;
            this.detailsForElementMap.set(menuItemElement, detailsForElement);
            return menuItemElement;
        }
        if (!item.enabled) {
            menuItemElement.classList.add('soft-context-menu-disabled');
        }
        createTextChild(menuItemElement, item.label || '');
        menuItemElement.createChild('span', 'soft-context-menu-shortcut').textContent = item.shortcut || '';
        menuItemElement.addEventListener('mousedown', this._menuItemMouseDown.bind(this), false);
        menuItemElement.addEventListener('mouseup', this._menuItemMouseUp.bind(this), false);
        // Manually manage hover highlight since :hover does not work in case of click-and-hold menu invocation.
        menuItemElement.addEventListener('mouseover', this._menuItemMouseOver.bind(this), false);
        menuItemElement.addEventListener('mouseleave', this._menuItemMouseLeave.bind(this), false);
        detailsForElement.actionId = item.id;
        let accessibleName = item.label || '';
        if (item.type === 'checkbox') {
            const checkedState = item.checked ? i18nString(UIStrings.checked) : i18nString(UIStrings.unchecked);
            if (item.shortcut) {
                accessibleName = i18nString(UIStrings.sSS, { PH1: item.label, PH2: item.shortcut, PH3: checkedState });
            }
            else {
                accessibleName = i18nString(UIStrings.sS, { PH1: item.label, PH2: checkedState });
            }
        }
        else if (item.shortcut) {
            accessibleName = i18nString(UIStrings.sS, { PH1: item.label, PH2: item.shortcut });
        }
        ARIAUtils.setAccessibleName(menuItemElement, accessibleName);
        this.detailsForElementMap.set(menuItemElement, detailsForElement);
        return menuItemElement;
    }
    _createSubMenu(item) {
        const menuItemElement = document.createElement('div');
        menuItemElement.classList.add('soft-context-menu-item');
        menuItemElement.tabIndex = -1;
        ARIAUtils.markAsMenuItemSubMenu(menuItemElement);
        this.detailsForElementMap.set(menuItemElement, {
            subItems: item.subItems,
            actionId: undefined,
            isSeparator: undefined,
            customElement: undefined,
            subMenuTimer: undefined,
        });
        // Occupy the same space on the left in all items.
        const checkMarkElement = Icon.create('smallicon-checkmark', 'soft-context-menu-item-checkmark');
        checkMarkElement.classList.add('checkmark');
        menuItemElement.appendChild(checkMarkElement);
        checkMarkElement.style.opacity = '0';
        createTextChild(menuItemElement, item.label || '');
        ARIAUtils.setExpanded(menuItemElement, false);
        // TODO: Consider removing this branch and use the same icon on all platforms.
        if (Host.Platform.isMac() && !ThemeSupport.ThemeSupport.instance().hasTheme()) {
            const subMenuArrowElement = menuItemElement.createChild('span', 'soft-context-menu-item-submenu-arrow');
            ARIAUtils.markAsHidden(subMenuArrowElement);
            subMenuArrowElement.textContent = '\u25B6'; // BLACK RIGHT-POINTING TRIANGLE
        }
        else {
            const subMenuArrowElement = Icon.create('smallicon-triangle-right', 'soft-context-menu-item-submenu-arrow');
            menuItemElement.appendChild(subMenuArrowElement);
        }
        menuItemElement.addEventListener('mousedown', this._menuItemMouseDown.bind(this), false);
        menuItemElement.addEventListener('mouseup', this._menuItemMouseUp.bind(this), false);
        // Manually manage hover highlight since :hover does not work in case of click-and-hold menu invocation.
        menuItemElement.addEventListener('mouseover', this._menuItemMouseOver.bind(this), false);
        menuItemElement.addEventListener('mouseleave', this._menuItemMouseLeave.bind(this), false);
        return menuItemElement;
    }
    _createSeparator() {
        const separatorElement = document.createElement('div');
        separatorElement.classList.add('soft-context-menu-separator');
        this.detailsForElementMap.set(separatorElement, {
            subItems: undefined,
            actionId: undefined,
            isSeparator: true,
            customElement: undefined,
            subMenuTimer: undefined,
        });
        separatorElement.createChild('div', 'separator-line');
        return separatorElement;
    }
    _menuItemMouseDown(event) {
        // Do not let separator's mouse down hit menu's handler - we need to receive mouse up!
        event.consume(true);
    }
    _menuItemMouseUp(event) {
        this._triggerAction(event.target, event);
        event.consume();
    }
    _root() {
        let root = this;
        while (root._parentMenu) {
            root = root._parentMenu;
        }
        return root;
    }
    _triggerAction(menuItemElement, event) {
        const detailsForElement = this.detailsForElementMap.get(menuItemElement);
        if (detailsForElement) {
            if (!detailsForElement.subItems) {
                this._root().discard();
                event.consume(true);
                if (typeof detailsForElement.actionId !== 'undefined') {
                    this._itemSelectedCallback(detailsForElement.actionId);
                    delete detailsForElement.actionId;
                }
                return;
            }
        }
        this._showSubMenu(menuItemElement);
        event.consume();
    }
    _showSubMenu(menuItemElement) {
        const detailsForElement = this.detailsForElementMap.get(menuItemElement);
        if (!detailsForElement) {
            return;
        }
        if (detailsForElement.subMenuTimer) {
            window.clearTimeout(detailsForElement.subMenuTimer);
            delete detailsForElement.subMenuTimer;
        }
        if (this._subMenu || !this._document) {
            return;
        }
        this._activeSubMenuElement = menuItemElement;
        ARIAUtils.setExpanded(menuItemElement, true);
        if (!detailsForElement.subItems) {
            return;
        }
        this._subMenu = new SoftContextMenu(detailsForElement.subItems, this._itemSelectedCallback, this);
        const anchorBox = menuItemElement.boxInWindow();
        // Adjust for padding.
        anchorBox.y -= 5;
        anchorBox.x += 3;
        anchorBox.width -= 6;
        anchorBox.height += 10;
        this._subMenu.show(this._document, anchorBox);
    }
    _menuItemMouseOver(event) {
        this._highlightMenuItem(event.target, true);
    }
    _menuItemMouseLeave(event) {
        if (!this._subMenu || !event.relatedTarget) {
            this._highlightMenuItem(null, true);
            return;
        }
        const relatedTarget = event.relatedTarget;
        if (relatedTarget === this._contextMenuElement) {
            this._highlightMenuItem(null, true);
        }
    }
    _highlightMenuItem(menuItemElement, scheduleSubMenu) {
        if (this._highlightedMenuItemElement === menuItemElement) {
            return;
        }
        if (this._subMenu) {
            this._subMenu.discard();
        }
        if (this._highlightedMenuItemElement) {
            const detailsForElement = this.detailsForElementMap.get(this._highlightedMenuItemElement);
            this._highlightedMenuItemElement.classList.remove('force-white-icons');
            this._highlightedMenuItemElement.classList.remove('soft-context-menu-item-mouse-over');
            if (detailsForElement && detailsForElement.subItems && detailsForElement.subMenuTimer) {
                window.clearTimeout(detailsForElement.subMenuTimer);
                delete detailsForElement.subMenuTimer;
            }
        }
        this._highlightedMenuItemElement = menuItemElement;
        if (this._highlightedMenuItemElement) {
            if (ThemeSupport.ThemeSupport.instance().hasTheme() || Host.Platform.isMac()) {
                this._highlightedMenuItemElement.classList.add('force-white-icons');
            }
            this._highlightedMenuItemElement.classList.add('soft-context-menu-item-mouse-over');
            const detailsForElement = this.detailsForElementMap.get(this._highlightedMenuItemElement);
            if (detailsForElement && detailsForElement.customElement) {
                detailsForElement.customElement.focus();
            }
            else {
                this._highlightedMenuItemElement.focus();
            }
            if (scheduleSubMenu && detailsForElement && detailsForElement.subItems && !detailsForElement.subMenuTimer) {
                detailsForElement.subMenuTimer =
                    window.setTimeout(this._showSubMenu.bind(this, this._highlightedMenuItemElement), 150);
            }
        }
    }
    _highlightPrevious() {
        let menuItemElement = this._highlightedMenuItemElement ?
            this._highlightedMenuItemElement.previousSibling :
            this._contextMenuElement ? this._contextMenuElement.lastChild : null;
        let menuItemDetails = menuItemElement ? this.detailsForElementMap.get(menuItemElement) : undefined;
        while (menuItemElement && menuItemDetails &&
            (menuItemDetails.isSeparator ||
                menuItemElement.classList.contains('soft-context-menu-disabled'))) {
            menuItemElement = menuItemElement.previousSibling;
            menuItemDetails = menuItemElement ? this.detailsForElementMap.get(menuItemElement) : undefined;
        }
        if (menuItemElement) {
            this._highlightMenuItem(menuItemElement, false);
        }
    }
    _highlightNext() {
        let menuItemElement = this._highlightedMenuItemElement ?
            this._highlightedMenuItemElement.nextSibling :
            this._contextMenuElement ? this._contextMenuElement.firstChild : null;
        let menuItemDetails = menuItemElement ? this.detailsForElementMap.get(menuItemElement) : undefined;
        while (menuItemElement &&
            (menuItemDetails && menuItemDetails.isSeparator ||
                menuItemElement.classList.contains('soft-context-menu-disabled'))) {
            menuItemElement = menuItemElement.nextSibling;
            menuItemDetails = menuItemElement ? this.detailsForElementMap.get(menuItemElement) : undefined;
        }
        if (menuItemElement) {
            this._highlightMenuItem(menuItemElement, false);
        }
    }
    _menuKeyDown(event) {
        const keyboardEvent = event;
        function onEnterOrSpace() {
            if (!this._highlightedMenuItemElement) {
                return;
            }
            const detailsForElement = this.detailsForElementMap.get(this._highlightedMenuItemElement);
            if (!detailsForElement || detailsForElement.customElement) {
                // The custom element will handle the event, so return early and do not consume it.
                return;
            }
            this._triggerAction(this._highlightedMenuItemElement, keyboardEvent);
            if (detailsForElement.subItems && this._subMenu) {
                this._subMenu._highlightNext();
            }
            keyboardEvent.consume(true);
        }
        switch (keyboardEvent.key) {
            case 'ArrowUp':
                this._highlightPrevious();
                keyboardEvent.consume(true);
                break;
            case 'ArrowDown':
                this._highlightNext();
                keyboardEvent.consume(true);
                break;
            case 'ArrowLeft':
                if (this._parentMenu) {
                    this._highlightMenuItem(null, false);
                    this.discard();
                }
                keyboardEvent.consume(true);
                break;
            case 'ArrowRight': {
                if (!this._highlightedMenuItemElement) {
                    break;
                }
                const detailsForElement = this.detailsForElementMap.get(this._highlightedMenuItemElement);
                if (detailsForElement && detailsForElement.subItems) {
                    this._showSubMenu(this._highlightedMenuItemElement);
                    if (this._subMenu) {
                        this._subMenu._highlightNext();
                    }
                }
                keyboardEvent.consume(true);
                break;
            }
            case 'Escape':
                this.discard();
                keyboardEvent.consume(true);
                break;
            /**
             * Important: we don't consume the event by default for `Enter` or `Space`
             * key events, as if there's a custom sub menu we pass the event onto
             * that.
             */
            case 'Enter':
                if (!(keyboardEvent.key === 'Enter')) {
                    return;
                }
                onEnterOrSpace.call(this);
                break;
            case ' ':
                onEnterOrSpace.call(this);
                break;
            default:
                keyboardEvent.consume(true);
        }
    }
}
//# sourceMappingURL=SoftContextMenu.js.map