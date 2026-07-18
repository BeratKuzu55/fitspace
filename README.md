# exereyes-mobile

npm i

Bağımlılık güncellemelerinde temiz kurulum için

rm node_modules android/.gradle android/app/build android/build package-lock.json

cd android
./gradlew clean
./gradlew assembleDebug
./gradlew build

cd ..
npx react-native start --reset-cache
