import { useEffect, useState } from 'react';
import api from './services/api';
import Navbar from './components/Navbar';
import BalancoCards from './components/BalancoCards';
import FormDesembarque from './components/FormDesembarque';
import FinanceiroView from './components/FinanceiroView';
import { LoginView, CadastroView } from './components/AuthViews';

export default function App() {
  // Pescador ativo (mockado inicialmente para não quebrar os testes), só até o login ficar pronto
  const [usuarioLogado, setUsuarioLogado] = useState({ id: 1, nome: 'João da Silva' });
  const [abaAtiva, setAbaAtiva] = useState('pescaria');

  const [balanco, setBalanco] = useState(null);
  const [pescarias, setPescarias] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarDados = async () => {
    if (!usuarioLogado) return;
    try {
      setLoading(true);
      const [resBalanco, resPescarias] = await Promise.all([
        api.get(`/financeiro/balanco?pescador_id=${usuarioLogado.id}`),
        api.get('/pesca/pescarias', {
          headers: { 'x-pescador-id': usuarioLogado.id }
        })
      ]);

      setBalanco(resBalanco.data);
      setPescarias(resPescarias.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [usuarioLogado]);

  const handleLogin = (usuario) => {
    setUsuarioLogado(usuario);
    setAbaAtiva('pescaria');
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setBalanco(null);
    setPescarias([]);
    setAbaAtiva('login');
  };

  // Função para remover informações da pescaria
  const handleExcluirPescaria = async (pescariaId) => {
    if (!window.confirm('Tem certeza de que deseja excluir esta pescaria e seus registros contábeis?')) {
      return;
    }

    try {
      await api.delete(`/pesca/pescarias/${pescariaId}`);
      carregarDados(); // Recarrega os totais e a lista automaticamente
    } catch (error) {
      console.error('Erro ao excluir pescaria:', error);
      alert('Erro ao excluir pescaria.');
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '2rem auto', fontFamily: 'sans-serif', padding: '0 1rem' }}>
      <Navbar
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        usuarioLogado={usuarioLogado}
        onLogout={handleLogout}
      />

      {/* 1. Telas de Autenticação */}
      {abaAtiva === 'login' && (
        <LoginView
          onLoginSucesso={handleLogin}
          irParaCadastro={() => setAbaAtiva('cadastro')}
        />
      )}

      {abaAtiva === 'cadastro' && (
        <CadastroView
          onCadastroSucesso={handleLogin}
          irParaLogin={() => setAbaAtiva('login')}
        />
      )}

      {/* 2. Telas do Pescador Logado */}
      {usuarioLogado && abaAtiva === 'pescaria' && (
        <div>
          <BalancoCards balanco={balanco} />
          <FormDesembarque onSucesso={carregarDados} />

          <h2 style={{ marginTop: '2rem' }}>Histórico de Pescarias</h2>
          {loading && !pescarias.length ? (
            <p style={{ color: '#888' }}>Atualizando histórico...</p>
          ) : pescarias.length === 0 ? (
            <p style={{ color: '#888' }}>Nenhuma saída cadastrada ainda.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #444', textAlign: 'left' }}>
                  <th style={{ padding: '10px 8px' }}>Data</th>
                  <th style={{ padding: '10px 8px' }}>Observações</th>
                  <th style={{ padding: '10px 8px' }}>Peso Total (kg)</th>
                  <th style={{ padding: '10px 8px' }}>Faturamento (R$)</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pescarias.map((p) => (
                  <tr key={p.pescaria_id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '10px 8px' }}>
                      {new Date(p.data_pescaria).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#ccc' }}>{p.observacoes || '-'}</td>
                    <td style={{ padding: '10px 8px' }}>{Number(p.peso_total_kg).toFixed(2)} kg</td>
                    <td style={{ padding: '10px 8px', color: '#00cc88', fontWeight: 'bold' }}>
                      R$ {Number(p.faturamento_total).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleExcluirPescaria(p.pescaria_id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #ff4d4f',
                          color: '#ff4d4f',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                        title="Excluir pescaria"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {usuarioLogado && abaAtiva === 'financeiro' && (
        <FinanceiroView balanco={balanco} onAtualizar={carregarDados} />
      )}
    </div>
  );
}