//
//  HippyNetInfoIntenal.h
//  HippyDemo
//
//  Created by mengyanluo on 2021/6/11.
//  Copyright © 2021 tencent. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

extern NSString *const HippyNetworkTypeUnknown;
extern NSString *const HippyNetworkTypeNone;
extern NSString *const HippyNetworkTypeWifi;
extern NSString *const HippyNetworkTypeCell;

extern  NSString *const HippNetworkCellTypeUnknown;
extern  NSString *const HippNetworkCellTypeNone;
extern  NSString *const HippyNetworkCellType2G;
extern  NSString *const HippyNetworkCellType3G;
extern  NSString *const HippyNetworkCellType4G;
extern  NSString *const HippyNetworkCellType5G;

@interface HippyNetworkTypeObject : NSObject

/**
 * indicate network type
 * value:HippyNetworkTypeUnknown,HippyNetworkTypeNone,HippyNetworkTypeWifi,HippyNetworkTypeCell
 */
@property(nonatomic, readonly) NSString *networkType;

/**
 * indicate cell type
 */
@property(nonatomic, readonly) NSString *cellType;

- (instancetype)initWithNetworkType:(NSString *)networkType cellType:(NSString *)cellType;

- (BOOL)isEqual:(id)object;

- (BOOL)isEqualToNetowrkTypeObject:(HippyNetworkTypeObject *)object;

@end

@protocol HippyNetworkTypeChangedDelegate <NSObject>

- (void)hippyNetworkTypeChanged:(HippyNetworkTypeObject *)networkType;

@end

@interface HippyNetInfoIntenal : NSObject

+ (instancetype)sharedInstance;

- (HippyNetworkTypeObject *)currentNetworkType;

/**
 * set an observer for network changed event.
 * return current network info immediately
 */
- (HippyNetworkTypeObject *)addNetworkTypeChangeObserver:(id<HippyNetworkTypeChangedDelegate>)observer;

- (void)removeNetworkTypeChangeObserver:(id<HippyNetworkTypeChangedDelegate>)observer;

@end

NS_ASSUME_NONNULL_END
