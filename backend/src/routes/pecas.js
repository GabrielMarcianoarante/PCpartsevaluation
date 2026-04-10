const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const prisma = new PrismaClient()

<<<<<<< HEAD
// config do multer — salva foto no frontend/public/uploads
=======
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../../frontend/public/uploads')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
<<<<<<< HEAD
    const ext = path.extname(file.originalname)
    cb(null, `peca_${Date.now()}${ext}`)
=======
    cb(null, `produto_${Date.now()}${path.extname(file.originalname)}`)
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
  }
})

const upload = multer({
  storage,
<<<<<<< HEAD
  limits: { fileSize: 5 * 1024 * 1024 }, // 5mb
  fileFilter: (req, file, cb) => {
    const tipos = ['image/jpeg', 'image/png', 'image/webp']
    if (tipos.includes(file.mimetype)) cb(null, true)
    else cb(new Error('só imagens jpeg, png ou webp'))
  }
})

// lista todas as peças aprovadas com médias calculadas
router.get('/', async (req, res) => {
  try {
    const pecas = await prisma.peca.findMany({
      where: { status: 'APROVADO' },
      include: { avaliacoes: true },
      orderBy: { criadoEm: 'desc' }
    })

    const resultado = pecas.map(p => ({
      ...p,
      medias: calcularMedias(p.avaliacoes),
      totalAvaliacoes: p.avaliacoes.length
    }))

    res.json(resultado)
=======
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
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

<<<<<<< HEAD
// detalhe de uma peça
router.get('/:id', async (req, res) => {
  try {
    const peca = await prisma.peca.findUnique({
      where: { id: Number(req.params.id) },
      include: { avaliacoes: { orderBy: { criadoEm: 'desc' } } }
    })

    if (!peca) return res.status(404).json({ erro: 'peça não encontrada' })

    res.json({
      ...peca,
      medias: calcularMedias(peca.avaliacoes),
      totalAvaliacoes: peca.avaliacoes.length
    })
=======
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
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

<<<<<<< HEAD
// usuário submete nova peça — vai pra pendente
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { nome, marca, categoria, descricao } = req.body

    if (!nome || !marca || !categoria) {
      return res.status(400).json({ erro: 'nome, marca e categoria são obrigatórios' })
    }

    const fotoUrl = req.file ? `/uploads/${req.file.filename}` : null

    const peca = await prisma.peca.create({
      data: {
        nome,
        marca,
        categoria,
        descricao: descricao || null,
        fotoUrl,
        status: 'PENDENTE'
      }
    })

    res.status(201).json(peca)
=======
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
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

<<<<<<< HEAD
// calcula média de cada critério
function calcularMedias(avaliacoes) {
  if (!avaliacoes.length) return null

  const criterios = ['desempenho', 'custoBeneficio', 'compatibilidade', 'durabilidade', 'ruido']
  const medias = {}

  criterios.forEach(c => {
    const soma = avaliacoes.reduce((acc, a) => acc + a[c], 0)
    medias[c] = parseFloat((soma / avaliacoes.length).toFixed(2))
  })

  const geral = Object.values(medias).reduce((a, b) => a + b, 0) / criterios.length
  medias.geral = parseFloat(geral.toFixed(2))

  return medias
=======
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
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
}

module.exports = router
