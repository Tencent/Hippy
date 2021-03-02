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

#import "HippyRedBox.h"

#import "HippyBridge.h"
#import "HippyConvert.h"
#import "HippyDefines.h"
#import "HippyErrorInfo.h"
#import "HippyUtils.h"
#import "HippyJSStackFrame.h"

#if HIPPY_DEBUG

@class HippyRedBoxWindow;

@protocol HippyRedBoxWindowActionDelegate <NSObject>

- (void)redBoxWindow:(HippyRedBoxWindow *)redBoxWindow openStackFrameInEditor:(HippyJSStackFrame *)stackFrame;
- (void)reloadFromRedBoxWindow:(HippyRedBoxWindow *)redBoxWindow;

@end

@interface HippyRedBoxWindow : UIWindow <UITableViewDelegate, UITableViewDataSource>
@property (nonatomic, weak) id<HippyRedBoxWindowActionDelegate> actionDelegate;
@end

@implementation HippyRedBoxWindow
{
    UITableView *_stackTraceTableView;
    NSString *_lastErrorMessage;
    NSArray<HippyJSStackFrame *> *_lastStackTrace;
    __weak UIWindow *_previousKeyWindow;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if ((self = [super initWithFrame:frame])) {
        self.windowLevel = UIWindowLevelAlert + 1000;
        self.backgroundColor = [UIColor colorWithRed:0.8 green:0 blue:0 alpha:1];
        self.hidden = YES;
        
        UIViewController *rootController = [UIViewController new];
        self.rootViewController = rootController;
        UIView *rootView = rootController.view;
        rootView.backgroundColor = [UIColor clearColor];
        
        const CGFloat buttonHeight = 60;
        
        CGRect detailsFrame = rootView.bounds;
        detailsFrame.size.height -= buttonHeight;
        
        _stackTraceTableView = [[UITableView alloc] initWithFrame:detailsFrame style:UITableViewStylePlain];
        _stackTraceTableView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        _stackTraceTableView.delegate = self;
        _stackTraceTableView.dataSource = self;
        _stackTraceTableView.backgroundColor = [UIColor clearColor];
        _stackTraceTableView.separatorColor = [UIColor colorWithWhite:1 alpha:0.3];
        _stackTraceTableView.separatorStyle = UITableViewCellSeparatorStyleNone;
        _stackTraceTableView.indicatorStyle = UIScrollViewIndicatorStyleWhite;
        [rootView addSubview:_stackTraceTableView];
        
#if TARGET_OS_SIMULATOR
        NSString *reloadText = @"Reload JS (\u2318R)";
        NSString *dismissText = @"Dismiss (ESC)";
        NSString *copyText = @"Copy (\u2325\u2318C)";
#else
        NSString *reloadText = @"Reload JS";
        NSString *dismissText = @"Dismiss";
        NSString *copyText = @"Copy";
#endif
        
        UIButton *dismissButton = [UIButton buttonWithType:UIButtonTypeCustom];
        dismissButton.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleRightMargin;
        dismissButton.accessibilityIdentifier = @"redbox-dismiss";
        dismissButton.titleLabel.font = [UIFont systemFontOfSize:14];
        [dismissButton setTitle:dismissText forState:UIControlStateNormal];
        [dismissButton setTitleColor:[UIColor colorWithWhite:1 alpha:0.5] forState:UIControlStateNormal];
        [dismissButton setTitleColor:[UIColor whiteColor] forState:UIControlStateHighlighted];
        [dismissButton addTarget:self action:@selector(dismiss) forControlEvents:UIControlEventTouchUpInside];
        
        UIButton *reloadButton = [UIButton buttonWithType:UIButtonTypeCustom];
        reloadButton.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleLeftMargin;
        reloadButton.accessibilityIdentifier = @"redbox-reload";
        reloadButton.titleLabel.font = [UIFont systemFontOfSize:14];
        
        [reloadButton setTitle:reloadText forState:UIControlStateNormal];
        [reloadButton setTitleColor:[UIColor colorWithWhite:1 alpha:0.5] forState:UIControlStateNormal];
        [reloadButton setTitleColor:[UIColor whiteColor] forState:UIControlStateHighlighted];
        [reloadButton addTarget:self action:@selector(reload) forControlEvents:UIControlEventTouchUpInside];
        
        UIButton *copyButton = [UIButton buttonWithType:UIButtonTypeCustom];
        copyButton.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleLeftMargin;
        copyButton.accessibilityIdentifier = @"redbox-copy";
        copyButton.titleLabel.font = [UIFont systemFontOfSize:14];
        [copyButton setTitle:copyText forState:UIControlStateNormal];
        [copyButton setTitleColor:[UIColor colorWithWhite:1 alpha:0.5] forState:UIControlStateNormal];
        [copyButton setTitleColor:[UIColor whiteColor] forState:UIControlStateHighlighted];
        [copyButton addTarget:self action:@selector(copyStack) forControlEvents:UIControlEventTouchUpInside];
        
        CGFloat buttonWidth = self.bounds.size.width / 3;
        dismissButton.frame = CGRectMake(0, self.bounds.size.height - buttonHeight, buttonWidth, buttonHeight);
        reloadButton.frame = CGRectMake(buttonWidth, self.bounds.size.height - buttonHeight, buttonWidth, buttonHeight);
        copyButton.frame = CGRectMake(buttonWidth * 2, self.bounds.size.height - buttonHeight, buttonWidth, buttonHeight);
        [rootView addSubview:dismissButton];
        [rootView addSubview:reloadButton];
        [rootView addSubview:copyButton];
    }
    return self;
}

