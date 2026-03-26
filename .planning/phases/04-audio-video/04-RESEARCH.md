# Phase 4: Audio e Video - Research

**Researched:** 2026-03-26
**Domain:** ElevenLabs API (STT, Dialogue, Sound Effects, Voice Cloning, Voice Changer, Music, Dubbing, Voice Isolator) + fal.ai Video (Kling, Wan, Seedance) com async queue
**Confidence:** HIGH para ElevenLabs REST endpoints (verificados na documentacao oficial); HIGH para fal.ai queue pattern (verificado em docs oficiais); MEDIUM para modelos de video especificos (versoes mudam rapidamente)

---

<phase_requirements>
## Phase Requirements

| ID | Descricao | Suporte de Pesquisa |
|----|-----------|---------------------|
| AUD-02 | Skill `elevenlabs-stt` — speech-to-text (chave: `ELEVENLABS_API_KEY`) | Endpoint confirmado: `POST /v1/speech-to-text`; multipart/form-data com `file` + `model_id`; resposta JSON |
| AUD-03 | Skill `elevenlabs-dialogue` — geracao de dialogos multi-speaker | Endpoint confirmado: `POST /v1/text-to-dialogue`; JSON com array `inputs[{text, voice_id}]`; resposta binaria |
| AUD-04 | Skill `elevenlabs-sound-effects` — efeitos sonoros | Endpoint confirmado: `POST /v1/sound-generation`; JSON com `text`, `duration_seconds`, `prompt_influence`; resposta binaria |
| AUD-05 | Skill `elevenlabs-voice-cloner` — clonagem de voz | Endpoint confirmado: `POST /v1/voices/add`; multipart/form-data com `name` + `files`; retorna `voice_id` |
| AUD-06 | Skill `elevenlabs-voice-changer` — transformacao de voz | Endpoint confirmado: `POST /v1/speech-to-speech/{voice_id}`; multipart/form-data com `audio`; resposta binaria |
| AUD-07 | Skill `elevenlabs-music` — geracao de musica | Endpoint confirmado: `POST /v1/music`; JSON com `prompt` + `music_length_ms`; resposta binaria; modelo `music_v1` |
| AUD-08 | Skill `elevenlabs-dubbing` — dublagem automatica | Endpoint confirmado: `POST /v1/dubbing` (criacao) + `GET /v1/dubbing/{id}` (polling) + `GET /v1/dubbing/{id}/audio/{lang}` (download); async |
| AUD-09 | Skill adicional de audio — `elevenlabs-voice-isolator` | Endpoint confirmado: `POST /v1/audio-isolation`; multipart/form-data com `audio`; resposta binaria |
| AUD-10 | Todas as skills ElevenLabs usam `disable-model-invocation: true` | Requisito de frontmatter — nenhuma skill ElevenLabs deve ser auto-invocada |
| VID-01 | Skill `ai-video-generation` — geracao de video generica | fal.ai queue pattern: `POST queue.fal.run/{model-id}` -> poll status -> GET result; modelo recomendado: Kling 1.6 |
| VID-03 | Skill `image-to-video` — conversao de imagem para video | fal.ai queue pattern; modelos: Wan 2.2 5B ou Kling 2.1 Pro; parametro `image_url` |
| VID-04 | Skills de video adicionais (Kling, Seedance, etc.) | fal.ai: Seedance 1.0 Pro, Wan 2.2, Kling 2.1; todos usam mesmo queue pattern |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Idioma:** Sempre responder em portugues
- **Conducta:** Jamais implementar funcionalidades sem ordem explicita; seguir tarefas do planejamento sem pular etapas; mensagem de conclusao ao terminar cada tarefa
- **MCPs Obrigatorios:** Sequential Thinking para raciocinio profundo em scripts bash com logica async (polling loops, error handling de dubbing); Playwright para validacoes visuais se necessario
- **Implicacoes para esta fase:** Sequential Thinking DEVE ser usado para scripts de polling async (dubbing, video queue) e para o pattern multipart de STT e voice cloner

---

## Summary

A Phase 4 implementa 11 skills restantes de audio (ElevenLabs) e 3 skills de video (fal.ai), todos com padroes de entrada/saida mais complexos do que os skills de Phase 2/3.

Do lado do audio, o desafio central e a variedade de formatos de requisicao: alguns endpoints ElevenLabs aceitam JSON simples e retornam audio binario (sound-generation, music, text-to-dialogue), outros aceitam multipart/form-data com upload de arquivo (speech-to-text, speech-to-speech, voices/add, audio-isolation). O dubbing e o unico endpoint ElevenLabs verdadeiramente assincrono — cria um job, retorna `dubbing_id`, exige polling de status, e so entrega o audio apos conclusao (tipicamente minutos).

