import { HippyListElement } from '../../../src/runtime/element/hippy-list-element';
import { Native } from '../../../src/runtime/native/index';

describe('runtime/element/hippy-list-element', () => {
  it('should invoke callUIFunction when call scrollToIndex method.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyListElement = new HippyListElement('ul');
    hippyListElement.scrollToIndex(0, 0);
    expect(callUIFunctionSpy).toBeCalled();
  });

  it('should invoke callUIFunction when call scrollToPosition method.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyListElement = new HippyListElement('ul');
    hippyListElement.scrollToPosition();
    expect(callUIFunctionSpy).toBeCalled();
  });
});
