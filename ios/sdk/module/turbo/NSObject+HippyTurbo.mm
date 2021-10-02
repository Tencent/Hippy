/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.
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

#import "NSObject+HippyTurbo.h"
#import <objc/message.h>
#import "HippyBridgeMethod.h"
#import "HippyAssert.h"
#import "HippyUtils.h"
#import "HippyLog.h"
#import "HippyModuleMethod.h"

@implementation NSObject (HippyTurbo)

- (NSArray<id<HippyBridgeMethod>> *)hippyTurboSetupModuleMethods {
    NSMutableArray<id<HippyBridgeMethod>> *moduleMethods = [NSMutableArray new];
    unsigned int methodCount;
    Class cls = [self class];
    while (cls && cls != [NSObject class] && cls != [NSProxy class]) {
        Method *methods = class_copyMethodList(object_getClass(cls), &methodCount);
        for (unsigned int i = 0; i < methodCount; i++) {
            Method method = methods[i];
            SEL selector = method_getName(method);
            if ([NSStringFromSelector(selector) hasPrefix:@"__hippy_export_turbo__"]) {
                IMP imp = method_getImplementation(method);
                NSArray<NSString *> *entries = ((NSArray<NSString *> * (*)(id, SEL)) imp)(cls, selector);
                id<HippyBridgeMethod> moduleMethod = [[HippyModuleMethod alloc] initWithMethodSignature:entries[1] JSMethodName:entries[0]
                                                                                            moduleClass:cls];
                [moduleMethods addObject:moduleMethod];
            }
        }

        free(methods);
        cls = class_getSuperclass(cls);
    }
    return [moduleMethods copy];
}

- (NSArray<id<HippyBridgeMethod>> *)hippyTurboModuleMethods {
    NSArray<id<HippyBridgeMethod>> *hippyTurboModules = objc_getAssociatedObject(self, @selector(hippyTurboModuleMethods));
    if (!hippyTurboModules || hippyTurboModules.count == 0) {
        hippyTurboModules = [self hippyTurboSetupModuleMethods];
        objc_setAssociatedObject(self,
                                 @selector(hippyTurboModuleMethods),
                                 hippyTurboModules,
                                 OBJC_ASSOCIATION_COPY_NONATOMIC);
    }
    return hippyTurboModules;
}

- (void)setHippyTurboBridge:(HippyBridge *)hippyTurboBridge {
    objc_setAssociatedObject(self,
                             @selector(hippyTurboBridge),
                             hippyTurboBridge,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (HippyBridge *)hippyTurboBridge {
    return objc_getAssociatedObject(self, @selector(hippyTurboBridge));
}

- (id)hippyTurboInvokeObjCMethodWithName:(NSString *)methodName
                           argumentCount:(NSInteger)argumentCount
                           argumentArray:(NSArray *)argumentArray {
    NSArray<id<HippyBridgeMethod>> *moduleMethods = [self hippyTurboModuleMethods];
    id<HippyBridgeMethod> method;
    for (id<HippyBridgeMethod> m in moduleMethods) {
        if ([m.JSMethodName isEqualToString:methodName]) {
            method = m;
        }
    }

    if (HIPPY_DEBUG && !method) {
        HippyLogError(@"Unknown methodID: %@ for module:%@", methodName, self);
        return nil;
    }

    @try {
        id value = [method invokeWithBridge:self.hippyTurboBridge module:self arguments:argumentArray];
        return value;
    } @catch (NSException *exception) {
        // Pass on JS exceptions
        if ([exception.name hasPrefix:HippyFatalExceptionName]) {
            @throw exception;
        }

        NSString *message = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on target %@ with params %@", exception,
                                      method.JSMethodName, NSStringFromClass([self class]) ,argumentArray];
        NSError *error = HippyErrorWithMessageAndModuleName(message, NSStringFromClass([self class]));
        HippyFatal(error);
        return nil;
    }
}

@end
