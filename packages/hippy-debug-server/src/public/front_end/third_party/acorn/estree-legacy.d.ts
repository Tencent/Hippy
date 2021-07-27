// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as estree from 'estree';

declare module 'estree' {
  interface BaseNode {
    parent: BaseNode|null;
    start: number;
    end: number;
    id?: Node|null;
  }
}

// The @types/estree do not export the types to a namespace. Since we reference
// these types as "ESTree.Node", we need to explicitly re-export them here.
export type ArrayPattern = estree.ArrayPattern;
export type CatchClause = estree.CatchClause;
export type Class = estree.Class;
export type Expression = estree.Expression;
export type FunctionDeclaration = estree.FunctionDeclaration;
export type ForStatement = estree.ForStatement;
export type ForOfStatement = estree.ForOfStatement;
export type ForInStatement = estree.ForInStatement;
export type Identifier = estree.Identifier;
export type IfStatement = estree.IfStatement;
export type Literal = estree.Literal;
export type MemberExpression = estree.MemberExpression;
export type MethodDefinition = estree.MethodDefinition;
export type Node = estree.Node;
export type ObjectPattern = estree.ObjectPattern;
export type Pattern = estree.Pattern;
export type SimpleLiteral = estree.SimpleLiteral;
export type TemplateLiteral = estree.TemplateLiteral;
export type TemplateLiteralNode = estree.TemplateLiteral;
export type TryStatement = estree.TryStatement;
export type VariableDeclarator = estree.VariableDeclarator;
