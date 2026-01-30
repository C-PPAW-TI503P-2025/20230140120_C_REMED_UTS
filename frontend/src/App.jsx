import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:3000/api'

function App() {
  const [books, setBooks] = useState([])
  const [borrowLogs, setBorrowLogs] = useState([])
  const [view, setView] = useState('books')
  const [role, setRole] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [searchQuery, setSearchQuery] = useState('')

  // Form states
  const [bookForm, setBookForm] = useState({ id: '', title: '', author: '', stock: 1 })
  const [isEditing, setIsEditing] = useState(false)

  // Borrow states
  const [borrowBookId, setBorrowBookId] = useState('')
  const [location, setLocation] = useState({ lat: null, long: null })

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    if (view === 'history') {
      fetchBorrowLogs()
    }
  }, [view, userId])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  const fetchBooks = async (search = '') => {
    try {
      setLoading(true)
      const url = search ? `${API_URL}/books?search=${encodeURIComponent(search)}` : `${API_URL}/books`
      const res = await fetch(url)
      const data = await res.json()
      setBooks(data)
    } catch (error) {
      showToast('Gagal memuat buku', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchBorrowLogs = async () => {
    try {
      setLoading(true)
      // Admin sees all, User sees only theirs
      const url = (role === 'user' && userId) ? `${API_URL}/borrow?userId=${userId}` : `${API_URL}/borrow`
      const res = await fetch(url)
      const data = await res.json()
      setBorrowLogs(data)
    } catch (error) {
      showToast('Gagal memuat riwayat', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault()
    fetchBooks(searchQuery)
  }

  const handleCreateBook = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role
        },
        body: JSON.stringify({
          title: bookForm.title,
          author: bookForm.author,
          stock: parseInt(bookForm.stock)
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Gagal menambah buku')
      }
      showToast('Buku berhasil ditambahkan')
      setBookForm({ id: '', title: '', author: '', stock: 1 })
      fetchBooks()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleUpdateBook = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/books/${bookForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role
        },
        body: JSON.stringify({
          title: bookForm.title,
          author: bookForm.author,
          stock: parseInt(bookForm.stock)
        })
      })
      if (!res.ok) throw new Error('Gagal update buku')
      showToast('Buku berhasil diupdate')
      setBookForm({ id: '', title: '', author: '', stock: 1 })
      setIsEditing(false)
      fetchBooks()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleDeleteBook = async (id) => {
    if (!confirm('Yakin ingin menghapus buku ini?')) return
    try {
      const res = await fetch(`${API_URL}/books/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': role
        }
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Gagal menghapus buku')
      }
      showToast('Buku berhasil dihapus')
      fetchBooks()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleEditClick = (book) => {
    setBookForm(book)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setBookForm({ id: '', title: '', author: '', stock: 1 })
    setIsEditing(false)
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude
          })
          showToast('Lokasi berhasil diambil')
        },
        (error) => {
          showToast('Gagal mengambil lokasi: ' + error.message, 'error')
        }
      )
    } else {
      showToast('Geolocation tidak didukung browser ini', 'error')
    }
  }

  const handleBorrow = async (e) => {
    e.preventDefault()
    if (!userId) return showToast('Harap masukkan User ID', 'error')
    if (!location.lat || !location.long) return showToast('Harap ambil lokasi terlebih dahulu', 'error')

    try {
      const res = await fetch(`${API_URL}/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-role': role
        },
        body: JSON.stringify({
          bookId: borrowBookId,
          latitude: location.lat,
          longitude: location.long
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal meminjam buku')

      showToast('Buku berhasil dipinjam')
      setBorrowBookId('')
      // Refresh related data
      fetchBooks()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleReturn = async (borrowId) => {
    if (!confirm('Kembalikan buku ini?')) return
    try {
      const res = await fetch(`${API_URL}/borrow/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-role': role
        },
        body: JSON.stringify({ borrowId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal mengembalikan buku')

      showToast('Buku berhasil dikembalikan')
      fetchBorrowLogs()
      fetchBooks() // Update stock
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <h1>Perpustakaan Digital</h1>
        </div>
        <div className="header-right">
          <div className="role-box">
            <label>Peran:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">-- Pilih --</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          {role === 'user' && (
            <div className="role-box">
              <label>User ID:</label>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="ID"
              />
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button className={view === 'books' ? 'active' : ''} onClick={() => setView('books')}>
          Daftar Buku
        </button>
        {role === 'admin' && (
          <>
            <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>
              Kelola Buku
            </button>
            <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>
              Riwayat
            </button>
          </>
        )}
        {role === 'user' && (
          <>
            <button className={view === 'borrow' ? 'active' : ''} onClick={() => setView('borrow')}>
              Pinjam Buku
            </button>
            <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>
              Riwayat
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <main className="main">
        {/* Books List */}
        {view === 'books' && (
          <div className="section">
            <div className="section-header">
              <h2>Koleksi Buku</h2>
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Cari judul atau penulis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Cari</button>
              </form>
            </div>
            {loading ? (
              <p className="loading-text">Memuat data...</p>
            ) : books.length === 0 ? (
              <p className="empty-text">Belum ada buku.</p>
            ) : (
              <div className="book-list">
                {books.map(book => (
                  <div key={book.id} className="book-item">
                    <div className="book-main">
                      <h3>{book.title}</h3>
                      <p>{book.author}</p>
                    </div>
                    <div className={`book-stock ${book.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                      {book.stock > 0 ? `${book.stock} tersedia` : 'Habis'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin Panel */}
        {view === 'admin' && (
          <div className="section">
            <div className="admin-layout">
              <div className="form-section">
                <h2>{isEditing ? 'Edit Buku' : 'Tambah Buku'}</h2>
                <form onSubmit={isEditing ? handleUpdateBook : handleCreateBook}>
                  <div className="input-group">
                    <label>Judul</label>
                    <input
                      type="text"
                      value={bookForm.title}
                      onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                      placeholder="Masukkan judul buku"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Penulis</label>
                    <input
                      type="text"
                      value={bookForm.author}
                      onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                      placeholder="Nama penulis"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Stok</label>
                    <input
                      type="number"
                      value={bookForm.stock}
                      onChange={(e) => setBookForm({ ...bookForm, stock: e.target.value })}
                      min="0"
                      required
                    />
                  </div>
                  <div className="btn-group">
                    <button type="submit" className="btn-primary">
                      {isEditing ? 'Update' : 'Simpan'}
                    </button>
                    {isEditing && (
                      <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="table-section">
                <h2>Data Buku</h2>
                {books.length === 0 ? (
                  <p className="empty-text">Belum ada data buku.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Judul</th>
                        <th>Penulis</th>
                        <th>Stok</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map(book => (
                        <tr key={book.id}>
                          <td>{book.id}</td>
                          <td>{book.title}</td>
                          <td>{book.author}</td>
                          <td>{book.stock}</td>
                          <td>
                            <button className="btn-sm btn-edit" onClick={() => handleEditClick(book)}>Edit</button>
                            <button className="btn-sm btn-delete" onClick={() => handleDeleteBook(book.id)}>Hapus</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Borrow */}
        {view === 'borrow' && (
          <div className="section">
            <h2>Peminjaman Buku</h2>
            <div className="borrow-layout">
              <div className="location-box">
                <h3>Lokasi Anda</h3>
                <div className="coords">
                  <div>
                    <span>Latitude</span>
                    <strong>{location.lat?.toFixed(6) ?? '-'}</strong>
                  </div>
                  <div>
                    <span>Longitude</span>
                    <strong>{location.long?.toFixed(6) ?? '-'}</strong>
                  </div>
                </div>
                <button type="button" className="btn-secondary" onClick={getLocation}>
                  Ambil Lokasi
                </button>
              </div>

              <form onSubmit={handleBorrow} className="borrow-form">
                <div className="input-group">
                  <label>Pilih Buku</label>
                  <select value={borrowBookId} onChange={(e) => setBorrowBookId(e.target.value)} required>
                    <option value="">-- Pilih --</option>
                    {books.filter(b => b.stock > 0).map(book => (
                      <option key={book.id} value={book.id}>{book.title}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary">Pinjam Sekarang</button>
              </form>
            </div>
          </div>
        )}

        {/* History */}
        {view === 'history' && (
          <div className="section">
            <div className="section-header">
              <h2>Riwayat Peminjaman</h2>
              <button className="btn-secondary" onClick={fetchBorrowLogs}>Refresh</button>
            </div>
            {loading ? (
              <p className="loading-text">Memuat data...</p>
            ) : borrowLogs.length === 0 ? (
              <p className="empty-text">Belum ada riwayat peminjaman.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Buku</th>
                    <th>Tgl Pinjam</th>
                    <th>Tgl Kembali</th>
                    <th>Lokasi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowLogs.map(log => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.userId}</td>
                      <td>{log.Book?.title || '-'}</td>
                      <td>{formatDate(log.borrowDate)}</td>
                      <td>{formatDate(log.returnDate)}</td>
                      <td>{log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}</td>
                      <td>
                        {log.returnDate ? (
                          <span className="status returned">Dikembalikan</span>
                        ) : (
                          <>
                            <span className="status borrowed">Dipinjam</span>
                            {role === 'user' && userId == log.userId && (
                              <button className="btn-sm btn-return" onClick={() => handleReturn(log.id)}>
                                Kembalikan
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* Toast */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  )
}

export default App
