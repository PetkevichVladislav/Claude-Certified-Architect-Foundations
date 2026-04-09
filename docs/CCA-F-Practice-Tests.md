# CCA-F Practice Tests — Complete Question Bank with Detailed Answer Analysis

> **60 practice questions** covering all 5 domains and 6 scenarios.
> Every question includes **detailed explanations for ALL 4 options** — why the correct answer is right AND why every wrong answer is wrong.
> Includes all **12 official sample questions** from the Anthropic exam guide.

---

## How to Use This File

1. **Simulate exam conditions**: Set a 120-minute timer, answer all 60 questions without external resources
2. **Score yourself**: 720/1,000 is passing (~43/60 correct minimum)
3. **Review ALL explanations** — including wrong answers. The exam tests your ability to distinguish between "good" and "best"
4. **Apply the Decision Algorithm**: For each question, mentally run: Eliminate anti-patterns → Apply priority rules → Pick the most architectural answer

---

## Decision Algorithm Quick Reference

```
Step 1: ELIMINATE ANTI-PATTERNS
  ✗ Prompt instructions for deterministic business rules
  ✗ NL parsing for control flow (stop_reason exists!)
  ✗ Same-session self-review
  ✗ Single agent with >5 tools
  ✗ Sentiment-based escalation
  ✗ Super-agent (one agent does everything)
  ✗ Sequential full-context pipeline

Step 2: APPLY PRIORITY RULES (if 2+ options remain)
  CODE > PROMPTS (programmatic enforcement > prompt instructions)
  EXPLICIT > IMPLICIT (clear criteria > vague guidance)
  ISOLATED > SHARED (separate contexts > shared sessions)
  BUILT-IN > CUSTOM (existing mechanisms > custom solutions)
  COST-AWARE > BRUTE-FORCE (right tool for the job > throw money at it)
```

---

## SECTION A: Official Sample Questions (12 Questions)

*These 12 questions are drawn directly from the official Anthropic CCA-F exam guide.*

---

### Scenario: Customer Support Resolution Agent

> You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to backend systems through custom MCP tools (`get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`). Your target is 80%+ first-contact resolution while knowing when to escalate.

---

#### Q1 (D1 — Agentic Architecture) ⭐ OFFICIAL

Production data shows that in 12% of cases, your agent skips `get_customer` entirely and calls `lookup_order` using only the customer's stated name, occasionally leading to misidentified accounts and incorrect refunds. What change would most effectively address this reliability issue?

- **A)** Add a programmatic prerequisite that blocks `lookup_order` and `process_refund` calls until `get_customer` has returned a verified customer ID
- **B)** Enhance the system prompt to state that customer verification via `get_customer` is mandatory before any order operations
- **C)** Add few-shot examples showing the agent always calling `get_customer` first, even when customers volunteer order details
- **D)** Implement a routing classifier that analyzes each request and enables only the subset of tools appropriate for that request type

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | Programmatic enforcement provides **deterministic guarantees**. A `PostToolUse` hook or prerequisite gate physically blocks `lookup_order` and `process_refund` until `get_customer` returns a verified customer ID. Zero% failure rate on enforced ordering. This is the CODE > PROMPTS principle in action. |
| **B ❌** | Plausible but insufficient | Prompt instructions are **probabilistic** — the 12% skip rate exists *despite* the model generally knowing the right sequence. Stronger wording may reduce it to 5% but cannot eliminate it. When errors have **financial consequences** (incorrect refunds), probabilistic compliance is unacceptable. |
| **C ❌** | Plausible but insufficient | Few-shot examples improve consistency but are still prompt-based guidance. They add token overhead and remain probabilistic. The model can still deviate, especially with unusual inputs. Same fundamental limitation as B. |
| **D ❌** | Over-engineered, wrong problem | A routing classifier addresses **which tools are available**, not **what order they must be called in**. Even if only `get_customer` and `lookup_order` are enabled for order queries, the agent could still call `lookup_order` first. Solves tool *selection*, not tool *sequencing*. |

**Algorithm trace**: B and C are prompt-based → anti-pattern for deterministic business rules → eliminate. D solves wrong problem. A is programmatic enforcement → CODE > PROMPTS → select A.

---

#### Q2 (D2 — Tool Design) ⭐ OFFICIAL

Production logs show the agent frequently calls `get_customer` when users ask about orders (e.g., "check my order #12345"), instead of calling `lookup_order`. Both tools have minimal descriptions ("Retrieves customer information" / "Retrieves order details") and accept similar identifier formats. What's the most effective first step to improve tool selection reliability?

- **A)** Add few-shot examples to the system prompt demonstrating correct tool selection patterns, with 5–8 examples showing order-related queries routing to `lookup_order`
- **B)** Expand each tool's description to include input formats it handles, example queries, edge cases, and boundaries explaining when to use it vs similar tools
- **C)** Implement a routing layer that parses user input before each turn and pre-selects the appropriate tool based on detected keywords and identifier patterns
- **D)** Consolidate both tools into a single `lookup_entity` tool that accepts any identifier and internally determines which backend to query

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Treats symptom, not cause | Few-shot examples add token overhead without fixing the **root cause**: the model can't distinguish between tools because descriptions are minimal. Examples are secondary reinforcement; descriptions are the primary selection signal. |
| **B ✅** | **BEST** | Tool descriptions are the **primary mechanism** LLMs use for tool selection. Expanding descriptions to include input formats, example queries, edge cases, and explicit boundaries ("Use this when X, NOT when Y") directly addresses the root cause. Low-effort, high-leverage fix. BUILT-IN > CUSTOM. |
| **C ❌** | Over-engineered | A keyword-based routing layer bypasses the LLM's natural language understanding, requires maintenance as new query patterns emerge, and is fragile to edge cases. Also an anti-pattern: NL parsing for control flow. |
| **D ❌** | Valid but too much for "first step" | Consolidating tools is a legitimate architectural choice but requires backend changes, testing, and new error handling. The question asks for the most effective **first step** — description improvement is faster and often sufficient. |

**Algorithm trace**: C = NL parsing anti-pattern → eliminate. A adds overhead without fixing root cause. D is valid but heavy. B is built-in mechanism (tool descriptions) → BUILT-IN > CUSTOM → select B.

---

#### Q3 (D5 — Reliability) ⭐ OFFICIAL

Your agent achieves 55% first-contact resolution, well below the 80% target. Logs show it escalates straightforward cases (standard damage replacements with photo evidence) while attempting to autonomously handle complex situations requiring policy exceptions. What's the most effective way to improve escalation calibration?

- **A)** Add explicit escalation criteria to your system prompt with few-shot examples demonstrating when to escalate vs resolve autonomously
- **B)** Have the agent self-report a confidence score (1–10) before each response and automatically route requests to humans when confidence falls below a threshold
- **C)** Deploy a separate classifier model trained on historical tickets to predict which requests need escalation before the main agent begins processing
- **D)** Implement sentiment analysis to detect customer frustration levels and automatically escalate when negative sentiment exceeds a threshold

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | The root cause is **unclear decision boundaries** — the agent doesn't know what's simple vs complex. Adding explicit criteria ("Escalate when: policy exceptions needed, customer requests human, no progress after 3 turns. Resolve when: standard replacements with evidence, clear policy coverage") with few-shot examples directly fixes the calibration. EXPLICIT > IMPLICIT. |
| **B ❌** | Anti-pattern | LLM self-reported confidence is **poorly calibrated** — the agent is already incorrectly confident on hard cases and incorrectly uncertain on easy ones. A confidence score would just encode the same bad calibration numerically. Self-reported confidence ≠ actual accuracy. |
| **C ❌** | Over-engineered | Requires labeled training data, ML infrastructure, and ongoing maintenance. This is premature when **prompt optimization hasn't been tried yet**. The question says the agent lacks clear criteria — fix that first. COST-AWARE > BRUTE-FORCE. |
| **D ❌** | Anti-pattern | Sentiment-based escalation is an **explicit exam anti-pattern**. Customer frustration doesn't correlate with case complexity. An angry customer with a standard replacement is still a simple case. A calm customer requesting a policy exception is still complex. |

**Algorithm trace**: B = self-reported confidence (unreliable) → eliminate. D = sentiment-based escalation → anti-pattern → eliminate. C = over-engineered before trying prompt optimization. A = explicit criteria → EXPLICIT > IMPLICIT → select A.

---

### Scenario: Code Generation with Claude Code

> You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

---

#### Q4 (D3 — Claude Code) ⭐ OFFICIAL

You want to create a custom `/review` slash command that runs your team's standard code review checklist. This command should be available to every developer when they clone or pull the repository. Where should you create this command file?

- **A)** In the `.claude/commands/` directory in the project repository
- **B)** In `~/.claude/commands/` in each developer's home directory
- **C)** In the `CLAUDE.md` file at the project root
- **D)** In a `.claude/config.json` file with a `commands` array

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | `.claude/commands/` is the **project-scoped** command directory. It's version-controlled and automatically available to all developers when they clone or pull the repo. This is the designed mechanism for shared team commands. |
| **B ❌** | Wrong scope | `~/.claude/commands/` is for **personal** commands that aren't shared via version control. Each developer would need to manually create the file, defeating the purpose of team standardization. |
| **C ❌** | Wrong mechanism | `CLAUDE.md` is for project instructions and context, not command definitions. You can put guidelines there but not executable slash commands. |
| **D ❌** | Non-existent | `.claude/config.json` with a `commands` array is a fabricated configuration mechanism that **does not exist** in Claude Code. This is a trap answer testing whether you know the real configuration surface. |

**Algorithm trace**: D doesn't exist → eliminate. C wrong mechanism → eliminate. B is personal scope → wrong for team sharing. A is project-scoped, version-controlled → select A.

---

#### Q5 (D3 — Claude Code) ⭐ OFFICIAL

You've been assigned to restructure the team's monolithic application into microservices. This will involve changes across dozens of files and requires decisions about service boundaries and module dependencies. Which approach should you take?

- **A)** Enter plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes
- **B)** Start with direct execution and make changes incrementally, letting the implementation reveal the natural service boundaries
- **C)** Use direct execution with comprehensive upfront instructions detailing exactly how each service should be structured
- **D)** Begin in direct execution mode and only switch to plan mode if you encounter unexpected complexity during implementation

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | Plan mode is designed for **complex tasks involving large-scale changes, multiple valid approaches, and architectural decisions** — exactly what monolith-to-microservices restructuring requires. It enables safe codebase exploration and design before committing to changes, preventing costly rework. |
| **B ❌** | High rework risk | Starting with direct execution risks discovering dependencies late, leading to costly rework. Service boundaries require understanding the entire system before making cuts — you can't "discover" them incrementally. |
| **C ❌** | Assumes known solution | Assumes you already know the right structure without exploring the code. For a monolith restructuring, the right boundaries are unknown until you explore dependencies. Comprehensive upfront instructions would be guesses. |
| **D ❌** | Ignores stated complexity | The complexity is already **stated in the requirements** (dozens of files, service boundaries, module dependencies). It's not something that "might emerge later." Waiting to encounter complexity that's already obvious wastes time. |

