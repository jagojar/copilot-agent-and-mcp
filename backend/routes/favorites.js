const express = require('express');

function createFavoritesRouter({ usersFile, booksFile, readJSON, writeJSON, authenticateToken }) {
  const router = express.Router();

  router.get('/', authenticateToken, (req, res) => {
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const books = readJSON(booksFile);
    const favorites = books
      .filter(b => user.favorites.some(f => f.bookId === b.id))
      .map(b => {
        const fav = user.favorites.find(f => f.bookId === b.id);
        return { ...b, comment: fav.comment || '' };
      });
    res.json(favorites);
  });

  router.post('/', authenticateToken, (req, res) => {
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ message: 'Book ID required' });
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.favorites.some(f => f.bookId === bookId)) {
      user.favorites.push({ bookId, comment: '' });
      writeJSON(usersFile, users);
    }
    res.status(200).json({ message: 'Book added to favorites' });
  });

  router.put('/:bookId', authenticateToken, (req, res) => {
    const { bookId } = req.params;
    const { comment } = req.body;
    if (comment === undefined) return res.status(400).json({ message: 'Comment field is required' });
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const fav = user.favorites.find(f => f.bookId === bookId);
    if (!fav) return res.status(404).json({ message: 'Favorite not found' });
    fav.comment = comment;
    writeJSON(usersFile, users);
    res.status(200).json({ message: 'Comment updated' });
  });

  return router;
}

module.exports = createFavoritesRouter;
