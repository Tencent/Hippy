//
// post.hpp
// ~~~~~~~~
//
// Copyright (c) 2003-2021 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#ifndef ASIO_POST_HPP
#define ASIO_POST_HPP

#if defined(_MSC_VER) && (_MSC_VER >= 1200)
# pragma once
#endif // defined(_MSC_VER) && (_MSC_VER >= 1200)

#include "asio/detail/config.hpp"
#include "asio/async_result.hpp"
#include "asio/detail/type_traits.hpp"
#include "asio/execution_context.hpp"
#include "asio/execution/executor.hpp"
#include "asio/is_executor.hpp"

#include "asio/detail/push_options.hpp"

namespace asio {

/// Submits a completion token or function object for execution.
/**
 * This function submits an object for execution using the object's associated
 * executor. The function object is queued for execution, and is never called
 * from the current thread prior to returning from <tt>post()</tt>.
 *
 * The use of @c post(), rather than @ref defer(), indicates the caller's
 * preference that the function object be eagerly queued for execution.
 *
 * This function has the following effects:
 *
 * @li Constructs a function object handler of type @c Handler, initialized
 * with <tt>handler(forward<CompletionToken>(token))</tt>.
 *
 * @li Constructs an object @c result of type <tt>async_result<Handler></tt>,
 * initializing the object as <tt>result(handler)</tt>.
 *
 * @li Obtains the handler's associated executor object @c ex by performing
 * <tt>get_associated_executor(handler)</tt>.
 *
 * @li Obtains the handler's associated allocator object @c alloc by performing
 * <tt>get_associated_allocator(handler)</tt>.
 *
 * @li Performs <tt>ex.post(std::move(handler), alloc)</tt>.
 *
 * @li Returns <tt>result.get()</tt>.
 */
template <ASIO_COMPLETION_TOKEN_FOR(void()) CompletionToken>
ASIO_INITFN_AUTO_RESULT_TYPE(CompletionToken, void()) post(
    ASIO_MOVE_ARG(CompletionToken) token);

/// Submits a completion token or function object for execution.
/**
 * This function submits an object for execution using the specified executor.
 * The function object is queued for execution, and is never called from the
 * current thread prior to returning from <tt>post()</tt>.
 *
 * The use of @c post(), rather than @ref defer(), indicates the caller's
 * preference that the function object be eagerly queued for execution.
 *
 * This function has the following effects:
 *
 * @li Constructs a function object handler of type @c Handler, initialized
 * with <tt>handler(forward<CompletionToken>(token))</tt>.
 *
 * @li Constructs an object @c result of type <tt>async_result<Handler></tt>,
 * initializing the object as <tt>result(handler)</tt>.
 *
 * @li Obtains the handler's associated executor object @c ex1 by performing
 * <tt>get_associated_executor(handler)</tt>.
 *
 * @li Creates a work object @c w by performing <tt>make_work(ex1)</tt>.
 *
 * @li Obtains the handler's associated allocator object @c alloc by performing
 * <tt>get_associated_allocator(handler)</tt>.
 *
 * @li Constructs a function object @c f with a function call operator that
 * performs <tt>ex1.dispatch(std::move(handler), alloc)</tt> followed by
 * <tt>w.reset()</tt>.
 *
 * @li Performs <tt>Executor(ex).post(std::move(f), alloc)</tt>.
 *
 * @li Returns <tt>result.get()</tt>.
 */
template <typename Executor,
    ASIO_COMPLETION_TOKEN_FOR(void()) CompletionToken
      ASIO_DEFAULT_COMPLETION_TOKEN_TYPE(Executor)>
ASIO_INITFN_AUTO_RESULT_TYPE(CompletionToken, void()) post(
    const Executor& ex,
    ASIO_MOVE_ARG(CompletionToken) token
      ASIO_DEFAULT_COMPLETION_TOKEN(Executor),
    typename constraint<
      execution::is_executor<Executor>::value || is_executor<Executor>::value
    >::type = 0);

/// Submits a completion token or function object for execution.
/**
 * @returns <tt>post(ctx.get_executor(), forward<CompletionToken>(token))</tt>.
 */
template <typename ExecutionContext,
    ASIO_COMPLETION_TOKEN_FOR(void()) CompletionToken
      ASIO_DEFAULT_COMPLETION_TOKEN_TYPE(
        typename ExecutionContext::executor_type)>
ASIO_INITFN_AUTO_RESULT_TYPE(CompletionToken, void()) post(
    ExecutionContext& ctx,
    ASIO_MOVE_ARG(CompletionToken) token
      ASIO_DEFAULT_COMPLETION_TOKEN(
        typename ExecutionContext::executor_type),
    typename constraint<is_convertible<
      ExecutionContext&, execution_context&>::value>::type = 0);

} // namespace asio

#include "asio/detail/pop_options.hpp"

#include "asio/impl/post.hpp"

#endif // ASIO_POST_HPP
