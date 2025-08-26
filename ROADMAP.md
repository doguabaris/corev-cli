# Roadmap

The Corev CLI roadmap is presented as _In Development_, _Up Next_, and _Under Consideration_ to give you a clear picture of what is currently being built, what is planned next, and what areas are being evaluated for future development.

This roadmap does not imply guaranteed delivery timelines or commitments. Instead, it provides insight into the current direction of the project. Features listed here are generally larger focus areas and may not include all incremental enhancements.

Do not rely on roadmap features in production environments until they are officially released.

If a feature you’re looking for is not listed here, check the [Release Notes](./CHANGELOG.md) to see if it has already shipped. If not, feel free to open a [Feature Request](https://github.com/doguabaris/corev-cli/issues/new?labels=feature&template=feature_request.md).

## Terminology

- _In Development_: Features currently being implemented and actively worked on.
- _Up Next_: Features that are ready for development once capacity allows.
- _Under Consideration_: Ideas or concepts being evaluated for future development. These have no timeline or final decision yet.

---

## Focus Areas

### In Development

_(no items currently in active implementation)_

### Up Next

- Corev-host integration and stable release
    - Publish an OpenAPI specification for core endpoints and headers.
    - Align CLI requests and error mapping with the host contract.
    - Standardize status and error codes, and map them to clear CLI messages.
    - Tag the first stable public release and provide signed artifacts with checksums.

- Documentation overhaul
    - Add task-based guides with runnable examples.
    - Provide deployment guides for self-hosting and Docker, and include CI usage notes.
    - Generate an API reference and error catalog from the OpenAPI spec.
    - Add migration notes from alpha and document deprecation rules.

- CLI account and identity tools
    - `corev whoami`, `login`, `logout`, token management

- Developer quality-of-life
    - `corev reset`: Remove local configuration
    - `corev ping`: Test API connectivity and conformance
    - CLI hooks: Validation before push, actions after pull

### Under Consideration

- YAML file support (bi-directional: YAML → JSON and JSON → YAML)
- Expiration / lifecycle policies for versioned configs
- GitHub Actions integration (`corev-action`)

### Operational Concerns

This project is developed and maintained by a volunteer. Sponsorships and grants directly support development, documentation, security reviews, and community support. To sponsor Corev or fund specific work items, reach out via GitHub Discussions or email [abaris@null.net](mailto:abaris@null.net). Sponsors can be acknowledged publicly upon request.
