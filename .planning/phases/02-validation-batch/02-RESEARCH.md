# Phase 2: Validation Batch - Research

**Researched:** 2026-03-26
**Domain:** API skills para provedores principais — Google Gemini (imagem), ElevenLabs TTS (áudio), Google Veo (vídeo), Tavily + Exa (search), LLM multi-provider, curl error handling (QUAL-03)
**Confidence:** HIGH para todos os provedores REST; MEDIUM para Veo (requer Vertex AI + gcloud, não GOOGLE_API_KEY simples)

---

<phase_requirements>
## Phase Requirements

| ID | Descrição | Suporte de Pesquisa |
|----|-----------|---------------------|
| IMG-01 | Skill `ai-image-generation` — geração via Google Gemini/Imagen 4 (chave: `GOOGLE_API_KEY`) | Endpoint confirmado: `imagen-4.0-generate-001:predict` via `generativelanguage.googleapis.com`; auth: `x-goog-api-key` header |
| AUD-01 | Skill `elevenlabs-tts` — text-to-speech (chave: `ELEVENLABS_API_KEY`) | Endpoint confirmado: `POST /v1/text-to-speech/{voice_id}`; header `xi-api-key`; resposta binária `application/octet-stream` |
| LLM-01 | Skill `llm-models` — acesso a Claude, Gemini, Kimi, GLM com routing por chave disponível | Padrão de routing condicional por env var; cada provedor tem endpoint e header próprios |
| SRCH-01 | Skill `web-search` — Tavily + Exa com fallback | Tavily: `POST api.tavily.com/search` Bearer; Exa: `POST api.exa.ai/search` x-api-key |
| VID-02 | Skill `google-veo` — geração de vídeo via Google Veo (chave: `GOOGLE_API_KEY`) | **BLOQUEIO PARCIAL:** Veo usa Vertex AI com `gcloud auth`, não GOOGLE_API_KEY simples; ver seção Open Questions |
| QUAL-03 | Scripts curl usam flag `-f` e checam HTTP status code para erros claros | Padrão completo documentado: `curl -f`, exit code 22, `--fail-with-body`, mensagens de erro por categoria |
</phase_requirements>

---

## Summary

A Phase 2 valida o "round-trip" env loader → curl → API para um skill funcional por provedor principal. O objetivo não é criar todos os 85+ skills, mas provar que o padrão funciona para cada provedor de autenticação diferente — estabelecendo templates reutilizáveis que Phase 3+ replica mecanicamente.

Dos 6 requirements desta fase, 5 são implementáveis com `GOOGLE_API_KEY` ou chave própria do provedor via `generativelanguage.googleapis.com`. O **Google Veo é a exceção crítica**: a API oficial usa Vertex AI com `gcloud auth print-access-token` e requer `PROJECT_ID`, não uma API key simples. Isso tem implicações diretas no design do skill VID-02 — o planner deve decidir se adapta para Vertex AI ou usa o modelo Gemini nativo de geração de vídeo (se disponível via `generativelanguage.googleapis.com`).

Para QUAL-03, o padrão recomendado é usar `curl --fail-with-body` (disponível desde curl 7.76) em vez de `-f` simples, para capturar tanto o erro HTTP quanto o body de erro da API no mesmo comando. Scripts devem checar `$?` após cada curl e emitir mensagens específicas por categoria de erro.

**Recomendação principal:** Implementar os 5 skills de fácil autenticação primeiro (Imagen 4, ElevenLabs TTS, Tavily, Exa, LLM-models), validando o round-trip completo. Resolver o bloqueio do Veo separadamente — possivelmente usando `gemini-3.1-flash-video-preview` se disponível via API simples, ou documentando o requisito de Project ID.

---

## Project Constraints (from CLAUDE.md)

- **Idioma:** Sempre responder em português
- **Conduta:** Jamais implementar funcionalidades sem ordem explícita do usuário; seguir tarefas do planejamento sem pular etapas; enviar mensagem de conclusão ao terminar cada tarefa
- **MCPs Obrigatórios:** Playwright para testes visuais/front-end/back-end; Sequential Thinking para raciocínios profundos e soluções complexas em código
- **Implicações para esta fase:** Sequential Thinking deve ser usado para o design dos scripts bash com error handling (QUAL-03) e para o routing LLM multi-provider (LLM-01)

---

## Standard Stack

### Core (igual à Phase 1 — sem novas dependências)

| Componente | Versão | Propósito | Por que padrão |
|------------|--------|-----------|----------------|
| SKILL.md (Agent Skills spec) | agentskills.io | Definição de skill | Confirmado Phase 1; estrutura `skills/[cat]/[name]/SKILL.md` |
| curl | 7.76+ (sistema) | Chamadas HTTP às APIs | `--fail-with-body` disponível desde 7.76; cobre QUAL-03 |
| Bash (POSIX sh + bash 4+) | sistema | Scripts de API call | Sem nova dependência; `$?` para checar exit code |

### APIs dos Provedores (novos nesta fase)

