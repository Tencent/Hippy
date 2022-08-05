/**
 * runtime/document/hippy-document hippy-document类模块
 */
import { HippyDocument } from '../../../src/runtime/document/hippy-document';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
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
    expect(listElement.constructor.name).toEqual('HippyListItemElement');
    expect(listElement.tagName).toEqual('li');
  });
});