Do lado do video, todos os modelos fal.ai usam o mesmo padrao de fila assincrona ja pesquisado na Phase 3: `POST https://queue.fal.run/{model-id}` -> `GET .../status` em loop -> `GET .../response`. O pattern e identico ao usado pelos skills de imagem fal.ai da Phase 3. A diferenca e que videos levam mais tempo (30-180 segundos tipicos), entao o loop de polling precisa de MAX_WAIT maior.

**Recomendacao principal:** Agrupar skills por padrao de implementacao (nao por tipo): (1) JSON -> binario, (2) multipart -> binario, (3) multipart -> JSON (STT), (4) async create+poll (dubbing, video). Isso minimiza re-trabalho e garante que cada padrao seja validado antes de ser replicado.

---

## Standard Stack

### Core (sem novas dependencias — igual Phase 2/3)

| Componente | Versao | Proposito | Por que padrao |
|------------|--------|-----------|----------------|
| curl | 7.76+ (sistema) | Upload multipart, binario output, POST JSON | Suporta `-F` para multipart, `--output` para binario, `-f` para fail-on-error |
| Bash (POSIX) | sistema | Scripts de chamada | Sem nova dependencia; `while` loop para polling |
| python3 | sistema | Parsing JSON de status (dubbing/video) | Ja usado em Phase 2 para base64; disponivel em todos os alvos |

### ElevenLabs API — Novos Endpoints

| Skill | Endpoint | Metodo | Content-Type | Resposta | Auth |
|-------|----------|--------|--------------|----------|------|
| elevenlabs-stt | `https://api.elevenlabs.io/v1/speech-to-text` | POST | multipart/form-data | JSON | xi-api-key |
| elevenlabs-dialogue | `https://api.elevenlabs.io/v1/text-to-dialogue` | POST | application/json | audio binario | xi-api-key |
| elevenlabs-sound-effects | `https://api.elevenlabs.io/v1/sound-generation` | POST | application/json | audio binario | xi-api-key |
| elevenlabs-voice-cloner | `https://api.elevenlabs.io/v1/voices/add` | POST | multipart/form-data | JSON com voice_id | xi-api-key |
| elevenlabs-voice-changer | `https://api.elevenlabs.io/v1/speech-to-speech/{voice_id}` | POST | multipart/form-data | audio binario | xi-api-key |
| elevenlabs-music | `https://api.elevenlabs.io/v1/music` | POST | application/json | audio binario | xi-api-key |
| elevenlabs-dubbing (criar) | `https://api.elevenlabs.io/v1/dubbing` | POST | multipart/form-data | JSON com dubbing_id | xi-api-key |
| elevenlabs-dubbing (status) | `https://api.elevenlabs.io/v1/dubbing/{dubbing_id}` | GET | — | JSON com status | xi-api-key |
| elevenlabs-dubbing (audio) | `https://api.elevenlabs.io/v1/dubbing/{dubbing_id}/audio/{lang}` | GET | — | audio/video binario | xi-api-key |
| elevenlabs-voice-isolator | `https://api.elevenlabs.io/v1/audio-isolation` | POST | multipart/form-data | audio binario | xi-api-key |

### fal.ai Video Queue API

| Endpoint | URL | Proposito |
|----------|-----|-----------|
| Submit | `POST https://queue.fal.run/{model-id}` | Enviar job; retorna `request_id` |
| Status | `GET https://queue.fal.run/{model-id}/requests/{request_id}/status` | Poll: IN_QUEUE, IN_PROGRESS, COMPLETED |
| Result | `GET https://queue.fal.run/{model-id}/requests/{request_id}/response` | Buscar resultado apos COMPLETED |

Auth para todos: `Authorization: Key $FAL_KEY`

### Modelos fal.ai para Video

| Skill | Modelo Recomendado | Model ID | Capacidade |
|-------|--------------------|----------|------------|
| ai-video-generation (t2v) | Kling 1.6 Standard | `fal-ai/kling-video/v1.6/standard/text-to-video` | 5-10s, 16:9/9:16/1:1 |
| ai-video-generation (alt) | Seedance 1.0 Pro | `fal-ai/bytedance/seedance/v1/pro/text-to-video` | 2-12s, 1080p |
| image-to-video | Wan 2.2 5B | `fal-ai/wan/v2.2-5b/image-to-video` | 5s, 720p, 24fps |
| image-to-video (alt) | Kling 2.1 Pro | `fal-ai/kling-video/v2.1/pro/image-to-video` | alta fidelidade |
| p-video (VID-04) | Seedance 1.0 Lite | `fal-ai/bytedance/seedance/v1/lite/text-to-video` | rapido, economico |

---

## Architecture Patterns

### Estrutura de diretorios (Phase 4 — skills a criar)

