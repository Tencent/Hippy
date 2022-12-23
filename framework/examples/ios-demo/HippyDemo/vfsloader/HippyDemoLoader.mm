/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#import "HippyBridge.h"
#import "HippyDemoLoader.h"
#import "HippyFileHandler.h"
#import "NativeRenderManager.h"

void RegisterVFSLoaderForBridge(HippyBridge *bridge, std::shared_ptr<NativeRenderManager> manager) {
    auto cpp_handler = std::make_shared<HippyDemoHandler>();
    auto cpp_loader = std::make_shared<HippyDemoLoader>();
    cpp_loader->PushDefaultHandler(cpp_handler);
    cpp_loader->AddConvenientDefaultHandler(cpp_handler);
    
    auto fileHandler = std::make_shared<HippyFileHandler>(bridge);
    cpp_loader->RegisterConvenientUriHandler(@"hpfile", fileHandler);
    
    [bridge setVFSUriLoader:cpp_loader];
    
    manager->SetVFSUriLoader(cpp_loader);
}
