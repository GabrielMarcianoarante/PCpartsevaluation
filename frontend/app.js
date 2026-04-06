const API = (window.API_URL || 'http://localhost:3001') + '/api'
let adminToken = ''
const ratings = {}

// ─── navegação ───────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
    btn.classList.add('active')
    document.getElementById(`view-${btn.dataset.view}`).classList.add('active')

    if (btn.dataset.view === 'catalogo') carregarCatalogo()
    if (btn.dataset.view === 'avaliar') carregarSelectPeca()
    if (btn.dataset.view === 'admin' && adminToken) carregarAdmin()
  })
})

// ─── inicializa inputs de estrelas ───────────────────────────
document.querySelectorAll('.stars-input').forEach(container => {
  const criterio = container.dataset.criterio
  ratings[criterio] = 0

  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button')
    btn.className = 'star-btn'
    btn.textContent = '★'
    btn.dataset.val = i
    btn.onclick = () => setStar(criterio, i, container)
    container.appendChild(btn)
  }
})

function setStar(criterio, val, container) {
  ratings[criterio] = val
  container.querySelectorAll('.star-btn').forEach((b, i) => {
    b.classList.toggle('on', i < val)
  })
}

// ─── catálogo ─────────────────────────────────────────────────
async function carregarCatalogo() {
  const grid = document.getElementById('catalogo-grid')
  grid.innerHTML = '<div class="empty-state">carregando...</div>'

  try {
    const res = await fetch(`${API}/pecas`)
    const pecas = await res.json()

    if (!pecas.length) {
      grid.innerHTML = '<div class="empty-state">nenhuma peça no catálogo ainda</div>'
      return
    }

    grid.innerHTML = pecas.map(p => renderPartCard(p)).join('')
  } catch (err) {
    grid.innerHTML = '<div class="empty-state">erro ao carregar — backend rodando?</div>'
  }
}

function renderPartCard(p) {
  const m = p.medias
  const criterioNomes = {
    desempenho: 'Desempenho',
    custoBeneficio: 'Custo-benefício',
    compatibilidade: 'Compatibilidade',
    durabilidade: 'Durabilidade',
    ruido: 'Ruído'
  }

  const foto = p.fotoUrl
    ? `<img class="part-foto" src="${API.replace('/api','')}${p.fotoUrl}" alt="${p.nome}">`
    : `<div class="part-foto-placeholder">sem foto</div>`

  const criteriosMini = m
    ? Object.entries(criterioNomes).map(([key, label]) => `
        <div>
          <div class="crit-mini">
            <span class="crit-mini-label">${label}</span>
            <span class="crit-mini-val">${m[key].toFixed(1)}</span>
          </div>
          <div class="crit-mini-bar"><div class="crit-mini-fill" style="width:${(m[key]/5)*100}%"></div></div>
        </div>`).join('')
    : '<span class="sem-avaliacoes">sem avaliações ainda</span>'

  return `
    <div class="part-card">
      <div class="part-card-top">
        <div>
          <div class="part-nome">${p.nome}</div>
          <div class="part-meta">${p.marca} · ${p.categoria}</div>
        </div>
        ${m ? `<div><div class="part-score">${m.geral.toFixed(1)}</div><div class="part-score-label">geral/5</div></div>` : ''}
      </div>
      ${foto}
      <div class="criterios-mini">${criteriosMini}</div>
      <div class="part-avaliacoes">${p.totalAvaliacoes} avaliação${p.totalAvaliacoes !== 1 ? 'ões' : ''}</div>
    </div>`
}

// ─── select de peças (avaliar) ────────────────────────────────
async function carregarSelectPeca() {
  const sel = document.getElementById('select-peca')
  sel.innerHTML = '<option value="">— escolha uma peça —</option>'
  document.getElementById('form-avaliar').style.display = 'none'

  try {
    const res = await fetch(`${API}/pecas`)
    const pecas = await res.json()
    pecas.forEach(p => {
      const opt = document.createElement('option')
      opt.value = p.id
      opt.textContent = `${p.nome} (${p.categoria})`
      sel.appendChild(opt)
    })
  } catch {}
}

document.getElementById('select-peca').addEventListener('change', function () {
  document.getElementById('form-avaliar').style.display = this.value ? 'block' : 'none'
})

