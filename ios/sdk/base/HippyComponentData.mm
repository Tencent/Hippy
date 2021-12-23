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

#import "HippyComponentData.h"

#import <objc/message.h>

#import "HippyBridge.h"
#import "HippyConvert.h"
#import "HippyShadowView.h"
#import "HippyUtils.h"
#import "UIView+Hippy.h"
#import "HippyBridgeModule.h"

typedef void (^HippyPropBlock)(id<HippyComponent> view, id json);

@interface HippyComponentProp : NSObject

@property (nonatomic, copy, readonly) NSString *type;
@property (nonatomic, copy) HippyPropBlock propBlock;

@end

@implementation HippyComponentProp

- (instancetype)initWithType:(NSString *)type {
    if ((self = [super init])) {
        _type = [type copy];
    }
    return self;
}

@end

@implementation HippyComponentData {
    id<HippyComponent> _defaultView;  // Only needed for HIPPY_CUSTOM_VIEW_PROPERTY
    NSMutableDictionary<NSString *, HippyPropBlock> *_viewPropBlocks;
    NSMutableDictionary<NSString *, HippyPropBlock> *_shadowPropBlocks;
    BOOL _implementsUIBlockToAmendWithShadowViewRegistry;
    __weak HippyBridge *_bridge;
}

@synthesize manager = _manager;

- (instancetype)initWithManagerClass:(Class)managerClass bridge:(HippyBridge *)bridge {
    if ((self = [super init])) {
        _bridge = bridge;
        _managerClass = managerClass;
        _viewPropBlocks = [NSMutableDictionary new];
        _shadowPropBlocks = [NSMutableDictionary new];

        // Hackety hack, this partially re-implements HippyBridgeModuleNameForClass
        // We want to get rid of Hippy and RK prefixes, but a lot of JS code still references
        // view names by prefix. So, while HippyBridgeModuleNameForClass now drops these
        // prefixes by default, we'll still keep them around here.
        NSString *name = [managerClass moduleName];
        if (name.length == 0) {
            name = NSStringFromClass(managerClass);
        }
        if ([name hasPrefix:@"RK"]) {
            name = [name stringByReplacingCharactersInRange:(NSRange) { 0, @"RK".length } withString:@"Hippy"];
        }
        if ([name hasSuffix:@"Manager"]) {
            name = [name substringToIndex:name.length - @"Manager".length];
        }

        HippyAssert(name.length, @"Invalid moduleName '%@'", name);
        _name = name;

        _implementsUIBlockToAmendWithShadowViewRegistry = NO;
        Class cls = _managerClass;
        while (cls != [HippyViewManager class]) {
            _implementsUIBlockToAmendWithShadowViewRegistry
                = _implementsUIBlockToAmendWithShadowViewRegistry
                  || HippyClassOverridesInstanceMethod(cls, @selector(uiBlockToAmendWithShadowViewRegistry:));
            cls = [cls superclass];
        }
    }
    return self;
}

- (HippyViewManager *)manager {
    if (!_manager) {
        _manager = [_bridge moduleForClass:_managerClass];
    }
    return _manager;
}

HIPPY_NOT_IMPLEMENTED(-(instancetype)init)

- (UIView *)createViewWithTag:(NSNumber *)tag {
    HippyAssertMainQueue();
    UIView *view = [self.manager view];
    view.hippyTag = tag;
    view.multipleTouchEnabled = YES;
    view.userInteractionEnabled = YES;    // required for touch handling
    view.layer.allowsGroupOpacity = YES;  // required for touch handling
    view.viewManager = self.manager;
    return view;
}

- (HippyVirtualNode *)createVirtualNode:(NSNumber *)tag props:(NSDictionary *)props {
    return [self.manager node:tag name:_name props:props];
}

- (UIView *)createViewWithTag:(NSNumber *)tag initProps:(NSDictionary *)props {
    self.manager.props = props;
    UIView *view = [self.manager view];
    view.hippyTag = tag;
    view.rootTag = props[@"rootTag"];
    view.multipleTouchEnabled = YES;
    view.userInteractionEnabled = YES;    // required for touch handling
    view.layer.allowsGroupOpacity = YES;  // required for touch handling
    view.viewManager = self.manager;
    return view;
}

