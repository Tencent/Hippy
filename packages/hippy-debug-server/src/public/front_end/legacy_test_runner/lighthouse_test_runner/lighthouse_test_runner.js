// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import '../test_runner/test_runner.js';
import '../../panels/lighthouse/lighthouse-legacy.js';

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.LighthouseTestRunner = self.LighthouseTestRunner || {};

/**
 * @return {!Lighthouse.LighthousePanel}
 */
LighthouseTestRunner._panel = function() {
  return /** @type {!Object} **/ (UI.panels).lighthouse;
};

/**
 * @return {?Element}
 */
LighthouseTestRunner.getContainerElement = function() {
  return LighthouseTestRunner._panel().contentElement;
};

/**
 * @return {?Element}
 */
LighthouseTestRunner.getResultsElement = function() {
  return LighthouseTestRunner._panel()._auditResultsElement;
};

/**
 * @return {?Element}
 */
LighthouseTestRunner.getDialogElement = function() {
  return LighthouseTestRunner._panel()._statusView._dialog.contentElement.shadowRoot.querySelector('.lighthouse-view');
};

/**
 * @return {?Element}
 */
LighthouseTestRunner.getSettingsElement = function() {
  return LighthouseTestRunner._panel()._settingsPane.element;
};

/**
 * @return {?Element}
 */
LighthouseTestRunner.getRunButton = function() {
  const dialog = LighthouseTestRunner.getContainerElement();
  return dialog && dialog.querySelectorAll('button')[0];
};

/**
 * @return {?Element}
 */
LighthouseTestRunner.getCancelButton = function() {
  const dialog = LighthouseTestRunner.getDialogElement();
  return dialog && dialog.querySelectorAll('button')[0];
};

LighthouseTestRunner.openStartAudit = function() {
  LighthouseTestRunner._panel()._renderStartView();
};

/**
 * @param {function(string)} onMessage
 */
LighthouseTestRunner.addStatusListener = function(onMessage) {
  TestRunner.addSniffer(Lighthouse.StatusView.prototype, 'updateStatus', onMessage, true);
};

/**
 * @return {!Promise<!Object>}
 */
LighthouseTestRunner.waitForResults = function() {
  return new Promise(resolve => {
    TestRunner.addSniffer(
        Lighthouse.LighthousePanel.prototype, '_buildReportUI', (lhr, artifacts) => resolve({lhr, artifacts}));
  });
};

LighthouseTestRunner.forcePageAuditabilityCheck = function() {
  LighthouseTestRunner._panel()._controller.recomputePageAuditability();
};

/**
 * @param {?Element} checkboxContainer
 * @return {string}
 */
LighthouseTestRunner._checkboxStateLabel = function(checkboxContainer) {
  if (!checkboxContainer) {
    return 'missing';
  }

  const label = checkboxContainer.textElement.textContent;
  const checkedLabel = checkboxContainer.checkboxElement.checked ? 'x' : ' ';
  return `[${checkedLabel}] ${label}`;
};

/**
 * @param {?Element} button
 * @return {string}
 */
LighthouseTestRunner._buttonStateLabel = function(button) {
  if (!button) {
    return 'missing';
  }

  const enabledLabel = button.disabled ? 'disabled' : 'enabled';
  const hiddenLabel = window.getComputedStyle(button).getPropertyValue('visibility');
  return `${button.textContent}: ${enabledLabel} ${hiddenLabel}`;
};

LighthouseTestRunner.dumpStartAuditState = function() {
  TestRunner.addResult('\n========== Lighthouse Start Audit State ==========');

  const containerElement = LighthouseTestRunner.getContainerElement();
  const checkboxes = [...containerElement.querySelectorAll('.checkbox')];

  const toolbarShadowRoot =
      LighthouseTestRunner.getSettingsElement().querySelector('.lighthouse-settings-pane > div').shadowRoot;
  for (const checkbox of toolbarShadowRoot.querySelectorAll('.checkbox')) {
    checkboxes.push(checkbox);
  }

  checkboxes.forEach(element => {
    TestRunner.addResult(LighthouseTestRunner._checkboxStateLabel(element));
  });

  const helpText = containerElement.querySelector('.lighthouse-help-text');
  if (!helpText.classList.contains('hidden')) {
    TestRunner.addResult(`Help text: ${helpText.textContent}`);
  }

  TestRunner.addResult(LighthouseTestRunner._buttonStateLabel(LighthouseTestRunner.getRunButton()));
};
