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

#ifndef HTTP_PARSER_RESPONSE_HPP
#define HTTP_PARSER_RESPONSE_HPP

#include <iostream>
#include <string>

#include <websocketpp/http/parser.hpp>

namespace websocketpp {
namespace http {
namespace parser {

/// Stores, parses, and manipulates HTTP responses
/**
 * http::response provides the following functionality for working with HTTP
 * responses.
 *
 * - Initialize response via manually setting each element
 * - Initialize response via reading raw bytes and parsing
 * - Once initialized, access individual parsed elements
 * - Once initialized, read entire response as raw bytes
 *
 * http::response checks for header completeness separately from the full
 * response. Once the header is complete, the Content-Length header is read to
 * determine when to stop reading body bytes. If no Content-Length is present
 * ready() will never return true. It is the responsibility of the caller to
 * consume to determine when the response is complete (ie when the connection
 * terminates, or some other metric).
 */
class response : public parser {
public:
    typedef response type;
    typedef lib::shared_ptr<type> ptr;

    response()
      : m_read(0)
      , m_buf(lib::make_shared<std::string>())
      , m_status_code(status_code::uninitialized)
      , m_state(RESPONSE_LINE) {}

    /// Process bytes in the input buffer
    /**
     * Process up to len bytes from input buffer buf. Returns the number of
     * bytes processed. Bytes left unprocessed means bytes left over after the
     * final header delimiters.
     *
     * Consume is a streaming processor. It may be called multiple times on one
     * response and the full headers need not be available before processing can
     * begin. If the end of the response was reached during this call to consume
     * the ready flag will be set. Further calls to consume once ready will be
     * ignored.
     *
     * As of 0.9.0, consume will return a status code describing the output of 
     * the operation. Earlier versions threw an `http::exception`. The status
     * code will be zero/default constructed on success and non-zero on error.
     * Typical error reasons include malformed responses, incomplete responses,
     * and max header size being reached.
     *
     * @since 0.9.0 Added ec parameter
     *
     * @param [in] buf Pointer to byte buffer
     * @param [in] len Size of byte buffer
     * @param [out] ec A status code describing the outcome of the operation.
     * @return Number of bytes processed.
     */
    size_t consume(char const * buf, size_t len, lib::error_code & ec);

    /// Process bytes in the input buffer (istream version)
    /**
     * Process bytes from istream s. Returns the number of bytes processed. 
     *
     * Consume is a streaming processor. It may be called multiple times on one
     * response and the full headers need not be available before processing can
     * begin. If the end of the response was reached during this call to consume
     * the ready flag will be set. Further calls to consume once ready will be
     * ignored.
     *
     * As of 0.9.0, consume will return a status code describing the output of 
     * the operation. Earlier versions threw an `http::exception`. The status
     * code will be zero/default constructed on success and non-zero on error.
     * Typical error reasons include malformed responses, incomplete responses,
     * and max header size being reached.
     *
     * **WARNING:** If not all the bytes were needed to complete the HTTP
     * request those bytes will still be removed from the istream and discarded.
     * If this happens an error `istream_overread` will be returned. This means
     * that the response read was successful but that some unrelated data was
     * lost. If you don't care about these bytes you can ignore the error.
     *
     * If there is an HTTP processing error and an istream overread in the same
     * call only the HTTP processing error will be returned. 
     *
     * If you might need bytes after the header in the istream you should NOT
     * use this wrapper and instead read data out of the istream directly and
     * pass it to consume(char const *, size_t, lib::error_code). This method
     * allows you to retain overread data.
     * 
     * @deprecated 0.9.0 This overload is dangerous in that it can overread the
     * stream and there isn't a good way to recover bytes lost this way. As of
     * 0.9.0 an error is raised when this situation happens, but generally, it
     * would be better for the calling application to read the stream itself and
     * call consume(char const *, size_t, lib::error_code) instead which provides
     * a better method of identifying and recovering from overreads.
     *
     * @since 0.9.0 Added ec parameter
     *
     * @param s pointer to an istream to read from
     * @param [out] ec A status code describing the outcome of the operation.
     * @return Number of bytes processed.
     */
    size_t consume(std::istream & s, lib::error_code & ec);

    /// Returns true if the response is ready.
    /**
     * @note will never return true if the content length header is not present
     */
    bool ready() const {
        return m_state == DONE;
    }

    /// Returns true if the response headers are fully parsed.
    bool headers_ready() const {
        return (m_state == BODY || m_state == DONE);
    }

    /// Returns the full raw response
    std::string raw() const;

    /// Set response status code and message
    /**
     * Sets the response status code to `code` and looks up the corresponding
     * message for standard codes. Non-standard codes will be entered as Unknown
     * use set_status(status_code::value,std::string) overload to set both
     * values explicitly.
     *
     * @since 0.9.0 Added return value
     *
     * @param code Code to set
     * @return A status code describing the outcome of the operation.
     */
    lib::error_code set_status(status_code::value code);

    /// Set response status code and message
    /**
     * Sets the response status code and message to independent custom values.
     * use set_status(status_code::value) to set the code and have the standard
     * message be automatically set.
     *
     * @since 0.9.0 Added return value
     *
     * @param code Code to set
     * @param msg Message to set
     * @return A status code describing the outcome of the operation.
     */
    lib::error_code set_status(status_code::value code, std::string const & msg);

    /// Return the response status code
    status_code::value get_status_code() const {
        return m_status_code;
    }

    /// Return the response status message
    const std::string& get_status_msg() const {
        return m_status_msg;
    }
private:
    /// Helper function for consume. Process response line
    lib::error_code process(std::string::iterator begin, std::string::iterator end);

    /// Helper function for processing body bytes
    size_t process_body(char const * buf, size_t len, lib::error_code & ec);

    enum state {
        RESPONSE_LINE = 0,
        HEADERS = 1,
        BODY = 2,
        DONE = 3
    };

    std::string                     m_status_msg;
    size_t                          m_read;
    lib::shared_ptr<std::string>    m_buf;
    status_code::value              m_status_code;
    state                           m_state;

};

} // namespace parser
} // namespace http
} // namespace websocketpp

#include <websocketpp/http/impl/response.hpp>

#endif // HTTP_PARSER_RESPONSE_HPP