```
skills/
├── audio/
│   ├── elevenlabs-tts/        # JA EXISTE (Phase 2)
│   ├── elevenlabs-stt/        # AUD-02 — multipart upload, JSON response
│   ├── elevenlabs-dialogue/   # AUD-03 — JSON request, binary response
│   ├── elevenlabs-sound-effects/ # AUD-04 — JSON request, binary response
│   ├── elevenlabs-voice-cloner/  # AUD-05 — multipart upload, JSON response
│   ├── elevenlabs-voice-changer/ # AUD-06 — multipart upload, binary response
│   ├── elevenlabs-music/      # AUD-07 — JSON request, binary response
│   ├── elevenlabs-dubbing/    # AUD-08 — multipart + async polling
│   └── elevenlabs-voice-isolator/ # AUD-09 — multipart upload, binary response
└── video/
    ├── google-veo/            # JA EXISTE (Phase 2)
    ├── ai-video-generation/   # VID-01 — fal.ai queue, text-to-video
    ├── image-to-video/        # VID-03 — fal.ai queue, image-to-video
    └── p-video/               # VID-04 — fal.ai queue, alternativo economico
```

---

### Pattern 1: ElevenLabs JSON -> Binario (dialogue, sound-effects, music)

**O que e:** POST com JSON body, resposta e audio binario salvo via `--output`.

**Quando usar:** elevenlabs-dialogue, elevenlabs-sound-effects, elevenlabs-music

**Exemplo (sound-effects):**

```bash
# Source: https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: ELEVENLABS_API_KEY not set. Run /pocket-knife:setup to configure."
  exit 1
fi

OUTPUT="$HOME/Downloads/sound_effect_$(date +%s).mp3"

curl -f -s \
  -X POST "https://api.elevenlabs.io/v1/sound-generation" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEXT\", \"duration_seconds\": 5.0, \"prompt_influence\": 0.3}" \
  --output "$OUTPUT"

if [ $? -ne 0 ]; then
  echo "ERROR: Sound effects API failed. Check ELEVENLABS_API_KEY."
  exit 1
fi
echo "Sound effect saved to: $OUTPUT"
```

**Nota critica:** Para saida binaria, usar `-f` (nao `--fail-with-body`). `--fail-with-body` mistura body de erro com bytes binarios.

---

### Pattern 2: ElevenLabs Multipart -> Binario (voice-changer, voice-isolator)

**O que e:** POST com multipart/form-data enviando arquivo de audio como `-F "audio=@$filepath"`, resposta e audio binario.

**Quando usar:** elevenlabs-voice-changer, elevenlabs-voice-isolator

**Exemplo (voice-changer):**

```bash
# Source: https://elevenlabs.io/docs/api-reference/speech-to-speech/convert
VOICE_ID="${VOICE_ID:-JBFqnCBsd6RMkjVDRZzb}"  # George (default)
OUTPUT="$HOME/Downloads/voice_changed_$(date +%s).mp3"

curl -f -s \
  -X POST "https://api.elevenlabs.io/v1/speech-to-speech/${VOICE_ID}" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "audio=@${AUDIO_FILE}" \
  -F "model_id=eleven_multilingual_sts_v2" \
  -F "output_format=mp3_44100_128" \
  --output "$OUTPUT"

if [ $? -ne 0 ]; then
  echo "ERROR: Voice changer API failed."
  exit 1
fi
echo "Changed audio saved to: $OUTPUT"
```

---

### Pattern 3: ElevenLabs Multipart -> JSON (stt, voice-cloner)

**O que e:** POST multipart/form-data, resposta e JSON (nao binario).

**Quando usar:** elevenlabs-stt (retorna transcricao JSON), elevenlabs-voice-cloner (retorna voice_id JSON)

**Exemplo (STT):**

```bash
# Source: https://elevenlabs.io/docs/api-reference/speech-to-text/convert
RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://api.elevenlabs.io/v1/speech-to-text" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "model_id=scribe_v2" \
  -F "file=@${AUDIO_FILE}" \
  -F "language_code=${LANGUAGE:-}" \
  -F "diarize=false")

if [ $? -ne 0 ]; then
  echo "ERROR: STT API failed."
  echo "$RESPONSE"
  exit 1
fi

echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('Transcription:')
print(data.get('text', ''))
"
```

**Exemplo (Voice Cloner):**

```bash
# Source: https://elevenlabs.io/docs/api-reference/voices/add
RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://api.elevenlabs.io/v1/voices/add" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "name=${VOICE_NAME}" \
  -F "files=@${SAMPLE_FILE_1}" \
  -F "description=${DESCRIPTION:-}")

VOICE_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['voice_id'])")
echo "Voice cloned! voice_id: $VOICE_ID"
echo "Use this voice_id with /pocket-knife:elevenlabs-tts or /pocket-knife:elevenlabs-voice-changer"
```

