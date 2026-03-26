# Phase 3: Image, LLM, Search e Guides - Research

**Researched:** 2026-03-26
**Domain:** Skills de imagem (Google Gemini nativo, fal.ai FLUX/BiRefNet/Topaz, Alibaba DashScope Qwen), guides (zero-API-key, puro markdown)
**Confidence:** HIGH para Google Gemini e fal.ai; HIGH para Qwen/DashScope; MEDIUM para estrutura interna dos guides (requerem curadoria)

---

<phase_requirements>
## Phase Requirements

| ID | Descrição | Suporte de Pesquisa |
|----|-----------|---------------------|
| IMG-02 | Skill `nano-banana` — Gemini 3 Pro Image via `generateContent` (chave: `GOOGLE_API_KEY`) | Endpoint confirmado: `gemini-3-pro-image-preview:generateContent`; auth `x-goog-api-key`; resposta `inline_data` base64 |
| IMG-03 | Skill `nano-banana-2` — Gemini 3.1 Flash Image via `generateContent` (chave: `GOOGLE_API_KEY`) | Endpoint confirmado: `gemini-3.1-flash-image-preview:generateContent`; mesmo padrão do IMG-02 |
| IMG-04 | Skill `flux-image` — FLUX schnell via fal.ai (chave: `FAL_KEY`) | Endpoint: `queue.fal.run/fal-ai/flux/schnell`; auth `Authorization: Key $FAL_KEY`; async polling |
| IMG-05 | Skill `image-upscaling` — Topaz Upscaler via fal.ai (chave: `FAL_KEY`) | Model ID: `fal-ai/topaz/upscale/image`; mesmo padrão async do IMG-04 |
| IMG-06 | Skill `background-removal` — BiRefNet via fal.ai (chave: `FAL_KEY`) | Model ID: `fal-ai/birefnet`; mesmo padrão async do IMG-04 |
| IMG-07 | Skill `p-image` — Pruna P-Image via fal.ai (chave: `FAL_KEY`) | Original usa `infsh`; mapeado para `fal.ai` pois Pruna é parceiro fal.ai — modelo ID a confirmar |
| IMG-08 | Skill `qwen-image-2` — Qwen Image 2.0 via DashScope (chave: `DASHSCOPE_API_KEY`) | Endpoint: `dashscope-intl.aliyuncs.com`; auth `Authorization: Bearer`; modelo `qwen-image-2.0` |
| IMG-09 | Skill `qwen-image-2-pro` — Qwen Image 2.0 Pro via DashScope (chave: `DASHSCOPE_API_KEY`) | Igual IMG-08; modelo `qwen-image-2.0-pro`; endpoint multimodal-generation |
| GUIDE-01 | Skill `prompting-guide` — guia de prompt engineering (zero API key) | Mapeado para `guides/prompting/prompt-engineering` no inference-sh/skills |
| GUIDE-02 | Skill `design-guide` — guia de design (zero API key) | `guides/design/` — 10 sub-guides; escolher representativos |
| GUIDE-03 | Skill `video-guide` — guia de vídeo (zero API key) | `guides/video/` — 5 sub-guides + `guides/prompting/video-prompting-guide` |
| GUIDE-04 | Skill `writing-guide` — guia de escrita (zero API key) | `guides/writing/` — 5 sub-guides |
| GUIDE-05 | Skill `social-guide` — guia de mídias sociais (zero API key) | `guides/social/` — 4 sub-guides |
| GUIDE-06 | Skill `product-guide` — guia de produto (zero API key) | `guides/product/` — 4 sub-guides |
| GUIDE-07 | Demais guides (zero API key) | `guides/content/` — 4 sub-guides; `guides/photo/` — 2 sub-guides |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Idioma:** Sempre responder em português
- **Conduta:** Jamais implementar funcionalidades sem ordem explícita do usuário; seguir tarefas do planejamento sem pular etapas; enviar mensagem de conclusão ao terminar cada tarefa
- **MCPs Obrigatórios:** Sequential Thinking para raciocínios profundos e soluções complexas em código
- **Implicações para esta fase:** Sequential Thinking deve ser usado para o design do padrão async de polling fal.ai e para o mapeamento de todos os 30+ sub-guides em skills consolidadas

---

## Summary

A Phase 3 porta 8 skills de imagem restantes e todos os guides. O padrão de skills já está estabelecido pela Phase 2 — esta fase é principalmente replicação mecânica com as APIs corretas para cada provedor.

