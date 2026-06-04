/*
  MATRIZ EDUCACIONAL - Correção de exportação Excel XLSX
  Arquivo pronto para GitHub Pages.
  Ele adiciona suporte a XLSX e substitui exportações CSV por Excel quando possível.
*/
(function () {
  'use strict';

  const XLSX_CDN = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';

  function carregarXLSX(callback) {
    if (window.XLSX) {
      callback();
      return;
    }
    const script = document.createElement('script');
    script.src = XLSX_CDN;
    script.onload = callback;
    script.onerror = function () {
      alert('Não foi possível carregar a biblioteca Excel. Verifique a internet e tente novamente.');
    };
    document.head.appendChild(script);
  }

  function normalizarTexto(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor).replace(/\r?\n/g, ' ').trim();
  }

  function buscarResultados() {
    const chavesPossiveis = [
      'resultados_matriz_educacional',
      'matriz_resultados',
      'resultados',
      'respostas_matriz',
      'avaliacoes_resultados',
      'resultadosAlunos'
    ];

    for (const chave of chavesPossiveis) {
      try {
        const valor = localStorage.getItem(chave);
        if (!valor) continue;
        const dados = JSON.parse(valor);
        if (Array.isArray(dados) && dados.length) return dados;
      } catch (e) {}
    }

    const candidatos = [];
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      try {
        const valor = JSON.parse(localStorage.getItem(chave));
        if (Array.isArray(valor) && valor.length && typeof valor[0] === 'object') {
          const texto = JSON.stringify(valor[0]).toLowerCase();
          if (
            texto.includes('aluno') ||
            texto.includes('acertos') ||
            texto.includes('percentual') ||
            texto.includes('turma') ||
            texto.includes('escola')
          ) {
            candidatos.push(valor);
          }
        }
      } catch (e) {}
    }

    return candidatos.length ? candidatos[0] : [];
  }

  function mapearResultado(r, index) {
    const total = r.total ?? r.totalQuestoes ?? r.quantidade ?? r.qtdQuestoes ?? '';
    const acertos = r.acertos ?? r.pontos ?? r.pontuacao ?? '';
    let percentual = r.percentual ?? r.aproveitamento ?? r.media ?? '';

    if (!percentual && total && acertos !== '') {
      const calc = (Number(acertos) / Number(total)) * 100;
      if (Number.isFinite(calc)) percentual = calc.toFixed(1) + '%';
    }

    return {
      'Nº': index + 1,
      'Data': normalizarTexto(r.data || r.dataFinalizacao || r.criadoEm || r.created_at || ''),
      'Aluno': normalizarTexto(r.aluno || r.nome || r.nomeAluno || r.estudante || ''),
      'Série': normalizarTexto(r.serie || r.anoSerie || r.anoEscolar || ''),
      'Turma': normalizarTexto(r.turma || ''),
      'Componente Curricular': normalizarTexto(r.componente || r.componenteCurricular || r.materia || r.disciplina || ''),
      'Escola': normalizarTexto(r.escola || r.nomeEscola || ''),
      'Código da Prova': normalizarTexto(r.codigo || r.codigoProva || r.codProva || r.provaCodigo || ''),
      'Ano': normalizarTexto(r.ano || new Date().getFullYear()),
      'Mês': normalizarTexto(r.mes || ''),
      'Acertos': acertos,
      'Total': total,
      'Percentual': normalizarTexto(percentual),
      'Descritor': normalizarTexto(r.descritor || r.descritores || ''),
      'Professor': normalizarTexto(r.professor || r.docente || ''),
      'Observações': normalizarTexto(r.observacoes || r.observacao || '')
    };
  }

  function exportarResultadosExcel() {
    carregarXLSX(function () {
      const resultados = buscarResultados();

      if (!resultados.length) {
        alert('Nenhum resultado encontrado para exportar.');
        return;
      }

      const dados = resultados.map(mapearResultado);
      const planilha = XLSX.utils.json_to_sheet(dados);

      planilha['!cols'] = [
        { wch: 6 }, { wch: 16 }, { wch: 30 }, { wch: 12 },
        { wch: 12 }, { wch: 26 }, { wch: 30 }, { wch: 18 },
        { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
        { wch: 14 }, { wch: 30 }, { wch: 25 }, { wch: 40 }
      ];

      const livro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(livro, planilha, 'Resultados');

      const hoje = new Date();
      const data = hoje.toISOString().slice(0, 10);
      XLSX.writeFile(livro, 'resultados_matriz_educacional_' + data + '.xlsx');
    });
  }

  window.exportarResultadosExcel = exportarResultadosExcel;
  window.exportarExcel = exportarResultadosExcel;
  window.baixarExcel = exportarResultadosExcel;

  const funcoesCSV = [
    'exportarCSV',
    'baixarCSV',
    'downloadCSV',
    'exportarResultadosCSV',
    'exportarResultados'
  ];

  funcoesCSV.forEach(function (nome) {
    try {
      window[nome] = exportarResultadosExcel;
    } catch (e) {}
  });

  function ajustarBotoes() {
    const botoes = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
    botoes.forEach(function (botao) {
      const texto = ((botao.innerText || botao.value || botao.textContent || '') + ' ' + (botao.getAttribute('onclick') || '')).toLowerCase();
      if (texto.includes('csv') || texto.includes('exportar')) {
        if (texto.includes('csv') || texto.includes('resultado')) {
          botao.onclick = function (ev) {
            ev.preventDefault();
            exportarResultadosExcel();
            return false;
          };
          if (botao.tagName.toLowerCase() === 'input') {
            botao.value = (botao.value || 'Exportar Excel').replace(/CSV/gi, 'Excel');
          } else {
            botao.textContent = (botao.textContent || 'Exportar Excel').replace(/CSV/gi, 'Excel');
          }
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ajustarBotoes);
  } else {
    ajustarBotoes();
  }
  setTimeout(ajustarBotoes, 1000);
  setTimeout(ajustarBotoes, 3000);
})();
