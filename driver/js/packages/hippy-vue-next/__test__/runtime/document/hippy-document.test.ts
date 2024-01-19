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

import { HippyDocument } from '../../../src/runtime/document/hippy-document';

/**
 * hippy-document.ts unit test case
 */
describe('runtime/document/hippy-document.ts', () => {
  it('HippyDocument should contain required function', async () => {
    expect(HippyDocument.createComment).toBeDefined();
    expect(HippyDocument.createElement).toBeDefined();
    expect(HippyDocument.createTextNode).toBeDefined();
  });

  it('createComment function should return comment node', async () => {
    const commentNode = HippyDocument.createComment('comment');

    expect(commentNode.constructor.name).toEqual('HippyCommentElement');
    expect(commentNode.tagName).toEqual('comment');
    expect(commentNode.text).toEqual('comment');
  });

  it('createTextNode function should return text node', async () => {
    const textNode = HippyDocument.createTextNode('text');

    expect(textNode.constructor.name).toEqual('HippyText');
    expect(textNode.text).toEqual('text');
    expect(textNode).not.toHaveProperty('tagName');
  });

  it('createElement function should return element when tag is element', async () => {
    const divElement = HippyDocument.createElement('div');
    expect(divElement.constructor.name).toEqual('HippyElement');
    expect(divElement.tagName).toEqual('div');
  });

  it('createElement function should return input element when tag is input tag', async () => {
    const inputElement = HippyDocument.createElement('input');
    expect(inputElement.constructor.name).toEqual('HippyInputElement');
    expect(inputElement.tagName).toEqual('input');

    const textAreaElement = HippyDocument.createElement('textarea');
    expect(textAreaElement.constructor.name).toEqual('HippyInputElement');
    expect(textAreaElement.tagName).toEqual('textarea');
  });

  it('createElement function should return list element when tag is list', async () => {
    const listElement = HippyDocument.createElement('ul');
    expect(listElement.constructor.name).toEqual('HippyListElement');
    expect(listElement.tagName).toEqual('ul');
  });

  it('createElement function should return list item element when tag is list item', async () => {
    const listElement = HippyDocument.createElement('li');
    expect(listElement.constructor.name).toEqual('HippyElement');
    expect(listElement.tagName).toEqual('li');
  });
});