**Descoberta crítica sobre skills originais do inference.sh:** Todas as skills originais (`nano-banana`, `nano-banana-2`, `flux-image`, `background-removal`, `image-upscaling`, `p-image`, `qwen-image-2`, `qwen-image-2-pro`) usam `infsh app run [provedor/modelo]` — ou seja, chamam o CLI do inference.sh como proxy. O pocket-knife substitui cada uma delas por chamadas diretas ao provedor real. O mapeamento é:
- `google/gemini-3-pro-image-preview` → API direta Google `generativelanguage.googleapis.com`
- `falai/flux-*`, `falai/birefnet`, `falai/topaz-image-upscaler` → API direta fal.ai `queue.fal.run`
- `alibaba/qwen-image-2`, `alibaba/qwen-image-2-pro` → API direta Alibaba `dashscope-intl.aliyuncs.com`
- `pruna/p-image` → Pruna é parceiro fal.ai; endpoint a confirmar como `fal-ai/pruna-p-image` ou similar

**Guides são zero-API-key:** São documentos de referência pura (guias de prompting, design, vídeo, escrita, social, produto). O SKILL.md contém o guia completo no corpo — sem curl, sem chave. `allowed-tools: Bash(infsh *)` no original pode ser trocado por `allowed-tools: []` ou omitido — guides não precisam de nenhuma ferramenta.

**Budget de descrições (QUAL-06):** Com 8 image skills + ~10 guide skills (consolidados de 30+ sub-guides em 7+ skills top-level), o total de skills do plugin após Phase 3 será ~18 skills. Cada descrição deve ter menos de 100 chars. Risco identificado: guias originais têm descriptions longas com Triggers (~400 chars). Devem ser truncadas.

**Recomendação principal:** Implementar image skills primeiro (dependem de APIs externas — mais risco), depois guide skills (pure-content, zero risco de API). Dentro das image skills, fazer Gemini primeiro (reutiliza padrão da Phase 2), depois fal.ai batch (mesmo padrão de polling), depois Qwen (novo provedor).

---

## Standard Stack

### Core (igual à Phase 2 — sem novas dependências)

| Componente | Versão | Propósito | Por que padrão |
|------------|--------|-----------|----------------|
| SKILL.md (Agent Skills spec) | agentskills.io | Definição de skill | Confirmado Phases 1-2 |
| curl | 7.76+ (sistema) | Chamadas HTTP às APIs | `--fail-with-body`; QUAL-03 padrão |
| Bash (POSIX sh + bash 4+) | sistema | Scripts de API call | Sem nova dependência |
| python3 | sistema (3.x) | Decodificar base64 de resposta | Disponível em todos os targets; usado no padrão Gemini da Phase 2 |

### APIs dos Provedores (novos nesta fase)

| Provedor | Endpoint Base | Auth Header | Env Var | Modelo | Confidence |
|----------|---------------|-------------|---------|--------|------------|
| Google Gemini Image (nativo) | `https://generativelanguage.googleapis.com/v1beta/models/` | `x-goog-api-key: $GOOGLE_API_KEY` | `GOOGLE_API_KEY` | `gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview` | HIGH |
| fal.ai (queue) | `https://queue.fal.run/` | `Authorization: Key $FAL_KEY` | `FAL_KEY` | `fal-ai/flux/schnell`, `fal-ai/birefnet`, `fal-ai/topaz/upscale/image` | HIGH |
| Alibaba DashScope (intl) | `https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation` | `Authorization: Bearer $DASHSCOPE_API_KEY` | `DASHSCOPE_API_KEY` | `qwen-image-2.0` / `qwen-image-2.0-pro` | HIGH |
| Pruna P-Image via fal.ai | `https://queue.fal.run/` | `Authorization: Key $FAL_KEY` | `FAL_KEY` | a confirmar (provável `fal-ai/pruna/p-image`) | LOW — requer verificação |

**Nota sobre p-image:** O skill original usa `infsh app run pruna/p-image` via inference.sh. Pruna é um parceiro comercial da fal.ai. A página do modelo no fal.ai existe mas o ID exato precisa ser confirmado antes da implementação.

---

## Architecture Patterns

### Estrutura de diretórios (Phase 3 — skills a criar)

```
skills/
├── image/
│   ├── nano-banana/
│   │   └── SKILL.md           # IMG-02 — Gemini 3 Pro Image
│   ├── nano-banana-2/
│   │   └── SKILL.md           # IMG-03 — Gemini 3.1 Flash Image
│   ├── flux-image/
│   │   └── SKILL.md           # IMG-04 — FLUX schnell via fal.ai
│   ├── image-upscaling/
│   │   └── SKILL.md           # IMG-05 — Topaz via fal.ai
│   ├── background-removal/
│   │   └── SKILL.md           # IMG-06 — BiRefNet via fal.ai
│   ├── p-image/
│   │   └── SKILL.md           # IMG-07 — Pruna P-Image via fal.ai
│   ├── qwen-image-2/
│   │   └── SKILL.md           # IMG-08 — Qwen Image 2.0 via DashScope
│   └── qwen-image-2-pro/
│       └── SKILL.md           # IMG-09 — Qwen Image 2.0 Pro via DashScope
└── guides/
    ├── prompting-guide/
    │   └── SKILL.md           # GUIDE-01 — prompt engineering
    ├── design-guide/
    │   └── SKILL.md           # GUIDE-02 — design (10 sub-guides)
    ├── video-guide/
    │   └── SKILL.md           # GUIDE-03 — video + video prompting
    ├── writing-guide/
    │   └── SKILL.md           # GUIDE-04 — writing (5 sub-guides)
    ├── social-guide/
    │   └── SKILL.md           # GUIDE-05 — social (4 sub-guides)
    ├── product-guide/
    │   └── SKILL.md           # GUIDE-06 — product (4 sub-guides)
    └── content-guide/
        └── SKILL.md           # GUIDE-07 — content + photo (6 sub-guides)
```

