# Phase 1: Foundation - Research

**Researched:** 2026-03-26
**Domain:** Claude Code plugin scaffolding — plugin.json, hooks.json, SKILL.md, marketplace.json, env loader, setup command
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Plugin registrado como plugin Claude Code válido via `.claude-plugin/plugin.json` com namespace `pocket-knife` | plugin.json schema completamente documentado; campo `name` é o único obrigatório; define namespace para skills |
| FOUND-02 | Script `load-env.sh` carrega `~/.claude/.env` via SessionStart hook e disponibiliza variáveis de ambiente | SessionStart hook format confirmado; `${CLAUDE_PLUGIN_ROOT}` disponível em comandos de hook |
| FOUND-03 | `.gitattributes` configurado com `eol=lf` para prevenir CRLF em scripts bash no Windows | Padrão `.gitattributes` documentado; Git Bash no Windows identificado como risco CRLF |
| FOUND-04 | README.md com instruções de instalação (`/plugin install` e `/plugin marketplace add`) | Comandos de instalação documentados via docs oficiais |
| FOUND-05 | Licença MIT no repositório | Sem complexidade técnica; artefato simples |
| FOUND-06 | Estrutura de diretórios segue padrão do Inference: `skills/[categoria]/[skill-name]/SKILL.md` | Estrutura de diretórios de plugin documentada; `skills/` deve estar na raiz do plugin, não dentro de `.claude-plugin/` |
| SETUP-02 | Skill `/pocket-knife:setup` para configuração conversacional do `~/.claude/.env` | Slash commands via `commands/setup.md` ou `skills/setup/SKILL.md`; Write tool disponível para criar o arquivo |
| SETUP-03 | Resolução híbrida de chaves: env var existente → `~/.claude/.env` → mensagem guiando para setup | Padrão bash `${VAR:-$(grep VAR ~/.claude/.env)}` documentado; fallback para mensagem é padrão bash |
| QUAL-01 | Todas as skills com side effects usam `disable-model-invocation: true` | Campo `disable-model-invocation` confirmado na spec oficial; remove skill do contexto de Claude quando `true` |
| QUAL-02 | Todas as skills usam `allowed-tools: Bash(curl *)` em vez de `Bash(*)` | Campo `allowed-tools` confirmado; sintaxe `Bash(curl *)` para restringir apenas a curl |
| QUAL-03 | Scripts curl usam flag `-f` e checam HTTP status code para erros claros | Padrão de erro curl documentado em PITFALLS.md com exemplos concretos |
| QUAL-04 | Nenhuma API key hardcoded — todas vêm do `~/.claude/.env` | Contrato de segurança: nunca `set -x`, nunca echo de valores, validar com `[ -z "$VAR" ]` |
| QUAL-05 | Skills compatíveis com Claude Code >= 1.0.33 | Versão 1.0.33+ confirmada como requisito mínimo para sistema de plugins |
| QUAL-06 | Descrições de skills concisas (<100 chars) para não estourar budget de 16K chars | Budget de 16K chars documentado; `SLASH_COMMAND_TOOL_CHAR_BUDGET` como override |
| DIST-01 | Repositório público no GitHub com estrutura de plugin válida | Estrutura padrão de plugin documentada; `claude plugin validate .` para validação |
| DIST-02 | Suporte a `/plugin marketplace add` e `/plugin install` via GitHub | Formato marketplace.json documentado; fonte GitHub: `{"source": "github", "repo": "owner/repo"}` |
| DIST-03 | `marketplace.json` configurado em `.claude-plugin/` | Schema completo de marketplace.json documentado; campo `plugins` com `name` e `source` |
</phase_requirements>

---

## Summary

A Phase 1 entrega o esqueleto funcional do plugin pocket-knife: um repositório que o Claude Code reconhece como plugin válido, um loader de variáveis de ambiente que roda uma vez por sessão via SessionStart hook, um skill de setup conversacional, e toda a higiene de repositório necessária para as 85+ skills que virão nas fases seguintes.

As decisões arquiteturais desta fase têm efeito cascata sobre todas as 85+ skills. A estrutura de diretórios, o contrato de segurança do loader, a política de `disable-model-invocation`, e o controle de budget de descrições devem ser estabelecidos antes que qualquer skill seja escrita. Refatorar essas decisões depois custa 85x o esforço.

Todos os componentes desta fase têm especificação oficial completa e verificada: plugin.json schema, hooks.json format, SKILL.md frontmatter, e marketplace.json schema foram todos confirmados via documentação oficial do Claude Code em code.claude.com. Confiança geral HIGH.

**Recomendação principal:** Construir na ordem: plugin.json → .gitattributes → hooks.json + load-env.sh → commands/setup.md → marketplace.json → README + LICENSE. Verificar com `claude plugin validate .` antes de avançar.

---

## Project Constraints (from CLAUDE.md)

Conforme `~/.claude/CLAUDE.md` (regras globais do usuário):

