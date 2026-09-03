# NeetoCI API Docs

This repository contains the documentation for the [NeetoCI APIs](https://apidocs.neetoci.com/api/introduction), built using [Mintlify](https://mintlify.com/).

## Development Setup

1. ### Install Mintlify CLI globally

   ```bash
   npm i -g mint
   ```

2. ### Install project dependencies

   ```bash
   yarn install
   ```

3. ### Make code changes in docs folder

4. ### Preview the changes

   ```bash
   yarn docs:preview
   ```

   A local preview will be available at `http://localhost:3000`. You can customize the port using the `--port` flag:

   ```bash
   yarn docs:preview --port 3333
   ```

   DO NOT MAKE CODE CHANGES IN BUNDLED FOLDER.

5. ### Build the API

   After making code changes you must run `yarn build:dev`. This will make changes in the `bundled` folder which is what mintlify uses.
   You should NEVER make changes to the `bundled` folder directly.

   Refer to [llm.md](llm.md) for more info.

## CLI documentation

The CLI tab is split into hand-written guides and a generated command reference.

- `cli/*.mdx` (guides) and `cli-reference/<resource>.mdx` (per-resource pages) are written by hand. The reference pages import the generated flag tables from `snippets/cli/**` and add headings, usage examples, required arguments, and sample output.
- `snippets/cli/**` and `cli-reference/overview.mdx` are generated from `cli/catalog.json` by `scripts/generate-cli-reference.mjs`. Never edit them by hand; hand edits are overwritten on the next build.
- Refresh `cli/catalog.json` from the CLI, not by hand. With the `neetoci` binary on your `PATH`, run `yarn cli:catalog` to snapshot `neetoci commands`, then `yarn cli:build` to regenerate the snippets and the overview. `yarn build` also runs `cli:build`.

## Publishing

Production documentation is published by synchronizing `origin/main` to the private GitHub repository connected to
Mintlify. Pushes to `main` also trigger that sync in CI (`.neetoci/sync-docs.yml`). `yarn docs:publish` is a manual
re-sync of the same `origin/main` commit; it does not publish the current branch or uncommitted changes.

### Publisher one-time setup

1. Install and sign in to the [1Password CLI](https://developer.1password.com/docs/cli/get-started/), then enable the
   desktop app integration in 1Password under **Settings > Developer > Integrate with 1Password CLI**.

2. Confirm the checked-in `.env` contains the shared 1Password reference for `GITHUB_PAT`. That value is the GitHub
   personal access token for [neetociapis](https://github.com/neetociapis), which owns the public repository
   connected to Mintlify. The reference uses vault, item, and field IDs. Do not replace the `op://` reference with the token itself.

### Validate without publishing

Verify 1Password CLI access and the shared publishing credential, then run the build and documentation checks against
the latest `origin/main` without pushing:

```bash
yarn docs:publish:check
```

### Publish

Run:

```bash
yarn docs:publish
```

Authenticate when 1Password prompts. The command fetches and validates `origin/main`, safely updates the Mintlify
repository, verifies the pushed commit, and prints the documentation URL. A push to the connected repository triggers
Mintlify's deployment.

During publishing, the GitHub token is injected only into the final Git push process after validation succeeds. During
the check command, it is injected only into a small credential checker that verifies the value without printing it. The
token is not made available to dependency installation or documentation checks, and is not stored in the repository,
Git remote, shell history, or Git credential helpers. Do not run the internal push script directly with a plaintext
`GITHUB_PAT`.
