// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text for timestamps of items
    */
    timestamp: 'Timestamp',
    /**
    *@description The column header for event names.
    */
    eventName: 'Event name',
    /**
    *@description Text for the value of something
    */
    value: 'Value',
    /**
    *@description The accessible name of a table that displays information about events that occurred
    * while a video/media player was present on the page.
    */
    eventDisplay: 'Event display',
};
const str_ = i18n.i18n.registerUIStrings('panels/media/EventDisplayTable.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class EventNode extends DataGrid.DataGrid.DataGridNode {
    _expandableElement;
    constructor(event) {
        super(event, false);
        this._expandableElement = null;
    }
    createCell(columnId) {
        const cell = this.createTD(columnId);
        const cellData = this.data[columnId];
        if (columnId === "value" /* Value */) {
            const enclosed = cell.createChild('div', 'event-display-table-contents-json-wrapper');
            this._expandableElement =
                new SourceFrame.JSONView.JSONView(new SourceFrame.JSONView.ParsedJSON(cellData, '', ''), true);
            this._expandableElement.markAsRoot();
            this._expandableElement.show(enclosed);
        }
        else {
            cell.classList.add('event-display-table-basic-text-table-entry');
            UI.UIUtils.createTextChild(cell, cellData);
        }
        return cell;
    }
}
export class PlayerEventsView extends UI.Widget.VBox {
    _dataGrid;
    _firstEventTime;
    constructor() {
        super();
        // Set up element styles.
        this.registerRequiredCSS('panels/media/eventDisplayTable.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('event-display-table-contents-table-container');
        this._dataGrid = this._createDataGrid([
            {
                id: "displayTimestamp" /* Timestamp */,
                title: i18nString(UIStrings.timestamp),
                weight: 1,
                sortable: false,
            },
            { id: "event" /* Event */, title: i18nString(UIStrings.eventName), weight: 2, sortable: false },
            {
                id: "value" /* Value */,
                title: i18nString(UIStrings.value),
                weight: 7,
                sortable: false,
            },
        ]);
        this._firstEventTime = 0;
        this._dataGrid.setStriped(true);
        this._dataGrid.asWidget().show(this.contentElement);
    }
    _createDataGrid(headers) {
        const gridColumnDescs = [];
        for (const headerDesc of headers) {
            gridColumnDescs.push(PlayerEventsView._convertToGridDescriptor(headerDesc));
        }
        // TODO(tmathmeyer) SortableDataGrid doesn't play nice with nested JSON
        // renderers, since they can change size, and this breaks the visible
        // element computation in ViewportDataGrid.
        const datagrid = new DataGrid.DataGrid.DataGridImpl({
            displayName: i18nString(UIStrings.eventDisplay),
            columns: gridColumnDescs,
            deleteCallback: undefined,
            editCallback: undefined,
            refreshCallback: undefined,
        });
        datagrid.asWidget().contentElement.classList.add('no-border-top-datagrid');
        return datagrid;
    }
    onEvent(event) {
        if (this._firstEventTime === 0 && typeof event.timestamp === 'number') {
            this._firstEventTime = event.timestamp;
        }
        event = this._subtractFirstEventTime(event);
        const stringified = event.value;
        try {
            const json = JSON.parse(stringified);
            event.event = json.event;
            delete json['event'];
            event.value = json;
            const node = new EventNode(event);
            const scroll = this._dataGrid.scrollContainer;
            const isAtBottom = scroll.scrollTop === (scroll.scrollHeight - scroll.offsetHeight);
            this._dataGrid.rootNode().appendChild(node);
            if (isAtBottom) {
                scroll.scrollTop = scroll.scrollHeight;
            }
        }
        catch (e) {
            // If this is a legacy message event, ignore it for now until they
            // are handled.
        }
    }
    _subtractFirstEventTime(event) {
        if (typeof event.timestamp === 'number') {
            event.displayTimestamp = (event.timestamp - this._firstEventTime).toFixed(3);
        }
        return event;
    }
    static _convertToGridDescriptor(columnConfig) {
        return {
            id: columnConfig.id,
            title: columnConfig.title,
            sortable: columnConfig.sortable,
            weight: columnConfig.weight || 0,
            sort: DataGrid.DataGrid.Order.Ascending,
        };
    }
}
//# sourceMappingURL=EventDisplayTable.js.map