---

### Pattern 4: ElevenLabs Async Dubbing (criar + poll + download)

**O que e:** Tres chamadas curl encadeadas. Criar job (POST multipart), poll ate status != "dubbing", download (GET binario).

**Quando usar:** elevenlabs-dubbing (unico endpoint ElevenLabs verdadeiramente assincrono)

**Exemplo:**

```bash
# Source: https://elevenlabs.io/docs/api-reference/dubbing/create
# Step 1: Criar job de dubbing
RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://api.elevenlabs.io/v1/dubbing" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "source_url=${SOURCE_URL}" \
  -F "target_lang=${TARGET_LANG}" \
  -F "source_lang=${SOURCE_LANG:-auto}" \
  -F "num_speakers=0")

DUBBING_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['dubbing_id'])")
echo "Dubbing started. ID: $DUBBING_ID"

# Step 2: Poll status
MAX_WAIT=600  # 10 minutos
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
  STATUS_RESP=$(curl -f -s \
    "https://api.elevenlabs.io/v1/dubbing/${DUBBING_ID}" \
    -H "xi-api-key: $ELEVENLABS_API_KEY")
  STATUS=$(echo "$STATUS_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")

  if [ "$STATUS" = "dubbed" ]; then
    echo "Dubbing complete!"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "ERROR: Dubbing failed."
    exit 1
  fi

  echo "Status: $STATUS — waiting 15s..."
  sleep 15
  ELAPSED=$((ELAPSED + 15))
done

# Step 3: Download audio
OUTPUT="$HOME/Downloads/dubbed_${TARGET_LANG}_$(date +%s).mp4"
curl -f -s \
  "https://api.elevenlabs.io/v1/dubbing/${DUBBING_ID}/audio/${TARGET_LANG}" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  --output "$OUTPUT"
echo "Dubbed file saved to: $OUTPUT"
```

**Valores de status do dubbing:** `"dubbing"` (em progresso), `"dubbed"` (concluido), `"failed"` (erro)

---

### Pattern 5: fal.ai Video Async Queue

**O que e:** POST para `queue.fal.run`, poll de status, GET de resultado. Identico ao padrao ja estabelecido em Phase 3 para imagens fal.ai, mas com tempo de espera maior (30-180s para video).

**Quando usar:** ai-video-generation, image-to-video, p-video (todos os skills de video fal.ai)

**Exemplo (text-to-video):**

```bash
# Source: https://fal.ai/docs/model-apis/model-endpoints/queue
MODEL="fal-ai/kling-video/v1.6/standard/text-to-video"

# Step 1: Submeter job
SUBMIT=$(curl --fail-with-body -s \
  -X POST "https://queue.fal.run/${MODEL}" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"${PROMPT}\", \"duration\": \"5\", \"aspect_ratio\": \"16:9\"}")

REQUEST_ID=$(echo "$SUBMIT" | python3 -c "import sys,json; print(json.load(sys.stdin)['request_id'])")
echo "Video job submitted. request_id: $REQUEST_ID"

# Step 2: Poll status
MAX_WAIT=300  # 5 minutos
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
  STATUS_RESP=$(curl -f -s \
    "https://queue.fal.run/${MODEL}/requests/${REQUEST_ID}/status" \
    -H "Authorization: Key $FAL_KEY")
  STATUS=$(echo "$STATUS_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")

  if [ "$STATUS" = "COMPLETED" ]; then
    echo "Video ready!"
    break
  elif echo "$STATUS_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('error') is None else 1)"; then
    :
  else
    echo "ERROR: Video generation failed."
    exit 1
  fi

  echo "Status: $STATUS — waiting 10s..."
  sleep 10
  ELAPSED=$((ELAPSED + 10))
done

# Step 3: Buscar resultado
RESULT=$(curl --fail-with-body -s \
  "https://queue.fal.run/${MODEL}/requests/${REQUEST_ID}/response" \
  -H "Authorization: Key $FAL_KEY")

VIDEO_URL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['video']['url'])")
OUTPUT="$HOME/Downloads/video_$(date +%s).mp4"
curl -f -s "$VIDEO_URL" --output "$OUTPUT"
echo "Video saved to: $OUTPUT"
```

**Exemplo (image-to-video — diferenca: adicionar `image_url`):**

```bash
MODEL="fal-ai/wan/v2.2-5b/image-to-video"
# Step 1: Submeter com image_url
SUBMIT=$(curl --fail-with-body -s \
  -X POST "https://queue.fal.run/${MODEL}" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"${PROMPT}\", \"image_url\": \"${IMAGE_URL}\"}")
# Step 2 e 3: identicos ao text-to-video acima
```

---

### Anti-Patterns a Evitar

