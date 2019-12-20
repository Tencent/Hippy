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

#import "HippyDevMenu.h"

#import <objc/runtime.h>

#import "HippyAssert.h"
#import "HippyBridge+Private.h"
#import "HippyDefines.h"
#import "HippyEventDispatcher.h"
#import "HippyKeyCommands.h"
#import "HippyLog.h"
#import "HippyRootView.h"
#import "HippyUtils.h"
#import "HippyWebSocketProxy.h"

#if HIPPY_DEV

static NSString *const HippyShowDevMenuNotification = @"HippyShowDevMenuNotification";
static NSString *const HippyDevMenuSettingsKey = @"HippyDevMenu";

@implementation UIWindow (HippyDevMenu)

- (void)hippy_motionEnded:(__unused UIEventSubtype)motion withEvent:(UIEvent *)event
{
  if (event.subtype == UIEventSubtypeMotionShake) {
    [[NSNotificationCenter defaultCenter] postNotificationName:HippyShowDevMenuNotification object:nil];
  }
}

@end

typedef NS_ENUM(NSInteger, HippyDevMenuType) {
  HippyDevMenuTypeButton,
  HippyDevMenuTypeToggle
};

@interface HippyDevMenuItem ()

@property (nonatomic, assign, readonly) HippyDevMenuType type;
@property (nonatomic, copy, readonly) NSString *key;
@property (nonatomic, copy, readonly) NSString *title;
@property (nonatomic, copy, readonly) NSString *selectedTitle;
@property (nonatomic, copy) id value;

@end

@implementation HippyDevMenuItem
{
  id _handler; // block
}

- (instancetype)initWithType:(HippyDevMenuType)type
                         key:(NSString *)key
                       title:(NSString *)title
               selectedTitle:(NSString *)selectedTitle
                     handler:(id /* block */)handler
{
  if ((self = [super init])) {
    _type = type;
    _key = [key copy];
    _title = [title copy];
    _selectedTitle = [selectedTitle copy];
    _handler = [handler copy];
    _value = nil;
  }
  return self;
}

HIPPY_NOT_IMPLEMENTED(- (instancetype)init)

+ (instancetype)buttonItemWithTitle:(NSString *)title
                            handler:(void (^)(void))handler
{
  return [[self alloc] initWithType:HippyDevMenuTypeButton
                                key:nil
                              title:title
                      selectedTitle:nil
                            handler:handler];
}

+ (instancetype)toggleItemWithKey:(NSString *)key
                            title:(NSString *)title
                    selectedTitle:(NSString *)selectedTitle
                          handler:(void (^)(BOOL selected))handler
{
  return [[self alloc] initWithType:HippyDevMenuTypeToggle
                                key:key
                              title:title
                      selectedTitle:selectedTitle
                            handler:handler];
}

- (void)callHandler
{
  switch (_type) {
    case HippyDevMenuTypeButton: {
      if (_handler) {
        ((void(^)(void))_handler)();
      }
      break;
    }
    case HippyDevMenuTypeToggle: {
      if (_handler) {
        ((void(^)(BOOL selected))_handler)([_value boolValue]);
      }
      break;
    }
  }
}

@end

@interface HippyDevMenu () <HippyBridgeModule, HippyInvalidating>

@property (nonatomic, strong) Class executorClass;

@end

@implementation HippyDevMenu
{
  __weak UIAlertController *_actionSheet;
  NSUserDefaults *_defaults;
}

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE()

+ (void)initialize
{
  // We're swizzling here because it's poor form to override methods in a category,
  // however UIWindow doesn't actually implement motionEnded:withEvent:, so there's
  // no need to call the original implementation.
  HippySwapInstanceMethods([UIWindow class], @selector(motionEnded:withEvent:), @selector(hippy_motionEnded:withEvent:));
}

- (instancetype)init
{
  if ((self = [super init])) {

    NSNotificationCenter *notificationCenter = [NSNotificationCenter defaultCenter];

    [notificationCenter addObserver:self
                           selector:@selector(showOnShake)
                               name:HippyShowDevMenuNotification
                             object:nil];

    _defaults = [NSUserDefaults standardUserDefaults];
    _shakeToShow = YES;

  }
  return self;
}

