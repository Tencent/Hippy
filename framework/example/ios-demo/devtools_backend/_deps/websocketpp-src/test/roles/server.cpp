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
//#define BOOST_TEST_DYN_LINK
#define BOOST_TEST_MODULE server
#include <boost/test/unit_test.hpp>

#include <iostream>

// Test Environment:
// server, no TLS, no locks, iostream based transport
#include <websocketpp/config/core.hpp>
#include <websocketpp/server.hpp>

#include <websocketpp/transport/base/endpoint.hpp>
#include <websocketpp/transport/stub/endpoint.hpp>

typedef websocketpp::server<websocketpp::config::core> server;
typedef websocketpp::config::core::message_type::ptr message_ptr;

using websocketpp::lib::placeholders::_1;
using websocketpp::lib::placeholders::_2;
using websocketpp::lib::bind;

/*struct stub_config : public websocketpp::config::core {
    typedef core::concurrency_type concurrency_type;

    typedef core::request_type request_type;
    typedef core::response_type response_type;

    typedef core::message_type message_type;
    typedef core::con_msg_manager_type con_msg_manager_type;
    typedef core::endpoint_msg_manager_type endpoint_msg_manager_type;

    typedef core::alog_type alog_type;
    typedef core::elog_type elog_type;

    typedef core::rng_type rng_type;

    typedef core::transport_type transport_type;

    typedef core::endpoint_base endpoint_base;
};*/

/* Run server and return output test rig */
std::string run_server_test(server& s, std::string input) {
    server::connection_ptr con;
    std::stringstream output;

    s.register_ostream(&output);
    s.clear_access_channels(websocketpp::log::alevel::all);
    s.clear_error_channels(websocketpp::log::elevel::all);

    websocketpp::lib::error_code ec;
    con = s.get_connection(ec);
    con->start();

    std::stringstream channel;

    channel << input;
    channel >> *con;

    return output.str();
}

/* handler library*/
void echo_func(server* s, websocketpp::connection_hdl hdl, message_ptr msg) {
    s->send(hdl, msg->get_payload(), msg->get_opcode());
}

bool validate_func_subprotocol(server* s, std::string* out, std::string accept,
    websocketpp::connection_hdl hdl)
{
    server::connection_ptr con = s->get_con_from_hdl(hdl);

    std::stringstream o;

    const std::vector<std::string> & protocols = con->get_requested_subprotocols();
    std::vector<std::string>::const_iterator it;

    for (it = protocols.begin(); it != protocols.end(); ++it) {
        o << *it << ",";
    }

    *out = o.str();

    if (!accept.empty()) {
        con->select_subprotocol(accept);
    }

    return true;
}

void open_func_subprotocol(server* s, std::string* out, websocketpp::connection_hdl hdl) {
    server::connection_ptr con = s->get_con_from_hdl(hdl);

    *out = con->get_subprotocol();
}

/* Tests */
BOOST_AUTO_TEST_CASE( basic_websocket_request ) {
    std::string input = "GET / HTTP/1.1\r\nHost: www.example.com\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: http://www.example.com\r\n\r\n";
    std::string output = "HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\nServer: test\r\nUpgrade: websocket\r\n\r\n";

    server s;
    s.set_user_agent("test");

    BOOST_CHECK_EQUAL(run_server_test(s,input), output);
}

BOOST_AUTO_TEST_CASE( invalid_websocket_version ) {
    std::string input = "GET / HTTP/1.1\r\nHost: www.example.com\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: a\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: http://www.example.com\r\n\r\n";
    std::string output = "HTTP/1.1 400 Bad Request\r\nServer: test\r\n\r\n";

    server s;
    s.set_user_agent("test");
    //s.set_message_handler(bind(&echo_func,&s,::_1,::_2));

    BOOST_CHECK_EQUAL(run_server_test(s,input), output);
}

BOOST_AUTO_TEST_CASE( unimplemented_websocket_version ) {
    std::string input = "GET / HTTP/1.1\r\nHost: www.example.com\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 14\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: http://www.example.com\r\n\r\n";

    std::string output = "HTTP/1.1 400 Bad Request\r\nSec-WebSocket-Version: 0,7,8,13\r\nServer: test\r\n\r\n";

    server s;
    s.set_user_agent("test");

    BOOST_CHECK_EQUAL(run_server_test(s,input), output);
}

BOOST_AUTO_TEST_CASE( list_subprotocol_empty ) {
    std::string input = "GET / HTTP/1.1\r\nHost: www.example.com\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: http://www.example.com\r\nSec-WebSocket-Protocol: foo\r\n\r\n";

    std::string output = "HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\nServer: test\r\nUpgrade: websocket\r\n\r\n";

    std::string subprotocol;

    server s;
    s.set_user_agent("test");
    s.set_open_handler(bind(&open_func_subprotocol,&s,&subprotocol,::_1));

    BOOST_CHECK_EQUAL(run_server_test(s,input), output);
    BOOST_CHECK_EQUAL(subprotocol, "");
}