- **`--fail-with-body` + `--output` para binario:** O body de erro HTTP vai corrompendo o arquivo binario. Para qualquer resposta binaria, usar `-f` (sem `--fail-with-body`) + `--output filepath`. Checar tamanho do arquivo depois.
- **Fire-and-forget em video/dubbing:** Nunca entregar o resultado sem aguardar o job. O skill DEVE aguardar o COMPLETED/dubbed antes de retornar.
- **Hardcode de voice_id:** Usar voz padrao (George: `JBFqnCBsd6RMkjVDRZzb`) como fallback, mas sempre permitir override por parametro do usuario.
- **`disable-model-invocation: false` em skills ElevenLabs:** Todos os skills de audio DEVEM ter `disable-model-invocation: true` (AUD-10). Sem excecoes.
- **Modelo deprecated `eleven_monolingual_v1`:** Proibido. Usar `eleven_multilingual_v2` para TTS, `eleven_multilingual_sts_v2` para STS/voice-changer.

---

## Don't Hand-Roll

| Problema | Nao Construir | Usar Em Vez | Por que |
|----------|---------------|-------------|---------|
| Upload de arquivo de audio | Parser multipart manual | `curl -F "file=@$filepath"` | curl faz multipart nativo, encoding correto |
| Polling de job async | Implementacao proprio com retry/backoff | Loop `while + sleep` com MAX_WAIT | Simples, sem dependencias, facil de entender |
| Download de video/audio binario | Fetch com pipes | `curl -f --output $filepath` | curl salva binario sem corromper |
| Parsing de JSON de status | Parser bash manual (grep/sed) | `python3 -c "import json..."` | python3 disponivel em todos os alvos; seguro para Unicode |
| Deteccao de formato de audio de entrada | Validacao de magic bytes | Instrucao ao usuario de fornecer path absoluto | Fora do escopo; STT aceita WAV/MP3/FLAC/OGG/AAC |

---

## Common Pitfalls

### Pitfall 1: Binary Output com `--fail-with-body`

**O que da errado:** `--fail-with-body` direciona o body de erro HTTP para o mesmo stream que `--output`. Para resposta JSON de erro (e.g., 401 Unauthorized), o JSON vai para o arquivo de audio — arquivo fica corrompido.

**Por que acontece:** `--fail-with-body` foi projetado para mostrar o body de erro no stdout, mas interfere com `--output`.

**Como evitar:** Usar `-f` (flag curta de `--fail`) para qualquer chamada com `--output`. Checar `$?` apos o curl e verificar tamanho do arquivo: `[ -s "$OUTPUT" ]`.

**Sinais de alerta:** Arquivo de audio criado mas players retornam "formato invalido". Tamanho do arquivo suspeito (< 1KB para audio de > 1s).

---

### Pitfall 2: Dubbing Status "dubbing" vs "dubbed"

**O que da errado:** O campo `status` na resposta do GET `/v1/dubbing/{id}` usa `"dubbing"` (em progresso) e `"dubbed"` (concluido) — nao os termos intuitivos "pending"/"complete"/"done".

**Por que acontece:** Nomenclatura especifica da ElevenLabs.

**Como evitar:** Verificar exatamente por `[ "$STATUS" = "dubbed" ]`, nao por `[ "$STATUS" != "dubbing" ]` — pode haver estados intermediarios ou "failed".

**Sinais de alerta:** Loop infinito de polling se comparando por negacao do estado em progresso.

---

### Pitfall 3: ElevenLabs Multipart — `-F` vs `-d` para `voice_settings`

**O que da errado:** O parametro `voice_settings` no endpoint speech-to-speech e um objeto JSON, mas o Content-Type e multipart/form-data. Passar `-d '{"voice_settings": {...}}'` falha porque o body inteiro vira form-data.

**Por que acontece:** Em multipart, cada campo e enviado separado. JSON aninhado deve ser serializado como string: `-F "voice_settings={\"stability\":0.5}"`.

**Como evitar:** Serializar objetos JSON como strings dentro de campos `-F`. Exemplo: `-F "voice_settings={\"stability\":0.75, \"similarity_boost\":0.75}"`.

---

### Pitfall 4: fal.ai Video — Timeout Muito Curto

**O que da errado:** Video generation leva 30-180 segundos. MAX_WAIT de 60s resulta em timeout antes da conclusao.

**Por que acontece:** Videos sao computacionalmente intensivos. Kling 1.6 / Wan 2.2 tipicamente levam 60-120s para clips de 5s.

**Como evitar:** MAX_WAIT = 300 (5 minutos) como minimo para video. Polling interval de 10s (nao 2s — evita rate limiting). Mostrar mensagem de progresso em cada poll.

---

### Pitfall 5: Voice Cloner — Qualidade do Sample

**O que da errado:** A API aceita o upload e retorna `voice_id`, mas a voz clonada soa ruim ou como voz padrao.

