---
title: "Design Patterns: Reusable Structures for Managing Change"
date: 2026-07-01
category: Engineering Practice
excerpt: "Patterns are tools for managing change, not badges of seniority. When each one earns its place — and when it's just over-engineering."
---

Design patterns are reusable ways to organize code.

They are not rules. They are not decorations. They are not something to add just to make code look senior.

A design pattern is useful when it reduces a real problem:

- Too many conditionals.
- Object creation is messy.
- Business logic is mixed with infrastructure.
- External systems have inconsistent interfaces.
- Code is hard to test.
- Changing one requirement forces edits everywhere.
- Failure handling is scattered.

The goal of design patterns is not to look clever. The goal is to:

- Make the code easier to understand.
- Make the code easier to test.
- Make the code safer to change.
- Make the system easier to operate.

Engineering judgment decides whether a pattern is needed. The pattern gives the structure. The programming language determines how to implement it idiomatically.

## 1. Patterns are solutions to recurring design pressure

A design pattern should answer a specific pressure in the code.

**Bad reason to use a pattern:**

> I want the code to look sophisticated.
> I heard Factory Pattern is good.
> I want to use design patterns in my project.

**Good reason to use a pattern:**

> Object creation is duplicated across the codebase.
> I have multiple interchangeable algorithms.
> External APIs return different shapes but my core logic wants one shape.
> Database details are leaking into business logic.
> Retries and timeouts are implemented inconsistently.

A senior engineer does not ask "which pattern can I use here?" A senior engineer asks:

- What problem is this code starting to have?
- What change is likely?
- What risk am I reducing?
- What complexity am I adding?

Patterns are useful only when the benefit is greater than the added structure.

## 2. Controller / Service / Repository

This is one of the most practical backend patterns. It separates request handling, business logic, and data access.

- **Controller** — receives the request
- **Service** — decides what should happen
- **Repository** — reads/writes data

### Problem it solves

Without this separation, one function may do everything: parse the HTTP request, validate input, apply business rules, query the database, call an external service, format the response, and handle errors. That becomes hard to test and hard to change.

### Better structure

```text
Controller
    ↓
Service
    ↓
Repository
```

For example: `ChatController` receives a request, `ChatService` decides how to process the chat, and `ChatRepository` saves and loads chat history.

### Why it helps

- Controllers stay thin.
- Business logic is testable without HTTP.
- Database logic is isolated.
- Changing storage does not rewrite business rules.

### When to use it

Use this when building APIs, backend services, or applications with real business logic and persistence.

### When not to use it

Do not force this structure onto a tiny script or one-off coding problem where it adds unnecessary ceremony.

**Good judgment:** this pattern is not about creating more files. It is about giving each layer a clear responsibility.

## 3. Strategy Pattern

Strategy Pattern is used when you have multiple interchangeable ways to perform the same kind of operation.

### Problem it solves

Bad pattern:

```python
if provider == "openai":
    call OpenAI
elif provider == "azure":
    call Azure
elif provider == "anthropic":
    call Anthropic
else:
    raise error
```

This becomes messy when the same condition appears in many places.

### Better structure

```text
LLMClient
    OpenAIClient
    AzureClient
    AnthropicClient
```

The service depends on the common interface, not every specific implementation.

### Examples

- Different payment methods
- Different LLM providers
- Different ranking algorithms
- Different file parsers
- Different authentication methods
- Different pricing rules
- Different Tetris scoring rules

### Why it helps

- Removes repeated if/elif logic.
- Makes adding a new implementation safer.
- Makes each implementation easier to test.
- Keeps the main flow clean.

### When to use it

Use Strategy when you have multiple interchangeable behaviors, the caller should not care which implementation is used, and new behaviors are likely to be added.

### When not to use it

Do not use Strategy for two tiny branches that are unlikely to grow. Simple conditionals are fine when the logic is small and local.

**Good judgment:** Strategy is useful when variation is real and recurring. It is over-engineering when variation is imaginary.

## 4. Factory Pattern

Factory Pattern centralizes object creation.

### Problem it solves

Object creation becomes messy when it depends on configuration, environment, provider name, feature flag, input type, credentials, or a runtime condition.

Bad pattern: many parts of the codebase know how to create `OpenAIClient`, `AzureClient`, `AnthropicClient`, and so on. This spreads construction logic everywhere.

### Better structure

`ClientFactory` creates the right client; the service only uses the client.

```python
provider = "azure"
client = LLMClientFactory.create(provider)
```

### Why it helps