| Provedor | Endpoint Base | Auth Header | Env Var | Confidence |
|----------|---------------|-------------|---------|------------|
| Google Imagen 4 | `https://generativelanguage.googleapis.com/v1beta/` | `x-goog-api-key: $GOOGLE_API_KEY` | `GOOGLE_API_KEY` | HIGH |
| Google Gemini (imagem nativa) | `https://generativelanguage.googleapis.com/v1beta/` | `x-goog-api-key: $GOOGLE_API_KEY` | `GOOGLE_API_KEY` | HIGH |
| ElevenLabs TTS | `https://api.elevenlabs.io/v1/` | `xi-api-key: $ELEVENLABS_API_KEY` | `ELEVENLABS_API_KEY` | HIGH |
| Tavily Search | `https://api.tavily.com/` | `Authorization: Bearer $TAVILY_API_KEY` | `TAVILY_API_KEY` | HIGH |
| Exa Search | `https://api.exa.ai/` | `x-api-key: $EXA_API_KEY` | `EXA_API_KEY` | HIGH |
| Anthropic (Claude) | `https://api.anthropic.com/v1/` | `x-api-key: $ANTHROPIC_API_KEY` | `ANTHROPIC_API_KEY` | HIGH |
| Google Gemini LLM | `https://generativelanguage.googleapis.com/v1beta/` | `x-goog-api-key: $GOOGLE_API_KEY` | `GOOGLE_API_KEY` | HIGH |
| Moonshot (Kimi) | `https://api.moonshot.cn/v1/` | `Authorization: Bearer $KIMI_API_KEY` | `KIMI_API_KEY` | MEDIUM |
| Zhipu AI (GLM) | `https://open.bigmodel.cn/api/paas/v4/` | `Authorization: Bearer $GLM_API_KEY` | `GLM_API_KEY` | MEDIUM |
| Google Veo | `https://LOCATION-aiplatform.googleapis.com/v1/` | `Authorization: Bearer $(gcloud auth print-access-token)` | Requer `PROJECT_ID` + gcloud | MEDIUM — ver Open Questions |

---

## Architecture Patterns

### Estrutura de diretórios (Phase 2 — skills a criar)

```
skills/
├── image/
│   └── ai-image-generation/
│       └── SKILL.md           # IMG-01 — Imagen 4 via generativelanguage API
├── audio/
│   └── elevenlabs-tts/
│       └── SKILL.md           # AUD-01 — TTS binário
├── video/
│   └── google-veo/
│       └── SKILL.md           # VID-02 — Veo via Vertex AI (ou Gemini nativo)
├── llm/
│   └── llm-models/
│       └── SKILL.md           # LLM-01 — routing multi-provider
└── search/
    └── web-search/
        └── SKILL.md           # SRCH-01 — Tavily + Exa dual-provider
```

Todos os diretórios já existem com `.gitkeep` (criados na Phase 1). Skills substituem `.gitkeep` com `SKILL.md`.

---

### Pattern 1: Skill de API REST simples (Imagen 4 / Tavily / Exa)

**O que é:** Uma SKILL.md com frontmatter + instruções para Claude construir e executar um curl. Claude lê os parâmetros do usuário e preenche o template.

**Quando usar:** Qualquer skill com um único endpoint REST, autenticação por header, resposta JSON.

**Template:**

```yaml
---
name: ai-image-generation
description: "Generate images with Imagen 4 via Google AI. Use for: AI art, product mockups, concept art. Requires: GOOGLE_API_KEY in ~/.claude/.env"
allowed-tools: Bash(curl *)
disable-model-invocation: false
---

Generate an image using the Imagen 4 API.

Check that the API key is configured:

```bash
if [ -z "$GOOGLE_API_KEY" ]; then
  echo "ERROR: GOOGLE_API_KEY not set. Run /pocket-knife:setup to configure."
  exit 1
fi
```

Generate the image:

```bash
RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict" \
  -H "x-goog-api-key: $GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"instances\": [{\"prompt\": \"$PROMPT\"}], \"parameters\": {\"sampleCount\": 1}}")

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "ERROR: API call failed (HTTP error or network issue)"
  echo "$RESPONSE"
  exit 1
fi

# Extract base64 image and save
echo "$RESPONSE" | python3 -c "
import sys, json, base64
data = json.load(sys.stdin)
img_b64 = data['predictions'][0]['bytesBase64Encoded']
with open('output.png', 'wb') as f:
    f.write(base64.b64decode(img_b64))
print('Image saved to output.png')
"
```
```

**Fonte:** Documentação oficial Google AI (HIGH confidence)

---

### Pattern 2: Skill com resposta binária (ElevenLabs TTS — AUD-01)

**O que é:** curl com `--output` para salvar arquivo binário (áudio). A resposta é `application/octet-stream`, não JSON.

**Exemplo:**

```bash
# Verificar chave
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: ELEVENLABS_API_KEY not set. Run /pocket-knife:setup to configure."
  exit 1
fi

VOICE_ID="JBFqnCBsd6RMkjVDRZzb"  # George (default)
OUTPUT_FILE="$HOME/Downloads/tts_output.mp3"

curl --fail-with-body -s \
  -X POST "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEXT\", \"model_id\": \"eleven_multilingual_v2\"}" \
  --output "$OUTPUT_FILE"

if [ $? -ne 0 ]; then
  echo "ERROR: TTS API call failed. Check your ELEVENLABS_API_KEY."
  exit 1
fi

echo "Audio saved to: $OUTPUT_FILE"
```

