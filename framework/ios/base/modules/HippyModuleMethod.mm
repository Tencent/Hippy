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

#import "HippyModuleMethod.h"
#import "HippyBridge.h"
#import "HippyTurboModuleManager.h"
#import "HippyUtils.h"
#import "HippyAssert.h"
#import "HippyConvert.h"
#import "HippyLog.h"
#import "HippyParserUtils.h"
#import "HippyUtils.h"

#include <objc/message.h>

typedef BOOL (^HippyArgumentBlock)(HippyBridge *, NSUInteger, id);

@implementation HippyMethodArgument

@synthesize type = _type;
@synthesize nullability = _nullability;
@synthesize unused = _unused;

- (instancetype)initWithType:(NSString *)type nullability:(HippyNullability)nullability unused:(BOOL)unused {
    if (self = [super init]) {
        _type = [type copy];
        _nullability = nullability;
        _unused = unused;
    }
    return self;
}

@end

@implementation HippyModuleMethod {
    Class _moduleClass;
    NSInvocation *_invocation;
    NSArray<HippyArgumentBlock> *_argumentBlocks;
    NSString *_methodSignature;
    NSString *_JSMethodName;
    SEL _selector;
}

@synthesize arguments = _arguments;

static void HippyLogArgumentError(HippyModuleMethod *method, NSUInteger index, id valueOrType, const char *issue) {
    HippyLogError(@"Argument %tu (%@) of %@.%@ %s", 
                  index, valueOrType, HippyBridgeModuleNameForClass(method->_moduleClass), method.JSMethodName, issue);
}

// returns YES if the selector ends in a colon (indicating that there is at
// least one argument, and maybe more selector parts) or NO if it doesn't.
static BOOL HippyParseSelectorPart(const char **input, NSMutableString *selector) {
    NSString *selectorPart;
    if (HippyParseIdentifier(input, &selectorPart)) {
        [selector appendString:selectorPart];
    }
    HippySkipWhitespace(input);
    if (HippyReadChar(input, ':')) {
        [selector appendString:@":"];
        HippySkipWhitespace(input);
        return YES;
    }
    return NO;
}

static BOOL HippyParseUnused(const char **input) {
    return HippyReadString(input, "__unused") || HippyReadString(input, "__attribute__((unused))")
           || HippyReadString(input, "__attribute__((__unused__))");
}

static HippyNullability HippyParseNullability(const char **input) {
    if (HippyReadString(input, "nullable")) {
        return HippyNullable;
    } else if (HippyReadString(input, "nonnull")) {
        return HippyNonnullable;
    }
    return HippyNullabilityUnspecified;
}

static HippyNullability HippyParseNullabilityPostfix(const char **input) {
    if (HippyReadString(input, "_Nullable")) {
        return HippyNullable;
    } else if (HippyReadString(input, "_Nonnull")) {
        return HippyNonnullable;
    }
    return HippyNullabilityUnspecified;
}

SEL HippyParseMethodSignature(NSString *, NSArray<HippyMethodArgument *> **);
SEL HippyParseMethodSignature(NSString *methodSignature, NSArray<HippyMethodArgument *> **arguments) {
    const char *input = methodSignature.UTF8String;
    HippySkipWhitespace(&input);

    NSMutableArray *args;
    NSMutableString *selector = [NSMutableString new];
    while (HippyParseSelectorPart(&input, selector)) {
        if (!args) {
            args = [NSMutableArray new];
        }

        // Parse type
        if (HippyReadChar(&input, '(')) {
            HippySkipWhitespace(&input);

            BOOL unused = HippyParseUnused(&input);
            HippySkipWhitespace(&input);

            HippyNullability nullability = HippyParseNullability(&input);
            HippySkipWhitespace(&input);

            NSString *type = HippyParseType(&input);
            HippySkipWhitespace(&input);
            if (nullability == HippyNullabilityUnspecified) {
                nullability = HippyParseNullabilityPostfix(&input);
            }
            [args addObject:[[HippyMethodArgument alloc] initWithType:type nullability:nullability unused:unused]];
            HippySkipWhitespace(&input);
            HippyReadChar(&input, ')');
            HippySkipWhitespace(&input);
        } else {
            // Type defaults to id if unspecified
            [args addObject:[[HippyMethodArgument alloc] initWithType:@"id" nullability:HippyNullable unused:NO]];
        }

        // Argument name
        HippyParseIdentifier(&input, NULL);
        HippySkipWhitespace(&input);
    }

    *arguments = [args copy];
    return NSSelectorFromString(selector);
}

