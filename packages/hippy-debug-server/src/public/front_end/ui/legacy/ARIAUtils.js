// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Platform from '../../core/platform/platform.js';
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _id = 0;
export function nextId(prefix) {
    return (prefix || '') + ++_id;
}
export function bindLabelToControl(label, control) {
    const controlId = nextId('labelledControl');
    control.id = controlId;
    label.setAttribute('for', controlId);
}
export function markAsAlert(element) {
    element.setAttribute('role', 'alert');
    element.setAttribute('aria-live', 'polite');
}
export function markAsApplication(element) {
    element.setAttribute('role', 'application');
}
export function markAsButton(element) {
    element.setAttribute('role', 'button');
}
export function markAsCheckbox(element) {
    element.setAttribute('role', 'checkbox');
}
export function markAsCombobox(element) {
    element.setAttribute('role', 'combobox');
}
export function markAsModalDialog(element) {
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-modal', 'true');
}
export function markAsGroup(element) {
    element.setAttribute('role', 'group');
}
export function markAsLink(element) {
    element.setAttribute('role', 'link');
}
export function markAsMenuButton(element) {
    markAsButton(element);
    element.setAttribute('aria-haspopup', 'true');
}
export function markAsProgressBar(element, min = 0, max = 100) {
    element.setAttribute('role', 'progressbar');
    element.setAttribute('aria-valuemin', min.toString());
    element.setAttribute('aria-valuemax', max.toString());
}
export function markAsTab(element) {
    element.setAttribute('role', 'tab');
}
export function markAsTablist(element) {
    element.setAttribute('role', 'tablist');
}
export function markAsTabpanel(element) {
    element.setAttribute('role', 'tabpanel');
}
export function markAsTree(element) {
    element.setAttribute('role', 'tree');
}
export function markAsTreeitem(element) {
    element.setAttribute('role', 'treeitem');
}
export function markAsTextBox(element) {
    element.setAttribute('role', 'textbox');
}
export function markAsMenu(element) {
    element.setAttribute('role', 'menu');
}
export function markAsMenuItem(element) {
    element.setAttribute('role', 'menuitem');
}
export function markAsMenuItemSubMenu(element) {
    markAsMenuItem(element);
    element.setAttribute('aria-haspopup', 'true');
}
export function markAsList(element) {
    element.setAttribute('role', 'list');
}
export function markAsListitem(element) {
    element.setAttribute('role', 'listitem');
}
/**
 * Must contain children whose role is option.
 */
export function markAsListBox(element) {
    element.setAttribute('role', 'listbox');
}
export function markAsMultiSelectable(element) {
    element.setAttribute('aria-multiselectable', 'true');
}
/**
 * Must be contained in, or owned by, an element with the role listbox.
 */
