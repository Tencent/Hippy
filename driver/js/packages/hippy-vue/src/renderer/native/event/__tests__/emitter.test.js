import test from 'ava';
import { EventEmitter } from '../emitter';
import { Event } from '../event';

test('addEventListener and getEventListeners test', (t) => {
  const emitter = new EventEmitter();

  // Error handler test
  const eventNameError = t.throws(() => {
    emitter.addEventListener(123, 123);
  }, TypeError);
  t.is(eventNameError.message, 'Events name(s) must be string.');
  const eventCallbackError = t.throws(() => {
    emitter.addEventListener('test', 123);
  }, TypeError);
  t.is(eventCallbackError.message, 'callback must be function.');

  // Real working test
  emitter.addEventListener('test', () => {});
  t.is(emitter.getEventListeners().test.length, 1);
  emitter.addEventListener('test', () => {});
  t.is(emitter.getEventListeners().test.length, 2);
});

test('removeEventListener and getEventListeners test', (t) => {
  const emitter = new EventEmitter();

  // Error handler testing
  const eventNameError = t.throws(() => {
    emitter.removeEventListener(123, 123);
  }, TypeError);
  t.is(eventNameError.message, 'Events name(s) must be string.');
  const eventCallbackError = t.throws(() => {
    emitter.removeEventListener('test', 123);
  }, TypeError);
  t.is(eventCallbackError.message, 'callback must be function.');

  // Real work test
  const callback1 = () => {};
  const callback2 = () => {};
  const callback3 = () => {};
  const callback4 = () => {};
  emitter.addEventListener('test', callback1);
  emitter.addEventListener('test', callback2);
  emitter.addEventListener('test', callback3);
  emitter.addEventListener('test', callback4, {
    once: true,
  });
  t.is(emitter.getEventListeners().test.length, 4);
  emitter.removeEventListener('test', callback2);
  t.is(emitter.getEventListeners().test.length, 3);
  emitter.removeEventListener('test', callback4, {
    once: true,
  });
  t.is(emitter.getEventListeners().test.length, 2);
  emitter.removeEventListener('test');
  t.is(emitter.getEventListeners().test, undefined);
});

test('emit without option test', (t) => {
  const emitter = new EventEmitter();
  // Real work test
  let executed = false;
  const callback = () => {
    executed = true;
  };
  const event = new Event('test');
  emitter.emit(event);
  emitter.addEventListener('test', callback);
  emitter.emit(event);
  t.true(executed);
});

test('emit with thisArg option test', (t) => {
  const emitter = new EventEmitter();
  // Real work test
  let executed = false;
  function thisArg() {}
  function callback() {
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
