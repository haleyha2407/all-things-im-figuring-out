---
title: "Adding Destination Service as a Runtime Dependency for ADB Jobs"
date: 2026-07-03
category: Bad examples to avoid
excerpt: "Reusing a service that works great for short app requests inside a long-running batch job — and learning that the same dependency has a different blast radius depending on where it sits."
---

## Mistake

Using Destination Service from an ADB pipeline as the runtime mechanism for retrieving Document Grounding configuration and credentials.

The mistake was not "Destination Service is bad." The mistake was assuming that because Destination Service works well for the XL application, it should also be used by the ADB pipeline.

Same dependency, different runtime context, different risk.

## Why this mistake happens

This mistake happens when an engineer optimizes for consistency and centralized configuration, but underestimates operational coupling.

The thinking was reasonable:

> XL already calls services through Destination Service.
> ADB now needs to support 5 resource groups.
> Each resource group has its own credentials.
> Managing 5 sets of ADB secrets feels duplicated and messy.
> Destination Service already centralizes destinations.
> So ADB should also read from Destination Service.

That logic is attractive because it seems to reduce duplication. It also makes the architecture look consistent:

> XL app uses Destination Service.
> ADB pipeline also uses Destination Service.
> All external service configuration lives in one place.

The missing question was:

> Should a long-running ADB job depend on Destination Service during file processing?

This is where the design risk appears.

## Use case

XL is a chatbot application. A user uploads a large file from the XL application. The upload triggers an ADB pipeline to process the file and call Document Grounding.

Originally, there was only one resource group. So the setup was simple:

```text
XL application
    ↓
Destination Service
    ↓
Document Grounding

ADB pipeline
    ↓
Resource group credentials directly
    ↓
Document Grounding
```

This was acceptable because ADB only needed one set of credentials.

Later, the system expanded from 1 resource group to 5 resource groups. Now ADB needs to know which resource group to use and how to access each one. That means ADB needs configuration such as:

- `client_id`
- `client_secret`
- `token_service_url`
- `document_grounding_url`
- `ai_resource_group`

for each resource group. This created a design question:

> Should ADB manage 5 sets of secrets directly, or should ADB reuse Destination Service like XL does?

## What I wanted to do

I wanted ADB to call Destination Service to retrieve the right Document Grounding destination configuration for each resource group. The intended flow was:

```text
XL user uploads large file
    ↓
XL triggers ADB job
    ↓
ADB calls Destination Service
    ↓
ADB retrieves destination config/token for the selected resource group
    ↓
ADB calls Document Grounding
    ↓
ADB processes the file
```

The intended benefits were:

- Reuse the same destination setup as XL.
- Avoid storing 5 sets of credentials separately in ADB.
- Centralize resource group configuration.
- Reduce duplicated secret management.
- Make it easier to add or update resource groups.

This looked like a clean loose-coupling solution. But it also changed the ADB runtime dependency chain to:

```text
ADB pipeline
    ↓
Destination Service
    ↓
Document Grounding
```

instead of:

```text
ADB pipeline
    ↓
Document Grounding
```

## My flawed assumption

My mistake was thinking:

> If Destination Service fails, then XL fails anyway. So it should be okay for ADB to use it too.

That sounds logical at first, but it misses an important operational detail. The real question is not only "what fails if Destination Service fails?" The better questions are:

- How long does it fail?
- When does it fail?
- What work is already in progress when it fails?
- Can the system recover cleanly?

A short Destination Service issue affects XL and ADB differently.

For XL:

- A user request may fail quickly.
- The user can retry.
- The failure is visible immediately.
- The request usually has little partial progress.

For ADB:

- A large file job may already be running.
- Some chunks may already be processed.
- The job may fail halfway through.
- Retry may require cleanup, deduplication, or resume logic.
- The user may not know exactly what happened.

So the statement "if Destination Service fails, everything fails anyway" is too broad. A better framing is:

> The same dependency can have different blast radius depending on where it sits in the workflow.