- (instancetype)initWithMethodSignature:(NSString *)methodSignature JSMethodName:(NSString *)JSMethodName moduleClass:(Class)moduleClass {
    if (self = [super init]) {
        _moduleClass = moduleClass;
        _methodSignature = [methodSignature copy];
        _JSMethodName = [JSMethodName copy];
    }

    return self;
}

static void enqueueBlockCallback(HippyBridge *bridge, HippyModuleMethod *moduleMethod, NSNumber *json, NSArray *args) {
    if (!bridge || !moduleMethod) {
        return;
    }
    BOOL shouldEnqueueCallback = YES;
    if ([[bridge methodInterceptor] respondsToSelector:@selector(shouldCallbackBeInvokedWithModuleName:methodName:callbackId:arguments:)]) {
        NSString *moduleName = HippyBridgeModuleNameForClass(moduleMethod.moduleClass);
        shouldEnqueueCallback = [[bridge methodInterceptor] shouldCallbackBeInvokedWithModuleName:moduleName
                                                                                       methodName:[moduleMethod JSMethodName]
                                                                                       callbackId:json
                                                                                        arguments:args];
    }
    if (shouldEnqueueCallback) {
        [bridge enqueueCallback:json args:args];
    }
}

- (void)processMethodSignature {
    NSArray<HippyMethodArgument *> *arguments;
    _selector = HippyParseMethodSignature(_methodSignature, &arguments);
    _arguments = [arguments copy];
    HippyAssert(_selector, @"%@ is not a valid selector", _methodSignature);

    // Create method invocation
    NSMethodSignature *methodSignature = [_moduleClass instanceMethodSignatureForSelector:_selector];
    HippyAssert(methodSignature, @"%@ is not a recognized Objective-C method.", _methodSignature);
    NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSignature];
    invocation.selector = _selector;
    _invocation = invocation;

    // Process arguments
    NSUInteger numberOfArguments = methodSignature.numberOfArguments;
    NSMutableArray<HippyArgumentBlock> *argumentBlocks = [[NSMutableArray alloc] initWithCapacity:numberOfArguments - 2];

#define HIPPY_ARG_BLOCK(_logic)                                                             \
    [argumentBlocks addObject:^(__unused HippyBridge * bridge, NSUInteger index, id json) { \
        _logic [invocation setArgument:&value atIndex:(index) + 2];                         \
        return YES;                                                                         \
    }];

    /**
     * Explicitly copy the block and retain it, since NSInvocation doesn't retain them.
     */
