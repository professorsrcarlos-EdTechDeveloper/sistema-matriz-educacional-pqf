
let aluno={nome:"", escola:"", serie:"", codigoProva:""};
let questoes=[], indice=0, respostas=[], provaAtual=null, audioCtx=null;

function beep(){
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.035;
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
    osc.stop(audioCtx.currentTime + 0.08);
  }catch(e){}
}

function normalizarCodigo(v){return String(v||"").trim().toUpperCase().replace(/\s+/g,"")}
function nomeSerie(s){ if(String(s).includes("2")) return "2º ano"; if(String(s).includes("5")) return "5º ano"; if(String(s).includes("9")) return "9º ano"; return s; }
function componenteDoCodigo(c){ c=normalizarCodigo(c); return c.includes("P") ? "Português" : c.includes("M") ? "Matemática" : ""; }
function serieDoCodigo(c){ c=normalizarCodigo(c); return c.startsWith("2")?"2":c.startsWith("5")?"5":c.startsWith("9")?"9":""; }

function obterProvaPorCodigo(codigo){
  codigo = normalizarCodigo(codigo);

  // V28: prova fixa por código. Não há sorteio na execução.
  // Ex.: 2P01 sempre abre exatamente as mesmas 10 questões.
  if(window.SIMULADOS_FIXOS && window.SIMULADOS_FIXOS[codigo]){
    const s = window.SIMULADOS_FIXOS[codigo];
    return {
      codigo: s.codigo,
      serie: s.serie,
      componente: s.componente_curricular,
      questoes: (s.questoes || []).slice(0,10)
    };
  }

  // Compatibilidade antiga, caso o arquivo de simulados fixos não carregue.
  if(window.PROVAS_GERADAS && window.BANCO_QUESTOES && window.PROVAS_GERADAS[codigo]){
    const meta = window.PROVAS_GERADAS[codigo];
    const chave = meta.serie + "|" + meta.materia;
    const banco = window.BANCO_QUESTOES[chave] || [];
    const lista = (meta.indices || []).map(i => banco[i]).filter(Boolean).slice(0,10);
    return {codigo, serie:meta.serie, componente:meta.materia, questoes:lista};
  }
  return null;
}

function obterProvasPersonalizadasLocais(){
  try{return JSON.parse(localStorage.getItem("matriz_provas_personalizadas")||"[]")}catch(e){return []}
}
async function buscarProvaPersonalizadaOnline(codigo){
  codigo=normalizarCodigo(codigo);
  const local=obterProvasPersonalizadasLocais().find(p=>normalizarCodigo(p.codigo)===codigo);
  if(local){
    return {codigo:local.codigo, serie:local.serie, componente:local.componente, questoes:(local.questoes||[]).slice(0,10)};
  }
  try{
    if(supabaseAtivoTreinamento()){
      const sb=clienteSupabaseTreinamento();
      const {data,error}=await sb.from("provas_personalizadas").select("*").eq("codigo",codigo).limit(1).maybeSingle();
      if(error) console.warn("Erro ao buscar prova personalizada online. Verifique se o SQL V36 foi aplicado:", error);
      if(data){
        return {codigo:data.codigo, serie:data.serie, componente:data.componente, questoes:(data.questoes||[]).slice(0,10)};
      }
    }
  }catch(e){console.warn("Falha ao buscar prova personalizada:", e);}
  return null;
}
async function obterProvaPorCodigoAsync(codigo){
  return obterProvaPorCodigo(codigo) || await buscarProvaPersonalizadaOnline(codigo);
}

