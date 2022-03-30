#
# To learn more about a Podspec see http://guides.cocoapods.org/syntax/podspec.html.
# Run `pod lib lint tencent_voltron_render.podspec` to validate before publishing.
#
Pod::Spec.new do |s|
  s.name             = 'tencent_voltron_render'
  s.version          = '0.0.1'
  s.summary          = 'tencent_voltron_render macos plugin project.'
  s.description      = <<-DESC
The macos flutter plugin for voltron loader.
                       DESC
  s.homepage         = 'https://github.com/Tencent/Hippy'
  s.license          = { :file => '../LICENSE' }
  s.author           = { 'Your Company' => 'skindhu@tencent.com' }
  s.source           = { :path => '.' }
  s.source_files     = 'Classes/**/*'
  s.vendored_frameworks = '*.framework'
  s.libraries = 'c++'
  s.dependency 'FlutterMacOS'

  s.platform = :osx, '10.11'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.swift_version = '5.0'
end
