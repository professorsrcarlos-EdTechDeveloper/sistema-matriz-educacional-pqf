
let dadosOriginais=[], dados=[], nomesOcultos=false;

function abrirLoginPainel(){document.body.classList.add("painel-bloqueado");document.getElementById("loginOverlay").style.display="flex";setTimeout(()=>document.getElementById("senhaPainel")?.focus(),250)}
function liberarPainel(){document.body.classList.remove("painel-bloqueado");document.getElementById("loginOverlay").style.display="none"}
function validarSenhaPainel(){const senha=document.getElementById("senhaPainel").value.trim();if(senha==="107940"){sessionStorage.setItem("matriz_painel_professor_autorizado","sim");liberarPainel();carregar()}else document.getElementById("loginErro").textContent="Senha incorreta."}
document.addEventListener("DOMContentLoaded",()=>{if(sessionStorage.getItem("matriz_painel_professor_autorizado")==="sim"){liberarPainel();carregar()}else abrirLoginPainel();document.getElementById("senhaPainel").addEventListener("keydown",e=>{if(e.key==="Enter")validarSenhaPainel()});["buscaAluno","filtroSerie","filtroComponente","filtroEscola","filtroAno","filtroMes","tipoGrafico"].forEach(id=>document.getElementById(id).addEventListener("input",aplicarFiltros))});

