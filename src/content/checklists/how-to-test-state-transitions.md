---
title: "Testing: How to Test State Transitions"
date: 2026-07-03
category: Checklists
excerpt: "A repeatable pattern for testing UI state — what was the state before, what action changed it, and does the new state survive navigation, refresh, and async races?"
---

A mature way to test UI is not only "does this button work?" It is: "what state was the app in before, what action changed it, and what state should it be in after?"

Use this model.

## 1. Think in state transitions

Every feature has this shape:

```text
Initial State → User Action → New State
```

Example:

```text
Chat input has prompt A
→ User selects suggested prompt from Prompt Builder
→ Chat input should now contain suggested prompt
```

But for real apps, you need to continue:

```text
New State → Navigate away → Return → State should still be correct
New State → Refresh → State should still be correct
New State → Async response finishes → State should not be overwritten
```

## 2. Test the source of truth

For every state change, ask: where should this state live?

Example for Prompt Builder:

| State | Correct source of truth |
| --- | --- |
| Text user is typing | Conversation draft state |
| Prompt Builder temporary edits | Dialog local state |
| Selected suggestion after "Send to chat" | Conversation draft state |
| Saved custom prompt | Prompt Library/backend |
| Sent message | Chat history/backend |

The bug in the companion post happened because the suggested prompt appeared in the input but was probably not saved to conversation draft state — so it disappeared after navigation or refresh.

## 3. State transition test pattern

Use this checklist for any XL feature.

### A. Start state

What does the app look like before the action?

- Conversation A input = `prompt A`
- Prompt Builder dialog = closed
- Prompt Library checkbox = unchecked

### B. Action

What does the user do?

- Open Prompt Builder
- Select suggestion
- Click **Send to chat**

### C. Immediate expected state

What should happen right away?

- Dialog closes
- Chat input = selected suggestion

### D. Persistence expected state

What should remain true after navigation?

- Switch to Conversation B
- Return to Conversation A
- Chat input still = selected suggestion

### E. Recovery expected state

What should remain true after refresh?

- Refresh page
- Conversation A input still = selected suggestion

## 4. Common state transition tests for XL

For every new feature, test these:

| Test type | Question |
| --- | --- |
| Navigate away/back | Does state survive conversation switch? |
| Refresh | Does state recover correctly? |
| Cancel | Does temporary state get discarded? |
| Confirm/Save | Does committed state persist? |
| Double click | Is the action idempotent? |
| Async race | Does old response overwrite new state? |
| Loading state | Does UI recover after success/failure? |
| Cross-feature | Does this break chat history, prompt library, streaming, files? |

## 5. Mature testing mindset

The junior mindset:

> I clicked the button and it worked.

The mature mindset:

> I clicked the button, the visible UI changed, but I need to verify whether the correct state was committed to the correct store and survives re-render, navigation, refresh, async completion, and error recovery.

That is the key lesson. For XL, your default test pattern should be:

```text
Action → Verify UI → Switch conversation → Return → Refresh → Verify again
```

Especially for anything involving:

- chat input
- draft
- Prompt Builder
- Prompt Library
- uploaded files
- streaming response
- Stop button
- sidebar/history state
