#ifndef HIPPY_BUFFER_H_
#define HIPPY_BUFFER_H_

#include <stdio.h>
#include "third_party/v8/v8.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct HippyBuffer {
  void* data;
  uint32_t position;
  uint32_t length;
} HippyBuffer;

HippyBuffer* newBuffer(void);
void releaseBuffer(HippyBuffer* buffer);
void buildBuffer(v8::Isolate* v8_isolate,
                 v8::Local<v8::Object> object,
                 HippyBuffer* buffer);

#ifdef __cplusplus
}
#endif

#endif  // HIPPY_BUFFER_H_