HIPPY_NOT_IMPLEMENTED(- (instancetype)initWithCoder:(NSCoder *)aDecoder)

- (void)dealloc
{
    _stackTraceTableView.dataSource = nil;
    _stackTraceTableView.delegate = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)showErrorMessage:(NSString *)message withStack:(NSArray<HippyJSStackFrame *> *)stack isUpdate:(BOOL)isUpdate
{
    // Show if this is a new message, or if we're updating the previous message
    if ((self.hidden && !isUpdate) || (!self.hidden && isUpdate && [_lastErrorMessage isEqualToString:message])) {
        _lastStackTrace = stack;
        // message is displayed using UILabel, which is unable to render text of
        // unlimited length, so we truncate it
        _lastErrorMessage = [message substringToIndex:MIN((NSUInteger)10000, message.length)];
        
        [_stackTraceTableView reloadData];
        
        if (self.hidden) {
            [_stackTraceTableView scrollToRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0]
                                        atScrollPosition:UITableViewScrollPositionTop
                                                animated:NO];
        }
        _previousKeyWindow = HippyKeyWindow();
        [self makeKeyAndVisible];
        [self becomeFirstResponder];
    }
}

- (void)dismiss
{
    self.hidden = YES;
    [self resignFirstResponder];
    [_previousKeyWindow makeKeyWindow];
}

- (void)reload
{
    [_actionDelegate reloadFromRedBoxWindow:self];
}

- (void)copyStack
{
    NSMutableString *fullStackTrace;
    
    if (_lastErrorMessage != nil) {
        fullStackTrace = [_lastErrorMessage mutableCopy];
        [fullStackTrace appendString:@"\n\n"];
    }
    else {
        fullStackTrace = [NSMutableString string];
    }
    
    for (HippyJSStackFrame *stackFrame in _lastStackTrace) {
        [fullStackTrace appendString:[NSString stringWithFormat:@"%@\n", stackFrame.methodName]];
        if (stackFrame.file) {
            [fullStackTrace appendFormat:@"    %@\n", [self formatFrameSource:stackFrame]];
        }
    }
    UIPasteboard *pb = [UIPasteboard generalPasteboard];
    [pb setString:fullStackTrace];
}

- (NSString *)formatFrameSource:(HippyJSStackFrame *)stackFrame
{
    NSString *lineInfo = [NSString stringWithFormat:@"%@:%zd",
                          [stackFrame.file lastPathComponent],
                          (long)stackFrame.lineNumber];
    
    if (stackFrame.column != 0) {
        lineInfo = [lineInfo stringByAppendingFormat:@":%zd", (long)stackFrame.column];
    }
    return lineInfo;
}

#pragma mark - TableView

- (NSInteger)numberOfSectionsInTableView:(__unused UITableView *)tableView
{
    return 2;
}

- (NSInteger)tableView:(__unused UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return section == 0 ? 1 : _lastStackTrace.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.section == 0) {
        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"msg-cell"];
        return [self reuseCell:cell forErrorMessage:_lastErrorMessage];
    }
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cell"];
    NSUInteger index = indexPath.row;
    HippyJSStackFrame *stackFrame = _lastStackTrace[index];
    return [self reuseCell:cell forStackFrame:stackFrame];
}

- (UITableViewCell *)reuseCell:(UITableViewCell *)cell forErrorMessage:(NSString *)message
{
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"msg-cell"];
        cell.textLabel.accessibilityIdentifier = @"redbox-error";
        cell.textLabel.textColor = [UIColor whiteColor];
        cell.textLabel.font = [UIFont boldSystemFontOfSize:16];
        cell.textLabel.lineBreakMode = NSLineBreakByWordWrapping;
        cell.textLabel.numberOfLines = 0;
        cell.detailTextLabel.textColor = [UIColor whiteColor];
        cell.backgroundColor = [UIColor clearColor];
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
    }
    
    cell.textLabel.text = message;
    
    return cell;
}

