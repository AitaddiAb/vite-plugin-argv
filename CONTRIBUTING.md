# Contributing to vite-plugin-argv

We welcome contributions! This guide will help you get started with the development environment.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AitaddiAb/vite-plugin-argv.git
   cd vite-plugin-argv
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Development Workflow

### Building
The project uses `tsup` to bundle TypeScript into ESM and CJS formats.

```bash
pnpm build
```

Watch mode for development:
```bash
pnpm dev
```

### Testing
We use `vitest` for both unit and integration tests.

```bash
pnpm test
```

Please make sure all tests pass before submitting a pull request.

## Submitting Changes
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/awesome-feature`).
5. Create a new Pull Request.

## Coding Style
- Follow the existing code style (clean, descriptive comments).
- Ensure all exported functions have proper TSDoc-style comments.
- Keep the zero-dependency philosophy.

## License
By contributing, you agree that your contributions will be licensed under the MIT License.
