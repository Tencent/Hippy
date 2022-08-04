//
// set_error.cpp
// ~~~~~~~~~~~~~
//
// Copyright (c) 2003-2022 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

// Disable autolinking for unit tests.
#if !defined(BOOST_ALL_NO_LIB)
#define BOOST_ALL_NO_LIB 1
#endif // !defined(BOOST_ALL_NO_LIB)

// Test that header file is self-contained.
#include "asio/execution/set_error.hpp"

#include "asio/error_code.hpp"
#include "../unit_test.hpp"

namespace exec = asio::execution;

static int call_count = 0;

struct no_set_error
{
};

struct const_member_set_error
{
  template <typename E>
  void set_error(ASIO_MOVE_ARG(E) e) const ASIO_NOEXCEPT
  {
    typename asio::decay<E>::type tmp(ASIO_MOVE_CAST(E)(e));
    (void)tmp;
    ++call_count;
  }
};

#if !defined(ASIO_HAS_DEDUCED_SET_ERROR_MEMBER_TRAIT)

namespace asio {
namespace traits {

template <typename E>
struct set_error_member<const const_member_set_error, E>
{
  ASIO_STATIC_CONSTEXPR(bool, is_valid = true);
  ASIO_STATIC_CONSTEXPR(bool, is_noexcept = true);
  typedef void result_type;
};

} // namespace traits
} // namespace asio

#endif // !defined(ASIO_HAS_DEDUCED_SET_ERROR_MEMBER_TRAIT)

struct free_set_error_const_receiver
{
  template <typename E>
  friend void set_error(const free_set_error_const_receiver&,
      ASIO_MOVE_ARG(E) e) ASIO_NOEXCEPT
  {
    typename asio::decay<E>::type tmp(ASIO_MOVE_CAST(E)(e));
    (void)tmp;
    ++call_count;
  }
};

#if !defined(ASIO_HAS_DEDUCED_SET_ERROR_FREE_TRAIT)

namespace asio {
namespace traits {

template <typename E>
struct set_error_free<const free_set_error_const_receiver, E>
{
  ASIO_STATIC_CONSTEXPR(bool, is_valid = true);
  ASIO_STATIC_CONSTEXPR(bool, is_noexcept = true);
  typedef void result_type;
};

} // namespace traits
} // namespace asio

#endif // !defined(ASIO_HAS_DEDUCED_SET_ERROR_FREE_TRAIT)

struct non_const_member_set_error
{
  template <typename E>
  void set_error(ASIO_MOVE_ARG(E) e) ASIO_NOEXCEPT
  {
    typename asio::decay<E>::type tmp(ASIO_MOVE_CAST(E)(e));
    (void)tmp;
    ++call_count;
  }
};

#if !defined(ASIO_HAS_DEDUCED_SET_ERROR_MEMBER_TRAIT)

namespace asio {
namespace traits {

template <typename E>
struct set_error_member<non_const_member_set_error, E>
{
  ASIO_STATIC_CONSTEXPR(bool, is_valid = true);
  ASIO_STATIC_CONSTEXPR(bool, is_noexcept = true);
  typedef void result_type;
};

} // namespace traits
} // namespace asio

#endif // !defined(ASIO_HAS_DEDUCED_SET_ERROR_MEMBER_TRAIT)

struct free_set_error_non_const_receiver
{
  template <typename E>
  friend void set_error(free_set_error_non_const_receiver&,
      ASIO_MOVE_ARG(E) e) ASIO_NOEXCEPT
  {
    typename asio::decay<E>::type tmp(ASIO_MOVE_CAST(E)(e));
    (void)tmp;
    ++call_count;
  }
};

#if !defined(ASIO_HAS_DEDUCED_SET_ERROR_FREE_TRAIT)

namespace asio {
namespace traits {

template <typename E>
struct set_error_free<free_set_error_non_const_receiver, E>
{
  ASIO_STATIC_CONSTEXPR(bool, is_valid = true);
  ASIO_STATIC_CONSTEXPR(bool, is_noexcept = true);
  typedef void result_type;
};

} // namespace traits
} // namespace asio

#endif // !defined(ASIO_HAS_DEDUCED_SET_ERROR_FREE_TRAIT)

void test_can_set_error()
{
  ASIO_CONSTEXPR bool b1 = exec::can_set_error<
      no_set_error&, asio::error_code>::value;
  ASIO_CHECK(b1 == false);

  ASIO_CONSTEXPR bool b2 = exec::can_set_error<
      const no_set_error&, asio::error_code>::value;
  ASIO_CHECK(b2 == false);

  ASIO_CONSTEXPR bool b3 = exec::can_set_error<
      const_member_set_error&, asio::error_code>::value;
  ASIO_CHECK(b3 == true);

  ASIO_CONSTEXPR bool b4 = exec::can_set_error<
      const const_member_set_error&, asio::error_code>::value;
  ASIO_CHECK(b4 == true);

  ASIO_CONSTEXPR bool b5 = exec::can_set_error<
      free_set_error_const_receiver&, asio::error_code>::value;
  ASIO_CHECK(b5 == true);

  ASIO_CONSTEXPR bool b6 = exec::can_set_error<
      const free_set_error_const_receiver&, asio::error_code>::value;
  ASIO_CHECK(b6 == true);

  ASIO_CONSTEXPR bool b7 = exec::can_set_error<
      non_const_member_set_error&, asio::error_code>::value;
  ASIO_CHECK(b7 == true);

  ASIO_CONSTEXPR bool b8 = exec::can_set_error<
      const non_const_member_set_error&, asio::error_code>::value;
  ASIO_CHECK(b8 == false);

  ASIO_CONSTEXPR bool b9 = exec::can_set_error<
      free_set_error_non_const_receiver&, asio::error_code>::value;
  ASIO_CHECK(b9 == true);

  ASIO_CONSTEXPR bool b10 = exec::can_set_error<
      const free_set_error_non_const_receiver&, asio::error_code>::value;
  ASIO_CHECK(b10 == false);
}

void increment(int* count)
{
  ++(*count);
}

void test_set_error()
{
  asio::error_code ec;

  call_count = 0;
  const_member_set_error ex1 = {};
  exec::set_error(ex1, ec);
  ASIO_CHECK(call_count == 1);

  call_count = 0;
  const const_member_set_error ex2 = {};
  exec::set_error(ex2, ec);
  ASIO_CHECK(call_count == 1);

  call_count = 0;
  exec::set_error(const_member_set_error(), ec);
  ASIO_CHECK(call_count == 1);

  call_count = 0;
  free_set_error_const_receiver ex3 = {};
  exec::set_error(ex3, ec);
  ASIO_CHECK(call_count == 1);

  call_count = 0;
  const free_set_error_const_receiver ex4 = {};
  exec::set_error(ex4, ec);
  ASIO_CHECK(call_count == 1);

  call_count = 0;
  exec::set_error(free_set_error_const_receiver(), ec);
  ASIO_CHECK(call_count == 1);

  call_count = 0;
  non_const_member_set_error ex5 = {};
  exec::set_error(ex5, ec);
  ASIO_CHECK(call_count == 1);

  call_count = 0;
  free_set_error_non_const_receiver ex6 = {};
  exec::set_error(ex6, ec);
  ASIO_CHECK(call_count == 1);
}

ASIO_TEST_SUITE
(
  "set_error",
  ASIO_TEST_CASE(test_can_set_error)
  ASIO_TEST_CASE(test_set_error)
)
