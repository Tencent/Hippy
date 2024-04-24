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

#import "HippyKeyCommands.h"
#import <UIKit/UIKit.h>
#import "HippyAssert.h"
#import "HippyDefines.h"
#import "HippyUtils.h"
#import "HippyRootView.h"
#import <objc/message.h>
#import <objc/runtime.h>

#if HIPPY_DEV

@interface UIEvent (UIPhysicalKeyboardEvent)

@property (nonatomic) NSString *_modifiedInput;
@property (nonatomic) NSString *_unmodifiedInput;
@property (nonatomic) UIKeyModifierFlags _modifierFlags;
@property (nonatomic) BOOL _isKeyDown;
@property (nonatomic) long _keyCode;

@end

@interface HippyKeyCommand : NSObject <NSCopying>

@property (nonatomic, strong) UIKeyCommand *keyCommand;
@property (nonatomic, copy) void (^block)(UIKeyCommand *);

@end

@implementation HippyKeyCommand

- (instancetype)initWithKeyCommand:(UIKeyCommand *)keyCommand block:(void (^)(UIKeyCommand *))block {
    if ((self = [super init])) {
        _keyCommand = keyCommand;
        _block = block;
    }
    return self;
}

HIPPY_NOT_IMPLEMENTED(-(instancetype)init)

- (id)copyWithZone:(__unused NSZone *)zone {
    return self;
}

- (NSUInteger)hash {
    return _keyCommand.input.hash ^ _keyCommand.modifierFlags;
}

- (BOOL)isEqual:(HippyKeyCommand *)object {
    if (![object isKindOfClass:[HippyKeyCommand class]]) {
        return NO;
    }
    return [self matchesInput:object.keyCommand.input flags:object.keyCommand.modifierFlags];
}

- (BOOL)matchesInput:(NSString *)input flags:(UIKeyModifierFlags)flags {
    return [_keyCommand.input isEqual:input] && (_keyCommand.modifierFlags == flags || flags == 0);
}

- (NSString *)description {
    return [NSString stringWithFormat:@"<%@:%p input=\"%@\" flags=%zd hasBlock=%@>",
            [self class], self, _keyCommand.input, (long)_keyCommand.modifierFlags, _block ? @"YES" : @"NO"];
}

@end


#pragma mark -

@interface HippyKeyCommands ()

@property (nonatomic, strong) NSMutableSet<HippyKeyCommand *> *commands;

@end


@implementation HippyKeyCommands

+ (void)initialize {
    SEL originalKeyEventSelector = NSSelectorFromString(@"handleKeyUIEvent:");
    SEL swizzledKeyEventSelector = NSSelectorFromString(
                                                        [NSString stringWithFormat:@"_hippy_swizzle_%x_%@",
                                                         arc4random(), NSStringFromSelector(originalKeyEventSelector)]);
    
    void (^handleKeyUIEventSwizzleBlock)(UIApplication *, UIEvent *) = ^(UIApplication *slf, UIEvent *event) {
        [[[self class] sharedInstance] handleKeyUIEventSwizzle:event];
        ((void (*)(id, SEL, id))objc_msgSend)(slf, swizzledKeyEventSelector, event);
    };
    
    HippySwapInstanceMethodWithBlock([UIApplication class], originalKeyEventSelector,
                                     handleKeyUIEventSwizzleBlock, swizzledKeyEventSelector);
}

- (void)handleKeyUIEventSwizzle:(UIEvent *)event {
    NSString *modifiedInput = nil;
    UIKeyModifierFlags modifierFlags = 0;
    BOOL isKeyDown = NO;
    
    if ([event respondsToSelector:@selector(_modifiedInput)]) {
        modifiedInput = [event _modifiedInput];
    }
    
    if ([event respondsToSelector:@selector(_modifierFlags)]) {
        modifierFlags = [event _modifierFlags];
    }
    
    if ([event respondsToSelector:@selector(_isKeyDown)]) {
        isKeyDown = [event _isKeyDown];
    }
    
    BOOL interactionEnabled = !UIApplication.sharedApplication.isIgnoringInteractionEvents;
    BOOL hasFirstResponder = NO;
    if (isKeyDown && modifiedInput.length > 0 && interactionEnabled) {
        UIResponder *firstResponder = nil;
        for (UIWindow *window in [self allWindows]) {
            firstResponder = [window valueForKey:@"firstResponder"];
            if (firstResponder) {
                hasFirstResponder = YES;
                break;
            }
        }
        
        // Ignore key commands (except escape) when there's an active responder
        if (!firstResponder || [firstResponder isKindOfClass:HippyRootView.class]) {
            [self hippy_handleKeyCommand:modifiedInput flags:modifierFlags];
        }
    }
};

