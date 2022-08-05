/**
 * runtime/component/index.ts hippyNative组件注册模块
 */
import type { TagComponent } from '../../../src/runtime/component';
import * as index from '../../../src/runtime/component';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('runtime/component/index.ts', () => {
  it('getTagComponent should return undefined when no register', async () => {
    expect(index.getTagComponent('swiper')).toEqual(undefined);
  });

  it('getTagComponent should return right component when registered', async () => {
    const swiper: TagComponent = {
      // Native实际渲染的组件的类型，如View，TextView等
      name: 'Swiper',
      // 额外事件处理方法，如果存在的话，事件相应时需要调用
      // processEventData: () => {},
      // 事件Map，比如我们Dom的touchStart，在native这边实际是onTouchDown事件
      eventNamesMap: new Map().set('click', 'onClick'),
      // 组件默认都需要加上的样式
      defaultNativeStyle: {},
      // 组件默认都需要加上的props
      defaultNativeProps: {},
      // Native节点的属性，优先级最高
      nativeProps: {},
      // 属性Map，对属性做map处理
      attributeMaps: {},
    };

    index.registerHippyTag('swiper', swiper);
    expect(index.getTagComponent('swiper')).toEqual(swiper);
  });
});
