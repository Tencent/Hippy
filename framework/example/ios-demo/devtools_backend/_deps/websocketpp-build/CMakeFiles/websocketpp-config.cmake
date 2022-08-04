# - Config file for the websocketpp package
# It defines the following variables
#  WEBSOCKETPP_FOUND - indicates that the module was found
#  WEBSOCKETPP_INCLUDE_DIR - include directories


####### Expanded from @PACKAGE_INIT@ by configure_package_config_file() #######
####### Any changes to this file will be overwritten by the next CMake run ####
####### The input file was websocketpp-config.cmake.in                            ########

get_filename_component(PACKAGE_PREFIX_DIR "${CMAKE_CURRENT_LIST_DIR}/../../../" ABSOLUTE)

macro(set_and_check _var _file)
  set(${_var} "${_file}")
  if(NOT EXISTS "${_file}")
    message(FATAL_ERROR "File or directory ${_file} referenced by variable ${_var} does not exist !")
  endif()
endmacro()

####################################################################################
set_and_check(WEBSOCKETPP_INCLUDE_DIR "${PACKAGE_PREFIX_DIR}/include")
set(WEBSOCKETPP_FOUND TRUE)

#This is a bit of a hack, but it works well. It also allows continued support of CMake 2.8
if(${CMAKE_VERSION} VERSION_GREATER 3.0.0 OR ${CMAKE_VERSION} VERSION_EQUAL 3.0.0)
  add_library(websocketpp::websocketpp INTERFACE IMPORTED)
  set_target_properties(websocketpp::websocketpp PROPERTIES INTERFACE_INCLUDE_DIRECTORIES "${WEBSOCKETPP_INCLUDE_DIR}")
endif()
