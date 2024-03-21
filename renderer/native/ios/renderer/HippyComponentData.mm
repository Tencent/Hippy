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

#import <objc/message.h>
#import "HippyComponentData.h"
#import "HippyShadowView.h"
#import "HippyViewManager.h"
#import "HippyConvert.h"
#import "HippyUtils.h"
#import "UIView+Hippy.h"

typedef void (^HippyPropBlock)(id<HippyComponent> view, id json);

@interface NativeRenderComponentProp : NSObject {
}

@property (nonatomic, copy, readonly) NSString *type;
@property (nonatomic, copy) HippyPropBlock propBlock;

@end

@implementation NativeRenderComponentProp

- (instancetype)initWithType:(NSString *)type {
    if ((self = [super init])) {
        _type = [type copy];
    }
    return self;
}

@end

@interface HippyComponentData () {
    id<HippyComponent> _defaultView;  // Only needed for HIPPY_CUSTOM_VIEW_PROPERTY
    NSMutableDictionary<NSString *, HippyPropBlock> *_viewPropBlocks;
    NSMutableDictionary<NSString *, HippyPropBlock> *_shadowPropBlocks;
    NSMutableDictionary<NSString *, NSString *> *_eventNameMap;
    BOOL _implementsUIBlockToAmendWithRenderObjectRegistry;
    __weak HippyViewManager *_manager;
}

@end

@implementation HippyComponentData

//HippyViewManager is base class of all ViewManager class
//we use a variable to cache HippyViewManager's event name map
static NSDictionary<NSString *, NSString *> *gBaseViewManagerDic = nil;

- (instancetype)initWithViewManager:(HippyViewManager *)viewManager viewName:(NSString *)viewName {
    self = [super init];
    if (self) {
        _managerClass = [viewManager class];
        _manager = viewManager;
        _viewPropBlocks = [NSMutableDictionary new];
        _shadowPropBlocks = [NSMutableDictionary new];
        NSString *name = viewName;
        if (name.length == 0) {
            name = NSStringFromClass(_managerClass);
        }
        if ([name hasSuffix:@"Manager"]) {
            name = [name substringToIndex:name.length - @"Manager".length];
        }
        NSAssert(name.length, @"Invalid moduleName '%@'", name);
        _name = name;

        _implementsUIBlockToAmendWithRenderObjectRegistry = NO;
        Class cls = _managerClass;
        while (cls != [HippyViewManager class]) {
            _implementsUIBlockToAmendWithRenderObjectRegistry
                = _implementsUIBlockToAmendWithRenderObjectRegistry
                  || HippyClassOverridesInstanceMethod(cls, @selector(uiBlockToAmendWithShadowViewRegistry:));
            cls = [cls superclass];
        }
    }
    return self;
}

- (UIView *)createViewWithTag:(NSNumber *)tag {
    NSAssert(HippyIsMainQueue(), @"This function must be called on the main thread");
    UIView *view = [self.manager view];
    view.hippyTag = tag;
    view.multipleTouchEnabled = YES;
    view.userInteractionEnabled = YES;    // required for touch handling
    view.layer.allowsGroupOpacity = YES;  // required for touch handling
    return view;
}

- (UIView *)createViewWithTag:(NSNumber *)tag initProps:(NSDictionary *)props {
    NSAssert(HippyIsMainQueue(), @"This function must be called on the main thread");
    self.manager.props = props;
    UIView *view = [self.manager view];
    view.hippyTag = tag;
    view.rootTag = props[@"rootTag"];
    view.multipleTouchEnabled = YES;
    view.userInteractionEnabled = YES;    // required for touch handling
    view.layer.allowsGroupOpacity = YES;  // required for touch handling
    return view;
}

- (HippyShadowView *)createShadowViewWithTag:(NSNumber *)tag {
    HippyShadowView *renderObject = [self.manager hippyShadowView];
    renderObject.hippyTag = tag;
    renderObject.viewName = _name;
    return renderObject;
}

