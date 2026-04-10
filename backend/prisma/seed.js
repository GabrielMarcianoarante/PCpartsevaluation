const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
<<<<<<< HEAD
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
=======
  console.log('limpando banco...')
  await prisma.avaliacaoDetalhada.deleteMany()
  await prisma.avaliacao.deleteMany()
  await prisma.itemPedido.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.produto.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.loja.deleteMany()
  await prisma.cliente.deleteMany()

  // lojas
  const loja1 = await prisma.loja.create({ data: { cd_cnpj: '11222333000181', nome: 'TechZone Hardware' } })
  const loja2 = await prisma.loja.create({ data: { cd_cnpj: '44555666000172', nome: 'PCMaster Store' } })

  // categorias
  const gpu  = await prisma.categoria.create({ data: { nome: 'GPU' } })
  const cpu  = await prisma.categoria.create({ data: { nome: 'CPU' } })
  const ram  = await prisma.categoria.create({ data: { nome: 'RAM' } })
  const ssd  = await prisma.categoria.create({ data: { nome: 'SSD' } })

  // produtos
  const rtx = await prisma.produto.create({ data: { nome: 'RTX 4080 Super', vl_produto: 5499.90, status: 'APROVADO', cd_categoria: gpu.cd_categoria, cd_cnpj: loja1.cd_cnpj } })
  const rx  = await prisma.produto.create({ data: { nome: 'RX 7900 XTX', vl_produto: 4799.90, status: 'APROVADO', cd_categoria: gpu.cd_categoria, cd_cnpj: loja2.cd_cnpj } })
  const r7  = await prisma.produto.create({ data: { nome: 'Ryzen 7 7800X3D', vl_produto: 2199.90, status: 'APROVADO', cd_categoria: cpu.cd_categoria, cd_cnpj: loja1.cd_cnpj } })
  const kf  = await prisma.produto.create({ data: { nome: 'Kingston Fury 32GB DDR5', vl_produto: 699.90, status: 'APROVADO', cd_categoria: ram.cd_categoria, cd_cnpj: loja2.cd_cnpj } })
  await prisma.produto.create({ data: { nome: 'Samsung 990 Pro 2TB', vl_produto: 899.90, status: 'PENDENTE', cd_categoria: ssd.cd_categoria, cd_cnpj: loja1.cd_cnpj } })

  // clientes
  const c1 = await prisma.cliente.create({ data: { cpf: '111.222.333-44', nome: 'Lucas Mendes', email: 'lucas@email.com', telefone: '(61) 99999-1111' } })
  const c2 = await prisma.cliente.create({ data: { cpf: '555.666.777-88', nome: 'Ana Ferreira', email: 'ana@email.com', telefone: '(61) 99999-2222' } })
  const c3 = await prisma.cliente.create({ data: { cpf: '999.000.111-22', nome: 'Pedro Costa', email: 'pedro@email.com' } })

  // pedidos fictícios
  const p1 = await prisma.pedido.create({ data: { vl_total: 7699.80, cd_cliente: c1.cd_cliente, itens: { create: [{ cd_produto: rtx.cd_produto, quantidade: 1, valor_unitario: 5499.90 }, { cd_produto: r7.cd_produto, quantidade: 1, valor_unitario: 2199.90 }] } } })
  const p2 = await prisma.pedido.create({ data: { vl_total: 5499.80, cd_cliente: c2.cd_cliente, itens: { create: [{ cd_produto: rx.cd_produto, quantidade: 1, valor_unitario: 4799.90 }, { cd_produto: kf.cd_produto, quantidade: 1, valor_unitario: 699.90 }] } } })

  // avaliações com detalhe
  const av1 = await prisma.avaliacao.create({ data: { nota: 5, comentario: 'Melhor GPU que já usei, entrega demais em 4K', cd_cliente: c1.cd_cliente, cd_produto: rtx.cd_produto, detalhe: { create: { qualidade: 5, custo_beneficio: 4, desempenho: 5, durabilidade: 5 } } } })
  const av2 = await prisma.avaliacao.create({ data: { nota: 4, comentario: 'Cara mas vale cada centavo', cd_cliente: c2.cd_cliente, cd_produto: rtx.cd_produto, detalhe: { create: { qualidade: 5, custo_beneficio: 3, desempenho: 5, durabilidade: 4 } } } })
  const av3 = await prisma.avaliacao.create({ data: { nota: 5, comentario: 'Absurdo para jogos, temperatura ótima', cd_cliente: c3.cd_cliente, cd_produto: r7.cd_produto, detalhe: { create: { qualidade: 5, custo_beneficio: 5, desempenho: 5, durabilidade: 5 } } } })
  const av4 = await prisma.avaliacao.create({ data: { nota: 4, comentario: 'Custo-benefício excelente', cd_cliente: c1.cd_cliente, cd_produto: kf.cd_produto, detalhe: { create: { qualidade: 4, custo_beneficio: 5, desempenho: 4, durabilidade: 4 } } } })

  console.log('banco populado com sucesso!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