function svgCasa(){return `<svg viewBox="0 0 360 220" width="320" role="img" aria-label="Casa"><rect width="360" height="220" rx="22" fill="#0b2438"/><rect x="86" y="92" width="188" height="96" rx="8" fill="#f8fafc"/><polygon points="70,98 180,28 290,98" fill="#ef4444"/><rect x="158" y="126" width="46" height="62" rx="6" fill="#8b5e3c"/><rect x="108" y="118" width="34" height="28" rx="4" fill="#93c5fd"/><rect x="218" y="118" width="34" height="28" rx="4" fill="#93c5fd"/><rect x="42" y="186" width="278" height="10" rx="5" fill="#22c55e"/><circle cx="304" cy="56" r="16" fill="#fbbf24"/></svg>`}
function svgPato(){return `<svg viewBox="0 0 360 220" width="320" role="img" aria-label="Pato"><rect width="360" height="220" rx="22" fill="#0b2438"/><ellipse cx="160" cy="120" rx="70" ry="44" fill="#fbbf24"/><circle cx="230" cy="94" r="34" fill="#fbbf24"/><polygon points="252,95 304,82 304,108" fill="#fb923c"/><circle cx="240" cy="86" r="5" fill="#111"/><path d="M42 154 Q180 188 318 154" stroke="#38bdf8" stroke-width="10" fill="none"/><path d="M116 156 L102 180 M152 158 L142 181" stroke="#f59e0b" stroke-width="6"/></svg>`}
function svgBola(){return `<svg viewBox="0 0 360 220" width="320"><rect width="360" height="220" rx="22" fill="#0b2438"/><circle cx="180" cy="110" r="64" fill="#3b82f6"/><path d="M180 46 Q146 78 142 114 Q146 150 180 174 Q214 150 218 114 Q214 78 180 46Z" fill="none" stroke="#fff" stroke-width="6"/><path d="M118 88 L142 114 L118 140 M242 88 L218 114 L242 140 M180 46 L180 72 M180 156 L180 174" stroke="#fff" stroke-width="6" fill="none"/></svg>`}
function svgBanana(){return `<svg viewBox="0 0 360 220" width="320"><rect width="360" height="220" rx="22" fill="#0b2438"/><path d="M96 132 C126 60, 222 46, 278 82 C246 118, 192 154, 124 158 C112 158,102 148,96 132Z" fill="#facc15" stroke="#eab308" stroke-width="5"/><path d="M100 130 C124 124, 172 116, 246 90" stroke="#fde68a" stroke-width="4" fill="none"/></svg>`}
function svgChuva(){return `<svg viewBox="0 0 360 220" width="320"><rect width="360" height="220" rx="22" fill="#0b2438"/><ellipse cx="170" cy="88" rx="56" ry="28" fill="#94a3b8"/><ellipse cx="214" cy="96" rx="44" ry="24" fill="#94a3b8"/><line x1="132" y1="126" x2="118" y2="164" stroke="#38bdf8" stroke-width="7"/><line x1="176" y1="126" x2="162" y2="164" stroke="#38bdf8" stroke-width="7"/><line x1="218" y1="126" x2="204" y2="164" stroke="#38bdf8" stroke-width="7"/><line x1="258" y1="126" x2="244" y2="164" stroke="#38bdf8" stroke-width="7"/></svg>`}
function svgTriangulo(){return `<svg viewBox="0 0 360 220" width="320"><rect width="360" height="220" rx="22" fill="#0b2438"/><polygon points="180,46 286,172 74,172" fill="#22c55e" stroke="#86efac" stroke-width="7"/></svg>`}
function svgCirculo(){return `<svg viewBox="0 0 360 220" width="320"><rect width="360" height="220" rx="22" fill="#0b2438"/><circle cx="180" cy="110" r="72" fill="#f472b6" stroke="#fbcfe8" stroke-width="7"/></svg>`}
function svgRegua(){return `<svg viewBox="0 0 360 220" width="320"><rect width="360" height="220" rx="22" fill="#0b2438"/><rect x="70" y="92" width="220" height="42" rx="10" fill="#f59e0b"/><g stroke="#78350f" stroke-width="4">${Array.from({length:11}).map((_,i)=>`<line x1="${92+i*18}" y1="92" x2="${92+i*18}" y2="${i%2?112:126}"/>`).join("")}</g></svg>`}
function svgRelogio(){return `<svg viewBox="0 0 360 220" width="320"><rect width="360" height="220" rx="22" fill="#0b2438"/><circle cx="180" cy="110" r="72" fill="#f8fafc" stroke="#38bdf8" stroke-width="8"/><line x1="180" y1="110" x2="180" y2="72" stroke="#111827" stroke-width="7"/><line x1="180" y1="110" x2="214" y2="110" stroke="#111827" stroke-width="7"/></svg>`}
function svgMoedas(){return `<svg viewBox="0 0 360 220" width="320"><rect width="360" height="220" rx="22" fill="#0b2438"/><ellipse cx="136" cy="126" rx="46" ry="18" fill="#fbbf24"/><ellipse cx="202" cy="104" rx="46" ry="18" fill="#f59e0b"/><ellipse cx="242" cy="138" rx="46" ry="18" fill="#fde68a"/></svg>`}

