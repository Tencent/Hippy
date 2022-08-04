//
// blocking_token_tcp_client.cpp
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Copyright (c) 2003-2022 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include "asio/connect.hpp"
#include "asio/io_context.hpp"
#include "asio/ip/tcp.hpp"
#include "asio/read_until.hpp"
#include "asio/streambuf.hpp"
#include "asio/system_error.hpp"
#include "asio/write.hpp"
#include <cstdlib>
#include <iostream>
#include <memory>
#include <string>

using asio::ip::tcp;

// We will use our sockets only with an io_context.
typedef asio::basic_stream_socket<tcp,
    asio::io_context::executor_type> tcp_socket;

//----------------------------------------------------------------------

// A custom completion token that makes asynchronous operations behave as
// though they are blocking calls with a timeout.
struct close_after
{
  close_after(asio::chrono::steady_clock::duration t, tcp_socket& s)
    : timeout_(t), socket_(s)
  {
  }

  // The maximum time to wait for an asynchronous operation to complete.
  asio::chrono::steady_clock::duration timeout_;

  // The socket to be closed if the operation does not complete in time.
  tcp_socket& socket_;
};

namespace asio {

// The async_result template is specialised to allow the close_after token to
// be used with asynchronous operations that have a completion signature of
// void(error_code, T). Generalising this for all completion signature forms is
// left as an exercise for the reader.
template <typename T>
class async_result<close_after, void(asio::error_code, T)>
{
public:
  // An asynchronous operation's initiating function automatically creates an
  // completion_handler_type object from the token. This function object is
  // then called on completion of the asynchronous operation.
  class completion_handler_type
  {
  public:
    completion_handler_type(const close_after& token)
      : token_(token)
    {
    }

    void operator()(asio::error_code ec, T t)
    {
      *ec_ = ec;
      *t_ = t;
    }

  private:
    friend class async_result;
    close_after token_;
    asio::error_code* ec_;
    T* t_;
  };

  // The async_result constructor associates the completion handler object with
  // the result of the initiating function.
  explicit async_result(completion_handler_type& h)
    : timeout_(h.token_.timeout_),
      socket_(h.token_.socket_)
  {
    h.ec_ = &ec_;
    h.t_ = &t_;
  }

  // The return_type typedef determines the result type of the asynchronous
  // operation's initiating function.
  typedef T return_type;

  // The get() function is used to obtain the result of the asynchronous
  // operation's initiating function. For the close_after completion token, we
  // use this function to run the io_context until the operation is complete.
  return_type get()
  {
    asio::io_context& io_context = asio::query(
        socket_.get_executor(), asio::execution::context);

    // Restart the io_context, as it may have been left in the "stopped" state
    // by a previous operation.
    io_context.restart();

    // Block until the asynchronous operation has completed, or timed out. If
    // the pending asynchronous operation is a composed operation, the deadline
    // applies to the entire operation, rather than individual operations on
    // the socket.
    io_context.run_for(timeout_);

    // If the asynchronous operation completed successfully then the io_context
    // would have been stopped due to running out of work. If it was not
    // stopped, then the io_context::run_for call must have timed out and the
    // operation is still incomplete.
    if (!io_context.stopped())
    {
      // Close the socket to cancel the outstanding asynchronous operation.
      socket_.close();

      // Run the io_context again until the operation completes.
      io_context.run();
    }

    // If the operation failed, throw an exception. Otherwise return the result.
    return ec_ ? throw asio::system_error(ec_) : t_;
  }

private:
  asio::chrono::steady_clock::duration timeout_;
  tcp_socket& socket_;
  asio::error_code ec_;
  T t_;
};

} // namespace asio

//----------------------------------------------------------------------

int main(int argc, char* argv[])
{
  try
  {
    if (argc != 4)
    {
      std::cerr << "Usage: blocking_tcp_client <host> <port> <message>\n";
      return 1;
    }

    asio::io_context io_context;

    // Resolve the host name and service to a list of endpoints.
    tcp::resolver::results_type endpoints =
      tcp::resolver(io_context).resolve(argv[1], argv[2]);

    tcp_socket socket(io_context);

    // Run an asynchronous connect operation with a timeout.
    asio::async_connect(socket, endpoints,
        close_after(asio::chrono::seconds(10), socket));

    asio::chrono::steady_clock::time_point time_sent =
      asio::chrono::steady_clock::now();

    // Run an asynchronous write operation with a timeout.
    std::string msg = argv[3] + std::string("\n");
    asio::async_write(socket, asio::buffer(msg),
        close_after(asio::chrono::seconds(10), socket));

    for (std::string input_buffer;;)
    {
      // Run an asynchronous read operation with a timeout.
      std::size_t n = asio::async_read_until(socket,
          asio::dynamic_buffer(input_buffer), '\n',
          close_after(asio::chrono::seconds(10), socket));

      std::string line(input_buffer.substr(0, n - 1));
      input_buffer.erase(0, n);

      // Keep going until we get back the line that was sent.
      if (line == argv[3])
        break;
    }

    asio::chrono::steady_clock::time_point time_received =
      asio::chrono::steady_clock::now();

    std::cout << "Round trip time: ";
    std::cout << asio::chrono::duration_cast<
      asio::chrono::microseconds>(
        time_received - time_sent).count();
    std::cout << " microseconds\n";
  }
  catch (std::exception& e)
  {
    std::cerr << "Exception: " << e.what() << "\n";
  }

  return 0;
}
