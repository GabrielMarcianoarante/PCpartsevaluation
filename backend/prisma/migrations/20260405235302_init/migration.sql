-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateTable
CREATE TABLE "Peca" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "fotoUrl" TEXT,
    "status" "Status" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Peca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" SERIAL NOT NULL,
    "pecaId" INTEGER NOT NULL,
    "nomeUsuario" TEXT NOT NULL,
    "desempenho" INTEGER NOT NULL,
    "custoBeneficio" INTEGER NOT NULL,
    "compatibilidade" INTEGER NOT NULL,
    "durabilidade" INTEGER NOT NULL,
    "ruido" INTEGER NOT NULL,
    "comentario" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_pecaId_fkey" FOREIGN KEY ("pecaId") REFERENCES "Peca"("id") ON DELETE CASCADE ON UPDATE CASCADE;