**Nota:** O `skills/guides/` não existe ainda — Phase 1 criou apenas `image/`, `audio/`, `video/`, `llm/`, `search/`, `social/`, `sdk/`, `ui/`. O diretório `guides/` deve ser criado nesta fase.

---

### Pattern 6: Gemini Image nativo via `generateContent` (IMG-02 e IMG-03)

**O que é:** Chama `generateContent` com `responseModalities: ["TEXT", "IMAGE"]`. Diferente do Imagen 4 (Phase 2), que retorna `bytesBase64Encoded` direto, o Gemini nativo retorna dentro de `inline_data.data`.

**Modelos:**
- `nano-banana` (IMG-02): modelo `gemini-3-pro-image-preview`
- `nano-banana-2` (IMG-03): modelo `gemini-3.1-flash-image-preview`

**Template:**

```bash
# IMG-02 / IMG-03 — Gemini Native Image Generation
if [ -z "$GOOGLE_API_KEY" ]; then
  echo "ERROR: GOOGLE_API_KEY not set. Run /pocket-knife:setup to configure."
  exit 1
fi

MODEL="gemini-3.1-flash-image-preview"   # IMG-03; IMG-02 usa gemini-3-pro-image-preview
OUTPUT_FILE="$HOME/Downloads/gemini_image_$(date +%s).png"

RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent" \
  -H "x-goog-api-key: $GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{\"parts\": [{\"text\": \"$PROMPT\"}]}],
    \"generationConfig\": {\"responseModalities\": [\"TEXT\", \"IMAGE\"]}
  }")

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "ERROR: Gemini Image API call failed."
  echo "$RESPONSE"
  exit 1
fi

# Extrair imagem base64 do campo inline_data.data
python3 -c "
import sys, json, base64
data = json.load(sys.stdin)
parts = data['candidates'][0]['content']['parts']
for part in parts:
    if 'inline_data' in part:
        img_b64 = part['inline_data']['data']
        with open('$OUTPUT_FILE', 'wb') as f:
            f.write(base64.b64decode(img_b64))
        print('Image saved to: $OUTPUT_FILE')
        break
" <<< "$RESPONSE"
```

**Fonte:** Documentação oficial Google AI `ai.google.dev/gemini-api/docs/image-generation` (HIGH confidence)

**Diferença-chave vs Imagen 4 (Phase 2):**
- Imagen 4: `data['predictions'][0]['bytesBase64Encoded']`
- Gemini nativo: `data['candidates'][0]['content']['parts'][N]['inline_data']['data']`

---

### Pattern 7: fal.ai async polling (IMG-04, IMG-05, IMG-06, IMG-07)

**O que é:** fal.ai usa um modelo de fila assíncrona (`queue.fal.run`). O fluxo é:
1. POST para submeter o job → retorna `request_id`
2. GET no endpoint de status até `status == "COMPLETED"`
3. GET no endpoint de resultado para obter a resposta final

**Auth:** `Authorization: Key $FAL_KEY` — atenção: **não é `Bearer`**, é `Key`.

**Template completo:**

