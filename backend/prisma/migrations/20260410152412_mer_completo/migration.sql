-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateTable
CREATE TABLE "Cliente" (
    "cd_cliente" SERIAL NOT NULL,
    "cpf" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("cd_cliente")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "cd_categoria" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("cd_categoria")
);

-- CreateTable
CREATE TABLE "Loja" (
    "cd_cnpj" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Loja_pkey" PRIMARY KEY ("cd_cnpj")
);

-- CreateTable
CREATE TABLE "Produto" (
    "cd_produto" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "vl_produto" DECIMAL(10,2) NOT NULL,
    "fotoUrl" TEXT,
    "status" "Status" NOT NULL DEFAULT 'PENDENTE',
    "cd_categoria" INTEGER NOT NULL,
    "cd_cnpj" TEXT NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("cd_produto")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "cd_pedido" SERIAL NOT NULL,
    "vl_total" DECIMAL(10,2) NOT NULL,
    "dt_venda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cd_cliente" INTEGER NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("cd_pedido")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "cd_item" SERIAL NOT NULL,
    "cd_pedido" INTEGER NOT NULL,
    "cd_produto" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valor_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("cd_item")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "cd_avaliacao" SERIAL NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cd_cliente" INTEGER NOT NULL,
    "cd_produto" INTEGER NOT NULL,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("cd_avaliacao")
);

-- CreateTable
CREATE TABLE "AvaliacaoDetalhada" (
    "cd_detalhe" SERIAL NOT NULL,
    "cd_avaliacao" INTEGER NOT NULL,
    "qualidade" INTEGER NOT NULL,
    "custo_beneficio" INTEGER NOT NULL,
    "desempenho" INTEGER NOT NULL,
    "durabilidade" INTEGER NOT NULL,

    CONSTRAINT "AvaliacaoDetalhada_pkey" PRIMARY KEY ("cd_detalhe")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "Cliente"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoDetalhada_cd_avaliacao_key" ON "AvaliacaoDetalhada"("cd_avaliacao");

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_cd_categoria_fkey" FOREIGN KEY ("cd_categoria") REFERENCES "Categoria"("cd_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_cd_cnpj_fkey" FOREIGN KEY ("cd_cnpj") REFERENCES "Loja"("cd_cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_cd_cliente_fkey" FOREIGN KEY ("cd_cliente") REFERENCES "Cliente"("cd_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_cd_pedido_fkey" FOREIGN KEY ("cd_pedido") REFERENCES "Pedido"("cd_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_cd_produto_fkey" FOREIGN KEY ("cd_produto") REFERENCES "Produto"("cd_produto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_cd_cliente_fkey" FOREIGN KEY ("cd_cliente") REFERENCES "Cliente"("cd_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_cd_produto_fkey" FOREIGN KEY ("cd_produto") REFERENCES "Produto"("cd_produto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoDetalhada" ADD CONSTRAINT "AvaliacaoDetalhada_cd_avaliacao_fkey" FOREIGN KEY ("cd_avaliacao") REFERENCES "Avaliacao"("cd_avaliacao") ON DELETE CASCADE ON UPDATE CASCADE;
