const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
<<<<<<< HEAD

const prisma = new PrismaClient()

// middleware simples de autenticação do admin
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123'

function autenticarAdmin(req, res, next) {
  const token = req.headers['x-admin-token']
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ erro: 'não autorizado' })
  }
  next()
}

// lista todas as peças pendentes
router.get('/pendentes', autenticarAdmin, async (req, res) => {
  try {
    const pendentes = await prisma.peca.findMany({
      where: { status: 'PENDENTE' },
      orderBy: { criadoEm: 'asc' }
    })
    res.json(pendentes)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// lista todas as peças (qualquer status)
router.get('/pecas', autenticarAdmin, async (req, res) => {
  try {
    const pecas = await prisma.peca.findMany({
      include: { avaliacoes: true },
      orderBy: { criadoEm: 'desc' }
    })
    res.json(pecas)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// aprovar peça
router.patch('/:id/aprovar', autenticarAdmin, async (req, res) => {
  try {
    const peca = await prisma.peca.update({
      where: { id: Number(req.params.id) },
      data: { status: 'APROVADO' }
    })
    res.json(peca)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// rejeitar peça
router.patch('/:id/rejeitar', autenticarAdmin, async (req, res) => {
  try {
    const peca = await prisma.peca.update({
      where: { id: Number(req.params.id) },
      data: { status: 'REJEITADO' }
    })
    res.json(peca)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// deletar peça (admin pode remover qualquer uma)
router.delete('/:id', autenticarAdmin, async (req, res) => {
  try {
    await prisma.peca.delete({ where: { id: Number(req.params.id) } })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
=======
const prisma = new PrismaClient()

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123'

function auth(req, res, next) {
  if (req.headers['x-admin-token'] !== ADMIN_TOKEN)
    return res.status(401).json({ erro: 'não autorizado' })
  next()
}

router.get('/pendentes', auth, async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      where: { status: 'PENDENTE' },
      include: { categoria: true, loja: true },
      orderBy: { cd_produto: 'asc' }
    })
    res.json(produtos)
  } catch (err) { res.status(500).json({ erro: err.message }) }
})

router.get('/produtos', auth, async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      include: { categoria: true, loja: true, avaliacoes: true },
      orderBy: { cd_produto: 'desc' }
    })
    res.json(produtos)
  } catch (err) { res.status(500).json({ erro: err.message }) }
})

router.patch('/:id/aprovar', auth, async (req, res) => {
  try {
    const p = await prisma.produto.update({ where: { cd_produto: Number(req.params.id) }, data: { status: 'APROVADO' } })
    res.json(p)
  } catch (err) { res.status(500).json({ erro: err.message }) }
})

router.patch('/:id/rejeitar', auth, async (req, res) => {
  try {
    const p = await prisma.produto.update({ where: { cd_produto: Number(req.params.id) }, data: { status: 'REJEITADO' } })
    res.json(p)
  } catch (err) { res.status(500).json({ erro: err.message }) }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.produto.delete({ where: { cd_produto: Number(req.params.id) } })
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ erro: err.message }) }
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
})

module.exports = router
