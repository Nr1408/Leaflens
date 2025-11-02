import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

export type CommunityCategory = 'General' | 'Question' | 'Success Story' | 'Care Tips';

export type CommunityPost = {
  id: string;
  title: string;
  content: string;
  category: CommunityCategory;
  created_at: number; // epoch ms
  author_id?: string | null;
  author_name?: string | null;
};

const STORAGE_KEY = 'leaflens.community.posts.v1';

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

async function storageGet(): Promise<CommunityPost[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as CommunityPost[]) : [];
}

async function storageSet(posts: CommunityPost[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export async function listPosts(): Promise<CommunityPost[]> {
  try {
    // Try Supabase if configured and table exists.
    const { data, error } = await supabase
      .from('posts')
      .select('id,title,content,category,created_at,author_id,author_name')
      .order('created_at', { ascending: false });
    if (!error && data) {
      // Normalize timestamps to epoch ms
      return data.map((p: any) => ({
        id: String(p.id),
        title: String(p.title),
        content: String(p.content || ''),
        category: (p.category || 'General') as CommunityCategory,
        created_at: typeof p.created_at === 'number' ? p.created_at : Date.parse(p.created_at),
        author_id: p.author_id ?? null,
        author_name: p.author_name ?? null,
      }));
    }
  } catch (e) {
    // fallthrough to local
  }
  return storageGet();
}

export async function createPost(input: { title: string; content: string; category: CommunityCategory; author_id?: string | null; author_name?: string | null; }): Promise<CommunityPost> {
  const now = Date.now();
  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: input.title,
        content: input.content,
        category: input.category,
        created_at: new Date(now).toISOString(),
        author_id: input.author_id ?? null,
        author_name: input.author_name ?? null,
      })
      .select()
      .single();
    if (!error && data) {
      return {
        id: String(data.id),
        title: data.title,
        content: data.content,
        category: data.category,
        created_at: typeof data.created_at === 'number' ? data.created_at : Date.parse(data.created_at),
        author_id: data.author_id ?? null,
        author_name: data.author_name ?? null,
      };
    }
  } catch (e) {
    // ignore
  }
  // Fallback to local storage
  const post: CommunityPost = {
    id: uid(),
    title: input.title,
    content: input.content,
    category: input.category,
    created_at: now,
    author_id: input.author_id ?? null,
    author_name: input.author_name ?? null,
  };
  const existing = await storageGet();
  await storageSet([post, ...existing]);
  return post;
}

export async function updatePost(id: string, patch: Partial<Pick<CommunityPost, 'title' | 'content' | 'category'>>): Promise<void> {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ ...patch })
      .eq('id', id);
    if (!error) return;
  } catch {
    // ignore
  }
  const posts = await storageGet();
  const idx = posts.findIndex(p => p.id === id);
  if (idx >= 0) {
    posts[idx] = { ...posts[idx], ...patch } as CommunityPost;
    await storageSet(posts);
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    if (!error) return;
  } catch {
    // ignore
  }
  const posts = await storageGet();
  await storageSet(posts.filter(p => p.id !== id));
}

export const COMMUNITY_CATEGORIES: CommunityCategory[] = ['General', 'Question', 'Success Story', 'Care Tips'];
