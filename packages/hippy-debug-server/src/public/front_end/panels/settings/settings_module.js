import*as RootModule from'../../core/root/root.js';RootModule.Runtime.cachedResources.set("panels/settings/frameworkIgnoreListSettingsTab.css","/*\n * Copyright 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n:host {\n  overflow: hidden;\n}\n\n.header {\n  padding: 0 0 6px;\n  border-bottom: var(--legacy-divider-border);\n  font-size: 18px;\n  font-weight: normal;\n  flex: none;\n}\n\n.intro {\n  margin-top: 10px;\n}\n\n.ignore-list-content-scripts {\n  margin-top: 10px;\n  flex: none;\n}\n\n.add-button {\n  margin: 10px 2px;\n  align-self: flex-start;\n  flex: none;\n}\n\n.ignore-list {\n  margin-top: 10px;\n  max-width: 500px;\n  flex: 0 1 auto;\n  min-height: 30px;\n}\n\n.ignore-list-empty {\n  flex: auto;\n  height: 30px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.ignore-list-item {\n  padding: 3px 5px 3px 5px;\n  height: 30px;\n  display: flex;\n  align-items: center;\n  position: relative;\n  flex: auto 1 1;\n}\n\n.ignore-list-pattern {\n  flex: auto;\n  min-width: 100px;\n}\n\n.ignore-list-item .ignore-list-pattern {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  user-select: none;\n  color: var(--color-text-primary);\n  overflow: hidden;\n}\n\n.ignore-list-item.ignore-list-disabled .ignore-list-pattern {\n  text-decoration: line-through;\n}\n\n.ignore-list-behavior {\n  flex: 0 0 100px;\n  padding-left: 10px;\n}\n\n.ignore-list-behavior > select {\n  margin-left: -10px;\n}\n\n.ignore-list-separator {\n  flex: 0 0 1px;\n  background-color: var(--color-details-hairline);\n  height: 30px;\n  margin: 0 4px;\n}\n\n.ignore-list-separator-invisible {\n  visibility: hidden;\n  height: 100% !important; /* stylelint-disable-line declaration-no-important */\n}\n\n.ignore-list-edit-row {\n  flex: none;\n  display: flex;\n  flex-direction: row;\n  margin: 6px 5px;\n  align-items: center;\n}\n\n.ignore-list-edit-row input,\n.ignore-list-edit-row select {\n  width: 100%;\n  text-align: inherit;\n}\n\n/*# sourceURL=panels/settings/frameworkIgnoreListSettingsTab.css */");RootModule.Runtime.cachedResources.set("panels/settings/settingsScreen.css","/*\n * Copyright (c) 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.settings-window-main {\n  color: var(--color-text-primary);\n  background-color: var(--color-background);\n  padding: 11px 0 0 0;\n}\n\n.settings-content {\n  overflow-y: auto;\n  overflow-x: hidden;\n  margin: 8px 8px 8px 0;\n  padding: 0 4px;\n  flex: auto;\n}\n\n.settings-container {\n  width: 100%;\n  column-width: 288px;\n}\n\n.settings-block {\n  display: block;\n  padding-bottom: 9px;\n  width: 288px;\n  break-inside: avoid;\n}\n\n.settings-tab.settings-container {\n  column-width: 308px;\n}\n\n.settings-tab .settings-block {\n  margin-left: 20px;\n}\n\n.settings-line {\n  padding-bottom: 5px;\n  margin-bottom: 5px;\n}\n\n.settings-key-cell {\n  display: inline-block;\n  width: 153px;\n  white-space: nowrap;\n  text-align: right;\n  vertical-align: middle;\n  padding-right: 6px;\n}\n\n.settings-cell {\n  display: inline-block;\n  width: 135px;\n  vertical-align: middle;\n}\n\n.settings-section-title {\n  font-size: 120%;\n  text-align: left;\n}\n\n.settings-combine-keys {\n  margin: 0 0.3em;\n  font-size: 9px;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n  border: none;\n}\n\n.settings-tab label {\n  padding-right: 4px;\n  display: inline-flex;\n  flex-shrink: 0;\n}\n\n.settings-tab p {\n  margin: 12px 0;\n}\n\n.settings-block p p {\n  padding-left: 30px;\n}\n\n.settings-experiments-warning-subsection-warning {\n  color: var(--color-accent-red);\n}\n\n.settings-experiments-warning-subsection-message {\n  color: inherit;\n}\n\n.settings-content input[type=checkbox] {\n  margin: 1px 7px 1px 2px;\n}\n\n.settings-window-title {\n  font-size: 18px;\n  color: var(--color-text-primary);\n  padding: 0 0 5px 13px;\n}\n\n.settings-container-wrapper {\n  position: absolute;\n  top: 31px;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  overflow: auto;\n  padding-top: 9px;\n  border-top: 1px solid var(--color-details-hairline);\n}\n\n.settings-tab.settings-content {\n  margin: 0;\n  padding: 0;\n}\n\n.settings-tab-container {\n  flex: auto;\n  overflow: hidden;\n}\n\n.settings-tab-container header {\n  padding: 0 0 6px;\n}\n\n#experiments-tab-content .settings-container {\n  column-width: 470px;\n}\n\n#experiments-tab-content .settings-block {\n  width: 470px;\n  margin-left: 0;\n}\n\n.settings-tab-container header > h1 {\n  font-size: 18px;\n  font-weight: normal;\n  margin: 0;\n  padding-bottom: 3px;\n  white-space: nowrap;\n}\n\n.settings-tab .settings-section-title {\n  margin-left: -20px;\n  color: var(--color-text-secondary);\n}\n\n.settings-tab .settings-block label:hover {\n  color: var(--color-text-secondary);\n}\n\n.settings-tab .settings-block fieldset:disabled label:hover {\n  color: inherit;\n}\n\n.settings-tab select {\n  margin-left: 10px;\n}\n\n.settings-experiment-unstable {\n  display: block;\n  color: var(--color-text-secondary);\n}\n\n/*# sourceURL=panels/settings/settingsScreen.css */");RootModule.Runtime.cachedResources.set("panels/settings/keybindsSettingsTab.css","/*\n * Copyright 2020 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\nheader {\n  padding: 0 0 6px;\n  border-bottom: 1px solid var(--color-details-hairline);\n  flex: none;\n  margin-bottom: 25px;\n}\n\nh1 {\n  font-size: 18px;\n  font-weight: normal;\n  padding-bottom: 3px;\n  margin: 0;\n}\n\n[role=\"list\"],\n.widget.vbox {\n  min-width: 300px;\n}\n\n.keybinds-key {\n  padding: 0.1em 0.6em;\n  border: 1px solid var(--color-details-hairline);\n  font-size: 11px;\n  background-color: var(--color-background-elevation-1);\n  color: var(--color-text-primary);\n  box-shadow: var(--box-shadow-outline-color);\n  border-radius: 3px;\n  display: inline-block;\n  margin: 0 0.1em;\n  text-shadow: 0 1px 0 var(--color-background);\n  line-height: 1.5;\n  white-space: nowrap;\n}\n\n.keybinds-list-item {\n  min-height: 30px;\n  display: grid;\n  grid-template-rows: repeat(auto-fit, 30px);\n  grid-template-columns: 1fr 30px 1fr 30px 30px;\n  flex: auto 1 1;\n}\n\n.keybinds-list-item:focus-visible {\n  background-color: var(--legacy-focus-bg-color);\n}\n\n.keybinds-list-item:not(.keybinds-category-header) {\n  padding-left: 20px;\n}\n\n.keybinds-list-item.keybinds-editing {\n  background-color: var(--color-background-elevation-2);\n}\n\n.keybinds-action-name {\n  grid-row: 1 / span 1;\n  grid-column: 1 / span 1;\n}\n\n.keybinds-shortcut,\n.keybinds-info {\n  grid-row: auto;\n  grid-column: 3 / span 1;\n}\n\n.keybinds-info .devtools-link {\n  padding-top: 6px;\n}\n\n.keybinds-error {\n  color: var(--color-accent-red);\n}\n\n.keybinds-list-item.keybinds-editing .keybinds-shortcut {\n  display: flex;\n}\n\n.keybinds-modified {\n  grid-column: 2 / span 1;\n}\n\n.keybinds-list-item button {\n  border: none;\n  padding: 0;\n  background: transparent;\n}\n\n.keybinds-list-item button:hover .icon-mask {\n  background-color: var(--color-text-primary);\n}\n\n.keybinds-list-item button:focus-visible {\n  background-color: var(--legacy-focus-bg-color);\n}\n\n.keybinds-list-item button[disabled] {\n  opacity: 40%;\n}\n\n.keybinds-confirm-button {\n  grid-column: -2 / span 1;\n}\n\n.keybinds-cancel-button {\n  grid-column: -1 / span 1;\n}\n\n.keybinds-edit-button {\n  display: none;\n  grid-row: 1 / span 1;\n  grid-column: 4 / span 1;\n}\n\n.keybinds-list-item:not(.keybinds-editing):hover .keybinds-edit-button,\n.keybinds-list-item:not(.keybinds-editing):focus-within .keybinds-edit-button {\n  display: inline-block;\n}\n\n.keybinds-list-text {\n  padding: 3px 0;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  user-select: none;\n  color: var(--color-text-primary);\n  text-align: start;\n  position: relative;\n  margin-right: 0;\n}\n\n.keybinds-category-header {\n  font-weight: bold;\n  line-height: 30px;\n  white-space: nowrap;\n}\n\n.keybinds-category-header:not(:nth-child(2)) {\n  border-top: 1px solid var(--color-details-hairline);\n}\n\n.keybinds-list-item:not(.keybinds-category-header):hover {\n  background: var(--color-background-elevation-1);\n}\n\n.keybinds-set-select {\n  text-align: right;\n  margin-bottom: 25px;\n}\n\n.keybinds-set-select label p {\n  display: inline;\n  color: var(--color-text-primary);\n}\n\n.keybinds-set-select select {\n  margin-left: 6px;\n}\n\nbutton.text-button {\n  width: fit-content;\n  align-self: flex-end;\n}\n\n.keybinds-list-text input {\n  margin: 0 2px;\n}\n\n.docs-link.devtools-link {\n  align-self: flex-start;\n  min-height: 2em;\n  line-height: 2em;\n}\n\n.keybinds-footer {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  min-height: fit-content;\n  margin-top: 10px;\n}\n\n/*# sourceURL=panels/settings/keybindsSettingsTab.css */");