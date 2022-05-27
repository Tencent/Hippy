/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#include "devtools_base/common/base64.h"
namespace hippy::devtools {
std::string Base64::Encode(const uint8_t *bin, const size_t len) {
  static constexpr char kEncodingTable[] = {
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
      'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
      's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'};

  size_t out_len = 4 * ((len + 2) / 3);
  std::string ret(out_len, '\0');
  size_t i;
  size_t out_idx = 0;
  for (i = 0; i < len - 2; i += 3) {
    ret[out_idx++] = kEncodingTable[(bin[i] >> 2) & 0x3F];
    ret[out_idx++] = kEncodingTable[((bin[i] & 0x3) << 4) | (static_cast<int>(bin[i + 1] & 0xF0) >> 4)];
    ret[out_idx++] = kEncodingTable[((bin[i + 1] & 0xF) << 2) | (static_cast<int>(bin[i + 2] & 0xC0) >> 6)];
    ret[out_idx++] = kEncodingTable[bin[i + 2] & 0x3F];
  }
  if (i < len) {
    ret[out_idx++] = kEncodingTable[(bin[i] >> 2) & 0x3F];
    if (i == (len - 1)) {
      ret[out_idx++] = kEncodingTable[((bin[i] & 0x3) << 4)];
      ret[out_idx++] = '=';
    } else {
      ret[out_idx++] = kEncodingTable[((bin[i] & 0x3) << 4) | (static_cast<int>(bin[i + 1] & 0xF0) >> 4)];
      ret[out_idx++] = kEncodingTable[((bin[i + 1] & 0xF) << 2)];
    }
    ret[out_idx] = '=';
  }
  return ret;
}

std::string Base64::Decode(const std::string &input) {
  static constexpr unsigned char kDecodingTable[] = {
      64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
      64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 62, 64, 64, 64, 63, 52, 53, 54, 55,
      56, 57, 58, 59, 60, 61, 64, 64, 64, 64, 64, 64, 64, 0,  1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12,
      13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 64, 64, 64, 64, 64, 64, 26, 27, 28, 29, 30, 31, 32,
      33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 64, 64, 64, 64, 64, 64, 64,
      64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
      64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
      64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
      64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
      64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64};

  size_t in_len = input.size();
  if (in_len % 4 != 0) {
    return "";
  }
  size_t out_len = in_len / 4 * 3;
  if (input[in_len - 1] == '=') out_len--;
  if (input[in_len - 2] == '=') out_len--;
  std::string out;
  out.resize(out_len);
  for (size_t i = 0, j = 0; i < in_len;) {
    uint32_t a = input[i] == '=' ? 0 & i++ : kDecodingTable[static_cast<int>(input[i++])];
    uint32_t b = input[i] == '=' ? 0 & i++ : kDecodingTable[static_cast<int>(input[i++])];
    uint32_t c = input[i] == '=' ? 0 & i++ : kDecodingTable[static_cast<int>(input[i++])];
    uint32_t d = input[i] == '=' ? 0 & i++ : kDecodingTable[static_cast<int>(input[i++])];
    uint32_t triple = (a << 3 * 6) + (b << 2 * 6) + (c << 1 * 6) + (d << 0 * 6);
    if (j < out_len) out[j++] = (triple >> 2 * 8) & 0xFF;
    if (j < out_len) out[j++] = (triple >> 1 * 8) & 0xFF;
    if (j < out_len) out[j++] = (triple >> 0 * 8) & 0xFF;
  }
  return out;
}
}  // namespace hippy