- (HippyPropBlock)propBlockForKey:(NSString *)name inDictionary:(NSMutableDictionary<NSString *, HippyPropBlock> *)propBlocks {
    BOOL isShadowView = (propBlocks == _shadowPropBlocks);
    HippyPropBlock propBlock = propBlocks[name];
    if (!propBlock) {
        __weak HippyComponentData *weakSelf = self;

        // Get type
        SEL type = NULL;
        NSString *keyPath = nil;
        SEL selector = NSSelectorFromString([NSString stringWithFormat:@"propConfig%@_%@", isShadowView ? @"Shadow" : @"", name]);
        NSAssert(selector, @"no propConfig setter selector found for property %@", name);
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
            if (!isShadowView) {
                selectorString = [NSString stringWithFormat:@"set_%@:for%@View:withDefaultView:", name, isShadowView ? @"Shadow" : @""];
            } else {
                selectorString = [NSString stringWithFormat:@"set_%@:forShadowView:", name];
            }
            SEL customSetter = NSSelectorFromString(selectorString);
            NSAssert(customSetter, @"no __custom__ setter selector found for property %@", name);
            propBlock = ^(id<HippyComponent> view, id json) {
                HippyComponentData *strongSelf = weakSelf;
                if (!strongSelf) {
                    return;
                }
                json = HippyNilIfNull(json);
                if (!isShadowView) {
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
                //TODO
                //The component event response logic no longer executes this code
            } else {
                // Ordinary property handlers
                NSMethodSignature *typeSignature = [[HippyConvert class] methodSignatureForSelector:type];
                if (!typeSignature) {
                    HippyLogError(@"No +[HippyConvert %@] function found.", NSStringFromSelector(type));
                    return ^(__unused id<HippyComponent> view, __unused id json) {
                    };
                }
                switch (typeSignature.methodReturnType[0]) {
#define HIPPY_CASE(_value, _type)                                                           \
    case _value: {                                                                          \
        __block BOOL setDefaultValue = NO;                                                  \
        __block _type defaultValue;                                                         \
        _type (*convert)(id, SEL, id) = (__typeof(convert))objc_msgSend;                    \
        _type (*get)(id, SEL) = (__typeof(get))objc_msgSend;                                \
        void (*set)(id, SEL, _type) = (__typeof(set))objc_msgSend;                          \
        setterBlock = ^(id target, id json) {                                               \
            if (json) {                                                                     \
                if (!setDefaultValue && target) {                                           \
                    if ([target respondsToSelector:getter]) {                               \
                        defaultValue = get(target, getter);                                 \
                    }                                                                       \
                    setDefaultValue = YES;                                                  \
                }                                                                           \
                if ([target respondsToSelector:setter]) {                                   \
                    set(target, setter, convert([HippyConvert class], type, json));  \
                }                                                                           \
            } else if (setDefaultValue) {                                                   \
                if ([target respondsToSelector:setter]) {                                   \
                    set(target, setter, defaultValue);                                      \
                }                                                                           \
            }                                                                               \
        };                                                                                  \
        break;                                                                              \
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
                if (setterBlock) {
                    setterBlock(target, HippyNilIfNull(json));
                }
            };
        }
        
        if (HIPPY_DEBUG) {
            // Provide more useful log feedback if there's an error
            HippyPropBlock unwrappedBlock = propBlock;
            propBlock = ^(id<HippyComponent> view, id json) {
                NSString *logPrefix =
                [NSString stringWithFormat:@"Error setting property '%@' of %@ with tag #%@: ", name, weakSelf.name, view.hippyTag];
                
                HippyPerformBlockWithLogPrefix(^{
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

- (void)setProps:(NSDictionary<NSString *, id> *)props forShadowView:(HippyShadowView *)renderObject {
    if (!renderObject) {
        return;
    }
    
    [props enumerateKeysAndObjectsUsingBlock:^(NSString *key, id json, __unused BOOL *stop) {
        HippyPropBlock propBlock = [self propBlockForKey:key inDictionary:_shadowPropBlocks];
        propBlock(renderObject, json);
    }];
    
    if ([renderObject respondsToSelector:@selector(didSetProps:)]) {
        [renderObject didSetProps:[props allKeys]];
    }
}

- (NSDictionary<NSString *, NSString *> *)eventNameMap {
    if (!_eventNameMap) {
        uint32_t count = 0;
        _eventNameMap = [NSMutableDictionary dictionaryWithCapacity:64];
        Class metaClass = object_getClass(_managerClass);
        static dispatch_once_t onceToken;
        static Class viewManagerMetaClass = nil;
        dispatch_once(&onceToken, ^{
            viewManagerMetaClass = object_getClass([HippyViewManager class]);
        });
        while ([metaClass isSubclassOfClass:viewManagerMetaClass]) {
            //if metaclass is HippyViewManager's meta class,we try to get event name map from cache if exists
            if (metaClass == viewManagerMetaClass && gBaseViewManagerDic) {
                [_eventNameMap addEntriesFromDictionary:gBaseViewManagerDic];
            }
            else {
                Method *methods = class_copyMethodList(metaClass, &count);
                for (uint32_t i = 0; i < count; i++) {
                    Method method = methods[i];
                    SEL selector = method_getName(method);
                    NSString *methodName = NSStringFromSelector(selector);
                    if ([methodName hasPrefix:@"propConfig"]) {
                        NSRange nameRange = [methodName rangeOfString:@"_"];
                        if (nameRange.length) {
                            NSString *name = [methodName substringFromIndex:nameRange.location + 1];
                            NSString *type = ((NSArray<NSString *> * (*)(id, SEL)) objc_msgSend)(_managerClass, selector)[0];
                            if ([type isEqualToString:@"HippyDirectEventBlock"]) {
                                //remove 'on' prefix if exists
                                NSString *nameNoOn = name;
                                if ([nameNoOn hasPrefix:@"on"]) {
                                    nameNoOn = [name substringFromIndex:2];
                                }
                                NSString *nameNoOnLowerCase = [nameNoOn lowercaseString];
                                [_eventNameMap setObject:name forKey:nameNoOnLowerCase];
                            }
                        }
                    }
                }
                free(methods);
                if (metaClass == viewManagerMetaClass) {
                    //if metaclass is HippyViewManager's meta class,we try to save event name map from cache
                    gBaseViewManagerDic = [_eventNameMap copy];
                }
            }
            metaClass = class_getSuperclass(metaClass);
        }
    }
    return [_eventNameMap copy];
}

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowViewRegistry:(NSDictionary<NSNumber *, HippyShadowView *> *)registry {
    if (_implementsUIBlockToAmendWithRenderObjectRegistry) {
        return [[self manager] uiBlockToAmendWithShadowViewRegistry:registry];
    }
    return nil;
}

@end
