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

import Element from './element-node';
import ViewNode from './view-node';

class DocumentNode extends ViewNode {
  public documentElement: Element;
  public static createElement: Function;
  public static createElementNS: Function;
  public constructor() {
    super();
    this.documentElement = new Element('document');
  }

  public createElement(tagName: string) {
    return new Element(tagName);
  }

  public createElementNS(namespace: string, tagName: string) {
    return new Element(`${namespace}:${tagName}`);
  }
}

DocumentNode.createElement = DocumentNode.prototype.createElement;
DocumentNode.createElementNS = DocumentNode.prototype.createElementNS;

export default DocumentNode;
