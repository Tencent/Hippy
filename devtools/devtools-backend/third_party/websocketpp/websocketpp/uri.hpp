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

#ifndef WEBSOCKETPP_URI_HPP
#define WEBSOCKETPP_URI_HPP

#include <websocketpp/error.hpp>

#include <websocketpp/common/memory.hpp>
#include <websocketpp/common/stdint.hpp>

#include <algorithm>
#include <sstream>
#include <string>

namespace websocketpp {

// TODO: figure out why this fixes horrible linking errors.

/// Default port for ws://
static uint16_t const uri_default_port = 80;
/// Default port for wss://
static uint16_t const uri_default_secure_port = 443;



/// A group of helper methods for parsing and validating URIs against RFC 3986
namespace uri_helper {

/// RFC3986 unreserved character test
/**
 * @since 0.8.3
 *
 * @param c the char to test
 * @return True if the character is considered `unreserved`
 */
inline bool unreserved(char c) {
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
        return true;
    } else if (c >= '0' && c <= '9') {
        return true;
    } else if (c == '-' || c == '.' || c == '_' || c == '~') {
        return true;
    } else {
        return false;
    }
}

/// RFC3986 generic delimiter character test
/**
 * @param c the char to test
 * @return True if the character is considered a generic delimiter
 */
inline bool gen_delim(char c) {
    switch(c) {
        case ':':
        case '/':
        case '?':
        case '#':
        case '[':
        case ']':
        case '@':
            return true;
        default:
            return false;
    }
}

/// RFC3986 subcomponent delimiter character test
/**
 * @since 0.8.3
 *
 * @param c the char to test
 * @return True if the character is considered a subcomponent delimiter
 */
inline bool sub_delim(char c) {
    switch(c) {
        case '!':
        case '$':
        case '&':
        case '\'':
        case '(':
        case ')':
        case '*':
        case '+':
        case ',':
        case ';':
        case '=':
            return true;
        default:
            return false;
    }
}

/// RFC3986 hex digit character test
/**
 * Case insensitive
 *
 * @since 0.8.3
 *
 * @param c the char to test
 * @return True if the character is considered a hexadecimal digit
 */
inline bool hexdigit(char c) {
    switch(c) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case 'A':
        case 'B':
        case 'C':
        case 'D':
        case 'E':
        case 'F':
        case 'a':
        case 'b':
        case 'c':
        case 'd':
        case 'e':
        case 'f':
            return true;
        default:
            return false;
    }
}

/// RFC3986 scheme character test
/**
 * @since 0.8.3
 *
 * @param c the char to test
 * @return True if the character is considered a valid character for a uri scheme
 */
inline bool scheme(char c) {
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
        return true;
    } else if (c >= '0' && c <= '9') {
        return true;
    } else if (c == '+' || c == '-' || c == '.') {
        return true;
    } else {
        return false;
    }
}

/// RFC3986 digit character test
/**
 * @since 0.8.3
 *
 * @param c the char to test
 * @return True if the character is considered a digit (0-9)
 */
inline bool digit(char c) {
    return c >= '0' && c <= '9';
}

/// RFC3986 digit character test (iterator version)
/**
 * @since 0.8.3
 *
 * @param c the char to test
 * @return True if the character is considered a digit (0-9)
 */
inline bool digit(std::string::const_iterator it) {
    return digit(*it);
}


/// RFC3986 per cent encoded character test
/**
 * caller must range check (only caller knows the actual range)
 * caller must check for leading %
 *
 * @since 0.8.3
 *
 * @param it An iterator to the first character after the % sign
 * @return True if both the character pointed at by the iterator and
 *         the next one represent a valid RFC3986 percent encoding
 */
inline bool pct_encoded(std::string::const_iterator it) {
    return hexdigit(*it) && hexdigit(*(it + 1));
}

