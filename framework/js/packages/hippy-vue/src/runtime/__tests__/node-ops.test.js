/* eslint-disable no-underscore-dangle */

import test, { before } from 'ava';
import * as nodeOps from '../node-ops';
import CommentNode from '../../renderer/comment-node';
import DocumentNode from '../../renderer/document-node';
import ElementNode from '../../renderer/element-node';
import TextNode from '../../renderer/text-node';
import { setVue, setApp } from '../../util';

function createElement(tagName) {
  return nodeOps.createElement(tagName);
}

before(() => {
  setVue({
    config: {
      silent: true,
    },
  });
  setApp({
    $options: {
      rootView: '#root',
    },
    $nextTick: (cb) => {
      setTimeout(cb);
    },
  });
});

test('create new DocumentNode', (t) => {
  const documentNode = new DocumentNode();
  t.is(documentNode.documentElement.tagName, 'document');
  t.is(documentNode.createComment, DocumentNode.createComment);
  t.is(documentNode.createElement, DocumentNode.createElement);
  t.is(documentNode.createElementNS, DocumentNode.createElementNS);
  t.is(documentNode.createTextNode, DocumentNode.createTextNode);
});

test('createElement test', (t) => {
  const element = nodeOps.createElement('a');
  t.true(element instanceof ElementNode);
  t.is(element.tagName, 'a');
});

test('createElementNS test', (t) => {
  const element = nodeOps.createElementNS('Native', 'Link');
  t.true(element instanceof ElementNode);
  t.is(element.tagName, 'native:link');
});

test('createTextNode test', (t) => {
  const element = nodeOps.createTextNode('Hello');
  t.true(element instanceof TextNode);
  t.is(element.text, 'Hello');
});

test('createComment test', (t) => {
  const element = nodeOps.createComment('World');
  t.true(element instanceof CommentNode);
  t.is(element.text, 'World');
});

test('insertBefore without referenceNode', (t) => {
  const parentNode = createElement('div');
  const newNode = createElement('div');
  nodeOps.insertBefore(parentNode, newNode);
  t.is(parentNode.childNodes.length, 1);
  t.is(parentNode.childNodes[0], newNode);
});

test('insertBefore with referenceNode', (t) => {
  const parentNode = createElement('div');
  const newNode = createElement('div');
  const referenceNode = createElement('p');
  nodeOps.insertBefore(parentNode, referenceNode);
  t.is(parentNode.childNodes.length, 1);
  t.is(parentNode.childNodes[0], referenceNode);
  nodeOps.insertBefore(parentNode, newNode, referenceNode);
  t.is(parentNode.childNodes.length, 2);
  t.is(parentNode.childNodes[0], newNode);
  t.is(parentNode.childNodes[1], referenceNode);
});

test('insertBefore a TextNode', (t) => {
  const text = 'Hello world';
  const parentNode = createElement('div');
  const textNode = nodeOps.createTextNode(text);
  nodeOps.insertBefore(parentNode, textNode);
  t.is(parentNode.getAttribute('text'), text);
});

test('insertBefore error when no childNode', (t) => {
  const parentNode = createElement('div');
  const err = t.throws(() => {
    nodeOps.insertBefore(parentNode);
  }, Error);
  t.is(err.message, 'Can\'t insert child.');
});

test('insertBefore error when childNode have another parent', (t) => {
  const parentNode = createElement('div');
  const parentNode2 = createElement('div');
  const childNode = createElement('p');
  nodeOps.insertBefore(parentNode, childNode);
  const err = t.throws(() => {
    nodeOps.insertBefore(parentNode2, childNode);
  }, Error);
  t.is(err.message, 'Can\'t append child, because it already has a different parent.');
});

test('insertBefore error when referenceNode have another parent', (t) => {
  const parentNode = createElement('div');
  const parentNode2 = createElement('div');
  const childNode = createElement('p');
  const childNode2 = createElement('p');
  nodeOps.appendChild(parentNode, childNode);
  nodeOps.insertBefore(parentNode, childNode2, childNode);
  const err = t.throws(() => {
    nodeOps.insertBefore(parentNode2, childNode, childNode2);
  }, Error);
  t.is(err.message, 'Can\'t insert child, because the reference node has a different parent.');
});

test('insertBefore error when childNode with referenceNode have another parent', (t) => {
  const parentNode = createElement('div');
  const parentNode2 = createElement('div');
  const childNode = createElement('p');
  const childNode2 = createElement('p');
  nodeOps.appendChild(parentNode, childNode);
  nodeOps.appendChild(parentNode2, childNode2);
  const err = t.throws(() => {
    nodeOps.insertBefore(parentNode, childNode2, childNode);
  }, Error);
  t.is(err.message, 'Can\'t insert child, because it already has a different parent.');
});

