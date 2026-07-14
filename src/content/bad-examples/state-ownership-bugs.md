---
title: "Testing: UI Bugs Are Often State Ownership Bugs"
date: 2026-07-03
category: Bad examples to avoid
excerpt: "A Prompt Builder suggestion vanishes after switching conversations. The real bug isn't the UI — it's which layer owns the state."
---

## Product description

**GenAI XL** is an enterprise chat application that lets users interact with LLMs through normal chat, document-based chat, prompt assistance, prompt library, and streaming responses.

The product is state-heavy because users can move between conversations, edit drafts, open dialogs, generate prompts, stop responses, upload files, and refresh the browser while expecting their work to stay consistent.

## Feature description

**Prompt Builder** helps users improve their original chat input before sending it.

User flow:

1. User types a prompt in the chat input.
2. Prompt Builder becomes enabled.
3. User opens Prompt Builder.
4. The dialog shows the original prompt.
5. User can generate suggested prompts.
6. User selects a suggested prompt.
7. User clicks **Send to chat**.
8. The selected prompt appears in the chat input.
9. User can optionally save the selected prompt to Custom Prompt Library.

The expected behavior is that once the suggested prompt is sent to chat, it becomes the current draft for that conversation.

## Bug

**Prompt Builder selected suggestion is lost after switching conversation or refreshing.**

### Steps

1. Open Conversation A.
2. Type `prompt A` in the chat input.
3. Open Prompt Builder.
4. Select a suggested prompt.
5. Click **Send to chat**.
6. Verify the suggested prompt appears in the chat input.
7. Switch to Conversation B.
8. Return to Conversation A, or refresh the page.

### Actual result

The selected suggested prompt disappears.

### Expected result

The selected suggested prompt should remain as the current draft in Conversation A. It should not:

- disappear
- revert to `prompt A`
- get replaced by stale state

## Generalized lesson

This is not just a Prompt Builder bug. It is a **state ownership bug**.

The UI showed the correct value temporarily, but the app likely did not save that value into the real source of truth. A mature software engineer should ask:

> After this UI action works, where is the state stored?

For chat applications, state can exist in many places:

| State type | Example |
| --- | --- |
| Local component state | text currently visible in input |
| Dialog state | selected Prompt Builder suggestion |
| Global app state | current conversation draft |
| Backend state | saved chat history |
| Browser recovery state | what appears after refresh |

The bug likely happened because Prompt Builder updated the visible input, but did not update the conversation-level draft state.

The generalized testing lesson:

> For every feature that changes user input or conversation state, test whether the state survives navigation, refresh, async updates, and cancellation.

The engineering lesson:

> A feature is not complete when the UI looks correct once. It is complete when the correct state is written to the correct source of truth and can be recovered consistently.
