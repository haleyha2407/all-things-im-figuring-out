---
title: "Abusing Factory, Manager, and Builder"
date: 2026-07-03
category: Bad examples to avoid
excerpt: "Five classes to send one email. A walk through pattern ceremony — and the seam-sized amount of structure the requirement actually justified."
---

## Mistake

Using Factory, Manager, and Builder patterns when the code does not have enough complexity to justify them.

The mistake is not "using design patterns." The mistake is adding layers that do not own a real responsibility.

A pattern is useful only when it removes more complexity than it adds.

## Why this mistake happens

This usually happens when an engineer learns design patterns and starts seeing every problem as a pattern problem. They may think:

> More patterns = more senior code.
> More layers = more flexible design.
> More abstraction = better architecture.

But this is not always true. Sometimes the code only needs:

- A clear function
- A simple class
- A small factory function
- A direct constructor call

The mistake often comes from trying to make the code "future-proof" before there is a real future requirement. This creates unnecessary indirection — the reader has to jump through many files or classes to understand one simple behavior.

## Use case

A backend service needs to send a notification. The system currently supports only email notifications. The requirement is simple:

> Given a user email and a message, send the email notification.

There is no SMS yet. There is no Slack yet. There is no push notification yet. There is no complex setup, no multiple-provider routing, no dynamic runtime selection. The current need is only:

> Create an `EmailNotifier`.
> Call `send()`.

## What he did

The engineer created several layers:

```text
NotificationBuilder
    ↓
NotificationFactory
    ↓
NotificationManager
    ↓
NotificationService
    ↓
EmailNotifier
```

The code looked conceptually like this:

```python
class NotificationBuilder:
    def with_email(self, email: str):
        self.email = email
        return self

    def with_message(self, message: str):
        self.message = message
        return self

    def build(self):
        return {
            "email": self.email,
            "message": self.message,
        }

class NotificationFactory:
    def create_email_notifier(self):
        return EmailNotifier()

class NotificationManager:
    def __init__(self):
        self.factory = NotificationFactory()

    def send_notification(self, notification):
        notifier = self.factory.create_email_notifier()
        notifier.send(notification["email"], notification["message"])

class NotificationService:
    def __init__(self):
        self.manager = NotificationManager()

    def notify_user(self, email: str, message: str):
        notification = (
            NotificationBuilder()
            .with_email(email)
            .with_message(message)
            .build()
        )

        self.manager.send_notification(notification)

class EmailNotifier:
    def send(self, email: str, message: str):
        print(f"Sending email to {email}: {message}")
```

At first glance, this may look "structured." But the structure is mostly ceremony. The real logic is only:

> Send an email.

The code adds many questions:

- Why is there a Builder for two fields?
- Why is there a Factory when there is only one notifier?
- What does Manager own?
- What is the difference between Manager and Service?
- Why is notification represented as a raw dictionary?
- Why do I need five classes to send one email?

The abstraction does not reduce complexity. It creates complexity.

## What he should have done

For the current requirement, a simple design is better:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Notification:
    email: str
    message: str

class EmailNotifier:
    def send(self, notification: Notification) -> None:
        print(f"Sending email to {notification.email}: {notification.message}")

class NotificationService:
    def __init__(self, notifier: EmailNotifier) -> None:
        self.notifier = notifier

    def notify_user(self, email: str, message: str) -> None:
        notification = Notification(email=email, message=message)
        self.notifier.send(notification)
```

Usage:

```python
notifier = EmailNotifier()
service = NotificationService(notifier)

service.notify_user(
    email="user@example.com",
    message="Your report is ready.",
)
```

This is enough. The responsibilities are clear:

- `Notification` — data
- `EmailNotifier` — knows how to send email
- `NotificationService` — owns the use case

There is no Factory because there is only one notifier. There is no Builder because the object has only two simple required fields. There is no Manager because there is no larger lifecycle or coordination problem.

## Nuance: what if future channels are likely but not confirmed?

Sometimes the future requirement is not imaginary. For example, the system currently supports only email, but the team already knows Slack and SMS may be added later. However, those channels depend on Security approval. The approval could happen in two weeks. It could happen in two months. It could also be delayed, changed, or cancelled.

This creates a design nuance. The mistake would be either extreme.

**Bad extreme 1:**

> Ignore the future completely.
> Hard-code everything around email.
> Make adding Slack later painful.

**Bad extreme 2:**

> Build a full Factory + Builder + Manager + Registry system today.
> Add abstractions for Slack, SMS, Push, Teams, and webhooks before any of them are approved.

Both are weak judgment. The better approach is:

- Keep the current implementation simple.
- Create a small seam where the future change is likely.
- Do not build the full future system yet.

A seam means a place in the code where change can happen later without rewriting everything. For this use case, the likely future change is that the notification channel may go from only Email to Email + Slack + SMS. So the code can prepare for that by depending on a simple notifier interface, while still only implementing email today.

```python
from dataclasses import dataclass
from typing import Protocol

