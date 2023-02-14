const express = require('express');
const app = express();
const pool = require('./conexao')

app.use(express.json());
app.post('/autor', async (req, res) => {
    let { nome, idade } = req.body

    try {
        if (!nome) {
            return res.status(400).json({
                "mensagem": "O nome do Autor é obrigatório!"
            })
        }
        const query = 'insert into autores (nome, idade) values($1, $2)'
        const params = [nome, idade]

        const resultado = await pool.query(query, params)
        return res.status(204).json(resultado)
    } catch (error) {
        return res.status(400).json(error.message)
    }
})

app.get('/autor/:id', async (req, res) => {
    const { id } = req.params

    try {
        const query = `select a.id as aid, a.nome as anome, a.idade as aidade, *
        from autores a join livros l on a.id = l.id_autor 
        where a.id = $1`
        const params = [id]
        const resultado = await pool.query(query, params)
        const rows = resultado.rows

        const resposta = {
            "id": rows[0].aid,
            "nome": rows[0].anome,
            "idade": rows[0].aidade,
            "livros": []
        };

        for (let row of rows) {
            resposta.livros.push({
                id: row.id,
                nome: row.nome,
                genero: row.genero,
                editora: row.editora,
                data_publicacao: row.data_publicacao
            });
        };

        if (resultado.rows.length > 0) {
            return res.json(resposta)
        }

        return res.status(404).json({ "mensagem": "Livro não encontrado" })
    } catch (error) {
        return res.status(400).json(error.message)
    }
})

app.post('/autor/:id/livro', async (req, res) => {
    const { id } = req.params
    const { nome, genero, editora, data_publicacao } = req.body
    try {
        if (!nome) {
            return res.status(400).json({
                "mensagem": "O nome do Autor é obrigatório!"
            })
        }

        const query = 'insert into livros (id_autor, nome, genero, editora, data_publicacao) values($1, $2, $3, $4, $5)'
        const params = [id, nome, genero, editora, data_publicacao]

        const resultado = await pool.query(query, params)
        return res.status(204).json(resultado)
    } catch (error) {

        return res.status(400).json(error.message)

    }


})

app.get('/livro', async (req, res) => {

    try {
        const query = `select a.id as aid, a.nome as anome, a.idade as aidade, * from autores a join livros l on a.id = l.id_autor`
        const resultado = await pool.query(query)
        const resposta = resultado.rows.map((i) => {
            return {
                "id": i.id,
                "nome": i.nome,
                "genero": i.genero,
                "data_publicacao": i.data_publicacao,
                "autor": {
                    "id": i.aid,
                    "nome": i.anome,
                    "idade": i.aidade
                }
            }

        })
        if (resultado.rows.length > 0) {
            return res.json(resposta)
        }

        return res.status(404).json({ "mensagem": "Livro não encontrado" })
    } catch (error) {
        return res.status(400).json(error.message)
    }
})


app.listen(3000)