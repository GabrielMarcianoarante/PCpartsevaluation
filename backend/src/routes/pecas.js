const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const prisma = new PrismaClient()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../../frontend/public/uploads')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `produto_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg','image/png','image/webp'].includes(file.mimetype)) cb(null, true)
    else cb(new Error('só jpeg, png ou webp'))
  }
})

// lista produtos aprovados com médias de avaliação
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query
    const where = { status: 'APROVADO' }
    if (categoria) where.cd_categoria = Number(categoria)

    const produtos = await prisma.produto.findMany({
      where,
      include: {
        categoria: true,
        loja: true,
        avaliacoes: { include: { detalhe: true } }
      },
      orderBy: { cd_produto: 'desc' }
    })

    res.json(produtos.map(p => ({ ...p, medias: calcMedias(p.avaliacoes) })))
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// detalhe de um produto
router.get('/:id', async (req, res) => {
  try {
    const produto = await prisma.produto.findUnique({
      where: { cd_produto: Number(req.params.id) },
      include: {
        categoria: true,
        loja: true,
        avaliacoes: {
          include: { cliente: true, detalhe: true },
          orderBy: { data: 'desc' }
        }
      }
    })
    if (!produto) return res.status(404).json({ erro: 'produto não encontrado' })
    res.json({ ...produto, medias: calcMedias(produto.avaliacoes) })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// usuário submete novo produto
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { nome, vl_produto, cd_categoria, cd_cnpj } = req.body
    if (!nome || !vl_produto || !cd_categoria || !cd_cnpj)
      return res.status(400).json({ erro: 'nome, vl_produto, cd_categoria e cd_cnpj são obrigatórios' })

    const fotoUrl = req.file ? `/uploads/${req.file.filename}` : null

    const produto = await prisma.produto.create({
      data: {
        nome,
        vl_produto: parseFloat(vl_produto),
        fotoUrl,
        status: 'PENDENTE',
        cd_categoria: Number(cd_categoria),
        cd_cnpj
      }
    })
    res.status(201).json(produto)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

function calcMedias(avaliacoes) {
  if (!avaliacoes.length) return null
  const comDetalhe = avaliacoes.filter(a => a.detalhe)
  const avg = arr => parseFloat((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(2))
  return {
    nota:           avg(avaliacoes.map(a => a.nota)),
    qualidade:      comDetalhe.length ? avg(comDetalhe.map(a => a.detalhe.qualidade))       : null,
    custo_beneficio:comDetalhe.length ? avg(comDetalhe.map(a => a.detalhe.custo_beneficio)) : null,
    desempenho:     comDetalhe.length ? avg(comDetalhe.map(a => a.detalhe.desempenho))      : null,
    durabilidade:   comDetalhe.length ? avg(comDetalhe.map(a => a.detalhe.durabilidade))    : null,
    total: avaliacoes.length
  }
}

module.exports = router
