// frontend/script.js
const apiUrl = 'http://localhost:3000/api/produtos'; // URL do seu backend

const formProduto = document.getElementById('formProduto');
const produtoIdInput = document.getElementById('produtoId');
const nomeInput = document.getElementById('nome');
const quantidadeInput = document.getElementById('quantidade');
const precoInput = document.getElementById('preco');
const tabelaProdutosBody = document.querySelector('#tabelaProdutos tbody');
const btnSalvar = document.getElementById('btnSalvar');
const filtroNomeInput = document.getElementById('filtroNome');
const mensagemListaVazia = document.getElementById('mensagemListaVazia');

// --- FUNÇÕES DE INTERAÇÃO COM A API ---

async function buscarProdutos() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const produtos = await response.json();
        return produtos;
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        alert('Não foi possível carregar os produtos. Verifique se o servidor backend está rodando.');
        return [];
    }
}

async function adicionarProduto(produto) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(produto),
        });
        if (!response.ok) {
            const erroData = await response.json();
            throw new Error(erroData.mensagem || `Erro HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        alert(`Erro ao adicionar produto: ${error.message}`);
    }
}

async function atualizarProduto(id, produto) {
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(produto),
        });
        if (!response.ok) {
            const erroData = await response.json();
            throw new Error(erroData.mensagem || `Erro HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        alert(`Erro ao atualizar produto: ${error.message}`);
    }
}

async function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const erroData = await response.json();
            throw new Error(erroData.mensagem || `Erro HTTP: ${response.status}`);
        }
        // const resultado = await response.json(); // Opcional, se o backend retornar dados
        // console.log(resultado.mensagem);
        listarProdutos(); // Atualiza a lista após excluir
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert(`Erro ao excluir produto: ${error.message}`);
    }
}

// --- FUNÇÕES DA INTERFACE DO USUÁRIO (UI) ---

function preencherFormulario(produto) {
    produtoIdInput.value = produto.id;
    nomeInput.value = produto.nome;
    quantidadeInput.value = produto.quantidade;
    precoInput.value = produto.preco;
    btnSalvar.textContent = 'Atualizar';
    btnSalvar.classList.add('editar');
}

function limparFormulario() {
    formProduto.reset();
    produtoIdInput.value = '';
    btnSalvar.textContent = 'Salvar';
    btnSalvar.classList.remove('editar');
    nomeInput.focus();
}

async function handleSalvarSubmit(event) {
    event.preventDefault();
    const nome = nomeInput.value.trim();
    const quantidade = parseInt(quantidadeInput.value);
    const preco = parseFloat(precoInput.value);
    const id = produtoIdInput.value;

    if (!nome || isNaN(quantidade) || isNaN(preco) || quantidade < 0 || preco < 0) {
        alert('Por favor, preencha todos os campos corretamente. Quantidade e preço devem ser positivos.');
        return;
    }

    const produto = { nome, quantidade, preco };

    if (id) { // Se tem ID, é atualização
        await atualizarProduto(id, produto);
    } else { // Senão, é adição
        await adicionarProduto(produto);
    }
    limparFormulario();
    listarProdutos(); // Atualiza a lista
}

function criarLinhaProduto(produto) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${produto.id}</td>
        <td>${produto.nome}</td>
        <td>${produto.quantidade}</td>
        <td>R$ ${produto.preco.toFixed(2)}</td>
        <td>
            <button class="btn-editar" onclick="prepararEdicao(${produto.id})">Editar</button>
            <button class="btn-excluir" onclick="excluirProduto(${produto.id})">Excluir</button>
        </td>
    `;
    return tr;
}

async function listarProdutos() {
    const produtos = await buscarProdutos();
    const termoFiltro = filtroNomeInput.value.toLowerCase();
    tabelaProdutosBody.innerHTML = ''; // Limpa a tabela

    const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(termoFiltro));

    if (produtosFiltrados.length === 0) {
        mensagemListaVazia.style.display = 'block';
        if (produtos.length > 0 && termoFiltro) {
             mensagemListaVazia.textContent = 'Nenhum produto encontrado com este filtro.';
        } else {
             mensagemListaVazia.textContent = 'Nenhum produto cadastrado.';
        }
    } else {
        mensagemListaVazia.style.display = 'none';
        produtosFiltrados.forEach(produto => {
            tabelaProdutosBody.appendChild(criarLinhaProduto(produto));
        });
    }
}

async function prepararEdicao(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) throw new Error('Produto não encontrado para edição');
        const produto = await response.json();
        preencherFormulario(produto);
        window.scrollTo(0, 0); // Rola para o topo para ver o formulário preenchido
    } catch (error) {
        console.error('Erro ao buscar produto para edição:', error);
        alert('Não foi possível carregar os dados do produto para edição.');
    }
}


// --- EVENT LISTENERS ---
formProduto.addEventListener('submit', handleSalvarSubmit);

// Carregar produtos ao iniciar a página
document.addEventListener('DOMContentLoaded', listarProdutos);

// Funções globais para os botões inline (poderiam ser adicionadas com event listeners também)
window.prepararEdicao = prepararEdicao;
window.excluirProduto = excluirProduto;
window.limparFormulario = limparFormulario;
window.listarProdutos = listarProdutos; // Para o filtro onkeyup