import test from 'ava';
import * as util from '../index';

test('The Vue of setVue should equal the getVue', (t) => {
  const Vue = {};
  t.is(util.setVue(Vue), undefined);
  t.is(util.getVue(), Vue);
});

test('The Vue of setApp should equal the getApp', (t) => {
  const App = {};
  t.is(util.setApp(App), undefined);
  t.is(util.getApp(), App);
});

test('trace output test', (t) => {
  const Vue = {
    config: {},
  };
  const { release } = process;
  delete process.release;
  util.setVue(Vue);
  util.trace('Hello world', { a: 1 });
  t.pass();
  Vue.config.silent = true;
  util.trace('Hello world', { a: 1 });
  t.pass();
  Vue.config.silent = false;
  process.env.NODE_ENV = 'production';
  util.trace('Hello world', { a: 1 });
  t.pass();
  delete process.env.NODE_ENV;
  process.release = release;
  // TODO: Added console.log simulate, but sinon can't work with nyc.
});

test('warn output test', (t) => {
  const Vue = {
    config: {},
  };
  util.setVue(Vue);
  util.warn('Hello world', { a: 1 });
  t.pass();
  Vue.config.silent = true;
  util.warn('Hello world', { a: 1 });
  t.pass();
  process.env.NODE_ENV = 'production';
  util.warn('Hello world', { a: 1 });
  t.pass();
  delete process.env.NODE_ENV;
  // TODO: Added console.warn simulate, but sinon can't work with nyc.
});

test('capitalizeFirstLetter output test', (t) => {
  t.is(util.capitalizeFirstLetter('hello'), 'Hello');
  t.is(util.capitalizeFirstLetter('World'), 'World');
  t.is(util.capitalizeFirstLetter('123'), '123');
});

test('tryConvertNumber output test', (t) => {
  t.is(util.tryConvertNumber(123), 123);
  t.is(util.tryConvertNumber('123'), 123);
  t.is(util.tryConvertNumber('abc'), 'abc');
  t.is(util.tryConvertNumber('123abc'), '123abc');
  t.is(util.tryConvertNumber('abc123'), 'abc123');
  t.is(util.tryConvertNumber('12e3'), 12000);
  t.is(util.tryConvertNumber('123.12'), 123.12);
  t.is(util.tryConvertNumber('123.'), 123);
  t.is(util.tryConvertNumber('.123'), 0.123);
  t.is(util.tryConvertNumber('+.123'), 0.123);
  t.is(util.tryConvertNumber('-.123'), -0.123);
  t.is(util.tryConvertNumber('.123.'), '.123.');
  t.is(util.tryConvertNumber('.123.1'), '.123.1');
  t.is(util.tryConvertNumber(''), '');
  const obj = {};
  t.is(util.tryConvertNumber(obj), obj);
});

test('unicodeToChar output test', (t) => {
  t.is(util.unicodeToChar('Hippy Vue \\u793a\\u4f8b'), 'Hippy Vue 示例');
  t.is(util.unicodeToChar('Hippy Vue 示例'), 'Hippy Vue 示例');
  t.is(util.unicodeToChar('\\u5c71\\u6da6\\xb7\\u6c34\\u6da6\\xb7\\u7269\\u6da6\\xb7\\u6e29\\u6da6\\u4fdd\\u5c71'), '山润·水润·物润·温润保山');
});

test('arrayCount test', (t) => {
  const arr = new Array(10).fill(0).map((a, index) => index);
  t.is(util.arrayCount(arr, a => a === 1), 1);
  t.is(util.arrayCount(arr, a => a < 5), 5);
});

test('isFunction test', (t) => {
  function foo() {
    return true;
  }
  t.true(util.isFunction(foo));
  t.true(util.isFunction(() => true));
  t.false(util.isFunction(undefined));
  t.false(util.isFunction(null));
  t.false(util.isFunction({}));
  t.false(util.isFunction(new Date()));       // Date is function
  t.false(util.isFunction(String('foobar'))); // String is function too
  t.false(util.isFunction(123));
  t.false(util.isFunction('abc'));
  t.false(util.isFunction(true));
});

test('setsAreEqual test', (t) => {
  t.true(util.setsAreEqual(new Set([1, 2, 3]), new Set([1, 2, 3])));
  t.true(util.setsAreEqual(new Set(['a', 'b', 'c']), new Set(['a', 'b', 'c'])));
  t.false(util.setsAreEqual(new Set([1, 2]), new Set([1, 2, 3])));
  t.false(util.setsAreEqual(new Set([1, 2, 3]), new Set([1, 2])));
  t.false(util.setsAreEqual(new Set([1, 2, 3]), new Set([1, 2, 4])));
  const err = t.throws(() => {
    util.setsAreEqual(new Set([1, 2, 3]));
  });
  t.is(err.message, 'Cannot read property \'size\' of undefined');
  const err2 = t.throws(() => {
    util.setsAreEqual('a', 'b');
  });
  t.is(err2.message, 'as.values is not a function');
});

test('endsWith test', (t) => {
  t.true(util.endsWith('100px', 'px'));
  t.false(util.endsWith('100', 'px'));
  t.true(util.endsWith('px', 'px'));
  t.false(util.endsWith('x', 'px'));
  delete String.prototype.endsWith;
  const str = 'To be, or not to be, that is the question.';
  t.true(util.endsWith(str, 'question.'));
  t.false(util.endsWith(str, 'to be'));
  t.true(util.endsWith(str, 'to be', 19));
});
