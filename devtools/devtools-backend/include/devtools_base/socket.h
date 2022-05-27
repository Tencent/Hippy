/*
 * socket.h
 *
 * Copyright (C) 2012-2020 Nikias Bassen <nikias@gmx.li>
 * Copyright (C) 2012 Martin Szulecki <m.szulecki@libimobiledevice.org>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

#pragma once

#include <stdint.h>
#include <stdlib.h>

#ifdef __cplusplus
extern "C" {
#endif

enum fd_mode { FDM_READ, FDM_WRITE, FDM_EXCEPT };
typedef enum fd_mode fd_mode;

#ifdef WIN32
#include <winsock.h>
#include <winsock2.h>
#define SHUT_RD SD_READ
#define SHUT_WR SD_WRITE
#define SHUT_RDWR SD_BOTH
#else
#include <sys/socket.h>
#endif

#ifndef WIN32
int socket_create_unix(const char *filename);
int socket_connect_unix(const char *filename);
#endif
int socket_create(uint16_t port);
int socket_connect_addr(struct sockaddr *addr, uint16_t port);
int socket_connect(const char *addr, uint16_t port);
int socket_check_fd(int fd, fd_mode fdm, unsigned int timeout);
int socket_accept(int fd, uint16_t port);

int socket_shutdown(int fd, int how);
int socket_close(int fd);

int socket_receive(int fd, void *data, size_t size);
int socket_peek(int fd, void *data, size_t size);
int socket_receive_timeout(int fd,
                           void *data,
                           size_t size,
                           int flags,
                           unsigned int timeout);

int socket_send(int fd, void *data, size_t size);

void socket_set_verbose(int level);

const char *socket_addr_to_string(struct sockaddr *addr,
                                  char *addr_out,
                                  size_t addr_out_size);

#ifdef __cplusplus
}
#endif
