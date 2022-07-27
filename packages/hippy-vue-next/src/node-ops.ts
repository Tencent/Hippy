/**
 * 实现Vue3自定义渲染器中el的操作方法
 */
import type { HippyComment } from './runtime/comment/hippy-comment';
import { HippyDocument } from './runtime/document/hippy-document';
import type { HippyElement } from './runtime/element/hippy-element';
import type { HippyNode } from './runtime/node/hippy-node';
import type { HippyText } from './runtime/text/hippy-text';

/**
 * 将节点插入指定位置
 *
 * @param child - 子节点
 * @param parent - 父节点
 * @param anchor - 锚节点
 */
function insert(
  child: HippyNode,
  parent: HippyNode,
  anchor: HippyNode | null = null,
): void {
  if (parent.childNodes.indexOf(child) >= 0) {
    // 如果节点已存在，则移动节点
    parent.moveChild(child, anchor);
  } else {
    // 插入节点至anchor位置
    parent.insertBefore(child, anchor);
  }
}

/**
 * 移除指定子节点
 *
 * @param child - 子节点
 */
function remove(child: HippyNode): void {
  const parent: HippyNode | null = child.parentNode;

  if (parent) {
    parent.removeChild(child);
  }
}

/**
 * 创建Element节点
 *
 * @param name - 节点名称
 */
function createElement(name: string): HippyElement {
  return HippyDocument.createElement(name);
}

/**
 * 创建文本节点
 *
 * @param text - 文本内容
 */
function createText(text: string): HippyText {
  return HippyDocument.createTextNode(text);
}

/**
 * 创建评论节点
 *
 * @param text - 评论的文本内容
 */
function createComment(text: string): HippyComment {
  return HippyDocument.createComment(text);
}

/**
 * 给文本节点设置文本内容
 *
 * @param node - 需要设置的节点
 * @param text - 需要设置的文本内容
 */
function setText(node: HippyText, text: string): void {
  // Dom的Node设置text可以直接 node.nodeValue=xxx 来设置
  // hippy element则是设置的attribute text
  node.setText(text);
}

/**
 * 设置element元素的文本属性
 *
 * @param element - 需要设置的元素
 * @param text - 需要设置的文本内容
 */
function setElementText(element: HippyElement, text: string): void {
  element.setText(text);
}

/**
 * 返回节点的父节点
 *
 * @param node - 当前节点
 */
function parentNode(node: HippyNode): HippyNode | null {
  return node.parentNode;
}

/**
 * 返回节点的下一个兄弟节点
 *
 * @param node - 当前节点
 */
function nextSibling(node: HippyNode): HippyNode | null {
  return node.nextSibling;
}

export const nodeOps = {
  insert,
  remove,
  setText,
  setElementText,
  createElement,
  createComment,
  createText,
  parentNode,
  nextSibling,
};
