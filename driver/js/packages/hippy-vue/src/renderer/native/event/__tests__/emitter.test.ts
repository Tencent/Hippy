import test from 'ava';
import { EventEmitter } from '../emitter';
import { Event } from '../event';

test('addEventListener and getEventListeners test', (t) => {
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
  const emitter = new EventEmitter();

  // Error handler test
  const eventNameError = t.throws(() => {
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    emitter.addEventListener(123, 123);
  }, TypeError);
  t.is(eventNameError.message, 'Events name(s) must be string.');
  const eventCallbackError = t.throws(() => {
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    emitter.addEventListener('test', 123);
  }, TypeError);
  t.is(eventCallbackError.message, 'callback must be function.');

  // Real working test
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
  emitter.addEventListener('test', () => {});
  t.is(emitter.getEventListeners().test.length, 1);
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
  emitter.addEventListener('test', () => {});
  t.is(emitter.getEventListeners().test.length, 2);
});

test('removeEventListener and getEventListeners test', (t) => {
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
  const emitter = new EventEmitter();

  // Error handler testing
  const eventNameError = t.throws(() => {
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    emitter.removeEventListener(123, 123);
  }, TypeError);
  t.is(eventNameError.message, 'Events name(s) must be string.');
  const eventCallbackError = t.throws(() => {
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    emitter.removeEventListener('test', 123);
  }, TypeError);
  t.is(eventCallbackError.message, 'callback must be function.');

  // Real work test
  const callback1 = () => {};
  const callback2 = () => {};
  const callback3 = () => {};
  const callback4 = () => {};
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
  emitter.addEventListener('test', callback1);
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
  emitter.addEventListener('test', callback2);
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
  emitter.addEventListener('test', callback3);
  emitter.addEventListener('test', callback4, {
    once: true,
  });
  t.is(emitter.getEventListeners().test.length, 4);
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
  emitter.removeEventListener('test', callback2);
  t.is(emitter.getEventListeners().test.length, 3);
  emitter.removeEventListener('test', callback4, {
    once: true,
  });
  t.is(emitter.getEventListeners().test.length, 2);
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 1.
  emitter.removeEventListener('test');
  t.is(emitter.getEventListeners().test, undefined);
});

test('emit without option test', (t) => {
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
  const emitter = new EventEmitter();
  // Real work test
  let executed = false;
  const callback = () => {
    executed = true;
  };
  const event = new Event('test');
  emitter.emit(event);
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
  emitter.addEventListener('test', callback);
  emitter.emit(event);
  t.true(executed);
});

test('emit with thisArg option test', (t) => {
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
  const emitter = new EventEmitter();
  // Real work test
  let executed = false;
  function thisArg() {}
  function callback(this: any) {
    executed = true;
    t.is(this, thisArg);
  }
  const event = new Event('test');
  emitter.addEventListener('test', callback, {
    thisArg,
  });
  emitter.emit(event);
  t.true(executed);
});

test('emit with once option test', (t) => {
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
  const emitter = new EventEmitter();
  // Real work test
  let executedTimes = 0;
  function callback() {
    executedTimes += 1;
  }
  const event = new Event('test');
  emitter.addEventListener('test', callback, {
    once: true,
  });
  // Execute test event callback, executedTimes should be 1
  emitter.emit(event);
  t.is(executedTimes, 1);
  // Execute test event callback again, executedTimes should be 1 because callback was removed.
  emitter.emit(event);
  t.is(executedTimes, 1);
});
