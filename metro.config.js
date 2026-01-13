const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
    // Adds support for `.lottie` files
    'lottie',
    'mp4',
    'MP4'
);

module.exports = config;
