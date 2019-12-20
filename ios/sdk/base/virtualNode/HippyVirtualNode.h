//
//  HippyVirtualNode
//  mtt
//
//  Created by pennyli on 2017/8/17.
//  Copyright © 2017年 Tencent. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "HippyUIManager.h"

@class HippyVirtualNode;
@class HippyVirtualList;
@class HippyVirtualCell;

@protocol HippyVirtualListComponentUpdateDelegate
- (void)virtualListDidUpdated;
@end


@interface HippyVirtualNode : NSObject <HippyComponent>

+ (HippyVirtualNode *)createNode:(NSNumber *)hippyTag
									viewName:(NSString *)viewName
										 props:(NSDictionary *)props;

- (instancetype)initWithTag:(NSNumber *)hippyTag
									 viewName:(NSString *)viewName
											props:(NSDictionary *)props;

@property (nonatomic, retain) NSMutableArray <HippyVirtualNode *> *subNodes;

@property (nonatomic, weak) HippyVirtualList *listNode;
@property (nonatomic, weak) HippyVirtualCell *cellNode;
@property (nonatomic, copy) NSNumber *rootTag;

- (BOOL)isListSubNode;


typedef UIView * (^HippyCreateViewForShadow)(HippyVirtualNode *node);
typedef UIView * (^HippyUpdateViewForShadow)(HippyVirtualNode *newNode, HippyVirtualNode *oldNode);
typedef void (^HippyInsertViewForShadow)(UIView *container, NSArray<UIView *> *childrens);
typedef void (^HippyRemoveViewForShadow)(NSNumber * hippyTag);
typedef void (^HippyVirtualNodeManagerUIBlock)(HippyUIManager *uiManager, NSDictionary<NSNumber *, HippyVirtualNode *> *virtualNodeRegistry);

- (UIView *)createView:(HippyCreateViewForShadow)createBlock insertChildrens:(HippyInsertViewForShadow)insertChildrens;
- (NSDictionary *)diff:(HippyVirtualNode *)newNode;

- (void)removeView:(HippyRemoveViewForShadow)removeBlock;

@end

@interface HippyVirtualCell: HippyVirtualNode
@property (nonatomic, copy) NSString *itemViewType;
@property (nonatomic, assign) BOOL sticky;
@property (nonatomic, weak) UIView *cell;
@end


@interface HippyVirtualList: HippyVirtualNode
@property (nonatomic, assign) BOOL needFlush;
@end

@interface UIView (HippyRemoveNode)
- (void)removeView:(HippyRemoveViewForShadow)removeBlock;
@end
