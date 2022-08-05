/**
 * runtime/event/hippy-event-target hippy-event-target事件源模块
 * 因为事件源模块是抽象类，因此需要通过实例化子类来进行测试验证
 */
import type { NeedToTyped } from '@hippy-shared/index';
import { HippyElement } from '../../../src/runtime/element/hippy-element';
import { HippyEvent } from '../../../src/runtime/event/hippy-event';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('runtime/event/hippy-event-target.ts', () => {
  it('hippy-event-target child should contain special function', async () => {
    const divElement = new HippyElement('div');
    expect(divElement).toHaveProperty('addEventListener');
    expect(divElement).toHaveProperty('removeEventListener');
    expect(divElement).toHaveProperty('getEventListenerList');
    expect(divElement).toHaveProperty('emitEvent');
    expect(divElement).toHaveProperty('dispatchEvent');
  });

  it('hippy-event-target should contain right event listener count', async () => {
    const divElement = new HippyElement('div');

    const callback1 = () => {};
    divElement.addEventListener('click', callback1);

    const listenerList: NeedToTyped = divElement.getEventListenerList();
    expect(listenerList).toHaveProperty('click');
    expect(listenerList.click.length).toEqual(1);

    const callback2 = () => {};
    divElement.addEventListener('click', callback2);
    expect(listenerList.click.length).toEqual(2);

    const callback3 = () => {};
    divElement.addEventListener('change', callback3);
    expect(listenerList).toHaveProperty('change');
    expect(listenerList.click.length).toEqual(2);
    expect(listenerList.change.length).toEqual(1);

    divElement.removeEventListener('click', callback1);
    expect(listenerList.click.length).toEqual(1);
    divElement.removeEventListener('click', callback2);
    expect(listenerList.click).toEqual(undefined);
  });

  it('hippy-event-target should emit event correct', async () => {
    const divElement = new HippyElement('div');
    let sign = 0;

    const callback = () => {
      sign = 1;
    };

    divElement.addEventListener('click', callback);

    // emit event
    const event = new HippyEvent('click');
    divElement.emitEvent(event);

    expect(sign).toEqual(1);
  });

  it('hippy-event-target should dispatch event correct', async () => {
    const divElement = new HippyElement('div');
    let sign = 0;

    const callback = () => {
      sign = 1;
    };

    divElement.addEventListener('click', callback);

    // dispatch event
    const event = new HippyEvent('click');
    divElement.dispatchEvent(event);

    expect(sign).toEqual(1);
  });
});
