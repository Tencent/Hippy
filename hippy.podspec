Pod::Spec.new do |s|
  s.name             = 'hippy'
  s.version          = '2.0.0'
  s.summary          = 'Hippy Cross Platform Framework'
  s.description      = <<-DESC
                        Hippy is designed for developers to easily build cross-platform and high-performance awesome apps.
                       DESC
  s.homepage         = 'https://hippyjs.org'
  s.license          = { :type => 'Apache2', :file => 'LICENSE' }
  s.author           = 'OpenHippy Team'
  s.source           = {:git => 'https://github.com/Tencent/Hippy.git', :tag => s.version}
  s.ios.deployment_target = '9.0'
  s.source_files = 'ios/sdk/**/*.{h,m,c,mm,s,cpp,cc}'
  s.public_header_files = 'ios/sdk/**/*.h'
  s.default_subspec = 'core'
  s.pod_target_xcconfig = {'DEFINES_MODULE' => 'NO'}

  s.subspec 'core' do |cores|
    cores.source_files = 'core/**/*.{h,cc}'
    cores.public_header_files = 'core/include/**/*.h'
    cores.exclude_files = ['core/include/core/napi/v8',
                           'core/src/napi/v8',
                           'core/include/core/inspector',
                           'core/src/inspector',
                           'core/js',
                           'core/third_party/base/src/platform/adr']
    cores.libraries = 'c++'
    #this setting causes 'There are header files outside of the header_mappings_dir'
    # cores.header_mappings_dir = 'core/include/'
    # Add the following custom search path for development pod
    _base_dir = File.dirname(__FILE__)
    cores.pod_target_xcconfig = {'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/hippy/core/third_party/base/include/ ${PODS_ROOT}/hippy/core/include/ #{_base_dir}/core/third_party/base/include/ #{_base_dir}/core/include/" }
  end
end
