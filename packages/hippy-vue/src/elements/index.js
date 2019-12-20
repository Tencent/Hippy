import { makeMap } from 'shared/util';
import * as builtInComponents from './built-in';

const isReservedTag = makeMap(
  'template,script,style,element,content,slot,'
  + 'button,div,form,img,input,label,li,p,span,textarea,ul',
  true,
);

const elementMap = new Map();

const defaultViewMeta = {
  skipAddToDom: false,      // The tag will not add to native DOM.
  isUnaryTag: false,        // Single tag, such as img, input...
  tagNamespace: '',         // Tag space, such as svg or math, not in using so far.
  canBeLeftOpenTag: false,  // Able to no close.
  mustUseProp: false,       // Tag must have attribute, such as src with img.
  model: null,
  component: null,
};

function getDefaultComponent(elementName, meta, normalizedName) {
  return {
    name: elementName,
    functional: true,
    model: meta.model,
    render(h, { data, children }) {
      return h(normalizedName, data, children);
    },
  };
}

// Methods
function normalizeElementName(elementName) {
  return elementName.toLowerCase();
}

function registerElement(elementName, oldMeta) {
  const normalizedName = normalizeElementName(elementName);

  const meta = { ...defaultViewMeta, ...oldMeta };

  if (elementMap.has(normalizedName)) {
    throw new Error(`Element for ${elementName} already registered.`);
  }

  meta.component = {
    ...getDefaultComponent(elementName, meta, normalizedName),
    ...meta.component,
  };

  const entry = {
    meta,
  };
  elementMap.set(normalizedName, entry);
  return entry;
}

function getElementMap() {
  return elementMap;
}

function getViewMeta(elementName) {
  const normalizedName = normalizeElementName(elementName);

  let viewMeta = defaultViewMeta;
  const entry = elementMap.get(normalizedName);

  if (entry && entry.meta) {
    viewMeta = entry.meta;
  }

  return viewMeta;
}

function isKnownView(elementName) {
  return elementMap.has(normalizeElementName(elementName));
}

function canBeLeftOpenTag(el) {
  return getViewMeta(el).canBeLeftOpenTag;
}

function isUnaryTag(el) {
  return getViewMeta(el).isUnaryTag;
}

function mustUseProp(el, type, attr) {
  const viewMeta = getViewMeta(el);
  if (!viewMeta.mustUseProp) {
    return false;
  }
  return viewMeta.mustUseProp(type, attr);
}

function getTagNamespace(el) {
  return getViewMeta(el).tagNamespace;
}

function isUnknownElement(el) {
  return !isKnownView(el);
}

// Register components
Object.keys(builtInComponents).forEach((tagName) => {
  const meta = builtInComponents[tagName];
  registerElement(tagName, meta);
});

export {
  isReservedTag,
  builtInComponents,
  normalizeElementName,
  registerElement,
  getElementMap,
  getViewMeta,
  isKnownView,
  canBeLeftOpenTag,
  isUnaryTag,
  mustUseProp,
  getTagNamespace,
  isUnknownElement,
};
