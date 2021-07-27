/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Acorn from '../../third_party/acorn/acorn.js';
import { AcornTokenizer, ECMA_VERSION } from './AcornTokenizer.js'; // eslint-disable-line no-unused-vars
import { ESTreeWalker } from './ESTreeWalker.js';
export class JavaScriptFormatter {
    _builder;
    _tokenizer;
    _content;
    _fromOffset;
    _lastLineNumber;
    _toOffset;
    constructor(builder) {
        this._builder = builder;
    }
    format(text, lineEndings, fromOffset, toOffset) {
        this._fromOffset = fromOffset;
        this._toOffset = toOffset;
        this._content = text.substring(this._fromOffset, this._toOffset);
        this._lastLineNumber = 0;
        this._tokenizer = new AcornTokenizer(this._content);
        const ast = Acorn.parse(this._content, {
            ranges: false,
            preserveParens: true,
            allowImportExportEverywhere: true,
            ecmaVersion: ECMA_VERSION,
            allowHashBang: true,
        });
        const walker = new ESTreeWalker(this._beforeVisit.bind(this), this._afterVisit.bind(this));
        // @ts-ignore Technically, the acorn Node type is a subclass of Acorn.ESTree.Node.
        // However, the acorn package currently exports its type without specifying
        // this relationship. So while this is allowed on runtime, we can't properly
        // typecheck it.
        walker.walk(ast);
    }
    _push(token, format) {
        for (let i = 0; i < format.length; ++i) {
            if (format[i] === 's') {
                this._builder.addSoftSpace();
            }
            else if (format[i] === 'S') {
                this._builder.addHardSpace();
            }
            else if (format[i] === 'n') {
                this._builder.addNewLine();
            }
            else if (format[i] === '>') {
                this._builder.increaseNestingLevel();
            }
            else if (format[i] === '<') {
                this._builder.decreaseNestingLevel();
            }
            else if (format[i] === 't') {
                if (this._tokenizer.tokenLineStart() - this._lastLineNumber > 1) {
                    this._builder.addNewLine(true);
                }
                this._lastLineNumber = this._tokenizer.tokenLineEnd();
                if (token) {
                    this._builder.addToken(this._content.substring(token.start, token.end), this._fromOffset + token.start);
                }
            }
        }
    }
    _beforeVisit(node) {
        if (!node.parent) {
            return;
        }
        let token;
        while ((token = this._tokenizer.peekToken()) && token.start < node.start) {
            const token = this._tokenizer.nextToken();
            // @ts-ignore Same reason as above about Acorn types and ESTree types
            const format = this._formatToken(node.parent, token);
            this._push(token, format);
        }
        return;
    }
    _afterVisit(node) {
        let token;
        while ((token = this._tokenizer.peekToken()) && token.start < node.end) {
            const token = this._tokenizer.nextToken();
            const format = this._formatToken(node, token);
            this._push(token, format);
        }
        this._push(null, this._finishNode(node));
    }
    _inForLoopHeader(node) {
        const parent = node.parent;
        if (!parent) {
            return false;
        }
        if (parent.type === 'ForStatement') {
            const parentNode = parent;
            return node === parentNode.init || node === parentNode.test || node === parentNode.update;
        }
        if (parent.type === 'ForInStatement' || parent.type === 'ForOfStatement') {
            const parentNode = parent;
            return node === parentNode.left || node === parentNode.right;
        }
        return false;
    }
    _formatToken(node, tokenOrComment) {
        const AT = AcornTokenizer;
        if (AT.lineComment(tokenOrComment)) {
            return 'tn';
        }
        if (AT.blockComment(tokenOrComment)) {
            return 'tn';
        }
        const token = tokenOrComment;
        if (node.type === 'ContinueStatement' || node.type === 'BreakStatement') {
            return node.label && AT.keyword(token) ? 'ts' : 't';
        }
        if (node.type === 'Identifier') {
            return 't';
        }
        if (node.type === 'PrivateIdentifier') {
            return 't';
        }
        if (node.type === 'ReturnStatement') {
            if (AT.punctuator(token, ';')) {
                return 't';
            }
            return node.argument ? 'ts' : 't';
        }
        if (node.type === 'AwaitExpression') {
            if (AT.punctuator(token, ';')) {
                return 't';
            }
            return node.argument ? 'ts' : 't';
        }
        if (node.type === 'Property') {
            if (AT.punctuator(token, ':')) {
                return 'ts';
            }
            return 't';
        }
        if (node.type === 'ArrayExpression') {
            if (AT.punctuator(token, ',')) {
                return 'ts';
            }
            return 't';
        }
        if (node.type === 'LabeledStatement') {
            if (AT.punctuator(token, ':')) {
                return 'ts';
            }
        }
        else if (node.type === 'LogicalExpression' || node.type === 'AssignmentExpression' || node.type === 'BinaryExpression') {
            if (AT.punctuator(token) && !AT.punctuator(token, '()')) {
                return 'sts';
            }
        }
        else if (node.type === 'ConditionalExpression') {
            if (AT.punctuator(token, '?:')) {
                return 'sts';
            }
        }
        else if (node.type === 'VariableDeclarator') {
            if (AT.punctuator(token, '=')) {
                return 'sts';
            }
        }
        else if (node.type === 'ObjectPattern') {
            if (node.parent && node.parent.type === 'VariableDeclarator' && AT.punctuator(token, '{')) {
                return 'st';
            }
            if (AT.punctuator(token, ',')) {
                return 'ts';
            }
        }
        else if (node.type === 'FunctionDeclaration') {
            if (AT.punctuator(token, ',)')) {
                return 'ts';
            }
        }
        else if (node.type === 'FunctionExpression') {
            if (AT.punctuator(token, ',)')) {
                return 'ts';
            }
            if (AT.keyword(token, 'function')) {
                return node.id ? 'ts' : 't';
            }
        }
        else if (node.type === 'WithStatement') {
            if (AT.punctuator(token, ')')) {
                return node.body && node.body.type === 'BlockStatement' ? 'ts' : 'tn>';
            }
        }
        else if (node.type === 'SwitchStatement') {
            if (AT.punctuator(token, '{')) {
                return 'tn>';
            }
            if (AT.punctuator(token, '}')) {
                return 'n<tn';
            }
            if (AT.punctuator(token, ')')) {
                return 'ts';
            }
        }
        else if (node.type === 'SwitchCase') {
            if (AT.keyword(token, 'case')) {
                return 'n<ts';
            }
            if (AT.keyword(token, 'default')) {
                return 'n<t';
            }
            if (AT.punctuator(token, ':')) {
                return 'tn>';
            }
        }
        else if (node.type === 'VariableDeclaration') {
            if (AT.punctuator(token, ',')) {
                let allVariablesInitialized = true;
                const declarations = node.declarations;
                for (let i = 0; i < declarations.length; ++i) {
                    // @ts-ignore We are doing a subtype check, without properly checking whether
                    // it exists. We can't fix that, unless we use proper typechecking
                    allVariablesInitialized = allVariablesInitialized && Boolean(declarations[i].init);
                }
                return !this._inForLoopHeader(node) && allVariablesInitialized ? 'nSSts' : 'ts';
            }
        }
        else if (node.type === 'PropertyDefinition') {
            if (AT.punctuator(token, '=')) {
                return 'sts';
            }
            if (AT.punctuator(token, ';')) {
                return 'tn';
            }
        }
        else if (node.type === 'BlockStatement') {
            if (AT.punctuator(token, '{')) {
                return node.body.length ? 'tn>' : 't';
            }
            if (AT.punctuator(token, '}')) {
                return node.body.length ? 'n<t' : 't';
            }
        }
        else if (node.type === 'CatchClause') {
            if (AT.punctuator(token, ')')) {
                return 'ts';
            }
        }
        else if (node.type === 'ObjectExpression') {
            if (!node.properties.length) {
                return 't';
            }
            if (AT.punctuator(token, '{')) {
                return 'tn>';
            }
            if (AT.punctuator(token, '}')) {
                return 'n<t';
            }
            if (AT.punctuator(token, ',')) {
                return 'tn';
            }
        }
        else if (node.type === 'IfStatement') {
            if (AT.punctuator(token, ')')) {
                return node.consequent && node.consequent.type === 'BlockStatement' ? 'ts' : 'tn>';
            }
            if (AT.keyword(token, 'else')) {
                const preFormat = node.consequent && node.consequent.type === 'BlockStatement' ? 'st' : 'n<t';
                let postFormat = 'n>';
                if (node.alternate && (node.alternate.type === 'BlockStatement' || node.alternate.type === 'IfStatement')) {
                    postFormat = 's';
                }
                return preFormat + postFormat;
            }
        }
        else if (node.type === 'CallExpression') {
            if (AT.punctuator(token, ',')) {
                return 'ts';
            }
        }
        else if (node.type === 'SequenceExpression' && AT.punctuator(token, ',')) {
            return node.parent && node.parent.type === 'SwitchCase' ? 'ts' : 'tn';
        }
        else if (node.type === 'ForStatement' || node.type === 'ForOfStatement' || node.type === 'ForInStatement') {
            if (AT.punctuator(token, ';')) {
                return 'ts';
            }
            if (AT.keyword(token, 'in') || AT.identifier(token, 'of')) {
                return 'sts';
            }
            if (AT.punctuator(token, ')')) {
                return node.body && node.body.type === 'BlockStatement' ? 'ts' : 'tn>';
            }
        }
        else if (node.type === 'WhileStatement') {
            if (AT.punctuator(token, ')')) {
                return node.body && node.body.type === 'BlockStatement' ? 'ts' : 'tn>';
            }
        }
        else if (node.type === 'DoWhileStatement') {
            const blockBody = node.body && node.body.type === 'BlockStatement';
            if (AT.keyword(token, 'do')) {
                return blockBody ? 'ts' : 'tn>';
            }
            if (AT.keyword(token, 'while')) {
                return blockBody ? 'sts' : 'n<ts';
            }
            if (AT.punctuator(token, ';')) {
                return 'tn';
            }
        }
        else if (node.type === 'ClassBody') {
            if (AT.punctuator(token, '{')) {
                return 'stn>';
            }
            if (AT.punctuator(token, '}')) {
                return '<ntn';
            }
            return 't';
        }
        else if (node.type === 'YieldExpression') {
            return 't';
        }
        else if (node.type === 'Super') {
            return 't';
        }
        else if (node.type === 'ImportExpression') {
            return 't';
        }
        else if (node.type === 'ExportAllDeclaration') {
            if (AT.punctuator(token, '*')) {
                return 'sts';
            }
            return 't';
        }
        else if (node.type === 'ExportNamedDeclaration' || node.type === 'ImportDeclaration') {
            if (AT.punctuator(token, '{')) {
                return 'st';
            }
            if (AT.punctuator(token, ',')) {
                return 'ts';
            }
            if (AT.punctuator(token, '}')) {
                return node.source ? 'ts' : 't';
            }
            if (AT.punctuator(token, '*')) {
                return 'sts';
            }
            return 't';
        }
        return AT.keyword(token) && !AT.keyword(token, 'this') ? 'ts' : 't';
    }
    _finishNode(node) {
        if (node.type === 'WithStatement') {
            if (node.body && node.body.type !== 'BlockStatement') {
                return 'n<';
            }
        }
        else if (node.type === 'VariableDeclaration') {
            if (!this._inForLoopHeader(node)) {
                return 'n';
            }
        }
        else if (node.type === 'ForStatement' || node.type === 'ForOfStatement' || node.type === 'ForInStatement') {
            if (node.body && node.body.type !== 'BlockStatement') {
                return 'n<';
            }
        }
        else if (node.type === 'BlockStatement') {
            if (node.parent && node.parent.type === 'IfStatement') {
                const parentNode = node.parent;
                if (parentNode.alternate && parentNode.consequent === node) {
                    return '';
                }
            }
            if (node.parent && node.parent.type === 'FunctionExpression' && node.parent.parent &&
                node.parent.parent.type === 'Property') {
                return '';
            }
            if (node.parent && node.parent.type === 'FunctionExpression' && node.parent.parent &&
                node.parent.parent.type === 'VariableDeclarator') {
                return '';
            }
            if (node.parent && node.parent.type === 'FunctionExpression' && node.parent.parent &&
                node.parent.parent.type === 'CallExpression') {
                return '';
            }
            if (node.parent && node.parent.type === 'DoWhileStatement') {
                return '';
            }
            if (node.parent && node.parent.type === 'TryStatement') {
                const parentNode = node.parent;
                if (parentNode.block === node) {
                    return 's';
                }
            }
            if (node.parent && node.parent.type === 'CatchClause') {
                const parentNode = node.parent;
                // @ts-ignore We are doing a subtype check, without properly checking whether
                // it exists. We can't fix that, unless we use proper typechecking
                if (parentNode.parent && parentNode.parent.finalizer) {
                    return 's';
                }
            }
            return 'n';
        }
        else if (node.type === 'WhileStatement') {
            if (node.body && node.body.type !== 'BlockStatement') {
                return 'n<';
            }
        }
        else if (node.type === 'IfStatement') {
            if (node.alternate) {
                if (node.alternate.type !== 'BlockStatement' && node.alternate.type !== 'IfStatement') {
                    return '<';
                }
            }
            else if (node.consequent) {
                if (node.consequent.type !== 'BlockStatement') {
                    return '<';
                }
            }
        }
        else if (node.type === 'BreakStatement' || node.type === 'ContinueStatement' || node.type === 'ThrowStatement' ||
            node.type === 'ReturnStatement' || node.type === 'ExpressionStatement') {
            return 'n';
        }
        else if (node.type === 'ImportDeclaration' || node.type === 'ExportAllDeclaration' ||
            node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') {
            return 'n';
        }
        return '';
    }
}
//# sourceMappingURL=JavaScriptFormatter.js.map