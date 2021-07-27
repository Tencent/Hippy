// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const SkipSubTreeObject = {};
export class ESTreeWalker {
    _beforeVisit;
    _afterVisit;
    _walkNulls;
    constructor(beforeVisit, afterVisit) {
        this._beforeVisit = beforeVisit;
        this._afterVisit = afterVisit || new Function();
        this._walkNulls = false;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static get SkipSubtree() {
        return SkipSubTreeObject;
    }
    setWalkNulls(value) {
        this._walkNulls = value;
    }
    walk(ast) {
        this._innerWalk(ast, null);
    }
    _innerWalk(node, parent) {
        if (!node && parent && this._walkNulls) {
            const result = { raw: 'null', value: null, parent: null };
            // Otherwise Closure can't handle the definition
            result.type = 'Literal';
            node = result;
        }
        if (!node) {
            return;
        }
        node.parent = parent;
        if (this._beforeVisit.call(null, node) === ESTreeWalker.SkipSubtree) {
            this._afterVisit.call(null, node);
            return;
        }
        const walkOrder = _walkOrder[node.type];
        if (!walkOrder) {
            console.error('Walk order not defined for ' + node.type);
            return;
        }
        if (node.type === 'TemplateLiteral') {
            const templateLiteral = node;
            const expressionsLength = templateLiteral.expressions.length;
            for (let i = 0; i < expressionsLength; ++i) {
                this._innerWalk(templateLiteral.quasis[i], templateLiteral);
                this._innerWalk(templateLiteral.expressions[i], templateLiteral);
            }
            this._innerWalk(templateLiteral.quasis[expressionsLength], templateLiteral);
        }
        else {
            for (let i = 0; i < walkOrder.length; ++i) {
                // @ts-ignore We are doing type traversal here, but the strings
                // in _walkOrder are not mapping. Preferably, we would use the
                // properties as defined in the types, but we can't do that yet.
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const entity = node[walkOrder[i]];
                if (Array.isArray(entity)) {
                    this._walkArray(entity, node);
                }
                else {
                    this._innerWalk(entity, node);
                }
            }
        }
        this._afterVisit.call(null, node);
    }
    _walkArray(nodeArray, parentNode) {
        for (let i = 0; i < nodeArray.length; ++i) {
            this._innerWalk(nodeArray[i], parentNode);
        }
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _walkOrder = {
    'AwaitExpression': ['argument'],
    'ArrayExpression': ['elements'],
    'ArrayPattern': ['elements'],
    'ArrowFunctionExpression': ['params', 'body'],
    'AssignmentExpression': ['left', 'right'],
    'AssignmentPattern': ['left', 'right'],
    'BinaryExpression': ['left', 'right'],
    'BlockStatement': ['body'],
    'BreakStatement': ['label'],
    'CallExpression': ['callee', 'arguments'],
    'CatchClause': ['param', 'body'],
    'ClassBody': ['body'],
    'ClassDeclaration': ['id', 'superClass', 'body'],
    'ClassExpression': ['id', 'superClass', 'body'],
    'ChainExpression': ['expression'],
    'ConditionalExpression': ['test', 'consequent', 'alternate'],
    'ContinueStatement': ['label'],
    'DebuggerStatement': [],
    'DoWhileStatement': ['body', 'test'],
    'EmptyStatement': [],
    'ExpressionStatement': ['expression'],
    'ForInStatement': ['left', 'right', 'body'],
    'ForOfStatement': ['left', 'right', 'body'],
    'ForStatement': ['init', 'test', 'update', 'body'],
    'FunctionDeclaration': ['id', 'params', 'body'],
    'FunctionExpression': ['id', 'params', 'body'],
    'Identifier': [],
    'ImportDeclaration': ['specifiers', 'source'],
    'ImportDefaultSpecifier': ['local'],
    'ImportNamespaceSpecifier': ['local'],
    'ImportSpecifier': ['imported', 'local'],
    'ImportExpression': ['source'],
    'ExportAllDeclaration': ['source'],
    'ExportDefaultDeclaration': ['declaration'],
    'ExportNamedDeclaration': ['specifiers', 'source', 'declaration'],
    'ExportSpecifier': ['exported', 'local'],
    'IfStatement': ['test', 'consequent', 'alternate'],
    'LabeledStatement': ['label', 'body'],
    'Literal': [],
    'LogicalExpression': ['left', 'right'],
    'MemberExpression': ['object', 'property'],
    'MetaProperty': ['meta', 'property'],
    'MethodDefinition': ['key', 'value'],
    'NewExpression': ['callee', 'arguments'],
    'ObjectExpression': ['properties'],
    'ObjectPattern': ['properties'],
    'ParenthesizedExpression': ['expression'],
    'PrivateIdentifier': [],
    'PropertyDefinition': ['key', 'value'],
    'Program': ['body'],
    'Property': ['key', 'value'],
    'RestElement': ['argument'],
    'ReturnStatement': ['argument'],
    'SequenceExpression': ['expressions'],
    'SpreadElement': ['argument'],
    'Super': [],
    'SwitchCase': ['test', 'consequent'],
    'SwitchStatement': ['discriminant', 'cases'],
    'TaggedTemplateExpression': ['tag', 'quasi'],
    'TemplateElement': [],
    'TemplateLiteral': ['quasis', 'expressions'],
    'ThisExpression': [],
    'ThrowStatement': ['argument'],
    'TryStatement': ['block', 'handler', 'finalizer'],
    'UnaryExpression': ['argument'],
    'UpdateExpression': ['argument'],
    'VariableDeclaration': ['declarations'],
    'VariableDeclarator': ['id', 'init'],
    'WhileStatement': ['test', 'body'],
    'WithStatement': ['object', 'body'],
    'YieldExpression': ['argument'],
};
//# sourceMappingURL=ESTreeWalker.js.map