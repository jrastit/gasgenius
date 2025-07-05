# @1inch-community/core

The core module is designed to address utility problems in development and includes logic for the
interaction between the application and the runtime environment (web browser/web view). It also
handles global application styling and localization. This module does not contain any business logic
and is composed of the following submodules:

## Submodules

- **[animations](src/lib/animations)**: Implements utility functions for animations.

- **[async](src/lib/async)**: Implements methods for working with asynchronous interrupts.

- **[application-context](src/lib/application-context)**: Implements the application context based
  on the
  [IApplicationContext interface](../models/src/lib/application-context/application-context.interface.ts).
  It also provides tokens for injecting `IApplicationContext` and `EmbeddedBootstrapConfig` through
  [lit/context](https://lit.dev/docs/data/context/).

- **[cache](src/lib/cache)**: Implements various types of caches to optimize different aspects of
  the application's performance.

- **[database](src/lib/database)**: Provides utilities for database operations.

- **[decorators](src/lib/decorators)**: Contains various decorators aimed at optimizing different
  aspects of the application.

- **[environment](src/lib/environment)**: Implements environment variables for web environments,
  considering embedded scenarios.

- **[formatters](src/lib/formatters)**: Contains various functions for formatting data.

- **[lazy](src/lib/lazy)**: Implements utilities for lazy loading of components and modules.

- **[lit-utils](src/lib/lit-utils)**: A submodule designed to simplify various aspects of working
  with Lit. It also implements an i18n translation system compatible with Lit.

- **[math](src/lib/math)**: A submodule implementing methods for working with `bigint` considering
  decimal points.

- **[random](src/lib/random)**: Contains implementations of methods for generating various random
  data.

- **[sentry](src/lib/sentry)**: Provides integration with Sentry for error tracking.

- **[settings](src/lib/settings)**: Implements a settings controller based on the
  [ISettingController interface](../models/src/lib/settings/setting.controller.ts).

- **[storage](src/lib/storage)**: Implements a controller for working with synchronous storage based
  on the [IPersistSyncStorage interface](../models/src/lib/storage/storage-manager.ts).

- **[theme](src/lib/theme)**: Implements logic for handling global application styles and themes.

- **[turnstile](src/lib/turnstile)**: Provides integration with Cloudflare Turnstile for bot
  protection.

- **[utils](src/lib/utils)**: Contains a set of various methods that simplify development.

## Purpose

The `@1inch-community/core` module is focused on solving utility-level challenges in the development
process. It ensures smooth interaction between the application and its environment, manages global
styling and localization, and provides essential tools to optimize and streamline various tasks.
While it does not include business logic, it is foundational for creating a cohesive and
well-structured application.