For a short request, a dependency failure may be annoying but contained. For a long-running job, a dependency failure can waste work, leave partial state, and create recovery complexity.

## Why the senior disagreed

The senior was likely thinking about runtime failure, not just configuration cleanliness. XL app requests and ADB jobs behave differently.

An XL request is usually short-lived:

- User sends request.
- XL calls Destination Service.
- XL calls target service.
- Request succeeds or fails quickly.

An ADB pipeline is different:

- User uploads large file.
- ADB job starts.
- File processing may take minutes.
- The job may process many chunks.
- Partial progress may already exist.
- A failure halfway through is more expensive.

If ADB depends on Destination Service during processing, then Destination Service becomes part of the critical path for the job. That means an issue in Destination Service can break the ADB job even if Document Grounding itself is healthy.

Possible failure cases:

- Destination Service is temporarily unavailable.
- Destination lookup fails.
- Token retrieval through Destination Service fails.
- Destination configuration is wrong for one resource group.
- The job starts successfully but fails later during refresh or another lookup.

The operational concern is that a short Destination Service issue can interrupt a long-running file processing job. That is a different risk profile from a short XL application request.

## What I should have done

The safer design is for ADB to use its own direct configuration for Document Grounding resource groups. ADB can store the required values in ADB secret scopes or job configuration. The runtime flow becomes:

```text
XL user uploads large file
    ↓
XL triggers ADB job with selected resource group
    ↓
ADB reads required secrets/config from ADB secret scope
    ↓
ADB requests token directly from token service
    ↓
ADB calls Document Grounding directly
    ↓
ADB processes the file
```

The dependency chain stays simpler:

```text
ADB pipeline
    ↓
Document Grounding
```

instead of adding:

```text
ADB pipeline
    ↓
Destination Service
    ↓
Document Grounding
```

For 5 resource groups, use a structured ADB config:

```yaml
resource_groups:
  - name: rg_1
    client_id_secret: dg_rg_1_client_id
    client_secret_secret: dg_rg_1_client_secret
    token_url_secret: dg_rg_1_token_url
    dg_url_secret: dg_rg_1_url
    ai_resource_group: rg_1

  - name: rg_2
    client_id_secret: dg_rg_2_client_id
    client_secret_secret: dg_rg_2_client_secret
    token_url_secret: dg_rg_2_token_url
    dg_url_secret: dg_rg_2_url
    ai_resource_group: rg_2
```

This still keeps the design organized. It does not mean hard-coding credentials. It means ADB owns the configuration it needs to run reliably.

## Nuance: what if we expand to 50 resource groups?

This is the strongest counterargument. If there are only 5 resource groups, managing ADB secrets directly is annoying but manageable. If there are 50 resource groups, direct manual secret management becomes painful and error-prone.

But the answer is still not automatically "use Destination Service at ADB runtime." The better question is:

> How do we scale configuration management without adding runtime dependency risk?

For 50 resource groups, the design should separate two concerns:

- **Configuration management** — how do we create, update, validate, and rotate 50 sets of credentials?
- **Runtime execution** — what dependencies must be healthy while the ADB job is processing a large file?

Using Destination Service at runtime solves configuration centralization, but it also puts Destination Service in the critical path. A better design may be to use automation to manage ADB secrets/config for 50 resource groups, and keep ADB runtime direct. For example:

- **Source of truth** — resource group config file, secure config store, or deployment metadata.
- **Deployment/setup step** — script syncs resource group configs into ADB secret scopes.
- **Validation step** — script tests token retrieval and Document Grounding access for each resource group.
- **Runtime step** — ADB reads its local secret scope/config and calls Document Grounding directly.

This gives both scalable management for 50 resource groups and no extra Destination Service dependency during job execution. A possible structure:

```text
rg_config.yaml
    ↓
sync_adb_secrets.py
    ↓
ADB secret scopes
    ↓
ADB job runtime
    ↓
Document Grounding
```

The key design move is:

> Move complexity to deployment/configuration time, not long-running job runtime.

