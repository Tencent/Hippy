/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyAsyncLocalStorage.h"

#import <Foundation/Foundation.h>

#import <CommonCrypto/CommonCryptor.h>
#import <CommonCrypto/CommonDigest.h>
#import "HippyBridge.h"
#import "HippyConvert.h"
#import "HippyLog.h"
#import "HippyUtils.h"

NSString *const HippyStorageDirectory = @"HippyAsyncLocalStorage_V1";
static NSString *const HippyManifestFileName = @"manifest.json";
static const NSUInteger HippyInlineValueThreshold = 1024;

#pragma mark - Static helper functions

static NSDictionary *HippyErrorForKey(NSString *key)
{
    if (![key isKindOfClass:[NSString class]]) {
        return HippyMakeAndLogError(@"Invalid key - must be a string.  Key: ", key, @{@"key": key});
    } else if (key.length < 1) {
        return HippyMakeAndLogError(@"Invalid key - must be at least one character.  Key: ", key, @{@"key": key});
    } else {
        return nil;
    }
}

static void HippyAppendError(NSDictionary *error, NSMutableArray<NSDictionary *> **errors)
{
    if (error && errors) {
        if (!*errors) {
            *errors = [NSMutableArray new];
        }
        [*errors addObject:error];
    }
}

static NSString *HippyReadFile(NSString *filePath, NSString *key, NSDictionary **errorOut)
{
    if ([[NSFileManager defaultManager] fileExistsAtPath:filePath]) {
        NSError *error;
        NSStringEncoding encoding;
        NSString *entryString = [NSString stringWithContentsOfFile:filePath usedEncoding:&encoding error:&error];
        if (error) {
            *errorOut = HippyMakeError(@"Failed to read storage file.", error, @{@"key": key});
        } else if (encoding != NSUTF8StringEncoding) {
            *errorOut = HippyMakeError(@"Incorrect encoding of storage file: ", @(encoding), @{@"key": key});
        } else {
            return entryString;
        }
    }
    return nil;
}


// Only merges objects - all other types are just clobbered (including arrays)
static BOOL HippyMergeRecursive(NSMutableDictionary *destination, NSDictionary *source)
{
    BOOL modified = NO;
    for (NSString *key in source) {
        id sourceValue = source[key];
        id destinationValue = destination[key];
        if ([sourceValue isKindOfClass:[NSDictionary class]]) {
            if ([destinationValue isKindOfClass:[NSDictionary class]]) {
                if ([destinationValue classForCoder] != [NSMutableDictionary class]) {
                    destinationValue = [destinationValue mutableCopy];
                }
                if (HippyMergeRecursive(destinationValue, sourceValue)) {
                    destination[key] = destinationValue;
                    modified = YES;
                }
            } else {
                destination[key] = [sourceValue copy];
                modified = YES;
            }
        } else if (![source isEqual:destinationValue]) {
            destination[key] = [sourceValue copy];
            modified = YES;
        }
    }
    return modified;
}

static dispatch_queue_t HippyGetMethodQueue()
{
    // We want all instances to share the same queue since they will be reading/writing the same files.
    static dispatch_queue_t queue;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        queue = dispatch_queue_create("com.tencent.hippy.AsyncLocalStorageQueue", DISPATCH_QUEUE_SERIAL);
    });
    return queue;
}

static NSCache *HippyGetCache()
{
    // We want all instances to share the same cache since they will be reading/writing the same files.
    static NSCache *cache;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        cache = [NSCache new];
        cache.totalCostLimit = 2 * 1024 * 1024; // 2MB
        
        // Clear cache in the event of a memory warning
        [[NSNotificationCenter defaultCenter] addObserverForName:UIApplicationDidReceiveMemoryWarningNotification object:nil queue:nil usingBlock:^(__unused NSNotification *note) {
            [cache removeAllObjects];
        }];
    });
    return cache;
}

#pragma mark - HippyAsyncLocalStorage

