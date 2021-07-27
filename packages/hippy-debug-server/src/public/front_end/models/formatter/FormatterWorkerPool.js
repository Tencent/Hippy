// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
const MAX_WORKERS = Math.min(2, navigator.hardwareConcurrency - 1);
let formatterWorkerPoolInstance;
export class FormatterWorkerPool {
    _taskQueue;
    _workerTasks;
    constructor() {
        this._taskQueue = [];
        this._workerTasks = new Map();
    }
    static instance() {
        if (!formatterWorkerPoolInstance) {
            formatterWorkerPoolInstance = new FormatterWorkerPool();
        }
        return formatterWorkerPoolInstance;
    }
    _createWorker() {
        const worker = Common.Worker.WorkerWrapper.fromURL(new URL('../../entrypoints/formatter_worker/formatter_worker-entrypoint.js', import.meta.url));
        worker.onmessage = this._onWorkerMessage.bind(this, worker);
        worker.onerror = this._onWorkerError.bind(this, worker);
        return worker;
    }
    _processNextTask() {
        if (!this._taskQueue.length) {
            return;
        }
        let freeWorker = [...this._workerTasks.keys()].find(worker => !this._workerTasks.get(worker));
        if (!freeWorker && this._workerTasks.size < MAX_WORKERS) {
            freeWorker = this._createWorker();
        }
        if (!freeWorker) {
            return;
        }
        const task = this._taskQueue.shift();
        if (task) {
            this._workerTasks.set(freeWorker, task);
            freeWorker.postMessage({ method: task.method, params: task.params });
        }
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _onWorkerMessage(worker, event) {
        const task = this._workerTasks.get(worker);
        if (!task) {
            return;
        }
        if (task.isChunked && event.data && !event.data['isLastChunk']) {
            task.callback(event.data);
            return;
        }
        this._workerTasks.set(worker, null);
        this._processNextTask();
        task.callback(event.data ? event.data : null);
    }
    _onWorkerError(worker, event) {
        console.error(event);
        const task = this._workerTasks.get(worker);
        worker.terminate();
        this._workerTasks.delete(worker);
        const newWorker = this._createWorker();
        this._workerTasks.set(newWorker, null);
        this._processNextTask();
        if (task) {
            task.callback(null);
        }
    }
    _runChunkedTask(methodName, params, 
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback) {
        const task = new Task(methodName, params, onData, true);
        this._taskQueue.push(task);
        this._processNextTask();
        function onData(data) {
            if (!data) {
                callback(true, null);
                return;
            }
            const isLastChunk = 'isLastChunk' in data && Boolean(data['isLastChunk']);
            const chunk = 'chunk' in data && data['chunk'];
            callback(isLastChunk, chunk);
        }
    }
    _runTask(methodName, params) {
        return new Promise(resolve => {
            const task = new Task(methodName, params, resolve, false);
            this._taskQueue.push(task);
            this._processNextTask();
        });
    }
    format(mimeType, content, indentString) {
        const parameters = { mimeType: mimeType, content: content, indentString: indentString };
        return /** @type {!Promise<!FormatResult>} */ this._runTask("format" /* FORMAT */, parameters);
    }
    javaScriptIdentifiers(content) {
        return this._runTask("javaScriptIdentifiers" /* JAVASCRIPT_IDENTIFIERS */, { content: content })
            .then(ids => ids || []);
    }
    evaluatableJavaScriptSubstring(content) {
        return this._runTask("evaluatableJavaScriptSubstring" /* EVALUATE_JAVASCRIPT_SUBSTRING */, { content: content })
            .then(text => text || '');
    }
    parseCSS(content, callback) {
        this._runChunkedTask("parseCSS" /* PARSE_CSS */, { content: content }, onDataChunk);
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function onDataChunk(isLastChunk, data) {
            const rules = (data || []);
            callback(isLastChunk, rules);
        }
    }
    outlineForMimetype(content, mimeType, callback) {
        switch (mimeType) {
            case 'text/html':
                this._runChunkedTask("htmlOutline" /* HTML_OUTLINE */, { content: content }, callback);
                return true;
            case 'text/javascript':
                this._runChunkedTask("javaScriptOutline" /* JAVASCRIPT_OUTLINE */, { content: content }, callback);
                return true;
            case 'text/css':
                this.parseCSS(content, cssCallback);
                return true;
        }
        return false;
        function cssCallback(isLastChunk, rules) {
            callback(isLastChunk, rules.map(rule => {
                const title = 'selectorText' in rule ? rule.selectorText : rule.atRule;
                return { line: rule.lineNumber, subtitle: undefined, column: rule.columnNumber, title };
            }));
        }
    }
    findLastExpression(content) {
        return this._runTask("findLastExpression" /* FIND_LAST_EXPRESSION */, { content });
    }
    findLastFunctionCall(content) {
        return this._runTask("findLastFunctionCall" /* FIND_LAST_FUNCTION_CALL */, { content });
    }
    argumentsList(content) {
        return this._runTask("argumentsList" /* ARGUMENTS_LIST */, { content });
    }
}
class Task {
    method;
    params;
    callback;
    isChunked;
    constructor(method, params, callback, isChunked) {
        this.method = method;
        this.params = params;
        this.callback = callback;
        this.isChunked = isChunked;
    }
}
export function formatterWorkerPool() {
    return FormatterWorkerPool.instance();
}
//# sourceMappingURL=FormatterWorkerPool.js.map