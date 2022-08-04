/*
 * Copyright (c) 2014, Peter Thorson. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the WebSocket++ Project nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL PETER THORSON BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

#ifndef WEBSOCKETPP_SERVER_ENDPOINT_HPP
#define WEBSOCKETPP_SERVER_ENDPOINT_HPP

#include <websocketpp/endpoint.hpp>

#include <websocketpp/logger/levels.hpp>

#include <websocketpp/common/system_error.hpp>

namespace websocketpp {

/// Server endpoint role based on the given config
/**
 *
 */
template <typename config>
class server : public endpoint<connection<config>,config> {
public:
    /// Type of this endpoint
    typedef server<config> type;

    /// Type of the endpoint concurrency component
    typedef typename config::concurrency_type concurrency_type;
    /// Type of the endpoint transport component
    typedef typename config::transport_type transport_type;

    /// Type of the connections this server will create
    typedef connection<config> connection_type;
    /// Type of a shared pointer to the connections this server will create
    typedef typename connection_type::ptr connection_ptr;

    /// Type of the connection transport component
    typedef typename transport_type::transport_con_type transport_con_type;
    /// Type of a shared pointer to the connection transport component
    typedef typename transport_con_type::ptr transport_con_ptr;

    /// Type of the endpoint component of this server
    typedef endpoint<connection_type,config> endpoint_type;

    /// The type and signature of the callback passed to the start_accept method
    typedef lib::function<void(lib::error_code const &, lib::error_code const &)> accept_loop_handler;

    friend class connection<config>;

    explicit server() : endpoint_type(true)
    {
        endpoint_type::m_alog->write(log::alevel::devel, "server constructor");
    }

    /// Destructor
    ~server() {}

#ifdef _WEBSOCKETPP_DEFAULT_DELETE_FUNCTIONS_
    // no copy constructor because endpoints are not copyable
    server(server<config> &) = delete;

    // no copy assignment operator because endpoints are not copyable
    server<config> & operator=(server<config> const &) = delete;
#endif // _WEBSOCKETPP_DEFAULT_DELETE_FUNCTIONS_

#ifdef _WEBSOCKETPP_MOVE_SEMANTICS_
    /// Move constructor
    server(server<config> && o) : endpoint<connection<config>,config>(std::move(o)) {}

#ifdef _WEBSOCKETPP_DEFAULT_DELETE_FUNCTIONS_
    // no move assignment operator because of const member variables
    server<config> & operator=(server<config> &&) = delete;
#endif // _WEBSOCKETPP_DEFAULT_DELETE_FUNCTIONS_

#endif // _WEBSOCKETPP_MOVE_SEMANTICS_

    /// Create and initialize a new connection
    /**
     * The connection will be initialized and ready to begin. Call its start()
     * method to begin the processing loop.
     *
     * Note: The connection must either be started or terminated using
     * connection::terminate in order to avoid memory leaks.
     *
     * @deprecated 0.9.0 use `get_connection(lib::error_code &)` instead.
     * 
     * @see `get_connection(lib::error_code &)` for an alternative that
     * returns a detailed error code on failure.
     * 
     * @return A pointer to the new connection.
     */
    connection_ptr get_connection() {
        lib::error_code ec;
        return endpoint_type::create_connection(ec);
    }

    /// Create and initialize a new connection
    /**
     * The connection will be initialized and ready to begin. Call its start()
     * method to begin the processing loop.
     *
     * Note: The connection must either be started or terminated using
     * connection::terminate in order to avoid memory leaks.
     *
     * @since 0.9.0
     * 
     * @param [out] ec A status code that indicates why the failure occurred
     *        if the returned pointer is blank.
     * @return A pointer to the new connection.
     */
    connection_ptr get_connection(lib::error_code & ec) {
        return endpoint_type::create_connection(ec);
    }

    /// Starts the server's async connection acceptance loop (exception free)
    /**
     * Initiates the server connection acceptance loop. Must be called after
     * listen. This method will have no effect until the underlying io_service
     * starts running. It may be called after the io_service is already running.
     *
     * Refer to documentation for the transport policy you are using for
     * instructions on how to stop this acceptance loop.
     * 
     * Error handling:
     * start_accept will return an error via the `ec` parameter if there is a 
     * problem starting the accept loop. Once successfully started the loop will
     * continue to renew itself after each connection. This method has no way of
     * delivering that happen after the loop is started. Use 
     * `start_accept(accept_loop_handler)` instead to get full error information
     * no matter when the async loop ends.
     *
     * @deprecated use `start_accept(accept_loop_handler) instead
     * 
     * @param [out] ec A status code indicating an error, if any.
     */
    void start_accept(lib::error_code & ec) {
        if (!transport_type::is_listening()) {
            ec = error::make_error_code(error::async_accept_not_listening);
            return;
        }
        
        ec = lib::error_code();
        connection_ptr con = get_connection(ec);

        if (!con) {
          ec = error::make_error_code(error::con_creation_failed);
          return;
        }

        transport_type::async_accept(
            lib::static_pointer_cast<transport_con_type>(con),
            lib::bind(&type::handle_accept_legacy,this,con,lib::placeholders::_1),
            ec
        );

        if (ec && con) {
            // If the connection was constructed but the accept failed,
            // terminate the connection to prevent memory leaks
            con->terminate(lib::error_code());
        }
    }

