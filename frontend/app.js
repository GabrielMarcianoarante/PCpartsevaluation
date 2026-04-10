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
    row.appendChild(s)
  }
})

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
    })
  } catch {}
}

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

function previewFoto(input) {
  const file = input.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    const img = document.getElementById('fp-preview')
    img.src = e.target.result
    img.classList.remove('hidden')
    document.getElementById('fp-upload-text').textContent = file.name
  }
  reader.readAsDataURL(file)
}

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
async function autenticarAdmin() {
  const token = document.getElementById('admin-token').value.trim()
  if (!token) return toast('coloca o token')
  try {
    const res = await fetch(`${API}/admin/pendentes`, { headers: { 'x-admin-token': token } })
    if (!res.ok) return toast('token inválido')
    adminToken = token
    document.getElementById('admin-login').classList.add('hidden')
    document.getElementById('admin-painel').classList.remove('hidden')
    carregarAdmin()
  } catch { toast('erro de conexão') }
}

async function carregarAdmin() {
  await Promise.all([carregarPendentes(), carregarTodos()])
}

async function carregarPendentes() {
  const el = document.getElementById('pendentes-list')
  try {
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
          </div>
        </div>
      </div>`).join('')
  } catch {}
}

async function aprovar(id) {
  await fetch(`${API}/admin/${id}/aprovar`, { method: 'PATCH', headers: { 'x-admin-token': adminToken } })
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
carregarCatalogo()