- Creation logic is centralized.
- Main flow becomes cleaner.
- Changing construction logic affects one place.
- It pairs well with Strategy.

### When to use it

Use Factory when creating the correct object requires decision logic — for example, creating the correct LLM client from config, the correct parser based on file type, the correct repository based on environment, or the correct notification sender based on channel.

### When not to use it

Do not create a factory for a single simple object. A `UserFactory` that just creates a `User` with a name and email adds nothing if there is no meaningful creation logic.

**Good judgment:** Factory is useful when construction is complex or duplicated. It is unnecessary when direct construction is already clear.

## 5. Adapter Pattern

Adapter Pattern converts one interface into another interface your code expects.

### Problem it solves

External systems often have inconsistent or ugly interfaces. OpenAI returns one response shape, Azure returns another, Anthropic returns another, an SAP service returns another. If your core logic handles all of these directly, it becomes messy.

### Better structure

```text
External API response
    ↓
Adapter
    ↓
Internal response format
```

### Examples

- LLM provider adapters
- Payment gateway adapters
- Database adapters
- Third-party API adapters
- Legacy system adapters
- File format adapters

### Why it helps

- Protects core logic from external mess.
- Keeps provider-specific code isolated.
- Makes external systems easier to replace.
- Makes testing easier.

### When to use it

Use Adapter when an external system does not match your internal model, you want a stable internal interface, or you expect external APIs to change.

### When not to use it

Do not build adapters for internal code that already fits together cleanly.

**Good judgment:** adapters are especially valuable at system boundaries. They keep the messy outside world from leaking into the clean inside model.

## 6. Dependency Injection

Dependency Injection means passing dependencies into a class or function instead of creating them inside.

### Problem it solves

Bad pattern: a service creates its own database client, its own HTTP client, and its own external API client. This makes the service hard to test because it is tightly connected to real infrastructure.

### Better structure

Create the dependency outside, then pass it into the service — for example, `ChatService` receives `ChatRepository` and `LLMClient`.

### Why it helps

- Makes testing easier.
- Makes dependencies explicit.
- Makes replacement easier.
- Reduces hidden coupling.

### Examples

- Pass repository into service.
- Pass HTTP client into API wrapper.
- Pass clock/time provider into time-sensitive logic.
- Pass config into engine.
- Pass logger into service.

### When to use it

Use Dependency Injection when a class depends on external systems or interchangeable components.

### When not to use it

Do not inject every tiny helper function just to be pure. For simple deterministic utilities, direct function calls are fine.

**Good judgment:** Dependency Injection is about making important dependencies visible and replaceable. It should make the code simpler to test, not harder to read.

## 7. DTO / Schema

DTO means Data Transfer Object. A schema defines the shape of data entering or leaving a boundary.

### Problem it solves

Messy input enters the system as raw dictionaries, JSON, strings, or loosely structured data.

Bad pattern — every function reads random keys from a raw dictionary, spread everywhere:

```python
data["user"]["profile"]["id"]
data["message"]
data["metadata"]["model"]
```

### Better structure

```text
Raw input
    ↓
Schema validation
    ↓
Structured object
    ↓
Core logic
```

### Why it helps

- Validates input at the boundary.
- Makes data shape explicit.
- Reduces key errors.
- Documents what the system expects.
- Keeps core logic clean.

### Examples

- Request schema
- Response schema
- Database DTO
- API response model
- Config schema
- Event message schema

### When to use it

Use DTOs or schemas when data crosses a boundary: an HTTP request, an API response, a database record, a message queue event, a file upload, or a config file.

### When not to use it

Do not create DTOs for every tiny local variable.

**Good judgment:** schemas are strongest at boundaries. Inside the system, use structured data that your core logic can trust.

## 8. Middleware

Middleware handles cross-cutting behavior around a request or operation.

### Problem it solves

Some behavior is needed across many endpoints or operations: authentication, authorization, logging, tracing, rate limiting, request validation, error handling, CORS, metrics.

Bad pattern: every controller manually repeats auth, logging, metrics, and error handling.

### Better structure

```text
Request
    ↓
Middleware chain
    ↓
Controller
```

### Why it helps

- Removes duplication.
- Keeps controllers focused.
- Centralizes cross-cutting concerns.
- Makes behavior consistent.

### When to use it

Use Middleware when the same behavior applies broadly across requests or operations.

### When not to use it

Do not hide business logic inside middleware. Middleware should handle cross-cutting concerns, not core decisions.

