# -*- coding: utf-8 -*-
import os
import re
import sys
import shutil
import subprocess
from argparse import ArgumentParser

_SUPPORT_OS = ['android', 'ios', 'macosx', 'windows']
_SUPPORT_ARCHES_ANDROID = ['all', 'armeabi-v7a', 'arm64-v8a']
_SUPPORT_ARCHES_IOS = ['all', 'arm64', 'x86_64']
_SUPPORT_ARCHES_MAC = ['x86_64']

# 编译变量
_BUILD_OS: str = ''
_BUILD_ARCH: str = ''
_BUILD_ARCCHES: list = []
_IS_REBUILD: bool = False

_LIB_NAME = 'voltron_core'
_ORIGIN_PATH: str = os.path.abspath(os.path.dirname(__file__))
_SRC_TOP_PATH: str = os.path.join(_ORIGIN_PATH, '../core')
_CMAKE_PATH: str = os.path.join(_SRC_TOP_PATH)
_OUTPUT_DIR: str = os.path.join(_ORIGIN_PATH, '../build')

def main():
    parser = ArgumentParser(description='Build the crossing lib for android|ios|macosx')
    parser.add_argument('-os', metavar='os', type=str, help='Select one of android|ios|macosx',
                        choices=_SUPPORT_OS, required=True)
    parser.add_argument('-arch', metavar='arch', type=str, help='''
        Specify the CPU architecture.
        For Android, available architectures are: all, x86, armeabi-v7a, arm64-v8a.
        For iOS, available architectures are: all, armv7, armv7s, arm64, i386, x86_64, mac_catalyst_x86_64.
        When you specify all, libraries for all the architectures will be built, and then combined into a fat library.
        For MacOSX, you don't need to specify it. It's default to x86_64.
    ''', default='', required=False)
    parser.add_argument('-rebuild', action='store_true', help='Clean before building',
                        required=False)
    args = parser.parse_args()
    check_args(args)
    check_env(args)
    start_build(args)

def start_build(args):
    print_info('start build, args: {}'.format(args))
    if args.arch == 'all':
        if args.os == 'android':
            _BUILD_ARCCHES.extend(['armeabi-v7a', 'arm64-v8a'])
        elif args.os == 'ios':
            _BUILD_ARCCHES.extend(['arm64', 'x86_64'])
    else:
        _BUILD_ARCCHES.append(args.arch)

    # 创建输出目录
    if os.path.exists(_OUTPUT_DIR) is False:
        os.makedirs(_OUTPUT_DIR)

    if _BUILD_OS == 'android':
        build_android(args)
    elif _BUILD_OS == 'ios':
        build_ios(args)
    elif _BUILD_OS == 'macosx':
        build_macosx(args)
    else:
        print_error('Unknown target os: {}'.format(build_ios), True)
    pass


def build_android(args):
    project_dir = os.path.abspath('../example/android')
    subprocess.run([f'{project_dir}/gradlew', 'clean'],
                   stdout=sys.stdout, stderr=sys.stderr, cwd=project_dir,
                   check=True)
    subprocess.run([f'{project_dir}/gradlew', 'build'],
                   stdout=sys.stdout, stderr=sys.stderr, cwd=project_dir,
                   check=True)


