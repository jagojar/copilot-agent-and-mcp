import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFavorites, updateFavoriteComment } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.favorites.items);
  const status = useAppSelector(state => state.favorites.status);
  const token = useAppSelector(state => state.user.token);
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState(null);
  const [draftComment, setDraftComment] = useState('');
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(fetchFavorites(token));
  }, [dispatch, token, navigate]);

  const handleEditStart = (book) => {
    setEditingId(book.id);
    setDraftComment(book.comment || '');
    setSaveError(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setDraftComment('');
    setSaveError(null);
  };

  const handleEditSave = async (bookId) => {
    const result = await dispatch(updateFavoriteComment({ token, bookId, comment: draftComment }));
    if (updateFavoriteComment.rejected.match(result)) {
      setSaveError(result.payload || 'Failed to save comment. Please try again.');
      return;
    }
    setEditingId(null);
    setDraftComment('');
    setSaveError(null);
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Failed to load favorites.</div>;

  return (
    <div>
      <h2>My Favorite Books</h2>
      {favorites.length === 0 ? (
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '2rem auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center',
          color: '#888',
        }}>
          <p>No favorite books yet.</p>
          <p>
            Go to the <a href="/books" onClick={e => { e.preventDefault(); navigate('/books'); }}>book list</a> to add some!
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, maxWidth: '600px', margin: '2rem auto' }}>
          {favorites.map(book => (
            <li key={book.id} style={{
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              padding: '1rem 1.5rem',
              marginBottom: '1rem',
            }}>
              <div>
                <strong>{book.title}</strong> by {book.author}
              </div>
              {editingId === book.id ? (
                <div style={{ marginTop: '0.75rem' }}>
                  <textarea
                    data-testid={`comment-input-${book.id}`}
                    value={draftComment}
                    onChange={e => setDraftComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    style={{
                      width: '100%',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.95rem',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                  {saveError && (
                    <div style={{ color: '#c0392b', fontSize: '0.88rem', marginTop: '0.25rem' }}>
                      {saveError}
                    </div>
                  )}
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      data-testid={`save-comment-${book.id}`}
                      onClick={() => handleEditSave(book.id)}
                      style={{
                        background: '#20b2aa',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.3rem 0.9rem',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      style={{
                        background: '#eee',
                        color: '#555',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.3rem 0.9rem',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: book.comment ? '#333' : '#aaa', fontSize: '0.95rem', fontStyle: book.comment ? 'normal' : 'italic' }}>
                    {book.comment || 'No comment yet.'}
                  </span>
                  <button
                    data-testid={`edit-comment-${book.id}`}
                    onClick={() => handleEditStart(book)}
                    style={{
                      background: 'none',
                      border: '1px solid #20b2aa',
                      color: '#20b2aa',
                      borderRadius: '4px',
                      padding: '0.2rem 0.6rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {book.comment ? 'Edit comment' : 'Add comment'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
