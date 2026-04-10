require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

<<<<<<< HEAD
const pecasRouter = require('./routes/pecas')
const avaliacoesRouter = require('./routes/avaliacoes')
const adminRouter = require('./routes/admin')

=======
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
<<<<<<< HEAD

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
=======
app.use('/uploads', express.static(path.join(__dirname, '../../frontend/public/uploads')))

app.use('/api/produtos',    require('./routes/pecas'))
app.use('/api/avaliacoes',  require('./routes/avaliacoes'))
app.use('/api/categorias',  require('./routes/categorias'))
app.use('/api/lojas',       require('./routes/lojas'))
app.use('/api/admin',       require('./routes/admin'))
app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`servidor em http://localhost:${PORT}`))
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
