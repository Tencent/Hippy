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

#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * 向C暴露的数据对象handle。
 */
typedef void *HRAnyData;

/**
 * 检测是否是一个字符串
 * @param data 输入的对象
 */
bool HRAnyDataIsString(HRAnyData data);

/**
 * 检测是否是一个Int
 * @param data 输入的对象
 * @return
 */
bool HRAnyDataIsInt(HRAnyData data);

/**
 * 检测是否是一个Uint
 * @param data 输入的对象
 */
bool HRAnyDataIsUint(HRAnyData data);

/**
 * 检测是否是一个Double
 * @param data 输入的对象
 */
bool HRAnyDataIsDouble(HRAnyData data);

/**
 * 检测是否是一个Bool
 * @param data 输入的对象
 */
bool HRAnyDataIsBool(HRAnyData data);

/**
 * 检测是否是一个Array
 * @param data 输入的对象
 */
bool HRAnyDataIsArray(HRAnyData data);

/**
 * 返回字符串内容
 * @param data
 * @return 字符串指针，仅当前scope有效，请勿转移指针，如有需要请拷贝字符串内容。
 */
const char *HRAnyDataGetString(HRAnyData data);

/**
 * @brief HRAnyData错误码
 */
typedef enum {
  HR_ANY_DATA_SUCCESS = 0,        // 成功
  HR_ANY_DATA_NULL_INPUT = 1,     // 输入参数为 nullptr
  HR_ANY_DATA_NULL_OUTPUT = 2,    // 接收参数为 nullptr
  HR_ANY_DATA_OUT_OF_INDEX = 3,   // 索引越界
  HR_ANY_DATA_TYPE_MISMATCH = 4,  // 类型不匹配
} HRAnyDataErrorCode;

/**
 * @brief 从 HRAnyData 获取 int32_t 值
 * @param data 输入数据
 * @param value 输出参数，存储获取的整数值
 * @return HRAnyDataErrorCode
 */
int HRAnyDataGetInt(HRAnyData data, int32_t* value);

/**
 * @brief 从 HRAnyData 中提取 uint32_t 值
 * @param data 输入数据句柄，类型为 HRAnyData
 * @param value 输出参数指针，用于存储提取的长整数值（uint32_t 类型）
 * @return HRAnyDataErrorCode
 */
int HRAnyDataGetUint(HRAnyData data, uint32_t* value);

/**
 * @brief 从 HRAnyData 中提取 double 值
 * @param data 输入数据句柄，类型为 HRAnyData
 * @param value 输出参数指针，用于存储提取的浮点值（double 类型）
 * @return HRAnyDataErrorCode
 * @note 若数据为双精度浮点型（double）会自动进行精度转换
 */
int HRAnyDataGetDouble(HRAnyData data, double* value);

/**
 * @brief 从 HRAnyData 中提取 bool 值
 * @param data 输入数据句柄，类型为 HRAnyData
 * @param value 输出参数指针，用于存储提取的布尔值（bool 类型）
 * @return HRAnyDataErrorCode
 */
int HRAnyDataGetBool(HRAnyData data, bool* value);

/**
 * @brief 从 HRAnyData 中提取 二进制 值
 * @param data 输入数据句柄，类型为 HRAnyData
 * @param value 用于接收二进制数据的地址
 * @param size 用于接收二进制数据的长度
 * @return HRAnyDataErrorCode
 */
int HRAnyDataGetBytes(HRAnyData data, const char** value, int *size);

/**
 * @brief 从 HRAnyData 中提取 二进制 值
 * @param data 输入数据句柄，类型为 HRAnyData
 * @param value 用于接收字符串数据地址
 * @return HRAnyDataErrorCode
 */
int HRAnyDataGetStr(HRAnyData data, const char** value);

/**
 * @brief 从 HRAnyData 中提取其中数组指定的元素
 * @param data 输入数据句柄，类型为 HRAnyData
 * @param value 输出参数指针，存储提取的元素句柄，仅当前scope有效，如有需要请提取里面的内容。
 * @param index 元素索引（从0开始）
 * @return HRAnyDataErrorCode
 */
int HRAnyDataGetArrayElement(HRAnyData data, HRAnyData* value, int index);

/**
 * @brief 从 HRAnyData 中提取其中数组长度
 * @param data 输入数据句柄，类型为 HRAnyData
 * @param size 输出参数，存储数组的长度
 * @return HRAnyDataErrorCode
 */
int HRAnyDataGetArraySize(HRAnyData data, int* size);

/**
 * @brief 创建一个新的 HRAnyData 值为 null 类型
 * @return HRAnyData
 */
HRAnyData HRAnyDataCreate();

/**
 * @brief 创建一个新的 HRAnyData 值为 int32_t 类型
 * @param value 设置的 int32_t 值
 * @return HRAnyData
 */
HRAnyData HRAnyDataCreateInt(int32_t value);

/**
 * @brief 创建一个新的 HRAnyData 值为 uint32_t 类型
 * @param value 设置的 uint32_t 值
 * @return HRAnyData
 */
HRAnyData HRAnyDataCreateUint(uint32_t value);

/**
 * @brief 创建一个新的 HRAnyData 值为 double 类型
 * @param value 设置的 double 值
 * @return HRAnyData
 */
HRAnyData HRAnyDataCreateDouble(double value);

/**
 * @brief 创建一个新的 HRAnyData 值为 bool 类型
 * @param value 设置的 bool 值
 * @return HRAnyData
 */
HRAnyData HRAnyDataCreateBool(bool value);

/**
 * @brief 创建一个新的 HRAnyData 值为 char* 类型
 * @param value 设置的 字符串 值
 * @return HRAnyData
 */
HRAnyData HRAnyDataCreateString(const char* value);

/**
 * @brief 创建一个新的 HRAnyData 值为 char* 类型
 * @param value 设置的 二进制 值
 * @param size 二进制数据的长度
 * @return HRAnyData
 */
HRAnyData HRAnyDataCreateBytes(const char* value, int size);

/**
 * @brief 创建一个新的 HRAnyData 值为 Array 类型
 * @param size 设置的数组长度
 * @return HRAnyData
 */
HRAnyData HRAnyDataCreateArray(int size);

/**
 * @brief 设置 HRAnyData 数组中指定位置的元素值
 * @param data 输入数据句柄，类型为 HRAnyData
 * @param value 要设置的 HRAnyData 元素
 * @param index 要设置元素的索引位置
 * @return HRAnyDataErrorCode
 */
int HRAnyDataSetArrayElement(HRAnyData data, HRAnyData value, int index);

/**
 * @brief 给 HRAnyData 数组中添加元素
 * @param data 输入数据句柄，类型为 HRAnyData
 * @param value 要添加的 HRAnyData 元素
 * @return HRAnyDataErrorCode
 */
int HRAnyDataAddArrayElement(HRAnyData data, HRAnyData value);

/**
 * @brief 销毁 HRAnyData 对象
 */
void HRAnyDataDestroy(HRAnyData data);

#ifdef __cplusplus
}
#endif
