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
NSString *const HippyDOMParamsKeyNodeId = @"nodeId";

@interface HippyDomDomain () {
    HippyDomModel *_domModel;
}

@end

@implementation HippyDomDomain

- (instancetype)initWithInspector:(HippyInspector *)inspector {
    self = [super initWithInspector:inspector];
    if (self) {
        _domModel = [[HippyDomModel alloc] init];
    }
    return self;
}

- (NSString *)domainName {
    return HippyDomDomainName;
}

#pragma mark - Method Handle
- (BOOL)handleRequestDevCommand:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    [super handleRequestDevCommand:command bridge:bridge];
    
    if ([command.method isEqualToString:HippyDomMethodGetDocument]) {
        return [self handleGetDocumentWithCmd:command bridge:bridge];
    }
    if ([command.method isEqualToString:HippyDomMethodGetBoxModel]) {
        return [self handleGetBoxModelWithCmd:command bridge:bridge];
    }
    if ([command.method isEqualToString:HippyDomMethodGetNodeForLocation]) {
        return [self handleGetNodeForLocationWithCmd:command bridge:bridge];
    }
    if ([command.method isEqualToString:HippyDomMethodSetInspectedNode]) {
        return [self handleRspDataWithCmd:command dataJSON:@{}];
    }
    
    return NO;
}

- (BOOL)handleGetDocumentWithCmd:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogError(@"DomDomain, getDocument error, manager is nil");
        return NO;
    }
    HippyVirtualNode *rootNode = [manager nodeForHippyTag:[manager rootHippyTag]];
    NSDictionary *documentJSON = [_domModel domGetDocumentJSONWithRootNode:rootNode];
    return [self handleRspDataWithCmd:command dataJSON:documentJSON];
}

- (BOOL)handleGetBoxModelWithCmd:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogError(@"DomDomain, getBoxModel error, manager is nil");
        return NO;
    }
    NSNumber *nodeId = command.params[HippyDOMParamsKeyNodeId];
    if (!nodeId) {
        HippyLogError(@"DomDomain, getBoxModel error, params is't contains nodeId key");
        return NO;
    }
    HippyVirtualNode *node = [manager nodeForHippyTag:nodeId];
    NSDictionary *boxModelJSON = [_domModel domGetBoxModelJSONWithNode:node];
    return [self handleRspDataWithCmd:command dataJSON:boxModelJSON];
}

- (BOOL)handleGetNodeForLocationWithCmd:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    
    return YES;
}

@end