- **Idioma:** Sempre responder em português
- **Conduta:** Jamais implementar funcionalidades sem ordem explícita do usuário; seguir tarefas do planejamento sem pular etapas; enviar mensagem de conclusão ao terminar cada tarefa
- **MCPs Obrigatórios:** Playwright para testes visuais/front-end/back-end; Sequential Thinking para raciocínios profundos e soluções complexas em código

**Implicações para esta fase:**
- O planejamento deve ser seguido sequencialmente sem pular tasks
- Sequential Thinking deve ser usado para decisões complexas durante implementação

---

## Standard Stack

### Core (Plugin Runtime — sem dependências npm)

| Componente | Versão | Propósito | Por que padrão |
|------------|--------|-----------|----------------|
| SKILL.md (Agent Skills spec) | agentskills.io open standard | Definição de skills | Padrão aberto oficial adotado pelo Claude Code, OpenCode, Cursor e 40+ agentes |
| YAML frontmatter | — | Metadados da skill (name, description, allowed-tools) | Obrigatório pela spec Agent Skills; parseado por todos os agentes compatíveis |
| `plugin.json` manifest | Claude Code 1.0.33+ | Identidade e namespace do plugin | Obrigatório para registro como plugin Claude Code; habilita `/plugin install` e marketplace |
| `marketplace.json` | Claude Code 1.0.33+ | Catálogo de distribuição | Obrigatório para listagem no marketplace; habilita `/plugin marketplace add` |
| `hooks/hooks.json` | Claude Code 1.0.33+ | Hook de evento SessionStart | Único mecanismo para injetar env vars antes de qualquer skill rodar |
| Bash (POSIX sh + bash 4+) | sistema | Implementação do loader e scripts de skills | Claude Code's Bash tool executa bash; disponível em todos os alvos |
| curl | 7.x+ (sistema) | Chamadas HTTP para APIs dos provedores | Zero dependência; disponível em macOS/Linux/WSL; suficiente para todas as APIs REST em escopo |

### Dependências CLI (apenas `npx pocket-knife init` — fora de escopo desta fase)

| Biblioteca | Versão | Propósito | Quando usar |
|------------|--------|-----------|-------------|
| @inquirer/prompts | ^7.x | Prompts interativos | Preferida sobre `inquirer` legado; ESM-nativa, mantida pelo mesmo autor |
| chalk | ^5.x | Output colorido no terminal | ESM-only desde v5; compatível com projetos Node.js ESM modernos |
| dotenv | ^16.x | Ler/escrever arquivos `.env` | Para o CLI de setup ler o `~/.claude/.env` existente antes de adicionar chaves |
| fs-extra | ^11.x | Criação confiável de diretórios com mkdirp | Cross-platform, elimina checks manuais |
| Node.js | 22 LTS (18+ mínimo) | Runtime do CLI `npx pocket-knife init` | Claude Code requer Node 18+; 22 LTS tem 12% startup mais rápido |

> **Nota:** As dependências CLI são para a fase 5 (SETUP-01). Esta fase não instala nenhum pacote npm.

### Ferramentas de Desenvolvimento

| Ferramenta | Propósito |
|------------|-----------|
| `claude plugin validate .` | Valida plugin.json + frontmatter de todas as skills |
| `claude --plugin-dir ./pocket-knife` | Testa plugin localmente sem instalar |
| `/reload-plugins` (in-session) | Live-reload após edições de SKILL.md |
| `/context` (in-session) | Verifica se skills estão dentro do budget de 16K chars |

**Verificação de versões (npm — apenas referência para fase 5):**
```bash
npm view @inquirer/prompts version  # 7.x
npm view chalk version              # 5.x
npm view dotenv version             # 16.x
npm view fs-extra version           # 11.x
```

---

## Architecture Patterns

### Estrutura de Diretórios Recomendada

```
pocket-knife/                         # Raiz do plugin
├── .claude-plugin/
│   ├── plugin.json                   # Manifesto do plugin (namespace, versão, metadados)
│   └── marketplace.json              # Catálogo de distribuição (aponta para este repo)
│
├── skills/                           # RAIZ do plugin — NÃO dentro de .claude-plugin/
│   ├── image/
│   │   └── ai-image-generation/
│   │       └── SKILL.md              # Placeholder (Phase 2+)
│   ├── audio/
│   ├── video/
│   ├── llm/
│   ├── search/
│   ├── social/
│   ├── sdk/
│   ├── ui/
│   └── guides/
│
├── hooks/
│   └── hooks.json                    # Hook SessionStart → load-env.sh
│
├── scripts/
│   └── load-env.sh                   # Loader de ~/.claude/.env
│
├── commands/
│   └── setup.md                      # /pocket-knife:setup wizard conversacional
│
├── .gitattributes                    # eol=lf para todos .sh e .md
├── README.md
└── LICENSE                           # MIT
```

**Nota crítica:** `skills/`, `hooks/`, `scripts/`, `commands/` devem estar na **raiz do plugin**, não dentro de `.claude-plugin/`. Apenas `plugin.json` e `marketplace.json` ficam em `.claude-plugin/`.

---

### Pattern 1: plugin.json — Manifesto do Plugin

**O que é:** Arquivo JSON em `.claude-plugin/plugin.json` que registra o plugin no Claude Code. Define o namespace `pocket-knife`, que namespeia todas as skills como `/pocket-knife:skill-name`.

