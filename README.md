<div align="center">
<samp>

# bkm

Bookmark manager integrated with Fuzzy Finder

</samp>
</div>

## Features

- Add bookmarks via an interactive UI
- Add bookmarks directly by specifying options
- Search bookmarks with the built-in Fuzzy Finder
- Instantly open bookmarks in your browser

## Installation

### From GitHub Releases

Download the latest binary from [GitHub Releases](https://github.com/airRnot1106/bkm/releases/latest).

### From Source

```bash
go build
```

### Using Nix Flake

```bash
nix build
```

or

```bash
nix run github:airRnot1106/bkm
```

## Data Storage

Bookmarks are stored as JSON in the following location:

- **Linux**: `~/.local/share/bkm/bookmarks.json`
- **macOS**: `~/Library/Application Support/bkm/bookmarks.json`

The storage location follows the [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html).

## Usage

### Add a bookmark

Interactive mode (prompts for each field):

```bash
bkm add
```

Direct mode (specify all fields):

```bash
bkm add -u "https://example.com" -t "Example Site" -d "An example website" -T "example,web"
```

Options:
- `-u, --url`: URL of the bookmark (required)
- `-t, --title`: Title of the bookmark (required)
- `-d, --description`: Description of the bookmark (optional)
- `-T, --tags`: Tags (comma-separated, optional)

### Search and open a bookmark

Search through all bookmarks:

```bash
bkm search
```

Filter by tags:

```bash
bkm search --tags go,cli
```

This opens a fuzzy finder where you can:

1. Type to filter bookmarks
2. Use arrow keys to navigate
3. Press Enter to open the selected bookmark in your browser
4. Press Esc or Ctrl+C to cancel

### Delete a bookmark

Delete from all bookmarks:

```bash
bkm delete
```

Filter by tags before selecting:

```bash
bkm delete --tags go,cli
```

This opens a fuzzy finder to select a bookmark, then shows a confirmation prompt before deletion.

### Examples

```bash
# Add a bookmark interactively
bkm add

# Add a bookmark with all fields specified
bkm add -u "https://go.dev" -t "Go Programming Language" -T "go,programming"

# Search all bookmarks
bkm search

# Search bookmarks tagged with "go"
bkm search --tags go

# Delete a bookmark tagged with "go" or "cli"
bkm delete --tags go,cli
```

## LICENSE

MIT
