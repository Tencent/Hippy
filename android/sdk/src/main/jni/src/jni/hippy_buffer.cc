/*
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "jni/hippy_buffer.h"  // NOLINT(build/include_subdir)

union NumberDouble {
  double d;
  uint64_t l;
  int64_t i64;
};

/**
 * supported hippy-buffer data_ types
 * */
#define TYPE_NULL 0x00
#define TYPE_STRING 0x01
#define TYPE_BOOLEAN_TRUE 0x02
#define TYPE_BOOLEAN_FALSE 0x03
#define TYPE_INTEGER 0x04
#define TYPE_DOUBLE 0x05
#define TYPE_ARRAY 0x06
#define TYPE_MAP 0x07
#define TYPE_ONE_BYTE_STRING 0x08
#define TYPE_UNDEFINED 0xFF

#define DEFAULT_BUFFER_SIZE 2048

#define ENSURE_BUFFER_SIZE(size)                        \
  {                                                     \
    if ((buffer->length) < (buffer->position + size)) { \
      resizeBuffer(buffer, size);                       \
    }                                                   \
  }

static inline void resizeBuffer(HippyBuffer* buffer, uint32_t size) {
  if (size < buffer->length) {
    if (buffer->length < 1024 * 16) {
      size = 1024 * 16;
    } else {
      size = buffer->length;
    }
  } else {
    size += DEFAULT_BUFFER_SIZE;
  }
  size += buffer->length;
  buffer->data = realloc(buffer->data, size);
  buffer->length = size;
}

HippyBuffer* NewBuffer() {
  HippyBuffer* ptr = static_cast<HippyBuffer*>(malloc(sizeof(HippyBuffer)));
  ptr->data = malloc(sizeof(int8_t) * DEFAULT_BUFFER_SIZE);
  ptr->position = 0;
  ptr->length = DEFAULT_BUFFER_SIZE;
  return ptr;
}

inline void writeBytes(HippyBuffer* buffer, const void* src, int32_t length) {
  ENSURE_BUFFER_SIZE(length);
  void* dst = static_cast<uint8_t*>(buffer->data) + buffer->position;
  memcpy(dst, src, length);
  buffer->position += length;
}

inline void writeLong(HippyBuffer* buffer, uint64_t num) {
  ENSURE_BUFFER_SIZE(sizeof(uint64_t));
  uint8_t* data = static_cast<uint8_t*>(buffer->data) + buffer->position;
  data[7] = (uint8_t)(num & 0xFF);
  data[6] = (uint8_t)((num >> 8) & 0xFF);
  data[5] = (uint8_t)((num >> 16) & 0xFF);
  data[4] = (uint8_t)((num >> 24) & 0xFF);
  data[3] = (uint8_t)((num >> 32) & 0xFF);
  data[2] = (uint8_t)((num >> 40) & 0xFF);
  data[1] = (uint8_t)((num >> 48) & 0xFF);
  data[0] = (uint8_t)((num >> 56) & 0xFF);
  buffer->position += sizeof(uint64_t);
}

inline void writeUnsignedInt(HippyBuffer* buffer, uint32_t num) {
  ENSURE_BUFFER_SIZE(sizeof(uint32_t) + sizeof(uint8_t));
  uint8_t* data = static_cast<uint8_t*>(buffer->data) + buffer->position;
  int size = 0;
  do {
    data[size] = (uint8_t)((num & 0x7F) | 0x80);
    size++;
  } while ((num >>= 7) != 0);
  data[size - 1] &= 0x7F;
  buffer->position += size;
}

inline void writeBooleanType(HippyBuffer* buffer, uint8_t value) {
  ENSURE_BUFFER_SIZE(sizeof(uint8_t) + sizeof(uint8_t));
  uint8_t* data = static_cast<uint8_t*>(buffer->data) + buffer->position;
  if (value) {
    *data = TYPE_BOOLEAN_TRUE;
  } else {
    *data = TYPE_BOOLEAN_FALSE;
  }
  buffer->position += sizeof(uint8_t);
}

inline void writeIntegerType(HippyBuffer* buffer, int32_t num) {
  ENSURE_BUFFER_SIZE(sizeof(uint8_t));
  uint8_t* data = static_cast<uint8_t*>(buffer->data) + buffer->position;
  *data = TYPE_INTEGER;
  buffer->position += (sizeof(uint8_t));

  uint32_t unit32Value = (uint32_t)((num << 1) ^ (num >> 31));
  writeUnsignedInt(buffer, unit32Value);
}

