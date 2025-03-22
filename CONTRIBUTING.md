# Contributing to vue-formik

Thank you for your interest in contributing to **vue-formik**!  
We welcome all contributions — from bug reports and suggestions to features, documentation, and tests.

This document outlines the standards and guidelines to ensure contributions are meaningful, consistent, and maintainable.

---

## 🚀 Getting Started

1. **Fork** the repository and create a new branch from `main`.
2. Follow the [Issue Templates](.github/ISSUE_TEMPLATE) to report bugs or propose features.
3. For larger changes, please open an issue first to discuss your ideas.

---

## 🧑‍💻 Development Standards

### ✅ Code Quality

- Use **TypeScript** for all code contributions.
- Follow the **DRY (Don’t Repeat Yourself)** principle.
- Aim for **clean**, **readable**, and **modular** code.
- Avoid unnecessary abstractions or complexity.

### 📦 Scripts Overview

Make sure to run the following scripts before opening a pull request:

| Task             | Command                     | Description                                |
|------------------|-----------------------------|--------------------------------------------|
| Lint             | `npm run lint`              | Runs ESLint and auto-fixes lint errors     |
| Format           | `npm run format`            | Formats code using Prettier                |
| Type Check       | `npm run type-check`        | Ensures type safety with `vue-tsc`         |
| Unit Tests       | `npm run test:unit`         | Runs unit tests with Vitest                |
| Build            | `npm run build-only`        | Builds the project using Vite              |

---

## ✅ Requirements for All Contributions

- ✅ **Code must be type-safe** (`npm run type-check`)
- ✅ **Code must pass linting and formatting**
- ✅ **Tests must be added or updated**
  - **Unit tests are required** for all new logic.
  - **E2E tests** are required for significant UI changes or workflows.
- ✅ Ensure that all tests pass before submitting your pull request.

---

## 📂 Pull Request Guidelines

- Use clear and descriptive PR titles.
- Reference any related issues using `Closes #123`.
- Keep PRs focused and concise.
- Avoid unrelated changes in the same PR.
- Squash commits if possible for a clean commit history.

---

## 💬 Communication & Conduct

- Be respectful and constructive in all interactions.
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md).
- If in doubt, open a discussion or ask before starting on a feature.

---

## 🙌 Thank You

Your contributions help make **vue-formik** a better project.  
We truly appreciate your support and collaboration.