- (UITableViewCell *)reuseCell:(UITableViewCell *)cell forStackFrame:(HippyJSStackFrame *)stackFrame
{
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"cell"];
        cell.textLabel.textColor = [UIColor colorWithWhite:1 alpha:0.9];
        cell.textLabel.font = [UIFont fontWithName:@"Menlo-Regular" size:14];
        cell.textLabel.numberOfLines = 2;
        cell.detailTextLabel.textColor = [UIColor colorWithWhite:1 alpha:0.7];
        cell.detailTextLabel.font = [UIFont fontWithName:@"Menlo-Regular" size:11];
        cell.detailTextLabel.lineBreakMode = NSLineBreakByTruncatingMiddle;
        cell.backgroundColor = [UIColor clearColor];
        cell.selectedBackgroundView = [UIView new];
        cell.selectedBackgroundView.backgroundColor = [UIColor colorWithWhite:0 alpha:0.2];
    }
    
    cell.textLabel.text = stackFrame.methodName;
    if (stackFrame.file) {
        cell.detailTextLabel.text = [self formatFrameSource:stackFrame];
    } else {
        cell.detailTextLabel.text = @"";
    }
    return cell;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.section == 0) {
        NSMutableParagraphStyle *paragraphStyle = [[NSParagraphStyle defaultParagraphStyle] mutableCopy];
        paragraphStyle.lineBreakMode = NSLineBreakByWordWrapping;
        
        NSDictionary *attributes = @{NSFontAttributeName: [UIFont boldSystemFontOfSize:16],
                                     NSParagraphStyleAttributeName: paragraphStyle};
        CGRect boundingRect = [_lastErrorMessage boundingRectWithSize:CGSizeMake(tableView.frame.size.width - 30, CGFLOAT_MAX) options:NSStringDrawingUsesLineFragmentOrigin attributes:attributes context:nil];
        return ceil(boundingRect.size.height) + 40;
    } else {
        return 50;
    }
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.section == 1) {
        NSUInteger row = indexPath.row;
        HippyJSStackFrame *stackFrame = _lastStackTrace[row];
        [_actionDelegate redBoxWindow:self openStackFrameInEditor:stackFrame];
    }
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
}

#pragma mark - Key commands

- (NSArray<UIKeyCommand *> *)keyCommands
{
    // NOTE: We could use HippyKeyCommands for this, but since
    // we control this window, we can use the standard, non-hacky
    // mechanism instead
    
    return @[
        
        // Dismiss red box
        [UIKeyCommand keyCommandWithInput:UIKeyInputEscape
                            modifierFlags:0
                                   action:@selector(dismiss)],
        
        // Reload
        [UIKeyCommand keyCommandWithInput:@"r"
                            modifierFlags:UIKeyModifierCommand
                                   action:@selector(reload)],
        
        // Copy = Cmd-Option C since Cmd-C in the simulator copies the pasteboard from
        // the simulator to the desktop pasteboard.
        [UIKeyCommand keyCommandWithInput:@"c"
                            modifierFlags:UIKeyModifierCommand | UIKeyModifierAlternate
                                   action:@selector(copyStack)]
        
    ];
}

- (BOOL)canBecomeFirstResponder
{
    return YES;
}

@end

@interface HippyRedBox () <HippyInvalidating, HippyRedBoxWindowActionDelegate>
@end

@implementation HippyRedBox
{
    HippyRedBoxWindow *_window;
    NSMutableArray<id<HippyErrorCustomizer>> *_errorCustomizers;
}

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    if (self) {
        _showEnabled = YES;
    }
    return self;
}

- (void)registerErrorCustomizer:(id<HippyErrorCustomizer>)errorCustomizer
{
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!self->_errorCustomizers) {
            self->_errorCustomizers = [NSMutableArray array];
        }
        if (![self->_errorCustomizers containsObject:errorCustomizer]) {
            [self->_errorCustomizers addObject:errorCustomizer];
        }
    });
}

// WARNING: Should only be called from the main thread/dispatch queue.
- (HippyErrorInfo *)_customizeError:(HippyErrorInfo *)error
{
    HippyAssertMainQueue();
    
    if (!self->_errorCustomizers) {
        return error;
    }
    for (id<HippyErrorCustomizer> customizer in self->_errorCustomizers) {
        HippyErrorInfo *newInfo = [customizer customizeErrorInfo:error];
        if (newInfo) {
            error = newInfo;
        }
    }
    return error;
}

- (void)showError:(NSError *)error
{
    [self showErrorMessage:error.localizedDescription withDetails:error.localizedFailureReason];
}