**Por que acontece:** ElevenLabs requer audio limpo sem ruido de fundo, minimo de 1 minuto de audio, idealmente 3+ minutos.

**Como evitar:** O SKILL.md deve avisar o usuario explicitamente: "Forneca 1+ minuto de audio limpo, sem musica de fundo. Mais audio = melhor qualidade."

---

### Pitfall 6: ElevenLabs STT — `file` vs `source_url`

**O que da errado:** O endpoint aceita `file` (upload binario) OU `source_url` (URL publica), mas nao os dois. Se ambos forem enviados, retorna erro 422.

**Por que acontece:** Campos mutuamente exclusivos na API.

**Como evitar:** O skill deve pedir ao usuario o path local (para upload) ou URL publica, e usar o campo correto. Default: path local com `-F "file=@$AUDIO_FILE"`.

---

## Code Examples

### ElevenLabs STT — curl completo

```bash
# Source: https://elevenlabs.io/docs/api-reference/speech-to-text/convert
curl --fail-with-body -s \
  -X POST "https://api.elevenlabs.io/v1/speech-to-text" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "model_id=scribe_v2" \
  -F "file=@/path/to/audio.mp3" \
  -F "diarize=false" \
  -F "timestamps_granularity=word"
# Response JSON: { "text": "...", "words": [...], "language_code": "en" }
```

### ElevenLabs Dialogue (multi-speaker)

```bash
# Source: https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert
# Parametro: array inputs com voice_id por segmento, max 10 vozes unicas
curl -f -s \
  -X POST "https://api.elevenlabs.io/v1/text-to-dialogue" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": [
      {"text": "Hello, how are you?", "voice_id": "JBFqnCBsd6RMkjVDRZzb"},
      {"text": "I am great, thanks!", "voice_id": "EXAVITQu4vr4xnSDxMaL"}
    ],
    "model_id": "eleven_v3"
  }' \
  --output "$HOME/Downloads/dialogue_$(date +%s).mp3"
```

### ElevenLabs Music

```bash
# Source: https://elevenlabs.io/docs/api-reference/music/compose
# Lançado agosto 2025; modelo: music_v1; duracao em ms (3000-600000)
curl -f -s \
  -X POST "https://api.elevenlabs.io/v1/music" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"${PROMPT}\", \"music_length_ms\": 30000, \"model_id\": \"music_v1\"}" \
  --output "$HOME/Downloads/music_$(date +%s).mp3"
```

### ElevenLabs Voice Cloner — resposta JSON

```bash
# Source: search verified; endpoint: POST /v1/voices/add
RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://api.elevenlabs.io/v1/voices/add" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "name=${VOICE_NAME}" \
  -F "files=@${SAMPLE_1}" \
  -F "remove_background_noise=false")
# Response: { "voice_id": "abc123xyz" }
VOICE_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['voice_id'])")
```

### fal.ai Queue — padrao curl completo

```bash
# Source: https://fal.ai/docs/model-apis/model-endpoints/queue
# 1. Submit
SUBMIT=$(curl --fail-with-body -s \
  -X POST "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"$PROMPT\", \"duration\": \"5\"}")
REQUEST_ID=$(echo "$SUBMIT" | python3 -c "import sys,json; print(json.load(sys.stdin)['request_id'])")

# 2. Poll
while true; do
  STATUS=$(curl -f -s \
    "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video/requests/$REQUEST_ID/status" \
    -H "Authorization: Key $FAL_KEY" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")
  [ "$STATUS" = "COMPLETED" ] && break
  sleep 10
done

# 3. Get result
VIDEO_URL=$(curl -f -s \
  "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video/requests/$REQUEST_ID/response" \
  -H "Authorization: Key $FAL_KEY" | python3 -c "import sys,json; print(json.load(sys.stdin)['video']['url'])")
curl -f -s "$VIDEO_URL" --output "$HOME/Downloads/video_$(date +%s).mp4"
```

---

## State of the Art

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|------------------|-----------------|--------------|---------|
| Modelo ElevenLabs `eleven_monolingual_v1` | `eleven_multilingual_v2` (TTS) / `eleven_multilingual_sts_v2` (STS) | 2023 | Proibir `monolingual_v1` em todos os scripts |
| ElevenLabs Music era fechado/beta | `POST /v1/music` disponivel na API publica | Agosto 2025 | Implementavel com curl direto; modelo: `music_v1` |
| fal.ai SDK obrigatorio | REST direto via `queue.fal.run` | 2024 | Implementavel com curl sem SDK |
| Kling 1.0 era o mais recente | Kling 1.6, 2.1, 2.5 disponiveis | 2025 | Usar 1.6 como default (estavel); 2.1 Pro para alta fidelidade |
| Wan 2.1 era baseline | Wan 2.2 (5B e A14B) e 2.6 disponiveis | 2025 | Usar 2.2-5b como default economico para i2v |

