get_filename_component(V8_LIBS_DIR "${CMAKE_CURRENT_SOURCE_DIR}/libs/v8" REALPATH)
get_filename_component(FLEX_BOX_LIBS_DIR "${CMAKE_CURRENT_SOURCE_DIR}/libs/flexbox" REALPATH)
get_filename_component(RENDER_CORE_LIBS_DIR "${CMAKE_CURRENT_SOURCE_DIR}/libs/rendercore" REALPATH)

set(EXTERNAL_DLLS
        ${EXTERNAL_DLLS}
        ${V8_LIBS_DIR}/dll/icui18n.dll
        ${V8_LIBS_DIR}/dll/icuuc.dll
        ${V8_LIBS_DIR}/dll/v8.dll
        ${V8_LIBS_DIR}/dll/v8_libbase.dll
        ${V8_LIBS_DIR}/dll/v8_libplatform.dll
        ${V8_LIBS_DIR}/dll/zlib.dll
        ${FLEX_BOX_LIBS_DIR}/dll/flexbox.dll
        ${RENDER_CORE_LIBS_DIR}/dll/rendercore.dll
        ${V8_LIBS_DIR}/lib/snapshot_blob.bin)

if(ENABLE_DEBUG)
    set(EXTERNAL_DLLS
        ${EXTERNAL_DLLS}
        ${V8_LIBS_DIR}/lib/v8.dll.pdb
        ${V8_LIBS_DIR}/lib/v8_libbase.dll.pdb
        ${V8_LIBS_DIR}/lib/v8_libplatform.dll.pdb
        ${V8_LIBS_DIR}/lib/zlib.dll.pdb
        ${FLEX_BOX_LIBS_DIR}/lib/flexbox.pdb
        ${RENDER_CORE_LIBS_DIR}/lib/rendercore.pdb)
endif(ENABLE_DEBUG)

