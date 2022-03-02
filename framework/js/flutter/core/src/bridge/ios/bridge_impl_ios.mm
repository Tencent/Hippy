/*
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#import "bridge_impl_ios.h"
#import "VoltronFlutterBridge.h"
#import "core/scope.h"

#define Addr2Str(addr) (addr?[NSString stringWithFormat:@"%ld", (long)addr]:@"0")

static NSMutableDictionary *getKeepContainer() {
    static NSMutableDictionary *dict;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        dict = [NSMutableDictionary dictionary];
    });
    return dict;
}

NSString* U16ToNSString(const char16_t *source) {
  return [[NSString alloc] initWithCharacters:(const unichar*)source length:std::char_traits<char16_t>::length(source)];
}

int64_t BridgeImpl::InitJsEngine(std::shared_ptr<voltron::PlatformRuntime> platform_runtime,
                                    bool single_thread_mode,
                                    bool bridge_param_json,
                                    bool is_dev_module,
                                    int64_t group_id,
                                    const char16_t *char_globalConfig,
                                    size_t initial_heap_size,
                                    size_t maximum_heap_size,
                                    std::function<void(int64_t)> callback) {
    VoltronFlutterBridge *bridge = [VoltronFlutterBridge new];
    bridge.platformRuntime = platform_runtime;
    [getKeepContainer() setValue:bridge forKey:Addr2Str(bridge)];
    NSString *globalConfig = U16ToNSString(char_globalConfig);
    [bridge initJSFramework:globalConfig completion:^(BOOL succ) {
        callback(succ ? 1 : 0);
    }];

    return (int64_t)bridge;
}

bool BridgeImpl::RunScript(int64_t runtime_id,
                           const char16_t *script,
                           const char16_t *script_name,
                           bool can_use_code_cache,
                           const char16_t *code_cache_dir) {
    if (script == nullptr || script_name == nullptr) {
      return false;
    }

    VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
    NSData *data = [NSData dataWithBytes:script length:std::char_traits<char16_t>::length(script)];
    NSString *scriptName = U16ToNSString(script_name);
    [bridge executeScript:data url:[NSURL URLWithString:scriptName] completion:^(NSError * _Nonnull) {

    }];
    return true;
}

bool BridgeImpl::RunScriptFromFile(int64_t runtime_id,
                                   const char16_t *file_path,
                                   const char16_t *script_nmae,
                                   const char16_t *code_cache_dir,
                                   bool can_use_code_cache,
                                   std::function<void(int64_t)> callback) {
    if (file_path == nullptr) {
      return false;
    }

    VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
    NSData *data = [NSData dataWithContentsOfFile:U16ToNSString(file_path)];
    NSString *scriptName = [U16ToNSString(script_nmae) lastPathComponent];
    [bridge executeScript:data url:[NSURL URLWithString:scriptName] completion:^(NSError * _Nonnull error) {
        BOOL succ = (error == nil);
        callback(succ ? 1 : 0);
    }];
    return true;
}

bool BridgeImpl::RunScriptFromAssets(int64_t runtime_id, bool can_use_code_cache, const char16_t *asset_name,
                                     const char16_t *code_cache_dir, std::function<void(int64_t)> callback,
                                     const char16_t *asset_content) {
    if (asset_name == nullptr) {
      return false;
    }

    VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
    NSString *assetName = U16ToNSString(asset_name);
    NSString *bundlePath = [[[NSBundle mainBundle] bundlePath] stringByAppendingPathComponent:assetName];
    if (![[NSFileManager defaultManager] fileExistsAtPath:bundlePath]) {
#if TARGET_OS_IPHONE
      bundlePath = [[[NSBundle mainBundle] bundlePath] stringByAppendingPathComponent:[NSString stringWithFormat:@"Frameworks/App.framework/flutter_assets/%@", assetName]];
#elif TARGET_OS_MAC
      bundlePath = [[[NSBundle mainBundle] bundlePath] stringByAppendingPathComponent:[NSString stringWithFormat:@"Contents/Frameworks/App.framework/Resources/flutter_assets/%@", assetName]];
#endif

    }
    NSData *data = [NSData dataWithContentsOfFile:bundlePath];
    if (data) {
        [bridge executeScript:data url:[NSURL URLWithString:[bundlePath lastPathComponent]] completion:^(NSError * _Nonnull error) {
            BOOL succ = (error == nil);
            callback(succ ? 1 : 0);
        }];
    }
    return true;
}

void BridgeImpl::Destroy(int64_t runtime_id, std::function<void(int64_t)> callback) {

    VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
    bridge.platformRuntime->Destroy();
    [getKeepContainer() removeObjectForKey:[NSString stringWithFormat:@"%lld", runtime_id]];
    callback(1);
}

void BridgeImpl::CallFunction(int64_t runtime_id, const char16_t* action, std::string params,
                              std::function<void(int64_t)> callback) {
    if (action == nullptr || params == nullptr) {
      return;
    }

    VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
    NSString *actionName = U16ToNSString(action);
    NSString *paramsStr = [NSString stringWithCString:params.c_str()
                                                encoding:[NSString defaultCStringEncoding]];
    NSError *jsonError;
    NSData *objectData = [paramsStr dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *paramDict = [NSJSONSerialization JSONObjectWithData:objectData
                                          options:NSJSONReadingMutableContainers
                                            error:&jsonError];
    [bridge callFunctionOnAction:actionName arguments:paramDict callback:^(id result, NSError *error) {
        BOOL succ = (error == nil);
        callback(succ ? 1 : 0);
    }];
}

void BridgeImpl::BindDomManager(int64_t runtime_id, const std::shared_ptr<DomManager>& dom_manager) {
    VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
    auto scope = bridge.jscExecutor.pScope;
    if (scope) {
        scope->SetDomManager(dom_manager);
        dom_manager->SetDelegateTaskRunner(scope->GetTaskRunner());
    }
}
