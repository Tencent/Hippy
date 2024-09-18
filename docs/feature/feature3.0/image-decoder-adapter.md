# ImageDecoderAdapter

---

## 背景

3.0我们在HippyEngine引擎初始化参数中增加了ImageDecoderAdapter的设置，如果有开发者业务中有使用到特殊格式的图片，如SharpP、avif等，可以通过设置ImageDecoderAdapter来对接你的自定义图片解码器，具体接口描述如下：

## 3.0 图片解码Adapter接口定义

### ImageDecoderAdapter Public methods

   ```java
   boolean preDecode(@NonNull byte[] data, 
                     @Nullable Map<String, Object> initProps,
                     @NonNull ImageDataHolder imageHolder, 
                     @NonNull BitmapFactory.Options options);
   ```

   该接口在拉取到图片原始数据的时候会调用，解码的结果可以通过image data holder提供的setBitmap或者setDrawable接口设置到holder中，并且返回true，表示不需要sdk再做解码操作，如果返回false表示需要sdk做默认的解码操作。
                    
   ```java
   void afterDecode(@Nullable Map<String, Object> initProps, 
                    @NonNull ImageDataHolder imageHolder, 
                    @NonNull BitmapFactory.Options options);
   ```


   该接口在解码结束后会调用，为开发者提供二次处理bitmap的机会， 比如要对bitmap做高斯模糊。                

   ```java
   void destroyIfNeeded();
   ```

   引擎退出销毁时调用，释放adapter可能占用的资源
