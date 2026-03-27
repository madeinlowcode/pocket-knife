# Retrospective: Pocket-Knife

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-27
**Phases:** 5 | **Plans:** 14 | **Tasks:** 23

### What Was Built
- Plugin Claude Code com 38 skills de IA em 9 categorias
- SessionStart hook + load-env.sh para carregamento centralizado de API keys
- Skill de setup conversacional + CLI interativa (npx pocket-knife init)
- 7 provedores integrados: Google, ElevenLabs, fal.ai, DashScope, Tavily, Exa, X/Twitter
- 7 guides de referência sem API key

### What Worked
- Pesquisa por fase com agentes paralelos acelerou decisões técnicas
- Padrão de validação batch (Phase 2) evitou retrabalho nas fases 3-5
- Separação de skills por padrão de API (JSON->binary, multipart, async polling) simplificou planejamento
- YOLO mode + parallel execution reduziu tempo de planejamento

### What Was Inefficient
- UAT revelou que disable-model-invocation estava false em 10 skills — deveria ter sido pego na execução
- Falsos positivos nos testes de segurança (grep por "xi-api-key" pega templates)

### Patterns Established
- curl -f para binary output, --fail-with-body para JSON responses
- fal.ai queue polling: POST -> queue_id -> GET status -> GET result
- ElevenLabs: 4 padrões distintos de request (JSON->binary, multipart->binary, multipart->JSON, async polling)
- Guide skills: allowed-tools: [], sem API key, < 300 linhas
- OAuth 1.0a via Node.js helper (scripts/post-tweet.mjs) usando node:crypto built-in

### Key Lessons
1. disable-model-invocation: true deve ser o DEFAULT para qualquer skill que faz API call — verificar automaticamente
2. Descriptions < 100 chars é constraint real para budget de 16K — monitorar ao adicionar skills
3. Skills bash com API keys reais não são testáveis estaticamente — validação manual é o caminho

### Cost Observations
- Model mix: balanced profile (sonnet para agents, opus para orchestration)
- Sessions: ~5 sessões paralelas
- Notable: pesquisadores paralelos (4x) economizaram ~50% do tempo de research

---

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 5 |
| Plans | 14 |
| Tasks | 23 |
| Skills shipped | 38 |
| LOC | 6,417 |
| Days | 2 |
