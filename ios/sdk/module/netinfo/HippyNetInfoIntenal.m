//
//  HippyNetInfoIntenal.m
//  HippyDemo
//
//  Created by mengyanluo on 2021/6/11.
//  Copyright © 2021 tencent. All rights reserved.
//

#import "HippyNetInfoIntenal.h"
#import "HippyAssert.h"
#import "HippyBridge.h"
#import "HippyEventDispatcher.h"
#import "netinet/in.h"
#import <SystemConfiguration/SystemConfiguration.h>
#import <CoreTelephony/CTCarrier.h>
#import <CoreTelephony/CTTelephonyNetworkInfo.h>

NSString *const HippyNetworkTypeUnknown = @"UNKNOWN";
NSString *const HippyNetworkTypeNone = @"NONE";
NSString *const HippyNetworkTypeWifi = @"WIFI";
NSString *const HippyNetworkTypeCell = @"CELL";

NSString *const HippNetworkCellTypeUnknown = @"UNKNOWN";
NSString *const HippNetworkCellTypeNone = @"NONE";
NSString *const HippyNetworkCellType2G = @"2G";
NSString *const HippyNetworkCellType3G = @"3G";
NSString *const HippyNetworkCellType4G = @"4G";
NSString *const HippyNetworkCellType5G = @"5G";

static HippyNetInfoIntenal *instance = nil;

@implementation HippyNetworkTypeObject

- (instancetype)initWithNetworkType:(NSString *)networkType cellType:(NSString *)cellType {
    self = [super init];
    if (self) {
        _networkType = networkType;
        _cellType = cellType;
    }
    return self;
}

- (BOOL)isEqual:(id)object {
    return [self isEqualToNetowrkTypeObject:object];
}

- (BOOL)isEqualToNetowrkTypeObject:(HippyNetworkTypeObject *)object {
    if ([object isKindOfClass:[HippyNetworkTypeObject class]]) {
        if ([self.networkType isEqualToString:object.networkType] &&
            [self.cellType isEqualToString:object.cellType]) {
            return YES;
        }
    }
    return NO;
}

@end

@interface HippyNetInfoIntenal () {
    SCNetworkReachabilityRef _reachability;
    NSString *_networkType;
    NSString *_host;
    CTTelephonyNetworkInfo *_cellNetType;
    NSHashTable *_observers;
}

@end

@implementation HippyNetInfoIntenal

static NSString *hippyReachabilityGetCellType(NSString *cellType) {
    if ([cellType isEqualToString:CTRadioAccessTechnologyEdge] ||
        [cellType isEqualToString:CTRadioAccessTechnologyGPRS] ||
        [cellType isEqualToString:CTRadioAccessTechnologyCDMA1x]) {
        return HippyNetworkCellType2G;
    }
    else if ([cellType isEqualToString:CTRadioAccessTechnologyHSDPA] ||
             [cellType isEqualToString:CTRadioAccessTechnologyWCDMA] ||
             [cellType isEqualToString:CTRadioAccessTechnologyHSUPA] ||
             [cellType isEqualToString:CTRadioAccessTechnologyCDMAEVDORev0] ||
             [cellType isEqualToString:CTRadioAccessTechnologyCDMAEVDORevA] ||
             [cellType isEqualToString:CTRadioAccessTechnologyCDMAEVDORevB] ||
             [cellType isEqualToString:CTRadioAccessTechnologyeHRPD]) {
        return HippyNetworkCellType3G;
    }
    else if ([cellType isEqualToString:CTRadioAccessTechnologyLTE]) {
        return HippyNetworkCellType4G;
    }
    else if (@available(iOS 14.1, *)) {
        if ([cellType isEqualToString:CTRadioAccessTechnologyNRNSA] ||
            [cellType isEqualToString:CTRadioAccessTechnologyNR]) {
            return HippyNetworkCellType5G;
        }
    }
    return HippNetworkCellTypeUnknown;
}

static SCNetworkReachabilityRef createReachabilityRefWithZeroAddress() {
    struct sockaddr_in zeroAddress;
    bzero(&zeroAddress, sizeof(zeroAddress));
    zeroAddress.sin_len = sizeof(zeroAddress);
    zeroAddress.sin_family = AF_INET;
    SCNetworkReachabilityRef reachability = SCNetworkReachabilityCreateWithAddress(kCFAllocatorDefault, (struct sockaddr *)&zeroAddress);
    return reachability;
}

