---
id: aitools-deep-research
stackId: aitools
type: skill
name: Deep Research
description: >-
  Execute autonomous multi-step research using the Gemini Deep Research API —
  structured prompts, async polling, follow-up queries, output formatting, and
  production integration patterns.
difficulty: advanced
tags:
  - aitools
  - deep
  - research
  - api
  - kubernetes
compatibility:
  - claude-code
faq:
  - question: "When should I use the Deep Research skill?"
    answer: >-
      Use Deep Research when you need comprehensive, cited reports on complex
      topics — market analysis, competitive landscaping, technical literature
      reviews, due diligence, or comparative analysis. The Gemini agent
      autonomously plans searches, reads sources, and synthesizes findings into
      structured reports.
  - question: "What tools and setup does Deep Research require?"
    answer: >-
      Requires Python 3.8+ and httpx (pip install httpx). You need a
      GEMINI_API_KEY from Google AI Studio. The API uses an async polling
      model — a single research task can take 2-10 minutes and consume
      250k-900k input tokens.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Gemini Deep Research Skill

Run autonomous research tasks that plan, search, read, and synthesize information into comprehensive, cited reports. The Gemini Deep Research Agent executes dozens of search queries, reads and cross-references sources, and produces structured output — all from a single prompt.

## How the Deep Research Agent Works

The Deep Research Agent operates through an asynchronous Interactions API. When you submit a query, the agent creates a research plan, executes multiple web searches (often 20-50 queries per task), reads and analyzes the results, and synthesizes everything into a cohesive report with inline citations. The entire process runs server-side — your client polls for status updates or streams progress in real-time.

A single research task typically takes 2-10 minutes and consumes 250k-900k input tokens and 60k-80k output tokens. At current Gemini pricing, expect $2-5 per task depending on complexity.

## Requirements

- Python 3.8+
- httpx: `pip install httpx`
- GEMINI_API_KEY environment variable

## Setup

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/) and export it:

```bash
export GEMINI_API_KEY=your-api-key-here
```

Or create a `.env` file in the skill directory for persistent configuration.

## Crafting Effective Research Prompts

The quality of your research output depends heavily on prompt structure. Use this framework for best results:

```bash
# Structured research prompt with constraints
python3 scripts/research.py --query "Research [TOPIC] as of [DATE/TIMEFRAME]: \
  Compare [X] options across [CRITERIA 1, CRITERIA 2, CRITERIA 3]. \
  Include [specific data points]. \
  Focus on [specific aspect]. \
  Provide output as [format]. \
  Exclude [irrelevant topics]. \
  If specific figures are not available, explicitly state they are projections."
```

The key principle: be specific about what you want, how you want it structured, and how the agent should handle missing data. Vague prompts produce vague reports.

### Prompt Engineering Examples

```bash
# Market analysis with structured output
python3 scripts/research.py --query "Analyze the container orchestration \
  market as of 2026: Compare Kubernetes, Nomad, and Docker Swarm across \
  enterprise adoption, managed service availability, and ecosystem maturity. \
  Include market share estimates where available. \
  Format as: 1. Executive Summary 2. Comparison Table 3. Recommendations" \
  --format "1. Executive Summary\n2. Comparison Table\n3. Recommendations"

# Technical deep-dive with scope constraints
python3 scripts/research.py --query "Research WebAssembly component model \
  progress: Focus on WASI preview 2 implementation status, language support \
  beyond Rust/C++, and production deployment patterns. \
  Exclude browser-only WASM use cases. \
  Include links to specifications and reference implementations."

# Competitive analysis with data handling instructions
python3 scripts/research.py --query "Compare CDN providers Cloudflare, \
  Fastly, and AWS CloudFront for API edge computing: \
  Evaluate cold start latency, runtime support, pricing per million requests, \
  and geographic PoP coverage. \
  If exact pricing has changed since your training data, note the date of \
  your most recent source."
```

## Core Usage Patterns

### Start a Research Task

```bash
# Basic research
python3 scripts/research.py --query "Research the history of Kubernetes"

# Stream progress as the agent works
python3 scripts/research.py --query "Analyze EV battery market trends" --stream

# Fire and forget — returns immediately with an interaction ID
python3 scripts/research.py --query "Research topic" --no-wait
```

