# CLAUDE.md

These are rules, not suggestions. Follow them to produce code that doesn't need rewriting.

## 1. Read Before You Write

Before writing anything:

- Read the files you're about to modify — fully, not skimming
- Check how similar things are done elsewhere and follow those patterns
- Check imports at the top of the file — use the libraries already in the project, don't introduce new ones
- Look at test files to understand actual expected behavior

If you don't see a pattern for something, ask rather than guess.

## 2. Think Before You Code

- **State your assumptions.** If a request is ambiguous, say what you're assuming before you start
- **Name the tradeoffs.** Call out what a design choice costs (complexity, memory, a new dependency)
- **Present 2–3 approaches max** with a recommendation, not an exhaustive survey
- **If something is confusing, stop.** Don't fill confusion with plausible-sounding code

## 3. Simplicity

Write the minimum code that solves this specific problem right now.

- No premature abstractions (EmailService with strategy pattern when `sendWelcomeEmail()` was asked for)
- No speculative error handling for errors that can't happen
- No unnecessary configurability — hardcode until there's a real reason not to
- No dead flexibility — interfaces/base classes with only one implementation

Test: if someone asks "why is this abstracted like this?" and the answer is "in case we need to…", revert it.

## 4. Surgical Changes

Keep diffs as small as possible.

- Don't touch code you weren't asked to touch (weird variable names, typos, import order)
- Match existing style: quotes, casing, semicolons, indentation — consistency beats preference
- Clean up only what your change made dead (unused imports, variables, functions)
- Don't reformat files that weren't formatted with the current formatter

Every changed line should connect directly to what was asked.

## 5. Verification

- **Fix bugs test-first:** write a failing test → fix → watch it pass
- **Run existing tests before and after** your changes; report pre-existing failures
- **Test behavior, not implementation** — test what the code does, not how
- If the architecture makes testing hard, say so — that's a signal worth surfacing

## 6. Goal-Driven Execution

Make success criteria specific before writing code:

- "Add validation" → "reject invalid email with 400, message says what's wrong, tests for both cases"
- "Fix the bug" → "write failing test, make it pass, verify no regressions"
- "Improve performance" → "profile first, identify bottleneck, fix that, measure again"

For multi-step tasks, state the plan and get buy-in before executing.

## 7. Debugging

- **Read the full error message including the stack trace** before generating a fix
- **Reproduce first** — if you can't reproduce it, you can't verify the fix
- **Change one thing at a time** and test after each change
- **Understand the root cause** before adding workarounds — a null check without knowing why it's null is hiding a bug
- If stuck, say what you tried, what you're seeing, and what you suspect

## 8. Dependencies

Before adding a package:

- Can existing project dependencies do it?
- Can the standard library do it?
- Is the package actively maintained?
- Is the size proportionate to the problem?

When you do add one, say why explicitly. Don't silently add to package.json.

## 9. Communication

- Explain what you did and why, not just what
- Flag concerns proactively: "this works but will be slow at scale — want me to batch it?"
- Be precise about uncertainty: "I'm not sure if this supports streaming" not "I think this should work"
- Don't explain things the user already knows — match their demonstrated knowledge level
- Commit messages: specific, not "fix bug"

## 10. Common Failure Modes to Avoid

| Pattern | What it looks like | Rule |
|---|---|---|
| The Kitchen Sink | Restructuring half the codebase when one feature was asked for | Do the one thing |
| The Wrong Abstraction | Generic solution to a problem that exists in one place | Duplicate twice before abstracting |
| The Invisible Decision | Making architectural choices (schema, auth strategy) without flagging them | Flag decisions, they're hard to reverse |
| The Optimistic Path | Perfect happy path, crashes on everything else | Think about 500s, missing files, empty inputs |
| The Knowledge Hallucination | Using APIs or parameters that don't exist | If uncertain about a method signature, check the source |
| The Style Drift | Writing in your preferred style instead of the project's | Match the codebase |
| The Runaway Refactor | One fix cascades to 15 files | Stop, tell the user, get buy-in before continuing |