@implementation HippyAsyncLocalStorage
{
    BOOL _haveSetup;
    // The manifest is a dictionary of all keys with small values inlined.  Null values indicate values that are stored
    // in separate files (as opposed to nil values which don't exist).  The manifest is read off disk at startup, and
    // written to disk after all mutations.
    NSMutableDictionary<NSString *, NSString *> *_manifest;
    NSString *_storageDirectory;
    NSString *_manifestFilePath;
    BOOL _HippyHasCreatedStorageDirectory;
}
@synthesize bridge = _bridge;
HIPPY_EXPORT_MODULE(AsyncStorage)

- (dispatch_queue_t)methodQueue
{
    return HippyGetMethodQueue();
}

+ (void)clearAllData
{
    NSString *docDir = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
    NSString *storageDirectory = [docDir stringByAppendingPathComponent:HippyStorageDirectory];
    //begin delete all files from 'storageDirectory'
    dispatch_async(HippyGetMethodQueue(), ^{
        NSError *error = nil;
        NSArray <NSString *>*allFiles = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:storageDirectory error:&error];
        for (NSString *fileName in allFiles) {
            NSString *filePath = [storageDirectory stringByAppendingPathComponent:fileName];
            [[NSFileManager defaultManager] removeItemAtPath:filePath error:&error];
        }
    });
}

- (NSDictionary *)HippyDeleteStorageDirectory
{
    NSError *error;
    [[NSFileManager defaultManager] removeItemAtPath:[self HippyGetStorageDirectory] error:&error];
    _HippyHasCreatedStorageDirectory = NO;
    return error ? HippyMakeError(@"Failed to delete storage directory.", error, nil) : nil;
}

- (NSString *) HippyGetManifestFilePath
{
    if (_manifestFilePath == nil) {
        _manifestFilePath = [[self HippyGetStorageDirectory] stringByAppendingPathComponent:HippyManifestFileName];
    }
    return _manifestFilePath;
}

- (void)invalidate
{
    if (_clearOnInvalidate) {
        [HippyGetCache() removeAllObjects];
        [self HippyDeleteStorageDirectory];
    }
    _clearOnInvalidate = NO;
    [_manifest removeAllObjects];
    _haveSetup = NO;
}

- (BOOL)isValid
{
    return _haveSetup;
}

- (void)dealloc
{
    [self invalidate];
}

- (NSString *)_filePathForKey:(NSString *)key
{
    NSString *safeFileName = HippyMD5Hash(key);
    return [[self HippyGetStorageDirectory] stringByAppendingPathComponent:safeFileName];
}

- (NSDictionary *)_ensureSetup
{
    HippyAssertThread(HippyGetMethodQueue(), @"Must be executed on storage thread");
    
#if TARGET_OS_TV
    HippyLogWarn(@"Persistent storage is not supported on tvOS, your data may be removed at any point.")
#endif
    
    NSError *error = nil;
    if (!_HippyHasCreatedStorageDirectory) {
        [[NSFileManager defaultManager] createDirectoryAtPath:[self HippyGetStorageDirectory]
                                  withIntermediateDirectories:YES
                                                   attributes:nil
                                                        error:&error];
        if (error) {
            return HippyMakeError(@"Failed to create storage directory.", error, nil);
        }
        _HippyHasCreatedStorageDirectory = YES;
    }
    if (!_haveSetup) {
        NSDictionary *errorOut;
        NSString *serialized = HippyReadFile([self HippyGetManifestFilePath], nil, &errorOut);
        _manifest = serialized ? HippyJSONParseMutable(serialized, &error) : [NSMutableDictionary new];
        if (error) {
            HippyLogWarn(@"Failed to parse manifest - creating new one.\n\n%@", error);
            _manifest = [NSMutableDictionary new];
        }
        _haveSetup = YES;
    }
    return nil;
}

- (NSDictionary *)_writeManifest:(NSMutableArray<NSDictionary *> **)errors
{
    NSError *error;
    NSString *serialized = HippyJSONStringify(_manifest, &error);
    [serialized writeToFile:[self HippyGetManifestFilePath] atomically:YES encoding:NSUTF8StringEncoding error:&error];
    NSDictionary *errorOut;
    if (error) {
        errorOut = HippyMakeError(@"Failed to write manifest file.", error, nil);
        HippyAppendError(errorOut, errors);
    }
    return errorOut;
}

