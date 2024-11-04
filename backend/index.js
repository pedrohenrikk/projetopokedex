const { v4: uuidv4 } = require('uuid');
const cors = require('cors')
const express = require('express')
const app = express()
const pgp = require('pg-promise')(/* options */)
const db = pgp('postgres://postgres:pedro705@localhost:5432/pokedex')

app.use(cors())
app.use(express.json())

app.post('/usuarios',async (req,res)=>{
    const body=(req.body)
    if (!body.nome){
        return res.status(400).json({erro:"Nome Obrigatório"})
        
    }
    if (!body.senha){
        return res.status(400).json({erro:"Senha Obrigatório"})
    }
    const usuario=await db.oneOrNone("select * from usuarios where nome = $1", [body.nome])
    if (usuario){
        return res.status(409).json({erro:"usuario ja existe"})
    }
    const senhacriptografada= btoa(body.senha)
    await db.none('INSERT INTO usuarios(nome, senha) VALUES($1, $2)', [body.nome, senhacriptografada])
        return res.status(204).send()
    })
  
    app.get('/usuarios/check-login', async (req, res) => {
        const { token } = req.query;
    
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
    
        
        const result = await db.oneOrNone('SELECT * from token where token = $1', [token]);
    
        if (result) {
            
            return res.status(204).send()
        } else {
            return res.status(403).send()
        }
    });   

app.get('/usuarios/login',async (req,res)=>{
    if (!req.query.nome){
        return res.status(400).json({erro:"Nome Obrigatório"})
        
    }
    if (!req.query.senha){
        return res.status(400).json({erro:"Senha Obrigatório"})
    }
    const usuario=await db.oneOrNone("select * from usuarios where nome = $1", [req.query.nome]) 
    if (!usuario){
        return res.status(404).json({erro:"usuario não existe"})
    } 
    if (req.query.senha!=atob(usuario.senha)){
        return res.status(403).json({erro:"senha invalida"})

    }
    const token=uuidv4()
    await db.none('INSERT INTO token(id_usuario, token) VALUES($1, $2)', [usuario.id, token])
    return res.status(200).json({token})    
})

app.listen(3000,()=>{
    console.log("aplicação rodando na porta 3000")

    db.query({text:"CREATE TABLE IF NOT EXISTS usuarios (id SERIAL PRIMARY KEY, nome VARCHAR(256), senha VARCHAR(512))"})
    db.query({text:"CREATE TABLE IF NOT EXISTS token (id SERIAL PRIMARY KEY, id_usuario INTEGER REFERENCES usuarios(id) ON DELETE CASCADE, token VARCHAR(512))"})
})



