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

-- As políticas RLS já foram criadas no schema anterior.
-- Se precisar recriar, rode o supabase-schema-v33-pqf.sql completo.
