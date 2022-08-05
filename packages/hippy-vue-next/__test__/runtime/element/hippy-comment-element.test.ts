import { HippyCommentElement } from '../../../src/runtime/element/hippy-comment-element';

describe('runtime/element/hippy-comment-element', () => {
  it('should set text using the constructor param.', () => {
    const hippyCommentElement = new HippyCommentElement('this is comment');
    expect(hippyCommentElement.text).toBe('this is comment');
  });

  it('should not to be added to native tree.', () => {
    const hippyCommentElement = new HippyCommentElement('this is comment');
    expect(hippyCommentElement.isNeedInsertToNative).toBeFalsy();
  });
});
