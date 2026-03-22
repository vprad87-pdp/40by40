import { useState } from 'react';
import { useArticles } from '../../hooks/useArticles';

const EMPTY_FORM = {
  title: '',
  url: '',
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

  return (
    <div style={{ background: '#F0F4F0', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #D8E4D8', padding: '48px 16px 12px' }}>
        <p style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#7A9E7E', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Career & Finance</p>
        <h1 style={{ fontFamily: 'Lora', fontSize: '22px', color: '#3D2B1F', margin: '0 0 4px' }}>Articles Published</h1>
        <p style={{ fontFamily: 'Outfit', fontSize: '13px', color: '#7A8F7A', margin: 0 }}>
          {articles.length} of 14 articles published
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#FFFFFF', padding: '12px 16px', borderBottom: '1px solid #D8E4D8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#7A8F7A' }}>Overall progress</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#2E7D52', fontWeight: 600 }}>{Math.round((articles.length / 14) * 100)}%</span>
        </div>
        <div style={{ background: '#D8E4D8', borderRadius: '4px', height: '6px' }}>
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
        <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Outfit', color: '#7A8F7A' }}>Loading...</div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✍️</div>
          <p style={{ fontFamily: 'Lora', fontSize: '18px', color: '#3D2B1F', margin: '0 0 8px' }}>No articles yet</p>
          <p style={{ fontFamily: 'Outfit', fontSize: '14px', color: '#7A8F7A', margin: 0 }}>Tap "Add Article" when you publish one!</p>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {articles.map((article, i) => (
            <div key={article.id} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px 16px', border: '1px solid #D8E4D8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {article.url ? (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: 'Lora', fontSize: '15px', color: '#2E7D52', fontWeight: 600, textDecoration: 'none', display: 'block', marginBottom: '4px' }}
                    >
                      #{i + 1} {article.title} ↗
                    </a>
                  ) : (
                    <p style={{ fontFamily: 'Lora', fontSize: '15px', color: '#3D2B1F', fontWeight: 600, margin: '0 0 4px' }}>
                      #{i + 1} {article.title}
                    </p>
                  )}
                  <span style={{ fontFamily: 'Outfit', fontSize: '11px', color: '#7A8F7A' }}>
                    {article.published_date}
                  </span>
                </div>
                <button onClick={() => handleDelete(article.id)} style={{ background: 'none', border: 'none', color: '#7A8F7A', cursor: 'pointer', fontSize: '18px', padding: '0 0 0 8px' }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Article Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflow: 'auto' }}>

            {/* Form Header */}
            <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Lora', fontSize: '18px', color: '#3D2B1F', margin: 0 }}>Add an Article</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#7A8F7A', cursor: 'pointer' }}>×</button>
            </div>

            {/* Form Fields */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#7A8F7A', display: 'block', marginBottom: '4px' }}>TITLE *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Article title"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D8E4D8', background: '#F7F9F7', fontFamily: 'Outfit', fontSize: '14px', color: '#1C2B1C', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#7A8F7A', display: 'block', marginBottom: '4px' }}>SUBSTACK URL</label>
                <input
                  value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://yourname.substack.com/p/..."
                  type="url"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D8E4D8', background: '#F7F9F7', fontFamily: 'Outfit', fontSize: '14px', color: '#1C2B1C', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: '#7A8F7A', display: 'block', marginBottom: '4px' }}>PUBLISHED DATE *</label>
                <input
                  type="date"
                  value={form.published_date}
                  onChange={e => setForm({ ...form, published_date: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D8E4D8', background: '#F7F9F7', fontFamily: 'Outfit', fontSize: '14px', color: '#1C2B1C', boxSizing: 'border-box' }}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{ width: '100%', background: '#2E7D52', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontFamily: 'Outfit', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: '4px' }}
              >
                {saving ? 'Saving...' : 'Save Article'}
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