/// Tests a range for a valid IPv4 decimal octet
/**
 * @since 0.8.3
 *
 * @param start An iterator to the first character of the range to check (inclusive)
 * @param start An iterator to the last character of the range to check (exclusive)
 * @return True if the range represents a valid IPv4 decimal octet (0-255)
 */
inline bool dec_octet(std::string::const_iterator start, std::string::const_iterator end) {
    if (end-start == 1) {
        return digit(start);
    } else if (end-start == 2) {
        return ((*start >= '1' && *start <= '9') && digit(start+1));
    } else if (end-start == 3) {
        if (*start == '1') {
            return digit(start+1) && digit(start+2);
        } else if (*start == '2') {
            if (*(start+1) >= '0' && *(start+1) <= '4') {
                return digit(start+2);
            } else if (*(start+1) == '5') {
                return *(start+2) >= '0' && *(start+2) <= '5';
            }
        }
    }
    return false;
}

/// Tests a range for a valid IPv4 literal
/**
 * @since 0.8.3
 *
 * @param start An iterator to the first character of the range to check (inclusive)
 * @param start An iterator to the last character of the range to check (exclusive)
 * @return True if the range represents a valid IPv4 literal address
 */
inline bool ipv4_literal(std::string::const_iterator start, std::string::const_iterator end) {
    std::string::const_iterator cursor = start;
    size_t counter = 0;
    for (std::string::const_iterator it = start; it != end; ++it) {
        if (*it == '.') {
            if (dec_octet(cursor,it)) {
                cursor = it+1;
                counter++;
                if (counter > 3) {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
    
    // check final octet
    return (counter == 3 && dec_octet(cursor,end));
}

/// Tests a range for a valid IPv6 hex quad
/**
 * @since 0.8.3
 *
 * @param start An iterator to the first character of the range to check (inclusive)
 * @param start An iterator to the last character of the range to check (exclusive)
 * @return True if the range represents a valid IPv6 hex quad
 */
inline bool hex4(std::string::const_iterator start, std::string::const_iterator end) {
    if (end-start == 0 || end-start >4) {
        return false;
    }
    for (std::string::const_iterator it = start; it != end; ++it) {
        if (!hexdigit(*it)) {
            return false;
        }
    }
    return true;
}

/// Tests a range for a valid IPv6 literal
/**
 * @since 0.8.3
 *
 * @param start An iterator to the first character of the range to check (inclusive)
 * @param start An iterator to the last character of the range to check (exclusive)
 * @return True if the range represents a valid IPv6 literal
 */
inline bool ipv6_literal(std::string::const_iterator start, std::string::const_iterator end) {
    // initial range check
    if (end-start > 45 && end-start >= 2) {
        return false;
    }
    
    // peal off and count hex4s until we run out of colons,
    // note the abbreviation marker if we see one.
    std::string::const_iterator cursor = start;
    std::string::const_iterator it = start;
    size_t count = 0;
    size_t abbr = 0;
    while (it != end) {
        if (*it == ':') {
            if (it == start) {
                // if a : happens at the beginning, don't check for a hex quad, just advance
                // the cursor. The abbreviation marker will be counted on the next pass
                cursor++;
            } else if (it-cursor == 0) {
                // this is a double colon abbreviation marker
                cursor++;
                abbr++;
            } else if (hex4(cursor,it)) {
                cursor = it+1;
                count++;
            } else {
                return false;
            }
        }
        it++;
    }
    
    // final bit either needs to be a hex4 or an IPv4 literal
    if (cursor == end) {
        // fine
    } else if (hex4(cursor,end)) {
        count++;
    } else if (ipv4_literal(cursor, end)) {
        count += 2;
    } else {
        return false;
    }
    
    if ((abbr == 0 && count != 8) || (abbr == 1 && count > 7) || abbr > 1) {
        return false;
    }
    
    return true;
}

/// Tests a character for validity for a registry name
/**
 * will fail on %, which is valid, but only when used as a part of a multiple
 * character escape sequence. Since this test checks a single character it
 * can't tell whether a % character is valid so it returns false. The caller
 * needs to catch and handle %s in another way.
 *
 * @since 0.8.3
 *
 * @param c The character to test
 * @return True if the range represents a valid IPv6 literal
 */
inline bool reg_name(char c) {
    return unreserved(c) || sub_delim(c);
}

/// Tests a range for validity for a registry name
/**
 * @since 0.8.3
 *
 * @param start An iterator to the first character of the range to check (inclusive)
 * @param start An iterator to the last character of the range to check (exclusive)
 * @return True if the range represents a valid registry name
 */
inline bool reg_name(std::string::const_iterator start, std::string::const_iterator end) {
    std::string::const_iterator it = start;
    while (it != end) {
        if (*it == '%') {
            // check for valid % encoded char
            if (it+2 < end && uri_helper::pct_encoded(it+1)) {
                it += 3;
                continue;
            } else {
                return false;
            }
        } else if (!uri_helper::reg_name(*it)) {
            return false;
        }
        ++it;
    }
    return true;
}

} // end namespace uri_helper




class uri {
public:
    explicit uri(std::string const & uri_string) : m_valid(false), m_ipv6_literal(false) {
        std::string::const_iterator it;
        std::string::const_iterator temp;

        int state = 0;

        it = uri_string.begin();
        size_t uri_len = uri_string.length();

        // extract scheme. We only consider Websocket and HTTP URI schemes as valid
        if (uri_len >= 7 && std::equal(it,it+6,"wss://")) {
            m_secure = true;
            m_scheme = "wss";
            it += 6;
        } else if (uri_len >= 6 && std::equal(it,it+5,"ws://")) {
            m_secure = false;
            m_scheme = "ws";
            it += 5;
        } else if (uri_len >= 8 && std::equal(it,it+7,"http://")) {
            m_secure = false;
            m_scheme = "http";
            it += 7;
        } else if (uri_len >= 9 && std::equal(it,it+8,"https://")) {
            m_secure = true;
            m_scheme = "https";
            it += 8;
        } else {
            return;
        }

        // extract host.
        // either a host string
        // an IPv4 address
        // or an IPv6 address
        if (*it == '[') {
            ++it;
            // IPv6 literal
            // extract IPv6 digits until ]

            // TODO: this doesn't work on g++... not sure why
            //temp = std::find(it,it2,']');

            temp = it;
            while (temp != uri_string.end()) {
                if (*temp == ']') {
                    break;
                }
                ++temp;
            }

            if (temp == uri_string.end()) {
                return;
            } else {
                // validate IPv6 literal parts
                if (!uri_helper::ipv6_literal(it,temp)) {
                    return;
                } else {
                    m_ipv6_literal = true;
                }
                m_host.append(it,temp);
            }
            it = temp+1;
            if (it == uri_string.end()) {
                state = 2;
            } else if (*it == '/' || *it == '?' || *it == '#') {
                // todo: better path parsing
                state = 2;
                
                // we don't increment the iterator here because we want the 
                // delimiter to be read again as a part of the path
            } else if (*it == ':') {
                state = 1;

                // start reading port after the delimiter
                ++it;
            } else {
                // problem
                return;
            }
        } else {
            // IPv4 or hostname
            // extract until : or first path component
            while (state == 0) {
                if (it == uri_string.end()) {
                    state = 2;
                    break;
                } else if (*it == '%') {
                    // check for valid % encoded char
                    if (it+2 < uri_string.end() && uri_helper::pct_encoded(it+1)) {
                        m_host.append(it,it+2);
                        it += 3;
                    }
                } else if (!uri_helper::reg_name(*it)) {
                    // we hit one of the general delimiters
                    if (*it == ':') {
                        // got host vs port delimiter
                        // end hostname start port
                        state = 1;

                        // start reading port after the delimiter
                        ++it;
                    } else if (*it == '/' || *it == '#' || *it == '?') {
                        // one of the normal authority vs path delimiters
                        // end hostname and start parsing path
                        state = 2;

                        // we don't increment the iterator here because we want the 
                        // delimiter to be read again as a part of the path
                    } else {
                        // either @, [, or ]
                        // @ = userinfo fragment
                        // [ and ] = illegal, basically
                        return;
                    }
                } else {
                    m_host += *it;
                    ++it;
                }
                
            }
        }

        // parse port
        std::string port;
        while (state == 1) {
            if (it == uri_string.end()) {
                // if we stop parsing the port and there wasn't actually a port
                // we have an invalid URI
                if (port.empty()) {
                    return;
                }
                state = 3;
            } else if (uri_helper::digit(it)) {
                port += *it;
                ++it;
            } else {
                // if we stop parsing the port and there wasn't actually a port
                // we have an invalid URI
                if (port.empty()) {
                    return;
                }
                state = 3;

                // we don't increment the iterator here because we want the 
                // delimiter to be read again as a part of the path
            }
            
        }

        lib::error_code ec;
        m_port = get_port_from_string(port, ec);

        if (ec) {
            return;
        }

        // step back one so the first char of the path delimiter doesn't get eaten
        m_resource.append(it,uri_string.end());
        
        if (m_resource.empty()) {
            m_resource = "/";
        }

        // todo: validate path component


        m_valid = true;
    }

    uri(bool secure, std::string const & host, uint16_t port,
        std::string const & resource)
      : m_scheme(secure ? "wss" : "ws")
      , m_host(host)
      , m_resource(resource.empty() ? "/" : resource)
      , m_port(port)
      , m_secure(secure)
      {
          m_ipv6_literal = uri_helper::ipv6_literal(host.begin(), host.end());
          m_valid = m_ipv6_literal || uri_helper::reg_name(host.begin(), host.end());
      }

    uri(bool secure, std::string const & host, std::string const & resource)
      : m_scheme(secure ? "wss" : "ws")
      , m_host(host)
      , m_resource(resource.empty() ? "/" : resource)
      , m_port(secure ? uri_default_secure_port : uri_default_port)
      , m_secure(secure)
      {
          m_ipv6_literal = uri_helper::ipv6_literal(host.begin(), host.end());
          m_valid = m_ipv6_literal || uri_helper::reg_name(host.begin(), host.end());
      }

    uri(bool secure, std::string const & host, std::string const & port,
        std::string const & resource)
      : m_scheme(secure ? "wss" : "ws")
      , m_host(host)
      , m_resource(resource.empty() ? "/" : resource)
      , m_secure(secure)
    {
        lib::error_code ec;
        m_port = get_port_from_string(port,ec);
        m_ipv6_literal = uri_helper::ipv6_literal(host.begin(), host.end());

        m_valid = !ec && (m_ipv6_literal || uri_helper::reg_name(host.begin(), host.end()));
    }

    uri(std::string const & scheme, std::string const & host, uint16_t port,
        std::string const & resource)
      : m_scheme(scheme)
      , m_host(host)
      , m_resource(resource.empty() ? "/" : resource)
      , m_port(port)
      , m_secure(scheme == "wss" || scheme == "https")
      {
          m_ipv6_literal = uri_helper::ipv6_literal(host.begin(), host.end());
          m_valid = m_ipv6_literal || uri_helper::reg_name(host.begin(), host.end());
      }

    uri(std::string scheme, std::string const & host, std::string const & resource)
      : m_scheme(scheme)
      , m_host(host)
      , m_resource(resource.empty() ? "/" : resource)
      , m_port((scheme == "wss" || scheme == "https") ? uri_default_secure_port : uri_default_port)
      , m_secure(scheme == "wss" || scheme == "https")
      {
          m_ipv6_literal = uri_helper::ipv6_literal(host.begin(), host.end());
          m_valid = m_ipv6_literal || uri_helper::reg_name(host.begin(), host.end());
      }

    uri(std::string const & scheme, std::string const & host,
        std::string const & port, std::string const & resource)
      : m_scheme(scheme)
      , m_host(host)
      , m_resource(resource.empty() ? "/" : resource)
      , m_secure(scheme == "wss" || scheme == "https")
    {
        lib::error_code ec;
        m_port = get_port_from_string(port,ec);
        m_ipv6_literal = uri_helper::ipv6_literal(host.begin(), host.end());

        m_valid = !ec && (m_ipv6_literal || uri_helper::reg_name(host.begin(), host.end()));
    }

    bool get_valid() const {
        return m_valid;
    }

    // Check whether the host of this URI is an IPv6 literal address
    /**
     * @since 0.8.3
     * @return True if the host of this URI is an IPv6 literal address
     */
    bool is_ipv6_literal() const {
        return m_ipv6_literal;
    }

    bool get_secure() const {
        return m_secure;
    }

    std::string const & get_scheme() const {
        return m_scheme;
    }

    std::string const & get_host() const {
        return m_host;
    }

    std::string get_host_port() const {
        if (m_port == (m_secure ? uri_default_secure_port : uri_default_port)) {
            // todo: should this have brackets for v6?
            return m_host;
        } else {
            std::stringstream p;
            if (m_ipv6_literal) {
                p << "[" << m_host << "]:" << m_port;
            } else {
                p << m_host << ":" << m_port;
            }
            
            return p.str();
        }
    }

    std::string get_authority() const {
        std::stringstream p;
        if (m_ipv6_literal) {
            p << "[" << m_host << "]:" << m_port;
        } else {
            p << m_host << ":" << m_port;
        }
        return p.str();
    }

    uint16_t get_port() const {
        return m_port;
    }

    std::string get_port_str() const {
        std::stringstream p;
        p << m_port;
        return p.str();
    }

    std::string const & get_resource() const {
        return m_resource;
    }

    std::string str() const {
        std::stringstream s;

        s << m_scheme << "://";
        if (m_ipv6_literal) {
            s << "[" << m_host << "]";
        } else {
            s << m_host;
        }

        if (m_port != (m_secure ? uri_default_secure_port : uri_default_port)) {
            s << ":" << m_port;
        }

        s << m_resource;
        return s.str();
    }

    /// Return the query portion
    /**
     * Returns the query portion (after the ?) of the URI or an empty string if
     * there is none.
     *
     * @return query portion of the URI.
     */
    std::string get_query() const {
        std::size_t found = m_resource.find('?');
        if (found != std::string::npos) {
            return m_resource.substr(found + 1);
        } else {
            return "";
        }
    }

    // get fragment

    // hi <3

    // get the string representation of this URI

    //std::string base() const; // is this still needed?

    // setter methods set some or all (in the case of parse) based on the input.
    // These functions throw a uri_exception on failure.
    /*void set_uri(const std::string& uri);

    void set_secure(bool secure);
    void set_host(const std::string& host);
    void set_port(uint16_t port);
    void set_port(const std::string& port);
    void set_resource(const std::string& resource);*/
private:
    uint16_t get_port_from_string(std::string const & port, lib::error_code &
        ec) const
    {
        ec = lib::error_code();

        if (port.empty()) {
            return (m_secure ? uri_default_secure_port : uri_default_port);
        }

        unsigned int t_port = static_cast<unsigned int>(atoi(port.c_str()));

        if (t_port > 65535) {
            ec = error::make_error_code(error::invalid_port);
        }

        if (t_port == 0) {
            ec = error::make_error_code(error::invalid_port);
        }

        return static_cast<uint16_t>(t_port);
    }

    std::string m_scheme;
    std::string m_host;
    std::string m_resource;
    uint16_t    m_port;
    bool        m_secure;
    bool        m_valid;
    bool        m_ipv6_literal;
};

/// Pointer to a URI
typedef lib::shared_ptr<uri> uri_ptr;

} // namespace websocketpp

#endif // WEBSOCKETPP_URI_HPP
