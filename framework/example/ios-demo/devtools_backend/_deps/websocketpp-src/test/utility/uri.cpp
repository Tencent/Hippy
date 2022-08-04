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
#define BOOST_TEST_MODULE uri
#include <boost/test/unit_test.hpp>

#include <iostream>
#include <string>

#include <websocketpp/uri.hpp>

// Many URI tests are inspired by the comprehensive test suite from
// the uriparser project (https://uriparser.github.io)

// Test a regular valid ws URI
BOOST_AUTO_TEST_CASE( uri_valid ) {
    websocketpp::uri uri("ws://localhost:9000/chat");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( !uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "ws");
    BOOST_CHECK_EQUAL( uri.get_host(), "localhost");
    BOOST_CHECK_EQUAL( uri.get_port(), 9000 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/chat" );
    BOOST_CHECK_EQUAL( uri.get_query(), "" );
}

BOOST_AUTO_TEST_CASE( uri_valid_ipv4 ) {
    //BOOST_CHECK( !websocketpp::uri("ws://01.0.0.0").get_valid() );
    //BOOST_CHECK( !websocketpp::uri("ws://001.0.0.0").get_valid() );


}

BOOST_AUTO_TEST_CASE( uri_valid_ipv6 ) {
    // Quad length
    BOOST_CHECK( websocketpp::uri("ws://[abcd::]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[abcd::1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[abcd::12]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[abcd::123]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[abcd::1234]").get_valid() );

    // Full length
    BOOST_CHECK( websocketpp::uri("ws://[2001:0db8:0100:f101:0210:a4ff:fee3:9566]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[2001:0DB8:0100:F101:0210:A4FF:FEE3:9566]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[2001:db8:100:f101:210:a4ff:fee3:9566]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[2001:0db8:100:f101:0:0:0:1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1:2:3:4:5:6:255.255.255.255]").get_valid() );

    // Legal IPv4
    BOOST_CHECK( websocketpp::uri("ws://[::1.2.3.4]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[3:4::5:1.2.3.4]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[::ffff:1.2.3.4]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[::0.0.0.0]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[::255.255.255.255]").get_valid() );

    // Zipper position
    BOOST_CHECK( websocketpp::uri("ws://[::1:2:3:4:5:6:7]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1::1:2:3:4:5:6]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1:2::1:2:3:4:5]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1:2:3::1:2:3:4]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1:2:3:4::1:2:3]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1:2:3:4:5::1:2]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1:2:3:4:5:6::1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1:2:3:4:5:6:7::]").get_valid() );

    // Zipper length
    BOOST_CHECK( websocketpp::uri("ws://[1:1:1::1:1:1:1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1:1:1::1:1:1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1:1:1::1:1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1:1::1:1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1:1::1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[1::1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[::1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[::]").get_valid() );

    // Misc
    BOOST_CHECK( websocketpp::uri("ws://[21ff:abcd::1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[2001:db8:100:f101::1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[a:b:c::12:1]").get_valid() );
    BOOST_CHECK( websocketpp::uri("ws://[a:b::0:1:2:3]").get_valid() );
}

BOOST_AUTO_TEST_CASE( uri_invalid_ipv6 ) {
    // 5 char quad
    BOOST_CHECK( !websocketpp::uri("ws://[::12345]").get_valid() );

    // Two zippers
    BOOST_CHECK( !websocketpp::uri("ws://[abcd::abcd::abcd]").get_valid() );

    // Triple-colon zipper
    BOOST_CHECK( !websocketpp::uri("ws://[:::1234]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[1234:::1234:1234]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[1234:1234:::1234]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[1234:::]").get_valid() );

    // No quads, just IPv4. These are valid uris, just shouldn't parse as IPv6 literal
    websocketpp::uri ipv4_1("ws://1.2.3.4");
    BOOST_CHECK( ipv4_1.get_valid() );
    BOOST_CHECK( !ipv4_1.is_ipv6_literal() );

    // Five quads
    BOOST_CHECK( !websocketpp::uri("ws://[0000:0000:0000:0000:0000:1.2.3.4]").get_valid() );

    // Seven quads
    BOOST_CHECK( !websocketpp::uri("ws://[0:0:0:0:0:0:0]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[0:0:0:0:0:0:0:]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[0:0:0:0:0:0:0:1.2.3.4]").get_valid() );

    // Nine quads (or more)
    BOOST_CHECK( !websocketpp::uri("ws://[1:2:3:4:5:6:7:8:9]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::2:3:4:5:6:7:8:9]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[1:2:3:4::6:7:8:9]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[1:2:3:4:5:6:7:8::]").get_valid() );

    // Invalid IPv4 part
    BOOST_CHECK( !websocketpp::uri("ws://[::ffff:001.02.03.004]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::ffff:1.2.3.1111]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::ffff:1.2.3.256]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::ffff:311.2.3.4]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::ffff:1.2.3:4]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::ffff:1.2.3]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::ffff:1.2.3.]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::ffff:1.2.3a.4]").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::ffff:1.2.3.4:123]").get_valid() );

    // Nonhex
    BOOST_CHECK( !websocketpp::uri("ws://[g:0:0:0:0:0:0]").get_valid() );

    // missing end bracket
    BOOST_CHECK( !websocketpp::uri("ws://[::1").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::1:80").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::1/foo").get_valid() );
    BOOST_CHECK( !websocketpp::uri("ws://[::1#foo").get_valid() );
}

