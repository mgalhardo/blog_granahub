# Informações do Kodee (Suporte Hostinger) — Abril 2026

Este documento registra as informações oficiais recebidas do Kodee (assistente de suporte da Hostinger)
para configuração de deploy automatizado do blog GranaHub.

---

## Dados de Conexão SFTP

| Campo            | Valor                          |
|------------------|--------------------------------|
| **Host**         | `82.29.199.52`                 |
| **Usuário**      | `u624347113`                   |
| **Porta SFTP**   | `65002`                        |
| **Porta FTP**    | `21` (não recomendado)         |
| **Protocolo**    | SFTP (preferencial)            |

## Caminho Remoto Correto

```
/home/u624347113/domains/blog.granahub.com.br/public_html
```

> **IMPORTANTE**: O caminho completo inclui `/home/u624347113/domains/`. 
> Não usar apenas `/public_html` — isso não funciona na Hostinger quando
> o domínio está em uma pasta de subdomínio/domínio adicional.

## Secrets no GitHub Actions

Os seguintes secrets devem estar configurados em:
**GitHub → Repositório → Settings → Secrets and variables → Actions**

| Secret Name     | Valor                         |
|-----------------|-------------------------------|
| `SFTP_HOST`     | `82.29.199.52`                |
| `SFTP_USER`     | `u624347113`                  |
| `SFTP_PASS`     | (senha SSH/SFTP do Hostinger) |

### Outros Secrets necessários (Analytics/Dashboard)

| Secret Name                   | Descrição                                    |
|-------------------------------|----------------------------------------------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON completo da Service Account Google Cloud |
| `GA4_PROPERTY_ID`             | ID numérico da propriedade GA4               |
| `SEARCH_CONSOLE_SITE_URL`     | URL do site no Search Console                |

## Workflow de Deploy (Resumo)

- **Trigger**: Push na branch `main`
- **Build**: `npm run build` → gera pasta `out/` (Next.js static export)
- **Upload**: `lftp` com `mirror -R --delete` via SFTP na porta 65002
- **Destino**: `/home/u624347113/domains/blog.granahub.com.br/public_html`

## Notas

- A senha SFTP é a mesma senha SSH definida no painel da Hostinger
  (Hospedagem → Avançado → Acesso SSH).
- Se a conexão falhar, verificar se o acesso SSH está **habilitado** 
  no painel da Hostinger.
- O `set sftp:auto-confirm yes` é necessário para aceitar automaticamente
  a chave do host na primeira conexão.