**Quando usar:** Obrigatório para que o Claude Code reconheça o plugin.

**Campos confirmados:**
- `name` (string, obrigatório): identificador único em kebab-case. Define o namespace.
- `version` (string): versão semântica. Claude Code usa para detectar atualizações.
- `description` (string): breve descrição do plugin.
- `author` (object): `{name, email, url}`.
- `license` (string): identificador SPDX (ex: "MIT").
- `repository` (string): URL do repositório.
- `homepage` (string): URL de documentação.
- `keywords` (array): tags para descoberta.

**Exemplo (confirmado pela documentação oficial):**
```json
{
  "name": "pocket-knife",
  "version": "1.0.0",
  "description": "85+ AI skills (image, video, audio, LLM, search) using your own API keys — no paid proxy.",
  "author": {
    "name": "pocket-knife contributors",
    "url": "https://github.com/owner/pocket-knife"
  },
  "license": "MIT",
  "repository": "https://github.com/owner/pocket-knife",
  "keywords": ["ai", "skills", "image", "audio", "video", "llm", "search"]
}
```

**Fonte:** https://code.claude.com/docs/en/plugins-reference (HIGH confidence — documentação oficial)

---

### Pattern 2: hooks.json — SessionStart Env Loader

**O que é:** Arquivo JSON em `hooks/hooks.json` que define handlers de eventos do Claude Code. O hook `SessionStart` dispara quando uma sessão começa, antes de qualquer skill rodar.

**Quando usar:** Único mecanismo para disponibilizar env vars para todas as skills sem boilerplate per-skill.

**Formato confirmado (`hooks/hooks.json`):**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/load-env.sh"
          }
        ]
      }
    ]
  }
}
```

**`${CLAUDE_PLUGIN_ROOT}` — variável de ambiente do plugin:**
- Resolve para o caminho absoluto do diretório de instalação do plugin.
- Disponível em: comandos de hook, configs de MCP/LSP, conteúdo de skills e agents.
- Também exportada como variável de ambiente para subprocessos do hook e do MCP.
- Muda quando o plugin é atualizado — NÃO usar para arquivos que devem persistir entre atualizações (usar `${CLAUDE_PLUGIN_DATA}` para isso).

**Fonte:** https://code.claude.com/docs/en/plugins-reference — seção "Environment variables" (HIGH confidence)

**Hook sem `matcher` é válido para SessionStart:**
O campo `matcher` é usado para eventos como `PostToolUse` para filtrar por ferramenta. Para `SessionStart`, nenhum `matcher` é necessário — o hook dispara uma vez por sessão.

---

### Pattern 3: load-env.sh — Loader Seguro

**O que é:** Script bash que lê `~/.claude/.env` e exporta todas as variáveis para o ambiente do shell. Deve ser escrito com o contrato de segurança estabelecido antes de qualquer skill.

**Quando usar:** Executado pelo hook SessionStart. Roda uma vez por sessão.

**Implementação recomendada:**
```bash
#!/usr/bin/env bash
# scripts/load-env.sh
# Loads ~/.claude/.env into the shell environment for the current Claude Code session.
# SECURITY CONTRACT:
#   - Never use set -x (would print key values to stderr)
#   - Never echo or log variable values
#   - File existence is checked before sourcing

ENV_FILE="$HOME/.claude/.env"

