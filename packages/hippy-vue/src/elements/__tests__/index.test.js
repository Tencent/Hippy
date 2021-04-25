import test from 'ava';
import * as elements from '../index';

const EMPTY_TAG_NAME = 'test';
const CUSTOM_ELEM = 'custom-comp';
const CUSTOM_COMP = 'CustomComp';

test.before(() => {
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
      if (attr === 'testAttr') {
        return true;
      }
      return false;
    },
  });
  const viewMeta = elements.getViewMeta(elementName);
  t.is(viewMeta.component.name, 'Test');
  t.true(viewMeta.mustUseProp('testAttr'));
  t.false(viewMeta.mustUseProp());
});

test('register element with mustUseProp, and element name after camelCase-converted is the same with component name ', (t) => {
  const err = t.throws(() => {
    elements.registerElement(CUSTOM_ELEM, {
      component: {
        name: CUSTOM_COMP,
      },
    });
  }, Error);
  t.is(err.message, `Cannot registerElement with kebab-case name ${CUSTOM_ELEM}, which converted to camelCase is the same with component.name ${CUSTOM_COMP}, please make them different`);
});

test('register element with empty name', (t) => {
  const err = t.throws(() => {
    elements.registerElement('');
  }, Error);
  t.is(err.message, 'RegisterElement cannot set empty name');
});