**Observações críticas:**
- `--output` deve usar caminho absoluto — Claude não sabe o cwd
- `$HOME/Downloads/` é o destino padrão mais amigável em todos os OSes
- `--fail-with-body` não funciona bem com output binário; usar `-f` + `--output` combinados, ou checar se o arquivo tem tamanho > 0 após download
- Para binário: usar `-f` (fail on HTTP error) + `--output file` separados, não `--fail-with-body`

**Fonte:** ElevenLabs docs `/v1/text-to-speech/{voice_id}` (HIGH confidence)

---

### Pattern 3: Skill com routing multi-provider (LLM-01)

**O que é:** O script testa quais chaves estão disponíveis no ambiente e roteia para o primeiro provedor encontrado. Sem fallback automático entre provedores — apenas seleciona o disponível e falha explicitamente se nenhum estiver configurado.

**Padrão de routing:**

```bash
# Detectar qual provedor usar (ordem de preferência)
if [ -n "$ANTHROPIC_API_KEY" ]; then
  PROVIDER="anthropic"
elif [ -n "$GOOGLE_API_KEY" ]; then
  PROVIDER="gemini"
elif [ -n "$KIMI_API_KEY" ]; then
  PROVIDER="kimi"
elif [ -n "$GLM_API_KEY" ]; then
  PROVIDER="glm"
else
  echo "ERROR: No LLM API key configured."
  echo "Configure at least one of: ANTHROPIC_API_KEY, GOOGLE_API_KEY, KIMI_API_KEY, GLM_API_KEY"
  echo "Run /pocket-knife:setup to configure."
  exit 1
fi

# Executar baseado no provedor detectado
case "$PROVIDER" in
  anthropic)
    curl --fail-with-body -s \
      -X POST "https://api.anthropic.com/v1/messages" \
      -H "x-api-key: $ANTHROPIC_API_KEY" \
      -H "anthropic-version: 2023-06-01" \
      -H "Content-Type: application/json" \
      -d "{\"model\": \"claude-3-5-haiku-20241022\", \"max_tokens\": 1024, \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]}"
    ;;
  gemini)
    curl --fail-with-body -s \
      -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent" \
      -H "x-goog-api-key: $GOOGLE_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"contents\": [{\"parts\": [{\"text\": \"$PROMPT\"}]}]}"
    ;;
  kimi)
    curl --fail-with-body -s \
      -X POST "https://api.moonshot.cn/v1/chat/completions" \
      -H "Authorization: Bearer $KIMI_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"model\": \"moonshot-v1-8k\", \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]}"
    ;;
  glm)
    curl --fail-with-body -s \
      -X POST "https://open.bigmodel.cn/api/paas/v4/chat/completions" \
      -H "Authorization: Bearer $GLM_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"model\": \"glm-4-flash\", \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]}"
    ;;
esac
```

**Nota:** Os endpoints de Kimi e GLM têm confidence MEDIUM (verificado via search mas não contra docs oficiais primárias). A description da skill deve listar explicitamente qual provedor foi detectado na resposta.

---

### Pattern 4: Skill dual-provider com fallback gracioso (SRCH-01 — web-search)

**O que é:** Tenta Tavily primeiro (se chave disponível), depois Exa como alternativa. Documenta claramente qual provedor foi usado na resposta.

```bash
if [ -n "$TAVILY_API_KEY" ]; then
  # Usar Tavily
  curl --fail-with-body -s \
    -X POST "https://api.tavily.com/search" \
    -H "Authorization: Bearer $TAVILY_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$QUERY\", \"max_results\": 5}"
elif [ -n "$EXA_API_KEY" ]; then
  # Fallback para Exa
  curl --fail-with-body -s \
    -X POST "https://api.exa.ai/search" \
    -H "x-api-key: $EXA_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$QUERY\"}"
else
  echo "ERROR: No search API key configured."
  echo "Configure TAVILY_API_KEY or EXA_API_KEY in ~/.claude/.env"
  exit 1
fi
```

---

### Pattern 5: QUAL-03 — Error handling completo com curl

**O que é:** O padrão OBRIGATÓRIO para todos os scripts curl nesta fase e nas seguintes.

**Implementação:**

```bash
# Para respostas JSON (maioria dos skills):
RESPONSE=$(curl --fail-with-body -s \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -X POST "https://api.example.com/endpoint" \
  -d "$REQUEST_BODY" \
  2>&1)

EXIT_CODE=$?

case $EXIT_CODE in
  0)
    # Sucesso — processar RESPONSE
    ;;
  22)
    # HTTP error (4xx ou 5xx) — body da resposta está em RESPONSE
    HTTP_STATUS=$(echo "$RESPONSE" | grep -o '"status":[0-9]*' | head -1 | grep -o '[0-9]*')
    if echo "$RESPONSE" | grep -qi "unauthorized\|invalid.*key\|authentication"; then
      echo "ERROR: Invalid API key. Check your key in ~/.claude/.env"
    elif echo "$RESPONSE" | grep -qi "rate.limit\|too many requests"; then
      echo "ERROR: Rate limit exceeded. Wait a moment and try again."
    elif echo "$RESPONSE" | grep -qi "quota\|billing"; then
      echo "ERROR: API quota exceeded. Check your account billing."
    else
      echo "ERROR: API returned HTTP error."
      echo "$RESPONSE"
    fi
    exit 1
    ;;
  6)
    echo "ERROR: Could not resolve API host. Check internet connection."
    exit 1
    ;;
  7)
    echo "ERROR: Failed to connect to API. Check internet connection."
    exit 1
    ;;
  *)
    echo "ERROR: curl failed with code $EXIT_CODE"
    echo "$RESPONSE"
    exit 1
    ;;
esac
```

