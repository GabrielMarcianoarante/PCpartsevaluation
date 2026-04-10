const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
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
})

module.exports = router
