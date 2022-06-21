#add_subdirectory(footstone)
if (APPLE)
	add_subdirectory(platform/ios)
elseif (ANDROID)
	add_subdirectory(platform/adr)
endif()

