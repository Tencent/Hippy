/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HippyInputElement } from '../../../src/runtime/element/hippy-input-element';
import { Native } from '../../../src/runtime/native/index';

/**
 * hippy-input-element.ts unit test case
 */
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
    expect(callUIFunctionSpy).toHaveBeenCalled();
  });

  it('should invoke callUIFunction when focus of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.focus();
    expect(callUIFunctionSpy).toHaveBeenCalled();
  });

  it('should invoke callUIFunction when blur of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.blur();
    expect(callUIFunctionSpy).toHaveBeenCalled();
  });

  it('should invoke callUIFunction when clear of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.clear();
    expect(callUIFunctionSpy).toHaveBeenCalled();
  });

  it('should invoke callUIFunction when show input menu of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.showInputMenu();
    expect(callUIFunctionSpy).toHaveBeenCalled();
  });

  it('should invoke callUIFunction when hide input menu of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.hideInputMenu();
    expect(callUIFunctionSpy).toHaveBeenCalled();
  });

  it('setText method should work correct.', () => {
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.setText('hello');
    expect(hippyInputElement.attributes.text).toEqual('hello');
    const hippyTextareaElement = new HippyInputElement('textarea');
    hippyTextareaElement.setText('hello');
    expect(hippyTextareaElement.attributes.value).toEqual('hello');
  });

  it('should invoke callUIFunction when call isFocused function of the input element.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyInputElement = new HippyInputElement('input');
    hippyInputElement.isFocused();
    expect(callUIFunctionSpy).toHaveBeenCalled();
  });
});
