// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ElementsPanel } from './ElementsPanel.js';
const UIStrings = {
    /**
    * @description Prompt text for a text field in the Classes Pane Widget of the Elements panel.
    * Class refers to a CSS class.
    */
    addNewClass: 'Add new class',
    /**
    * @description Screen reader announcement string when adding a CSS class via the Classes Pane Widget.
    * @example {vbox flex-auto} PH1
    */
    classesSAdded: 'Classes {PH1} added',
    /**
    * @description Screen reader announcement string when adding a class via the Classes Pane Widget.
    * @example {title-container} PH1
    */
    classSAdded: 'Class {PH1} added',
    /**
    * @description Accessible title read by screen readers for the Classes Pane Widget of the Elements
    * panel. Element is a HTML DOM Element and classes refers to CSS classes.
    */
    elementClasses: 'Element Classes',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/ClassesPaneWidget.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ClassesPaneWidget extends UI.Widget.Widget {
    _input;
    _classesContainer;
    _prompt;
    _mutatingNodes;
    _pendingNodeClasses;
    _updateNodeThrottler;
    _previousTarget;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/elements/classesPaneWidget.css', { enableLegacyPatching: false });
        this.contentElement.className = 'styles-element-classes-pane';
        const container = this.contentElement.createChild('div', 'title-container');
        this._input = container.createChild('div', 'new-class-input monospace');
        this.setDefaultFocusedElement(this._input);
        this._classesContainer = this.contentElement.createChild('div', 'source-code');
        this._classesContainer.classList.add('styles-element-classes-container');
        this._prompt = new ClassNamePrompt(this._nodeClasses.bind(this));
        this._prompt.setAutocompletionTimeout(0);
        this._prompt.renderAsBlock();
        const proxyElement = this._prompt.attach(this._input);
        this._prompt.setPlaceholder(i18nString(UIStrings.addNewClass));
        this._prompt.addEventListener(UI.TextPrompt.Events.TextChanged, this._onTextChanged, this);
        proxyElement.addEventListener('keydown', this._onKeyDown.bind(this), false);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DOMModel.DOMModel, SDK.DOMModel.Events.DOMMutated, this._onDOMMutated, this);
        this._mutatingNodes = new Set();
        this._pendingNodeClasses = new Map();
        this._updateNodeThrottler = new Common.Throttler.Throttler(0);
        this._previousTarget = null;
        UI.Context.Context.instance().addFlavorChangeListener(SDK.DOMModel.DOMNode, this._onSelectedNodeChanged, this);
    }
    _splitTextIntoClasses(text) {
        return text.split(/[,\s]/).map(className => className.trim()).filter(className => className.length);
    }
    _onKeyDown(event) {
        if (!(event.key === 'Enter') && !isEscKey(event)) {
            return;
        }
        if (event.key === 'Enter') {
            event.consume();
            if (this._prompt.acceptAutoComplete()) {
                return;
            }
        }
        const eventTarget = event.target;
        let text = eventTarget.textContent;
        if (isEscKey(event)) {
            if (!Platform.StringUtilities.isWhitespace(text)) {
                event.consume(true);
            }
            text = '';
        }
        this._prompt.clearAutocomplete();
        eventTarget.textContent = '';
        const node = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        if (!node) {
            return;
        }
        const classNames = this._splitTextIntoClasses(text);
        if (!classNames.length) {
            this._installNodeClasses(node);
            return;
        }
        for (const className of classNames) {
            this._toggleClass(node, className, true);
        }
        // annoucementString is used for screen reader to announce that the class(es) has been added successfully.
        const joinClassString = classNames.join(' ');
        const announcementString = classNames.length > 1 ? i18nString(UIStrings.classesSAdded, { PH1: joinClassString }) :
            i18nString(UIStrings.classSAdded, { PH1: joinClassString });
        UI.ARIAUtils.alert(announcementString);
        this._installNodeClasses(node);
        this._update();
    }
    _onTextChanged() {
        const node = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        if (!node) {
            return;
        }
        this._installNodeClasses(node);
    }
    _onDOMMutated(event) {
        const node = event.data;
        if (this._mutatingNodes.has(node)) {
            return;
        }
        cachedClassesMap.delete(node);
        this._update();
    }
    _onSelectedNodeChanged(event) {
        if (this._previousTarget && this._prompt.text()) {
            this._input.textContent = '';
            this._installNodeClasses(this._previousTarget);
        }
        this._previousTarget = event.data;
        this._update();
    }
    wasShown() {
        this._update();
    }
    _update() {
        if (!this.isShowing()) {
            return;
        }
        let node = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        if (node) {
            node = node.enclosingElementOrSelf();
        }
        this._classesContainer.removeChildren();
        // @ts-ignore this._input is a div, not an input element. So this line makes no sense at all
        this._input.disabled = !node;
        if (!node) {
            return;
        }
        const classes = this._nodeClasses(node);
        const keys = [...classes.keys()];
        keys.sort(Platform.StringUtilities.caseInsensetiveComparator);
        for (const className of keys) {
            const label = UI.UIUtils.CheckboxLabel.create(className, classes.get(className));
            label.classList.add('monospace');
            label.checkboxElement.addEventListener('click', this._onClick.bind(this, className), false);
            this._classesContainer.appendChild(label);
        }
    }
    _onClick(className, event) {
        const node = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        if (!node) {
            return;
        }
        const enabled = event.target.checked;
        this._toggleClass(node, className, enabled);
        this._installNodeClasses(node);
    }
    _nodeClasses(node) {
        let result = cachedClassesMap.get(node);
        if (!result) {
            const classAttribute = node.getAttribute('class') || '';
            const classes = classAttribute.split(/\s/);
            result = new Map();
            for (let i = 0; i < classes.length; ++i) {
                const className = classes[i].trim();
                if (!className.length) {
                    continue;
                }
                result.set(className, true);
            }
            cachedClassesMap.set(node, result);
        }
        return result;
    }
    _toggleClass(node, className, enabled) {
        const classes = this._nodeClasses(node);
        classes.set(className, enabled);
    }
    _installNodeClasses(node) {
        const classes = this._nodeClasses(node);
        const activeClasses = new Set();
        for (const className of classes.keys()) {
            if (classes.get(className)) {
                activeClasses.add(className);
            }
        }
        const additionalClasses = this._splitTextIntoClasses(this._prompt.textWithCurrentSuggestion());
        for (const className of additionalClasses) {
            activeClasses.add(className);
        }
        const newClasses = [...activeClasses.values()].sort();
        this._pendingNodeClasses.set(node, newClasses.join(' '));
        this._updateNodeThrottler.schedule(this._flushPendingClasses.bind(this));
    }
    async _flushPendingClasses() {
        const promises = [];
        for (const node of this._pendingNodeClasses.keys()) {
            this._mutatingNodes.add(node);
            const promise = node.setAttributeValuePromise('class', this._pendingNodeClasses.get(node))
                .then(onClassValueUpdated.bind(this, node));
            promises.push(promise);
        }
        this._pendingNodeClasses.clear();
        await Promise.all(promises);
        function onClassValueUpdated(node) {
            this._mutatingNodes.delete(node);
        }
    }
}
const cachedClassesMap = new WeakMap();
let buttonProviderInstance;
export class ButtonProvider {
    _button;
    _view;
    constructor() {
        this._button = new UI.Toolbar.ToolbarToggle(i18nString(UIStrings.elementClasses), '');
        this._button.setText('.cls');
        this._button.element.classList.add('monospace');
        this._button.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._clicked, this);
        this._view = new ClassesPaneWidget();
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!buttonProviderInstance || forceNew) {
            buttonProviderInstance = new ButtonProvider();
        }
        return buttonProviderInstance;
    }
    _clicked() {
        ElementsPanel.instance().showToolbarPane(!this._view.isShowing() ? this._view : null, this._button);
    }
    item() {
        return this._button;
    }
}
export class ClassNamePrompt extends UI.TextPrompt.TextPrompt {
    _nodeClasses;
    _selectedFrameId;
    _classNamesPromise;
    constructor(nodeClasses) {
        super();
        this._nodeClasses = nodeClasses;
        this.initialize(this._buildClassNameCompletions.bind(this), ' ');
        this.disableDefaultSuggestionForEmptyInput();
        this._selectedFrameId = '';
        this._classNamesPromise = null;
    }
    async _getClassNames(selectedNode) {
        const promises = [];
        const completions = new Set();
        this._selectedFrameId = selectedNode.frameId();
        const cssModel = selectedNode.domModel().cssModel();
        const allStyleSheets = cssModel.allStyleSheets();
        for (const stylesheet of allStyleSheets) {
            if (stylesheet.frameId !== this._selectedFrameId) {
                continue;
            }
            const cssPromise = cssModel.classNamesPromise(stylesheet.id).then(classes => {
                for (const className of classes) {
                    completions.add(className);
                }
            });
            promises.push(cssPromise);
        }
        const ownerDocumentId = (selectedNode.ownerDocument.id);
        const domPromise = selectedNode.domModel().classNamesPromise(ownerDocumentId).then(classes => {
            for (const className of classes) {
                completions.add(className);
            }
        });
        promises.push(domPromise);
        await Promise.all(promises);
        return [...completions];
    }
    async _buildClassNameCompletions(expression, prefix, force) {
        if (!prefix || force) {
            this._classNamesPromise = null;
        }
        const selectedNode = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        if (!selectedNode || (!prefix && !force && !expression.trim())) {
            return [];
        }
        if (!this._classNamesPromise || this._selectedFrameId !== selectedNode.frameId()) {
            this._classNamesPromise = this._getClassNames(selectedNode);
        }
        let completions = await this._classNamesPromise;
        const classesMap = this._nodeClasses(selectedNode);
        completions = completions.filter(value => !classesMap.get(value));
        if (prefix[0] === '.') {
            completions = completions.map(value => '.' + value);
        }
        return completions.filter(value => value.startsWith(prefix)).sort().map(completion => {
            return {
                text: completion,
                title: undefined,
                subtitle: undefined,
                iconType: undefined,
                priority: undefined,
                isSecondary: undefined,
                subtitleRenderer: undefined,
                selectionRange: undefined,
                hideGhostText: undefined,
                iconElement: undefined,
            };
        });
    }
}
//# sourceMappingURL=ClassesPaneWidget.js.map