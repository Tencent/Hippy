// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { SplitWidget } from './SplitWidget.js';
import { VBox } from './Widget.js';
export class Panel extends VBox {
    _panelName;
    constructor(name) {
        super();
        this.element.classList.add('panel');
        this.element.setAttribute('aria-label', name);
        this.element.classList.add(name);
        this._panelName = name;
        // @ts-ignore: Legacy global. Requires rewriting tests to get rid of.
        // For testing.
        UI.panels[name] = this;
    }
    get name() {
        return this._panelName;
    }
    searchableView() {
        return null;
    }
    elementsToRestoreScrollPositionsFor() {
        return [];
    }
}
export class PanelWithSidebar extends Panel {
    _panelSplitWidget;
    _mainWidget;
    _sidebarWidget;
    constructor(name, defaultWidth) {
        super(name);
        this._panelSplitWidget = new SplitWidget(true, false, this._panelName + 'PanelSplitViewState', defaultWidth || 200);
        this._panelSplitWidget.show(this.element);
        this._mainWidget = new VBox();
        this._panelSplitWidget.setMainWidget(this._mainWidget);
        this._sidebarWidget = new VBox();
        this._sidebarWidget.setMinimumSize(100, 25);
        this._panelSplitWidget.setSidebarWidget(this._sidebarWidget);
        this._sidebarWidget.element.classList.add('panel-sidebar');
    }
    panelSidebarElement() {
        return this._sidebarWidget.element;
    }
    mainElement() {
        return this._mainWidget.element;
    }
    splitWidget() {
        return this._panelSplitWidget;
    }
}
//# sourceMappingURL=Panel.js.map