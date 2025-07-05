# 1inch Community Swap Interface

This project implements a swap interface and SDK based on the 1inch Fusion protocol. The goal is to
make the token exchange process more transparent, secure, and user-friendly. The project also allows
embedding the swap form directly into other applications, greatly improving the user experience.

You can view the latest version [here](https://1inch-community.github.io/interface/)

## Table of Contents

1. [Project Structure](#project-structure)
   - [Core](#core)
   - [Integration Layer](#integration-layer)
   - [Models](#models)
   - [SDK](#sdk)
   - [UI Components](#ui-components)
   - [Widgets](#widgets)
   - [Applications](#applications)
2. [Development Preparation](#development-preparation)
   - [Requirements](#requirements)
   - [API Setup](#api-setup)
3. [Running Dapp for Development](#running-dapp-for-development)
4. [Running Embedded for Development](#running-embedded-for-development)
5. [Important Note](#important-note)

## Project Structure

The project is built with the Lit library for HTML rendering and follows a modular architecture,
allowing for flexible and scalable development. It uses pnpm workspaces for monorepo management
(defined in `pnpm-workspace.yaml`). The main modules are located in the `libs` directory:

### [Core](libs/core/README.md)

Handles tasks unrelated to business logic. Simplifies development and organizes internal processes.

### [Integration Layer](libs/integration-layer/README.md)

Responsible for integrating widgets into different environments. Supports both monolithic
applications and embedded widgets.

### [Models](libs/models/README.md)

Contains pure models without business logic. Solves the problem of weak coupling between modules
through interfaces.

### [SDK](libs/sdk/README.md)

The main business logic module. Simplifies interaction with Web3 and encapsulates Fusion Swap logic.

### [UI Components](libs/ui-components/README.md)

Reusable UI components without business logic.

### [Widgets](libs/widgets/README.md)

Main module implementing complex widgets like swap forms, wallet connection, etc. Displays business
logic through UI.

### Applications

Located in the [`apps`](apps) folder:

- [**dapp**](apps/dapp): a monolithic app combining widgets. Renders widgets based on the user's
  device.
- [**electron-dapp**](apps/electron-dapp): an Electron wrapper around the regular dapp.

## Development Preparation

### Requirements

- Node.js: version 23+
- pnpm: version 10+ (with workspaces support)

### API Setup

The project uses the API from 1inch Dev Portal. To start development, get your API token at
[1inch Dev Portal](https://portal.1inch.dev/), then create a `.env` file:

```bash
cp env.example .env
```

Add your token to the following variable:

```
ONE_INCH_DEV_PORTAL_TOKEN=your_token
```

This is enough for development mode — no proxy is required.

The **proxy is only required for production**, as the Dev Portal's CORS policy does not allow direct
interaction with the API.

A ready-to-use **nginx-based** proxy template is located in the `/proxy` directory.

To run the proxy:

```bash
docker build -t one-inch-proxy ./proxy
docker run -d -p 8080:80 -e TOKEN="{{your_token}}" one-inch-proxy
```

After launching the proxy, specify its address in `.env`:

```
ONE_INCH_DEV_PORTAL_HOST=http://localhost:8080
```

If you plan to use WalletConnect for wallet integration, specify your project ID:

```
WALLET_CONNECT_PROJECT_ID=your_project_id
```

## Running Dapp for Development

1. **Clone the repository:**

   ```bash
   git clone git@github.com:1inch-community/interface.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd interface
   ```

3. **Install dependencies:**

   ```bash
   pnpm install
   ```

4. **Verify module builds:**

   After installation, `postinstall` should build all modules. Ensure that `libs/*/dist` contains
   compiled files. If not, run:

   ```bash
   pnpm run build:libs:all
   ```

5. **Start the dev server:**

   ```bash
   pnpm run serve:dapp
   ```

6. **Open in your browser:**

   `http://localhost:4200/`

7. **(Optional) Enable watch mode for libraries:**

   ```bash
   pnpm run watch:lib:all
   ```

## Running Embedded for Development

To run an embedded example, navigate to the corresponding folder inside [`examples`](./examples) and
follow the instructions provided in its `README.md`.

Each example may have its own setup and dependencies, so be sure to follow the specific
documentation.
