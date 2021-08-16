// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description aria label for javascript VM instances target list in heap profiler
    */
    javascriptVmInstances: 'JavaScript VM instances',
    /**
    *@description Text in Isolate Selector of a profiler tool
    */
    totalJsHeapSize: 'Total JS heap size',
    /**
    *@description Total trend div title in Isolate Selector of a profiler tool
    *@example {3} PH1
    */
    totalPageJsHeapSizeChangeTrend: 'Total page JS heap size change trend over the last {PH1} minutes.',
    /**
    *@description Total value div title in Isolate Selector of a profiler tool
    */
    totalPageJsHeapSizeAcrossAllVm: 'Total page JS heap size across all VM instances.',
    /**
    *@description Heap size change trend measured in kB/s
    *@example {2 kB} PH1
    */
    changeRate: '{PH1}/s',
    /**
    *@description Text for isolate selector list items with positive change rate
    *@example {1.0 kB} PH1
    */
    increasingBySPerSecond: 'increasing by {PH1} per second',
    /**
    *@description Text for isolate selector list items with negative change rate
    *@example {1.0 kB} PH1
    */
    decreasingBySPerSecond: 'decreasing by {PH1} per second',
    /**
    *@description Heap div title in Isolate Selector of a profiler tool
    */
    heapSizeInUseByLiveJsObjects: 'Heap size in use by live JS objects.',
    /**
    *@description Trend div title in Isolate Selector of a profiler tool
    *@example {3} PH1
    */
    heapSizeChangeTrendOverTheLastS: 'Heap size change trend over the last {PH1} minutes.',
    /**
    *@description Text to show an item is empty
    */
    empty: '(empty)',
};
const str_ = i18n.i18n.registerUIStrings('panels/profiler/IsolateSelector.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class IsolateSelector extends UI.Widget.VBox {
    _items;
    _list;
    _itemByIsolate;
    _totalElement;
    _totalValueDiv;
    _totalTrendDiv;
    constructor() {
        super(false);
        this._items = new UI.ListModel.ListModel();
        this._list = new UI.ListControl.ListControl(this._items, this, UI.ListControl.ListMode.NonViewport);
        this._list.element.classList.add('javascript-vm-instances-list');
        UI.ARIAUtils.setAccessibleName(this._list.element, i18nString(UIStrings.javascriptVmInstances));
        this.contentElement.appendChild(this._list.element);
        this._itemByIsolate = new Map();
        this._totalElement = document.createElement('div');
        this._totalElement.classList.add('profile-memory-usage-item');
        this._totalElement.classList.add('hbox');
        this._totalValueDiv = this._totalElement.createChild('div', 'profile-memory-usage-item-size');
        this._totalTrendDiv = this._totalElement.createChild('div', 'profile-memory-usage-item-trend');
        this._totalElement.createChild('div').textContent = i18nString(UIStrings.totalJsHeapSize);
        const trendIntervalMinutes = Math.round(SDK.IsolateManager.MemoryTrendWindowMs / 60e3);
        UI.Tooltip.Tooltip.install(this._totalTrendDiv, i18nString(UIStrings.totalPageJsHeapSizeChangeTrend, { PH1: trendIntervalMinutes }));
        UI.Tooltip.Tooltip.install(this._totalValueDiv, i18nString(UIStrings.totalPageJsHeapSizeAcrossAllVm));
        SDK.IsolateManager.IsolateManager.instance().observeIsolates(this);
        SDK.TargetManager.TargetManager.instance().addEventListener(SDK.TargetManager.Events.NameChanged, this._targetChanged, this);
        SDK.TargetManager.TargetManager.instance().addEventListener(SDK.TargetManager.Events.InspectedURLChanged, this._targetChanged, this);
    }
    wasShown() {
        SDK.IsolateManager.IsolateManager.instance().addEventListener(SDK.IsolateManager.Events.MemoryChanged, this._heapStatsChanged, this);
    }
    willHide() {
        SDK.IsolateManager.IsolateManager.instance().removeEventListener(SDK.IsolateManager.Events.MemoryChanged, this._heapStatsChanged, this);
    }
    isolateAdded(isolate) {
        this._list.element.tabIndex = 0;
        const item = new ListItem(isolate);
        const index = item.model().target() ===
            SDK.TargetManager.TargetManager.instance().mainTarget() ?
            0 :
            this._items.length;
        this._items.insert(index, item);
        this._itemByIsolate.set(isolate, item);
        if (this._items.length === 1 || isolate.isMainThread()) {
            this._list.selectItem(item);
        }
        this._update();
    }
    isolateChanged(isolate) {
        const item = this._itemByIsolate.get(isolate);
        if (item) {
            item.updateTitle();
        }
        this._update();
    }
    isolateRemoved(isolate) {
        const item = this._itemByIsolate.get(isolate);
        if (item) {
            this._items.remove(this._items.indexOf(item));
        }
        this._itemByIsolate.delete(isolate);
        if (this._items.length === 0) {
            this._list.element.tabIndex = -1;
        }
        this._update();
    }
    _targetChanged(event) {
        const target = event.data;
        const model = target.model(SDK.RuntimeModel.RuntimeModel);
        if (!model) {
            return;
        }
        const isolate = SDK.IsolateManager.IsolateManager.instance().isolateByModel(model);
        const item = isolate && this._itemByIsolate.get(isolate);
        if (item) {
            item.updateTitle();
        }
    }
    _heapStatsChanged(event) {
        const isolate = event.data;
        const listItem = this._itemByIsolate.get(isolate);
        if (listItem) {
            listItem.updateStats();
        }
        this._updateTotal();
    }
    _updateTotal() {
        let total = 0;
        let trend = 0;
        for (const isolate of SDK.IsolateManager.IsolateManager.instance().isolates()) {
            total += isolate.usedHeapSize();
            trend += isolate.usedHeapSizeGrowRate();
        }
        this._totalValueDiv.textContent = Platform.NumberUtilities.bytesToString(total);
        IsolateSelector._formatTrendElement(trend, this._totalTrendDiv);
    }
    static _formatTrendElement(trendValueMs, element) {
        const changeRateBytesPerSecond = trendValueMs * 1e3;
        const changeRateThresholdBytesPerSecond = 1000;
        if (Math.abs(changeRateBytesPerSecond) < changeRateThresholdBytesPerSecond) {
            return;
        }
        const changeRateText = Platform.NumberUtilities.bytesToString(Math.abs(changeRateBytesPerSecond));
        let changeText, changeLabel;
        if (changeRateBytesPerSecond > 0) {
            changeText = '\u2B06' + i18nString(UIStrings.changeRate, { PH1: changeRateText });
            element.classList.toggle('increasing', true);
            changeLabel = i18nString(UIStrings.increasingBySPerSecond, { PH1: changeRateText });
        }
        else {
            changeText = '\u2B07' + i18nString(UIStrings.changeRate, { PH1: changeRateText });
            element.classList.toggle('increasing', false);
            changeLabel = i18nString(UIStrings.decreasingBySPerSecond, { PH1: changeRateText });
        }
        element.textContent = changeText;
        UI.ARIAUtils.setAccessibleName(element, changeLabel);
    }
    totalMemoryElement() {
        return this._totalElement;
    }
    createElementForItem(item) {
        return item.element;
    }
    heightForItem(_item) {
        console.assert(false, 'should not be called');
        return 0;
    }
    updateSelectedItemARIA(_fromElement, _toElement) {
        return false;
    }
    isItemSelectable(_item) {
        return true;
    }
    selectedItemChanged(_from, to, fromElement, toElement) {
        if (fromElement) {
            fromElement.classList.remove('selected');
        }
        if (toElement) {
            toElement.classList.add('selected');
        }
        const model = to && to.model();
        UI.Context.Context.instance().setFlavor(SDK.HeapProfilerModel.HeapProfilerModel, model && model.heapProfilerModel());
        UI.Context.Context.instance().setFlavor(SDK.CPUProfilerModel.CPUProfilerModel, model && model.target().model(SDK.CPUProfilerModel.CPUProfilerModel));
    }
    _update() {
        this._updateTotal();
        this._list.invalidateRange(0, this._items.length);
    }
}
export class ListItem {
    _isolate;
    element;
    _heapDiv;
    _trendDiv;
    _nameDiv;
    constructor(isolate) {
        this._isolate = isolate;
        const trendIntervalMinutes = Math.round(SDK.IsolateManager.MemoryTrendWindowMs / 60e3);
        this.element = document.createElement('div');
        this.element.classList.add('profile-memory-usage-item');
        this.element.classList.add('hbox');
        UI.ARIAUtils.markAsOption(this.element);
        this._heapDiv = this.element.createChild('div', 'profile-memory-usage-item-size');
        UI.Tooltip.Tooltip.install(this._heapDiv, i18nString(UIStrings.heapSizeInUseByLiveJsObjects));
        this._trendDiv = this.element.createChild('div', 'profile-memory-usage-item-trend');
        UI.Tooltip.Tooltip.install(this._trendDiv, i18nString(UIStrings.heapSizeChangeTrendOverTheLastS, { PH1: trendIntervalMinutes }));
        this._nameDiv = this.element.createChild('div', 'profile-memory-usage-item-name');
        this.updateTitle();
    }
    model() {
        return this._isolate.runtimeModel();
    }
    updateStats() {
        this._heapDiv.textContent = Platform.NumberUtilities.bytesToString(this._isolate.usedHeapSize());
        IsolateSelector._formatTrendElement(this._isolate.usedHeapSizeGrowRate(), this._trendDiv);
    }
    updateTitle() {
        const modelCountByName = new Map();
        for (const model of this._isolate.models()) {
            const target = model.target();
            const name = SDK.TargetManager.TargetManager.instance().mainTarget() !== target ? target.name() : '';
            const parsedURL = new Common.ParsedURL.ParsedURL(target.inspectedURL());
            const domain = parsedURL.isValid ? parsedURL.domain() : '';
            const title = target.decorateLabel(domain && name ? `${domain}: ${name}` : name || domain || i18nString(UIStrings.empty));
            modelCountByName.set(title, (modelCountByName.get(title) || 0) + 1);
        }
        this._nameDiv.removeChildren();
        const titles = [];
        for (const [name, count] of modelCountByName) {
            const title = count > 1 ? `${name} (${count})` : name;
            titles.push(title);
            const titleDiv = this._nameDiv.createChild('div');
            titleDiv.textContent = title;
            UI.Tooltip.Tooltip.install(titleDiv, String(title));
        }
    }
}
//# sourceMappingURL=IsolateSelector.js.map