**Algorithm trace**: The task explicitly states high complexity → plan mode is the designed solution for this. B/C/D all start with direct execution despite stated complexity → eliminate.

---

#### Q6 (D3 — Claude Code) ⭐ OFFICIAL

Your codebase has distinct areas with different coding conventions. Test files are spread throughout the codebase alongside the code they test (e.g., `Button.test.tsx` next to `Button.tsx`), and you want all tests to follow the same conventions regardless of location. What's the most maintainable way to ensure Claude automatically applies the correct conventions when generating code?

- **A)** Create rule files in `.claude/rules/` with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths
- **B)** Consolidate all conventions in the root CLAUDE.md file under headers for each area, relying on Claude to infer which section applies
- **C)** Create skills in `.claude/skills/` for each code type that include the relevant conventions in their SKILL.md files
- **D)** Place a separate CLAUDE.md file in each subdirectory containing that area's specific conventions

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | `.claude/rules/` with YAML frontmatter glob patterns (e.g., `paths: ["**/*.test.tsx"]`) allows conventions to be **automatically applied based on file paths** regardless of directory location — essential for test files spread throughout the codebase. Deterministic loading, zero manual invocation needed. |
| **B ❌** | Relies on inference | Putting all conventions in root CLAUDE.md relies on Claude **inferring** which section applies, which is unreliable. EXPLICIT > IMPLICIT. Also wastes tokens loading all conventions when only some are relevant. |
| **C ❌** | Requires manual invocation | Skills require **manual invocation** (or Claude choosing to load them), contradicting the need for deterministic "automatic" application based on file paths. Skills are for on-demand tasks, not always-on conventions. |
| **D ❌** | Wrong for spread-out files | Subdirectory CLAUDE.md files are **directory-bound**. If test files are spread across many directories (as stated), you'd need duplicate CLAUDE.md files everywhere — unmaintainable and prone to drift. |

**Algorithm trace**: B = implicit inference → EXPLICIT > IMPLICIT → eliminate. C = manual not automatic → wrong mechanism. D = directory-bound, poor for scattered files → eliminate. A = explicit glob patterns, automatic → select A.

---

### Scenario: Multi-Agent Research System

> You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

---

#### Q7 (D1 — Agentic Architecture) ⭐ OFFICIAL

After running the system on the topic "impact of AI on creative industries," you observe that each subagent completes successfully, but the final reports cover only visual arts, completely missing music, writing, and film production. The coordinator's logs show it decomposed the topic into three subtasks: "AI in digital art creation," "AI in graphic design," and "AI in photography." What is the most likely root cause?

- **A)** The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives from other agents
- **B)** The coordinator agent's task decomposition is too narrow, resulting in subagent assignments that don't cover all relevant domains of the topic
- **C)** The web search agent's queries are not comprehensive enough and need to be expanded to cover more creative industry sectors
- **D)** The document analysis agent is filtering out sources related to non-visual creative industries due to overly restrictive relevance criteria

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Blames wrong agent | The synthesis agent can only synthesize what it receives. It received only visual arts findings because that's all the subagents were **assigned to research**. Adding gap detection to synthesis addresses the symptom, not the cause. |
| **B ✅** | **BEST** | The coordinator's logs **directly reveal** the root cause: it decomposed "creative industries" into only visual arts subtasks (digital art, graphic design, photography), completely omitting music, writing, and film. The subagents executed their assigned tasks correctly — the problem is **what they were assigned**. |
| **C ❌** | Blames wrong agent | The web search agent searched for what it was told to search for. Its queries were scoped by the coordinator's task assignment. You can't blame the search agent for not searching topics it was never asked about. |
| **D ❌** | Blames wrong agent | Same logic — the document analysis agent analyzed documents within its assigned scope. It didn't filter anything out; it was never given non-visual sources to analyze. |

**Algorithm trace**: The logs give direct evidence → coordinator decomposed narrowly. A, C, D all blame downstream agents that executed correctly within their assigned scope. B identifies the actual root cause → select B.

---

#### Q8 (D5 — Reliability) ⭐ OFFICIAL

The web search subagent times out while researching a complex topic. You need to design how this failure information flows back to the coordinator agent. Which error propagation approach best enables intelligent recovery?

- **A)** Return structured error context to the coordinator including the failure type, the attempted query, any partial results, and potential alternative approaches
- **B)** Implement automatic retry logic with exponential backoff within the subagent, returning a generic "search unavailable" status only after all retries are exhausted
- **C)** Catch the timeout within the subagent and return an empty result set marked as successful
- **D)** Propagate the timeout exception directly to a top-level handler that terminates the entire research workflow

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | Structured error context (`errorCategory: "transient"`, `isRetryable: true`, attempted query, partial results, alternative approaches) gives the coordinator **all information needed for intelligent recovery** — retry with modified query, try alternative source, or proceed with partial results. |
| **B ❌** | Hides recovery context | Generic "search unavailable" status **hides valuable context** from the coordinator. After retries fail, the coordinator has no information about what was tried, what partially worked, or what alternatives exist. Recovery decisions require context. |
| **C ❌** | Anti-pattern: silent failure | Returning empty results marked as "successful" is **error suppression** — a critical anti-pattern. The coordinator thinks the search found nothing (valid empty result) when actually the search failed. Prevents any recovery and produces incomplete research with no indication of gaps. |
| **D ❌** | Over-reaction | Terminating the entire workflow because one subagent timed out is **disproportionate**. The coordinator could retry, delegate to another subagent, proceed with partial results, or mark a coverage gap. Complete termination wastes all completed work from other subagents. |

**Algorithm trace**: C = error suppression anti-pattern → eliminate. D = over-reaction → eliminate. B hides context → suboptimal. A = structured error with full context → enables intelligent coordinator decisions → select A.

---

#### Q9 (D1/D2 — Architecture + Tool Design) ⭐ OFFICIAL

During testing, you observe that the synthesis agent frequently needs to verify specific claims while combining findings. Currently, when verification is needed, the synthesis agent returns control to the coordinator, which invokes the web search agent, then re-invokes synthesis with results. This adds 2–3 round trips per task and increases latency by 40%. Your evaluation shows that 85% of these verifications are simple fact-checks (dates, names, statistics) while 15% require deeper investigation. What's the most effective approach to reduce overhead while maintaining system reliability?

- **A)** Give the synthesis agent a scoped `verify_fact` tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator
- **B)** Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass, which then sends them all to the web search agent at once
- **C)** Give the synthesis agent access to all web search tools so it can handle any verification need directly without round-trips through the coordinator
- **D)** Have the web search agent proactively cache extra context around each source during initial research, anticipating what the synthesis agent might need to verify

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | Applies **principle of least privilege**: gives the synthesis agent only what it needs for the 85% common case (simple fact verification via a scoped tool) while preserving the existing coordination pattern for the 15% complex cases. Addresses 85% of latency overhead with minimal architectural change. |
| **B ❌** | Creates blocking dependencies | Batching all verifications to the end creates **blocking dependencies** — synthesis steps may depend on earlier verified facts. Can't synthesize paragraph 3 correctly if paragraph 1's fact-check hasn't returned yet. |
| **C ❌** | Over-provisions, violates separation | Giving synthesis all web search tools **violates separation of concerns** and least privilege. Now the synthesis agent is also a search agent, increasing its complexity and tool count beyond its role. Anti-pattern: agent with >5 tools. |
| **D ❌** | Speculative, unreliable | Proactive caching **cannot reliably predict** what the synthesis agent will need to verify. It would over-fetch in most cases (wasting resources) while still missing some verification needs (incomplete coverage). |

**Algorithm trace**: C = over-provisioning, potentially >5 tools → anti-pattern → eliminate. B = blocking dependency → eliminate. D = speculative approach → unreliable. A = scoped tool, least privilege, addresses 85% case → select A.

---

### Scenario: Claude Code for Continuous Integration

> You are integrating Claude Code into your CI/CD pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

---

#### Q10 (D3 — Claude Code) ⭐ OFFICIAL

Your pipeline script runs `claude "Analyze this pull request for security issues"` but the job hangs indefinitely. Logs indicate Claude Code is waiting for interactive input. What's the correct approach to run Claude Code in an automated pipeline?

- **A)** Add the `-p` flag: `claude -p "Analyze this pull request for security issues"`
- **B)** Set the environment variable `CLAUDE_HEADLESS=true` before running the command
- **C)** Redirect stdin from `/dev/null`: `claude "Analyze this pull request for security issues" < /dev/null`
- **D)** Add the `--batch` flag: `claude --batch "Analyze this pull request for security issues"`

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | The `-p` (or `--print`) flag is the **documented way** to run Claude Code in non-interactive mode. It processes the prompt, outputs the result to stdout, and exits without waiting for user input — exactly what CI/CD pipelines require. |
| **B ❌** | Non-existent | `CLAUDE_HEADLESS=true` is a **fabricated environment variable** that does not exist in Claude Code. Trap answer testing whether you know the real CLI interface. |
| **C ❌** | Unix workaround, not proper | Redirecting from `/dev/null` is a generic Unix workaround that doesn't properly address Claude Code's command syntax. It may prevent the hang but doesn't use the designed non-interactive mode. |
| **D ❌** | Non-existent | `--batch` is a **fabricated flag** that does not exist in Claude Code. Another trap answer. The real flag is `-p` / `--print`. |

**Algorithm trace**: B and D are fabricated features → eliminate immediately. C is a workaround, not the designed solution. A is the documented mechanism → BUILT-IN > CUSTOM → select A.

---

#### Q11 (D4 — Prompt Engineering) ⭐ OFFICIAL

Your team wants to reduce API costs for automated analysis. Currently, real-time Claude calls power two workflows: (1) a blocking pre-merge check that must complete before developers can merge, and (2) a technical debt report generated overnight for review the next morning. Your manager proposes switching both to the Message Batches API for its 50% cost savings. How should you evaluate this proposal?

- **A)** Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks
- **B)** Switch both workflows to batch processing with status polling to check for completion
- **C)** Keep real-time calls for both workflows to avoid batch result ordering issues
- **D)** Switch both to batch processing with a timeout fallback to real-time if batches take too long

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | The Message Batches API offers 50% cost savings but has processing times **up to 24 hours with no guaranteed latency SLA**. This makes it unsuitable for blocking pre-merge checks (developers wait) but **ideal** for overnight batch jobs like technical debt reports. Match API to workflow requirements. COST-AWARE > BRUTE-FORCE. |
| **B ❌** | Unacceptable for blocking workflows | Polling doesn't solve the fundamental problem: batch processing has **no guaranteed completion time**. A developer could be blocked for hours waiting for a batch result. "Often faster" isn't acceptable for blocking workflows. |
| **C ❌** | Wastes money unnecessarily | Keeping real-time for both wastes the 50% savings opportunity on overnight reports that have **zero latency requirements**. This option reflects a misconception — batch results can be correlated using `custom_id` fields, so ordering isn't an issue. |
| **D ❌** | Over-engineered | A timeout fallback adds unnecessary complexity. The simpler solution is just matching each API to its appropriate use case. Batch for latency-tolerant, synchronous for blocking. No fallback logic needed. |

