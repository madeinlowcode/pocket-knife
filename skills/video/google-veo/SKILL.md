---
name: google-veo
description: "Generate high-quality video with Google Veo 3.1. Use for: cinematic, professional video"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Generate video using Google Veo via the Vertex AI API. This skill uses async polling — the video generation takes 1-5 minutes.

**Requirements (beyond GOOGLE_API_KEY):**
- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- `GOOGLE_CLOUD_PROJECT` set in ~/.claude/.env (your Google Cloud project ID)
- `GCS_BUCKET` set in ~/.claude/.env (a Cloud Storage bucket for output, e.g. "my-project-veo-output")
- Vertex AI API enabled in your project: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com

Ask the user for:
- PROMPT: description of the video to generate
- DURATION (optional): video duration in seconds — default: 8 (max: 8 for veo-3.1-fast)
- OUTPUT_PATH (optional): GCS path suffix — default: "veo-output"

Then run the following steps:

**Step 1 — Check requirements:**

```bash
# Check gcloud CLI
if ! command -v gcloud &> /dev/null; then
  echo "ERROR: gcloud CLI not found."
  echo "Install from: https://cloud.google.com/sdk/docs/install"
  echo "Then run: gcloud auth login"
  exit 1
fi

# Check GOOGLE_CLOUD_PROJECT
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
  echo "ERROR: GOOGLE_CLOUD_PROJECT not set."
  echo "Add GOOGLE_CLOUD_PROJECT=your-project-id to ~/.claude/.env"
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

# Check GCS_BUCKET
if [ -z "$GCS_BUCKET" ]; then
  echo "ERROR: GCS_BUCKET not set."
  echo "Add GCS_BUCKET=your-bucket-name to ~/.claude/.env"
  echo "Create a bucket at: https://console.cloud.google.com/storage"
  exit 1
fi

# Get access token
ACCESS_TOKEN=$(gcloud auth print-access-token 2>/dev/null)
if [ -z "$ACCESS_TOKEN" ]; then
  echo "ERROR: Could not get gcloud access token."
  echo "Run: gcloud auth login"
  exit 1
fi
```

**Step 2 — Start video generation job:**

```bash
PROMPT="[USER_PROMPT_HERE]"
DURATION="${DURATION:-8}"
OUTPUT_PATH="${OUTPUT_PATH:-veo-output}"
STORAGE_URI="gs://${GCS_BUCKET}/${OUTPUT_PATH}/"

RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://us-central1-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/us-central1/publishers/google/models/veo-3.1-fast-generate-001:predictLongRunning" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"instances\": [{\"prompt\": \"$PROMPT\"}], \"parameters\": {\"storageUri\": \"$STORAGE_URI\", \"sampleCount\": 1, \"durationSeconds\": $DURATION}}" \
  2>&1)

EXIT_CODE=$?

case $EXIT_CODE in
  0) ;;
  22)
    if echo "$RESPONSE" | grep -qi "permission\|iam\|forbidden\|access denied"; then
      echo "ERROR: Permission denied. Ensure Vertex AI API is enabled and your account has 'aiplatform.endpoints.predict' permission."
      echo "Enable API: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com"
    elif echo "$RESPONSE" | grep -qi "not found\|404"; then
      echo "ERROR: Project or model not found. Check GOOGLE_CLOUD_PROJECT value: $GOOGLE_CLOUD_PROJECT"
    elif echo "$RESPONSE" | grep -qi "quota\|billing"; then
      echo "ERROR: Quota exceeded or billing not enabled for project $GOOGLE_CLOUD_PROJECT"
    else
      echo "ERROR: Vertex AI API returned HTTP error."
      echo "$RESPONSE"
    fi
    exit 1
    ;;
  6)
    echo "ERROR: Could not resolve aiplatform.googleapis.com. Check internet connection."
    exit 1
    ;;
  7)
    echo "ERROR: Failed to connect to Vertex AI API. Check internet connection."
    exit 1
    ;;
  *)
    echo "ERROR: curl failed with code $EXIT_CODE"
    echo "$RESPONSE"
    exit 1
    ;;
esac

# Extract operation name
OPERATION_NAME=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('name', ''))" 2>/dev/null)
if [ -z "$OPERATION_NAME" ]; then
  echo "ERROR: Could not extract operation name from response."
  echo "$RESPONSE"
  exit 1
fi

echo "Video generation started. Operation: $OPERATION_NAME"
echo "Polling for completion (this may take 1-5 minutes)..."
```

**Step 3 — Poll for completion:**

```bash
MAX_ATTEMPTS=60  # 60 * 5s = 5 minutes max
ATTEMPT=0
POLL_INTERVAL=5

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  sleep $POLL_INTERVAL
  ATTEMPT=$((ATTEMPT + 1))
  echo "Polling attempt $ATTEMPT/$MAX_ATTEMPTS..."

  # Refresh token periodically (every 20 attempts = ~100 seconds)
  if [ $((ATTEMPT % 20)) -eq 0 ]; then
    ACCESS_TOKEN=$(gcloud auth print-access-token 2>/dev/null)
  fi

  POLL_RESPONSE=$(curl --fail-with-body -s \
    -X GET "https://us-central1-aiplatform.googleapis.com/v1/${OPERATION_NAME}" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    2>&1)

  POLL_EXIT=$?

  if [ $POLL_EXIT -ne 0 ]; then
    echo "WARNING: Polling request failed (attempt $ATTEMPT). Retrying..."
    continue
  fi

  DONE=$(echo "$POLL_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('done', False))" 2>/dev/null)

  if [ "$DONE" = "True" ]; then
    echo "Video generation complete!"
    echo "Output saved to: $STORAGE_URI"
    echo ""
    echo "To download the video:"
    echo "  gsutil cp ${STORAGE_URI}*.mp4 ~/Downloads/"
    echo ""
    echo "Full operation response:"
    echo "$POLL_RESPONSE"
    break
  fi
done

if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
  echo "ERROR: Video generation timed out after $((MAX_ATTEMPTS * POLL_INTERVAL)) seconds."
  echo "The operation may still be running. Check status with:"
  echo "  gcloud ai operations describe $OPERATION_NAME --region=us-central1"
  exit 1
fi
```

Report to the user:
- The GCS path where the video was saved
- How to download the video using gsutil
- The prompt and duration used
- If any error occurred, provide specific guidance (missing gcloud -> install link, permission denied -> enable Vertex AI API, quota -> billing)