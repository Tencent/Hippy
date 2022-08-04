//
// cpp03/can_require_unsupported.cpp
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Copyright (c) 2003-2022 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include "asio/require.hpp"
#include <cassert>

template <int>
struct prop
{
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

} // namespace asio

int main()
{
  assert((!asio::can_require<object<1>, prop<2> >::value));
  assert((!asio::can_require<object<1>, prop<2>, prop<3> >::value));
  assert((!asio::can_require<object<1>, prop<2>, prop<3>, prop<4> >::value));
  assert((!asio::can_require<const object<1>, prop<2> >::value));
  assert((!asio::can_require<const object<1>, prop<2>, prop<3> >::value));
  assert((!asio::can_require<const object<1>, prop<2>, prop<3>, prop<4> >::value));
}
