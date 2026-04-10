require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../../frontend/public/uploads')))

app.use('/api/produtos',    require('./routes/pecas'))
app.use('/api/avaliacoes',  require('./routes/avaliacoes'))
app.use('/api/categorias',  require('./routes/categorias'))
app.use('/api/lojas',       require('./routes/lojas'))
app.use('/api/admin',       require('./routes/admin'))
app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`servidor em http://localhost:${PORT}`))
