import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './useAuth';

export function useBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBooks();
  }, [user]);

  async function fetchBooks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)
      .order('finished_date', { ascending: false });
    if (!error) setBooks(data || []);
    setLoading(false);
  }

  async function addBook(book) {
    const { error } = await supabase
      .from('books')
      .insert({ ...book, user_id: user.id });
    if (!error) await fetchBooks();
    return { error };
  }

  async function deleteBook(id) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) await fetchBooks();
  }

  return { books, loading, addBook, deleteBook };
}