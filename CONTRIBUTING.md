# Contributing to riot-composables

Thank you for your interest in contributing to riot-composables!

## Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/riot-composables.git
cd riot-composables
```

2. **Install dependencies**

```bash
npm install
```

3. **Run tests**

```bash
npm test
```

4. **Build the library**

```bash
npm run build
```

## Project Structure

```
riot-composables/
├── src/              # Source code (library)
│   ├── core/         # Core functionality
│   ├── composables/  # Built-in composables
│   ├── types.ts      # Type definitions
│   └── index.ts      # Entry point
│
├── examples/         # Example apps (NOT in library)
│   └── counter/      # Counter example with custom composables
│
├── tests/            # Tests
│   ├── core/         # Core tests
│   └── composables/  # Composables tests
│
└── dist/             # Build output (auto-generated)
```

## Development Workflow

### Writing Code

1. All source code goes in `src/`
2. Follow TypeScript best practices
3. Add JSDoc comments for public APIs
4. Export types from `types.ts`

### Writing Tests

1. Write tests in `tests/` directory
2. Use descriptive test names
3. Aim for high coverage
4. Run tests with `npm test`

### Building

```bash
# Development build with watch
npm run dev

# Production build
npm run build

# Type checking
npm run typecheck
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure tests pass (`npm test`)
6. Ensure types are correct (`npm run typecheck`)
7. Build successfully (`npm run build`)
8. Commit your changes (`git commit -m 'Add amazing feature'`)
9. Push to your branch (`git push origin feature/amazing-feature`)
10. Open a Pull Request

## Code Style

- Use TypeScript
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## Adding New Composables

**Core composables** (in `src/composables/`):

- Must be universally useful
- Should have no external dependencies
- Must be well-tested
- Need comprehensive documentation

**Example composables** (in `examples/`):

- Show how to create custom composables
- Can be domain-specific
- Should be educational

## Questions?

Feel free to open an issue for questions or discussions!
