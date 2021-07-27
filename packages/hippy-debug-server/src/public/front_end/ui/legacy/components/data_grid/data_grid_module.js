import*as RootModule from'../../../../core/root/root.js';RootModule.Runtime.cachedResources.set("ui/legacy/components/data_grid/dataGrid.css",".data-grid {\n  position: relative;\n  border: 1px solid var(--color-details-hairline-light) !important; /* stylelint-disable-line declaration-no-important */\n  /* See: crbug.com/1152736 for color variable migration. */\n  line-height: 120%;\n}\n\n.data-grid table {\n  table-layout: fixed;\n  border-spacing: 0;\n  border-collapse: separate;\n  height: 100%;\n  width: 100%;\n}\n\n.data-grid .header-container,\n.data-grid .data-container {\n  position: absolute;\n  left: 0;\n  right: 0;\n  overflow-x: hidden;\n}\n\n.data-grid .header-container {\n  top: 0;\n  height: 21px;\n}\n\n.data-grid .data-container {\n  top: 21px;\n  bottom: 0;\n  overflow-y: overlay;\n  transform: translateZ(0);\n}\n\n.data-grid .aria-live-label {\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n}\n\n.data-grid.inline .header-container,\n.data-grid.inline .data-container {\n  position: static;\n}\n\n.data-grid .corner {\n  width: 14px;\n  padding-right: 0;\n  padding-left: 0;\n  border-left: 0 none transparent !important; /* stylelint-disable-line declaration-no-important */\n}\n\n.data-grid.inline .corner {\n  display: none;\n}\n\n.platform-mac .data-grid .corner,\n.data-grid.data-grid-fits-viewport .corner {\n  display: none;\n}\n\n.data-grid .top-filler-td,\n.data-grid .bottom-filler-td {\n  height: auto !important; /* stylelint-disable-line declaration-no-important */\n  padding: 0 !important; /* stylelint-disable-line declaration-no-important */\n}\n\n.data-grid table.data {\n  position: absolute;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  border-top: 0 none transparent;\n  table-layout: fixed;\n}\n\n.data-grid.inline table.data {\n  position: static;\n}\n\n.data-grid table.data tr {\n  display: none;\n  height: 20px;\n}\n\n.data-grid table.data tr.revealed {\n  display: table-row;\n}\n\n.striped-data-grid .revealed.data-grid-data-grid-node:nth-child(odd):not(.dirty):not(.selected),\n.striped-data-grid-starts-with-odd .revealed.data-grid-data-grid-node:nth-child(even):not(.dirty):not(.selected) {\n  background-color: var(--color-background-elevation-1);\n}\n\n.data-grid td,\n.data-grid th {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  line-height: 18px;\n  height: 18px;\n  border-left: 1px solid var(--color-details-hairline);\n  padding: 1px 4px;\n}\n\n.data-grid td {\n  vertical-align: top;\n  user-select: text;\n}\n\n.data-grid th {\n  text-align: left;\n  background-color: var(--color-background-elevation-1);\n  border-bottom: 1px solid var(--color-details-hairline);\n  font-weight: normal;\n  vertical-align: middle;\n}\n\n.data-grid th:first-child,\n.data-grid td:first-child {\n  border-left: none !important; /* stylelint-disable-line declaration-no-important */\n}\n\n.data-grid td > div,\n.data-grid th > div {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  min-width: 8px;\n}\n\n.data-grid td.editing > div {\n  text-overflow: clip;\n}\n\n.data-grid .center {\n  text-align: center;\n}\n\n.data-grid .right {\n  text-align: right;\n}\n\n.data-grid th.sortable {\n  position: relative;\n}\n\n.data-grid th .sort-order-icon-container {\n  position: absolute;\n  top: 1px;\n  right: 0;\n  bottom: 1px;\n  display: flex;\n  align-items: center;\n}\n\n.data-grid th .sort-order-icon {\n  margin-right: 4px;\n  margin-bottom: -2px;\n  display: none;\n}\n\n.data-grid th.sort-ascending .sort-order-icon,\n.data-grid th.sort-descending .sort-order-icon {\n  display: block;\n}\n\n.data-grid th.sortable:hover {\n  background-color: var(--color-background-elevation-2);\n}\n\n.data-grid .top-filler-td {\n  border-bottom: 0 none transparent;\n  line-height: 0;\n}\n\n.data-grid button {\n  line-height: 18px;\n  color: inherit;\n}\n\n.data-grid td.disclosure::before {\n  user-select: none;\n  -webkit-mask-image: var(--image-file-treeoutlineTriangles);\n  -webkit-mask-position: 0 0;\n  -webkit-mask-size: 32px 24px;\n  float: left;\n  width: 8px;\n  height: 12px;\n  margin-right: 2px;\n  content: \"\";\n  position: relative;\n  top: 3px;\n  background-color: var(--color-text-secondary);\n}\n\n.data-grid tr:not(.parent) td.disclosure::before {\n  background-color: transparent;\n}\n\n.data-grid tr.expanded td.disclosure::before {\n  -webkit-mask-position: -16px 0;\n}\n\n.data-grid table.data tr.revealed.selected {\n  background-color: var(--color-background-highlight);\n  color: inherit;\n}\n\n.data-grid table.data tr.revealed.selected.dirty {\n  color: var(--legacy-selection-fg-color);\n}\n\n.data-grid.no-selection:focus-visible {\n  border: 1px solid var(--legacy-accent-color) !important; /* stylelint-disable-line declaration-no-important */\n}\n\n.data-grid:focus table.data tr.selected {\n  background-color: var(--legacy-selection-bg-color);\n  color: var(--legacy-selection-fg-color);\n}\n\n.data-grid:focus tr.selected.dirty {\n  --override-data-grid-dirty-background-color: hsl(0deg 100% 70%);\n}\n\n.data-grid table.data tr.selected.dirty {\n  --override-data-grid-dirty-background-color: hsl(0deg 100% 30%);\n\n  background-color: var(--override-data-grid-dirty-background-color);\n}\n\n.data-grid:focus tr.selected .devtools-link {\n  color: var(--legacy-selection-fg-color);\n}\n\n.data-grid:focus tr.parent.selected td.disclosure::before {\n  background-color: var(--legacy-selection-fg-color);\n  -webkit-mask-position: 0 0;\n}\n\n.data-grid:focus tr.expanded.selected td.disclosure::before {\n  background-color: var(--legacy-selection-fg-color);\n  -webkit-mask-position: -16px 0;\n}\n\n.data-grid tr.inactive {\n  color: var(--color-text-disabled);\n  font-style: italic;\n}\n\n.data-grid tr.dirty {\n  --override-data-grid-dirty-background-color: hsl(0deg 100% 92%);\n\n  background-color: var(--override-data-grid-dirty-background-color);\n  color: var(--color-red);\n  font-style: normal;\n}\n\n.data-grid td.show-more {\n  white-space: normal;\n}\n\n.data-grid td.show-more::before {\n  display: none;\n}\n\n.data-grid-resizer {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  width: 5px;\n  z-index: 500;\n}\n\n@media (forced-colors: active) {\n  .sort-order-icon-container [is=ui-icon].icon-mask,\n  .data-grid td.disclosure::before {\n    forced-color-adjust: none;\n    background-color: ButtonText;\n  }\n\n  .data-grid.no-selection:focus-visible * {\n    color: ButtonText;\n  }\n\n  .data-grid th.sortable:hover *,\n  .data-grid th.sortable:hover .sort-order-icon-container [is=ui-icon].icon-mask,\n  .data-grid tr.parent.selected td.disclosure::before,\n  .data-grid:focus tr.parent.selected td.disclosure::before,\n  .data-grid table.data tr.parent.revealed:hover td.disclosure::before {\n    background-color: HighlightText;\n  }\n\n  .striped-data-grid .revealed.data-grid-data-grid-node:nth-child(odd),\n  .striped-data-grid-starts-with-odd .revealed.data-grid-data-grid-node:nth-child(even),\n  .request-cookies-view tr.revealed.data-grid-data-grid-node.flagged-cookie-attribute-row:not(.selected):nth-child(2n),\n  .cookies-table tr.revealed.data-grid-data-grid-node.flagged-cookie-attribute-row:not(.selected):nth-child(odd) {\n    background-color: canvas;\n  }\n\n  .data-grid.no-selection:focus-visible {\n    forced-color-adjust: none;\n    border-color: Highlight;\n  }\n\n  .data-grid th.sortable:hover,\n  .data-grid table.data tr.revealed:hover,\n  .data-grid table.data tr.revealed.selected,\n  .striped-data-grid .revealed:hover.data-grid-data-grid-node:nth-child(odd),\n  .striped-data-grid-starts-with-odd .revealed:hover.data-grid-data-grid-node:nth-child(even),\n  .request-cookies-view tr.revealed:hover.data-grid-data-grid-node.flagged-cookie-attribute-row:not(.selected):nth-child(2n),\n  .cookies-table tr.revealed:hover.data-grid-data-grid-node.flagged-cookie-attribute-row:not(.selected):nth-child(odd) {\n    forced-color-adjust: none;\n    background-color: Highlight;\n  }\n\n  .data-grid table.data tr.revealed:hover *,\n  .data-grid table.data tr.revealed.selected *,\n  .data-grid table.data tr.revealed:focus *,\n  .data-grid table.data tr.revealed:hover .heap-object-tag {\n    color: HighlightText;\n  }\n\n  .data-grid th {\n    background-color: canvas;\n    border-color: Highlight;\n  }\n}\n\n/*# sourceURL=ui/legacy/components/data_grid/dataGrid.css */");