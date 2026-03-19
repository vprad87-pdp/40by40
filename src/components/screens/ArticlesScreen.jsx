import { useState } from 'react';
import { useArticles } from '../../hooks/useArticles';

const PLATFORMS = ['Medium', 'LinkedIn', 'Personal Blog', 'Other'];

const EMPTY_FORM = {
  title: '',
  platform: '',
  published_date: new Date().toISOString().split('T')[0],
};

export default function ArticlesScreen() {
  const { articles, loading, addArticle, deleteArticle } = useArticles();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleSave() {
    if (!form.title.trim()) return showToast('Please enter an article title');
    if (!form.platform) return showToast('Please select a platform');
    if (!form.published_date) return showToast('Please enter a publish date');
    setSaving(true);
    const { error } = await addArticle(form);
    setSaving(false);
    if (error) return showToast('Error: ' + error.message);
    setForm(EMPTY_FORM);
    setShowForm(false);
    showToast('Article added! ✍️');
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this article?')) return;
    await deleteArticle(id);
    showToast('Article removed');
  }

  const platformEmoji = {
    'Medium': '📝',
    'LinkedIn': '💼',
    'Personal Blog': '🌐',
    'Other': '📄'
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '20px 16px 12px' }}>
        <p style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Career & Finance</p>
        <h1 style={{ fontFamily: 'Lora', fontSize: '22px', color: 'var(--brown)', margin: '0 0 4px' }}>Articles Published</h1>
        <p style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
          {articles.length} of 14 articles published
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--surface)', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--muted)' }}>Overall progress</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>{Math.round((articles.length / 14) * 100)}%</span>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: '4px', height: '6px' }}>
          <div style={{ background: '#2E7D52', borderRadius: '4px', height: '6px', width: `${Math.min((articles.length / 14) * 100, 100)}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Add Article Button */}
      <div style={{ padding: '16px' }}>
        <button
          onClick={() => setShowForm(true)}
          style={{ width: '100%', background: '#2E7D52', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontFamily: 'Outfit', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Add Article
        </button>
      </div>

      {/* Article List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Outfit', color: 'var(--muted)' }}>Loading...</div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✍️</div>
          <p style={{ fontFamily: 'Lora', fontSize: '18px', color: 'var(--brown)', margin: '0 0 8px' }}>No articles yet</p>
          <p style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--muted)', margin: 0 }}>Tap "Add Article" when you publish one!</p>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {articles.map((article, i) => (
            <div key={article.id} style={{ background: 'var(--surface)', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'Lora', fontSize: '15px', color: 'var(--brown)', fontWeight: 600 }}>#{i + 1} {article.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {article.platform && (
                      <span style={{ fontFamily: 'Outfit', fontSize: '11px', color: 'var(--sage)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: '4px' }}>
                        {platformEmoji[article.platform]} {article.platform}
                      </span>
                    )}
                    <span style={{ fontFamily: 'Outfit', fontSize: '11px', color: 'var(--muted)' }}>{article.published_date}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(article.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px', padding: '0 0 0 8px' }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Article Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflow: 'auto' }}>

            {/* Form Header */}
            <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Lora', fontSize: '18px', color: 'var(--brown)', margin: 0 }}>Add an Article</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: 'var(--muted)', cursor: 'pointer' }}>×</button>
            </div>

            {/* Form Fields */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>TITLE *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Article title"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>PLATFORM *</label>
                <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text)' }}>
                  <option value="">Select platform</option>
                  {PLATFORMS.map(p => <option key={p} value={p}>{platformEmoji[p]} {p}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>PUBLISHED DATE *</label>
                <input type="date" value={form.published_date} onChange={e => setForm({ ...form, published_date: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>

              {/* Save Button */}
              <button onClick={handleSave} disabled={saving}
                style={{ width: '100%', background: '#2E7D52', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontFamily: 'Outfit', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: '4px' }}>
                {saving ? 'Saving...' : 'Save Article'}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', background: 'var(--brown)', color: '#fff', padding: '10px 20px', borderRadius: '20px', fontFamily: 'Outfit', fontSize: '14px', zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}