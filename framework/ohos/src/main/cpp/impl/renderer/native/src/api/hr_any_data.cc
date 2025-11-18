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

#include "renderer/api/hr_any_data.h"
#include "renderer/api_internal/hr_any_data_internal.h"

using HippyValueArrayType = footstone::HippyValue::HippyValueArrayType;

#ifdef __cplusplus
extern "C" {
#endif

bool HRAnyDataIsString(HRAnyData data) {
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return false;
  }
  return internal->anyValue->IsString();
}

bool HRAnyDataIsInt(HRAnyData data) {
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return false;
  }
  return internal->anyValue->IsInt32();
}

bool HRAnyDataIsUint(HRAnyData data) {
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return false;
  }
  return internal->anyValue->IsUInt32();
}

bool HRAnyDataIsDouble(HRAnyData data) {
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return false;
  }
  return internal->anyValue->IsDouble();
}

bool HRAnyDataIsBool(HRAnyData data) {
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return false;
  }
  return internal->anyValue->IsBoolean();
}

bool HRAnyDataIsArray(HRAnyData data) {
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return false;
  }
  return internal->anyValue->IsArray();
}

const char *HRAnyDataGetString(HRAnyData data) {
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr || !internal->anyValue->IsString()) {
    return nullptr;
  }
  return internal->anyValue->ToStringChecked().c_str();
}

int HRAnyDataGetInt(HRAnyData data, int32_t* value) {
  if (value == nullptr) {
    return HR_ANY_DATA_NULL_OUTPUT;
  }
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  if (!internal->anyValue->IsInt32()) {
    return HR_ANY_DATA_TYPE_MISMATCH;
  }
  *value = internal->anyValue->ToInt32Checked();
  return HR_ANY_DATA_SUCCESS;
}

int HRAnyDataGetUint(HRAnyData data, uint32_t* value) {
  if (value == nullptr) {
    return HR_ANY_DATA_NULL_OUTPUT;
  }
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  if (!internal->anyValue->IsUInt32()) {
    return HR_ANY_DATA_TYPE_MISMATCH;
  }
  *value = internal->anyValue->ToUint32Checked();
  return HR_ANY_DATA_SUCCESS;
}

int HRAnyDataGetDouble(HRAnyData data, double* value) {
  if (value == nullptr) {
    return HR_ANY_DATA_NULL_OUTPUT;
  }
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  if (!internal->anyValue->IsDouble()) {
    return HR_ANY_DATA_TYPE_MISMATCH;
  }
  *value = internal->anyValue->ToDoubleChecked();
  return HR_ANY_DATA_SUCCESS;
}

int HRAnyDataGetBool(HRAnyData data, bool* value) {
  if (value == nullptr) {
    return HR_ANY_DATA_NULL_OUTPUT;
  }
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  if (!internal->anyValue->IsBoolean()) {
    return HR_ANY_DATA_TYPE_MISMATCH;
  }
  *value = internal->anyValue->ToBooleanChecked();
  return HR_ANY_DATA_SUCCESS;
}

int HRAnyDataGetBytes(HRAnyData data, const char** value, int *size) {
  if (value == nullptr) {
    return HR_ANY_DATA_NULL_OUTPUT;
  }
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  if (!internal->anyValue->IsString()) {
    return HR_ANY_DATA_TYPE_MISMATCH;
  }
  auto& str = internal->anyValue->ToStringChecked();
  *value = str.data();
  *size = (int)str.size(); 
  return 0;
}

int HRAnyDataGetStr(HRAnyData data, const char** value) {
  if (value == nullptr) {
    return HR_ANY_DATA_NULL_OUTPUT;
  }
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  if (!internal->anyValue->IsString()) {
    return HR_ANY_DATA_TYPE_MISMATCH;
  }
  auto& str = internal->anyValue->ToStringChecked();
  *value = str.c_str();
  return HR_ANY_DATA_SUCCESS;
}

int HRAnyDataGetArraySize(HRAnyData data, int* size) {
  if (size == nullptr) {
    return HR_ANY_DATA_NULL_OUTPUT;
  }
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  if (!internal->anyValue->IsArray()) {
    return HR_ANY_DATA_TYPE_MISMATCH;
  }
  *size = (int)internal->anyValue->ToArrayChecked().size();
  return HR_ANY_DATA_SUCCESS;
}

