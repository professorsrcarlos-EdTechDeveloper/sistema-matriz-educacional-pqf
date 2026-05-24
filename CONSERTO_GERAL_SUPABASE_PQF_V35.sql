-- CONSERTO GERAL SUPABASE - SISTEMA MATRIZ EDUCACIONAL PQF V35
-- Rode este arquivo inteiro no Supabase > SQL Editor > New query > Run.
-- Não use tradução automática do navegador nesta tela.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
  avaliacao_unica boolean DEFAULT false,
  tipo_avaliacao text,
  destinatario_avaliacao text,
  turma_avaliacao text,
  acertos integer DEFAULT 0,
  erros integer DEFAULT 0,
  total_questoes integer DEFAULT 10,
  percentual numeric DEFAULT 0,
  respostas jsonb DEFAULT '[]'::jsonb,
  habilidades_detalhadas jsonb DEFAULT '[]'::jsonb,
  habilidades_revisar jsonb DEFAULT '[]'::jsonb,
  uso_pedagogico_interno boolean DEFAULT true,
  lgpd_orientacao_confirmada boolean DEFAULT true,
  mes_referencia text,
  ano_letivo text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS aluno_nome text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS escola text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS turma text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS serie text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS serie_codigo text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS componente_curricular text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS materia text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS codigo_prova text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS codigo_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS professor_nome text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS professor_usuario text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS professor_perfil text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS componente_vinculado text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS avaliacao_unica boolean DEFAULT false;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS tipo_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS destinatario_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS turma_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS acertos integer DEFAULT 0;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS erros integer DEFAULT 0;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS total_questoes integer DEFAULT 10;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS percentual numeric DEFAULT 0;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS respostas jsonb DEFAULT '[]'::jsonb;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS habilidades_detalhadas jsonb DEFAULT '[]'::jsonb;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS habilidades_revisar jsonb DEFAULT '[]'::jsonb;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS uso_pedagogico_interno boolean DEFAULT true;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS lgpd_orientacao_confirmada boolean DEFAULT true;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS mes_referencia text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS ano_letivo text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS avaliacoes_criadas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo text UNIQUE NOT NULL,
  tipo text DEFAULT 'aluno',
  aluno_nome text,
  destinatario text,
  contato text,
  turma text,
  turma_vinculada text,
  escola text,
  serie text,
  codigo_prova text,
  professor_nome text,
  professor_usuario text,
  professor_perfil text,
  componente_vinculado text,
  ano_letivo text,
  status text DEFAULT 'liberada',
  finalizado boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS aluno_nome text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS destinatario text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS contato text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS turma text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS turma_vinculada text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS escola text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS serie text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS codigo_prova text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS professor_nome text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS professor_usuario text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS professor_perfil text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS componente_vinculado text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS ano_letivo text;
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS status text DEFAULT 'liberada';
ALTER TABLE avaliacoes_criadas ADD COLUMN IF NOT EXISTS finalizado boolean DEFAULT false;

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

ALTER TABLE usuarios_painel ADD COLUMN IF NOT EXISTS turma_vinculada text;
ALTER TABLE usuarios_painel ADD COLUMN IF NOT EXISTS componente_vinculado text;
ALTER TABLE usuarios_painel ADD COLUMN IF NOT EXISTS acesso_geral boolean DEFAULT false;
ALTER TABLE usuarios_painel ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_resultados_codigo_avaliacao ON resultados_treinamento(codigo_avaliacao);
CREATE INDEX IF NOT EXISTS idx_resultados_codigo_prova ON resultados_treinamento(codigo_prova);
CREATE INDEX IF NOT EXISTS idx_resultados_turma ON resultados_treinamento(turma);
CREATE INDEX IF NOT EXISTS idx_resultados_professor_usuario ON resultados_treinamento(professor_usuario);
CREATE INDEX IF NOT EXISTS idx_resultados_created_at ON resultados_treinamento(created_at);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_codigo ON avaliacoes_criadas(codigo);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_professor_usuario ON avaliacoes_criadas(professor_usuario);
CREATE INDEX IF NOT EXISTS idx_codigos_finalizados_codigo ON codigos_finalizados(codigo);