```bash
# fal.ai async polling — template para FLUX/BiRefNet/Topaz/P-Image
if [ -z "$FAL_KEY" ]; then
  echo "ERROR: FAL_KEY not set. Run /pocket-knife:setup to configure."
  exit 1
fi

MODEL_ID="fal-ai/flux/schnell"  # trocar pelo model ID específico
OUTPUT_FILE="$HOME/Downloads/fal_output_$(date +%s).jpg"
MAX_WAIT=120   # segundos máximos de espera
POLL_INTERVAL=3

# Passo 1: Submeter job
SUBMIT_RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://queue.fal.run/${MODEL_ID}" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"$PROMPT\"}")

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "ERROR: fal.ai job submission failed."
  echo "$SUBMIT_RESPONSE"
  exit 1
fi

REQUEST_ID=$(echo "$SUBMIT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['request_id'])")

if [ -z "$REQUEST_ID" ]; then
  echo "ERROR: Could not extract request_id from response."
  exit 1
fi

echo "Job submitted. Request ID: $REQUEST_ID"
echo "Waiting for completion..."

# Passo 2: Polling de status
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
  STATUS_RESPONSE=$(curl -s \
    "https://queue.fal.run/${MODEL_ID}/requests/${REQUEST_ID}/status" \
    -H "Authorization: Key $FAL_KEY")

  STATUS=$(echo "$STATUS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)

  if [ "$STATUS" = "COMPLETED" ]; then
    break
  elif [ "$STATUS" = "FAILED" ]; then
    echo "ERROR: fal.ai job failed."
    echo "$STATUS_RESPONSE"
    exit 1
  fi

  echo "Status: $STATUS (${ELAPSED}s elapsed)"
  sleep $POLL_INTERVAL
  ELAPSED=$((ELAPSED + POLL_INTERVAL))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  echo "ERROR: Job timed out after ${MAX_WAIT}s."
  exit 1
fi

# Passo 3: Obter resultado
RESULT=$(curl -s \
  "https://queue.fal.run/${MODEL_ID}/requests/${REQUEST_ID}" \
  -H "Authorization: Key $FAL_KEY")

IMAGE_URL=$(echo "$RESULT" | python3 -c "
import sys,json
data = json.load(sys.stdin)
# Para FLUX/BiRefNet/Topaz — estrutura varia por modelo
images = data.get('images', [])
if images:
    print(images[0]['url'])
else:
    image = data.get('image', {})
    print(image.get('url',''))
" 2>/dev/null)

if [ -z "$IMAGE_URL" ]; then
  echo "ERROR: Could not extract image URL from result."
  echo "$RESULT"
  exit 1
fi

# Download da imagem
curl -s "$IMAGE_URL" --output "$OUTPUT_FILE"
echo "Image saved to: $OUTPUT_FILE"
```

**Model IDs por skill:**
| Skill | Model ID fal.ai | Parâmetros principais |
|-------|-----------------|----------------------|
| flux-image (IMG-04) | `fal-ai/flux/schnell` | `prompt`, `image_size`, `num_inference_steps` |
| image-upscaling (IMG-05) | `fal-ai/topaz/upscale/image` | `image_url`, `scale` (padrão 2) |
| background-removal (IMG-06) | `fal-ai/birefnet` | `image_url`, `model` ("General Use (Light)") |
| p-image (IMG-07) | a confirmar — provável `fal-ai/pruna/p-image` | `prompt` |

**Fonte:** fal.ai Queue API docs `fal.ai/docs/model-apis/model-endpoints/queue` (HIGH confidence)

**Nota sobre `image-upscaling` e `background-removal`:** Ambos recebem uma `image_url`, não um `prompt`. O script bash deve pedir ao usuário a URL da imagem de entrada em vez de um prompt textual.

---

### Pattern 8: Qwen Image via DashScope (IMG-08 e IMG-09)

**O que é:** Alibaba DashScope API internacional. Endpoint `multimodal-generation/generation`. Resposta **síncrona** para `qwen-image-2.0` e `qwen-image-2.0-pro` — sem polling necessário.

**Auth:** `Authorization: Bearer $DASHSCOPE_API_KEY`

**Template:**

```bash
# IMG-08 / IMG-09 — Qwen Image 2.0 via DashScope
if [ -z "$DASHSCOPE_API_KEY" ]; then
  echo "ERROR: DASHSCOPE_API_KEY not set. Run /pocket-knife:setup to configure."
  exit 1
fi

MODEL="qwen-image-2.0-pro"   # IMG-09; IMG-08 usa qwen-image-2.0

RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation" \
  -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL\",
    \"input\": {
      \"messages\": [{\"role\": \"user\", \"content\": [{\"text\": \"$PROMPT\"}]}]
    },
    \"parameters\": {
      \"size\": \"1024*1024\",
      \"n\": 1,
      \"prompt_extend\": true,
      \"watermark\": false
    }
  }")

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "ERROR: Qwen Image API call failed."
  echo "$RESPONSE"
  exit 1
fi

# Extrair URL da imagem da resposta
IMAGE_URL=$(echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
choices = data['output']['choices']
for choice in choices:
    content = choice['message']['content']
    for item in content:
        if 'image' in item:
            print(item['image'])
            break
" 2>/dev/null)

if [ -z "$IMAGE_URL" ]; then
  echo "ERROR: Could not extract image URL from response."
  echo "$RESPONSE"
  exit 1
fi

OUTPUT_FILE="$HOME/Downloads/qwen_image_$(date +%s).png"
curl -s "$IMAGE_URL" --output "$OUTPUT_FILE"
echo "Image saved to: $OUTPUT_FILE"
```

**Fonte:** Alibaba Cloud Model Studio docs (HIGH confidence)

**Parâmetros do size:** Usar formato `"1024*1024"` com asterisco — não barra ou x.

---

### Pattern 9: Guide skills (GUIDE-01 a GUIDE-07) — zero API key

**O que é:** Skills de referência pura — o corpo do SKILL.md é o guia em si (markdown com tabelas, exemplos, prompts). Nenhum curl, nenhuma chave de API necessária.