**Deprecated/desatualizado:**
- `eleven_monolingual_v1`: Substituido; modelos multilingual sao o padrao
- `infsh app run`: Toda referencia aos skills originais do inference-sh usa `infsh` CLI — IGNORAR; usar curl direto para as APIs dos provedores

---

## Open Questions

1. **ElevenLabs Dialogue — Voices disponiveis sem plan pago**
   - O que sabemos: O endpoint `/v1/text-to-dialogue` aceita qualquer `voice_id`; as vozes premium (George, Aria, etc.) requerem account ElevenLabs
   - O que e incerto: Se o usuario tem apenas Free tier, quais voice_ids estao disponiveis
   - Recomendacao: O skill deve instruir o usuario a rodar `/pocket-knife:elevenlabs-tts` primeiro para listar vozes disponiveis, ou usar voice_ids hardcoded de vozes publicas gratuitas

2. **ElevenLabs Dubbing — Suporte a arquivo local vs URL**
   - O que sabemos: O endpoint aceita tanto `-F "file=@local.mp4"` quanto `-F "source_url=https://..."`
   - O que e incerto: Limite de tamanho para upload direto (documentacao nao especifica explicitamente)
   - Recomendacao: Default para `source_url` (mais simples, sem limite de banda); documentar fallback para upload direto

3. **fal.ai Video — Rate limiting durante polling**
   - O que sabemos: O endpoint de status retorna 429 se chamado com frequencia alta
   - O que e incerto: Limite exato de requests por segundo/minuto para endpoints de status
   - Recomendacao: Polling interval de 10s (nao 2s); registrar no SKILL.md como parametro configuravel MAX_WAIT

4. **VID-04 — Escopo exato de "skills adicionais de video"**
   - O que sabemos: O roadmap menciona Kling e Seedream/Seedance; todos os modelos fal.ai usam o mesmo queue pattern
   - O que e incerto: Quantos skills separados VID-04 representa (um skill por modelo ou um skill com selecao de modelo)
   - Recomendacao: Um unico skill `p-video` com modelo Seedance 1.0 Lite (economico, fal.ai, mesmo pattern) — consistente com o nome `p-video` encontrado no inference-sh repo

---

## Environment Availability Audit

Step 2.6: SKIPPED (sem novas dependencias externas — curl, bash e python3 ja validados nas fases anteriores)

---

## Validation Architecture

> nyquist_validation nao configurado explicitamente em config.json — tratar como habilitado.

### Test Framework

| Propriedade | Valor |
|-------------|-------|
| Framework | Bash + curl (testes manuais de round-trip) |
| Arquivo de config | Nenhum — validacao por invocacao direta dos skills |
| Comando rapido | `claude --plugin-dir . /pocket-knife:elevenlabs-stt` com arquivo de audio de teste |
| Suite completa | Invocar cada skill com chave valida e verificar output nao vazio |

### Phase Requirements -> Test Map

| Req ID | Comportamento | Tipo de Teste | Comando Automatizado | Arquivo Existe? |
|--------|--------------|---------------|----------------------|-----------------|
| AUD-02 | STT transcribe audio e retorna texto | smoke | Invocar skill com MP3 de 5s, checar JSON com campo "text" nao vazio | Nao — Wave 0 |
| AUD-03 | Dialogue gera audio com multiplas vozes | smoke | Invocar skill com 2 segmentos, checar arquivo MP3 > 1KB | Nao — Wave 0 |
| AUD-04 | Sound effects gera audio de efeito sonoro | smoke | Invocar skill com descricao, checar arquivo MP3 > 1KB | Nao — Wave 0 |
| AUD-05 | Voice cloner retorna voice_id valido | smoke | Invocar skill com sample de audio, checar JSON com voice_id | Nao — Wave 0 |
| AUD-06 | Voice changer transforma voz preservando conteudo | smoke | Invocar skill com audio de entrada, checar MP3 > 1KB | Nao — Wave 0 |
| AUD-07 | Music gera musica em MP3 | smoke | Invocar skill com prompt, checar MP3 > 100KB | Nao — Wave 0 |
| AUD-08 | Dubbing completa async e entrega audio dublado | smoke | Invocar skill com video em ingles, alvo "pt", checar MP4 > 0 bytes | Nao — Wave 0 |
| AUD-09 | Voice isolator remove ruido e retorna voz isolada | smoke | Invocar skill com audio com ruido, checar MP3 > 1KB | Nao — Wave 0 |
| AUD-10 | Todos skills ElevenLabs tem disable-model-invocation: true | static | `grep "disable-model-invocation: true" skills/audio/elevenlabs-*/SKILL.md` — deve retornar 9 linhas | Nao — Wave 0 |
| VID-01 | ai-video-generation gera video e salva arquivo | smoke | Invocar skill com prompt simples, aguardar COMPLETED, checar MP4 > 0 bytes | Nao — Wave 0 |
| VID-03 | image-to-video anima imagem e salva video | smoke | Invocar skill com URL de imagem publica, checar MP4 > 0 bytes | Nao — Wave 0 |
| VID-04 | p-video gera video via Seedance | smoke | Invocar skill com prompt, checar MP4 > 0 bytes | Nao — Wave 0 |

