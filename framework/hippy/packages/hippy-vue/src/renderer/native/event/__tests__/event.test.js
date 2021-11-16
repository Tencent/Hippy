import test from 'ava';
import { Event } from '../event';

test('stopPropagation test', (t) => {
  const event = new Event('test');
  t.true(event.bubbles);
  event.stopPropagation();
  t.false(event.bubbles);
});

test('preventDefault with cancelable test', (t) => {
  const event = new Event('test');
  t.false(event.canceled);
  event.preventDefault();
  t.true(event.canceled);
});

test('preventDefault without cancelable test', (t) => {
  const event = new Event('test');
  event.initEvent('test', true, false);
  t.false(event.canceled);
  event.preventDefault();
  t.false(event.canceled);
});

test('initEvent test', (t) => {
  const event = new Event('test');
  event.initEvent('test', false, false);
  t.false(event.cancelable);
  t.false(event.bubbles);
});
