/**
 * util/index 工具类方法模块
 */
import * as index from '../../src/util/index';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('util/index.ts', () => {
  // 测试index工具类方法
  it('tryConvertNumber should return right value when params give', async () => {
    expect(index.tryConvertNumber('123')).toEqual(123);

    expect(index.tryConvertNumber(123)).toEqual(123);

    expect(index.tryConvertNumber('123.123')).toEqual(123.123);

    expect(index.tryConvertNumber('test')).toEqual('test');
  });

  it('capitalizeFirstLetter should capitalize the first letter', async () => {
    expect(index.capitalizeFirstLetter('test')).toEqual('Test');

    expect(index.capitalizeFirstLetter('Test')).toEqual('Test');
  });

  it('lowerFirstLetter should lower the first letter', async () => {
    expect(index.lowerFirstLetter('Test')).toEqual('test');

    expect(index.lowerFirstLetter('Test')).toEqual('test');
  });

  it('normalizeTagName should lower all of the tagName', async () => {
    expect(index.normalizeTagName('LocalComponent')).toEqual('localcomponent');

    expect(index.normalizeTagName('AsyncCOMPONENT')).toEqual('asynccomponent');

    expect(index.normalizeTagName('httpcomponent')).toEqual('httpcomponent');
  });

  it('getUniqueId should return the unique id, auto increment one', async () => {
    expect(index.getUniqueId()).toEqual(1);

    expect(index.getUniqueId()).toEqual(2);

    expect(index.getUniqueId()).toEqual(3);
  });

  it('unicodeToChar', async () => {
    expect(index.unicodeToChar('\u4f60\u597d')).toEqual('你好');
    expect(index.unicodeToChar('\u0068\u0065\u006c\u006c\u006f')).toEqual('hello');
  });

  it('setsAreEqual', async () => {
    const setA = new Set();
    const setB = new Set();

    expect(index.setsAreEqual(setA, setB)).toBeTruthy();

    setA.add('123');
    expect(index.setsAreEqual(setA, setB)).toBeFalsy();

    setB.add('123');
    expect(index.setsAreEqual(setA, setB)).toBeTruthy();
  });

  it('getNormalizeEventName should return right event Name, start with on and capitalize first letter', async () => {
    expect(index.getNormalizeEventName('click')).toEqual('onClick');
    expect(index.getNormalizeEventName('change')).toEqual('onChange');
    expect(index.getNormalizeEventName('keyup')).toEqual('onKeyup');
  });
});