- (NSString *)_getValueForKey:(NSString *)key errorOut:(NSDictionary **)errorOut
{
    NSString *value = _manifest[key]; // nil means missing, null means there may be a data file, else: NSString
    if (value == (id)kCFNull) {
        value = [HippyGetCache() objectForKey:key];
        if (!value) {
            NSString *filePath = [self _filePathForKey:key];
            value = HippyReadFile(filePath, key, errorOut);
            if (value) {
                [HippyGetCache() setObject:value forKey:key cost:value.length];
            } else {
                // file does not exist after all, so remove from manifest (no need to save
                // manifest immediately though, as cost of checking again next time is negligible)
                [_manifest removeObjectForKey:key];
            }
        }
    }
    return value;
}

- (NSDictionary *)_writeEntry:(NSArray<NSString *> *)entry changedManifest:(BOOL *)changedManifest
{
    if (entry.count != 2) {
        return HippyMakeAndLogError(@"Entries must be arrays of the form [key: string, value: string], got: ", entry, nil);
    }
    NSString *key = entry[0];
    NSDictionary *errorOut = HippyErrorForKey(key);
    if (errorOut) {
        return errorOut;
    }
    NSString *value = entry[1];
    NSString *filePath = [self _filePathForKey:key];
    NSError *error;
    if (value.length <= HippyInlineValueThreshold) {
        if (_manifest[key] == (id)kCFNull) {
            // If the value already existed but wasn't inlined, remove the old file.
            [[NSFileManager defaultManager] removeItemAtPath:filePath error:nil];
            [HippyGetCache() removeObjectForKey:key];
        }
        *changedManifest = YES;
        _manifest[key] = value;
        return nil;
    }
    [value writeToFile:filePath atomically:YES encoding:NSUTF8StringEncoding error:&error];
    [HippyGetCache() setObject:value forKey:key cost:value.length];
    if (error) {
        errorOut = HippyMakeError(@"Failed to write value.", error, @{@"key": key});
    } else if (_manifest[key] != (id)kCFNull) {
        *changedManifest = YES;
        _manifest[key] = (id)kCFNull;
    }
    return errorOut;
}

- (NSString *) HippyGetStorageDirectory
{
    if (nil == _storageDirectory) {
        _storageDirectory = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
        /* HippyAsyncLocalStorage负责将配置文件写入本地磁盘
         * 在调用者指定[HippyBridge moduleName]属性的情况下，HippyAsyncLocalStorage会在HippyStorageDirectory目录下依据[HippyBridge moduleName]返回值再次建一个文件夹用于存放当前业务配置。
         * 保证各业务之间数据独立互不共享。
         * !!!请在初始化HippyRootView的时候务必传入moduleName参数!!!。
         * 若调用者不指定[HippyBridge moduleName]，HippyAsyncLocalStorage会将配置写入公共存储文件HippyStorageDirectory中，这样会造成如下问题：
         * 1.多业务同时写入一个文件造成崩溃。 2.多业务写配置文件时若key值相同造成数据错乱。
         */
        HippyAssert(_bridge.moduleName, @"重要！！这里一定要给HippyBridge.moduleName属性赋值。");
        _storageDirectory = [[_storageDirectory stringByAppendingPathComponent:HippyStorageDirectory] stringByAppendingPathComponent:_bridge.moduleName];
    }
    return _storageDirectory;
}

#pragma mark - Exported JS Functions

HIPPY_EXPORT_METHOD(multiGet:(NSArray<NSString *> *)keys
                  callback:(HippyResponseSenderBlock)callback)
{
    NSDictionary *errorOut = [self _ensureSetup];
    if (errorOut) {
        callback(@[@[errorOut], (id)kCFNull]);
        return;
    }
    NSMutableArray<NSDictionary *> *errors;
    NSMutableArray<NSArray<NSString *> *> *result = [[NSMutableArray alloc] initWithCapacity:keys.count];
    for (NSString *key in keys) {
        id keyError;
        id value = [self _getValueForKey:key errorOut:&keyError];
        [result addObject:@[key, HippyNullIfNil(value)]];
        HippyAppendError(keyError, &errors);
    }
    callback(@[HippyNullIfNil(errors), result]);
}