**Notas sobre `--fail-with-body` vs `-f`:**
- `--fail-with-body`: disponível desde curl 7.76 (2021); retorna exit code 22 E preserva o body da resposta de erro. **Preferido para JSON.**
- `-f` (antigo): retorna exit code 22 mas descarta o body. Útil para downloads binários onde o body de sucesso é o arquivo.
- Para respostas binárias (ElevenLabs audio): usar `-f` com `--output arquivo` — não `--fail-with-body`.
- curl 7.76+ está disponível no macOS 12+ e Ubuntu 22.04+. Para compatibilidade máxima, incluir fallback para `-f` se `--fail-with-body` não existir.

**curl exit codes relevantes:**
| Code | Significado |
|------|-------------|
| 0 | Sucesso |
| 6 | Não conseguiu resolver o host |
| 7 | Falha de conexão |
| 22 | HTTP error (com `-f` ou `--fail-with-body`) |
| 28 | Timeout |
| 35 | SSL/TLS error |

**Fonte:** [curl manpage exit codes](https://curl.se/docs/manpage.html) (HIGH confidence)

---

### Anti-Patterns a Evitar

- **`curl -f` sem capturar body:** Perde a mensagem de erro da API. Usar `--fail-with-body` para respostas JSON.
- **`curl | python3 -c ...` sem checar $?:** Se curl falha, python3 recebe pipe vazio e gera erro confuso.
- **Checar `$?` após pipeline:** Em `RESPONSE=$(curl ...) && processar`, `$?` é do último comando. Salvar `$?` imediatamente após curl.
- **Echo de valores de chaves:** Nunca `echo "Usando chave: $GOOGLE_API_KEY"` — viola contrato de segurança da Phase 1.
- **Voice ID hardcoded errado:** ElevenLabs voice IDs mudam; usar IDs estáveis (George, Rachel) ou deixar o usuário especificar.

---

## Don't Hand-Roll

| Problema | Não Construir | Usar Em Vez | Por Quê |
|----------|---------------|-------------|---------|
| Decodificação de base64 de imagem | Parser base64 em bash | `python3 -c "import base64..."` ou `base64 -d` | Bash puro tem limitações com strings longas |
| Polling de jobs assíncronos (Veo) | Loop com sleep em SKILL.md | Loop bash com contador de tentativas e `sleep 5` | Simples demais para não fazer, mas DEVE ter max_attempts |
| Parsing JSON em bash | `grep`/`sed` para JSON | `python3 -c "import json..."` ou `jq` se disponível | JSON pode ter escaping complexo; jq nem sempre disponível |
| Multi-provider routing | Lógica if/elif no corpo do SKILL.md | Bash case statement em script inline | Mais legível e testável |

---

## Detalhes de API por Provedor

### IMG-01: Google Imagen 4 (Geração de Imagem)

**Modelo atual:** `imagen-4.0-generate-001` (Imagen 3 foi descontinuado)
**Modelos disponíveis:**
- `imagen-4.0-generate-001` — padrão, até 1K resolução
- `imagen-4.0-fast-generate-001` — mais rápido
- `imagen-4.0-ultra-generate-001` — maior qualidade, 2K

**Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict`

**Curl completo:**
```bash
curl --fail-with-body -s \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict" \
  -H "x-goog-api-key: $GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{"prompt": "SEU_PROMPT_AQUI"}],
    "parameters": {
      "sampleCount": 1,
      "aspectRatio": "1:1"
    }
  }'
```

**Formato de resposta:**
```json
{
  "predictions": [
    {
      "bytesBase64Encoded": "<BASE64_DATA>",
      "mimeType": "image/png"
    }
  ]
}
```

**Salvar imagem:**
```bash
echo "$RESPONSE" | python3 -c "
import sys, json, base64
data = json.load(sys.stdin)
img_b64 = data['predictions'][0]['bytesBase64Encoded']
with open('output.png', 'wb') as f:
    f.write(base64.b64decode(img_b64))
print('Imagem salva: output.png')
"
```

**Parâmetros opcionais:**
- `aspectRatio`: "1:1", "3:4", "4:3", "9:16", "16:9"
- `sampleCount`: 1-4
- `imageSize`: "1K" (padrão), "2K" (apenas ultra)

**Fonte:** [Google AI Imagen docs](https://ai.google.dev/gemini-api/docs/imagen) — HIGH confidence

---

**Alternativa: Gemini nativo com saída de imagem** (para o skill `ai-image-generation` se Imagen 4 não estiver disponível na região/tier):

```bash
curl --fail-with-body -s \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent" \
  -H "x-goog-api-key: $GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "SEU_PROMPT"}]}],
    "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
  }'
