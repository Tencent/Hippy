/**
 * built-in-component  内置组件单测用例
 */

import BuiltInComponent from '../src/built-in-component';
import { getTagComponent } from '../src/runtime/component';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('built-in-component', () => {
  beforeAll(() => {
    // 注册全部内置组件
    BuiltInComponent.install();
  });

  it('all of the built-in tag component should registered', async () => {
    const tagList = [
      'div',
      'button',
      'form',
      'img',
      'ul',
      'li',
      'span',
      'label',
      'p',
      'a',
      'input',
      'textarea',
      'iframe',
    ];

    tagList.forEach((tag) => {
      const component = getTagComponent(tag);
      expect(component).toBeDefined();
    });
  });
});
