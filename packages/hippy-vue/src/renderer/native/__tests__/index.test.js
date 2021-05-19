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

test('renderToNative simple test', (t) => {
  const node = DocumentNode.createElement('div');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 1,
    pId: ROOT_VIEW_ID,
    index: 0,
    name: 'View',
    props: {
      style: {},
    },
  });
});

test('renderToNative test with children', (t) => {
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
      id: 2,
      pId: ROOT_VIEW_ID,
      index: 0,
      name: 'View',
      props: {
        style: {},
      },
    },
    {
      id: 3,
      pId: 2,
      index: 0,
      name: 'View',
      props: {
        style: {},
      },
    },
    {
      id: 4,
      pId: 2,
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
      id: 5,
      pId: 2,
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
      id: 7,
      pId: 2,
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
      id: 8,
      pId: 2,
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
      id: 9,
      pId: 2,
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

test('img attributeMaps test', (t) => {
  const node = DocumentNode.createElement('img');
  node.setAttribute('src', 'http://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png');
  node.setAttribute('alt', 'Test');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 14,
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

test('span attributeMaps test', (t) => {
  const node = DocumentNode.createElement('span');
  node.setAttribute('text', 'Test');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 15,
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

test('a href attribute test', (t) => {
  const node = DocumentNode.createElement('a');
  node.setAttribute('text', 'Test');
  node.setAttribute('href', '/test');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 16,
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

test('a href attribute with http prefix test', (t) => {
  const node = DocumentNode.createElement('a');
  node.setAttribute('text', 'Test');
  node.setAttribute('href', 'http://www.qq.com');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 17,
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


test('div with overflow-X scroll test', (t) => {
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowX', 'scroll');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 18,
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

test('div with overflowX scroll test', (t) => {
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowY', 'scroll');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 19,
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

test('div with overflowX and overflowY scroll test', (t) => {
  const node = DocumentNode.createElement('div');
  node.setStyle('overflowX', 'scroll');
  node.setStyle('overflowY', 'scroll');
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 21,
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

test('div with child node and overflowX scroll test', (t) => {
  const node = DocumentNode.createElement('div');
  const childNode = DocumentNode.createElement('div');
  node.setStyle('overflowY', 'scroll');
  node.appendChild(childNode);
  const nativeLanguage = renderToNativeWithChildren(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, [
    {
      id: 22,
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
      id: 23,
      index: 0,
      name: 'View',
      pId: 22,
      props: {
        style: {
          collapsable: false,
        },
      },
    },
  ]);
});

test('insertChild test test', (t) => {
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
  t.throws(() => {
    parentNode.setText(null);
  }, TypeError);
});

test('Image.setStyle(background-color) test', (t) => {
  const imgWithoutBg = DocumentNode.createElement('img');
  const withoutBg = renderToNative(ROOT_VIEW_ID, imgWithoutBg);
  t.deepEqual(withoutBg, {
    id: 32,
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
    id: 33,
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

test('div with backgroundImage local path test', (t) => {
  const node = DocumentNode.createElement('div');
  const originalPath = 'assets/DefaultSource.png';
  node.setStyle('backgroundImage', originalPath);
  // production mode
  process.env.NODE_ENV = 'production';
  const nativeLanguage = renderToNative(ROOT_VIEW_ID, node);
  t.deepEqual(nativeLanguage, {
    id: 34,
    index: 0,
    name: 'View',
    pId: ROOT_VIEW_ID,
    props: {
      style: {
        backgroundImage: `hpfile://./${originalPath}`,
      },
    },
  });
  // debug mode
  process.env.NODE_ENV = 'test';
  const nativeLanguage2 = renderToNative(ROOT_VIEW_ID, node);
  console.log('nativeLanguage', nativeLanguage);
  t.deepEqual(nativeLanguage2, {
    id: 34,
    index: 0,
    name: 'View',
    pId: ROOT_VIEW_ID,
    props: {
      style: {
        backgroundImage: `${HIPPY_DEBUG_ADDRESS}${originalPath}`,
      },
    },
  });
});
