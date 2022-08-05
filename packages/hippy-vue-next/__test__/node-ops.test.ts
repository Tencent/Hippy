/**
 * node-ops  Vue自定义渲染器节点操作方法单测用例
 */
import { nodeOps } from '../src/node-ops';
import { registerHippyTag } from '../src/runtime/component';
import { setHippyCachedInstance } from '../src/util/instance';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('node-ops.ts', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    setHippyCachedInstance({ rootViewId: 19, rootContainer: 'root' });
  });

  it('nodeOps should contain special functions', async () => {
    expect(nodeOps.insert).toBeDefined();
    expect(nodeOps.remove).toBeDefined();
    expect(nodeOps.setText).toBeDefined();
    expect(nodeOps.setElementText).toBeDefined();
    expect(nodeOps.createComment).toBeDefined();
    expect(nodeOps.createElement).toBeDefined();
    expect(nodeOps.createText).toBeDefined();
    expect(nodeOps.parentNode).toBeDefined();
    expect(nodeOps.nextSibling).toBeDefined();
  });

  it('createElement function should return value correctly', async () => {
    const element = nodeOps.createElement('div');

    expect(element.constructor.name).toEqual('HippyElement');
    expect(element.tagName).toEqual('div');
  });

  it('createComment function should return value correctly', async () => {
    const element = nodeOps.createComment('comment');

    expect(element.constructor.name).toEqual('HippyCommentElement');
    expect(element.text).toEqual('comment');
  });

  it('createTextNode function should return value correctly', async () => {
    const element = nodeOps.createText('text');

    expect(element.constructor.name).toEqual('HippyText');
    expect(element.text).toEqual('text');
  });

  it('insert node without anchor', async () => {
    const parent = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');

    nodeOps.insert(child, parent);

    expect(parent.childNodes.length).toEqual(1);
    expect(parent.childNodes[0]).toEqual(child);
  });

  it('insert node with anchor', async () => {
    const parent = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');
    const anchor = nodeOps.createElement('p');

    // 先插入锚点
    nodeOps.insert(anchor, parent);
    expect(parent.childNodes.length).toEqual(1);
    expect(parent.childNodes[0]).toEqual(anchor);

    // 插入子节点
    nodeOps.insert(child, parent, anchor);
    expect(parent.childNodes.length).toEqual(2);
    expect(parent.childNodes[0]).toEqual(child);
    expect(parent.childNodes[1]).toEqual(anchor);
  });

  it('insert a text node', async () => {
    const text = 'hello';
    const parent = nodeOps.createElement('div');
    const textNode = nodeOps.createText(text);

    nodeOps.insert(textNode, parent);
    // 文本节点在native中不存在，实际是parent节点的text属性
    expect(parent.getAttribute('text')).toEqual(text);
  });

  it('insert success when child has another parent', async () => {
    const parent = nodeOps.createElement('div');
    const parent2 = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');

    nodeOps.insert(child, parent);
    nodeOps.insert(child, parent2, null);

    expect(parent2.childNodes[0]).toEqual(child);
    expect(parent.childNodes.length).toEqual(0);
  });

  it('insert error when anchor node have another parent', async () => {
    const parent = nodeOps.createElement('div');
    const parent2 = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');
    const child2 = nodeOps.createElement('div');

    nodeOps.insert(child, parent);
    nodeOps.insert(child2, parent, child);
    expect(() => nodeOps.insert(child2, parent2, child)).toThrow(Error);
  });

  it('insert error when child with anchor has another parent', async () => {
    const parent = nodeOps.createElement('div');
    const parent2 = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');
    const child2 = nodeOps.createElement('div');

    nodeOps.insert(child, parent);
    nodeOps.insert(child2, parent2);

    expect(() => nodeOps.insert(child2, parent, child)).toThrow(Error);
  });

  it('remove child should work correctly', async () => {
    registerHippyTag('div', {
      name: 'View',
    });

    const parent = nodeOps.createElement('div');
    const child1 = nodeOps.createElement('div');
    const child2 = nodeOps.createElement('div');
    const child3 = nodeOps.createElement('div');

    nodeOps.insert(child1, parent);
    nodeOps.insert(child2, parent);
    nodeOps.insert(child3, parent);

    nodeOps.remove(child2);
    expect(parent.childNodes.length).toEqual(2);
    nodeOps.remove(child3);
    expect(parent.childNodes.length).toEqual(1);
  });

  it('remove child do nothing when no parent', async () => {
    const child = nodeOps.createElement('div');
    expect(nodeOps.remove(child)).toBeUndefined();
  });

  it('remove a text node should only remove attribute', async () => {
    const text = 'hello';
    const parent = nodeOps.createElement('div');
    const textNode = nodeOps.createText(text);

    nodeOps.insert(textNode, parent);
    expect(parent.getAttribute('text')).toEqual(text);

    nodeOps.remove(textNode);
    expect(parent.getAttribute('text')).toEqual('');
  });

  it('parentNode should set correctly', async () => {
    const parent = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');

    nodeOps.insert(child, parent);

    expect(nodeOps.parentNode(child)).toEqual(parent);

    const parent2 = nodeOps.createElement('div');
    const child2 = nodeOps.createElement('div');
    nodeOps.insert(child2, parent2);
    expect(nodeOps.parentNode(child2)).toEqual(parent2);
  });

  it('nextSibling should set correctly', async () => {
    const parent = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');
    const child2 = nodeOps.createElement('div');

    nodeOps.insert(child, parent);
    nodeOps.insert(child2, parent, child);
    expect(nodeOps.nextSibling(child2)).toEqual(child);
  });

  it('setText function should work correctly for text node', async () => {
    const parent = nodeOps.createElement('div');
    const textNode = nodeOps.createText('');
    const text = 'hello';

    nodeOps.insert(textNode, parent);
    nodeOps.setText(textNode, text);
    expect(textNode.text).toEqual(text);
  });

  it('setElementText function should work correctly for element node', async () => {
    const element = nodeOps.createElement('div');
    const text = 'hello';

    nodeOps.setElementText(element, text);
    expect(element.getAttribute('text')).toEqual(text);
  });

  it('setElementText function should work correctly for input element node', async () => {
    const inputElement = nodeOps.createElement('textarea');
    const text = 'hello';

    nodeOps.setElementText(inputElement, text);
    expect(inputElement.getAttribute('value')).toEqual(text);
  });
});
