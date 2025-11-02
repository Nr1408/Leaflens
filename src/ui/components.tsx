import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ViewStyle, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, shadow } from './theme';
import LogoMark from './LogoMark';

export const Screen: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => (
  <LinearGradient colors={[colors.bg, colors.bg2]} style={[{ flex: 1, padding: spacing(2) }, style]}>
    {children}
  </LinearGradient>
);

export const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing(1) }}>{children}</Text>
);

export const Subtitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing(2) }}>{children}</Text>
);

export const Card: React.FC<{ children: React.ReactNode; onPress?: () => void } & { style?: ViewStyle }> = ({ children, onPress, style }) => {
  const Cmp: any = onPress ? TouchableOpacity : View;
  return (
    <Cmp activeOpacity={0.9} onPress={onPress} style={[base.card, { backgroundColor: colors.card }, style]}>{children}</Cmp>
  );
};

export const HeaderBar: React.FC<{ title: string; right?: React.ReactNode; left?: React.ReactNode; dense?: boolean }>
  = ({ title, right, left, dense }) => (
    <View style={[base.header, { backgroundColor: colors.bgAlt, borderColor: colors.divider }, dense && { paddingVertical: spacing(1.25) }]}>
      <View style={{ width: 48, alignItems: 'flex-start' }}>{left ?? <LogoMark size={28} />}</View>
      <Text style={[{ color: colors.text, fontWeight: '700', fontSize: 18 }]} numberOfLines={1}>{title}</Text>
      <View style={{ width: 48, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );

export const ActionTile: React.FC<{ label: string; icon?: React.ReactNode; onPress: () => void; color?: string }>
  = ({ label, icon, onPress, color }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[base.actionTile, { backgroundColor: color || colors.surface }]}>
      {icon}
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginTop: 8, textAlign: 'center' }}>{label}</Text>
    </TouchableOpacity>
  );

// Animated variant with subtle press scale
export const AnimatedActionTile: React.FC<{ label: string; icon?: React.ReactNode; onPress: () => void; color?: string }>
  = ({ label, icon, onPress, color }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const animate = (to: number) => Animated.timing(scale, { toValue: to, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    return (
      <Animated.View style={{ transform: [{ scale }] , flex: 1 }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={() => animate(0.97)}
          onPressOut={() => animate(1)}
          activeOpacity={0.85}
          style={[base.actionTile, { backgroundColor: color || colors.surface }]}
        >
          {icon}
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginTop: 8, textAlign: 'center' }}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

export const SeverityTag: React.FC<{ level: 'low' | 'medium' | 'high'; label?: string }>
  = ({ level, label }) => {
    const map = {
      low: { bg: colors.success, text: '#062A1F' },
      medium: { bg: colors.warning, text: '#3E2A00' },
      high: { bg: colors.danger, text: '#310000' },
    } as const;
    const cfg = map[level];
    return (
      <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
        <Text style={{ color: cfg.text, fontSize: 12, fontWeight: '700' }}>{label || level}</Text>
      </View>
    );
  };

export const SectionCard: React.FC<{ title?: string; children: React.ReactNode; footer?: React.ReactNode; style?: ViewStyle }>
  = ({ title, children, footer, style }) => (
    <View style={[base.sectionCard, { backgroundColor: colors.card }, style]}>
      {title && <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{title}</Text>}
      <View style={{ marginTop: title ? spacing(1) : 0 }}>{children}</View>
      {footer && <View style={{ marginTop: spacing(1) }}>{footer}</View>}
    </View>
  );

export const SettingRow: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode; onPress?: () => void }>
  = ({ title, subtitle, right, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[base.settingRow, { borderColor: colors.divider }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{title}</Text>
        {subtitle && <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      {right}
    </TouchableOpacity>
  );

export const ToggleRow: React.FC<{ title: string; value: boolean; onValueChange: (v: boolean) => void; subtitle?: string }>
  = ({ title, value, onValueChange, subtitle }) => (
    <SettingRow title={title} subtitle={subtitle} right={<SwitchLike on={value} onToggle={() => onValueChange(!value)} />} />
  );

const SwitchLike: React.FC<{ on: boolean; onToggle: () => void }>
  = ({ on, onToggle }) => (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8} style={[base.switchBase, { backgroundColor: on ? colors.primary : '#2F4F47' }]}> 
      <View style={[base.switchThumb, on && { transform: [{ translateX: 18 }], backgroundColor: '#fff' }]} />
    </TouchableOpacity>
  );

export const PrimaryButton: React.FC<{ title: string; onPress: () => void; disabled?: boolean; icon?: React.ReactNode }>
  = ({ title, onPress, disabled, icon }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={disabled} style={{ borderRadius: 12, overflow: 'hidden', opacity: disabled ? 0.6 : 1 }}>
    <LinearGradient colors={[colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: spacing(2), alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon}
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{title}</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

export const Input: React.FC<{ placeholder: string; value: string; onChangeText: (t: string) => void; secureTextEntry?: boolean }>
  = ({ placeholder, value, onChangeText, secureTextEntry }) => (
    <View style={[base.card, { backgroundColor: colors.card, padding: spacing(1.5) }] }>
      <TextInput placeholder={placeholder} placeholderTextColor={colors.textMuted} value={value} onChangeText={onChangeText}
        secureTextEntry={secureTextEntry} style={{ color: colors.text, fontSize: 16 }} />
    </View>
  );

const base = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: spacing(2),
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.75),
    borderRadius: 18,
    marginBottom: spacing(2),
    ...shadow,
  },
  actionTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(2),
    marginHorizontal: spacing(0.5),
  },
  sectionCard: {
    borderRadius: 18,
    padding: spacing(2),
    ...shadow,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(1.25),
    paddingHorizontal: spacing(0.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  switchBase: {
    width: 42,
    height: 24,
    borderRadius: 999,
    padding: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
});

// Small utility UI pieces
export const StatusDot: React.FC<{ ok: boolean }>
  = ({ ok }) => (
    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: ok ? colors.success : colors.danger }} />
  );

export const ConfidenceBar: React.FC<{ value: number }>
  = ({ value }) => {
    const pct = Math.max(0, Math.min(1, value));
    const tint = pct > 0.7 ? colors.success : pct > 0.4 ? colors.warning : colors.danger;
    return (
      <View style={{ height: 10, backgroundColor: '#24483F', borderRadius: 999, overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: tint }} />
      </View>
    );
  };

export const StatChip: React.FC<{ label: string; value?: string }>
  = ({ label, value }) => (
    <View style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.bgAlt, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
      <Text style={{ color: colors.text, fontWeight: '700' }}>{label}</Text>
      {value && <Text style={{ color: colors.textMuted }}>{value}</Text>}
    </View>
  );
