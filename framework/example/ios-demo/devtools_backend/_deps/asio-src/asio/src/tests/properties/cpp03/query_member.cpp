//
// cpp03/query_member.cpp
// ~~~~~~~~~~~~~~~~~~~~~~
//
// Copyright (c) 2003-2022 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include "asio/query.hpp"
#include <cassert>

struct prop
{
};

struct object
{
  int query(prop) const { return 123; }
};

namespace asio {

template<>
struct is_applicable_property<object, prop>
{
  static const bool value = true;
};

namespace traits {

template<>
struct query_member<object, prop>
{
  static const bool is_valid = true;
  static const bool is_noexcept = true;
  typedef int result_type;
};

} // namespace traits
} // namespace asio

int main()
{
  object o1 = {};
  int result1 = asio::query(o1, prop());
  assert(result1 == 123);
  (void)result1;

  const object o2 = {};
  int result2 = asio::query(o2, prop());
  assert(result2 == 123);
  (void)result2;
}
