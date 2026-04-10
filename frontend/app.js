<<<<<<< HEAD
const API = (window.API_URL || 'http://localhost:3001') + '/api'
let adminToken = ''
const ratings = {}

const LABELS = {
  desempenho: 'Desempenho',
  custoBeneficio: 'Custo-benefício',
  compatibilidade: 'Compatibilidade',
  durabilidade: 'Durabilidade',
  ruido: 'Ruído'
}

// ── navegação ──────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
    btn.classList.add('active')
    document.getElementById('view-' + btn.dataset.view).classList.add('active')
    if (btn.dataset.view === 'catalogo') carregarCatalogo()
    if (btn.dataset.view === 'avaliar') carregarSelectPeca()
    if (btn.dataset.view === 'admin' && adminToken) carregarAdmin()
  })
})

// ── estrelas ───────────────────────────────────────────
document.querySelectorAll('.crit-block').forEach(block => {
  const c = block.dataset.c
  ratings[c] = 0
  const row = block.querySelector('.stars-row')
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement('span')
    s.className = 'star'
    s.textContent = '★'
    s.dataset.val = i
    s.onclick = () => {
      ratings[c] = i
      row.querySelectorAll('.star').forEach((x, idx) => x.classList.toggle('on', idx < i))
    }
=======
const API  = (window.API_URL || 'http://localhost:3001') + '/api'
const BASE = window.API_URL || 'http://localhost:3001'

let adminToken   = ''
let produtoAtual = null
let notaGeral    = 0
const detalhes   = { qualidade: 0, custo_beneficio: 0, desempenho: 0, durabilidade: 0 }

// ── navegação ──────────────────────────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
  document.getElementById(`view-${name}`).classList.add('active')
  document.querySelector(`[data-view="${name}"]`)?.classList.add('active')
  const hero = document.getElementById('hero')
  hero.style.display = name === 'catalogo' ? '' : 'none'
  if (name === 'submeter') carregarSelectores()
  if (name === 'admin' && adminToken) carregarAdmin()
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view))
})

// ── stars grandes (nota geral) ─────────────────────────────────
const bigStars = document.getElementById('big-stars')
for (let i = 1; i <= 5; i++) {
  const s = document.createElement('span')
  s.className = 'bstar'
  s.textContent = '★'
  s.addEventListener('click', () => {
    notaGeral = i
    bigStars.querySelectorAll('.bstar').forEach((b, idx) => b.classList.toggle('lit', idx < i))
  })
  bigStars.appendChild(s)
}

// ── stars de detalhe ──────────────────────────────────────────
document.querySelectorAll('.detail-item').forEach(item => {
  const crit = item.dataset.crit
  const row  = item.querySelector('.mini-stars')
  const val  = item.querySelector('.detail-val')
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement('span')
    s.className = 'mstar'
    s.textContent = '★'
    s.addEventListener('click', () => {
      detalhes[crit] = i
      val.textContent = i
      row.querySelectorAll('.mstar').forEach((b, idx) => b.classList.toggle('lit', idx < i))
    })
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
    row.appendChild(s)
  }
})

<<<<<<< HEAD
// ── catálogo ───────────────────────────────────────────
async function carregarCatalogo() {
  const el = document.getElementById('catalogo-grid')
  el.innerHTML = '<div class="empty-state">carregando...</div>'
  try {
    const res = await fetch(API + '/pecas')
    const pecas = await res.json()
    if (!pecas.length) {
      el.innerHTML = '<div class="empty-state">nenhuma peça no catálogo ainda</div>'
      return
    }
    el.innerHTML = pecas.map(renderCard).join('')
  } catch {
    el.innerHTML = '<div class="empty-state">erro ao carregar — backend está rodando?</div>'
  }
}