#define Hippy_BLOCK_ARGUMENT(block...)                                 \
    id value = json ? [block copy] : (id) ^ (__unused NSArray * _) {}; \
    CFBridgingRetain(value)

    __weak HippyModuleMethod *weakSelf = self;
    
    for (NSUInteger i = 2; i < numberOfArguments; i++) {
        const char *objcType = [methodSignature getArgumentTypeAtIndex:i];
        BOOL isNullableType = NO;
        HippyMethodArgument *argument = arguments[i - 2];
        NSString *typeName = argument.type;
        SEL selector = HippyConvertSelectorForType(typeName);
        static const char *blockType = @encode(__typeof(^ {}));
        if ([HippyConvert respondsToSelector:selector]) {
            switch (objcType[0]) {
#define HIPPY_CASE(_value, _type)                                                           \
    case _value: {                                                                          \
        _type (*convert)(id, SEL, id) = (__typeof(convert))objc_msgSend;                    \
        HIPPY_ARG_BLOCK(_type value = convert([HippyConvert class], selector, json);)\
        break;                                                                              \
    }

                HIPPY_CASE(_C_CHR, char)
                HIPPY_CASE(_C_UCHR, unsigned char)
                HIPPY_CASE(_C_SHT, short)
                HIPPY_CASE(_C_USHT, unsigned short)
                HIPPY_CASE(_C_INT, int)
                HIPPY_CASE(_C_UINT, unsigned int)
                HIPPY_CASE(_C_LNG, long)
                HIPPY_CASE(_C_ULNG, unsigned long)
                HIPPY_CASE(_C_LNG_LNG, long long)
                HIPPY_CASE(_C_ULNG_LNG, unsigned long long)
                HIPPY_CASE(_C_FLT, float)
                HIPPY_CASE(_C_DBL, double)
                HIPPY_CASE(_C_BOOL, BOOL)

#define HIPPY_NULLABLE_CASE(_value, _type)                                            \
    case _value: {                                                                    \
        isNullableType = YES;                                                         \
        _type (*convert)(id, SEL, id) = (__typeof(convert))objc_msgSend;                \
        HIPPY_ARG_BLOCK(_type value = convert([HippyConvert class], selector, json);) \
        break;                                                                        \
    }

                HIPPY_NULLABLE_CASE(_C_SEL, SEL)
                HIPPY_NULLABLE_CASE(_C_CHARPTR, const char *)
                HIPPY_NULLABLE_CASE(_C_PTR, void *)

                case _C_ID: {
                    isNullableType = YES;
                    id (*convert)(id, SEL, id) = (__typeof(convert))objc_msgSend;
                    HIPPY_ARG_BLOCK(id value = convert([HippyConvert class], selector, json); CFBridgingRetain(value);)
                    break;
                }

                case _C_STRUCT_B: {
                    NSMethodSignature *typeSignature = [HippyConvert methodSignatureForSelector:selector];
                    NSInvocation *typeInvocation = [NSInvocation invocationWithMethodSignature:typeSignature];
                    typeInvocation.selector = selector;
                    typeInvocation.target = [HippyConvert class];

                    [argumentBlocks addObject:^(__unused HippyBridge *bridge, NSUInteger index, id json) {
                        void *returnValue = malloc(typeSignature.methodReturnLength);
                        [typeInvocation setArgument:&json atIndex:2];
                        [typeInvocation invoke];
                        [typeInvocation getReturnValue:returnValue];
                        [invocation setArgument:returnValue atIndex:index + 2];
                        free(returnValue);
                        return YES;
                    }];
                    break;
                }

                default: {
                    if (!strcmp(objcType, blockType)) {
                        HIPPY_ARG_BLOCK(if (HIPPY_DEBUG && json && ![json isKindOfClass:[NSNumber class]]) {
                            HippyLogArgumentError(weakSelf, index, json, "should be a function");
                            return NO;
                        }
                        __weak HippyBridge *weakBridge = bridge;
                        Hippy_BLOCK_ARGUMENT(^(NSArray *args) {
                            enqueueBlockCallback(weakBridge, weakSelf, json, args);
                        });)
                    } else {
                        HippyLogError(@"Unsupported argument type '%@' in method %@.", typeName, [self methodName]);
                    }
                }
            }
        } else if ([typeName isEqualToString:@"HippyResponseSenderBlock"]) {
            HIPPY_ARG_BLOCK(if (HIPPY_DEBUG && json && ![json isKindOfClass:[NSNumber class]]) {
                HippyLogArgumentError(weakSelf, index, json, "should be a function");
                return NO;
            }
            __weak HippyBridge *weakBridge = bridge;
            Hippy_BLOCK_ARGUMENT(^(NSArray *args) {
                enqueueBlockCallback(weakBridge, weakSelf, json, args);
            });)
        } else if ([typeName isEqualToString:@"HippyResponseErrorBlock"]) {
            HIPPY_ARG_BLOCK(if (HIPPY_DEBUG && json && ![json isKindOfClass:[NSNumber class]]) {
                HippyLogArgumentError(weakSelf, index, json, "should be a function");
                return NO;
            }
            __weak HippyBridge *weakBridge = bridge;
            Hippy_BLOCK_ARGUMENT(^(NSError *error) {
                NSArray *errorArgs = @[HippyJSErrorFromNSError(error)];
                enqueueBlockCallback(weakBridge, weakSelf, json, errorArgs);
            });)
        } else if ([typeName isEqualToString:@"HippyPromiseResolveBlock"]) {
            if (i != numberOfArguments - 2) {
                HippyLogWarn(@"HippyPromiseResolveBlock should be the second to last parameter in -[%@ %@]", _moduleClass, _methodSignature);
            }
            HIPPY_ARG_BLOCK(
                if (!json) {
                    HippyLogArgumentError(weakSelf, index, json, "should be a promise resolver function");
                    return NO;
                }
                id blockArg = nil;
                if (![json isKindOfClass:[NSNumber class]]) {
                    // In Hippy3.0, Dom Nodes call function by method name directly,
                    // so it is not a Number anymore.
                    // See NativeRenderManager::CallFunction() for more.
                    blockArg = json;
                } else {
                    __weak HippyBridge *weakBridge = bridge;
                    blockArg = ^(id result){
                        NSArray *args = result ? @[result] : @[];
                        enqueueBlockCallback(weakBridge, weakSelf, json, args);
                    };
                }
                Hippy_BLOCK_ARGUMENT(blockArg);
            )
        } else if ([typeName isEqualToString:@"HippyPromiseRejectBlock"]) {
            HippyAssert(i == numberOfArguments - 1,
                        @"HippyPromiseRejectBlock must be the last parameter in -[%@ %@]", _moduleClass, _methodSignature);
            HIPPY_ARG_BLOCK(
                if (HIPPY_DEBUG && ![json isKindOfClass:[NSNumber class]]) {
                    HippyLogArgumentError(weakSelf, index, json, "should be a promise rejecter function");
                    return NO;
                }
                __weak HippyBridge *weakBridge = bridge;
                Hippy_BLOCK_ARGUMENT(^(NSString *code, NSString *message, NSError *error) {
                    NSDictionary *errorJSON = HippyJSErrorFromCodeMessageAndNSError(code, message, error);
                    NSArray *args = @[errorJSON];
                    enqueueBlockCallback(weakBridge, weakSelf, json, args);
                });
            )
        } else if ([HippyTurboModuleManager isTurboModule:typeName]) {
            [argumentBlocks addObject:^(__unused HippyBridge * bridge, NSUInteger index, id json) {
                [invocation setArgument:&json atIndex:(index) + 2];
                CFBridgingRetain(json);
                return YES;
            }];
        } else {
            // Unknown argument type
            HippyLogError(@"Unknown argument type '%@' in method %@. Extend HippyConvert to support this type.", typeName, [self methodName]);
        }

        if (HIPPY_DEBUG) {
            HippyNullability nullability = argument.nullability;
            if (!isNullableType) {
                if (nullability == HippyNullable) {
                    HippyLogArgumentError(weakSelf, i - 2, typeName,
                        "is marked as "
                        "nullable, but is not a nullable type.");
                }
                nullability = HippyNonnullable;
            }

            /**
             * Special case - Numbers are not nullable in Android, so we
             * don't support this for now. In future we may allow it.
             */
            if ([typeName isEqualToString:@"NSNumber"]) {
                BOOL unspecified = (nullability == HippyNullabilityUnspecified);
                if (!argument.unused && (nullability == HippyNullable || unspecified)) {
                    HippyLogArgumentError(weakSelf, i - 2, typeName,
                        [unspecified ? @"has unspecified nullability" : @"is marked as nullable"
                            stringByAppendingString:@" but Hippy requires that all NSNumber "
                                                     "arguments are explicitly marked as `nonnull` to ensure "
                                                     "compatibility with Android."]
                            .UTF8String);
                }
                nullability = HippyNonnullable;
            }

            if (nullability == HippyNonnullable) {
                HippyArgumentBlock oldBlock = argumentBlocks[i - 2];
                argumentBlocks[i - 2] = ^(HippyBridge *bridge, NSUInteger index, id json) {
                    if (json != nil) {
                        if (!oldBlock(bridge, index, json)) {
                            return NO;
                        }
                        if (isNullableType) {
                            // Check converted value wasn't null either, as method probably
                            // won't gracefully handle a nil vallue for a nonull argument
                            void *value;
                            [invocation getArgument:&value atIndex:index + 2];
                            if (value == NULL) {
                                return NO;
                            }
                        }
                        return YES;
                    }
                    HippyLogArgumentError(weakSelf, index, typeName, "must not be null");
                    return NO;
                };
            }
        }
    }

    _argumentBlocks = [argumentBlocks copy];
}

