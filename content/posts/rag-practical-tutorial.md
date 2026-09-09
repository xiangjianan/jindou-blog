---
title: "RAG 实战入门：从零构建检索增强生成系统"
slug: "rag-practical-tutorial"
excerpt: "一步步教你构建自己的 RAG 系统，包含完整代码示例和最佳实践"
category: "教程"
tags:
  - 教程
  - RAG
  - 向量数据库
  - LLM
  - 实战
  - 早期文章
published: true
createdAt: "2026-04-27 00:00:00"
updatedAt: "2026-04-27 00:00:00"
postId: 110
---

# RAG 实战入门：从零构建检索增强生成系统

export const Toc = [
  { id: "一为什么需要-rag", text: "一、为什么需要 RAG？" },
  { id: "二核心流程", text: "二、核心流程" },
  { id: "三最小可运行示例", text: "三、最小可运行示例" },
  { id: "四chunk-size-策略详解", text: "四、Chunk Size 策略详解" },
  { id: "五常见坑与最佳实践", text: "五、常见坑与最佳实践" },
  { id: "六下一步", text: "六、下一步" },
];

> 面向有 Python 基础但没接触过 RAG 的读者，一步步构建自己的检索增强生成系统。

## 一、为什么需要 RAG？

直接问 ChatGPT 一个问题，它可能给出过时的、幻觉的、或者与你私有数据完全无关的答案。RAG（Retrieval-Augmented Generation，检索增强生成）的核心思路很简单：

**先从你的知识库中找到相关内容，再让 LLM 基于这些内容回答问题。**

类比：闭卷考试 vs 开卷考试。纯 LLM 是闭卷——靠记忆回答；RAG 是开卷——先翻书找资料，再作答。

RAG 解决的三个核心问题：
1. **知识过时**：LLM 训练数据有截止日期，RAG 可以接入最新文档
2. **幻觉问题**：LLM 会一本正经胡说八道，RAG 让它"有据可查"
3. **私有数据**：你的内部文档、代码库、会议记录，LLM 根本没见过

## 二、核心流程

```
文档加载 → 文本分块 → 向量化(Embedding) → 存入向量库
                                              ↓
用户提问 → 问题向量化 → 相似度检索 → 取出相关文档片段 → 拼装 Prompt → LLM 生成回答
```

六个步骤，缺一不可。下面逐一解释关键概念，然后给出完整代码。

### 2.1 关键概念

**Embedding（向量化）**
把文本变成一个高维浮点数组（通常 768~1536 维）。语义相近的文本，向量距离也近。比如"猫喜欢吃鱼"和"猫咪爱吃鱼肉"的向量会非常接近，即使字面完全不同。

**相似度计算**
常用余弦相似度（Cosine Similarity）：值域 [-1, 1]，越接近 1 表示越相似。计算公式：`cos(θ) = A·B / (|A|×|B|)`。

**Chunk（文本块）**
整篇文档太长，LLM 放不下，需要切成小块。chunk size 是最关键的参数之一，后面详细讲。

**向量数据库**
存储文本块及其对应向量的数据库，支持高效的近似最近邻（ANN）搜索。本教程使用 Chroma，轻量且零配置。

## 三、最小可运行示例

### 3.1 环境准备

```bash
pip install chromadb sentence-transformers openai
```

我们用以下技术栈：
- **sentence-transformers**：本地 Embedding 模型（免费，无需 API key）
- **ChromaDB**：轻量向量数据库
- **OpenAI API**：生成最终回答（也可以换成任何兼容 API）

### 3.2 完整代码