HIPPY_EXPORT_METHOD(multiSet:(NSArray<NSArray<NSString *> *> *)kvPairs
                  callback:(HippyResponseSenderBlock)callback)
{
    NSDictionary *errorOut = [self _ensureSetup];
    if (errorOut) {
        callback(@[@[errorOut]]);
        return;
    }
    BOOL changedManifest = NO;
    NSMutableArray<NSDictionary *> *errors;
    for (NSArray<NSString *> *entry in kvPairs) {
        NSDictionary *keyError = [self _writeEntry:entry changedManifest:&changedManifest];
        HippyAppendError(keyError, &errors);
    }
    if (changedManifest) {
        [self _writeManifest:&errors];
    }
    callback(@[HippyNullIfNil(errors)]);
}

HIPPY_EXPORT_METHOD(multiMerge:(NSArray<NSArray<NSString *> *> *)kvPairs
                  callback:(HippyResponseSenderBlock)callback)
{
    NSDictionary *errorOut = [self _ensureSetup];
    if (errorOut) {
        callback(@[@[errorOut]]);
        return;
    }
    BOOL changedManifest = NO;
    NSMutableArray<NSDictionary *> *errors;
    for (__strong NSArray<NSString *> *entry in kvPairs) {
        NSDictionary *keyError;
        NSString *value = [self _getValueForKey:entry[0] errorOut:&keyError];
        if (!keyError) {
            if (value) {
                NSError *jsonError;
                NSMutableDictionary *mergedVal = HippyJSONParseMutable(value, &jsonError);
                if (HippyMergeRecursive(mergedVal, HippyJSONParse(entry[1], &jsonError))) {
                    entry = @[entry[0], HippyNullIfNil(HippyJSONStringify(mergedVal, NULL))];
                }
                if (jsonError) {
                    keyError = HippyJSErrorFromNSError(jsonError);
                }
            }
            if (!keyError) {
                keyError = [self _writeEntry:entry changedManifest:&changedManifest];
            }
        }
        HippyAppendError(keyError, &errors);
    }
    if (changedManifest) {
        [self _writeManifest:&errors];
    }
    callback(@[HippyNullIfNil(errors)]);
}

HIPPY_EXPORT_METHOD(multiRemove:(NSArray<NSString *> *)keys
                  callback:(HippyResponseSenderBlock)callback)
{
    NSDictionary *errorOut = [self _ensureSetup];
    if (errorOut) {
        callback(@[@[errorOut]]);
        return;
    }
    NSMutableArray<NSDictionary *> *errors;
    BOOL changedManifest = NO;
    for (NSString *key in keys) {
        NSDictionary *keyError = HippyErrorForKey(key);
        if (!keyError) {
            if (_manifest[key] == (id)kCFNull) {
                NSString *filePath = [self _filePathForKey:key];
                [[NSFileManager defaultManager] removeItemAtPath:filePath error:nil];
                [HippyGetCache() removeObjectForKey:key];
                // remove the key from manifest, but no need to mark as changed just for
                // this, as the cost of checking again next time is negligible.
                [_manifest removeObjectForKey:key];
            } else if (_manifest[key]) {
                changedManifest = YES;
                [_manifest removeObjectForKey:key];
            }
        }
        HippyAppendError(keyError, &errors);
    }
    if (changedManifest) {
        [self _writeManifest:&errors];
    }
    callback(@[HippyNullIfNil(errors)]);
}

HIPPY_EXPORT_METHOD(clear:(HippyResponseSenderBlock)callback)
{
    [_manifest removeAllObjects];
    [HippyGetCache() removeAllObjects];
    NSDictionary *error = [self HippyDeleteStorageDirectory];
    callback(@[HippyNullIfNil(error)]);
}

HIPPY_EXPORT_METHOD(getAllKeys:(HippyResponseSenderBlock)callback)
{
    NSDictionary *errorOut = [self _ensureSetup];
    if (errorOut) {
        callback(@[errorOut, (id)kCFNull]);
    } else {
        callback(@[(id)kCFNull, _manifest.allKeys]);
    }
}

@end
