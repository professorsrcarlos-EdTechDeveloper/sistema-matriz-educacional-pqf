/*
  SISTEMA MATRIZ EDUCACIONAL PQF
  Patch seguro: NÃO altera o layout do painel.
  Funções:
  1) Mantém exportação XLSX de dados, quando a biblioteca XLSX estiver disponível.
  2) Gera RELATÓRIO/IMPRESSÃO COM GRÁFICOS usando os gráficos que já aparecem no painel.
  3) Baixa um arquivo .xls visual com os gráficos em HTML, abrindo no Excel/Excel Web como relatório visual.
*/
(function(){
  'use strict';

  function hojeBR(){
    const d = new Date();
    return d.toISOString().slice(0,10);
  }

  function baixarBlob(nome, conteudo, tipo){
    const blob = new Blob([conteudo], {type: tipo});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{URL.revokeObjectURL(url); a.remove();}, 500);
  }

  function texto(id){
    const el = document.getElementById(id);
    return el ? (el.textContent || '').trim() : '';
  }

  function clonarHTML(id){
    const el = document.getElementById(id);
    return el ? el.outerHTML : '<div class="sem-dados">Sem dados.</div>';
  }

  function cssRelatorio(){
    return `
      <style>
        *{box-sizing:border-box;font-family:Arial,Helvetica,sans-serif}
        body{margin:0;padding:22px;background:#fff;color:#111827}
        .cabecalho{border-bottom:4px solid #0f4c81;margin-bottom:18px;padding-bottom:10px}
        h1{margin:0;color:#0f4c81;font-size:24px}
        h2{color:#0f4c81;font-size:18px;margin:18px 0 8px;border-bottom:1px solid #cbd5e1;padding-bottom:5px}
        .sub{color:#475569;font-size:12px;margin-top:4px}
        .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0 18px}
        .kpiPrint{border:1px solid #cbd5e1;border-left:6px solid #0f4c81;border-radius:8px;padding:10px;background:#f8fafc}
        .kpiPrint b{font-size:12px;color:#475569;display:block;text-transform:uppercase}
        .kpiPrint strong{font-size:28px;color:#111827;display:block;margin-top:4px}
        .secao{page-break-inside:avoid;border:1px solid #cbd5e1;border-radius:10px;padding:12px;margin-bottom:14px;background:#fff}
        .chart-bar,.bar-row{margin:8px 0}
        .bar-head{display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px}
        .bar-track{height:14px;background:#e5e7eb;border-radius:999px;overflow:hidden}
        .bar-fill{height:100%;background:#2563eb;border-radius:999px}
        .bar-fill.red{background:#dc2626}.bar-fill.gold{background:#d97706}
        .vertical-chart{display:flex;align-items:end;gap:10px;min-height:180px;border-left:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1;padding:10px 6px 30px;margin-top:8px}
        .vertical-item,.vbar-wrap{flex:1;text-align:center;position:relative}
        .vertical-bar,.vbar{margin:auto;width:70%;max-width:45px;border-radius:8px 8px 2px 2px;background:#2563eb;min-height:4px}
        .pizza,.pie{width:150px;height:150px;border-radius:50%;margin:10px auto;border:1px solid #cbd5e1}
        .mini-card,.rank-item,.plan-item,.result-card,.avaliacao-card{border:1px solid #cbd5e1;border-radius:8px;padding:8px;margin:6px 0;background:#f8fafc;color:#111827}
        .heat-table,.heatmap-grid{display:grid;grid-template-columns:240px repeat(3,1fr);gap:5px}
        .heat-cell{border:1px solid #cbd5e1;border-radius:6px;padding:7px;font-size:12px;background:#f8fafc;color:#111827}
        .heat-bad{background:#fee2e2!important}.heat-warn{background:#fef3c7!important}.heat-good{background:#dcfce7!important}
        .pre{white-space:pre-wrap;border:1px solid #cbd5e1;border-radius:8px;padding:10px;background:#f8fafc;color:#111827}
        table{width:100%;border-collapse:collapse;margin-top:10px}td,th{border:1px solid #cbd5e1;padding:6px;font-size:12px;text-align:left}th{background:#e2e8f0}
        @media print{body{padding:10mm}.no-print{display:none!important}.secao{break-inside:avoid}.page-break{page-break-before:always}}
      </style>`;
  }

  function montarRelatorioHTML(){
    const usuario = texto('usuarioLogadoBox') || 'Painel PQF';
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório MATRIZ com gráficos</title>${cssRelatorio()}</head><body>
      <div class="cabecalho">
        <h1>Sistema MATRIZ EDUCACIONAL — Relatório com Gráficos</h1>
        <div class="sub">E.M.E.F. Pedro de Queiroz Ferreira • Sítio Lucas • Beberibe</div>
        <div class="sub">Gerado em ${new Date().toLocaleString('pt-BR')} • ${usuario}</div>
      </div>
      <div class="kpis">
        <div class="kpiPrint"><b>Registros</b><strong>${texto('kTotal') || '0'}</strong></div>
        <div class="kpiPrint"><b>Média geral</b><strong>${texto('kMedia') || '0%'}</strong></div>
        <div class="kpiPrint"><b>Maior resultado</b><strong>${texto('kMaior') || '0%'}</strong></div>
        <div class="kpiPrint"><b>Abaixo de 50%</b><strong>${texto('kBaixo50') || '0'}</strong></div>
        <div class="kpiPrint"><b>50% a 69%</b><strong>${texto('kAtencao') || '0'}</strong></div>
        <div class="kpiPrint"><b>Evolução recente</b><strong>${texto('kEvolucao') || '0%'}</strong></div>
      </div>
      <div class="secao"><h2>Comparativo por Componente Curricular</h2>${clonarHTML('chartComponentes')}</div>
      <div class="secao"><h2>Faixa de Desempenho</h2>${clonarHTML('chartFaixas')}</div>
      <div class="secao"><h2>Descritores com Maior Dificuldade</h2>${clonarHTML('chartErros')}</div>
      <div class="secao"><h2>Descritores com Melhor Domínio</h2>${clonarHTML('chartAcertos')}</div>
      <div class="secao"><h2>Ranking Pedagógico de Evolução</h2>${clonarHTML('rankingEvolucao')}</div>
      <div class="secao"><h2>Nível de Acompanhamento Pedagógico</h2>${clonarHTML('riscoPedagogico')}</div>
      <div class="secao"><h2>Mapa de Calor dos Descritores por Ano</h2>${clonarHTML('heatmapDescritores')}</div>
      <div class="secao"><h2>Evolução por Descritor</h2>${clonarHTML('evolucaoDescritores')}</div>
      <div class="secao"><h2>Plano Automático de Intervenção</h2>${clonarHTML('planoIntervencao')}</div>
      <div class="secao"><h2>Desempenho Mensal</h2>${clonarHTML('desempenhoMensal')}</div>
      <div class="secao"><h2>Relatório Pedagógico</h2>${clonarHTML('relatorioPedagogico')}</div>
    </body></html>`;
  }

  window.imprimirRelatorioComGraficos = function(){
    const html = montarRelatorioHTML();
    const w = window.open('', '_blank');
    if(!w){ alert('O navegador bloqueou a janela de impressão. Permita pop-ups para este site.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(()=>{ w.focus(); w.print(); }, 500);
  };

  window.baixarRelatorioExcelVisual = function(){
    const html = montarRelatorioHTML();
    baixarBlob('relatorio_matriz_com_graficos_' + hojeBR() + '.xls', html, 'application/vnd.ms-excel;charset=utf-8');
  };

  // Se existir o botão antigo “Planilha com gráficos”, ele passa a gerar o relatório visual com gráficos.
  window.gerarPlanilhaGraficos = window.baixarRelatorioExcelVisual;

  function inserirBotoesRelatorio(){
    const botoes = Array.from(document.querySelectorAll('button, a'));
    const jaTem = botoes.some(b => /relat.rio.*gr.ficos|imprimir.*gr.ficos/i.test(b.textContent || ''));
    if(jaTem) return;
    const alvo = botoes.find(b => /Excel|CSV|Planilha/i.test(b.textContent || ''));
    const container = alvo ? alvo.parentElement : document.querySelector('.actions');
    if(!container) return;

    const btnPrint = document.createElement('button');
    btnPrint.type = 'button';
    btnPrint.className = 'btn gold';
    btnPrint.textContent = 'Imprimir relatório com gráficos';
    btnPrint.onclick = window.imprimirRelatorioComGraficos;

    const btnXls = document.createElement('button');
    btnXls.type = 'button';
    btnXls.className = 'btn gold';
    btnXls.textContent = 'Excel visual com gráficos';
    btnXls.onclick = window.baixarRelatorioExcelVisual;

    container.appendChild(btnPrint);
    container.appendChild(btnXls);
  }

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(inserirBotoesRelatorio, 800);
    setTimeout(inserirBotoesRelatorio, 2000);
  });
})();
