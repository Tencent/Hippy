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
#import <UIKit/UIKit.h>
#import "HippyCSSPropsDefine.h"
#import "HippyLog.h"
#import "HippyUIManager.h"

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
NSString *const HippyDOMKeyModel = @"model";
NSString *const HippyDOMKeyBoxModelContent = @"content";
NSString *const HippyDOMKeyBackendId = @"backendId";
NSString *const HippyDOMKeyFrameId = @"frameId";
NSString *const HippyDOMKeyNodeIds = @"nodeIds";

// Default Value
NSInteger const HippyDOMDefaultDocumentNodeId = -3;
NSInteger const HippyDOMDefaultDocumentChildNodeCount = 1;
NSString *const HippyDOMDefaultDocumentNodeName = @"#document";
NSString *const HippyDOMDefaultFrameID = @"main_frame";

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

@interface HippyDomModel ()

@property (nonatomic, strong) NSMutableDictionary<NSNumber *, NSNumber *> *backendIdMap; // key: nodeId  value: backendId

@end

@implementation HippyDomModel

- (instancetype)init {
    self = [super init];
    if (self) {
        self.backendIdMap = [NSMutableDictionary dictionary];
    }
    return self;
}

#pragma mark - DOM Protocol
- (BOOL)domGetDocumentJSONWithManager:(nullable HippyUIManager *)manager
                           completion:(void (^)(NSDictionary *rspObject))completion {
    if (!completion) {
        HippyLogWarn(@"DOM Model, getDocument error, completion is nil");
        return NO;
    }
    if (!manager) {
        HippyLogWarn(@"DOM Model, getDocument error, manager is nil");
        completion(@{});
        return NO;
    }
    HippyVirtualNode *rootNode = [manager nodeForHippyTag:[manager rootHippyTag]];
    if (!rootNode) {
        HippyLogWarn(@"DOM Model, getDocument error, root node is nil");
        completion(@{});
        return NO;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.backendIdMap removeAllObjects];
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
        completion(resultDic);
    });
    return YES;
}

- (BOOL)domGetBoxModelJSONWithNode:(nullable HippyVirtualNode *)node
                           manager:(nullable HippyUIManager *)manager
                        completion:(void (^)(NSDictionary *rspObject))completion {
    if (!completion) {
        HippyLogWarn(@"DOM Model, getBoxModel error, completion is nil");
        return NO;
    }
    if (!node) {
        HippyLogWarn(@"DOM Model, getBoxModel error, node is nil");
        completion(@{});
        return NO;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        CGRect nodeFrame = [self windowFrameWithNode:node manager:manager];
        NSMutableDictionary *boxModelDic = [NSMutableDictionary dictionary];
        NSArray *border = [self assemblyBoxModelBorderWithFrame:nodeFrame];
        NSArray *padding = [self assemblyBoxModelPaddingWithProps:node.props border:border];
        NSArray *content = [self assemblyBoxModelContentWithProps:node.props padding:padding];
        NSArray *margin = [self assemblyBoxModelMarginWithProps:node.props border:border];
        boxModelDic[HippyDevtoolsCSSPropWidth] = @(nodeFrame.size.width);
        boxModelDic[HippyDevtoolsCSSPropHeight] = @(nodeFrame.size.height);
        boxModelDic[HippyDevtoolsCSSPropBorder] = border;
        boxModelDic[HippyDevtoolsCSSPropPadding] = padding;
        boxModelDic[HippyDOMKeyBoxModelContent] = content;
        boxModelDic[HippyDevtoolsCSSPropMargin] = margin;
        completion(@{HippyDOMKeyModel: boxModelDic});
    });
    return YES;
}

- (BOOL)domGetNodeForLocationWithManager:(nullable HippyUIManager *)manager
                                location:(CGPoint)location
                              completion:(void (^)(NSDictionary *rspObject))completion {
    if (!completion) {
        HippyLogWarn(@"DOM Model, getNodeForLocation error, completion is nil");
        return NO;
    }
    if (!manager) {
        HippyLogWarn(@"DOM Model, getNodeForLocation error, manager is nil");
        completion(@{});
        return NO;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        NSMutableDictionary *resultDic = [NSMutableDictionary dictionary];
        HippyVirtualNode *rootNode = [manager nodeForHippyTag:[manager rootHippyTag]];
        if (!rootNode) {
            HippyLogWarn(@"DOM Model, getNodeForLocation error, root node is nil");
            completion(@{});
            return;
        }
        HippyVirtualNode *hitNode = [self maxDepthAndMinAreaHitNodeWithLocation:location
                                                                           node:rootNode
                                                                        manager:manager];
        if (!hitNode) {
            completion(@{});
            return;
        }
        resultDic[HippyDOMKeyBackendId] = hitNode.hippyTag;
        resultDic[HippyDOMKeyFrameId] = HippyDOMDefaultFrameID;
        resultDic[HippyDOMKeyNodeId] = hitNode.hippyTag;
        completion(resultDic);
    });
    return YES;
}

