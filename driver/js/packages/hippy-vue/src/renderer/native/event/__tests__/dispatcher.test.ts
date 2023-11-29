import test, { before } from 'ava';
import { registerBuiltinElements } from '../../../../elements';
import { EventDispatcher } from '../dispatcher';
import { setApp, getApp } from '../../../../util';
import { preCacheNode } from '../../../../util/node';
import ElementNode from '../../../element-node';

let childNode: any;
let textareaNode: any;
let listview: any;
let iframe: any;
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
    $emit(eventName: any, eventParams: any) {
      // @ts-expect-error TS(2322): Type '{ eventName: any; eventParams: any; }' is no... Remove this comment to see the full error message
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
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
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
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: 100,
    nativeName: 'onTest',
  });
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent with wrong event name test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: 3,
    nativeName: 'test',
  });
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: 3,
    nativeName: 'onTouchDown',
  });
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent with wrong node id type test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent({
    currentId: 'str',
  });
  t.pass();
});

test('receiveComponentEvent with wrong event name type test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent({
    currentId: 'str',
  });
  t.pass();
});

test('receiveComponentEvent onChangeText test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: textareaNode.nodeId,
    nativeName: 'onChangeText',
    params: {
      text: 'Hello world',
    },
  });
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent onSelectionChange test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
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
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent onKeyboardWillShow test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: textareaNode.nodeId,
    nativeName: 'onKeyboardWillShow',
    params: {
      keyboardHeight: 123,
    },
  });
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent onContentSizeChange test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
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
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent div.onScroll test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
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
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent ul.onScroll test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
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
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent onTouch test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
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
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent1);
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent2);
  t.pass();
});

test('receiveComponentEvent onLayout test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
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
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});

test('receiveComponentEvent onLoad test', (t) => {
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 0.
  t.is(EventDispatcher.receiveComponentEvent(), undefined);
  const nativeEvent = Object.assign({}, dispatcherEvent, {
    currentId: iframe.nodeId,
    nativeName: 'onLoad',
    params: {
      url: 'http://hippyjs.org',
    },
  });
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  EventDispatcher.receiveComponentEvent(nativeEvent);
  t.pass();
});
