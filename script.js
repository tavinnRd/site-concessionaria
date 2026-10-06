
const CORES = { Vermelho: '#c0392b', Preto: '#1b1b1f', Branco: '#f4f4f2', Prata: '#aeb4ba', Azul: '#1f4e9c', Cinza: '#5d646b' };

let carros = JSON.parse(localStorage.getItem('carros2')) || [
  { id: 1, nome: 'Fiat Argo 1.3', tipo: 'Hatch', cor: 'Vermelho', ano: 2021, km: 42000, preco: 64900, opcionais: 'Ar-condicionado, Multimídia', vendido: false, imagem: "imagens/FiatA.jpeg"},
  { id: 2, nome: 'Chevrolet Onix Plus', tipo: 'Sedan', cor: 'Prata', ano: 2022, km: 28000, preco: 78500, opcionais: 'Ar-condicionado, Câmera de ré', vendido: false, imagem: "imagens/chevrolet.jpeg" },
  { id: 3, nome: 'Honda HR-V EXL', tipo: 'SUV', cor: 'Preto', ano: 2020, km: 61000, preco: 112900, opcionais: 'Teto solar, Bancos de couro', vendido: false, imagem: "imagens/honda.jpeg" },
  { id: 4, nome: 'Toyota Hilux SR', tipo: 'Picape', cor: 'Branco', ano: 2019, km: 88000, preco: 189000, opcionais: 'Ar-condicionado, Piloto automático', vendido: false, imagem: "imagens/toyota.jpeg" },
  { id: 5, nome: 'VW T-Cross', tipo: 'SUV', cor: 'Azul', ano: 2022, km: 23000, preco: 134500, opcionais: 'Teto solar, Multimídia', vendido: false, imagem: "imagens/nivus.jpeg" }
];
let cliente = JSON.parse(localStorage.getItem('cliente'));
let mensagens = JSON.parse(localStorage.getItem('mensagens')) || [];
let avisos = JSON.parse(localStorage.getItem('avisos')) || [];
let carrinho = [];

const $ = (id) => document.getElementById(id);
const real = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const limpo = (t) => String(t).replace(/</g, '&lt;'); 

function salvar() {
  localStorage.setItem('carros2', JSON.stringify(carros));
  localStorage.setItem('cliente', JSON.stringify(cliente));
  localStorage.setItem('mensagens', JSON.stringify(mensagens));
  localStorage.setItem('avisos', JSON.stringify(avisos));
}

function tudo() {
  salvar();
  mostrarCarros();
  mostrarCarrinho();
  preencherSelect();
  mostrarConversa();
  mostrarAvisos();
  mostrarEquipe();
}

function cadastrar() {
  cliente = { nome: $('c-nome').value, email: $('c-email').value, tel: $('c-tel').value };
  $('ola').textContent = 'Olá, ' + cliente.nome + '!';
  avisar('Cadastro feito. Agora você pode comprar e enviar mensagens.');
}

function mostrarCarros() {
  const lista = carros.filter((c) =>
    !c.vendido &&
    (!$('f-tipo').value || c.tipo === $('f-tipo').value) &&
    (!$('f-cor').value || c.cor === $('f-cor').value) &&
    c.ano >= ($('f-ano').value || 0) &&
    c.km <= ($('f-km').value || Infinity) &&
    c.opcionais.toLowerCase().includes($('f-op').value.toLowerCase())
  );
  $('lista').innerHTML = lista.map((c) => `
    <div class="carro">
    ${c.imagem ? `<img class="foto" src="${c.imagem}" alt="${limpo(c.nome)}">` : `<div class="foto" style="background:${CORES[c.cor]}"></div>`}
      <h3>${limpo(c.nome)}</h3>
      <p>${c.tipo}, ${c.cor}, ${c.ano}, ${c.km} km</p>
      <p>${limpo(c.opcionais)}</p>
      <span class="preco">${real(c.preco)}</span>
      <button onclick="comprar(${c.id})">Comprar</button>
      <button onclick="perguntar(${c.id})">Perguntar</button>
    </div>`).join('') || '<p>Nenhum carro com esses filtros.</p>';
}

function comprar(id) {
  if (!carrinho.includes(id)) carrinho.push(id);
  mostrarCarrinho();
  location.hash = '#carrinho';
}

function tirar(id) {
  carrinho = carrinho.filter((x) => x !== id);
  mostrarCarrinho();
}

