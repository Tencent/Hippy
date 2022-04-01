//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//


#pragma once

#include <functional>
#include <vector>

namespace tdf::tunnel {

#define FLAG_FRAME_END 1

/*
 *  header
 *  ---------------------------------------------------
 *   Flag  | Length  |      Frame Body    |
 *  ---------------------------------------------------
 *   8bit    32bit
 *
 */
#define TUNNELBUFFSIZ 32768
struct Header {
  uint8_t flag;
  uint8_t body_length[4];

  int bodySize() {
    uint32_t value =
        body_length[3] | (body_length[2] << 8) | (body_length[1] << 16)
            | (body_length[0] << 24);
    return value;
  }
};

class StreamHandler {
 public:
  StreamHandler() { streamBuffer_.reserve(TUNNELBUFFSIZ); }

  ~StreamHandler() { streamBuffer_.clear(); }

  void handlerSendStream(void *data, int32_t len, int flag);
  void handleRecvStream(void *data, int32_t len);
  std::function<void(void *, int)> _onSendStreamResult;
  std::function<void(void *, int, int)> _onRecvStreamResult;

 private:
  std::vector<char> streamBuffer_ = std::vector<char>();
};
}  // namespace tdf::tunnel
