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

import test, { before } from 'ava';
import { registerBuiltinElements } from '../../../elements';
import DocumentNode from '../../document-node';
import {
  renderToNative,
  renderToNativeWithChildren,
  insertChild,
  removeChild,
} from '../index';
import { setApp } from '../../../util';
import { HIPPY_DEBUG_ADDRESS } from '../../../runtime/constants';
import Native from '../../../runtime/native';

const ROOT_VIEW_ID = 10;

before(() => {
  registerBuiltinElements();
  global.__HIPPYNATIVEGLOBAL__ = {
    Platform: {
    },
  };
  global.Hippy.SceneBuilder = function SceneBuilder() {
    this.create = () => {};
    this.update = () => {};
    this.delete = () => {};
    this.move = () => {};
    this.build = () => {};
    this.addEventListener = () => {};
    this.removeEventListener = () => {};
  };
  setApp({
    $options: {
      rootViewId: 10,
      rootView: '#root',
    },
    $nextTick: (cb) => {
      setTimeout(cb);
    },
  });
});

test('renderToNative simple test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('div');
  const [nativeNode, eventNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 1,
    pId: ROOT_VIEW_ID,
    name: 'View',
    props: {
      attributes: {
        class: '',
        id: '',
        hippyNodeId: '1',
      },
      style: {},
    },
    tagName: 'div',
  }, {}]);
  t.deepEqual(eventNode, {
    id: 1,
    eventList: [],
  });
});

test('renderToNative simple test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 2,
    pId: ROOT_VIEW_ID,
    name: 'View',
    props: {
      style: {},
    },
    tagName: 'div',
  }, {}]);
});

test('renderToNative test with children --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const parentNode = DocumentNode.createElement('div');
  const childNode1 = DocumentNode.createElement('div');
  const childNode2 = DocumentNode.createElement('p');
  const childNode3 = DocumentNode.createElement('span');
  const childNodeText = DocumentNode.createTextNode('Hello');
  childNode3.appendChild(childNodeText);
  const childNode4 = DocumentNode.createElement('img');
  childNode4.setAttribute('src', 'https://hippyjs.org');
  const childNode5 = DocumentNode.createElement('input');
  childNode5.setAttribute('type', 'number');
  const childNode6 = DocumentNode.createElement('textarea');
  childNode6.setAttribute('rows', 10);
  childNode6.setAttribute('type', 'url');
  childNode6.setAttribute('role', 'back button');
  childNode6.setAttribute('aria-label', 'back to home');
  childNode6.setAttribute('aria-disabled', false);
  childNode6.setAttribute('aria-selected', true);
  childNode6.setAttribute('aria-checked', false);
  childNode6.setAttribute('aria-busy', true);
  childNode6.setAttribute('aria-expanded', false);
  childNode6.setAttribute('aria-valuemin', 2);
  childNode6.setAttribute('aria-valuemax', 10);
  childNode6.setAttribute('aria-valuenow', 7);
  childNode6.setAttribute('aria-valuetext', 'high');
  parentNode.appendChild(childNode1);
  parentNode.appendChild(childNode2);
  parentNode.appendChild(childNode3);
  parentNode.appendChild(childNode4);
  parentNode.appendChild(childNode5);
  parentNode.appendChild(childNode6);
  const [nativeLanguages] = renderToNativeWithChildren(ROOT_VIEW_ID, parentNode);
  t.true(Array.isArray(nativeLanguages));
  t.deepEqual(nativeLanguages, [
    [{
      id: 3,
      pId: ROOT_VIEW_ID,
      name: 'View',
      props: {
        attributes: {
          class: '',
          id: '',
          hippyNodeId: '3',
        },
        style: {},
      },
      tagName: 'div',
    }, {}],
    [{
      id: 4,
      pId: 3,
      name: 'View',
      props: {
        attributes: {
          class: '',
          id: '',
          hippyNodeId: '4',
        },
        style: {},
      },
      tagName: 'div',
    }, {}],
    [{
      id: 5,
      pId: 3,
      name: 'Text',
      props: {
        attributes: {
          class: '',
          id: '',
          hippyNodeId: '5',
        },
        text: '',
        style: {
          color: 4278190080,
        },
      },
      tagName: 'p',
    }, {}],
    [{
      id: 6,
      pId: 3,
      name: 'Text',
      props: {
        attributes: {
          class: '',
          id: '',
          hippyNodeId: '6',
        },
        text: 'Hello',
        style: {
          color: 4278190080,
        },
      },
      tagName: 'span',
    }, {}],
    [{
      id: 8,
      pId: 3,
      name: 'Image',
      props: {
        attributes: {
          class: '',
          id: '',
          src: 'https://hippyjs.org',
          hippyNodeId: '8',
        },
        src: 'https://hippyjs.org',
        style: {
          backgroundColor: 0,
        },
      },
      tagName: 'img',
    }, {}],
    [{
      id: 9,
      pId: 3,
      name: 'TextInput',
      props: {
        attributes: {
          class: '',
          id: '',
          type: 'number',
          hippyNodeId: '9',
        },
        keyboardType: 'numeric',
        multiline: false,
        numberOfLines: 1,
        underlineColorAndroid: 0,
        style: {
          color: 4278190080,
          padding: 0,
        },
      },
      tagName: 'input',
    }, {}],
    [{
      id: 11,
      pId: 3,
      name: 'TextInput',
      props: {
        attributes: {
          class: '',
          id: '',
          hippyNodeId: '11',
          rows: 10,
          type: 'url',
          'aria-busy': true,
          'aria-checked': false,
          'aria-disabled': false,
          'aria-expanded': false,
          'aria-label': 'back to home',
          'aria-selected': true,
          'aria-valuemax': 10,
          'aria-valuemin': 2,
          'aria-valuenow': 7,
          'aria-valuetext': 'high',
          role: 'back button',
        },
        accessibilityRole: 'back button',
        accessibilityLabel: 'back to home',
        accessibilityState: {
          disabled: false,
          selected: true,
          checked: false,
          busy: true,
          expanded: false,
        },
        accessibilityValue: {
          now: 7,
          min: 2,
          max: 10,
          text: 'high',
        },
        multiline: true,
        keyboardType: 'url',
        numberOfLines: 10,
        underlineColorAndroid: 0,
        style: {
          color: 4278190080,
          padding: 0,
        },
      },
      tagName: 'textarea',
    }, {}],
  ]);
});