- (void)setBridge:(HippyBridge *)bridge
{
	_bridge = bridge;
	
	if ([_defaults boolForKey: @"JSDebug"]) {
		Class jsDebuggingExecutorClass = objc_lookUpClass("HippyWebSocketExecutor");
		self.executorClass = jsDebuggingExecutorClass;
	}
#if TARGET_IPHONE_SIMULATOR
    if (bridge.debugMode) {
        __weak HippyDevMenu *weakSelf = self;
        
        HippyKeyCommands *commands = [HippyKeyCommands sharedInstance];
        
        // Toggle debug menu
        [commands registerKeyCommandWithInput:@"d"
                                modifierFlags:UIKeyModifierCommand
                                       action:^(__unused UIKeyCommand *command) {
                                           [weakSelf toggle];
                                       }];
        
        // Toggle debug menu
        [commands registerKeyCommandWithInput:@"e"
                                modifierFlags:UIKeyModifierCommand
                                       action:^(__unused UIKeyCommand *command) {
                                           [weakSelf toggle];
                                       }];
        
        // Toggle debug menu
        [commands registerKeyCommandWithInput:@"b"
                                modifierFlags:UIKeyModifierCommand
                                       action:^(__unused UIKeyCommand *command) {
                                           [weakSelf toggle];
                                       }];
        
        // Toggle debug menu
        [commands registerKeyCommandWithInput:@"u"
                                modifierFlags:UIKeyModifierCommand
                                       action:^(__unused UIKeyCommand *command) {
                                           [weakSelf toggle];
                                       }];
        
        // Toggle debug menu
        [commands registerKeyCommandWithInput:@"g"
                                modifierFlags:UIKeyModifierCommand
                                       action:^(__unused UIKeyCommand *command) {
                                           [weakSelf toggle];
                                       }];
    }
#endif
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (void)invalidate
{

  [_actionSheet dismissViewControllerAnimated:YES completion:^(void){}];
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)showOnShake
{
  if (_shakeToShow) {
    [self show];
  }
}

- (void)toggle
{
  if (!self.bridge.debugMode) return;
  if (_actionSheet) {
    [_actionSheet dismissViewControllerAnimated:YES completion:^(void){}];
    _actionSheet = nil;
  } else {
    [self show];
  }
}

- (void)addItem:(NSString *)title handler:(void(^)(void))handler
{
  [self addItem:[HippyDevMenuItem buttonItemWithTitle:title handler:handler]];
}

- (void)addItem:(__unused HippyDevMenuItem *)item {
    HippyAssert(NO, @"[HippyDevMenu addItem:]方法没有实现，怎么没问题？");
}

- (NSArray<HippyDevMenuItem *> *)menuItems
{
  NSMutableArray<HippyDevMenuItem *> *items = [NSMutableArray new];

  // Add built-in items

  __weak HippyDevMenu *weakSelf = self;

  [items addObject:[HippyDevMenuItem buttonItemWithTitle:@"Reload" handler:^{
    [weakSelf reload];
  }]];

//  Class jsDebuggingExecutorClass = objc_lookUpClass("HippyWebSocketExecutor");
//	
//	BOOL isDebuggingJS = _executorClass && _executorClass == jsDebuggingExecutorClass;
//	NSString *debugTitleJS = isDebuggingJS ? @"Stop Remote JS Debugging" : @"Debug JS Remotely";
//	[items addObject: [HippyDevMenuItem buttonItemWithTitle: debugTitleJS handler: ^{
//		if ([debugTitleJS isEqualToString:@"Stop Remote JS Debugging"]) {
//			[self->_defaults setBool: NO forKey: @"JSDebug"];
//		} else {
//			[self->_defaults setBool: YES forKey: @"JSDebug"];
//		}
//		[self->_defaults synchronize];
//	  	weakSelf.executorClass = isDebuggingJS ? Nil : jsDebuggingExecutorClass;
//	}]];


  return items;
}

HIPPY_EXPORT_METHOD(reload)
{
    [_bridge requestReload];
}

HIPPY_EXPORT_METHOD(show)
{
  if (_actionSheet || !_bridge || HippyRunningInAppExtension()) {
    return;
  }

  NSString *title = [NSString stringWithFormat:@"Hippy: Development (%@)", [_bridge class]];
  // On larger devices we don't have an anchor point for the action sheet
  UIAlertControllerStyle style = [[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPhone ? UIAlertControllerStyleActionSheet : UIAlertControllerStyleAlert;
  UIAlertController *actionSheet = [UIAlertController alertControllerWithTitle:title
                                                     message:@""
                                              preferredStyle:style];
    _actionSheet = actionSheet;

  NSArray<HippyDevMenuItem *> *items = [self menuItems];
  for (HippyDevMenuItem *item in items) {
    switch (item.type) {
      case HippyDevMenuTypeButton: {
        [_actionSheet addAction:[UIAlertAction actionWithTitle:item.title
                                                         style:UIAlertActionStyleDefault
                                                       handler:^(__unused UIAlertAction *action) {
                                                         // Cancel button tappped.
                                                         [item callHandler];
                                                       }]];
        break;
      }
        default:
        break;
    }
  }

  [_actionSheet addAction:[UIAlertAction actionWithTitle:@"Cancel"
                                                   style:UIAlertActionStyleCancel
                                                 handler:^(__unused UIAlertAction *action) {
                                                 }]];

  [HippyPresentedViewController() presentViewController:_actionSheet animated:YES completion:^(void){}];
}

- (void)setExecutorClass:(Class)executorClass
{
	if (_bridge.debugMode) {
		if (_executorClass != executorClass) {
			_executorClass = executorClass;
		}

		if (_bridge.executorClass != executorClass) {

			// TODO (6929129): we can remove this special case test once we have better
			// support for custom executors in the dev menu. But right now this is
			// needed to prevent overriding a custom executor with the default if a
			// custom executor has been set directly on the bridge
			if (executorClass == Nil &&
					_bridge.executorClass != objc_lookUpClass("HippyWebSocketExecutor")) {
				return;
			}
			_bridge.executorClass = executorClass;
			[_bridge reload];
		}
	}
}

@end

#else // Unavailable when not in dev mode

@implementation HippyDevMenu

- (void)show {}
- (void)reload {}
- (void)addItem:(__unused NSString *)title handler:(__unused dispatch_block_t)handler {}
- (void)addItem:(__unused HippyDevMenu *)item {}

@end

#endif

@implementation  HippyBridge (HippyDevMenu)

- (HippyDevMenu *)devMenu
{
#if HIPPY_DEV
  return [self moduleForClass:[HippyDevMenu class]];
#else
  return nil;
#endif
}

@end
