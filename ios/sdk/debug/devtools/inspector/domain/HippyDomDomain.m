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

#import "HippyDomDomain.h"
#import "HippyBridge.h"
#import "HippyDevCommand.h"
#import "HippyDomModel.h"

NSString *const HippyDomDomainName = @"DOM";
NSString *const HippyDomMethodGetDocument = @"getDocument";
NSString *const HippyDomMethodGetBoxModel = @"getBoxModel";
NSString *const HippyDomMethodGetNodeForLocation = @"getNodeForLocation";
NSString *const HippyDomMethodRemoveNode = @"removeNode";
NSString *const HippyDomMethodSetInspectedNode = @"setInspectedNode";
NSString *const HippyDomMethodPushNodeByPathToFrontend = @"pushNodeByPathToFrontend";
NSString *const HippyDomMethodDocumentUpdated = @"documentUpdated";
NSString *const HippyDOMParamsKeyNodeId = @"nodeId";
NSString *const HippyDOMParamsKeyX = @"x";
NSString *const HippyDOMParamsKeyY = @"y";
NSString *const HippyDOMParamsKeyPath = @"path";

@interface HippyDomDomain () {
    HippyDomModel *_domModel;
}

@end

@implementation HippyDomDomain

- (instancetype)initWithInspector:(HippyInspector *)inspector {
    self = [super initWithInspector:inspector];
    if (self) {
        _domModel = [[HippyDomModel alloc] init];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(handleEndBatchNotification) name:HippyUIManagerDidEndBatchNotification
                                                   object:nil];
    }
    return self;
}

- (NSString *)domainName {
    return HippyDomDomainName;
}

#pragma mark - Method Handle
- (BOOL)handleRequestDevCommand:(HippyDevCommand *)command
                         bridge:(HippyBridge *)bridge
                     completion:(nonnull void (^)(NSDictionary *))completion {
    if (!completion) {
        return NO;
    }
    if (!command) {
        HippyLogWarn(@"PageDomain, handleReqDevCommand error, command or completion block is nil");
        completion(@{});
        return NO;
    }
    if (![super handleRequestDevCommand:command bridge:bridge completion:completion]) {
        if ([command.method isEqualToString:HippyDomMethodGetDocument]) {
            return [self handleGetDocumentWithCmd:command bridge:bridge completion:completion];
        }
        if ([command.method isEqualToString:HippyDomMethodGetBoxModel]) {
            return [self handleGetBoxModelWithCmd:command bridge:bridge completion:completion];
        }
        if ([command.method isEqualToString:HippyDomMethodGetNodeForLocation]) {
            return [self handleGetNodeForLocationWithCmd:command bridge:bridge completion:completion];
        }
        if ([command.method isEqualToString:HippyDomMethodSetInspectedNode]) {
            return [self handleRspDataWithCmd:command dataJSON:@{} completion:completion];
        }
        if ([command.method isEqualToString:HippyDomMethodPushNodeByPathToFrontend]) {
            return [self handlePushNodeByPathToFrontendWithCmd:command bridge:bridge completion:completion];
        }
    }
    return NO;
}

- (BOOL)handleGetDocumentWithCmd:(HippyDevCommand *)command
                          bridge:(HippyBridge *)bridge
                      completion:(void (^)(NSDictionary *rspObject))completion {
    if (!completion) {
        return NO;
    }
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"DomDomain, getDocument error, manager is nil");
        completion(@{});
        return NO;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        HippyVirtualNode *rootNode = [manager nodeForHippyTag:[manager rootHippyTag]];
        [self->_domModel domGetDocumentJSONWithRootNode:rootNode completion:^(NSDictionary * rspObject) {
            [self handleRspDataWithCmd:command dataJSON:rspObject completion:completion];
        }];
    });
    return YES;
}

- (BOOL)handleGetBoxModelWithCmd:(HippyDevCommand *)command
                          bridge:(HippyBridge *)bridge
                      completion:(void (^)(NSDictionary *rspObject))completion {
    if (!completion) {
        return NO;
    }
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"DomDomain, getBoxModel error, manager is nil");
        completion(@{});
        return NO;
    }
    NSNumber *nodeId = command.params[HippyDOMParamsKeyNodeId];
    if (!nodeId) {
        HippyLogWarn(@"DomDomain, getBoxModel error, params isn't contains nodeId key");
        completion(@{});
        return NO;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        HippyVirtualNode *node = [manager nodeForHippyTag:nodeId];
        HippyVirtualNode *rootNode = [manager nodeForHippyTag:[manager rootHippyTag]];
        [self->_domModel domGetBoxModelJSONWithNode:node rootNode:rootNode completion:^(NSDictionary * rspObject) {
            [self handleRspDataWithCmd:command dataJSON:rspObject completion:completion];
        }];
    });
    return YES;
}

- (BOOL)handleGetNodeForLocationWithCmd:(HippyDevCommand *)command
                                 bridge:(HippyBridge *)bridge
                             completion:(void (^)(NSDictionary *rspObject))completion {
    if (!completion) {
        return NO;
    }
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"DomDomain, getNodeForLocation error, manager is nil");
        completion(@{});
        return NO;
    }
    NSNumber *x = command.params[HippyDOMParamsKeyX];
    NSNumber *y = command.params[HippyDOMParamsKeyY];
    if (!x || !y) {
        HippyLogWarn(@"DomDomain, getNodeForLocation error, param isn't contains x or y key");
        return NO;
    }
    CGPoint location = CGPointMake(x.doubleValue, y.doubleValue);
    [_domModel domGetNodeForLocationWithManager:manager
                                       location:location
                                     completion:^(NSDictionary *rspObject) {
        [self handleRspDataWithCmd:command dataJSON:rspObject completion:completion];
    }];
    return YES;
}

- (BOOL)handlePushNodeByPathToFrontendWithCmd:(HippyDevCommand *)command
                                       bridge:(HippyBridge *)bridge
                                   completion:(void (^)(NSDictionary *rspObject))completion {
    if (!completion) {
        return NO;
    }
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"DomDomain, pushNodeByPathToFrontend error, manager is nil");
        completion(@{});
        return NO;
    }
    NSString *path = command.params[HippyDOMParamsKeyPath];
    if (path.length <= 0) {
        HippyLogWarn(@"DomDomain, pushNodeByPathToFrontend error, path is empty");
        return NO;
    }
    [_domModel domGetNodeIdByPath:path manager:manager completion:^(NSDictionary * _Nonnull rspObject) {
        [self handleRspDataWithCmd:command dataJSON:rspObject completion:completion];
    }];
    
    return YES;
}

- (void)handleEndBatchNotification{
    if (!self.inspector) {
        return;
    }
    NSString *methodName = [NSString stringWithFormat:@"%@.%@", HippyDomDomainName, HippyDomMethodDocumentUpdated];
    [self.inspector sendDataToFrontendWithMethod:methodName
                                          params:@{}];
}


@end
