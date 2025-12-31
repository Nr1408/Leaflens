// Minimal shim for react-native-fs so that tfjs-react-native can be bundled
// in managed Expo projects. We only implement readFile with expo-file-system.
// readFileRes is not supported (used in release builds for Android raw resources).

const FileSystem = require('expo-file-system');

module.exports = {
  readFile: async (uri, encoding = 'base64') => {
    // expo-file-system supports 'base64' string literal for Encoding
    return await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  },
  readFileRes: async () => {
    throw new Error('react-native-fs.readFileRes is not supported in Expo Go');
  },
};
