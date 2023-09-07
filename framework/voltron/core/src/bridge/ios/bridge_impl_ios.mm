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
#import "VoltronJSEnginesMapper.h"
#import <UIKit/UIKit.h>

#ifdef ENABLE_INSPECTOR
#include "devtools/vfs/devtools_handler.h"
#include "devtools/devtools_data_source.h"
#endif
#include "footstone/task_runner.h"
#include "string_convert.h"
#include "wrapper.h"
#include "data_holder.h"

#define Addr2Str(addr) (addr?[NSString stringWithFormat:@"%ld", (long)addr]:@"0")

static NSMutableDictionary *getKeepContainer() {
    static NSMutableDictionary *dict;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        dict = [NSMutableDictionary dictionary];
    });
    return dict;
}

dispatch_queue_t HippyBridgeQueue() {
    static dispatch_once_t onceToken;
    static dispatch_queue_t queue;
    dispatch_once(&onceToken, ^{
        dispatch_queue_attr_t attr =
            dispatch_queue_attr_make_with_qos_class(DISPATCH_QUEUE_SERIAL, QOS_CLASS_USER_INITIATED, 0);
        queue = dispatch_queue_create("com.hippy.bridge", attr);
    });
    return queue;
}


NSString* U16ToNSString(const char16_t *source) {
    return [[NSString alloc] initWithCharacters:(const unichar*)source length:std::char_traits<char16_t>::length(source)];
}

NSString* CStringToNSString(const std::string& source) {
    return [NSString stringWithCString:source.c_str() encoding:NSUTF8StringEncoding];
}

footstone::value::HippyValue OCTypeToDomValue(id value) {
    if ([value isKindOfClass:[NSString class]]) {
        return footstone::value::HippyValue([value UTF8String]);
    }
    else if ([value isKindOfClass:[NSNumber class]]) {
        CFNumberRef numberRef = (__bridge CFNumberRef)value;
        CFNumberType numberType = CFNumberGetType(numberRef);
        if (kCFNumberSInt32Type == numberType ||
            kCFNumberSInt64Type == numberType ||
            kCFNumberShortType == numberType ||
            kCFNumberIntType == numberType ||
            kCFNumberLongType == numberType ||
            kCFNumberLongLongType == numberType) {
            return footstone::value::HippyValue([value unsignedIntValue]);
        }
        else if (kCFNumberFloatType == numberType ||
                 kCFNumberDoubleType == numberType) {
            return footstone::value::HippyValue([value doubleValue]);
        }
        else {
            BOOL flag = [value boolValue];
            return footstone::value::HippyValue(flag);;
        }
    }
    else if (value == [NSNull null]) {
        return footstone::value::HippyValue::Null();
    }
    else if ([value isKindOfClass:[NSDictionary class]]) {
        footstone::value::HippyValue::HippyValueObjectType object;
        for (NSString *key in value) {
            std::string objKey = [key UTF8String];
            id objValue = [value objectForKey:key];
            auto dom_obj = OCTypeToDomValue(objValue);
            object[objKey] = std::move(dom_obj);
        }
        return footstone::value::HippyValue(std::move(object));
    }
    else if ([value isKindOfClass:[NSArray class]]) {
        footstone::value::HippyValue::HippyValueArrayType array;
        for (id obj in value) {
            auto dom_obj = OCTypeToDomValue(obj);
            array.push_back(std::move(dom_obj));
        }
        return footstone::value::HippyValue(std::move(array));
    }
    else {
        return footstone::value::HippyValue::Undefined();
    }
}

void BridgeImpl::LoadInstance(int64_t runtime_id, std::string&& params) {

    NSString *paramsStr = [NSString stringWithCString:params.c_str()
                                             encoding:NSUTF8StringEncoding];
    dispatch_async(HippyBridgeQueue(), ^{
        VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
        NSData *objectData = [paramsStr dataUsingEncoding:NSUTF8StringEncoding];
        NSError *jsonError;
        NSDictionary *paramDict = [NSJSONSerialization JSONObjectWithData:objectData
                                                                  options:NSJSONReadingMutableContainers
                                                                    error:&jsonError];
        if (jsonError == nil) {
            footstone::value::HippyValue value = OCTypeToDomValue(paramDict);
            std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
            bridge.jscExecutor.pScope->LoadInstance(domValue);
        }
    });
}

