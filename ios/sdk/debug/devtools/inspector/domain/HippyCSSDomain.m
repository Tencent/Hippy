/*!
* iOS SDK
*
* Tencent is pleased to support the open source community by making
* Hippy available.
*
* Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

#import "HippyCSSDomain.h"
#import "HippyCSSModel.h"
#import "HippyDevCommand.h"

NSString *const HippyCSSDomainName = @"CSS";
NSString *const HippyCSSMethodGetMatchedStylesForNode = @"getMatchedStylesForNode";
NSString *const HippyCSSMethodGetComputedStyleForNode = @"getComputedStyleForNode";
NSString *const HippyCSSMethodGetInlineStylesForNode = @"getInlineStylesForNode";
NSString *const HippyCSSMethodSetStyleTexts = @"setStyleTexts";
NSString *const HippyCSSParamsKeyNodeId = @"nodeId";
NSString *const HippyCSSParamsKeyEdits = @"edits";
NSString *const HippyCSSRspKeyStyles = @"styles";

@interface HippyCSSDomain () {
    HippyCSSModel *_cssModel;
}

@end

@implementation HippyCSSDomain

- (instancetype)initWithInspector:(HippyInspector *)inspector {
    self = [super initWithInspector:inspector];
    if (self) {
        _cssModel = [[HippyCSSModel alloc] init];
    }
    return self;
}

- (NSString *)domainName {
    return HippyCSSDomainName;
}

#pragma mark - Method Handle
- (BOOL)handleRequestDevCommand:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    [super handleRequestDevCommand:command bridge:bridge];
    
    if ([command.method isEqualToString:HippyCSSMethodGetMatchedStylesForNode]) {
        return [self handleGetMatchedStylesForNodeWithCmd:command bridge:bridge];
    }
    if ([command.method isEqualToString:HippyCSSMethodGetComputedStyleForNode]) {
        return [self handleGetComputedStyleForNodeWithCmd:command bridge:bridge];
    }
    if ([command.method isEqualToString:HippyCSSMethodGetInlineStylesForNode]) {
        return [self handleGetInlineStylesForNodeWithCmd:command bridge:bridge];
    }
    if ([command.method isEqualToString:HippyCSSMethodSetStyleTexts]) {
        return [self handleSetStyleTextsWithCmd:command bridge:bridge];
    }
    
    return NO;
}

- (BOOL)handleGetMatchedStylesForNodeWithCmd:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"CSSDomain, getMatchedStylesForNode error, manager is nil");
        return NO;
    }
    NSNumber *nodeId = command.params[HippyCSSParamsKeyNodeId];
    if (!nodeId) {
        HippyLogWarn(@"CSSDomain, getMatchedStylesForNode error, params is't contains nodeId key");
        return NO;
    }
    HippyVirtualNode *node = [manager nodeForHippyTag:nodeId];
    NSDictionary *matchedStylesJSON = [_cssModel matchedStyleJSONWithNode:node];
    return [self handleRspDataWithCmd:command dataJSON:matchedStylesJSON];
}

- (BOOL)handleGetComputedStyleForNodeWithCmd:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"CSSDomain, getComputedStyleForNode error, manager is nil");
        return NO;
    }
    NSNumber *nodeId = command.params[HippyCSSParamsKeyNodeId];
    if (!nodeId) {
        HippyLogWarn(@"CSSDomain, getComputedStyleForNode error, params is't contains nodeId key");
        return NO;
    }
    HippyVirtualNode *node = [manager nodeForHippyTag:nodeId];
    NSDictionary *computedStylesJSON = [_cssModel computedStyleJSONWithNode:node];
    return [self handleRspDataWithCmd:command dataJSON:computedStylesJSON];
}

- (BOOL)handleGetInlineStylesForNodeWithCmd:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"CSSDomain, getInlineStylesForNode error, manager is nil");
        return NO;
    }
    NSNumber *nodeId = command.params[HippyCSSParamsKeyNodeId];
    if (!nodeId) {
        HippyLogWarn(@"CSSDomain, getInlineStylesForNode error, params is't contains nodeId key");
        return NO;
    }
    HippyVirtualNode *node = [manager nodeForHippyTag:nodeId];
    NSDictionary *inlineStylesJSON = [_cssModel inlineStyleJSONWithNode:node];
    return [self handleRspDataWithCmd:command dataJSON:inlineStylesJSON];
}

- (BOOL)handleSetStyleTextsWithCmd:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"CSSDomain, setStyleTexts error, manager is nil");
        return NO;
    }
    NSArray<NSDictionary *> *edits = command.params[HippyCSSParamsKeyEdits];
    if (edits.count <= 0) {
        HippyLogWarn(@"CSSDomain, setStyleTexts error, params is't contains edits key");
        return NO;
    }
    NSMutableArray *styles = [NSMutableArray array];
    for (NSDictionary *editDic in edits) {
        NSDictionary *styleJSON = [_cssModel styleTextJSONWithUIManager:manager
                                                                editDic:editDic];
        [styles addObject:styleJSON];
    }
    return [self handleRspDataWithCmd:command dataJSON:@{HippyCSSRspKeyStyles : styles}];
}

@end
