import React, { useState } from 'react';
import api from '../services/api';
import BalancoCards from './BalancoCards';

export default function FinanceiroView({ balanco, onAtualizar }) {
  const [tipo, setTipo] = useState('DEBITO');
  const [categoria, setCategoria] = useState('COMBUSTIVEL');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  const categoriasSugeridas = [
    { value: 'COMBUSTIVEL', label: 'Combustível / Óleo' },
    { value: 'GELO', label: 'Gelo' },
    { value: 'MANUTENCAO', label: 'Manutenção de Barco/Rede' },
    { value: 'ALIMENTACAO', label: 'Alimentação / Rancho' },
    { value: 'TAXA_COOPERATIVA', label: 'Taxa da Cooperativa' },
    { value: 'ADIANTAMENTO', label: 'Adiantamento / Retirada' },
    { value: 'OUTROS', label: 'Outros' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valor || parseFloat(valor) <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/financeiro/transacoes', {
        pescador_id: 1, // Simulado via mock
        tipo,
        categoria,
        valor: parseFloat(valor),
        descricao
      });

      alert('Lançamento financeiro registrado com sucesso!');
      setValor('');
      setDescricao('');

      if (onAtualizar) onAtualizar();
    } catch (error) {
      console.error('Erro ao lançar despesa:', error);
      alert('Erro ao registrar transação no banco.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 1. Indicadores Financeiros */}
      <BalancoCards balanco={balanco} />

      {/* 2. Formulário de Novo Lançamento Manual */}
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
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Novo Lançamento Financeiro</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Tipo de Movimentação</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            >
              <option value="DEBITO">Débito / Despesa (-)</option>
              <option value="CREDITO">Crédito / Entrada (+)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            >
              {categoriasSugeridas.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 85.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Descrição / Justificativa</label>
          <input
            type="text"
            placeholder="Ex: 20L de gasolina para a saída do Rio Paraíba"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: tipo === 'DEBITO' ? '#e53e3e' : '#00cc88',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Registrando...' : tipo === 'DEBITO' ? 'Registrar Despesa (-)' : 'Registrar Entrada (+)'}
        </button>
      </form>

      {/* 3. Grid de Extrato Recente e Distribuição por Espécie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* Extrato Recente */}
        <div style={{ background: '#1a1a1a', padding: '1.2rem', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Extrato de Movimentações</h3>
          {(!balanco?.extrato_recente || balanco.extrato_recente.length === 0) ? (
            <p style={{ color: '#888' }}>Nenhuma movimentação registrada.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Tipo</th>
                  <th style={{ padding: '8px' }}>Descrição</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {balanco.extrato_recente.map((t) => {
                  const isCredito = t.tipo === 'CREDITO';
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #262626' }}>
                      <td style={{ padding: '8px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: isCredito ? 'rgba(0, 204, 136, 0.15)' : 'rgba(229, 62, 62, 0.15)',
                          color: isCredito ? '#00cc88' : '#e53e3e',
                          fontWeight: 'bold'
                        }}>
                          {t.categoria}
                        </span>
                      </td>
                      <td style={{ padding: '8px', color: '#ccc' }}>{t.descricao || '-'}</td>
                      <td style={{
                        padding: '8px',
                        textAlign: 'right',
                        fontWeight: 'bold',
                        color: isCredito ? '#00cc88' : '#e53e3e'
                      }}>
                        {isCredito ? '+ ' : '- '}R$ {Number(t.valor).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Produção / Faturamento por Espécie */}
        <div style={{ background: '#1a1a1a', padding: '1.2rem', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Faturamento por Espécie</h3>
          {(!balanco?.producao_por_especie || balanco.producao_por_especie.length === 0) ? (
            <p style={{ color: '#888' }}>Nenhum pescado registrado.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Espécie</th>
                  <th style={{ padding: '8px' }}>Peso (kg)</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Total (R$)</th>
                </tr>
              </thead>
              <tbody>
                {balanco.producao_por_especie.map((esp, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #262626' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{esp.nome_comum}</td>
                    <td style={{ padding: '8px', color: '#aaa' }}>{Number(esp.total_kg).toFixed(2)} kg</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#00cc88' }}>
                      R$ {Number(esp.total_gerado).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}