**Algorithm trace**: Pre-merge = blocking = needs real-time. Overnight reports = latency-tolerant = perfect for batch. A matches each workflow to the right API → COST-AWARE → select A.

---

#### Q12 (D4 — Prompt Engineering) ⭐ OFFICIAL

A pull request modifies 14 files across the stock tracking module. Your single-pass review analyzing all files together produces inconsistent results: detailed feedback for some files but superficial comments for others, obvious bugs missed, and contradictory feedback — flagging a pattern as problematic in one file while approving identical code elsewhere in the same PR. How should you restructure the review?

- **A)** Split into focused passes: analyze each file individually for local issues, then run a separate integration-focused pass examining cross-file data flow
- **B)** Require developers to split large PRs into smaller submissions of 3–4 files before the automated review runs
- **C)** Switch to a higher-tier model with a larger context window to give all 14 files adequate attention in one pass
- **D)** Run three independent review passes on the full PR and only flag issues that appear in at least two of the three runs

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | Splitting reviews into focused passes directly addresses the root cause: **attention dilution** when processing many files at once. File-by-file analysis ensures consistent depth, while a separate integration pass catches cross-file issues (data flow, API contracts). Two-phase approach: local → cross-file. |
| **B ❌** | Shifts burden to developers | Requiring developers to split PRs doesn't improve the review system — it shifts the burden. Large PRs are sometimes necessary (e.g., module-wide refactoring). The system should handle them correctly. |
| **C ❌** | Misunderstands the problem | Larger context windows **don't solve attention quality issues**. The problem isn't context capacity — it's attention distribution. Even with infinite context, processing 14 files simultaneously leads to uneven attention. |
| **D ❌** | Suppresses real findings | Requiring consensus across 3 runs would actually **suppress detection of real bugs** that are caught intermittently. A real bug caught once out of three passes gets filtered out. This reduces sensitivity while not addressing the root cause. |

**Algorithm trace**: The root cause is attention dilution. B shifts burden → doesn't fix system. C conflates context size with attention quality → wrong solution. D suppresses findings → worse outcome. A directly addresses attention dilution with focused passes → select A.

---

## SECTION B: Practice Questions by Domain (48 Questions)

---

### Domain 1: Agentic Architecture & Orchestration (13 Questions)

---

#### Q13 (D1 — Agentic Loop)

You are implementing an agentic loop that allows Claude to autonomously complete tasks. After each API response, your loop needs to decide whether to continue or stop. Which approach correctly implements loop control flow?

- **A)** Check if `stop_reason` is `"tool_use"` to continue the loop, and terminate when `stop_reason` is `"end_turn"`
- **B)** Parse the assistant's text response for phrases like "I'm done" or "task complete" to determine when to stop
- **C)** Set a maximum iteration count of 10 and stop when reached, regardless of task completion
- **D)** Check if the response contains any text content (vs only tool calls) as the signal to terminate

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | The `stop_reason` field is the **designed mechanism** for agentic loop control. `"tool_use"` means the model wants to call a tool → continue loop, append tool results. `"end_turn"` means the model has completed → terminate loop. This is deterministic and reliable. |
| **B ❌** | Anti-pattern: NL parsing | Parsing natural language signals for control flow is an **explicit anti-pattern**. The model might use phrases like "done" mid-task, or not use them when actually finished. `stop_reason` exists specifically to replace this unreliable approach. |
| **C ❌** | Anti-pattern: arbitrary cap | Using an arbitrary iteration cap as the **primary** stopping mechanism is an anti-pattern. The task might need 12 steps, or only 2. Caps should be safety guardrails, not the primary control mechanism. |
| **D ❌** | Unreliable heuristic | The model can return text content alongside tool calls (explaining what it's doing), or return tool calls without text. Text presence is not a reliable proxy for task completion. |

---

#### Q14 (D1 — Multi-Agent)

Your multi-agent research system uses a hub-and-spoke architecture. The coordinator delegates to three specialized subagents. You notice that subagent B sometimes refers to findings from subagent A, even though you never passed those findings to subagent B. What's happening?

- **A)** Subagents automatically inherit the coordinator's full conversation history, including results from other subagents
- **B)** The subagents share a memory store that synchronizes findings in real-time
- **C)** The coordinator is accidentally including subagent A's results when constructing subagent B's prompt
- **D)** Claude caches subagent context across the session, making all findings available

**✅ Correct Answer: C**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Factually wrong | Subagents operate with **isolated context** — they do **not** inherit the coordinator's conversation history automatically. This is a key exam concept. |
| **B ❌** | Non-existent mechanism | There is no real-time memory sharing between subagents. Each subagent has its own isolated context. |
| **C ✅** | **BEST** | Since subagent context must be **explicitly provided in the prompt**, the most likely explanation is that the coordinator's prompt construction accidentally includes subagent A's results when invoking subagent B. This is a common implementation bug. |
| **D ❌** | Non-existent mechanism | Claude does not cache subagent context across sessions or make findings automatically available to other subagents. |

---

#### Q15 (D1 — Subagent Spawning)

Your coordinator agent needs to invoke three subagents to research different aspects of a topic simultaneously. What is the correct way to achieve parallel subagent execution?

- **A)** Use Python threading to call the Claude API three times concurrently
- **B)** Have the coordinator emit multiple `Task` tool calls in a single response
- **C)** Configure the coordinator with `parallel_execution: true` in the agent definition
- **D)** Create three separate coordinator instances, each managing one subagent

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Implementation detail, not SDK pattern | While threading works mechanically, it's not the Agent SDK's designed pattern for parallel subagent execution. It bypasses the SDK's orchestration. |
| **B ✅** | **BEST** | The Agent SDK supports parallel subagent execution by having the coordinator **emit multiple `Task` tool calls in a single response**. The runtime handles concurrent execution. This is the designed mechanism. Coordinator's `allowedTools` must include `"Task"`. |
| **C ❌** | Non-existent | `parallel_execution: true` is a fabricated configuration option that does not exist in the Agent SDK. Trap answer. |
| **D ❌** | Over-engineered, wrong pattern | Three separate coordinators duplicates orchestration logic and breaks the hub-and-spoke pattern. One coordinator should manage all subagents. |

---

#### Q16 (D1 — Hooks)

Your customer support agent processes refunds. Company policy requires that refunds over $500 must be approved by a human supervisor. The current implementation relies on a system prompt instruction: "Never process refunds over $500 without supervisor approval." Monitoring shows the agent bypasses this rule approximately 3% of the time. What's the most reliable fix?

- **A)** Add three few-shot examples demonstrating the $500 threshold behavior
- **B)** Implement a hook that intercepts `process_refund` tool calls and blocks any refund above $500, redirecting to a human approval workflow
- **C)** Bold and capitalize the rule in the system prompt: "**CRITICAL: NEVER process refunds > $500**"
- **D)** Add a self-check step where the agent reviews the refund amount before processing

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Still probabilistic | Few-shot examples improve compliance but cannot guarantee it. Moving from 3% failure to 1% failure is still unacceptable when errors cause unauthorized financial transactions. |
| **B ✅** | **BEST** | A programmatic hook provides **deterministic enforcement**. Every `process_refund` call is intercepted and checked — if amount > $500, the tool call is blocked and redirected to human approval. 0% bypass rate. CODE > PROMPTS for financial business rules. |
| **C ❌** | Prompt emphasis doesn't guarantee compliance | Formatting emphasis (bold, caps) in prompts has marginal effect on compliance rates. The model already "knows" the rule — the issue is probabilistic adherence, not rule awareness. |
| **D ❌** | Same-session self-review anti-pattern | Having the agent review its own decisions in the same session is unreliable — it retains the same reasoning context and is unlikely to contradict its initial decision. |

---

#### Q17 (D1 — Task Decomposition)

You need to review a large PR that modifies 15 files. The review needs to check both per-file code quality AND cross-file architectural consistency. Which task decomposition pattern is most appropriate?

- **A)** Prompt chaining: analyze each file individually, then run a cross-file integration pass
- **B)** Dynamic decomposition: let the agent decide which files to review and in what order based on initial findings
- **C)** Single-pass: provide all 15 files in one prompt with instructions to check both local quality and cross-file consistency
- **D)** Pipeline: route each file through a quality checker, then an architecture checker, then an integration checker sequentially

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | Prompt chaining is ideal for **predictable multi-aspect reviews**. Per-file local analysis ensures consistent depth (no attention dilution), then a separate cross-file pass catches integration issues. This is the documented pattern for large code reviews. |
| **B ❌** | Wrong pattern for this task | Dynamic decomposition is for **open-ended investigation** where the scope isn't known upfront. Here, you know exactly what files need review — it's a defined, predictable task. |
| **C ❌** | Attention dilution | Processing 15 files simultaneously causes the exact problems described in Q12: inconsistent depth, missed bugs, contradictory feedback. This is the anti-pattern being replaced. |
| **D ❌** | Over-engineered sequential pipeline | A three-stage pipeline per file is over-engineered and creates a sequential bottleneck. Each file must pass through 3 stages before the next file starts. Also, the architecture check can't work per-file — it needs cross-file context. |

---

#### Q18 (D1 — Session Management)

You're in the middle of a lengthy codebase investigation with Claude Code. You've gathered findings from 20+ files, but notice Claude is starting to reference "typical patterns" rather than the specific classes it discovered earlier. What should you do?

- **A)** Continue the session — the model has all the information in its context
- **B)** Use `/compact` to reduce context usage, then continue the exploration
- **C)** Start a fresh session and re-discover everything from scratch
- **D)** Use `--resume` to resume a saved checkpoint from earlier in the session

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Ignores the symptom | The model referencing "typical patterns" instead of specific classes is a **context degradation signal** — continuing without addressing it will produce increasingly unreliable results. |
| **B ✅** | **BEST** | `/compact` reduces context usage by summarizing verbose discovery output while preserving key findings. This directly addresses the context degradation problem during extended exploration sessions. Continue exploring with refreshed context. |
| **C ❌** | Wasteful | Starting completely fresh discards all accumulated findings. Rediscovering 20+ files wastes significant time. Better to compact and continue rather than throw everything away. |
| **D ❌** | Wrong mechanism for this problem | `--resume` continues a named session — it doesn't reduce context. If the context is already degraded, resuming puts you right back in the same degraded state. You need to compress, not resume. |

---

#### Q19 (D1 — Workflow Enforcement)

Your financial services agent must verify customer identity before processing any transactions. The workflow is: (1) verify identity via `verify_customer`, (2) check account status via `get_account`, (3) process transaction via `execute_transaction`. Which enforcement approach ensures this sequence is always followed?