inline void writeDoubleType(HippyBuffer* buffer, double num) {
  ENSURE_BUFFER_SIZE(sizeof(uint8_t));
  uint8_t* data = static_cast<uint8_t*>(buffer->data) + buffer->position;
  *data = TYPE_DOUBLE;
  buffer->position += (sizeof(uint8_t));

  union NumberDouble ld;
  ld.d = num;
  writeLong(buffer, ld.l);
}

inline void writeV8StringType(v8::Isolate* isolate,
                              HippyBuffer* buffer,
                              v8::Local<v8::String> localStr) {
  bool isOneByteString = localStr->IsOneByte();
  ENSURE_BUFFER_SIZE(sizeof(uint8_t));
  uint8_t* data = static_cast<uint8_t*>(buffer->data) + buffer->position;
  *data = (isOneByteString ? TYPE_ONE_BYTE_STRING : TYPE_STRING);
  buffer->position += (sizeof(uint8_t));

  if (isOneByteString) {
    uint32_t length = localStr->Length();
    writeUnsignedInt(buffer, length);

    ENSURE_BUFFER_SIZE(length);
    localStr->WriteOneByte(
        isolate, static_cast<uint8_t*>(buffer->data) + buffer->position, 0,
        length);
    buffer->position += length;
  } else {
    uint32_t length = localStr->Utf8Length(isolate);
    writeUnsignedInt(buffer, length);
    ENSURE_BUFFER_SIZE(length);
    localStr->WriteUtf8(
        isolate, static_cast<char*>(buffer->data) + buffer->position, length);
    buffer->position += length;
  }
}

inline void writeV8Property(v8::Isolate* isolate,
                            HippyBuffer* buffer,
                            v8::Local<v8::String> localStr) {
  if (localStr->IsOneByte()) {
    uint32_t length = localStr->Length();
    writeUnsignedInt(buffer, length);
    ENSURE_BUFFER_SIZE(length);
    uint8_t* strStartPtr =
        static_cast<uint8_t*>(buffer->data) + buffer->position;
    localStr->WriteOneByte(isolate, strStartPtr, 0, length);
    buffer->position += length;
  } else {
    uint32_t length = localStr->Utf8Length(isolate);
    writeUnsignedInt(buffer, length);
    ENSURE_BUFFER_SIZE(length);
    localStr->WriteUtf8(isolate, static_cast<char*>(buffer->data) + buffer->position,
                        length);
    buffer->position += length;
  }
}

inline void writeNullType(HippyBuffer* buffer) {
  ENSURE_BUFFER_SIZE(sizeof(uint8_t));
  uint8_t* data = static_cast<uint8_t*>(buffer->data) + buffer->position;
  *data = TYPE_NULL;
  buffer->position += (sizeof(uint8_t));
}

inline void writeUndefinedType(HippyBuffer* buffer) {
  ENSURE_BUFFER_SIZE(sizeof(uint8_t));
  uint8_t* data = static_cast<uint8_t*>(buffer->data) + buffer->position;
  *data = TYPE_UNDEFINED;
  buffer->position += (sizeof(uint8_t));
}

inline void writeMapType(HippyBuffer* buffer) {
  ENSURE_BUFFER_SIZE(sizeof(uint8_t));
  uint8_t* data = static_cast<uint8_t*>(buffer->data) + buffer->position;
  *data = TYPE_MAP;
  buffer->position += (sizeof(uint8_t));
}

inline void writeArrayType(HippyBuffer* buffer) {
  ENSURE_BUFFER_SIZE(sizeof(uint8_t));
  uint8_t* data = static_cast<uint8_t*>(buffer->data) + buffer->position;
  *data = TYPE_ARRAY;
  buffer->position += (sizeof(uint8_t));
}

inline bool hasNext(HippyBuffer* buffer) {
  return buffer->position < buffer->length;
}

inline int8_t readType(HippyBuffer* buffer) {
  int8_t* ptr = reinterpret_cast<int8_t*>(
      static_cast<uint8_t*>(buffer->data) + buffer->position);
  buffer->position += sizeof(int8_t);
  return *ptr;
}

inline bool readBoolean(HippyBuffer* buffer) {
  bool value = false;
  uint8_t* ptr = static_cast<uint8_t*>(buffer->data) + buffer->position;
  if (*ptr == 0x01) {
    value = true;
  }
  buffer->position += sizeof(uint8_t);
  return value;
}