BOOST_AUTO_TEST_CASE( list_subprotocol_one ) {
    std::string input = "GET / HTTP/1.1\r\nHost: www.example.com\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: http://www.example.com\r\nSec-WebSocket-Protocol: foo\r\n\r\n";

    std::string output = "HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\nServer: test\r\nUpgrade: websocket\r\n\r\n";

    std::string validate;
    std::string open;

    server s;
    s.set_user_agent("test");
    s.set_validate_handler(bind(&validate_func_subprotocol,&s,&validate,"",::_1));
    s.set_open_handler(bind(&open_func_subprotocol,&s,&open,::_1));

    BOOST_CHECK_EQUAL(run_server_test(s,input), output);
    BOOST_CHECK_EQUAL(validate, "foo,");
    BOOST_CHECK_EQUAL(open, "");
}

BOOST_AUTO_TEST_CASE( accept_subprotocol_one ) {
    std::string input = "GET / HTTP/1.1\r\nHost: www.example.com\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: http://www.example.com\r\nSec-WebSocket-Protocol: foo\r\n\r\n";

    std::string output = "HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\nSec-WebSocket-Protocol: foo\r\nServer: test\r\nUpgrade: websocket\r\n\r\n";

    std::string validate;
    std::string open;

    server s;
    s.set_user_agent("test");
    s.set_validate_handler(bind(&validate_func_subprotocol,&s,&validate,"foo",::_1));
    s.set_open_handler(bind(&open_func_subprotocol,&s,&open,::_1));

    BOOST_CHECK_EQUAL(run_server_test(s,input), output);
    BOOST_CHECK_EQUAL(validate, "foo,");
    BOOST_CHECK_EQUAL(open, "foo");
}

BOOST_AUTO_TEST_CASE( accept_subprotocol_invalid ) {
    std::string input = "GET / HTTP/1.1\r\nHost: www.example.com\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: http://www.example.com\r\nSec-WebSocket-Protocol: foo\r\n\r\n";

    std::string output = "HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\nSec-WebSocket-Protocol: foo\r\nServer: test\r\nUpgrade: websocket\r\n\r\n";

    std::string validate;
    std::string open;

    server s;
    s.set_user_agent("test");
    s.set_validate_handler(bind(&validate_func_subprotocol,&s,&validate,"foo2",::_1));
    s.set_open_handler(bind(&open_func_subprotocol,&s,&open,::_1));

    std::string o;

    BOOST_CHECK_THROW(o = run_server_test(s,input), websocketpp::exception);
}

BOOST_AUTO_TEST_CASE( accept_subprotocol_two ) {
    std::string input = "GET / HTTP/1.1\r\nHost: www.example.com\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: http://www.example.com\r\nSec-WebSocket-Protocol: foo, bar\r\n\r\n";

    std::string output = "HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\nSec-WebSocket-Protocol: bar\r\nServer: test\r\nUpgrade: websocket\r\n\r\n";

    std::string validate;
    std::string open;

    server s;
    s.set_user_agent("test");
    s.set_validate_handler(bind(&validate_func_subprotocol,&s,&validate,"bar",::_1));
    s.set_open_handler(bind(&open_func_subprotocol,&s,&open,::_1));

    BOOST_CHECK_EQUAL(run_server_test(s,input), output);
    BOOST_CHECK_EQUAL(validate, "foo,bar,");
    BOOST_CHECK_EQUAL(open, "bar");
}

void handle_start_accept(websocketpp::lib::error_code * rec, websocketpp::lib::error_code * rtec, websocketpp::lib::error_code const & ec, websocketpp::lib::error_code const & tec) {
    *rec = ec;
    *rtec = tec;
}

namespace test_transport {

template <typename config>
struct endpoint : websocketpp::transport::stub::endpoint<config> {
    void config_test(int accept_cons, bool init_connections) {
        m_accept_cons = accept_cons;
        m_init_connections = init_connections;
    }

    bool is_listening() const {
        if (m_accept_cons > 0) {
            return true;
        } else {
            return false;
        }
    }

    typedef typename websocketpp::transport::stub::endpoint<config>::transport_con_ptr transport_con_ptr;

    websocketpp::lib::error_code init(transport_con_ptr tcon) {
        if (m_init_connections) {
            return websocketpp::lib::error_code();
        } else {
            return websocketpp::transport::stub::error::make_error_code(websocketpp::transport::stub::error::not_implemented);
        }
    }