function mostrarCarrinho() {
  const itens = carros.filter((c) => carrinho.includes(c.id));
  const total = itens.reduce((soma, c) => soma + c.preco, 0);
  $('itens').innerHTML = itens.map((c) =>
    `<p>${limpo(c.nome)}: ${real(c.preco)} <button onclick="tirar(${c.id})">Tirar</button></p>`).join('') || '<p>Carrinho vazio.</p>';

  const forma = $('forma').value;
  let texto = 'Pagamento na loja, com visita combinada com a equipe.';
  if (forma === 'avista') texto = 'À vista com 5% de desconto: ' + real(total * 0.95);
  if (forma === 'parcelado') texto = '10x de ' + real(total / 10) + ' sem juros';
  if (forma === 'financiamento') texto = '48x de ' + real(total * 1.4 / 48) + ' (com juros)';
  $('resumo').textContent = total ? texto : '';
}

function finalizar() {
  if (!cliente) return alert('Faça seu cadastro primeiro.');
  if (!carrinho.length) return alert('O carrinho está vazio.');
  avisar('Pedido recebido (' + $('forma').value + '). A equipe entra em contato.');
  carrinho = [];
  tudo();
}

function preencherSelect() {
  const atual = $('msg-carro').value;
  $('msg-carro').innerHTML = carros.filter((c) => !c.vendido)
    .map((c) => `<option value="${c.id}">${limpo(c.nome)}</option>`).join('');
  $('msg-carro').value = atual;
}

function perguntar(id) {
  $('msg-carro').value = id;
  mostrarConversa();
  location.hash = '#mensagem';
}

function mostrarConversa() {
  const id = Number($('msg-carro').value);
  $('conversa').innerHTML = mensagens.filter((m) => m.carro === id)
    .map((m) => `<div class="msg"><b>${m.de}:</b> ${limpo(m.texto)}</div>`).join('');
}

function enviarMensagem() {
  if (!cliente) return alert('Faça seu cadastro primeiro.');
  if (!$('msg-texto').value) return;
  mensagens.push({ carro: Number($('msg-carro').value), de: 'Cliente', texto: $('msg-texto').value });
  $('msg-texto').value = '';
  tudo();
}

function avisar(texto) {
  avisos.unshift({ texto: texto, hora: new Date().toLocaleString('pt-BR') });
  tudo();
  const caixa = document.createElement('div'); 
  caixa.className = 'toast';
  caixa.textContent = texto;
  document.body.append(caixa);
  setTimeout(() => caixa.remove(), 6000);
}

function mostrarAvisos() {
  $('lista-avisos').innerHTML = avisos.map((a) =>
    `<div class="aviso">${limpo(a.texto)}<br><small>${a.hora}</small></div>`).join('') || '<p>Sem avisos por enquanto.</p>';
}

setInterval(() => {
  const livres = carros.filter((c) => !c.vendido);
  const jaComprou = avisos.some((a) => a.texto.startsWith('Pedido'));
  if (jaComprou && Math.random() < 0.5) {
    avisar('Cobrança: a próxima parcela vence em 5 dias.');
  } else if (livres.length) {
    const c = livres[Math.floor(Math.random() * livres.length)];
    avisar('Novidade: ' + c.nome + ' por ' + real(c.preco));
  }
}, 45000);

function adicionarCarro() {
  carros.push({
    id: Date.now(), nome: $('e-nome').value, tipo: $('e-tipo').value, cor: $('e-cor').value,
    ano: Number($('e-ano').value), km: Number($('e-km').value), preco: Number($('e-preco').value),
    opcionais: $('e-op').value, vendido: false,
    imagem: $('e-img').value
  });
  avisar('Novo veículo no estoque: ' + $('e-nome').value);
}

function vender(id) { 
  carros.find((c) => c.id === id).vendido = true;
  tudo();
}

function remover(id) {
  carros = carros.filter((c) => c.id !== id);
  tudo();
}

function responder(posicao) {
  const texto = prompt('Sua resposta ao cliente:');
  if (!texto) return;
  mensagens.push({ carro: mensagens[posicao].carro, de: 'Equipe', texto: texto });
  avisar('A equipe respondeu a sua mensagem.');
}

function mostrarEquipe() {
  $('equipe-carros').innerHTML = carros.filter((c) => !c.vendido).map((c) =>
    `<p>${limpo(c.nome)} ${c.ano} <button onclick="vender(${c.id})">Marcar como vendido</button> <button onclick="remover(${c.id})">Remover</button></p>`).join('');
  $('equipe-msgs').innerHTML = mensagens.map((m, i) =>
    m.de === 'Cliente' ? `<p>${limpo(m.texto)} <button onclick="responder(${i})">Responder</button></p>` : '').join('') || '<p>Sem mensagens.</p>';
}

if (cliente) $('ola').textContent = 'Olá, ' + cliente.nome + '!';
tudo();