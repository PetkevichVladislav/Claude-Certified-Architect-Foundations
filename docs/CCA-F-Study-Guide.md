# Claude Certified Architect — Foundations (CCA-F) Study Guide

## Table of Contents

- [Exam Overview](#exam-overview)
- [The 5 Domains](#the-5-domains)
- [Decision Algorithm — How to Solve Tricky Questions](#decision-algorithm)
- [Anti-Patterns That Kill You (They SEEM Right But Are WRONG)](#anti-patterns)
- [Real Exam Scenario Patterns & Worked Examples](#scenario-patterns)
- [Quick Cheat Sheet: When You're Stuck Between 2 Answers](#cheat-sheet)
- [Study Resources](#study-resources)
- [Study Plan](#study-plan)

---

## Exam Overview

| Detail | Value |
|--------|-------|
| **Questions** | 60 scenario-based |
| **Scoring** | 100–1,000 scale |
| **Passing Score** | 720 |
| **Format** | Proctored, no external resources |
| **Availability** | Claude Partner Network members (first 5,000 free) |
| **Top reported score** | 985/1,000 (Reddit r/ClaudeAI) |

**Key insight**: This is a **"best answer" exam** — multiple options may be technically valid, but only one is the architecturally correct choice for the given scenario. This is why people fail: they pick a "correct" answer instead of the **best** answer.

---

## The 5 Domains

| # | Domain | Weight | ~Questions | Focus |
|---|--------|--------|------------|-------|
| 1 | **Agentic Architecture & Orchestration** | 27% | ~16 | Multi-agent systems, orchestration patterns, agent delegation, failure handling |
| 2 | **Claude Code Configuration & Workflows** | 20% | ~12 | CLAUDE.md hierarchy, `.claude/rules/`, `-p` flag, CI/CD integration |
| 3 | **Prompt Engineering & Structured Output** | 20% | ~12 | System prompt architecture, JSON schema, few-shot, injection defense |
| 4 | **Tool Design & MCP Integration** | 18% | ~11 | Tool schemas, MCP servers, `.mcp.json`, error handling in tool calls |
| 5 | **Context Management & Reliability** | 15% | ~9 | Token budgeting, context pruning, HITL workflows, graceful degradation |

> **Rule**: Study in proportion to the weights. Domains 1+2 = 47% of the exam.

---

## Decision Algorithm

### Step-by-Step Process for Every Question

```
STEP 1: READ THE SCENARIO — What production problem is being solved?

STEP 2: IDENTIFY THE DOMAIN
  ├── Agents/orchestration?       → Domain 1 (27%)
  ├── Claude Code config?         → Domain 2 (20%)
  ├── Prompting/structured output → Domain 3 (20%)
  ├── Tools/MCP?                  → Domain 4 (18%)
  └── Context/reliability?        → Domain 5 (15%)

STEP 3: ELIMINATE ANTI-PATTERNS (kills 2 of 4 options usually)
  ❌ Prompt instructions for critical business rules
  ❌ Parsing natural language for control flow
  ❌ Same-session self-review
  ❌ Agent with >5 tools
  ❌ Sentiment-based escalation
  ❌ Super-agent with all capabilities
  ❌ Sequential full-context pipeline

STEP 4: APPLY PRIORITY RULES (picks 1 from remaining 2)
  CODE > PROMPTS
  EXPLICIT > IMPLICIT
  ISOLATED > SHARED
  BUILT-IN > CUSTOM
  COST-AWARE > BRUTE-FORCE

STEP 5: PRODUCTION REALITY CHECK
  "Would this work at 3AM with no engineer watching?"
```

---

## Anti-Patterns

These are the **specific wrong answers** the exam uses as distractors. Memorize them — recognizing even one instantly eliminates that option.

### 1. Prompt Instructions for Critical Business Rules ❌

**Trap**: "Add a rule in the system prompt that says 'never process refunds over $10,000'"

**Why wrong**: Prompt instructions are guidelines, not guarantees. They can be bypassed, ignored under pressure, or overridden by conflicting context. Production business rules must be enforced programmatically.

**Correct approach**: Use PostToolUse hooks, code-level validation, or programmatic guards.

### 2. Natural Language Parsing for Control Flow ❌

**Trap**: "Parse Claude's response to see if it says 'I'm done' to exit the loop"

**Why wrong**: Natural language is ambiguous and unreliable for control decisions. "I think I'm done" vs "I'm done" vs "Done!" —  parsing all variants is fragile.

**Correct approach**: Check `stop_reason` field programmatically. It's explicit and deterministic.

### 3. Same-Session Self-Review ❌

**Trap**: "Ask Claude to review its own output before returning it"

**Why wrong**: Confirmation bias. The same context that produced the error will "review" the error and agree with it.

**Correct approach**: Use an **independent review instance** — a separate Claude call with fresh context and a reviewer-focused system prompt.

### 4. Agent With Too Many Tools (>5) ❌

**Trap**: "Give the agent access to all 18 available tools for maximum flexibility"

**Why wrong**: Tool selection accuracy degrades sharply past 4-5 tools. Claude may pick the wrong tool, combine tools incorrectly, or get confused by similar descriptions.

**Correct approach**: Decompose into subagents with 3-5 focused tools each. Hub-and-spoke architecture.

### 5. Sentiment-Based Escalation ❌

**Trap**: "If the customer sounds angry, escalate to a human"

**Why wrong**: Sentiment ≠ complexity. A calm customer can have a legal issue requiring escalation. An angry customer might just need a password reset.

**Correct approach**: Explicit complexity criteria, tool-call detection, or structured classification — not sentiment.

### 6. Super-Agent Anti-Pattern ❌

**Trap**: "One powerful agent that handles everything with a comprehensive system prompt"

**Why wrong**: Breaks context isolation, creates a single point of failure, makes debugging impossible, tool count explodes.

**Correct approach**: Hub-and-spoke — coordinator delegates to specialized subagents.

### 7. Sequential Full-Context Pipeline ❌

**Trap**: "Pass the complete output of step 1 as input to step 2, then step 2's output to step 3..."

**Why wrong**: Context bloats with each step, eventually exceeding the window. No parallelism. One failure cascades.

**Correct approach**: Coordinator passes only relevant summaries. Subagents work in parallel where possible.

---

## Scenario Patterns

### Scenario 1: Multi-Agent Research System

**Setup**: Claude needs to search multiple data sources, synthesize findings, produce summary. 50+ simultaneous tasks.

**Question Pattern**: Which architecture is BEST?

| Option | Description | Verdict |
|--------|------------|---------|
| A | Single Claude instance with 18 tools for all data sources | ❌ Too many tools |
| B | Hub-and-spoke coordinator with specialized subagents (3-4 tools each) | ✅ **CORRECT** |
| C | Sequential pipeline passing full context forward | ❌ Context bloat, no parallelism |
| D | Super-agent with all capabilities and massive system prompt | ❌ Super-agent anti-pattern |

**Algorithm trace**: Step 3 eliminates A (>5 tools), C (sequential pipeline), D (super-agent). B is the only survivor.

---

### Scenario 2: Structured Data Extraction

**Setup**: Financial app extracts transaction data from unstructured docs into strict JSON. Occasionally produces incorrect field mappings.

**Question Pattern**: Which approach BEST ensures reliability?

| Option | Description | Verdict |
|--------|------------|---------|
| A | Add detailed examples in the system prompt | ❌ Helps but doesn't enforce |
| B | Validation-retry loop: extract → validate against JSON schema → retry with error feedback | ✅ **CORRECT** |
| C | Have Claude self-review its output in the same conversation | ❌ Same-session self-review |
| D | More detailed natural language description of expected output | ❌ Prompts don't guarantee structure |

**Algorithm trace**: Step 3 eliminates C (self-review). Step 4 Rule 1 (CODE > PROMPTS) picks B over A and D.

---

### Scenario 3: CI/CD Pipeline Integration

**Setup**: Claude Code in CI/CD for auto code reviews. Must run non-interactively, machine-parseable output.

**Question Pattern**: Which approach is BEST?

| Option | Description | Verdict |
|--------|------------|---------|
| A | Run Claude Code with plan mode for careful analysis | ❌ Plan mode is interactive |
| B | Use Claude Code with `-p` flag and JSON output format | ✅ **CORRECT** |
| C | Deploy a separate Claude API integration with custom prompts | ❌ Re-inventing the wheel |
| D | Use Claude Code interactively and capture terminal output | ❌ Interactive blocks in CI/CD |

**Algorithm trace**: Step 3 eliminates A (interactive) and D (interactive). Step 4 Rule 4 (BUILT-IN > CUSTOM) picks B over C.

---

### Scenario 4: Developer Productivity / Code Standards

**Setup**: Large team, monorepo, different teams need different coding standards enforced via Claude Code.

**Question Pattern**: Which configuration is BEST?

| Option | Description | Verdict |
|--------|------------|---------|
| A | Single comprehensive `CLAUDE.md` at the root | ❌ Can't scope per team |
| B | Root `CLAUDE.md` + `.claude/rules/` with glob-pattern scoping per directory | ✅ **CORRECT** |
| C | Each developer maintains their own system prompt | ❌ No consistency |
| D | Shared system prompt in CI/CD config | ❌ Not how Claude Code works |

**Algorithm trace**: Step 4 Rule 4 (BUILT-IN > CUSTOM) — B uses Claude Code's actual configuration system.

---

### Scenario 5: Agentic Loop Control / Escalation

**Setup**: Customer support agent should escalate to human for requests with legal implications.

**Question Pattern**: Which termination approach is BEST?

| Option | Description | Verdict |
|--------|------------|---------|
| A | Analyze response sentiment — if negative, escalate | ❌ Sentiment ≠ complexity |
| B | Include "if user mentions legal issues, stop" in system prompt | ❌ Business rule in prompt |
| C | Check `stop_reason` + PostToolUse hook that detects escalation tool call, routes to human | ✅ **CORRECT** |
| D | Parse Claude's NL output for phrases like "I should escalate this" | ❌ NL parsing for control flow |

**Algorithm trace**: Step 3 eliminates A (sentiment), B (prompt for business rule), D (NL parsing). C survives.

---

### Scenario 6: Cost Optimization

**Setup**: 10,000 document summaries daily. Latency not a concern — results consumed in nightly report.

**Question Pattern**: Which approach BEST optimizes cost?

| Option | Description | Verdict |
|--------|------------|---------|
| A | Standard Messages API with concurrency limiting | ❌ Full price |
| B | Message Batches API (50% cost savings, 24h window) | ✅ **CORRECT** |
| C | Use a smaller model for all documents | ❌ Quality loss, exam wants COST optimization not QUALITY trade-off |
| D | Reduce max_tokens to minimize output costs | ❌ May truncate needed output |

**Algorithm trace**: Step 4 Rule 5 (COST-AWARE) — Batch API is purpose-built for this exact use case.

---

## Cheat Sheet

When stuck between the final 2 "good" answers:

| If one answer uses... | And the other uses... | **Pick** |
|---|---|---|
| Programmatic hooks | Prompt instructions | **Hooks** |
| `stop_reason` check | NL output parsing | **`stop_reason`** |
| Independent reviewer | Same-session review | **Independent** |
| 4 focused tools | 12 comprehensive tools | **4 focused** |
| Batch API | Standard API (no latency need) | **Batch** |
| `CLAUDE.md` + `rules/` | System prompt variable | **`CLAUDE.md`** |
| Hub-and-spoke agents | Single super-agent | **Hub-and-spoke** |
| `-p` flag (non-interactive) | Interactive mode in CI/CD | **`-p` flag** |
| Validation-retry loop | Better prompt examples | **Validation loop** |
| `strict: true` tool use | Trust Claude's output format | **`strict: true`** |

---

## Study Resources

### Primary (Official)

1. **Official CCA-F Exam Guide PDF** — 12 sample questions + 4 prep exercises  
   - URL: `everpath-course-content.s3-accelerate.amazonaws.com` (search "Claude Certified Architect Foundations Certification Exam Guide")
2. **Anthropic Academy (Skilljar)** — 13 free courses  
   - URL: `anthropic.skilljar.com`
3. **Claude API Documentation**  
   - URL: `platform.claude.com/docs`

### Course-to-Domain Mapping

| Domain | Recommended Courses |
|--------|-------------------|
| Agentic Architecture (27%) | Agent Skills, Claude API |
| Claude Code Workflows (20%) | Claude Code 101, Claude Code in Action |
| Prompt Engineering (20%) | Claude 101, Building with Claude API |
| Tool Design & MCP (18%) | Introduction to MCP, MCP Advanced Topics |
| Context & Reliability (15%) | Claude API, Agent Skills |

### Community Resources

- Reddit: `r/ClaudeAI` — search "CCA-F" or "certified architect"
- Dev.to articles by McRolly NWANGWU, SO JS (study roadmaps)
- Medium: Rick Hightower's CCA exam prep series (paywall)

---

## Study Plan

### Week 1: Foundation + Highest-Weight Domain
- Complete Claude 101 and Claude API courses
- Read the full Official Exam Guide PDF cover-to-cover
- Begin Agent Skills course → feeds into Domain 1 (27%)

### Week 2: MCP and Tool Use
- Complete MCP Beginner and Advanced courses
- Build a simple MCP server and connect to Claude
- Study tool schema design, `strict: true`, error handling

### Week 3: Prompt Engineering + Claude Code
- Complete Prompt Engineering and Claude Code courses
- Practice: system prompts for structured output, injection defense
- Practice: `CLAUDE.md` hierarchy, `-p` flag, `.claude/rules/`

### Week 4: Context Management + Anti-Pattern Drills
- Complete remaining courses (AWS Bedrock, Vertex AI if relevant)
- Focus on context window optimization, HITL patterns
- **Drill all 7 anti-patterns until you can spot them in <5 seconds**

### Week 5: Mock Exams + Weak Domain Focus
- Work all 12 sample questions from the Exam Guide
- Build the 4 prep exercises
- Take the official practice exam
- Re-drill weak domains

---

## Key Technical Facts to Memorize

| Concept | Key Fact |
|---------|----------|
| `stop_reason` | Check this to determine why Claude stopped. Never parse NL for this. |
| Tool count per agent | 4-5 max for reliable selection |
| Batch API savings | 50% cost reduction, 24-hour processing window |
| `-p` flag | Makes Claude Code non-interactive for CI/CD |
| `CLAUDE.md` hierarchy | Root → subdirectory → `.claude/rules/` with glob patterns |
| `strict: true` | Forces tool calls to match your schema exactly |
| `isError` / `isRetryable` / `errorCategory` | Structured error fields in MCP tool responses |
| PostToolUse hooks | Programmatic control after tool execution — use for business rules |
| `.mcp.json` | Configuration file for MCP server connections |
| Independent review | Always use a SEPARATE Claude instance for output review |

---

## Out of Scope (Don't Study)

- Fine-tuning
- Authentication implementation details
- Vision/image processing specifics
- Streaming implementation details
- Model training internals

---

*Last updated: April 9, 2026*
*Sources: Official CCA-F Exam Guide, Anthropic Academy, Reddit r/ClaudeAI, Dev.to community articles*
