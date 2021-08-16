// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Platform from '../../core/platform/platform.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as AcornLoose from '../../third_party/acorn-loose/acorn-loose.js';
import * as Acorn from '../../third_party/acorn/acorn.js';
import { ECMA_VERSION } from './AcornTokenizer.js';
import { ESTreeWalker } from './ESTreeWalker.js';
export function javaScriptOutline(content, chunkCallback) {
    const chunkSize = 100000;
    let chunk = [];
    let lastReportedOffset = 0;
    let ast;
    try {
        ast = Acorn.parse(content, { ecmaVersion: ECMA_VERSION, ranges: false });
    }
    catch (e) {
        ast = AcornLoose.AcornLoose.parse(content, { ecmaVersion: ECMA_VERSION, ranges: false });
    }
    const contentLineEndings = Platform.StringUtilities.findLineEndingIndexes(content);
    const textCursor = new TextUtils.TextCursor.TextCursor(contentLineEndings);
    const walker = new ESTreeWalker(beforeVisit);
    // @ts-ignore Technically, the acorn Node type is a subclass of Acorn.ESTree.Node.
    // However, the acorn package currently exports its type without specifying
    // this relationship. So while this is allowed on runtime, we can't properly
    // typecheck it.
    walker.walk(ast);
    chunkCallback({ chunk, isLastChunk: true });
    function beforeVisit(node) {
        if (node.type === 'ClassDeclaration') {
            reportClass(node.id);
        }
        else if (node.type === 'VariableDeclarator' && node.init && isClassNode(node.init)) {
            reportClass(node.id);
        }
        else if (node.type === 'AssignmentExpression' && isNameNode(node.left) && isClassNode(node.right)) {
            reportClass(node.left);
        }
        else if (node.type === 'Property' && isNameNode(node.key) && isClassNode(node.value)) {
            reportClass(node.key);
        }
        else if (node.type === 'FunctionDeclaration') {
            reportFunction(node.id, node);
        }
        else if (node.type === 'VariableDeclarator' && node.init && isFunctionNode(node.init)) {
            reportFunction(node.id, node.init);
        }
        else if (node.type === 'AssignmentExpression' && isNameNode(node.left) && isFunctionNode(node.right)) {
            reportFunction(node.left, node.right);
        }
        else if ((node.type === 'MethodDefinition' || node.type === 'Property') && isNameNode(node.key) &&
            isFunctionNode(node.value)) {
            const namePrefix = [];
            if (node.kind === 'get' || node.kind === 'set') {
                namePrefix.push(node.kind);
            }
            if ('static' in node && node.static) {
                namePrefix.push('static');
            }
            reportFunction(node.key, node.value, namePrefix.join(' '));
        }
        return undefined;
    }
    function reportClass(nameNode) {
        const name = 'class ' + stringifyNameNode(nameNode);
        textCursor.advance(nameNode.start);
        addOutlineItem(name);
    }
    function reportFunction(nameNode, functionNode, namePrefix) {
        let name = stringifyNameNode(nameNode);
        const functionDeclarationNode = functionNode;
        if (functionDeclarationNode.generator) {
            name = '*' + name;
        }
        if (namePrefix) {
            name = namePrefix + ' ' + name;
        }
        if (functionDeclarationNode.async) {
            name = 'async ' + name;
        }
        textCursor.advance(nameNode.start);
        addOutlineItem(name, stringifyArguments(functionDeclarationNode.params));
    }
    function isNameNode(node) {
        if (!node) {
            return false;
        }
        if (node.type === 'MemberExpression') {
            return !node.computed && node.property.type === 'Identifier';
        }
        return node.type === 'Identifier';
    }
    function isFunctionNode(node) {
        if (!node) {
            return false;
        }
        return node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression';
    }
    function isClassNode(node) {
        return node !== undefined && node.type === 'ClassExpression';
    }
    function stringifyNameNode(node) {
        if (node.type === 'MemberExpression') {
            node = node.property;
        }
        console.assert(node.type === 'Identifier', 'Cannot extract identifier from unknown type: ' + node.type);
        const identifier = node;
        return identifier.name;
    }
    function stringifyArguments(params) {
        const result = [];
        for (const param of params) {
            if (param.type === 'Identifier') {
                result.push(param.name);
            }
            else if (param.type === 'RestElement' && param.argument.type === 'Identifier') {
                result.push('...' + param.argument.name);
            }
            else {
                console.error('Error: unexpected function parameter type: ' + param.type);
            }
        }
        return '(' + result.join(', ') + ')';
    }
    function addOutlineItem(title, subtitle) {
        const line = textCursor.lineNumber();
        const column = textCursor.columnNumber();
        chunk.push({ title, subtitle, line, column });
        if (textCursor.offset() - lastReportedOffset >= chunkSize) {
            chunkCallback({ chunk, isLastChunk: false });
            chunk = [];
            lastReportedOffset = textCursor.offset();
        }
    }
}
//# sourceMappingURL=JavaScriptOutline.js.map