// ─── enviar avaliação ─────────────────────────────────────────
async function enviarAvaliacao() {
  const pecaId = document.getElementById('select-peca').value
  const nomeUsuario = document.getElementById('av-nome').value.trim()

  if (!pecaId) return toast('selecione uma peça')
  if (!nomeUsuario) return toast('coloca seu nome aí')

  const criterios = ['desempenho', 'custoBeneficio', 'compatibilidade', 'durabilidade', 'ruido']
  for (const c of criterios) {
    if (!ratings[c]) return toast(`avalie o critério: ${c}`)
  }

  try {
    const res = await fetch(`${API}/avaliacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pecaId,
        nomeUsuario,
        comentario: document.getElementById('av-comentario').value,
        ...ratings
      })
    })

    const data = await res.json()
    if (!res.ok) return toast(data.erro || 'erro ao enviar')

    toast('avaliação enviada! média atualizada.')

    // reseta o formulário
    document.getElementById('av-nome').value = ''
    document.getElementById('av-comentario').value = ''
    document.getElementById('select-peca').value = ''
    document.getElementById('form-avaliar').style.display = 'none'
    criterios.forEach(c => {
      ratings[c] = 0
      document.querySelector(`.stars-input[data-criterio="${c}"]`)
        .querySelectorAll('.star-btn').forEach(b => b.classList.remove('on'))
    })
  } catch {
    toast('erro de conexão com o servidor')
  }
}

// ─── submeter peça ────────────────────────────────────────────
function previewFoto(input) {
  const file = input.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    const img = document.getElementById('foto-preview')
    img.src = e.target.result
    img.style.display = 'block'
    document.getElementById('drop-text').style.display = 'none'
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

  const formData = new FormData()
  formData.append('nome', nome)
  formData.append('marca', marca)
  formData.append('categoria', categoria)
  if (descricao) formData.append('descricao', descricao)
  if (fotoInput.files[0]) formData.append('foto', fotoInput.files[0])

  try {
    const res = await fetch(`${API}/pecas`, { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) return toast(data.erro || 'erro ao submeter')

    toast('peça enviada para aprovação do admin!')
    document.getElementById('sub-nome').value = ''
    document.getElementById('sub-marca').value = ''
    document.getElementById('sub-descricao').value = ''
    fotoInput.value = ''
    document.getElementById('foto-preview').style.display = 'none'
    document.getElementById('drop-text').style.display = 'block'
  } catch {
    toast('erro de conexão com o servidor')
  }
}

// ─── admin ────────────────────────────────────────────────────
async function autenticarAdmin() {
  const token = document.getElementById('admin-token').value.trim()
  if (!token) return toast('coloca o token')

  // testa o token tentando buscar pendentes
  try {
    const res = await fetch(`${API}/admin/pendentes`, {
      headers: { 'x-admin-token': token }
    })
    if (!res.ok) return toast('token inválido')

    adminToken = token
    document.getElementById('admin-auth').style.display = 'none'
    document.getElementById('admin-painel').style.display = 'block'
    carregarAdmin()
  } catch {
    toast('erro de conexão')
  }
}

async function carregarAdmin() {
  await Promise.all([carregarPendentes(), carregarTodasPecas()])
}

async function carregarPendentes() {
  const el = document.getElementById('pendentes-list')
  try {
    const res = await fetch(`${API}/admin/pendentes`, { headers: { 'x-admin-token': adminToken } })
    const pendentes = await res.json()

    document.getElementById('count-pendentes').textContent = pendentes.length

    if (!pendentes.length) {
      el.innerHTML = '<div class="empty-state">nenhuma peça pendente</div>'
      return
    }

    el.innerHTML = pendentes.map(p => `
      <div class="admin-card">
        ${p.fotoUrl
          ? `<img class="admin-card-foto" src="${API.replace('/api','')}${p.fotoUrl}" alt="${p.nome}">`
          : `<div class="admin-card-sem-foto">sem foto</div>`}
        <div class="admin-card-info">
          <div class="admin-card-nome">${p.nome}</div>
          <div class="admin-card-meta">${p.marca} · ${p.categoria}</div>
          ${p.descricao ? `<div class="admin-card-desc">${p.descricao}</div>` : ''}
          <div class="admin-card-actions">
            <button class="btn-outline btn-approve" onclick="aprovar(${p.id})">Aprovar</button>
            <button class="btn-outline btn-reject" onclick="rejeitar(${p.id})">Rejeitar</button>
          </div>
        </div>
      </div>`).join('')
  } catch {
    el.innerHTML = '<div class="empty-state">erro ao carregar</div>'
  }
}

async function carregarTodasPecas() {
  const el = document.getElementById('todas-list')
  try {
    const res = await fetch(`${API}/admin/pecas`, { headers: { 'x-admin-token': adminToken } })
    const pecas = await res.json()

    el.innerHTML = pecas.map(p => `
      <div class="admin-card">
        ${p.fotoUrl
          ? `<img class="admin-card-foto" src="${API.replace('/api','')}${p.fotoUrl}" alt="${p.nome}">`
          : `<div class="admin-card-sem-foto">sem foto</div>`}
        <div class="admin-card-info">
          <div style="display:flex;align-items:center;gap:8px">
            <div class="admin-card-nome">${p.nome}</div>
            <span class="status-pill status-${p.status}">${p.status.toLowerCase()}</span>
          </div>
          <div class="admin-card-meta">${p.marca} · ${p.categoria} · ${p.avaliacoes.length} avaliações</div>
          <div class="admin-card-actions">
            <button class="btn-outline btn-reject" onclick="deletar(${p.id})">Remover</button>
          </div>
        </div>
      </div>`).join('')
  } catch {}
}

async function aprovar(id) {
  await fetch(`${API}/admin/${id}/aprovar`, { method: 'PATCH', headers: { 'x-admin-token': adminToken } })
  toast('peça aprovada!')
  carregarAdmin()
}

async function rejeitar(id) {
  await fetch(`${API}/admin/${id}/rejeitar`, { method: 'PATCH', headers: { 'x-admin-token': adminToken } })
  toast('peça rejeitada.')
  carregarAdmin()
}

async function deletar(id) {
  if (!confirm('remover essa peça?')) return
  await fetch(`${API}/admin/${id}`, { method: 'DELETE', headers: { 'x-admin-token': adminToken } })
  toast('peça removida.')
  carregarAdmin()
}

// ─── tabs admin ───────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
  document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active')
  document.getElementById(`tab-${tab}`).classList.add('active')
}

// ─── toast ────────────────────────────────────────────────────
function toast(msg) {
  const el = document.getElementById('toast')
  el.textContent = msg
  el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 3000)
}

// ─── init ─────────────────────────────────────────────────────
carregarCatalogo()
