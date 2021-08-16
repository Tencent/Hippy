// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as SearchModule from './search.js';
self.Search = self.Search || {};
Search = Search || {};
/**
 * @constructor
 */
Search.SearchConfig = SearchModule.SearchConfig.SearchConfig;
/**
 * @interface
 */
Search.SearchResult = SearchModule.SearchConfig.SearchResult;
/**
 * @interface
 */
Search.SearchScope = SearchModule.SearchConfig.SearchScope;
/**
 * @constructor
 */
Search.SearchResultsPane = SearchModule.SearchResultsPane.SearchResultsPane;
/**
 * @constructor
 */
Search.SearchView = SearchModule.SearchView.SearchView;
//# sourceMappingURL=search-legacy.js.map