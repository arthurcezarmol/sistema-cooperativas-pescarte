import React from 'react';

export default function Navbar({ abaAtiva, setAbaAtiva, usuarioLogado, onLogout }) {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #333',
      paddingBottom: '1rem',
      marginBottom: '2rem',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      {/* Logotipo / Nome da Cooperativa */}
      <div 
        onClick={() => setAbaAtiva(usuarioLogado ? 'pescaria' : 'login')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '1.6rem' }}>🌊</span>
        <strong style={{ fontSize: '1.25rem', letterSpacing: '-0.5px' }}>Pescarte Coop</strong>
      </div>

      {/* Menu Central / Operacional (visível apenas se autenticado) */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {usuarioLogado ? (
          <>
            <button
              onClick={() => setAbaAtiva('pescaria')}
              style={btnEstilo(abaAtiva === 'pescaria')}
            >
              🎣 Pescarias e Capturas
            </button>
            <button
              onClick={() => setAbaAtiva('financeiro')}
              style={btnEstilo(abaAtiva === 'financeiro')}
            >
              💰 Gestão Financeira
            </button>
          </>
        ) : (
          <span style={{ color: '#888', fontSize: '0.9rem' }}>Acesso ao Sistema do Pescador</span>
        )}
      </div>

      {/* Área de Autenticação / Perfil à Direita */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {usuarioLogado ? (
          <>
            <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
              Olá, <strong style={{ color: '#fff' }}>{usuarioLogado.nome}</strong>
            </span>
            <button
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: '1px solid #444',
                color: '#bbb',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setAbaAtiva('login')}
              style={btnEstilo(abaAtiva === 'login')}
            >
              Entrar
            </button>
            <button
              onClick={() => setAbaAtiva('cadastro')}
              style={btnEstilo(abaAtiva === 'cadastro', true)}
            >
              Cadastrar
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const btnEstilo = (ativo, destaque = false) => ({
  padding: '8px 14px',
  borderRadius: '6px',
  border: ativo ? '1px solid #0070f3' : destaque ? '1px solid #2ea043' : '1px solid #333',
  backgroundColor: ativo ? '#0070f3' : destaque ? '#238636' : '#1e1e1e',
  color: '#fff',
  fontWeight: ativo || destaque ? 'bold' : 'normal',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
});