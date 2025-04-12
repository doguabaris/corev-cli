![Image](https://github.com/user-attachments/assets/e857b10d-693a-4a57-b843-701848a81718)

# Corev-CLI

A minimal CLI tool for managing versioned configuration repositories. Built to pull, push, diff, and list config files across distributed environments. Ideal for systems where settings must be easily maintainable, versioned, and auditable.

[![Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=952597&theme=dark)](https://www.producthunt.com/posts/corev-cli?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-corev-cli)

### Some stand-out features:
- Initialize CLI with a central API endpoint
- Pull latest project configuration
- Push local config files to the server
- Diff between config versions
- List available config versions
- Caches configuration files under `configs/`

### Installation

```bash
npm i -g @corev/cli
```

### Filename format

All configuration files must follow this naming convention:

```
<project>@<version>.json
```

Example:

```
configs/atlas@1.0.0.json
```

### File structure

All configuration files are expected to follow this structure:

```json
{
	"version": "1.0.0",
	"config": {
		"key": "value",
		"...": "..."
	}
}
```

### Quick Start

#### 1. Initialize once:

```bash
corev init --api http://localhost:3000
```

This saves your API endpoint to `configs/.corevrc.json`.

#### 2. Pull latest config for a project:

```bash
corev pull <project>
```

Example:

```bash
corev pull atlas
```

#### 3. Push local config file:

```bash
corev push configs/atlas@1.0.1.json
```

#### 4. Diff two config files:

```bash
corev diff configs/atlas@1.0.0.json configs/atlas@1.0.1.json
```

#### 5. List versions (based on filenames):

```bash
corev list
```

### Testing

Start the mock API:

```bash
node tests/mock-api.mjs
```

Then run CLI commands while targeting `http://localhost:3000`.

### Requirements

- Node.js ≥ 20.18.1
- TypeScript
- API endpoint that serves configs at `/configs/:project/latest` and accepts POSTs at
  `/configs/:project`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

This package is licensed under the [MIT License](LICENSE).