- **A)** Include a "MANDATORY WORKFLOW" section in the system prompt describing the required sequence
- **B)** Implement prerequisite hooks that block each step until the previous step has completed successfully
- **C)** Use `tool_choice` forced selection to force `verify_customer` on the first turn, then `get_account` on the second turn
- **D)** Provide 5 few-shot examples showing the correct workflow sequence

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Probabilistic | Prompt instructions are probabilistic for business-critical sequences. In financial services, even a 1% deviation rate is unacceptable. |
| **B ✅** | **BEST** | Prerequisite hooks provide **deterministic enforcement**: `get_account` is blocked until `verify_customer` returns success, `execute_transaction` is blocked until `get_account` returns success. Physically impossible to skip steps. |
| **C ❌** | Fragile, breaks agentic loop | Forcing specific tools on specific turns assumes the agent always takes exactly 3 turns in that order. Real conversations are dynamic — what if the customer asks a question between steps? `tool_choice` forced selection is for single-step guarantees, not multi-step workflows. |
| **D ❌** | Probabilistic | Few-shot examples improve consistency but cannot guarantee the full three-step sequence is always followed. Still a prompt-based approach. |

---

#### Q20 (D1 — Hooks: PostToolUse)

Your support agent calls multiple MCP tools that return timestamps in different formats: `get_customer` returns Unix epoch (1719849600), `lookup_order` returns ISO 8601 ("2024-07-01T12:00:00Z"), and `check_shipping` returns a US date string ("07/01/2024"). The model struggles to compare dates across these formats. What is the best approach?

- **A)** Add instructions to the system prompt explaining each tool's timestamp format
- **B)** Implement `PostToolUse` hooks that normalize all timestamps to a consistent format before the model processes them
- **C)** Create a new `convert_timestamp` tool the model can call to convert between formats
- **D)** Update the tool descriptions to specify the expected timestamp format in examples

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Doesn't fix the model's comparison issue | Telling the model about formats doesn't make it better at comparing "1719849600" with "07/01/2024". The model still has to mentally convert formats, which is error-prone. |
| **B ✅** | **BEST** | `PostToolUse` hooks intercept tool results and **transform data before the model processes it**. Normalizing all timestamps to one format (e.g., ISO 8601) means the model receives consistent, directly comparable dates. This is the documented use case for PostToolUse data normalization hooks. |
| **C ❌** | Adds unnecessary tool calls | Creating a conversion tool requires the model to call it for every timestamp, adding latency and relying on the model to recognize when conversion is needed. Programmatic normalization is more efficient. |
| **D ❌** | Doesn't solve comparison problem | Better tool descriptions help the model understand what format to expect but don't help it actually compare "1719849600" with "2024-07-01T12:00:00Z". |

---

#### Q21 (D1 — Fork Session)

You're evaluating two different approaches to refactoring a complex module — Strategy A (extract service) vs Strategy B (extract library). You want to explore both without them contaminating each other's analysis. What's the best approach?

- **A)** Explore both strategies in the same session, asking Claude to "forget" the previous analysis
- **B)** Use `fork_session` to create two independent branches from the current analysis baseline
- **C)** Open two separate Claude Code terminals and start fresh investigations in each
- **D)** Explore Strategy A first, then use `/compact` and explore Strategy B

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Models can't "forget" | The previous analysis is still in context and will influence reasoning about the second strategy. Context contamination is inevitable in the same session. |
| **B ✅** | **BEST** | `fork_session` creates **independent branches from a shared analysis baseline**. Both forks start with the same understanding of the module but explore divergent approaches without contaminating each other. Designed mechanism for parallel exploration. |
| **C ❌** | Loses shared baseline | Starting fresh in separate terminals means re-discovering the codebase twice, wasting time. Fork preserves the shared baseline. |
| **D ❌** | Context contamination | `/compact` reduces context but doesn't eliminate it. Strategy A's analysis will still influence Strategy B's exploration. Residual context → cross-contamination. |

---

#### Q22 (D1 — Dynamic Decomposition)

You're asked to investigate why a production service is experiencing intermittent failures. The initial error logs suggest network issues, but you're not sure of the full scope. Which task decomposition pattern is most appropriate?

- **A)** Prompt chaining: check network logs → check application logs → check database logs → synthesize
- **B)** Dynamic adaptive decomposition: generate initial investigation plan, then adjust based on what each step discovers
- **C)** Single comprehensive investigation prompt covering all possible failure modes
- **D)** Parallel decomposition: simultaneously investigate network, application, and database layers

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Too rigid for open-ended investigation | Prompt chaining follows a fixed sequence, but the investigation might reveal the issue is in the deployment pipeline (not on the checklist). Fixed pipelines miss unexpected root causes. |
| **B ✅** | **BEST** | Dynamic adaptive decomposition generates subtasks **based on what is discovered**, not a predetermined sequence. If network logs reveal a DNS issue, the next step investigates DNS specifically — not generically checking application logs. Ideal for open-ended investigation. |
| **C ❌** | Attention dilution, unfocused | A single prompt trying to check everything produces shallow investigation across all areas rather than deep investigation where it matters. |
| **D ❌** | Wastes resources on unlikely paths | Investigating all three layers simultaneously when logs already suggest network issues wastes time on application and database investigation that's probably irrelevant. Dynamic decomposition starts with the strongest signal. |

---

#### Q23 (D1 — Context Passing)

Your coordinator agent invokes subagent C after subagents A and B have completed. Subagent C needs findings from both A and B to do its work. How should you provide this context?

- **A)** Include subagent A and B's complete findings directly in subagent C's prompt
- **B)** Store findings in a shared database and give subagent C access credentials
- **C)** Pass subagent A and B's agent IDs so subagent C can query them directly
- **D)** Set `inherit_context: true` in subagent C's configuration

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | Subagent context must be **explicitly provided in the prompt**. Including complete findings from A and B directly in C's prompt ensures C has everything it needs. This is the documented approach for context passing between subagents. |
| **B ❌** | Over-engineered | A shared database adds infrastructure complexity and requires credentials management. Direct prompt inclusion is simpler and more reliable for passing findings between subagents. |
| **C ❌** | Violates hub-and-spoke | Subagents should not communicate directly with each other — all inter-agent communication should route through the coordinator. Direct querying breaks the orchestration pattern. |
| **D ❌** | Non-existent | `inherit_context: true` is a fabricated configuration option. Subagents do **not** automatically inherit parent context. Context must be explicitly provided. |

---

#### Q25 (D1 — Coordinator Design)

Your coordinator agent manages 4 subagents for different research domains. For a query about "renewable energy costs," the coordinator always invokes all 4 subagents, even though only the economics subagent and the energy subagent are relevant. How should you improve the coordinator?

- **A)** Hard-code routing rules that map query keywords to specific subagent combinations
- **B)** Design the coordinator to analyze query requirements and dynamically select which subagents to invoke
- **C)** Reduce to 2 subagents by merging pairs to ensure all are always relevant
- **D)** Add a pre-processing step that classifies queries before they reach the coordinator

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Fragile keyword matching | Hard-coded keyword routing is brittle and misses nuanced queries. "What's the environmental impact of solar subsidies" involves economics AND environment but might not contain expected keywords. NL parsing anti-pattern. |
| **B ✅** | **BEST** | Coordinators should analyze query requirements and **dynamically select** which subagents to invoke rather than always routing through the full pipeline. This is a documented best practice for coordinator design. |
| **C ❌** | Loses specialization | Merging subagents reduces specialization and increases each agent's tool count and complexity. The problem is routing, not agent count. |
| **D ❌** | Unnecessary extra layer | The coordinator IS the classification layer — it should be smart enough to route. Adding a separate classifier is redundant and adds latency. |

---

### Domain 2: Tool Design & MCP Integration (10 Questions)

---

#### Q26 (D2 — Tool Descriptions)

Your agent has access to three similar tools: `analyze_content`, `analyze_document`, and `review_document`. Users report that the agent frequently calls the wrong tool. What's the most effective improvement?

- **A)** Rename the tools to more distinct names like `check_grammar`, `extract_metadata`, and `summarize_text`
- **B)** Add a system prompt section listing when to use each tool
- **C)** Split the three tools into purpose-specific tools with clear descriptions, input/output contracts, and explicit boundary statements ("Use THIS for X, NOT for Y")
- **D)** Reduce to one unified `analyze` tool that handles all three cases

**✅ Correct Answer: C**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Names alone insufficient | Renaming helps but tool **descriptions** are the primary selection signal, not names. If descriptions remain vague, the model may still misroute. |
| **B ❌** | Secondary signal | System prompt instructions for tool selection are secondary to tool descriptions. The model primarily uses descriptions for selection decisions. |
| **C ✅** | **BEST** | Clear descriptions with input formats, expected outputs, example use cases, and explicit boundaries ("Use `extract_metadata` for headers/dates/authors, NOT for content summarization") directly address the root cause of misrouting. |
| **D ❌** | Super-tool anti-pattern | A single catch-all tool hides the routing decision inside the tool's implementation rather than giving the model clear choices. Also makes the tool's scope vague. |

---

#### Q27 (D2 — Error Handling)

Your MCP tool encounters a network timeout when calling an external API. The tool currently returns `{"status": "error", "message": "Operation failed"}`. What's the best improvement?

- **A)** Return `{"isError": true, "errorCategory": "transient", "isRetryable": true, "attempted": "GET /api/orders/12345", "partial_results": null, "alternatives": ["Try cached data", "Retry in 30s"]}`
- **B)** Silently return an empty result set to avoid interrupting the agent's workflow
- **C)** Throw an unhandled exception that terminates the current agent turn
- **D)** Return `{"status": "error", "message": "Network timeout. Please try again later."}`

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | Structured error responses with `isError`, `errorCategory`, `isRetryable`, what was attempted, partial results, and alternative approaches enable **intelligent recovery decisions** by the agent. This is the documented MCP error response pattern. |
| **B ❌** | Error suppression anti-pattern | Silently returning empty results disguises failure as "no data found." The agent can't distinguish between "the API timed out" and "there are no orders." Prevents recovery. |
| **C ❌** | Over-reaction | Unhandled exceptions terminate the agent's turn without recovery opportunity. The agent should receive error context and decide how to proceed. |
| **D ❌** | Better but insufficient | A human-readable message ("try again later") helps but lacks structured metadata for programmatic recovery. The agent can't easily determine if it's retryable, what was attempted, or what alternatives exist. |

---

#### Q28 (D2 — Tool Distribution)

Your single agent has access to 18 tools covering customer management, order processing, shipping, billing, analytics, and reporting. Tool selection accuracy has degraded to 60%. What's the best architectural change?

