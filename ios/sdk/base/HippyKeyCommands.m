/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyKeyCommands.h"

#import <UIKit/UIKit.h>

#import "HippyDefines.h"
#import "HippyUtils.h"

#if HIPPY_DEV

static BOOL HippyIsIOS8OrEarlier()
{
    return [UIDevice currentDevice].systemVersion.floatValue < 9;
}

@interface HippyKeyCommand : NSObject <NSCopying>

@property (nonatomic, strong) UIKeyCommand *keyCommand;
@property (nonatomic, copy) void (^block)(UIKeyCommand *);

@end

@implementation HippyKeyCommand

- (instancetype)initWithKeyCommand:(UIKeyCommand *)keyCommand
                             block:(void (^)(UIKeyCommand *))block
{
    if ((self = [super init])) {
        _keyCommand = keyCommand;
        _block = block;
    }
    return self;
}

HIPPY_NOT_IMPLEMENTED(- (instancetype)init)

- (id)copyWithZone:(__unused NSZone *)zone
{
    return self;
}

- (NSUInteger)hash
{
    return _keyCommand.input.hash ^ _keyCommand.modifierFlags;
}

- (BOOL)isEqual:(HippyKeyCommand *)object
{
    if (![object isKindOfClass:[HippyKeyCommand class]]) {
        return NO;
    }
    return [self matchesInput:object.keyCommand.input
                        flags:object.keyCommand.modifierFlags];
}

- (BOOL)matchesInput:(NSString *)input flags:(UIKeyModifierFlags)flags
{
    return [_keyCommand.input isEqual:input] && _keyCommand.modifierFlags == flags;
}

- (NSString *)description
{
    return [NSString stringWithFormat:@"<%@:%p input=\"%@\" flags=%zd hasBlock=%@>",
            [self class], self, _keyCommand.input, (long)_keyCommand.modifierFlags,
            _block ? @"YES" : @"NO"];
}

@end

@interface HippyKeyCommands ()

@property (nonatomic, strong) NSMutableSet<HippyKeyCommand *> *commands;

@end

@implementation UIResponder (HippyKeyCommands)

+ (UIResponder *)hippy_getFirstResponder:(UIResponder *)view
{
    UIResponder *firstResponder = nil;
    
    if (view.isFirstResponder) {
        return view;
    } else if ([view isKindOfClass:[UIViewController class]]) {
        if ([(UIViewController *)view parentViewController]) {
            firstResponder = [UIResponder hippy_getFirstResponder: [(UIViewController *)view parentViewController]];
        }
        return firstResponder ? firstResponder : [UIResponder hippy_getFirstResponder: [(UIViewController *)view view]];
    } else if ([view isKindOfClass:[UIView class]]) {
        for (UIView *subview in [(UIView *)view subviews]) {
            firstResponder = [UIResponder hippy_getFirstResponder: subview];
            if (firstResponder) {
                return firstResponder;
            }
        }
    }
    
    return firstResponder;
}

- (NSArray<UIKeyCommand *> *)hippy_keyCommands
{
    NSSet<HippyKeyCommand *> *commands = [HippyKeyCommands sharedInstance].commands;
    return [[commands valueForKeyPath:@"keyCommand"] allObjects];
}

/**
 * Single Press Key Command Response
 * Command + KeyEvent (Command + R/D, etc.)
 */
- (void)hippy_handleKeyCommand:(UIKeyCommand *)key
{
    // NOTE: throttle the key handler because on iOS 9 the handleKeyCommand:
    // method gets called repeatedly if the command key is held down.
    static NSTimeInterval lastCommand = 0;
    if (HippyIsIOS8OrEarlier() || CACurrentMediaTime() - lastCommand > 0.5) {
        for (HippyKeyCommand *command in [HippyKeyCommands sharedInstance].commands.allObjects) { //add by stockGroup
            if ([command.keyCommand.input isEqualToString:key.input] &&
                command.keyCommand.modifierFlags == key.modifierFlags) {
                if (command.block) {
                    command.block(key);
                    lastCommand = CACurrentMediaTime();
                }
            }
        }
    }
}

/**
 * Double Press Key Command Response
 * Double KeyEvent (Double R, etc.)
 */
