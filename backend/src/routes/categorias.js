const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  try {
    const cats = await prisma.categoria.findMany({ orderBy: { nome: 'asc' } })
    res.json(cats)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

module.exports = router