```

Resposta: `candidates[0].content.parts[N].inlineData.data` (base64)

---

### AUD-01: ElevenLabs TTS

**Endpoint:** `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`

**Vozes estáveis recomendadas (IDs permanentes):**
| Nome | Voice ID | Sotaque | Gênero |
|------|----------|---------|--------|
| George | `JBFqnCBsd6RMkjVDRZzb` | Britânico | Masculino |
| Rachel | `21m00Tcm4TlvDq8ikWAM` | Americano | Feminino |
| Aria | `9BWtsMINqrJLrRacOk9x` | Americano | Feminino |
| Charlie | `IKne3meq5aSn9XLyUdCD` | Australiano | Masculino |

**Modelos disponíveis:**
| Model ID | Característica |
|----------|----------------|
| `eleven_multilingual_v2` | Melhor qualidade, 32 idiomas (padrão) |
| `eleven_turbo_v2_5` | Balanceado, mais rápido |
| `eleven_flash_v2_5` | Ultra-rápido, menor latência |

**Curl completo (saída binária):**
```bash
OUTPUT_FILE="$HOME/Downloads/tts_$(date +%Y%m%d_%H%M%S).mp3"
VOICE_ID="JBFqnCBsd6RMkjVDRZzb"

curl -f -s \
  -X POST "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEXT\", \"model_id\": \"eleven_multilingual_v2\", \"voice_settings\": {\"stability\": 0.5, \"similarity_boost\": 0.75}}" \
  --output "$OUTPUT_FILE"

if [ $? -ne 0 ]; then
  echo "ERROR: ElevenLabs API call failed. Verify ELEVENLABS_API_KEY."
  exit 1
fi

# Verificar se arquivo tem conteúdo
if [ ! -s "$OUTPUT_FILE" ]; then
  echo "ERROR: Audio file is empty."
  exit 1
fi

echo "Audio gerado: $OUTPUT_FILE"
```

**Nota sobre `-f` vs `--fail-with-body`:** Para saída binária, usar `-f` com `--output` separados. `--fail-with-body` mistura o body de erro com o stream binário.

**Parâmetros opcionais relevantes:**
- `output_format` (query param): `mp3_44100_128` (padrão), `mp3_44100_192`, `pcm_44100`
- `voice_settings.speed`: 0.5–2.0 (velocidade de fala)
- `voice_settings.style`: 0–1 (exagero de estilo)

**Fonte:** [ElevenLabs TTS docs](https://elevenlabs.io/docs/api-reference/text-to-speech/convert) — HIGH confidence

---

### VID-02: Google Veo (Geração de Vídeo)

**ATENÇÃO — Requisito de autenticação diferente:**

A API oficial do Google Veo usa **Vertex AI**, não `generativelanguage.googleapis.com`. Isso significa:
- Requer `gcloud auth print-access-token` (não funciona com GOOGLE_API_KEY simples)
- Requer `PROJECT_ID` do Google Cloud
- Requer que o projeto tenha Vertex AI API habilitada

**Endpoint Vertex AI:**
```
POST https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/veo-3.1-generate-001:predictLongRunning
```

**Modelos Veo disponíveis:**
| Model ID | Velocidade | Qualidade |
|----------|-----------|-----------|
| `veo-3.1-generate-001` | Lento | Melhor |
| `veo-3.1-fast-generate-001` | Rápido | Excelente |
| `veo-3.0-generate-001` | Médio | Excelente |
| `veo-2.0-generate-001` | Médio | Boa |

**Padrão assíncrono (Long-Running Operation):**
1. POST → retorna `name` da operação
2. GET polling → `https://us-central1-aiplatform.googleapis.com/v1/{operation_name}` até `done: true`
3. Resultado em Cloud Storage bucket especificado em `parameters.storageUri`

**Curl inicial:**
```bash
# Requer gcloud instalado e autenticado
ACCESS_TOKEN=$(gcloud auth print-access-token 2>/dev/null)
if [ -z "$ACCESS_TOKEN" ]; then
  echo "ERROR: gcloud not configured. Google Veo requires Google Cloud authentication."
  echo "Run: gcloud auth login && gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://us-central1-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/us-central1/publishers/google/models/veo-3.1-fast-generate-001:predictLongRunning" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"instances\": [{\"prompt\": \"$PROMPT\"}],
    \"parameters\": {
      \"storageUri\": \"gs://${GCS_BUCKET}/veo-output/\",
      \"sampleCount\": 1,
      \"durationSeconds\": 8
    }
  }")
```

**Implicação para o planner:** O skill VID-02 precisa de env vars adicionais: `GOOGLE_CLOUD_PROJECT` e `GCS_BUCKET`. Isso é mais complexo do que os outros skills desta fase. Ver Open Questions para alternativa.

**Fonte:** [Google Cloud Vertex AI Veo docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation) — MEDIUM confidence (Vertex AI, não Gemini API simples)

---

### SRCH-01: Tavily + Exa (Web Search)

**Tavily:**
```bash
curl --fail-with-body -s \
  -X POST "https://api.tavily.com/search" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"$QUERY\",
    \"search_depth\": \"basic\",
    \"max_results\": 5,
    \"include_answer\": true
  }"
```

Campos de resposta úteis: `answer` (resumo AI), `results[].url`, `results[].content`, `results[].score`

**Exa:**
```bash
curl --fail-with-body -s \
  -X POST "https://api.exa.ai/search" \
  -H "x-api-key: $EXA_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"$QUERY\",
    \"type\": \"auto\",
    \"contents\": {
      \"highlights\": {\"maxCharacters\": 4000}
    }
  }"
```