int HRAnyDataGetArrayElement(HRAnyData data, HRAnyData* value, int index) {
  if (value == nullptr) {
    return HR_ANY_DATA_NULL_OUTPUT;
  }
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  if (!internal->anyValue->IsArray()) {
    return HR_ANY_DATA_TYPE_MISMATCH;
  }
  auto& array = internal->anyValue->ToArrayChecked();
  if (index >= (int)array.size()) {
    return HR_ANY_DATA_OUT_OF_INDEX;
  }
  internal->arrayElementData = std::make_shared<HRAnyDataInternal>();
  internal->arrayElementData->anyValue = std::make_shared<HippyValue>(array[(size_t)index]);
  *value = internal->arrayElementData.get();
  return HR_ANY_DATA_SUCCESS;
}

HRAnyData HRAnyDataCreate() {
  auto value = new HRAnyDataInternal();
  return value;
}

void HRAnyDataDestroy(HRAnyData data) {
  if (data == nullptr) {
    return;
  }
  delete (HRAnyDataInternal*)data;
}

HRAnyData HRAnyDataCreateInt(int32_t value) {
  auto data = new HRAnyDataInternal();
  data->anyValue = std::make_shared<HippyValue>(value);
  return data;
}

HRAnyData HRAnyDataCreateUint(uint32_t value) {
  auto data = new HRAnyDataInternal();
  data->anyValue = std::make_shared<HippyValue>(value);
  return data;
}

HRAnyData HRAnyDataCreateDouble(double value) {
  auto data = new HRAnyDataInternal();
  data->anyValue = std::make_shared<HippyValue>(value);
  return data;
}

HRAnyData HRAnyDataCreateBool(bool value) {
  auto data = new HRAnyDataInternal();
  data->anyValue = std::make_shared<HippyValue>(value);
  return data;
}

HRAnyData HRAnyDataCreateString(const char* value) {
  auto data = new HRAnyDataInternal();
  data->anyValue = std::make_shared<HippyValue>(value);
  return data;
}

HRAnyData HRAnyDataCreateBytes(const char* value, int size) {
  auto data = new HRAnyDataInternal();
  data->anyValue = std::make_shared<HippyValue>(value, size);
  return data;
}

HRAnyData HRAnyDataCreateArray(int size) {
  auto data = new HRAnyDataInternal();
  HippyValueArrayType valueArray;
  valueArray.reserve((size_t)size);
  data->anyValue = std::make_shared<HippyValue>(valueArray);
  return data;
}

int HRAnyDataSetArrayElement(HRAnyData data, HRAnyData value, int index) {
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  struct HRAnyDataInternal *valueInternal = (struct HRAnyDataInternal *)value;
  if (valueInternal == nullptr || valueInternal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  if (!internal->anyValue->IsArray()) {
    return HR_ANY_DATA_TYPE_MISMATCH;
  }

  auto &array = internal->anyValue->ToArrayChecked();
  if (index >= (int)array.size()) {
    return HR_ANY_DATA_OUT_OF_INDEX;
  }
  array[(size_t)index] = *valueInternal->anyValue;

  return HR_ANY_DATA_SUCCESS;
}

int HRAnyDataAddArrayElement(HRAnyData data, HRAnyData value) {
  struct HRAnyDataInternal *internal = (struct HRAnyDataInternal *)data;
  if (internal == nullptr || internal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  struct HRAnyDataInternal *valueInternal = (struct HRAnyDataInternal *)value;
  if (valueInternal == nullptr || valueInternal->anyValue == nullptr) {
    return HR_ANY_DATA_NULL_INPUT;
  }
  if (!internal->anyValue->IsArray()) {
    return HR_ANY_DATA_TYPE_MISMATCH;
  }

  auto &array = internal->anyValue->ToArrayChecked();
  array.push_back(*valueInternal->anyValue);

  return HR_ANY_DATA_SUCCESS;
}

#ifdef __cplusplus
}
#endif