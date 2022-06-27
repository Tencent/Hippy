import test, { before } from 'ava';
import { registerBuiltinElements } from '../../../../elements';
import { EventDispatcher } from '../dispatcher';
import { setApp, getApp } from '../../../../util';
import { preCacheNode } from '../../../../util/node';
import ElementNode from '../../../element-node';

let childNode;
let textareaNode;
let listview;
let iframe;
const dispatcherEvent = {
  id: 0,
  nativeName: '',
  originalName: '',
  currentId: 0,
  params: {},
  eventPhase: 2,
};
before(() => {
  registerBuiltinElements();
  const rootNode = new ElementNode('div');
  preCacheNode(rootNode, rootNode.nodeId);
  childNode = new ElementNode('div');
  preCacheNode(childNode, childNode.nodeId);
  textareaNode = new ElementNode('textarea');
  preCacheNode(textareaNode, textareaNode.nodeId);
  listview = new ElementNode('ul');
  preCacheNode(listview, listview.nodeId);
  iframe = new ElementNode('iframe');
  preCacheNode(iframe, iframe.nodeId);
  rootNode.appendChild(childNode);
  childNode.appendChild(textareaNode);
  childNode.appendChild(listview);
  textareaNode.addEventListener('test', () => {});
  const app = {
    executed: null,
    $el: rootNode,
    $emit(eventName, eventParams) {
      app.executed = {
        eventName,
        eventParams,
      };
    },
  };
  setApp(app);
});

test('receiveNativeEvent test', (t) => {
  const app = getApp();
  t.is(EventDispatcher.receiveNativeEvent(), undefined);
  EventDispatcher.receiveNativeEvent([
    'test',
    'executed',
  ]);
  t.deepEqual(app.executed, {
    eventName: 'test',
    eventParams: 'executed',
  });
});

test('receiveComponentEvent with wrong node id test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: 100,
    nativeName: 'onTest',
  });
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent with wrong event name test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: 3,
    nativeName: 'test',
  });
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: 3,
    nativeName: 'onTouchDown',
  });
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent with wrong node id type test', (t) => {
  EventDispatcher.receiveComponentEvent({
    currentId: 'str',
  });
  t.pass();
});

test('receiveComponentEvent with wrong event name type test', (t) => {
  EventDispatcher.receiveComponentEvent({
    currentId: 'str',
  });
  t.pass();
});

test('receiveComponentEvent onChangeText test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: textareaNode.nodeId,
    nativeName: 'onChangeText',
    params: {
      text: 'Hello world',
    },
  });
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent onSelectionChange test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: textareaNode.nodeId,
    nativeName: 'onSelectionChange',
    params: {
      selection: {
        start: 1,
        end: 2,
      },
    },
  });
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent onKeyboardWillShow test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: textareaNode.nodeId,
    nativeName: 'onKeyboardWillShow',
    params: {
      keyboardHeight: 123,
    },
  });
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent onContentSizeChange test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: textareaNode.nodeId,
    nativeName: 'onContentSizeChange',
    params: {
      contentSize: {
        width: 1,
        height: 2,
      },
    },
  });
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent div.onScroll test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: childNode.nodeId,
    nativeName: 'onScroll',
    params: {
      contentOffset: {
        x: 1,
        y: 2,
      },
    },
  });
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent ul.onScroll test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: listview.nodeId,
    nativeName: 'onScroll',
    params: {
      contentOffset: {
        x: 1,
        y: 2,
      },
    },
  });
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent onTouch test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent1 = Object.assign({}, dispatcherEvent, {
    currentId: childNode.nodeId,
    nativeName: 'onTouchDown',
    params: {
      page_x: 1,
      page_y: 2,
    },
  });
  const nativeEvent2 = Object.assign({}, dispatcherEvent, {
    currentId: childNode.nodeId,
    nativeName: 'onTouchMove',
    params: {
      page_x: 1,
      page_y: 2,
    },
  });
  EventDispatcher.receiveComponentEvent(nativeEvent1);
  EventDispatcher.receiveComponentEvent(nativeEvent2);
  t.pass();
});

test('receiveComponentEvent onLayout test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: childNode.nodeId,
    nativeName: 'onLayout',
    params: {
      layout: {
        x: 1,
        y: 2,
        width: 100,
        height: 200,
      },
    },
  });
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent onLoad test', (t) => {
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: iframe.nodeId,
    nativeName: 'onLoad',
    params: {
      url: 'http://hippyjs.org',
    },
  });
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});
