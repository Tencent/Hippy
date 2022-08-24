include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")

# region footstone
GlobalPackages_Add(footstone)
set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} footstone)
# endregion

# region js_driver
add_subdirectory(${PROJECT_ROOT_DIR}/driver/js ${CMAKE_CURRENT_BINARY_DIR}/driver/js)
set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} js_driver)
# endregion

# region dom
GlobalPackages_Add(dom)
set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} dom)
# endregion