### Monitor and Retrieve Results

```bash
# Check status of a running task
python3 scripts/research.py --status <interaction_id>

# Wait for a no-wait task to complete
python3 scripts/research.py --wait <interaction_id>

# List all recent research tasks
python3 scripts/research.py --list
```

### Follow-Up Queries

After a research task completes, you can ask follow-up questions that reference the original research context without re-running the entire workflow:

```bash
# Drill into a specific finding
python3 scripts/research.py --query "Elaborate on point 2 — what are the \
  specific technical trade-offs?" --continue <interaction_id>

# Request a different format
python3 scripts/research.py --query "Reformat the comparison as a decision \
  matrix with weighted scores" --continue <interaction_id>

# Challenge a conclusion
python3 scripts/research.py --query "What counter-arguments exist for the \
  recommendation in section 3?" --continue <interaction_id>
```

Follow-ups are significantly cheaper than new research tasks because the agent reuses its existing context rather than executing new searches.

## Output Formats

```bash
# Default: Human-readable markdown with inline citations
python3 scripts/research.py --query "..."

# JSON: Structured data for programmatic processing
python3 scripts/research.py --query "..." --json

# Raw: Unprocessed API response (debugging)
python3 scripts/research.py --query "..." --raw
```

The default markdown output includes inline citations linking back to source URLs. The JSON format wraps the same content in a structured envelope with metadata about token usage, sources consulted, and execution time.

## Multimodal Research

The Deep Research Agent supports multimodal inputs — you can attach PDFs, images, or documents to ground the research in your specific context:

```bash
# Research grounded in a specific document
python3 scripts/research.py \
  --query "Analyze this architecture document and research best practices \
  for each component. Identify potential scalability bottlenecks." \
  --file architecture-overview.pdf

# Compare your approach against industry standards
python3 scripts/research.py \
  --query "Compare our deployment pipeline against industry best practices \
  for continuous delivery" \
  --file ci-cd-config.yaml
```

Use multimodal inputs cautiously — they increase token consumption and cost significantly. Reserve them for cases where the agent genuinely needs your internal context to produce useful output.

## Cost and Performance

| Metric | Typical Range |
|--------|--------------|
| Execution time | 2-10 minutes |
| Cost per task | $2-5 (varies by complexity) |
| Input tokens | 250k-900k |
| Output tokens | 60k-80k |
| Follow-up cost | ~30-50% of initial task |

## Production Integration Patterns

For CI/CD or automated pipelines, use the async pattern with polling:

```bash
# Start research without blocking
INTERACTION_ID=$(python3 scripts/research.py \
  --query "Weekly competitive analysis for product X" \
  --no-wait --json | jq -r '.interaction_id')

# Poll until complete (in a CI job or cron)
python3 scripts/research.py --wait "$INTERACTION_ID" --json \
  --output reports/competitive-analysis-$(date +%Y%m%d).json
```

## Best Practices

- **Constrain the scope** — broad queries produce shallow reports. Narrow the topic, specify criteria, and define the output format.
- **Handle missing data explicitly** — tell the agent what to do when data is unavailable ("state it is a projection" vs. "estimate based on trends").
- **Use follow-ups for iteration** — refining via `--continue` is cheaper and faster than re-running the entire research task.
- **Stream for interactive use** — use `--stream` when a human is waiting; use `--no-wait` for automated pipelines.
- **Validate citations** — the agent provides sources, but verify critical claims. Hallucinated citations are rare but possible.
- **Budget token usage** — multimodal inputs and broad queries can push costs above $5 per task. Start with text-only prompts and add files only when necessary.

## Common Pitfalls

- Submitting vague, open-ended queries that produce unfocused reports.
- Not specifying output structure, resulting in inconsistent formatting across tasks.
- Running expensive multimodal research when a text-only prompt would suffice.
- Ignoring follow-up capabilities and re-running full research for minor refinements.
- Not setting timeouts in automated pipelines — complex research can exceed 10 minutes.

## Exit Codes

- **0**: Success
- **1**: Error (API error, config issue, timeout)
- **130**: Cancelled by user (Ctrl+C)
