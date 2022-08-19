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

#import "NSObject+V8Value.h"
#import "HippyAssert.h"

@implementation NSObject (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context {
    HippyAssert(isolate, @"ios must not be null for object convert");
#ifdef DEBUG
    BOOL isRightType = [self isKindOfClass:[NSArray class]] ||
                        [self isKindOfClass:[NSDictionary class]] ||
                        [self isKindOfClass:[NSData class]] ||
                        [self isKindOfClass:[NSString class]] ||
                        [self isKindOfClass:[NSNumber class]];
    HippyAssert(isRightType, @"toV8ValueInIsolate is not supported by %@ class", NSStringFromClass([self class]));
#endif
    v8::Local<v8::Object> object = v8::Object::New(isolate);
    return object;
}

@end

@implementation NSArray (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context {
    HippyAssert(isolate, @"ios must not be null for array convert");
    size_t count = [self count];
    v8::Local<v8::Value> elements[count];
    for (size_t i = 0; i < count; i++) {
        id obj = [self objectAtIndex:i];
        elements[i] = [obj toV8ValueInIsolate:isolate context:context];
    }
    return v8::Array::New(isolate, elements, count);
}

@end

@implementation NSDictionary (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context {
    HippyAssert(isolate, @"ios must not be null for dictionary convert");
    v8::Local<v8::Object> object = v8::Object::New(isolate);
    for (id key in self) {
        id value = [self objectForKey:key];
        v8::Local<v8::Value> v8Key = [key toV8ValueInIsolate:isolate context:context];
        v8::Local<v8::Value> v8Value = [value toV8ValueInIsolate:isolate context:context];
        object->Set(context, v8Key, v8Value).FromMaybe(false);
    }
    return object;
}

@end

@implementation NSData (V8Value)

#if V8_MAJOR_VERSION >= 9
static void ArrayBufferDataDeleter(void* data, size_t length, void* deleter_data) {
  free(data);
}
#endif //V8_MAJOR_VERSION >= 9

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context {
    HippyAssert(isolate, @"ios must not be null for data convert");
    const void *buffer = [self bytes];
    size_t length = [self length];
  #if V8_MAJOR_VERSION < 9
    v8::Local<v8::ArrayBuffer> array_buffer = v8::ArrayBuffer::New(isolate, buffer, length, v8::ArrayBufferCreationMode::kInternalized);
  #else
    auto backingStore = v8::ArrayBuffer::NewBackingStore(const_cast<void*>(buffer), length, ArrayBufferDataDeleter,
                                                         nullptr);
    v8::Local<v8::ArrayBuffer> array_buffer = v8::ArrayBuffer::New(isolate, std::move(backingStore));
  #endif //V8_MAJOR_VERSION >= 9
    return array_buffer;
}

@end

@implementation NSString (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context {
    return [self toV8StringInIsolate:isolate];
}

- (v8::Local<v8::String>)toV8StringInIsolate:(v8::Isolate *)isolate {
    HippyAssert(isolate, @"ios must not be null for string convert");
    const char *p = [self UTF8String]?:"";
    v8::MaybeLocal<v8::String> string = v8::String::NewFromUtf8(isolate, p);
    return string.ToLocalChecked();
}

@end

@implementation NSNumber (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context {
    HippyAssert(isolate, @"ios must not be null for number convert");
    v8::Local<v8::Value> number = v8::Number::New(isolate, [self doubleValue]);
    return number;
}

@end

@implementation NSNull (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context {
    return v8::Undefined(isolate);
}

@end

static id ObjectFromV8MaybeValue(v8::MaybeLocal<v8::Value> maybeValue, v8::Isolate *isolate, v8::Local<v8::Context> context) {
    if (maybeValue.IsEmpty()) {
        return nil;
    }
    return ObjectFromV8Value(maybeValue.ToLocalChecked(), isolate, context);
}

id ObjectFromV8Value(v8::Local<v8::Value> value, v8::Isolate *isolate, v8::Local<v8::Context> context) {
    if (value->IsUndefined()) {
        return [NSNull null];
    }
    else if (value->IsNull()) {
        return nil;
    }
    else if (value->IsString()) {
        HippyAssert(isolate, @"isolate must not be null for string value");
        v8::Local<v8::String> string = value.As<v8::String>();
        int len = string->Length();
        if (string->IsOneByte()) {
            void *buffer = malloc(len);
            string->WriteOneByte(isolate, reinterpret_cast<uint8_t *>(buffer));
            NSString *result = [[NSString alloc] initWithBytesNoCopy:buffer length:len encoding:NSUTF8StringEncoding freeWhenDone:YES];
            return result;
        }
        else {
            void *buffer = malloc(len * 2);
            string->Write(isolate, reinterpret_cast<uint16_t *>(buffer));
            NSString *result = [[NSString alloc] initWithBytesNoCopy:buffer length:len * 2 encoding:NSUTF16LittleEndianStringEncoding freeWhenDone:YES];
            return result;
        }
    }
    else if (value->IsStringObject()) {
        HippyAssert(isolate, @"isolate must not be null for string value");
        v8::Local<v8::StringObject> stringObj = value.As<v8::StringObject>();
        return ObjectFromV8Value(stringObj->ValueOf(), isolate, context);
    }
    else if (value->IsBoolean()) {
        v8::Local<v8::Boolean> b = value.As<v8::Boolean>();
        return @(b->Value());
    }
    else if (value->IsBooleanObject()) {
        v8::Local<v8::BooleanObject> b = value.As<v8::BooleanObject>();
        return @(b->ValueOf());
    }
    else if (value->IsMap()) {
        v8::Local<v8::Map> map = value.As<v8::Map>();
        v8::Local<v8::Array> array = map->AsArray();
        uint32_t length = array->Length();
        NSMutableDictionary *dicMap = [NSMutableDictionary dictionaryWithCapacity:length];
        for (uint32_t i = 0; i < length; i+=2) {
            NSString *objKey = ObjectFromV8MaybeValue(array->Get(context, i), isolate, context);
            id objValue = ObjectFromV8MaybeValue(array->Get(context, i + 1), isolate, context);
            if (objKey && objValue) {
                [dicMap setObject:objKey forKey:objValue];
            }
        }
        return [dicMap copy];
    }
    else if (value->IsArray()) {
        v8::Local<v8::Array> array = value.As<v8::Array>();
        uint32_t length = array->Length();
        NSMutableArray *objArray = [NSMutableArray arrayWithCapacity:length];
        for (uint32_t i = 0; i < length; i++) {
            id objValue = ObjectFromV8MaybeValue(array->Get(context, i), isolate, context);
            if (objValue) {
                [objArray addObject:objValue];
            }
        }
        return [objArray copy];
    }
    else if (value->IsSet()) {
        v8::Local<v8::Array> array = value.As<v8::Set>()->AsArray();
        return ObjectFromV8Value(array, isolate, context);
    }
    else if (value->IsNumber()) {
        return @(value->ToNumber(context).ToLocalChecked()->Value());
    }
    else if (value->IsInt32()) {
        return @(value->ToInt32(context).ToLocalChecked()->Value());
    }
    else if (value->IsArrayBuffer()) {
        v8::Local<v8::ArrayBuffer> arrayBuffer = value.As<v8::ArrayBuffer>();
        const void *data = nullptr;
        size_t length = 0;
#if V8_MAJOR_VERSION < 9
        data = arrayBuffer->GetContents().Data();
        length = arrayBuffer->ByteLength();
#else
        data = arrayBuffer->GetBackingStore()->Data();
        length = arrayBuffer->ByteLength();
#endif //V8_MAJOR_VERSION < 9
        return [NSData dataWithBytes:data length:length];
    }
    else if (value->IsObject()) {
        v8::Local<v8::Object> object = value.As<v8::Object>();
        v8::MaybeLocal<v8::Array> maybeProps = object->GetOwnPropertyNames(context);
        //GetPropertyNames(context);
        if (maybeProps.IsEmpty()) {
            return [NSDictionary dictionary];
        }
        v8::Local<v8::Array> props = maybeProps.ToLocalChecked();
        uint32_t length = props->Length();
        NSMutableDictionary *keysValues = [NSMutableDictionary dictionaryWithCapacity:length];
        for (uint32_t i = 0; i < length; i++) {
            v8::Local<v8::Value> key = props->Get(context, i).ToLocalChecked();
            HippyAssert(key->IsString(), @"ObjectFromV8Value only supports keys as string");
            if (!key->IsString()) {
                continue;
            }
            NSString *objKey = ObjectFromV8Value(key, isolate, context);
            id objValue = ObjectFromV8MaybeValue(object->Get(context, key), isolate, context);
            if (objKey && objValue) {
                [keysValues setObject:objValue forKey:objKey];
            }
        }
        return [keysValues copy];
    }

    else {
#ifdef DEBUG
        HippyAssert(NO, @"no implementation ObjectFromV8Value for type %@", ObjectFromV8Value(value->TypeOf(isolate), isolate, context));
#endif
        return nil;
    }
}

NSString *TryToFetchStringFromV8Value(v8::Local<v8::Value> value, v8::Isolate *isolate) {
    if (value.IsEmpty()) {
        return nil;
    }
    v8::String::Utf8Value u8String(isolate, value);
    return [NSString stringWithUTF8String:*u8String];
}