- (BOOL)domGetNodeIdByPath:(NSString *)path
                   manager:(HippyUIManager *)manager
                completion:(void (^)(NSDictionary * _Nonnull))completion {
    if (!completion) {
        HippyLogWarn(@"DOM Model, pushNodeByPathToFrontend error, completion is nil");
        return NO;
    }
    if (!manager) {
        HippyLogWarn(@"DOM Model, pushNodeByPathToFrontend error, manager is nil");
        completion(@{});
        return NO;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        HippyVirtualNode *rootNode = [manager nodeForHippyTag:[manager rootHippyTag]];
        if (!rootNode) {
            HippyLogWarn(@"DOM Model, pushNodeByPathToFrontend error, root node is nil");
            completion(@{});
            return;
        }
        HippyVirtualNode *hitNode = [self nodeForPath:path rootNode:rootNode];
        if (!hitNode) {
            HippyLogWarn(@"DOM Model, pushNodeByPathToFrontend error, hitNode is nil");
            completion(@{});
            return;
        }
        NSMutableDictionary *resultDic = [NSMutableDictionary dictionary];
        resultDic[HippyDOMKeyNodeId] = hitNode.hippyTag;
        completion(resultDic);
    });
    return YES;
}

- (BOOL)domGetNodeIdsByBackendIds:(NSArray<NSNumber *> *)backendIds
                       completion:(void (^)(NSDictionary * _Nonnull))completion {
    if (!completion) {
        HippyLogWarn(@"DOM Model, pushNodesByBackendIdsToFrontend error, completion is nil");
        return NO;
    }
    if (backendIds.count <= 0) {
        HippyLogWarn(@"DOM Model, pushNodesByBackendIdsToFrontend error, backendIds is empty");
        return NO;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        NSMutableArray *nodeIds = [NSMutableArray array];
        for (NSNumber *backendId in backendIds) {
            NSNumber *nodeId = self.backendIdMap[backendId];
            if (!nodeId) {
                continue;
            }
            [nodeIds addObject:nodeId];
        }
        NSMutableDictionary *resultDic = [NSMutableDictionary dictionary];
        resultDic[HippyDOMKeyNodeIds] = nodeIds;
        completion(resultDic);
    });
    return YES;
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
    NSNumber *backendId = nodeId;
    basicDictionary[HippyDOMKeyNodeId] = nodeId;
    basicDictionary[HippyDOMKeyBackendNodeId] = backendId;
    self.backendIdMap[nodeId] = backendId;
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
    NSMutableArray<NSString *> *attributeJSONArray = [NSMutableArray arrayWithCapacity:[attribute count]];
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

- (NSArray<NSNumber *> *)assemblyBoxModelBorderWithFrame:(CGRect)frame {
    return @[
        @(frame.origin.x),
        @(frame.origin.y),
        @(frame.origin.x + frame.size.width),
        @(frame.origin.y),
        @(frame.origin.x + frame.size.width),
        @(frame.origin.y + frame.size.height),
        @(frame.origin.x),
        @(frame.origin.y + frame.size.height)
    ];
}

- (NSArray<NSNumber *> *)assemblyBoxModelPaddingWithProps:(NSDictionary *)props
                                                   border:(NSArray<NSNumber *> *)border {
    if (props.count <= 0 || border.count <= 0) {
        return @[];
    }
    NSInteger borderTop = 0;
    NSInteger borderLeft = 0;
    NSInteger borderRight = 0;
    NSInteger borderBottom = 0;
    NSNumber *borderWidth = props[HippyDevtoolsCSSPropBorderWidth];
    if (borderWidth) {
        borderTop = borderWidth.integerValue;
        borderLeft = borderWidth.integerValue;
        borderRight = borderWidth.integerValue;
        borderBottom = borderWidth.integerValue;
    }
    NSNumber *borderTopWidth = props[HippyDevtoolsCSSPropBorderTopWidth];
    if (borderTopWidth) {
        borderTop = borderTopWidth.integerValue;
    }
    NSNumber *borderLeftWidth = props[HippyDevtoolsCSSPropBorderLeftWidth];
    if (borderLeftWidth) {
        borderLeft = borderLeftWidth.integerValue;
    }
    NSNumber *borderRightWidth = props[HippyDevtoolsCSSPropBorderRightWidth];
    if (borderRightWidth) {
        borderRight = borderRightWidth.integerValue;
    }
    NSNumber *borderBottomWidth = props[HippyDevtoolsCSSPropBorderBottomWidth];
    if (borderBottomWidth) {
        borderBottom = borderBottomWidth.integerValue;
    }
    
    return @[
        @(border[0].integerValue + borderLeft),
        @(border[1].integerValue + borderTop),
        @(border[2].integerValue - borderRight),
        @(border[3].integerValue + borderTop),
        @(border[4].integerValue - borderRight),
        @(border[5].integerValue - borderBottom),
        @(border[6].integerValue + borderLeft),
        @(border[7].integerValue - borderBottom)
    ];
}