- **A)** Improve all 18 tool descriptions to be more differentiated
- **B)** Split into specialized subagents with 4–5 tools each, coordinated by a hub agent
- **C)** Implement a keyword-based routing layer that pre-selects relevant tools per request
- **D)** Use `tool_choice` forced selection to always pick the most likely tool

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Doesn't address scale issue | Better descriptions help, but 18 tools is simply too many for reliable selection regardless of description quality. The decision complexity exceeds the model's reliable discrimination capacity. |
| **B ✅** | **BEST** | Restricting each subagent to **4–5 tools** relevant to its role dramatically reduces decision complexity. A coordinator routes to the right subagent (customer agent, order agent, shipping agent), each with focused tool sets. This addresses the >5 tools anti-pattern. |
| **C ❌** | NL parsing anti-pattern | Keyword-based routing bypasses the LLM's understanding and is fragile to edge cases. Also doesn't reduce per-agent tool count. |
| **D ❌** | Removes model choice entirely | Forced selection eliminates the model's ability to choose the right tool based on context. It would always call the same tool regardless of the actual request. |

---

#### Q29 (D2 — MCP Configuration)

You're setting up an MCP server for your team's Jira integration. The server needs a `JIRA_API_TOKEN` for authentication. How should you configure this for the team?

- **A)** Hard-code the token in `.mcp.json` and add the file to `.gitignore`
- **B)** Configure the MCP server in `.mcp.json` with `${JIRA_API_TOKEN}` environment variable expansion, with each developer setting the token in their environment
- **C)** Store the token in `~/.claude.json` under the MCP server configuration
- **D)** Create a team-shared API token and distribute it via a secure messaging channel

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Security risk | Hard-coding tokens in configuration files is a security anti-pattern, even with `.gitignore`. Files can be accidentally committed, and tokens shouldn't be in plaintext in any file. |
| **B ✅** | **BEST** | `.mcp.json` supports **environment variable expansion** (e.g., `${JIRA_API_TOKEN}`). The MCP config is version-controlled and shared, while each developer's actual token stays in their environment. Secure credential management without committing secrets. |
| **C ❌** | Wrong scope | `~/.claude.json` is **personal** configuration. Each developer would need to configure the MCP server individually, and it won't be automatically available when new team members clone the repo. |
| **D ❌** | Poor security practice | Distributing shared tokens via messaging is insecure and creates a single point of compromise. Individual tokens with environment variable expansion is more secure. |

---

#### Q30 (D2 — tool_choice)

You're building an extraction pipeline where the first step must always extract metadata before any other processing can begin. The agent has tools for `extract_metadata`, `analyze_content`, and `generate_summary`. How should you ensure metadata extraction happens first?

- **A)** Set `tool_choice: "auto"` and include a system prompt instruction to extract metadata first
- **B)** Set `tool_choice: {"type": "tool", "name": "extract_metadata"}` for the first API call
- **C)** Set `tool_choice: "any"` to force a tool call, trusting the model to pick the right one
- **D)** Remove `analyze_content` and `generate_summary` from the first call's tool list

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Not guaranteed | `tool_choice: "auto"` allows the model to return text instead of calling a tool, or to call a different tool. Prompt instructions are probabilistic — not suitable for mandatory first steps. |
| **B ✅** | **BEST** | **Forced tool selection** (`{"type": "tool", "name": "extract_metadata"}`) guarantees the model calls `extract_metadata` specifically. This is the designed mechanism for ensuring a specific tool is called first. After this call completes, switch to `"auto"` or `"any"` for subsequent steps. |
| **C ❌** | No tool guarantee | `"any"` forces the model to call **some** tool but doesn't control which one. The model might call `generate_summary` instead of `extract_metadata`. |
| **D ❌** | Works but not the designed approach | Removing tools from the list is a workaround. If `extract_metadata` is the only tool, the model might return text instead of calling it (with `"auto"`). Forced selection is more reliable and cleaner. |

---

#### Q31 (D2 — Built-in Tools)

A developer needs to find all React test files in a large monorepo that import a specific testing utility. Which combination of built-in tools is most appropriate?

- **A)** Use Glob to find `**/*.test.tsx`, then Read each file to check imports
- **B)** Use Grep to search for the import statement pattern across the codebase
- **C)** Use Glob to find `**/*.test.tsx`, then use Grep to search within those files for the import pattern
- **D)** Use Bash to run `find` and `grep` commands

**✅ Correct Answer: C**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Expensive | Reading every test file to check imports is wasteful — there could be hundreds of test files. Grep is designed for content search without reading entire files. |
| **B ❌** | Too broad | Grep across the entire codebase might match the import in non-test files. Scoping to test files first is more efficient and precise. |
| **C ✅** | **BEST** | Two-step approach: Glob for file path pattern matching (finding test files) → Grep for content search within those files (finding the import). Each built-in tool used for its designed purpose. Efficient and precise. |
| **D ❌** | BUILT-IN > CUSTOM | Built-in tools (Glob, Grep) are preferred over Bash equivalents when available. They're optimized for the Claude Code environment and provide structured output. |

---

#### Q32 (D2 — MCP Resources)

Your MCP server provides access to a large issue tracking system with 10,000+ issues. Agents frequently make many exploratory tool calls to find relevant issues before beginning their actual work. How can you reduce these exploratory calls?

- **A)** Add a `search_issues` tool with comprehensive search parameters
- **B)** Expose issue summaries as MCP **resources** that the agent can browse as a content catalog
- **C)** Cache the last 100 issues in the system prompt
- **D)** Limit the agent to only accessing issues from the last 7 days

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Still requires exploratory calls | A search tool helps but the agent still needs to make calls to discover what's available. Multiple search queries are needed to find the right issues. |
| **B ✅** | **BEST** | MCP **resources** expose content catalogs (issue summaries, documentation hierarchies, database schemas) that reduce exploratory tool calls. The agent can browse the catalog to understand what's available before making targeted tool calls. This is the designed purpose of MCP resources. |
| **C ❌** | Token waste, stale data | 100 issue summaries in the system prompt wastes tokens on irrelevant issues and becomes stale quickly. Not scalable for 10,000+ issues. |
| **D ❌** | Arbitrary restriction | Time-based filtering may exclude relevant older issues. Doesn't address the fundamental problem of exploratory overhead. |

---

#### Q33 (D2 — Error Response Design)

Your agent queries a customer database and receives no results. The tool returns `{"results": [], "count": 0}`. The agent interprets this as a tool failure and retries 3 times. What's the underlying design issue?

- **A)** The tool should return an error instead of an empty result
- **B)** The tool's response doesn't distinguish between "successful query with no matches" and "query failed"
- **C)** The agent needs better retry logic with exponential backoff
- **D)** The agent's system prompt should explain that empty results are valid

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Wrong direction | An empty result IS a valid successful response — there are legitimately no matching customers. Returning an error for a successful query with no matches would be misleading. |
| **B ✅** | **BEST** | The fundamental issue is **ambiguity** between access failures and valid empty results. The tool should clearly indicate success: `{"status": "success", "results": [], "count": 0, "message": "No customers found matching criteria"}` vs failure: `{"isError": true, "errorCategory": "transient"}`. The agent needs to distinguish "nothing found" from "couldn't look." |
| **C ❌** | Treats symptom | Better retry logic doesn't fix the ambiguity — the agent would still retry successful queries. The tool's response needs to clearly communicate its status. |
| **D ❌** | Secondary fix | Prompt instructions about empty results are fallback, not the primary fix. The tool itself should communicate clearly. Fix the tool, not the prompt. |

---

#### Q34 (D2 — Existing vs Custom MCP Servers)

Your team needs to integrate with Jira for project management. An open-source Jira MCP server exists with 500+ stars on GitHub. A developer proposes building a custom MCP server tailored to your specific Jira workflow. What's the best approach?

- **A)** Always build custom to ensure a perfect fit with your workflow
- **B)** Use the existing community MCP server, extending it only if specific features are missing
- **C)** Build custom but reference the community server's code as a starting point
- **D)** Use both — the community server for basic operations and a custom server for advanced workflows

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Over-engineering | Building a custom server from scratch when a well-maintained community option exists is unnecessary work. "Perfect fit" rarely justifies the maintenance burden. |
| **B ✅** | **BEST** | Choosing **existing community MCP servers over custom implementations** for standard integrations is a documented best practice. Extend only when specific features are genuinely missing. BUILT-IN > CUSTOM. |
| **C ❌** | Still unnecessary custom work | Using the community code as reference is better than starting from scratch but still creates a maintenance fork. Better to use the original and contribute upstream if changes are needed. |
| **D ❌** | Unnecessary complexity | Running two MCP servers for the same service creates confusion about which to use, potential conflicts, and double the maintenance. |

---

#### Q35 (D2 — Tool Naming and Count)

You're designing tools for a document processing agent. The initial design has: `process_document`, `handle_document`, `manage_document`, `document_operation`, and `apply_to_document`. What's the primary problem?

- **A)** Too many tools — agents work best with 1–2 tools
- **B)** Overlapping, ambiguous names make it impossible for the model to distinguish each tool's purpose
- **C)** The tools should be combined into a single `document_tool` with a mode parameter
- **D)** Tool names should include the action type (e.g., `extract_document_metadata`)

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Wrong threshold | Agents work well with 4–5 tools. Five tools isn't too many; the problem is that the five names are nearly synonymous. |
| **B ✅** | **BEST** | The names are so similar (`process`, `handle`, `manage`, `operate`, `apply`) that the model cannot differentiate them. This causes misrouting. Each tool needs a clearly distinct name reflecting its specific purpose plus detailed descriptions. |
| **C ❌** | Super-tool anti-pattern | Combining into a single tool with a mode parameter hides the routing decision and creates a complex, overloaded interface. |
| **D ❌** | Partially correct but incomplete | More specific names help (and D has the right idea) but the **primary problem** being identified is the overlapping ambiguity, not just that names lack action verbs. |

---

### Domain 3: Claude Code Configuration & Workflows (10 Questions)

---

#### Q36 (D3 — CLAUDE.md Hierarchy)

A new developer joins your team, clones the repository, and reports that Claude Code doesn't follow the team's coding standards. Other team members confirm it works correctly for them. Investigation shows the coding standards are defined in `~/.claude/CLAUDE.md` on the original developer's machine. What's the root cause?

- **A)** The new developer needs to install a Claude Code extension
- **B)** The coding standards are in **user-level** configuration (`~/.claude/CLAUDE.md`), which is not shared via version control — they should be in project-level configuration
- **C)** The new developer needs to run `/memory` to load the team configuration
- **D)** Claude Code configuration is cached and requires a restart after cloning

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Wrong diagnosis | Claude Code configuration doesn't require special extensions. The issue is configuration scope, not installation. |
| **B ✅** | **BEST** | `~/.claude/CLAUDE.md` is **user-level** configuration — it only applies to that specific user's machine and is NOT shared via version control. Team standards should be in project-level configuration (`.claude/CLAUDE.md` or root `CLAUDE.md`), which is version-controlled and available to all team members after clone/pull. |
| **C ❌** | Doesn't fix the root cause | `/memory` shows which memory files are loaded but doesn't transfer another user's personal configuration. The fundamental issue is that standards are in the wrong scope. |
| **D ❌** | Fabricated technical detail | Claude Code doesn't cache configuration in a way that requires restarts. It reads configuration files on each session. |