void BridgeImpl::UnloadInstance(int64_t runtime_id, std::string&& params) {
    NSString *paramsStr = [NSString stringWithCString:params.c_str()
                                             encoding:NSUTF8StringEncoding];

    dispatch_async(HippyBridgeQueue(), ^{
        VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
        NSData *objectData = [paramsStr dataUsingEncoding:NSUTF8StringEncoding];
        NSError *jsonError;
        NSDictionary *paramDict = [NSJSONSerialization JSONObjectWithData:objectData
                                                                  options:NSJSONReadingMutableContainers
                                                                    error:&jsonError];
        if (jsonError == nil) {
            footstone::value::HippyValue value = OCTypeToDomValue(paramDict);
            std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
            bridge.jscExecutor.pScope->UnloadInstance(domValue);
        }
    });
}

int64_t BridgeImpl::InitJsEngine(std::shared_ptr<voltron::JSBridgeRuntime> platform_runtime,
                                    bool single_thread_mode,
                                    bool bridge_param_json,
                                    bool is_dev_module,
                                    int64_t group_id,
                                    const std::unique_ptr<WorkerManager> &worker_manager,
                                    uint32_t dom_manager_id,
                                    const char16_t *char_globalConfig,
                                    size_t initial_heap_size,
                                    size_t maximum_heap_size,
                                    std::function<void(int64_t)> callback,
                                    uint32_t devtools_id) {
    VoltronFlutterBridge *bridge = [VoltronFlutterBridge new];
    bridge.platformRuntime = platform_runtime;
    [getKeepContainer() setValue:bridge forKey:Addr2Str(bridge)];
    NSString *globalConfig = U16ToNSString(char_globalConfig);
    BOOL debugMode = is_dev_module ? YES : NO;
    int64_t bridge_id = (int64_t)bridge;
    NSNumber *devtoolsId = [NSNumber numberWithInt:devtools_id];

    dispatch_async(HippyBridgeQueue(), ^{
        NSString *executorKey = [[NSString alloc] initWithFormat:@"VoltronExecutor_%lld", bridge_id];
        auto dom_manager = std::any_cast<std::shared_ptr<hippy::DomManager>>(voltron::FindObject(dom_manager_id));
        FOOTSTONE_DCHECK(dom_manager);
        std::shared_ptr<footstone::TaskRunner> dom_task_runner = dom_manager->GetTaskRunner();
        FOOTSTONE_DCHECK(dom_task_runner);
        auto engine = std::make_shared<hippy::Engine>();
        auto param = std::make_shared<hippy::VM::VMInitParam>();
        engine->AsyncInitialize(dom_task_runner, param, nullptr);
        [[VoltronJSEnginesMapper defaultInstance] setEngine:engine forKey: executorKey];

        [bridge initJSFramework:globalConfig execurotKey:executorKey devtoolsId:devtoolsId debugMode:debugMode completion:^(BOOL succ) {
            callback(succ ? 1 : 0);
        }];
    });

    return bridge_id;
}

