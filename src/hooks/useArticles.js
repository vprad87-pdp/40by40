import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './useAuth';

export function useArticles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchArticles();
  }, [user]);

  async function fetchArticles() {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', user.id)
      .order('published_date', { ascending: false });
    if (!error) setArticles(data || []);
    setLoading(false);
  }

  async function addArticle(article) {
    const { error } = await supabase
      .from('articles')
      .insert({ ...article, user_id: user.id });
    if (!error) await fetchArticles();
    return { error };
  }

  async function deleteArticle(id) {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) await fetchArticles();
  }

  return { articles, loading, addArticle, deleteArticle };
}