test('renderToNative test with children --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const parentNode = DocumentNode.createElement('div');
  const childNode1 = DocumentNode.createElement('div');
  const childNode2 = DocumentNode.createElement('p');
  const childNode3 = DocumentNode.createElement('span');
  const childNodeText = DocumentNode.createTextNode('Hello');
  childNode3.appendChild(childNodeText);
  const childNode4 = DocumentNode.createElement('img');
  childNode4.setAttribute('src', 'https://hippyjs.org');
  const childNode5 = DocumentNode.createElement('input');
  childNode5.setAttribute('type', 'number');
  const childNode6 = DocumentNode.createElement('textarea');
  childNode6.setAttribute('rows', 10);
  childNode6.setAttribute('type', 'url');
  parentNode.appendChild(childNode1);
  parentNode.appendChild(childNode2);
  parentNode.appendChild(childNode3);
  parentNode.appendChild(childNode4);
  parentNode.appendChild(childNode5);
  parentNode.appendChild(childNode6);
  const [nativeLanguages] = renderToNativeWithChildren(ROOT_VIEW_ID, parentNode);
  t.true(Array.isArray(nativeLanguages));
  t.deepEqual(nativeLanguages, [
    [{
      id: 12,
      pId: ROOT_VIEW_ID,
      name: 'View',
      props: {
        style: {},
      },
      tagName: 'div',
    }, {}],
    [{
      id: 13,
      pId: 12,
      name: 'View',
      props: {
        style: {},
      },
      tagName: 'div',
    }, {}],
    [{
      id: 14,
      pId: 12,
      name: 'Text',
      props: {
        text: '',
        style: {
          color: 4278190080,
        },
      },
      tagName: 'p',
    }, {}],
    [{
      id: 15,
      pId: 12,
      name: 'Text',
      props: {
        text: 'Hello',
        style: {
          color: 4278190080,
        },
      },
      tagName: 'span',
    }, {}],
    [{
      id: 17,
      pId: 12,
      name: 'Image',
      props: {
        src: 'https://hippyjs.org',
        style: {
          backgroundColor: 0,
        },
      },
      tagName: 'img',
    }, {}],
    [{
      id: 18,
      pId: 12,
      name: 'TextInput',
      props: {
        keyboardType: 'numeric',
        multiline: false,
        numberOfLines: 1,
        underlineColorAndroid: 0,
        style: {
          color: 4278190080,
          padding: 0,
        },
      },
      tagName: 'input',
    }, {}],
    [{
      id: 19,
      pId: 12,
      name: 'TextInput',
      props: {
        multiline: true,
        keyboardType: 'url',
        numberOfLines: 10,
        underlineColorAndroid: 0,
        style: {
          color: 4278190080,
          padding: 0,
        },
      },
      tagName: 'textarea',
    }, {}],
  ]);
});


