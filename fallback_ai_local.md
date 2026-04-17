# Estratégia de Fallback Local vs Cloud (Resiliência do Agente)

Este painel mapeia o projeto de implementação de um **Plano B descentralizado e 100% local** para a infraestrutura de IAs do GranaHub, desenvolvido para evitar que oscilações das Big Techs derrubem o robô de postagens.

## 1. O Problema e Cenário
Nos momentos em que as APIs da Google (Gemini) entram em "High Demand" ou Rate Limit severo, o Agente GitHub Actions que redige posts fica com a esteira travada (como visto em falhas de timeout superiores a 9 minutos). Como solução secundária e permanente, será mapeada via endpoint privado uma API substituta local.

### Hardwares Disponíveis (Limitações Atuais):
- **Máquina 1 (ZimaOS)**: Hardware mais fraco, focado antes em mídia via Jellyfin (agora desinstalado para economizar recursos).
- **Máquina 2 (OpenClaw/Servidor Pessoal)**: Apenas 4GB de RAM atualmente (com projeções de upgrade em breve).

## 2. Abordagem de Alta Eficiência
Dadas as travas rígidas de RAM e Processamento (CPU Inference), a instalação exige uma base crua que evite sobrecarga.

- **Engine Principal**: [**Ollama**](https://ollama.com/) (sem painel web GUI local)
  - Vantagens: Interface bare-metal via Command Line, processamento unificado, consumo zero em inatividade e API 100% compativel com os formatos padronizados (OpenAI / JSON modes).

- **Modelos Alvo (Micro-LLMs)**: 
  Para sobreviver aos 4GB de RAM/CPU do OpenClaw ou processador do ZimaOS sem crash, apenas modelos **inferiores a 3 Bilhões de parâmetros quantizados em 4-bits ou 5-bits** serão tolerados:
  1. `llama3.2` (3B) - Excelente qualidade semântica.
  2. `qwen2.5:1.5b` (1.5B) - Altíssima velocidade para raciocínio simples e baixo footprint.
  3. `gemma2:2b` (2B) - Oficial Google adaptado para ser micro.

## 3. Roteamento (Acesso Exponencial Público)
Como o GitHub Actions roda na nuvem da Microsoft, ele precisa "enxergar" a máquina servidora (OpenClaw/ZimaOS). Abrir portas no roteador residencial é perigoso (ataques e varreduras).

### Usando Cloudflare Tunnels (Zero Trust)
1. Instala-se o daemon `cloudflared` na máquina contendo o Ollama.
2. É criado um túnel reverso criptografado apontando para a porta `localhost:11434`.
3. Dá-se uma URL mascarada a esse túnel, como por exemplo: `https://fallback-ai.granahub.com.br`.

## 4. Integração do Código Base (Futuro Node.js Action)
Quando um modelo local for finalmente estabilizado pelo usuário, o `tools/agent.mjs` assumirá este Fallback dinâmico. O código interceptará falhas no Google (Bloco try/catch do GenAI) e irá disparar um POST puro diretamente para o Cloudflare.

```javascript
// Exemplo Teórico da injeção de robustez local
try {
  // Tenta Gemini como modelo principal aqui...
} catch (errorComercial) {
  console.log('⚠️ Google Offline. Chamando Servidor Local de Emergência...');
  
  const responseLocal = await fetch('https://fallback-ai.granahub.com.br/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2:latest', 
      prompt: O_MESMO_PROMPT_DO_GEMINI,
      format: 'json', 
      stream: false
    })
  });
  
  const jsonOutput = await responseLocal.json();
  const obj = JSON.parse(jsonOutput.response);
  // ... processa o Objeto Post ...
}
```

## 5. Passos Concretos para o Usuário
1. [ ] Garantir limpeza de apps pesados e Docker do ZimaOS / OpenClaw.
2. [ ] Instalar Ollama Shell via Curl.
3. [ ] Rodar o commando `ollama pull llama3.2` e verificar o teto de RAM alocada.
4. [ ] Mandar chamadas pequenas de teste enquanto analisa na tela de CPU do ZimaOS a carga na inatividade.
5. [ ] Subir o Agent Cloudflared, criar a URL na aba Zero Trust do Painel do Cloudflare logado e parear conectividade.
