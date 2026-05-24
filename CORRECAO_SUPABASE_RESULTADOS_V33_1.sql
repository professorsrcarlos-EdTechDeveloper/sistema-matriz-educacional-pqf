-- CORREÇÃO V33.1 - RESULTADOS NÃO APARECEM NO PAINEL
-- Rode este SQL no Supabase > SQL Editor > New query > Run

ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS avaliacao_unica boolean DEFAULT false;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS tipo_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS destinatario_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS turma_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS uso_pedagogico_interno boolean DEFAULT true;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS lgpd_orientacao_confirmada boolean DEFAULT true;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS professor_nome text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS professor_usuario text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS professor_perfil text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS componente_vinculado text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS serie_codigo text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS codigo_avaliacao text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS mes_referencia text;
ALTER TABLE resultados_treinamento ADD COLUMN IF NOT EXISTS ano_letivo text;

CREATE POLICY IF NOT EXISTS "PQF inserir resultados" ON resultados_treinamento FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "PQF leitura resultados" ON resultados_treinamento FOR SELECT USING (true);
