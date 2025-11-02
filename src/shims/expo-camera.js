// Minimal shim for expo-camera to satisfy tfjs-react-native bundling in Expo Go
// We are not using the camera stream path; Diagnose screen uses ImagePicker or device camera via ImagePicker.

module.exports = {
  Camera: function Camera() {
    throw new Error('expo-camera is not available in this build; use ImagePicker');
  },
};