---

#### Q37 (D3 — Rules with Path Scoping)

Your project has Terraform files in `terraform/` and Python files in `src/`. You want Terraform conventions (e.g., "use `count` over `for_each` for simple cases") to load ONLY when editing Terraform files, not Python files. What's the best configuration?

- **A)** Create `terraform/CLAUDE.md` with the Terraform conventions
- **B)** Create `.claude/rules/terraform.md` with YAML frontmatter `paths: ["terraform/**/*"]`
- **C)** Add Terraform conventions to the root CLAUDE.md with a header "## Terraform Rules"
- **D)** Create a skill in `.claude/skills/terraform/` that applies conventions

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Works but less flexible | A subdirectory CLAUDE.md works for files within that directory, but `.claude/rules/` with glob patterns is more maintainable and supports patterns that span multiple directories. |
| **B ✅** | **BEST** | `.claude/rules/` with YAML frontmatter path scoping (e.g., `paths: ["terraform/**/*"]`) loads rules **only when editing matching files**. This reduces irrelevant context and token usage. The designed mechanism for conditional convention loading. |
| **C ❌** | Loads for all files | Root CLAUDE.md loads for every file, wasting tokens on Terraform conventions when editing Python. Also relies on Claude inferring which section applies — EXPLICIT > IMPLICIT. |
| **D ❌** | Wrong mechanism | Skills require manual invocation and are for on-demand tasks, not always-on conventions that should load automatically based on file type. |

---

#### Q38 (D3 — Skills Configuration)

You want to create a codebase analysis skill that produces verbose output (exploring dozens of files, listing all dependencies). You're concerned this will clutter the main conversation. What frontmatter configuration addresses this?

- **A)** `verbose: false` to suppress output
- **B)** `context: fork` to run the skill in an isolated sub-agent context
- **C)** `max_tokens: 500` to limit output length
- **D)** `output: summary` to automatically summarize results

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Non-existent option | `verbose: false` is not a valid skill frontmatter option. Trap answer. |
| **B ✅** | **BEST** | `context: fork` runs skills in an isolated sub-agent context, preventing skill outputs from **polluting the main conversation**. The skill's verbose discovery output stays isolated, and only the summary returns to the main session. Designed for exactly this use case. |
| **C ❌** | Non-existent option | `max_tokens` is not a valid skill frontmatter option. Token limits are API parameters, not skill configurations. |
| **D ❌** | Non-existent option | `output: summary` is a fabricated option. The correct way to isolate verbose output is `context: fork`. |

---

#### Q39 (D3 — Slash Commands: Scope)

You've created a personal productivity command `/quick-test` that generates quick unit tests using your preferred testing style. Your teammates have different preferences and shouldn't see this command. Where should you create it?

- **A)** `.claude/commands/quick-test.md` in the project repository
- **B)** `~/.claude/commands/quick-test.md` in your home directory
- **C)** `.claude/skills/quick-test/SKILL.md` with `personal: true`
- **D)** Add it to your user-level `~/.claude/CLAUDE.md`

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Wrong scope — shared | `.claude/commands/` is version-controlled and shared with all teammates. Your personal testing preferences would affect everyone. |
| **B ✅** | **BEST** | `~/.claude/commands/` is the **user-scoped** command directory. Commands here are personal and not shared via version control. Teammates won't see or be affected by your personal commands. |
| **C ❌** | Wrong mechanism, fabricated option | Skills are not slash commands, and `personal: true` is not a valid skill frontmatter option. |
| **D ❌** | Wrong mechanism | CLAUDE.md is for instructions and context, not command definitions. You can't define executable slash commands in CLAUDE.md. |

---

#### Q40 (D3 — Plan Mode vs Direct)

A developer has a stack trace showing a null pointer exception in `UserService.java` at line 45. The bug is clearly a missing null check. Which approach is most appropriate?

- **A)** Enter plan mode to analyze the codebase architecture before making the fix
- **B)** Use direct execution to add the null check at line 45
- **C)** Use plan mode to explore all callers of the method before fixing
- **D)** Start with plan mode and switch to direct execution after confirming the scope is small

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Over-kill for a clear bug | Plan mode is for complex tasks with multiple valid approaches. A null pointer at a specific line with a clear stack trace is a **well-scoped change** — no architectural exploration needed. |
| **B ✅** | **BEST** | Direct execution is appropriate for **simple, well-scoped changes** with clear scope — adding a null check to a specific line identified by a stack trace. No ambiguity about what to do or where. |
| **C ❌** | Unnecessary exploration | Exploring all callers might be relevant for a systemic issue, but the question describes a clear null check at a specific location. Over-investigation for a simple fix. |
| **D ❌** | Unnecessary overhead | Starting with plan mode just to confirm the scope is small adds overhead when the scope is already stated as clear (single line, specific file, clear stack trace). |

---

#### Q41 (D3 — Iterative Refinement)

Claude Code generates a function, but the output formatting is inconsistent — sometimes it returns dates as "MM/DD/YYYY" and sometimes as "YYYY-MM-DD" despite your instructions saying "use ISO format." Detailed prose instructions haven't fixed the inconsistency. What's the most effective approach?

- **A)** Rephrase the instruction more clearly: "Always format dates as YYYY-MM-DD"
- **B)** Provide 2–3 concrete input/output examples showing the expected ISO date format in context
- **C)** Add a post-processing step that reformats dates
- **D)** Switch to a stronger model that follows instructions more precisely

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Already tried | The question states prose instructions haven't fixed the inconsistency. Rephrasing the same type of instruction is unlikely to help. |
| **B ✅** | **BEST** | **Concrete input/output examples** are the most effective way to communicate expected transformations when prose descriptions produce inconsistent results. Few-shot examples demonstrate the exact format in context, enabling the model to generalize the pattern. Documented as the primary fix for inconsistent formatting. |
| **C ❌** | Treats symptom | Post-processing fixes the output but doesn't teach the model to generate correct output. Adds complexity and doesn't improve the model's behavior for future outputs. |
| **D ❌** | Incorrect assumption | The issue is instruction clarity, not model capability. A stronger model with the same ambiguous instructions may produce the same inconsistency. |

---

#### Q42 (D3 — CI/CD Review)

Your CI pipeline uses Claude Code to review PRs. The same Claude session that generated the code is now reviewing it.  Developers report it almost never finds issues in its own code. What should you change?

- **A)** Add a more critical review prompt: "Be extremely thorough and critical"
- **B)** Use a **separate, independent Claude instance** without the generator's reasoning context to perform the review
- **C)** Increase the model's temperature to introduce variability in review quality
- **D)** Add a "wait 5 seconds" delay between generation and review to reset context

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Doesn't fix the root cause | Prompt emphasis ("be thorough") doesn't overcome the fundamental issue: the model retains its own reasoning context and is unlikely to question its own decisions. |
| **B ✅** | **BEST** | **Same-session self-review** is an explicit anti-pattern. The model retains reasoning context from generation, making it less likely to question its own decisions. An independent review instance without prior reasoning context is more effective at catching subtle issues. ISOLATED > SHARED. |
| **C ❌** | Incorrect mechanism | Temperature affects randomness, not critical evaluation capability. A higher temperature produces more varied but not necessarily more critical reviews. |
| **D ❌** | Technically meaningless | There is no "context reset" from a time delay. The model's context is the conversation history, not a time-based state. The same biased context persists regardless of delays. |

---

#### Q43 (D3 — CI Structured Output)

Your CI pipeline needs Claude Code to output review findings in a machine-parseable JSON format that can be automatically posted as inline PR comments. Which CLI flags should you use?

- **A)** `-p` only, then parse the text output with regex
- **B)** `-p` with `--output-format json` and `--json-schema` to enforce structured output
- **C)** `-p` with `--format json` (shorthand for JSON mode)
- **D)** `-p` with a system prompt saying "respond in JSON format"

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Fragile parsing | Parsing free-text output with regex is fragile and breaks when the model's output format varies. Not reliable for automation. |
| **B ✅** | **BEST** | `-p` for non-interactive mode, `--output-format json` for structured JSON output, and `--json-schema` to enforce a specific schema. This produces **guaranteed machine-parseable** structured output for automated PR commenting. These are the documented CLI flags. |
| **C ❌** | Fabricated flag | `--format json` is not a valid Claude Code CLI flag. The correct flag is `--output-format json`. Trap answer. |
| **D ❌** | Not guaranteed | Prompt-based "respond in JSON" instructions don't guarantee valid JSON or schema compliance. The model might produce markdown-wrapped JSON or extra text. Use the CLI flags instead. |

---

#### Q44 (D3 — @import and Modularity)

Your root CLAUDE.md has grown to 500 lines covering coding standards, testing conventions, API design rules, deployment procedures, and security guidelines. It's becoming hard to maintain. What's the best approach to reorganize?

- **A)** Split into topic-specific files in `.claude/rules/` (e.g., `testing.md`, `api-conventions.md`, `security.md`)
- **B)** Keep the single CLAUDE.md but add better section headers and a table of contents
- **C)** Move everything to subdirectory CLAUDE.md files, one per directory
- **D)** Convert to a structured JSON configuration file

**✅ Correct Answer: A**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ✅** | **BEST** | Splitting into focused topic-specific files in `.claude/rules/` is the documented approach for managing large CLAUDE.md configurations. Each file can have path-scoping to load only when relevant, reducing token waste. Also supports `@import` for cross-referencing. |
| **B ❌** | Doesn't fix the problem | Better organization helps humans but doesn't reduce the token cost of loading 500 lines into every context. The model still processes all 500 lines regardless of which file is being edited. |
| **C ❌** | Wrong granularity | Subdirectory CLAUDE.md files are for directory-specific conventions, not topic-specific rules that may apply across many directories. |
| **D ❌** | Non-existent mechanism | Claude Code uses CLAUDE.md markdown files, not JSON configuration files. |

---

#### Q45 (D3 — Argument Hint)

You've created a skill that requires a specific file path as input. Developers keep invoking it without the required argument, causing errors. What frontmatter option addresses this?

- **A)** `required: true`
- **B)** `argument-hint: "path/to/file"`
- **C)** `validate-args: true`
- **D)** `default-arg: "."`

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Non-existent | `required: true` is not a valid skill frontmatter option. |
| **B ✅** | **BEST** | `argument-hint` prompts developers for required parameters when they invoke the skill without arguments. It shows the expected input format, reducing errors from missing arguments. This is the designed mechanism. |
| **C ❌** | Non-existent | `validate-args: true` is not a valid skill frontmatter option. |
| **D ❌** | Non-existent | `default-arg` is not a valid skill frontmatter option. |

---

### Domain 4: Prompt Engineering & Structured Output (8 Questions)

