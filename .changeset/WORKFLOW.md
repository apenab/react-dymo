# Changesets Workflow

This project uses [Changesets](https://github.com/changesets/changesets) for version management and changelog generation.

## Creating a Changeset

When you make changes that should trigger a version bump:

```bash
npm run changeset
```

This will prompt you to:
1. Select which packages to bump (major/minor/patch)
2. Write a summary of your changes

The changeset will be saved in `.changeset/` directory.

## Version Bumping

When you're ready to release:

```bash
npm run version
```

This will:
- Consume all changesets
- Update version in package.json
- Update CHANGELOG.md
- Delete consumed changeset files

## Publishing

After version bumping and committing:

```bash
npm run release
```

This will publish to npm. Make sure you have:
- `NPM_TOKEN` configured for CI/CD
- Or logged in via `npm login` for manual release

## Roadmap for v3.0.0

1. ✅ Implement changesets (current)
2. ⏳ Migrate to Vite and Vitest
3. ✅ Migrate to TypeScript (completed)
4. ⏳ Remove usage of axios library (#47)
5. ⏳ Separate core DymoJS into isolated package (#46)

## GitHub Actions (Optional)

You can automate releases with GitHub Actions:

```yaml
name: Release

on:
  push:
    branches:
      - master

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run test
      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```
