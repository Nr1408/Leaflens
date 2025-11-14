// Babel config used by Expo/Metro to transpile JS/TS for React Native
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
