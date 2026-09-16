-- Tabela de Cooperativas
CREATE TABLE cooperativas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    finalidade TEXT,
    contato VARCHAR(100),
    cidade VARCHAR(100) NOT NULL,
    historia TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pescadores
CREATE TABLE pescadores (
    id BIGSERIAL PRIMARY KEY,
    cooperativa_id BIGINT REFERENCES cooperativas(id) ON DELETE SET NULL,
    nome VARCHAR(150) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    funcao VARCHAR(100),
    cidade_residencia VARCHAR(100),
    endereco VARCHAR(255),
    telefone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipe e cargos da diretoria/administração da cooperativa
CREATE TABLE cooperativa_equipe (
    id BIGSERIAL PRIMARY KEY,
    cooperativa_id BIGINT NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
    nome_membro VARCHAR(150) NOT NULL,
    cargo VARCHAR(100) NOT NULL
);

-- Portfólio de produtos e certificações de qualidade (da cooperativa)
CREATE TABLE produtos (
    id BIGSERIAL PRIMARY KEY,
    cooperativa_id BIGINT NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    possui_selo_qualidade BOOLEAN DEFAULT FALSE,
    tipo_selo_qualidade VARCHAR(100)
);

-- Catálogo de espécies de peixes/frutos do mar
CREATE TABLE especies (
    id BIGSERIAL PRIMARY KEY,
    nome_comum VARCHAR(100) NOT NULL,
    nome_cientifico VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registro da saída/jornada de pesca (desembarque)
CREATE TABLE pescarias (
    id BIGSERIAL PRIMARY KEY,
    pescador_id BIGINT NOT NULL REFERENCES pescadores(id) ON DELETE CASCADE,
    data_pescaria DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Itens capturados na pescaria (peixes, pesos, preços)
CREATE TABLE itens_captura (
    id BIGSERIAL PRIMARY KEY,
    pescaria_id BIGINT NOT NULL REFERENCES pescarias(id) ON DELETE CASCADE,
    especie_id BIGINT NOT NULL REFERENCES especies(id),
    quantidade INT DEFAULT 1,
    peso_kg NUMERIC(10, 3) NOT NULL, -- Ex: 12.450 kg (precisão de gramas)
    tamanho_cm NUMERIC(6, 2),        -- Ex: 45.50 cm
    preco_unitario_kg NUMERIC(10, 2) NOT NULL, -- Preço acordado por kg
    -- Coluna gerada para consistência contábil (peso * preco/kg)
    valor_total NUMERIC(12, 2) GENERATED ALWAYS AS (ROUND(peso_kg * preco_unitario_kg, 2)) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Movimentações financeiras / Livro razão do pescador
CREATE TABLE transacoes_financeiras (
    id BIGSERIAL PRIMARY KEY,
    pescador_id BIGINT NOT NULL REFERENCES pescadores(id) ON DELETE CASCADE,
    item_captura_id BIGINT REFERENCES itens_captura(id) ON DELETE SET NULL, -- Origem opcional (caso seja venda de peixe)
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('CREDITO', 'DEBITO')),
    categoria VARCHAR(50) NOT NULL, -- Ex: 'CAPTURA', 'SAQUE', 'ADIANTAMENTO', 'TAXA_COOPERATIVA'
    valor NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
    descricao VARCHAR(255),
    data_transacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Índices para busca e listagem
CREATE INDEX idx_pescadores_cooperativa ON pescadores(cooperativa_id);
CREATE INDEX idx_pescadores_cidade ON pescadores(cidade_residencia);
CREATE INDEX idx_cooperativas_cidade ON cooperativas(cidade);
CREATE INDEX idx_produtos_cooperativa ON produtos(cooperativa_id);
-- Índices para consultas financeiras e relatórios
CREATE INDEX idx_pescarias_pescador_data ON pescarias(pescador_id, data_pescaria);
CREATE INDEX idx_itens_captura_pescaria ON itens_captura(pescaria_id);
CREATE INDEX idx_transacoes_pescador ON transacoes_financeiras(pescador_id);
CREATE INDEX idx_transacoes_tipo_data ON transacoes_financeiras(pescador_id, data_transacao);