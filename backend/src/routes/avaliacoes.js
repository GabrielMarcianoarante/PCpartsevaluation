const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

<<<<<<< HEAD
const CRITERIOS = ['desempenho', 'custoBeneficio', 'compatibilidade', 'durabilidade', 'ruido']

// envia avaliação pra uma peça
router.post('/', async (req, res) => {
  try {
    const { pecaId, nomeUsuario, desempenho, custoBeneficio, compatibilidade, durabilidade, ruido, comentario } = req.body

    // valida campos obrigatórios
    if (!pecaId || !nomeUsuario) {
      return res.status(400).json({ erro: 'pecaId e nomeUsuario são obrigatórios' })
    }

    const notas = { desempenho, custoBeneficio, compatibilidade, durabilidade, ruido }

    // valida que todas as notas estão entre 1 e 5
    for (const c of CRITERIOS) {
      const nota = Number(notas[c])
      if (!nota || nota < 1 || nota > 5) {
        return res.status(400).json({ erro: `nota inválida para ${c} — deve ser entre 1 e 5` })
      }
    }

    // só permite avaliação em peça aprovada
    const peca = await prisma.peca.findUnique({ where: { id: Number(pecaId) } })

    if (!peca) return res.status(404).json({ erro: 'peça não encontrada' })
    if (peca.status !== 'APROVADO') return res.status(403).json({ erro: 'peça ainda não aprovada' })

    const avaliacao = await prisma.avaliacao.create({
      data: {
        pecaId: Number(pecaId),
        nomeUsuario,
        desempenho: Number(desempenho),
        custoBeneficio: Number(custoBeneficio),
        compatibilidade: Number(compatibilidade),
        durabilidade: Number(durabilidade),
        ruido: Number(ruido),
        comentario: comentario || null
      }
    })

    // retorna a média atualizada junto
    const todasAvaliacoes = await prisma.avaliacao.findMany({ where: { pecaId: Number(pecaId) } })
    const medias = calcularMedias(todasAvaliacoes)

    res.status(201).json({ avaliacao, medias, totalAvaliacoes: todasAvaliacoes.length })
=======
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
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

<<<<<<< HEAD
// lista avaliações de uma peça específica
router.get('/peca/:pecaId', async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { pecaId: Number(req.params.pecaId) },
      orderBy: { criadoEm: 'desc' }
    })

    res.json({ avaliacoes, medias: calcularMedias(avaliacoes), total: avaliacoes.length })
=======
// GET /api/avaliacoes/produto/:id
router.get('/produto/:id', async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { cd_produto: Number(req.params.id) },
      include: { cliente: true, detalhe: true },
      orderBy: { data: 'desc' }
    })
    res.json(avaliacoes)
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

<<<<<<< HEAD
function calcularMedias(avaliacoes) {
  if (!avaliacoes.length) return null

  const medias = {}
  CRITERIOS.forEach(c => {
    const soma = avaliacoes.reduce((acc, a) => acc + a[c], 0)
    medias[c] = parseFloat((soma / avaliacoes.length).toFixed(2))
  })

  const geral = Object.values(medias).reduce((a, b) => a + b, 0) / CRITERIOS.length
  medias.geral = parseFloat(geral.toFixed(2))

  return medias
}

=======
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
module.exports = router
