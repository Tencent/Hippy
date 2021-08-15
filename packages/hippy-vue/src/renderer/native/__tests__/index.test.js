// TODO: Add UIManagerModule mock module to verify result correction.

import test from 'ava';
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

const ROOT_VIEW_ID = 10;

test.before(() => {
  registerBuiltinElements();
  global.__HIPPYNATIVEGLOBAL__ = {
    Platform: {
    },
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
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 1,
    pId: ROOT_VIEW_ID,
    index: 0,
    name: 'View',
    props: {
      attributes: {
        class: '',
        id: '',
      },
      style: {},
    },
    tagName: 'div',
  });
});

test('renderToNative simple test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 2,
    pId: ROOT_VIEW_ID,
    index: 0,
    name: 'View',
    props: {
      style: {},
    },
  });
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
  childNode4.setAttribute('src', 'http://www.qq.com');
  const childNode5 = DocumentNode.createElement('input');
  childNode5.setAttribute('type', 'number');
  const childNode6 = DocumentNode.createElement('textarea');
  childNode6.setAttribute('rows', 10);
  childNode6.setAttribute('type', 'url');
  childNode6.addEventListener('typing', () => {});
  parentNode.appendChild(childNode1);
  parentNode.appendChild(childNode2);
  parentNode.appendChild(childNode3);
  parentNode.appendChild(childNode4);
  parentNode.appendChild(childNode5);
  parentNode.appendChild(childNode6);
  const nativeLanguage = renderToNativeWithChildren(ROOT_VIEW_ID, parentNode);
  t.true(Array.isArray(nativeLanguage));
  t.deepEqual(nativeLanguage, [
    {
      id: 3,
      pId: ROOT_VIEW_ID,
      index: 0,
      name: 'View',
      props: {
        attributes: {
          class: '',
          id: '',
        },
        style: {},
      },
      tagName: 'div',
    },
    {
      id: 4,
      pId: 3,
      index: 0,
      name: 'View',
      props: {
        attributes: {
          class: '',
          id: '',
        },
        style: {},
      },
      tagName: 'div',
    },
    {
      id: 5,
      pId: 3,
      index: 1,
      name: 'Text',
      props: {
        attributes: {
          class: '',
          id: '',
        },
        text: '',
        style: {
          color: 4278190080,
        },
      },
      tagName: 'p',
    },
    {
      id: 6,
      pId: 3,
      index: 2,
      name: 'Text',
      props: {
        attributes: {
          class: '',
          id: '',
        },
        text: 'Hello',
        style: {
          color: 4278190080,
        },
      },
      tagName: 'span',
    },
    {
      id: 8,
      pId: 3,
      index: 3,
      name: 'Image',
      props: {
        attributes: {
          class: '',
          id: '',
          src: 'http://www.qq.com',
        },
        src: 'http://www.qq.com',
        style: {
          backgroundColor: 0,
        },
      },
      tagName: 'img',
    },
    {
      id: 9,
      pId: 3,
      index: 4,
      name: 'TextInput',
      props: {
        attributes: {
          class: '',
          id: '',
          type: 'number',
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
    },
    {
      id: 11,
      pId: 3,
      index: 5,
      name: 'TextInput',
      props: {
        attributes: {
          class: '',
          id: '',
          rows: 10,
          type: 'url',
        },
        multiline: true,
        onTyping: true,
        keyboardType: 'url',
        numberOfLines: 10,
        underlineColorAndroid: 0,
        style: {
          color: 4278190080,
          padding: 0,
        },
      },
      tagName: 'textarea',
    },
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
  childNode4.setAttribute('src', 'http://www.qq.com');
  const childNode5 = DocumentNode.createElement('input');
  childNode5.setAttribute('type', 'number');
  const childNode6 = DocumentNode.createElement('textarea');
  childNode6.setAttribute('rows', 10);
  childNode6.setAttribute('type', 'url');
  childNode6.addEventListener('typing', () => {});
  parentNode.appendChild(childNode1);
  parentNode.appendChild(childNode2);
  parentNode.appendChild(childNode3);
  parentNode.appendChild(childNode4);
  parentNode.appendChild(childNode5);
  parentNode.appendChild(childNode6);
  const nativeLanguage = renderToNativeWithChildren(ROOT_VIEW_ID, parentNode);
  t.true(Array.isArray(nativeLanguage));
  t.deepEqual(nativeLanguage, [
    {
      id: 12,
      pId: ROOT_VIEW_ID,
      index: 0,
      name: 'View',
      props: {
        style: {},
      },
    },
    {
      id: 13,
      pId: 12,
      index: 0,
      name: 'View',
      props: {
        style: {},
      },
    },
    {
      id: 14,
      pId: 12,
      index: 1,
      name: 'Text',
      props: {
        text: '',
        style: {
          color: 4278190080,
        },
      },
    },
    {
      id: 15,
      pId: 12,
      index: 2,
      name: 'Text',
      props: {
        text: 'Hello',
        style: {
          color: 4278190080,
        },
      },
    },
    {
      id: 17,
      pId: 12,
      index: 3,
      name: 'Image',
      props: {
        src: 'http://www.qq.com',
        style: {
          backgroundColor: 0,
        },
      },
    },
    {
      id: 18,
      pId: 12,
      index: 4,
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
    },
    {
      id: 19,
      pId: 12,
      index: 5,
      name: 'TextInput',
      props: {
        multiline: true,
        onTyping: true,
        keyboardType: 'url',
        numberOfLines: 10,
        underlineColorAndroid: 0,
        style: {
          color: 4278190080,
          padding: 0,
        },
      },
    },
  ]);
});

test('ul numberOfRows test', (t) => {
  const parentNode = DocumentNode.createElement('ul');
  const childNode1 = DocumentNode.createElement('li');
  parentNode.appendChild(childNode1);
  const nativeLanguage1 = renderToNativeWithChildren(ROOT_VIEW_ID, parentNode);
  t.is(nativeLanguage1[0].props.numberOfRows, 1);
  const childNode2 = DocumentNode.createElement('li');
  parentNode.appendChild(childNode2);
  const nativeLanguage2 = renderToNativeWithChildren(ROOT_VIEW_ID, parentNode);
  t.is(nativeLanguage2[0].props.numberOfRows, 2);
  parentNode.setAttribute('numberOfRows', 10);
  const nativeLanguage3 = renderToNativeWithChildren(ROOT_VIEW_ID, parentNode);
  t.is(nativeLanguage3[0].props.numberOfRows, 10);
});

test('img attributeMaps test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('img');
  node.setAttribute('src', 'http://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png');
  node.setAttribute('alt', 'Test');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 24,
    index: 0,
    name: 'Image',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        alt: 'Test',
        class: '',
        id: '',
        src: 'http://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png',
      },
      alt: 'Test',
      src: 'http://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png',
      style: {
        backgroundColor: 0,
      },
    },
    tagName: 'img',
  });
});

