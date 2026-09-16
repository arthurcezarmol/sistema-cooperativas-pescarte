import React from 'react';

export default function Navbar({ abaAtiva, setAbaAtiva }) {
  const itensNav = [
    { id: 'pescaria', label: '🎣 Pescarias e Capturas' },
    { id: 'financeiro', label: '💰 Gestão Financeira' }
  ];

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #333',
      paddingBottom: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🌊</span>
        <strong style={{ fontSize: '1.2rem', letterSpacing: '-0.5px' }}>Pescarte Coop</strong>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {itensNav.map((item) => {
          const ativo = abaAtiva === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setAbaAtiva(item.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: ativo ? '1px solid #0070f3' : '1px solid #333',
                backgroundColor: ativo ? '#0070f3' : '#1e1e1e',
                color: '#fff',
                fontWeight: ativo ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}