@dataclass(frozen=True)
class Notification:
    recipient: str
    message: str

class Notifier(Protocol):
    def send(self, notification: Notification) -> None:
        ...

class EmailNotifier:
    def send(self, notification: Notification) -> None:
        print(f"Sending email to {notification.recipient}: {notification.message}")

class NotificationService:
    def __init__(self, notifier: Notifier) -> None:
        self.notifier = notifier

    def notify_user(self, recipient: str, message: str) -> None:
        notification = Notification(recipient=recipient, message=message)
        self.notifier.send(notification)
```

This design is still simple. There is no Factory yet, no Builder yet, no Manager yet. But the service does not directly depend on `EmailNotifier` — it depends on the concept of a `Notifier`. That means if Slack is approved later, the next version can add:

```python
class SlackNotifier:
    def send(self, notification: Notification) -> None:
        print(f"Sending Slack message: {notification.message}")
```

Then, when there are truly multiple implementations, a small factory function becomes justified:

```python
def create_notifier(channel: str) -> Notifier:
    if channel == "email":
        return EmailNotifier()

    if channel == "slack":
        return SlackNotifier()

    raise ValueError(f"Unsupported notification channel: {channel}")
```

Now the Factory has a reason to exist. It is no longer ceremony because there is real variation.

The key is timing. Before Slack is approved: use a simple interface/seam, implement only Email, and do not build the full multi-channel system. After Slack is approved: add `SlackNotifier`, add channel selection, add a small factory if creation becomes conditional, and add tests for each channel.

This is good engineering judgment because it keeps today's code clean while avoiding a painful rewrite tomorrow. A senior engineer might phrase it like this:

> I know more channels may come later, so I will avoid hard-coding the service directly to email. But I will not build a full provider registry until we actually have more than one approved provider.

This is the middle path:

- No premature architecture.
- No short-sighted hard-coding.
- Just enough seam for a likely change.

## What if the requirement grows?

If the system later supports multiple channels — Email, SMS, Slack, Push — then Strategy or Factory may become useful. A reasonable next version could be:

```python
from typing import Protocol

class Notifier(Protocol):
    def send(self, notification: Notification) -> None:
        ...

class EmailNotifier:
    def send(self, notification: Notification) -> None:
        print(f"Email: {notification.message}")

class SlackNotifier:
    def send(self, notification: Notification) -> None:
        print(f"Slack: {notification.message}")

def create_notifier(channel: str) -> Notifier:
    if channel == "email":
        return EmailNotifier()

    if channel == "slack":
        return SlackNotifier()

    raise ValueError(f"Unsupported notification channel: {channel}")
```

Now the Factory has a reason to exist. It chooses the correct implementation based on the notification channel. The pattern is justified because there is real variation.

## Better principle

Start with the simplest design that clearly expresses the current requirement. Add patterns when the code shows real design pressure.

Good reasons to add a pattern:

- There are multiple implementations.
- Object creation is conditional or duplicated.
- External systems have inconsistent interfaces.
- Testing is hard because dependencies are hidden.
- Business logic is mixed with infrastructure.
- A future change is likely and easy to predict.

Bad reasons to add a pattern:

- It looks more senior.
- It might be useful someday.
- I want to show I know design patterns.
- The code feels too simple.

## Senior review comment

A senior engineer might say:

> This design has too much indirection for the current requirement.
>
> Factory is not needed because there is only one implementation. Builder is not needed because the object is simple. Manager is not needed because it does not own a clear responsibility.
>
> The code would be easier to understand, test, and change with fewer layers. Start simple. Add patterns only when they remove real complexity.

With the future Slack/SMS nuance, a more precise senior review might be:

> It is reasonable to create a seam because more channels may arrive soon. But a seam is not the same as building the full future architecture.
>
> Use a small `Notifier` interface today. Implement `EmailNotifier` today. Add `SlackNotifier` and a factory only when Slack is actually approved.

## Lesson

Patterns are not proof of good design. Clear ownership is.

A design pattern is justified only when it makes the code easier to understand, easier to test, or safer to change. If a pattern only wraps simple code without reducing risk, it is ceremony. Ceremony is not architecture.

Design for the next likely change, not every possible future.
