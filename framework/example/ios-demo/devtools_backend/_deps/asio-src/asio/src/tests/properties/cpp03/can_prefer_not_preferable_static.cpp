//
// cpp03/can_prefer_not_preferable_static.cpp
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Copyright (c) 2003-2022 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include "asio/prefer.hpp"
#include <cassert>

template <int>
struct prop
{
  static const bool is_preferable = false;
};

template <int>
struct object
{
};

namespace asio {

template<int N, int M>
struct is_applicable_property<object<N>, prop<M> >
{
  static const bool value = true;
};

namespace traits {

template<int N>
struct static_require<object<N>, prop<N> >
{
  static const bool is_valid = true;
};

} // namespace traits
} // namespace asio

int main()
{
  assert((!asio::can_prefer<object<1>, prop<1> >::value));
  assert((!asio::can_prefer<object<1>, prop<1>, prop<1> >::value));
  assert((!asio::can_prefer<object<1>, prop<1>, prop<1>, prop<1> >::value));
  assert((!asio::can_prefer<const object<1>, prop<1> >::value));
  assert((!asio::can_prefer<const object<1>, prop<1>, prop<1> >::value));
  assert((!asio::can_prefer<const object<1>, prop<1>, prop<1>, prop<1> >::value));
}