if [ -f "$ENV_FILE" ]; then
  set -o allexport
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +o allexport
fi
```

**Contrato de segurança (QUAL-04):**
- Nunca usar `set -x` — imprimiria valores de chaves no stderr (capturado pelo Claude)
- Nunca usar `echo $VAR` ou similar para debug
- Validar presença com `[ -z "$VAR" ]`, nunca imprimindo o valor
- `set -o allexport` / `set +o allexport` exporta todas as variáveis do arquivo sem precisar de `export` explícito

**Requisito de permissão:** O script deve ter bit de execução (`chmod +x scripts/load-env.sh`). Sem isso, o hook falhará silenciosamente.

---

### Pattern 4: SKILL.md — Formato de Skill

**O que é:** Arquivo markdown com frontmatter YAML que define uma skill do Claude Code. O frontmatter define comportamento; o corpo em markdown são as instruções que o Claude segue.

**Campos confirmados do frontmatter (documentação oficial):**

| Campo | Obrigatório | Tipo | Descrição |
|-------|-------------|------|-----------|
| `name` | Não | string | Nome da skill em kebab-case, máx 64 chars. Se omitido, usa o nome do diretório. |
| `description` | Recomendado | string | O que a skill faz e quando usar. Claude usa para decidir quando invocar automaticamente. |
| `argument-hint` | Não | string | Hint mostrado no autocomplete (`/`) para indicar argumentos esperados. Ex: `[text] [voice-id]` |
| `disable-model-invocation` | Não | boolean | `true` = apenas invocação manual via `/nome`. Remove a skill do contexto do Claude. Padrão: `false`. |
| `user-invocable` | Não | boolean | `false` = oculta do menu `/`. Apenas Claude invoca. Padrão: `true`. |
| `allowed-tools` | Não | string | Ferramentas que Claude pode usar sem pedir permissão quando esta skill está ativa. |
| `model` | Não | string | Modelo a usar quando esta skill está ativa. |
| `effort` | Não | string | Nível de esforço: `low`, `medium`, `high`, `max`. |
| `context` | Não | string | `fork` = roda em contexto de subagent isolado. |
| `agent` | Não | string | Qual subagent usar quando `context: fork` está definido. |
| `hooks` | Não | object | Hooks com escopo ao ciclo de vida desta skill. |
| `shell` | Não | string | `bash` (padrão) ou `powershell` para blocos `` !`command` ``. |

**Comportamento por configuração de `disable-model-invocation` e `user-invocable`:**

| Configuração | Você pode invocar | Claude pode invocar | Quando carrega no contexto |
|-------------|-------------------|---------------------|---------------------------|
| (padrão) | Sim | Sim | Descrição sempre no contexto; conteúdo completo ao invocar |
| `disable-model-invocation: true` | Sim | Não | Descrição NÃO no contexto; conteúdo completo ao invocar manualmente |
| `user-invocable: false` | Não | Sim | Descrição sempre no contexto; conteúdo completo ao invocar |

**Implicação para QUAL-01/QUAL-02:** Skills com side effects devem usar `disable-model-invocation: true` para:
1. Prevenir Claude de gastar créditos de API sem solicitação explícita
2. Remover a descrição do budget de contexto de 16K chars (benefício duplo!)

**Exemplo de SKILL.md para skill de setup (SETUP-02):**
```yaml
---
name: setup
description: Configure API keys in ~/.claude/.env for pocket-knife skills
disable-model-invocation: true
user-invocable: true
allowed-tools: Write, Read
argument-hint: "[provider-category]"
---

Guide the user through configuring their API keys in ~/.claude/.env.

...instruções conversacionais...
```

**Fonte:** https://code.claude.com/docs/en/skills — seção "Frontmatter reference" (HIGH confidence)

---

### Pattern 5: commands/setup.md — Setup Wizard Conversacional

**O que é:** Arquivo markdown em `commands/setup.md` que cria o slash command `/pocket-knife:setup`. É mais simples que uma skill completa (não precisa de diretório com `SKILL.md`) e suficiente para um wizard conversacional.

**Quando usar:** Para o wizard de setup conversacional (SETUP-02). Alternativa a `skills/setup/SKILL.md` — ambas funcionam; `commands/` é mais simples para comandos sem arquivos de suporte.

**Nota da documentação oficial:** "Custom commands have been merged into skills. A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way."

**Decisão de implementação:** Usar `commands/setup.md` (mais simples, sem necessidade de diretório) para Phase 1. Skills de skill-category podem ser adicionadas depois via `skills/`.

---

### Pattern 6: marketplace.json — Catálogo de Distribuição

**O que é:** Arquivo JSON em `.claude-plugin/marketplace.json` que define um marketplace de plugins para o Claude Code. Permite que usuários instalem o plugin via `/plugin marketplace add` e `/plugin install`.

**Campos obrigatórios:**
- `name` (string): identificador do marketplace em kebab-case.
- `owner` (object): `{name: string, email?: string}`.
- `plugins` (array): lista de plugins com `name` e `source`.

**Formato para distribuição via GitHub (confirmado):**
```json
{
  "name": "pocket-knife",
  "owner": {
    "name": "pocket-knife contributors"
  },
  "plugins": [
    {
      "name": "pocket-knife",
      "source": ".",
      "description": "85+ AI skills using your own API keys — no paid proxy.",
      "version": "1.0.0",
      "license": "MIT",
      "keywords": ["ai", "skills", "image", "audio", "video", "llm", "search"]
    }
  ]
}
```

**Alternativa — source GitHub explícito:**
```json
{
  "source": {
    "source": "github",
    "repo": "owner/pocket-knife"
  }
}
```

**Nomes reservados:** `claude-code-marketplace`, `claude-code-plugins`, `anthropic-marketplace`, e variantes similares são reservados pela Anthropic. Usar `"pocket-knife"` como nome do marketplace é válido.

**Fonte:** https://code.claude.com/docs/en/plugin-marketplaces (HIGH confidence)

---

### Pattern 7: .gitattributes — Prevenção de CRLF

**O que é:** Arquivo de configuração Git que força line endings LF em arquivos específicos, independente da configuração `core.autocrlf` do sistema do usuário.

**Por que crítico (FOUND-03):** Git for Windows converte LF para CRLF por padrão (`core.autocrlf=true`). Sem `.gitattributes`, scripts bash clonados no Windows terão shebang `#!/bin/bash\r`, causando `bad interpreter: No such file or directory`.

**Implementação recomendada:**
```
# .gitattributes
* text=auto
*.sh text eol=lf
*.md text eol=lf
*.json text eol=lf
```

**Nota:** Deve ser o PRIMEIRO arquivo criado no repositório, antes de qualquer script `.sh`. Para repositórios existentes com arquivos já commitados com CRLF, executar: `git add --renormalize .`

---

