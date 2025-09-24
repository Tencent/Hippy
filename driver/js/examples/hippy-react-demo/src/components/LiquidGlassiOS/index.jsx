import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
} from '@hippy/react';

import defaultSource from '../Image/defaultSource.jpg';

const LiquidGlassDemo = () => {
  const [glassEffectEnabled, setGlassEffectEnabled] = useState(true);
  const [glassEffectTintColor, setGlassEffectTintColor] = useState('#feca57');
  const [glassEffectInteractive, setGlassEffectInteractive] = useState(true);
  const [glassEffectContainerSpacing, setGlassEffectContainerSpacing] = useState(10);
  const [glassEffectStyle, setGlassEffectStyle] = useState('regular'); // 'regular' or 'clear'

  const toggleGlassEffect = () => {
    setGlassEffectEnabled(!glassEffectEnabled);
  };

  const generateRandomColor = () => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
      '#10ac84', '#ee5a24', '#0984e3', '#6c5ce7', '#a29bfe',
      '#fd79a8', '#fdcb6e', '#e17055', '#81ecec', '#74b9ff',
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    setGlassEffectTintColor(colors[randomIndex]);
  };

  const toggleInteractive = () => {
    setGlassEffectInteractive(!glassEffectInteractive);
  };

  const changeSpacing = () => {
    const spacings = [5, 10, 15, 20, 25];
    const currentIndex = spacings.indexOf(glassEffectContainerSpacing);
    const nextIndex = (currentIndex + 1) % spacings.length;
    setGlassEffectContainerSpacing(spacings[nextIndex]);
  };

  const toggleGlassStyle = () => {
    setGlassEffectStyle(glassEffectStyle === 'regular' ? 'clear' : 'regular');
  };

  // 液态玻璃效果样式
  const liquidGlassStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f7',
    },
    scrollContainer: {
      flex: 1,
    },
    backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    contentContainer: {
      padding: 20,
    },
    controlsContainer: {
      justifyContent: 'space-around',
      marginBottom: 30,
    },
    glassButton: {
      height: 50,
      marginHorizontal: 20,
      marginBottom: 15,
      borderRadius: 18,
      glassEffectEnabled,
      glassEffectStyle,
    },
    fusionContainer: {
      flex: 1,
      flexDirection: 'row',
      glassEffectContainerSpacing,
    },
    fusionItem: {
      flex: 1,
      height: 60,
      borderRadius: 30,
      glassEffectEnabled,
      glassEffectInteractive,
      glassEffectStyle,
    },
    buttonText: {
      textAlign: 'center',
      lineHeight: 50,
    },
    propertyInfo: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 20,
      marginTop: 40,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    propertyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    propertyLabel: {
      color: '#1d1d1f',
      fontSize: 14,
      fontWeight: '500',
    },
    propertyValue: {
      color: '#007aff',
      fontSize: 14,
      fontWeight: '600',
    },
    colorPreview: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    platformNote: {
      marginTop: 300,
      backgroundColor: 'rgba(255, 149, 0, 0.8)',
      borderRadius: 12,
      padding: 16,
    },
    platformNoteText: {
      fontSize: 12,
      color: '#fff',
      textAlign: 'center',
      lineHeight: 18,
    },
  });

  return (
    <View style={liquidGlassStyles.container}>
      {/* 全局背景图 */}
      <Image
        defaultSource={defaultSource}
        style={liquidGlassStyles.backgroundImage}
        resizeMode="cover"
      />

      <ScrollView style={liquidGlassStyles.scrollContainer}>
        <View style={liquidGlassStyles.contentContainer}>

          {/* 液态玻璃交互控件演示 */}
          <View style={liquidGlassStyles.controlsContainer}>
            <View style={liquidGlassStyles.glassButton}
                  onClick={toggleGlassEffect}>
              <Text style={liquidGlassStyles.buttonText}>
                {glassEffectEnabled ? '关闭' : '开启'}
              </Text>
            </View>
            <View style={[liquidGlassStyles.glassButton, { glassEffectTintColor }]}
                  onClick={generateRandomColor}>
              <Text style={liquidGlassStyles.buttonText}>随机颜色</Text>
            </View>
            <View style={[liquidGlassStyles.glassButton]}
                  onClick={toggleInteractive}>
              <Text style={liquidGlassStyles.buttonText}>
                {glassEffectInteractive ? '关闭交互' : '开启交互'}
              </Text>
            </View>
            <View style={liquidGlassStyles.glassButton}
                  onClick={changeSpacing}>
              <Text style={liquidGlassStyles.buttonText}>调整间距</Text>
            </View>
            <View style={liquidGlassStyles.glassButton}
                  onClick={toggleGlassStyle}>
              <Text style={liquidGlassStyles.buttonText}>
                {glassEffectStyle === 'regular' ? 'Clear样式' : 'Regular样式'}
              </Text>
            </View>
          </View>

          {/* 融合效果演示 */}
          <View style={liquidGlassStyles.fusionContainer}>
            <View style={liquidGlassStyles.fusionItem} />
            <View style={liquidGlassStyles.fusionItem} />
            <View style={liquidGlassStyles.fusionItem} />
          </View>

          {/* 属性信息展示 */}
          <View style={liquidGlassStyles.propertyInfo}>
            <View style={liquidGlassStyles.propertyItem}>
              <Text style={liquidGlassStyles.propertyLabel}>glassEffectEnabled:</Text>
              <Text style={liquidGlassStyles.propertyValue}>{glassEffectEnabled ? 'true' : 'false'}</Text>
            </View>
            <View style={liquidGlassStyles.propertyItem}>
              <Text style={liquidGlassStyles.propertyLabel}>glassEffectTintColor:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[liquidGlassStyles.colorPreview, { backgroundColor: glassEffectTintColor }]} />
                <Text style={[liquidGlassStyles.propertyValue, { marginLeft: 8 }]}>{glassEffectTintColor}</Text>
              </View>
            </View>
            <View style={liquidGlassStyles.propertyItem}>
              <Text style={liquidGlassStyles.propertyLabel}>glassEffectInteractive:</Text>
              <Text style={liquidGlassStyles.propertyValue}>{glassEffectInteractive ? 'true' : 'false'}</Text>
            </View>
            <View style={liquidGlassStyles.propertyItem}>
              <Text style={liquidGlassStyles.propertyLabel}>glassEffectContainerSpacing:</Text>
              <Text style={liquidGlassStyles.propertyValue}>{glassEffectContainerSpacing}</Text>
            </View>
            <View style={liquidGlassStyles.propertyItem}>
              <Text style={liquidGlassStyles.propertyLabel}>glassEffectStyle:</Text>
              <Text style={liquidGlassStyles.propertyValue}>
                {glassEffectStyle === 'regular' ? 'Regular' : 'Clear'}
              </Text>
            </View>
          </View>

          {/* 平台说明 */}
          <View style={liquidGlassStyles.platformNote}>
            <Text style={liquidGlassStyles.platformNoteText}>
              {Platform.OS === 'ios'
                ? '仅 iOS 26+ 支持 Liquid Glass 效果'
                : 'Android 平台暂不支持 Liquid Glass 效果，仅展示属性配置'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LiquidGlassDemo;