static NSString *hippyReachabilityTypeFromFlags(SCNetworkReachabilityFlags flags) {
    NSString *networkType = HippyNetworkTypeUnknown;
    if ((flags & kSCNetworkReachabilityFlagsReachable) == 0 || (flags & kSCNetworkReachabilityFlagsConnectionRequired) != 0) {
        networkType = HippNetworkCellTypeNone;
    } else if ((flags & kSCNetworkReachabilityFlagsIsWWAN) != 0) {
        networkType = HippyNetworkTypeCell;
    } else {
        networkType = HippyNetworkTypeWifi;
    }
    return networkType;
}

static NSString *currentReachabilityType(SCNetworkReachabilityRef reachabilityRef) {
    SCNetworkReachabilityFlags flags;
    BOOL success = SCNetworkReachabilityGetFlags(reachabilityRef, &flags);
    if (success) {
        NSString *type = hippyReachabilityTypeFromFlags(flags);
        return type ?: HippyNetworkTypeUnknown;
    } else {
        return HippyNetworkTypeUnknown;
    }
}

static void reachabilityCallback(__unused SCNetworkReachabilityRef target, SCNetworkReachabilityFlags flags, void *info) {
    HippyNetInfoIntenal *netinfo = (__bridge  HippyNetInfoIntenal *)info;
    NSString *networkType = hippyReachabilityTypeFromFlags(flags);
    NSString *cellType = hippyReachabilityGetCellType(netinfo->_cellNetType.currentRadioAccessTechnology);
    HippyNetworkTypeObject *obj = [[HippyNetworkTypeObject alloc] initWithNetworkType:networkType cellType:cellType];
    [netinfo notifyObserversNetworkTypeChanged:obj];
}

+ (instancetype)sharedInstance {
    return [[self alloc] init];
}

- (instancetype)init {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [super init];
        [instance setup];
    });
    return instance;
}

- (void)setup {
    _observers = [NSHashTable weakObjectsHashTable];
    _reachability = createReachabilityRefWithZeroAddress();
    _cellNetType = [[CTTelephonyNetworkInfo alloc] init];
    
    [self registerNetworkChangedListener];
    
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(radioAccessTechnologyDidChange:) name:CTRadioAccessTechnologyDidChangeNotification object:nil];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)radioAccessTechnologyDidChange:(NSNotification *)notification {
    HippyNetworkTypeObject *object = [self currentNetworkType];
    [self notifyObserversNetworkTypeChanged:object];
}

- (void)registerNetworkChangedListener {
    SCNetworkReachabilityContext context = { 0, (__bridge void *)self, NULL, NULL, NULL };
    SCNetworkReachabilitySetCallback(_reachability, reachabilityCallback, &context);
    SCNetworkReachabilityScheduleWithRunLoop(_reachability, CFRunLoopGetMain(), kCFRunLoopCommonModes);
}

- (HippyNetworkTypeObject *)addNetworkTypeChangeObserver:(id<HippyNetworkTypeChangedDelegate>)observer {
    HippyAssert([observer respondsToSelector:@selector(hippyNetworkTypeChanged:)], @"observer shoud conform HippyNetworkTypeChangedDelegate");
    if (observer) {
        [_observers addObject:observer];
    }
    return [self currentNetworkType];
}

- (void)removeNetworkTypeChangeObserver:(id<HippyNetworkTypeChangedDelegate>)observer {
    [_observers removeObject:observer];
}

- (HippyNetworkTypeObject *)currentNetworkType {
    NSString *networkType = currentReachabilityType(_reachability);
    NSString *cellType = hippyReachabilityGetCellType(_cellNetType.currentRadioAccessTechnology);
    HippyNetworkTypeObject *obj = [[HippyNetworkTypeObject alloc] initWithNetworkType:networkType cellType:cellType];
    return obj;
}

- (void)notifyObserversNetworkTypeChanged:(HippyNetworkTypeObject *)object {
    NSArray<id<HippyNetworkTypeChangedDelegate>> *observers = [_observers allObjects];
    for (id<HippyNetworkTypeChangedDelegate> observer in observers) {
        HippyAssert([observer respondsToSelector:@selector(hippyNetworkTypeChanged:)], @"observer shoud conform HippyNetworkTypeChangedDelegate");
        if ([observer respondsToSelector:@selector(hippyNetworkTypeChanged:)]) {
            [observer hippyNetworkTypeChanged:object];
        }
    }
}

@end
