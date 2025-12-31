// Community screen
// A very lightweight forum: list posts, create/edit/delete, filter by category.
// Data comes from Supabase when available, otherwise falls back to AsyncStorage.
import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Screen, SectionCard, Card, PrimaryButton } from '../ui/components';
import { colors, spacing } from '../ui/theme';
import AppHeader from '../ui/AppHeader';
import { COMMUNITY_CATEGORIES, CommunityCategory, CommunityPost, createPost, deletePost, listPosts, updatePost } from '../services/community';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../state/AuthContext';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Community'>;

export default function CommunityScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [posts, setPosts] = React.useState<CommunityPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<CommunityPost | null>(null);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [category, setCategory] = React.useState<CommunityCategory>('General');
  const [categoryOpen, setCategoryOpen] = React.useState(false);

  React.useEffect(() => {
    // Load posts once on mount.
    (async () => {
      setLoading(true);
      setPosts(await listPosts());
      setLoading(false);
    })();
  }, []);

  const resetForm = () => { setTitle(''); setContent(''); setCategory('General'); setEditing(null); setCategoryOpen(false); };

  const openCreate = () => { resetForm(); setShowModal(true); };
  const openEdit = (p: CommunityPost) => { setEditing(p); setTitle(p.title); setContent(p.content); setCategory(p.category); setShowModal(true); };

  const onSubmit = async () => {
    if (!title.trim()) return;
    if (editing) {
      await updatePost(editing.id, { title: title.trim(), content: content.trim(), category });
    } else {
      await createPost({ title: title.trim(), content: content.trim(), category, author_name: (user?.username || user?.email) ?? null });
    }
    // Refresh the list after any create/update.
    setPosts(await listPosts());
    setShowModal(false);
    resetForm();
  };

  const onDelete = async (id: string) => {
    await deletePost(id);
    // Refresh after delete.
    setPosts(await listPosts());
  };

  const timeAgo = (ms: number) => {
    const diff = Date.now() - ms; const s = Math.floor(diff / 1000);
    if (s < 45) return t('justNow'); const m = Math.floor(s / 60);
    if (m < 60) return `${m}${t('minuteShort')} ${t('ago')}`; const h = Math.floor(m / 60);
    if (h < 24) return `${h}${t('hourShort')} ${t('ago')}`; const d = Math.floor(h / 24);
    return `${d}${t('dayShort')} ${t('ago')}`;
  };

  return (
    <Screen>
      <AppHeader
        title={t('brand')}
        onHome={() => navigation.navigate('Home')}
        onCommunity={() => navigation.navigate('Community')}
        onHistory={() => navigation.navigate('History')}
        onProfile={() => navigation.navigate('Profile')}
      />
      <SectionCard title={t('community')} style={{ marginBottom: spacing(2) }}>
        <Text style={{ color: colors.textMuted }}>{t('communitySubtitle')}</Text>
      </SectionCard>

      {(!posts.length && !loading) ? (
        <Card style={{ alignItems: 'center' }}>
          <Ionicons name="chatbubble-outline" size={48} color={colors.textMuted} />
          <View style={{ height: spacing(1) }} />
          <Text style={{ color: colors.text, fontWeight: '800' }}>{t('noPostsYet')}</Text>
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 6 }}>{t('noPostsYetSub')}</Text>
          <View style={{ height: spacing(1.5) }} />
          <PrimaryButton title={t('createFirstPost')} onPress={openCreate} />
        </Card>
      ) : (
        <>
          <View style={{ alignItems: 'flex-end', marginBottom: spacing(1) }}>
            <TouchableOpacity onPress={openCreate} activeOpacity={0.9} style={{ backgroundColor: '#22C55E', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{t('newPost')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing(6) }}>
            {/* Render posts newest-first by default (supabase returns sorted). */}
            {posts.map(p => (
              <Card key={p.id} style={{ marginBottom: spacing(1.5) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{p.title}</Text>
                  <View style={{ backgroundColor: colors.bgAlt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>{p.category}</Text>
                  </View>
                </View>
                <View style={{ height: 6 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: colors.textMuted, fontWeight: '700' }}>{p.author_name || t('anonymous')}</Text>
                  <Text style={{ color: colors.textMuted }}>•</Text>
                  <Text style={{ color: colors.textMuted }}>{timeAgo(p.created_at)}</Text>
                </View>
                <Text style={{ color: colors.textMuted }}>{p.content}</Text>
                <View style={{ height: 8 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => openEdit(p)}>
                      <Text style={{ color: colors.text, fontWeight: '700' }}>{t('edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(p.id)}>
                      <Text style={{ color: '#EF4444', fontWeight: '800' }}>{t('delete')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>
        </>
      )}

      {/* Create/Edit modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: '#00000077', justifyContent: 'center', padding: spacing(2) }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: spacing(2) }}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18, textAlign: 'center' }}>
              {editing ? t('editPost') : t('createNewPost')}
            </Text>
            <View style={{ height: spacing(1.5) }} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('title')}</Text>
            <View style={{ height: 6 }} />
            <View style={{ borderWidth: 2, borderColor: '#22C55E', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}>
              <TextInput placeholder={t('enterPostTitle')} placeholderTextColor={colors.textMuted} value={title} onChangeText={setTitle} style={{ color: colors.text }} />
            </View>
            <View style={{ height: spacing(1.25) }} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('category')}</Text>
            <View style={{ height: 6 }} />
            <TouchableOpacity
              onPress={() => setCategoryOpen(o => !o)}
              activeOpacity={0.8}
              style={{ borderWidth: 1, borderColor: colors.divider, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text }}>{category}</Text>
              <Ionicons name={categoryOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text} />
            </TouchableOpacity>
            {categoryOpen && (
              <View style={{ marginTop: 6, borderWidth: 1, borderColor: colors.divider, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.card }}>
                {COMMUNITY_CATEGORIES.map((c, idx) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => { setCategory(c); setCategoryOpen(false); }}
                    activeOpacity={0.8}
                    style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: category === c ? '#DCF5E9' : colors.card, borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth, borderColor: colors.divider }}>
                    <Text style={{ color: colors.text }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ height: spacing(1.25) }} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('content')}</Text>
            <View style={{ height: 6 }} />
            <View style={{ borderWidth: 1, borderColor: colors.divider, borderRadius: 10, minHeight: 120, paddingHorizontal: 10, paddingVertical: 8 }}>
              <TextInput placeholder={t('shareYourThoughts')} placeholderTextColor={colors.textMuted} value={content} onChangeText={setContent} style={{ color: colors.text }} multiline textAlignVertical="top" />
            </View>
            <View style={{ height: spacing(1.5) }} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }} activeOpacity={0.9} style={{ flex: 1, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.bgAlt, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSubmit} activeOpacity={0.9} style={{ flex: 1, backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '800' }}>{editing ? t('save') : t('post')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
