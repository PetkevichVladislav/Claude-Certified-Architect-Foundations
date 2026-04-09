# CCA-F Decision Tree — Mermaid Diagrams

## How to View These Diagrams

These Mermaid diagrams can be rendered in:
- **VS Code**: Install the "Markdown Preview Mermaid Support" extension
- **GitHub**: Renders natively in `.md` files
- **Online**: Paste into [mermaid.live](https://mermaid.live)

---

## Diagram 1: Master Decision Algorithm

```mermaid
flowchart TD
    START([🎯 Read the Question]) --> S1{STEP 1: Identify Domain}
    
    S1 -->|Agents / Orchestration| D1[Domain 1 — 27%]
    S1 -->|Claude Code Config| D2[Domain 2 — 20%]
    S1 -->|Prompting / Output| D3[Domain 3 — 20%]
    S1 -->|Tools / MCP| D4[Domain 4 — 18%]
    S1 -->|Context / Reliability| D5[Domain 5 — 15%]
    
    D1 --> S2
    D2 --> S2
    D3 --> S2
    D4 --> S2
    D5 --> S2
    
    S2{STEP 2: Eliminate Anti-Patterns\n— Usually kills 2 of 4 options —}
    
    S2 -->|Check each option| AP1{Prompt instructions\nfor business rules?}
    AP1 -->|Yes| KILL1[❌ ELIMINATE]
    AP1 -->|No| AP2{NL parsing for\ncontrol flow?}
    AP2 -->|Yes| KILL2[❌ ELIMINATE]
    AP2 -->|No| AP3{Same-session\nself-review?}
    AP3 -->|Yes| KILL3[❌ ELIMINATE]
    AP3 -->|No| AP4{Agent with\n>5 tools?}
    AP4 -->|Yes| KILL4[❌ ELIMINATE]
    AP4 -->|No| AP5{Sentiment-based\nescalation?}
    AP5 -->|Yes| KILL5[❌ ELIMINATE]
    AP5 -->|No| AP6{Super-agent\nanti-pattern?}
    AP6 -->|Yes| KILL6[❌ ELIMINATE]
    AP6 -->|No| SURVIVE[✅ Option Survives]
    
    SURVIVE --> S3{STEP 3: Apply Priority Rules\n— 2 options left, pick 1 —}
    
    S3 --> R1{Code vs Prompt?}
    R1 -->|One uses hooks/code| PICK_CODE[✅ Pick CODE option]
    R1 -->|Neither| R2{Explicit vs Implicit?}
    R2 -->|One uses stop_reason/schema| PICK_EXPLICIT[✅ Pick EXPLICIT option]
    R2 -->|Neither| R3{Isolated vs Shared?}
    R3 -->|One uses separate instance| PICK_ISOLATED[✅ Pick ISOLATED option]
    R3 -->|Neither| R4{Built-in vs Custom?}
    R4 -->|One uses Anthropic feature| PICK_BUILTIN[✅ Pick BUILT-IN option]
    R4 -->|Neither| R5{Cost-aware vs Brute-force?}
    R5 -->|One is cheaper for scenario| PICK_COST[✅ Pick COST-AWARE option]
    
    PICK_CODE --> S4
    PICK_EXPLICIT --> S4
    PICK_ISOLATED --> S4
    PICK_BUILTIN --> S4
    PICK_COST --> S4
    
    S4{STEP 4: Production Reality Check\nWould this work at 3AM\nwith no engineer?}
    S4 -->|Autonomous, graceful failures, HITL at checkpoints| ANSWER([🏆 SELECT THIS ANSWER])
    S4 -->|Requires manual intervention| RECONSIDER[↩️ Reconsider other option]
    
    style START fill:#1a73e8,color:#fff
    style ANSWER fill:#0d904f,color:#fff
    style KILL1 fill:#d93025,color:#fff
    style KILL2 fill:#d93025,color:#fff
    style KILL3 fill:#d93025,color:#fff
    style KILL4 fill:#d93025,color:#fff
    style KILL5 fill:#d93025,color:#fff
    style KILL6 fill:#d93025,color:#fff
    style SURVIVE fill:#0d904f,color:#fff
    style PICK_CODE fill:#f9ab00,color:#000
    style PICK_EXPLICIT fill:#f9ab00,color:#000
    style PICK_ISOLATED fill:#f9ab00,color:#000
    style PICK_BUILTIN fill:#f9ab00,color:#000
    style PICK_COST fill:#f9ab00,color:#000
```

---

## Diagram 2: Anti-Pattern Recognition Quick Reference

```mermaid
flowchart LR
    subgraph WRONG["❌ ANTI-PATTERNS — Always Wrong"]
        direction TB
        W1["Prompt instructions\nfor business rules"]
        W2["Parse NL for\ncontrol flow"]
        W3["Same-session\nself-review"]
        W4["Agent with\n>5 tools"]
        W5["Sentiment-based\nescalation"]
        W6["Super-agent\nall capabilities"]
        W7["Sequential full-context\npipeline"]
    end

    subgraph RIGHT["✅ CORRECT PATTERNS — Always Better"]
        direction TB
        R1["Programmatic hooks\nPostToolUse, code guards"]
        R2["Check stop_reason\nprogrammatically"]
        R3["Independent review\ninstance"]
        R4["4-5 focused tools\nper subagent"]
        R5["Explicit complexity\ncriteria"]
        R6["Hub-and-spoke\ncoordinator + subagents"]
        R7["Coordinator passes\nrelevant summaries only"]
    end

    W1 -.->|"Replace with"| R1
    W2 -.->|"Replace with"| R2
    W3 -.->|"Replace with"| R3
    W4 -.->|"Replace with"| R4
    W5 -.->|"Replace with"| R5
    W6 -.->|"Replace with"| R6
    W7 -.->|"Replace with"| R7

    style WRONG fill:#fce8e6,stroke:#d93025
    style RIGHT fill:#e6f4ea,stroke:#0d904f
```

---

## Diagram 3: Priority Rules — When 2 Options Both Look Correct

```mermaid
flowchart TD
    STUCK([🤔 Two options both look correct]) --> P1

    P1{Rule 1: CODE vs PROMPTS\nDoes one enforce via code\nand the other via prompt?}
    P1 -->|Yes| PICK1[✅ Pick the CODE option\nHooks > Instructions\nValidation > Description\nstop_reason > NL parsing]
    P1 -->|Both similar| P2

    P2{Rule 2: EXPLICIT vs IMPLICIT\nDoes one use structured/typed fields\nand the other natural language?}
    P2 -->|Yes| PICK2[✅ Pick the EXPLICIT option\nJSON schema > free text\nisError field > error message parsing\nGlob patterns > naming conventions]
    P2 -->|Both similar| P3

    P3{Rule 3: ISOLATED vs SHARED\nDoes one use separate context\nand the other same session?}
    P3 -->|Yes| PICK3[✅ Pick the ISOLATED option\nSeparate reviewer > self-review\nSubagent per task > one agent all tasks\nContext isolation > shared state]
    P3 -->|Both similar| P4

    P4{Rule 4: BUILT-IN vs CUSTOM\nDoes one use Anthropic's\nbuilt-in feature?}
    P4 -->|Yes| PICK4[✅ Pick the BUILT-IN option\n-p flag > custom wrapper\nBatch API > manual batching\nCLAUDE.md > env vars\nMCP servers > custom integrations]
    P4 -->|Both similar| P5

    P5{Rule 5: COST-AWARE vs BRUTE-FORCE\nIs latency not a concern?\nIs this high-volume?}
    P5 -->|Yes| PICK5[✅ Pick the COST-AWARE option\nBatch API: 50% savings\nContext pruning > larger window\nSmaller model ONLY if quality allows]
    P5 -->|Both similar| P6

    P6[Apply the 3AM test:\nWhich works autonomously\nwith graceful failures?]

    style STUCK fill:#1a73e8,color:#fff
    style PICK1 fill:#0d904f,color:#fff
    style PICK2 fill:#0d904f,color:#fff
    style PICK3 fill:#0d904f,color:#fff
    style PICK4 fill:#0d904f,color:#fff
    style PICK5 fill:#0d904f,color:#fff
    style P6 fill:#f9ab00,color:#000
```

---

## Diagram 4: The 6 Exam Scenarios — What Pattern to Apply

```mermaid
flowchart TD
    Q([📋 Read Question Scenario]) --> ID{What type of scenario?}
    
    ID -->|Multiple data sources\nresearch, synthesis| SC1
    ID -->|Document parsing\nJSON extraction| SC2
    ID -->|CI/CD pipeline\nautomation| SC3
    ID -->|Team coding standards\nmonorepo config| SC4
    ID -->|Agent termination\nescalation to human| SC5
    ID -->|High volume processing\ncost concerns| SC6

    SC1["🔬 Multi-Agent Research\n─────────────────\n✅ Hub-and-spoke architecture\n✅ 3-4 tools per subagent\n✅ Parallel execution\n✅ Context isolation\n─────────────────\n❌ Super-agent\n❌ >5 tools per agent\n❌ Sequential pipeline"]

    SC2["📊 Structured Data Extraction\n─────────────────\n✅ Validation-retry loop\n✅ JSON schema enforcement\n✅ strict: true\n✅ Independent reviewer\n─────────────────\n❌ Better prompt examples alone\n❌ Same-session self-review\n❌ NL format description"]

    SC3["🔄 CI/CD Integration\n─────────────────\n✅ -p flag non-interactive\n✅ JSON output format\n✅ Claude Code built-in\n─────────────────\n❌ Plan mode interactive\n❌ Custom API wrapper\n❌ Terminal capture"]

    SC4["👥 Dev Productivity / Config\n─────────────────\n✅ CLAUDE.md hierarchy\n✅ .claude/rules/ + globs\n✅ Root + subdirectory scoping\n─────────────────\n❌ Single root CLAUDE.md only\n❌ Per-developer prompts\n❌ CI/CD env variables"]

    SC5["🚨 Agentic Loop Control\n─────────────────\n✅ stop_reason check\n✅ PostToolUse hooks\n✅ Programmatic escalation\n✅ HITL at checkpoints\n─────────────────\n❌ Sentiment analysis\n❌ Prompt-based rules\n❌ NL output parsing"]

    SC6["💰 Cost Optimization\n─────────────────\n✅ Batch API 50% savings\n✅ Latency-tolerant = Batch\n✅ Context pruning\n─────────────────\n❌ Standard API full price\n❌ max_tokens reduction\n❌ Smaller model if quality needed"]

    style Q fill:#1a73e8,color:#fff
    style SC1 fill:#e8f0fe,stroke:#1a73e8,text-align:left
    style SC2 fill:#e8f0fe,stroke:#1a73e8,text-align:left
    style SC3 fill:#e8f0fe,stroke:#1a73e8,text-align:left
    style SC4 fill:#e8f0fe,stroke:#1a73e8,text-align:left
    style SC5 fill:#e8f0fe,stroke:#1a73e8,text-align:left
    style SC6 fill:#e8f0fe,stroke:#1a73e8,text-align:left
```

---

## Diagram 5: The Agentic Loop — Core Mental Model (65% of the Exam)

```mermaid
flowchart TD
    START([Start]) --> SEND[Send Request to Claude]
    SEND --> CHECK{Check stop_reason}
    
    CHECK -->|stop_reason = end_turn| DONE([✅ Return Final Response])
    CHECK -->|stop_reason = tool_use| EXEC[Execute Tool Call]
    CHECK -->|stop_reason = max_tokens| CONTINUE[Continue Generation\nor Handle Truncation]
    
    EXEC --> HOOK{PostToolUse Hook\nBusiness rule check?}
    HOOK -->|Rule triggered\ne.g. escalation needed| HITL[🧑 Human-in-the-Loop\nApproval / Escalation]
    HOOK -->|No rule triggered| RESULT[Send tool_result\nback to Claude]
    
    HITL -->|Approved| RESULT
    HITL -->|Rejected / Escalated| ESCALATE([🚨 Route to Human Agent])
    
    RESULT --> SEND
    CONTINUE --> SEND
    
    style START fill:#1a73e8,color:#fff
    style DONE fill:#0d904f,color:#fff
    style ESCALATE fill:#d93025,color:#fff
    style HITL fill:#f9ab00,color:#000
    style HOOK fill:#f9ab00,color:#000
```

---

## Diagram 6: Hub-and-Spoke Agent Architecture

```mermaid
flowchart TD
    USER([👤 User Request]) --> COORD

    COORD["🎯 Coordinator Agent\n──────────────────\nRole: Task decomposition\nTools: delegate, summarize\nDecides: which subagent, what context"]

    COORD -->|"Research task\n(summary only)"| SA1["🔍 Research Subagent\n────────────\n3-4 tools:\n• web_search\n• doc_fetch\n• summarize"]
    
    COORD -->|"Data extraction\n(schema + doc)"| SA2["📊 Extraction Subagent\n────────────\n3-4 tools:\n• parse_document\n• validate_schema\n• format_output"]
    
    COORD -->|"Code review\n(diff only)"| SA3["💻 Code Review Subagent\n────────────\n3-4 tools:\n• read_file\n• run_tests\n• lint_check"]

    SA1 -->|"Findings summary\n(not full context)"| COORD
    SA2 -->|"Extracted data\n(validated JSON)"| COORD
    SA3 -->|"Review results\n(pass/fail + issues)"| COORD

    COORD --> RESPONSE([📤 Synthesized Response to User])

    style USER fill:#1a73e8,color:#fff
    style COORD fill:#f9ab00,color:#000
    style SA1 fill:#e8f0fe,stroke:#1a73e8
    style SA2 fill:#e8f0fe,stroke:#1a73e8
    style SA3 fill:#e8f0fe,stroke:#1a73e8
    style RESPONSE fill:#0d904f,color:#fff
```

---

*Render these diagrams in VS Code with the "Markdown Preview Mermaid Support" extension or paste into [mermaid.live](https://mermaid.live)*