### Pattern 8: Resolução Híbrida de Chaves (SETUP-03)

**O que é:** Padrão bash para buscar uma API key de múltiplas fontes em ordem de prioridade: (1) variável de ambiente já definida → (2) arquivo `~/.claude/.env` → (3) mensagem guiando para `/pocket-knife:setup`.

**Implementação recomendada para cada skill:**
```bash
# Exemplo de resolução híbrida (a ser incluído no corpo de cada SKILL.md)
GOOGLE_API_KEY="${GOOGLE_API_KEY:-$(grep -m1 '^GOOGLE_API_KEY=' ~/.claude/.env 2>/dev/null | cut -d= -f2-)}"

if [ -z "$GOOGLE_API_KEY" ]; then
  echo "ERROR: GOOGLE_API_KEY not found."
  echo "Run /pocket-knife:setup to configure your API keys, or add GOOGLE_API_KEY to ~/.claude/.env"
  exit 1
fi
```

**Nota:** Com o SessionStart hook funcionando, este padrão raramente é necessário (as chaves já estarão no ambiente). É o fallback para quando o hook não rodou ou a variável específica não está no `.env`.

---

### Anti-Padrões a Evitar

- **Skills dentro de `.claude-plugin/`:** Claude Code só procura por `plugin.json` em `.claude-plugin/`. Skills, hooks, scripts devem ficar na raiz do plugin.
- **`source ~/.claude/.env` em cada SKILL.md:** Duplica boilerplate em 85+ arquivos. Usar o hook SessionStart.
- **API keys hardcoded em SKILL.md:** Arquivos SKILL.md ficam no repositório GitHub público. Sempre referenciar `$PROVIDER_API_KEY`.
- **`set -x` no load-env.sh:** Imprime todos os valores de variáveis no stderr, incluindo as API keys.
- **`allowed-tools: Bash(*)`:** Dá acesso irrestrito ao bash. Usar `Bash(curl *)` para skills de API.
- **Commits sem `chmod +x` no script:** O hook falha silenciosamente se `load-env.sh` não for executável.

---

## Don't Hand-Roll

| Problema | Não Construir | Usar Em Vez Disso | Por Quê |
|----------|---------------|-------------------|---------|
| Injeção de env vars em skills | Sourcing em cada skill | `hooks/hooks.json` SessionStart | 85+ skills herdam automaticamente; zero boilerplate |
| Instalação do plugin | Script de instalação personalizado | `/plugin install` + marketplace.json | Claude Code tem sistema nativo de instalação |
| Validação de plugin.json | Parser JSON manual | `claude plugin validate .` | Ferramenta oficial detecta erros de schema e frontmatter |
| Navegação de API keys | Sistema de secrets próprio | `~/.claude/.env` + set -o allexport | Padrão simples, fora de repositórios, não conflita com `.env` de projetos |
| Formatação de output do setup | Lógica de display customizada | Claude nativo via `commands/setup.md` | Claude Code formata output; o wizard é conversacional |

---

## Common Pitfalls

### Pitfall 1: Skills Dentro de `.claude-plugin/`

**O que dá errado:** Developer cria `.claude-plugin/skills/` pensando ser o diretório de skills.
**Por que acontece:** Nome sugestivo do diretório de metadados induz ao erro.
**Como evitar:** Apenas `plugin.json` e `marketplace.json` ficam em `.claude-plugin/`. Skills, hooks, scripts ficam na raiz do plugin.
**Sinal de alerta:** Plugin carrega mas skills não aparecem no menu `/`.

---

### Pitfall 2: Hook Não Dispara por Falta de Permissão de Execução

**O que dá errado:** `hooks/hooks.json` está configurado corretamente, mas `load-env.sh` nunca roda. Nenhum erro visível.
**Por que acontece:** Git não preserva bits de execução em todos os sistemas. Scripts clonados podem perder `chmod +x`.
**Como evitar:** Documentar no README que o script precisa de `chmod +x scripts/load-env.sh`. Verificar com `ls -la scripts/`.
**Sinal de alerta:** API keys disponíveis no `.env` mas não no ambiente do shell durante skills.

---

### Pitfall 3: CRLF em Scripts Bash (Windows)

**O que dá errado:** `bad interpreter: /usr/bin/env bash^M: No such file or directory` em sistemas Windows/WSL.
**Por que acontece:** Git for Windows com `core.autocrlf=true` converte LF para CRLF no checkout.
**Como evitar:** Adicionar `.gitattributes` com `*.sh text eol=lf` ANTES de criar qualquer script.
**Sinal de alerta:** Funciona no Mac/Linux, quebra no Windows/WSL.

---

### Pitfall 4: Budget de Descrições Excedido (16K chars)

**O que dá errado:** Skills acima do limite são silenciosamente excluídas. `/` autocomplete mostra menos skills que o esperado.
**Por que acontece:** Budget de 2% do context window (fallback 16K chars). 85 skills com descrições de 200 chars = 17K chars — acima do limite.
**Como evitar:** Manter descrições abaixo de 100 chars. Skills com `disable-model-invocation: true` NÃO contam para o budget. Verificar com `/context` após instalar.
**Sinal de alerta:** `<!-- Showing 42 of 63 skills -->` em `/context`. Usuários reportam skills "não funcionando".

