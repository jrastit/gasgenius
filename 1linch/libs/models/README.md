# @1inch-community/models

The `@1inch-community/models` module contains a basic set of models designed to facilitate loose
coupling between application modules. This module is monolithic and contains little to no logic.

## Purpose

The primary purpose of the `@1inch-community/models` module is to provide a foundational structure
for the application, enabling different modules to interact seamlessly without being tightly bound.
This approach ensures that the application remains flexible and modular, allowing for easier
maintenance and extension.

## Features

- **Loose Coupling**: The models in this module enable smooth interactions between different parts
  of the application without creating strong dependencies.
- **Monolithic Structure**: Although monolithic in nature, this module is streamlined and
  lightweight, focusing solely on providing necessary interfaces and models.

## Key Submodules

- **api**: Contains interfaces and types for API interactions, particularly with the 1inch Dev
  Portal.

- **application-context**: Defines the application context interface used throughout the
  application.

- **chain**: Provides models related to blockchain networks, including chain IDs and configurations.

- **embedded**: Contains models specific to the embedded integration strategy.

- **i18n**: Defines interfaces for internationalization and localization.

- **settings**: Contains interfaces for application settings management.

- **swap**: Provides models related to token swaps, including swap parameters and results.

- **token**: Contains models for tokens, including token metadata and balances.

- **wallet**: Defines interfaces for wallet connections and interactions.

The `@1inch-community/models` module plays a critical role in maintaining the modular architecture
of the application, ensuring that different components can work together efficiently while remaining
decoupled.
