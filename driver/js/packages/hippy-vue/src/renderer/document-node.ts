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

import CommentNode from './comment-node';
import ElementNode from './element-node';
import ViewNode from './view-node';
import TextNode from './text-node';
import InputNode from './input-node';
import ListNode from './list-node';
import { Event } from './native/event';

class DocumentNode extends ViewNode {
  documentElement: any;
  constructor() {
    super();
    this.documentElement = new ElementNode('document');
    // make static methods accessible via this
    // @ts-expect-error TS(2576): Property 'createComment' does not exist on type 'D... Remove this comment to see the full error message
    this.createComment = (this.constructor as any).createComment;
    // @ts-expect-error TS(2576): Property 'createElement' does not exist on type 'D... Remove this comment to see the full error message
    this.createElement = (this.constructor as any).createElement;
    // @ts-expect-error TS(2576): Property 'createElementNS' does not exist on type ... Remove this comment to see the full error message
    this.createElementNS = (this.constructor as any).createElementNS;
    // @ts-expect-error TS(2576): Property 'createTextNode' does not exist on type '... Remove this comment to see the full error message
    this.createTextNode = (this.constructor as any).createTextNode;
  }

  static createComment(text: any) {
    return new CommentNode(text);
  }

  static createElement(tagName: any) {
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

  static createElementNS(namespace: any, tagName: any) {
    return new ElementNode(`${namespace}:${tagName}`);
  }

  static createTextNode(text: any) {
    return new TextNode(text);
  }

  static createEvent(eventName: any) {
    return new Event(eventName);
  }
}

export default DocumentNode;
