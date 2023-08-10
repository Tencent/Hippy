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

#import "HippyNextAnimationViewParams.h"
#import "NSDictionary+HippyDictionaryDeepCopy.h"
#import "HippyConvert+Transform.h"
#import "HippyUIManager.h"


#define HippyAssertShadowThread() \
HippyAssertThread(HippyGetUIManagerQueue(), @"not in shadow queue, but in %s queue", \
dispatch_queue_get_label(DISPATCH_CURRENT_QUEUE_LABEL));


@implementation HippyNextAnimationViewParams {
    NSMutableDictionary *_styles; // originParams的副本，中间临时变量
    NSMutableDictionary<NSString *, NSMutableDictionary *> *_valuesByKey;
}

- (instancetype)initWithParams:(NSDictionary *)params
                       viewTag:(NSNumber *)viewTag
                       rootTag:(NSNumber *)rootTag {
    if (self = [super init]) {
        _animationIdWithPropDictionary = [NSMutableDictionary new];
        _valuesByKey = [NSMutableDictionary new];
        _hippyTag = viewTag;
        _rootTag = rootTag;
        _originParams = params;
    }
    return self;
}

- (void)parse {
    @synchronized(self) {
        HippyAssertShadowThread();
        _styles = [self.originParams hippyMutableDeepCopy];
        [_styles removeObjectForKey:@"useAnimation"];
        [self traversalPropsForFindAniamtion:_styles];
    }
}

- (BOOL)isEqual:(HippyNextAnimationViewParams *)object {
    if ([self.hippyTag isEqual:[object hippyTag]] &&
        [self.animationIdWithPropDictionary isEqual:object.animationIdWithPropDictionary]) {
        return YES;
    }
    return NO;
}

- (void)traversalPropsForFindAniamtion:(id)props {
    if ([props isKindOfClass:[NSDictionary class]]) {
        [(NSDictionary *)props enumerateKeysAndObjectsUsingBlock:^(id _Nonnull key, id _Nonnull obj, __unused BOOL *stop) {
            if ([obj isKindOfClass:[NSDictionary class]]) {
                if ([(NSDictionary *)obj count] == 1 && obj[@"animationId"]) {
                    NSNumber *animationID = obj[@"animationId"];
                    [self->_animationIdWithPropDictionary setValue:animationID forKey:key];
                }
            } else {
                [self traversalPropsForFindAniamtion:obj];
            }
        }];
    } else if ([props isKindOfClass:[NSArray class]]) {
        [(NSArray *)props enumerateObjectsUsingBlock:^(id _Nonnull obj, __unused NSUInteger idx, __unused BOOL *stop) {
            [self traversalPropsForFindAniamtion:obj];
        }];
    } else {
        return;
    }
}

- (void)traversalProps:(id)props key:(NSString *)key value:(id)value {
    if ([props isKindOfClass:[NSDictionary class]]) {
        [(NSDictionary *)props enumerateKeysAndObjectsUsingBlock:^(NSString *_Nonnull propKey, id _Nonnull obj, __unused BOOL *stop) {
            if ([propKey isEqualToString:key] && obj[@"animationId"]) {
                self->_valuesByKey[key] = props;
                self->_valuesByKey[key][key] = value;
                *stop = YES;
            } else {
                [self traversalProps:obj key:key value:value];
            }
        }];

    } else if ([props isKindOfClass:[NSArray class]]) {
        [(NSArray *)props enumerateObjectsUsingBlock:^(id _Nonnull obj, __unused NSUInteger idx, __unused BOOL *stop) {
            [self traversalProps:obj key:key value:value];
        }];
    } else {
        return;
    }
}


#pragma mark -

- (NSDictionary *)updateParams {
    @synchronized(self) {
        HippyAssertShadowThread();
        NSDictionary *updateParams = [_styles hippyMutableDeepCopy];
        return updateParams;
    }
}

- (void)setValue:(id)value forProp:(NSString *)prop {
    @synchronized(self) {
        if ([[_valuesByKey allKeys] containsObject:prop]) {
            _valuesByKey[prop][prop] = value;
            return;
        }
        
        HippyAssertShadowThread();
        [self traversalProps:_styles key:prop value:value];
    }
}

- (id)valueForProp:(NSString *)prop {
    return _valuesByKey[prop][prop];
}

@end