test('img attributeMaps test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('img');
  node.setAttribute('src', 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png');
  node.setAttribute('alt', 'Test');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 21,
    name: 'Image',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        alt: 'Test',
        class: '',
        id: '',
        hippyNodeId: '21',
        src: 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png',
      },
      alt: 'Test',
      src: 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png',
      style: {
        backgroundColor: 0,
      },
    },
    tagName: 'img',
  }, {}]);
});

test('img attributeMaps test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('img');
  node.setAttribute('src', 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png');
  node.setAttribute('alt', 'Test');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 22,
    name: 'Image',
    pId: ROOT_VIEW_ID,
    props: {
      alt: 'Test',
      src: 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png',
      style: {
        backgroundColor: 0,
      },
    },
    tagName: 'img',
  }, {}]);
});

test('span attributeMaps test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('span');
  node.setAttribute('text', 'Test');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 23,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
        hippyNodeId: '23',
      },
      text: 'Test',
      style: {
        color: 4278190080,
      },
    },
    tagName: 'span',
  }, {}]);
});

test('span attributeMaps test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('span');
  node.setAttribute('text', 'Test');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 24,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      text: 'Test',
      style: {
        color: 4278190080,
      },
    },
    tagName: 'span',
  }, {}]);
});

test('a href attribute test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('a');
  node.setAttribute('text', 'Test');
  node.setAttribute('href', '/test');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 25,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        href: '/test',
        id: '',
        hippyNodeId: '25',
      },
      text: 'Test',
      href: '/test',
      style: {
        color: 4278190318,
      },
    },
    tagName: 'a',
  }, {}]);
});

test('a href attribute test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('a');
  node.setAttribute('text', 'Test');
  node.setAttribute('href', '/test');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 26,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      text: 'Test',
      href: '/test',
      style: {
        color: 4278190318,
      },
    },
    tagName: 'a',
  }, {}]);
});

test('a href attribute with http prefix test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('a');
  node.setAttribute('text', 'Test');
  node.setAttribute('href', 'https://hippyjs.org');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 27,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        href: 'https://hippyjs.org',
        id: '',
        hippyNodeId: '27',
      },
      text: 'Test',
      href: '',
      style: {
        color: 4278190318,
      },
    },
    tagName: 'a',
  }, {}]);
});

test('a href attribute with http prefix test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('a');
  node.setAttribute('text', 'Test');
  node.setAttribute('href', 'https://hippyjs.org');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 28,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      text: 'Test',
      href: '',
      style: {
        color: 4278190318,
      },
    },
    tagName: 'a',
  }, {}]);
});

test('div with overflow-X scroll test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  Native.Localization = { direction: 0 };
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowX', 'scroll');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 29,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
        hippyNodeId: '29',
      },
      horizontal: true,
      style: {
        flexDirection: 'row',
        overflowX: 'scroll',
      },
    },
    tagName: 'div',
  }, {}]);
  Native.Localization = { direction: 1 };
  const [nativeNode2] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode2, [{
    id: 29,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
        hippyNodeId: '29',
      },
      horizontal: true,
      style: {
        flexDirection: 'row-reverse',
        overflowX: 'scroll',
      },
    },
    tagName: 'div',
  }, {}]);
});

