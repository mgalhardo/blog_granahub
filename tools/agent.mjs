import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Configura o caminho relativo para ler diretórios independentemente de onde o script é chamado
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Carrega as chaves do arquivo .env (localmente)
dotenv.config({ path: path.join(rootDir, '.env') });

async function runAgent() {
  console.log('🤖 Iniciando Agente GranaHub...');

  const sugestoesPath = path.join(rootDir, 'content', 'sugestoes.md');
  const postsDir = path.join(rootDir, 'content', 'posts');
  let sugestoesContent = '';
  let temaEscolhido = '';
  let isSugestaoManual = false;

  // 1. Tentar pegar da fila manual
  if (fs.existsSync(sugestoesPath)) {
    sugestoesContent = fs.readFileSync(sugestoesPath, 'utf8');
    const filasAberto = sugestoesContent.split('## Na Fila')[1]?.split('## Posts Criados')[0];
    const match = filasAberto?.match(/-\s*(.+)/);
    
    if (match && match[1] && !match[1].includes('(Nenhum arquivo na fila)')) {
      temaEscolhido = match[1].trim();
      isSugestaoManual = true;
      console.log(`📋 Tema encontrado na lista de Sugestões: "${temaEscolhido}"`);
    }
  }

  // 2. Se não houver manual, fazer brainstorming dinâmico
  if (!temaEscolhido) {
    console.log(`🔍 Nenhuma sugestão encontrada em sugestoes.md. Iniciando Brainstorming...`);
    
    // Coletar contexto
    const postsExistentes = fs.readdirSync(postsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', '').replaceAll('-', ' '));
    
    const noticias = await fetchNewsHeadlines();
    const categoriaSorteada = pickWeightedCategory();
    
    console.log(`🎲 Categoria sorteada: ${categoriaSorteada}`);

    const brainstormPrompt = `Aja como um estrategista de conteúdo para o blog "GranaHub" (WhatsApp Financeiro).
Sua tarefa é sugerir o MELHOR tema para o post de hoje.

CATEGORIA SORTEADA: ${categoriaSorteada}

CONTEXTO:
- Já escrevemos sobre: ${postsExistentes.slice(-10).join(', ')}
- Notícias reais do dia: ${noticias.length > 0 ? noticias.slice(0, 15).join(' | ') : 'Nenhuma notícia recente disponível.'}

REGRAS:
1. O tema deve ser ÚNICO e não repetir os que já escrevemos.
2. Evite generalismos como "O que está bombando nas redes". Seja específico.
3. Se a categoria for Notícias, tente conectar uma das notícias reais ao contexto de finanças pessoais.
4. Se for Economia Doméstica ou Investimentos, foque em dicas práticas ou educacionais.
5. Retorne APENAS o objeto JSON, sem texto introdutório ou explicações.
   Use categorias amigáveis como: "Economia Doméstica", "Investimentos", "GranaHub", "Planejamento", "Imposto de Renda".

FORMATO: {"tema": "...", "categoria": "..."}
`;

    const brainstormResult = await generateAIContent(brainstormPrompt);
    const brainstormData = JSON.parse(brainstormResult);
    
    temaEscolhido = brainstormData.tema;
    const categoriaEscolhida = brainstormData.categoria;
    console.log(`💡 Brainstorming concluiu: "${temaEscolhido}" na categoria "${categoriaEscolhida}"`);
    process.env.POST_CATEGORY = categoriaEscolhida; // Guardar para o próximo passo
  }

  console.log('✍️  Gerando conteúdo do post...');

  const prompt = `Você é um especialista em finanças pessoais, trabalhando como redator para o blog "GranaHub". 
O GranaHub é um aplicativo focado em controle financeiro 100% pelo WhatsApp, focado no público brasileiro.
Sua missão é escrever um post diário de alta qualidade.

TEMA DO POST: ${temaEscolhido}

  Regras Cruciais:
  1. Retorne APENAS um objeto JSON válido. NÃO inclua texto introdutório, cumprimentos ou explicações fora do JSON.
  2. Fuja do óbvio. Não fale apenas de "economizar cafézinho". Traga insights reais, dados ou conexões com a economia atual.
  3. Se for um post de notícias, explique como aquilo afeta o bolso do brasileiro comum.
  4. O tom deve ser encorajador, simples, mas muito profissional e direto.
  5. O formato do JSON deve ser EXATAMENTE este:
  {
    "title": "Um título chamativo e focado em SEO (evite títulos genéricos)",
    "description": "Uma breve descrição de 2 linhas para os metadados (SEO)",
    "slug": "url-amigavel-do-post (NÃO inclua anos no slug, use apenas o título limpo em minúsculas)",
    "category": "A categoria definida no passo anterior",
    "searchTermForImage": "uma palavra chave em INGLÊS para imagem de capa",
    "content": "O post completo em Markdown. Use ## e ###. Inclua listas impactantes e um parágrafo final de reflexão/conselho."
  }
  6. IMPORTANTE: O slug deve ser sempre atemporal. NÃO inclua anos (como 2024, 2025, 2026) no slug, pois o post pode ser relevante por anos. Use apenas palavras-chave do título.
  7. A categoria é OBRIGATÓRIA e deve ser uma das: "Economia Doméstica", "Investimentos", "Planejamento", "Imposto de Renda", "GranaHub"

CATEGORIA DEFINIDA: ${process.env.POST_CATEGORY || 'Finanças'}

No final do post (último parágrafo), inclua o CTA:
"[Inicie seu teste grátis.](https://app.granahub.com.br/auth?mode=register&planType=month)"
`;

  try {
    const jsonString = await generateAIContent(prompt);
    const postData = JSON.parse(jsonString);

    console.log(`✅ Conteúdo gerado! Título: ${postData.title}`);

    // Sistema de Imagem de Capa
    const fallbacks = [
      "https://images.unsplash.com/photo-1574607383476-f517f260d30b?q=80&w=2074&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555421689-d68471e189f2?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=2074&auto=format&fit=crop"
    ];
    let coverImage = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    if (process.env.PEXELS_API_KEY) {
       try {
         console.log('📸 Buscando imagem no Pexels...');
         const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${postData.searchTermForImage}&per_page=1`, {
           headers: { Authorization: process.env.PEXELS_API_KEY }
         });
         const pexelsData = await pexelsRes.json();
         if (pexelsData.photos && pexelsData.photos.length > 0) {
           coverImage = pexelsData.photos[0].src.large2x;
         }
       } catch (imgError) {
         console.warn('⚠️ Erro ao buscar imagem, usando fallback.');
       }
    } 
    
    const dataAtual = new Date().toISOString().split('T')[0];

    const finalMarkdown = `---
title: "${postData.title}"
date: "${dataAtual}"
description: "${postData.description}"
coverImage: "${coverImage}"
category: "${postData.category || process.env.POST_CATEGORY || 'Finanças'}"
---

${postData.content}
`;

    const filepath = path.join(rootDir, 'content', 'posts', `${postData.slug}.md`);
    fs.writeFileSync(filepath, finalMarkdown, 'utf8');
    
    console.log(`💾 Post salvo em: /content/posts/${postData.slug}.md`);

    if (isSugestaoManual) {
      const parts = sugestoesContent.split('## Posts Criados');
      const upperPart = parts[0].replace(`- ${temaEscolhido}`, '').trim();
      const lowerPart = parts[1].trim();

      const newSugestoes = `${upperPart}

## Posts Criados
- [${dataAtual}] ${temaEscolhido}
${lowerPart}`;

      fs.writeFileSync(sugestoesPath, newSugestoes, 'utf8');
      console.log('📝 sugestoes.md atualizado.');
    }

    console.log('🎉 Tudo pronto! Pull Request no GitHub será disparado...');

  } catch (error) {
    console.error('❌ Erro durante o processo do Agente:', error);
    process.exit(1);
  }
}

/**
 * Função Mestra de Geração de Conteúdo com Redundância Tripla.
 * Tenta: Gemini -> Groq -> Local Ollama
 */
async function generateAIContent(prompt) {
  // 1. Tentar Gemini (Provedor Primário)
  if (process.env.GEMINI_API_KEY) {
    console.log('📡 [1/3] Tentando Google Gemini...');
    try {
      const result = await callGemini(prompt);
      const json = extractJSON(result);
      if (json) return json;
    } catch (e) {
      console.warn('⚠️ Gemini falhou ou retornou formato inválido.');
    }
  }

  // 2. Tentar Groq (Provedor Secundário)
  if (process.env.GROQ_API_KEY) {
    console.log('📡 [2/3] Tentando Groq (Llama 3.3)...');
    try {
      const result = await callGroq(prompt);
      const json = extractJSON(result);
      if (json) return json;
    } catch (e) {
      console.warn('⚠️ Groq falhou ou retornou formato inválido.');
    }
  }

  // 3. Tentar Local Ollama via ZimaOS (Última Instância)
  if (process.env.LOCAL_AI_URL && process.env.CF_ACCESS_CLIENT_ID) {
    console.log('🏠 [3/3] Tentando IA Local (ZimaOS via Cloudflare)...');
    try {
      const result = await callLocalOllama(prompt);
      const json = extractJSON(result);
      if (json) return json;
    } catch (e) {
      console.warn('⚠️ IA Local falhou ou retornou formato inválido.');
    }
  }

  throw new Error('❌ Falha total: Nenhum provedor de IA conseguiu gerar o conteúdo.');
}

// --- Provedores Individuais ---

async function callGemini(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ["gemini-2.0-flash", "gemini-1.5-pro-latest", "gemini-1.5-flash-latest"];
  
  for (const modelName of models) {
    try {
      console.log(`   └─ Usando modelo: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      console.warn(`   └─ Erro no modelo ${modelName}: ${e.message}`);
    }
  }
  throw new Error('Todos os modelos Gemini falharam.');
}

async function callGroq(prompt) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });
  
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callLocalOllama(prompt) {
  // Usamos o endpoint compatível com OpenAI do Ollama por ser padrão
  const url = `${process.env.LOCAL_AI_URL}/v1/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID,
      'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen2.5:1.5b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!res.ok) throw new Error(`Local AI error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// --- Funções Auxiliares ---

async function fetchNewsHeadlines() {
  const sources = [
    'https://g1.globo.com/rss/g1/economia/',
    'https://www.infomoney.com.br/feed/'
  ];
  let allTitles = [];
  for (const url of sources) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      const items = text.split('<item>');
      items.shift();
      const titles = items.map(item => {
        const match = item.match(/<title>(<!\[CDATA\[)?(.+?)(\]\]>)?<\/title>/);
        return match ? match[2] : null;
      }).filter(Boolean);
      allTitles = allTitles.concat(titles.slice(0, 10));
    } catch (e) {
      console.warn(`⚠️ Aviso: Falha ao buscar notícias de ${url}`);
    }
  }
  return allTitles;
}

function pickWeightedCategory() {
  const rand = Math.random() * 100;
  // 40% Economia Doméstica, 30% Investimentos, 30% Notícias
  if (rand < 40) return 'Economia Doméstica (Orçamento, poupança, dicas de consumo real)';
  if (rand < 70) return 'Investimentos (Renda Fixa, Bolsa de Valores, Planejamento de longo prazo)';
  return 'Notícias e Atualidades Financeiras Reais';
}

function extractJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  return text.substring(start, end + 1);
}

runAgent().catch(err => {
    console.error('❌ Erro Fatal no Agente:', err);
    process.exit(1);
});
