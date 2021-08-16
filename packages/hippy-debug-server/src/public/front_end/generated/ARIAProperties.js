// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export const config = {
    'attributes': [
        { 'type': 'IDREF', 'name': 'aria-activedescendant' },
        { 'default': 'false', 'type': 'boolean', 'name': 'aria-atomic' },
        { 'default': 'none', 'enum': ['inline', 'list', 'both', 'none'], 'type': 'token', 'name': 'aria-autocomplete' },
        { 'default': 'false', 'type': 'boolean', 'name': 'aria-busy' },
        { 'default': 'undefined', 'enum': ['true', 'false', 'mixed', 'undefined'], 'type': 'token', 'name': 'aria-checked' },
        { 'type': 'integer', 'name': 'aria-colcount' },
        { 'type': 'integer', 'name': 'aria-colindex' },
        { 'type': 'integer', 'name': 'aria-colspan' },
        { 'type': 'IDREF_list', 'name': 'aria-controls' },
        {
            'default': 'false',
            'enum': ['page', 'step', 'location', 'date', 'time', 'true', 'false'],
            'type': 'token',
            'name': 'aria-current'
        },
        { 'type': 'IDREF_list', 'name': 'aria-describedby' },
        { 'type': 'string', 'name': 'aria-description' },
        { 'type': 'IDREF', 'name': 'aria-details' },
        { 'default': 'false', 'type': 'boolean', 'name': 'aria-disabled' },
        {
            'default': 'none',
            'enum': ['copy', 'move', 'link', 'execute', 'popup', 'none'],
            'type': 'token_list',
            'name': 'aria-dropeffect'
        },
        { 'type': 'IDREF', 'name': 'aria-errormessage' },
        { 'default': 'undefined', 'enum': ['true', 'false', 'undefined'], 'type': 'token', 'name': 'aria-expanded' },
        { 'type': 'IDREF_list', 'name': 'aria-flowto' },
        { 'default': 'undefined', 'enum': ['true', 'false', 'undefined'], 'type': 'token', 'name': 'aria-grabbed' },
        {
            'default': 'false',
            'enum': ['false', 'true', 'menu', 'listbox', 'tree', 'grid', 'dialog'],
            'type': 'token',
            'name': 'aria-haspopup'
        },
        { 'default': 'undefined', 'enum': ['true', 'false', 'undefined'], 'type': 'token', 'name': 'aria-hidden' },
        { 'default': 'false', 'enum': ['grammar', 'false', 'spelling', 'true'], 'type': 'token', 'name': 'aria-invalid' },
        { 'type': 'string', 'name': 'aria-keyshortcuts' },
        { 'type': 'string', 'name': 'aria-label' },
        { 'type': 'IDREF_list', 'name': 'aria-labelledby' },
        { 'type': 'IDREF_list', 'name': 'aria-labeledby' },
        { 'type': 'integer', 'name': 'aria-level' },
        { 'default': 'off', 'enum': ['off', 'polite', 'assertive'], 'type': 'token', 'name': 'aria-live' },
        { 'default': 'false', 'type': 'boolean', 'name': 'aria-modal' },
        { 'default': 'false', 'type': 'boolean', 'name': 'aria-multiline' },
        { 'default': 'false', 'type': 'boolean', 'name': 'aria-multiselectable' },
        {
            'default': 'undefined',
            'enum': ['horizontal', 'undefined', 'vertical'],
            'type': 'token',
            'name': 'aria-orientation'
        },
        { 'type': 'IDREF_list', 'name': 'aria-owns' },
        { 'type': 'string', 'name': 'aria-placeholder' },
        { 'type': 'integer', 'name': 'aria-posinset' },
        { 'default': 'undefined', 'enum': ['true', 'false', 'mixed', 'undefined'], 'type': 'token', 'name': 'aria-pressed' },
        { 'default': 'false', 'type': 'boolean', 'name': 'aria-readonly' },
        {
            'default': 'additions text',
            'enum': ['additions', 'removals', 'text', 'all'],
            'type': 'token_list',
            'name': 'aria-relevant'
        },
        { 'default': 'false', 'type': 'boolean', 'name': 'aria-required' },
        { 'type': 'string', 'name': 'aria-roledescription' },
        { 'type': 'integer', 'name': 'aria-rowcount' },
        { 'type': 'integer', 'name': 'aria-rowindex' },
        { 'type': 'integer', 'name': 'aria-rowspan' },
        { 'default': 'undefined', 'enum': ['true', 'false', 'undefined'], 'type': 'token', 'name': 'aria-selected' },
        { 'type': 'integer', 'name': 'aria-setsize' },
        { 'default': 'none', 'enum': ['ascending', 'descending', 'none', 'other'], 'type': 'token', 'name': 'aria-sort' },
        { 'runtimeEnabled': 'AriaTouchPassthrough', 'type': 'boolean', 'name': 'aria-touchpassthrough' },
        { 'type': 'decimal', 'name': 'aria-valuemax' },
        { 'type': 'decimal', 'name': 'aria-valuemin' },
        { 'type': 'decimal', 'name': 'aria-valuenow' },
        { 'type': 'string', 'name': 'aria-valuetext' },
        { 'type': 'string', 'name': 'aria-virtualcontent' }
    ],
    'roles': [
        {
            'implicitValues': { 'aria-atomic': 'true', 'aria-live': 'assertive' },
            'superclasses': ['section'],
            'name': 'alert',
            'nameFrom': ['author']
        },
        { 'superclasses': ['alert', 'dialog'], 'name': 'alertdialog', 'nameRequired': true, 'nameFrom': ['author'] },
        { 'superclasses': ['structure'], 'name': 'application', 'nameRequired': true, 'nameFrom': ['author'] },
        {
            'supportedAttributes': ['aria-posinset', 'aria-setsize'],
            'superclasses': ['document'],
            'name': 'article',
            'nameFrom': ['author']
        },
        { 'superclasses': ['landmark'], 'name': 'banner', 'nameFrom': ['author'] },
        {
            'name': 'button',
            'nameRequired': true,
            'nameFrom': ['contents', 'author'],
            'supportedAttributes': ['aria-expanded', 'aria-pressed'],
            'superclasses': ['command'],
            'childrenPresentational': true
        },
        {
            'scope': 'row',
            'supportedAttributes': ['aria-colindex', 'aria-colspan', 'aria-rowindex', 'aria-rowspan'],
            'superclasses': ['section'],
            'name': 'cell',
            'namefrom': ['contents', 'author']
        },
        {
            'name': 'checkbox',
            'nameRequired': true,
            'implicitValues': { 'aria-checked': false },
            'requiredAttributes': ['aria-checked'],
            'nameFrom': ['contents', 'author'],
            'supportedAttributes': ['aria-readonly'],
            'superclasses': ['input']
        },
        {
            'name': 'columnheader',
            'nameRequired': true,
            'nameFrom': ['contents', 'author'],
            'supportedAttributes': ['aria-sort'],
            'superclasses': ['gridcell', 'sectionhead', 'widget'],
            'scope': ['row']
        },
        {
            'name': 'combobox',
            'nameRequired': true,
            'implicitValues': { 'aria-haspopup': 'listbox', 'aria-expanded': 'false' },
            'requiredAttributes': ['aria-controls', 'aria-expanded'],
            'mustContain': ['textbox'],
            'nameFrom': ['author'],
            'supportedAttributes': ['aria-autocomplete', 'aria-readonly', 'aria-required'],
            'superclasses': ['select']
        },
        { 'abstract': true, 'superclasses': ['widget'], 'name': 'command', 'nameFrom': ['author'] },
        { 'superclasses': ['landmark'], 'name': 'complementary', 'nameFrom': ['author'] },
        {
            'supportedAttributes': ['aria-activedescendant'],
            'abstract': true,
            'superclasses': ['widget'],
            'name': 'composite',
            'nameFrom': ['author']
        },
        { 'superclasses': ['landmark'], 'name': 'contentinfo', 'nameFrom': ['author'] },
        { 'superclasses': ['section'], 'name': 'definition', 'nameFrom': ['author'] },
        { 'superclasses': ['window'], 'name': 'dialog', 'nameRequired': true, 'nameFrom': ['author'] },
        { 'superclasses': ['list'], 'name': 'directory', 'nameFrom': ['author'] },
        {
            'supportedAttributes': ['aria-expanded'],
            'superclasses': ['structure'],
            'name': 'document',
            'nameRequired': false,
            'nameFrom': ['author']
        },
        {
            'nameRequired': false,
            'superclasses': ['list'],
            'name': 'feed',
            'mustContain': ['article'],
            'nameFrom': ['author']
        },
        { 'superclasses': ['section'], 'name': 'figure', 'nameRequired': false, 'namefrom': ['author'] },
        { 'superclasses': ['landmark'], 'name': 'form', 'nameFrom': ['author'] },
        {
            'name': 'grid',
            'nameRequired': true,
            'nameFrom': ['author'],
            'mustContain': ['row'],
            'supportedAttributes': ['aria-level', 'aria-multiselectable', 'aria-readonly'],
            'superclasses': ['composite', 'table']
        },
        {
            'name': 'gridcell',
            'nameRequired': true,
            'nameFrom': ['contents', 'author'],
            'supportedAttributes': ['aria-readonly', 'aria-required', 'aria-selected'],
            'superclasses': ['cell', 'widget'],
            'scope': ['row']
        },
        {
            'supportedAttributes': ['aria-activedescendant'],
            'superclasses': ['section'],
            'name': 'group',
            'nameFrom': ['author']
        },
        {
            'name': 'heading',
            'nameRequired': true,
            'implicitValues': { 'aria-level': '2' },
            'namefrom': ['contents', 'author'],
            'supportedAttributes': ['aria-level'],
            'superclasses': ['sectionhead']
        },
        {
            'childrenPresentational': true,
            'superclasses': ['section'],
            'name': 'img',
            'nameRequired': true,
            'nameFrom': ['author']
        },
        { 'abstract': true, 'superclasses': ['widget'], 'name': 'input', 'nameFrom': ['author'] },
        { 'abstract': true, 'superclasses': ['section'], 'name': 'landmark', 'nameRequired': false, 'nameFrom': ['author'] },
        {
            'supportedAttributes': ['aria-expanded'],
            'superclasses': ['command'],
            'name': 'link',
            'nameRequired': true,
            'nameFrom': ['contents', 'author']
        },
        {
            'implicitValues': { 'aria-orientation': 'vertical' },
            'superclasses': ['section'],
            'name': 'list',
            'mustContain': ['listitem'],
            'nameFrom': ['author']
        },
        {
            'name': 'listbox',
            'nameRequired': true,
            'implicitValues': { 'aria-orientation': 'vertical' },
            'nameFrom': ['author'],
            'mustContain': ['option'],
            'supportedAttributes': ['aria-multiselectable', 'aria-readonly', 'aria-required'],
            'superclasses': ['select']
        },
        {
            'scope': ['group', 'list'],
            'supportedAttributes': ['aria-level', 'aria-posinset', 'aria-setsize'],
            'superclasses': ['section'],
            'name': 'listitem',
            'nameFrom': ['author']
        },
        {
            'implicitValues': { 'aria-live': 'polite' },
            'superclasses': ['section'],
            'name': 'log',
            'nameRequired': true,
            'nameFrom': ['author']
        },
        { 'superclasses': ['landmark'], 'name': 'main', 'nameFrom': ['author'] },
        { 'superclasses': ['section'], 'name': 'marquee', 'nameRequired': true, 'nameFrom': ['author'] },
        {
            'childrenPresentational': true,
            'superclasses': ['section'],
            'name': 'math',
            'nameRequired': true,
            'nameFrom': ['author']
        },
        {
            'implicitValues': { 'aria-orientation': 'vertical' },
            'superclasses': ['select'],
            'name': 'menu',
            'mustContain': ['group', 'menuitemradio', 'menuitem', 'menuitemcheckbox', 'menuitemradio'],
            'nameFrom': ['author']
        },
        {
            'implicitValues': { 'aria-orientation': 'horizontal' },
            'superclasses': ['menu'],
            'name': 'menubar',
            'mustContain': ['menuitem', 'menuitemradio', 'menuitemcheckbox'],
            'nameFrom': ['author']
        },
        {
            'scope': ['group', 'menu', 'menubar'],
            'superclasses': ['command'],
            'name': 'menuitem',
            'nameRequired': true,
            'nameFrom': ['contents', 'author']
        },
        {
            'name': 'menuitemcheckbox',
            'nameRequired': true,
            'implicitValues': { 'aria-checked': false },
            'nameFrom': ['contents', 'author'],
            'superclasses': ['checkbox', 'menuitem'],
            'childrenPresentational': true,
            'scope': ['menu', 'menubar']
        },
        {
            'name': 'menuitemradio',
            'nameRequired': true,
            'implicitValues': { 'aria-checked': false },
            'nameFrom': ['contents', 'author'],
            'superclasses': ['menuitemcheckbox', 'radio'],
            'childrenPresentational': true,
            'scope': ['menu', 'menubar', 'group']
        },
        { 'superclasses': ['landmark'], 'name': 'navigation', 'nameFrom': ['author'] },
        { 'name': 'none', 'superclasses': ['structure'] },
        { 'superclasses': ['section'], 'name': 'note', 'nameFrom': ['author'] },
        {
            'name': 'option',
            'nameRequired': true,
            'implicitValues': { 'aria-selected': 'false' },
            'requiredAttributes': ['aria-selected'],
            'nameFrom': ['contents', 'author'],
            'supportedAttributes': ['aria-checked', 'aria-posinset', 'aria-setsize'],
            'superclasses': ['input'],
            'childrenPresentational': true,
            'scope': ['listbox']
        },
        { 'name': 'presentation', 'superclasses': ['structure'] },
        {
            'childrenPresentational': true,
            'superclasses': ['range'],
            'name': 'progressbar',
            'nameRequired': true,
            'nameFrom': ['author']
        },
        {
            'name': 'radio',
            'nameRequired': true,
            'implicitValues': { 'aria-checked': 'false' },
            'requiredAttributes': ['aria-checked'],
            'nameFrom': ['contents', 'author'],
            'supportedAttributes': ['aria-posinset', 'aria-setsize'],
            'superclasses': ['input'],
            'childrenPresentational': true
        },
        {
            'name': 'radiogroup',
            'nameRequired': true,
            'nameFrom': ['author'],
            'mustContain': ['radio'],
            'supportedAttributes': ['aria-readonly', 'aria-required'],
            'superclasses': ['select']
        },
        {
            'supportedAttributes': ['aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext'],
            'abstract': true,
            'superclasses': ['widget'],
            'name': 'range',
            'nameFrom': ['author']
        },
        { 'superclasses': ['landmark'], 'name': 'region', 'nameRequired': true, 'nameFrom': ['author'] },
        {
            'supportedAttributes': [
                'aria-atomic', 'aria-busy', 'aria-controls', 'aria-current', 'aria-describedby', 'aria-details',
                'aria-disabled', 'aria-dropeffect', 'aria-errormessage', 'aria-flowto', 'aria-grabbed', 'aria-haspopup',
                'aria-hidden', 'aria-invalid', 'aria-keyshortcuts', 'aria-label', 'aria-labelledby', 'aria-live',
                'aria-owns', 'aria-relevant', 'aria-roledescription'
            ],
            'abstract': true,
            'name': 'roletype'
        },
        {
            'name': 'row',
            'nameFrom': ['contents', 'author'],
            'mustContain': ['cell', 'columnheader', 'gridcell', 'rowheader'],
            'supportedAttributes': ['aria-colindex', 'aria-level', 'aria-rowindex', 'aria-selected', 'aria-setsize', 'aria-posinset'],
            'superclasses': ['group', 'widget'],
            'scope': ['grid', 'rowgroup', 'table', 'treegrid']
        },
        {
            'scope': ['grid', 'table', 'treegrid'],
            'superclasses': ['structure'],
            'name': 'rowgroup',
            'mustContain': ['row'],
            'nameFrom': ['contents', 'author']
        },
        {
            'name': 'rowheader',
            'nameRequired': true,
            'nameFrom': ['contents', 'author'],
            'supportedAttributes': ['aria-sort'],
            'superclasses': ['cell', 'gridcell', 'sectionhead'],
            'scope': ['row']
        },
        {
            'name': 'scrollbar',
            'nameRequired': false,
            'implicitValues': { 'aria-valuemax': '100', 'aria-valuemin': '0', 'aria-orientation': 'vertical' },
            'nameFrom': ['author'],
            'requiredAttributes': ['aria-controls', 'aria-orientation', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow'],
            'superclasses': ['range'],
            'childrenPresentational': true
        },
        { 'superclasses': ['landmark'], 'name': 'search', 'nameFrom': ['author'] },
        { 'superclasses': ['textbox'], 'name': 'searchbox', 'nameRequired': true, 'nameFrom': ['author'] },
        { 'supportedAttributes': ['aria-expanded'], 'abstract': true, 'name': 'section', 'superclasses': ['structure'] },
        {
            'supportedAttributes': ['aria-expanded'],
            'abstract': true,
            'superclasses': ['structure'],
            'name': 'sectionhead',
            'nameFrom': ['contents', 'author']
        },
        { 'abstract': true, 'superclasses': ['composite', 'group'], 'name': 'select', 'nameFrom': ['author'] },
        {
            'supportedAttributes': ['aria-orientation', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext'],
            'superclasses': ['structure'],
            'name': 'separator',
            'nameFrom': ['author']
        },
        {
            'name': 'slider',
            'nameRequired': true,
            'implicitValues': { 'aria-valuemax': '100', 'aria-valuemin': '0', 'aria-orientation': 'horizontal' },
            'requiredAttributes': ['aria-valuemax', 'aria-valuemin', 'aria-valuenow'],
            'nameFrom': ['author'],
            'supportedAttributes': ['aria-orientation'],
            'superclasses': ['input', 'range'],
            'childrenPresentational': true
        },
        {
            'name': 'spinbutton',
            'nameRequired': true,
            'implicitValues': { 'aria-valuenow': '0' },
            'requiredAttributes': ['aria-valuemax', 'aria-valuemin', 'aria-valuenow'],
            'nameFrom': ['author'],
            'supportedAttributes': ['aria-required', 'aria-readonly'],
            'superclasses': ['composite', 'input', 'range']
        },
        {
            'implicitValues': { 'aria-atomic': 'true', 'aria-live': 'polite' },
            'superclasses': ['section'],
            'name': 'status',
            'nameFrom': ['author']
        },
        { 'abstract': true, 'name': 'structure', 'superclasses': ['roletype'] },
        {
            'name': 'switch',
            'nameRequired': true,
            'implicitValues': { 'aria-checked': 'false' },
            'nameFrom': ['contents', 'author'],
            'requiredAttributes': ['aria-checked'],
            'superclasses': ['checkbox'],
            'childrenPresentational': true
        },
        {
            'name': 'tab',
            'implicitValues': { 'aria-selected': 'false' },
            'nameFrom': ['contents', 'author'],
            'supportedAttributes': ['aria-selected'],
            'superclasses': ['sectionhead', 'widget'],
            'childrenPresentational': true,
            'scope': ['tablist']
        },
        {
            'name': 'table',
            'nameRequired': true,
            'nameFrom': ['author'],
            'mustContain': ['row'],
            'supportedAttributes': ['aria-colcount', 'aria-rowcount'],
            'superclasses': ['section']
        },
        {
            'name': 'tablist',
            'implicitValues': { 'aria-orientation': 'horizontal' },
            'nameFrom': ['author'],
            'mustContain': ['tab'],
            'supportedAttributes': ['aria-level', 'aria-multiselectable', 'aria-orientation'],
            'superclasses': ['composite']
        },
        { 'superclasses': ['section'], 'name': 'tabpanel', 'nameRequired': true, 'nameFrom': ['author'] },
        { 'superclasses': ['section'], 'name': 'term', 'nameFrom': ['author'] },
        {
            'supportedAttributes': [
                'aria-activedescendant', 'aria-autocomplete', 'aria-multiline', 'aria-placeholder', 'aria-readonly',
                'aria-required'
            ],
            'superclasses': ['input'],
            'name': 'textbox',
            'nameRequired': true,
            'nameFrom': ['author']
        },
        { 'superclasses': ['status'], 'name': 'timer', 'nameFrom': ['author'] },
        {
            'implicitValues': { 'aria-orientation': 'horizontal' },
            'supportedAttributes': ['aria-orientation'],
            'superclasses': ['group'],
            'name': 'toolbar',
            'nameFrom': ['author']
        },
        { 'superclasses': ['section'], 'name': 'tooltip', 'nameRequired': true, 'nameFrom': ['contents', 'author'] },
        {
            'name': 'tree',
            'nameRequired': true,
            'implicitValues': { 'aria-orientation': 'vertical' },
            'nameFrom': ['author'],
            'mustContain': ['group', 'treeitem'],
            'supportedAttributes': ['aria-multiselectable', 'aria-required'],
            'superclasses': ['select']
        },
        {
            'nameRequired': true,
            'superclasses': ['grid', 'tree'],
            'name': 'treegrid',
            'mustContain': ['row'],
            'nameFrom': ['author']
        },
        {
            'scope': ['group', 'tree'],
            'superclasses': ['listitem', 'option'],
            'name': 'treeitem',
            'nameRequired': true,
            'nameFrom': ['contents', 'author']
        },
        { 'abstract': true, 'name': 'widget', 'superclasses': ['roletype'] },
        {
            'supportedAttributes': ['aria-expanded', 'aria-modal'],
            'abstract': true,
            'superclasses': ['roletype'],
            'name': 'window',
            'nameFrom': ['author']
        }
    ],
    'metadata': {
        'namespaceURI': 'http://www.w3.org/1999/xhtml',
        'attrsNullNamespace': true,
        'namespace': 'HTML',
        'export': 'CORE_EXPORT',
        'namespacePrefix': 'xhtml'
    }
};
//# sourceMappingURL=ARIAProperties.js.map