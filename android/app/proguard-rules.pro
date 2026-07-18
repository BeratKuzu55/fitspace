# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
# TensorFlow Lite hatalarını bastırmak için
-dontwarn org.tensorflow.lite.**
-keep class org.tensorflow.lite.** { *; }

# Özellikle hata veren GPU Delegate için
-dontwarn org.tensorflow.lite.gpu.**
-keep class org.tensorflow.lite.gpu.** { *; }

# Genel TensorFlow uyarılarını engellemek için
-dontwarn org.tensorflow.**