![Image](https://github.com/user-attachments/assets/e857b10d-693a-4a57-b843-701848a81718)

# Corev-CLI

An open-source CLI tool for managing dynamic configuration repositories, with a focus on JSON files, on a per-project basis. It is built to pull, push, diff, list, and revert config files across distributed environments, and is ideal for systems where configurations are dynamic and need to be maintainable, versioned, and auditable. It can be plugged into larger automation pipelines as an upstream source of configuration data.

[![Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1054790&theme=dark)](https://www.producthunt.com/products/corev-cli/reviews)

## Prerequisites

> Corev-CLI is not a "plug-and-play" tool. It only works if there is an API that follows the [API specification](#api-specification).  
It uses this API to `pull` and `push` config files. Without it, the CLI does nothing.

## Installation

```bash
npm i -g @corev/cli
```

## Available commands

Corev-CLI provides a small set of core commands to help get things done. Configuration files stored in the `configs/` folder for quick and offline access.

| Action     | Description                                                       |
|------------|-------------------------------------------------------------------|
| `init`     | Set the API endpoint used by the CLI                              |
| `pull`     | Fetch the latest config for a project                             |
| `push`     | Upload a local config file to the server                          |
| `diff`     | Show differences between two config versions                      |
| `list`     | List all available config versions by filename                    |
| `revert`   | Revert the remote configuration to a previous version             |
| `checkout` | Fetch a specific config version for a project and save it locally |

## Quick start

### 1. Initialize once:

```bash
corev init --api http://localhost:3000
```

This saves the API endpoint to `configs/.corevrc.json`.

### 2. Pull the latest config for a project:

```bash
corev pull <project>
```

### 3. Push a local config file:

```bash
corev push configs/<project>@<version>.json
```

### 4. Diff two config files:

```bash
corev diff configs/<project>@<version>.json configs/<project>@<version>.json
```

### 5. List versions based on filenames

```bash
corev list
```

### 6. Revert to an older configuration:

```bash
corev revert <project> <version>
```

### 7. Checkout a specific configuration version:

```bash
corev checkout <project> <version>
```

## API specification

### HTTP mapping
> Implementers SHOULD provide the endpoints listed below so Corev-CLI can perform `pull` and `push` operations correctly.

| HTTP Method | Endpoint URL                 | Description                                 |
|-------------|------------------------------|---------------------------------------------|
| GET         | `/configs/:project/latest`   | Returns the latest configuration            |
| GET         | `/configs/:project/:version` | Returns a specific configuration by version |
| POST        | `/configs/:project`          | Uploads a new or updated configuration      |

### File naming

All configuration files SHOULD follow the naming convention below:

```
<project>@<version>.json
```

Example:

```
configs/atlas@1.0.0.json
```

### JSON schema

Every configuration file SHOULD conform to the JSON schema below, which precisely defines the required structure and fields:

```json
{
	"type": "object",
	"properties": {
		"name": {
			"type": "string"
		},
		"version": {
			"type": "string"
		},
		"config": {
			"type": "object",
			"additionalProperties": true
		}
	},
	"required": ["name", "version", "config"],
	"additionalProperties": false
}
```

### API contract (recommended)
> Sections 1, 2, 3, 4 and 5 below describe a recommended API contract for compatibility with Corev-CLI. The specification is divided into two main parts: the methods (belonging to the `ConfigService` interface) and the dictionaries (`Configuration` and `UploadResponse`).

#### 1 The `getLatestConfig()` method

Belongs to the **Corev ConfigService conformance class**.  
Expects a single argument, `projectName`, which identifies the project. It returns a promise that resolves with a `Configuration` object containing the latest configuration for that project.

```webidl
partial interface ConfigService {
  Promise<Configuration> getLatestConfig(DOMString projectName);
};
```

**Behavior:**
- When this method is invoked, the implementation MUST retrieve the latest configuration from storage (or memory) and return it as a `Configuration` object.
- If the project is not found, the promise SHOULD be rejected with an appropriate error.

#### 2 The `getSpecificConfig()` method

Belongs to the **Corev ConfigService conformance class**.
Expects two arguments:

1. `projectName`, a DOMString specifying the project
2. `version`, a DOMString specifying the version to retrieve

```webidl
partial interface ConfigService {
  Promise<Configuration> getSpecificConfig(DOMString projectName, DOMString version);
};
```

**Behavior:**

- When this method is invoked, the implementation MUST retrieve the configuration for the specified project and version from storage (or memory) and return it as a `Configuration` object.
- If the project or the specific version is not found, the promise SHOULD be rejected with an appropriate error (e.g., HTTP 404).

#### 3 The `uploadConfig()` method

Belongs to the **Corev ConfigService conformance class**.  
Expects two arguments:
1. `projectName`, a DOMString specifying the project.
2. `config`, a `Configuration` object to be stored or updated.

```webidl
partial interface ConfigService {
  Promise<UploadResponse> uploadConfig(DOMString projectName, Configuration config);
};
```

**Behavior:**
- When this method is invoked, the implementation MUST store or update the configuration for the specified project, then return an `UploadResponse` indicating success or error.
- If policy doesn’t allow a duplicate or earlier version of a configuration, this method SHOULD reject with a `409 Conflict`-like error or return an appropriate error response in the `UploadResponse`.

#### 4 The `Configuration` dictionary

Represents the structure of a project configuration object.

```webidl
dictionary Configuration {
  required DOMString name;      // Project name (e.g., "atlas")
  required DOMString version;   // Version string (e.g., "1.0.0")
  required any config;          // JSON object with configuration data
};
```

**Usage notes:**
- `name` typically matches the project identifier (for example, "atlas").
- `version` can be any string representing a version (for example, "1.0.0," "2025.04.13-alpha,").
- `config` is an arbitrary JSON-like structure containing key-value pairs relevant to the configuration.

#### 5 The `UploadResponse` dictionary

Defines the response returned after a successful (or failed) configuration upload.

```webidl
dictionary UploadResponse {
  required DOMString status;    // "success" or "error"
  DOMString? message;           // Optional message with details
};
```

**Usage notes:**
- `status` MUST be either `"success"` or `"error"`.
- `message` MAY be provided to give further context, such as error details or confirmations.

## Testing

Start the mock API:

```bash
node tests/mock-api.mjs
```

Then run CLI commands while targeting `http://localhost:3000`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

Corev-CLI is released under the [MIT License](LICENSE).
