// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import '../../core/sdk/sdk-legacy.js';
import '../test_runner/test_runner.js';
import * as Platform from '../../core/platform/platform.js';

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.SDKTestRunner = self.SDKTestRunner || {};

let id = 0;

function nextId(prefix) {
  return (prefix || '') + ++id;
}

SDKTestRunner.PageMock = class {
  constructor(url) {
    this._url = url;
    this._type = SDK.Target.Type.Frame;
    this._enabledDomains = new Set();
    this._children = new Map();

    this._mainFrame =
        {id: nextId(), loaderId: nextId(), mimeType: 'text/html', securityOrigin: this._url, url: this._url};

    this._executionContexts = [];
    this._executionContexts.push(this._createExecutionContext(this._mainFrame, false));
    this._scripts = [];
    this._scriptContents = new Map();

    this._dispatchMap = {
      'Debugger.enable': this._debuggerEnable,
      'Debugger.getScriptSource': this._debuggerGetScriptSource,
      'Debugger.setBlackboxPatterns': (id, params) => this._sendResponse(id, {}),
      'Runtime.enable': this._runtimeEnable,
      'Page.enable': this._pageEnable,
      'Page.getResourceTree': this._pageGetResourceTree
    };
  }

  turnIntoWorker() {
    this._type = SDK.Target.Type.Worker;
  }

  connectAsMainTarget(targetName) {
    self.Bindings.debuggerWorkspaceBinding._resetForTest(TestRunner.mainTarget);
    self.Bindings.resourceMapping._resetForTest(TestRunner.mainTarget);
    this._enabledDomains.clear();
    self.SDK.targetManager._targets.clear();

    const oldFactory = ProtocolClient.Connection.getFactory();
    ProtocolClient.Connection.setFactory(() => {
      this._connection = new MockPageConnection(this);
      return this._connection;
    });
    const target = self.SDK.targetManager.createTarget(nextId('mock-target-'), targetName, this._type, null);
    ProtocolClient.Connection.setFactory(oldFactory);

    this._target = target;
    return target;
  }

  connectAsChildTarget(targetName, parentMock) {
    this._enabledDomains.clear();
    this._sessionId = nextId('mock-target-');
    this._root = parentMock._root || parentMock;
    this._root._children.set(this._sessionId, this);
    const target = self.SDK.targetManager.createTarget(
        this._sessionId, targetName, this._type, parentMock._target, this._sessionId);
    this._target = target;
    return target;
  }

  disconnect() {
    if (this._root) {
      this._root._children.delete(this._sessionId);
      this._target.dispose();
      this._root = null;
      this._sessionId = null;
    } else {
      this._connection.disconnect();
      this._connection = null;
    }
    this._target = null;
  }

  evalScript(url, content, isContentScript) {
    const id = nextId();
    content += '\n//# sourceURL=' + url;
    this._scriptContents.set(id, content);
    let context = this._executionContexts.find(context => context.auxData.isDefault !== isContentScript);

    if (!context) {
      context = this._createExecutionContext(this._mainFrame, isContentScript);
      this._executionContexts.push(context);

      this._fireEvent('Runtime.executionContextCreated', {context: context});
    }

    const text = new TextUtils.Text(content);

    const script = {
      scriptId: id,
      url: url,
      startLine: 0,
      startColumn: 0,
      endLine: text.lineCount(),
      endColumn: text.lineAt(text.lineCount()).length - 1,
      executionContextId: context.id,
      hash: Platform.StringUtilities.hashCode(content),
      executionContextAuxData: context.auxData,
      sourceMapURL: '',
      hasSourceURL: true,
      isLiveEdit: false,
      isModule: false,
      length: content.length
    };

    this._scripts.push(script);
    this._fireEvent('Debugger.scriptParsed', script);
  }

  removeContentScripts() {
    const index = this._executionContexts.findIndex(context => !context.auxData.isDefault);
    if (index !== -1) {
      this._fireEvent('Runtime.executionContextDestroyed', {executionContextId: this._executionContexts[index].id});
      this._executionContexts.splice(index, 1);
    }
  }

  reload() {
    this._fireEvent('Page.frameStartedLoading', {frameId: this._mainFrame.id});

    for (const context of this._executionContexts) {
      this._fireEvent('Runtime.executionContextDestroyed', {executionContextId: context.id});
    }


    this._scripts = [];
    this._scriptContents.clear();
    this._executionContexts = [];
    this._fireEvent('Runtime.executionContextsCleared', {});
    this._executionContexts.push(this._createExecutionContext(this._mainFrame, false));

    for (const context of this._executionContexts) {
      this._fireEvent('Runtime.executionContextCreated', {context: context});
    }


    this._fireEvent('Page.frameNavigated', {frame: this._mainFrame});

    this._fireEvent('Page.loadEventFired', {timestamp: Date.now() / 1000});

    this._fireEvent('Page.frameStoppedLoading', {frameId: this._mainFrame.id});

    this._fireEvent('Page.domContentEventFired', {timestamp: Date.now() / 1000});
  }

  _createExecutionContext(frame, isContentScript) {
    return {
      id: nextId(),

      auxData: {isDefault: !isContentScript, frameId: frame.id},

      origin: frame.securityOrigin,
      name: isContentScript ? 'content-script-context' : ''
    };
  }

  _debuggerEnable(id, params) {
    this._enabledDomains.add('Debugger');
    this._sendResponse(id, {});

    for (const script of this._scripts) {
      this._fireEvent('Debugger.scriptParsed', script);
    }
  }

  _debuggerGetScriptSource(id, params) {
    if (!this._scriptContents.has(params.scriptId)) {
      this._sendResponse(id, undefined, {message: 'Can\'t get script content for id ' + params.scriptId, code: 1});

      return;
    }

    const result = {scriptSource: this._scriptContents.get(params.scriptId)};

    this._sendResponse(id, result);
  }

  _runtimeEnable(id, params) {
    this._enabledDomains.add('Runtime');
    this._sendResponse(id, {});

    for (const context of this._executionContexts) {
      this._fireEvent('Runtime.executionContextCreated', {context: context});
    }
  }

  _pageEnable(id, params) {
    this._enabledDomains.add('Page');
    this._sendResponse(id, {});
  }

  _pageGetResourceTree(id, params) {
    const result = {frameTree: {frame: this._mainFrame, resources: []}};

    this._sendResponse(id, result);
  }

  _isSupportedDomain(methodName) {
    const domain = methodName.split('.')[0];

    if (domain === 'Page') {
      return this._type === SDK.Target.Type.Frame;
    }

    return true;
  }

  _dispatch(sessionId, id, methodName, params) {
    if (sessionId) {
      const child = this._children.get(sessionId);
      if (child) {
        child._dispatch('', id, methodName, params);
      }
      return;
    }

    const handler = (this._isSupportedDomain(methodName) ? this._dispatchMap[methodName] : null);

    if (handler) {
      return handler.call(this, id, params);
    }

    this._sendResponse(
        id, undefined, {message: 'Can\'t handle command ' + methodName, code: ProtocolClient.DevToolsStubErrorCode});
  }

  _sendResponse(id, result, error) {
    const message = {id: id, result: result, error: error};
    if (this._root) {
      message.sessionId = this._sessionId;
      this._root._connection.sendMessageToDevTools(message);
    } else {
      this._connection.sendMessageToDevTools(message);
    }
  }

  _fireEvent(methodName, params) {
    const domain = methodName.split('.')[0];

    if (!this._enabledDomains.has(domain)) {
      return;
    }

    const message = {method: methodName, params: params};
    if (this._root) {
      message.sessionId = this._sessionId;
      this._root._connection.sendMessageToDevTools(message);
    } else {
      this._connection.sendMessageToDevTools(message);
    }
  }
};

class MockPageConnection {
  constructor(page) {
    this._page = page;
  }

  setOnMessage(onMessage) {
    this._onMessage = onMessage;
  }

  setOnDisconnect(onDisconnect) {
    this._onDisconnect = onDisconnect;
  }

  sendMessageToDevTools(message) {
    setTimeout(() => this._onMessage.call(null, JSON.stringify(message)), 0);
  }

  sendRawMessage(messageString) {
    const message = JSON.parse(messageString);
    this._page._dispatch(message.sessionId, message.id, message.method, message.params || {});
  }

  disconnect() {
    this._onDisconnect.call(null, 'force disconnect');
    this._onDisconnect = null;
    this._onMessage = null;
    return Promise.resolve();
  }
}
