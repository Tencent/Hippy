//
// deferred_4.cpp
// ~~~~~~~~~~~~~~
//
// Copyright (c) 2003-2022 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <asio.hpp>
#include <asio/experimental/deferred.hpp>
#include <iostream>

using asio::experimental::deferred;

template <typename CompletionToken>
auto async_wait_twice(asio::steady_timer& timer, CompletionToken&& token)
{
  return timer.async_wait(
      deferred(
        [&](std::error_code ec)
        {
          std::cout << "first timer wait finished: " << ec.message() << "\n";
          timer.expires_after(std::chrono::seconds(1));
          return timer.async_wait(deferred);
        }
      )
    )(
      deferred(
        [&](std::error_code ec)
        {
          std::cout << "second timer wait finished: " << ec.message() << "\n";
          return deferred.values(42);
        }
      )
    )(
      std::forward<CompletionToken>(token)
    );
}

int main()
{
  asio::io_context ctx;

  asio::steady_timer timer(ctx);
  timer.expires_after(std::chrono::seconds(1));

  async_wait_twice(
      timer,
      [](int result)
      {
        std::cout << "result is " << result << "\n";
      }
    );

  ctx.run();

  return 0;
}