test('removeChild test', (t) => {
  const parentNode = createElement('div');
  const childNode1 = createElement('div');
  const childNode2 = createElement('div');
  const childNode3 = createElement('div');
  nodeOps.appendChild(parentNode, childNode1);
  nodeOps.appendChild(parentNode, childNode2);
  nodeOps.appendChild(parentNode, childNode3);
  nodeOps.removeChild(parentNode, childNode2);
  t.is(parentNode.childNodes.length, 2);
});

test('removeChild a TextNode test', (t) => {
  const text = 'Hello world';
  const parentNode = createElement('div');
  const textNode = nodeOps.createTextNode(text);
  nodeOps.insertBefore(parentNode, textNode);
  t.is(parentNode.getAttribute('text'), text);
  nodeOps.removeChild(parentNode, textNode);
  t.is(parentNode.getAttribute('text'), '');
});

test('removeChild error when no childNode', (t) => {
  const parentNode = createElement('div');
  const err = t.throws(() => {
    nodeOps.removeChild(parentNode);
  }, Error);
  t.is(err.message, 'Can\'t remove child.');
});

test('removeChild error when childNode has no parent', (t) => {
  const parentNode = createElement('div');
  const childNode = createElement('div');
  const err = t.throws(() => {
    nodeOps.removeChild(parentNode, childNode);
  }, Error);
  t.is(err.message, 'Can\'t remove child, because it has no parent.');
});

test('removeChild error when childNode with another parentNode', (t) => {
  const parentNode = createElement('div');
  const parentNode2 = createElement('div');
  const childNode = createElement('div');
  nodeOps.appendChild(parentNode2, childNode);
  const err = t.throws(() => {
    nodeOps.removeChild(parentNode, childNode);
  }, Error);
  t.is(err.message, 'Can\'t remove child, because it has a different parent.');
});

test('appendChild test', (t) => {
  const parentNode = createElement('div');
  const newNode = createElement('div');
  nodeOps.appendChild(parentNode, newNode);
  t.is(parentNode.childNodes.length, 1);
  t.is(parentNode.childNodes[0], newNode);
  const newNode2 = createElement('p');
  nodeOps.appendChild(parentNode, newNode2);
  t.is(parentNode.childNodes.length, 2);
  t.is(parentNode.childNodes[1], newNode2);
});

test('appendChild error when no childNode', (t) => {
  const parentNode = createElement('div');
  const err = t.throws(() => {
    nodeOps.appendChild(parentNode);
  }, Error);
  t.is(err.message, 'Can\'t append child.');
});

test('parentNode test', (t) => {
  const parentNode = createElement('div');
  const newNode = createElement('div');
  nodeOps.insertBefore(parentNode, newNode);
  t.is(nodeOps.parentNode(newNode), parentNode);
  const parentNode2 = createElement('div');
  const newNode2 = createElement('div');
  nodeOps.appendChild(parentNode2, newNode2);
  t.is(nodeOps.parentNode(newNode2), parentNode2);
});

test('nextSibling test', (t) => {
  const parentNode = createElement('div');
  const newNode = createElement('div');
  const newNode2 = createElement('div');
  nodeOps.appendChild(parentNode, newNode);
  nodeOps.insertBefore(parentNode, newNode2, newNode);
  t.is(nodeOps.nextSibling(newNode2), newNode);
});

test('tagName test', (t) => {
  const elementNode = createElement('div');
  t.is(nodeOps.tagName(elementNode), 'div');
});

test('setTextContent for ElementNode test', (t) => {
  // ElementNode setText
  const parentNode = createElement('div');
  const text = 'Hello world';
  nodeOps.setTextContent(parentNode, text);
  t.is(parentNode.getAttribute('text'), text);
});

test('setTextContent for TextNode test', (t) => {
  const parentNode = createElement('div');
  const textNode = nodeOps.createTextNode('');
  const text = 'Hello world';
  nodeOps.appendChild(parentNode, textNode);
  nodeOps.setTextContent(textNode, text);
  t.is(textNode.text, text);
});

test('setTextContent for textarea element test', (t) => {
  const text = 'Hello world';
  const textAreaNode = createElement('textarea');
  nodeOps.setTextContent(textAreaNode, text);
  t.is(textAreaNode.getAttribute('value'), text);
});

test('setAttribute test', (t) => {
  const node = createElement('div');
  const key = 'key';
  const value = 'value';
  nodeOps.setAttribute(node, key, value);
  t.is(node.getAttribute(key), value);
});

test('setStyleScope test', (t) => {
  const node = createElement('div');
  const styleScopeId = 123;
  t.is(nodeOps.setStyleScope(node, styleScopeId), undefined);
  t.is(node._styleScopeId, styleScopeId.toString());
});
