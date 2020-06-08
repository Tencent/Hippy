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

#define RN_FORWARD_SCROLL_EVENT(call) \
for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) { \
  if ([scrollViewListener respondsToSelector:_cmd]) { \
    [scrollViewListener call]; \
  } \
}

@protocol HippyScrollableProtocol <UIScrollViewDelegate>

@property (nonatomic, readonly) CGSize contentSize;

- (void)addScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener;
- (void)removeScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener;
- (UIScrollView *)realScrollView;
- (NSHashTable *)scrollListeners;

@optional
- (void)scrollToOffset:(CGPoint)offset animated:(BOOL)animated;
- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated;

@end
