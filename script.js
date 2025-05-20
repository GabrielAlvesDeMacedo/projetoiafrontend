const divInfos = document.getElementById('infos');
const divResposta = document.getElementById('response');
const btnGerarReceita = document.getElementById('generate-recipe-btn');
const btnLimparCampos = document.getElementById('clear-infos-btn');
const btnAdicionarNacao = document.getElementById('add-nacoes-btn');

// Habilita/desabilita botões de "Excluir" com base no número de inputs
function atualizarBotoesRemover() {
    const botoesRemover = divInfos.querySelectorAll('.nacao-row .btn-danger');
    const linhasNacao = divInfos.querySelectorAll('.nacao-row');
    botoesRemover.forEach(botao => {
        botao.disabled = linhasNacao.length <= 2;
    });
}

// Adiciona nova linha de input
function adicionarNacao() {
    const linha = document.createElement('div');
    linha.className = 'nacao-row flex items-center space-x-2';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'nacao nacao-input flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700';
    input.placeholder = 'Informe um país...'; // Changed placeholder to 'país' for consistency

    const botao = document.createElement('button');
    botao.className = 'btn-danger bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 text-sm';
    botao.textContent = 'Excluir';
    botao.addEventListener('click', () => removerNacao(botao));

    linha.appendChild(input);
    linha.appendChild(botao);
    divInfos.appendChild(linha);

    atualizarBotoesRemover();
}

// Remove uma linha de input
function removerNacao(botao) {
    const linha = botao.parentElement;
    if (linha) {
        linha.remove();
        atualizarBotoesRemover();
    }
}

// Limpa os campos de input
function limparCamposNacoes() {
    const inputs = divInfos.querySelectorAll('.nacao-input');
    inputs.forEach(input => input.value = '');
}

// Envia dados para o backend e exibe o resultado
async function enviarFormulario() {
    btnGerarReceita.disabled = true;
    btnGerarReceita.innerText = 'Procurando...';
    divResposta.innerHTML = 'Carregando...';
    divResposta.classList.remove('hidden');

    const inputs = divInfos.querySelectorAll('.nacao-input');
    const nacoes = [];

    inputs.forEach(input => {
        const valor = input.value.trim();
        if (valor) nacoes.push(valor);
    });

    if (nacoes.length < 2) {
        alert('Informe pelo menos duas nações para buscar um conflito.');
        btnGerarReceita.disabled = false;
        btnGerarReceita.innerText = 'Procurar conflito';
        divResposta.classList.add('hidden');
        return;
    }

    try {
        const resposta = await fetch('https://projetoiabackend.vercel.app/conflito', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ informacoes: nacoes })
        });

        const resultado = await resposta.json();

        // --- IMPORTANT: Log the received HTML to console ---
        console.log("Received HTML from backend:", resultado.html);
        // --- END IMPORTANT ---

        if (resultado && resultado.html) {
            divResposta.innerHTML = resultado.html;
            divResposta.classList.remove('text-red-600');
            divResposta.classList.remove('hidden');
        } else if (resultado.error) {
            divResposta.innerHTML = `<p class="text-red-600 font-semibold">Erro: ${resultado.error}</p>`;
            divResposta.classList.add('text-red-600');
        } else {
            divResposta.innerHTML = `<p class="text-red-600 font-semibold">Erro: resposta inesperada do servidor.</p>`;
            divResposta.classList.add('text-red-600');
        }
    } catch (erro) {
        divResposta.innerHTML = `<p class="text-red-600 font-semibold">Erro ao comunicar com o servidor: ${erro.message}</p>`;
        divResposta.classList.add('text-red-600');
    } finally {
        btnGerarReceita.disabled = false;
        btnGerarReceita.innerText = 'Procurar conflito';
        divResposta.classList.remove('hidden');
    }

    // Preserve inputs after search for debugging, clear after successful search.
    // If the issue is persistent, comment out this line temporarily to see the inputs.
    // limparCamposNacoes();
}

// Quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    btnAdicionarNacao.addEventListener('click', adicionarNacao);
    btnGerarReceita.addEventListener('click', enviarFormulario);
    btnLimparCampos.addEventListener('click', limparCamposNacoes);

    // Adiciona listeners aos botões "Excluir" iniciais
    const botoesIniciais = divInfos.querySelectorAll('.btn-danger');
    botoesIniciais.forEach(botao => {
        botao.addEventListener('click', () => removerNacao(botao));
    });

    atualizarBotoesRemover();
});