function limparHtmlIconeTreino(v){return String(v||"").replace(/[<>&"']/g, m=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"}[m]));}
function iconeTreinoEhImagem(valor){
  const v=String(valor||"").trim().toLowerCase();
  return /^(https?:\/\/|\.\/|\/|icones\/)/.test(v) || /\.(png|jpg|jpeg|webp|svg|gif)(\?.*)?$/.test(v);
}
function htmlIconeTreino(valor){
  const v=String(valor||"").trim();
  if(!v) return "";
  const safe=limparHtmlIconeTreino(v);
  if(iconeTreinoEhImagem(v)){
    return `<div style="text-align:center;padding:12px"><img src="${safe}" alt="ícone da questão" style="max-width:170px;max-height:170px;width:38%;object-fit:contain" onerror="this.outerHTML='<div style=&quot;font-size:4rem&quot;>📘</div>'"></div>`;
  }
  return `<div style="font-size:4rem;text-align:center;padding:12px">${safe}</div>`;
}
function visualPorQuestao(q){
  if(q && q.icone){return htmlIconeTreino(q.icone);}
  const t=((q.base||"")+" "+(q.q||"")).toLowerCase();
  if(t.includes("casa")) return svgCasa();
  if(t.includes("pato")) return svgPato();
  if(t.includes("bola")) return svgBola();
  if(t.includes("banana")) return svgBanana();
  if(t.includes("choveu") || t.includes("chuva")) return svgChuva();
  if(t.includes("triângulo") || t.includes("3 lados")) return svgTriangulo();
  if(t.includes("círculo") || t.includes("sem lados retos")) return svgCirculo();
  if(t.includes("régua") || t.includes("comprimento")) return svgRegua();
  if(t.includes("relógio") || t.includes("tempo")) return svgRelogio();
  if(t.includes("moeda") || t.includes("r$")) return svgMoedas();
  return "";
}


