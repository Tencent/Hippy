//
//  bridge_impl_ios.cc
//  RenderCore
//
//  Created by sshsong on 11/1/2021.
//

#import "bridge_impl_ios.h"
#import "VoltronFlutterBridge.h"
#import "bridge/code-cache-runnable.h"

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

int64_t BridgeImpl::InitJsFrameWork(std::shared_ptr<PlatformRuntime> platform_runtime,
                                    bool single_thread_mode,
                                    bool bridge_param_json,
                                    bool is_dev_module,
                                    int64_t group_id,
                                    const char16_t *char_globalConfig,
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

void BridgeImpl::RunNativeRunnable(int64_t runtime_id,
                                   const char16_t *code_cache_path,
                                   int64_t runnable_id,
                                   std::function<void(int64_t)> callback) {
}

void BridgeImpl::Destroy(int64_t runtime_id, bool single_thread_mode, std::function<void(int64_t)> callback) {

    VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
    bridge.platformRuntime->Destroy();
    [getKeepContainer() removeObjectForKey:[NSString stringWithFormat:@"%lld", runtime_id]];
    callback(1);
}

void BridgeImpl::CallFunction(int64_t runtime_id,
                              const char16_t *action,
                              const char16_t *params,
                              std::function<void(int64_t)> callback) {
    if (action == nullptr || params == nullptr) {
      return;
    }

    VoltronFlutterBridge *bridge = (__bridge VoltronFlutterBridge *)((void *)runtime_id);
    NSString *actionName = U16ToNSString(action);
    NSString *paramsStr = U16ToNSString(params);
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