    /// Starts the server's async connection acceptance loop (exception free)
    /**
     * Initiates the server connection acceptance loop. Requires a transport
     * policy that supports an asyncronous listen+accept loop. Must be called
     * while the endpoint is listening (or start_accept will return immediately
     * with an error that the server is not listening).
     * 
     * Consult the documentation for the underlying transport for information
     * about exactly when this code will start running, when in the transport
     * event loop it makes sense to call it, and for instructions on how to
     * stop this acceptance loop.
     *
     * Error handling:
     * start_accept will attempt to start an asyncronous acceptance loop that
     * accepts a connection and then re-issues a new accept command. If this loop
     * ends or fails for any reason (including immediately) the `completion_handler`
     * will be called with two status codes. The first is the library level status
     * code the second is the underlying transport status code (if any).
     * 
     * @since 0.9.0
     * 
     * @param completion_handler A handler function to be called when the async
     *        accept loop ends.
     */
    void start_accept(accept_loop_handler completion_handler) {
        // This check will happen again in async_accept but if we do it here we can
        // avoid setting up and tearing down a connection if we know that we can't
        // actually accept a connection.
        if (!transport_type::is_listening()) {
            completion_handler(error::make_error_code(error::transport_error),
                               error::make_error_code(error::async_accept_not_listening));
            return;
        }
        
        lib::error_code tec;
        connection_ptr con = get_connection(tec);

        if (!con) {
          completion_handler(error::make_error_code(error::con_creation_failed),tec);
          return;
        }

        transport_type::async_accept(
            lib::static_pointer_cast<transport_con_type>(con),
            lib::bind(&type::handle_accept,this,
                      con,
                      completion_handler,
                      lib::placeholders::_1),
            tec
        );

        if (tec) {
            if (con) {
                // If the connection was constructed but the accept failed,
                // terminate the connection to prevent memory leaks.
                con->terminate(lib::error_code());
            }

            endpoint_type::m_elog->write(log::elevel::rerror,
                "Async_accept failed: "+tec.message());

            // let the end user know about the error
            completion_handler(error::make_error_code(error::transport_error),tec);
        }
    }

#ifndef _WEBSOCKETPP_NO_EXCEPTIONS_
    /// Starts the server's async connection acceptance loop (exception)
    /**
     * Initiates the server connection acceptance loop. Requires a transport
     * policy that supports an asyncronous listen+accept loop. Must be called
     * while the endpoint is listening (or start_accept will return immediately
     * with an error that the server is not listening).
     * 
     * Consult the documentation for the underlying transport for information
     * about exactly when this code will start running, when in the transport
     * event loop it makes sense to call it, and for instructions on how to
     * stop this acceptance loop.
     *
     * Error handling:
     * start_accept will throw an exception if there is a problem starting the
     * accept loop. Once successfully started the loop will continue to renew
     * itself after each connection. This method has no way of delivering that
     * happen after the loop is started. Use `start_accept(accept_loop_handler)`
     * instead to get full error information no matter when the async loop ends.
     * 
     * @deprecated use `start_accept(accept_loop_handler)` instead
     * 
     * @exception websocketpp::exception If the accept loop fails to be set up.
     */
    void start_accept() {
        lib::error_code ec;
        start_accept(ec);
        if (ec) {
            throw exception(ec);
        }
    }
#endif // _WEBSOCKETPP_NO_EXCEPTIONS_

    /// Handler callback for start_accept (deprecated)
    void handle_accept_legacy(connection_ptr con, lib::error_code const & ec) {
        if (ec) {
            con->terminate(ec);

            if (ec == error::operation_canceled) {
                endpoint_type::m_elog->write(log::elevel::info,
                    "handle_accept error: "+ec.message());
            } else {
                endpoint_type::m_elog->write(log::elevel::rerror,
                    "handle_accept error: "+ec.message());
            }
        } else {
            con->start();
        }

        lib::error_code start_ec;
        start_accept(start_ec);
        if (start_ec == error::async_accept_not_listening) {
            endpoint_type::m_elog->write(log::elevel::info,
                "Stopping acceptance of new connections because the underlying transport is no longer listening.");
        } else if (start_ec) {
            endpoint_type::m_elog->write(log::elevel::rerror,
                "Restarting async_accept loop failed: "+ec.message());
        }
    }

    /// Handler callback for start_accept
    void handle_accept(connection_ptr con, 
                       accept_loop_handler completion_handler,
                       lib::error_code const & tec)
    {
        // deal with the newly accepted connection
        if (tec) {
            // terminate the connection and pass the transport error
            // code along
            con->terminate(tec);

            // log the transport error before restarting the loop
            if (tec == error::operation_canceled) {
                endpoint_type::m_elog->write(log::elevel::info,
                    "handle_accept error: "+tec.message());
            } else {
                endpoint_type::m_elog->write(log::elevel::rerror,
                    "handle_accept error: "+tec.message());
            }
        } else {
            con->start();
        }

        // todo: are there any `tec` codes that should prompt us to end
        // without restarting the loop?

        // attempt to restart the async accept loop for the next connection
        // this method will deliver any errors via the completion_handler
        start_accept(completion_handler);
    }
};

} // namespace websocketpp

#endif //WEBSOCKETPP_SERVER_ENDPOINT_HPP