---

#### Q46 (D4 — Explicit Criteria)

Your code review bot generates too many false positives. It flags minor style issues, local coding patterns, and "potential" issues with low confidence alongside genuine bugs and security vulnerabilities. Adding "be conservative" and "only report high-confidence findings" hasn't helped. What's the best fix?

- **A)** Lower the model's temperature to reduce creative/speculative findings
- **B)** Define **explicit categorical criteria**: report bugs and security issues; skip minor style, local patterns, and speculative findings
- **C)** Use extended thinking to let the model reason more carefully about each finding
- **D)** Train a separate classifier to filter out false positives from the review output

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Temperature doesn't control this | Temperature affects randomness, not the distinction between high-priority bugs and low-priority style issues. Both can be generated at any temperature. |
| **B ✅** | **BEST** | General instructions like "be conservative" fail because they don't define boundaries. **Explicit categorical criteria** ("Report: bugs, security vulnerabilities, data loss risks. Skip: style preferences, local patterns, speculative concerns") give the model clear rules for what to include vs exclude. EXPLICIT > IMPLICIT. |
| **C ❌** | Doesn't address the criteria gap | Extended thinking gives the model more reasoning time but doesn't fix the lack of clear criteria. It might think more carefully about uncertain issues but still doesn't know which categories to report. |
| **D ❌** | Over-engineered | Building a separate ML classifier requires labeled training data and maintenance infrastructure. Fix the prompt first — explicit criteria address the root cause with zero additional infrastructure. |

---

#### Q47 (D4 — Few-Shot Prompting)

Your extraction tool processes invoices from different vendors. Despite detailed instructions, it occasionally fabricates line item details for vendors with non-standard invoice formats (handwritten, informal layouts). What's the most effective improvement?

- **A)** Add validation that checks if extracted totals match line item sums
- **B)** Provide **2–4 few-shot examples** showing extraction from varied invoice formats, including how to handle missing/unclear information
- **C)** Increase max_tokens so the model doesn't truncate extractions
- **D)** Switch to a specialized OCR model for non-standard formats

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Catches only one type of error | Total/line-item validation catches arithmetic mismatches but not fabricated details (a fabricated line item with a fabricated amount can still sum correctly). |
| **B ✅** | **BEST** | Few-shot examples showing varied formats (including informal/handwritten) and how to handle ambiguity (returning null for unclear fields rather than fabricating) directly address the hallucination issue. The model learns the pattern of "when uncertain, leave blank" from examples rather than just instructions. |
| **C ❌** | Wrong problem | Truncation (max_tokens) is not the issue — fabrication is. The model isn't running out of space; it's inventing details for unclear fields. |
| **D ❌** | OCR is upstream | OCR handles text recognition from images. The problem is extraction logic, not text recognition. The model is hallucinating during structured extraction, not during OCR. |

---

#### Q48 (D4 — tool_use Structured Output)

You need Claude to extract structured data from documents and guarantee schema-compliant JSON output. Which approach provides the strongest guarantee?

- **A)** System prompt: "Always respond in valid JSON matching this schema: {...}"
- **B)** Use `tool_use` with a JSON schema definition and set `tool_choice: "any"` to guarantee structured output
- **C)** Use `tool_use` with a JSON schema and post-validate with `strict: true`
- **D)** Parse Claude's text response with a JSON parser and retry on syntax errors

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Not guaranteed | Prompt instructions don't guarantee valid JSON. The model might include explanatory text, markdown code fences, or produce syntax errors. |
| **B ✅** | **BEST** | `tool_use` with JSON schemas **eliminates JSON syntax errors** by design — the model's output is constrained to match the schema. `tool_choice: "any"` guarantees the model calls a tool (producing structured output) rather than returning free text. Combined, this provides the strongest schema compliance guarantee. |
| **C ❌** | Partially right | `tool_use` with a JSON schema is correct, but `strict: true` eliminates syntax errors at the API level — it doesn't need separate "post-validation." The validation is built into the response generation. |
| **D ❌** | Retry-based, not guaranteed | Parsing and retrying catches syntax errors but adds latency and doesn't guarantee semantic correctness. `tool_use` solves this more elegantly. |

---

#### Q49 (D4 — Schema Design: Nullable Fields)

You're extracting invoice data. Some invoices include purchase order (PO) numbers and some don't. How should you design the `po_number` field in your JSON schema?

- **A)** Make `po_number` a required string field with a default value of "N/A"
- **B)** Make `po_number` an **optional (nullable)** field that allows null when the document doesn't contain a PO number
- **C)** Make `po_number` a required field with instructions to "leave blank if not found"
- **D)** Create two separate schemas — one with PO and one without

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Forces fabrication | A required field pressures the model to produce a value even when none exists. "N/A" is better than fabrication but still provides a string where null is more semantically correct. Downstream systems must check for "N/A" as a special case. |
| **B ✅** | **BEST** | Optional/nullable fields allow the model to return `null` when information genuinely doesn't exist in the source, **preventing fabrication**. This is cleaner for downstream processing and accurately reflects the source document's content. |
| **C ❌** | "Leave blank" is ambiguous | "Leave blank" could mean empty string, null, or omitted field. The model may interpret this differently across invocations. Schema-level nullability is more precise than instruction-level guidance. |
| **D ❌** | Over-engineered | Maintaining two schemas doubles the configuration surface and requires logic to choose between them. A single schema with a nullable field handles both cases elegantly. |

---

#### Q50 (D4 — Validation Retry)

Your extraction pipeline validates extracted data against business rules. When validation fails (line items don't sum to total), you retry. After 3 retries, the extraction still fails. Investigation shows the source document has a genuine arithmetic error (the printed total is wrong). What should you conclude?

- **A)** The model needs more retries with error feedback
- **B)** The model is not powerful enough for this extraction task
- **C)** Retries are **ineffective when the required information is absent or incorrect** in the source document — this needs human review routing
- **D)** The validation rule should be loosened to allow small discrepancies

**✅ Correct Answer: C**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | More retries won't help | The data is genuinely wrong in the source. No number of retries can make the model extract a correct total that doesn't exist. Retries fix format/structural errors, not source data errors. |
| **B ❌** | Wrong diagnosis | The model correctly extracted what's in the document — the document itself is wrong. This isn't a capability issue. |
| **C ✅** | **BEST** | Retries are effective for **format/structural errors** (wrong JSON syntax, misplaced fields) but ineffective when the source document itself contains errors. This case requires **human review routing** — the system should flag it for manual inspection rather than retrying indefinitely. |
| **D ❌** | Masks genuine errors | Loosening validation might hide real extraction errors. The validation caught a genuine document issue — that's valuable information, not noise. |

---

#### Q51 (D4 — Multi-Pass Architecture)

A code review of 20 files produces inconsistent findings — the same pattern is flagged in file 3 but approved in file 15. What architectural pattern addresses this?

- **A)** Use a stronger model with better consistency
- **B)** Run the review 5 times and take a majority vote
- **C)** Multi-pass architecture: **per-file local analysis** then a separate **cross-file consistency** pass
- **D)** Sort files alphabetically before processing to ensure consistent ordering

**✅ Correct Answer: C**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Doesn't address attention dilution | The inconsistency comes from processing too many files at once, not model capability. Even a stronger model suffers from attention dilution at 20 files. |
| **B ❌** | Suppresses intermittent findings | Majority voting can filter out real bugs that are only caught intermittently. Reduces sensitivity without addressing root cause. |
| **C ✅** | **BEST** | Per-file analysis ensures consistent depth and evaluation criteria for each file. A separate cross-file pass specifically checks for consistency (same patterns treated the same way). Two-phase approach addresses both attention dilution AND cross-file consistency. |
| **D ❌** | Cosmetic change | File ordering doesn't address the attention dilution that causes inconsistency. The model doesn't become more consistent just because files are alphabetically sorted. |

---

#### Q52 (D4 — Detected Pattern)

Your code review bot generates findings that developers frequently dismiss. You want to analyze which finding categories are most often dismissed to improve precision. What should you add to the review output?

- **A)** A confidence score (1-10) for each finding
- **B)** A `detected_pattern` field in each finding to enable analysis of false positive patterns
- **C)** A severity rating (low/medium/high) based on code impact
- **D)** A reference link to the coding standard each finding relates to

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Model confidence is poorly calibrated | Self-reported confidence scores are unreliable — the model is often confident about false positives and uncertain about real findings. |
| **B ✅** | **BEST** | A `detected_pattern` field (e.g., "unused-import", "missing-null-check", "non-standard-naming") enables systematic analysis of which patterns are most frequently dismissed, allowing targeted precision improvements. This is the documented approach for iterative review quality improvement. |
| **C ❌** | Helpful but different purpose | Severity ratings help developers prioritize but don't enable analysis of false positive patterns. You need to know WHAT type of finding is being dismissed, not just how severe it is. |
| **D ❌** | Traceability feature | Reference links help developers understand why something is flagged but don't enable aggregate analysis of dismiss patterns. Different purpose. |

---

#### Q53 (D4 — Batch API Characteristics)

Which statement about the Message Batches API is correct?

- **A)** It supports multi-turn tool calling within a single batch request
- **B)** It guarantees completion within 1 hour for batches under 100 requests
- **C)** It offers 50% cost savings with processing times up to 24 hours and uses `custom_id` for request/response correlation
- **D)** It automatically retries failed requests within the batch

**✅ Correct Answer: C**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Factually wrong | The batch API does **not** support multi-turn tool calling within a single request. Each batch request is a single-turn interaction. |
| **B ❌** | Factually wrong | There is **no guaranteed latency SLA** — processing can take up to 24 hours. "Often faster" but no guarantee. |
| **C ✅** | **BEST** | Correct on all points: 50% cost savings, up to 24-hour processing window, and `custom_id` fields for correlating batch request/response pairs. These are the key characteristics to memorize. |
| **D ❌** | Factually wrong | The batch API does not automatically retry failed requests. You must handle failures by resubmitting failed documents (identified by `custom_id`) with appropriate modifications. |

---

### Domain 5: Context Management & Reliability (7 Questions)

---

#### Q54 (D5 — Case Facts Block)

Your customer support agent handles multi-turn conversations. After 15+ turns, it loses track of specific details like order numbers, exact refund amounts, and promised delivery dates. Progressive summarization is condensing these into vague summaries. What's the fix?

- **A)** Increase the context window to hold all messages without summarization
- **B)** Extract transactional facts (amounts, dates, IDs, statuses) into a persistent **"case facts" block** that is never summarized
- **C)** Use a database to store all conversation details and retrieve them on demand
- **D)** Reduce the number of turns by forcing resolution within 5 messages

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Doesn't address the problem | A larger context window delays when summarization is needed but doesn't fix the loss of specific details during summarization. Eventually, even large windows fill up. |
| **B ✅** | **BEST** | A persistent **case facts block** (`Order: #12345, Amount: $89.50, Status: shipped, Promised: July 5`) is extracted once and included in every prompt, **outside** the summarized history. Key facts are never condensed. Directly addresses the root cause. |
| **C ❌** | Over-engineered for this use case | A database retrieval system adds infrastructure complexity. The case facts block achieves the same result with zero infrastructure — just prompt engineering. |
| **D ❌** | Harms user experience | Forcing resolution in 5 messages is an arbitrary business constraint that doesn't improve the agent's information retention. Complex issues legitimately require many turns. |