test('div with overflow-X scroll test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  Native.Localization = { direction: 0 };
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowX', 'scroll');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 31,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      horizontal: true,
      style: {
        flexDirection: 'row',
        overflowX: 'scroll',
      },
    },
    tagName: 'div',
  }, {}]);
  Native.Localization = { direction: 1 };
  const [nativeNode2] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode2, [{
    id: 31,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      horizontal: true,
      style: {
        flexDirection: 'row-reverse',
        overflowX: 'scroll',
      },
    },
    tagName: 'div',
  }, {}]);
});

test('div with overflowY scroll test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowY', 'scroll');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 32,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
        hippyNodeId: '32',
      },
      style: {
        overflowY: 'scroll',
      },
    },
    tagName: 'div',
  }, {}]);
});

test('div with overflowY scroll test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowY', 'scroll');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 33,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      style: {
        overflowY: 'scroll',
      },
    },
    tagName: 'div',
  }, {}]);
});

test('div with overflowX and overflowY scroll test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowX', 'scroll');
  node.setStyle('overflowY', 'scroll');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 34,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
        hippyNodeId: '34',
      },
      style: {
        overflowX: 'scroll',
        overflowY: 'scroll',
      },
    },
    tagName: 'div',
  }, {}]);
});

test('div with overflowX and overflowY scroll test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowX', 'scroll');
  node.setStyle('overflowY', 'scroll');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 35,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      style: {
        overflowX: 'scroll',
        overflowY: 'scroll',
      },
    },
    tagName: 'div',
  }, {}]);
});

test('div with child node and overflowX scroll test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('div');
  const childNode = DocumentNode.createElement('div');
  node.setStyle('overflowY', 'scroll');
  node.appendChild(childNode);
  const  [nativeLanguages] = renderToNativeWithChildren(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguages, [
    [{
      id: 36,
      name: 'ScrollView',
      pId: ROOT_VIEW_ID,
      props: {
        attributes: {
          class: '',
          id: '',
          hippyNodeId: '36',
        },
        style: {
          overflowY: 'scroll',
        },
      },
      tagName: 'div',
    }, {}],
    [{
      id: 37,
      name: 'View',
      pId: 36,
      props: {
        attributes: {
          class: '',
          id: '',
          hippyNodeId: '37',
        },
        style: {
          collapsable: false,
        },
      },
      tagName: 'div',
    }, {}],
  ]);
});

test('div with child node and overflowX scroll test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  const childNode = DocumentNode.createElement('div');
  node.setStyle('overflowY', 'scroll');
  node.appendChild(childNode);
  const [nativeLanguages] = renderToNativeWithChildren(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguages, [
    [{
      id: 38,
      name: 'ScrollView',
      pId: ROOT_VIEW_ID,
      props: {
        style: {
          overflowY: 'scroll',
        },
      },
      tagName: 'div',
    }, {}],
    [{
      id: 39,
      name: 'View',
      pId: 38,
      props: {
        style: {
          collapsable: false,
        },
      },
      tagName: 'div',
    }, {}],
  ]);
});

test('insertChild test', (t) => {
  t.is(insertChild(), undefined);
  const parentNode = DocumentNode.createElement('div');
  const pNode = DocumentNode.createElement('p');
  const textNode = DocumentNode.createTextNode('Hello');
  parentNode.nodeId = 3;
  parentNode.appendChild(pNode);
  pNode.appendChild(textNode);
  insertChild(parentNode, pNode);
  insertChild(pNode, textNode);
});

test('removeChild test', (t) => {
  t.is(removeChild(), undefined);
  const pNode = DocumentNode.createElement('p');
  const textNode = DocumentNode.createTextNode('Hello');
  pNode.appendChild(textNode);
  t.is(removeChild(pNode, textNode), undefined);
  const parentNode = DocumentNode.createElement('div');
  parentNode.appendChild(pNode);
  t.is(removeChild(parentNode, pNode), undefined);
});

