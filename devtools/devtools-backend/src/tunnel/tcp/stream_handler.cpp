//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "tunnel/tcp/stream_handler.h"

#include <stdio.h>
#include <stdlib.h>

#include <algorithm>

//  #include "foundation/logger.h"

namespace tdf::tunnel {
static const int header_size_ = 5;
static const int max_data_size_ = 200 * 1024 * 1024;

#pragma mark - send
void StreamHandler::handlerSendStream(void *data, int32_t len, int flag) {
  if (!_onSendStreamResult) {
    return;
  }
  if (len > max_data_size_) {
    //            LOGI("AppChannel", "send data > 200M");
    return;
  }
  //        LOGI("AppChannel", "send data len:%d", len);

  struct Header
      *header = reinterpret_cast<Header *>(malloc(sizeof(struct Header)));
  header->flag = flag;
  header->body_length[0] = len >> 24;
  header->body_length[1] = (len >> 16) & 0xFF;
  header->body_length[2] = (len >> 8) & 0xFF;
  header->body_length[3] = len & 0xFF;

  int32_t data_len = len + header_size_;
  void *frame = malloc(len + header_size_);
  memcpy(frame, header, header_size_);
  free(header);
  memcpy(reinterpret_cast<char *>(frame) + header_size_, data, len);

  _onSendStreamResult(frame, data_len);
  free(frame);
}

#pragma mark - recv
void StreamHandler::handleRecvStream(void *stream, int32_t len) {
  // log(channel, DEBUG, "recv data len:%d", len);

  if (len <= 0) {
    return;
  }

  int streamBuferrLen = streamBuffer_.size();
  while (streamBuferrLen + len >= header_size_) {
    // header不完整需要拼接
    if (streamBuferrLen > 0 && streamBuferrLen < header_size_) {
      int split_len = header_size_ - streamBuferrLen;
      streamBuffer_.insert(streamBuffer_.end(),
                           reinterpret_cast<char *>(stream),
                           reinterpret_cast<char *>(stream) + split_len);

      len -= split_len;
      stream = reinterpret_cast<char *>(stream) + split_len;
    }

    // 解析头部，判断数据是否可提取
    struct Header *header = nullptr;
    if (streamBuffer_.size() == 0) {
      header = (struct Header *) stream;
    } else {
      char *temp = &streamBuffer_[0];
      header = (struct Header *) temp;
    }

    int32_t total_len = header->bodySize() + header_size_;
    if (streamBuffer_.size() + len < total_len) {
      break;
    }

    // 提取完整数据
    int32_t split_len = total_len - streamBuffer_.size();
    streamBuffer_.insert(streamBuffer_.end(),
                         reinterpret_cast<char *>(stream),
                         reinterpret_cast<char *>(stream) + split_len);
    if (_onRecvStreamResult) {
      int32_t header_body_size = header->bodySize();
      char *temp = &streamBuffer_[header_size_];
      _onRecvStreamResult(temp, header_body_size, header->flag);
    }
    streamBuffer_.clear();

    // 剩余数据
    len -= split_len;
    stream = reinterpret_cast<char *>(stream) + split_len;
  }
  // 缓存数据
  if (len > 0) {
    streamBuffer_.insert(streamBuffer_.end(),
                         reinterpret_cast<char *>(stream),
                         reinterpret_cast<char *>(stream) + len);
  }
}
}  // namespace tdf::tunnel
