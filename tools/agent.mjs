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

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ ERRO: GEMINI_API_KEY não foi encontrada nos Segredos (Secrets) ou no arquivo .env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const sugestoesPath = path.join(rootDir, 'content', 'sugestoes.md');
  let sugestoesContent = '';
  let temaEscolhido = 'Tendências virais sobre finanças pessoais no Brasil (Dicas aplicáveis e rápidas).';
  let isSugestaoManual = false;

  if (fs.existsSync(sugestoesPath)) {
    sugestoesContent = fs.readFileSync(sugestoesPath, 'utf8');
    const filasAberto = sugestoesContent.split('## Na Fila')[1]?.split('## Posts Criados')[0];
    const match = filasAberto?.match(/-\s*(.+)/);
    
    if (match && match[1] && !match[1].includes('(Nenhum arquivo na fila)')) {
      temaEscolhido = match[1].trim();
      isSugestaoManual = true;
      console.log(`📋 Tema encontrado na lista de Sugestões: "${temaEscolhido}"`);
    } else {
      console.log(`🔍 Nenhuma sugestão encontrada em sugestoes.md. Buscando tema geral...`);
    }
  }

  console.log('✍️  Gerando conteúdo com Gemini...');

  const prompt = `Você é um especialista em finanças pessoais, trabalhando como redator para o blog "GranaHub". 
O GranaHub é um aplicativo focado em controle financeiro 100% pelo WhatsApp, focado no público brasileiro.
Sua missão é escrever um post diário.

TEMA DO POST: ${temaEscolhido}

Regras:
1. Retorne APENAS um objeto JSON válido, sem qualquer formatação de bloco de código (não use \`\`\`json).
2. O formato do JSON deve ser exatamente este:
{
  "title": "Um título chamativo e focado em SEO",
  "description": "Uma breve descrição de 2 linhas para os metadados (SEO)",
  "slug": "url-amigavel-do-post-sem-acentos-ou-espacos",
  "searchTermForImage": "uma palavra chave em INGLÊS que represente a imagem de capa ideal (ex: money, invoice, shopping, wallet)",
  "content": "O post completo em formato Markdown. Inclua subtítulos (## e ###), listas, formatações em negrito e pelo menos uma reflexão de conselho no final."
}

Use um tom encorajador, simples e direto. Vá direto ao ponto.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textRaw = response.text();
    
    // Tenta limpar o raw text caso o Gemini mande tags markdown
    const jsonString = textRaw.replace(/```json\n/g, '').replace(/```\n?/g, '').trim();
    
    const postData = JSON.parse(jsonString);

    console.log(`✅ Conteúdo gerado! Título: ${postData.title}`);

    // Buscar Imagem (Fallback estático ou API)
    let coverImage = `https://images.unsplash.com/photo-1579621970588-a3f5ce599fac?q=80&w=2070&auto=format&fit=crop`;
    
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

runAgent().catch(err => {
    console.error('❌ Erro Fatal no Agente:', err);
    process.exit(1);
});