**Estrutura do frontmatter:**

```yaml
---
name: prompting-guide
description: "Prompt engineering techniques for LLM, image, and video models. Use for: better prompts, chain-of-thought, few-shot, system prompts, negative prompts."
allowed-tools: []
disable-model-invocation: false
---
```

**Regras para guides:**
1. `allowed-tools: []` — nenhuma ferramenta necessária (sem curl)
2. `disable-model-invocation: false` — guides devem ser invocáveis por contexto
3. Descrição deve ter **menos de 100 chars** (QUAL-06)
4. Corpo do SKILL.md deve ter **menos de 300 linhas** (critério de sucesso da Phase 3)
5. Conteúdo de sub-guides deve ser consolidado em um único SKILL.md por categoria

**Consolidação de sub-guides:**

O repositório inference-sh/skills tem 30+ sub-guides organizados em 8 categorias. O pocket-knife consolida em 7 skills top-level:

| Skill pocket-knife | Sub-guides inference.sh a incluir |
|--------------------|-----------------------------------|
| `prompting-guide` | `prompt-engineering`, `video-prompting-guide` |
| `design-guide` | `logo-design-guide`, `og-image-design`, `landing-page-design`, `youtube-thumbnail-design`, outros 6 sub-guides |
| `video-guide` | `ai-marketing-videos`, `explainer-video-guide`, `storyboard-creation`, `talking-head-production`, `video-ad-specs` |
| `writing-guide` | `technical-blog-writing`, `case-study-writing`, `newsletter-curation`, `press-release-writing`, `seo-content-brief` |
| `social-guide` | `ai-social-media-content`, `linkedin-content`, `social-media-carousel`, `twitter-thread-creation` |
| `product-guide` | `competitor-teardown`, `customer-persona`, `product-changelog`, `product-hunt-launch` |
| `content-guide` | `ai-automation-workflows`, `ai-content-pipeline`, `ai-podcast-creation`, `content-repurposing`, `ai-product-photography`, `product-photography` |

**Estratégia:** Criar um SKILL.md por categoria que RESUME o melhor de cada sub-guide. Não copiar os sub-guides word-for-word — extrair as tabelas e frameworks mais úteis dentro do limite de 300 linhas.

**Nota importante:** Os guides originais do inference.sh têm `allowed-tools: Bash(infsh *)` porque usam o CLI para executar comandos. No pocket-knife, guides são documentos de referência pura — o Claude usa o conteúdo para orientar o usuário, não para executar comandos. **Remover o `allowed-tools: Bash(infsh *)` e substituir por `allowed-tools: []`.**

---

## Don't Hand-Roll

| Problema | Não construir | Usar em vez | Por que |
|----------|---------------|-------------|---------|
| Decodificação base64 de imagem | Parser bash customizado | `python3 -c "import base64..."` | Python3 disponível em todos os targets; bash não tem base64 confiável multiplataforma |
| Polling com backoff exponencial | Loop sleep manual | Loop simples com sleep fixo + MAX_WAIT | Simplicidade vence — fal.ai jobs terminam em 5-30s; backoff complexo não agrega |
| Extração de JSON | `grep`/`sed` de JSON | `python3 -c "import json..."` | JSON pode ter newlines; grep/sed não é confiável para JSON aninhado |
| HTTP retry automático | Loop curl | Single curl com `--fail-with-body` + mensagem clara | Retry automático pode duplicar gastos de API; usuário deve decidir se refaz |

---

## Runtime State Inventory

> Esta fase é greenfield (novas skills) — sem rename/refactor envolvido. Nenhum estado de runtime afetado.

None — verified: phase adds new SKILL.md files only, no existing state modified.

---

## Common Pitfalls

### Pitfall 1: fal.ai — `Authorization: Key` vs `Authorization: Bearer`

**O que dá errado:** Usar `Authorization: Bearer $FAL_KEY` em vez de `Authorization: Key $FAL_KEY`.
**Por que acontece:** Confusão com o padrão OAuth Bearer usado por outros provedores.
**Como evitar:** Para `queue.fal.run`, o header correto é sempre `Authorization: Key $FAL_KEY`. A API `api.fal.ai` (rembg/imageutils) usa `Authorization: Bearer` — mas para skills, usar sempre `queue.fal.run` com `Key`.
**Sinal de alerta:** Resposta HTTP 401 com `{"detail": "Unauthorized"}`.

---

### Pitfall 2: Gemini nativo — `inline_data` vs `bytesBase64Encoded`

**O que dá errado:** Usar o extrator do Imagen 4 (`predictions[0]['bytesBase64Encoded']`) para skills Gemini nativo.
**Por que acontece:** Ambos usam `GOOGLE_API_KEY` e `generativelanguage.googleapis.com`, mas os modelos retornam estruturas JSON diferentes.
**Como evitar:** Gemini nativo (`gemini-*-image-*`) retorna dentro de `candidates[0]['content']['parts'][N]['inline_data']['data']`. Imagen 4 (`imagen-4.0-generate-001`) retorna em `predictions[0]['bytesBase64Encoded']`.
**Sinal de alerta:** `KeyError: 'predictions'` ou imagem vazia.

