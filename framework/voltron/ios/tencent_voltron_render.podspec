#
# To learn more about a Podspec see http://guides.cocoapods.org/syntax/podspec.html.
# Run `pod lib lint flutter_render.podspec' to validate before publishing.
#
Pod::Spec.new do |s|
  s.name             = 'tencent_voltron_render'
  s.version          = '0.0.1'
  s.summary          = 'tencent_voltron_render ios plugin project.'
  s.description      = <<-DESC
The ios flutter plugin for voltron loader.
                       DESC
  s.homepage         = 'https://github.com/Tencent/Hippy'
  s.license          = { :file => '../LICENSE' }
  s.author           = { 'Your Company' => 'skindhu@tencent.com' }
  s.source           = { :path => '.' }
  s.source_files = "Classes/**/*"
  s.vendored_frameworks = '*.xcframework'
  s.libraries = 'c++'
  s.dependency 'Flutter'
  s.platform = :ios, '11.0'

  # Flutter.framework does not contain a i386 slice. Only x86_64 simulators are supported.
  # s.pod_target_xcconfig = { 'OTHER_LDFLAGS' => '-all_load' }
  s.swift_version = '5.0'

  # s.subspec 'rendercore' do |sub|
  #   sub.name = 'rendercore'
  #   sub.source_files = "RenderCore/**/*"
  #   sub.libraries = 'c++'
  # end
  
end
