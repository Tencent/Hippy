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
#import "HPImageProviderProtocol.h"
#import "VFSUriLoader.h"
#import "HPUriLoader.h"

NS_ASSUME_NONNULL_BEGIN

@protocol HPRenderContext;

/**
 * HPRenderFrameworkProxy is used to pass necessary data or implementation to render or ui object
 */
@protocol HPRenderFrameworkProxy <NSObject>

@required
- (void)setImageProviderClass:(Class<HPImageProviderProtocol>)cls;
- (Class<HPImageProviderProtocol>)imageProviderClass;

- (void)setHPUriLoader:(HPUriLoader *)loader;
- (HPUriLoader *)HPUriLoader;

- (void)setVFSUriLoader:(std::weak_ptr<VFSUriLoader>)loader;
- (std::weak_ptr<VFSUriLoader>)VFSUriLoader;

@end

NS_ASSUME_NONNULL_END
