/* =========================================================
   PATCH SEGURO - MATRIZ EDUCACIONAL PQF
   Funcoes:
   1) Mantem exportacao XLSX dos dados
   2) Adiciona botao IMPRIMIR RELATORIO COM GRAFICOS
   3) Nao altera layout original do painel
   ========================================================= */
(function () {
  'use strict';

  function carregarXLSX(callback) {
    if (window.XLSX) return callback && callback();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload = function () { callback && callback(); };
    document.head.appendChild(s);
  }

  function texto(v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/\s+/g, ' ').trim();
  }

  function coletarTabelaDaPagina() {
    var tabelas = Array.from(document.querySelectorAll('table'));
    var maior = null;
    tabelas.forEach(function (t) {
      var linhas = t.querySelectorAll('tr').length;
      if (!maior || linhas > maior.querySelectorAll('tr').length) maior = t;
    });
    if (!maior) return [];

    var linhas = Array.from(maior.querySelectorAll('tr'));
    return linhas.map(function (tr) {
      return Array.from(tr.querySelectorAll('th,td')).map(function (td) { return texto(td.innerText); });
    }).filter(function (r) { return r.some(Boolean); });
  }

  function coletarCardsResumo() {
    var candidatos = Array.from(document.querySelectorAll('.card, .kpi, .stat, section, article, div'));
    var itens = [];
    candidatos.forEach(function (el) {
      var t = texto(el.innerText);
      if (!t || t.length < 3 || t.length > 180) return;
      if (/registros|média|media|maior resultado|abaixo de 50|evolução|evolucao|faixa|descritor|ranking|aluno/i.test(t)) {
        if (!itens.includes(t)) itens.push(t);
      }
    });
    return itens.slice(0, 80).map(function (v, i) { return [i + 1, v]; });
  }

  function pegarLocalStorageResultados() {
    var possiveis = [];
    Object.keys(localStorage).forEach(function (k) {
      try {
        var v = localStorage.getItem(k);
        if (!v || v.length < 2) return;
        var parsed = JSON.parse(v);
        if (Array.isArray(parsed) && parsed.length) possiveis.push(parsed);
      } catch(e) {}
    });
    possiveis.sort(function(a,b){ return b.length - a.length; });
    return possiveis[0] || [];
  }

  function normalizarObjeto(r, i) {
    return {
      'Nº': i + 1,
      'Data': r.data || r.created_at || r.dataHora || r.timestamp || '',
      'Aluno': r.aluno || r.nome || r.nomeAluno || '',
      'Série': r.serie || r.série || r.anoSerie || r.ano_escolar || '',
      'Turma': r.turma || '',
      'Componente Curricular': r.componente || r.componenteCurricular || r.materia || r.disciplina || '',
      'Escola': r.escola || '',
      'Código da Prova': r.codigo || r.codigoProva || r.prova || '',
      'Ano': r.ano || '2026',
      'Mês': r.mes || r.mês || '',
      'Acertos': Number(r.acertos || r.qtdAcertos || 0),
      'Total': Number(r.total || r.totalQuestoes || r.questoes || 0),
      'Percentual': r.percentual || r.porcentagem || (r.total ? Math.round((Number(r.acertos || 0) / Number(r.total || 1)) * 100) + '%' : ''),
      'Descritor': r.descritor || r.habilidade || '',
      'Resultado': r.resultado || r.status || '',
      'Observações': r.observacoes || r.observação || ''
    };
  }

  function baixarExcelMatriz(anonimo) {
    carregarXLSX(function () {
      var dadosStorage = pegarLocalStorageResultados();
      var dados = [];

      if (dadosStorage.length && typeof dadosStorage[0] === 'object' && !Array.isArray(dadosStorage[0])) {
        dados = dadosStorage.map(normalizarObjeto);
      }

      var tabela = coletarTabelaDaPagina();
      if (!dados.length && tabela.length) {
        var cab = tabela[0];
        dados = tabela.slice(1).map(function (linha, idx) {
          var obj = {};
          cab.forEach(function (c, i) { obj[c || ('Coluna ' + (i + 1))] = linha[i] || ''; });
          obj['Nº'] = obj['Nº'] || idx + 1;
          return obj;
        });
      }

      if (!dados.length) {
        alert('Nenhum dado encontrado para exportar. Clique em Atualizar e tente novamente.');
        return;
      }

      if (anonimo) {
        dados = dados.map(function (r) {
          var novo = Object.assign({}, r);
          if ('Aluno' in novo) novo.Aluno = 'Aluno ' + String(novo['Nº'] || '').padStart(2, '0');
          if ('Nome' in novo) novo.Nome = 'Aluno ' + String(novo['Nº'] || '').padStart(2, '0');
          return novo;
        });
      }

      var wb = XLSX.utils.book_new();
      var wsDados = XLSX.utils.json_to_sheet(dados);
      wsDados['!cols'] = Object.keys(dados[0]).map(function (k) { return { wch: Math.max(12, Math.min(32, k.length + 8)) }; });
      XLSX.utils.book_append_sheet(wb, wsDados, 'Resultados');

      var resumo = coletarCardsResumo();
      resumo.unshift(['Item', 'Informação do painel']);
      var wsResumo = XLSX.utils.aoa_to_sheet(resumo);
      wsResumo['!cols'] = [{wch:8},{wch:90}];
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo do Painel');

      var nome = anonimo ? 'resultados_matriz_anonimizado_' : 'resultados_matriz_educacional_';
      var hoje = new Date().toISOString().slice(0,10);
      XLSX.writeFile(wb, nome + hoje + '.xlsx');
    });
  }

  function imprimirRelatorioComGraficos() {
    var titulo = 'Relatório Pedagógico - Sistema Matriz Educacional PQF';
    var cabecalho = document.querySelector('header, .header, .topo, .hero') || document.body.firstElementChild;
    var filtros = document.querySelector('form, .filters, .filtros') || null;

    var blocos = Array.from(document.querySelectorAll('canvas, svg, table, .card, .kpi, .stat, section, article'));
    var usados = [];
    blocos.forEach(function (el) {
      if (usados.indexOf(el) >= 0) return;
      var txt = texto(el.innerText || '');
      if (el.tagName === 'CANVAS' || el.tagName === 'SVG' || txt.length > 2) usados.push(el);
    });

    var conteudo = '';
    if (cabecalho) conteudo += '<div class="cabecalho-relatorio">' + cabecalho.outerHTML + '</div>';
    if (filtros) conteudo += '<h2>Filtros e contexto da análise</h2><div class="bloco">' + filtros.outerHTML + '</div>';

    conteudo += '<h2>Painel de indicadores e gráficos</h2>';
    if (usados.length) {
      usados.forEach(function (el) {
        if (el.tagName === 'CANVAS') {
          try { conteudo += '<div class="bloco"><img src="' + el.toDataURL('image/png') + '" /></div>'; } catch(e) {}
        } else {
          conteudo += '<div class="bloco">' + el.outerHTML + '</div>';
        }
      });
    } else {
      conteudo += '<p>Nenhum gráfico visível encontrado. Clique em Atualizar no painel antes de imprimir.</p>';
    }

    var win = window.open('', '_blank');
    win.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+titulo+'</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111;background:#fff}h1{font-size:24px;margin:0 0 6px}h2{font-size:18px;margin:22px 0 10px;border-bottom:2px solid #ddd;padding-bottom:6px}.data{color:#555;margin-bottom:18px}.bloco{border:1px solid #ddd;border-radius:10px;padding:12px;margin:10px 0;page-break-inside:avoid;background:#fff}table{width:100%;border-collapse:collapse;font-size:12px}td,th{border:1px solid #ccc;padding:6px;text-align:left}img,canvas,svg{max-width:100%;height:auto}.cabecalho-relatorio *{max-width:100%}@media print{button{display:none}.bloco{break-inside:avoid}body{margin:12mm}}</style></head><body>');
    win.document.write('<button onclick="window.print()" style="padding:12px 18px;margin-bottom:16px;font-weight:bold">Imprimir / Salvar em PDF</button>');
    win.document.write('<h1>'+titulo+'</h1><div class="data">Gerado em '+new Date().toLocaleString('pt-BR')+'</div>');
    win.document.write(conteudo);
    win.document.write('</body></html>');
    win.document.close();
    setTimeout(function(){ win.focus(); }, 500);
  }

  function adicionarBotoes() {
    var area = document.querySelector('.filters, .filtros, form') || document.querySelector('main') || document.body;
    if (!area || document.getElementById('btn-imprimir-graficos-matriz')) return;

    var box = document.createElement('div');
    box.style.display = 'flex';
    box.style.flexWrap = 'wrap';
    box.style.gap = '8px';
    box.style.margin = '10px 0';

    var btnPrint = document.createElement('button');
    btnPrint.id = 'btn-imprimir-graficos-matriz';
    btnPrint.type = 'button';
    btnPrint.textContent = 'Imprimir relatório com gráficos';
    btnPrint.style.background = '#22c55e';
    btnPrint.style.color = '#001b0b';
    btnPrint.style.border = '0';
    btnPrint.style.borderRadius = '10px';
    btnPrint.style.padding = '11px 14px';
    btnPrint.style.fontWeight = '800';
    btnPrint.onclick = imprimirRelatorioComGraficos;

    var btnExcel = document.createElement('button');
    btnExcel.id = 'btn-exportar-xlsx-matriz';
    btnExcel.type = 'button';
    btnExcel.textContent = 'Baixar Excel XLSX';
    btnExcel.style.background = '#facc15';
    btnExcel.style.color = '#111827';
    btnExcel.style.border = '0';
    btnExcel.style.borderRadius = '10px';
    btnExcel.style.padding = '11px 14px';
    btnExcel.style.fontWeight = '800';
    btnExcel.onclick = function(){ baixarExcelMatriz(false); };

    box.appendChild(btnPrint);
    box.appendChild(btnExcel);
    area.appendChild(box);
  }

  // Sobrescreve nomes comuns sem quebrar botoes antigos
  window.exportarResultadosExcel = function(){ baixarExcelMatriz(false); };
  window.exportarExcel = function(){ baixarExcelMatriz(false); };
  window.exportarCSV = function(){ baixarExcelMatriz(false); };
  window.exportarExcelAnonimizado = function(){ baixarExcelMatriz(true); };
  window.imprimirRelatorioComGraficos = imprimirRelatorioComGraficos;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', adicionarBotoes);
  } else {
    adicionarBotoes();
  }
  setTimeout(adicionarBotoes, 1000);
  setTimeout(adicionarBotoes, 3000);
})();
