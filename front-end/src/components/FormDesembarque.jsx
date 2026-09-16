import { useState, useEffect } from 'react';
import api from '../services/api';

export default function FormDesembarque({ onSucesso }) {
  const [especies, setEspecies] = useState([]);
  const [dataPescaria, setDataPescaria] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState('');
  
  // Campos do peixe capturado
  const [especieId, setEspecieId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [pesoKg, setPesoKg] = useState('');
  const [precoKg, setPrecoKg] = useState('');
  const [loading, setLoading] = useState(false);

  // Busca espécies cadastradas para o select
  useEffect(() => {
    async function carregarEspecies() {
      try {
        const { data } = await api.get('/pesca/especies');
        setEspecies(data);
        if (data.length > 0) setEspecieId(data[0].id);
      } catch (err) {
        console.error('Erro ao buscar espécies:', err);
      }
    }
    carregarEspecies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!especieId || !pesoKg || !precoKg) {
      alert('Por favor, preencha todos os campos do peixe.');
      return;
    }

    setLoading(true);

    const payload = {
      data_pescaria: dataPescaria,
      observacoes,
      capturas: [
        {
          especie_id: Number(especieId),
          quantidade: Number(quantidade),
          peso_kg: parseFloat(pesoKg),
          preco_unitario_kg: parseFloat(precoKg)
        }
      ]
    };

    try {
      await api.post('/pesca/desembarque', payload);
      alert('Pescaria e faturamento registrados com sucesso!');
      
      // Limpa os campos
      setObservacoes('');
      setPesoKg('');
      setPrecoKg('');
      setQuantidade(1);

      // Notifica o componente pai para atualizar a tela
      if (onSucesso) onSucesso();
    } catch (err) {
      console.error('Erro ao registrar desembarque:', err);
      alert('Erro ao salvar no banco. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        background: '#1a1a1a',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #333',
        marginBottom: '2rem'
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Registrar Nova Pescaria</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Data da Pescaria</label>
          <input 
            type="date" 
            value={dataPescaria}
            onChange={(e) => setDataPescaria(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Observações / Local</label>
          <input 
            type="text" 
            placeholder="Ex: Pesca costeira matinal..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Espécie</label>
          <select 
            value={especieId} 
            onChange={(e) => setEspecieId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          >
            {especies.map((esp) => (
              <option key={esp.id} value={esp.id}>
                {esp.nome_comum}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Qtd. de Peixes</label>
          <input 
            type="number" 
            min="1"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Peso Total (kg)</label>
          <input 
            type="number" 
            step="0.01" 
            placeholder="Ex: 12.5"
            value={pesoKg}
            onChange={(e) => setPesoKg(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Preço/kg (R$)</label>
          <input 
            type="number" 
            step="0.01" 
            placeholder="Ex: 35.00"
            value={precoKg}
            onChange={(e) => setPrecoKg(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            required
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={{
          background: '#0070f3',
          color: '#fff',
          border: 'none',
          padding: '10px 18px',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Salvando...' : 'Salvar Desembarque'}
      </button>
    </form>
  );
}