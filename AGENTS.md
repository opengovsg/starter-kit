# Agent instructions

## Storybook MCP (`acme-web-storybook`)

Project MCP config lives in [`.mcp.json`](.mcp.json) (HTTP → `http://localhost:6006/mcp` while Storybook is running). Import or sync it into your editor if it does not load `.mcp.json` automatically (for example Cursor uses `.cursor/mcp.json`; tools like [mcp-add](https://github.com/paoloricciuti/mcp-add) can copy from `.mcp.json`).

When working on UI components or stories in this repo, use the **acme-web-storybook** MCP tools (Storybook must be running: `pnpm --filter @acme/web storybook`).

- **Do not guess component APIs.** Before using any prop on `@acme/ui`, `@opengovsg/oui`, or app components, call `docs-list` and `docs-show` (or related docs tools) and only use documented props and patterns shown in examples.
- Use `get-storybook-story-instructions` when creating or updating CSF stories so conventions match Storybook 10 and this project.
- Use `stories-find-by-component`, `stories-preview`, and `stories-changed` when locating or validating stories during UI work.
- After story or component changes, run `test-run` when the Storybook dev server is up to exercise Vitest-powered story tests.
- Exclude human-only or anti-pattern stories from the agent manifest with the `!manifest` tag (see [Storybook manifests](https://storybook.js.org/docs/ai/manifests)).

### Documentation habits

- Add JSDoc on exported components and non-obvious props so manifests stay accurate (`react-docgen-typescript` is enabled in `.storybook/main.ts`).
- Prefer focused stories that explain **why** a variant exists, not only **what** it renders.
- Keep autodocs enabled via the global `autodocs` tag in `.storybook/preview.ts`; extend with MDX where prose guidance helps agents and humans.