**Fonte Tavily:** [docs.tavily.com/search](https://docs.tavily.com/documentation/api-reference/endpoint/search) — HIGH confidence
**Fonte Exa:** [exa.ai/docs/reference/search-api-guide](https://exa.ai/docs/reference/search-api-guide) — HIGH confidence

---

### LLM-01: LLM Multi-Provider

**Anthropic (Claude):**
```bash
curl --fail-with-body -s \
  -X POST "https://api.anthropic.com/v1/messages" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d "{\"model\": \"claude-3-5-haiku-20241022\", \"max_tokens\": 1024, \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]}"
```

**Google Gemini (LLM):**
```bash
curl --fail-with-body -s \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent" \
  -H "x-goog-api-key: $GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"contents\": [{\"parts\": [{\"text\": \"$PROMPT\"}]}]}"
```

**Moonshot Kimi (confidence MEDIUM):**
```bash
curl --fail-with-body -s \
  -X POST "https://api.moonshot.cn/v1/chat/completions" \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"model\": \"moonshot-v1-8k\", \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]}"
```

**Zhipu AI GLM (confidence MEDIUM):**
```bash
curl --fail-with-body -s \
  -X POST "https://open.bigmodel.cn/api/paas/v4/chat/completions" \
  -H "Authorization: Bearer $GLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"model\": \"glm-4-flash\", \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]}"
```

**Nota sobre `disable-model-invocation`:** O skill `llm-models` NÃO deve ter `disable-model-invocation: true` — o usuário quer invocação direta. Mas a description deve deixar claro que isso chama uma API externa, não o próprio Claude.

---

## Como os Artifacts da Phase 1 São Usados

| Artifact Phase 1 | Como a Phase 2 Usa |
|------------------|---------------------|
| `scripts/load-env.sh` + `hooks/hooks.json` | Garante que `$GOOGLE_API_KEY`, `$ELEVENLABS_API_KEY`, etc. já estão no ambiente quando qualquer skill roda — zero boilerplate de `source` nos scripts |
| `commands/setup.md` | Usuário sem chaves configuradas pode rodar `/pocket-knife:setup` antes de testar os skills desta fase |
| Estrutura `skills/[cat]/[name]/SKILL.md` | Diretórios já existem com `.gitkeep`; Phase 2 cria `SKILL.md` em cada um |
| Contrato de segurança (`QUAL-04`) | Nenhum script desta fase faz `echo $API_KEY` ou usa `set -x` |
| `allowed-tools: Bash(curl *)` (`QUAL-02`) | Todos os 5 skills usam este frontmatter |

---

## Pitfalls Comuns

### Pitfall 1: Imagen 3 Descontinuado (IMG-01)
**O que dá errado:** Script com `imagen-3.0-generate-002` retorna 404 ou erro de modelo não encontrado.
**Por que acontece:** Imagen 3 foi descontinuado. Modelo atual é `imagen-4.0-generate-001`.
**Como evitar:** Usar sempre `imagen-4.0-generate-001`. Adicionar comentário no SKILL.md documentando a versão atual.
**Sinal de alerta:** Resposta `{"error": {"code": 404, "message": "Model not found"}}`.

### Pitfall 2: Veo Requer gcloud, Não GOOGLE_API_KEY (VID-02)
**O que dá errado:** `curl -H "x-goog-api-key: $GOOGLE_API_KEY"` para `aiplatform.googleapis.com` retorna 401.
**Por que acontece:** Vertex AI usa OAuth2 (`gcloud auth print-access-token`), não API key simples.
**Como evitar:** O skill VID-02 deve verificar `gcloud` e `GOOGLE_CLOUD_PROJECT`. Considerar versão alternativa via Gemini API se disponível.
**Sinal de alerta:** HTTP 401 com `"Request had invalid authentication credentials"`.

### Pitfall 3: ElevenLabs — Arquivo de Saída Vazio
**O que dá errado:** `curl -f ... --output audio.mp3` cria arquivo de 0 bytes sem erro de exit code.
**Por que acontece:** `-f` retorna exit 0 se HTTP 200, mas o body pode ser vazio por erro de encoding do texto.
**Como evitar:** Sempre verificar `[ -s "$OUTPUT_FILE" ]` após curl de saída binária.
**Sinal de alerta:** Arquivo `output.mp3` de 0 bytes; nenhum erro aparente no shell.

### Pitfall 4: JSON Injection via $PROMPT
**O que dá errado:** Se `$PROMPT` contém aspas ou caracteres especiais, o JSON fica malformado.
**Por que acontece:** Interpolação bash em strings JSON sem escape.
**Como evitar:** Usar `jq -n --arg prompt "$PROMPT" '{"text": $prompt}'` para construir JSON, ou escapar via `python3 -c "import json, sys; print(json.dumps(sys.argv[1]))" "$PROMPT"`.
**Sinal de alerta:** `curl: (3) URL using bad/illegal format` ou `{"error": "JSON parse error"}`.

### Pitfall 5: `--fail-with-body` não disponível em curl < 7.76
**O que dá errado:** `curl: option --fail-with-body: is unknown` em macOS Monterey ou Ubuntu 20.04.
**Por que acontece:** `--fail-with-body` foi adicionado no curl 7.76 (2021). Ambientes mais antigos não têm.
**Como evitar:** Testar com `curl --version | head -1` e usar fallback para `-f` se versão < 7.76. Documentar no README o requisito de curl 7.76+.
**Sinal de alerta:** `is unknown` ou `unrecognized option` na saída do curl.

### Pitfall 6: Saída de Imagem base64 — Linha Muito Longa
**O que dá errado:** `echo "$RESPONSE" | grep ...` falha silenciosamente para imagens grandes (base64 muito longo).
**Por que acontece:** Alguns shells têm limite de tamanho de linha para `echo`.
**Como evitar:** Salvar resposta em arquivo temporário (`curl ... -o /tmp/response.json`) e ler com `python3` ou `jq`.
**Sinal de alerta:** `output.png` gerado mas corrompido; erros de decodificação base64.

---

## State of the Art

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|------------------|-----------------|--------------|---------|
| `infsh app run google/gemini-3-pro-image-preview` | `curl ... generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict` | Dez 2025 | Chamada direta elimina intermediário pago |
| `imagen-3.0-generate-002` | `imagen-4.0-generate-001` | Mar 2026 | Imagen 3 descontinuado |
| `curl -f` (perde body de erro) | `curl --fail-with-body` | curl 7.76 (Abr 2021) | Preserva mensagem de erro da API |
| `infsh app run elevenlabs/tts` | `curl ... api.elevenlabs.io/v1/text-to-speech/{voice_id}` | Dez 2025 | Chamada direta com xi-api-key |
| Sem validação de chave | `[ -z "$API_KEY" ] && echo ERROR && exit 1` | Padrão QUAL-03 Phase 2 | Mensagem clara antes de falhar na rede |

**Depreciado/desatualizado:**
- `imagen-3.0-generate-002`: descontinuado, usar `imagen-4.0-generate-001`
- `curl -f` sem `--fail-with-body`: ainda funciona mas perde body de erro; usar `--fail-with-body` para JSON

---

## Open Questions

1. **Google Veo via Gemini API simples (vs Vertex AI)**
   - O que sabemos: Veo oficial usa Vertex AI com gcloud + PROJECT_ID
   - O que não está claro: Existe um endpoint `generativelanguage.googleapis.com` para Veo que aceita `x-goog-api-key`? A documentação do Google AI Studio sugere que Veo 2 pode estar disponível via Gemini API, mas não confirmado.
   - Recomendação: O planner deve criar duas tasks para VID-02: (a) tentar via `generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001` com GOOGLE_API_KEY, (b) se não funcionar, implementar via Vertex AI com `GOOGLE_CLOUD_PROJECT` adicional como env var obrigatória.

2. **Kimi e GLM — endpoints e modelos exatos**
   - O que sabemos: Moonshot API usa `https://api.moonshot.cn/v1/` com formato OpenAI-compatible; Zhipu usa `https://open.bigmodel.cn/api/paas/v4/`
   - O que não está claro: Modelos grátis vs pagos; nomes de modelo atuais (moonshot-v1-8k pode estar desatualizado)
   - Recomendação: Verificar docs oficiais de Moonshot e Zhipu durante implementação; o skill LLM-01 deve ser implementado sem Kimi/GLM inicialmente, adicionando-os após validação dos endpoints.

3. **Compatibilidade de curl `--fail-with-body` no ambiente do usuário**
   - O que sabemos: macOS Ventura+ e Ubuntu 22.04+ têm curl 7.76+; macOS Monterey pode ter curl 7.79+
   - O que não está claro: Git Bash no Windows (mencionado como risco na Phase 1) pode ter curl mais antigo
   - Recomendação: Adicionar verificação de versão no início dos scripts críticos; documentar requisito de curl 7.76+ no README.

---

## Environment Availability

> Esta fase não tem dependências externas além de `curl` e `python3` (para decodificação base64).

| Dependência | Requerida Por | Disponível | Versão | Fallback |
|-------------|---------------|------------|--------|----------|
| curl 7.76+ | QUAL-03 (`--fail-with-body`) | Depende do OS | Verificar com `curl --version` | Usar `-f` se versão antiga |
| python3 | Decodificação base64 de imagem | Sim (macOS/Linux) | 3.x | `base64 -d` (menos portável) |
| gcloud CLI | VID-02 (Google Veo via Vertex AI) | Não garantido | — | Ver Open Question #1 |
| GOOGLE_API_KEY | IMG-01, LLM-01 (Gemini) | Configurado pelo usuário | — | Mensagem guiando para setup |
| ELEVENLABS_API_KEY | AUD-01 | Configurado pelo usuário | — | Mensagem guiando para setup |
| TAVILY_API_KEY ou EXA_API_KEY | SRCH-01 | Configurado pelo usuário | — | Requer pelo menos um dos dois |
| ANTHROPIC_API_KEY ou GOOGLE_API_KEY ou KIMI_API_KEY ou GLM_API_KEY | LLM-01 | Configurado pelo usuário | — | Requer pelo menos um |

**Dependências ausentes sem fallback:**
- Nenhuma que bloqueie completamente. Cada skill tem mensagem de erro se a chave não estiver configurada.

**Dependências ausentes com fallback:**
- curl < 7.76: usar `-f` em vez de `--fail-with-body` (perde body de erro mas funciona)
- gcloud ausente: VID-02 pode usar Gemini API alternativa se disponível

---

## Validation Architecture

> nyquist_validation não está explicitamente configurado — tratado como habilitado.

### Framework de Teste
| Propriedade | Valor |
|-------------|-------|
| Framework | Manual validation (bash exit codes) — sem framework de teste automático para skills SKILL.md |
| Arquivo de config | N/A — validação é teste de smoke manual com chaves reais |
| Comando rápido | `bash -n skills/image/ai-image-generation/SKILL.md` (syntax check apenas) |
| Suite completa | Executar cada skill com chave de teste real e verificar resposta |

### Phase Requirements → Test Map

| Req ID | Comportamento | Tipo de Teste | Comando | Arquivo Existe? |
|--------|---------------|---------------|---------|-----------------|
| IMG-01 | Gera imagem PNG a partir de prompt | Smoke (manual com GOOGLE_API_KEY real) | `# curl para imagen-4.0-generate-001` | ❌ Wave 0 |
| AUD-01 | Gera arquivo MP3 a partir de texto | Smoke (manual com ELEVENLABS_API_KEY real) | `# curl para elevenlabs TTS` | ❌ Wave 0 |
| LLM-01 | Retorna resposta de LLM para prompt | Smoke (manual com pelo menos 1 LLM key) | `# curl para provedor detectado` | ❌ Wave 0 |
| SRCH-01 | Retorna resultados de busca para query | Smoke (manual com TAVILY_API_KEY ou EXA_API_KEY) | `# curl para tavily/exa` | ❌ Wave 0 |
| VID-02 | Gera vídeo ou falha com mensagem clara se gcloud ausente | Smoke (manual) | `# curl para Veo ou erro de gcloud` | ❌ Wave 0 |
| QUAL-03 | curl com chave inválida retorna mensagem de erro clara | Unit (bash com key inválida) | `GOOGLE_API_KEY=invalid bash skill_script.sh` | ❌ Wave 0 |

### Taxa de Amostragem
- **Por task commit:** Verificar manualmente o skill implementado com chave real
- **Por wave merge:** Verificar todos os 5 skills sequencialmente
- **Phase gate:** Todos os 5 skills produzindo output válido antes de avançar para Phase 3

### Wave 0 Gaps
- [ ] Criar `skills/image/ai-image-generation/SKILL.md` — cobre IMG-01
- [ ] Criar `skills/audio/elevenlabs-tts/SKILL.md` — cobre AUD-01
- [ ] Criar `skills/llm/llm-models/SKILL.md` — cobre LLM-01
- [ ] Criar `skills/search/web-search/SKILL.md` — cobre SRCH-01
- [ ] Criar `skills/video/google-veo/SKILL.md` — cobre VID-02
- [ ] Remover `.gitkeep` de cada diretório após criar `SKILL.md`

---

## Sources

### Primárias (HIGH confidence)
- [Google AI Imagen docs](https://ai.google.dev/gemini-api/docs/imagen) — endpoint `imagen-4.0-generate-001`, formato de resposta, descontinuação do Imagen 3
- [Google AI Image Generation docs](https://ai.google.dev/gemini-api/docs/image-generation) — endpoint Gemini nativo `gemini-3.1-flash-image-preview`, `responseModalities`
- [ElevenLabs TTS docs](https://elevenlabs.io/docs/api-reference/text-to-speech/convert) — endpoint `/v1/text-to-speech/{voice_id}`, header `xi-api-key`, formato binário
- [Tavily Search API docs](https://docs.tavily.com/documentation/api-reference/endpoint/search) — endpoint, Bearer auth, campos de request/response
- [Exa Search API guide](https://exa.ai/docs/reference/search-api-guide) — endpoint, `x-api-key` header, campos
- [Google Cloud Vertex AI Veo docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation) — endpoint `predictLongRunning`, modelos disponíveis, autenticação gcloud
- [curl manpage exit codes](https://curl.se/docs/manpage.html) — códigos de saída 22, 6, 7, 28
- [Phase 1 RESEARCH.md](.planning/phases/01-foundation/01-RESEARCH.md) — artifacts disponíveis: load-env.sh, hooks.json, estrutura de diretórios

### Secundárias (MEDIUM confidence)
- [Google AI Models page](https://ai.google.dev/gemini-api/docs/models) — lista de modelos Gemini/Imagen
- WebSearch "Moonshot Kimi API endpoint" — `api.moonshot.cn/v1/`, formato OpenAI-compat
- WebSearch "Zhipu GLM API endpoint" — `open.bigmodel.cn/api/paas/v4/`
- [Inference-sh SKILL.md files](https://github.com/inference-sh/skills) — lógica dos skills originais (usando `infsh`, não curl direto)

### Terciárias (LOW confidence)
- Nenhuma fonte apenas WebSearch não verificada utilizada para decisões críticas

---

## Metadata

**Confidence breakdown:**
- IMG-01 (Imagen 4): HIGH — endpoint e auth verificados contra docs oficiais Google AI
- AUD-01 (ElevenLabs TTS): HIGH — endpoint, header e formato de resposta verificados
- SRCH-01 (Tavily + Exa): HIGH — ambos os endpoints e headers verificados
- LLM-01 (Anthropic/Gemini): HIGH — endpoints confirmados; Kimi/GLM: MEDIUM
- VID-02 (Google Veo): MEDIUM — Vertex AI confirmado mas requer gcloud, não GOOGLE_API_KEY; alternativa via Gemini API não confirmada
- QUAL-03 (curl error handling): HIGH — padrão `--fail-with-body` e exit codes verificados via curl docs oficiais

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (APIs estáveis; exceto Imagen — modelos podem descontinuar)