```python
"""
RAG 最小可运行示例
功能：导入文档 → 分块 → 向量化存储 → 检索 → 增强 LLM 回答
"""

import textwrap
import chromadb
from chromadb.utils import embedding_functions
from openai import OpenAI

# ========== 配置 ==========
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # 轻量 Embedding 模型，384 维
COLLECTION_NAME = "rag_demo"
CHUNK_SIZE = 500        # 每个文本块的最大字符数
CHUNK_OVERLAP = 50      # 相邻块的重叠字符数
TOP_K = 3               # 检索返回的文档块数量

# LLM 配置（替换成你自己的）
LLM_BASE_URL = "https://api.openai.com/v1"  # 或任何兼容的 API 地址
LLM_API_KEY = "your-api-key-here"
LLM_MODEL = "gpt-4o-mini"


# ========== 第一步：文本分块 ==========

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE,
               overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    将长文本切分成固定大小的块，相邻块有重叠以保留上下文。
    """
    if not text.strip():
        return []
    
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
        if start >= len(text):
            break
    
    return [c.strip() for c in chunks if len(c.strip()) > 50]


# ========== 第二步：初始化向量库 ==========

def init_vector_store(documents: list[str], metadatas: list[dict] = None,
                      ids: list[str] = None) -> chromadb.Collection:
    """初始化 ChromaDB 并存入文档块。"""
    embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=EMBEDDING_MODEL
    )
    
    client = chromadb.PersistentClient(path="./chroma_db")
    if COLLECTION_NAME in [c.name for c in client.list_collections()]:
        client.delete_collection(COLLECTION_NAME)
    
    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=embed_fn
    )
    
    if documents:
        if ids is None:
            ids = [f"doc_{i}" for i in range(len(documents))]
        if metadatas is None:
            metadatas = [{"source": "unknown"} for _ in documents]
        
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        print(f"✅ 已存入 {len(documents)} 个文档块")
    
    return collection


# ========== 第三步：检索 ==========

def retrieve(collection: chromadb.Collection, query: str,
             top_k: int = TOP_K) -> list[dict]:
    """根据用户问题检索最相关的文档块。"""
    results = collection.query(
        query_texts=[query],
        n_results=top_k
    )
    
    retrieved = []
    for text, metadata, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):
        retrieved.append({
            "text": text,
            "source": metadata.get("source", "unknown"),
            "distance": distance
        })
    
    return retrieved


# ========== 第四步：增强生成 ==========

def generate_answer(query: str, context_docs: list[dict]) -> str:
    """将检索到的文档片段作为上下文，构造 Prompt 让 LLM 回答。"""
    context = "\n\n---\n\n".join(
        f"[来源: {doc['source']}]\n{doc['text']}"
        for doc in context_docs
    )
    
    prompt = textwrap.dedent(f"""\
        你是一个有帮助的助手。请根据以下参考资料回答用户问题。
        
        规则：
        1. 只根据提供的参考资料回答，不要编造信息
        2. 如果参考资料中没有相关信息，明确告诉用户
        3. 回答时引用信息来源
        
        参考资料如下：
        {context}
        
        用户问题：{query}
        
        请用中文回答：""")
    
    client = OpenAI(base_url=LLM_BASE_URL, api_key=LLM_API_KEY)
    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": "你是一个严谨的知识助手，只根据提供的上下文回答问题。"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
    )
    
    return response.choices[0].message.content


# ========== 主流程 ==========

def main():
    sample_docs = [
        {
            "text": "RAG（Retrieval-Augmented Generation）是一种将信息检索与大语言模型生成相结合的技术。它由 Meta AI 在 2020 年提出，核心思想是在生成回答前，先从外部知识库中检索相关文档，然后将这些文档作为上下文提供给 LLM。这种方法可以有效减少模型幻觉，提高回答的准确性。RAG 相比微调的优势在于：知识可以随时更新（只需更新知识库），不需要重新训练模型。",
            "source": "rag_intro.md"
        },
        {
            "text": "Embedding 向量化是 RAG 的基础。将文本转换为高维向量（通常 384-1536 维），使得语义相近的文本在向量空间中距离更近。常用的 Embedding 模型包括：OpenAI 的 text-embedding-3-small（1536维）、text-embedding-3-large（3072维），以及开源的 BGE 系列、E5 系列、sentence-transformers 等。对于中文场景，推荐 BGE-large-zh 或 multilingual-e5-large。",
            "source": "embedding_guide.md"
        },
        {
            "text": "Chunk size 是 RAG 中最重要的超参数之一。太大的 chunk 会导致检索不精确（信息被淹没在大量无关内容中），太小的 chunk 会丢失上下文。实践建议：通用文本 500-1000 token，代码文件按函数/类分割，技术文档按章节标题分割，overlap 通常设为 chunk size 的 10%-20%。",
            "source": "chunking_best_practices.md"
        },
        {
            "text": "向量数据库的选择取决于你的场景规模：小型/原型用 ChromaDB、FAISS；中型/生产用 Qdrant、Weaviate；大型/企业级用 Milvus、Pinecone。除了向量搜索，生产环境还需要考虑：元数据过滤、混合搜索（向量+关键词）、多租户隔离、权限控制等。",
            "source": "vector_db_comparison.md"
        }
    ]
    
    all_chunks = []
    all_metadatas = []
    all_ids = []
    
    for doc in sample_docs:
        chunks = chunk_text(doc["text"])
        for i, chunk in enumerate(chunks):
            all_chunks.append(chunk)
            all_metadatas.append({"source": doc["source"]})
            all_ids.append(f"{doc['source']}_{i}")
    
    print(f"📄 共 {len(all_chunks)} 个文本块")
    
    collection = init_vector_store(all_chunks, all_metadatas, all_ids)
    
    questions = [
        "RAG 和微调相比有什么优势？",
        "中文场景推荐用什么 Embedding 模型？",
        "chunk size 一般设多大合适？",
    ]
    
    for question in questions:
        print(f"\n{'='*60}")
        print(f"❓ 问题：{question}")
        
        results = retrieve(collection, question)
        print(f"🔍 检索到 {len(results)} 个相关文档块：")
        for i, doc in enumerate(results):
            preview = doc['text'][:80].replace('\n', ' ')
            print(f"   [{i+1}] {preview}... (距离: {doc['distance']:.4f})")
        
        try:
            answer = generate_answer(question, results)
            print(f"💡 回答：{answer[:200]}...")
        except Exception as e:
            print(f"💡 [跳过 LLM 调用] 需要配置有效的 API Key")

if __name__ == "__main__":
    main()
```