**Good judgment:** middleware is powerful, but it can make behavior invisible if overused. Use it for consistent system-wide behavior; keep business-specific logic in services.

## 9. Unit of Work / Transaction

Unit of Work groups multiple changes into one consistent operation.

### Problem it solves

A business operation may require several writes — create order, reserve inventory, create payment record, publish event. If one step fails, the system can become inconsistent.

### Better structure

```text
Begin transaction
    perform changes
Commit transaction
or rollback on failure
```

### Why it helps

- Keeps related changes consistent.
- Makes failure behavior explicit.
- Reduces partial-update bugs.
- Clarifies operation boundaries.

### When to use it

Use Unit of Work when multiple writes must succeed or fail together — money transfer, order checkout, inventory reservation, user signup with multiple records, batch update.

### When not to use it

Do not use heavy transaction structures for simple single-write operations.

**Good judgment:** the core question is — what happens if step 3 fails after steps 1 and 2 succeeded? If that creates a bad state, you need a transaction or a compensation strategy.

## 10. Retry + Timeout

Retry and timeout are operational patterns. They make systems more resilient to temporary failures.

### Problem it solves

External calls can fail temporarily: network issue, slow service, rate limit, temporary outage, connection reset.

Bad patterns: call an external service and wait forever, or retry aggressively without limit.

### Better structure

- Set a timeout.
- Retry only safe operations.
- Use backoff.
- Stop after a limit.
- Surface a clear failure.

### Why it helps

- Prevents hanging requests.
- Handles temporary failures.
- Protects downstream systems.
- Makes failure behavior predictable.

### When to use it

Use timeout for almost all external calls. Use retry when the failure is likely temporary, the operation is safe to repeat, and there is a limit and backoff.

### When not to use it

Do not blindly retry non-idempotent operations — charging a credit card twice, creating duplicate orders, sending duplicate emails.

**Good judgment:** before retrying, ask — is this operation safe to repeat? What happens if the first attempt actually succeeded but the response was lost? This connects to idempotency.

## 11. Circuit Breaker

Circuit Breaker prevents a system from repeatedly calling a failing dependency.

### Problem it solves

If an external service is down, repeatedly calling it can waste resources, slow down your own system, increase failure rate, make recovery harder, and overload the dependency even more.

### Better structure

- **Closed** — calls are allowed.
- **Open** — calls are blocked temporarily because failures are too high.
- **Half-open** — test whether the dependency has recovered.

### Why it helps

- Fails fast when a dependency is unhealthy.
- Protects your system.
- Protects downstream systems.
- Improves recovery behavior.

### When to use it

Use Circuit Breaker when calling an unreliable or critical external dependency — payment provider, LLM provider, search service, database proxy, third-party API.

### When not to use it

Do not add circuit breakers to simple in-process code.

**Good judgment:** Circuit Breaker is not about hiding failure. It is about failing predictably instead of letting failures cascade.

## 12. Outbox Pattern

Outbox Pattern helps keep database changes and event publishing consistent.

### Problem it solves

A service often needs to write to a database and publish an event. In the bad situation, the database write succeeds but the event publish fails — now the database says something happened, but other systems never hear about it. The opposite is just as bad: the event publishes but the database write fails, so other systems think something happened while the source of truth disagrees.

### Better structure

```text
Within the same database transaction:
    write business data
    write event to outbox table

Separate worker:
    reads outbox table
    publishes event
    marks event as published
```

### Why it helps

- Keeps state change and event creation atomic.
- Makes event publishing retryable.
- Reduces lost events.
- Improves reliability in distributed systems.

### When to use it

Use Outbox Pattern when reliable event publishing matters — order created, payment completed, user registered, document processed, notification requested.

### When not to use it

Do not use Outbox Pattern for simple scripts or non-critical events.

**Good judgment:** Outbox Pattern exists because distributed systems cannot easily make database writes and message publishing atomic without extra design.

## 13. Idempotency

Idempotency means an operation can be safely repeated and produce the same intended result.

### Problem it solves

Distributed systems often repeat requests: a user double-clicks, a client retries after timeout, a message queue redelivers, a network response is lost, a job restarts midway.

Bad situation: retry creates a duplicate payment, a duplicate order, or a duplicate email.

### Better structure

- Use an idempotency key.
- Check whether the operation already completed.
- Return the previous result instead of doing it again.

### Why it helps

- Makes retries safer.
- Reduces duplicate side effects.
- Improves reliability under failure.

### When to use it

Use idempotency for operations with side effects — create payment, create order, submit form, send message, start job, upload file.

### When not to use it

