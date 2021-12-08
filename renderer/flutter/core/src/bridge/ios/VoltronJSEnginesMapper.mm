//
//  VoltronJSEnginesMapper.m
//  RenderCore
//
//  Created by skindhu-xp on 2021/8/29.
//

#import "VoltronJSEnginesMapper.h"
#import "utils/VoltronLog.h"
#import "VoltronJavaScriptExecutor.h"

using EngineRef = std::pair<std::shared_ptr<Engine>, NSUInteger>;
using EngineMapper = std::unordered_map<std::string, EngineRef>;

@interface VoltronJSEnginesMapper () {
    EngineMapper _engineMapper;
    std::recursive_mutex _mutex;
}

@end

@implementation VoltronJSEnginesMapper

+ (instancetype)defaultInstance {
    static dispatch_once_t onceToken;
    static VoltronJSEnginesMapper *instance = nil;
    dispatch_once(&onceToken, ^{
        instance = [[[self class] alloc] init];
    });
    return instance;
}

- (std::shared_ptr<Engine>)createJSEngineForKey:(NSString *)key {
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    const auto it = _engineMapper.find([key UTF8String]);
    bool findIT = (_engineMapper.end() != it);
    if (findIT) {
        EngineRef &ref = it->second;
        ref.second++;
        return ref.first;
    } else {
        std::shared_ptr<Engine> engine = std::make_shared<Engine>();
        [self setEngine:engine forKey:key];
        return engine;
    }
}

- (std::shared_ptr<Engine>)JSEngineForKey:(NSString *)key {
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    const auto it = _engineMapper.find([key UTF8String]);
    bool findIT = (_engineMapper.end() != it);
    if (findIT) {
        EngineRef &ref = it->second;
        return ref.first;
    } else {
        return nullptr;
    }
}

- (void)setEngine:(std::shared_ptr<Engine>)engine forKey:(NSString *)key {
    EngineRef ref { engine, 1 };
    std::pair<std::string, EngineRef> enginePair { [key UTF8String], ref };
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    _engineMapper.insert(enginePair);
}

- (void)removeEngineForKey:(NSString *)key {
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    const auto it = _engineMapper.find([key UTF8String]);
    bool findIT = (_engineMapper.end() != it);
    if (findIT) {
        EngineRef &ref = it->second;
        ref.second--;
        if (0 == ref.second) {
            VoltronLogInfo(@"[Voltron_OC_Log][Life_Circle],VoltronJSCExecutor destroy engine %@", key);
            std::shared_ptr<Engine> engine = ref.first;
            engine->TerminateRunner();
            _engineMapper.erase(it);
        }
    }
}

@end
