

-- V23: campo para identificar prova/simulado escolhido pelo professor/coordenador
ALTER TABLE IF EXISTS resultados_treinamento
ADD COLUMN IF NOT EXISTS codigo_prova text;

-- V23: campos opcionais para acompanhamento mensal/turma
ALTER TABLE IF EXISTS resultados_treinamento
ADD COLUMN IF NOT EXISTS turma text,
ADD COLUMN IF NOT EXISTS mes_referencia text,
ADD COLUMN IF NOT EXISTS ano_letivo text;