    void async_accept(transport_con_ptr tcon, websocketpp::transport::accept_handler cb, websocketpp::lib::error_code & ec) {
        m_accept_cons--;

        ec = websocketpp::lib::error_code();
        cb(ec);
    }

    int m_accept_cons;
    bool m_init_connections;
};

} // namespace test_transport

struct test_config : public websocketpp::config::core {
    typedef test_transport::endpoint<websocketpp::config::core::transport_config> transport_type;
};

void handle_fail(websocketpp::server<test_config> * s, websocketpp::lib::error_code * rec, websocketpp::connection_hdl hdl) {
    websocketpp::server<test_config>::connection_ptr con = s->get_con_from_hdl(hdl);

    *rec = con->get_ec();
}

void handle_fail_count(websocketpp::server<test_config> * s, websocketpp::lib::error_code rec, int * count, websocketpp::connection_hdl hdl) {
    websocketpp::server<test_config>::connection_ptr con = s->get_con_from_hdl(hdl);

    if (con->get_ec() == rec) {
        (*count)++;
    }
}

BOOST_AUTO_TEST_CASE( start_accept_not_listening ) {
    websocketpp::lib::error_code rec = websocketpp::error::make_error_code(websocketpp::error::test);
    websocketpp::lib::error_code rtec = websocketpp::error::make_error_code(websocketpp::error::test);

    websocketpp::server<test_config> s;

    // config the test endpoint to report that it is not listening or generating connections
    s.config_test(0, false);

    // attempt to start accepting connections
    s.start_accept(bind(&handle_start_accept,&rec,&rtec,::_1,::_2));

    // confirm the right library and transport error codes
    BOOST_CHECK_EQUAL(rec, websocketpp::error::make_error_code(websocketpp::error::transport_error));
    BOOST_CHECK_EQUAL(rtec, websocketpp::error::make_error_code(websocketpp::error::async_accept_not_listening));
}

BOOST_AUTO_TEST_CASE( start_accept_con_creation_failed ) {
    websocketpp::lib::error_code rec = websocketpp::error::make_error_code(websocketpp::error::test);
    websocketpp::lib::error_code rtec = websocketpp::error::make_error_code(websocketpp::error::test);

    websocketpp::server<test_config> s;

    // config the test endpoint to report that is listening but not generating connections
    s.config_test(1,false);

    // attempt to start accepting connections
    s.start_accept(bind(&handle_start_accept,&rec,&rtec,::_1,::_2));

    // confirm the right library and transport error codes
    BOOST_CHECK_EQUAL(rec, websocketpp::error::make_error_code(websocketpp::error::con_creation_failed));
    BOOST_CHECK_EQUAL(rtec, websocketpp::transport::stub::error::make_error_code(websocketpp::transport::stub::error::not_implemented));
}

BOOST_AUTO_TEST_CASE( start_accept_con_1 ) {
    // this case tests the full successful start accept loop up to connection initialization.

    websocketpp::lib::error_code rec = websocketpp::error::make_error_code(websocketpp::error::test);
    websocketpp::lib::error_code rtec = websocketpp::error::make_error_code(websocketpp::error::test);
    websocketpp::lib::error_code rsec = websocketpp::error::make_error_code(websocketpp::error::test);

    websocketpp::server<test_config> s;

    // config the test endpoint to report that it is listening for exactly
    // one connection and generating connections
    s.config_test(1,true);

    // we are expecting to fail due to connection initiation being "not implemented"
    s.set_fail_handler(bind(&handle_fail,&s,&rsec,::_1));

    // attempt to start accepting connections
    s.start_accept(bind(&handle_start_accept,&rec,&rtec,::_1,::_2));

    BOOST_CHECK_EQUAL(rec, websocketpp::error::make_error_code(websocketpp::error::transport_error));
    BOOST_CHECK_EQUAL(rtec, websocketpp::error::make_error_code(websocketpp::error::async_accept_not_listening));
    BOOST_CHECK_EQUAL(rsec, websocketpp::transport::stub::error::make_error_code(websocketpp::transport::stub::error::not_implemented));
}

BOOST_AUTO_TEST_CASE( start_accept_con_2 ) {
    // this case tests the full successful start accept loop up to connection initialization
    // for two full accept cycles before cancelling listening.

    websocketpp::lib::error_code rec = websocketpp::error::make_error_code(websocketpp::error::test);
    websocketpp::lib::error_code rtec = websocketpp::error::make_error_code(websocketpp::error::test);

    websocketpp::server<test_config> s;

    // config the test endpoint to report that it is listening for exactly
    // one connection and generating connections
    s.config_test(2,true);

    websocketpp::lib::error_code xec = websocketpp::transport::stub::error::make_error_code(websocketpp::transport::stub::error::not_implemented);
    int count = 0;

    // we are expecting to fail due to connection initiation being "not implemented"
    // this handler will count the number of times it is called with "not implemented"
    s.set_fail_handler(bind(&handle_fail_count,&s,xec,&count,::_1));

    // attempt to start accepting connections
    s.start_accept(bind(&handle_start_accept,&rec,&rtec,::_1,::_2));

    // confirm that the final return was as expected
    BOOST_CHECK_EQUAL(rec, websocketpp::error::make_error_code(websocketpp::error::transport_error));
    BOOST_CHECK_EQUAL(rtec, websocketpp::error::make_error_code(websocketpp::error::async_accept_not_listening));
    // confirm that we saw two init attempts
    BOOST_CHECK_EQUAL(count, 2);
}