---

### Pitfall 5: `set -x` Vazando API Keys

**O que dá errado:** Todas as expansões de variáveis, incluindo valores de API keys, são impressas no stderr e capturadas pelo Claude.
**Por que acontece:** Hábito de debugging bash. Seguro em ambientes isolados, perigoso quando stdout/stderr é capturado por uma IA.
**Como evitar:** Nunca usar `set -x` em `load-env.sh` ou em qualquer script de skill.
**Sinal de alerta:** Output do Claude contém `+` ou `++` antes de linhas — sinal de `set -x` ativo.

---

### Pitfall 6: marketplace.json com Nome Reservado

**O que dá errado:** Claude Code rejeita o marketplace na instalação.
**Por que acontece:** Nomes como `claude-code-marketplace`, `anthropic-*` são reservados pela Anthropic.
**Como evitar:** Usar `pocket-knife` como nome do marketplace — verificado como não reservado.
**Sinal de alerta:** Erro ao executar `/plugin marketplace add`.

---

## Code Examples

### plugin.json completo verificado

```json
{
  "name": "pocket-knife",
  "version": "1.0.0",
  "description": "85+ AI skills (image, video, audio, LLM, search) using your own API keys.",
  "author": {
    "name": "pocket-knife contributors",
    "url": "https://github.com/owner/pocket-knife"
  },
  "license": "MIT",
  "repository": "https://github.com/owner/pocket-knife",
  "keywords": ["ai", "skills", "image", "audio", "video", "llm", "search"]
}
```
Fonte: https://code.claude.com/docs/en/plugins-reference (HIGH)

---

### hooks.json SessionStart (formato exato verificado)

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/load-env.sh"
          }
        ]
      }
    ]
  }
}
```
Fonte: https://code.claude.com/docs/en/plugins-reference — seção "Hooks" (HIGH)

---

### load-env.sh com contrato de segurança

```bash
#!/usr/bin/env bash
# scripts/load-env.sh
# Loads ~/.claude/.env into the shell environment once per Claude Code session.
#
# SECURITY CONTRACT:
#   - NEVER use set -x (leaks key values to stderr, captured by Claude)
#   - NEVER echo or log variable values
#   - Check key presence with [ -z "$VAR" ], never by printing value
#   - File is sourced only if it exists

ENV_FILE="$HOME/.claude/.env"

if [ -f "$ENV_FILE" ]; then
  set -o allexport
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +o allexport
fi
```
Fonte: Padrão bash documentado + PITFALLS.md (HIGH)

---

### SKILL.md mínimo com segurança (placeholder para Phase 1)

```yaml
---
name: setup
description: Configure API keys in ~/.claude/.env for pocket-knife skills
disable-model-invocation: true
user-invocable: true
allowed-tools: Write, Read
argument-hint: "[provider-category]"
---

I'll help you configure your API keys for pocket-knife skills.

## What you'll need

pocket-knife uses your own API keys stored in `~/.claude/.env`. I'll guide you through setting them up.

Which provider category do you want to configure?

- **image** — Google Gemini, fal.ai (FLUX)
- **audio** — ElevenLabs (TTS, STT, music)
- **video** — Google Veo
- **llm** — Claude, Gemini, Grok
- **search** — Tavily, Exa

Tell me which category you want to start with, and I'll ask for the required keys.

---

*After configuration, restart Claude Code or run `/reload-plugins` to apply the new keys.*
```
Fonte: https://code.claude.com/docs/en/skills — seção "Frontmatter reference" (HIGH)

---

### marketplace.json para distribuição via GitHub

```json
{
  "name": "pocket-knife",
  "owner": {
    "name": "pocket-knife contributors"
  },
  "metadata": {
    "description": "Open-source AI skills plugin for Claude Code — 85+ skills using your own API keys."
  },
  "plugins": [
    {
      "name": "pocket-knife",
      "source": ".",
      "description": "85+ AI skills (image, video, audio, LLM, search) using your own API keys. No paid proxy.",
      "version": "1.0.0",
      "license": "MIT",
      "keywords": ["ai", "skills", "image", "audio", "video", "llm"],
      "homepage": "https://github.com/owner/pocket-knife"
    }
  ]
}
```
Fonte: https://code.claude.com/docs/en/plugin-marketplaces (HIGH)

---

### .gitattributes para prevenção de CRLF

```
# .gitattributes
* text=auto
*.sh text eol=lf
*.md text eol=lf
*.json text eol=lf
```
Fonte: PITFALLS.md + documentação Git (HIGH)

---

### Resolução híbrida de chaves em skill body

```bash
# Resolve API key: env var already set → ~/.claude/.env → guide to setup
GOOGLE_API_KEY="${GOOGLE_API_KEY:-$(grep -m1 '^GOOGLE_API_KEY=' "$HOME/.claude/.env" 2>/dev/null | cut -d= -f2-)}"

