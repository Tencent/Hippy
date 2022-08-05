import { HippyListItemElement } from '../../../src/runtime/element/hippy-list-item-element';

describe('runtime/element/hippy-list-item-element', () => {
  it('should set tag name using the constructor param.', () => {
    const hippyListItemElement = new HippyListItemElement('li');
    expect(hippyListItemElement.tagName).toBe('li');
  });
});
