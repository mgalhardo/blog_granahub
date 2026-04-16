# History

## 2026-04-15

### Troca do autor dos artigos

- **Mudança**: Substituído "GranaHub IA" por "Da Redação" na exibição do autor dos artigos
- **Arquivo modificado**: `src/app/posts/[slug]/page.tsx` (linha 62)
- **Publicação**:
  1. Execute `npm run build` para gerar os arquivos estáticos
  2. Execute `git add . && git commit -m "Descrição da mudança"`
  3. Execute `git push` para enviar ao repositório remoto
  4. O GitHub Actions fará o deploy automaticamente para a hospedagem estática
- **Resultado**: Build executado com sucesso e publicado

### Correção de slug com ano

- **Problema**: Agente gerou post com slug contendo "2024" (inflacao-dividas-proteger-bolso-2024.md)
- **Solução**: Renomeado arquivo para `inflacao-dividas-proteger-bolso.md`
- **Prevenção**: Atualizado o prompt do agente em `tools/agent.mjs` para que slugs sejam sempre atemporais (sem anos)

### Compartilhamento de artigos

- **Nova funcionalidade**: Adicionado componente de compartilhamento no final de cada artigo
- **Arquivo criado**: `src/components/ShareArticle.tsx`
- **Arquivo modificado**: `src/app/posts/[slug]/page.tsx`
- **Funcionalidades**:
  - Botão WhatsApp para compartilhar artigos
  - Botão Copiar Link para compartilhar em outras redes
- **Ordem ajustada**: Compartilhamento fica acima do CTA do GranaHub
- **CTA alterado**: "Gostou do artigo?" → "Quer dominar suas finanças?"
- **Redirect 301**: Adicionado no .htaccess para URL antiga com 2024
- **Remoção**: Arquivo com slug antigo (2024) removido permanentemente do repositório
- **Resultado**: Build executado com sucesso e publicado

## 2026-04-14

### Correção de erro no build

- **Problema**: Build falhando no GitHub Actions com erro "Export CursorClick doesn't exist in target module"
- **Causa**: Icone `CursorClick` não existe na versão do lucide-react instalada
- **Solução**: Substitui `CursorClick` por `MousePointer2` em `src/app/gh-secret-stats-2026/page.tsx`
- **Resultado**: Build executado com sucesso, arquivos gerados na pasta `out/`