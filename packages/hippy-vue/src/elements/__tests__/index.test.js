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
import * as elements from '../index';

const EMPTY_TAG_NAME = 'test';

before(() => {
  elements.registerElement(EMPTY_TAG_NAME, {
    component: {
      name: 'TestComp',
    },
  });
});

test('getElementMap test', (t) => {
  const elementMap = elements.getElementMap();
  t.true(elementMap instanceof Map);
});

test('isKnownView test', (t) => {
  t.true(elements.isKnownView(EMPTY_TAG_NAME));
});

test('canBeLeftOpenTag test', (t) => {
  t.false(elements.canBeLeftOpenTag(EMPTY_TAG_NAME));
});

test('isUnaryTag test', (t) => {
  t.false(elements.isUnaryTag(EMPTY_TAG_NAME));
});

test('mustUseProp test', (t) => {
  t.false(elements.mustUseProp(EMPTY_TAG_NAME));
});

test('mustUseProp true test', (t) => {
  elements.registerElement('testtag', {
    mustUseProp(type, attr) {
      return ['test'].indexOf(attr) > -1;
    },
    component: {
      name: 'Test',
    },
  });
  t.true(elements.mustUseProp('testtag', null, 'test'));
  t.false(elements.mustUseProp('testtag', null, 'test2'));
});

test('getTagNamespace test', (t) => {
  t.is(elements.getTagNamespace(EMPTY_TAG_NAME), '');
});

test('isUnknownElement test', (t) => {
  t.false(elements.isUnknownElement(EMPTY_TAG_NAME));
});

test('registerElement again test', (t) => {
  const err = t.throws(() => {
    elements.registerElement(EMPTY_TAG_NAME);
  }, Error);
  t.is(err.message, `Element for ${EMPTY_TAG_NAME} already registered.`);
});

test('registerElement with out meta defined', (t) => {
  const elementName = 'elementWithoutComponent';
  elements.registerElement(elementName);
  function render(tagName, data, children) {
    return {
      tagName,
      data,
      children,
    };
  }
  const viewMeta = elements.getViewMeta(elementName);
  t.is(viewMeta.component.name, elementName);
  t.deepEqual(viewMeta.component.render(render, { data: 1, children: 2 }), {
    tagName: elements.normalizeElementName(elementName),
    data: 1,
    children: 2,
  });
});

test('registerElement with mustUseProp', (t) => {
  const elementName = 'elementWithMustProps';
  elements.registerElement(elementName, {
    component: {
      name: 'Test',
    },
    mustUseProp(attr) {
      return attr === 'testAttr';
    },
  });
  const viewMeta = elements.getViewMeta(elementName);
  t.is(viewMeta.component.name, 'Test');
  t.true(viewMeta.mustUseProp('testAttr'));
  t.false(viewMeta.mustUseProp());
});

test('register element with empty name', (t) => {
  const err = t.throws(() => {
    elements.registerElement('');
  }, Error);
  t.is(err.message, 'RegisterElement cannot set empty name');
});