ALTER TABLE resultados_treinamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_criadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos_finalizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_painel ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PQF resultados select" ON resultados_treinamento;
DROP POLICY IF EXISTS "PQF resultados insert" ON resultados_treinamento;
DROP POLICY IF EXISTS "PQF resultados update" ON resultados_treinamento;
DROP POLICY IF EXISTS "Permitir leitura resultados" ON resultados_treinamento;
DROP POLICY IF EXISTS "Permitir inserir resultados" ON resultados_treinamento;
DROP POLICY IF EXISTS "Permitir atualizar resultados" ON resultados_treinamento;

CREATE POLICY "PQF resultados select" ON resultados_treinamento FOR SELECT USING (true);
CREATE POLICY "PQF resultados insert" ON resultados_treinamento FOR INSERT WITH CHECK (true);
CREATE POLICY "PQF resultados update" ON resultados_treinamento FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "PQF avaliacoes select" ON avaliacoes_criadas;
DROP POLICY IF EXISTS "PQF avaliacoes insert" ON avaliacoes_criadas;
DROP POLICY IF EXISTS "PQF avaliacoes update" ON avaliacoes_criadas;
DROP POLICY IF EXISTS "Permitir leitura avaliacoes" ON avaliacoes_criadas;
DROP POLICY IF EXISTS "Permitir inserir avaliacoes" ON avaliacoes_criadas;
DROP POLICY IF EXISTS "Permitir atualizar avaliacoes" ON avaliacoes_criadas;

CREATE POLICY "PQF avaliacoes select" ON avaliacoes_criadas FOR SELECT USING (true);
CREATE POLICY "PQF avaliacoes insert" ON avaliacoes_criadas FOR INSERT WITH CHECK (true);
CREATE POLICY "PQF avaliacoes update" ON avaliacoes_criadas FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "PQF codigos select" ON codigos_finalizados;
DROP POLICY IF EXISTS "PQF codigos insert" ON codigos_finalizados;
DROP POLICY IF EXISTS "Permitir leitura codigos" ON codigos_finalizados;
DROP POLICY IF EXISTS "Permitir inserir codigos" ON codigos_finalizados;

CREATE POLICY "PQF codigos select" ON codigos_finalizados FOR SELECT USING (true);
CREATE POLICY "PQF codigos insert" ON codigos_finalizados FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "PQF escolas select" ON escolas;
DROP POLICY IF EXISTS "PQF escolas insert" ON escolas;
DROP POLICY IF EXISTS "Permitir leitura escolas" ON escolas;
DROP POLICY IF EXISTS "Permitir inserir escolas" ON escolas;

CREATE POLICY "PQF escolas select" ON escolas FOR SELECT USING (true);
CREATE POLICY "PQF escolas insert" ON escolas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "PQF usuarios select" ON usuarios_painel;
DROP POLICY IF EXISTS "Permitir leitura usuarios" ON usuarios_painel;

CREATE POLICY "PQF usuarios select" ON usuarios_painel FOR SELECT USING (true);

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
  nome = EXCLUDED.nome,
  senha = EXCLUDED.senha,
  perfil = EXCLUDED.perfil,
  escola = EXCLUDED.escola,
  turma_vinculada = EXCLUDED.turma_vinculada,
  componente_vinculado = EXCLUDED.componente_vinculado,
  acesso_geral = EXCLUDED.acesso_geral,
  ativo = EXCLUDED.ativo;

INSERT INTO escolas (nome, localidade, ativa)
VALUES ('E.M.E.F. Pedro de Queiroz Ferreira', 'Sítio Lucas', true)
ON CONFLICT (nome) DO UPDATE SET localidade=EXCLUDED.localidade, ativa=true;