### Sampling Rate

- **Por task commit:** Verificar frontmatter YAML valido (`grep "disable-model-invocation" SKILL.md`)
- **Por wave merge:** Smoke test manual de pelo menos 1 skill de audio + 1 skill de video
- **Phase gate:** Todos os skills invocaveis sem erro com chaves validas antes de `/gsd:verify-work`

### Wave 0 Gaps

- [ ] Arquivo de audio de teste (5-10s, MP3/WAV) para smoke tests de STT, voice-changer, voice-isolator
- [ ] URL publica de video curto para smoke test de dubbing
- [ ] URL publica de imagem para smoke test de image-to-video

---

## Sources

### Primary (HIGH confidence)

- [ElevenLabs Speech-to-Text API](https://elevenlabs.io/docs/api-reference/speech-to-text/convert) — endpoint, parametros, formatos
- [ElevenLabs Sound Generation API](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert) — endpoint `/v1/sound-generation`, parametros JSON
- [ElevenLabs Speech-to-Speech API](https://elevenlabs.io/docs/api-reference/speech-to-speech/convert) — endpoint `/v1/speech-to-speech/{voice_id}`, multipart
- [ElevenLabs Text-to-Dialogue API](https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert) — endpoint `/v1/text-to-dialogue`, estrutura `inputs[]`
- [ElevenLabs Music API](https://elevenlabs.io/docs/api-reference/music/compose) — endpoint `/v1/music`, modelo `music_v1`
- [ElevenLabs Dubbing Create](https://elevenlabs.io/docs/api-reference/dubbing/create) — endpoint, parametros multipart
- [ElevenLabs Dubbing Status](https://elevenlabs.io/docs/api-reference/dubbing/get) — GET endpoint, campo `status`
- [ElevenLabs Dubbing Audio Download](https://elevenlabs.io/docs/api-reference/dubbing/audio/get) — GET endpoint com `language_code`
- [fal.ai Queue API](https://fal.ai/docs/model-apis/model-endpoints/queue) — URLs de submit/status/result, campos de resposta

### Secondary (MEDIUM confidence)

- [ElevenLabs Voices Add — search verification](https://elevenlabs.io/docs/api-reference/voices/add) — endpoint `/v1/voices/add`, campos multipart, retorno voice_id (verificado via WebSearch + documentacao parcial)
- [fal.ai Kling Video Models](https://fal.ai/models/fal-ai/kling-video/v1.6/standard/text-to-video/api) — model IDs, parametros, formato de resposta
- [fal.ai Seedance Models](https://fal.ai/models/fal-ai/bytedance/seedance/v1/pro/text-to-video/api) — model IDs para text-to-video e image-to-video
- [fal.ai Wan Models](https://fal.ai/models/fal-ai/wan/v2.2-5b/image-to-video/api) — model IDs para image-to-video
- [ElevenLabs Voice Isolator](https://elevenlabs.io/blog/voice-isolator-api-launch) — endpoint `/v1/audio-isolation`, formatos suportados

### Tertiary (LOW confidence)

- [inference-sh/skills repo — audio tools](https://github.com/inference-sh/skills/tree/main/tools/audio) — lista de skills disponiveis (usados apenas para enumerar escopo AUD-09/VID-04; implementacao usa curl direto, nao `infsh`)
- [inference-sh/skills repo — video tools](https://github.com/inference-sh/skills/tree/main/tools/video) — lista de skills de video para identificar `p-video` como VID-04

---

## Metadata

**Confidence breakdown:**

- Endpoints ElevenLabs: HIGH — verificados diretamente na documentacao oficial para STT, dialogue, sound-gen, music, dubbing, speech-to-speech; MEDIUM para voices/add (verificado via search + docs parciais)
- fal.ai Queue Pattern: HIGH — verificado na documentacao oficial de queue
- fal.ai Model IDs: MEDIUM — IDs verificados via search e paginas de modelo; versoes mudam; Kling 1.6 e Wan 2.2 sao estaveis mas podem ter sucessores mais recentes
- ElevenLabs Music: MEDIUM — lancado agosto 2025, endpoint verificado, modelo `music_v1` confirmado mas API relativamente nova

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (30 dias — ElevenLabs e fal.ai tem cadencia de atualizacao media)