// V29 — avaliações liberadas pelo coordenador/professor
function obterAvaliacoesCriadas(){
  return JSON.parse(localStorage.getItem("matriz_avaliacoes_criadas") || "[]");
}
function salvarAvaliacoesCriadas(lista){
  localStorage.setItem("matriz_avaliacoes_criadas", JSON.stringify(lista));
}
function obterAvaliacaoPorCodigo(codigo){
  codigo = normalizarCodigo(codigo);
  return obterAvaliacoesCriadas().find(a => normalizarCodigo(a.codigo) === codigo) || null;
}
function supabaseAtivoTreinamento(){
  return !!(window.MATRIZ_SUPABASE && window.MATRIZ_SUPABASE.enabled && window.MATRIZ_SUPABASE.url && window.MATRIZ_SUPABASE.anonKey && window.supabase);
}
function clienteSupabaseTreinamento(){
  return window.supabase.createClient(window.MATRIZ_SUPABASE.url, window.MATRIZ_SUPABASE.anonKey);
}
async function buscarAvaliacaoPorCodigoOnline(codigo){
  codigo=normalizarCodigo(codigo);
  const local=obterAvaliacaoPorCodigo(codigo);
  if(local) return local;
  try{
    if(supabaseAtivoTreinamento()){
      const sb=clienteSupabaseTreinamento();
      const {data,error}=await sb.from("avaliacoes_criadas").select("*").eq("codigo",codigo).limit(1).maybeSingle();
      if(error) console.warn("Erro ao buscar avaliação online:", error);
      if(data){
        return {
          codigo:data.codigo,
          tipo:data.tipo || "aluno",
          aluno_nome:data.aluno_nome || data.destinatario || "",
          aluno_nome_completo:data.aluno_nome || data.destinatario || "",
          destinatario:data.destinatario || data.aluno_nome || "",
          turma:data.turma || "",
          escola:data.escola || "",
          serie:data.serie || "",
          codigoProva:data.codigo_prova || data.codigoProva || "",
          finalizado:!!data.finalizado,
          status:data.status || "liberada",
          professor_nome:data.professor_nome || "",
          professor_usuario:data.professor_usuario || "",
          professor_perfil:data.professor_perfil || "",
          componente_vinculado:data.componente_vinculado || "",
          created_at:data.created_at
        };
      }
    }
  }catch(e){console.warn("Falha ao consultar código no Supabase:", e);}
  return null;
}
async function codigoJaFinalizadoOnline(codigo){
  codigo=normalizarCodigo(codigo);
  if(codigoJaFinalizado(codigo)) return true;
  try{
    if(supabaseAtivoTreinamento()){
      const sb=clienteSupabaseTreinamento();
      const {data}=await sb.from("codigos_finalizados").select("codigo").eq("codigo",codigo).limit(1).maybeSingle();
      if(data) return true;
      const {data:av}=await sb.from("avaliacoes_criadas").select("finalizado").eq("codigo",codigo).limit(1).maybeSingle();
      if(av && av.finalizado) return true;
    }
  }catch(e){console.warn("Falha ao verificar código finalizado:", e);}
  return false;
}
async function marcarCodigoFinalizadoOnline(codigo){
  codigo=normalizarCodigo(codigo);
  marcarCodigoFinalizado(codigo);
  try{
    if(supabaseAtivoTreinamento()){
      const sb=clienteSupabaseTreinamento();
      await sb.from("codigos_finalizados").insert([{
        codigo,
        aluno_nome:aluno.nome,
        escola:aluno.escola,
        turma:aluno.turma || "",
        codigo_prova:aluno.codigoProva || provaAtual.codigo
      }]);
      await sb.from("avaliacoes_criadas").update({finalizado:true,status:"finalizada"}).eq("codigo",codigo);
    }
  }catch(e){console.warn("Falha ao marcar código finalizado online:", e);}
}
function codigoJaFinalizado(codigo){
  const finalizados = JSON.parse(localStorage.getItem("matriz_codigos_finalizados") || "[]");
  return finalizados.includes(normalizarCodigo(codigo));
}
function marcarCodigoFinalizado(codigo){
  const c = normalizarCodigo(codigo);
  const finalizados = JSON.parse(localStorage.getItem("matriz_codigos_finalizados") || "[]");
  if(!finalizados.includes(c)){
    finalizados.push(c);
    localStorage.setItem("matriz_codigos_finalizados", JSON.stringify(finalizados));
  }
}
function avaliacaoEhCodigoUnico(){
  return !!(provaAtual && provaAtual.codigoAvaliacaoUnica);
}
function tentarReconhecerCodigoAluno(){
  const campo = document.getElementById("nomeAluno");
  if(!campo) return;
  const codigo = normalizarCodigo(campo.value);
  const av = obterAvaliacaoPorCodigo(codigo);
  const box = document.getElementById("avisoCodigoReconhecido");
  if(av){
    if(box){
      box.innerHTML = `<strong>Código reconhecido:</strong> avaliação ${av.codigo} vinculada à prova ${av.codigoProva}.<br>${av.aluno_nome_completo ? "Aluno: "+av.aluno_nome_completo+"<br>" : ""}Turma: ${av.turma || av.destinatario || "não informado"}.`;
      box.style.display = "block";
    }
    if(av.escola) document.getElementById("nomeEscola").value = av.escola;
    if(av.serie) document.getElementById("serieAluno").value = av.serie;
    if(av.codigoProva) document.getElementById("codigoProva").value = av.codigoProva;
  }else if(box){
    box.style.display = "none";
    box.innerHTML = "";
  }
}

function mostrarEntrada(){
  document.getElementById("app").innerHTML = `
    <div class="form">
      <label>Nome ou código do aluno</label>
      <input id="nomeAluno" oninput="tentarReconhecerCodigoAluno()" placeholder="Nome do aluno ou código da avaliação criada pelo coordenador">
      <label>Nome da escola</label>
      <input id="nomeEscola" placeholder="Ex.: EMEF Pedro de Queiroz Ferreira">
      <label>Série/Ano</label>
      <select id="serieAluno">
        <option value="">Selecione</option>
        <option value="2">2º ano</option>
        <option value="5">5º ano</option>
        <option value="9">9º ano</option>
      </select>
      <div id="avisoCodigoReconhecido" class="notice" style="display:none"></div>
      <label>Código da prova</label>
      <input id="codigoProva" placeholder="Ex.: 2P01, 2M01, 5P01, 5M01, 9P01, 9M01">
      <div class="notice"><strong>Aviso LGPD:</strong> use esta ferramenta apenas com orientação da escola/professor. Não informe CPF, endereço, telefone ou dados sensíveis.</div>
      <label style="display:flex;gap:8px;align-items:flex-start;color:#e2e8f0;font-size:.92rem;line-height:1.4">
        <input id="aceiteLgpd" type="checkbox" style="width:auto;margin-top:3px;accent-color:#fbbf24">
        Confirmo que estou usando esta ferramenta com orientação da escola/professor e para fins pedagógicos.
      </label>
      <button class="btn gold" onclick="iniciar()">ENTRAR NO TREINAMENTO</button>
      <button class="btn muted" onclick="location.href='index.html'">VOLTAR À PÁGINA INICIAL</button>
      <div class="notice"><strong>Acesso por código:</strong> digite somente o código entregue pela escola/professor. Não use códigos de prova que não foram liberados para você.</div>
    </div>`;
}

