export const SAMPLE_RESUMES = [
  {
    id: "alex-fullstack",
    label: "Alexander Vance — Senior Full-Stack Engineer (React, Node, Cloud)",
    name: "Alexander Vance",
    rawText: `ALEXANDER VANCE
Senior Full-Stack Software Engineer
Email: alex.vance@techdev.io | Phone: +1 (555) 349-2910 | Location: San Francisco, CA
GitHub: https://github.com/facebook | LinkedIn: https://linkedin.com/in/alexandervance | LeetCode: https://leetcode.com/alexvance

EXECUTIVE PROFILE
Versatile Full-Stack Engineer with 5+ years of experience engineering high-throughput distributed web systems, resilient microservices, and reactive user interfaces. Proven track record improving application response times by 42% and architecting real-time collaboration engines supporting 100k+ concurrent users.

CORE TECHNICAL SKILLS
• Languages: TypeScript, JavaScript (ES6+), Python, Go, SQL, HTML5/CSS3
• Frontend: React 18/19, Next.js, Redux Toolkit, TailwindCSS, WebSockets, WebGL
• Backend & Cloud: Node.js, Express, FastAPI, PostgreSQL, Redis, Docker, Kubernetes, AWS (S3, Lambda, ECS)
• Architecture & Practices: RESTful & GraphQL APIs, CI/CD (GitHub Actions), Microservices, TDD/Jest, System Design

FEATURED PROJECTS
1. Omnisync Real-time Canvas (React, WebSockets, Node.js, Redis)
   - Built a collaborative whiteboard with sub-30ms multi-cursor sync using CRDTs and WebSockets.
   - Scaled backend Redis Pub/Sub cluster to handle 85,000 peak concurrent whiteboard operations.

2. CortexQL — Distributed Query Accelerator (Python, FastAPI, PostgreSQL)
   - Architected an automated SQL indexing and caching middleware, dropping query latency by 64%.
   - Integrated schema drift detection and automated alert pipelines via Slack webhooks.

3. CloudPulse Observability Dashboard (TypeScript, React, Recharts, Docker)
   - Developed an interactive metrics explorer rendering 50,000+ real-time telemetry points with 60fps canvas charts.
   - Integrated open-telemetry traces and Jaeger query visualizers.

EDUCATION
B.S. in Computer Science — University of California, Berkeley (2019 - 2023)
Summa Cum Laude, Honors Thesis in Distributed Consensus Algorithms.`,
    parsedProfile: {
      candidateName: "Alexander Vance",
      skills: [
        { name: "React / Next.js", percent: 92 },
        { name: "TypeScript / JavaScript", percent: 95 },
        { name: "Node.js / Express", percent: 88 },
        { name: "PostgreSQL & Database Design", percent: 84 },
        { name: "Docker & Kubernetes", percent: 78 },
        { name: "Distributed Systems & WebSockets", percent: 86 },
        { name: "Python / FastAPI", percent: 80 },
        { name: "System Architecture & API Design", percent: 89 }
      ],
      projects: [
        {
          name: "Omnisync Real-time Canvas",
          description: "High-performance collaborative whiteboard engine featuring sub-30ms CRDT state synchronization and Redis pub/sub scaling to 85,000 concurrent sessions."
        },
        {
          name: "CortexQL Query Accelerator",
          description: "Distributed database query optimization middleware with automated indexing and schema drift detection, cutting latency by 64%."
        },
        {
          name: "CloudPulse Observability Dashboard",
          description: "Interactive real-time telemetry and metrics visualizer with GPU-accelerated charts and OpenTelemetry trace analysis."
        }
      ],
      languages: ["TypeScript", "JavaScript", "Python", "Go", "SQL"],
      links: {
        github: "https://github.com/facebook",
        linkedin: "https://linkedin.com/in/alexandervance",
        leetcode: "https://leetcode.com/alexvance",
        portfolio: "https://alexvance.dev"
      },
      summary: "Accomplished Senior Full-Stack Engineer with deep expertise in reactive React architectures, real-time distributed systems, and cloud infrastructure. Strong track record of optimizing high-concurrency microservices and delivering resilient, production-grade applications."
    }
  },
  {
    id: "elena-ai",
    label: "Dr. Elena Rostova — AI & Machine Learning Specialist (PyTorch, LLMs)",
    name: "Dr. Elena Rostova",
    rawText: `DR. ELENA ROSTOVA
AI/ML Research Engineer & MLOps Specialist
Email: elena.rostova@deepmind-labs.org | GitHub: https://github.com/torvalds | LinkedIn: https://linkedin.com/in/elenarostova

PROFESSIONAL SUMMARY
Machine Learning Specialist with deep domain experience in Large Language Model (LLM) fine-tuning, Retrieval-Augmented Generation (RAG) architectures, and production MLOps pipelines.

TECHNICAL SKILLS
• Machine Learning: PyTorch, Hugging Face Transformers, LangChain, LlamaIndex, vLLM, DeepSpeed
• Languages: Python, C++, CUDA, SQL
• Data & Vector DBs: Pinecone, Qdrant, Milvus, PostgreSQL (pgvector)
• Cloud & MLOps: AWS SageMaker, MLflow, Ray, Docker, Kubernetes, Triton Inference Server

KEY PROJECTS
1. Sovereign RAG Enterprise Knowledge Engine (PyTorch, LangChain, Qdrant)
   - Built an enterprise RAG system with hybrid semantic/lexical reranking achieving 94.2% factual precision on technical corpora.
2. Latency-Optimized LLM Inference Server (vLLM, CUDA, Triton)
   - Engineered quantized FP8 inference serving 4x higher token throughput with 35% lower GPU memory footprint.

EDUCATION
Ph.D. in Computer Science (Artificial Intelligence) — Stanford University`,
    parsedProfile: {
      candidateName: "Dr. Elena Rostova",
      skills: [
        { name: "PyTorch & Deep Learning", percent: 96 },
        { name: "LLM Fine-tuning & Alignment", percent: 94 },
        { name: "RAG & Vector Search", percent: 92 },
        { name: "Python / C++", percent: 90 },
        { name: "MLOps & Inference Optimization", percent: 85 },
        { name: "Triton & CUDA Kernels", percent: 82 }
      ],
      projects: [
        {
          name: "Sovereign RAG Knowledge Engine",
          description: "Enterprise multi-modal retrieval system with hybrid reranking and factual hallucination mitigation achieving 94.2% precision."
        },
        {
          name: "Latency-Optimized LLM Server",
          description: "High-throughput token inference server leveraging vLLM and FP8 quantization to quadruple serving capacity."
        }
      ],
      languages: ["Python", "C++", "SQL", "CUDA"],
      links: {
        github: "https://github.com/torvalds",
        linkedin: "https://linkedin.com/in/elenarostova",
        leetcode: null,
        portfolio: "https://elenarostova.ai"
      },
      summary: "World-class AI / ML Research Engineer specializing in cutting-edge generative AI, high-throughput transformer inference, and enterprise RAG systems. Deep mathematical rigor backed by scalable systems engineering."
    }
  }
];
