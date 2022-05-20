/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

import { makeMap, camelize } from 'shared/util';
import { capitalizeFirstLetter, warn } from '../util';
import * as BUILT_IN_ELEMENTS from './built-in';

const isReservedTag = makeMap(
  'template,script,style,element,content,slot,'
  + 'button,div,form,img,input,label,li,p,span,textarea,ul',
  true,
);

const elementMap = new Map();

const defaultViewMeta = {
  skipAddToDom: false, // The tag will not add to native DOM.
  isUnaryTag: false, // Single tag, such as img, input...
  tagNamespace: '', // Tag space, such as svg or math, not in using so far.
  canBeLeftOpenTag: false, // Able to no close.
  mustUseProp: false, // Tag must have attribute, such as src with img.
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

function normalizeElementName(elementName) {
  return elementName.toLowerCase();
}

function registerElement(elementName, oldMeta) {
  if (!elementName) {
    throw new Error('RegisterElement cannot set empty name');
  }
  const normalizedName = normalizeElementName(elementName);
  const meta = { ...defaultViewMeta, ...oldMeta };
  if (elementMap.has(normalizedName)) {
    throw new Error(`Element for ${elementName} already registered.`);
  }
  meta.component = {
    ...getDefaultComponent(elementName, meta, normalizedName),
    ...meta.component,
  };
  if (meta.component.name && meta.component.name === capitalizeFirstLetter(camelize(elementName))) {
    warn(`Cannot registerElement with kebab-case name ${elementName}, which converted to camelCase is the same with component.name ${meta.component.name}, please make them different`);
  }
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
function registerBuiltinElements() {
  Object.keys(BUILT_IN_ELEMENTS).forEach((tagName) => {
    const meta = BUILT_IN_ELEMENTS[tagName];
    registerElement(tagName, meta);
  });
}

export {
  isReservedTag,
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
  registerBuiltinElements,
};