test('img attributeMaps test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('img');
  node.setAttribute('src', 'http://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png');
  node.setAttribute('alt', 'Test');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 25,
    index: 0,
    name: 'Image',
    pId: ROOT_VIEW_ID,
    props: {
      alt: 'Test',
      src: 'http://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png',
      style: {
        backgroundColor: 0,
      },
    },
  });
});

test('span attributeMaps test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('span');
  node.setAttribute('text', 'Test');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 26,
    index: 0,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
      },
      text: 'Test',
      style: {
        color: 4278190080,
      },
    },
    tagName: 'span',
  });
});

test('span attributeMaps test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('span');
  node.setAttribute('text', 'Test');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 27,
    index: 0,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      text: 'Test',
      style: {
        color: 4278190080,
      },
    },
  });
});

test('a href attribute test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('a');
  node.setAttribute('text', 'Test');
  node.setAttribute('href', '/test');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 28,
    index: 0,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        href: '/test',
        id: '',
      },
      text: 'Test',
      href: '/test',
      style: {
        color: 4278190318,
      },
    },
    tagName: 'a',
  });
});

test('a href attribute test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('a');
  node.setAttribute('text', 'Test');
  node.setAttribute('href', '/test');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 29,
    index: 0,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      text: 'Test',
      href: '/test',
      style: {
        color: 4278190318,
      },
    },
  });
});

test('a href attribute with http prefix test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('a');
  node.setAttribute('text', 'Test');
  node.setAttribute('href', 'http://www.qq.com');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 31,
    index: 0,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        href: 'http://www.qq.com',
        id: '',
      },
      text: 'Test',
      href: '',
      style: {
        color: 4278190318,
      },
    },
    tagName: 'a',
  });
});

test('a href attribute with http prefix test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('a');
  node.setAttribute('text', 'Test');
  node.setAttribute('href', 'http://www.qq.com');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 32,
    index: 0,
    name: 'Text',
    pId: ROOT_VIEW_ID,
    props: {
      text: 'Test',
      href: '',
      style: {
        color: 4278190318,
      },
    },
  });
});

test('div with overflow-X scroll test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowX', 'scroll');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 33,
    index: 0,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
      },
      horizontal: true,
      style: {
        overflowX: 'scroll',
      },
    },
    tagName: 'div',
  });
});

test('div with overflow-X scroll test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowX', 'scroll');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 34,
    index: 0,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      horizontal: true,
      style: {
        overflowX: 'scroll',
      },
    },
  });
});

test('div with overflowX scroll test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowY', 'scroll');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 35,
    index: 0,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
      },
      style: {
        overflowY: 'scroll',
      },
    },
    tagName: 'div',
  });
});