- (NSArray<UIWindow *> *)allWindows {
    BOOL includeInternalWindows = YES;
    BOOL onlyVisibleWindows = NO;
    
    // Obfuscating selector allWindowsIncludingInternalWindows:onlyVisibleWindows:
    NSArray<NSString *> *allWindowsComponents =
    @[ @"al", @"lWindo", @"wsIncl", @"udingInt", @"ernalWin", @"dows:o", @"nlyVisi", @"bleWin", @"dows:" ];
    SEL allWindowsSelector = NSSelectorFromString([allWindowsComponents componentsJoinedByString:@""]);
    
    NSMethodSignature *methodSignature = [[UIWindow class] methodSignatureForSelector:allWindowsSelector];
    NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSignature];
    
    invocation.target = [UIWindow class];
    invocation.selector = allWindowsSelector;
    [invocation setArgument:&includeInternalWindows atIndex:2];
    [invocation setArgument:&onlyVisibleWindows atIndex:3];
    [invocation invoke];
    
    __unsafe_unretained NSArray<UIWindow *> *windows = nil;
    [invocation getReturnValue:&windows];
    return windows;
}

- (void)hippy_handleKeyCommand:(NSString *)input flags:(UIKeyModifierFlags)modifierFlags {
    for (HippyKeyCommand *command in [HippyKeyCommands sharedInstance].commands) {
        if ([command matchesInput:input flags:modifierFlags]) {
            if (command.block) {
                command.block(nil);
            }
        }
    }
}


#pragma mark -

+ (instancetype)sharedInstance {
    static HippyKeyCommands *sharedInstance;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [self new];
    });
    
    return sharedInstance;
}

- (instancetype)init {
    if ((self = [super init])) {
        _commands = [NSMutableSet new];
    }
    return self;
}

- (void)registerKeyCommandWithInput:(NSString *)input
                      modifierFlags:(UIKeyModifierFlags)flags
                             action:(void (^)(UIKeyCommand *))block {
    HippyAssertMainQueue();
    
    UIKeyCommand *command = [UIKeyCommand keyCommandWithInput:input modifierFlags:flags action:@selector(description)];
    HippyKeyCommand *keyCommand = [[HippyKeyCommand alloc] initWithKeyCommand:command block:block];
    [_commands removeObject:keyCommand];
    [_commands addObject:keyCommand];
}

- (void)unregisterKeyCommandWithInput:(NSString *)input modifierFlags:(UIKeyModifierFlags)flags {
    HippyAssertMainQueue();
    
    for (HippyKeyCommand *command in _commands.allObjects) {
        if ([command matchesInput:input flags:flags]) {
            [_commands removeObject:command];
            break;
        }
    }
}

- (BOOL)isKeyCommandRegisteredForInput:(NSString *)input modifierFlags:(UIKeyModifierFlags)flags {
    HippyAssertMainQueue();
    
    for (HippyKeyCommand *command in _commands.allObjects) {
        if ([command matchesInput:input flags:flags]) {
            return YES;
        }
    }
    return NO;
}

- (void)registerDoublePressKeyCommandWithInput:(NSString *)input
                                 modifierFlags:(UIKeyModifierFlags)flags
                                        action:(void (^)(UIKeyCommand *))block {
    HippyAssertMainQueue();
    
    UIKeyCommand *command = [UIKeyCommand keyCommandWithInput:input modifierFlags:flags action:@selector(description)];
    HippyKeyCommand *keyCommand = [[HippyKeyCommand alloc] initWithKeyCommand:command block:block];
    [_commands removeObject:keyCommand];
    [_commands addObject:keyCommand];
}

- (void)unregisterDoublePressKeyCommandWithInput:(NSString *)input modifierFlags:(UIKeyModifierFlags)flags {
    HippyAssertMainQueue();
    
    for (HippyKeyCommand *command in _commands.allObjects) {
        if ([command matchesInput:input flags:flags]) {
            [_commands removeObject:command];
            break;
        }
    }
}

- (BOOL)isDoublePressKeyCommandRegisteredForInput:(NSString *)input modifierFlags:(UIKeyModifierFlags)flags {
    HippyAssertMainQueue();
    
    for (HippyKeyCommand *command in _commands.allObjects) {
        if ([command matchesInput:input flags:flags]) {
            return YES;
        }
    }
    return NO;
}

@end

#else

@implementation HippyKeyCommands

+ (instancetype)sharedInstance {
    return nil;
}

- (void)registerKeyCommandWithInput:(__unused NSString *)input
                      modifierFlags:(__unused UIKeyModifierFlags)flags
                             action:(__unused void (^)(UIKeyCommand *))block {
}

- (void)unregisterKeyCommandWithInput:(__unused NSString *)input
                        modifierFlags:(__unused UIKeyModifierFlags)flags {
}

- (BOOL)isKeyCommandRegisteredForInput:(__unused NSString *)input
                         modifierFlags:(__unused UIKeyModifierFlags)flags {
    return NO;
}

- (void)registerDoublePressKeyCommandWithInput:(__unused NSString *)input
                                 modifierFlags:(__unused UIKeyModifierFlags)flags
                                        action:(__unused void (^)(UIKeyCommand *))block {
}

- (void)unregisterDoublePressKeyCommandWithInput:(__unused NSString *)input
                                   modifierFlags:(__unused UIKeyModifierFlags)flags {
}

- (BOOL)isDoublePressKeyCommandRegisteredForInput:(__unused NSString *)input
                                    modifierFlags:(__unused UIKeyModifierFlags)flags {
    return NO;
}

@end

#endif
