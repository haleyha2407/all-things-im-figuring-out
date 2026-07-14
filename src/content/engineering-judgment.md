---
title: "Engineering Judgment: Writing Code That Is Easy to Trust and Change"
date: 2026-06-30
category: Engineering Practice
excerpt: "Good code isn't code that merely works — it's code another engineer can understand, test, change, and trust. How to think about quality across any language."
---

> 💡 This doc explains how to think about code quality across any programming language.

## Core idea

Good code is not code that merely works.

Good code is code that another engineer can understand, test, modify, debug, and safely extend when requirements change.

The goal is not to look clever. The goal is to make the reviewer, teammate, or future version of yourself think:

> I can trust this code.
> I can change this code without fear.
> I understand why it was designed this way.

Engineering judgment is the ability to choose the right level of structure, abstraction, performance, and documentation for the problem in front of you.

## 1. Code should be easy to understand

Readable code is not "beginner code." Readable code is professional code.

A strong engineer writes code that reveals intent. Someone reading it should understand what the code is trying to do before they inspect every implementation detail.

**Bad signal:**

> The code works, but I need to mentally simulate every line to understand it.

**Better signal:**

> The names, structure, and boundaries explain the design.

Good code usually has:

- Clear names
- Small cohesive units
- Low duplication
- Explicit assumptions
- Simple control flow
- A clear separation between concepts

**Trade-off:** Readable does not mean verbose. Too much ceremony can make code harder to understand. The goal is clarity, not decoration.

## 2. Follow the conventions of the language

Every language has a culture.

A solution can be logically correct but still feel awkward if it ignores the naming, structure, and idioms of the language.

**General rule:** use the naming and style conventions expected by the language community.

Why this matters:

- Other engineers read it faster.
- Code review has less friction.
- Tooling and linters work naturally.
- The code feels native to the ecosystem.
- It signals that you understand more than syntax.

Examples:

- **Python** — `snake_case` for functions and variables
- **JavaScript / TypeScript** — `camelCase` for functions and variables
- **Java / C#** — `camelCase` for methods and variables, `PascalCase` for classes
- **Go** — `MixedCaps` / `camelCase`, with capitalization affecting visibility
- **Rust** — `snake_case` for functions and variables

Bad habit:

- Writing Python like JavaScript.
- Writing JavaScript like Python.
- Writing Go like Java.

**Trade-off:** Language conventions are not morality. They are shared agreements. Break them only when there is a strong reason, not personal preference.

## 3. Keep functions focused

A function should have one clear responsibility.

**General rule:** one function = one reason to change.

**Bad signal:**

> One function parses input, validates data, performs business logic, updates state, handles errors, and formats output.

**Better signal:**

> Each function has a clear job and a clear name.

Example responsibilities:

- parse input
- validate input
- calculate result
- update state
- format output
- persist data
- handle errors

These do not always need separate functions, but they should be conceptually separate.

Why this matters:

- Focused functions are easier to test.
- Focused functions are easier to debug.
- Focused functions are easier to review.
- Focused functions reduce the risk of accidental side effects.

**Trade-off:** Do not split code into tiny functions just to look "clean." Too many small functions can scatter logic and make the reader jump around too much. Good judgment means finding cohesive boundaries.

## 4. Separate data from behavior

Many messy solutions happen because data and behavior are mixed together in an uncontrolled way.

**General rule:** represent the data clearly, then write behavior that operates on that representation.

**Bad signal:**

> The logic has many special cases spread across the code.

Example bad pattern:

```text
If this is piece A, do custom logic.
If this is piece B, do custom logic.
If this is piece C, do custom logic.
```

Better pattern:

- Define the pieces as data.
- Write generic logic that works for any piece.

Why this matters:

- Adding new data should not require rewriting the engine.
- The rules of the system become easier to inspect.
- The behavior becomes easier to test.
- Duplication decreases.

**Trade-off:** Do not create complex abstractions before the problem needs them. Sometimes a simple conditional is fine. The issue is not the existence of conditionals — it is conditionals scattered everywhere with duplicated logic.

## 5. Handle edge cases explicitly

Strong engineers do not only test the happy path.

They ask:

- What can go wrong?
- What is the smallest weird input?
- What boundary can break this?
- What assumption might be false?
- What happens when the system is empty, full, invalid, slow, repeated, or partially failed?

Common edge-case categories:

- Empty input
- Null or missing values
- Invalid values
- Duplicate values
- Boundary values
- Very large input
- Very small input
- Out-of-order input
- Partial failure
- Repeated operation
- Concurrent operation
- Unexpected state

For a simulation problem, examples might include:

- What if the input is empty?
- What if an object is placed at the boundary?
- What if multiple changes happen at once?
- What if one operation affects future operations?
- What if the state grows beyond the expected size?
- What if an invalid command appears?

Good engineering does not mean supporting every possible situation. It means being explicit about what is supported and what is rejected. For example:

- Empty input returns an empty result.
- Invalid input raises an error.
- Unsupported commands are rejected at the boundary.

**Trade-off:** Do not bury the main logic under excessive defensive checks. Validate at the boundaries, then keep internal logic clean.

## 6. Make invalid states hard to represent

A mature design reduces the number of impossible or confusing states that can exist in the system.

**Bad signal:**

> Many combinations of variables are possible, but only some combinations are valid.

**Better signal:**

> The data model makes valid states natural and invalid states difficult.

Examples:

- Use a structured object instead of passing loose values everywhere.
- Use enums or constants instead of random strings.
- Validate input before it enters the core logic.
- Keep ownership of state clear.
- Avoid exposing internal mutable state unnecessarily.

Why this matters:

- Fewer invalid states means fewer bugs.
- The code becomes easier to reason about.
- Tests become more meaningful.
- Future changes become safer.

**Trade-off:** Do not over-model a simple script. Use stronger modeling when the domain has real rules, state transitions, or future extension points.

## 7. Write tests that reveal your assumptions

Tests are not just for proving that code works. Tests communicate how the system is expected to behave.

Weak tests only check the sample input. Strong tests check:

- Normal case
- Empty case
- Boundary case
- Invalid case
- State-changing case
- Regression case
- Multiple operations together

Good tests answer:

- What behavior is guaranteed?
- What assumptions are we making?
- What bugs are we trying to prevent from returning?

**Bad signal:**

> There is one test that happens to pass.

**Better signal:**

> The tests cover the important rules and edge cases of the system.

**Trade-off:** Do not test implementation details too tightly. Good tests should allow refactoring. They should protect behavior, not freeze every internal line of code.

## 8. Be performance-aware without over-optimizing

Engineering maturity means knowing when performance matters and when it does not.

- **Bad signal 1:** ignoring performance completely.
- **Bad signal 2:** making the code complicated for performance that the problem does not need.
- **Better signal:** use an approach that is clearly efficient enough, and explain where it would break if scale increased.

Ask:

- What is the likely input size?
- What operation happens repeatedly?
- What is the bottleneck?
- Is this complexity acceptable?
- What would I change if the input became 100x larger?

Example explanation:

> This approach scans the input once and uses constant-time lookups for state checks. It is efficient enough for the expected input size. If the state became much larger, the next optimization would be to index only the active region instead of scanning everything.

Why this matters:

- It shows you can reason about cost.
- It shows you are not blindly optimizing.
- It shows you understand the system's scale.

**Trade-off:** Simple and correct usually comes before clever and fast. Optimize when there is a real reason.

## 9. Design for reasonable extension

Good code should survive reasonable changes.

Ask:

- If one requirement changes, how many places do I edit?
- If a new type is added, do I add data or rewrite logic?
- If the output format changes, does the core logic stay the same?
- If the configuration changes, is it centralized?

**Bad signal:**

> A small requirement change forces edits across the whole codebase.

**Better signal:**

> Common changes are localized.

For example, if a board width changes from 10 to 12, that should be a configuration change, not a search-and-replace across the codebase. And if a new object type is added, the core engine should not need to be rewritten if the rules are the same.

Why this matters:

- Requirements change.
- Interviewers often add follow-up requirements.
- Production systems evolve.
- Maintainable code reduces future risk.

**Trade-off:** Do not design for every imaginary future. Design for likely extension, not fantasy extension. Good judgment means knowing which changes are realistic.

## 10. Document decisions, not obvious lines

Documentation should explain what the code cannot easily say by itself.

Bad comments repeat the code:

```text
// Increment counter by one.
counter += 1
```

Good comments explain intent:

```text
// Rebuild the state after deletion so later operations see a compact representation.
```

Useful documentation includes:

- Problem summary
- Approach
- Assumptions
- How to run
- How to test
- Important edge cases
- Complexity
- Known limitations
- Design trade-offs

For assessments, a short README is often valuable because it gives the reviewer context before they read the code. A strong README answers:

- What did you build?
- How does it work?
- What assumptions did you make?
- How do I run it?
- How do I know it works?
- What trade-offs did you choose?

**Trade-off:** Too much documentation becomes noise. The best documentation is short, accurate, and useful.

## 11. Prefer simple abstractions that match the problem

Abstraction is not about creating more classes or more layers. Abstraction means naming the real concepts in the problem.

- **Bad abstraction:** `ManagerHelperProcessorFactory`
- **Better abstraction:** `Board`, `Piece`, `Move`, `Parser`, `Validator`, `Renderer`

A good abstraction:

- Has a clear responsibility.
- Matches the domain.
- Reduces duplication.
- Makes change easier.
- Does not hide important behavior.

**Bad signal:**

> The abstraction exists, but nobody knows what it owns.

**Better signal:**

> Each concept owns the behavior naturally related to it.

**Trade-off:** Too little abstraction creates duplication. Too much abstraction creates indirection. Good design sits in the middle.

## 12. Keep configuration centralized

Values that represent rules or configuration should not be scattered throughout the code.

**Bad signal:**

> The same number, string, or rule appears in many places.

**Better signal:**

> Important rules are named once and reused.

Examples:

- Board width
- Maximum retries
- Timeout duration
- Allowed statuses
- Supported commands
- Default page size

Why this matters:

- Centralized configuration reduces mistakes.
- It makes requirement changes safer.
- It makes the code easier to understand.

**Trade-off:** Not every literal needs to become a constant. A value should be named when it represents a meaningful rule, not just because it is a number.

## 13. Validate at the boundary

A clean system keeps messy external input away from the core logic.

**General rule:** validate input when it enters the system, and keep internal logic working with trusted, structured data.

**Bad signal:**

> Every function defensively checks every possible invalid input because no boundary is trusted.

**Better signal:**

> Input is parsed and validated once, then the core logic operates on clean data.

Why this matters:

- The core logic becomes simpler.
- Error handling becomes more consistent.
- Invalid states are caught early.
- Tests are easier to write.

**Trade-off:** Some internal validation may still be useful for safety-critical logic. But do not let validation noise overwhelm the main algorithm.

## 14. Make the main flow obvious

A reviewer should be able to find the main flow quickly.

**Bad signal:**

> The entry point is unclear. Important logic is hidden in random helpers. The reader cannot tell what happens first, next, and last.

**Better signal:**

> The main function reads like a summary of the program.

Example main flow:

```text
parse input
create state
process commands
return result
```

The details can live in smaller functions, but the top-level flow should remain easy to follow.

Why this matters:

- Clear flow makes review faster.
- Clear flow makes debugging easier.
- Clear flow makes onboarding easier.

**Trade-off:** Do not hide all logic behind vague helper names. A helper function should make the flow clearer, not more mysterious.

## 15. Optimize for change, not cleverness

Clever code can be impressive for five minutes and painful for five years.

**Bad signal:**

> The code is short but hard to understand.

**Better signal:**

> The code is clear, correct, and easy to modify.

In interviews and take-home assessments, reviewers usually prefer a simple data model, clear functions, explicit edge cases, good tests, reasonable complexity, and a short explanation over clever tricks.

The strongest signal is not "this person found the shortest solution." The strongest signal is "this person can turn a messy problem into a clean, reliable design."

## Review checklist

Before submitting code, ask:

- Can someone understand the main idea in 2 minutes?
- Are names clear and language-idiomatic?
- Does each function have one clear job?
- Is the data model explicit?
- Are edge cases handled or documented?
- Are invalid inputs rejected clearly?
- Are important constants centralized?
- Are tests covering more than the happy path?
- Is performance good enough for the expected scale?
- Can likely future changes be made safely?
- Is there a short explanation of the approach?

If the answer is mostly yes, the code is not just working. It is engineered.

## Final principle

Engineering judgment is not about blindly following best practices. It is about knowing:

- What matters for this problem?
- What risk am I reducing?
- What complexity am I adding?
- What future change am I making easier?
- What trade-off am I choosing?

Good engineers write code that works.

Strong engineers write code that can be trusted, changed, and operated by other people.
