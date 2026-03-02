#!/bin/bash

UI_DIR="ui"
BUILD_DIR="$UI_DIR/dist"
TARGET_DIRS=(
    "swagger-ui-spring-boot2/src/main/resources/static"
    "swagger-ui-spring-boot3/src/main/resources/static"
)

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

echo "Build and copy completed successfully!"