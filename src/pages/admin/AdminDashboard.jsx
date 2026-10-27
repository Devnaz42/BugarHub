function AdminDashboard({ onLogout }) {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Panel Kendali Admin BugarHub</h2>
      <p>Ini adalah halaman utama dasbor admin.</p>
      <button 
        onClick={onLogout}
        style={{
          padding: '8px 16px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Keluar Akun (Logout)
      </button>
    </div>
  );
}

export default AdminDashboard;
