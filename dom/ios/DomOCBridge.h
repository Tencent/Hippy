/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import <Foundation/Foundation.h>
#import <UIKit/UIGeometry.h>

#import "MacroDefines.h"

#include "dom/dom_argument.h"
#include "dom/dom_listener.h"
#include "dom/dom_node.h"

NS_ASSUME_NONNULL_BEGIN

@protocol DomOCBridgeProtocol <NSObject>

- (hippy::DomArgument)toDomArgument;

@end

@interface NSObject (DomOCBridge)<DomOCBridgeProtocol>

@end

@interface NSArray (DomOCBridge)<DomOCBridgeProtocol>

@end

@interface NSDictionary (DomOCBridge)<DomOCBridgeProtocol>

@end

@interface NSNumber (DomOCBridge)<DomOCBridgeProtocol>

@end

@interface NSString (DomOCBridge)<DomOCBridgeProtocol>

@end

HP_EXTERN CGRect CGRectMakeFromLayoutResult(hippy::LayoutResult result);

HP_EXTERN UIEdgeInsets UIEdgeInsetsFromLayoutResult(hippy::LayoutResult result);

HP_EXTERN CGSize CGSizeMakeFromLayoutResult(hippy::LayoutResult result);

HP_EXTERN CGRect CGRectMakeFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode);

HP_EXTERN NSDictionary *stylesFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode);

NS_ASSUME_NONNULL_END
