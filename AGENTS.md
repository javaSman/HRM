# AGENTS.md

This document provides guidance for Codex and other coding agents working in this repository.

## Project Background

- This is a Vue 2 project based on JEECG / ant-design-vue 1.x.
- Prefer reusing existing JEECG page patterns instead of introducing new abstractions.
- List pages typically use `src/mixins/JeecgListMixin.js` and include:
  - `mixins: [JeecgListMixin, mixinDevice]`
  - `columns` defined in `data()`
  - a `url` object containing `list`, `delete`, `deleteBatch`, `exportXlsUrl`, and `importExcelUrl`
  - a `modalForm` `ref` and `modalFormOk`
  - `searchQuery`, `searchReset`, `loadData`, `handleTableChange`, and `onSelectChange`
- If you need to add new list functionality, first check at least 3 similar pages under `src/views/**` and follow the closest local pattern.

## Core Principles

- Make small, testable, and verifiable changes.
- Match the project's existing import style, naming conventions, component structure, and formatting.
- Prefer plain, direct implementations over flashy abstractions.
- Keep each function focused on a single responsibility.
- Avoid unrelated refactors, formatting-only cleanup, and broad rewrites.
- Treat all existing uncommitted changes as intentional in-progress work from other tools or developers.
- Do not replace Chinese characters with encoded or garbled text.

## Feature Development

- Extend new functionality on top of existing code paths and page patterns.
- Do not rewrite old compatibility logic unless the task explicitly requires it.
- Do not change historical behavior merely to make a new feature look cleaner.
- If existing compatibility code is still supporting deployed behavior, keep it.
- For JEECG list pages, prefer extending the existing `columns`, `url`, query form, action slot, modal component, or mixin hooks before introducing a new flow.
- Reuse existing helpers from `@/api/manage`, `@/utils`, `@/components`, and project mixins before adding new utilities.

## Defensive Programming

- Do not overuse defensive programming.
- Do not add unnecessary wrapper functions just to access a form key.
- When the current page already knows its data shape, do not add `normalizeXxx`, broad fallback mappers, or compatibility wrappers just to coerce hypothetical inputs; map the real fields inline so the data flow stays obvious.
- Add protective checks only when they guard against real failure modes that already exist in the current project flow.
- Avoid excessive null checks, fallback branches, wrapper functions, or generic try-catch blocks that hide normal errors.
- Where the existing UI pattern already handles errors, keep the handling clear and user-facing, for example with `$message`, `$warning`, `$error`, or existing API response checks.
- Do not introduce broad compatibility layers for hypothetical old data structures unless there is already evidence in the current code or API responses that they are needed.

## Vue / UI Conventions

- Use the Vue 2 Options API patterns already present in the project.
- Use ant-design-vue components and JEECG components consistently.
- Keep templates aligned with nearby pages: query area, action area, table area, modal `ref`s, and scoped slots.
- If similar pages already use them, continue using the existing CSS imports, such as `@/assets/less/TableExpand.less` and `~@assets/less/common.less`.
- Follow the existing `slot="action"` and `a-dropdown` / `a-popconfirm` patterns for table action columns.
- For dictionary fields, prefer the existing `j-dict-select-tag`, `dictCode`, and `_dictText` column conventions.

## File Encoding And Existing Text

- Preserve the existing file encoding and line ending format.
- Some legacy files may display garbled Chinese in certain terminals; do not rewrite large amounts of text just to fix display issues.
- When editing legacy Vue files, keep the change scope minimal and do not incidentally reflow unrelated Chinese labels or comments.

## Git Safety

- Only stage or commit files directly produced by the current task.
- Use `git add <specific-file>` instead of `git add .`.
- Never overwrite or revert unrelated uncommitted changes.
- If the current task conflicts with existing uncommitted changes, stop and report the conflict instead of guessing how to resolve it.

## Search And Editing

- If semantic or project-aware tools are available, prefer them.
- Otherwise, use `rg` / `rg --files` for search.
- Use `apply_patch` for routine edits.
- Avoid large-scale shell-based edits unless the change is mechanical and easy to verify.

## Project Snapshot

<!-- AUTO:tech-stack -->
| Layer | Technology | Version / Notes |
|------|------------|-----------------|
| Frontend framework | Vue | 2.6.10 |
| UI framework | ant-design-vue | 1.7.2 |
| Project base | JEECG / Ant Design Vue | package `vue-antd-jeecg` 3.4.3 |
| Build tooling | Vue CLI / webpack | `@vue/cli-service` 3.3.0 |
| Language | JavaScript | Vue 2 Options API |
| State and routing | Vuex / vue-router | Vuex 3.1.0, vue-router 3.0.1 |
| Styling | Less | less 3.9.0, less-loader 4.1.0 |
| Data and HTTP | axios, JEECG manage helpers | axios 0.21.4 |
| Charts and tables | ECharts, vxe-table, viser-vue | ECharts 5.4.2, vxe-table 2.9.13 |
<!-- /AUTO:tech-stack -->

<!-- AUTO:directory -->
```text
ant-design-vue-jeecg/
├── src/                         # Vue application source
│   ├── api/                     # API helpers and service calls
│   ├── assets/                  # Less, images, and static frontend assets
│   ├── components/              # Shared Vue components and JEECG widgets
│   ├── mixins/                  # JEECG and page mixins
│   ├── router/                  # Vue Router setup
│   ├── store/                   # Vuex modules
│   ├── utils/                   # Shared frontend utilities
│   └── views/                   # Feature pages and modules
├── public/                      # Public static files
├── qr-hrmHome/                  # Project-specific static/home assets
├── docs/                        # Project documentation
├── package.json                 # Frontend scripts and dependencies
├── vue.config.js                # Vue CLI configuration
└── .codex/                      # Codex project task skeleton
```
<!-- /AUTO:directory -->

<!-- AUTO:commands -->
```bash
# Install dependencies
npm run pre

# Development server
npm run dev

# Production build
npm run build

# Test-mode build
npm run build:test

# Lint
npm run lint
```
<!-- /AUTO:commands -->

<!-- AUTO:risk-areas -->
- Recruitment pages under `src/views/PersonnelManagement/Recruitment/` currently have uncommitted work; do not overwrite or reflow them without explicit task scope.
- Environment files such as `.env.development`, `.env.production`, and `.env.test` can affect API routing and should be changed only with clear intent.
- Legacy Vue files may contain Chinese labels or text that renders poorly in some terminals; preserve encoding and avoid broad formatting changes.
- JEECG list behavior is shared through mixins and conventions, so changes to `src/mixins/`, `src/api/`, `src/utils/`, and common components can have broad page impact.
<!-- /AUTO:risk-areas -->
