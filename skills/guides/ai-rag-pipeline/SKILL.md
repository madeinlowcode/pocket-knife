---
name: ai-rag-pipeline
description: Guide for building Retrieval Augmented Generation pipelines from chunking to evaluation.
---

# AI RAG Pipeline

Retrieval Augmented Generation (RAG) grounds LLM responses in your own data by retrieving relevant documents at query time and injecting them into the prompt.

## Architecture Overview

```
Documents → Chunking → Embedding → Vector Store
                                        ↓
User Query → Embed Query → Retrieve Top-K → Build Prompt → LLM → Response
```

## 1. Document Chunking Strategies

Chunking is the most impactful decision in RAG. Poor chunks produce poor retrievals.

### Fixed-Size Chunking

```python
def chunk_fixed(text: str, size: int = 512, overlap: int = 64) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start += size - overlap
    return chunks
```

Use when: text is homogeneous, no natural boundaries (logs, transcripts).

### Recursive / Semantic Chunking

Split on `\n\n` → `\n` → `.` → ` ` in order. Stop when chunk fits within `size`. This is what LangChain's `RecursiveCharacterTextSplitter` implements.

Use when: prose documents with paragraphs and sentences.

### Document-Structure Chunking

Chunk on Markdown headings, HTML sections, or PDF page boundaries. Preserve section title as metadata.

```python
# Example: chunk by Markdown heading
import re

def chunk_by_heading(md: str) -> list[dict]:
    sections = re.split(r'\n(?=#{1,3} )', md)
    return [{"content": s, "heading": s.splitlines()[0]} for s in sections if s.strip()]
```

Use when: structured documents (docs, wikis, reports).

### Chunk Size Guidelines

| Content Type | Recommended Tokens |
|---|---|
| FAQ / short answers | 128–256 |
| Technical docs / prose | 512–1024 |
| Legal / financial text | 1024–2048 |

Always include metadata (source, section, page) in every chunk — it surfaces in citations.

## 2. Embedding Generation

### OpenAI

```python
from openai import OpenAI

client = OpenAI()

def embed(texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(
        model="text-embedding-3-small",  # or text-embedding-3-large
        input=texts
    )
    return [item.embedding for item in response.data]
```

Models: `text-embedding-3-small` (1536d, cheap), `text-embedding-3-large` (3072d, better recall).

### Cohere

```python
import cohere

co = cohere.Client("COHERE_API_KEY")

def embed(texts: list[str], input_type="search_document"):
    return co.embed(texts=texts, model="embed-english-v3.0", input_type=input_type).embeddings
```

Use `input_type="search_query"` for queries, `"search_document"` for chunks.

### Local (sentence-transformers)

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(texts, normalize_embeddings=True)
```

Good models: `all-MiniLM-L6-v2` (fast), `BAAI/bge-large-en-v1.5` (high quality).

## 3. Vector Stores

### Pinecone

```python
from pinecone import Pinecone

pc = Pinecone(api_key="PINECONE_API_KEY")
index = pc.Index("my-index")

# Upsert
index.upsert(vectors=[{"id": "doc1", "values": embedding, "metadata": {"text": chunk}}])

# Query
results = index.query(vector=query_embedding, top_k=5, include_metadata=True)
```

### Weaviate

```python
import weaviate

client = weaviate.connect_to_local()
collection = client.collections.get("Documents")

# Insert
collection.data.insert({"text": chunk, "source": "doc.pdf"}, vector=embedding)

# Near-vector search
results = collection.query.near_vector(near_vector=query_embedding, limit=5)
```

### ChromaDB (local, zero-config)

```python
import chromadb

client = chromadb.PersistentClient(path="./chroma_db")
col = client.get_or_create_collection("docs")

col.add(documents=[chunk], embeddings=[embedding], ids=["doc1"], metadatas=[{"source": "doc.pdf"}])

results = col.query(query_embeddings=[query_embedding], n_results=5)
```

### pgvector (Postgres)

```sql
CREATE EXTENSION vector;
CREATE TABLE documents (id serial PRIMARY KEY, content text, embedding vector(1536));

INSERT INTO documents (content, embedding) VALUES ($1, $2);

SELECT content, 1 - (embedding <=> $1::vector) AS similarity
FROM documents
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

Use pgvector when your data already lives in Postgres (e.g., via Supabase with the `vecs` extension).

## 4. Retrieval Patterns

### Semantic Search (Dense)

Embed the query and find the nearest chunk embeddings by cosine similarity. Fast and general.

### Keyword Search (Sparse / BM25)

Traditional inverted-index search. Good for exact term matching (IDs, names, codes).

### Hybrid Search

Combine sparse + dense scores with Reciprocal Rank Fusion (RRF):

```python
def rrf(rankings: list[list[str]], k: int = 60) -> list[str]:
    scores: dict[str, float] = {}
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
    return sorted(scores, key=scores.get, reverse=True)
```

### Re-ranking

After retrieving top-K, re-rank with a cross-encoder for higher precision:

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
scores = reranker.predict([(query, chunk) for chunk in candidates])
top_chunks = [c for _, c in sorted(zip(scores, candidates), reverse=True)][:3]
```

## 5. Prompt Construction with Context

```python
def build_prompt(query: str, chunks: list[str]) -> str:
    context = "\n\n---\n\n".join(chunks)
    return f"""You are a helpful assistant. Answer using only the context below.
If the answer is not in the context, say "I don't know."

Context:
{context}

Question: {query}
Answer:"""
```

Rules:
- Put context before the question (models attend better to recency)
- Add a "don't know" escape hatch to prevent hallucination
- Include source metadata so the model can cite it

## 6. Evaluation Metrics

### Retrieval Quality

- **Recall@K**: fraction of relevant docs in top-K results
- **MRR** (Mean Reciprocal Rank): position of the first relevant result
- **NDCG**: ranked relevance quality

### Answer Quality

- **Relevance**: does the answer address the question?
- **Faithfulness**: is every claim grounded in the retrieved context?
- **Context Precision**: are the retrieved chunks actually used?

Tools: [RAGAS](https://github.com/explodinggradients/ragas) automates all three metrics.

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_recall

results = evaluate(dataset, metrics=[faithfulness, answer_relevancy, context_recall])
```

## 7. Common Pitfalls

| Pitfall | Fix |
|---|---|
| Chunks too small | Increase chunk size; include surrounding context (parent-child chunking) |
| Chunks too large | Context window overflow; split smaller and use re-ranking |
| No overlap | Adjacent information split across chunks; add 10–15% overlap |
| Query-document mismatch | Use `search_query` vs `search_document` embedding types (Cohere) |
| Hallucination despite RAG | Enforce "only answer from context" in system prompt; lower temperature |
| Stale embeddings | Re-embed after significant document updates |
| Missing metadata | Always store source, timestamp, chunk index alongside each vector |
