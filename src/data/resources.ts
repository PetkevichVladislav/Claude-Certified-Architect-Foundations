export type Level = 'beginner' | 'advanced' | 'expert'

export interface Resource {
  title: string
  url: string
  source: string
  level: Level
  timeHours: string
  topics: string[]
  description: string
}

export const levelInfo: Record<Level, { label: string; emoji: string; color: string; timeRange: string; description: string }> = {
  beginner: {
    label: 'Foundations',
    emoji: '🟢',
    color: 'border-green-300 bg-green-50',
    timeRange: '40–60 hours',
    description: 'Start here if you have no experience with Claude or the Anthropic API. Build a solid understanding of core capabilities, API fundamentals, and prompting basics before moving to architecture patterns.',
  },
  advanced: {
    label: 'Practitioner',
    emoji: '🟡',
    color: 'border-amber-300 bg-amber-50',
    timeRange: '20–30 hours',
    description: 'Once you can use Claude comfortably, move into advanced skills: agentic architectures, MCP integration, Claude Code workflows, and multi-agent orchestration. This is where exam-specific knowledge starts.',
  },
  expert: {
    label: 'Exam Ready',
    emoji: '🔴',
    color: 'border-red-300 bg-red-50',
    timeRange: '10–20 hours',
    description: 'Final preparation. Master anti-pattern recognition, the decision algorithm, trap identification, and timed practice exams. At this level you should be able to eliminate 2 wrong answers instantly and choose the "best" answer between remaining options.',
  },
}

export const resources: Resource[] = [
  // === BEGINNER ===
  {
    title: 'Claude 101',
    url: 'https://anthropic.skilljar.com/claude-101',
    source: 'Anthropic Academy',
    level: 'beginner',
    timeHours: '4–6',
    topics: ['Claude capabilities overview', 'Basic prompting', 'Using the console'],
    description: 'Official introduction to Claude. Covers what Claude is, what it can do, and how to interact with it effectively through the console.',
  },
  {
    title: 'Building with the Claude API',
    url: 'https://anthropic.skilljar.com',
    source: 'Anthropic Academy',
    level: 'beginner',
    timeHours: '8–12',
    topics: ['Messages API', 'Streaming', 'System prompts', 'Multi-turn conversations', 'D4 foundations'],
    description: 'Core API course. Teaches the Messages API, structured outputs, and system prompt design — directly tested in Domain 4.',
  },
  {
    title: 'Official Claude Documentation',
    url: 'https://docs.anthropic.com',
    source: 'Anthropic',
    level: 'beginner',
    timeHours: '15–20',
    topics: ['API reference', 'Prompt engineering guide', 'Tool use', 'Model capabilities', 'All domains'],
    description: 'The primary source of truth. Every exam question is grounded in official documentation. Read the tool use, prompt engineering, and agent patterns sections carefully.',
  },
  {
    title: 'MCP Specification',
    url: 'https://modelcontextprotocol.io',
    source: 'Anthropic',
    level: 'beginner',
    timeHours: '6–8',
    topics: ['MCP protocol overview', 'Resources', 'Tools', 'Prompts', 'D2 foundations'],
    description: 'Understanding the Model Context Protocol is essential for Domain 2. Start with the overview and architecture sections.',
  },

  // === ADVANCED ===
  {
    title: 'Claude Code in Action',
    url: 'https://anthropic.skilljar.com',
    source: 'Anthropic Academy',
    level: 'advanced',
    timeHours: '6–8',
    topics: ['CLAUDE.md configuration', '-p flag', 'Plan mode', 'Custom commands', 'D3 core'],
    description: 'Directly maps to Domain 3. Covers the CLAUDE.md hierarchy, rules with YAML frontmatter, CI/CD integration with -p flag, and developer workflows.',
  },
  {
    title: 'Introduction to Agent Skills',
    url: 'https://anthropic.skilljar.com',
    source: 'Anthropic Academy',
    level: 'advanced',
    timeHours: '4–6',
    topics: ['Agentic loop', 'Tool orchestration', 'Stop conditions', 'D1 core'],
    description: 'Core Domain 1 material. Teaches the agentic loop (stop_reason → tool_use → tool_result), orchestration patterns, and how to control agent behavior programmatically.',
  },
  {
    title: 'Introduction to Model Context Protocol',
    url: 'https://anthropic.skilljar.com',
    source: 'Anthropic Academy',
    level: 'advanced',
    timeHours: '4–6',
    topics: ['MCP servers', 'Tool integration', 'Resource management', 'D2 core'],
    description: 'Builds on MCP spec knowledge. Practical implementation of MCP servers, tool design best practices, and resource management patterns.',
  },
  {
    title: 'MCP: Advanced Topics',
    url: 'https://anthropic.skilljar.com',
    source: 'Anthropic Academy',
    level: 'advanced',
    timeHours: '4–6',
    topics: ['Sampling', 'Security', 'Advanced tool patterns', 'D2 deep dive'],
    description: 'Advanced MCP patterns: sampling, security considerations, and complex tool interactions. Fills in the gaps for D2 exam questions.',
  },
  {
    title: 'CCA-F Study Guide (paullarionov)',
    url: 'https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.MD',
    source: 'Community (GitHub)',
    level: 'advanced',
    timeHours: '3–5',
    topics: ['All 5 domains', 'Anti-patterns', 'Decision strategies', 'Exam format'],
    description: 'Comprehensive community guide covering all domains, anti-patterns, and exam strategies. Good bridge between official material and exam-specific preparation.',
  },
  {
    title: 'Domain Deep Dives',
    url: 'https://claudecertificationguide.com/learn',
    source: 'Claude Certification Guide',
    level: 'advanced',
    timeHours: '6–10',
    topics: ['Per-domain breakdown', 'Key concepts', 'Practice scenarios', 'All domains'],
    description: 'Structured per-domain breakdown with key concepts, example scenarios, and practice material. Use after completing Academy courses to fill knowledge gaps.',
  },

  // === EXPERT ===
  {
    title: 'Exam Traps & Anti-Pattern Analysis',
    url: 'https://claudecertificationguide.com/learn',
    source: 'Claude Certification Guide',
    level: 'expert',
    timeHours: '4–6',
    topics: ['Trap identification', 'Anti-pattern recognition', 'Fabricated features', 'Decision algorithm'],
    description: 'Deep analysis of exam traps: fabricated features, sentiment-based triggers, and how the exam creates plausible-but-wrong options. Essential for the "elimination" step of the decision algorithm.',
  },
  {
    title: 'Practice Exams (CertSafari)',
    url: 'https://www.certsafari.com/anthropic/claude-certified-architect',
    source: 'CertSafari',
    level: 'expert',
    timeHours: '3–5',
    topics: ['Timed practice', 'Scenario-based questions', 'Score calibration'],
    description: 'External practice exams that simulate the real exam format. Use to calibrate your timing (2 min/question) and identify weak domains.',
  },
  {
    title: 'Practice Test (this app)',
    url: '#test',
    source: 'Built-in',
    level: 'expert',
    timeHours: '2–4',
    topics: ['100+ questions', 'Domain filtering', 'Explanation per option', 'Algorithm trace'],
    description: 'Our built-in practice test with detailed explanations for every option (right and wrong) plus algorithm traces showing the elimination process.',
  },
]
