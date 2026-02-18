const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration for Aarogya Connect (Expo)
 * -------------------------------------------------------------------------
 * This configuration is CRITICAL for the offline AI model. By default, 
 * Metro ignores binary files like '.onnx'. This file ensures the 
 * ONNX model is bundled into the APK so it can be read by the 
 * onnxruntime-react-native engine.
 * -------------------------------------------------------------------------
 */

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

// 1. ADD BINARY ASSET SUPPORT
// We add 'onnx' to ensure the MiniLM model weights are included.
// We add 'db' and 'sqlite' in case you bundle a pre-populated database.
resolver.assetExts.push(
  'onnx', 
  'db', 
  'sqlite', 
  'bin'
);

// 2. SOURCE EXTENSIONS
// Ensuring standard React Native and TypeScript extensions are prioritized.
resolver.sourceExts = [
  ...resolver.sourceExts, 
  'js', 
  'jsx', 
  'json', 
  'ts', 
  'tsx', 
  'cjs', 
  'mjs'
];

// 3. TRANSFORMER SETTINGS
// Standard Expo transformer settings.
config.transformer = {
  ...transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

/**
 * DEBUGGING NOTE FOR APK BUILD:
 * If the app crashes with "Could not find asset: minilm.onnx", 
 * ensure that your file is located at ./assets/model/minilm.onnx 
 * and that you have run 'npx expo start -c' to clear the Metro cache.
 */

module.exports = config;