- (NSArray<NSNumber *> *)assemblyBoxModelContentWithProps:(NSDictionary *)props
                                                  padding:(NSArray<NSNumber *> *)padding {
    if (props.count <= 0 || padding.count <= 0) {
        return @[];
    }
    NSInteger paddingTop = 0;
    NSInteger paddingLeft = 0;
    NSInteger paddingRight = 0;
    NSInteger paddingBottom = 0;
    NSNumber *propsPadding = props[HippyDevtoolsCSSPropPadding];
    if (propsPadding) {
        paddingTop = propsPadding.integerValue;
        paddingLeft = propsPadding.integerValue;
        paddingRight = propsPadding.integerValue;
        paddingBottom = propsPadding.integerValue;
    }
    NSNumber *propsPaddingTop = props[HippyDevtoolsCSSPropPaddingTop];
    if (propsPaddingTop) {
        paddingTop = propsPaddingTop.integerValue;
    }
    NSNumber *propsPaddingLeft = props[HippyDevtoolsCSSPropPaddingLeft];
    if (propsPaddingLeft) {
        paddingLeft = propsPaddingLeft.integerValue;
    }
    NSNumber *propsPaddingRight = props[HippyDevtoolsCSSPropPaddingRight];
    if (propsPaddingRight) {
        paddingRight = propsPaddingRight.integerValue;
    }
    NSNumber *propsPaddingBottom = props[HippyDevtoolsCSSPropPaddingBottom];
    if (propsPaddingBottom) {
        paddingBottom = propsPaddingBottom.integerValue;
    }
    
    return @[
        @(padding[0].integerValue + paddingLeft),
        @(padding[1].integerValue + paddingTop),
        @(padding[2].integerValue - paddingRight),
        @(padding[3].integerValue + paddingTop),
        @(padding[4].integerValue - paddingRight),
        @(padding[5].integerValue - paddingBottom),
        @(padding[6].integerValue + paddingLeft),
        @(padding[7].integerValue - paddingBottom)
    ];
}

- (NSArray<NSNumber *> *)assemblyBoxModelMarginWithProps:(NSDictionary *)props
                                                  border:(NSArray<NSNumber *> *)border {
    if (props.count <= 0 || border.count <= 0) {
        return @[];
    }
    NSInteger marginTop = 0;
    NSInteger marginLeft = 0;
    NSInteger marginRight = 0;
    NSInteger marginBottom = 0;
    NSNumber *propsMargin = props[HippyDevtoolsCSSPropMargin];
    if (propsMargin) {
        marginTop = propsMargin.integerValue;
        marginLeft = propsMargin.integerValue;
        marginRight = propsMargin.integerValue;
        marginBottom = propsMargin.integerValue;
    }
    NSNumber *propsMarginTop = props[HippyDevtoolsCSSPropMarginTop];
    if (propsMarginTop) {
        marginTop = propsMarginTop.integerValue;
    }
    NSNumber *propsMarginLeft = props[HippyDevtoolsCSSPropMarginLeft];
    if (propsMarginLeft) {
        marginLeft = propsMarginLeft.integerValue;
    }
    NSNumber *propsMarginRight = props[HippyDevtoolsCSSPropMarginRight];
    if (propsMarginRight) {
        marginRight = propsMarginRight.integerValue;
    }
    NSNumber *propsMarginBottom = props[HippyDevtoolsCSSPropMarginBottom];
    if (propsMarginBottom) {
        marginBottom = propsMarginBottom.integerValue;
    }
    
    return @[
        @(border[0].integerValue - marginLeft),
        @(border[1].integerValue - marginTop),
        @(border[2].integerValue + marginRight),
        @(border[3].integerValue - marginTop),
        @(border[4].integerValue + marginRight),
        @(border[5].integerValue + marginBottom),
        @(border[6].integerValue - marginLeft),
        @(border[7].integerValue + marginBottom)
    ];
}

