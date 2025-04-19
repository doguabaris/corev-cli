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

- `corev init`: Prompt to choose API type
    - **Local**: prompt for a 4 or 5-digit port (e.g. `4912`, `49152`) — required input  
        - Ports must be in the range `1024–65535`  
        - Validates that the selected port is not already in use  
        - Sets `http://localhost:<port>`  
        - Uses a locally running Node.js API endpoint
    - **Custom**: prompt for custom API endpoint
    - **Hosted**: auto-sets `https://api.corev.dev`
        - Requires token input
- Save `.corevrc.json` with `api` and `token` values

- Bucket-based project isolation
    - `corev bucket --new`: Create a named bucket
    - `corev bucket --list`: List owned buckets
    - `corev bucket --set <name>`: Persist selected bucket
    - `corev bucket --delete`: Delete a bucket
    - Hosted API: config namespacing by bucket
    - `.corevrc.json` persists selected bucket as `bucket`, e.g.:

      ```json
      {
        "api": "https://api.corev.dev",
        "token": "sk_live_abc123",
        "bucket": "myproject-some-space"
      }
      ```

- CLI account and identity tools
    - `corev whoami`, `login`, `logout`, token management

- Developer quality-of-life
    - `corev reset`: Remove local configuration
    - `corev ping`: Test API connectivity and conformance
    - CLI hooks: Validation before push, actions after pull

### Under Consideration

- YAML file support (bi-directional: YAML → JSON and JSON → YAML)
- Encrypted config buckets (hosted)
- Expiration / lifecycle policies for versioned configs
- Signed configuration uploads
- GitHub Actions integration (`corev-action`)
- CLI plugin API for custom logic

### Operational Concerns

The `corev-host` service is a planned hosted backend for users who do not wish to deploy their own API.

While the Corev CLI is fully open-source and works with any conformant backend, maintaining a hosted version involves infrastructure, security, and availability concerns that go beyond the CLI itself.

The hosted service is not yet live and will require sustainable support before a public deployment can happen.  
If you are interested in sponsoring or supporting the hosted infrastructure for Corev, feel free to reach out via GitHub Discussions or email [abaris@null.net](mailto:abaris@null.net).
