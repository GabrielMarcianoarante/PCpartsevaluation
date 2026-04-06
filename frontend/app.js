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
    row.appendChild(s)
  }
})

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
    })
  } catch {}
}

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
function previewFoto(input) {
  const file = input.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    const img = document.getElementById('foto-preview')
    img.src = e.target.result
    img.classList.remove('hidden')
    document.getElementById('drop-inner').classList.add('hidden')
  }
  reader.readAsDataURL(file)
}

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
async function autenticarAdmin() {
  const token = document.getElementById('admin-token').value.trim()
  if (!token) return toast('coloca o token')
  try {
    const res = await fetch(API + '/admin/pendentes', { headers: { 'x-admin-token': token } })
    if (!res.ok) return toast('token inválido')
    adminToken = token
    document.getElementById('admin-login').classList.add('hidden')
    document.getElementById('admin-painel').classList.remove('hidden')
    carregarAdmin()
  } catch { toast('erro de conexão') }
}

async function carregarAdmin() {
  await Promise.all([carregarPendentes(), carregarTodas()])
}

async function carregarPendentes() {
  const el = document.getElementById('pendentes-list')
  try {
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
          </div>
        </div>
      </div>`).join('')
  } catch {}
}

async function aprovar(id) {
  await fetch(`${API}/admin/${id}/aprovar`, { method: 'PATCH', headers: { 'x-admin-token': adminToken } })
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

carregarCatalogo()
