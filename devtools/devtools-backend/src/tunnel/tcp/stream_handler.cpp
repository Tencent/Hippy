//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "tunnel/tcp/stream_handler.h"

#include <stdio.h>
#include <stdlib.h>

#include <algorithm>

namespace tdf::tunnel {
constexpr int32_t kHeaderSize = 5;
constexpr int32_t kMaxDataSize = 200 * 1024 * 1024;

#pragma mark - send
void StreamHandler::HandleSendStream(void *data, int32_t len, int flag) {
  if (!send_stream_callback_) {
    return;
  }
  if (len > kMaxDataSize) {
    return;
  }

  struct Header *header = reinterpret_cast<Header *>(malloc(sizeof(struct Header)));
  header->flag = flag;
  header->body_length[0] = len >> 24;
  header->body_length[1] = (len >> 16) & 0xFF;
  header->body_length[2] = (len >> 8) & 0xFF;
  header->body_length[3] = len & 0xFF;

  int32_t data_len = len + kHeaderSize;
  void *frame = malloc(len + kHeaderSize);
  memcpy(frame, header, kHeaderSize);
  free(header);
  memcpy(reinterpret_cast<char *>(frame) + kHeaderSize, data, len);

  send_stream_callback_(frame, data_len);
  free(frame);
}

#pragma mark - recv
void StreamHandler::HandleReceiveStream(void *data, int32_t len) {
  // log(channel, DEBUG, "recv data len:%d", len);
  if (len <= 0) {
    return;
  }
  int streamBuferrLen = stream_buffer_.size();
  while (streamBuferrLen + len >= kHeaderSize) {
    // header不完整需要拼接
    if (streamBuferrLen > 0 && streamBuferrLen < kHeaderSize) {
      int split_len = kHeaderSize - streamBuferrLen;
      stream_buffer_.insert(stream_buffer_.end(), reinterpret_cast<char *>(data),
                            reinterpret_cast<char *>(data) + split_len);

      len -= split_len;
      data = reinterpret_cast<char *>(data) + split_len;
    }

    // 解析头部，判断数据是否可提取
    struct Header *header = nullptr;
    if (stream_buffer_.size() == 0) {
      header = (struct Header *)data;
    } else {
      char *temp = &stream_buffer_[0];
      header = (struct Header *)temp;
    }

    int32_t total_len = header->bodySize() + kHeaderSize;
    if (stream_buffer_.size() + len < total_len) {
      break;
    }

    // 提取完整数据
    int32_t split_len = total_len - stream_buffer_.size();
    stream_buffer_.insert(stream_buffer_.end(), reinterpret_cast<char *>(data),
                          reinterpret_cast<char *>(data) + split_len);
    if (receive_stream_callback_) {
      int32_t header_body_size = header->bodySize();
      char *temp = &stream_buffer_[kHeaderSize];
      receive_stream_callback_(temp, header_body_size, header->flag);
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
}  // namespace tdf::tunnel
