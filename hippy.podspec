#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  puts 'hippy.podspec read begins'
  s.name             = 'hippy'
  s.version          = '2.0.0'
  s.summary          = 'Hippy Cross Platform Framework'

# This description is used to generate tags and improve search results.
#   * Think: What does it do? Why did you write it? What is the focus?
#   * Try to keep it short, snappy and to the point.
#   * Write the description between the DESC delimiters below.
#   * Finally, don't worry about the indent, CocoaPods strips it!

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
  s.framework = 'JavaScriptCore'
  s.libraries = 'c++'


  s.subspec 'core' do |cores|
    puts 'hippy subspec \'core\' read begins'
    cores.source_files = 'core/**/*.{h,cc}'
    cores.public_header_files = 'core/include/**/*.h'
    cores.exclude_files = ['core/include/core/napi/v8','core/src/napi/v8','core/js','core/third_party/base/src/platform/adr', 'core/include/core/inspector', 'core/src/inspector']
    #this setting causes 'There are header files outside of the header_mappings_dir'
    # cores.header_mappings_dir = 'core/include/'
    cores.xcconfig = {'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/core/third_party/base/include/ ${PODS_ROOT}/hippy/core/include/'}
    puts 'hippy subspec \'core\' read end'
  end 
end
