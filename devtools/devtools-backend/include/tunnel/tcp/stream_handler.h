//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <functional>
#include <vector>

namespace tdf::tunnel {
constexpr uint32_t kTunnelBufferSize = 32768;
/*
 *  header
 *  ---------------------------------------------------
 *   Flag  | Length  |      Frame Body    |
 *  ---------------------------------------------------
 *   8bit    32bit
 *
 */
struct Header {
  uint8_t flag;
  uint8_t body_length[4];

  int bodySize() {
    uint32_t value = body_length[3] | (body_length[2] << 8) | (body_length[1] << 16) | (body_length[0] << 24);
    return value;
  }
};

class StreamHandler {
 public:
  StreamHandler() { stream_buffer_.reserve(kTunnelBufferSize); }
  ~StreamHandler() { stream_buffer_.clear(); }
  void HandleSendStream(void *data, int32_t len, int32_t flag);
  void HandleReceiveStream(void *data, int32_t len);
  std::function<void(void *, int32_t)> on_send_stream_callback_;
  std::function<void(void *, int32_t, int32_t)> on_receive_stream_callback_;

 private:
  std::vector<char> stream_buffer_ = std::vector<char>();
};
}  // namespace tdf::tunnel
