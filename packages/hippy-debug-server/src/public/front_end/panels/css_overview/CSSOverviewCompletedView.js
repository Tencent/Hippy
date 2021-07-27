// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Events } from './CSSOverviewController.js';
import { CSSOverviewSidebarPanel } from './CSSOverviewSidebarPanel.js';
const UIStrings = {
    /**
    *@description Label for the summary in the CSS Overview report
    */
    overviewSummary: 'Overview summary',
    /**
    *@description Title of colors subsection in the CSS Overview Panel
    */
    colors: 'Colors',
    /**
    *@description Title of font info subsection in the CSS Overview Panel
    */
    fontInfo: 'Font info',
    /**
    *@description Label to denote unused declarations in the target page
    */
    unusedDeclarations: 'Unused declarations',
    /**
    *@description Label for the number of media queries in the CSS Overview report
    */
    mediaQueries: 'Media queries',
    /**
    *@description Title of the Elements Panel
    */
    elements: 'Elements',
    /**
    *@description Label for the number of External stylesheets in the CSS Overview report
    */
    externalStylesheets: 'External stylesheets',
    /**
    *@description Label for the number of inline style elements in the CSS Overview report
    */
    inlineStyleElements: 'Inline style elements',
    /**
    *@description Label for the number of style rules in CSS Overview report
    */
    styleRules: 'Style rules',
    /**
    *@description Label for the number of type selectors in the CSS Overview report
    */
    typeSelectors: 'Type selectors',
    /**
    *@description Label for the number of ID selectors in the CSS Overview report
    */
    idSelectors: 'ID selectors',
    /**
    *@description Label for the number of class selectors in the CSS Overview report
    */
    classSelectors: 'Class selectors',
    /**
    *@description Label for the number of universal selectors in the CSS Overview report
    */
    universalSelectors: 'Universal selectors',
    /**
    *@description Label for the number of Attribute selectors in the CSS Overview report
    */
    attributeSelectors: 'Attribute selectors',
    /**
    *@description Label for the number of non-simple selectors in the CSS Overview report
    */
    nonsimpleSelectors: 'Non-simple selectors',
    /**
    *@description Label for unique background colors in the CSS Overview Panel
    *@example {32} PH1
    */
    backgroundColorsS: 'Background colors: {PH1}',
    /**
    *@description Label for unique text colors in the CSS Overview Panel
    *@example {32} PH1
    */
    textColorsS: 'Text colors: {PH1}',
    /**
    *@description Label for unique fill colors in the CSS Overview Panel
    *@example {32} PH1
    */
    fillColorsS: 'Fill colors: {PH1}',
    /**
    *@description Label for unique border colors in the CSS Overview Panel
    *@example {32} PH1
    */
    borderColorsS: 'Border colors: {PH1}',
    /**
    *@description Label to indicate that there are no fonts in use
    */
    thereAreNoFonts: 'There are no fonts.',
    /**
    *@description Message to show when no unused declarations in the target page
    */
    thereAreNoUnusedDeclarations: 'There are no unused declarations.',
    /**
    *@description Message to show when no media queries are found in the target page
    */
    thereAreNoMediaQueries: 'There are no media queries.',
    /**
    *@description Title of the Drawer for contrast issues in the CSS Overview Panel
    */
    contrastIssues: 'Contrast issues',
    /**
    * @description Text to indicate how many times this CSS rule showed up.
    */
    nOccurrences: '{n, plural, =1 {# occurrence} other {# occurrences}}',
    /**
    *@description Section header for contrast issues in the CSS Overview Panel
    *@example {1} PH1
    */
    contrastIssuesS: 'Contrast issues: {PH1}',
    /**
    *@description Title of the button for a contrast issue in the CSS Overview Panel
    *@example {#333333} PH1
    *@example {#333333} PH2
    *@example {2} PH3
    */
    textColorSOverSBackgroundResults: 'Text color {PH1} over {PH2} background results in low contrast for {PH3} elements',
    /**
    *@description Label aa text content in Contrast Details of the Color Picker
    */
    aa: 'AA',
    /**
    *@description Label aaa text content in Contrast Details of the Color Picker
    */
    aaa: 'AAA',
    /**
    *@description Label for the APCA contrast in Color Picker
    */
    apca: 'APCA',
    /**
    *@description Label for the column in the element list in the CSS Overview report
    */
    element: 'Element',
    /**
    *@description Column header title denoting which declaration is unused
    */
    declaration: 'Declaration',
    /**
    *@description Text for the source of something
    */
    source: 'Source',
    /**
    *@description Text of a DOM element in Contrast Details of the Color Picker
    */
    contrastRatio: 'Contrast ratio',
    /**
    *@description Accessible title of a table in the CSS Overview Elements.
    */
    cssOverviewElements: 'CSS Overview Elements',
    /**
    *@description Title of the button to show the element in the CSS Overview panel
    */
    showElement: 'Show element',
};
const str_ = i18n.i18n.registerUIStrings('panels/css_overview/CSSOverviewCompletedView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
function getBorderString(color) {
    let [h, s, l] = color.hsla();
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    // Reduce the lightness of the border to make sure that there's always a visible outline.
    l = Math.max(0, l - 15);
    return `1px solid hsl(${h}deg ${s}% ${l}%)`;
}
export class CSSOverviewCompletedView extends UI.Panel.PanelWithSidebar {
    _controller;
    _formatter;
    _mainContainer;
    _resultsContainer;
    _elementContainer;
    _sideBar;
    _cssModel;
    _domModel;
    _domAgent;
    _linkifier;
    _viewMap;
    _data;
    _fragment;
    constructor(controller, target) {
        super('css_overview_completed_view');
        this.registerRequiredCSS('panels/css_overview/cssOverviewCompletedView.css', { enableLegacyPatching: false });
        this._controller = controller;
        this._formatter = new Intl.NumberFormat('en-US');
        this._mainContainer = new UI.SplitWidget.SplitWidget(true, true);
        this._resultsContainer = new UI.Widget.VBox();
        this._elementContainer = new DetailsView();
        // If closing the last tab, collapse the sidebar.
        this._elementContainer.addEventListener(UI.TabbedPane.Events.TabClosed, evt => {
            if (evt.data === 0) {
                this._mainContainer.setSidebarMinimized(true);
            }
        });
        // Dupe the styles into the main container because of the shadow root will prevent outer styles.
        this._mainContainer.registerRequiredCSS('panels/css_overview/cssOverviewCompletedView.css', { enableLegacyPatching: false });
        this._mainContainer.setMainWidget(this._resultsContainer);
        this._mainContainer.setSidebarWidget(this._elementContainer);
        this._mainContainer.setVertical(false);
        this._mainContainer.setSecondIsSidebar(true);
        this._mainContainer.setSidebarMinimized(true);
        this._sideBar = new CSSOverviewSidebarPanel();
        this.splitWidget().setSidebarWidget(this._sideBar);
        this.splitWidget().setMainWidget(this._mainContainer);
        const cssModel = target.model(SDK.CSSModel.CSSModel);
        const domModel = target.model(SDK.DOMModel.DOMModel);
        if (!cssModel || !domModel) {
            throw new Error('Target must provide CSS and DOM models');
        }
        this._cssModel = cssModel;
        this._domModel = domModel;
        this._domAgent = target.domAgent();
        this._linkifier = new Components.Linkifier.Linkifier(/* maxLinkLength */ 20, /* useLinkDecorator */ true);
        this._viewMap = new Map();
        this._sideBar.addItem(i18nString(UIStrings.overviewSummary), 'summary');
        this._sideBar.addItem(i18nString(UIStrings.colors), 'colors');
        this._sideBar.addItem(i18nString(UIStrings.fontInfo), 'font-info');
        this._sideBar.addItem(i18nString(UIStrings.unusedDeclarations), 'unused-declarations');
        this._sideBar.addItem(i18nString(UIStrings.mediaQueries), 'media-queries');
        this._sideBar.select('summary');
        this._sideBar.addEventListener("ItemSelected" /* ItemSelected */, this._sideBarItemSelected, this);
        this._sideBar.addEventListener("Reset" /* Reset */, this._sideBarReset, this);
        this._controller.addEventListener(Events.Reset, this._reset, this);
        this._controller.addEventListener(Events.PopulateNodes, this._createElementsView, this);
        this._resultsContainer.element.addEventListener('click', this._onClick.bind(this));
        this._data = null;
    }
    wasShown() {
        super.wasShown();
        // TODO(paullewis): update the links in the panels in case source has been .
    }
    _sideBarItemSelected(event) {
        const data = event.data;
        const section = this._fragment.$(data);
        if (!section) {
            return;
        }
        section.scrollIntoView();
    }
    _sideBarReset() {
        this._controller.dispatchEventToListeners(Events.Reset);
    }
    _reset() {
        this._resultsContainer.element.removeChildren();
        this._mainContainer.setSidebarMinimized(true);
        this._elementContainer.closeTabs();
        this._viewMap = new Map();
        CSSOverviewCompletedView.pushedNodes.clear();
        this._sideBar.select('summary');
    }
    _onClick(evt) {
        if (!evt.target) {
            return;
        }
        const target = evt.target;
        const dataset = target.dataset;
        const type = dataset.type;
        if (!type || !this._data) {
            return;
        }
        let payload;
        switch (type) {
            case 'contrast': {
                const section = dataset.section;
                const key = dataset.key;
                if (!key) {
                    return;
                }
                // Remap the Set to an object that is the same shape as the unused declarations.
                const nodes = this._data.textColorContrastIssues.get(key) || [];
                payload = { type, key, nodes, section };
                break;
            }
            case 'color': {
                const color = dataset.color;
                const section = dataset.section;
                if (!color) {
                    return;
                }
                let nodes;
                switch (section) {
                    case 'text':
                        nodes = this._data.textColors.get(color);
                        break;
                    case 'background':
                        nodes = this._data.backgroundColors.get(color);
                        break;
                    case 'fill':
                        nodes = this._data.fillColors.get(color);
                        break;
                    case 'border':
                        nodes = this._data.borderColors.get(color);
                        break;
                }
                if (!nodes) {
                    return;
                }
                // Remap the Set to an object that is the same shape as the unused declarations.
                nodes = Array.from(nodes).map(nodeId => ({ nodeId }));
                payload = { type, color, nodes, section };
                break;
            }
            case 'unused-declarations': {
                const declaration = dataset.declaration;
                if (!declaration) {
                    return;
                }
                const nodes = this._data.unusedDeclarations.get(declaration);
                if (!nodes) {
                    return;
                }
                payload = { type, declaration, nodes };
                break;
            }
            case 'media-queries': {
                const text = dataset.text;
                if (!text) {
                    return;
                }
                const nodes = this._data.mediaQueries.get(text);
                if (!nodes) {
                    return;
                }
                payload = { type, text, nodes };
                break;
            }
            case 'font-info': {
                const value = dataset.value;
                if (!dataset.path) {
                    return;
                }
                const [fontFamily, fontMetric] = dataset.path.split('/');
                if (!value) {
                    return;
                }
                const fontFamilyInfo = this._data.fontInfo.get(fontFamily);
                if (!fontFamilyInfo) {
                    return;
                }
                const fontMetricInfo = fontFamilyInfo.get(fontMetric);
                if (!fontMetricInfo) {
                    return;
                }
                const nodesIds = fontMetricInfo.get(value);
                if (!nodesIds) {
                    return;
                }
                const nodes = nodesIds.map(nodeId => ({ nodeId }));
                const name = `${value} (${fontFamily}, ${fontMetric})`;
                payload = { type, name, nodes };
                break;
            }
            default:
                return;
        }
        evt.consume();
        this._controller.dispatchEventToListeners(Events.PopulateNodes, payload);
        this._mainContainer.setSidebarMinimized(false);
    }
    _onMouseOver(evt) {
        // Traverse the event path on the grid to find the nearest element with a backend node ID attached. Use
        // that for the highlighting.
        const node = evt.composedPath().find(el => el.dataset && el.dataset.backendNodeId);
        if (!node) {
            return;
        }
        const backendNodeId = Number(node.dataset.backendNodeId);
        this._controller.dispatchEventToListeners(Events.RequestNodeHighlight, backendNodeId);
    }
    async _render(data) {
        if (!data || !('backgroundColors' in data) || !('textColors' in data)) {
            return;
        }
        this._data = data;
        const { elementCount, backgroundColors, textColors, textColorContrastIssues, fillColors, borderColors, globalStyleStats, mediaQueries, unusedDeclarations, fontInfo, } = this._data;
        // Convert rgb values from the computed styles to either undefined or HEX(A) strings.
        const sortedBackgroundColors = this._sortColorsByLuminance(backgroundColors);
        const sortedTextColors = this._sortColorsByLuminance(textColors);
        const sortedFillColors = this._sortColorsByLuminance(fillColors);
        const sortedBorderColors = this._sortColorsByLuminance(borderColors);
        this._fragment = UI.Fragment.Fragment.build `
    <div class="vbox overview-completed-view">
      <div $="summary" class="results-section horizontally-padded summary">
        <h1>${i18nString(UIStrings.overviewSummary)}</h1>

        <ul>
          <li>
            <div class="label">${i18nString(UIStrings.elements)}</div>
            <div class="value">${this._formatter.format(elementCount)}</div>
          </li>
          <li>
            <div class="label">${i18nString(UIStrings.externalStylesheets)}</div>
            <div class="value">${this._formatter.format(globalStyleStats.externalSheets)}</div>
          </li>
          <li>
            <div class="label">${i18nString(UIStrings.inlineStyleElements)}</div>
            <div class="value">${this._formatter.format(globalStyleStats.inlineStyles)}</div>
          </li>
          <li>
            <div class="label">${i18nString(UIStrings.styleRules)}</div>
            <div class="value">${this._formatter.format(globalStyleStats.styleRules)}</div>
          </li>
          <li>
            <div class="label">${i18nString(UIStrings.mediaQueries)}</div>
            <div class="value">${this._formatter.format(mediaQueries.size)}</div>
          </li>
          <li>
            <div class="label">${i18nString(UIStrings.typeSelectors)}</div>
            <div class="value">${this._formatter.format(globalStyleStats.stats.type)}</div>
          </li>
          <li>
            <div class="label">${i18nString(UIStrings.idSelectors)}</div>
            <div class="value">${this._formatter.format(globalStyleStats.stats.id)}</div>
          </li>
          <li>
            <div class="label">${i18nString(UIStrings.classSelectors)}</div>
            <div class="value">${this._formatter.format(globalStyleStats.stats.class)}</div>
          </li>
          <li>
            <div class="label">${i18nString(UIStrings.universalSelectors)}</div>
            <div class="value">${this._formatter.format(globalStyleStats.stats.universal)}</div>
          </li>
          <li>
            <div class="label">${i18nString(UIStrings.attributeSelectors)}</div>
            <div class="value">${this._formatter.format(globalStyleStats.stats.attribute)}</div>
          </li>
          <li>
            <div class="label">${i18nString(UIStrings.nonsimpleSelectors)}</div>
            <div class="value">${this._formatter.format(globalStyleStats.stats.nonSimple)}</div>
          </li>
        </ul>
      </div>

      <div $="colors" class="results-section horizontally-padded colors">
        <h1>${i18nString(UIStrings.colors)}</h1>
        <h2>${i18nString(UIStrings.backgroundColorsS, {
            PH1: sortedBackgroundColors.length,
        })}</h2>
        <ul>
          ${sortedBackgroundColors.map(this._colorsToFragment.bind(this, 'background'))}
        </ul>

        <h2>${i18nString(UIStrings.textColorsS, {
            PH1: sortedTextColors.length,
        })}</h2>
        <ul>
          ${sortedTextColors.map(this._colorsToFragment.bind(this, 'text'))}
        </ul>

        ${textColorContrastIssues.size > 0 ? this._contrastIssuesToFragment(textColorContrastIssues) : ''}

        <h2>${i18nString(UIStrings.fillColorsS, {
            PH1: sortedFillColors.length,
        })}</h2>
        <ul>
          ${sortedFillColors.map(this._colorsToFragment.bind(this, 'fill'))}
        </ul>

        <h2>${i18nString(UIStrings.borderColorsS, {
            PH1: sortedBorderColors.length,
        })}</h2>
        <ul>
          ${sortedBorderColors.map(this._colorsToFragment.bind(this, 'border'))}
        </ul>
      </div>

      <div $="font-info" class="results-section font-info">
        <h1>${i18nString(UIStrings.fontInfo)}</h1>
        ${fontInfo.size > 0 ? this._fontInfoToFragment(fontInfo) :
            UI.Fragment.Fragment.build `<div>${i18nString(UIStrings.thereAreNoFonts)}</div>`}
      </div>

      <div $="unused-declarations" class="results-section unused-declarations">
        <h1>${i18nString(UIStrings.unusedDeclarations)}</h1>
        ${unusedDeclarations.size > 0 ? this._groupToFragment(unusedDeclarations, 'unused-declarations', 'declaration') :
            UI.Fragment.Fragment.build `<div class="horizontally-padded">${i18nString(UIStrings.thereAreNoUnusedDeclarations)}</div>`}
      </div>

      <div $="media-queries" class="results-section media-queries">
        <h1>${i18nString(UIStrings.mediaQueries)}</h1>
        ${mediaQueries.size > 0 ? this._groupToFragment(mediaQueries, 'media-queries', 'text') :
            UI.Fragment.Fragment.build `<div class="horizontally-padded">${i18nString(UIStrings.thereAreNoMediaQueries)}</div>`}
      </div>
    </div>`;
        this._resultsContainer.element.appendChild(this._fragment.element());
    }
    _createElementsView(evt) {
        const { type, nodes } = evt.data;
        let id = '';
        let tabTitle = '';
        switch (type) {
            case 'contrast': {
                const { section, key } = evt.data;
                id = `${section}-${key}`;
                tabTitle = i18nString(UIStrings.contrastIssues);
                break;
            }
            case 'color': {
                const { section, color } = evt.data;
                id = `${section}-${color}`;
                tabTitle = `${color.toUpperCase()} (${section})`;
                break;
            }
            case 'unused-declarations': {
                const { declaration } = evt.data;
                id = `${declaration}`;
                tabTitle = `${declaration}`;
                break;
            }
            case 'media-queries': {
                const { text } = evt.data;
                id = `${text}`;
                tabTitle = `${text}`;
                break;
            }
            case 'font-info': {
                const { name } = evt.data;
                id = `${name}`;
                tabTitle = `${name}`;
                break;
            }
        }
        let view = this._viewMap.get(id);
        if (!view) {
            view = new ElementDetailsView(this._controller, this._domModel, this._cssModel, this._linkifier);
            view.populateNodes(nodes);
            this._viewMap.set(id, view);
        }
        this._elementContainer.appendTab(id, tabTitle, view, true);
    }
    _fontInfoToFragment(fontInfo) {
        const fonts = Array.from(fontInfo.entries());
        return UI.Fragment.Fragment.build `
  ${fonts.map(([font, fontMetrics]) => {
            return UI.Fragment.Fragment.build `<section class="font-family"><h2>${font}</h2> ${this._fontMetricsToFragment(font, fontMetrics)}</section>`;
        })}
  `;
    }
    _fontMetricsToFragment(font, fontMetrics) {
        const fontMetricInfo = Array.from(fontMetrics.entries());
        return UI.Fragment.Fragment.build `
  <div class="font-metric">
  ${fontMetricInfo.map(([label, values]) => {
            const sanitizedPath = `${font}/${label}`;
            return UI.Fragment.Fragment.build `
  <div>
  <h3>${label}</h3>
  ${this._groupToFragment(values, 'font-info', 'value', sanitizedPath)}
  </div>`;
        })}
  </div>`;
    }
    _groupToFragment(items, type, dataLabel, path = '') {
        // Sort by number of items descending.
        const values = Array.from(items.entries()).sort((d1, d2) => {
            const v1Nodes = d1[1];
            const v2Nodes = d2[1];
            return v2Nodes.length - v1Nodes.length;
        });
        const total = values.reduce((prev, curr) => prev + curr[1].length, 0);
        return UI.Fragment.Fragment.build `<ul>
    ${values.map(([title, nodes]) => {
            const width = 100 * nodes.length / total;
            const itemLabel = i18nString(UIStrings.nOccurrences, { n: nodes.length });
            return UI.Fragment.Fragment.build `<li>
        <div class="title">${title}</div>
        <button data-type="${type}" data-path="${path}" data-${dataLabel}="${title}">
          <div class="details">${itemLabel}</div>
          <div class="bar-container">
            <div class="bar" style="width: ${width}%;"></div>
          </div>
        </button>
      </li>`;
        })}
    </ul>`;
    }
    _contrastIssuesToFragment(issues) {
        return UI.Fragment.Fragment.build `
  <h2>${i18nString(UIStrings.contrastIssuesS, {
            PH1: issues.size,
        })}</h2>
  <ul>
  ${[...issues.entries()].map(([key, value]) => this._contrastIssueToFragment(key, value))}
  </ul>
  `;
    }
    _contrastIssueToFragment(key, issues) {
        console.assert(issues.length > 0);
        let minContrastIssue = issues[0];
        for (const issue of issues) {
            // APCA contrast can be a negative value that is to be displayed. But the
            // absolute value is used to compare against the threshold. Therefore, the min
            // absolute value is the worst contrast.
            if (Math.abs(issue.contrastRatio) < Math.abs(minContrastIssue.contrastRatio)) {
                minContrastIssue = issue;
            }
        }
        const color = minContrastIssue.textColor.asString(Common.Color.Format.HEXA);
        const backgroundColor = minContrastIssue.backgroundColor.asString(Common.Color.Format.HEXA);
        const showAPCA = Root.Runtime.experiments.isEnabled('APCA');
        const blockFragment = UI.Fragment.Fragment.build `<li>
      <button
        title="${i18nString(UIStrings.textColorSOverSBackgroundResults, {
            PH1: color,
            PH2: backgroundColor,
            PH3: issues.length,
        })}"
        data-type="contrast" data-key="${key}" data-section="contrast" class="block" $="color">
        Text
      </button>
      <div class="block-title">
        <div class="contrast-warning hidden" $="aa"><span class="threshold-label">${i18nString(UIStrings.aa)}</span></div>
        <div class="contrast-warning hidden" $="aaa"><span class="threshold-label">${i18nString(UIStrings.aaa)}</span></div>
        <div class="contrast-warning hidden" $="apca"><span class="threshold-label">${i18nString(UIStrings.apca)}</span></div>
      </div>
    </li>`;
        if (showAPCA) {
            const apca = blockFragment.$('apca');
            if (minContrastIssue.thresholdsViolated.apca) {
                apca.appendChild(UI.Icon.Icon.create('smallicon-no'));
            }
            else {
                apca.appendChild(UI.Icon.Icon.create('smallicon-checkmark-square'));
            }
            apca.classList.remove('hidden');
        }
        else {
            const aa = blockFragment.$('aa');
            if (minContrastIssue.thresholdsViolated.aa) {
                aa.appendChild(UI.Icon.Icon.create('smallicon-no'));
            }
            else {
                aa.appendChild(UI.Icon.Icon.create('smallicon-checkmark-square'));
            }
            const aaa = blockFragment.$('aaa');
            if (minContrastIssue.thresholdsViolated.aaa) {
                aaa.appendChild(UI.Icon.Icon.create('smallicon-no'));
            }
            else {
                aaa.appendChild(UI.Icon.Icon.create('smallicon-checkmark-square'));
            }
            aa.classList.remove('hidden');
            aaa.classList.remove('hidden');
        }
        const block = blockFragment.$('color');
        block.style.backgroundColor = backgroundColor;
        block.style.color = color;
        block.style.border = getBorderString(minContrastIssue.backgroundColor);
        return blockFragment;
    }
    _colorsToFragment(section, color) {
        const blockFragment = UI.Fragment.Fragment.build `<li>
      <button data-type="color" data-color="${color}" data-section="${section}" class="block" $="color"></button>
      <div class="block-title">${color}</div>
    </li>`;
        const block = blockFragment.$('color');
        block.style.backgroundColor = color;
        const borderColor = Common.Color.Color.parse(color);
        if (!borderColor) {
            return;
        }
        block.style.border = getBorderString(borderColor);
        return blockFragment;
    }
    _sortColorsByLuminance(srcColors) {
        return Array.from(srcColors.keys()).sort((colA, colB) => {
            const colorA = Common.Color.Color.parse(colA);
            const colorB = Common.Color.Color.parse(colB);
            if (!colorA || !colorB) {
                return 0;
            }
            return Common.ColorUtils.luminance(colorB.rgba()) - Common.ColorUtils.luminance(colorA.rgba());
        });
    }
    setOverviewData(data) {
        this._render(data);
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static pushedNodes = new Set();
}
export class DetailsView extends UI.Widget.VBox {
    _tabbedPane;
    constructor() {
        super();
        this._tabbedPane = new UI.TabbedPane.TabbedPane();
        this._tabbedPane.show(this.element);
        this._tabbedPane.addEventListener(UI.TabbedPane.Events.TabClosed, () => {
            this.dispatchEventToListeners(UI.TabbedPane.Events.TabClosed, this._tabbedPane.tabIds().length);
        });
    }
    appendTab(id, tabTitle, view, isCloseable) {
        if (!this._tabbedPane.hasTab(id)) {
            this._tabbedPane.appendTab(id, tabTitle, view, undefined, undefined, isCloseable);
        }
        this._tabbedPane.selectTab(id);
    }
    closeTabs() {
        this._tabbedPane.closeTabs(this._tabbedPane.tabIds());
    }
}
export class ElementDetailsView extends UI.Widget.Widget {
    _controller;
    _domModel;
    _cssModel;
    _linkifier;
    _elementGridColumns;
    _elementGrid;
    constructor(controller, domModel, cssModel, linkifier) {
        super();
        this._controller = controller;
        this._domModel = domModel;
        this._cssModel = cssModel;
        this._linkifier = linkifier;
        this._elementGridColumns = [
            {
                id: 'nodeId',
                title: i18nString(UIStrings.element),
                sortable: true,
                weight: 50,
                titleDOMFragment: undefined,
                sort: undefined,
                align: undefined,
                width: undefined,
                fixedWidth: undefined,
                editable: undefined,
                nonSelectable: undefined,
                longText: undefined,
                disclosure: undefined,
                allowInSortByEvenWhenHidden: undefined,
                dataType: undefined,
                defaultWeight: undefined,
            },
            {
                id: 'declaration',
                title: i18nString(UIStrings.declaration),
                sortable: true,
                weight: 50,
                titleDOMFragment: undefined,
                sort: undefined,
                align: undefined,
                width: undefined,
                fixedWidth: undefined,
                editable: undefined,
                nonSelectable: undefined,
                longText: undefined,
                disclosure: undefined,
                allowInSortByEvenWhenHidden: undefined,
                dataType: undefined,
                defaultWeight: undefined,
            },
            {
                id: 'sourceURL',
                title: i18nString(UIStrings.source),
                sortable: false,
                weight: 100,
                titleDOMFragment: undefined,
                sort: undefined,
                align: undefined,
                width: undefined,
                fixedWidth: undefined,
                editable: undefined,
                nonSelectable: undefined,
                longText: undefined,
                disclosure: undefined,
                allowInSortByEvenWhenHidden: undefined,
                dataType: undefined,
                defaultWeight: undefined,
            },
            {
                id: 'contrastRatio',
                title: i18nString(UIStrings.contrastRatio),
                sortable: true,
                weight: 25,
                titleDOMFragment: undefined,
                sort: undefined,
                align: undefined,
                width: '150px',
                fixedWidth: true,
                editable: undefined,
                nonSelectable: undefined,
                longText: undefined,
                disclosure: undefined,
                allowInSortByEvenWhenHidden: undefined,
                dataType: undefined,
                defaultWeight: undefined,
            },
        ];
        this._elementGrid = new DataGrid.SortableDataGrid.SortableDataGrid({
            displayName: i18nString(UIStrings.cssOverviewElements),
            columns: this._elementGridColumns,
            editCallback: undefined,
            deleteCallback: undefined,
            refreshCallback: undefined,
        });
        this._elementGrid.element.classList.add('element-grid');
        this._elementGrid.element.addEventListener('mouseover', this._onMouseOver.bind(this));
        this._elementGrid.setStriped(true);
        this._elementGrid.addEventListener(DataGrid.DataGrid.Events.SortingChanged, this._sortMediaQueryDataGrid.bind(this));
        this.element.appendChild(this._elementGrid.element);
    }
    _sortMediaQueryDataGrid() {
        const sortColumnId = this._elementGrid.sortColumnId();
        if (!sortColumnId) {
            return;
        }
        const comparator = DataGrid.SortableDataGrid.SortableDataGrid.StringComparator.bind(null, sortColumnId);
        this._elementGrid.sortNodes(comparator, !this._elementGrid.isSortOrderAscending());
    }
    _onMouseOver(evt) {
        // Traverse the event path on the grid to find the nearest element with a backend node ID attached. Use
        // that for the highlighting.
        const node = evt.composedPath().find(el => el.dataset && el.dataset.backendNodeId);
        if (!node) {
            return;
        }
        const backendNodeId = Number(node.dataset.backendNodeId);
        this._controller.dispatchEventToListeners(Events.RequestNodeHighlight, backendNodeId);
    }
    async populateNodes(data) {
        this._elementGrid.rootNode().removeChildren();
        if (!data.length) {
            return;
        }
        const [firstItem] = data;
        const visibility = new Set();
        firstItem.nodeId && visibility.add('nodeId');
        firstItem.declaration && visibility.add('declaration');
        firstItem.sourceURL && visibility.add('sourceURL');
        firstItem.contrastRatio && visibility.add('contrastRatio');
        let relatedNodesMap;
        if (visibility.has('nodeId')) {
            // Grab the nodes from the frontend, but only those that have not been
            // retrieved already.
            const nodeIds = (data.reduce((prev, curr) => {
                if (CSSOverviewCompletedView.pushedNodes.has(curr.nodeId)) {
                    return prev;
                }
                CSSOverviewCompletedView.pushedNodes.add(curr.nodeId);
                return prev.add(curr.nodeId);
            }, new Set()));
            relatedNodesMap = await this._domModel.pushNodesByBackendIdsToFrontend(nodeIds);
        }
        for (const item of data) {
            if (visibility.has('nodeId')) {
                if (!relatedNodesMap) {
                    continue;
                }
                const frontendNode = relatedNodesMap.get(item.nodeId);
                if (!frontendNode) {
                    continue;
                }
                item.node = frontendNode;
            }
            const node = new ElementNode(item, this._linkifier, this._cssModel);
            node.selectable = false;
            this._elementGrid.insertChild(node);
        }
        this._elementGrid.setColumnsVisiblity(visibility);
        this._elementGrid.renderInline();
        this._elementGrid.wasShown();
    }
}
export class ElementNode extends DataGrid.SortableDataGrid.SortableDataGridNode {
    _linkifier;
    _cssModel;
    constructor(data, linkifier, cssModel) {
        super(data, data.hasChildren);
        this._linkifier = linkifier;
        this._cssModel = cssModel;
    }
    createCell(columnId) {
        // Nodes.
        if (columnId === 'nodeId') {
            const cell = this.createTD(columnId);
            cell.textContent = '...';
            Common.Linkifier.Linkifier.linkify(this.data.node).then(link => {
                cell.textContent = '';
                link.dataset.backendNodeId = this.data.node.backendNodeId();
                cell.appendChild(link);
                const button = document.createElement('button');
                button.classList.add('show-element');
                UI.Tooltip.Tooltip.install(button, i18nString(UIStrings.showElement));
                button.tabIndex = 0;
                button.onclick = () => this.data.node.scrollIntoView();
                cell.appendChild(button);
            });
            return cell;
        }
        // Links to CSS.
        if (columnId === 'sourceURL') {
            const cell = this.createTD(columnId);
            if (this.data.range) {
                const link = this._linkifyRuleLocation(this._cssModel, this._linkifier, this.data.styleSheetId, TextUtils.TextRange.TextRange.fromObject(this.data.range));
                if (!link || link.textContent === '') {
                    cell.textContent = '(unable to link)';
                }
                else {
                    cell.appendChild(link);
                }
            }
            else {
                cell.textContent = '(unable to link to inlined styles)';
            }
            return cell;
        }
        if (columnId === 'contrastRatio') {
            const cell = this.createTD(columnId);
            const showAPCA = Root.Runtime.experiments.isEnabled('APCA');
            const contrastRatio = Platform.NumberUtilities.floor(this.data.contrastRatio, 2);
            const contrastRatioString = showAPCA ? contrastRatio + '%' : contrastRatio;
            const border = getBorderString(this.data.backgroundColor);
            const color = this.data.textColor.asString();
            const backgroundColor = this.data.backgroundColor.asString();
            const contrastFragment = UI.Fragment.Fragment.build `
        <div class="contrast-container-in-grid" $="container">
          <span class="contrast-preview" style="border: ${border};
          color: ${color};
          background-color: ${backgroundColor};">Aa</span>
          <span>${contrastRatioString}</span>
        </div>
      `;
            const container = contrastFragment.$('container');
            if (showAPCA) {
                container.append(UI.Fragment.Fragment.build `<span>${i18nString(UIStrings.apca)}</span>`.element());
                if (this.data.thresholdsViolated.apca) {
                    container.appendChild(UI.Icon.Icon.create('smallicon-no'));
                }
                else {
                    container.appendChild(UI.Icon.Icon.create('smallicon-checkmark-square'));
                }
            }
            else {
                container.append(UI.Fragment.Fragment.build `<span>${i18nString(UIStrings.aa)}</span>`.element());
                if (this.data.thresholdsViolated.aa) {
                    container.appendChild(UI.Icon.Icon.create('smallicon-no'));
                }
                else {
                    container.appendChild(UI.Icon.Icon.create('smallicon-checkmark-square'));
                }
                container.append(UI.Fragment.Fragment.build `<span>${i18nString(UIStrings.aaa)}</span>`.element());
                if (this.data.thresholdsViolated.aaa) {
                    container.appendChild(UI.Icon.Icon.create('smallicon-no'));
                }
                else {
                    container.appendChild(UI.Icon.Icon.create('smallicon-checkmark-square'));
                }
            }
            cell.appendChild(contrastFragment.element());
            return cell;
        }
        return super.createCell(columnId);
    }
    _linkifyRuleLocation(cssModel, linkifier, styleSheetId, ruleLocation) {
        const styleSheetHeader = cssModel.styleSheetHeaderForId(styleSheetId);
        if (!styleSheetHeader) {
            return;
        }
        const lineNumber = styleSheetHeader.lineNumberInSource(ruleLocation.startLine);
        const columnNumber = styleSheetHeader.columnNumberInSource(ruleLocation.startLine, ruleLocation.startColumn);
        const matchingSelectorLocation = new SDK.CSSModel.CSSLocation(styleSheetHeader, lineNumber, columnNumber);
        return linkifier.linkifyCSSLocation(matchingSelectorLocation);
    }
}
//# sourceMappingURL=CSSOverviewCompletedView.js.map