- (void)hippy_handleDoublePressKeyCommand:(UIKeyCommand *)key
{
    static BOOL firstPress = YES;
    static NSTimeInterval lastCommand = 0;
    static NSTimeInterval lastDoubleCommand = 0;
    static NSString *lastInput = nil;
    static UIKeyModifierFlags lastModifierFlags = 0;
    
    if (firstPress) {
        for (HippyKeyCommand *command in [HippyKeyCommands sharedInstance].commands.allObjects) { //add by stockGroup
            if ([command.keyCommand.input isEqualToString:key.input] &&
                command.keyCommand.modifierFlags == key.modifierFlags &&
                command.block) {
                
                firstPress = NO;
                lastCommand = CACurrentMediaTime();
                lastInput = key.input;
                lastModifierFlags = key.modifierFlags;
                return;
            }
        }
    } else {
        // Second keyevent within 0.2 second,
        // with the same key as the first one.
        if (CACurrentMediaTime() - lastCommand < 0.2 &&
            lastInput == key.input &&
            lastModifierFlags == key.modifierFlags) {
            
            for (HippyKeyCommand *command in [HippyKeyCommands sharedInstance].commands.allObjects) { //add by stockGroup
                if ([command.keyCommand.input isEqualToString:key.input] &&
                    command.keyCommand.modifierFlags == key.modifierFlags &&
                    command.block) {
                    
                    // NOTE: throttle the key handler because on iOS 9 the handleKeyCommand:
                    // method gets called repeatedly if the command key is held down.
                    if (HippyIsIOS8OrEarlier() || CACurrentMediaTime() - lastDoubleCommand > 0.5) {
                        command.block(key);
                        lastDoubleCommand = CACurrentMediaTime();
                    }
                    firstPress = YES;
                    return;
                }
            }
        }
        
        lastCommand = CACurrentMediaTime();
        lastInput = key.input;
        lastModifierFlags = key.modifierFlags;
    }
}

@end

@implementation UIApplication (HippyKeyCommands)

// Required for iOS 8.x
- (BOOL)hippy_sendAction:(SEL)action to:(id)target from:(id)sender forEvent:(UIEvent *)event
{
    if (action == @selector(hippy_handleKeyCommand:)) {
        [self hippy_handleKeyCommand:sender];
        return YES;
    } else if (action == @selector(hippy_handleDoublePressKeyCommand:)) {
        [self hippy_handleDoublePressKeyCommand:sender];
        return YES;
    }
    return [self hippy_sendAction:action to:target from:sender forEvent:event];
}

@end

@implementation HippyKeyCommands

+ (void)initialize
{
    if (HippyIsIOS8OrEarlier()) {
        
        // swizzle UIApplication
        HippySwapInstanceMethods([UIApplication class],
                               @selector(keyCommands),
                               @selector(hippy_keyCommands));
        
        HippySwapInstanceMethods([UIApplication class],
                               @selector(sendAction:to:from:forEvent:),
                               @selector(hippy_sendAction:to:from:forEvent:));
    } else {
        
        // swizzle UIResponder
        HippySwapInstanceMethods([UIResponder class],
                               @selector(keyCommands),
                               @selector(hippy_keyCommands));
    }
}

+ (instancetype)sharedInstance
{
    static HippyKeyCommands *sharedInstance;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [self new];
    });
    
    return sharedInstance;
}

- (instancetype)init
{
    if ((self = [super init])) {
        _commands = [NSMutableSet new];
    }
    return self;
}

- (void)registerKeyCommandWithInput:(NSString *)input
                      modifierFlags:(UIKeyModifierFlags)flags
                             action:(void (^)(UIKeyCommand *))block
{
    HippyAssertMainQueue();
    
    if (input.length && flags && HippyIsIOS8OrEarlier()) {
        
        // Workaround around the first cmd not working: http://openradar.appspot.com/19613391
        // You can register just the cmd key and do nothing. This ensures that
        // command-key modified commands will work first time. Fixed in iOS 9.
        
        [self registerKeyCommandWithInput:@""
                            modifierFlags:flags
                                   action:nil];
    }
    
    UIKeyCommand *command = [UIKeyCommand keyCommandWithInput:input
                                                modifierFlags:flags
                                                       action:@selector(hippy_handleKeyCommand:)];
    
    HippyKeyCommand *keyCommand = [[HippyKeyCommand alloc] initWithKeyCommand:command block:block];
    [_commands removeObject:keyCommand];
    [_commands addObject:keyCommand];
}

