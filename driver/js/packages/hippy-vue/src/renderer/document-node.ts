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

import { Event } from '../event';
import CommentNode from './comment-node';
import ElementNode from './element-node';
import ViewNode from './view-node';
import TextNode from './text-node';
import InputNode from './input-node';
import ListNode from './list-node';

class DocumentNode extends ViewNode {
  static createComment(text: string) {
    return new CommentNode(text);
  }

  static createElement(tagName: string) {
    switch (tagName) {
      case 'input':
      case 'textarea':
        return new InputNode(tagName);
      case 'ul':
        return new ListNode(tagName);
      default:
        return new ElementNode(tagName);
    }
  }

  static createElementNS(namespace: string, tagName: string) {
    return new ElementNode(`${namespace}:${tagName}`);
  }

  static createTextNode(text: string) {
    return new TextNode(text);
  }

  static createEvent(eventName: string) {
    return new Event(eventName);
  }
  public documentElement: ViewNode;
  constructor() {
    super();
    this.documentElement = new ElementNode('document');
  }
}

export default DocumentNode;