- (SEL)selector {
    if (_selector == NULL) {
        [self processMethodSignature];
    }
    return _selector;
}

- (NSString *)JSMethodName {
    NSString *methodName = _JSMethodName;
    if (methodName.length == 0) {
        methodName = _methodSignature;
        NSRange colonRange = [methodName rangeOfString:@":"];
        if (colonRange.location != NSNotFound) {
            methodName = [methodName substringToIndex:colonRange.location];
        }
        methodName = [methodName stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
        _JSMethodName = methodName;
        HippyAssert(methodName.length,
            @"%@ is not a valid JS function name, please"
             " supply an alternative using HIPPY_REMAP_METHOD()",
            _methodSignature);
    }
    return methodName;
}

- (HippyFunctionType)functionType {
    if ([_methodSignature rangeOfString:@"HippyPromise"].length) {
        return HippyFunctionTypePromise;
    }
    else if ([_methodSignature rangeOfString:@"HippyResponseSenderBlock"].length) {
        return HippyFunctionTypeCallback;
    }
    else {
        return HippyFunctionTypeNormal;
    }
}

- (id)invokeWithBridge:(HippyBridge *)bridge module:(id)module arguments:(NSArray *)arguments {
    if (_argumentBlocks == nil) {
        [self processMethodSignature];
    }
    if (HIPPY_DEBUG) {
        // Sanity check
        HippyAssert([module class] == _moduleClass, @"Attempted to invoke method \
                  %@ on a module of class %@", [self methodName], [module class]);

        // Safety check
        if (arguments.count != _argumentBlocks.count) {
            NSInteger actualCount = arguments.count;
            NSInteger expectedCount = _argumentBlocks.count;

            // Subtract the implicit Promise resolver and rejecter functions for implementations of async functions
            if (self.functionType == HippyFunctionTypePromise) {
                actualCount -= 2;
                expectedCount -= 2;
            }

            HippyLogError(@"%@.%@ was called with %ld arguments, but expects %ld. \
                        If you haven\'t changed this method "
                          @"yourself, this usually means that \
                        your versions of the native code and JavaScript code are out "
                          @"of sync. \
                        Updating both should make this error go away.",
                HippyBridgeModuleNameForClass(_moduleClass), self.JSMethodName, (long)actualCount, (long)expectedCount);
        }
    }

    // Set arguments
    NSUInteger index = 0;
    for (id json in arguments) {
        // release模式下，如果前端给的参数多于终端所需参数，那会造成数组越界，引起整个逻辑return。
        //这里做个修改，如果前端给的参数过多，那忽略多余的参数。
        if ([_argumentBlocks count] <= index) {
            break;
        }
        HippyArgumentBlock block = _argumentBlocks[index];
        if (!block(bridge, index, HippyNilIfNull(json))) {
            // Invalid argument, abort
            HippyLogArgumentError(self, index, json, "could not be processed. Aborting method call.");
            return nil;
        }
        index++;
    }

    // Invoke method
    [_invocation invokeWithTarget:module];

    HippyAssert(@encode(HippyArgumentBlock)[0] == _C_ID,
        @"Block type encoding has changed, it won't be released. A check for the block"
         "type encoding (%s) has to be added below.",
        @encode(HippyArgumentBlock));

    index = 2;
    for (NSUInteger length = _invocation.methodSignature.numberOfArguments; index < length; index++) {
        if ([_invocation.methodSignature getArgumentTypeAtIndex:index][0] == _C_ID) {
            __unsafe_unretained id value;
            [_invocation getArgument:&value atIndex:index];
            if (value) {
                CFRelease((__bridge CFTypeRef)value);
            }
        }
    }
    
    void *returnValue;
    if (strcmp(_invocation.methodSignature.methodReturnType, "@") == 0) {
        [_invocation getReturnValue:&returnValue];
        return (__bridge id)returnValue;
    }

    return nil;
}

- (NSString *)methodName {
    if (_selector == NULL) {
        [self processMethodSignature];
    }
    return [NSString stringWithFormat:@"-[%@ %@]", _moduleClass, NSStringFromSelector(_selector)];
}

- (NSArray<id<HippyBridgeArgument>> *)arguments {
    if (!_arguments) {
        [self processMethodSignature];
    }
    return [_arguments copy];
}

- (NSString *)description {
    return [NSString stringWithFormat:@"<%@: %p; exports %@ as %@()>", [self class], self, [self methodName], self.JSMethodName];
}

@end
