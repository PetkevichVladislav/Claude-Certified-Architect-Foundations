export interface Domain {
  id: string
  name: string
  weight: string
  questions: string
  color: string
  topics: string[]
  description: string
}

export const domains: Domain[] = [
  {
    id: 'D1',
    name: 'Agentic Architecture & Orchestration',
    weight: '27%',
    questions: '~16',
    color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    description: 'The largest domain. Covers how to design, decompose, and orchestrate multi-agent systems. This is where most anti-patterns live.',
    topics: [
      'Agentic loop: stop_reason → tool_use → tool_result cycle',
      'Hub-and-spoke coordinator pattern vs super-agent',
      'Task decomposition into specialized subagents (3-5 tools each)',
      'Programmatic escalation criteria (not sentiment-based)',
      'PostToolUse hooks for deterministic business rule enforcement',
      'Context isolation between agents (summaries, not full context)',
      'Human-in-the-loop gating at critical decision points',
    ],
  },
  {
    id: 'D2',
    name: 'Tool Design & MCP Integration',
    weight: '18%',
    questions: '~11',
    color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    description: 'How to design tool schemas, write descriptions that guide selection, and integrate MCP servers for cross-application interoperability.',
    topics: [
      'Tool descriptions as primary selection mechanism for the model',
      'tool_choice modes: auto, any, forced (specific tool)',
      'MCP protocol: resources, tools, prompts, sampling',
      'isError / isRetryable fields in MCP tool responses',
      'Input validation and structured error responses',
      'Tool count: 4-5 per agent for reliable selection',
      'Resource URIs and templating in MCP',
    ],
  },
  {
    id: 'D3',
    name: 'Claude Code Configuration & Workflows',
    weight: '20%',
    questions: '~12',
    color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    description: 'Practical Claude Code usage — configuration hierarchy, rules, CI/CD integration, and developer workflows.',
    topics: [
      'CLAUDE.md hierarchy: ~/.claude/ (user) → project root → subdirectory',
      '.claude/rules/ with YAML frontmatter and path: glob patterns',
      '-p flag for non-interactive CI/CD mode',
      'Plan mode (--plan) for architecture and code review',
      'context: fork in skill frontmatter to isolate verbose output',
      'Scratchpad files for persisting findings outside context window',
      'Slash commands vs custom commands',
    ],
  },
  {
    id: 'D4',
    name: 'Prompt Engineering & Structured Output',
    weight: '20%',
    questions: '~12',
    color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    description: 'Advanced prompting techniques and how to extract structured, validated data from Claude.',
    topics: [
      'tool_use + JSON schema for structured extraction',
      'Validation-retry loops (not just "better prompts")',
      'Nullable fields for optional structured data',
      'Few-shot examples: when they help vs when they add overhead',
      'System prompt design: role, context, constraints, output format',
      'Case facts block: extract transactional details, never summarize',
      'Batch API: 50% cost savings, 24h window, custom_id correlation',
    ],
  },
  {
    id: 'D5',
    name: 'Context Management & Reliability',
    weight: '15%',
    questions: '~9',
    color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    description: 'Managing context windows, ensuring reliability in production, and building trustworthy agent systems.',
    topics: [
      'Context window management: pruning, summarization, forking',
      'Independent review instances (not same-session self-review)',
      'Explicit escalation criteria with examples',
      'Provenance tracking in multi-agent systems',
      'Error handling: graceful degradation, retry strategies',
      'Monitoring and logging for agent reliability',
      'Token budgeting and cost optimization',
    ],
  },
]
