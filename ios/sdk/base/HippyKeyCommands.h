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

#import <UIKit/UIKit.h>

@interface HippyKeyCommands : NSObject

+ (instancetype)sharedInstance;

/**
 * Register a single-press keyboard command.
 */
- (void)registerKeyCommandWithInput:(NSString *)input
                      modifierFlags:(UIKeyModifierFlags)flags
                             action:(void (^)(UIKeyCommand *command))block;

/**
 * Unregister a single-press keyboard command.
 */
- (void)unregisterKeyCommandWithInput:(NSString *)input modifierFlags:(UIKeyModifierFlags)flags;

/**
 * Check if a single-press command is registered.
 */
- (BOOL)isKeyCommandRegisteredForInput:(NSString *)input modifierFlags:(UIKeyModifierFlags)flags;

/**
 * Register a double-press keyboard command.
 */
- (void)registerDoublePressKeyCommandWithInput:(NSString *)input
                                 modifierFlags:(UIKeyModifierFlags)flags
                                        action:(void (^)(UIKeyCommand *command))block;

/**
 * Unregister a double-press keyboard command.
 */
- (void)unregisterDoublePressKeyCommandWithInput:(NSString *)input modifierFlags:(UIKeyModifierFlags)flags;

/**
 * Check if a double-press command is registered.
 */
- (BOOL)isDoublePressKeyCommandRegisteredForInput:(NSString *)input modifierFlags:(UIKeyModifierFlags)flags;

@end