test('text element with number text test', (t) => {
  const parentNode = DocumentNode.createElement('div');
  parentNode.setText(0);
  parentNode.setAttribute('test', '123');
  t.is(parentNode.getAttribute('text'), '0');
  t.is(parentNode.getAttribute('test'), '123');
  parentNode.setAttribute('test', 123);
  t.is(parentNode.getAttribute('test'), 123);
  // debug mode
  process.env.NODE_ENV = 'test';
  t.throws(() => {
    parentNode.setText(null);
  }, TypeError);
});

test('Image.setStyle(background-color) test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const imgWithoutBg = DocumentNode.createElement('img');
  const [withoutBg] = renderToNative(ROOT_VIEW_ID, imgWithoutBg);
  t.deepEqual(withoutBg, [{
    id: 48,
    pId: 10,
    name: 'Image',
    props: {
      attributes: {
        class: '',
        id: '',
        hippyNodeId: '48',
      },
      style: {
        backgroundColor: 0,
      },
    },
    tagName: 'img',
  }, {}]);
  const imgWithBg = DocumentNode.createElement('img');
  imgWithBg.setStyle('backgroundColor', '#abcdef');
  const [withBg] = renderToNative(ROOT_VIEW_ID, imgWithBg);
  t.deepEqual(withBg, [{
    id: 49,
    pId: 10,
    name: 'Image',
    props: {
      attributes: {
        class: '',
        id: '',
        hippyNodeId: '49',
      },
      style: {
        backgroundColor: 4289449455,
      },
    },
    tagName: 'img',
  }, {}]);
});

test('Image.setStyle(background-color) test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const imgWithoutBg = DocumentNode.createElement('img');
  const [withoutBg] = renderToNative(ROOT_VIEW_ID, imgWithoutBg);
  t.deepEqual(withoutBg, [{
    id: 51,
    pId: 10,
    name: 'Image',
    props: {
      style: {
        backgroundColor: 0,
      },
    },
    tagName: 'img',
  }, {}]);
  const imgWithBg = DocumentNode.createElement('img');
  imgWithBg.setStyle('backgroundColor', '#abcdef');
  const [withBg] = renderToNative(ROOT_VIEW_ID, imgWithBg);
  t.deepEqual(withBg, [{
    id: 52,
    pId: 10,
    name: 'Image',
    props: {
      style: {
        backgroundColor: 4289449455,
      },
    },
    tagName: 'img',
  }, {}]);
});

test('img with accessibility test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('img');
  node.setAttribute('role', 'back button');
  node.setAttribute('aria-label', 'back to home');
  node.setAttribute('aria-disabled', false);
  node.setAttribute('aria-selected', true);
  node.setAttribute('aria-checked', false);
  node.setAttribute('aria-busy', true);
  node.setAttribute('aria-expanded', false);
  node.setAttribute('aria-valuemin', 2);
  node.setAttribute('aria-valuemax', 10);
  node.setAttribute('aria-valuenow', 7);
  node.setAttribute('aria-valuetext', 'high');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 53,
    name: 'Image',
    pId: 10,
    props: {
      attributes: {
        class: '',
        id: '',
        hippyNodeId: '53',
        'aria-busy': true,
        'aria-checked': false,
        'aria-disabled': false,
        'aria-expanded': false,
        'aria-label': 'back to home',
        'aria-selected': true,
        'aria-valuemax': 10,
        'aria-valuemin': 2,
        'aria-valuenow': 7,
        'aria-valuetext': 'high',
        role: 'back button',
      },
      accessibilityRole: 'back button',
      accessibilityLabel: 'back to home',
      accessibilityState: {
        disabled: false,
        selected: true,
        checked: false,
        busy: true,
        expanded: false,
      },
      accessibilityValue: {
        now: 7,
        min: 2,
        max: 10,
        text: 'high',
      },
      style: {
        backgroundColor: 0,
      },
    },
    tagName: 'img',
  }, {}]);
});

