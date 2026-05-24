-- V33 PQF - Multiusuário com controle por turma/componente e histórico de 2 anos

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS usuarios_painel (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text,
  email text UNIQUE NOT NULL,
  senha text NOT NULL,
  perfil text NOT NULL,
  escola text,
  turma_vinculada text,
  componente_vinculado text,
  acesso_geral boolean DEFAULT false,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS avaliacoes_criadas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo text UNIQUE NOT NULL,
  tipo text DEFAULT 'aluno',
  aluno_nome text,
  turma text,
  destinatario text,
  escola text,
  serie text,
  codigo_prova text,
  professor_nome text,
  professor_usuario text,
  professor_perfil text,
  componente_vinculado text,
  status text DEFAULT 'liberada',
  finalizado boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resultados_treinamento (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_nome text,
  escola text,
  turma text,
  serie text,
  serie_codigo text,
  componente_curricular text,
  materia text,
  codigo_prova text,
  codigo_avaliacao text,
  professor_nome text,
  professor_usuario text,
  professor_perfil text,
  componente_vinculado text,
  acertos integer DEFAULT 0,
  erros integer DEFAULT 0,
  total_questoes integer DEFAULT 10,
  percentual numeric DEFAULT 0,
  habilidades_revisar jsonb DEFAULT '[]'::jsonb,
  habilidades_detalhadas jsonb DEFAULT '[]'::jsonb,
  respostas jsonb DEFAULT '[]'::jsonb,
  mes_referencia text,
  ano_letivo text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS codigos_finalizados (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo text UNIQUE NOT NULL,
  aluno_nome text,
  escola text,
  turma text,
  codigo_prova text,
  finalizado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escolas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text UNIQUE NOT NULL,
  localidade text,
  ativa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Atualiza tabelas antigas
ALTER TABLE usuarios_painel ADD COLUMN IF NOT EXISTS turma_vinculada text;
ALTER TABLE usuarios_painel ADD COLUMN IF NOT EXISTS componente_vinculado text;
ALTER TABLE usuarios_painel ADD COLUMN IF NOT EXISTS acesso_geral boolean DEFAULT false;
ALTER TABLE usuarios_painel ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS professor_usuario text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS professor_perfil text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS componente_vinculado text;

ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS turma text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS serie_codigo text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS codigo_prova text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS codigo_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS professor_nome text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS professor_usuario text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS professor_perfil text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS componente_vinculado text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS mes_referencia text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS ano_letivo text;

-- Correção V33.1: campos que o treinamento envia ao finalizar
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS avaliacao_unica boolean DEFAULT false;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS tipo_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS destinatario_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS turma_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS uso_pedagogico_interno boolean DEFAULT true;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS lgpd_orientacao_confirmada boolean DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_resultados_professor_usuario ON resultados_treinamento(professor_usuario);
CREATE INDEX IF NOT EXISTS idx_resultados_turma ON resultados_treinamento(turma);
CREATE INDEX IF NOT EXISTS idx_resultados_codigo_avaliacao ON resultados_treinamento(codigo_avaliacao);
CREATE INDEX IF NOT EXISTS idx_resultados_created_at ON resultados_treinamento(created_at);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_professor_usuario ON avaliacoes_criadas(professor_usuario);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_codigo ON avaliacoes_criadas(codigo);

ALTER TABLE usuarios_painel ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_criadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_treinamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos_finalizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PQF leitura usuarios" ON usuarios_painel;
DROP POLICY IF EXISTS "PQF leitura avaliacoes" ON avaliacoes_criadas;
DROP POLICY IF EXISTS "PQF inserir avaliacoes" ON avaliacoes_criadas;
DROP POLICY IF EXISTS "PQF atualizar avaliacoes" ON avaliacoes_criadas;
DROP POLICY IF EXISTS "PQF leitura resultados" ON resultados_treinamento;
DROP POLICY IF EXISTS "PQF inserir resultados" ON resultados_treinamento;
DROP POLICY IF EXISTS "PQF leitura codigos" ON codigos_finalizados;
DROP POLICY IF EXISTS "PQF inserir codigos" ON codigos_finalizados;
DROP POLICY IF EXISTS "PQF leitura escolas" ON escolas;

CREATE POLICY "PQF leitura usuarios" ON usuarios_painel FOR SELECT USING (true);
CREATE POLICY "PQF leitura avaliacoes" ON avaliacoes_criadas FOR SELECT USING (true);
CREATE POLICY "PQF inserir avaliacoes" ON avaliacoes_criadas FOR INSERT WITH CHECK (true);
CREATE POLICY "PQF atualizar avaliacoes" ON avaliacoes_criadas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "PQF leitura resultados" ON resultados_treinamento FOR SELECT USING (true);
CREATE POLICY "PQF inserir resultados" ON resultados_treinamento FOR INSERT WITH CHECK (true);
CREATE POLICY "PQF leitura codigos" ON codigos_finalizados FOR SELECT USING (true);
CREATE POLICY "PQF inserir codigos" ON codigos_finalizados FOR INSERT WITH CHECK (true);
CREATE POLICY "PQF leitura escolas" ON escolas FOR SELECT USING (true);

INSERT INTO usuarios_painel
(nome, email, senha, perfil, escola, turma_vinculada, componente_vinculado, acesso_geral, ativo)
VALUES
('Carlos Tavares', 'carlos.tavares', '7890uiop', 'gestor', 'E.M.E.F. Pedro de Queiroz Ferreira', 'Todas', 'Todos', true, true),
('Cleilson Paiva', 'cleilson.paiva', '1234qwer', 'coordenador', 'E.M.E.F. Pedro de Queiroz Ferreira', 'Todas', 'Todos', true, true),
('Ana Ribeiro', 'ana.ribeiro', '2026abcd', 'professor', 'E.M.E.F. Pedro de Queiroz Ferreira', '2º ano', 'Português', false, true),
('Paulo Mendes', 'paulo.mendes', '2027efgh', 'professor', 'E.M.E.F. Pedro de Queiroz Ferreira', '2º ano', 'Matemática', false, true),
('Maria Duarte', 'maria.duarte', '2028ijkl', 'professor', 'E.M.E.F. Pedro de Queiroz Ferreira', '5º ano', 'Português', false, true),
('João Alencar', 'joao.alencar', '2029mnop', 'professor', 'E.M.E.F. Pedro de Queiroz Ferreira', '5º ano', 'Matemática', false, true),
('Helena Freire', 'helena.freire', '2030qrst', 'professor', 'E.M.E.F. Pedro de Queiroz Ferreira', '9º ano', 'Português', false, true),
('Antônio Vieira', 'antonio.vieira', '2031uvwx', 'professor', 'E.M.E.F. Pedro de Queiroz Ferreira', '9º ano', 'Matemática', false, true)
ON CONFLICT (email) DO UPDATE SET
  nome=EXCLUDED.nome, senha=EXCLUDED.senha, perfil=EXCLUDED.perfil, escola=EXCLUDED.escola,
  turma_vinculada=EXCLUDED.turma_vinculada, componente_vinculado=EXCLUDED.componente_vinculado,
  acesso_geral=EXCLUDED.acesso_geral, ativo=EXCLUDED.ativo;

INSERT INTO escolas (nome, localidade) VALUES
('E.M.E.F. Pedro de Queiroz Ferreira', 'Sítio Lucas')
ON CONFLICT (nome) DO NOTHING;