That way, if the config sync fails, the job does not start with bad assumptions. If a resource group is missing or invalid, the validation step catches it before users trigger large file processing.

For 50 resource groups, also consider:

- Standard naming conventions for secrets.
- Automated secret rotation.
- Connection validation before release.
- Clear mapping from resource group to credential set.
- Monitoring for per-resource-group failures.
- A fallback or disable flag for unhealthy resource groups.

The senior-level answer is not "never use Destination Service." It is:

> Do not put Destination Service in the ADB job runtime path unless its runtime availability is worth the risk.

For 50 resource groups, the system needs better automation, not necessarily another runtime dependency.

## Nuance: why my idea was not stupid

The original idea solved a real pain. Managing 5 sets of secrets is annoying. Managing 50 sets would be much worse. Duplicating configuration between XL and ADB feels messy.

Using Destination Service looked attractive because:

- XL already uses it.
- It centralizes destinations.
- It avoids repeating endpoint and credential setup.
- It makes adding resource groups feel cleaner.
- It keeps configuration outside the ADB code.

Those are valid engineering goals. The issue is that the solution optimized for configuration cleanliness but increased runtime dependency risk. This is the key nuance:

> Centralized configuration can reduce maintenance cost, but it can also increase runtime coupling.

A senior engineer may accept that trade-off for short-lived app requests. They may reject it for long-running batch jobs.

## Better principle

Consistency across systems is valuable, but not always more important than reliability.

The better question is not "XL uses Destination Service, so should ADB also use it?" The better question is:

> Does ADB have the same runtime behavior and failure tolerance as XL?

In this case, no. XL and ADB are part of the same product flow, but they do not have the same operational profile.

- **XL request path** — short-lived, user-facing, already built around Destination Service.
- **ADB pipeline** — longer-running, file-processing, more sensitive to mid-job dependency failure.

So they may need different dependency choices.

## Senior review comment

A senior engineer might say:

> I understand why you want to reuse Destination Service. XL already uses it, and ADB now needs multiple resource group configurations.
>
> But ADB is not the same runtime as XL. For XL, Destination Service is part of the normal short request path. For ADB, adding Destination Service means every long-running file processing job now depends on another service being healthy. If Destination Service has a temporary issue, the job can fail even if Document Grounding itself is available.
>
> The question is not just whether Destination Service can fail. It is how long it fails, when it fails, and what partial work exists at that moment.
>
> If we grow from 5 to 50 resource groups, we should improve secret/config automation rather than automatically putting Destination Service in the job runtime path. Use ADB secret scopes or job configuration for the resource groups. Automate the setup and validation. Keep the ADB runtime path direct.

## What a better design could look like

Instead of using Destination Service at runtime, separate the concerns:

- **Configuration management** — automate how the resource group secrets/configs are created, updated, validated, and rotated.
- **Runtime execution** — ADB reads from its own secret scope/config and calls Document Grounding directly.

This gives you both less manual secret management and fewer runtime dependencies. A better solution could be:

- Maintain a resource-group config file or deployment script.
- Use automation to upsert ADB secrets for each resource group.
- Validate each resource group connection before deployment.
- At runtime, ADB only reads local ADB secrets/config.

This addresses the original pain without putting Destination Service in the job's critical path.

## Lesson

The mistake was not misunderstanding Destination Service. The mistake was treating consistency as automatically better than reliability. A design can look cleaner and still be operationally weaker.

Important questions:

- Is this dependency needed at runtime?
- Is it in the critical path?
- What happens if it fails halfway through the job?
- How long can it fail?
- Can the job resume safely?
- Does this system have the same failure tolerance as the app request path?
- Can configuration be centralized without adding a runtime dependency?
- If the number of resource groups grows, can automation solve the management pain instead?

The deeper lesson:

> Loose coupling is not only about where configuration lives. Loose coupling is also about failure isolation.

Architecture is not only about reducing duplication. Architecture is also about deciding which failures you are willing to depend on.
