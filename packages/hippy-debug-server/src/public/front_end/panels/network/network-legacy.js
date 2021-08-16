// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as NetworkModule from './network.js';
self.Network = self.Network || {};
Network = Network || {};
/**
 * @constructor
 */
Network.BinaryResourceView = NetworkModule.BinaryResourceView.BinaryResourceView;
/**
 * @constructor
 */
Network.BlockedURLsPane = NetworkModule.BlockedURLsPane.BlockedURLsPane;
/**
 * @constructor
 */
Network.EventSourceMessageNode = NetworkModule.EventSourceMessagesView.EventSourceMessageNode;
/**
 * @constructor
 */
Network.NetworkConfigView = NetworkModule.NetworkConfigView.NetworkConfigView;
/** @type {!Array.<{title: string, values: !Array.<{title: string, value: string}>}>} */
Network.NetworkConfigView._userAgentGroups = NetworkModule.NetworkConfigView.userAgentGroups;
/**
 * @constructor
 */
Network.NetworkNode = NetworkModule.NetworkDataGridNode.NetworkNode;
/**
 * @constructor
 */
Network.NetworkItemView = NetworkModule.NetworkItemView.NetworkItemView;
/**
 * @constructor
 */
Network.NetworkLogView = NetworkModule.NetworkLogView.NetworkLogView;
Network.NetworkLogView.isRequestFilteredOut = NetworkModule.NetworkLogView.isRequestFilteredOut;
/** @enum {string} */
Network.NetworkLogView.FilterType = NetworkModule.NetworkLogView.FilterType;
/** @enum {string} */
Network.NetworkLogView.MixedContentFilterValues = NetworkModule.NetworkLogView.MixedContentFilterValues;
/**
 * @constructor
 */
Network.NetworkLogViewColumns = NetworkModule.NetworkLogViewColumns.NetworkLogViewColumns;
/**
 * @constructor
 */
Network.NetworkOverview = NetworkModule.NetworkOverview.NetworkOverview;
/**
 * @constructor
 */
Network.NetworkPanel = NetworkModule.NetworkPanel.NetworkPanel;
/**
 * @constructor
 */
Network.SearchNetworkView = NetworkModule.NetworkPanel.SearchNetworkView;
/**
 * @constructor
 */
Network.NetworkPanel.ContextMenuProvider = NetworkModule.NetworkPanel.ContextMenuProvider;
/**
 * @constructor
 */
Network.NetworkPanel.RequestRevealer = NetworkModule.NetworkPanel.RequestRevealer;
/**
 * @constructor
 */
Network.NetworkPanel.ActionDelegate = NetworkModule.NetworkPanel.ActionDelegate;
/**
 * @constructor
 */
Network.NetworkPanel.RequestLocationRevealer = NetworkModule.NetworkPanel.RequestLocationRevealer;
/**
 * @constructor
 */
Network.UIRequestLocation = NetworkModule.NetworkSearchScope.UIRequestLocation;
/**
 * @constructor
 */
Network.NetworkTimeCalculator = NetworkModule.NetworkTimeCalculator.NetworkTimeCalculator;
/**
 * @constructor
 */
Network.NetworkWaterfallColumn = NetworkModule.NetworkWaterfallColumn.NetworkWaterfallColumn;
/**
 * @constructor
 */
Network.RequestHTMLView = NetworkModule.RequestHTMLView.RequestHTMLView;
/**
 * @constructor
 */
Network.RequestHeadersView = NetworkModule.RequestHeadersView.RequestHeadersView;
/**
 * @constructor
 */
Network.RequestPreviewView = NetworkModule.RequestPreviewView.RequestPreviewView;
/**
 * @constructor
 */
Network.RequestResponseView = NetworkModule.RequestResponseView.RequestResponseView;
/**
 * @constructor
 */
Network.RequestTimingView = NetworkModule.RequestTimingView.RequestTimingView;
/** @enum {string} */
Network.RequestTimeRangeNames = NetworkModule.RequestTimingView.RequestTimeRangeNames;
/**
 * @constructor
 */
Network.ResourceWebSocketFrameView = NetworkModule.ResourceWebSocketFrameView.ResourceWebSocketFrameView;
Network.ResourceWebSocketFrameNode = NetworkModule.ResourceWebSocketFrameView.ResourceWebSocketFrameNode;
/**
 * @constructor
 */
Network.SignedExchangeInfoView = NetworkModule.SignedExchangeInfoView.SignedExchangeInfoView;
//# sourceMappingURL=network-legacy.js.map