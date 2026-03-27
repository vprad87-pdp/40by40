import { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';

const TARGET = 3;

const EMPTY_FORM = {
  name: '',
  notes: '',
  url: '',
};

export default function ProjectsScreen() {
  const { projects, loading, addProject, deleteProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleSave() {
    if (!form.name.trim()) return showToast('Please enter a project name');
    setSaving(true);
    const { error } = await addProject(form);
    setSaving(false);
    if (error) return showToast('Error saving project');
    setForm(EMPTY_FORM);
    setShowForm(false);
    showToast('Project added! 🛠️');
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this project?')) return;
    await deleteProject(id);
    showToast('Project removed');
  }

  const pct = Math.min(Math.round((projects.length / TARGET) * 100), 100);
  const isDone = projects.length >= TARGET;

  return (
    <div style={{ background: '#F0F4F0', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #D8E4D8', padding: '20px 16px 12px' }}>
        <p style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#7A9E7E', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Mind & Learning</p>
        <h1 style={{ fontFamily: 'Lora', fontSize: '22px', color: '#3D2B1F', margin: '0 0 4px' }}>Tech Projects</h1>
        <p style={{ fontFamily: 'Outfit', fontSize: '13px', color: '#7A8F7A', margin: 0 }}>
          {projects.length} of {TARGET} projects
          {isDone && <span style={{ color: '#2E7D52', fontWeight: 600 }}> · Goal complete! 🎉</span>}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#FFFFFF', padding: '12px 16px', borderBottom: '1px solid #D8E4D8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#7A8F7A' }}>Overall progress</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#2E7D52', fontWeight: 600 }}>{pct}%</span>
        </div>
        <div style={{ background: '#D8E4D8', borderRadius: '4px', height: '6px' }}>
          <div style={{ background: isDone ? '#2E7D52' : '#8b5cf6', borderRadius: '4px', height: '6px', width: `${pct}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Add Button */}
      <div style={{ padding: '16px' }}>
        <button
          onClick={() => setShowForm(true)}
          style={{ width: '100%', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontFamily: 'Outfit', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Add Project
        </button>
      </div>

      {/* Project List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Outfit', color: '#7A8F7A' }}>Loading...</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛠️</div>
          <p style={{ fontFamily: 'Lora', fontSize: '18px', color: '#3D2B1F', margin: '0 0 8px' }}>No projects yet</p>
          <p style={{ fontFamily: 'Outfit', fontSize: '14px', color: '#7A8F7A', margin: 0 }}>Tap "Add Project" to log one!</p>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {projects.map((project, i) => (
            <div key={project.id} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px 16px', border: '1px solid #D8E4D8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Lora', fontSize: '15px', color: '#3D2B1F', fontWeight: 600, margin: '0 0 4px' }}>
                    #{i + 1} {project.name}
                  </p>
                  {project.notes && (
                    <p style={{ fontFamily: 'Outfit', fontSize: '13px', color: '#7A8F7A', margin: '0 0 6px' }}>
                      {project.notes}
                    </p>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#8b5cf6', textDecoration: 'none' }}
                    >
                      🔗 {project.url}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(project.id)}
                  style={{ background: 'none', border: 'none', color: '#7A8F7A', cursor: 'pointer', fontSize: '18px', padding: '0 0 0 8px' }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflow: 'auto' }}>

            <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Lora', fontSize: '18px', color: '#3D2B1F', margin: 0 }}>Add a Project</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#7A8F7A', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#7A8F7A', display: 'block', marginBottom: '4px' }}>PROJECT NAME *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. 40by40 app"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D8E4D8', background: '#F7F9F7', fontFamily: 'Outfit', fontSize: '14px', color: '#1C2B1C', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#7A8F7A', display: 'block', marginBottom: '4px' }}>NOTES</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="What did you build? What did you learn?"
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D8E4D8', background: '#F7F9F7', fontFamily: 'Outfit', fontSize: '14px', color: '#1C2B1C', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#7A8F7A', display: 'block', marginBottom: '4px' }}>URL (optional)</label>
                <input
                  value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D8E4D8', background: '#F7F9F7', fontFamily: 'Outfit', fontSize: '14px', color: '#1C2B1C', boxSizing: 'border-box' }}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{ width: '100%', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontFamily: 'Outfit', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: '4px' }}
              >
                {saving ? 'Saving...' : 'Save Project'}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', background: '#3D2B1F', color: '#fff', padding: '10px 20px', borderRadius: '20px', fontFamily: 'Outfit', fontSize: '14px', zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}