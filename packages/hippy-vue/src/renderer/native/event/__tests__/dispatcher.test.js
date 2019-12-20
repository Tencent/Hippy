import test from 'ava';
import { EventDispatcher } from '../dispatcher';
import { setApp, getApp } from '../../../../util';
import ElementNode from '../../../element-node';

let childNode;
let textareaNode;

test.before(() => {
  const rootNode = new ElementNode('div');
  childNode = new ElementNode('div');
  textareaNode = new ElementNode('textarea');
  rootNode.appendChild(childNode);
  childNode.appendChild(textareaNode);
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

test('receiveNativeGesture with wrong node id test', (t) => {
  t.is(EventDispatcher.receiveNativeGesture(), undefined);
  EventDispatcher.receiveNativeGesture({
    id: 100,
    name: 'onTest',
  });
  t.pass();
});

test('receiveNativeGesture with wrong event name test', (t) => {
  t.is(EventDispatcher.receiveNativeGesture(), undefined);
  EventDispatcher.receiveNativeGesture({
    id: 3,
    name: 'test',
  });
  t.pass();
});

test('receiveNativeGesture test', (t) => {
  t.is(EventDispatcher.receiveNativeGesture(), undefined);
  EventDispatcher.receiveNativeGesture({
    id: 3,
    name: 'onTouchDown',
  });
  t.pass();
});

test('receiveUIComponentEvent with wrong node id type test', (t) => {
  EventDispatcher.receiveUIComponentEvent([
    'str',
  ]);
  t.pass();
});

test('receiveUIComponentEvent with wrong event name type test', (t) => {
  EventDispatcher.receiveUIComponentEvent([
    10,
    200,
  ]);
  t.pass();
});

test('receiveUIComponentEvent with wrong event name test', (t) => {
  EventDispatcher.receiveUIComponentEvent([
    10,
    'onTest',
  ]);
  t.pass();
});

test('receiveUIComponentEvent onChangeText test', (t) => {
  t.is(EventDispatcher.receiveUIComponentEvent(), undefined);
  EventDispatcher.receiveUIComponentEvent([
    textareaNode.nodeId,
    'onChangeText',
    {
      text: 'Hello world',
    },
  ]);
  t.pass();
});

test('receiveUIComponentEvent onSelectionChange test', (t) => {
  t.is(EventDispatcher.receiveUIComponentEvent(), undefined);
  EventDispatcher.receiveUIComponentEvent([
    textareaNode.nodeId,
    'onSelectionChange',
    {
      selection: {
        start: 1,
        end: 2,
      },
    },
  ]);
  t.pass();
});

test('receiveUIComponentEvent onScroll test', (t) => {
  t.is(EventDispatcher.receiveUIComponentEvent(), undefined);
  EventDispatcher.receiveUIComponentEvent([
    childNode.nodeId,
    'onScroll',
    {
      contentOffset: {
        x: 1,
        y: 2,
      },
    },
  ]);
  t.pass();
});

test('receiveUIComponentEvent onLayout test', (t) => {
  t.is(EventDispatcher.receiveUIComponentEvent(), undefined);
  EventDispatcher.receiveUIComponentEvent([
    childNode.nodeId,
    'onLayout',
    {
      layout: {
        x: 1,
        y: 2,
        width: 100,
        height: 200,
      },
    },
  ]);
  t.pass();
});
