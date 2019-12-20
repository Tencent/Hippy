/* eslint-disable class-methods-use-this */

import Element from './element-node';
import ViewNode from './view-node';

class DocumentNode extends ViewNode {
  documentElement: Element;

  static createElement: Function;

  static createElementNS: Function;

  constructor() {
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