async function iniciar(){
  const nomeDigitado=document.getElementById("nomeAluno").value.trim();
  const codigoAlunoOuAvaliacao=normalizarCodigo(nomeDigitado);
  const avaliacaoCriada=await buscarAvaliacaoPorCodigoOnline(codigoAlunoOuAvaliacao);
  if(avaliacaoCriada && await codigoJaFinalizadoOnline(avaliacaoCriada.codigo)){
    alert("Esta avaliação já foi finalizada. Procure o professor/coordenador para nova liberação.");
    return;
  }
  const nome=avaliacaoCriada ? (avaliacaoCriada.aluno_nome_completo || avaliacaoCriada.aluno_nome || avaliacaoCriada.destinatario || avaliacaoCriada.codigo) : nomeDigitado;
  const turma=(avaliacaoCriada && avaliacaoCriada.turma) ? avaliacaoCriada.turma : "";
  const escola=(avaliacaoCriada && avaliacaoCriada.escola) ? avaliacaoCriada.escola : document.getElementById("nomeEscola").value.trim();
  const serie=(avaliacaoCriada && avaliacaoCriada.serie) ? String(avaliacaoCriada.serie) : document.getElementById("serieAluno").value;
  const codigo=normalizarCodigo((avaliacaoCriada && avaliacaoCriada.codigoProva) ? avaliacaoCriada.codigoProva : document.getElementById("codigoProva").value);
  const aceite=document.getElementById("aceiteLgpd").checked;
  if(nome.length<2){alert("Digite o nome ou código do aluno.");return;}
  if(!escola){alert("Digite o nome da escola.");return;}
  if(!serie){alert("Selecione a série/ano.");return;}
  if(!codigo){alert("Digite o código da prova.");return;}
  if(!aceite){alert("Confirme o uso com orientação da escola/professor.");return;}
  if(serieDoCodigo(codigo) && serieDoCodigo(codigo)!==serie){alert("O código da prova não corresponde à série selecionada.");return;}
  const prova = await obterProvaPorCodigoAsync(codigo);
  if(!prova || !Array.isArray(prova.questoes) || !prova.questoes.length){alert("Código de prova não encontrado.");return;}
  aluno={nome, turma, escola, serie, codigoProva:codigo};
  provaAtual=prova;
  if(avaliacaoCriada){
    provaAtual.codigoAvaliacaoUnica=avaliacaoCriada.codigo;
    provaAtual.tipoAvaliacao=avaliacaoCriada.tipo || "aluno";
    provaAtual.destinatario=avaliacaoCriada.destinatario || avaliacaoCriada.aluno_nome_completo || "";
    provaAtual.turma=avaliacaoCriada.turma || "";
    provaAtual.professor_nome=avaliacaoCriada.professor_nome || "";
    provaAtual.professor_usuario=avaliacaoCriada.professor_usuario || "";
    provaAtual.professor_perfil=avaliacaoCriada.professor_perfil || "";
    provaAtual.componente_vinculado=avaliacaoCriada.componente_vinculado || "";
  }
  questoes=prova.questoes.slice(0,10);
  respostas=[]; indice=0;
  mostrarQuestao();
}

