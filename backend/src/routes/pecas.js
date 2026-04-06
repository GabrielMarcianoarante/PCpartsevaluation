const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const prisma = new PrismaClient()

// config do multer — salva foto no frontend/public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../../frontend/public/uploads')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `peca_${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
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
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

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
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

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
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

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
}

module.exports = router
