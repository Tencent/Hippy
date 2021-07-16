#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  s.name             = 'hippy'
  s.version          = '2.6.6'
  s.summary          = 'hippy lib for ios'

# This description is used to generate tags and improve search results.
#   * Think: What does it do? Why did you write it? What is the focus?
#   * Try to keep it short, snappy and to the point.
#   * Write the description between the DESC delimiters below.
#   * Finally, don't worry about the indent, CocoaPods strips it!

  s.description      = <<-DESC
TODO: Add long description of the pod here.
                       DESC
  s.homepage         = 'http://hippyjs.org'
  s.license          = { :type => 'Apache2', :file => 'LICENSE' }
  s.author           = { 'mengyanluo' => 'mengyanluo@tencent.com' }
  s.source           = {:git => 'https://github.com/Tencent/Hippy.git', :tag => s.version}
  s.ios.deployment_target = '8.0'
  s.source_files = 'ios/sdk/**/*.{h,m,c,mm,s,cpp,cc}'
  s.public_header_files = 'ios/sdk/**/*.h'
  s.default_subspec = 'core'

  s.subspec 'core' do |cores|
    cores.source_files = 'core/**/*.{h,cc}'
    cores.exclude_files = ['core/include/core/napi/v8','core/src/napi/v8','core/js','core/third_party/base/src/platform/adr']
    cores.libraries = 'c++'
    #this setting causes 'There are header files outside of the header_mappings_dir'
    # cores.header_mappings_dir = 'core/include/'
    cores.xcconfig = {'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/core/third_party/base/include/ ${PODS_ROOT}/hippy/core/include/'}
  end 

  if ENV['hippy_use_frameworks']
  else
    s.user_target_xcconfig = {'OTHER_LDFLAGS' => '-force_load "${PODS_CONFIGURATION_BUILD_DIR}/hippy/libhippy.a"'}
  end
end
