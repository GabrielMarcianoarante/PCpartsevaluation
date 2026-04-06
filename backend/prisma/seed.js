const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('populando banco...')

  // limpa tudo antes
  await prisma.avaliacao.deleteMany()
  await prisma.peca.deleteMany()

  const rtx = await prisma.peca.create({
    data: {
      nome: 'RTX 4080 Super',
      marca: 'NVIDIA',
      categoria: 'GPU',
      descricao: '16GB GDDR6X, excelente para 4K gaming',
      status: 'APROVADO',
      avaliacoes: {
        create: [
          { nomeUsuario: 'Lucas', desempenho: 5, custoBeneficio: 3, compatibilidade: 5, durabilidade: 5, ruido: 4, comentario: 'Melhor GPU que já usei, vale cada centavo' },
          { nomeUsuario: 'Ana', desempenho: 5, custoBeneficio: 2, compatibilidade: 4, durabilidade: 5, ruido: 3, comentario: 'Cara mas entrega demais' }
        ]
      }
    }
  })

  const ryzen = await prisma.peca.create({
    data: {
      nome: 'Ryzen 7 7800X3D',
      marca: 'AMD',
      categoria: 'CPU',
      descricao: 'Melhor CPU para games com 3D V-Cache',
      status: 'APROVADO',
      avaliacoes: {
        create: [
          { nomeUsuario: 'Pedro', desempenho: 5, custoBeneficio: 4, compatibilidade: 4, durabilidade: 5, ruido: 5, comentario: 'Absurdo para jogos, temperatura ótima' },
          { nomeUsuario: 'Carla', desempenho: 4, custoBeneficio: 4, compatibilidade: 5, durabilidade: 5, ruido: 5, comentario: 'Silencioso e rápido' }
        ]
      }
    }
  })

  await prisma.peca.create({
    data: {
      nome: 'Kingston Fury Beast 32GB DDR5',
      marca: 'Kingston',
      categoria: 'RAM',
      descricao: '32GB kit 6000MHz CL36',
      status: 'PENDENTE'
    }
  })

  console.log('banco populado com sucesso!')
  console.log(`RTX 4080 Super: id ${rtx.id}`)
  console.log(`Ryzen 7 7800X3D: id ${ryzen.id}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
