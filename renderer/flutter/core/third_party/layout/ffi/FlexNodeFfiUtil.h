//
// Created by longquan on 2020/9/2.
//

#ifndef ANDROID_DEMO_LAYOUT_FFI_FLEXNODEFFIUTIL_H_
#define ANDROID_DEMO_LAYOUT_FFI_FLEXNODEFFIUTIL_H_

#if defined(_WIN32)
// 标识可以对外导出
#define FLEX_EXPORT __declspec(dllexport)
// 标识方法外部有调用
#define FLEX_USED
#else
// 标识可以对外导出
#define FLEX_EXPORT __attribute__((visibility("default")))
// 标识方法外部有调用
#define FLEX_USED __attribute__((used))
#endif

#define USE_TAITANK


#endif //ANDROID_DEMO_LAYOUT_FFI_FLEXNODEFFIUTIL_H_