function renderCard(p) {
  const m = p.medias
  const baseUrl = (window.API_URL || 'http://localhost:3001')
  const foto = p.fotoUrl
    ? `<img class="card-foto" src="${baseUrl}${p.fotoUrl}" alt="${p.nome}">`
    : `<div class="card-nofoto">sem foto</div>`

  const bars = m ? Object.entries(LABELS).map(([key, label]) => `
    <div class="bar-row">
      <span class="bar-label">${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(m[key]/5)*100}%"></div></div>
      <span class="bar-val">${m[key].toFixed(1)}</span>
    </div>`).join('') : '<span style="font-family:var(--mono);font-size:10px;color:var(--dim)">sem avaliações ainda</span>'

  return `<div class="card">
    <div class="card-top">
      <div>
        <div class="card-nome">${p.nome}</div>
        <div class="card-meta">${p.marca} &middot; ${p.categoria}</div>
      </div>
      ${m ? `<div class="card-score"><div class="card-score-num">${m.geral.toFixed(1)}</div><div class="card-score-label">/ 5.0</div></div>` : ''}
    </div>
    ${foto}
    <div class="bars">${bars}</div>
    <div class="card-footer">${p.totalAvaliacoes} avaliação${p.totalAvaliacoes !== 1 ? 'ões' : ''}</div>
  </div>`
}