test('img with accessibility test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('img');
  node.setAttribute('role', 'back button');
  node.setAttribute('aria-label', 'back to home');
  node.setAttribute('aria-disabled', false);
  node.setAttribute('aria-selected', true);
  node.setAttribute('aria-checked', false);
  node.setAttribute('aria-busy', true);
  node.setAttribute('aria-expanded', false);
  node.setAttribute('aria-valuemin', 2);
  node.setAttribute('aria-valuemax', 10);
  node.setAttribute('aria-valuenow', 7);
  node.setAttribute('aria-valuetext', 'high');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 54,
    name: 'Image',
    pId: 10,
    props: {
      accessibilityRole: 'back button',
      accessibilityLabel: 'back to home',
      accessibilityState: {
        disabled: false,
        selected: true,
        checked: false,
        busy: true,
        expanded: false,
      },
      accessibilityValue: {
        now: 7,
        min: 2,
        max: 10,
        text: 'high',
      },
      style: {
        backgroundColor: 0,
      },
    },
    tagName: 'img',
  }, {}]);
});

test('div with backgroundImage local path test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('div');
  const originalPath = 'assets/DefaultSource.png';
  node.setStyle('backgroundImage', originalPath);
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 55,
    name: 'View',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
        hippyNodeId: '55',
      },
      style: {
        backgroundImage: `${HIPPY_DEBUG_ADDRESS}${originalPath}`,
      },
    },
    tagName: 'div',
  }, {}]);
});

test('div with backgroundImage local path test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  const originalPath = 'assets/DefaultSource.png';
  node.setStyle('backgroundImage', originalPath);
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 56,
    name: 'View',
    pId: ROOT_VIEW_ID,
    props: {
      style: {
        backgroundImage: `hpfile://./${originalPath}`,
      },
    },
    tagName: 'div',
  }, {}]);
});

test('div with accessibility test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('div');
  node.setAttribute('role', 'back button');
  node.setAttribute('aria-label', 'back to home');
  node.setAttribute('aria-disabled', false);
  node.setAttribute('aria-selected', true);
  node.setAttribute('aria-checked', false);
  node.setAttribute('aria-busy', true);
  node.setAttribute('aria-expanded', false);
  node.setAttribute('aria-valuemin', 2);
  node.setAttribute('aria-valuemax', 10);
  node.setAttribute('aria-valuenow', 7);
  node.setAttribute('aria-valuetext', 'high');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 57,
    name: 'View',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
        hippyNodeId: '57',
        'aria-busy': true,
        'aria-checked': false,
        'aria-disabled': false,
        'aria-expanded': false,
        'aria-selected': true,
        'aria-label': 'back to home',
        'aria-valuemax': 10,
        'aria-valuemin': 2,
        'aria-valuenow': 7,
        'aria-valuetext': 'high',
        role: 'back button',
      },
      accessibilityRole: 'back button',
      accessibilityLabel: 'back to home',
      accessibilityState: {
        disabled: false,
        selected: true,
        checked: false,
        busy: true,
        expanded: false,
      },
      accessibilityValue: {
        now: 7,
        min: 2,
        max: 10,
        text: 'high',
      },
      style: {},
    },
    tagName: 'div',
  }, {}]);
});

test('div with accessibility test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  node.setAttribute('role', 'back button');
  node.setAttribute('aria-label', 'back to home');
  node.setAttribute('aria-disabled', false);
  node.setAttribute('aria-selected', true);
  node.setAttribute('aria-checked', false);
  node.setAttribute('aria-busy', true);
  node.setAttribute('aria-expanded', false);
  node.setAttribute('aria-valuemin', 2);
  node.setAttribute('aria-valuemax', 10);
  node.setAttribute('aria-valuenow', 7);
  node.setAttribute('aria-valuetext', 'high');
  const [nativeNode] = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeNode, [{
    id: 58,
    name: 'View',
    pId: ROOT_VIEW_ID,
    props: {
      accessibilityRole: 'back button',
      accessibilityLabel: 'back to home',
      accessibilityState: {
        disabled: false,
        selected: true,
        checked: false,
        busy: true,
        expanded: false,
      },
      accessibilityValue: {
        now: 7,
        min: 2,
        max: 10,
        text: 'high',
      },
      style: {},
    },
    tagName: 'div',
  }, {}]);
});