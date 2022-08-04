AUTOMAKE_OPTIONS = subdir-objects

if SEPARATE_COMPILATION
noinst_LIBRARIES = libasio.a
libasio_a_SOURCES = ../../asio.cpp
if HAVE_OPENSSL
libasio_a_SOURCES += ../../asio_ssl.cpp
endif
LDADD = libasio.a
endif

if HAVE_COROUTINES
noinst_PROGRAMS = \
	channels/throttling_proxy
endif

AM_CXXFLAGS = -I$(srcdir)/../../../include

if HAVE_COROUTINES
channels_throttling_proxy_SOURCES = channels/throttling_proxy.cpp
endif

MAINTAINERCLEANFILES = \
	$(srcdir)/Makefile.in