---

### Pitfall 3: Qwen Image — formato `size` com asterisco

**O que dá errado:** Usar `"1024x1024"` ou `"1024/1024"` em vez de `"1024*1024"`.
**Por que acontece:** A maioria dos outros provedores usa `x` ou `/` como separador de dimensões.
**Como evitar:** DashScope usa asterisco: `"1024*1024"`. Valores aceitos: entre 512 e 2048 por dimensão; total entre `512*512` e `2048*2048`.
**Sinal de alerta:** Erro 400 com mensagem sobre `size` format.

---

### Pitfall 4: fal.ai — REQUEST_ID extraído incorretamente

**O que dá errado:** A resposta do submit fal.ai tem `request_id` dentro de um objeto, mas também pode ter `status_url` e `response_url`. Se o parsing falhar silenciosamente, o polling nunca começa.
**Por que acontece:** Shell scripts com `python3 -c` podem silenciar exceções. Se `RESPONSE` não for JSON válido, `json.load` lança e o script prossegue com REQUEST_ID vazio.
**Como evitar:** Verificar `if [ -z "$REQUEST_ID" ]` explicitamente após a extração. Incluir tratamento de erro no inline python3.
**Sinal de alerta:** Polling começa imediatamente mas REQUEST_ID é string vazia.

---

### Pitfall 5: Guides acima de 300 linhas — critério de sucesso da Phase 3

**O que dá errado:** Copiar sub-guides completos gera SKILL.md com 500+ linhas.
**Por que acontece:** Sub-guides originais têm exemplos extensos com comandos `infsh`.
**Como evitar:** Por categoria, incluir: tabela principal (shot types, prompt formulas, design rules), 3-5 exemplos de prompts adaptados (sem `infsh`), seção de erros comuns. Omitir exemplos completos de comandos CLI.
**Sinal de alerta:** SKILL.md com mais de 300 linhas — dividir em múltiplos arquivos `reference/` se necessário.

---

### Pitfall 6: Budget de descriptions dos guides

**O que dá errado:** Descriptions dos guides originais têm ~400 chars (incluem "Triggers: ...").
**Por que acontece:** inference.sh usa triggers para auto-invocação. Claude Code usa apenas `name` + `description` para matching — lista de triggers desperdiça budget.
**Como evitar:** Description deve ser **menor que 100 chars** (QUAL-06). Formato: `"[O que faz]. Use for: [casos de uso]. Requires: [nothing/API key]"`. Remover a seção de Triggers completamente.
**Sinal de alerta:** `/context` ou `/` mostra skills truncadas ou budget warning.

---

## Code Examples

### Exemplo 1: nano-banana-2 SKILL.md (IMG-03)

```yaml
---
name: nano-banana-2
description: "Generate images with Gemini 3.1 Flash. Fast, high-quality. Requires: GOOGLE_API_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: false
---

Generate an image using Gemini 3.1 Flash Image Preview.

Check the API key:
```bash
if [ -z "$GOOGLE_API_KEY" ]; then
  echo "ERROR: GOOGLE_API_KEY not set. Run /pocket-knife:setup to configure."
  exit 1
fi
```

Generate:
```bash
PROMPT="a mountain landscape at sunset"
MODEL="gemini-3.1-flash-image-preview"
OUTPUT="$HOME/Downloads/nano_banana_$(date +%s).png"

RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent" \
  -H "x-goog-api-key: $GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"contents\":[{\"parts\":[{\"text\":\"$PROMPT\"}]}],\"generationConfig\":{\"responseModalities\":[\"TEXT\",\"IMAGE\"]}}")

python3 -c "
import sys,json,base64
data=json.load(sys.stdin)
for p in data['candidates'][0]['content']['parts']:
    if 'inline_data' in p:
        open('$OUTPUT','wb').write(base64.b64decode(p['inline_data']['data']))
        print('Saved: $OUTPUT')
        break
" <<< "$RESPONSE"
```
```

---

### Exemplo 2: prompting-guide SKILL.md (GUIDE-01) — estrutura do guide

```yaml
---
name: prompting-guide
description: "Prompt engineering for LLM, image and video models. Techniques: chain-of-thought, few-shot, negative prompts."
allowed-tools: []
disable-model-invocation: false
---

# Prompt Engineering Guide

## LLM Prompts

Formula: **Role + Task + Constraints + Output Format**

| Element | Example |
|---------|---------|
| Role | "You are a senior software engineer..." |
| Task | "Review this code for security vulnerabilities" |
| Constraints | "Focus on SQL injection and XSS only" |
| Output | "Return a JSON list of issues with severity" |

## Image Generation Prompts

Formula: **Subject + Style + Composition + Lighting + Technical**

Example: `"Portrait of a scientist, watercolor style, centered composition, soft natural lighting, high resolution"`

## Video Prompts

Formula: **Shot Type + Subject + Action + Setting + Lighting + Style + Technical**

Example: `"Tracking shot of a red sports car, driving through Tokyo at night, neon lights, cinematic, 4K"`

...
```

