const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// lista avaliações de uma peça específica
router.get('/peca/:pecaId', async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { pecaId: Number(req.params.pecaId) },
      orderBy: { criadoEm: 'desc' }
    })

    res.json({ avaliacoes, medias: calcularMedias(avaliacoes), total: avaliacoes.length })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

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

module.exports = router