// ── select de peças ────────────────────────────────────
async function carregarSelectPeca() {
  const sel = document.getElementById('select-peca')
  sel.innerHTML = '<option value="">— selecione —</option>'
  document.getElementById('form-avaliar').classList.add('hidden')
  try {
    const res = await fetch(API + '/pecas')
    const pecas = await res.json()
    pecas.forEach(p => {
      const o = document.createElement('option')
      o.value = p.id
      o.textContent = `${p.nome} (${p.categoria})`
      sel.appendChild(o)
=======
// ── carrega estatísticas do hero ───────────────────────────────
async function carregarStats() {
  try {
    const [prods, cats] = await Promise.all([
      fetch(`${API}/produtos`).then(r => r.json()),
      fetch(`${API}/categorias`).then(r => r.json())
    ])
    const totalAv = prods.reduce((acc, p) => acc + (p.medias?.total || 0), 0)
    document.getElementById('stat-produtos').textContent   = prods.length
    document.getElementById('stat-avaliacoes').textContent = totalAv
    document.getElementById('stat-categorias').textContent = cats.length
  } catch {}
}

// ── filtros ───────────────────────────────────────────────────
let categorias = []
let filtroAtivo = null

async function carregarFiltros() {
  try {
    categorias = await fetch(`${API}/categorias`).then(r => r.json())
    const el = document.getElementById('filtros')
    el.innerHTML = ''
    const btnTodos = document.createElement('button')
    btnTodos.className = 'filtro-btn active'
    btnTodos.textContent = 'Todos'
    btnTodos.addEventListener('click', () => { filtroAtivo = null; setFiltroAtivo(btnTodos); carregarCatalogo() })
    el.appendChild(btnTodos)
    categorias.forEach(c => {
      const btn = document.createElement('button')
      btn.className = 'filtro-btn'
      btn.textContent = c.nome
      btn.addEventListener('click', () => { filtroAtivo = c.cd_categoria; setFiltroAtivo(btn); carregarCatalogo() })
      el.appendChild(btn)
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
    })
  } catch {}
}

<<<<<<< HEAD
document.getElementById('select-peca').addEventListener('change', function () {
  document.getElementById('form-avaliar').classList.toggle('hidden', !this.value)
})

// ── enviar avaliação ───────────────────────────────────
async function enviarAvaliacao() {
  const pecaId = document.getElementById('select-peca').value
  const nomeUsuario = document.getElementById('av-nome').value.trim()
  if (!pecaId) return toast('selecione uma peça')
  if (!nomeUsuario) return toast('coloca seu nome')
  for (const c of Object.keys(LABELS)) {
    if (!ratings[c]) return toast(`avalie: ${LABELS[c]}`)
  }
  try {
    const res = await fetch(API + '/avaliacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pecaId, nomeUsuario, comentario: document.getElementById('av-comentario').value, ...ratings })
    })
    const data = await res.json()
    if (!res.ok) return toast(data.erro || 'erro ao enviar')
    toast('avaliação enviada!')
    document.getElementById('av-nome').value = ''
    document.getElementById('av-comentario').value = ''
    document.getElementById('select-peca').value = ''
    document.getElementById('form-avaliar').classList.add('hidden')
    Object.keys(LABELS).forEach(c => {
      ratings[c] = 0
      document.querySelector(`.crit-block[data-c="${c}"] .stars-row`)
        .querySelectorAll('.star').forEach(s => s.classList.remove('on'))
    })
  } catch { toast('erro de conexão') }
}

// ── submeter peça ──────────────────────────────────────
=======
function setFiltroAtivo(btn) {
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
}

// ── catálogo ──────────────────────────────────────────────────
async function carregarCatalogo() {
  const grid = document.getElementById('catalogo-grid')
  grid.innerHTML = '<div class="empty-state">carregando...</div>'
  try {
    const url = filtroAtivo ? `${API}/produtos?categoria=${filtroAtivo}` : `${API}/produtos`
    const produtos = await fetch(url).then(r => r.json())
    if (!produtos.length) {
      grid.innerHTML = '<div class="empty-state">nenhum produto encontrado</div>'
      return
    }
    grid.innerHTML = produtos.map(renderCard).join('')
  } catch {
    grid.innerHTML = '<div class="empty-state">erro ao carregar — backend rodando?</div>'
  }
}

function starsStr(nota) {
  const n = Math.round(nota || 0)
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function renderCard(p) {
  const m = p.medias
  const foto = p.fotoUrl
    ? `<img class="prod-foto" src="${BASE}${p.fotoUrl}" alt="${p.nome}">`
    : `<div class="prod-foto-empty">sem imagem</div>`

  const critLabels = { qualidade: 'Qualidade', custo_beneficio: 'Custo-benef.', desempenho: 'Desempenho', durabilidade: 'Durabilidade' }
  const barras = m
    ? `<div class="crit-bars">${Object.entries(critLabels).map(([k, l]) => m[k] != null ? `
        <div class="crit-bar-row">
          <span class="cbar-label">${l}</span>
          <div class="cbar-track"><div class="cbar-fill" style="width:${(m[k]/5*100).toFixed(0)}%"></div></div>
          <span class="cbar-val">${m[k].toFixed(1)}</span>
        </div>` : '').join('')}</div>`
    : ''

  const rating = m
    ? `<div class="prod-rating-row">
        <span class="star-display">${starsStr(m.nota)}</span>
        <span class="rating-num">${m.nota.toFixed(1)}</span>
        <span class="rating-count">(${m.total})</span>
      </div>`
    : `<div class="sem-av">sem avaliações</div>`

  return `
    <div class="prod-card" onclick="abrirModal(${p.cd_produto}, '${p.nome.replace(/'/g,"\\'")}')">
      ${foto}
      <div>
        <div class="prod-cat">${p.categoria?.nome || ''}</div>
        <div class="prod-nome">${p.nome}</div>
        <div class="prod-loja">${p.loja?.nome || ''}</div>
      </div>
      ${barras}
      <div class="prod-card-footer">
        <div>
          <div class="prod-price">R$ ${Number(p.vl_produto).toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
          ${rating}
        </div>
        <button class="btn-avaliar" onclick="event.stopPropagation();abrirModal(${p.cd_produto}, '${p.nome.replace(/'/g,"\\'")}')">Avaliar</button>
      </div>
    </div>`
}

// ── modal de avaliação ────────────────────────────────────────
function abrirModal(id, nome) {
  produtoAtual = id
  notaGeral = 0
  Object.keys(detalhes).forEach(k => detalhes[k] = 0)
  document.getElementById('modal-produto-nome').textContent = nome
  document.getElementById('av-nome').value = ''
  document.getElementById('av-email').value = ''
  document.getElementById('av-comentario').value = ''
  document.querySelectorAll('.bstar').forEach(s => s.classList.remove('lit'))
  document.querySelectorAll('.mstar').forEach(s => s.classList.remove('lit'))
  document.querySelectorAll('.detail-val').forEach(v => v.textContent = '—')
  document.getElementById('modal-overlay').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

function fecharModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay')) return
  document.getElementById('modal-overlay').classList.add('hidden')
  document.body.style.overflow = ''
}

async function enviarAvaliacao() {
  const nome  = document.getElementById('av-nome').value.trim()
  const email = document.getElementById('av-email').value.trim()
  if (!nome)      return toast('coloca seu nome')
  if (!email)     return toast('coloca seu e-mail')
  if (!notaGeral) return toast('seleciona a nota geral')

  const body = {
    cd_produto: produtoAtual, nome_cliente: nome, email_cliente: email,
    nota: notaGeral, comentario: document.getElementById('av-comentario').value,
    ...detalhes
  }

  try {
    const res  = await fetch(`${API}/avaliacoes`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) return toast(data.erro || 'erro ao enviar')
    fecharModal()
    toast('avaliação publicada!')
    carregarCatalogo()
    carregarStats()
  } catch {
    toast('erro de conexão')
  }
}

// ── submeter produto ──────────────────────────────────────────
async function carregarSelectores() {
  try {
    const [cats, lojas] = await Promise.all([
      fetch(`${API}/categorias`).then(r => r.json()),
      fetch(`${API}/lojas`).then(r => r.json())
    ])
    const selCat = document.getElementById('sub-categoria')
    selCat.innerHTML = cats.map(c => `<option value="${c.cd_categoria}">${c.nome}</option>`).join('')
    const selLoja = document.getElementById('sub-loja')
    selLoja.innerHTML = lojas.map(l => `<option value="${l.cd_cnpj}">${l.nome}</option>`).join('')
  } catch {}
}

>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
function previewFoto(input) {
  const file = input.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
<<<<<<< HEAD
    const img = document.getElementById('foto-preview')
    img.src = e.target.result
    img.classList.remove('hidden')
    document.getElementById('drop-inner').classList.add('hidden')
=======
    const img = document.getElementById('fp-preview')
    img.src = e.target.result
    img.classList.remove('hidden')
    document.getElementById('fp-upload-text').textContent = file.name
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
  }
  reader.readAsDataURL(file)
}

<<<<<<< HEAD
async function submeterPeca() {
  const nome = document.getElementById('sub-nome').value.trim()
  const marca = document.getElementById('sub-marca').value.trim()
  const categoria = document.getElementById('sub-categoria').value
  const descricao = document.getElementById('sub-descricao').value.trim()
  const fotoInput = document.getElementById('sub-foto')
  if (!nome || !marca) return toast('preenche nome e marca')
  const fd = new FormData()
  fd.append('nome', nome)
  fd.append('marca', marca)
  fd.append('categoria', categoria)
  if (descricao) fd.append('descricao', descricao)
  if (fotoInput.files[0]) fd.append('foto', fotoInput.files[0])
  try {
    const res = await fetch(API + '/pecas', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) return toast(data.erro || 'erro')
    toast('peça enviada para aprovação!')
    document.getElementById('sub-nome').value = ''
    document.getElementById('sub-marca').value = ''
    document.getElementById('sub-descricao').value = ''
    fotoInput.value = ''
    document.getElementById('foto-preview').classList.add('hidden')
    document.getElementById('drop-inner').classList.remove('hidden')
  } catch { toast('erro de conexão') }
}

// ── admin ──────────────────────────────────────────────
=======
async function submeterProduto() {
  const nome   = document.getElementById('sub-nome').value.trim()
  const preco  = document.getElementById('sub-preco').value
  const cat    = document.getElementById('sub-categoria').value
  const loja   = document.getElementById('sub-loja').value
  if (!nome || !preco) return toast('preenche nome e preço')

  const fd = new FormData()
  fd.append('nome', nome)
  fd.append('vl_produto', preco)
  fd.append('cd_categoria', cat)
  fd.append('cd_cnpj', loja)
  const foto = document.getElementById('sub-foto').files[0]
  if (foto) fd.append('foto', foto)

  try {
    const res  = await fetch(`${API}/produtos`, { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) return toast(data.erro || 'erro ao submeter')
    toast('enviado para aprovação!')
    document.getElementById('sub-nome').value = ''
    document.getElementById('sub-preco').value = ''
    document.getElementById('sub-foto').value = ''
    document.getElementById('fp-preview').classList.add('hidden')
    document.getElementById('fp-upload-text').textContent = 'clique para selecionar imagem'
  } catch { toast('erro de conexão') }
}

// ── admin ─────────────────────────────────────────────────────
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
async function autenticarAdmin() {
  const token = document.getElementById('admin-token').value.trim()
  if (!token) return toast('coloca o token')
  try {
<<<<<<< HEAD
    const res = await fetch(API + '/admin/pendentes', { headers: { 'x-admin-token': token } })
=======
    const res = await fetch(`${API}/admin/pendentes`, { headers: { 'x-admin-token': token } })
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
    if (!res.ok) return toast('token inválido')
    adminToken = token
    document.getElementById('admin-login').classList.add('hidden')
    document.getElementById('admin-painel').classList.remove('hidden')
    carregarAdmin()
  } catch { toast('erro de conexão') }
}

async function carregarAdmin() {
<<<<<<< HEAD
  await Promise.all([carregarPendentes(), carregarTodas()])
=======
  await Promise.all([carregarPendentes(), carregarTodos()])
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
}

async function carregarPendentes() {
  const el = document.getElementById('pendentes-list')
  try {
<<<<<<< HEAD
    const res = await fetch(API + '/admin/pendentes', { headers: { 'x-admin-token': adminToken } })
    const list = await res.json()
    document.getElementById('badge-pendentes').textContent = list.length
    if (!list.length) { el.innerHTML = '<div class="empty-state">nenhuma pendente</div>'; return }
    const baseUrl = (window.API_URL || 'http://localhost:3001')
    el.innerHTML = list.map(p => `
      <div class="admin-row">
        ${p.fotoUrl ? `<img class="admin-foto" src="${baseUrl}${p.fotoUrl}">` : '<div class="admin-nofoto">sem foto</div>'}
        <div class="admin-info">
          <div class="admin-nome">${p.nome}</div>
          <div class="admin-meta">${p.marca} &middot; ${p.categoria}</div>
          ${p.descricao ? `<div class="admin-desc">${p.descricao}</div>` : ''}
          <div class="admin-actions">
            <button class="btn-ghost ok" onclick="aprovar(${p.id})">Aprovar</button>
            <button class="btn-ghost danger" onclick="rejeitar(${p.id})">Rejeitar</button>
          </div>
        </div>
      </div>`).join('')
  } catch { el.innerHTML = '<div class="empty-state">erro ao carregar</div>' }
}

async function carregarTodas() {
  const el = document.getElementById('todas-list')
  try {
    const res = await fetch(API + '/admin/pecas', { headers: { 'x-admin-token': adminToken } })
    const list = await res.json()
    const baseUrl = (window.API_URL || 'http://localhost:3001')
    el.innerHTML = list.map(p => `
      <div class="admin-row">
        ${p.fotoUrl ? `<img class="admin-foto" src="${baseUrl}${p.fotoUrl}">` : '<div class="admin-nofoto">sem foto</div>'}
        <div class="admin-info">
          <div style="display:flex;align-items:center;gap:10px">
            <span class="admin-nome">${p.nome}</span>
            <span class="pill pill-${p.status.toLowerCase()}">${p.status.toLowerCase()}</span>
          </div>
          <div class="admin-meta">${p.marca} &middot; ${p.categoria} &middot; ${p.avaliacoes.length} avaliações</div>
          <div class="admin-actions">
            <button class="btn-ghost danger" onclick="deletar(${p.id})">Remover</button>
=======
    const lista = await fetch(`${API}/admin/pendentes`, { headers: { 'x-admin-token': adminToken } }).then(r => r.json())
    document.getElementById('badge-pend').textContent = lista.length
    if (!lista.length) { el.innerHTML = '<div style="padding:2rem;font-family:var(--mono);font-size:11px;color:var(--ink3);border:1px solid var(--line)">nenhum produto pendente</div>'; return }
    el.innerHTML = lista.map(p => `
      <div class="acard">
        ${p.fotoUrl ? `<img class="acard-thumb" src="${BASE}${p.fotoUrl}">` : `<div class="acard-thumb-empty">sem foto</div>`}
        <div class="acard-body">
          <div class="acard-nome">${p.nome}</div>
          <div class="acard-meta">${p.categoria?.nome} · ${p.loja?.nome} · R$ ${Number(p.vl_produto).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
          <div class="acard-actions">
            <button class="abtn abtn-approve" onclick="aprovar(${p.cd_produto})">Aprovar</button>
            <button class="abtn abtn-reject"  onclick="rejeitar(${p.cd_produto})">Rejeitar</button>
          </div>
        </div>
      </div>`).join('')
  } catch {}
}

async function carregarTodos() {
  const el = document.getElementById('todos-list')
  try {
    const lista = await fetch(`${API}/admin/produtos`, { headers: { 'x-admin-token': adminToken } }).then(r => r.json())
    el.innerHTML = lista.map(p => `
      <div class="acard">
        ${p.fotoUrl ? `<img class="acard-thumb" src="${BASE}${p.fotoUrl}">` : `<div class="acard-thumb-empty">sem foto</div>`}
        <div class="acard-body">
          <div class="acard-info">
            <span class="acard-nome">${p.nome}</span>
            <span class="stag stag-${p.status}">${p.status.toLowerCase()}</span>
          </div>
          <div class="acard-meta">${p.categoria?.nome} · ${p.loja?.nome} · ${p.avaliacoes.length} avaliações</div>
          <div class="acard-actions">
            <button class="abtn abtn-del" onclick="deletar(${p.cd_produto})">Remover</button>
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
          </div>
        </div>
      </div>`).join('')
  } catch {}
}

async function aprovar(id) {
  await fetch(`${API}/admin/${id}/aprovar`, { method: 'PATCH', headers: { 'x-admin-token': adminToken } })
<<<<<<< HEAD
  toast('peça aprovada')
  carregarAdmin()
}
async function rejeitar(id) {
  await fetch(`${API}/admin/${id}/rejeitar`, { method: 'PATCH', headers: { 'x-admin-token': adminToken } })
  toast('peça rejeitada')
  carregarAdmin()
}
async function deletar(id) {
  if (!confirm('remover essa peça?')) return
  await fetch(`${API}/admin/${id}`, { method: 'DELETE', headers: { 'x-admin-token': adminToken } })
  toast('removida')
  carregarAdmin()
}

function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'))
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'))
  btn.classList.add('active')
  document.getElementById('tab-' + name).classList.add('active')
}

// ── toast ──────────────────────────────────────────────
function toast(msg) {
  const el = document.getElementById('toast')
  el.textContent = msg
  el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 2800)
}

=======
  toast('produto aprovado'); carregarAdmin()
}

async function rejeitar(id) {
  await fetch(`${API}/admin/${id}/rejeitar`, { method: 'PATCH', headers: { 'x-admin-token': adminToken } })
  toast('produto rejeitado'); carregarAdmin()
}

async function deletar(id) {
  if (!confirm('remover este produto permanentemente?')) return
  await fetch(`${API}/admin/${id}`, { method: 'DELETE', headers: { 'x-admin-token': adminToken } })
  toast('removido'); carregarAdmin()
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.atab').forEach(b => b.classList.remove('active'))
  document.querySelectorAll('.atab-pane').forEach(p => { p.classList.remove('active'); p.classList.add('hidden') })
  btn.classList.add('active')
  const pane = document.getElementById(`atab-${tab}`)
  pane.classList.remove('hidden'); pane.classList.add('active')
}

// ── toast ─────────────────────────────────────────────────────
function toast(msg) {
  const el = document.getElementById('toast')
  el.textContent = msg; el.classList.add('show')
  clearTimeout(el._t)
  el._t = setTimeout(() => el.classList.remove('show'), 3000)
}

// ── init ──────────────────────────────────────────────────────
carregarStats()
carregarFiltros()
>>>>>>> 0a406f2 (melhoria e implementação do mer novo)
carregarCatalogo()
