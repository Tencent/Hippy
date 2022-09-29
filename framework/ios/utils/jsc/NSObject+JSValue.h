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

#import <Foundation/Foundation.h>
#import <JavaScriptCore/JavaScriptCore.h>
#import "HippyDefines.h"

NS_ASSUME_NONNULL_BEGIN

<<<<<<< HEAD:framework/ios/utils/jsc/NSObject+JSValue.h
@interface NSObject (JSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context;

@end

@interface NSArray (JSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context;

@end

@interface NSDictionary (JSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context;

@end

@interface NSData (JSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context;

@end

HIPPY_EXTERN id ObjectFromJSValueRef(JSGlobalContextRef const context, JSValueRef const value, JSValueRef _Nonnull * _Nonnull exception);

=======
@interface HippyInstanceLoadBlock : NSObject

@property(nonatomic, copy)dispatch_block_t loadedBlock;
@property(nonatomic, assign)NSUInteger index;
@property(nonatomic, assign, getter=isLoaded)BOOL loaded;

- (instancetype)initWithBlock:(dispatch_block_t)block index:(NSUInteger)index;

@end

>>>>>>> 8bba36018fedb938d3aa6ed7d6c0d33e60abb699:framework/ios/utils/HippyInstanceLoadBlock.h
NS_ASSUME_NONNULL_END
