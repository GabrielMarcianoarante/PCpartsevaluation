const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// POST /api/avaliacoes — envia avaliação com detalhe
router.post('/', async (req, res) => {
  try {
    const { cd_produto, nome_cliente, email_cliente, nota, comentario, qualidade, custo_beneficio, desempenho, durabilidade } = req.body

    if (!cd_produto || !nome_cliente || !email_cliente || !nota)
      return res.status(400).json({ erro: 'cd_produto, nome_cliente, email_cliente e nota são obrigatórios' })

    const notaNum = Number(nota)
    if (notaNum < 1 || notaNum > 5)
      return res.status(400).json({ erro: 'nota deve ser entre 1 e 5' })

    const produto = await prisma.produto.findUnique({ where: { cd_produto: Number(cd_produto) } })
    if (!produto) return res.status(404).json({ erro: 'produto não encontrado' })
    if (produto.status !== 'APROVADO') return res.status(403).json({ erro: 'produto não aprovado' })

    // busca ou cria cliente pelo email
    let cliente = await prisma.cliente.findUnique({ where: { email: email_cliente } })
    if (!cliente) {
      const cpfFicticio = `${Date.now()}`.slice(-11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      cliente = await prisma.cliente.create({
        data: { nome: nome_cliente, email: email_cliente, cpf: cpfFicticio }
      })
    }

    const detalhes = [qualidade, custo_beneficio, desempenho, durabilidade]
    const temDetalhes = detalhes.every(v => v && Number(v) >= 1 && Number(v) <= 5)

    const avaliacao = await prisma.avaliacao.create({
      data: {
        nota: notaNum,
        comentario: comentario || null,
        cd_cliente: cliente.cd_cliente,
        cd_produto: Number(cd_produto),
        ...(temDetalhes ? {
          detalhe: {
            create: {
              qualidade:       Number(qualidade),
              custo_beneficio: Number(custo_beneficio),
              desempenho:      Number(desempenho),
              durabilidade:    Number(durabilidade)
            }
          }
        } : {})
      },
      include: { detalhe: true }
    })

    // retorna média atualizada
    const todas = await prisma.avaliacao.findMany({ where: { cd_produto: Number(cd_produto) }, include: { detalhe: true } })
    const avg = arr => parseFloat((arr.reduce((s,v)=>s+v,0)/arr.length).toFixed(2))
    const comDet = todas.filter(a => a.detalhe)

    res.status(201).json({
      avaliacao,
      medias: {
        nota:            avg(todas.map(a=>a.nota)),
        qualidade:       comDet.length ? avg(comDet.map(a=>a.detalhe.qualidade))       : null,
        custo_beneficio: comDet.length ? avg(comDet.map(a=>a.detalhe.custo_beneficio)) : null,
        desempenho:      comDet.length ? avg(comDet.map(a=>a.detalhe.desempenho))      : null,
        durabilidade:    comDet.length ? avg(comDet.map(a=>a.detalhe.durabilidade))    : null,
        total: todas.length
      }
    })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// GET /api/avaliacoes/produto/:id
router.get('/produto/:id', async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { cd_produto: Number(req.params.id) },
      include: { cliente: true, detalhe: true },
      orderBy: { data: 'desc' }
    })
    res.json(avaliacoes)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

module.exports = router