BOOST_AUTO_TEST_CASE( uri_valid_no_slash ) {
    websocketpp::uri uri("ws://localhost");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( !uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "ws");
    BOOST_CHECK_EQUAL( uri.get_host(), "localhost");
    BOOST_CHECK_EQUAL( uri.get_port(), 80 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/" );
}

BOOST_AUTO_TEST_CASE( uri_valid_no_slash_with_fragment ) {
    websocketpp::uri uri("ws://localhost#foo");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( !uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "ws");
    BOOST_CHECK_EQUAL( uri.get_host(), "localhost");
    BOOST_CHECK_EQUAL( uri.get_port(), 80 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "#foo" );
}

// Test a regular valid ws URI
BOOST_AUTO_TEST_CASE( uri_valid_no_port_unsecure ) {
    websocketpp::uri uri("ws://localhost/chat");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( !uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "ws");
    BOOST_CHECK_EQUAL( uri.get_host(), "localhost");
    BOOST_CHECK_EQUAL( uri.get_port(), 80 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/chat" );
}

// Valid URI with no port (secure)
BOOST_AUTO_TEST_CASE( uri_valid_no_port_secure ) {
    websocketpp::uri uri("wss://localhost/chat");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "wss");
    BOOST_CHECK_EQUAL( uri.get_host(), "localhost");
    BOOST_CHECK_EQUAL( uri.get_port(), 443 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/chat" );
}

// Valid URI with no resource
BOOST_AUTO_TEST_CASE( uri_valid_no_resource ) {
    websocketpp::uri uri("wss://localhost:9000");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "wss");
    BOOST_CHECK_EQUAL( uri.get_host(), "localhost");
    BOOST_CHECK_EQUAL( uri.get_port(), 9000 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/" );
}

// Valid URI IPv6 Literal
BOOST_AUTO_TEST_CASE( uri_valid_ipv6_literal ) {
    websocketpp::uri uri("wss://[::1]:9000/chat");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "wss");
    BOOST_CHECK_EQUAL( uri.get_host(), "::1");
    BOOST_CHECK_EQUAL( uri.get_port(), 9000 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/chat" );
    BOOST_CHECK_EQUAL( uri.str(), "wss://[::1]:9000/chat" );
    BOOST_CHECK_EQUAL( uri.get_host_port(), "[::1]:9000" );
    BOOST_CHECK_EQUAL( uri.get_authority(), "[::1]:9000" );
}

// Valid URI IPv6 Literal with default port
BOOST_AUTO_TEST_CASE( uri_valid_ipv6_literal_default_port ) {
    websocketpp::uri uri("wss://[::1]/chat");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "wss");
    BOOST_CHECK_EQUAL( uri.get_host(), "::1");
    BOOST_CHECK_EQUAL( uri.get_port(), 443 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/chat" );
    BOOST_CHECK_EQUAL( uri.str(), "wss://[::1]/chat" );
    BOOST_CHECK_EQUAL( uri.get_host_port(), "::1" );
    BOOST_CHECK_EQUAL( uri.get_authority(), "[::1]:443" );
}

// Valid URI with more complicated host
BOOST_AUTO_TEST_CASE( uri_valid_2 ) {
    websocketpp::uri uri("wss://thor-websocket.zaphoyd.net:88/");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "wss");
    BOOST_CHECK_EQUAL( uri.get_host(), "thor-websocket.zaphoyd.net");
    BOOST_CHECK_EQUAL( uri.get_port(), 88 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/" );
}


// Invalid URI (port too long)
BOOST_AUTO_TEST_CASE( uri_invalid_long_port ) {
    websocketpp::uri uri("wss://localhost:900000/chat");

    BOOST_CHECK( !uri.get_valid() );
}

// Invalid URI (bogus scheme method)
BOOST_AUTO_TEST_CASE( uri_invalid_scheme ) {
    websocketpp::uri uri("foo://localhost:9000/chat");

    BOOST_CHECK( !uri.get_valid() );
}

// Valid URI (http method)
BOOST_AUTO_TEST_CASE( uri_http_scheme ) {
    websocketpp::uri uri("http://localhost:9000/chat");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( !uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "http");
    BOOST_CHECK_EQUAL( uri.get_host(), "localhost");
    BOOST_CHECK_EQUAL( uri.get_port(), 9000 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/chat" );
}

// Valid URI IPv4 literal
BOOST_AUTO_TEST_CASE( uri_valid_ipv4_literal ) {
    websocketpp::uri uri("wss://127.0.0.1:9000/chat");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "wss");
    BOOST_CHECK_EQUAL( uri.get_host(), "127.0.0.1");
    BOOST_CHECK_EQUAL( uri.get_port(), 9000 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/chat" );
}

// Valid URI complicated resource path
BOOST_AUTO_TEST_CASE( uri_valid_3 ) {
    websocketpp::uri uri("wss://localhost:9000/chat/foo/bar");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "wss");
    BOOST_CHECK_EQUAL( uri.get_host(), "localhost");
    BOOST_CHECK_EQUAL( uri.get_port(), 9000 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/chat/foo/bar" );
}

// Invalid URI broken method separator
BOOST_AUTO_TEST_CASE( uri_invalid_method_separator ) {
    websocketpp::uri uri("wss:/localhost:9000/chat");

    BOOST_CHECK( !uri.get_valid() );
}

// Invalid URI port > 65535
BOOST_AUTO_TEST_CASE( uri_invalid_gt_16_bit_port ) {
    websocketpp::uri uri("wss:/localhost:70000/chat");

    BOOST_CHECK( !uri.get_valid() );
}

// Invalid URI includes uri fragment
BOOST_AUTO_TEST_CASE( uri_invalid_fragment ) {
    websocketpp::uri uri("wss:/localhost:70000/chat#foo");

    BOOST_CHECK( !uri.get_valid() );
}

// Invalid URI with no brackets around IPv6 literal
BOOST_AUTO_TEST_CASE( uri_invalid_bad_v6_literal_1 ) {
    websocketpp::uri uri("wss://::1/chat");

    BOOST_CHECK( !uri.get_valid() );
}

// Invalid URI with port and no brackets around IPv6 literal
BOOST_AUTO_TEST_CASE( uri_invalid_bad_v6_literal_2 ) {
    websocketpp::uri uri("wss://::1:2009/chat");

    BOOST_CHECK( !uri.get_valid() );
}

// Invalid URI with stray []
BOOST_AUTO_TEST_CASE( uri_invalid_free_delim ) {
    websocketpp::uri uri("wss://localhos[]t/chat");

    BOOST_CHECK( !uri.get_valid() );
}

// Valid URI complicated resource path with query
BOOST_AUTO_TEST_CASE( uri_valid_4 ) {
    websocketpp::uri uri("wss://localhost:9000/chat/foo/bar?foo=bar");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "wss" );
    BOOST_CHECK_EQUAL( uri.get_host(), "localhost");
    BOOST_CHECK_EQUAL( uri.get_port(), 9000 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/chat/foo/bar?foo=bar" );
    BOOST_CHECK_EQUAL( uri.get_query(), "foo=bar" );
}

// Valid URI with a mapped v4 ipv6 literal
BOOST_AUTO_TEST_CASE( uri_valid_v4_mapped ) {
    websocketpp::uri uri("wss://[0000:0000:0000:0000:0000:0000:192.168.1.1]:9000/");

    BOOST_CHECK( uri.get_valid() );
    BOOST_CHECK( uri.get_secure() );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "wss" );
    BOOST_CHECK_EQUAL( uri.get_host(), "0000:0000:0000:0000:0000:0000:192.168.1.1");
    BOOST_CHECK_EQUAL( uri.get_port(), 9000 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/" );
}

// Valid URI with a v6 address with mixed case
BOOST_AUTO_TEST_CASE( uri_valid_v6_mixed_case ) {
    websocketpp::uri uri("wss://[::10aB]:9000/");

    BOOST_CHECK( uri.get_valid() == true );
    BOOST_CHECK( uri.get_secure() == true );
    BOOST_CHECK_EQUAL( uri.get_scheme(), "wss" );
    BOOST_CHECK_EQUAL( uri.get_host(), "::10aB");
    BOOST_CHECK_EQUAL( uri.get_port(), 9000 );
    BOOST_CHECK_EQUAL( uri.get_resource(), "/" );
}

// Valid URI with a v6 address with mixed case
BOOST_AUTO_TEST_CASE( uri_invalid_no_scheme ) {
    websocketpp::uri uri("myserver.com");

    BOOST_CHECK( !uri.get_valid() );
}

// TODO: tests for the other constructors, especially with IP literals
