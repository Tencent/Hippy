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
- (BOOL)handleRequestDevCommand:(HippyDevCommand *)command
                         bridge:(HippyBridge *)bridge
                     completion:(void (^)(NSDictionary *))completion {
    if (!completion) {
        return NO;
    }
    if (!command) {
        HippyLogWarn(@"PageDomain, handleReqDevCommand error, command or completion block is nil");
        completion(@{});
        return NO;
    }
    if (![super handleRequestDevCommand:command bridge:bridge completion:completion]) {
        if ([command.method isEqualToString:HippyCSSMethodGetMatchedStylesForNode]) {
            return [self handleGetMatchedStylesForNodeWithCmd:command bridge:bridge completion:completion];
        }
        if ([command.method isEqualToString:HippyCSSMethodGetComputedStyleForNode]) {
            return [self handleGetComputedStyleForNodeWithCmd:command bridge:bridge completion:completion];
        }
        if ([command.method isEqualToString:HippyCSSMethodGetInlineStylesForNode]) {
            return [self handleGetInlineStylesForNodeWithCmd:command bridge:bridge completion:completion];
        }
        if ([command.method isEqualToString:HippyCSSMethodSetStyleTexts]) {
            return [self handleSetStyleTextsWithCmd:command bridge:bridge completion:completion];
        }
    }
    
    return NO;
}

- (BOOL)handleGetMatchedStylesForNodeWithCmd:(HippyDevCommand *)command
                                      bridge:(HippyBridge *)bridge
                                  completion:(void (^)(NSDictionary *rspObject))completion {
    if (!completion) {
        return NO;
    }
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"CSSDomain, getMatchedStylesForNode error, manager is nil");
        completion(@{});
        return NO;
    }
    NSNumber *nodeId = command.params[HippyCSSParamsKeyNodeId];
    if (!nodeId) {
        HippyLogWarn(@"CSSDomain, getMatchedStylesForNode error, params is't contains nodeId key");
        completion(@{});
        return NO;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        HippyVirtualNode *node = [manager nodeForHippyTag:nodeId];
        [self->_cssModel matchedStyleJSONWithNode:node completion:^(NSDictionary * rspObject) {
            [self handleRspDataWithCmd:command dataJSON:rspObject completion:completion];
        }];
    });
    return YES;
}

- (BOOL)handleGetComputedStyleForNodeWithCmd:(HippyDevCommand *)command
                                      bridge:(HippyBridge *)bridge
                                  completion:(void (^)(NSDictionary *rspObject))completion {
    if (!completion) {
        return NO;
    }
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"CSSDomain, getComputedStyleForNode error, manager is nil");
        completion(@{});
        return NO;
    }
    NSNumber *nodeId = command.params[HippyCSSParamsKeyNodeId];
    if (!nodeId) {
        HippyLogWarn(@"CSSDomain, getComputedStyleForNode error, params is't contains nodeId key");
        completion(@{});
        return NO;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        HippyVirtualNode *node = [manager nodeForHippyTag:nodeId];
        [self->_cssModel computedStyleJSONWithNode:node completion:^(NSDictionary *rspObject) {
            [self handleRspDataWithCmd:command dataJSON:rspObject completion:completion];
        }];
    });
    return YES;
}

- (BOOL)handleGetInlineStylesForNodeWithCmd:(HippyDevCommand *)command
                                     bridge:(HippyBridge *)bridge
                                 completion:(void (^)(NSDictionary *rspObject))completion {
    if (!completion) {
        return NO;
    }
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"CSSDomain, getInlineStylesForNode error, manager is nil");
        completion(@{});
        return NO;
    }
    NSNumber *nodeId = command.params[HippyCSSParamsKeyNodeId];
    if (!nodeId) {
        HippyLogWarn(@"CSSDomain, getInlineStylesForNode error, params is't contains nodeId key");
        completion(@{});
        return NO;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        HippyVirtualNode *node = [manager nodeForHippyTag:nodeId];
        [self->_cssModel inlineStyleJSONWithNode:node completion:^(NSDictionary *rspObject) {
            [self handleRspDataWithCmd:command dataJSON:rspObject completion:completion];
        }];
    });
    return YES;
}

- (BOOL)handleSetStyleTextsWithCmd:(HippyDevCommand *)command
                            bridge:(HippyBridge *)bridge
                        completion:(void (^)(NSDictionary *rspObject))completion{
    if (!completion) {
        return NO;
    }
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"CSSDomain, setStyleTexts error, manager is nil");
        completion(@{});
        return NO;
    }
    NSArray<NSDictionary *> *edits = command.params[HippyCSSParamsKeyEdits];
    if (edits.count <= 0) {
        HippyLogWarn(@"CSSDomain, setStyleTexts error, params is't contains edits key");
        completion(@{});
        return NO;
    }
    NSMutableArray *styles = [NSMutableArray arrayWithCapacity:[edits count]];
    dispatch_group_t group = dispatch_group_create();
    for (NSDictionary *editDic in edits) {
        dispatch_group_enter(group);
        [_cssModel styleTextJSONWithUIManager:manager
                                      editDic:editDic
                                   completion:^(NSDictionary * _Nonnull rspObject) {
            [styles addObject:rspObject];
            dispatch_group_leave(group);
        }];
    }
    dispatch_group_wait(group, DISPATCH_TIME_FOREVER);
    return [self handleRspDataWithCmd:command dataJSON:@{HippyCSSRspKeyStyles : styles} completion:completion];
}

@end
