#!/bin/bash

UI_DIR="ui"
BUILD_DIR="$UI_DIR/dist"
TARGET_DIRS=(
    "yudao-swagger-new-ui-boot-starter/src/main/resources/static"
)
STARTER_DIR="yudao-swagger-new-ui-boot-starter"

echo "Building React project for Java..."
cd "$UI_DIR" || exit 1
npm run build:java || exit 1
cd ..

echo "Copying build files to target directories..."
for TARGET_DIR in "${TARGET_DIRS[@]}"; do
    echo "Cleaning and copying to $TARGET_DIR..."
    rm -rf "$TARGET_DIR"
    cp -r "$BUILD_DIR" "$TARGET_DIR"
done

echo "Installing yudao-swagger-new-ui-boot-starter with JDK 8..."
cd "$STARTER_DIR" || exit 1

# 设置 JDK 8 环境变量（如果需要）
# 如果系统有 JAVA_HOME 配置，可以取消下面的注释并修改路径
# export JAVA_HOME=/path/to/jdk8
# export PATH=$JAVA_HOME/bin:$PATH

mvn clean install -DskipTests || exit 1
cd ..

echo "Build and install completed successfully!"
