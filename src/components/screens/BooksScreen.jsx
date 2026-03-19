import { useState } from 'react';
import { useBooks } from '../../hooks/useBooks';

const GENRES = ['Fiction', 'Non-Fiction', 'Biography', 'Self-Help', 'History', 'Science', 'Tamil', 'Other'];

const EMPTY_FORM = {
  title: '',
  author: '',
  genre: '',
  rating: null,
  is_tamil: false,
  finished_date: new Date().toISOString().split('T')[0],
};

export default function BooksScreen() {
  const { books, loading, addBook, deleteBook } = useBooks();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const tamilCount = books.filter(b => b.is_tamil).length;

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleSave() {
    if (!form.title.trim()) return showToast('Please enter a book title');
    if (!form.finished_date) return showToast('Please enter a finish date');
    setSaving(true);
    const { error } = await addBook(form);
    setSaving(false);
    if (error) return showToast('Error saving book ');
    setForm(EMPTY_FORM);
    setShowForm(false);
    showToast('Book added! 📚');
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this book?')) return;
    await deleteBook(id);
    showToast('Book removed');
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '20px 16px 12px' }}>
        <p style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Mind & Learning</p>
        <h1 style={{ fontFamily: 'Lora', fontSize: '22px', color: 'var(--brown)', margin: '0 0 4px' }}>Books Read</h1>
        <p style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
          {books.length} of 40 books · {tamilCount} of 4 Tamil
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--surface)', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--muted)' }}>Overall progress</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>{Math.round((books.length / 40) * 100)}%</span>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: '4px', height: '6px' }}>
          <div style={{ background: 'var(--green)', borderRadius: '4px', height: '6px', width: `${Math.min((books.length / 40) * 100, 100)}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Add Book Button */}
      <div style={{ padding: '16px' }}>
        <button
          onClick={() => setShowForm(true)}
          style={{ width: '100%', background: '#2E7D52', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontFamily: 'Outfit', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Add Book
        </button>
      </div>

      {/* Book List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Outfit', color: 'var(--muted)' }}>Loading...</div>
      ) : books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
          <p style={{ fontFamily: 'Lora', fontSize: '18px', color: 'var(--brown)', margin: '0 0 8px' }}>No books yet</p>
          <p style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--muted)', margin: 0 }}>Tap "Add Book" when you finish one!</p>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {books.map((book, i) => (
            <div key={book.id} style={{ background: 'var(--surface)', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'Lora', fontSize: '15px', color: 'var(--brown)', fontWeight: 600 }}>#{i + 1} {book.title}</span>
                    {book.is_tamil && <span style={{ background: '#FFF3CD', color: '#856404', fontSize: '10px', fontFamily: 'Outfit', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>Tamil</span>}
                  </div>
                  {book.author && <p style={{ fontFamily: 'Outfit', fontSize: '13px', color: 'var(--muted)', margin: '0 0 4px' }}>by {book.author}</p>}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {book.genre && <span style={{ fontFamily: 'Outfit', fontSize: '11px', color: 'var(--sage)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: '4px' }}>{book.genre}</span>}
                    {book.rating > 0 && <span style={{ fontSize: '12px' }}>{'⭐'.repeat(book.rating)}</span>}
                    <span style={{ fontFamily: 'Outfit', fontSize: '11px', color: 'var(--muted)' }}>{book.finished_date}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(book.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px', padding: '0 0 0 8px' }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Book Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflow: 'auto' }}>
            
            {/* Form Header */}
            <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Lora', fontSize: '18px', color: 'var(--brown)', margin: 0 }}>Add a Book</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: 'var(--muted)', cursor: 'pointer' }}>×</button>
            </div>

            {/* Form Fields */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>TITLE *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Book title"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>AUTHOR</label>
                <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
                  placeholder="Author name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>GENRE</label>
                <select value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text)' }}>
                  <option value="">Select genre</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>RATING</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setForm({ ...form, rating: star })}
                      style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', opacity: form.rating >= star ? 1 : 0.3 }}>⭐</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>FINISHED DATE</label>
                <input type="date" value={form.finished_date} onChange={e => setForm({ ...form, finished_date: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text)', margin: '0 0 2px', fontWeight: 500 }}>Tamil book?</p>
                  <p style={{ fontFamily: 'Outfit', fontSize: '12px', color: 'var(--muted)', margin: 0 }}>Counts toward your 4 Tamil goal</p>
                </div>
                <div onClick={() => setForm({ ...form, is_tamil: !form.is_tamil })}
                  style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.is_tamil ? 'var(--green)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: '2px', left: form.is_tamil ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
              </div>

              {/* Save Button */}
              <button onClick={handleSave} disabled={saving}
                style={{ width: '100%', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontFamily: 'Outfit', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: '4px' }}>
                {saving ? 'Saving...' : 'Save Book'}
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