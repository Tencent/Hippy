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

#ifndef HippyJSExecutor_Internal_h
#define HippyJSExecutor_Internal_h

#import "HippyJSExecutor.h"
#include <memory>

namespace hippy {
inline namespace driver {
inline namespace napi {
class CtxValue;
}
class Scope;
}
inline namespace vfs {
class UriLoader;
}
}


@protocol HippyJSExecutorInternal <NSObject>

/// hippy scope
@property (atomic, readonly) std::shared_ptr<hippy::Scope> pScope;

/// Set Uri loader
/// - Parameter uriLoader: vfs::UriLoader
- (void)setUriLoader:(std::weak_ptr<hippy::vfs::UriLoader>)uriLoader;

/// Get turbo object
/// - Parameter name: NSString
- (std::shared_ptr<hippy::napi::CtxValue>)JSTurboObjectWithName:(NSString *)name;

@end

@interface HippyJSExecutor (Internal) <HippyJSExecutorInternal>

@end


#endif /* HippyJSExecutor_Internal_h */