export function markAsOption(element) {
    element.setAttribute('role', 'option');
}
export function markAsRadioGroup(element) {
    element.setAttribute('role', 'radiogroup');
}
export function markAsHidden(element) {
    element.setAttribute('aria-hidden', 'true');
}
export function markAsSlider(element, min = 0, max = 100) {
    element.setAttribute('role', 'slider');
    element.setAttribute('aria-valuemin', String(min));
    element.setAttribute('aria-valuemax', String(max));
}
export function markAsHeading(element, level) {
    element.setAttribute('role', 'heading');
    element.setAttribute('aria-level', level.toString());
}
export function markAsPoliteLiveRegion(element, isAtomic) {
    element.setAttribute('aria-live', 'polite');
    if (isAtomic) {
        element.setAttribute('aria-atomic', 'true');
    }
}
export function markAsLog(element) {
    element.setAttribute('role', 'log');
}
export function hasRole(element) {
    return element.hasAttribute('role');
}
export function removeRole(element) {
    element.removeAttribute('role');
}
export function setPlaceholder(element, placeholder) {
    if (placeholder) {
        element.setAttribute('aria-placeholder', placeholder);
    }
    else {
        element.removeAttribute('aria-placeholder');
    }
}
export function markAsPresentation(element) {
    element.setAttribute('role', 'presentation');
}
export function markAsStatus(element) {
    element.setAttribute('role', 'status');
}
export function ensureId(element) {
    if (!element.id) {
        element.id = nextId('ariaElement');
    }
}
export function setAriaValueText(element, valueText) {
    element.setAttribute('aria-valuetext', valueText);
}
export function setAriaValueNow(element, value) {
    element.setAttribute('aria-valuenow', value);
}
export function setAriaValueMinMax(element, min, max) {
    element.setAttribute('aria-valuemin', min);
    element.setAttribute('aria-valuemax', max);
}
export function setControls(element, controlledElement) {
    if (!controlledElement) {
        element.removeAttribute('aria-controls');
        return;
    }
    ensureId(controlledElement);
    element.setAttribute('aria-controls', controlledElement.id);
}
export function setChecked(element, value) {
    element.setAttribute('aria-checked', (Boolean(value)).toString());
}
export function setCheckboxAsIndeterminate(element) {
    element.setAttribute('aria-checked', 'mixed');
}
export function setDisabled(element, value) {
    element.setAttribute('aria-disabled', (Boolean(value)).toString());
}
export function setExpanded(element, value) {
    element.setAttribute('aria-expanded', (Boolean(value)).toString());
}
export function unsetExpandable(element) {
    element.removeAttribute('aria-expanded');
}
export function setHidden(element, value) {
    element.setAttribute('aria-hidden', (Boolean(value)).toString());
}
export function setLevel(element, level) {
    element.setAttribute('aria-level', level.toString());
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var AutocompleteInteractionModel;
(function (AutocompleteInteractionModel) {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AutocompleteInteractionModel["inline"] = "inline";
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AutocompleteInteractionModel["list"] = "list";
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AutocompleteInteractionModel["both"] = "both";
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AutocompleteInteractionModel["none"] = "none";
})(AutocompleteInteractionModel || (AutocompleteInteractionModel = {}));
export function setAutocomplete(element, interactionModel = AutocompleteInteractionModel.none) {
    element.setAttribute('aria-autocomplete', interactionModel);
}
export function clearAutocomplete(element) {
    element.removeAttribute('aria-autocomplete');
}
export function setHasPopup(element, value = "false" /* False */) {
    if (value !== "false" /* False */) {
        element.setAttribute('aria-haspopup', value);
    }
    else {
        element.removeAttribute('aria-haspopup');
    }
}
export function setSelected(element, value) {
    // aria-selected behaves differently for false and undefined.
    // Often times undefined values are unintentionally typed as booleans.
    // Use !! to make sure this is true or false.
    element.setAttribute('aria-selected', (Boolean(value)).toString());
}
export function clearSelected(element) {
    element.removeAttribute('aria-selected');
}
export function setInvalid(element, value) {
    if (value) {
        element.setAttribute('aria-invalid', value.toString());
    }
    else {
        element.removeAttribute('aria-invalid');
    }
}
export function setPressed(element, value) {
    // aria-pressed behaves differently for false and undefined.
    // Often times undefined values are unintentionally typed as booleans.
    // Use !! to make sure this is true or false.
    element.setAttribute('aria-pressed', (Boolean(value)).toString());
}
export function setValueNow(element, value) {
    element.setAttribute('aria-valuenow', value.toString());
}
export function setValueText(element, value) {
    element.setAttribute('aria-valuetext', value.toString());
}
export function setProgressBarValue(element, valueNow, valueText) {
    element.setAttribute('aria-valuenow', valueNow.toString());
    if (valueText) {
        element.setAttribute('aria-valuetext', valueText);
    }
}
export function setAccessibleName(element, name) {
    element.setAttribute('aria-label', name);
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _descriptionMap = new WeakMap();
export function setDescription(element, description) {
    // Nodes in the accessibility tree are made up of a core
    // triplet of "name", "value", "description"
    // The "description" field is taken from either
    // 1. The title html attribute
    // 2. The value of the aria-description attribute.
    // 3. The textContent of an element specified by aria-describedby
    //
    // The title attribute has the side effect of causing tooltips
    // to appear with the description when the element is hovered.
    // This is usually fine, except that DevTools has its own styled
    // tooltips which would interfere with the browser tooltips.
    //
    // In future, the aria-description attribute may be used once it
    // is unflagged.
    //
    // aria-describedby requires that an extra element exist in DOM
    // that this element can point to. Both elements also have to
    // be in the same shadow root. This is not trivial to manage.
    // The rest of DevTools shouldn't have to worry about this,
    // so there is some unfortunate code below.
    const oldDescription = _descriptionMap.get(element);
    if (oldDescription) {
        oldDescription.remove();
    }
    element.removeAttribute('data-aria-utils-animation-hack');
    if (!description) {
        _descriptionMap.delete(element);
        element.removeAttribute('aria-describedby');
        return;
    }
    // We make a hidden element that contains the decsription
    // and will be pointed to by aria-describedby.
    const descriptionElement = document.createElement('span');
    descriptionElement.textContent = description;
    descriptionElement.style.display = 'none';
    ensureId(descriptionElement);
    element.setAttribute('aria-describedby', descriptionElement.id);
    _descriptionMap.set(element, descriptionElement);
    // Now we have to actually put this description element
    // somewhere in the DOM so that we can point to it.
    // It would be nice to just put it in the body, but that
    // wouldn't work if the main element is in a shadow root.
    // So the cleanest approach is to add the description element
    // as a child of the main element. But wait! Some HTML elements
    // aren't supposed to have children. Blink won't search inside
    // these elements, and won't find our description element.
    const contentfulVoidTags = new Set(['INPUT', 'IMG']);
    if (!contentfulVoidTags.has(element.tagName)) {
        element.appendChild(descriptionElement);
        // If we made it here, someone setting .textContent
        // or removeChildren on the element will blow away
        // our description. At least we tried our best!
        return;
    }
    // We have some special element, like an <input>, where putting the
    // description element inside it doesn't work.
    // Lets try the next best thing, and just put the description element
    // next to it in the DOM.
    const inserted = element.insertAdjacentElement('afterend', descriptionElement);
    if (inserted) {
        return;
    }
    // Uh oh, the insertion didn't work! That means we aren't currently in the DOM.
    // How can we find out when the element enters the DOM?
    // See inspectorCommon.css
    element.setAttribute('data-aria-utils-animation-hack', 'sorry');
    element.addEventListener('animationend', () => {
        // Someone might have made a new description in the meantime.
        if (_descriptionMap.get(element) !== descriptionElement) {
            return;
        }
        element.removeAttribute('data-aria-utils-animation-hack');
        // Try it again. This time we are in the DOM, so it *should* work.
        element.insertAdjacentElement('afterend', descriptionElement);
    }, { once: true });
}
export function setActiveDescendant(element, activedescendant) {
    if (!activedescendant) {
        element.removeAttribute('aria-activedescendant');
        return;
    }
    if (activedescendant.isConnected && element.isConnected) {
        console.assert(element.hasSameShadowRoot(activedescendant), 'elements are not in the same shadow dom');
    }
    else {
        console.warn('One or more elements in an active-descendant relationship are not yet attached to the DOM tree.');
    }
    ensureId(activedescendant);
    element.setAttribute('aria-activedescendant', activedescendant.id);
}
export function setSetSize(element, size) {
    element.setAttribute('aria-setsize', size.toString());
}
export function setPositionInSet(element, position) {
    element.setAttribute('aria-posinset', position.toString());
}
function hideFromLayout(element) {
    element.style.position = 'absolute';
    element.style.left = '-999em';
    element.style.width = '100em';
    element.style.overflow = 'hidden';
}
let alertElement;
function createAriaAlertElement() {
    const element = document.body.createChild('div');
    hideFromLayout(element);
    element.setAttribute('role', 'alert');
    element.setAttribute('aria-atomic', 'true');
    return element;
}
/**
 * This function is used to announce a message with the screen reader.
 * Setting the textContent would allow the SR to access the offscreen element via browse mode
 */
export function alert(message) {
    if (!alertElement) {
        alertElement = createAriaAlertElement();
    }
    // We first set the textContent to blank so that the string will announce even if it is replaced
    // with the same string.
    alertElement.textContent = '';
    alertElement.textContent = Platform.StringUtilities.trimEndWithMaxLength(message, 10000);
}
//# sourceMappingURL=ARIAUtils.js.map