function nomeSeguro(nome){if(!nomesOcultos)return nome||""; return `<span class="name-hidden">${nomeSeguroTexto(nome)}</span>`}
function nomeSeguroTexto(nome){const n=String(nome||"");let h=0;for(let i=0;i<n.length;i++){h=((h<<5)-h)+n.charCodeAt(i);h|=0}return "ALUNO-"+Math.abs(h).toString().slice(0,5)}
function alternarNomes(){nomesOcultos=!nomesOcultos;document.getElementById("btnNomes").textContent=nomesOcultos?"Mostrar nomes":"Ocultar nomes";renderizar()}
function formatarData(d){try{return new Date(d).toLocaleString("pt-BR")}catch(e){return d||""}}
function mesAno(d){try{const dt=new Date(d);return String(dt.getMonth()+1).padStart(2,"0")+"/"+dt.getFullYear()}catch(e){return ""}}
function anoLetivo(d){return String(d.ano_letivo||d.anoLetivo||d.ano||(d.created_at?new Date(d.created_at).getFullYear():new Date().getFullYear()))}
function serieNumero(v){const s=String(v||"");if(s.includes("2"))return"2";if(s.includes("5"))return"5";if(s.includes("9"))return"9";return s}
function componenteRegistro(d){return d.materia||d.componente_curricular||d.disciplina||""}
function normalizarRegistro(d){return {...d,aluno_nome:d.aluno_nome||d.aluno||d.nome||"",serie:d.serie||d.ano||"",serie_codigo:d.serie_codigo||serieNumero(d.serie||d.ano||""),materia:componenteRegistro(d),escola:d.escola||d.nome_escola||"Não informada",localidade:d.localidade||d.bairro||d.comunidade||"Não informada",ano_letivo:anoLetivo(d),mes_ano:d.mes_ano||mesAno(d.created_at||d.data||new Date()),codigo_prova:d.codigo_prova||d.codigoProva||"",acertos:Number(d.acertos||0),total_questoes:Number(d.total_questoes||d.total||10),percentual:Number(d.percentual||0),erros:Number(d.erros??((d.total_questoes||d.total||10)-(d.acertos||0))),created_at:d.created_at||d.data||new Date().toISOString(),habilidades_revisar:d.habilidades_revisar||[],habilidades_detalhadas:d.habilidades_detalhadas||[],respostas:d.respostas||[]}}
function supabaseAtivo(){return !!(window.MATRIZ_SUPABASE&&window.MATRIZ_SUPABASE.enabled&&window.MATRIZ_SUPABASE.url&&window.MATRIZ_SUPABASE.anonKey&&window.supabase)}
function sb(){return window.supabase.createClient(window.MATRIZ_SUPABASE.url,window.MATRIZ_SUPABASE.anonKey)}
async function carregar(){if(supabaseAtivo()){const {data,error}=await sb().from("resultados_treinamento").select("*").order("created_at",{ascending:false}).limit(3000);dadosOriginais=error?[]:(data||[]).map(normalizarRegistro)}else{const l1=JSON.parse(localStorage.getItem("matriz_spaece_resultados_locais")||"[]");const l2=JSON.parse(localStorage.getItem("resultados_treinamento")||"[]");const key=new Set();dadosOriginais=[...l1,...l2].map(normalizarRegistro).filter(d=>{const k=d.created_at+"|"+d.aluno_nome+"|"+d.codigo_prova;if(key.has(k))return false;key.add(k);return true})}preencherFiltros();aplicarFiltros()}
function preencherFiltros(){const anos=[...new Set(dadosOriginais.map(d=>anoLetivo(d)).filter(Boolean))].sort().reverse();const meses=[...new Set(dadosOriginais.map(d=>d.mes_ano).filter(Boolean))].sort().reverse();document.getElementById("filtroAno").innerHTML='<option value="">Todos</option>'+anos.map(a=>`<option>${a}</option>`).join("");document.getElementById("filtroMes").innerHTML='<option value="">Todos</option>'+meses.map(a=>`<option>${a}</option>`).join("")}
function aplicarFiltros(){const aluno=document.getElementById("buscaAluno").value.trim().toLowerCase();const serie=document.getElementById("filtroSerie").value;const comp=document.getElementById("filtroComponente").value;const escola=document.getElementById("filtroEscola").value.trim().toLowerCase();const ano=document.getElementById("filtroAno").value;const mes=document.getElementById("filtroMes").value;dados=dadosOriginais.filter(d=>(!aluno||d.aluno_nome.toLowerCase().includes(aluno))&&(!serie||serieNumero(d.serie_codigo||d.serie)===serie)&&(!comp||d.materia===comp)&&(!escola||d.escola.toLowerCase().includes(escola))&&(!ano||anoLetivo(d)===ano)&&(!mes||d.mes_ano===mes));renderizar()}
function limparResultadosLocais(){if(confirm("Apagar resultados locais deste navegador?")){localStorage.removeItem("matriz_spaece_resultados_locais");localStorage.removeItem("resultados_treinamento");carregar()}}
function media(arr){return arr.length?Math.round(arr.reduce((s,d)=>s+(d.percentual||0),0)/arr.length):0}
function deltaUltimas(arr){const ord=[...arr].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));if(ord.length<2)return 0;return Math.round((ord[0].percentual||0)-(ord[1].percentual||0))}
function trendClass(d){return d>0?"up":d<0?"down":"flat"}function trendIcon(d){return d>0?"↑":d<0?"↓":"→"}function trendHtml(d){return `<span class="trend ${trendClass(d)}">${trendIcon(d)} ${Math.abs(d)}%</span>`}
function statusBadge(p){if(p>=70)return'<span class="badge good">Adequado</span>';if(p>=50)return'<span class="badge warn">Em desenvolvimento</span>';return'<span class="badge bad">Intervenção prioritária</span>'}
function linhaBarra(label,valor,classe=""){const v=Math.max(0,Math.min(100,Number(valor)||0));return `<div class="bar-row"><span title="${label}">${label.length>42?label.slice(0,42)+"...":label}</span><div class="bar-track"><div class="bar-fill ${classe}" style="width:${v}%"></div></div><span><b>${v}%</b></span></div>`}
function graficoVertical(lista,classe=""){return `<div class="vertical-chart">${lista.map(x=>`<div class="vbar-wrap"><div class="vvalue">${x.valor}%</div><div class="vbar ${classe}" style="height:${Math.max(3,x.valor)}%"></div><div class="vlabel" title="${x.label}">${x.label}</div></div>`).join("")}</div>`}
function graficoPizza(lista){const total=lista.reduce((s,x)=>s+Number(x.valor||0),0)||1;const cores=["var(--green)","var(--blue)","var(--gold)","var(--orange)","var(--red)","#8b5cf6","#14b8a6"];let acc=0;const stops=lista.map((x,i)=>{const ini=(acc/total)*100;acc+=Number(x.valor||0);return `${cores[i%cores.length]} ${ini}% ${(acc/total)*100}%`}).join(", ");return `<div class="pie-wrap"><div class="pie" style="background:conic-gradient(${stops})"><span>${lista.length}<br>itens</span></div><div class="legend">${lista.map((x,i)=>`<div class="legend-item"><span class="dot" style="background:${cores[i%cores.length]}"></span>${x.label}: <b>${x.valor}%</b></div>`).join("")}</div></div>`}
function graficoCards(lista){return `<div class="cards-grid">${lista.map(x=>`<div class="mini-card"><b>${x.label}</b><strong>${x.valor}%</strong>${trendHtml(x.delta||0)}</div>`).join("")}</div>`}
function renderGrafico(id,lista,classe=""){const tipo=document.getElementById("tipoGrafico").value;const el=document.getElementById(id);if(!lista.length){el.innerHTML='<div class="empty">Sem dados.</div>';return}if(tipo==="vertical")el.innerHTML=graficoVertical(lista,classe);else if(tipo==="pizza")el.innerHTML=graficoPizza(lista);else if(tipo==="cards")el.innerHTML=graficoCards(lista);else el.innerHTML=lista.map(x=>linhaBarra(x.label,x.valor,classe)).join("")}
function agruparDescritores(){const mapa={};dados.forEach(d=>{const lista=(Array.isArray(d.habilidades_detalhadas)&&d.habilidades_detalhadas.length)?d.habilidades_detalhadas:(Array.isArray(d.respostas)?d.respostas.map(r=>({habilidade:r.habilidade,acertos:r.acertou?1:0,erros:r.acertou?0:1,total:1})):[]);lista.forEach(h=>{const n=h.habilidade||"Sem descritor";if(!mapa[n])mapa[n]={acertos:0,erros:0,total:0};mapa[n].acertos+=Number(h.acertos||0);mapa[n].erros+=Number(h.erros||0);mapa[n].total+=Number(h.total||((h.acertos||0)+(h.erros||0)))})});return Object.entries(mapa).map(([habilidade,v])=>({habilidade,acertos:v.acertos,erros:v.erros,total:v.total,percErro:v.total?Math.round((v.erros/v.total)*100):0,percAcerto:v.total?Math.round((v.acertos/v.total)*100):0}))}
function renderizar(){const total=dados.length,med=media(dados),maior=total?Math.max(...dados.map(d=>d.percentual||0)):0,baixo50=dados.filter(d=>d.percentual<50).length,atencao=dados.filter(d=>d.percentual>=50&&d.percentual<70).length,delta=deltaUltimas(dados);kTotal.textContent=total;kMedia.textContent=med+"%";kMaior.textContent=maior+"%";kBaixo50.textContent=baixo50;kAtencao.textContent=atencao;kEvolucao.textContent=delta+"%";tMedia.outerHTML=trendHtml(delta).replace('class="trend','id="tMedia" class="trend');tEvolucao.outerHTML=trendHtml(delta).replace('class="trend','id="tEvolucao" class="trend');renderComponentes();renderFaixas();renderDescritores();renderRanking();renderHeatmap();renderEvolucaoDescritores();renderPlano();renderMensal();renderTabela()}
function renderComponentes(){const lista=["Português","Matemática"].map(m=>{const arr=dados.filter(d=>d.materia===m);return{label:m,valor:media(arr),delta:deltaUltimas(arr)}});renderGrafico("chartComponentes",lista,"gold")}
function renderFaixas(){const total=dados.length||1;renderGrafico("chartFaixas",[{label:"Intervenção prioritária",valor:Math.round(dados.filter(d=>d.percentual<50).length/total*100)},{label:"Em desenvolvimento",valor:Math.round(dados.filter(d=>d.percentual>=50&&d.percentual<70).length/total*100)},{label:"Adequado",valor:Math.round(dados.filter(d=>d.percentual>=70).length/total*100)}])}
function renderDescritores(){const lista=agruparDescritores();const erros=[...lista].sort((a,b)=>b.percErro-a.percErro||b.erros-a.erros).slice(0,8).map(x=>({label:x.habilidade,valor:x.percErro}));const acertos=[...lista].sort((a,b)=>b.percAcerto-a.percAcerto||b.acertos-a.acertos).slice(0,8).map(x=>({label:x.habilidade,valor:x.percAcerto}));renderGrafico("chartErros",erros,"red");renderGrafico("chartAcertos",acertos)}
function porAluno(){const mapa={};dados.forEach(d=>{const k=(d.aluno_nome||"")+"|"+(d.materia||"");if(!mapa[k])mapa[k]=[];mapa[k].push(d)});Object.values(mapa).forEach(a=>a.sort((x,y)=>new Date(x.created_at)-new Date(y.created_at)));return mapa}
function renderRanking(){const evol=[],riscos=[];Object.values(porAluno()).forEach(arr=>{const ult=arr[arr.length-1],ant=arr.length>1?arr[arr.length-2]:null,delta=ant?Math.round(ult.percentual-ant.percentual):0;evol.push({nome:ult.aluno_nome,serie:ult.serie,materia:ult.materia,valor:delta,atual:ult.percentual});if(ult.percentual<70)riscos.push({nome:ult.aluno_nome,serie:ult.serie,materia:ult.materia,atual:ult.percentual,delta})});evol.sort((a,b)=>b.valor-a.valor);riscos.sort((a,b)=>a.atual-b.atual);rankingEvolucao.innerHTML=evol.slice(0,10).length?evol.slice(0,10).map((x,i)=>`<div class="rank-item"><div class="rank-pos">${i+1}</div><div><b>${nomeSeguro(x.nome)}</b><br><span style="color:var(--muted)">${x.serie} • ${x.materia} • atual ${x.atual}%</span></div>${trendHtml(x.valor)}</div>`).join(""):'<div class="empty">Sem dados suficientes.</div>';riscoPedagogico.innerHTML=riscos.slice(0,10).length?riscos.slice(0,10).map((x,i)=>`<div class="rank-item"><div class="rank-pos">${i+1}</div><div><b>${nomeSeguro(x.nome)}</b><br><span style="color:var(--muted)">${x.serie} • ${x.materia}</span></div>${statusBadge(x.atual)}</div>`).join(""):'<div class="empty">Nenhum aluno em atenção no filtro.</div>'}
function renderHeatmap(){const series=["2","5","9"],mapa={};dados.forEach(d=>{const s=serieNumero(d.serie_codigo||d.serie);if(!series.includes(s))return;const lista=(d.habilidades_detalhadas&&d.habilidades_detalhadas.length)?d.habilidades_detalhadas:(d.respostas||[]).map(r=>({habilidade:r.habilidade,acertos:r.acertou?1:0,erros:r.acertou?0:1,total:1}));lista.forEach(h=>{const n=h.habilidade||"Sem descritor";if(!mapa[n])mapa[n]={"2":{e:0,t:0},"5":{e:0,t:0},"9":{e:0,t:0}};mapa[n][s].e+=Number(h.erros||0);mapa[n][s].t+=Number(h.total||((h.acertos||0)+(h.erros||0)))})});const linhas=Object.entries(mapa).map(([desc,vals])=>({desc,vals,max:Math.max(...series.map(s=>vals[s].t?Math.round(vals[s].e/vals[s].t*100):0))})).sort((a,b)=>b.max-a.max).slice(0,12);if(!linhas.length){heatmapDescritores.innerHTML='<div class="empty">Sem dados.</div>';return}let html='<div class="heatmap-grid"><div class="heat-cell heat-head">Descritor</div><div class="heat-cell heat-head">2º ano</div><div class="heat-cell heat-head">5º ano</div><div class="heat-cell heat-head">9º ano</div>';linhas.forEach(l=>{html+=`<div class="heat-cell heat-desc">${l.desc}</div>`;series.forEach(s=>{const v=l.vals[s],erro=v.t?Math.round(v.e/v.t*100):0,cls=erro>=60?"heat-bad":erro>=35?"heat-warn":"heat-good";html+=`<div class="heat-cell ${cls}">${erro}% erro<br><small>${v.e}/${v.t}</small></div>`})});heatmapDescritores.innerHTML=html+"</div>"}
function renderEvolucaoDescritores(){const top=agruparDescritores().sort((a,b)=>b.total-a.total).slice(0,8).map(x=>({label:x.habilidade,valor:x.percAcerto}));evolucaoDescritores.innerHTML=top.length?top.map(x=>linhaBarra(x.label,x.valor,x.valor<50?"red":x.valor<70?"gold":"")).join(""):'<div class="empty">Sem dados.</div>'}
function renderPlano(){const lista=agruparDescritores().sort((a,b)=>b.percErro-a.percErro||b.erros-a.erros).slice(0,5);planoIntervencao.innerHTML=lista.length?lista.map((x,i)=>`<div class="plan-item"><b>${i+1}. Reforçar ${x.habilidade}</b><br>Erro atual: ${x.percErro}% (${x.erros}/${x.total}).<br>Sugestão: revisar habilidade, aplicar atividade orientada e nova rodada de 10 questões.</div>`).join(""):'<div class="empty">Sem dados para plano.</div>'}
function renderMensal(){const mapa={};dados.forEach(d=>{const m=d.mes_ano||mesAno(d.created_at);if(!mapa[m])mapa[m]=[];mapa[m].push(d)});const lista=Object.entries(mapa).sort().slice(-8).map(([m,arr])=>({label:m,valor:media(arr),delta:deltaUltimas(arr)}));desempenhoMensal.innerHTML=lista.length?graficoCards(lista):'<div class="empty">Sem dados mensais.</div>'}
function renderTabela(){
  const el=document.getElementById("resultadosCards");
  if(!el) return;
  if(!dados.length){
    el.innerHTML='<div class="empty">Nenhum resultado encontrado.</div>';
    return;
  }

  const pa={};
  dados.forEach(d=>{
    const k=d.aluno_nome+"|"+d.materia;
    if(!pa[k]) pa[k]=[];
    pa[k].push(d);
  });

  el.innerHTML=dados.slice(0,100).map((d,idx)=>{
    const arr=(pa[d.aluno_nome+"|"+d.materia]||[]).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    const pos=arr.findIndex(x=>x.created_at===d.created_at);
    const prev=arr[pos+1];
    const variacao=prev?Math.round(d.percentual-prev.percentual):0;

    const revisar=Array.isArray(d.habilidades_revisar)&&d.habilidades_revisar.length
      ? d.habilidades_revisar.map(x=>`<div class="descriptor-pill">${x.habilidade||"Descritor"} — erros: ${x.erros??0}</div>`).join("")
      : '<div class="descriptor-pill">Sem descritores críticos registrados.</div>';

    const detalhadas=Array.isArray(d.habilidades_detalhadas)&&d.habilidades_detalhadas.length
      ? d.habilidades_detalhadas.map(x=>`<div class="descriptor-pill">${x.habilidade||"Descritor"}<br>Acertos: ${x.acertos??0} • Erros: ${x.erros??0} • Total: ${x.total??0}</div>`).join("")
      : revisar;

    return `
      <details class="result-card">
        <summary>
          <div class="result-title">
            <b>${nomeSeguro(d.aluno_nome)}</b>
            <small>${formatarData(d.created_at)}</small>
          </div>

          <div class="result-mini">
            <b>Série:</b> ${d.serie||"—"}<br>
            <b>Turma:</b> ${d.turma||d.turma_nome||"—"}<br>
            <b>Componente:</b> ${d.materia||"—"}
          </div>

          <div class="result-mini">
            <b>Escola:</b> ${d.escola||"—"}<br>
            <b>Prova:</b> ${d.codigo_prova||"—"}
          </div>

          <div class="result-score">
            <strong>${d.percentual}%</strong>
            <small>${d.acertos}/${d.total_questoes} acertos</small>
          </div>

          <div>
            ${statusBadge(d.percentual)}
            <div>${trendHtml(variacao)}</div>
            <div class="result-open">Ver detalhes</div>
          </div>
        </summary>

        <div class="result-body">
          <div class="result-box">
            <b>Resumo do resultado</b><br>
            Data: ${formatarData(d.created_at)}<br>
            Aluno/Código: ${nomesOcultos ? nomeSeguroTexto(d.aluno_nome) : d.aluno_nome}<br>
            Série: ${d.serie||"—"}<br>
            Turma: ${d.turma||d.turma_nome||"—"}<br>
            Componente Curricular: ${d.materia||"—"}<br>
            Escola: ${d.escola||"—"}<br>
            Código da prova: ${d.codigo_prova||"—"}<br>
            Ano letivo: ${d.ano_letivo||"—"}<br>
            Mês: ${d.mes_ano||"—"}<br>
            Acertos: ${d.acertos}/${d.total_questoes}<br>
            Percentual: ${d.percentual}%<br>
            Evolução: ${variacao>0?"+":""}${variacao}%
          </div>

          <div class="result-box">
            <b>Descritores para revisar</b>
            <div class="descriptor-list">${revisar}</div>
          </div>

          <div class="result-box">
            <b>Detalhamento por descritor</b>
            <div class="descriptor-list">${detalhadas}</div>
          </div>

          <div class="result-box">
            <b>Orientação pedagógica</b><br>
            ${d.percentual<50
              ? "Intervenção prioritária: revisar os descritores com maior erro e aplicar nova atividade curta."
              : d.percentual<70
                ? "Aluno em desenvolvimento: reforçar habilidades específicas e acompanhar evolução na próxima rodada."
                : "Desempenho adequado: manter acompanhamento e propor questões de consolidação."}
          </div>
        </div>
      </details>`;
  }).join("");
}
function gerarRelatorioPedagogico(){const lista=agruparDescritores().sort((a,b)=>b.percErro-a.percErro||b.erros-a.erros).slice(0,5);const riscos=dados.filter(d=>d.percentual<70).sort((a,b)=>a.percentual-b.percentual).slice(0,8);const texto=["RELATÓRIO PEDAGÓGICO INTERNO — SISTEMA MATRIZ EDUCACIONAL","","Uso exclusivo da escola/coordenadores. Não divulgar nomes ou resultados individuais publicamente.","","Resumo:","Total de registros: "+dados.length,"Média geral: "+media(dados)+"%","Alunos/registros abaixo de 50%: "+dados.filter(d=>d.percentual<50).length,"Alunos/registros entre 50% e 69%: "+dados.filter(d=>d.percentual>=50&&d.percentual<70).length,"","Descritores prioritários:",...(lista.length?lista.map((x,i)=>(i+1)+". "+x.habilidade+" — "+x.percErro+"% de erro"):["Sem dados."]),"","Alunos em acompanhamento:",...(riscos.length?riscos.map((x,i)=>(i+1)+". "+nomeSeguroTexto(x.aluno_nome)+" — "+x.serie+" — "+x.materia+" — "+x.percentual+"%"):["Sem alunos em atenção no filtro."]),"","Plano sugerido:","1. Revisar os descritores com maior erro.","2. Formar grupos de intervenção por habilidade.","3. Aplicar nova prova de 10 questões.","4. Comparar evolução mensal por aluno e turma."].join("\\n");relatorioPedagogico.textContent=texto}
function csvEscape(v){return `"${String(v??"").replaceAll('"','""')}"`}
function exportarCSV(anon=false){if(!dados.length){alert("Sem dados para exportar.");return}const linhas=[["Data","Aluno","Série","Componente Curricular","Escola","Código Prova","Ano","Mês","Acertos","Total","Percentual","Descritores para revisar"]];dados.forEach(d=>{const rev=Array.isArray(d.habilidades_revisar)?d.habilidades_revisar.map(x=>`${x.habilidade} (${x.erros})`).join("; "):"";linhas.push([formatarData(d.created_at),anon?nomeSeguroTexto(d.aluno_nome):d.aluno_nome,d.serie,d.materia,d.escola,d.codigo_prova,d.ano_letivo,d.mes_ano,d.acertos,d.total_questoes,d.percentual,rev])});const csv=linhas.map(l=>l.map(csvEscape).join(";")).join("\\r\\n");const blob=new Blob(["\\ufeffsep=;\\r\\n"+csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=anon?"resultados_anonimizados.csv":"resultados_matriz_educacional.csv";a.click();URL.revokeObjectURL(url)}
function obterProva(codigo){
  codigo=String(codigo||"").trim().toUpperCase();

  // V28: impressão usa a prova fixa por código.
  if(window.SIMULADOS_FIXOS && window.SIMULADOS_FIXOS[codigo]){
    const s=window.SIMULADOS_FIXOS[codigo];
    return {
      codigo,
      meta:{serie:s.serie,materia:s.componente_curricular},
      questoes:(s.questoes||[]).slice(0,10)
    };
  }

  // Compatibilidade antiga.
  if(window.PROVAS_GERADAS&&window.BANCO_QUESTOES&&window.PROVAS_GERADAS[codigo]){
    const meta=window.PROVAS_GERADAS[codigo];
    const banco=window.BANCO_QUESTOES[meta.serie+"|"+meta.materia]||[];
    return{codigo,meta,questoes:(meta.indices||[]).map(i=>banco[i]).filter(Boolean).slice(0,10)}
  }
  return null
}
function htmlProva(prova,comGabarito=false){return `<h1>Sistema MATRIZ EDUCACIONAL</h1><h2>Prova ${prova.codigo} — ${prova.meta.serie}º ano — ${prova.meta.materia}</h2><p>Nome: __________________________________________ Turma: ______ Data: ___/___/____</p><hr>${prova.questoes.map((q,i)=>`<div style="break-inside:avoid;margin:14px 0"><b>${i+1}. ${q.q}</b><p>${q.base||""}</p><ol type="A">${q.o.map((op,j)=>`<li>${op}${comGabarito&&j===q.c?" <b>(correta)</b>":""}</li>`).join("")}</ol><small>${comGabarito?q.hab:""}</small></div>`).join("")}`}
function imprimirProvaPorCodigo(gabarito=false){const codigo=document.getElementById("codigoImpressao").value.trim().toUpperCase();const prova=obterProva(codigo);if(!prova){alert("Código não encontrado.");return}previewImpressao.textContent=prova.questoes.map((q,i)=>(i+1)+". "+q.q).join("\\n");const area=printArea;area.innerHTML=htmlProva(prova,gabarito);area.style.display="block";window.print();area.style.display="none"}
function listarDescritoresDev(){const serie=devSerie.value,comp=devComponente.value,banco=(window.BANCO_QUESTOES||{})[serie+"|"+comp]||[];const desc=[...new Set(banco.map(q=>q.hab).filter(Boolean))];descritoresDev.textContent=desc.join("\\n")||"Sem descritores."}
function gerarProvaDev(imprimir=false){const serie=devSerie.value,comp=devComponente.value,termos=devDescritores.value.split(/\\n|;/).map(x=>x.trim().toLowerCase()).filter(Boolean),banco=(window.BANCO_QUESTOES||{})[serie+"|"+comp]||[];let qs=banco.filter(q=>!termos.length||termos.some(t=>(q.hab||"").toLowerCase().includes(t))).slice(0,10);if(qs.length<10)qs=[...qs,...banco.filter(q=>!qs.includes(q)).slice(0,10-qs.length)];const prova={codigo:"DEV",meta:{serie,materia:comp},questoes:qs};saidaDev.textContent=qs.map((q,i)=>(i+1)+". "+q.q+"\\nDescritor: "+q.hab).join("\\n\\n");if(imprimir){printArea.innerHTML=htmlProva(prova,false);printArea.style.display="block";window.print();printArea.style.display="none"}}

function obterAvaliacoesCriadas(){
  return JSON.parse(localStorage.getItem("matriz_avaliacoes_criadas") || "[]");
}
function salvarAvaliacoesCriadas(lista){
  localStorage.setItem("matriz_avaliacoes_criadas", JSON.stringify(lista));
}
function obterCodigosFinalizados(){
  return JSON.parse(localStorage.getItem("matriz_codigos_finalizados") || "[]");
}
function gerarCodigoAvaliacao(){
  const tipo=(document.getElementById("avalTipo")?.value || "aluno").toUpperCase();
  const serie=document.getElementById("avalSerie")?.value || "X";
  const prova=(document.getElementById("avalProva")?.value || "").trim().toUpperCase();
  if(!prova){alert("Digite o código da prova fixa antes de gerar.");return}
  const rand=Math.random().toString(36).substring(2,6).toUpperCase();
  const cod=`${tipo.slice(0,1)}${serie}${prova}${rand}`;
  document.getElementById("avalCodigo").value=cod;
}
function salvarAvaliacaoCriada(){
  const tipo=document.getElementById("avalTipo").value;
  const destinatario=document.getElementById("avalDestinatario").value.trim();
  const escola=document.getElementById("avalEscola").value.trim() || "EMEF Pedro de Queiroz Ferreira";
  const serie=document.getElementById("avalSerie").value;
  const codigoProva=document.getElementById("avalProva").value.trim().toUpperCase();
  const codigo=document.getElementById("avalCodigo").value.trim().toUpperCase();
  if(!destinatario){alert("Informe o aluno ou turma.");return}
  if(!codigoProva){alert("Informe a prova fixa vinculada.");return}
  if(!codigo){alert("Clique em gerar código.");return}
  if(!obterProva(codigoProva)){alert("Código de prova fixa não encontrado.");return}
  const lista=obterAvaliacoesCriadas();
  if(lista.some(a=>a.codigo===codigo)){alert("Este código já existe. Gere outro.");return}
  lista.unshift({
    codigo,tipo,destinatario,escola,serie,codigoProva,
    created_at:new Date().toISOString(),
    finalizado:false
  });
  salvarAvaliacoesCriadas(lista);
  renderAvaliacoesCriadas();
  alert("Avaliação criada. Entregue o código ao aluno/turma: "+codigo);
}
function renderAvaliacoesCriadas(){
  const el=document.getElementById("avaliacoesCriadas");
  if(!el) return;
  const lista=obterAvaliacoesCriadas();
  const finalizados=obterCodigosFinalizados();
  if(!lista.length){el.textContent="Nenhuma avaliação criada.";return}
  el.innerHTML=lista.map(a=>{
    const fim=finalizados.includes(a.codigo);
    return `<div class="plan-item">
      <b>${a.codigo}</b> — ${fim?'<span class="badge bad">Finalizada/bloqueada</span>':'<span class="badge good">Liberada</span>'}<br>
      Tipo: ${a.tipo} • Destino: ${a.destinatario}<br>
      Escola: ${a.escola} • Turma: ${a.turma||nomeSerieCurta(a.serie)||"—"} • Prova: ${a.codigoProva}<br>
      <button class="secondary" onclick="copiarCodigoAvaliacao('${a.codigo}')">Copiar código</button>
      <button class="danger" onclick="excluirAvaliacaoCriada('${a.codigo}')">Excluir</button>
    </div>`;
  }).join("");
}
function copiarCodigoAvaliacao(codigo){
  navigator.clipboard?.writeText(codigo);
  alert("Código copiado: "+codigo);
}
function excluirAvaliacaoCriada(codigo){
  if(!confirm("Excluir avaliação "+codigo+"?")) return;
  salvarAvaliacoesCriadas(obterAvaliacoesCriadas().filter(a=>a.codigo!==codigo));
  renderAvaliacoesCriadas();
}
const carregarOriginalV29 = carregar;
carregar = async function(){
  await carregarOriginalV29();
  renderAvaliacoesCriadas();
};


/* V32 - avaliação por aluno/turma com lista individual de 50 alunos e códigos individuais */
function serieDaTurma(turma){
  const t=String(turma||"").toLowerCase();
  if(t.includes("2")) return "2";
  if(t.includes("5")) return "5";
  if(t.includes("9")) return "9";
  return "";
}
function nomeSerieCurta(serie){
  if(String(serie)==="2") return "2º ano";
  if(String(serie)==="5") return "5º ano";
  if(String(serie)==="9") return "9º ano";
  return "";
}
function codigosProvaDaSerie(serie){
  serie=String(serie||"");
  let codigos=[];
  if(window.SIMULADOS_FIXOS){
    codigos=Object.keys(window.SIMULADOS_FIXOS).filter(c=>String(c).startsWith(serie));
  }
  if(!codigos.length){
    for(const comp of ["P","M"]){
      for(let i=1;i<=20;i++) codigos.push(`${serie}${comp}${String(i).padStart(2,"0")}`);
    }
  }
  return codigos.sort((a,b)=>{
    const ca=a[1]||"", cb=b[1]||"";
    if(ca!==cb) return ca.localeCompare(cb);
    return Number(a.slice(2))-Number(b.slice(2));
  });
}
function atualizarProvasPorTurma(){
  const turma=document.getElementById("avalTurma")?.value || "";
  const serie=serieDaTurma(turma);
  const prova=document.getElementById("avalProva");
  if(!prova) return;
  if(!serie){
    prova.disabled=true;
    prova.innerHTML='<option value="">Escolha primeiro a turma</option>';
    return;
  }
  const codigos=codigosProvaDaSerie(serie);
  prova.disabled=false;
  prova.innerHTML=`<option value="">Selecione a prova do ${nomeSerieCurta(serie)}</option>`+
    codigos.map(c=>`<option value="${c}">${c}</option>`).join("");
  renderizarListaAlunosTurma();
}
function provaCompativelComTurma(codigoProva,turma){
  const serie=serieDaTurma(turma);
  return !!serie && String(codigoProva||"").toUpperCase().startsWith(serie);
}

const ALUNOS_FICTICIOS_PQF={
  "2":[
    "Ana Nísia Floresta","Paulo Freire Júnior","Cecília Meireles Alves","Darcy Ribeiro Neto","Anísio Teixeira Filho","Ruth Rocha Lima","Monteiro Lobato Santos","Tarsila Amaral Costa","Heitor Villa-Lobos Silva","Chiquinha Gonzaga Pereira",
    "Machado Assis Oliveira","Carolina Maria Jesus","Maria Montessori Ramos","Jean Piaget Araújo","Lev Vygotsky Martins","Emília Ferreiro Sousa","Rubem Alves Cardoso","Lygia Bojunga Duarte","Clarice Lispector Melo","Ariano Suassuna Barbosa",
    "Mário Andrade Nunes","Oswaldo Cruz Bezerra","Carlos Chagas Ribeiro","Bertha Lutz Fernandes","Santos Dumont Azevedo","Cora Coralina Reis","Patativa Assaré Gomes","Raquel Queiroz Lima","José Alencar Vieira","Rachel Carson Moura",
    "Frida Kahlo Batista","Nelson Mandela Rocha","Malala Yousafzai Nascimento","Mahatma Gandhi Moreira","Albert Einstein Duarte","Marie Curie Lopes","Galileu Galilei Matos","Isaac Newton Cavalcante","Ada Lovelace Pinheiro","Katherine Johnson Freitas",
    "Cesar Lattes Coelho","Milton Santos Ferreira","Lélia Gonzalez Dias","Dandara Palmares Sousa","Zumbi Palmares Costa","Tiradentes Xavier Brito","Princesa Isabel Castro","Dom Pedro Alcântara","Maria Quitéria Almeida","Duque Caxias Gomes"
  ],
  "5":[
    "Sócrates Vieira","Platão Mendonça","Aristóteles Farias","Hipátia Alexandria Silva","Euclides Cunha Matos","Arquimedes Oliveira","Pitagoras Santos","Heródoto Lima","Tucídides Pereira","Cícero Romano Costa",
    "Virgínia Woolf Almeida","Simone Beauvoir Rocha","Hannah Arendt Gomes","Angela Davis Martins","Conceição Evaristo Sousa","Sueli Carneiro Duarte","Ailton Krenak Ribeiro","Davi Kopenawa Nascimento","Paulo Leminski Freitas","Manuel Bandeira Alves",
    "João Cabral Melo Neto","Graciliano Ramos Bezerra","Jorge Amado Castro","Guimarães Rosa Pinheiro","Érico Veríssimo Cardoso","Fernando Pessoa Brito","Camões Ferreira","Eça Queiroz Nunes","Mia Couto Barbosa","Pepetela Moreira",
    "Abdias Nascimento Reis","Milton Nascimento Lima","Elis Regina Moura","Luiz Gonzaga Silva","Dorival Caymmi Rocha","Pixinguinha Costa","Cartola Santos","Noel Rosa Almeida","Tom Jobim Cavalcante","Vinicius Moraes Gomes",
    "Ayrton Senna Oliveira","Pelé Nascimento","Marta Silva Vieira","Maria Esther Bueno","Joaquim Nabuco Araújo","Rui Barbosa Mendes","Benjamin Constant Dias","José Bonifácio Andrade","Barão Rio Branco","Castro Alves Pereira"
  ],
  "9":[
    "Immanuel Kant Souza","René Descartes Lima","Francis Bacon Alves","John Locke Pereira","Jean Rousseau Costa","Montesquieu Rocha","Voltaire Martins","Karl Marx Oliveira","Friedrich Engels Santos","Max Weber Duarte",
    "Émile Durkheim Ferreira","Auguste Comte Nunes","Norbert Elias Gomes","Florestan Fernandes Silva","Sérgio Buarque Holanda","Gilberto Freyre Matos","Caio Prado Júnior","Celso Furtado Cardoso","Josué Castro Bezerra","Paulo Freire Moreira",
    "Dermeval Saviani Ramos","Gaudêncio Frigotto Almeida","Magda Soares Moura","Ana Mae Barbosa","Elza Soares Reis","Elisabeth Badinter Freitas","Rosa Luxemburgo Pinheiro","Clara Zetkin Dias","Harriet Tubman Castro","Martin Luther King",
    "Rosa Parks Cavalcante","Nelson Rodrigues Melo","Ariano Vilar Suassuna","Benedito Nunes Brito","Antônio Candido Ferreira","Silvio Almeida Costa","Kabengele Munanga","Milton Santos Júnior","Edison Carneiro Sousa","Darcy Ribeiro Filho",
    "Celestino Freinet Rocha","John Dewey Martins","Jerome Bruner Alves","Howard Gardner Lima","David Ausubel Pereira","Burrhus Skinner Santos","Henri Wallon Duarte","Friedrich Froebel Gomes","Johann Pestalozzi Vieira","Janusz Korczak Nascimento"
  ]
};
let avaliacoesLotePendentes=[];

function alunosDaTurmaAtual(){
  const serie=serieDaTurma(document.getElementById("avalTurma")?.value||"");
  return ALUNOS_FICTICIOS_PQF[serie] || [];
}
function abrirListaTurma(){
  const tipo=document.getElementById("avalTipo")?.value || "aluno";
  const turma=document.getElementById("avalTurma")?.value || "";
  if(tipo!=="turma"){
    alert("A lista de alunos é usada quando o tipo for Turma. Para aluno específico, preencha o nome completo do aluno.");
    return;
  }
  if(!turma){alert("Escolha a turma primeiro.");return;}
  renderizarListaAlunosTurma(true);
}
function renderizarListaAlunosTurma(forcarAbrir=false){
  const box=document.getElementById("seletorAlunosTurma");
  if(!box) return;
  const tipo=document.getElementById("avalTipo")?.value || "aluno";
  if(tipo!=="turma"){
    box.style.display="none";
    box.innerHTML="";
    return;
  }
  const turma=document.getElementById("avalTurma")?.value || "";
  const alunos=alunosDaTurmaAtual();
  if(!turma || !alunos.length){
    box.style.display=forcarAbrir?"block":"none";
    box.innerHTML='<b>Escolha a turma para carregar a lista de alunos.</b>';
    return;
  }
  box.style.display=forcarAbrir?"block":(box.style.display==="block"?"block":"none");
  box.innerHTML=`
    <div class="student-picker-actions">
      <button class="secondary" onclick="selecionarTodosAlunosTurma(true)">Selecionar todos os 50</button>
      <button class="secondary" onclick="selecionarTodosAlunosTurma(false)">Limpar seleção</button>
      <button class="secondary" onclick="copiarListaAlunosTurma()">Copiar nomes</button>
    </div>
    <b>Lista fictícia da ${turma} — selecione os alunos que receberão código individual:</b>
    <div class="student-picker-grid" style="margin-top:10px">
      ${alunos.map((nome,i)=>`
        <label class="student-check">
          <input type="checkbox" class="aluno-turma-check" value="${nome.replace(/"/g,'&quot;')}" checked>
          <span><b>${String(i+1).padStart(2,"0")}. ${nome}</b><br><small>${turma} • EMEF Pedro de Queiroz Ferreira</small></span>
        </label>`).join("")}
    </div>`;
}
function selecionarTodosAlunosTurma(marcar){
  document.querySelectorAll(".aluno-turma-check").forEach(c=>c.checked=!!marcar);
}
function copiarListaAlunosTurma(){
  const texto=alunosDaTurmaAtual().map((n,i)=>`${String(i+1).padStart(2,"0")} - ${n}`).join("\n");
  navigator.clipboard?.writeText(texto);
  alert("Lista de alunos copiada.");
}
function alunosSelecionadosTurma(){
  return [...document.querySelectorAll(".aluno-turma-check:checked")].map(c=>c.value);
}
function codigoUnicoAluno(prefixo, listaExistente){
  let codigo="";
  do{
    const rand=Math.random().toString(36).substring(2,7).toUpperCase();
    codigo=`${prefixo}${rand}`;
  }while(listaExistente.some(a=>String(a.codigo).toUpperCase()===codigo) || avaliacoesLotePendentes.some(a=>String(a.codigo).toUpperCase()===codigo));
  return codigo;
}
function ajustarTipoAvaliacao(){
  const tipo=document.getElementById("avalTipo")?.value || "aluno";
  const campoAluno=document.getElementById("campoAlunoUnico");
  const inputAluno=document.getElementById("avalAlunoNome");
  if(campoAluno) campoAluno.style.display = tipo === "turma" ? "none" : "block";
  if(inputAluno){
    inputAluno.disabled = tipo === "turma";
    inputAluno.placeholder = tipo === "turma" ? "Será escolhido na lista da turma" : "Ex.: Maria Clara da Silva";
  }
  document.getElementById("avalCodigo").value="";
  avaliacoesLotePendentes=[];
  const saida=document.getElementById("codigosGeradosLista");
  if(saida){saida.style.display="none";saida.innerHTML="";}
  renderizarListaAlunosTurma(tipo==="turma");
}
function montarAvaliacao(codigo,tipo,nome,turma,escola,serie,codigoProva){
  return {
    codigo,
    tipo,
    destinatario:nome,
    aluno_nome:nome,
    aluno_nome_completo:nome,
    turma,
    escola,
    serie,
    codigoProva,
    codigo_prova:codigoProva,
    professor_nome:"Professor/Coordenador",
    status:"liberada",
    finalizado:false,
    created_at:new Date().toISOString()
  };
}
function gerarCodigoAvaliacao(){
  const tipo=document.getElementById("avalTipo")?.value || "aluno";
  const alunoNome=(document.getElementById("avalAlunoNome")?.value || "").trim();
  const turma=(document.getElementById("avalTurma")?.value || "").trim();
  const serie=serieDaTurma(turma);
  const escola=document.getElementById("avalEscola").value.trim() || "EMEF Pedro de Queiroz Ferreira";
  const prova=(document.getElementById("avalProva")?.value || "").trim().toUpperCase();
  if(!turma || !serie){alert("Escolha a turma antes de gerar o código.");return}
  if(!prova){alert("Escolha a prova fixa da turma selecionada.");return}
  if(!provaCompativelComTurma(prova,turma)){alert("A prova escolhida não pertence à turma selecionada. Escolha uma prova do "+nomeSerieCurta(serie)+".");return}
  const lista=obterAvaliacoesCriadas();
  avaliacoesLotePendentes=[];
  if(tipo==="turma"){
    if(document.getElementById("seletorAlunosTurma")?.style.display!=="block") renderizarListaAlunosTurma(true);
    const selecionados=alunosSelecionadosTurma();
    if(!selecionados.length){alert("Selecione pelo menos um aluno da turma.");return;}
    selecionados.forEach(nome=>{
      const codigo=codigoUnicoAluno(`AL${serie}${prova}`, lista);
      avaliacoesLotePendentes.push(montarAvaliacao(codigo,"aluno",nome,turma,escola,serie,prova));
    });
    document.getElementById("avalCodigo").value=`${avaliacoesLotePendentes.length} códigos gerados`;
    renderCodigosGerados();
    return;
  }
  if(alunoNome.length < 3){alert("Digite o nome completo do aluno antes de gerar o código.");return}
  const codigo=codigoUnicoAluno(`AL${serie}${prova}`, lista);
  avaliacoesLotePendentes=[montarAvaliacao(codigo,"aluno",alunoNome,turma,escola,serie,prova)];
  document.getElementById("avalCodigo").value=codigo;
  renderCodigosGerados();
}
function renderCodigosGerados(){
  const box=document.getElementById("codigosGeradosLista");
  if(!box) return;
  if(!avaliacoesLotePendentes.length){box.style.display="none";box.innerHTML="";return;}
  box.style.display="block";
  const linhas=avaliacoesLotePendentes.map(a=>`${a.aluno_nome_completo};${a.turma};${a.codigoProva};${a.codigo}`).join("\n");
  box.innerHTML=`
    <div class="student-picker-actions">
      <button class="secondary" onclick="copiarCodigosGerados()">Copiar lista para WhatsApp/e-mail</button>
      <button class="secondary" onclick="baixarCodigosCSV()">Baixar CSV</button>
    </div>
    <b>Códigos gerados — entregue cada código ao aluno correspondente:</b>
    <table class="code-table">
      <thead><tr><th>Aluno</th><th>Turma</th><th>Prova</th><th>Código individual</th></tr></thead>
      <tbody>${avaliacoesLotePendentes.map(a=>`<tr><td>${a.aluno_nome_completo}</td><td>${a.turma}</td><td>${a.codigoProva}</td><td><b>${a.codigo}</b></td></tr>`).join("")}</tbody>
    </table>
    <textarea id="textoCodigosGerados" style="position:absolute;left:-9999px">Aluno;Turma;Prova;Código\n${linhas}</textarea>`;
}
function copiarCodigosGerados(){
  const texto=(document.getElementById("textoCodigosGerados")?.value || avaliacoesLotePendentes.map(a=>`${a.aluno_nome_completo} - ${a.codigo}`).join("\n"));
  navigator.clipboard?.writeText(texto);
  alert("Lista de códigos copiada. Agora o professor pode enviar por WhatsApp, e-mail ou imprimir.");
}
function baixarCodigosCSV(){
  const texto="Aluno;Turma;Prova;Código\n"+avaliacoesLotePendentes.map(a=>`${a.aluno_nome_completo};${a.turma};${a.codigoProva};${a.codigo}`).join("\n");
  const blob=new Blob([texto],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="codigos_avaliacao_turma.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}
async function salvarAvaliacoesSupabase(rows){
  try{
    if(window.MATRIZ_SUPABASE && window.MATRIZ_SUPABASE.enabled && window.supabase){
      const sb=window.supabase.createClient(window.MATRIZ_SUPABASE.url, window.MATRIZ_SUPABASE.anonKey);
      const payload=rows.map(a=>({
        codigo:a.codigo,
        tipo:a.tipo,
        aluno_nome:a.aluno_nome_completo,
        turma:a.turma,
        destinatario:a.destinatario,
        escola:a.escola,
        serie:a.serie,
        codigo_prova:a.codigoProva,
        professor_nome:a.professor_nome || "Professor/Coordenador",
        status:a.status || "liberada",
        finalizado:false
      }));
      const {error}=await sb.from("avaliacoes_criadas").insert(payload);
      if(error) console.warn("Erro ao salvar avaliações no Supabase:", error);
    }
  }catch(e){console.warn("Erro Supabase avaliações:", e);}
}
async function salvarAvaliacaoCriada(){
  if(!avaliacoesLotePendentes.length){
    alert("Clique em Gerar código(s) antes de salvar.");
    return;
  }
  const lista=obterAvaliacoesCriadas();
  const repetido=avaliacoesLotePendentes.find(a=>lista.some(x=>String(x.codigo).toUpperCase()===String(a.codigo).toUpperCase()));
  if(repetido){alert("Código repetido encontrado. Gere novamente.");return;}
  const novaLista=[...avaliacoesLotePendentes, ...lista];
  salvarAvaliacoesCriadas(novaLista);
  await salvarAvaliacoesSupabase(avaliacoesLotePendentes);
  renderAvaliacoesCriadas();
  copiarCodigosGerados();
  alert(`${avaliacoesLotePendentes.length} avaliação(ões) salva(s). Cada aluno tem seu próprio código.`);
  avaliacoesLotePendentes=[];
}
function renderAvaliacoesCriadas(){
  const el=document.getElementById("avaliacoesCriadas");
  if(!el) return;
  const lista=obterAvaliacoesCriadas();
  const finalizados=obterCodigosFinalizados();
  if(!lista.length){el.textContent="Nenhuma avaliação criada.";return}
  el.innerHTML=lista.slice(0,250).map(a=>{
    const fim=finalizados.includes(a.codigo);
    const nome=a.aluno_nome_completo || a.aluno_nome || (a.tipo==="aluno"?a.destinatario:"");
    const prova=a.codigoProva || a.codigo_prova || "—";
    return `<div class="plan-item">
      <b>${a.codigo}</b> — ${fim?'<span class="badge bad">Finalizada/bloqueada</span>':'<span class="badge good">Liberada</span>'}<br>
      Aluno: <b>${nome||"—"}</b> • Turma: <b>${a.turma||nomeSerieCurta(a.serie)||"—"}</b><br>
      Escola: ${a.escola||"—"} • Prova: ${prova}<br>
      Criada em: ${typeof formatarData==="function"?formatarData(a.created_at):a.created_at}<br>
      <button class="secondary" onclick="copiarCodigoAvaliacao('${a.codigo}')">Copiar código</button>
      <button class="danger" onclick="excluirAvaliacaoCriada('${a.codigo}')">Excluir</button>
    </div>`;
  }).join("");
}
function normalizarRegistro(d){return {...d,aluno_nome:d.aluno_nome||d.aluno||d.nome||"",turma:d.turma||d.turma_nome||d.destinatario_turma||"",serie:d.serie||d.ano||"",serie_codigo:d.serie_codigo||serieNumero(d.serie||d.ano||""),materia:componenteRegistro(d),escola:d.escola||d.nome_escola||"Não informada",localidade:d.localidade||d.bairro||d.comunidade||"Não informada",ano_letivo:anoLetivo(d),mes_ano:d.mes_ano||mesAno(d.created_at||d.data||new Date()),codigo_prova:d.codigo_prova||d.codigoProva||"",codigo_avaliacao:d.codigo_avaliacao||d.codigoAvaliacao||"",acertos:Number(d.acertos||0),total_questoes:Number(d.total_questoes||d.total||10),percentual:Number(d.percentual||0),erros:Number(d.erros??((d.total_questoes||d.total||10)-(d.acertos||0))),created_at:d.created_at||d.data||new Date().toISOString(),habilidades_revisar:d.habilidades_revisar||[],habilidades_detalhadas:d.habilidades_detalhadas||[],respostas:d.respostas||[]}}
function prepararFerramentasExpansiveis(){
  document.querySelectorAll(".card").forEach((sec)=>{
    if(sec.dataset.expandReady==="1") return;
    const header=sec.querySelector(":scope > .card-tools");
    if(!header) return;
    const body=document.createElement("div");
    body.className="collapse-body";
    const filhos=[...sec.children].filter(el=>el!==header);
    filhos.forEach(el=>body.appendChild(el));
    sec.appendChild(body);
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="tool-toggle";
    const deveAbrir=sec.dataset.open==="true";
    function setAberto(aberto){
      sec.classList.toggle("tool-collapsed",!aberto);
      body.style.display=aberto?"":"none";
      btn.textContent=aberto?"Recolher":"Expandir";
    }
    btn.onclick=()=>setAberto(sec.classList.contains("tool-collapsed"));
    header.appendChild(btn);
    setAberto(deveAbrir);
    sec.dataset.expandReady="1";
  });
}
document.addEventListener("DOMContentLoaded",()=>{setTimeout(()=>{prepararFerramentasExpansiveis();ajustarTipoAvaliacao();atualizarProvasPorTurma();renderAvaliacoesCriadas();},300)});



/* V33 PQF - login por usuário, permissão por turma/componente e histórico Supabase */
const USUARIOS_PQF = [
  {nome:"Carlos Tavares", usuario:"carlos.tavares", senha:"7890uiop", perfil:"gestor", turma_vinculada:"Todas", componente_vinculado:"Todos", acesso_geral:true},
  {nome:"Cleilson Paiva", usuario:"cleilson.paiva", senha:"1234qwer", perfil:"coordenador", turma_vinculada:"Todas", componente_vinculado:"Todos", acesso_geral:true},
  {nome:"Ana Ribeiro", usuario:"ana.ribeiro", senha:"2026abcd", perfil:"professor", turma_vinculada:"2º ano", componente_vinculado:"Português", acesso_geral:false},
  {nome:"Paulo Mendes", usuario:"paulo.mendes", senha:"2027efgh", perfil:"professor", turma_vinculada:"2º ano", componente_vinculado:"Matemática", acesso_geral:false},
  {nome:"Maria Duarte", usuario:"maria.duarte", senha:"2028ijkl", perfil:"professor", turma_vinculada:"5º ano", componente_vinculado:"Português", acesso_geral:false},
  {nome:"João Alencar", usuario:"joao.alencar", senha:"2029mnop", perfil:"professor", turma_vinculada:"5º ano", componente_vinculado:"Matemática", acesso_geral:false},
  {nome:"Helena Freire", usuario:"helena.freire", senha:"2030qrst", perfil:"professor", turma_vinculada:"9º ano", componente_vinculado:"Português", acesso_geral:false},
  {nome:"Antônio Vieira", usuario:"antonio.vieira", senha:"2031uvwx", perfil:"professor", turma_vinculada:"9º ano", componente_vinculado:"Matemática", acesso_geral:false}
];
function usuarioAtual(){try{return JSON.parse(sessionStorage.getItem("matriz_usuario_painel")||"null")}catch(e){return null}}
function componenteParaLetra(c){return String(c||"").toLowerCase().startsWith("port")?"P":String(c||"").toLowerCase().startsWith("mat")?"M":""}
function letraParaComponente(l){return String(l||"").toUpperCase()==="P"?"Português":String(l||"").toUpperCase()==="M"?"Matemática":""}
function serieDaTurmaUsuario(t){return serieDaTurma(t)}
function filtrarPorUsuario(lista){
  const u=usuarioAtual();
  if(!u || u.acesso_geral) return lista;
  const serie=serieDaTurmaUsuario(u.turma_vinculada);
  const comp=String(u.componente_vinculado||"").toLowerCase();
  return (lista||[]).filter(d=>{
    const ds=serieNumero(d.serie_codigo||d.serie||d.turma);
    const dc=String(d.materia||d.componente_curricular||d.componente_vinculado||"").toLowerCase();
    const pc=String(d.codigo_prova||d.codigoProva||"").toUpperCase().charAt(1);
    const compOk = dc ? dc.includes(comp.slice(0,4)) : letraParaComponente(pc).toLowerCase().includes(comp.slice(0,4));
    return (!serie || ds===serie) && compOk;
  });
}
function filtrarAvaliacoesPorUsuario(lista){
  const u=usuarioAtual();
  if(!u || u.acesso_geral) return lista;
  const serie=serieDaTurmaUsuario(u.turma_vinculada);
  const letra=componenteParaLetra(u.componente_vinculado);
  return (lista||[]).filter(a=>{
    const turma=a.turma || nomeSerieCurta(a.serie);
    const prova=String(a.codigoProva||a.codigo_prova||"").toUpperCase();
    return serieDaTurma(turma)===serie && (!letra || prova.charAt(1)===letra);
  });
}
function sairPainel(){
  sessionStorage.removeItem('matriz_painel_professor_autorizado');
  sessionStorage.removeItem('matriz_usuario_painel');
  location.href='index.html';
}
function aplicarPermissoesUsuario(){
  const u=usuarioAtual();
  const box=document.getElementById("usuarioLogadoBox");
  if(!u) return;
  if(box){
    box.style.display="block";
    box.innerHTML=`<strong>Usuário:</strong> ${u.nome} <span class="permissao-chip">${u.perfil}</span><span class="permissao-chip">Turma: ${u.turma_vinculada}</span><span class="permissao-chip">Componente: ${u.componente_vinculado}</span>${u.acesso_geral?'<span class="permissao-chip">Acesso geral</span>':'<span class="permissao-chip">Acesso restrito</span>'}`;
  }
  if(!u.acesso_geral){
    const serie=serieDaTurmaUsuario(u.turma_vinculada);
    const turmaNome=nomeSerieCurta(serie);
    const filtroSerie=document.getElementById("filtroSerie");
    const filtroComponente=document.getElementById("filtroComponente");
    if(filtroSerie){filtroSerie.value=serie; filtroSerie.disabled=true;}
    if(filtroComponente){filtroComponente.value=u.componente_vinculado; filtroComponente.disabled=true;}
    const avalTurma=document.getElementById("avalTurma");
    if(avalTurma){avalTurma.value=turmaNome; avalTurma.disabled=true;}
    const tipo=document.getElementById("avalTipo");
    if(tipo) tipo.value=tipo.value||"aluno";
    const escola=document.getElementById("avalEscola");
    if(escola) escola.value="EMEF Pedro de Queiroz Ferreira";
  }
  atualizarProvasPorTurma();
}
async function validarSenhaPainel(){
  const usuario=(document.getElementById("usuarioPainel")?.value || "").trim().toLowerCase();
  const senha=(document.getElementById("senhaPainel")?.value || "").trim();
  let u=USUARIOS_PQF.find(x=>x.usuario===usuario && x.senha===senha);
  if(!u){
    try{
      if(window.MATRIZ_SUPABASE && window.MATRIZ_SUPABASE.enabled && window.supabase){
        const sb=window.supabase.createClient(window.MATRIZ_SUPABASE.url, window.MATRIZ_SUPABASE.anonKey);
        const {data,error}=await sb.from("usuarios_painel").select("*").eq("email",usuario).eq("senha",senha).eq("ativo",true).limit(1).maybeSingle();
        if(!error && data){
          u={nome:data.nome, usuario:data.email, senha:data.senha, perfil:data.perfil, turma_vinculada:data.turma_vinculada||"Todas", componente_vinculado:data.componente_vinculado||"Todos", acesso_geral:!!data.acesso_geral};
        }
      }
    }catch(e){console.warn("Erro ao validar usuário online",e)}
  }
  if(u){
    sessionStorage.setItem("matriz_usuario_painel", JSON.stringify(u));
    sessionStorage.setItem("matriz_painel_professor_autorizado","sim");
    liberarPainel();
    aplicarPermissoesUsuario();
    carregar();
  }else{
    document.getElementById("loginErro").textContent="Usuário ou senha incorretos.";
  }
}
// Reescreve abertura do login para focar usuário
function abrirLoginPainel(){document.body.classList.add("painel-bloqueado");document.getElementById("loginOverlay").style.display="flex";setTimeout(()=>document.getElementById("usuarioPainel")?.focus(),250)}
// Substitui carregamento com filtro de perfil
const carregarBaseV33 = carregar;
carregar = async function(){
  if(supabaseAtivo()){
    const {data,error}=await sb().from("resultados_treinamento").select("*").order("created_at",{ascending:false}).limit(3000);
    dadosOriginais=error?[]:(data||[]).map(normalizarRegistro);
  }else{
    const l1=JSON.parse(localStorage.getItem("matriz_spaece_resultados_locais")||"[]");
    const l2=JSON.parse(localStorage.getItem("resultados_treinamento")||"[]");
    const key=new Set();
    dadosOriginais=[...l1,...l2].map(normalizarRegistro).filter(d=>{const k=d.created_at+"|"+d.aluno_nome+"|"+d.codigo_prova;if(key.has(k))return false;key.add(k);return true});
  }
  dadosOriginais=filtrarPorUsuario(dadosOriginais);
  preencherFiltros();
  aplicarPermissoesUsuario();
  aplicarFiltros();
  renderAvaliacoesCriadas();
};
// Override provas: professor só vê componente dele
const codigosProvaDaSerieBaseV33=codigosProvaDaSerie;
codigosProvaDaSerie=function(serie){
  let codigos=codigosProvaDaSerieBaseV33(serie);
  const u=usuarioAtual();
  if(u && !u.acesso_geral){
    const letra=componenteParaLetra(u.componente_vinculado);
    if(letra) codigos=codigos.filter(c=>String(c).toUpperCase().charAt(1)===letra);
  }
  return codigos;
};
const atualizarProvasBaseV33=atualizarProvasPorTurma;
atualizarProvasPorTurma=function(){
  const u=usuarioAtual();
  if(u && !u.acesso_geral){
    const turma=document.getElementById("avalTurma");
    if(turma){turma.value=nomeSerieCurta(serieDaTurmaUsuario(u.turma_vinculada)); turma.disabled=true;}
  }
  atualizarProvasBaseV33();
};
const montarAvaliacaoBaseV33=montarAvaliacao;
montarAvaliacao=function(codigo,tipo,nome,turma,escola,serie,codigoProva){
  const a=montarAvaliacaoBaseV33(codigo,tipo,nome,turma,escola,serie,codigoProva);
  const u=usuarioAtual() || {};
  a.professor_nome = u.nome || "Professor/Coordenador";
  a.professor_usuario = u.usuario || "";
  a.professor_perfil = u.perfil || "";
  a.componente_vinculado = letraParaComponente(String(codigoProva||"").charAt(1));
  return a;
};
const salvarAvaliacoesSupabaseBaseV33=salvarAvaliacoesSupabase;
salvarAvaliacoesSupabase=async function(rows){
  try{
    if(window.MATRIZ_SUPABASE && window.MATRIZ_SUPABASE.enabled && window.supabase){
      const sb=window.supabase.createClient(window.MATRIZ_SUPABASE.url, window.MATRIZ_SUPABASE.anonKey);
      const u=usuarioAtual() || {};
      const payload=rows.map(a=>({
        codigo:a.codigo, tipo:a.tipo, aluno_nome:a.aluno_nome_completo, turma:a.turma,
        destinatario:a.destinatario, escola:a.escola, serie:a.serie, codigo_prova:a.codigoProva,
        professor_nome:a.professor_nome || u.nome || "Professor/Coordenador",
        professor_usuario:a.professor_usuario || u.usuario || "",
        professor_perfil:a.professor_perfil || u.perfil || "",
        componente_vinculado:a.componente_vinculado || letraParaComponente(String(a.codigoProva||"").charAt(1)),
        status:a.status || "liberada", finalizado:false
      }));
      const {error}=await sb.from("avaliacoes_criadas").insert(payload);
      if(error) console.warn("Erro ao salvar avaliações no Supabase:", error);
    }
  }catch(e){console.warn("Erro Supabase avaliações:", e);}
};
const renderAvaliacoesCriadasBaseV33=renderAvaliacoesCriadas;
renderAvaliacoesCriadas=function(){
  const el=document.getElementById("avaliacoesCriadas");
  if(!el) return;
  const lista=filtrarAvaliacoesPorUsuario(obterAvaliacoesCriadas());
  const finalizados=obterCodigosFinalizados();
  if(!lista.length){el.textContent="Nenhuma avaliação criada para seu perfil.";return}
  el.innerHTML=lista.slice(0,250).map(a=>{
    const fim=finalizados.includes(a.codigo);
    const nome=a.aluno_nome_completo || a.aluno_nome || (a.tipo==="aluno"?a.destinatario:"");
    const prova=a.codigoProva || a.codigo_prova || "—";
    return `<div class="plan-item">
      <b>${a.codigo}</b> — ${fim?'<span class="badge bad">Finalizada/bloqueada</span>':'<span class="badge good">Liberada</span>'}<br>
      Aluno: <b>${nome||"—"}</b> • Turma: <b>${a.turma||nomeSerieCurta(a.serie)||"—"}</b> • Componente: <b>${a.componente_vinculado || letraParaComponente(String(prova).charAt(1)) || "—"}</b><br>
      Professor: ${a.professor_nome||"—"} • Escola: ${a.escola||"—"} • Prova: ${prova}<br>
      Criada em: ${typeof formatarData==="function"?formatarData(a.created_at):a.created_at}<br>
      <button class="secondary" onclick="copiarCodigoAvaliacao('${a.codigo}')">Copiar código</button>
      <button class="danger" onclick="excluirAvaliacaoCriada('${a.codigo}')">Excluir</button>
    </div>`;
  }).join("");
};
// Garante listeners certos após carregar
window.addEventListener("DOMContentLoaded",()=>{
  const u=usuarioAtual();
  if(u){sessionStorage.setItem("matriz_painel_professor_autorizado","sim"); aplicarPermissoesUsuario();}
  const userInput=document.getElementById("usuarioPainel");
  const passInput=document.getElementById("senhaPainel");
  [userInput,passInput].forEach(el=>el&&el.addEventListener("keydown",e=>{if(e.key==="Enter")validarSenhaPainel()}));
  setTimeout(aplicarPermissoesUsuario,600);
});
