import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './theme';
import { Leaf } from 'lucide-react-native';

// Green rounded-square tile with white leaf outline (matches the reference image)
export const LogoMark: React.FC<{ size?: number }> = ({ size = 36 }) => {
  const icon = Math.round(size * 0.62);
  const stroke = Math.max(1.8, Math.round(size * 0.08));
  const radius = Math.max(10, Math.round(size * 0.28));

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Leaf color="#FFFFFF" size={icon} strokeWidth={Math.min(2.4, Math.max(1.8, size * 0.08))} />
    </LinearGradient>
  );
};

export default LogoMark;