- (void)showErrorMessage:(NSString *)message
{
    [self showErrorMessage:message withStack:nil isUpdate:NO];
}

- (void)showErrorMessage:(NSString *)message withDetails:(NSString *)details
{
    NSString *combinedMessage = message;
    if (details) {
        combinedMessage = [NSString stringWithFormat:@"%@\n\n%@", message, details];
    }
    [self showErrorMessage:combinedMessage withStack:nil isUpdate:NO];
}

- (void)showErrorMessage:(NSString *)message withRawStack:(NSString *)rawStack
{
    NSArray<HippyJSStackFrame *> *stack = [HippyJSStackFrame stackFramesWithLines:rawStack];
    [self showErrorMessage:message withStack:stack isUpdate:NO];
}

- (void)showErrorMessage:(NSString *)message withStack:(NSArray *)stack
{
    [self showErrorMessage:message withStack:stack isUpdate:NO];
}

- (void)updateErrorMessage:(NSString *)message withStack:(NSArray *)stack
{
    [self showErrorMessage:message withStack:stack isUpdate:YES];
}

- (void)showErrorMessage:(NSString *)message withStack:(NSArray *)stack isUpdate:(BOOL)isUpdate
{
    if (!_showEnabled) {
        return;
    }
    if (![[stack firstObject] isKindOfClass:[HippyJSStackFrame class]]) {
        stack = [HippyJSStackFrame stackFramesWithDictionaries:stack];
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!self->_window) {
            self->_window = [[HippyRedBoxWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
            self->_window.actionDelegate = self;
        }
        HippyErrorInfo *errorInfo = [[HippyErrorInfo alloc] initWithErrorMessage:message
                                                                           stack:stack];
        errorInfo = [self _customizeError:errorInfo];
        [self->_window showErrorMessage:errorInfo.errorMessage
                              withStack:errorInfo.stack
                               isUpdate:isUpdate];
    });
}

//clang-format off
HIPPY_EXPORT_METHOD(dismiss) {
//clang-format on
    dispatch_async(dispatch_get_main_queue(), ^{
        [self->_window dismiss];
    });
}

- (void)invalidate
{
    [self dismiss];
}

- (void)redBoxWindow:(__unused HippyRedBoxWindow *)redBoxWindow openStackFrameInEditor:(HippyJSStackFrame *)stackFrame
{
    if (![_bridge.bundleURL.scheme hasPrefix:@"http"]) {
        HippyLogWarn(@"Cannot open stack frame in editor because you're not connected to the packager.");
        return;
    }
    
    NSData *stackFrameJSON = [HippyJSONStringify([stackFrame toDictionary], NULL) dataUsingEncoding:NSUTF8StringEncoding];
    NSString *postLength = [NSString stringWithFormat:@"%tu", stackFrameJSON.length];
    NSMutableURLRequest *request = [NSMutableURLRequest new];
    request.URL = [NSURL URLWithString:@"/open-stack-frame" relativeToURL:_bridge.bundleURL];
    request.HTTPMethod = @"POST";
    request.HTTPBody = stackFrameJSON;
    [request setValue:postLength forHTTPHeaderField:@"Content-Length"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    
    [[[NSURLSession sharedSession] dataTaskWithRequest:request] resume];
}

- (void)reloadFromRedBoxWindow:(__unused HippyRedBoxWindow *)redBoxWindow {
    [_bridge requestReload];
}

@end

@implementation HippyBridge (HippyRedBox)

- (HippyRedBox *)redBox
{
    return [self moduleForClass:[HippyRedBox class]];
}

@end

#else // Disabled

@implementation HippyRedBox

+ (NSString *)moduleName { return nil; }
- (void)registerErrorCustomizer:(__unused id<HippyErrorCustomizer>)errorCustomizer {}
- (void)showError:(__unused NSError *)message {}
- (void)showErrorMessage:(__unused NSString *)message {}
- (void)showErrorMessage:(__unused NSString *)message withDetails:(__unused NSString *)details {}
- (void)showErrorMessage:(__unused NSString *)message withRawStack:(__unused NSString *)rawStack {}
- (void)showErrorMessage:(__unused NSString *)message withStack:(__unused NSArray<NSDictionary *> *)stack {}
- (void)updateErrorMessage:(__unused NSString *)message withStack:(__unused NSArray<NSDictionary *> *)stack {}
- (void)showErrorMessage:(__unused NSString *)message withStack:(__unused NSArray<NSDictionary *> *)stack isUpdate:(__unused BOOL)isUpdate {}
- (void)dismiss {}

@end

@implementation HippyBridge (HippyRedBox)

- (HippyRedBox *)redBox { return nil; }

@end

#endif