- (HippyShadowView *)createShadowViewWithTag:(NSNumber *)tag {
    HippyShadowView *shadowView = [self.manager shadowView];
    shadowView.hippyTag = tag;
    shadowView.viewName = _name;
    return shadowView;
}

- (HippyPropBlock)propBlockForKey:(NSString *)name inDictionary:(NSMutableDictionary<NSString *, HippyPropBlock> *)propBlocks {
    BOOL shadowView = (propBlocks == _shadowPropBlocks);
    HippyPropBlock propBlock = propBlocks[name];
    if (!propBlock) {
        __weak HippyComponentData *weakSelf = self;

        // Get type
        SEL type = NULL;
        NSString *keyPath = nil;
        SEL selector = NSSelectorFromString([NSString stringWithFormat:@"propConfig%@_%@", shadowView ? @"Shadow" : @"", name]);
        if ([_managerClass respondsToSelector:selector]) {
            NSArray<NSString *> *typeAndKeyPath = ((NSArray<NSString *> * (*)(id, SEL)) objc_msgSend)(_managerClass, selector);
            type = HippyConvertSelectorForType(typeAndKeyPath[0]);
            keyPath = typeAndKeyPath.count > 1 ? typeAndKeyPath[1] : nil;
        } else {
            propBlock = ^(__unused id view, __unused id json) {
            };
            propBlocks[name] = propBlock;
            return propBlock;
        }

        // Check for custom setter
        if ([keyPath isEqualToString:@"__custom__"]) {
            // Get custom setter. There is no default view in the shadow case, so the selector is different.
            NSString *selectorString;
            if (!shadowView) {
                selectorString = [NSString stringWithFormat:@"set_%@:for%@View:withDefaultView:", name, shadowView ? @"Shadow" : @""];
            } else {
                selectorString = [NSString stringWithFormat:@"set_%@:forShadowView:", name];
            }
            SEL customSetter = NSSelectorFromString(selectorString);

            propBlock = ^(id<HippyComponent> view, id json) {
                HippyComponentData *strongSelf = weakSelf;
                if (!strongSelf) {
                    return;
                }
                json = HippyNilIfNull(json);
                if (!shadowView) {
                    if (!json && !strongSelf->_defaultView) {
                        // Only create default view if json is null
                        strongSelf->_defaultView = [strongSelf createViewWithTag:nil];
                    }
                    ((void (*)(id, SEL, id, id, id))objc_msgSend)(strongSelf.manager, customSetter, json, view, strongSelf->_defaultView);
                } else {
                    ((void (*)(id, SEL, id, id))objc_msgSend)(strongSelf.manager, customSetter, json, view);
                }
            };

        } else {
            // Disect keypath
            NSString *key = name;
            NSArray<NSString *> *parts = [keyPath componentsSeparatedByString:@"."];
            if (parts) {
                key = parts.lastObject;
                parts = [parts subarrayWithRange:(NSRange) { 0, parts.count - 1 }];
            }

            // Get property getter
            SEL getter = NSSelectorFromString(key);

            // Get property setter
            SEL setter
                = NSSelectorFromString([NSString stringWithFormat:@"set%@%@:", [key substringToIndex:1].uppercaseString, [key substringFromIndex:1]]);

            // Build setter block
            void (^setterBlock)(id target, id json) = nil;
            if (type == NSSelectorFromString(@"HippyDirectEventBlock:")) {
                // Special case for event handlers
                __weak HippyViewManager *weakManager = self.manager;
                setterBlock = ^(id target, id json) {
                    __weak id<HippyComponent> weakTarget = target;
                    id argu = nil;
                    if ([HippyConvert BOOL:json]) {
                        argu = ^(NSDictionary *body) {
                            NSMutableDictionary *params = [NSMutableDictionary new];
                            id tag = weakTarget.hippyTag;
                            if (tag) {
                                [params setObject:tag forKey:@"id"];
                                [params setObject:tag forKey:@"target"];
                            }
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
                            static NSArray *defaultEvent = nil;
                            static dispatch_once_t onceToken;
                            dispatch_once(&onceToken, ^{
                                if (defaultEvent == nil) {
                                    defaultEvent = @[
                                        @"onClick", @"onPressIn", @"onPressOut", @"onLongClick", @"onTouchDown", @"onTouchEnd", @"onTouchCancel",
                                        @"onTouchMove"
                                    ];
                                }
                            });

                            if ([defaultEvent containsObject:key]) {
                                [params setObject:key forKey:@"name"];
                                if (body) {
                                    [params addEntriesFromDictionary:body];
                                }
                                [weakManager.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveNativeGesture" args:params];
                            } else {
                                [params setValue:body ?: @{} forKey:@"extra"];
                                [params setObject:key forKey:@"eventName"];
                                [weakManager.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveUIComponentEvent"
                                                                             args:params];
                            }
#pragma clang diagnostic pop
                        };
                    }
                    ((void (*)(id, SEL, id))objc_msgSend)(target, setter, argu);
                };

            } else {
                // Ordinary property handlers
                NSMethodSignature *typeSignature = [[HippyConvert class] methodSignatureForSelector:type];
                if (!typeSignature) {
                    HippyLogError(@"No +[HippyConvert %@] function found.", NSStringFromSelector(type));
                    return ^(__unused id<HippyComponent> view, __unused id json) {
                    };
                }
                switch (typeSignature.methodReturnType[0]) {
#define HIPPY_CASE(_value, _type)                                               \
    case _value: {                                                              \
        __block BOOL setDefaultValue = NO;                                      \
        __block _type defaultValue;                                             \
        _type (*convert)(id, SEL, id) = (__typeof(convert))objc_msgSend;        \
        _type (*get)(id, SEL) = (__typeof(get))objc_msgSend;                    \
        void (*set)(id, SEL, _type) = (__typeof(set))objc_msgSend;              \
        setterBlock = ^(id target, id json) {                                   \
            if (json) {                                                         \
                if (!setDefaultValue && target) {                               \
                    if ([target respondsToSelector:getter]) {                   \
                        defaultValue = get(target, getter);                     \
                    }                                                           \
                    setDefaultValue = YES;                                      \
                }                                                               \
                if ([target respondsToSelector:setter]) {                       \
                    set(target, setter, convert([HippyConvert class], type, json)); \
                }                                                               \
            } else if (setDefaultValue) {                                       \
                if ([target respondsToSelector:setter]) {                       \
                    set(target, setter, defaultValue);                          \
                }                                                               \
            }                                                                   \
        };                                                                      \
        break;                                                                  \
    }

                    HIPPY_CASE(_C_SEL, SEL)
                    HIPPY_CASE(_C_CHARPTR, const char *)
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
                    HIPPY_CASE(_C_PTR, void *)
                    HIPPY_CASE(_C_ID, id)

                    case _C_STRUCT_B:
                    default: {
                        NSInvocation *typeInvocation = [NSInvocation invocationWithMethodSignature:typeSignature];
                        typeInvocation.selector = type;
                        typeInvocation.target = [HippyConvert class];

                        __block NSInvocation *targetInvocation = nil;
                        __block NSMutableData *defaultValue = nil;

                        setterBlock = ^(id target, id json) {
                            if (!target) {
                                return;
                            }

                            // Get default value
                            if (!defaultValue) {
                                if (!json) {
                                    // We only set the defaultValue when we first pass a non-null
                                    // value, so if the first value sent for a prop is null, it's
                                    // a no-op (we'd be resetting it to its default when its
                                    // value is already the default).
                                    return;
                                }
                                // Use NSMutableData to store defaultValue instead of malloc, so
                                // it will be freed automatically when setterBlock is released.
                                defaultValue = [[NSMutableData alloc] initWithLength:typeSignature.methodReturnLength];
                                if ([target respondsToSelector:getter]) {
                                    NSMethodSignature *signature = [target methodSignatureForSelector:getter];
                                    NSInvocation *sourceInvocation = [NSInvocation invocationWithMethodSignature:signature];
                                    sourceInvocation.selector = getter;
                                    [sourceInvocation invokeWithTarget:target];
                                    [sourceInvocation getReturnValue:defaultValue.mutableBytes];
                                }
                            }

                            // Get value
                            BOOL freeValueOnCompletion = NO;
                            void *value = defaultValue.mutableBytes;
                            if (json) {
                                freeValueOnCompletion = YES;
                                value = malloc(typeSignature.methodReturnLength);
                                [typeInvocation setArgument:&json atIndex:2];
                                [typeInvocation invoke];
                                [typeInvocation getReturnValue:value];
                            }

                            // Set value
                            if (!targetInvocation) {
                                NSMethodSignature *signature = [target methodSignatureForSelector:setter];
                                targetInvocation = [NSInvocation invocationWithMethodSignature:signature];
                                targetInvocation.selector = setter;
                            }
                            [targetInvocation setArgument:value atIndex:2];
                            [targetInvocation invokeWithTarget:target];
                            if (freeValueOnCompletion) {
                                // Only free the value if we `malloc`d it locally, otherwise it
                                // points to `defaultValue.mutableBytes`, which is managed by ARC.
                                free(value);
                            }
                        };
                        break;
                    }
                }
            }

            propBlock = ^(__unused id view, __unused id json) {
                // Follow keypath
                id target = view;
                for (NSString *part in parts) {
                    target = [target valueForKey:part];
                }

                // Set property with json
                setterBlock(target, HippyNilIfNull(json));
            };
        }

        if (HIPPY_DEBUG) {
            // Provide more useful log feedback if there's an error
            HippyPropBlock unwrappedBlock = propBlock;
            propBlock = ^(id<HippyComponent> view, id json) {
                NSString *logPrefix =
                    [NSString stringWithFormat:@"Error setting property '%@' of %@ with tag #%@: ", name, weakSelf.name, view.hippyTag];

                HippyPerformBlockWithLogPrefix(
                    ^{
                        unwrappedBlock(view, json);
                    }, logPrefix);
            };
        }

        propBlocks[name] = [propBlock copy];
    }
    return propBlock;
}

- (void)setProps:(NSDictionary<NSString *, id> *)props forView:(id<HippyComponent>)view {
    if (!view) {
        return;
    }

    [props enumerateKeysAndObjectsUsingBlock:^(NSString *key, id json, __unused BOOL *stop) {
        HippyPropBlock block = [self propBlockForKey:key inDictionary:self->_viewPropBlocks];
        block(view, json);
    }];

    if ([view respondsToSelector:@selector(didSetProps:)]) {
        [view didSetProps:[props allKeys]];
    }
}

- (void)setProps:(NSDictionary<NSString *, id> *)props forShadowView:(HippyShadowView *)shadowView {
    if (!shadowView) {
        return;
    }

    [props enumerateKeysAndObjectsUsingBlock:^(NSString *key, id json, __unused BOOL *stop) {
        [self propBlockForKey:key inDictionary:self->_shadowPropBlocks](shadowView, json);
    }];

    if ([shadowView respondsToSelector:@selector(didSetProps:)]) {
        [shadowView didSetProps:[props allKeys]];
    }
}

- (NSDictionary<NSString *, id> *)viewConfig {
    NSMutableArray<NSString *> *directEvents = [NSMutableArray new];
    unsigned int count = 0;
    NSMutableDictionary *propTypes = [NSMutableDictionary new];
    Method *methods = class_copyMethodList(object_getClass(_managerClass), &count);
    for (unsigned int i = 0; i < count; i++) {
        Method method = methods[i];
        SEL selector = method_getName(method);
        NSString *methodName = NSStringFromSelector(selector);
        if ([methodName hasPrefix:@"propConfig"]) {
            NSRange nameRange = [methodName rangeOfString:@"_"];
            if (nameRange.length) {
                NSString *name = [methodName substringFromIndex:nameRange.location + 1];
                NSString *type = ((NSArray<NSString *> * (*)(id, SEL)) objc_msgSend)(_managerClass, selector)[0];
                if (HIPPY_DEBUG && propTypes[name] && ![propTypes[name] isEqualToString:type]) {
                    HippyLogError(@"Property '%@' of component '%@' redefined from '%@' "
                                   "to '%@'",
                        name, _name, propTypes[name], type);
                }

                if ([type isEqualToString:@"HippyDirectEventBlock"]) {
                    [directEvents addObject:HippyNormalizeInputEventName(name)];
                    propTypes[name] = @"BOOL";
                } else {
                    propTypes[name] = type;
                }
            }
        }
    }
    free(methods);
    return @{
        @"propTypes": propTypes,
        @"directEvents": directEvents,
    };
}

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowViewRegistry:(NSDictionary<NSNumber *, HippyShadowView *> *)registry {
    if (_implementsUIBlockToAmendWithShadowViewRegistry) {
        return [[self manager] uiBlockToAmendWithShadowViewRegistry:registry];
    }
    return nil;
}

@end
