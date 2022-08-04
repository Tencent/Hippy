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

#ifndef HTTP_PARSER_REQUEST_IMPL_HPP
#define HTTP_PARSER_REQUEST_IMPL_HPP

#include <algorithm>
#include <sstream>
#include <string>

#include <websocketpp/http/parser.hpp>

namespace websocketpp {
namespace http {
namespace parser {

inline size_t request::consume(char const * buf, size_t len, lib::error_code & ec)
{
    size_t bytes_processed = 0;
    
    if (m_ready) {
        // the request is already complete. End immediately without reading.
        ec = lib::error_code();
        return 0;
    }
    
    if (m_body_bytes_needed > 0) {
        // The headers are complete, but we are still expecting more body
        // bytes. Process body bytes.
        bytes_processed = process_body(buf, len, ec);
        if (ec) {
            return bytes_processed;
        }

        // if we have ready all the expected body bytes set the ready flag
        if (body_ready()) {
            m_ready = true;
        }
        return bytes_processed;
    }

    // at this point we have an incomplete request still waiting for headers

    // copy new candidate bytes into our local buffer. This buffer may have
    // leftover bytes from previous calls. Not all of these bytes are 
    // necessarily header bytes (they might be body or even data after this
    // request entirely for a keepalive request)
    m_buf->append(buf,len);

    // Search for delimiter in buf. If found read until then. If not read all
    std::string::iterator begin = m_buf->begin();
    std::string::iterator end;

    for (;;) {
        // search for line delimiter in our local buffer
        end = std::search(
            begin,
            m_buf->end(),
            header_delimiter,
            header_delimiter+sizeof(header_delimiter)-1
        );

        if (end == m_buf->end()) {
            // we didn't find the delimiter

            // check that the confirmed header bytes plus the outstanding
            // candidate bytes do not put us over the header size limit.
            if (m_header_bytes + (end - begin) > max_header_size) {
                ec = error::make_error_code(error::request_header_fields_too_large);
                return 0;
            }

            // We are out of bytes but not over any limits yet. Discard the
            // processed bytes and copy the remaining unprecessed bytes to the 
            // beginning of the buffer in prep for another call to consume.
            
            // If there are no processed bytes in the buffer right now don't
            // copy the unprocessed ones over themselves.
            if (begin != m_buf->begin()) {
                std::copy(begin,end,m_buf->begin());
                m_buf->resize(static_cast<std::string::size_type>(end-begin));
            }

            ec = lib::error_code();
            return len;
        }

        // at this point we have found a delimiter and the range [begin,end)
        // represents a line to be processed

        // update count of header bytes read so far
        m_header_bytes += (end-begin+sizeof(header_delimiter));
        

        if (m_header_bytes > max_header_size) {
            // This read exceeded max header size
            ec = error::make_error_code(error::request_header_fields_too_large);
            return 0;
        }

        if (end-begin == 0) {
            // we got a blank line, which indicates the end of the headers

            // If we never got a valid method or are missing a host header then
            // this request is invalid.
            if (m_method.empty() || get_header("Host").empty()) {
                ec = error::make_error_code(error::incomplete_request);
                return 0;
            }

            // any bytes left over in the local buffer are bytes we didn't use.
            // When we report how many bytes we consumed we need to subtract
            // these so the caller knows that they need to be processed by some
            // other logic.
            bytes_processed = (
                len - static_cast<std::string::size_type>(m_buf->end()-end)
                    + sizeof(header_delimiter) - 1
            );

            // frees memory used temporarily during request parsing
            m_buf.reset();

            // if this was not an upgrade request and has a content length
            // continue capturing content-length bytes and expose them as a 
            // request body.
            
            bool need_more = prepare_body(ec);
            if (ec) {
                return 0;
            }

            if (need_more) {
                bytes_processed += process_body(buf+bytes_processed,len-bytes_processed,ec);
                if (ec) {
                    return 0;
                }
                if (body_ready()) {
                    m_ready = true;
                }
                ec = lib::error_code();
                return bytes_processed;
            } else {
                m_ready = true;

                // return number of bytes processed (starting bytes - bytes left)
                ec = lib::error_code();
                return bytes_processed;
            }
        } else {
            // we got a line with content
            if (m_method.empty()) {
                // if we haven't found a method yet process this line as a first line
                ec = this->process(begin, end);
            } else {
                // this is a second (or later) line, process as a header
                ec = this->process_header(begin, end);
            }
            if (ec) {
                return 0;
            }
        }

        // if we got here it means there is another header line to read.
        // advance our cursor to the first character after the most recent
        // delimiter found.
        begin = end+(sizeof(header_delimiter)-1);

    }
}

inline std::string request::raw() const {
    // TODO: validation. Make sure all required fields have been set?
    std::stringstream ret;

    ret << m_method << " " << m_uri << " " << get_version() << "\r\n";
    ret << raw_headers() << "\r\n" << m_body;

    return ret.str();
}

inline std::string request::raw_head() const {
    // TODO: validation. Make sure all required fields have been set?
    std::stringstream ret;

    ret << m_method << " " << m_uri << " " << get_version() << "\r\n";
    ret << raw_headers() << "\r\n";

    return ret.str();
}

inline lib::error_code request::set_method(std::string const & method)
{
    if (std::find_if(method.begin(),method.end(),is_not_token_char) != method.end()) {
        return error::make_error_code(error::invalid_format);
    }

    m_method = method;
    return lib::error_code();
}

inline lib::error_code request::set_uri(std::string const & uri) {
    // TODO: validation?
    m_uri = uri;

    return lib::error_code();
}

inline lib::error_code request::process(std::string::iterator begin, std::string::iterator
    end)
{
    lib::error_code ec;

    std::string::iterator cursor_start = begin;
    std::string::iterator cursor_end = std::find(begin,end,' ');

    if (cursor_end == end) {
        return error::make_error_code(error::incomplete_request);
    }

    ec = set_method(std::string(cursor_start,cursor_end));
    if (ec) { return ec; }

    cursor_start = cursor_end+1;
    cursor_end = std::find(cursor_start,end,' ');

    if (cursor_end == end) {
        return error::make_error_code(error::incomplete_request);
    }

    ec = set_uri(std::string(cursor_start,cursor_end));
    if (ec) { return ec; }

    return set_version(std::string(cursor_end+1,end));
}

} // namespace parser
} // namespace http
} // namespace websocketpp

#endif // HTTP_PARSER_REQUEST_IMPL_HPP