---

#### Q55 (D5 — Lost in the Middle)

You're feeding a research agent findings from 20 sources. Evaluations show the agent reliably cites sources from the first 3 and last 3, but frequently omits findings from the middle 14 sources. What's the best mitigation?

- **A)** Reduce to 6 sources maximum
- **B)** Place a **key findings summary at the beginning** of the aggregated input, with detailed results organized with explicit section headers and priority ordering
- **C)** Randomly shuffle the source order each time
- **D)** Ask the model to process sources one at a time

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Loses coverage | Limiting to 6 sources may miss critical information. The goal is to use all 20 sources effectively, not reduce scope. |
| **B ✅** | **BEST** | The "lost in the middle" effect causes models to process beginning and end positions more reliably. Placing a **key findings summary at the beginning** with organized sections and headers directly mitigates this by surfacing critical information from all sources at a position of high attention. |
| **C ❌** | Random, not systematic | Shuffling means different sources are omitted each run — non-deterministic behavior. Doesn't solve the problem, just randomizes which findings are missed. |
| **D ❌** | Loses synthesis capability | Processing one source at a time prevents the model from making cross-source connections and synthesis. Also extremely slow for 20 sources. |

---

#### Q56 (D5 — Escalation Triggers)

Which of the following is a legitimate escalation trigger in a customer support agent?

- **A)** Customer uses profanity in their message
- **B)** Agent's self-reported confidence score drops below 6/10
- **C)** Customer explicitly requests to speak with a human agent
- **D)** Sentiment analysis detects the customer's tone is "very negative"

**✅ Correct Answer: C**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Sentiment-adjacent trigger | Profanity reflects frustration, not case complexity. An angry customer with a simple order issue should still be resolvable without escalation. |
| **B ❌** | Unreliable proxy | Self-reported confidence scores are poorly calibrated. The agent may be legitimately confident on hard cases and uncertain on easy ones. Not a valid trigger. |
| **C ✅** | **BEST** | **Customer explicitly requests a human** is one of three documented legitimate escalation triggers (along with policy gaps and inability to make progress). This should be honored **immediately** without first attempting to resolve the issue. |
| **D ❌** | Anti-pattern | Sentiment-based escalation doesn't correlate with case complexity. Negative tone ≠ needs human. This is an explicit exam anti-pattern. |

---

#### Q57 (D5 — Context Trimming)

Your agent calls `get_order_details` which returns 40+ fields per order, but only 5 fields are relevant to the current task. Tool results accumulate in context over multiple calls. What should you do?

- **A)** Increase the context window to accommodate the verbose responses
- **B)** **Trim verbose tool outputs** to only relevant fields before they accumulate in context
- **C)** Ask the model to "ignore irrelevant fields" in the tool response
- **D)** Create a new tool that returns only the 5 relevant fields

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Doesn't address waste | A larger context window doesn't fix the fact that 87.5% of each tool response (35/40 fields) is irrelevant noise consuming tokens. |
| **B ✅** | **BEST** | Trimming tool outputs to only relevant fields before they enter context is the documented approach. Each call saves 35 fields × tokens, adding up significantly over multiple calls. Prevents context bloat from irrelevant data. |
| **C ❌** | Prompt-based, still consumes tokens | Even if the model ignores irrelevant fields, **they still consume context tokens**. The data is still there, taking up space. Trimming prevents the token consumption in the first place. |
| **D ❌** | Valid but not always possible | Creating a filtered tool requires backend changes and may not be feasible for all MCP tools (especially third-party ones). Trimming in the orchestration layer is more universal. |

---

#### Q58 (D5 — Scratchpad Files)

Your agent is performing a deep codebase investigation that spans many turns. You notice it starts contradicting earlier findings. What technique helps maintain consistency across long sessions?

- **A)** Periodically restart the conversation and re-discover findings
- **B)** Have the agent maintain **scratchpad files** recording key findings, referencing them for subsequent analysis
- **C)** Increase temperature for more creative exploration
- **D)** Use `--resume` to periodically save and restore the session

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Wasteful, doesn't fix root cause | Restarting loses all accumulated context. Re-discovery wastes time and may produce different (equally contradictory) findings. |
| **B ✅** | **BEST** | **Scratchpad files** persist key findings **outside the context window**, creating a durable record the agent can reference. When context degrades, the scratchpad provides a stable source of truth. Directly counteracts context degradation in extended sessions. |
| **C ❌** | Makes it worse | Higher temperature increases randomness, making contradictions more likely, not less. |
| **D ❌** | Doesn't address context degradation | `--resume` continues the same session with the same (degraded) context. It doesn't reduce context or create external persistence. |

---

#### Q59 (D5 — Human Review Routing)

Your extraction system achieves 97% overall accuracy. Your manager wants to reduce human review to 10% of extractions. Before approving this, what analysis should you perform?

- **A)** Run 100 more test documents to confirm the 97% rate
- **B)** Analyze accuracy by **document type and field** to verify consistent performance across all segments
- **C)** Check if the 97% rate was achieved on the same distribution of documents
- **D)** Survey the human reviewers about their confidence in the system

**✅ Correct Answer: B**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | More of the same | Running more tests with the same aggregate metric doesn't reveal hidden weaknesses. 97% overall could mask 99.5% on common types and 60% on rare types. |
| **B ✅** | **BEST** | **Aggregate accuracy metrics may mask poor performance on specific document types or fields.** Stratified analysis by document type (invoices, receipts, contracts) and field (amounts, dates, names) reveals whether the system performs consistently or if certain segments need continued human review. |
| **C ❌** | Important but insufficient | Distribution analysis is relevant but doesn't reveal per-segment accuracy. Knowing the 97% came from the right distribution doesn't mean all segments perform equally. |
| **D ❌** | Subjective, not data-driven | Reviewer opinions are useful but don't substitute for quantitative accuracy analysis by segment. Data-driven decisions over subjective assessment. |

---

#### Q60 (D5 — Source Provenance)

Your multi-agent research system combines findings from multiple subagents. The synthesis agent produces a report with statistics, but users can't tell which source provided which statistic. Two subagents found conflicting GDP growth figures from different credible sources. What should the synthesis output do?

- **A)** Average the two conflicting figures for the most likely correct value
- **B)** Pick the figure from the more recent source
- **C)** **Annotate both figures with source attribution** and let the coordinator or end user decide how to reconcile
- **D)** Omit the conflicting statistic to avoid presenting inaccurate data

**✅ Correct Answer: C**

| Option | Verdict | Explanation |
|--------|---------|-------------|
| **A ❌** | Mathematically unsound | Averaging conflicting data assumes both are equally valid and that the truth is in between. GDP figures might differ due to different methodologies, time periods, or definitions — averaging is meaningless. |
| **B ❌** | Arbitrary selection | Recency doesn't guarantee accuracy. The older source might use better methodology. Silently picking one value hides the conflict from the user. |
| **C ✅** | **BEST** | The synthesis agent should **preserve both values with source attribution** (Source A: 3.2% GDP, World Bank 2024; Source B: 2.8% GDP, IMF 2024) and annotate the conflict explicitly. This preserves information provenance and lets downstream decision-makers (coordinator or human) reconcile with full context. |
| **D ❌** | Information loss | Omitting data because it's conflicting prevents the user from making informed decisions. Conflicting data from credible sources is important information, not noise. |

---

## Scoring Guide

| Score | Assessment | Recommendation |
|-------|------------|----------------|
| 54–60 (90%+) | **Excellent** — Ready for the exam | Take the official practice exam on Anthropic Academy, then schedule |
| 43–53 (72–88%) | **Passing range** — Solid foundation | Review missed questions, focus on weak domains, retake in 1 week |
| 36–42 (60–70%) | **Close** — Need targeted study | Identify weakest 2 domains, complete relevant Anthropic Academy courses |
| Below 36 (<60%) | **More study needed** | Work through all 5 Anthropic Academy courses, build hands-on projects |

---

## Domain Score Breakdown

Track which domains you miss the most:

| Domain | Questions | Your Score |
|--------|-----------|------------|
| D1: Agentic Architecture (27%) | Q1, Q7, Q9, Q13–Q25 | __/15 |
| D2: Tool Design & MCP (18%) | Q2, Q26–Q35 | __/11 |
| D3: Claude Code (20%) | Q4–Q6, Q10, Q36–Q45 | __/13 |
| D4: Prompt Engineering (20%) | Q11–Q12, Q46–Q53 | __/10 |
| D5: Context & Reliability (15%) | Q3, Q8, Q54–Q60 | __/11 |

---

## Key Patterns to Memorize

### Always Pick Code Over Prompts When:
- Business rule enforcement (financial thresholds, identity verification)
- Tool call sequencing (must do X before Y)
- Data normalization (timestamp formats, status codes)

### Always Pick Explicit Over Implicit When:
- Escalation criteria ("escalate when X" > "be careful about escalation")
- Review criteria ("flag only bugs and security" > "be conservative")
- Tool boundaries ("use for X, NOT Y" > minimal descriptions)

### Always Pick Isolated Over Shared When:
- Code review after generation (separate instance > same session)
- Subagent contexts (explicit passing > automatic inheritance)
- Forked exploration (fork_session > same conversation)

### Trap Answer Patterns:
- **Fabricated features**: `CLAUDE_HEADLESS=true`, `--batch`, `parallel_execution: true`, `inherit_context: true`
- **Sentiment-based anything**: sentiment escalation, tone analysis → always wrong
- **Self-reported confidence**: agent confidence scores → always unreliable
- **Larger model/context as solution**: almost never the right answer for architectural problems

---

## GitHub Study Resources

| Resource | URL | Contains |
|----------|-----|----------|
| schinchli/cloud-certification-exam-prep | https://github.com/schinchli/cloud-certification-exam-prep | Official exam guide PDF, all 12 sample Qs, 4 exercises, cheatsheet, practice questions |
| timothywarner-org/claude-architect | https://github.com/timothywarner-org/claude-architect | Domain-specific study guides, hooks code examples, CLAUDE.md templates, scenario walkthroughs |
| Anthropic Academy | https://anthropic.skilljar.com | Official 60-question practice exam, free courses |
| Claude Documentation | https://docs.anthropic.com | Official API and Claude Code docs |
| MCP Specification | https://modelcontextprotocol.io | Official MCP documentation |

---

*Practice test constructed from the official CCA-F exam guide, Anthropic documentation, and community study materials. Always verify against the latest exam guide at anthropic.skilljar.com.*
