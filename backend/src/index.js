require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const pecasRouter = require('./routes/pecas')
const avaliacoesRouter = require('./routes/avaliacoes')
const adminRouter = require('./routes/admin')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// serve as fotos enviadas
app.use('/uploads', express.static(path.join(__dirname, '../../frontend/public/uploads')))

// rotas
app.use('/api/pecas', pecasRouter)
app.use('/api/avaliacoes', avaliacoesRouter)
app.use('/api/admin', adminRouter)

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`servidor rodando em http://localhost:${PORT}`)
})