bool BridgeImpl::RunScriptFromUri(int64_t runtime_id,
                                  uint32_t vfs_id,
                                  bool can_use_code_cache,
                                  bool is_local_file,
                                  const char16_t *uri,
                                  const char16_t *code_cache_dir_str,
                                  std::function<void(int64_t)> callback) {
    if (uri == nullptr) {
        return false;
    }
    auto uri_str = voltron::C16CharToString(uri);
    auto code_cache_dir = voltron::C16CharToString(code_cache_dir_str);
    dispatch_async(HippyBridgeQueue(), ^{
        VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
        auto wrapper = voltron::VfsWrapper::GetWrapper(vfs_id);
        FOOTSTONE_CHECK(wrapper != nullptr);
        auto scope = bridge.jscExecutor.pScope;
        FOOTSTONE_CHECK(scope != nullptr);
        NSString *uriStr = CStringToNSString(uri_str);
        NSRange lastSep = [uriStr rangeOfString:@"/" options:NSBackwardsSearch];
        NSString *basePath = [uriStr substringToIndex:lastSep.location + 1];
        NSString *scriptName = [uriStr substringFromIndex:lastSep.location + 1];
        FOOTSTONE_LOG(INFO) << "runScriptFromUri uri = " << uri_str
                             << ", script_name = " << [scriptName UTF8String]
                             << ", base_path = " << [basePath UTF8String]
                             << ", code_cache_dir = " << code_cache_dir;
        auto ctx = scope->GetContext();
        auto key = ctx->CreateString("__HIPPYCURDIR__");
        auto value = ctx->CreateString(footstone::stringview::string_view::new_from_utf8([basePath UTF8String]));
        auto global = ctx->GetGlobalObject();
        ctx->SetProperty(global, key, value);
        scope->SetUriLoader(wrapper->GetLoader());

#ifdef ENABLE_INSPECTOR
        auto devtools_data_source = scope->GetDevtoolsDataSource();
        if (devtools_data_source) {
            auto network_notification = devtools_data_source->GetNotificationCenter()->network_notification;
            auto devtools_handler = std::make_shared<hippy::devtools::DevtoolsHandler>();
            devtools_handler->SetNetworkNotification(network_notification);
            wrapper->GetLoader()->RegisterUriInterceptor(devtools_handler);
        }
#endif

        auto loader = wrapper->GetLoader();
        hippy::UriLoader::bytes content;
        FOOTSTONE_CHECK(loader != nullptr);
        hippy::UriLoader::RetCode code;
        std::unordered_map<std::string, std::string> meta;
        loader->RequestUntrustedContent(uri_str.data(), {}, code, meta, content);

        NSData *data = [NSData dataWithBytes: content.c_str() length: content.size()];
        [bridge executeScript:data url:[NSURL URLWithString:scriptName] completion:^(NSError * _Nonnull error) {
            BOOL succ = (error == nil);
            callback(succ ? 1 : 0);
        }];
    });
    return true;
}

void BridgeImpl::Destroy(int64_t runtime_id, std::function<void(int64_t)> callback, bool is_reload) {
    dispatch_async(HippyBridgeQueue(), ^{
        VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
        [getKeepContainer() removeObjectForKey:[NSString stringWithFormat:@"%lld", runtime_id]];
#if ENABLE_INSPECTOR
        // destory devtools
        auto scope = bridge.jscExecutor.pScope;
        if (scope) {
            auto devtools_data_source = scope->GetDevtoolsDataSource();
            if (devtools_data_source) {
                devtools_data_source->Destroy(is_reload);
            }
        }
#endif
        callback(1);
    });
}

void BridgeImpl::CallFunction(int64_t runtime_id, const char16_t* action, std::string params,
                              std::function<void(int64_t)> callback) {
    if (action == nullptr) {
        return;
    }


    NSString *actionName = U16ToNSString(action);
    NSString *paramsStr = [NSString stringWithCString:params.c_str()
                                             encoding:NSUTF8StringEncoding];
    NSData *objectData = [paramsStr dataUsingEncoding:NSUTF8StringEncoding];
    NSError *jsonError;
    NSDictionary *paramDict = [NSJSONSerialization JSONObjectWithData:objectData
                                                              options:NSJSONReadingMutableContainers
                                                                error:&jsonError];

    dispatch_async(HippyBridgeQueue(), ^{
        VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
        [bridge callFunctionOnAction:actionName arguments:paramDict callback:^(id result, NSError *error) {
            BOOL succ = (error == nil);
            callback(succ ? 1 : 0);
        }];
    });
}

std::shared_ptr<hippy::Scope> BridgeImpl::GetScope(int64_t runtime_id) {
  VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
  return bridge.jscExecutor.pScope;
}