function mostrarQuestao(){
  const q=questoes[indice];
  const progresso=Math.round((indice/questoes.length)*100);
  const visual=visualPorQuestao(q);
  const mostrarBase = ((q.base||"").trim().toUpperCase()==="CASA") ? "" : `<div class="text-base">${q.base||"Observe a situação apresentada."}</div>`;
  document.getElementById("app").innerHTML = `
    <div class="status">
      <span>Aluno/Código: ${aluno.nome}</span>
      <span>Escola: ${aluno.escola}</span>
      ${aluno.turma?`<span>Turma: ${aluno.turma}</span>`:""}
      <span>Série: ${nomeSerie(aluno.serie)}</span>
      <span>Prova: ${provaAtual.codigo}</span>
      <span>Componente Curricular: ${provaAtual.componente}</span>
    </div>
    <div class="progress"><span style="width:${progresso}%"></span></div>
    <div class="qbox">
      <div>
        <div class="question-label">Questão ${indice+1}/10</div>
        ${mostrarBase}
        ${visual?`<div class="visual">${visual}</div>`:""}
        <div class="question-label">Pergunta</div>
        <div style="font-size:1.08rem;line-height:1.45;margin-bottom:10px">${q.q}</div>
        <div class="options">
          ${(q.o||[]).map((op,i)=>`<button class="btn option" onclick="selecionar(${i})" id="op${i}">${String.fromCharCode(65+i)}) ${op}</button>`).join("")}
        </div>
      </div>
      <div class="qactions">
        <button class="btn gold" onclick="avancar()">Avançar</button>
        <button class="btn muted" onclick="mostrarEntrada()">Voltar ao início</button>
      </div>
    </div>`;
}

function selecionar(i){
  beep();
  respostas[indice]=i;
  document.querySelectorAll(".option").forEach(btn=>btn.classList.remove("selected"));
  const b=document.getElementById("op"+i);
  if(b) b.classList.add("selected");
}

function avancar(){
  if(respostas[indice]===undefined){alert("Selecione uma alternativa para continuar.");return;}
  if(indice < questoes.length-1){indice++;mostrarQuestao();}else{mostrarConferencia();}
}

function salvarLocal(resultado){
  ["matriz_spaece_resultados_locais","resultados_treinamento"].forEach(ch=>{
    const lista=JSON.parse(localStorage.getItem(ch)||"[]");
    lista.unshift(resultado);
    localStorage.setItem(ch, JSON.stringify(lista.slice(0,1000)));
  });
}
async function salvarSupabase(resultado){
  try{
    if(window.MATRIZ_SUPABASE && window.MATRIZ_SUPABASE.enabled && window.supabase){
      const sb=window.supabase.createClient(window.MATRIZ_SUPABASE.url, window.MATRIZ_SUPABASE.anonKey);
      const payload={
        created_at: resultado.created_at,
        aluno_nome: resultado.aluno_nome,
        escola: resultado.escola,
        turma: resultado.turma,
        serie: resultado.serie,
        serie_codigo: resultado.serie_codigo,
        componente_curricular: resultado.materia,
        materia: resultado.materia,
        codigo_prova: resultado.codigo_prova,
        codigo_avaliacao: resultado.codigo_avaliacao,
        professor_nome: resultado.professor_nome || "",
        professor_usuario: resultado.professor_usuario || "",
        professor_perfil: resultado.professor_perfil || "",
        componente_vinculado: resultado.componente_vinculado || resultado.materia || "",
        avaliacao_unica: !!resultado.avaliacao_unica,
        tipo_avaliacao: resultado.tipo_avaliacao || "teste_livre",
        destinatario_avaliacao: resultado.destinatario_avaliacao || "",
        turma_avaliacao: resultado.turma_avaliacao || resultado.turma || "",
        acertos: resultado.acertos,
        erros: resultado.erros,
        total_questoes: resultado.total_questoes,
        percentual: resultado.percentual,
        respostas: resultado.respostas || [],
        habilidades_detalhadas: resultado.habilidades_detalhadas || [],
        habilidades_revisar: resultado.habilidades_revisar || [],
        uso_pedagogico_interno: true,
        lgpd_orientacao_confirmada: true,
        ano_letivo: String(new Date().getFullYear()),
        mes_referencia: String(new Date().getMonth()+1).padStart(2,"0")+"/"+String(new Date().getFullYear())
      };
      const {error}=await sb.from("resultados_treinamento").insert([payload]);
      if(error){
        console.error("ERRO AO SALVAR RESULTADO NO SUPABASE:", error);
        localStorage.setItem("matriz_ultimo_erro_supabase", JSON.stringify({quando:new Date().toISOString(), erro:error.message || error, payload}));
        return false;
      }
      return true;
    }
  }catch(e){
    console.error("Erro Supabase:", e);
    localStorage.setItem("matriz_ultimo_erro_supabase", JSON.stringify({quando:new Date().toISOString(), erro:String(e)}));
  }
  return false;
}



