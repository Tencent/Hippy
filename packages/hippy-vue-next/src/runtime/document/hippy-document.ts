/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import { HippyCommentElement } from '../element/hippy-comment-element';
import { HippyElement } from '../element/hippy-element';
import { HippyInputElement } from '../element/hippy-input-element';
import { HippyListElement } from '../element/hippy-list-element';
import { HippyNode, NodeType } from '../node/hippy-node';
import { HippyText } from '../text/hippy-text';

/**
 * Hippy document, provide methods for creating different type element node
 */
export class HippyDocument extends HippyNode {
  /**
   * create comment node with text content
   *
   * @param text - text content
   */
  static createComment(text: string): HippyCommentElement {
    return new HippyCommentElement(text);
  }

  /**
   * create different type elements by tag name
   *
   * @param tagName - tag name
   */
  static createElement(tagName: string):
  | HippyElement
  | HippyInputElement
  | HippyListElement {
    switch (tagName) {
      case 'input':
      case 'textarea':
        return new HippyInputElement(tagName);
      case 'ul':
        return new HippyListElement(tagName);
      // use tagName to create element
      default:
        return new HippyElement(tagName);
    }
  }

  /**
   * create text node
   *
   * @param text - text content
   */
  static createTextNode(text: string): HippyText {
    return new HippyText(text);
  }

  constructor() {
    super(NodeType.DocumentNode);
  }
}
