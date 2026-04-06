const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')

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
})

module.exports = router
