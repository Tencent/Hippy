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

#pragma once

#include <endian.h>
#include <netinet/in.h>
#include <functional>
#include <vector>

namespace hippy::devtools {
constexpr uint32_t kTunnelBufferSize = 32 * 1024;
/*
 *  header
 *  ---------------------------------------------------
 *   Flag  | Length  |      Frame Body    |
 *  ---------------------------------------------------
 *   8bit    32bit
 *
 */
#pragma pack(push, 1)
struct alignas(1) Header {
  uint8_t flag;
  int32_t body_length;
  int32_t GetBodySize() { return static_cast<int32_t>(ntohl(body_length)); }
};
#pragma pack(pop)

class FrameCodec {
 public:
  FrameCodec() { stream_buffer_.reserve(kTunnelBufferSize); }
  ~FrameCodec() { stream_buffer_.clear(); }
  FrameCodec& operator=(const FrameCodec& rhs) {
    encode_callback_ = rhs.encode_callback_;
    decode_callback_ = rhs.decode_callback_;
    stream_buffer_ = rhs.stream_buffer_;
    return *this;
  }
  void Encode(void *data, int32_t len, uint8_t flag);
  void Decode(void *data, int32_t len);
  inline void SetEncodeCallback(std::function<void(void *, int32_t)> callback) { encode_callback_ = callback; }
  inline void SetDecodeCallback(std::function<void(void *, int32_t, uint8_t)> callback) { decode_callback_ = callback; }

 private:
  std::function<void(void *, int32_t)> encode_callback_;
  std::function<void(void *, int32_t, uint8_t)> decode_callback_;
  std::vector<char> stream_buffer_ = std::vector<char>();
};
}  // namespace hippy::devtools
