import { HippyInputElement } from '../../../src/runtime/element/hippy-input-element';
import { Native } from '../../../src/runtime/native/index';

describe('runtime/element/hippy-input-element', () => {
  it('should invoke callUIFunction when get value of the input element.', async () => {
    const getValueMock = jest
      .spyOn(HippyInputElement.prototype, 'getValue')
      .mockImplementation(async () => Promise.resolve(''));
    const hippyInputElement = new HippyInputElement('input');
    await hippyInputElement.getValue();
    expect(getValueMock).toHaveBeenCalled();
  });

  it('should invoke callUIFunction when set value of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.setValue('placeholder');
    expect(callUIFunctionSpy).toBeCalled();
  });

  it('should invoke callUIFunction when focus of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.focus();
    expect(callUIFunctionSpy).toBeCalled();
  });

  it('should invoke callUIFunction when blur of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.blur();
    expect(callUIFunctionSpy).toBeCalled();
  });

  it('should invoke callUIFunction when clear of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.clear();
    expect(callUIFunctionSpy).toBeCalled();
  });

  it('should invoke callUIFunction when show input menu of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.showInputMenu();
    expect(callUIFunctionSpy).toBeCalled();
  });

  it('should invoke callUIFunction when hide input menu of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.hideInputMenu();
    expect(callUIFunctionSpy).toBeCalled();
  });
});