- (void)unregisterKeyCommandWithInput:(NSString *)input
                        modifierFlags:(UIKeyModifierFlags)flags
{
    HippyAssertMainQueue();
    
    for (HippyKeyCommand *command in _commands.allObjects) {
        if ([command matchesInput:input flags:flags]) {
            [_commands removeObject:command];
            break;
        }
    }
}

- (BOOL)isKeyCommandRegisteredForInput:(NSString *)input
                         modifierFlags:(UIKeyModifierFlags)flags
{
    HippyAssertMainQueue();
    
    for (HippyKeyCommand *command in _commands.allObjects) { //add by stockGroup
        if ([command matchesInput:input flags:flags]) {
            return YES;
        }
    }
    return NO;
}

- (void)registerDoublePressKeyCommandWithInput:(NSString *)input
                                 modifierFlags:(UIKeyModifierFlags)flags
                                        action:(void (^)(UIKeyCommand *))block
{
    HippyAssertMainQueue();
    
    if (input.length && flags && HippyIsIOS8OrEarlier()) {
        
        // Workaround around the first cmd not working: http://openradar.appspot.com/19613391
        // You can register just the cmd key and do nothing. This ensures that
        // command-key modified commands will work first time. Fixed in iOS 9.
        
        [self registerDoublePressKeyCommandWithInput:@""
                                       modifierFlags:flags
                                              action:nil];
    }
    
    UIKeyCommand *command = [UIKeyCommand keyCommandWithInput:input
                                                modifierFlags:flags
                                                       action:@selector(hippy_handleDoublePressKeyCommand:)];
    
    HippyKeyCommand *keyCommand = [[HippyKeyCommand alloc] initWithKeyCommand:command block:block];
    [_commands removeObject:keyCommand];
    [_commands addObject:keyCommand];
}

- (void)unregisterDoublePressKeyCommandWithInput:(NSString *)input
                                   modifierFlags:(UIKeyModifierFlags)flags
{
    HippyAssertMainQueue();
    
    for (HippyKeyCommand *command in _commands.allObjects) {
        if ([command matchesInput:input flags:flags]) {
            [_commands removeObject:command];
            break;
        }
    }
}

- (BOOL)isDoublePressKeyCommandRegisteredForInput:(NSString *)input
                                    modifierFlags:(UIKeyModifierFlags)flags
{
    HippyAssertMainQueue();
    
    for (HippyKeyCommand *command in _commands.allObjects) { //add by stockGroup
        if ([command matchesInput:input flags:flags]) {
            return YES;
        }
    }
    return NO;
}

@end

#else

@implementation HippyKeyCommands

+ (instancetype)sharedInstance
{
    return nil;
}

- (void)registerKeyCommandWithInput:(__unused NSString *)input
                      modifierFlags:(__unused UIKeyModifierFlags)flags
                             action:(__unused void (^)(UIKeyCommand *))block {}

- (void)unregisterKeyCommandWithInput:(__unused NSString *)input
                        modifierFlags:(__unused UIKeyModifierFlags)flags {}

- (BOOL)isKeyCommandRegisteredForInput:(__unused NSString *)input
                         modifierFlags:(__unused UIKeyModifierFlags)flags
{
    return NO;
}

- (void)registerDoublePressKeyCommandWithInput:(__unused NSString *)input
                                 modifierFlags:(__unused UIKeyModifierFlags)flags
                                        action:(__unused void (^)(UIKeyCommand *))block {}

- (void)unregisterDoublePressKeyCommandWithInput:(__unused NSString *)input
                                   modifierFlags:(__unused UIKeyModifierFlags)flags {}

- (BOOL)isDoublePressKeyCommandRegisteredForInput:(__unused NSString *)input
                                    modifierFlags:(__unused UIKeyModifierFlags)flags
{
    return NO;
}

@end

#endif
