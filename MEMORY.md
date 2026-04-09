# Memória e Conhecimento do Projeto GranaHub Blog

Este arquivo tem como objetivo registrar configurações, lógicas aplicadas e o histórico de como o projeto funciona, para garantir que qualquer assistência futura conte com o mesmo contexto e não seja perdida após reinicializações.

## 1. Stack e Arquitetura Principal
- **Framework**: Next.js (App Router ou Pages Router configurado para exportação estática).
- **Destino de Hospedagem**: Hostinger (via servidor Apache).
- **Conteúdo**: Arquivos Markdown (`.md`) armazenados na pasta `content/posts/`.

## 2. Configurações Estruturais Críticas (`next.config.ts`)
- **Exportação Estática**: O painel e o blog do GranaHub funcionam com hospedagem estática e sem servidor NodeJS próprio. Por causa disso, o arquivo de configuração exporta o build usando o comando `output: 'export'`.
- **Roteamento de Diretórios (`trailingSlash: true`)**: Extremamente crítico. Habilitamos `trailingSlash: true`. Se isso for desligado, um acesso direto a um link gerará **Erro 403 Forbidden**. Isso ocorre pois servidores Apache (Hostinger) buscam a rota internamente como pastas. Tendo essa tag ativada, o Next.js constrói uma página física real `index.html` dentro da pasta exata da URL, fazendo com que o acesso direto pelos navegadores encontre a página correspondente.
- **Imagens Não-Otimizadas**: `images: { unoptimized: true }` habilitado para contornar limitações do Server Side do componente `next/image` quando combinados em build local ou Actions que não contam com o processamento otimizado de imagens no servidor e causam a quebra de caminhos ou URLs remotas, facilitando também a exibição de capas salvas externamente, como links do Unsplash.

## 3. Comportamento do Servidor (`public/.htaccess`)
Foi adaptado um arquivo `.htaccess` inserido na pasta `public` do projeto Next.js. O conteúdo desse arquivo será jogado em `out/.htaccess` após cada compilação e é vital para que a configuração estática funcione bem no Hostinger:
- Possui regras que direcionam para cache longo pastas nativas (como a do Next.js) pra evitar latência excessiva.
- Processa roteamentos diretos fallback caso algum `.html` não seja encontrado.

## 4. Deploy Automatizado (GitHub Actions)
- O processo de *Deploy* ocorre automaticamente ao disparar commits na branch `main`.
- Um *Agent* (agente de IA auxiliar) tem uma pipeline programada isolada que pode gerar novos artigos, fazer commit e atualizar o blog por conta própria.
- Esteja a postos após um pull do Agente de IA para checar se ele adicionou imagens Unsplash com caminhos válidos (caminhos que retornem 200 OK sem cair e sem erro 404). As imagens não aparecerem e sumirem nos posts é sinal de links corrompidos e gerados acidentalmente pelo Agent (alucinação) e requer substituição pelo método de edição no Front-Matter `coverImage`.

## 5. Robô de IA e Gerenciamento de Imagens (Agente)
- **Integração Pexels**: O robô (`tools/agent.mjs`) utiliza a `PEXELS_API_KEY` (configurada nos Secrets do GitHub) para buscar imagens de capa dinâmicas e contextuais.
- **Sistema de Fallback (Reserva)**: Caso a API do Pexels falhe ou a chave não esteja presente, o robô conta com uma lista de URLs validadas do Unsplash. Ele seleciona uma aleatoriamente para garantir que nenhum post fique sem imagem ou com imagem quebrada (Erro 404).
- **Refinamento de Títulos**: Observou-se que o robô pode gerar títulos excessivamente sensacionalistas (estilo "clickbait"). O fluxo recomendado é revisar o título no Pull Request e ajustar para um tom mais prático e direto, condizente com a voz da marca GranaHub, antes de realizar o Merge.

## 6. Como Manter este Documento
Ao realizar qualquer mudança arquitetural, adicionar integrações de Banco de Dados, regras de redirecionamento ou novos plug-ins no Front-End, por favor, proceda com o apêndice neste documento em novas sessões para que a base de conhecimento (Brain) ou seu assistente mantenha-se com máxima consciência sobre a máquina do GranaHub!