BOOST_AUTO_TEST_CASE( start_accept_not_listening_deprecated ) {
    // test deprecated start_accept(ec) failure path 1

    websocketpp::lib::error_code rec = websocketpp::error::make_error_code(websocketpp::error::test);

    websocketpp::server<test_config> s;

    // config the test endpoint to report that it is listening for exactly
    // one connection and generating connections
    s.config_test(0,false);

    // attempt to start accepting connections
    s.start_accept(rec);

    // confirm that the final return was as expected
    BOOST_CHECK_EQUAL(rec, websocketpp::error::make_error_code(websocketpp::error::async_accept_not_listening));
}

BOOST_AUTO_TEST_CASE( start_accept_con_creation_failed_deprecated ) {
    // test deprecated start_accept(ec) failure path 2

    websocketpp::lib::error_code rec = websocketpp::error::make_error_code(websocketpp::error::test);

    websocketpp::server<test_config> s;

    // config the test endpoint to report that it is listening for exactly
    // one connection and generating connections
    s.config_test(1,false);

    // attempt to start accepting connections
    s.start_accept(rec);

    // confirm that the final return was as expected
    BOOST_CHECK_EQUAL(rec, websocketpp::error::make_error_code(websocketpp::error::con_creation_failed));
}

BOOST_AUTO_TEST_CASE( start_accept_deprecated ) {
    // this case tests the full successful start accept loop up to connection initialization.

    websocketpp::lib::error_code rec = websocketpp::error::make_error_code(websocketpp::error::test);
    websocketpp::lib::error_code rsec = websocketpp::error::make_error_code(websocketpp::error::test);

    websocketpp::server<test_config> s;

    // config the test endpoint to report that it is listening for exactly
    // one connection and generating connections
    s.config_test(1,true);

    // we are expecting to fail due to connection initiation being "not implemented"
    s.set_fail_handler(bind(&handle_fail,&s,&rsec,::_1));

    // attempt to start accepting connections
    s.start_accept(rec);

    BOOST_CHECK_EQUAL(rec, websocketpp::lib::error_code());
    BOOST_CHECK_EQUAL(rsec, websocketpp::transport::stub::error::make_error_code(websocketpp::transport::stub::error::not_implemented));
    // we can't automated test how/why the accept loop ends because this version has
    // no method for capturing that output other than the error log
}

#ifndef _WEBSOCKETPP_NO_EXCEPTIONS_
BOOST_AUTO_TEST_CASE( start_accept_exception_con_creation_failed_deprecated ) {
    // this case tests two things:
    // 1. the existance of the deprecated start_accept() [with exceptions] function
    // 2. Error handling of the deprecated start_accept() in the case that the transport
    //    cannot create new connections.

    websocketpp::lib::error_code rec = websocketpp::error::make_error_code(websocketpp::error::test);

    websocketpp::server<test_config> s;

    // config the test endpoint to report that it is listening for exactly
    // one connection and generating connections
    s.config_test(1,false);

    // attempt to start accepting connections
    try {
        s.start_accept();
    } catch (websocketpp::exception const & e) {
        rec = e.code();
    }

    // confirm that the final return was as expected
    BOOST_CHECK_EQUAL(rec, websocketpp::error::make_error_code(websocketpp::error::con_creation_failed));
}
#endif // _WEBSOCKETPP_NO_EXCEPTIONS_

BOOST_AUTO_TEST_CASE( get_connection_deprecated ) {
    // exercise the deprecated get_connection function to help avoid regressions.
    // this test should be removed if the deprecated function is removed.

    server s;
    server::connection_ptr con = s.get_connection();

    BOOST_CHECK(con);
}

/*BOOST_AUTO_TEST_CASE( user_reject_origin ) {
    std::string input = "GET / HTTP/1.1\r\nHost: www.example.com\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: http://www.example2.com\r\n\r\n";
    std::string output = "HTTP/1.1 403 Forbidden\r\nServer: test\r\n\r\n";

    server s;
    s.set_user_agent("test");

    BOOST_CHECK(run_server_test(s,input) == output);
}*/
