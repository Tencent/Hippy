// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TimelineJSProfileProcessor } from './TimelineJSProfile.js';
import { RecordType, TimelineData, TimelineModelImpl } from './TimelineModel.js';
export class Node {
    totalTime;
    selfTime;
    id;
    event;
    parent;
    _groupId;
    _isGroupNode;
    _depth;
    constructor(id, event) {
        this.totalTime = 0;
        this.selfTime = 0;
        this.id = id;
        this.event = event;
        this._groupId = '';
        this._isGroupNode = false;
        this._depth = 0;
    }
    isGroupNode() {
        return this._isGroupNode;
    }
    hasChildren() {
        throw 'Not implemented';
    }
    setHasChildren(_value) {
        throw 'Not implemented';
    }
    children() {
        throw 'Not implemented';
    }
    searchTree(matchFunction, results) {
        results = results || [];
        if (this.event && matchFunction(this.event)) {
            results.push(this);
        }
        for (const child of this.children().values()) {
            child.searchTree(matchFunction, results);
        }
        return results;
    }
}
export class TopDownNode extends Node {
    _root;
    _hasChildren;
    _children;
    parent;
    constructor(id, event, parent) {
        super(id, event);
        this._root = parent && parent._root;
        this._hasChildren = false;
        this._children = null;
        this.parent = parent;
    }
    hasChildren() {
        return this._hasChildren;
    }
    setHasChildren(value) {
        this._hasChildren = value;
    }
    children() {
        return this._children || this._buildChildren();
    }
    _buildChildren() {
        const path = [];
        for (let node = this; node.parent && !node._isGroupNode; node = node.parent) {
            path.push(node);
        }
        path.reverse();
        const children = new Map();
        const self = this;
        const root = this._root;
        if (!root) {
            this._children = children;
            return this._children;
        }
        const startTime = root._startTime;
        const endTime = root._endTime;
        const instantEventCallback = root._doNotAggregate ? onInstantEvent : undefined;
        const eventIdCallback = root._doNotAggregate ? undefined : _eventId;
        const eventGroupIdCallback = root._eventGroupIdCallback;
        let depth = 0;
        let matchedDepth = 0;
        let currentDirectChild = null;
        TimelineModelImpl.forEachEvent(root._events, onStartEvent, onEndEvent, instantEventCallback, startTime, endTime, root._filter);
        function onStartEvent(e) {
            ++depth;
            if (depth > path.length + 2) {
                return;
            }
            if (!matchPath(e)) {
                return;
            }
            const actualEndTime = e.endTime !== undefined ? Math.min(e.endTime, endTime) : endTime;
            const duration = actualEndTime - Math.max(startTime, e.startTime);
            if (duration < 0) {
                console.error('Negative event duration');
            }
            processEvent(e, duration);
        }
        function onInstantEvent(e) {
            ++depth;
            if (matchedDepth === path.length && depth <= path.length + 2) {
                processEvent(e, 0);
            }
            --depth;
        }
        function processEvent(e, duration) {
            if (depth === path.length + 2) {
                if (!currentDirectChild) {
                    return;
                }
                currentDirectChild.setHasChildren(true);
                currentDirectChild.selfTime -= duration;
                return;
            }
            let id;
            let groupId = '';
            if (!eventIdCallback) {
                id = Symbol('uniqueId');
            }
            else {
                id = eventIdCallback(e);
                groupId = eventGroupIdCallback ? eventGroupIdCallback(e) : '';
                if (groupId) {
                    id += '/' + groupId;
                }
            }
            let node = children.get(id);
            if (!node) {
                node = new TopDownNode(id, e, self);
                node._groupId = groupId;
                children.set(id, node);
            }
            node.selfTime += duration;
            node.totalTime += duration;
            currentDirectChild = node;
        }
        function matchPath(e) {
            if (matchedDepth === path.length) {
                return true;
            }
            if (matchedDepth !== depth - 1) {
                return false;
            }
            if (!e.endTime) {
                return false;
            }
            if (!eventIdCallback) {
                if (e === path[matchedDepth].event) {
                    ++matchedDepth;
                }
                return false;
            }
            let id = eventIdCallback(e);
            const groupId = eventGroupIdCallback ? eventGroupIdCallback(e) : '';
            if (groupId) {
                id += '/' + groupId;
            }
            if (id === path[matchedDepth].id) {
                ++matchedDepth;
            }
            return false;
        }
        function onEndEvent(_e) {
            --depth;
            if (matchedDepth > depth) {
                matchedDepth = depth;
            }
        }
        this._children = children;
        return children;
    }
}
export class TopDownRootNode extends TopDownNode {
    _root;
    _events;
    _filter;
    _startTime;
    _endTime;
    _eventGroupIdCallback;
    _doNotAggregate;
    totalTime;
    selfTime;
    constructor(events, filters, startTime, endTime, doNotAggregate, eventGroupIdCallback) {
        super('', null, null);
        this._root = this;
        this._events = events;
        this._filter = (e) => filters.every(f => f.accept(e));
        this._startTime = startTime;
        this._endTime = endTime;
        this._eventGroupIdCallback = eventGroupIdCallback;
        this._doNotAggregate = doNotAggregate;
        this.totalTime = endTime - startTime;
        this.selfTime = this.totalTime;
    }
    children() {
        return this._children || this._grouppedTopNodes();
    }
    _grouppedTopNodes() {
        const flatNodes = super.children();
        for (const node of flatNodes.values()) {
            this.selfTime -= node.totalTime;
        }
        if (!this._eventGroupIdCallback) {
            return flatNodes;
        }
        const groupNodes = new Map();
        for (const node of flatNodes.values()) {
            const groupId = this._eventGroupIdCallback(node.event);
            let groupNode = groupNodes.get(groupId);
            if (!groupNode) {
                groupNode = new GroupNode(groupId, this, node.event);
                groupNodes.set(groupId, groupNode);
            }
            groupNode.addChild(node, node.selfTime, node.totalTime);
        }
        this._children = groupNodes;
        return groupNodes;
    }
}
export class BottomUpRootNode extends Node {
    _children;
    _events;
    _textFilter;
    _filter;
    _startTime;
    _endTime;
    _eventGroupIdCallback;
    totalTime;
    constructor(events, textFilter, filters, startTime, endTime, eventGroupIdCallback) {
        super('', null);
        this._children = null;
        this._events = events;
        this._textFilter = textFilter;
        this._filter = (e) => filters.every(f => f.accept(e));
        this._startTime = startTime;
        this._endTime = endTime;
        this._eventGroupIdCallback = eventGroupIdCallback;
        this.totalTime = endTime - startTime;
    }
    hasChildren() {
        return true;
    }
    _filterChildren(children) {
        for (const [id, child] of children) {
            if (child.event && !this._textFilter.accept(child.event)) {
                children.delete(id);
            }
        }
        return children;
    }
    children() {
        if (!this._children) {
            this._children = this._filterChildren(this._grouppedTopNodes());
        }
        return this._children;
    }
    _ungrouppedTopNodes() {
        const root = this;
        const startTime = this._startTime;
        const endTime = this._endTime;
        const nodeById = new Map();
        const selfTimeStack = [endTime - startTime];
        const firstNodeStack = [];
        const totalTimeById = new Map();
        TimelineModelImpl.forEachEvent(this._events, onStartEvent, onEndEvent, undefined, startTime, endTime, this._filter);
        function onStartEvent(e) {
            const actualEndTime = e.endTime !== undefined ? Math.min(e.endTime, endTime) : endTime;
            const duration = actualEndTime - Math.max(e.startTime, startTime);
            selfTimeStack[selfTimeStack.length - 1] -= duration;
            selfTimeStack.push(duration);
            const id = _eventId(e);
            const noNodeOnStack = !totalTimeById.has(id);
            if (noNodeOnStack) {
                totalTimeById.set(id, duration);
            }
            firstNodeStack.push(noNodeOnStack);
        }
        function onEndEvent(e) {
            const id = _eventId(e);
            let node = nodeById.get(id);
            if (!node) {
                node = new BottomUpNode(root, id, e, false, root);
                nodeById.set(id, node);
            }
            node.selfTime += selfTimeStack.pop() || 0;
            if (firstNodeStack.pop()) {
                node.totalTime += totalTimeById.get(id) || 0;
                totalTimeById.delete(id);
            }
            if (firstNodeStack.length) {
                node.setHasChildren(true);
            }
        }
        this.selfTime = selfTimeStack.pop() || 0;
        for (const pair of nodeById) {
            if (pair[1].selfTime <= 0) {
                nodeById.delete(pair[0]);
            }
        }
        return nodeById;
    }
    _grouppedTopNodes() {
        const flatNodes = this._ungrouppedTopNodes();
        if (!this._eventGroupIdCallback) {
            return flatNodes;
        }
        const groupNodes = new Map();
        for (const node of flatNodes.values()) {
            const groupId = this._eventGroupIdCallback(node.event);
            let groupNode = groupNodes.get(groupId);
            if (!groupNode) {
                groupNode = new GroupNode(groupId, this, node.event);
                groupNodes.set(groupId, groupNode);
            }
            groupNode.addChild(node, node.selfTime, node.selfTime);
        }
        return groupNodes;
    }
}
export class GroupNode extends Node {
    _children;
    _isGroupNode;
    constructor(id, parent, event) {
        super(id, event);
        this._children = new Map();
        this.parent = parent;
        this._isGroupNode = true;
    }
    addChild(child, selfTime, totalTime) {
        this._children.set(child.id, child);
        this.selfTime += selfTime;
        this.totalTime += totalTime;
        child.parent = this;
    }
    hasChildren() {
        return true;
    }
    children() {
        return this._children;
    }
}
export class BottomUpNode extends Node {
    parent;
    _root;
    _depth;
    _cachedChildren;
    _hasChildren;
    constructor(root, id, event, hasChildren, parent) {
        super(id, event);
        this.parent = parent;
        this._root = root;
        this._depth = (parent._depth || 0) + 1;
        this._cachedChildren = null;
        this._hasChildren = hasChildren;
    }
    hasChildren() {
        return this._hasChildren;
    }
    setHasChildren(value) {
        this._hasChildren = value;
    }
    children() {
        if (this._cachedChildren) {
            return this._cachedChildren;
        }
        const selfTimeStack = [0];
        const eventIdStack = [];
        const eventStack = [];
        const nodeById = new Map();
        const startTime = this._root._startTime;
        const endTime = this._root._endTime;
        let lastTimeMarker = startTime;
        const self = this;
        TimelineModelImpl.forEachEvent(this._root._events, onStartEvent, onEndEvent, undefined, startTime, endTime, this._root._filter);
        function onStartEvent(e) {
            const actualEndTime = e.endTime !== undefined ? Math.min(e.endTime, endTime) : endTime;
            const duration = actualEndTime - Math.max(e.startTime, startTime);
            if (duration < 0) {
                console.assert(false, 'Negative duration of an event');
            }
            selfTimeStack[selfTimeStack.length - 1] -= duration;
            selfTimeStack.push(duration);
            const id = _eventId(e);
            eventIdStack.push(id);
            eventStack.push(e);
        }
        function onEndEvent(e) {
            const selfTime = selfTimeStack.pop();
            const id = eventIdStack.pop();
            eventStack.pop();
            let node;
            for (node = self; node._depth > 1; node = node.parent) {
                if (node.id !== eventIdStack[eventIdStack.length + 1 - node._depth]) {
                    return;
                }
            }
            if (node.id !== id || eventIdStack.length < self._depth) {
                return;
            }
            const childId = eventIdStack[eventIdStack.length - self._depth];
            node = nodeById.get(childId);
            if (!node) {
                const event = eventStack[eventStack.length - self._depth];
                const hasChildren = eventStack.length > self._depth;
                node = new BottomUpNode(self._root, childId, event, hasChildren, self);
                nodeById.set(childId, node);
            }
            const actualEndTime = e.endTime !== undefined ? Math.min(e.endTime, endTime) : endTime;
            const totalTime = actualEndTime - Math.max(e.startTime, lastTimeMarker);
            node.selfTime += selfTime || 0;
            node.totalTime += totalTime;
            lastTimeMarker = actualEndTime;
        }
        this._cachedChildren = this._root._filterChildren(nodeById);
        return this._cachedChildren;
    }
    searchTree(matchFunction, results) {
        results = results || [];
        if (this.event && matchFunction(this.event)) {
            results.push(this);
        }
        return results;
    }
}
export function eventURL(event) {
    const data = event.args['data'] || event.args['beginData'];
    if (data && data['url']) {
        return data['url'];
    }
    let frame = eventStackFrame(event);
    while (frame) {
        const url = frame['url'];
        if (url) {
            return url;
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frame = (frame.parent);
    }
    return null;
}
export function eventStackFrame(event) {
    if (event.name === RecordType.JSFrame) {
        return event.args['data'] || null;
    }
    return TimelineData.forEvent(event).topFrame();
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export function _eventId(event) {
    if (event.name === RecordType.TimeStamp) {
        return `${event.name}:${event.args.data.message}`;
    }
    if (event.name !== RecordType.JSFrame) {
        return event.name;
    }
    const frame = event.args['data'];
    const location = frame['scriptId'] || frame['url'] || '';
    const functionName = frame['functionName'];
    const name = TimelineJSProfileProcessor.isNativeRuntimeFrame(frame) ?
        TimelineJSProfileProcessor.nativeGroup(functionName) || functionName :
        `${functionName}:${frame['lineNumber']}:${frame['columnNumber']}`;
    return `f:${name}@${location}`;
}
//# sourceMappingURL=TimelineProfileTree.js.map