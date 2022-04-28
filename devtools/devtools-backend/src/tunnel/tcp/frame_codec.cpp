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

#include "tunnel/tcp/frame_codec.h"

#include <cstdio>
#include <cstdlib>

#include <algorithm>

namespace hippy::devtools {
constexpr int32_t kHeaderSize = sizeof(Header);
constexpr int32_t kMaxDataSize = 200 * 1024 * 1024;

#pragma mark - encode
void FrameCodec::Encode(void *data, int32_t len, uint8_t flag) {
  if (!encode_callback_) {
    return;
  }
  if (len > kMaxDataSize) {
    return;
  }
  auto *header = reinterpret_cast<Header *>(malloc(sizeof(struct Header)));
  header->flag = flag;
  header->body_length = htonl(len);
  int32_t data_len = len + kHeaderSize;
  void *frame = malloc(static_cast<size_t>(len + kHeaderSize));
  memcpy(frame, header, kHeaderSize);
  free(header);
  memcpy(reinterpret_cast<char *>(frame) + kHeaderSize, data, len);
  encode_callback_(frame, data_len);
  free(frame);
}

#pragma mark - decode
void FrameCodec::Decode(void *data, int32_t len) {
  if (len <= 0) {
    return;
  }
  int32_t stream_buffer_len = stream_buffer_.size();
  while ( stream_buffer_len + len >= kHeaderSize) {
    // header不完整需要拼接
    if ( stream_buffer_len > 0 &&  stream_buffer_len < kHeaderSize) {
      int split_len = kHeaderSize -  stream_buffer_len;
      stream_buffer_.insert(stream_buffer_.end(), reinterpret_cast<char *>(data),
                            reinterpret_cast<char *>(data) + split_len);

      len -= split_len;
      data = reinterpret_cast<char *>(data) + split_len;
    }
    // 解析头部，判断数据是否可提取
    struct Header *header;
    if (stream_buffer_.empty()) {
      header = (struct Header *)data;
    } else {
      char *temp = &stream_buffer_[0];
      header = (struct Header *)temp;
    }
    int32_t total_len = header->GetBodySize() + kHeaderSize;
    if (stream_buffer_.size() + len < total_len) {
      break;
    }
    // 提取完整数据
    int32_t split_len = total_len - stream_buffer_.size();
    stream_buffer_.insert(stream_buffer_.end(), reinterpret_cast<char *>(data),
                          reinterpret_cast<char *>(data) + split_len);
    if (decode_callback_) {
      int32_t header_body_size = header->GetBodySize();
      char *temp = &stream_buffer_[kHeaderSize];
      decode_callback_(temp, header_body_size, header->flag);
    }
    stream_buffer_.clear();

    // 剩余数据
    len -= split_len;
    data = reinterpret_cast<char *>(data) + split_len;
  }
  // 缓存数据
  if (len > 0) {
    stream_buffer_.insert(stream_buffer_.end(), reinterpret_cast<char *>(data), reinterpret_cast<char *>(data) + len);
  }
}
}  // namespace hippy::devtools