function mostrarConferencia(){
  const itens = questoes.map((q,i)=>`
    <div class="text-base" style="text-align:left">
      <b>Questão ${i+1}</b><br>
      ${q.q}<br>
      <small>Resposta marcada: <b>${respostas[i] !== undefined ? String.fromCharCode(65+respostas[i]) : "não respondida"}</b></small>
      <button class="btn muted" onclick="indice=${i};mostrarQuestao()">Alterar resposta da questão ${i+1}</button>
    </div>`).join("");
  document.getElementById("app").innerHTML = `
    <div class="final">
      <h2>Conferir respostas</h2>
      <p>Confira se todas as questões foram respondidas. Você pode alterar qualquer resposta antes de finalizar.</p>
      ${itens}
      <button class="btn gold" onclick="finalizar()">FINALIZAR E ENVIAR AO COORDENADOR</button>
      <button class="btn muted" onclick="indice=questoes.length-1;mostrarQuestao()">VOLTAR À ÚLTIMA QUESTÃO</button>
    </div>`;
}

async function finalizar(){
  const detalhadas=questoes.map((q,i)=>({questao:i+1, habilidade:q.hab||"Sem descritor", acertou:respostas[i]===q.c, marcada:respostas[i], correta:q.c}));
  const acertos=detalhadas.filter(x=>x.acertou).length;
  const total=questoes.length;
  const percentual=Math.round((acertos/total)*100);
  const mapa={};
  detalhadas.forEach(r=>{
    if(!mapa[r.habilidade]) mapa[r.habilidade]={habilidade:r.habilidade, acertos:0, erros:0, total:0};
    mapa[r.habilidade].total++;
    if(r.acertou) mapa[r.habilidade].acertos++; else mapa[r.habilidade].erros++;
  });
  const resultado={
    created_at:new Date().toISOString(),
    aluno_nome:aluno.nome,
    turma:aluno.turma || provaAtual.turma || "",
    escola:aluno.escola,
    serie:nomeSerie(aluno.serie),
    serie_codigo:aluno.serie,
    codigo_prova:provaAtual.codigo,
    codigo_avaliacao:provaAtual.codigoAvaliacaoUnica || "",
    professor_nome:provaAtual.professor_nome || "",
    professor_usuario:provaAtual.professor_usuario || "",
    professor_perfil:provaAtual.professor_perfil || "",
    componente_vinculado:provaAtual.componente_vinculado || provaAtual.componente || "",
    avaliacao_unica:!!provaAtual.codigoAvaliacaoUnica,
    tipo_avaliacao:provaAtual.tipoAvaliacao || "teste_livre",
    destinatario_avaliacao:provaAtual.destinatario || "",
    turma_avaliacao:provaAtual.turma || aluno.turma || "",
    materia:provaAtual.componente,
    acertos,
    erros:total-acertos,
    total_questoes:total,
    percentual,
    respostas:detalhadas,
    habilidades_detalhadas:Object.values(mapa),
    habilidades_revisar:Object.values(mapa).filter(x=>x.erros>0),
    uso_pedagogico_interno:true,
    lgpd_orientacao_confirmada:true
  };
  salvarLocal(resultado);
  await salvarSupabase(resultado);
  if(provaAtual.codigoAvaliacaoUnica){ await marcarCodigoFinalizadoOnline(provaAtual.codigoAvaliacaoUnica); }
  document.getElementById("app").innerHTML=`
    <div class="final">
      <h2>Treinamento concluído</h2>
      <p>Suas respostas foram registradas e enviadas para acompanhamento do professor responsável e da coordenação.</p>
      <p>O resultado individual não será exibido nesta tela.</p><p>Se esta avaliação foi liberada por código individual/turma, o acesso fica bloqueado após o envio.</p>
      <button class="btn gold" onclick="mostrarEntrada()">FAZER OUTRO TREINAMENTO</button>
      <button class="btn muted" onclick="location.href='index.html'">VOLTAR À PÁGINA INICIAL</button>
    </div>`;
}
mostrarEntrada();
