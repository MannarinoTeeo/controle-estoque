// backend/server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000; // Porta que o backend vai rodar

// Middleware para permitir que o frontend acesse a API
app.use(cors());
// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// --- Nosso "Banco de Dados" em memória ---
let produtos = [
    { id: 1, nome: 'Produto Exemplo A', quantidade: 10, preco: 19.99 },
    { id: 2, nome: 'Produto Exemplo B', quantidade: 5, preco: 25.50 }
];
let proximoId = 3; // Para gerar IDs únicos

// --- ROTAS DA API (/api/produtos) ---

// POST /api/produtos - Adicionar um novo produto
app.post('/api/produtos', (req, res) => {
    const { nome, quantidade, preco } = req.body;

    if (!nome || quantidade === undefined || preco === undefined) {
        return res.status(400).json({ mensagem: 'Nome, quantidade e preço são obrigatórios.' });
    }
    if (typeof quantidade !== 'number' || typeof preco !== 'number' || quantidade < 0 || preco < 0) {
        return res.status(400).json({ mensagem: 'Quantidade e preço devem ser números positivos.' });
    }

    const novoProduto = {
        id: proximoId++,
        nome,
        quantidade,
        preco
    };
    produtos.push(novoProduto);
    console.log('Produto Adicionado:', novoProduto);
    res.status(201).json(novoProduto);
});

// GET /api/produtos - Listar todos os produtos
app.get('/api/produtos', (req, res) => {
    console.log('Listando produtos:', produtos);
    res.status(200).json(produtos);
});

// GET /api/produtos/:id - Obter um produto específico
app.get('/api/produtos/:id', (req, res) => {
    const idProduto = parseInt(req.params.id);
    const produto = produtos.find(p => p.id === idProduto);

    if (produto) {
        console.log('Produto Encontrado:', produto);
        res.status(200).json(produto);
    } else {
        console.log('Produto não encontrado, ID:', idProduto);
        res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }
});

// PUT /api/produtos/:id - Atualizar um produto existente
app.put('/api/produtos/:id', (req, res) => {
    const idProduto = parseInt(req.params.id);
    const { nome, quantidade, preco } = req.body;
    const indiceProduto = produtos.findIndex(p => p.id === idProduto);

    if (indiceProduto === -1) {
        console.log('Produto não encontrado para atualização, ID:', idProduto);
        return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    if (!nome || quantidade === undefined || preco === undefined) {
        return res.status(400).json({ mensagem: 'Nome, quantidade e preço são obrigatórios.' });
    }
    if (typeof quantidade !== 'number' || typeof preco !== 'number' || quantidade < 0 || preco < 0) {
        return res.status(400).json({ mensagem: 'Quantidade e preço devem ser números positivos.' });
    }

    produtos[indiceProduto] = { ...produtos[indiceProduto], nome, quantidade, preco };
    console.log('Produto Atualizado:', produtos[indiceProduto]);
    res.status(200).json(produtos[indiceProduto]);
});

// DELETE /api/produtos/:id - Remover um produto
app.delete('/api/produtos/:id', (req, res) => {
    const idProduto = parseInt(req.params.id);
    const indiceProduto = produtos.findIndex(p => p.id === idProduto);

    if (indiceProduto === -1) {
        console.log('Produto não encontrado para exclusão, ID:', idProduto);
        return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    const produtoRemovido = produtos.splice(indiceProduto, 1);
    console.log('Produto Removido:', produtoRemovido[0]);
    res.status(200).json({ mensagem: 'Produto removido com sucesso.', produto: produtoRemovido[0] });
    // Ou res.status(204).send(); se não quiser enviar corpo na resposta
});


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor backend rodando em http://localhost:${PORT}`);
    console.log('-------------------------------------------------');
    console.log('Endpoints disponíveis:');
    console.log(`  POST   http://localhost:${PORT}/api/produtos`);
    console.log(`  GET    http://localhost:${PORT}/api/produtos`);
    console.log(`  GET    http://localhost:${PORT}/api/produtos/:id`);
    console.log(`  PUT    http://localhost:${PORT}/api/produtos/:id`);
    console.log(`  DELETE http://localhost:${PORT}/api/produtos/:id`);
    console.log('-------------------------------------------------');
});