def build_ios(args):
    lib_output_dir_base = os.path.join(_OUTPUT_DIR, _BUILD_OS)
    for arch in _BUILD_ARCCHES:
        cmake_build_dir = os.path.join(_OUTPUT_DIR, 'CMakeOutput/{}/{}'.format(_BUILD_OS, arch))
        if _IS_REBUILD:
            shutil.rmtree(cmake_build_dir, ignore_errors=True)
        os.makedirs(cmake_build_dir, exist_ok=True)

        lib_output_dir = os.path.join(lib_output_dir_base, arch)
        os.makedirs(lib_output_dir, exist_ok=True)
        cmake_args = f'-H{_CMAKE_PATH} ' \
                     f'-B{cmake_build_dir} ' \
                     '-G\"Xcode\" ' \
                     '-DCMAKE_SYSTEM_NAME=iOS ' \
                     f'-DCMAKE_TOOLCHAIN_FILE={_ORIGIN_PATH}/ios.toolchain.cmake ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_IPHONEOS_DEPLOYMENT_TARGET=12.0 ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_VALID_ARCHS=\"armv7 arm64 x86_64\" ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_ONLY_ACTIVE_ARCH=NO ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_CLANG_ENABLE_OBJC_ARC=YES ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_ENABLE_BITCODE=NO ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_CLANG_ENABLE_OBJC_WEAK=YES ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_GCC_GENERATE_DEBUGGING_SYMBOLS=YES ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_DEPLOYMENT_POSTPROCESSING=NO ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_STRIP_INSTALLED_PRODUCT=NO ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_DEFINES_MODULE=YES ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_DYLIB_COMPATIBILITY_VERSION=1 ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_DYLIB_CURRENT_VERSION=1 ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_CURRENT_PROJECT_VERSION=1 ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_SKIP_INSTALL=YES ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_PRODUCT_BUNDLE_IDENTIFIER=com.tencent.RenderCore ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_DYLIB_INSTALL_NAME_BASE=@rpath ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_LD_RUNPATH_SEARCH_PATHS=' \
                     '\"@executable_path/../Frameworks @loader_path/Frameworks\" ' \
                     f'-DCMAKE_XCODE_ATTRIBUTE_GCC_PREFIX_HEADER={_ORIGIN_PATH}' \
                     f'/../RenderCore/RenderCore/PrefixHeader.pch ' \
                     '-DCMAKE_XCODE_LINK_BUILD_PHASE_MODE=BUILT_ONLY ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_STRIP_STYLE=\"Debugging Symbols\" ' \
                     f'-DENABLED_UNIT_TEST=OFF ' \
                     f'-DCMAKE_LIBRARY_NAME={_LIB_NAME} '
        check_result(os.system(f'cmake {cmake_args}'))
        os.chdir(cmake_build_dir)
        sdk = 'iphoneos'
        if arch == 'x86_64':
            sdk = 'iphonesimulator'
        check_result(os.system(f'xcodebuild '
                               f'-target {_LIB_NAME} '
                               f'-configuration RelWithDebInfo -arch {arch} '
                               f'-sdk {sdk} CONFIGURATION_BUILD_DIR={lib_output_dir}'))
    # 合并为xcframework
    os.chdir(lib_output_dir_base)
    os.system(f'rm -rf {lib_output_dir_base}/{_LIB_NAME}.xcframework ')
    frameworks = ''
    for arch in _BUILD_ARCCHES:
        lib_output_dir = os.path.join(lib_output_dir_base, arch)
        frameworks += f' -framework {lib_output_dir}/{_LIB_NAME}.framework '
    check_result(os.system(f'xcodebuild -create-xcframework '
                           f'{frameworks} '
                           f'-output {lib_output_dir_base}/{_LIB_NAME}.xcframework '))

