// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as TextUtilsModule from './text_utils.js';
self.TextUtils = self.TextUtils || {};
TextUtils = TextUtils || {};
/**
 * @interface
 */
TextUtils.ContentProvider = TextUtilsModule.ContentProvider.ContentProvider;
/**
 * @constructor
 */
TextUtils.ContentProvider.SearchMatch = TextUtilsModule.ContentProvider.SearchMatch;
TextUtils.ContentProvider.contentAsDataURL = TextUtilsModule.ContentProvider.contentAsDataURL;
TextUtils.StaticContentProvider = TextUtilsModule.StaticContentProvider.StaticContentProvider;
/** @constructor */
TextUtils.Text = TextUtilsModule.Text.Text;
/** @constructor */
TextUtils.TextCursor = TextUtilsModule.TextCursor.TextCursor;
/** @constructor */
TextUtils.TextRange = TextUtilsModule.TextRange.TextRange;
/** @constructor */
TextUtils.SourceRange = TextUtilsModule.TextRange.SourceRange;
/** @constructor */
TextUtils.SourceEdit = TextUtilsModule.TextRange.SourceEdit;
TextUtils.TextUtils = TextUtilsModule.TextUtils.Utils;
/** @constructor */
TextUtils.FilterParser = TextUtilsModule.TextUtils.FilterParser;
/** @constructor */
TextUtils.BalancedJSONTokenizer = TextUtilsModule.TextUtils.BalancedJSONTokenizer;
/** @interface */
TextUtils.TokenizerFactory = TextUtilsModule.TextUtils.TokenizerFactory;
TextUtils.isMinified = TextUtilsModule.TextUtils.isMinified;
TextUtils.CodeMirrorUtils = {};
TextUtils.CodeMirrorUtils.toPos = TextUtilsModule.CodeMirrorUtils.toPos;
TextUtils.CodeMirrorUtils.toRange = TextUtilsModule.CodeMirrorUtils.toRange;
TextUtils.CodeMirrorUtils.changeObjectToEditOperation = TextUtilsModule.CodeMirrorUtils.changeObjectToEditOperation;
TextUtils.CodeMirrorUtils.pullLines = TextUtilsModule.CodeMirrorUtils.pullLines;
/** @constructor */
TextUtils.CodeMirrorUtils.TokenizerFactory = TextUtilsModule.CodeMirrorUtils.TokenizerFactory;
//# sourceMappingURL=text_utils-legacy.js.map