---

## Guide Skills — Mapeamento Completo de Sub-guides

### GUIDE-01: `prompting-guide`
- Conteúdo principal: framework Role+Task+Constraints+Output; Subject+Style para imagem; Shot+Action para vídeo
- Sub-guides fonte: `prompt-engineering`, `video-prompting-guide`
- Seções a incluir: LLM prompting, Image prompting, Video prompting, Common mistakes

### GUIDE-02: `design-guide`
Sub-guides disponíveis no inference-sh/skills:
- `app-store-screenshots`, `book-cover-design`, `character-design-sheet`, `data-visualization`
- `email-design`, `landing-page-design`, `logo-design-guide`, `og-image-design`
- `pitch-deck-visuals`, `youtube-thumbnail-design`
- Estratégia: incluir `logo-design-guide` + `og-image-design` + `landing-page-design` como 3 seções principais

### GUIDE-03: `video-guide`
Sub-guides: `ai-marketing-videos`, `explainer-video-guide`, `storyboard-creation`, `talking-head-production`, `video-ad-specs`

### GUIDE-04: `writing-guide`
Sub-guides: `technical-blog-writing`, `case-study-writing`, `newsletter-curation`, `press-release-writing`, `seo-content-brief`

### GUIDE-05: `social-guide`
Sub-guides: `ai-social-media-content`, `linkedin-content`, `social-media-carousel`, `twitter-thread-creation`

### GUIDE-06: `product-guide`
Sub-guides: `competitor-teardown`, `customer-persona`, `product-changelog`, `product-hunt-launch`

### GUIDE-07: `content-guide`
Sub-guides: `ai-automation-workflows`, `ai-content-pipeline`, `ai-podcast-creation`, `content-repurposing`, `ai-product-photography`, `product-photography`

---

## State of the Art

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|------------------|-----------------|--------------|---------|
| Gemini 2.0 Flash Experimental Image | Gemini 3.1 Flash Image Preview (nano-banana-2) | 2025-2026 | Model ID mudou; endpoint igual |
| Gemini 2.5 Flash Image | Gemini 3 Pro Image Preview (nano-banana) | 2025-2026 | Model ID mudou |
| `fal.run/` direto (sync) | `queue.fal.run/` (async polling) | 2024-2025 | Workflow obrigatoriamente assíncrono |
| `Authorization: Bearer` fal.ai | `Authorization: Key` fal.ai | 2024 | Auth pattern mudou para "Key" |
| inference.sh `infsh app run` | Chamada direta ao provedor | N/A (pocket-knife design) | Remove dependência do proxy pago |

**Deprecated:**
- `Bash(infsh *)` em guides: não tem sentido sem o inference.sh CLI instalado. Substituir por `allowed-tools: []`.
- `infsh login` como pré-requisito: removido completamente — pocket-knife usa API keys diretas.

---

## Open Questions

1. **P-Image (IMG-07) — Model ID no fal.ai**
   - O que sabemos: Pruna é parceiro fal.ai; o modelo `pruna/p-image` existe no inference.sh
   - O que não está claro: o ID exato no `queue.fal.run` (provável `fal-ai/pruna/p-image` ou similar)
   - Recomendação: verificar `https://fal.ai/models` com busca por "pruna" antes de implementar. Se não encontrado, usar `fal-ai/flux/schnell` como fallback e documentar.

2. **nano-banana (IMG-02) — `gemini-3-pro-image-preview` disponível publicamente?**
   - O que sabemos: Documentação Google AI menciona o modelo; inference.sh confirma o nome
   - O que não está claro: se está disponível em todas as regiões com GOOGLE_API_KEY padrão ou se requer API especial/waitlist
   - Recomendação: testar antes de implementar; fallback para `gemini-3.1-flash-image-preview` se o Pro não estiver disponível

3. **Diretório `guides/` não existe na estrutura do plugin**
   - O que sabemos: Phase 1 criou apenas 8 categorias (`image/`, `audio/`, etc.); `guides/` não está na lista
   - O que não está claro: se `guides/` precisa ser adicionado ao `plugin.json` ou se é detectado automaticamente
   - Recomendação: criar `skills/guides/` e verificar se skills são detectadas automaticamente; se não, atualizar `plugin.json`

4. **Budget total após Phase 3**
   - O que sabemos: QUAL-06 exige descriptions < 100 chars; Phase 3 adiciona ~15 skills (8 image + 7 guides)
   - O que não está claro: total atual de chars de descriptions após Phases 1+2; se budget de 16K chars está em risco
   - Recomendação: após criar todas as skills da Phase 3, rodar `/context` para verificar budget; descriptions dos guides devem ser especialmente concisas