- (HippyVirtualNode *)nodeForPath:(NSString *)path rootNode:(HippyVirtualNode *)rootNode {
    if (path.length <= 0 || !rootNode) {
        return nil;
    }
    NSArray<NSString *> *pathTokens = [path componentsSeparatedByString:@","];
    if (pathTokens.count <= 0) {
        return nil;
    }
    HippyVirtualNode *node = rootNode;
    for (int index = 0; index < pathTokens.count - 1; index += 2) {
        NSInteger childNumber = [pathTokens[index] integerValue];
        if (childNumber >= node.subNodes.count) {
            return nil;
        }
        if (index + 1 >= pathTokens.count) {
            return nil;
        }
        NSString *childName = pathTokens[index + 1];
        HippyVirtualNode *child = [node.subNodes objectAtIndex:childNumber];
        if (!child || [child.tagName caseInsensitiveCompare:childName] != NSOrderedSame) {
            return nil;
        }
        node = child;
    }
    return node;
}

- (CGRect)windowFrameWithNode:(HippyVirtualNode *)node
                      manager:(HippyUIManager *)manager {
    if (!node) {
        HippyLogWarn(@"DOM Model, windowFrameWithNode, node is nil");
        return CGRectZero;
    }
    if (!manager) {
        HippyLogWarn(@"DOM Model, windowFrameWithNode, manager is nil");
        return CGRectZero;
    }
    UIView *selfView = [manager viewForHippyTag:node.hippyTag];
    if (!selfView) {
        return CGRectZero;
    }
    UIWindow *window = [[[UIApplication sharedApplication] delegate] window];
    CGRect nodeLocation = [selfView.superview convertRect:selfView.frame toView:window];
    UIView *rootView = [manager viewForHippyTag:[manager rootHippyTag]];
    if (rootView) {
        CGRect rootLocation = [rootView.superview convertRect:rootView.frame toView:window];
        nodeLocation = CGRectMake(nodeLocation.origin.x - rootLocation.origin.x,
                                  nodeLocation.origin.y - rootLocation.origin.y,
                                  nodeLocation.size.width, nodeLocation.size.height);
    }
    return nodeLocation;
}

- (HippyVirtualNode *)maxDepthAndMinAreaHitNodeWithLocation:(CGPoint)location
                                                       node:(HippyVirtualNode *)node
                                                    manager:(HippyUIManager *)manager {
    if (!node || ![self isLocationHitNode:location node:node manager:manager]) {
        return nil;
    }
    HippyVirtualNode *hitNode = nil;
    for (HippyVirtualNode *childNode in node.subNodes) {
        if (![self isLocationHitNode:location node:childNode manager:manager]) {
            continue;
        }
        HippyVirtualNode *newHitNode = [self maxDepthAndMinAreaHitNodeWithLocation:location
                                                                              node:childNode
                                                                           manager:manager];
        hitNode = [self smallerAreaNodeWithOldNode:hitNode newNode:newHitNode];
    }
    return hitNode != nil ? hitNode : node;
}

- (BOOL)isLocationHitNode:(CGPoint)location
                     node:(HippyVirtualNode *)node
                  manager:(HippyUIManager *)manager {
    if (!node || !manager) {
        return false;
    }
    CGRect windowFrame = [self windowFrameWithNode:node manager:manager];
    BOOL isInTopOffset = (location.x >= windowFrame.origin.x) && (location.y >= windowFrame.origin.y);
    BOOL isInBottomOffset = (location.x <= (windowFrame.origin.x + windowFrame.size.width)) &&
                            (location.y <= (windowFrame.origin.y + windowFrame.size.height));
    return isInTopOffset && isInBottomOffset;
}

- (HippyVirtualNode *)smallerAreaNodeWithOldNode:(HippyVirtualNode *)oldNode
                                         newNode:(HippyVirtualNode *)newNode {
    if (!oldNode) {
        return newNode;
    }
    if (!newNode) {
        return oldNode;
    }
    double oldNodeArea = oldNode.frame.size.width * oldNode.frame.size.height;
    double newNodeArea = newNode.frame.size.width * newNode.frame.size.height;
    return oldNodeArea > newNodeArea ? newNode : oldNode;
}

@end
