#add_subdirectory(base)

if (WIN32)
	add_subdirectory(platform/win)
elseif (APPLE)
	add_subdirectory(platform/ios)
elseif (ANDROID)
	add_subdirectory(platform/adr)
else()
	message("platform is not supported")
endif()

add_subdirectory(base)