---

## Environment Availability

| Dependência | Requerida por | Disponível | Versão | Fallback |
|-------------|--------------|-----------|--------|---------|
| `python3` | Decodificar base64 (Gemini), parse JSON (fal.ai) | Assumido ✓ | 3.x | `base64` cmd builtin + `jq` (menos confiável) |
| `curl` 7.76+ | Todos os scripts curl | Assumido ✓ | 7.76+ | — |
| `GOOGLE_API_KEY` | IMG-02, IMG-03 | Requer configuração | — | Mensagem de setup |
| `FAL_KEY` | IMG-04, IMG-05, IMG-06, IMG-07 | Requer configuração | — | Mensagem de setup |
| `DASHSCOPE_API_KEY` | IMG-08, IMG-09 | Requer configuração | — | Mensagem de setup |

**Nova env var introduzida nesta fase:** `DASHSCOPE_API_KEY` — não estava no setup da Phase 2. O script `/pocket-knife:setup` precisa ser atualizado para perguntar sobre essa chave.

**Missing dependencies com fallback:**
- `python3` ausente: fallback para `base64` + `jq` — mas é improvável estar ausente em macOS/Linux/WSL

---

## Validation Architecture

> nyquist_validation: verificar .planning/config.json

### Padrão de verificação por skill

Para image skills, a verificação é manual (não pode automatizar sem API keys reais):
- Verificar que SKILL.md tem frontmatter válido (YAML parseable)
- Verificar que descrição tem menos de 100 chars
- Verificar que `allowed-tools: Bash(curl *)` está presente
- Verificar que `disable-model-invocation: false` (ou ausente) para image skills
- Verificar que o script bash tem verificação de chave (`if [ -z "$API_KEY" ]`)

Para guide skills:
- Verificar que `allowed-tools: []` (sem curl)
- Verificar que body tem menos de 300 linhas
- Verificar que descrição tem menos de 100 chars

### Comando de verificação rápida (sem API key)

```bash
# Verificar todas as descriptions de skills têm menos de 100 chars
for skill_dir in skills/image/*/; do
  desc=$(grep "^description:" "${skill_dir}SKILL.md" | head -1)
  echo "${#desc} chars: $desc"
done
```

---

## Sources

### Primary (HIGH confidence)
- `ai.google.dev/gemini-api/docs/image-generation` — modelos Gemini nativos, endpoint, responseModalities, inline_data format
- `fal.ai/docs/model-apis/model-endpoints/queue` — queue.fal.run endpoint, Authorization: Key, polling pattern completo
- `fal.ai/models/fal-ai/birefnet/api` — BiRefNet model ID, parâmetros
- `fal.ai/models/fal-ai/flux/dev/api` — FLUX model ID, parâmetros, response format
- `alibabacloud.com/help/en/model-studio/qwen-image-api` — Qwen Image 2.0 endpoint, auth Bearer, request body, response format
- `alibabacloud.com/help/en/model-studio/qwen-image-edit-api` — modelos disponíveis, size format com asterisco
- `github.com/inference-sh/skills` — estrutura completa do repositório, SKILL.md originais, guias disponíveis

### Secondary (MEDIUM confidence)
- `github.com/inference-sh/skills/blob/main/tools/image/*/SKILL.md` — SKILL.md originais confirmando que usam `infsh app run` (via WebFetch)
- `github.com/inference-sh/skills/guides/` — lista de todos os 30+ sub-guides e suas categorias
- `fal.ai/models/fal-ai/topaz/upscale/image/api` — Topaz model ID (via WebSearch; URL retornou 404 no WebFetch)

### Tertiary (LOW confidence)
- P-Image (IMG-07) — model ID no fal.ai não verificado diretamente; inferido por parceria Pruna/fal.ai
- nano-banana (IMG-02) — `gemini-3-pro-image-preview` disponibilidade pública não confirmada

---

## Metadata

**Confidence breakdown:**
- Google Gemini nativo (IMG-02, IMG-03): HIGH — endpoint e formato de resposta verificados em docs oficiais
- fal.ai async pattern (IMG-04, IMG-05, IMG-06): HIGH — queue API doc oficial com curl examples
- Qwen/DashScope (IMG-08, IMG-09): HIGH — docs oficiais Alibaba Cloud confirmados
- P-Image (IMG-07): LOW — model ID no fal.ai não confirmado diretamente
- Guide skills (GUIDE-01 a GUIDE-07): HIGH para estrutura; MEDIUM para conteúdo (curadoria necessária)
- Budget impact: MEDIUM — cálculo teórico, validação real com `/context` requerida

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (APIs de imagem mudam frequentemente — verificar model IDs se demorar mais de 30 dias)
