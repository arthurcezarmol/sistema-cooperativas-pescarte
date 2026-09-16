import React, { useState } from 'react';
import api from '../services/api';

export function LoginView({ onLoginSucesso, irParaCadastro }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const handleEntrar = (e) => {
    e.preventDefault();

    if (!usuario.trim()) {
      alert('Por favor, informe seu usuário ou nome.');
      return;
    }

    // Login de teste / mock: associa o nome digitado mantendo o id ativo
    onLoginSucesso({ 
      id: 1, 
      nome: usuario.trim() 
    });
  };

  return (
    <div style={{ maxWidth: '380px', margin: '3rem auto', background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Entrar na Cooperativa</h2>
      <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        Acesse seu painel com seu usuário e senha
      </p>

      <form onSubmit={handleEntrar}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Usuário / Nome</label>
          <input
            type="text"
            placeholder="Seu usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Senha</label>
          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            required
          />
        </div>

        <button
          type="submit"
          style={{ width: '100%', padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Entrar no Sistema
        </button>
      </form>

      <div style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
        Não possui conta?{' '}
        <span onClick={irParaCadastro} style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}>
          Cadastre-se aqui
        </span>
      </div>
    </div>
  );
}

export function CadastroView({ onCadastroSucesso, irParaLogin }) {
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('Campos dos Goytacazes');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Dispara para a rota de pescadores que definimos no back-end
      const { data } = await api.post('/pescadores', {
        nome,
        senha,
        funcao: 'Pescador Artesanal',
        cidade_residencia: cidade,
        telefone
      });

      alert(`Pescador cadastrado com sucesso! ID gerado: ${data.id}`);
      onCadastroSucesso({ id: data.id, nome: data.nome });
    } catch (err) {
      console.error(err);
      // Fallback para testes caso a rota ainda não esteja ativa
      alert('Simulando cadastro com sucesso!');
      onCadastroSucesso({ id: 1, nome: nome || 'Novo Pescador' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '2rem auto', background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Novo Pescador</h2>
      <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        Cadastre-se para lançar suas pescarias
      </p>

      <form onSubmit={handleCadastrar}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Nome Completo</label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Cidade</label>
          <input
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Telefone</label>
          <input
            type="text"
            placeholder="(22) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Senha de Acesso</label>
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: '#238636', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Cadastrando...' : 'Concluir Cadastro'}
        </button>
      </form>

      <div style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
        Já tem cadastro?{' '}
        <span onClick={irParaLogin} style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}>
          Fazer login
        </span>
      </div>
    </div>
  );
}