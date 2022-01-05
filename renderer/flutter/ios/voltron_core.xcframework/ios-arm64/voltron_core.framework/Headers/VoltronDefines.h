//
//  VoltronJSCExecutor.h
//  RenderCore
//
//  Created by songshaohong on 2021/1/17.
//

#if __OBJC__
#  import <Foundation/Foundation.h>
#endif

/**
 * Make global functions usable in C++
 */
#if defined(__cplusplus)
#define VOLTRON_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define VOLTRON_EXTERN extern __attribute__((visibility("default")))
#endif

/**
 * The VOLTRON_DEBUG macro can be used to exclude error checking and logging code
 * from release builds to improve performance and reduce binary size.
 */
#ifndef VOLTRON_DEBUG
#ifdef DEBUG
#define VOLTRON_DEBUG 1
#else
#define VOLTRON_DEBUG 0
#endif
#endif

/**
 * The VOLTRON_DEV macro can be used to enable or disable development tools
 * such as the debug executors, dev menu, red box, etc.
 */
#ifndef VOLTRON_DEV
#ifdef DEBUG
#define VOLTRON_DEV 1
#else
#define VOLTRON_DEV 0
#endif
#endif

#if VOLTRON_DEV
#define VOLTRON_IF_DEV(...) __VA_ARGS__
#else
#define VOLTRON_IF_DEV(...)
#endif



#ifndef VOLTRON_PROFILE
#define VOLTRON_PROFILE VOLTRON_DEV
#endif

/**
 * By default, only raise an NSAssertion in debug mode
 * (custom assert functions will still be called).
 */
#ifndef VOLTRON_NSASSERT
#define VOLTRON_NSASSERT VOLTRON_DEBUG
#endif

/**
 * Concat two literals. Supports macro expansions,
 * e.g. VOLTRON_CONCAT(foo, __FILE__).
 */
#define VOLTRON_CONCAT2(A, B) A ## B
#define VOLTRON_CONCAT(A, B) VOLTRON_CONCAT2(A, B)