def build_macosx(args):
    lib_output_dir_base = os.path.join(_OUTPUT_DIR, _BUILD_OS)
    for arch in _BUILD_ARCCHES:
        cmake_build_dir = os.path.join(_OUTPUT_DIR, 'CMakeOutput/{}/{}'.format(_BUILD_OS, arch))
        if _IS_REBUILD:
            shutil.rmtree(cmake_build_dir, ignore_errors=True)
        os.makedirs(cmake_build_dir, exist_ok=True)

        lib_output_dir = os.path.join(lib_output_dir_base, arch)
        os.makedirs(lib_output_dir, exist_ok=True)
        cmake_args = f'-H{_CMAKE_PATH} ' \
                     f'-B{cmake_build_dir} ' \
                     '-G\"Xcode\" ' \
                     '-DCMAKE_SYSTEM_NAME=Darwin ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_MACOSX_DEPLOYMENT_TARGET=10.15 ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_CLANG_ENABLE_OBJC_ARC=YES ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_CLANG_ENABLE_OBJC_WEAK=YES ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_GCC_GENERATE_DEBUGGING_SYMBOLS=YES ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_DEPLOYMENT_POSTPROCESSING=NO ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_STRIP_INSTALLED_PRODUCT=NO ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_DEFINES_MODULE=YES ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_DYLIB_COMPATIBILITY_VERSION=1 ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_DYLIB_CURRENT_VERSION=1 ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_CURRENT_PROJECT_VERSION=1 ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_SKIP_INSTALL=YES ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_PRODUCT_BUNDLE_IDENTIFIER=' \
                     'com.tencent.RenderCore ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_DYLIB_INSTALL_NAME_BASE=@rpath ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_LD_RUNPATH_SEARCH_PATHS=' \
                     '\"@executable_path/../Frameworks @loader_path/Frameworks\" ' \
                     f'-DCMAKE_XCODE_ATTRIBUTE_GCC_PREFIX_HEADER={_ORIGIN_PATH}' \
                     f'/../RenderCore/RenderCore/PrefixHeader.pch ' \
                     '-DCMAKE_XCODE_LINK_BUILD_PHASE_MODE=BUILT_ONLY ' \
                     '-DCMAKE_XCODE_ATTRIBUTE_STRIP_STYLE=\"Debugging Symbols\" ' \
                     f'-DCMAKE_LIBRARY_NAME={_LIB_NAME} '
        print(f'cmake_args: ${cmake_args}')
        check_result(os.system(f'cmake {cmake_args}'))
        os.chdir(cmake_build_dir)
        configuration = 'RelWithDebInfo'
        check_result(os.system(f'xcodebuild '
                               f'-target {_LIB_NAME} '
                               f'-configuration {configuration} '
                               '-sdk macosx'))
        subdir = _LIB_NAME + '.framework'
        dstdir = os.path.join(lib_output_dir, subdir)
        if os.path.exists(dstdir) is True:
            shutil.rmtree(dstdir)
        shutil.copytree(os.path.join(cmake_build_dir, configuration, subdir), dstdir, symlinks=True)


def check_env(args):
    if not shutil.which('cmake'):
        print_error('Could not find cmake! Please check your env!', True)
    if args.os == 'android':
        if 'ANDROID_NDK_HOME' not in os.environ:
            print_error('ANDROID_NDK_HOME env not set!', True)
        if 'ANDROID_HOME' not in os.environ:
            print_error('ANDROID_HOME env not set! Ignore build aar library!')
        if 'JAVA_HOME' not in os.environ:
            print_error('JAVA_HOME env not set! Ignore build aar library!')


def check_args(args):
    global _BUILD_OS, _BUILD_ARCH, _IS_REBUILD
    _IS_REBUILD = args.rebuild
    _BUILD_OS = args.os
    _BUILD_ARCH = args.arch
    # check os
    if args.os not in _SUPPORT_OS:
        print_error('args: os is invalid! Must be one of: {}'.format(str(_SUPPORT_OS)))
    # check arch
    if args.os == 'android':
        support_arches = _SUPPORT_ARCHES_ANDROID
    elif args.os == 'ios':
        support_arches = _SUPPORT_ARCHES_IOS
    else:
        if args.arch == '':
            args.arch = 'x86_64'
        support_arches = _SUPPORT_ARCHES_MAC
    if args.arch not in support_arches:
        print_error("args: arch is invalid! Must be one of: {} on {} platform."
                    .format(str(support_arches), args.os), True)


def print_info(info):
    print("\033[1;32m{}\033[0m".format(info))


def print_error(error, exit_build=False):
    print("\033[1;31m{}\033[0m".format(error))
    if exit_build:
        exit(1)


def check_result(status_code):
    if status_code != 0:
        print_error('Check result failed!', True)


if __name__ == '__main__':
    main()