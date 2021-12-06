//
//  VoltronUtils.h
//  RenderCore
//
//  Created by sshsong on 7/5/2021.
//

#import <Foundation/Foundation.h>
#import "VoltronDefines.h"
#import <JavaScriptCore/JavaScriptCore.h>
#import "VoltronJSCWrapper.h"

/**
 * The default error domain to be used for Hippy errors.
 */
VOLTRON_EXTERN NSString *const VoltronErrorDomain;
VOLTRON_EXTERN NSString *const VoltronJSStackTraceKey;

VOLTRON_EXTERN id __nullable VoltronJSONParse(NSString *__nullable jsonString, NSError **error);
VOLTRON_EXTERN id __nullable VoltronJSONParseMutable(NSString *__nullable jsonString, NSError **error);

VOLTRON_EXTERN void VoltronExecuteOnMainQueue(dispatch_block_t block);
VOLTRON_EXTERN BOOL VoltronIsMainQueue(void);

VOLTRON_EXTERN NSError *VoltronErrorWithMessage(NSString *message);
VOLTRON_EXTERN NSError *VoltronNSErrorFromJSError(JSValue *exception);
VOLTRON_EXTERN NSError *VoltronNSErrorFromJSErrorRef(JSValueRef exception, JSGlobalContextRef ctx);

// Convert nil values to NSNull, and vice-versa
#define VoltronNullIfNil(value) (value ?: (id)kCFNull)
#define VoltronNilIfNull(value) (value == (id)kCFNull ? nil : value)

NS_ASSUME_NONNULL_BEGIN

@interface VoltronUtils : NSObject

@end

NS_ASSUME_NONNULL_END
