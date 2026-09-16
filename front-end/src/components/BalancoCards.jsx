import React from 'react';

export default function BalancoCards({ balanco }) {
  if (!balanco || !balanco.resumo_financeiro) return null;

  const { total_creditos, total_debitos, saldo_atual } = balanco.resumo_financeiro;

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
      <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', flex: 1 }}>
        <h3>Receita Total</h3>
        <p style={{ color: 'green', fontSize: '1.4rem', fontWeight: 'bold' }}>
          R$ {Number(total_creditos).toFixed(2)}
        </p>
      </div>

      <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', flex: 1 }}>
        <h3>Despesas / Custos</h3>
        <p style={{ color: 'red', fontSize: '1.4rem', fontWeight: 'bold' }}>
          R$ {Number(total_debitos).toFixed(2)}
        </p>
      </div>

      <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', flex: 1 }}>
        <h3>Saldo Líquido</h3>
        <p style={{ color: saldo_atual >= 0 ? '#0070f3' : 'red', fontSize: '1.4rem', fontWeight: 'bold' }}>
          R$ {Number(saldo_atual).toFixed(2)}
        </p>
      </div>
    </div>
  );
}