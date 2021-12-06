//
//  common_header.h
//  RenderCore
//
//  Created by sshsong on 11/1/2021.
//

#ifndef common_header_h
#define common_header_h

#if defined(_WIN32)
#define EXTERN_C extern "C" __declspec(dllexport)
#define EXPORT __declspec(dllexport)
#else
#define EXTERN_C extern "C" __attribute__((visibility("default"))) __attribute__((used))
#define EXPORT __attribute__((visibility("default")))
#endif

#ifdef __APPLE__
#include <memory>
#include <functional>
#include <utility>
#endif


#endif /* common_header_h */