Pure read operations are usually naturally idempotent.

**Good judgment:** any time you add retry, ask whether the operation is idempotent. Retry without idempotency can make failures worse.

## 14. Pattern combinations

Patterns often work together.

### Strategy + Factory

Use when you have multiple implementations and need to choose one from config: the Factory chooses the correct LLM client, and Strategy lets each LLM client implement the same interface.

### Controller + Service + Repository

Use for backend APIs: the Controller handles HTTP, the Service handles business rules, and the Repository handles persistence.

### Adapter + DTO / Schema

Use at system boundaries: the Adapter calls the external API, the Schema validates and converts the response, and the core logic receives clean internal data.

### Retry + Timeout + Idempotency

Use for external calls and distributed operations: set a timeout so the call does not hang, retry temporary failures, and use idempotency so repeated attempts are safe.

### Transaction + Outbox

Use for reliable event publishing: write business data and the outbox event in one transaction, then publish the event asynchronously after commit.

## 15. Anti-patterns

A pattern becomes an anti-pattern when it adds structure without reducing risk.

### Pattern shopping

- **Bad:** "I want to use Factory, Strategy, and Adapter somewhere."
- **Better:** "I will add a pattern only where the code has a real design pressure."

### Manager / Helper dumping ground

Names like `UserManager`, `ChatHelper`, `DataProcessor`, `CommonUtils` often hide unclear ownership. Better names describe real responsibilities: `UserRepository`, `ChatService`, `MessageParser`, `AccessPolicy`.

### Too many layers

```text
Controller calls Manager.
Manager calls Service.
Service calls Handler.
Handler calls Processor.
Processor calls Helper.
```

If every layer just passes data to the next layer, the structure is fake.

### Over-abstraction too early

- **Bad:** creating interfaces, factories, and plugins before there is actual variation.
- **Better:** start simple; add structure when change pressure appears.

### Business logic in the wrong place

- **Bad:** business rules live in the Controller, the Repository, or the Middleware.
- **Better:** the Service owns business decisions, the Repository owns persistence, the Controller owns request/response, and Middleware owns cross-cutting concerns.

## 16. How to choose a pattern

Before choosing a pattern, ask:

- What is changing?
- What is duplicated?
- What is hard to test?
- What is hard to understand?
- What external dependency am I protecting the core from?
- What failure mode am I trying to handle?
- What is the simplest structure that reduces the risk?

Decision guide:

- Too many interchangeable algorithms? → **Strategy**
- Object creation is messy or config-dependent? → **Factory**
- External interface does not match internal model? → **Adapter**
- Business logic mixed with database access? → **Repository**
- Request handling mixed with business logic? → **Controller / Service / Repository**
- Dependency is hard to replace in tests? → **Dependency Injection**
- Input shape is messy or untrusted? → **DTO / Schema**
- Same request behavior repeated everywhere? → **Middleware**
- Multiple writes must succeed/fail together? → **Unit of Work / Transaction**
- External call may hang or fail temporarily? → **Timeout + Retry**
- Repeated operation may cause duplicate side effects? → **Idempotency**
- State change and event publish must stay consistent? → **Outbox Pattern**
- Failing dependency is causing cascading failures? → **Circuit Breaker**

## 17. Assessment and interview mindset

In interviews and take-home assessments, do not name-drop patterns randomly.

- **Bad explanation:** "I used Strategy, Factory, Adapter, and Repository."
- **Better explanation:** "I separated piece definitions from board behavior so adding a new piece does not require changing collision logic. I kept parsing at the boundary, and the board only operates on validated moves. The board owns state-changing behavior like dropping pieces and clearing rows."

Pattern names are useful, but the reasoning matters more. For a Tetris-style problem, useful design thinking might be:

- Board owns board state.
- Piece is data.
- Parser converts input strings into moves.
- Engine processes moves in order.
- Row clearing is isolated.
- Board width is configurable.

That is more impressive than forcing enterprise patterns into a small simulation.

## 18. Final checklist

Before using a design pattern, ask:

- What problem is this pattern solving?
- What code becomes simpler because of it?
- What future change becomes safer?
- What test becomes easier?
- What complexity am I adding?
- Is the pattern still useful if the project stays small?
- Can I explain the pattern without using the pattern name?

If you cannot explain why the pattern helps, do not use it yet.

## Final principle

Design patterns are not a badge of seniority. They are tools for managing change.

Good engineers know patterns. Strong engineers know when not to use them.

The best pattern is the one that makes the code easier to trust, easier to test, and easier to change.