运行方式：保存为 `rag_demo.py`，配置好 `LLM_API_KEY`，然后 `python rag_demo.py`。

## 四、Chunk Size 策略详解

Chunk size 是 RAG 效果最敏感的参数。这里给一个实用的决策框架：

| 场景 | 推荐 Chunk Size | 推荐 Overlap | 说明 |
|------|----------------|-------------|------|
| 通用 QA | 500-800 token | 50-100 | 平衡精度和上下文 |
| 技术文档 | 按标题分割 | — | 结构化分块比硬切好 |
| 代码 | 按函数/类分割 | 1-2 行 | 保持代码完整性 |
| 长篇论文 | 1000-1500 token | 150-200 | 论文段落通常较长 |
| 法律合同 | 按条款分割 | — | 条款是天然分割点 |

**黄金法则**：chunk 应该包含一个完整的语义单元。宁可稍大也不要切断关键信息。

## 五、常见坑与最佳实践

### 坑 1：分块太暴力

```python
# ❌ 按字符数硬切，可能把一句话切成两半
chunks = [text[i:i+500] for i in range(0, len(text), 500)]

# ✅ 按段落/句子边界切
import re
sentences = re.split(r'(?<=[。！？\n])', text)
# 然后将相邻句子合并直到达到目标长度
```

### 坑 2：Embedding 模型选错
- ❌ 用纯英文模型处理中文（效果极差）
- ❌ 用 ChatGPT 的对话模型做 Embedding（它们不是干这个的）
- ✅ 中文推荐：`BAAI/bge-large-zh-v1.5`、`intfloat/multilingual-e5-large`

### 坑 3：Prompt 不够明确

```python
# ❌ LLM 可能忽略上下文，用训练数据回答
prompt = f"参考资料：{context}\n问题：{query}"

# ✅ 明确约束 LLM 的行为
prompt = """请只根据以下参考资料回答问题。
如果资料中没有相关信息，请说"根据已知信息无法回答"。
不要使用资料以外的知识。"""
```

### 坑 4：只返回 Top-1 结果
- Top-1 容易命中噪声（恰好某段文字包含查询关键词但语义不相关）
- 推荐 Top-3 到 Top-5，让 LLM 自己综合判断

### 坑 5：忽略元数据
在存入向量库时带上元数据（来源、日期、章节），检索时可以精确过滤：

```python
results = collection.query(
    query_texts=["Q4 营收数据"],
    where={"year": "2024", "department": "finance"},
    n_results=3
)
```

### 最佳实践清单

1. **从简单开始**：先用 ChromaDB + 本地 Embedding 模型跑通流程，再考虑优化
2. **混合搜索**：向量搜索 + BM25 关键词搜索组合，效果通常优于单一方法
3. **重排序（Reranking）**：检索出 Top-20 后，用 cross-encoder 模型重新排序取 Top-5
4. **评估体系**：用固定的问题集 + 人工标注答案来评估 RAG 效果，而不是"感觉不错"
5. **监控日志**：记录每次检索返回了哪些文档、最终回答是什么，方便排查问题
6. **成本控制**：Embedding 用本地模型（免费），LLM 生成用缓存（相同问题不重复调用）

## 六、下一步

跑通最小示例后，可以考虑这些进阶方向：

- **LangChain / LlamaIndex**：RAG 框架，提供更多开箱即用的组件
- **混合检索**：向量搜索 + BM25 关键词搜索
- **Reranker**：用 cross-encoder 对检索结果重排序
- **多模态 RAG**：支持图片、表格、PDF 的检索
- **Agentic RAG**：让 AI 自主决定何时检索、检索什么

记住：**RAG 的核心不是技术，而是让 LLM "有据可依"这个思想**。技术栈会变，但这个思想不会过时。