test('div with overflowX scroll test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowY', 'scroll');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 36,
    index: 0,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      style: {
        overflowY: 'scroll',
      },
    },
  });
});

test('div with overflowX and overflowY scroll test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowX', 'scroll');
  node.setStyle('overflowY', 'scroll');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 37,
    index: 0,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
      },
      style: {
        overflowX: 'scroll',
        overflowY: 'scroll',
      },
    },
    tagName: 'div',
  });
});

test('div with overflowX and overflowY scroll test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowX', 'scroll');
  node.setStyle('overflowY', 'scroll');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 38,
    index: 0,
    name: 'ScrollView',
    pId: ROOT_VIEW_ID,
    props: {
      style: {
        overflowX: 'scroll',
        overflowY: 'scroll',
      },
    },
  });
});

test('div with child node and overflowX scroll test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('div');
  const childNode = DocumentNode.createElement('div');
  node.setStyle('overflowY', 'scroll');
  node.appendChild(childNode);
  const nativeLanguage = renderToNativeWithChildren(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, [
    {
      id: 39,
      index: 0,
      name: 'ScrollView',
      pId: ROOT_VIEW_ID,
      props: {
        attributes: {
          class: '',
          id: '',
        },
        style: {
          overflowY: 'scroll',
        },
      },
      tagName: 'div',
    },
    {
      id: 41,
      index: 0,
      name: 'View',
      pId: 39,
      props: {
        attributes: {
          class: '',
          id: '',
        },
        style: {
          collapsable: false,
        },
      },
      tagName: 'div',
    },
  ]);
});

test('div with child node and overflowX scroll test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  const childNode = DocumentNode.createElement('div');
  node.setStyle('overflowY', 'scroll');
  node.appendChild(childNode);
  const nativeLanguage = renderToNativeWithChildren(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, [
    {
      id: 42,
      index: 0,
      name: 'ScrollView',
      pId: ROOT_VIEW_ID,
      props: {
        style: {
          overflowY: 'scroll',
        },
      },
    },
    {
      id: 43,
      index: 0,
      name: 'View',
      pId: 42,
      props: {
        style: {
          collapsable: false,
        },
      },
    },
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
  const withoutBg = renderToNative(ROOT_VIEW_ID, imgWithoutBg);
  t.deepEqual(withoutBg, {
    id: 52,
    index: 0,
    pId: 10,
    name: 'Image',
    props: {
      attributes: {
        class: '',
        id: '',
      },
      style: {
        backgroundColor: 0,
      },
    },
    tagName: 'img',
  });
  const imgWithBg = DocumentNode.createElement('img');
  imgWithBg.setStyle('backgroundColor', '#abcdef');
  const withBg = renderToNative(ROOT_VIEW_ID, imgWithBg);
  t.deepEqual(withBg, {
    id: 53,
    index: 0,
    pId: 10,
    name: 'Image',
    props: {
      attributes: {
        class: '',
        id: '',
      },
      style: {
        backgroundColor: 4289449455,
      },
    },
    tagName: 'img',
  });
});

test('Image.setStyle(background-color) test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const imgWithoutBg = DocumentNode.createElement('img');
  const withoutBg = renderToNative(ROOT_VIEW_ID, imgWithoutBg);
  t.deepEqual(withoutBg, {
    id: 54,
    index: 0,
    pId: 10,
    name: 'Image',
    props: {
      style: {
        backgroundColor: 0,
      },
    },
  });
  const imgWithBg = DocumentNode.createElement('img');
  imgWithBg.setStyle('backgroundColor', '#abcdef');
  const withBg = renderToNative(ROOT_VIEW_ID, imgWithBg);
  t.deepEqual(withBg, {
    id: 55,
    index: 0,
    pId: 10,
    name: 'Image',
    props: {
      style: {
        backgroundColor: 4289449455,
      },
    },
  });
});

test('div with backgroundImage local path test --debug mode', (t) => {
  process.env.NODE_ENV = 'test';
  const node = DocumentNode.createElement('div');
  const originalPath = 'assets/DefaultSource.png';
  node.setStyle('backgroundImage', originalPath);
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 56,
    index: 0,
    name: 'View',
    pId: ROOT_VIEW_ID,
    props: {
      attributes: {
        class: '',
        id: '',
      },
      style: {
        backgroundImage: `${HIPPY_DEBUG_ADDRESS}${originalPath}`,
      },
    },
    tagName: 'div',
  });
});

test('div with backgroundImage local path test --production mode', (t) => {
  process.env.NODE_ENV = 'production';
  const node = DocumentNode.createElement('div');
  const originalPath = 'assets/DefaultSource.png';
  node.setStyle('backgroundImage', originalPath);
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 57,
    index: 0,
    name: 'View',
    pId: ROOT_VIEW_ID,
    props: {
      style: {
        backgroundImage: `hpfile://./${originalPath}`,
      },
    },
  });
});