if [ -z "$GOOGLE_API_KEY" ]; then
  echo "ERROR: GOOGLE_API_KEY not found."
  echo ""
  echo "To fix this:"
  echo "  1. Run /pocket-knife:setup to configure interactively, OR"
  echo "  2. Add GOOGLE_API_KEY=your-key-here to ~/.claude/.env"
  exit 1
fi
```
Fonte: Padrão bash padrão (HIGH)

---

### Verificação de skill com curl -f e checagem de HTTP status (QUAL-03)

```bash
HTTP_STATUS=$(curl -s -o output.json -w "%{http_code}" \
  -X POST "https://api.example.com/generate" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "'"$ARGUMENTS"'"}')

if [ "$HTTP_STATUS" != "200" ]; then
  echo "ERROR: API returned HTTP $HTTP_STATUS"
  if [ -f output.json ]; then
    cat output.json
  fi
  exit 1
fi

if [ ! -s output.json ]; then
  echo "ERROR: Empty response from API"
  exit 1
fi
```
Fonte: PITFALLS.md (HIGH)

---

## State of the Art

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|-----------------|-----------------|--------------|---------|
| `commands/` para slash commands | `skills/[name]/SKILL.md` para skills com arquivos de suporte | Claude Code 2025 | `commands/` ainda funciona; skills adicionam recursos opcionais (diretório de suporte, frontmatter avançado) |
| `inquirer` (CJS legado) | `@inquirer/prompts` v7 (ESM) | npm / atualização 2024 | `inquirer` antigo é não mantido; usar `@inquirer/prompts` para CLI |
| `Bash(*)` em allowed-tools | `Bash(curl *)` restrito | Boas práticas de segurança | Reduz blast radius de permissões; sinaliza fronteiras de confiança |

**Depreciado:**
- `inquirer` (pré-v9): substituído por `@inquirer/prompts`
- Colocar skills dentro de `.claude-plugin/`: nunca funcionou — skills devem estar na raiz do plugin

---

## Open Questions

1. **Diretório raiz do repo vs subdiretório do marketplace**
   - O que sabemos: `marketplace.json` com `"source": "."` aponta para a raiz do plugin (o próprio repo). O repo é simultaneamente o plugin E o host do marketplace.
   - O que não está claro: Se o plugin pocket-knife e o marketplace estão no mesmo repo (repo = plugin = marketplace), há ambiguidade sobre se o marketplace deve estar em `.claude-plugin/marketplace.json` ou em um repo separado.
   - Recomendação: Estrutura mais simples — único repo onde `.claude-plugin/plugin.json` é o manifesto do plugin e `.claude-plugin/marketplace.json` é o catálogo que aponta para `"source": "."`. Usuários adicionam com `/plugin marketplace add owner/pocket-knife` e instalam com `/plugin install pocket-knife@pocket-knife`.

2. **Permissão de execução em scripts via GitHub**
   - O que sabemos: Git preserva bits de execução no Linux/macOS. Windows/WSL pode perder o bit ao clonar.
   - O que não está claro: O sistema de instalação de plugins do Claude Code automaticamente faz `chmod +x` em scripts referenciados em hooks?
   - Recomendação: Documentar no README que é necessário `chmod +x scripts/load-env.sh` após clonagem manual. Para instalação via marketplace, adicionar nota de verificação na documentação.

3. **Budget exato por skill vs budget total**
   - O que sabemos: Budget total é 16K chars (fallback) ou 2% do context window. Skills com `disable-model-invocation: true` NÃO contam para o budget.
   - O que não está claro: O budget conta apenas as `description` fields ou o frontmatter completo?
   - Recomendação: Assumir que conta apenas `description`. Manter todas as descriptions abaixo de 100 chars. Verificar com `/context` após instalar.

---

## Environment Availability

| Dependência | Requerida Por | Disponível | Versão | Fallback |
|-------------|--------------|-----------|--------|----------|
| bash | load-env.sh, scripts de skills | ✓ | 5.2.37 (Git Bash / MSYS) | — |
| curl | skills (chamadas de API) | ✓ | 8.16.0 (mingw32) | — |
| git | Controle de versão, distribuição | ✓ | 2.51.1 (Windows) | — |
| Node.js | CLI `npx pocket-knife init` (Phase 5) | Não verificado | — | Fora de escopo desta fase |

**Nota sobre curl no Windows:** O curl disponível é o `curl.exe` real (mingw32), não o alias do PowerShell. Isso é adequado para os scripts de skills. Documentar no README que Windows users precisam de Git Bash (não PowerShell nativo).

**Dependências sem fallback (bloqueadores):** Nenhuma para esta fase — bash e curl estão disponíveis.

---

## Validation Architecture

### Test Framework

| Propriedade | Valor |
|-------------|-------|
| Framework | Validação manual via Claude Code CLI + inspeção de arquivos |
| Config file | Nenhum (sem framework de testes automatizados para esta fase) |
| Quick run command | `claude plugin validate .` |
| Full suite command | `claude plugin validate . && claude --plugin-dir . --debug` |

**Justificativa:** Esta fase entrega arquivos de configuração (JSON, bash, markdown) sem lógica de negócio testável via frameworks de teste automatizados. A validação é estrutural: o plugin é reconhecido pelo Claude Code? O hook dispara? As variáveis ficam disponíveis?

### Phase Requirements → Test Map

| Req ID | Comportamento | Tipo de Teste | Comando | Arquivo Existe? |
|--------|---------------|--------------|---------|-----------------|
| FOUND-01 | plugin.json válido e reconhecido | smoke | `claude plugin validate .` | ❌ Wave 0 |
| FOUND-02 | load-env.sh carrega variáveis | manual | Definir TEST_KEY em ~/.claude/.env; abrir sessão; verificar `echo $TEST_KEY` em Bash | ❌ Wave 0 |
| FOUND-03 | Scripts têm LF endings | automático | `file scripts/load-env.sh \| grep CRLF` (deve retornar vazio) | ❌ Wave 0 |
| FOUND-04 | README contém instruções de instalação | inspeção manual | Leitura do arquivo | ❌ Wave 0 |
| FOUND-05 | LICENSE existe e é MIT | inspeção manual | `head -1 LICENSE` deve conter "MIT" | ❌ Wave 0 |
| FOUND-06 | Estrutura de diretórios correta | inspeção manual | `ls skills/` | ❌ Wave 0 |
| SETUP-02 | `/pocket-knife:setup` aparece no menu `/` | manual | Abrir Claude Code com plugin instalado; digitar `/pocket-knife:` | ❌ Wave 0 |
| SETUP-03 | Resolução híbrida retorna erro amigável sem chave | manual | Remover variável do .env; invocar skill; verificar mensagem de erro | ❌ Wave 0 |
| QUAL-01 | Skills com side effects têm `disable-model-invocation: true` | inspeção | `grep -r "disable-model-invocation" skills/` | ❌ Wave 0 |
| QUAL-02 | Skills usam `allowed-tools: Bash(curl *)` | inspeção | `grep -r "allowed-tools" skills/` | ❌ Wave 0 |
| QUAL-05 | Plugin compatível com Claude Code >= 1.0.33 | smoke | `claude --version; claude plugin validate .` | ❌ Wave 0 |
| QUAL-06 | Descriptions < 100 chars | automático | `awk '/^description:/{print length($0)}' skills/*/SKILL.md \| awk '$1>100'` (deve retornar vazio) | ❌ Wave 0 |
| DIST-01 | Repositório com estrutura válida | smoke | `claude plugin validate .` | ❌ Wave 0 |
| DIST-02 | `/plugin install` e marketplace add funcionam | manual | Testar instalação em ambiente limpo | ❌ Wave 0 |
| DIST-03 | marketplace.json configurado | inspeção | `cat .claude-plugin/marketplace.json \| python3 -m json.tool` | ❌ Wave 0 |

### Sampling Rate

- **Por task commit:** `claude plugin validate .`
- **Por wave merge:** `claude plugin validate . && ls -la scripts/ && file scripts/load-env.sh`
- **Phase gate:** Plugin instalável + hook funcionando + setup command aparece no menu `/` + `claude plugin validate .` retorna sem erros

### Wave 0 Gaps

- [ ] Todos os arquivos desta fase são criados como parte da wave 0 (não existe nada ainda)
- [ ] Infraestrutura de teste é a própria CLI do Claude Code (`claude plugin validate`)
- [ ] Não há framework de testes a instalar — validação é manual e via CLI

---

## Sources

### Primary (HIGH confidence)
- https://code.claude.com/docs/en/plugins-reference — Schema completo de plugin.json, `${CLAUDE_PLUGIN_ROOT}`, formato de hooks, comportamento de caching
- https://code.claude.com/docs/en/skills — Todos os campos de frontmatter do SKILL.md, controle de invocação, budget de skills
- https://code.claude.com/docs/en/plugin-marketplaces — Formato de marketplace.json, distribuição via GitHub, schema completo
- https://code.claude.com/docs/en/plugins — Tutorial de criação de plugins, estrutura de diretórios, validação
- .planning/research/ARCHITECTURE.md — Decisões arquiteturais do projeto (diretório research interno)
- .planning/research/STACK.md — Stack recomendada e padrões de autenticação por provedor
- .planning/research/PITFALLS.md — 8 pitfalls críticos documentados com exemplos concretos
- .planning/research/SUMMARY.md — Sumário executivo e implicações para o roadmap

### Secondary (MEDIUM confidence)
- https://agentskills.io/specification — Especificação do padrão Agent Skills (base do SKILL.md)
- github.com/inference-sh/skills — Estrutura do projeto original (licença MIT, referência para port)

### Tertiary (LOW confidence)
- Nenhum — todos os claims críticos estão cobertos por fontes primárias

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verificado contra documentação oficial do Claude Code
- Architecture: HIGH — schemas confirmados via fetch direto das docs em code.claude.com
- Pitfalls: HIGH — pitfalls documentados em PITFALLS.md com fontes oficiais (issue tracker Anthropic, changelogs de providers)

**Research date:** 2026-03-26
**Valid until:** 2026-06-26 (90 dias — plataforma estável; verificar se Claude Code lança breaking changes no sistema de plugins)
