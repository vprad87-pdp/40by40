import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './useAuth';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setProjects(data || []);
    setLoading(false);
  }

  async function addProject(project) {
    const { error } = await supabase
      .from('projects')
      .insert({ ...project, user_id: user.id });
    if (!error) await fetchProjects();
    return { error };
  }

  async function deleteProject(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) await fetchProjects();
  }

  return { projects, loading, addProject, deleteProject };
}