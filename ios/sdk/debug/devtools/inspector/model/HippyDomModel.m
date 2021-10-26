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

#import "HippyDomModel.h"
#import "HippyLog.h"

// DOM Result JSON Key
NSString *const HippyDOMKeyRoot = @"root";
NSString *const HippyDOMKeyNodeId = @"nodeId";
NSString *const HippyDOMKeyBackendNodeId = @"backendNodeId";
NSString *const HippyDOMKeyNodeType = @"nodeType";
NSString *const HippyDOMKeyChildNodeCount = @"childNodeCount";
NSString *const HippyDOMKeyNodeName = @"nodeName";
NSString *const HippyDOMKeyBaseURL = @"baseURL";
NSString *const HippyDOMKeyDocumentURL = @"documentURL";
NSString *const HippyDOMKeyChildren = @"children";
NSString *const HippyDOMKeyLocalName = @"localName";
NSString *const HippyDOMKeyNodeValue = @"nodeValue";
NSString *const HippyDOMKeyParentId = @"parentId";

// Default Value
NSInteger const HippyDOMDefaultDocumentNodeId = -3;
NSInteger const HippyDOMDefaultDocumentChildNodeCount = 1;
NSString *const HippyDOMDefaultDocumentNodeName = @"#document";

// Node Prop
NSString *const HippyNodePropAttributes = @"attributes";
NSString *const HippyNodePropText = @"text";

typedef NS_ENUM(NSUInteger, HippyDOMNodeType) {
    HippyDOMNodeTypeElementNode = 1,
    HippyDOMNodeTypeAttributeNode = 2,
    HippyDOMNodeTypeTextNode = 3,
    HippyDOMNodeTypeCDataSectionNode = 4,
    HippyDOMNodeTypeProcessingInstructionNode = 5,
    HippyDOMNodeTypeCommentNode = 6,
    HippyDOMNodeTypeDocumentNode = 7,
    HippyDOMNodeTypeDocumentTypeNode = 8,
    HippyDOMNodeTypeDocumentFragmentNode = 9
};

@implementation HippyDomModel

#pragma mark - DOM Protocol
- (NSDictionary *)domGetDocumentJSONStringWithRootNode:(HippyVirtualNode *)rootNode {
    if (!rootNode) {
        HippyLogError(@"DOM Model, getDocument error, rootNode is nil");
        return @{};
    }
    NSMutableDictionary *rootDic = [NSMutableDictionary dictionary];
    rootDic[HippyDOMKeyNodeId] = @(HippyDOMDefaultDocumentNodeId);
    rootDic[HippyDOMKeyBackendNodeId] = @(HippyDOMDefaultDocumentNodeId);
    rootDic[HippyDOMKeyNodeType] = @(HippyDOMNodeTypeDocumentFragmentNode);
    rootDic[HippyDOMKeyChildNodeCount] = @(HippyDOMDefaultDocumentChildNodeCount);
    rootDic[HippyDOMKeyBaseURL] = @"";
    rootDic[HippyDOMKeyDocumentURL] = @"";
    NSMutableArray *children = [NSMutableArray array];
    for (HippyVirtualNode *childNode in rootNode.subNodes) {
        [children addObject:[self nodeJSONWithVirtualNode:childNode nodeType:HippyDOMNodeTypeElementNode]];
    }
    
    rootDic[HippyDOMKeyChildren] = children;
    NSMutableDictionary *resultDic = [NSMutableDictionary dictionary];
    resultDic[HippyDOMKeyRoot] = rootDic;
    return [resultDic copy];
}

#pragma mark - private method
- (NSDictionary *)nodeJSONWithVirtualNode:(HippyVirtualNode *)node
                                 nodeType:(HippyDOMNodeType)nodeType {
    if (!node) {
        return @{};
    }
    NSDictionary *tempNodeDic = [self assemblyNodeBasicJSON:node nodeType:nodeType];
    NSMutableDictionary *nodeJSON = [NSMutableDictionary dictionaryWithDictionary:tempNodeDic];
    NSMutableArray *childNodes = [NSMutableArray array];
    NSString *nodeValue = [node.props objectForKey:HippyNodePropText];
    if (nodeValue.length > 0) {
        NSDictionary *textDic = [self assemblyNodeBasicJSON:node nodeType:HippyDOMNodeTypeTextNode];
        NSMutableDictionary *textMutableDic = [NSMutableDictionary dictionaryWithDictionary:textDic];
        textMutableDic[HippyDOMKeyChildNodeCount] = @(0);
        textMutableDic[HippyDOMKeyChildren] = @[];
        [childNodes addObject:textMutableDic];
    }
    for (HippyVirtualNode *childNode in node.subNodes) {
        NSDictionary *childNodeJSON = [self nodeJSONWithVirtualNode:childNode nodeType:nodeType];
        [childNodes addObject:childNodeJSON];
    }
    if (childNodes.count > 0) {
        nodeJSON[HippyDOMKeyChildren] = childNodes;
    }
    
    return [nodeJSON copy];
}

- (NSDictionary *)assemblyNodeBasicJSON:(HippyVirtualNode *)node
                               nodeType:(HippyDOMNodeType)nodeType {
    if (!node) {
        return @{};
    }
    NSMutableDictionary *basicDictionary = [NSMutableDictionary dictionary];
    NSNumber *nodeId = node.hippyTag;
    if (nodeType == HippyDOMNodeTypeTextNode) {
        nodeId = @(-nodeId.integerValue);
    }
    basicDictionary[HippyDOMKeyNodeId] = nodeId;
    basicDictionary[HippyDOMKeyBackendNodeId] = @(0);
    basicDictionary[HippyDOMKeyNodeType] = @(nodeType);
    basicDictionary[HippyDOMKeyLocalName] = node.tagName;
    basicDictionary[HippyDOMKeyNodeName] = node.tagName;
    NSString *nodeValue = [node.props objectForKey:HippyNodePropText];
    if (nodeValue.length > 0) {
        basicDictionary[HippyDOMKeyNodeValue] = nodeValue;
    }
    NSNumber *parentId = @(0);
    if (node.parent) {
        parentId = node.parent.hippyTag;
    }
    basicDictionary[HippyDOMKeyParentId] = parentId;
    basicDictionary[HippyDOMKeyChildNodeCount] = @(node.subNodes.count);
    basicDictionary[HippyNodePropAttributes] = [self assemblyAttributeJSON:[node.props objectForKey:HippyNodePropAttributes]];
    return [basicDictionary copy];
}

- (NSArray *)assemblyAttributeJSON:(NSDictionary *)attribute {
    NSMutableArray<NSString *> *attributeJSONArray = [NSMutableArray array];
    for (NSString *key in attribute) {
        NSString *value = [NSString stringWithFormat:@"%@", attribute[key]];
        if (value.length <= 0) {
            continue;
        }
        [attributeJSONArray addObject:key];
        [attributeJSONArray addObject:value];
    }
    return [attributeJSONArray copy];
}

@end
