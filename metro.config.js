// @ts-check
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const base = getDefaultConfig(__dirname);

module.exports = {
  ...base,
  resolver: {
    ...(base.resolver || {}),
    assetExts: [
      ...((base.resolver && base.resolver.assetExts) || []),
      'bin',
      'tflite'
    ],
  },
};