inline uint32_t readUnsignedInt(HippyBuffer* buffer) {
  uint8_t* ptr = static_cast<uint8_t*>(buffer->data) + buffer->position;
  uint32_t num = *ptr;
  if ((num & 0x80) == 0) {
    buffer->position += 1;
    return num;
  }
  num &= 0x7F;
  uint8_t chunk = ptr[1];
  num |= (chunk & 0x7F) << 7;
  if ((chunk & 0x80) == 0) {
    buffer->position += 2;
    return num;
  }
  chunk = ptr[2];
  num |= (chunk & 0x7F) << 14;
  if ((chunk & 0x80) == 0) {
    buffer->position += 3;
    return num;
  }

  chunk = ptr[3];
  num |= (chunk & 0x7F) << 21;
  if ((chunk & 0x80) == 0) {
    buffer->position += 4;
    return num;
  }
  chunk = ptr[4];
  num |= (chunk & 0x0F) << 28;
  buffer->position += 5;
  return num;
}

inline int32_t readInteger(HippyBuffer* buffer) {
  uint32_t nextInt = readUnsignedInt(buffer);
  int32_t value = (int32_t)nextInt;
  return (-(value & 0x01)) ^ ((value >> 1) & ~(1 << 31));
}

inline int64_t readLong(HippyBuffer* buffer) {
  uint8_t* data = static_cast<uint8_t*>(buffer->data) + buffer->position;
  buffer->position += sizeof(uint64_t);
  return (((uint64_t)data[7]) & 0xFF) + ((((uint64_t)data[6]) & 0xFF) << 8) +
         ((((uint64_t)data[5]) & 0xFF) << 16) +
         ((((uint64_t)data[4]) & 0xFF) << 24) +
         ((((uint64_t)data[3]) & 0xFF) << 32) +
         ((((uint64_t)data[2]) & 0xFF) << 40) +
         ((((uint64_t)data[1]) & 0xFF) << 48) +
         ((((uint64_t)data[0]) & 0xFF) << 56);
}

double readDouble(HippyBuffer* buffer) {
  union NumberDouble ld;
  ld.l = readLong(buffer);
  return ld.d;
}

void ReleaseBuffer(HippyBuffer* buffer) {
  if (buffer == NULL) {
    return;
  }

  if (buffer->data) {
    free(buffer->data);
    buffer->data = NULL;
  }

  free(buffer);
  buffer = NULL;
}

static void xsonFuncCallback(v8::Isolate* isolate,
                             v8::Local<v8::Value> value,
                             v8::XSONValueType type,
                             void* data) {
  HippyBuffer* buffer = static_cast<HippyBuffer*>(data);

  if (type == v8::XSONValueType::kXSON_ARRAY_BEG) {
    writeArrayType(buffer);
  } else if (type == v8::XSONValueType::kXSON_ARRAY_LEN) {
    v8::Local<v8::Int32> size = v8::Local<v8::Int32>::Cast(value);
    writeUnsignedInt(buffer, size->Value());
  } else if (type == v8::XSONValueType::kXSON_OBJ_LEN) {
    v8::Local<v8::Int32> size = v8::Local<v8::Int32>::Cast(value);
    writeUnsignedInt(buffer, size->Value());
  } else if (type == v8::XSONValueType::kXSON_OBJ_BEG) {
    writeMapType(buffer);
  } else if (type == v8::XSONValueType::kXSON_PROPERTY) {
    writeV8Property(isolate, buffer, v8::Local<v8::String>::Cast(value));
  } else if (type == v8::XSONValueType::kXSON_STRING) {
    writeV8StringType(isolate, buffer, v8::Local<v8::String>::Cast(value));
  } else if (type == v8::XSONValueType::kXSON_INT) {
    v8::Local<v8::Int32> int32Value = v8::Local<v8::Int32>::Cast(value);
    writeIntegerType(buffer, int32Value->Value());
  } else if (type == v8::XSONValueType::kXSON_DOUBLE) {
    v8::Local<v8::Number> numberValue = v8::Local<v8::Number>::Cast(value);
    writeDoubleType(buffer, numberValue->Value());
  } else if (type == v8::XSONValueType::kXSON_BOOL_TRUE) {
    writeBooleanType(buffer, 1);
  } else if (type == v8::XSONValueType::kXSON_BOOL_FALSE) {
    writeBooleanType(buffer, 0);
  } else if (type == v8::XSONValueType::kXSON_NULL) {
    writeNullType(buffer);
  } else if (type == v8::XSONValueType::kXSON_UNDEFINED) {
    writeUndefinedType(buffer);
  }
}

void BuildBuffer(v8::Isolate* v8_isolate,
                 v8::Local<v8::Object> object,
                 HippyBuffer* buffer) {
  v8::SerializeXSONCallback callback =
      v8::SerializeXSONCallback(xsonFuncCallback, buffer);
  v8::XSON::Stringify(v8_isolate, object, callback);
}
