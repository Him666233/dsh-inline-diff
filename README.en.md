# DSH Inline Diff

[中文](README.md) | English

> **Originality notice (important)**: This project is **an entirely original work**. It has **no relationship whatsoever** with [JanEickholt/dsh-inline-diff](https://github.com/JanEickholt/dsh-inline-diff) **or any other plugin, repository, or project with the same or a similar name**. This project did not reference, copy, or port any of those projects; the implementation approach, module split, code organization, and final rendering are completely different. Any similarity in part of the functionality (inline diff display in conversations) is **coincidental** — this project only discovered the same-named/similar project when searching for similar plugins after the implementation was already complete. This project is **not** a derivative work, a re-creation, or a fork of any other project; please do not mix them up or confuse them. The Chinese version of this statement is in [README.md](README.md).

Renders an expandable diff card in place for every file change in the [DeepSeek Harness](https://github.com/deepseek-ai) conversation stream, with side-by-side comparison, inline character-level highlighting, moved-block / passive line-number annotations, and read-range display; since 1.1.0 it also detects the language of the modified file, showing a language badge and language-aware syntax highlighting in the inline card and the expanded dialog (the palette deliberately avoids red and green so it never competes with added/removed markers); since 1.2.0 command and tool cards express input and output status with two independent IN/OUT bars; since 1.2.5 the gutter carries an OLD / NEW legend, and the expanded dialog's notice banner and the settings dialog's title bar stay fixed; since 1.2.6 shell and dialog colors strictly follow the active theme (official stock themes and third-party skins alike); **since 1.3.0 the plugin provides a complete bilingual Chinese/English UI and documentation, with an independent language switch on the settings page; since 1.4.0 the default is “Follow DSH”, and the release adds card/dialog motion plus a built-in version check, update and rollback panel in the settings page**. Command, search, web, and generic tool calls can also switch to the expanded style with IN/OUT open by default.

**Author**: [Him666233](https://github.com/Him666233) · **Repository**: [Him666233/dsh-inline-diff](https://github.com/Him666233/dsh-inline-diff) · **npm**: [`@him666233/dsh-inline-diff`](https://www.npmjs.com/package/@him666233/dsh-inline-diff) · **License**: [MIT](LICENSE)

> Chinese-first documentation; the plugin's internal names, settings, and UI all use neutral descriptions and contain no third-party product brand names.
> “Expanded style” in this repository means the expanded, flat, transparent output style of modern coding agents.

## Screenshots

> All screenshots below were captured **with third-party themes disabled, under the official stock appearance** (dark as the primary variant, plus a light-appearance example). The sample content only demonstrates plugin behavior and contains no third-party themes or desktop-pet assets. File cards use the default “expanded style”; command/tool row screenshots show the corresponding expanded style enabled. Capture procedure: disable the third-party theme currently in use → switch UI language / light-dark appearance → take one set in Chinese and one in English → restore the original theme and appearance. Chinese screenshots live in [`docs/`](docs/), English screenshots in [`docs/en/`](docs/en/), with matching file names. Actual shell colors follow the current theme and light/dark appearance.

### Inline diff card

Edit/write tool calls show the change comparison in place: green additions, red removals, exact old/new line numbers, and only the genuinely changed fragments highlighted inline; each change has an OLD / NEW legend above its gutter.

![Inline diff card](docs/en/screenshot-inline.png)

### Language detection and syntax highlighting

Detects 57 languages from the file path, shows a language badge next to the file path in the card header and in the expanded dialog subtitle, and applies red/green-safe syntax highlighting based on the detection result; the settings page can expand the supported-language list.

![Language detection, badges, and syntax highlighting](docs/en/screenshot-languages.png)

### Moved blocks and passive line numbers

When an identical contiguous block of code is purely moved, the removed side is labeled “moved to new Lx–Ly” and the added side “moved from old Lx–Ly”; an unchanged span between two changes shows the old→new line range and “line numbers shifted ±N”.

![Moved blocks and passive line-number shifts](docs/en/screenshot-move.png)

### Side-by-side expansion

Click “Expand” to open the full-screen comparison. Changes mode groups by change and keeps each change header sticky while scrolling; the “Whole file” tab aligns the entire before/after file line by line.

![Side-by-side · Changes](docs/en/screenshot-modal-blocks.png)

![Side-by-side · Whole file](docs/en/screenshot-modal-fulltext.png)

### Command and tool rows (expanded style)

Command executions and other tool calls open IN/OUT by default; the input and output segments scroll independently and each shows its own status. Failures distinguish the input side from the output side. Search/web tool rows use the same row styling.

![Command execution succeeded](docs/en/screenshot-command.png)

![Command execution failed with IN/OUT segment attribution](docs/en/screenshot-command-failure.png)

![Search and web tool rows](docs/en/screenshot-tools.png)

### Read range

Read tool rows keep DSH's native card and expand behavior; when collapsed, the actual line range read by this call appears to the right of the file name, covering single lines, contiguous ranges, and multiple disjoint ranges.

![Read range](docs/en/screenshot-read-range.png)

### Settings panel

The UI language switch, the originality notice, four display styles, per-card shell/inner colors for the three card types, and the four syntax-highlighting settings all live in a single panel; the dialog title bar stays fixed and the content area scrolls independently.

![Settings panel](docs/en/screenshot-settings.png)

![Syntax highlighting and language settings](docs/en/screenshot-settings-highlight.png)

### Light appearance

The plugin reads the light/dark appearance the host actually resolves: in light appearance the shell switches to the theme's light color, the inner area switches to the official light code surface, and text colors darken accordingly.

![Light appearance](docs/en/screenshot-light.png)

## Features

- **Per-edit inline diff**: `edit` / `write` / `str_replace_editor` each get their own card per call, without waiting for the whole turn to finish.
- **Exact line numbers and an OLD / NEW legend**: old-file and new-file line numbers are shown in two columns; below each change header there is a row of OLD / NEW labels aligned with the gutter (shown when exact line numbers are available), and the old line numbers of removed lines and the new line numbers of added lines are lightly tinted red/green and bolded. Changes with line numbers on only one side (new file or pure deletion) show the legend only for the side that actually exists — a new file shows only NEW. Each change has its own header stating `old Lx–Ly → new Lm–Ln` and the `+/−` stats.
- **Inline character-level highlighting**: replaced lines mark only the tokens that actually changed in deep red/deep green, so entire lines are never tinted; whitespace and punctuation shared by both sides of the same replacement merge into the change region and form one continuous highlight band instead of fragmenting into scattered word blocks (words genuinely shared stay unhighlighted). Isolated whitespace/punctuation differences are not falsely marked as changes.
- **Move detection**: when an identical contiguous block of code is purely moved, the removed side is labeled “moved to new Lx–Ly” and the added side “moved from old Lx–Ly”, and multi-line moves give the full target range; boundary blank lines do not affect detection. Single-line moves are judged by display width (CJK/full-width counts as 2 cells; ≥12 cells required to be annotated), and multi-line moves are detected up to 120 lines.
- **Passive line-number shifts**: unchanged spans show “N unchanged lines”, the old→new line range, and “line numbers shifted ±N”, explaining the passive renumbering caused by insertions/deletions/moves.
- **Side-by-side comparison**: Changes mode groups by change; Whole-file mode aligns the entire before/after file line by line and truncates with a notice above 4000 lines.
- **Fixed headers and notice banner**: the file/change headers in inline cards and in the expanded dialog stay sticky while scrolling; the expanded dialog's notice banner (history replay, line numbers pending, whole-file comparison unavailable, etc.) and the “Before / After” bars stay fixed below the title, and the scrollbar belongs only to the comparison content and never covers them.
- **Automatic file-language detection**: detects 57 languages and markup formats from the file path; detection order is compound extension → special filename → ordinary extension → shebang line of extensionless scripts. Compound extensions such as `.d.ts` / `.min.js`, special filenames such as `Dockerfile` (including `Dockerfile.dev`) / `Makefile` / `CMakeLists.txt` / `nginx.conf` / `Jenkinsfile` / `Cargo.toml` / `.env` / `.editorconfig` / `Gemfile` / `.bashrc`, and script first lines such as `#!/usr/bin/env node` all participate; explicit text-only files such as `.txt` / `.log` / `LICENSE` / `.gitignore` / `go.mod` are marked plain text and skip highlighting.
- **Language badge**: a neutral small badge next to the file path in the card header and in the expanded dialog subtitle; it can be set to short code / full name / hidden (“Hidden” hides every badge, including plain-text and unknown-language ones); while badges are visible, an undetected language shows a dashed badge under the “Unknown language” setting or nothing at all, and plain-text files show a “Plain text” marker.
- **Syntax highlighting**: all code lines in inline cards and the side-by-side dialog (Changes and Whole file) are colored by language; the palette is constrained to the blue→purple range (hue 180°–285°), and **red, green, orange, yellow, magenta, and similar hues never take part in highlighting** — red and green are reserved for added/removed semantics, so the two color families are never confused. Every foreground color reaches ≥ 4.5:1 contrast on the official dark/light code surfaces and stays readable on added/removed line and inline-change backgrounds. When highlighting is off, or the language is unknown or plain text, it falls back to the default foreground color, readable in both light and dark appearances.
- **Font emphasis**: when on, keywords, types, function names, and tags are bold, comments italic, and links underlined; when off, color alone distinguishes them.
- **Compact gutter**: the gutter is narrowed and its content and border padding reduced, so code starts further left; the full-line backgrounds and left color bars of added/removed lines still run all the way to the card/dialog edge.
- **Read range surfaced**: a collapsed Read row shows `L x – L y` (single line `L x`, unknown end `from L x`, disjoint ranges separated by ` · `, at most 4 segments then `…`); it hides automatically when expanded and never overrides DSH's native presentation.
- **Four display options**: file-change cards, command rows, and other tool calls can use “Expanded style / DSH native”; process folding can use “Unfolded / DSH native”.
- **Entrance and output motion (new in 1.4.0)**: a running command/tool card fades in with a 4px rise over 200ms; when the “Running…” placeholder is replaced by real OUT content, the output fades in over 160ms; the settings and side-by-side dialogs fade in with a subtle rise/scale. Only “appearing” moments animate — historical replay, already-settled fast calls and status-preserving re-renders stay instant, so nothing animates just for the sake of animation. The easing is a strongly damped ease-out curve with no bounce or exaggerated travel, and everything is disabled when the OS “reduce motion” preference is on.
- **Built-in update and rollback panel (new in 1.4.0)**: the “Version & updates” section at the bottom of the settings panel lists every npm version (sorted descending, with Latest / Installed / Deprecated / Unavailable badges, publish dates and the current DSH version); pick any version to update, roll back or reinstall. On the Web side the Host runs the official `dsh plugin --profile <profile> add @him666233/dsh-inline-diff@<version>` command; failures roll back automatically via the CLI and show the error code plus log tail, while success tells you to restart DSH. Desktop v1 follows the official “quit the desktop app before changing a profile” rule and shows the version list plus a copyable command.
- **Command rows**: `bash` / `pwsh` / `win_bash` use a terminal icon, monospace title, and terminal-like layout; the header shows the status and non-zero exit code; IN/OUT scroll independently (IN has a shorter max height) and the scrollbars hug the card's right edge.
- **Search and web tool rows**: `grep` / `glob` / `web_search` / `web_fetch` also join “Other tool calls” in expanded style, showing a category icon, a keyword/path/URL summary, match/file/source/HTTP-status badges, and IN/OUT open by default.
- **Per-tool row differentiation**: command rows use a terminal icon, monospace title, and green accent; search tools use a magnifier icon and web tools a globe icon; generic tool calls carry a “Tool call” label. All expanded-style tool rows share the same “Trace” pill button as inline diff cards.
- **IN/OUT segment status**: the left color bar of command cards and other tool-call cards shows status separately for “input / output” — IN segment: preparing arguments / arguments submitted awaiting output = theme color (pulsing), input side completed = green, input side failed = red; OUT segment: running = theme color (pulsing, with a “Running…” placeholder), output succeeded = green, execution failed / non-zero exit code / killed by a signal = red, user aborted = warning color. Errors are attributed to the input side for `INVALID_ARGS` / `UNKNOWN_TOOL` / `ABORTED_BEFORE_DISPATCH` and to the output side for all other execution-time errors; when the error code is missing, raw arguments that are not a valid JSON object also count as the input side. Input and output never interfere; when the input side fails, the OUT segment is marked “Skipped” and keeps a neutral color.
- **Segment text colors**: when the input side fails, the IN code turns red; when the output side fails, the OUT code turns red; normal content uses the default foreground color that follows the inner tone and the light/dark appearance, so light inner tones never produce light-on-light text. Segment bars in running/preparing states breathe in brightness (pulse) by status; labels and dividers also use the inner-tone tokens.
- **Shell / inner two-tone layers (uniform across all three card types)**: file-change cards, command cards, and other tool-call cards all use the same “shell + inner” structure. The shell, title bar, file bar, and settings dialog use the current theme's own shell color (third-party themes show their own tint); derived colors resolve at the `body` layer, so both the official theme (tokens on `body`) and skin themes (tokens on `:root`) are followed correctly, and switching between the official and stock appearances leaves no tint of the previous theme behind. Inner diff lines and command/tool IO content use the code-block surface of the official DSH appearance (near-black gray in dark, near-white in light) with matching light/dark foregrounds. Command cards no longer show an all-over green overlay; status is expressed by the header status dot/label, non-zero exit code, and IN/OUT segment bars; failure text appears only inside the corresponding IN / OUT segment, and the card ends at the IO panel without appending a repeated error line or an extra shell band below it.
- **Independent colors per card type**: in settings, file-change cards, command rows, and other tool calls each have their own “shell tone / inner tone” options — shell can be auto (theme + appearance) / light / dark, and inner can be auto (official appearance) / light / dark / same as shell (a single unified surface instead of a two-tone one); the three do not affect each other.
- **Appearance awareness (light / dark / follow system)**: the plugin reads the light/dark appearance the host actually resolves (`color-scheme`): in dark appearance the shell takes the theme's dark tint and the inner area uses the official dark-gray code surface; in light appearance the shell becomes the theme's light/near-white and the inner area the official light code surface, with text colors darkening accordingly, avoiding light-on-light or washed-out gray.
- **Opaque surfaces**: third-party themes' card/popover tokens are often semi-transparent; the plugin lays an opaque background under theme colors so cards, diff dialogs, and settings windows stay readable and never let the wallpaper show through. The settings dialog's surface uses the theme's **layered** token (`bg-layer-2`) instead of the scrim token `bg-overlay` — in the official dark theme the former is `#2c2c2e` deep gray while the latter is mid gray, and using the latter would wash the whole panel out to a pale gray.
- **Appearance details aligned with the official UI**: cards use the host's radius tokens; IN/OUT bars are 2.5px left strokes that follow the card's bottom rounding; the two segments are separated by a single thin divider; the expanded dialog and settings dialog clip their own rounded corners, and scrollbars hug or inset from their regions as appropriate.
- **Large-file / history-replay fallbacks**: when a budget is exceeded, the plugin falls back to the tool-metadata diff blocks with an explicit notice; when history replay cannot provide whole-file comparison or line numbers, the expanded dialog explains why and greys out “Whole file”.
- **Theme safety and palette safety**: shell, text, and border colors come from host theme tokens (`--dsw-alias-*`) by default; syntax-highlighting foregrounds use the plugin's own restricted palette — blue→purple, red/green-free, with contrast calibrated separately for dark/light — and no other colors are hard-coded; it follows DSH's native theme, third-party themes, and light/dark modes. Palette safety is asserted by unit tests, so any change that introduces red/green highlight colors makes the tests fail.

## Compatibility

| Environment | Support |
| --- | --- |
| DSH desktop (Desktop profile) | ✅ Verified |
| DSH Web UI (Web profile) | ✅ Verified (DSH 0.2.2-rc.2); the plugin must be installed separately in that profile |
| Browser / Electron embedded WebView | ✅ The client uses standard Web platform APIs |
| Third-party themes / desktop pets / skins | ✅ Colors follow theme tokens; themes that intercept and replay clicks to fold (e.g. claude-style) are handled: card headers carry an `aria-haspopup` exemption and only respond to real user gestures; themes and desktop pets are external plugins and do not affect installing this plugin |
| Startup-animation plugins (custom intro animations, etc.) | ✅ They do not take over each other's slots; animation keyframes and styles use the plugin namespace (`dsh-inline-diff-*`); the Read range observer only reacts to Read-row-related changes |

**DSH version range (`engines.dsh`)**: `>=0.2.2-rc.1 <0.3.0`. The current version has been verified against DeepSeek Harness `0.2.2-rc.1` (desktop profile) and `0.2.2-rc.2` (Web profile: plugin loading, snapshots, syntax highlighting, themes/appearance, settings and the update panel); the `engines.dsh` range is unchanged.

The plugin declares `engines.dsh` in `plugin/package.json`; DSH's plugin loader validates that range and **refuses to auto-load the plugin when it is out of range**, so an unverified host version is never treated as a usable environment. The plugin manifest also declares `dsh.client.platform: web`; the Host side only uses the generic `webServer`, `tools/result`, and Node.js file-reading capabilities, and does not depend on Electron or desktop-only APIs.

> Note: DSH plugins are installed **per profile**. If the desktop app and the Web UI use different profiles, install the plugin once in each; the plugin never syncs across profiles automatically. Before upgrading DSH to `0.3.0` or later, please wait for a compatible release of this plugin.

## Installation

### Method 1: Install from npm (recommended)

> The npm package has been available since **1.3.0**, under the package name `@him666233/dsh-inline-diff`.

```bash
dsh plugin add @him666233/dsh-inline-diff
```

You can also install it from the DSH Web UI under **Plugins → Add plugin** by entering the package name directly (an equivalent entry point). The command installs the package into the current profile's `node_modules` and automatically registers the package in the profile's `dsh.profile.bundles`; DSH loads the plugin after validating `engines.dsh` and the bundle patch.

- If the desktop app and the Web UI use different profiles, install once in each (`dsh plugin --profile <name> add @him666233/dsh-inline-diff`);
- Refresh the page or restart DSH after installing; the first install needs access to an npm registry (the official npm registry by default, with DSH falling back to npmmirror when the registry is unreachable).

### Method 2: Local directory / offline install

1. Download this repository or the plugin package from a Release and extract it;
2. Open the DSH plugin-management page → **Add plugin** and enter the absolute path to the extracted `plugin/` directory (a local zip archive is also accepted);
3. Refresh or restart DSH.

The `plugin/` package directory ships its own `package.json`, `client.js`, `index.js`, `cordis.patch.yml`, locale, and icon, so DSH can load it directly as a local bundle.

### Method 3: Manual link install (development/debugging)

Link `<repo>/plugin` into the target profile:

```bash
cd ~/.dsh/profiles/<profile>
pnpm add link:/absolute/path/to/dsh-inline-diff/plugin
```

Then add the following to that profile's `package.json`:

```json
{
  "dependencies": {
    "@him666233/dsh-inline-diff": "link:/absolute/path/to/dsh-inline-diff/plugin"
  },
  "dsh": {
    "profile": {
      "bundles": ["@him666233/dsh-inline-diff"]
    }
  }
}
```

Restart DSH for it to take effect. If the desktop app and the Web UI use different profiles, run this once in each.

### Method 4: Install from GitHub Release (offline package)

1. Open [Releases](https://github.com/Him666233/dsh-inline-diff/releases) and download the current version's `dsh-inline-diff-<version>-plugin.zip` (plugin package) or `dsh-inline-diff-<version>.zip` (full source package);
2. After extracting, hand the absolute path of the `plugin/` directory to **Add plugin** as described in Method 2;
3. Verify the download: the hashes in `SHA256SUMS.txt` should match the Release page (on Windows you can check with `certutil -hashfile <file> SHA256`).

> Release attachments (zips, `SHA256SUMS.txt`, release notes) are publishing assets and do not enter the source repository; the repository's `release/` directory is only the maintainer's local packaging-output directory (already ignored in `.gitignore`).

### Upgrading and uninstalling

- **Upgrade (npm installs)**: `dsh plugin add @him666233/dsh-inline-diff@<version>`; or uninstall it from the plugin page and install the latest version again. Third-party bundles do not offer an in-place upgrade button.
- **Uninstall**: `dsh plugin remove @him666233/dsh-inline-diff`, or click “Uninstall” on the plugin page (confirmation required).
- **Local link / Release installs**: replace the `plugin/` directory and refresh or restart; to uninstall, remove the dependency and the `dsh.profile.bundles` entry from the profile's `package.json`.
- Do not keep a link copy and an npm copy in the same profile at the same time — both would register the same slots (manifesting as duplicate cards or duplicate-key errors).

### Interface language and documentation language

- **Interface language**: choose “中文 / English / **Follow DSH (default)**” on the plugin settings page; the change takes effect immediately without a refresh, and DSH's global language setting is never modified. Since 1.4.0 the default is “Follow DSH” (Chinese when DSH is Chinese, English for other host languages). Old archives that never explicitly picked a language migrate once to “Follow DSH”; explicitly chosen Chinese/English is preserved (pick Chinese again to pin it).
- **Documentation language**: Chinese is the primary documentation ([README.md](README.md)), and the English documentation is in this file ([README.en.md](README.en.md)); the npm package ships both `README.md` and `README.en.md`.

### Building from source

```bash
npm install
npm run build      # -> plugin/client.js + plugin/cordis.patch.yml (package name read from plugin/package.json)
npm run check      # syntax / JSON validation, plus checks that the committed client.js and cordis.patch.yml match the source and package name
npm test           # unit tests for the diff engine, card model, language detection, highlight palette, tool status, read range, i18n, version updates, and security regressions (164 tests)
```

Node.js 20+ is required; the build-time dependencies are `esbuild` and `highlight.js` (syntax modules are bundled into `client.js`). The plugin has no runtime dependencies beyond React and the Web services provided by the host.

## Usage

### Inline cards

In the conversation, find the **Edit** / **Write** / **Replace** cards:

- Click the card header to expand or collapse the line-by-line diff;
- Click the **Expand** button or the **Side-by-side** link at the bottom to open the side-by-side dialog;
- Click the **Trace** pill button in the top-right corner (shared by inline cards, command rows, and other tool rows) to jump to the corresponding trace entry;
- Click the file path in the title to open the file in the host's file panel (when the host provides that capability);
- The OLD / NEW legend above the gutter shows which column belongs to which side: removed lines' old numbers are tinted red and added lines' new numbers are tinted green, so you can still tell which column is before and which is after when the numbers are misaligned;
- Cards show the **execution snapshot of that edit** and do not refresh automatically as the file changes later; the “Whole file” tab in the expanded dialog shows the same snapshot. For data sources, refresh rules, and dialog layering, see [Display behavior](docs/display-behavior.en.md).

The inline card content area is at most 360px tall and scrolls internally beyond that; when collapsed, the diff area shows at most 42 lines (the line budget is allocated in change order), and the remaining lines are available through **Expand**.

### Command and tool rows (expanded style)

After setting **Command rows** and/or **Other tool calls** to **Expanded**:

- Command rows show IN/OUT in a terminal style: IN is the command text (falling back to raw arguments when they are malformed) and OUT is the output text; the two segments scroll independently with their own status bars; the header status dot, non-zero exit code, and status label together express the result;
- Other tool calls (generic, details, search, and web) open IN/OUT by default and keep a fold button; titles use the localized tool names (e.g. `grep` = Search file contents, `glob` = Find files, `web_search` = Web search, `web_fetch` = Fetch page);
- Search/web row summaries show the search keyword and path, the filename pattern and path, the search term or the fetched URL; finished calls show match count, matched-file count, source count, or an HTTP status badge;
- On an input-side failure (argument/dispatch problems) the IN bar turns red, the OUT segment is marked “Skipped”, and an error summary is shown; on an output-side failure (execution error, non-zero exit code, signal termination) the OUT bar turns red; user aborts use the warning color;
- Switching back to **DSH native** releases this plugin's registrations and restores the official search/web rich-result cards and the official command row.

### Settings

**UI language (new in 1.3.0; Follow DSH is the default since 1.4.0; independent of DSH's global language)**:

| Setting | Options | Description |
| --- | --- | --- |
| Language | 中文 / English / **Follow DSH (default)** | The language of the plugin's own UI. The default is **Follow DSH**: Chinese when DSH is Chinese, English for other host languages (English is used when no dictionary matches). The switch takes effect immediately without a refresh, never modifies DSH's global language, and does not affect other plugins. Documentation language: Chinese is the default ([README.md](README.md)), and English is in this file ([README.en.md](README.en.md)). |

**Version & updates (new in 1.4.0)**:

| Action | Description |
| --- | --- |
| Check for updates | The Host proxies npm registry requests (60s cache) and lists every published version, showing the current version, DSH version and latest version at a glance. |
| Pick a version | The action button becomes “Update to vX” (higher), “Roll back to vX” (lower) or “Reinstall vX” (same); deprecated/unavailable versions (such as stub packages) are disabled. |
| Install | On Web, the official plugin-install command runs with an in-process mutex, version allow-list validation and a 240s timeout; on failure the CLI rolls back and the log is shown, and on success you are told to **restart DSH** (a page refresh is not enough). On Desktop a copyable command is shown and DSH must be fully quit first. |
| Caveat | Updating/rolling back changes only the plugin installation of the current profile; a one-click install replaces the current installation with the npm release, so avoid it when you need to keep a local dev build. Unpublished versions are never listed. |

> The top of the settings page also shows a prominent **originality notice**: this project is a fully original work and has no relationship with any same-named/similar plugin (including [JanEickholt/dsh-inline-diff](https://github.com/JanEickholt/dsh-inline-diff)); see the statement at the top of this document for details.

Four display styles (defaults: file-change cards = Expanded; command rows, other tool calls, process folding = DSH native):

| Setting | Options | Description |
| --- | --- | --- |
| File-change cards | Expanded / DSH native | Expanded = this plugin's per-edit inline diff cards; DSH native = the official file-mutation row; shell/inner tones can be set separately below |
| Command rows | Expanded / DSH native | Expanded = a flat command card that opens IN/OUT by default; DSH native = the official bash / pwsh / win_bash row; shell/inner tones can be set separately below |
| Other tool calls | Expanded / DSH native | Expanded = generic/details/search/web tool calls open IN/OUT by default (including `grep` / `glob` / `web_search` / `web_fetch`); rich-result cards such as read, todo, questions, and images stay native; shell/inner tones can be set separately below. Enabling this takes effect immediately and, when process folding is DSH native, automatically switches it to Unfolded — otherwise completed tool rows would be hidden by DSH folding groups |
| Process folding (whole chat) | Unfolded / DSH native | Unfolded = writes the DSH `ui-chat.transcriptView = verbose` preference; DSH native = keeps your existing preference; switching back restores the pre-enable value where possible |

Syntax highlighting and language badge (added in 1.1.0, independent of the display styles above):

| Setting | Options | Description |
| --- | --- | --- |
| Syntax highlighting | On / Off | Colors code lines in cards and the expanded dialog by detected language; when off, uses the default foreground color for the current light/dark appearance |
| Language badge | Short code / Full name / Hidden | Style of every language badge; short codes such as `TS`, `MD`, full names such as `TypeScript`. Choosing “Hidden” hides all badges (including plain text and unknown language); the “Unknown language” setting only applies while badges are visible |
| Unknown language | Show “Unknown” / Hide | What to do when the language cannot be detected (dashed badge or nothing); no syntax highlighting in that case |
| Font emphasis | Color + font style / Color only | When on, keywords/types/function names/tags are bold, comments italic, links underlined; when off, color alone distinguishes them |

The settings page also lets you expand **Supported languages** to view the 57 languages currently supported (sorted by name; plain text is not listed).

Settings entry points:

- Bottom of the sidebar: **Diff style** (opens the same settings dialog);
- DSH settings page: **Inline Diff** (the settings panel is titled “Inline Diff · Display”).

Settings are saved in the browser's `localStorage` (key `dsh-inline-diff.settings.v5`); old `v4` / `v3` / `v2` values are migrated to the new format on first load and the old keys are removed (the old `v1` key is also cleaned up on save). The default UI language is “Follow DSH”; archives that never explicitly picked a language migrate once to Follow DSH, while explicit choices are preserved. The process-folding option is written through DSH's official `configForms` service and can be restored at any time. **Reset to defaults** restores all options and DSH's transcript preference to their defaults; if **Other tool calls** changes as a result, the page refreshes once automatically to apply it.

### Read range

When a Read tool row is collapsed, the range label sits to the right of the file name; disjoint reads are separated by ` · ` and omitted with `…` after 4 segments. Expanding the row hides the label and shows the full DSH native Read card content. While a call is still running, the range is estimated from the `offset` / `limit` arguments; once it finishes, the actual line numbers from the tool result are used.

## Project structure

```
dsh-inline-diff/
├─ src/client/                 # browser-side source (each file covers exactly one kind of responsibility)
│  ├─ index.jsx                # plugin entry / slot registration / settings-driven re-registration
│  ├─ project.js               # author, repository, version and other identity info (single source)
│  ├─ i18n.js                  # bilingual core: language resolution, dictionary translation, fallback chain, component wrapper
│  ├─ locales.js               # Chinese/English dictionaries (zh / en)
│  ├─ components.jsx           # inline diff cards and side-by-side dialog
│  ├─ diff.js                  # line alignment / hunks / moves / inline token diff / line location
│  ├─ model.js                 # tool call -> card model (including preview and fallback models)
│  ├─ tool-status.js           # IN/OUT segment status and failure attribution (pure functions)
│  ├─ languages.js             # language registry / path and shebang detection
│  ├─ highlight.js             # highlight.js token extraction, per-line cache, and budgets
│  ├─ syntax-styles.js         # highlight palette, font emphasis, and language badge styles
│  ├─ enhanced-tools.jsx       # expanded-style tool call rows (search/web/generic/details)
│  ├─ enhanced-shell.jsx       # expanded-style command rows (bash/pwsh/win_bash)
│  ├─ read-range.js            # Read line-range extraction (pure functions)
│  ├─ read-range-dom.js        # page-level Read range mounting (MutationObserver)
│  ├─ settings.js              # settings storage, migration, defaults, and DSH preference linkage
│  ├─ settings-ui.jsx          # settings page / dialog (including language switch and originality notice)
│  ├─ styles.js                # theme tokens and card/dialog styles
│  ├─                # version/update pure logic (semver, version rows, action labels)
│  └─ api.js / store.js        # host communication / dialog state
├─ plugin/                     # installable plugin package (Host + built client.js + locale + icon)
│  ├─ index.js                 # Host half: snapshot LRU, read-only file APIs and version-update APIs
│  ├─ client.js                # build output (do not edit by hand; generated by build.mjs)
│  ├─ cordis.patch.yml         # build output (bundle plugin line, package name written automatically)
│  ├─ package.json             # npm package manifest (dsh.bundle.patch / engines.dsh / dsh.client)
│  └─ README.md / README.en.md # npm page docs (Chinese / English)
├─ tests/                      # pure Node unit tests (diff, model, languages, highlighting, palette, status, read range, i18n, security)
├─ docs/                       # Chinese screenshots and documentation
│  ├─ display-behavior.md      # display behavior (Chinese)
│  ├─ display-behavior.en.md   # display behavior (English)
│  ├─ publish.md               # maintainer guide for publishing to npm / GitHub
│  └─ en/                      # English UI screenshots (same names as the Chinese ones)
├─ release/                    # local release packaging output (ignored in .gitignore; uploaded as GitHub Release assets)
├─ scripts/                    # maintainer scripts (not part of the plugin runtime)
│  ├─ set-package-name.mjs     # one-command npm package rename (syncs manifest / patch / client.js / README)
│  └─ build-release.mjs        # one-command GitHub Release packaging (two zips / SHA256SUMS / release integrity checks)
├─ .github/workflows/ci.yml    # CI: npm run check + npm test
├─ build.mjs                   # esbuild bundling / build validation (single source for the package name)
├─ package.json                # workspace manifest (private, development only)
├─ README.md / README.en.md    # main docs (Chinese / English)
├─ CHANGELOG.md / LICENSE
```

> Convention: each file in `src/client/` covers exactly one kind of responsibility; `plugin/` holds only installable artifacts; `docs/` holds only documentation and screenshots; `release/` holds only packaging output; all tests live in `tests/`. Before adding a file, decide which layer it belongs to and do not mix layers.

For display details of inline cards, the expanded dialog, and the settings dialog, see [docs/display-behavior.en.md](docs/display-behavior.en.md).

## Internals

### Host side

- Listens on `tools/result`, captures `{ path, before, after, operation }` for successful `edit` / `write` calls, and stores them as **in-memory** snapshots keyed by “session + call ID” (LRU: at most 240 entries, 4 MB of text per side, plus an additional **64 MB total** cap; when any budget is exceeded the oldest entries are evicted; oversized writes are not snapshotted and their cards fall back to changed-hunk mode);
- Provides **read-only display APIs plus a restricted version-update API**; every route (including `/ping`, 404, and 405) first passes the browser trust-boundary check:
  - admission first reuses the DSH `connection` service's `admit(req)` (the official host / origin / cross-site fence plus an HttpOnly, SameSite=Strict browser session cookie);
  - embedded profiles without a `connection` service fall back to a local fence: `Host` must be loopback or the listener's bound address, `Origin` must be same-authority, and `sec-fetch-site: cross-site` is rejected; any exception **never fail-opens**;
  - `POST /dsh-inline-diff/api/snapshot`: returns a snapshot by `sessionId + callId`;
  - `POST /dsh-inline-diff/api/read`: reads a file inside the root directory supplied by the requester (two-layer realpath containment; 2 MB per file; 15-second read timeout; at most 8 concurrent reads, returning 429/504 beyond that; binary files return `binary`, and the UTF-8 BOM is stripped);
  - `GET /dsh-inline-diff/api/ping`: health check (returns the current snapshot count), equally protected by admission (the browser profile requires the session cookie);
  - `GET /dsh-inline-diff/api/update/versions`: reads npm version metadata for `@him666233/dsh-inline-diff` (registry packument, 60s Host cache, 12s timeout) and returns the installed version, DSH version, installer mode and all versions; external network is touched only when the user clicks “Check for updates”;
  - `POST /dsh-inline-diff/api/update/install`: validates that the target version exists in the registry list and is installable, then serially spawns the official `dsh plugin --profile <name> add <pkg>@<version>` command (argv only, no shell; 240s timeout kills the process tree) and verifies the installed version afterwards; available on Web, while Desktop returns a copyable degraded command;
- `POST` request bodies are capped at 1 MB, accept only `application/json`, and have a 10-second read timeout (413 / 415 / 408 beyond that); responses consistently carry `nosniff` / `no-store` / `referrer-policy` / `Cross-Origin-Resource-Policy` headers; errors use semantic status codes and fixed copy and **never echo** file-system errors, absolute paths, or stack traces;
- Snapshots live only in memory and are never persisted; after an app restart, historical cards degrade to “changed hunks + line numbers located in the current file”, so whole-file comparison is unavailable.

### Client side

- Uses `ctx.slots` with keyed `tool.call.toolview` to take over the file cards for `edit` / `write` / `str_replace_editor`, the command rows for `bash` / `pwsh` / `win_bash`, and generic/details/search/web tool rows; it does **not shadow** the tool-call entries of `conversation.chat.node` — on dsh ≥0.2.2-rc.1 the official Tool layer (`@deepseek-ai/dsh-client-ui-tool`) owns that entry and declares the `tool.call.toolview` sub-slot, and declaring it again throws `slot "tool.call.toolview" is already declared`, so the plugin only performs keyed registration and lets the official tool-call tree dispatch by tool name; unregistered tools keep the official generic row;
- Releases and rebuilds this set of registrations when the display style changes: after switching back to DSH native, the official rich-result cards are restored exactly;
- Trajectory jumps use a unified text “Trace” pill button, at the same position for inline diff cards and all expanded-style tool rows;
- A pure browser-side implementation of LCS alignment (4000 lines per side / 2.5 million cells budget, degrading to prefix/suffix + replacement-block coarse alignment when exceeded), ±3 lines of context for hunk grouping, inline token diff (4000 characters per line, 160k cells, 2 million cells for a whole segment), moved-block pairing (≥2 lines, or a single line with display width ≥12 cells, up to 120 lines, tolerating boundary blank lines), passive shift gaps, and budget fallbacks for very large files;
- Language detection and highlighting: `languages.js` builds extension/filename Maps at module load (O(1) lookups); `highlight.js` tokenizes each side once with the highlight.js grammar, then parses the highlighted HTML back into per-line token ranges indexed by line number (history replay tokenizes locally per changed hunk when no full text is available), caching the result on the diff with a WeakMap; when either side exceeds 200k characters or 4000 lines, or a single line exceeds 2000 characters, highlighting is abandoned automatically and falls back to the default foreground color;
- IN/OUT segment status is derived by pure functions in `tool-status.js` (input-side error codes, argument-validity fallback, non-zero exit codes, and abort markers), and the render layer colors segment bars and text by status; status changes pulse via brightness breathing of the stroke color;
- Palette safety is generated from a single palette in `syntax-styles.js` as CSS and asserted by `tests/syntax-palette.test.mjs` (hue window 180°–285°, WCAG contrast, readability on red/green add/remove backgrounds) — any change that introduces red/green highlighting makes the tests fail;
- Light/dark appearance is synced from the root element's `color-scheme` to `data-dsh-inline-diff-appearance`, then combined with each card's `data-shell-tone` / `data-inner-tone` to pick shell and inner tones;
- Motion lives in a few pure helpers in `motion.js` plus the stylesheet: only three “appearing” moments animate (running card mount, output arrival, dialog open), while historical replay and settled cards render their final state immediately; only opacity/transform are used and everything is disabled under `prefers-reduced-motion: reduce`;
- The “Version & updates” panel reads the version list and starts installs through the Host API, showing the result (success/failure/log tail) in place; version comparison, row flags and action labels are pure functions in `updates.js` covered by unit tests;
- Read ranges are mounted after the official Read row's filename with a page-level `MutationObserver`; it only reacts to Read-row-related DOM changes and scans after the first frame, without depending on any single internal rendering path;
- The full-screen dialog and the settings dialog are mounted to `document.body` via React Portal so third-party floating layers cannot cover them; click the backdrop or press Esc to close.

### Multi-level fallbacks and fault tolerance

Every feature is designed along “primary path → fallback → display degradation → explicit explanation”, so that in extreme cases the plugin degrades the display instead of crashing:

| Scenario | Primary path | Fallback 1 | Fallback 2 (final) |
| --- | --- | --- | --- |
| Before-image text | Host in-memory execution snapshot | `/read` the current file to fill in line numbers | `meta.diffs` blocks from the tool result + “line numbers pending / no execution snapshot” notice |
| Whole-file comparison | Exact alignment of the snapshot's full text | Coarse alignment for very large files (truncated to 4000 lines) | Tab greyed out + reason explained in the dialog |
| Very large input | Full diff (within the 200k-line materialization budget) | Changed hunks / stats only + “file too large” fallback notice | No per-line rendering; the page never freezes |
| Syntax highlighting | Per-language highlight.js tokenization | Over budget / unknown language / plain text → default foreground color | Language badge and language detection still apply |
| Highlight HTML parsing | Per-line token ranges | Plain-text line-by-line rebuild (strict validation) | Highlighting abandoned; shown as plain text |
| UI language | The dictionary for the configured language | Chinese `zh` dictionary | The key itself (never throws) |
| Settings read | localStorage archive | In-memory defaults | Corrupt / oversized archive → discarded, defaults restored |
| Language detection | Extension / special filename / shebang | Plain-text marker | No highlighting |
| Host API admission | DSH `connection.admit` | Local loopback / bound-address fence | 403 rejection; the client API returns null and the card degrades |
| Tool-view registration | Keyed `tool.call.toolview` takeover | On registration failure, release and restore the official row | The official generic row (no throwing that would break the whole registration) |

> The implementations behind this table are documented in each module's comments; when adding features, keep the same fallback layers and give a readable explanation at the final fallback instead of failing silently or throwing.

### Data and privacy

- By default no network requests, no telemetry, no external services; never reads files outside the DSH session;
- The only exception is when the user explicitly clicks “Check for updates / Install”: the Host fetches npm registry metadata and invokes the local `dsh` CLI to install the plugin. Those requests contain only the package name/version — never session content, file content, keys or device information.
- The Host APIs have a browser trust boundary plus input/timeout/concurrency limits (see “Host side” above); the update API additionally enforces a profile-name allow-list, install-anchor and absolute CLI path checks, semver + registry allow-list validation for versions, a 2 MB / 200-version registry-response cap, a single-job mutex and a 240s timeout that kills the process tree; CLI arguments are passed as argv, never through a shell; the client uses no `innerHTML` / `dangerouslySetInnerHTML` / `eval` — highlighted HTML is only parsed into **plain-text tokens**;
- Snapshots have both entry-count and total-byte budgets, and diff materialization has line-count and per-line caps; when exceeded, the display degrades instead of freezing;
- Only the before/after text needed for display is kept briefly in Host memory; nothing is written to disk by default;
- Settings (including the interface language) are written only to the browser's localStorage; they contain no file contents;
- All colors are derived from host theme tokens; the plugin ships no wallpapers or character assets.

## Known limitations

- **Whole-file comparison depends on the snapshot**: history replay after an app restart cannot restore the before-image, so the tab is greyed out and the reason is shown in the expanded dialog.
- **`str_replace_editor` uses the no-snapshot fallback path**: the Host saves execution snapshots only for `edit` / `write`; `str_replace_editor` cards show the changed hunks from the tool result and try to locate line numbers in the current file, but whole-file comparison is unavailable. That tool produces no execution snapshot, so the card and the expanded dialog use a dedicated “this tool call keeps no execution snapshot” notice instead of history-replay wording (history-replay wording is used only when an `edit` / `write` snapshot has been lost).
- **Whole-file comparison shows an execution snapshot**: the same card always shows the before/after text of that edit and does not refresh to the file's latest version; to see the latest content, open the card from the most recent edit. For data sources and refresh rules, see [Display behavior](docs/display-behavior.en.md).
- **Scrolling the whole-file comparison of large files**: with many lines, fast scrolling can briefly flicker; the content comes from a static snapshot and is unaffected (see [Display behavior](docs/display-behavior.en.md) for details).
- **History-replay line numbers**: once a snapshot is lost, changed hunks are located again in the current file; if the file has since changed and the hunk cannot be located uniquely, the line numbers are marked “line numbers pending” and the expanded dialog explains that only the changed hunks can be shown. Deletion-only hunks may also fail to locate when the file offers too few context anchors.
- **Very large files**: when either side exceeds 4000 lines or the alignment budget (2.5 million cells) is exceeded, the plugin degrades to changed-hunk mode and turns move detection off; with tool-metadata diff blocks, whole-file comparison is unavailable, and with only coarse alignment the whole-file view is truncated to 4000 lines.
- **Materialization budget for very large input (new in 1.3.0)**: before splitting text into per-line objects, the browser side measures the text budget first; when either side exceeds 200k lines or a single line exceeds 1,000,000 characters, per-line content is no longer materialized — only accurate line counts and added/removed totals are kept, and a “file too large” fallback notice is shown (avoiding millions of per-line objects from 4 MB-scale input, which would freeze the page or cause OOM).
- **Move detection**: only identical contiguous line blocks are detected; blocks moved together with content edits are shown as ordinary additions/removals; single-line moves require a display width ≥12 cells, and multi-line moves over 120 lines are not annotated. Move detection is off in coarse-alignment mode (very large files).
- **Tools taken over**: file-change cards support only DSH native `edit` / `write` / `str_replace_editor`; `apply_patch` and manual writes keep DSH's native presentation and do not produce inline diff cards.
- **Scope of the color settings**: the “shell / inner tone” options for file/command/tool cards apply only to the corresponding tool cards; the expanded dialog and settings dialog follow the host's current appearance (light / dark) and theme shell color, and do not inherit the per-card color options.
- **Syntax highlighting is lexical**: highlighting relies only on the language grammar (highlight.js grammar), not on a language service; TOML uses the INI grammar, JSONC uses the JSON grammar, and Vue / Svelte / Astro use HTML/XML grammars for approximate highlighting; when history replay has no full text, multi-line structures (block comments, template strings, etc.) are inferred per changed hunk and may be slightly more conservative than in whole-file mode; if inline token highlighting exceeds the per-line/whole-segment budget, that line falls back to solid color.
- **Highlight budgets**: when either side exceeds 200k characters or 4000 lines, or a single line exceeds 2000 characters, highlighting is skipped and the default foreground color is used; the language badge and language detection still work.
- **Language badge**: “Language badge = Hidden” hides every language badge (including the plain-text marker and the unknown-language badge); the “Unknown language” option applies only while badges are visible; language detection and syntax highlighting still work as usual.
- **Rich-result cards**: rich cards such as read, todo, questions, and images are not covered by the expanded style and keep DSH's native interaction.
- **Search/web row interaction**: in expanded style, search/web calls are shown as raw IN/OUT; interactions from the official cards such as “click a matched file to open it” and “click a URL to open a new tab” exist only in “DSH native” mode.
- **Tool coverage of the expanded style**: command, generic, details, search, and web tool rows are taken over through keyed registration in `tool.call.toolview`, which applies only to tool names registered by the plugin; unregistered tools keep the official generic row on dsh ≥0.2.2-rc.1 (the plugin no longer covers the whole tool-call tree, avoiding duplicate sub-slot declarations with the official Tool layer).
- **Update limitations**: the panel lists only npm releases; unpublished builds never appear. A one-click install replaces the current profile installation with the npm release (a local dev build would be overwritten — avoid clicking it in a development profile). DSH must be restarted afterwards (a page refresh is not enough); reinstalling the same version may be skipped by pnpm as already up to date; Desktop v1 has no in-place one-click install and shows a manual command instead, requiring a full quit of DSH.
- **Motion**: entrance animations only cover “appearing” moments such as running cards and dialog opens; historical replay stays instant, and everything is disabled with the OS “reduce motion” preference.
- **Cross-profile**: the plugin is installed per profile and does not sync automatically.
- **Interface language is plugin-scoped**: the 1.3.0 language setting only affects this plugin's own UI copy; it does not modify DSH's global language and does not affect other plugins. “Follow DSH” follows DSH's global language (falling back to Chinese when the host language cannot be recognized or the matching dictionary is missing).
- **Documentation and screenshots come in two sets**: Chinese is the default primary documentation (`README.md`, `docs/*.md`) and English is the counterpart documentation (`README.en.md`, `docs/*.en.md`); screenshots live in `docs/` and `docs/en/` respectively, with matching file names.

## Development and contributing

```bash
npm install
npm run build
npm run check
npm test
```

- After changing `src/client/`, re-run `npm run build`; what gets installed is the built `client.js` in `plugin/`, and `npm run check` verifies that the committed `client.js` and `cordis.patch.yml` match the source and package name;
- Before committing, make sure `npm run check` and `npm test` pass; the tests cover diff alignment, the card model, language detection, highlight.js token extraction, syntax-highlight palette safety constraints, IN/OUT failure attribution, read range, one-sided gutter legend adaptation (`gutterSides`), i18n resolution/fallback/default migration, version-update pure logic, and security regressions;
- New UI copy must be added to both the `zh` and `en` dictionaries in `src/client/locales.js` (key sets and `{placeholders}` must match; `tests/locales.test.mjs` asserts it), with “Follow DSH” (`auto`) as the default language; new or modified code needs detailed Chinese comments that also explain the fallback path on failure;
- Project identity is maintained centrally in [`src/client/project.js`](src/client/project.js); when the repository is renamed, update that file, the `homepage` / `repository` / `bugs` fields in `package.json`, and the README links;
- Documentation: Chinese is primary (`README.md`, `docs/*.md`) and English is the counterpart (`README.en.md`, `docs/*.en.md`); Chinese screenshots go in `docs/` and English screenshots in `docs/en/`, with matching file names;
- Publishing:
  - npm: see [docs/publish.md](docs/publish.md) — `node build.mjs` → `node build.mjs --check` → `npm test` → `cd plugin && npm publish`; to change the npm package name, use `node scripts/set-package-name.mjs <new-package-name>` (it syncs the manifest, `cordis.patch.yml`, the `client.js` module id, and the README);
  - release assets: `node scripts/build-release.mjs` produces the two zips plus `SHA256SUMS.txt` under `release/` (it validates version/package-name/build-artifact consistency and archives older release assets into `release/archive/`);
  - GitHub: commit only files that belong to the repository; the two zips, `SHA256SUMS.txt`, and the release notes under `release/` are uploaded as GitHub Release assets and never enter the source history.

## Changelog

Current version: **1.4.0** (2026-11-12). Version date index:

| Version | Release date | Summary |
| --- | --- | --- |
| 1.4.0 | 2026-11-12 | Card/output/dialog motion (respecting reduced-motion), built-in version check with one-click update/rollback, default UI language changed to Follow DSH (with archive migration), readability fixes for syntax tokens on inline change segments and forced-opposite shell tones, verified on DSH 0.2.2-rc.2 |
| 1.3.0 | 2026-11-08 | Bilingual UI with an in-settings language switch (Simplified Chinese default, English, follow-DSH), English documentation and dual-language screenshots, originality notice in the settings page and docs, security hardening, detailed Chinese code comments and multi-level fallbacks, and the first npm release (`@him666233/dsh-inline-diff`) |
| 1.2.6 | 2026-11-07 | Fixes for shell colors under the official theme, the stray shell band under failed command cards, gutter legend alignment and one-sided adaptation, and badge hiding semantics |
| 1.2.5 | 2026-11-07 | Old/New gutter legend, fixed dialog notice banner and settings dialog title, inset scrollbars |
| 1.2.4 | 2026-11-07 | IN/OUT scrollbars flush with the edge, Before/After bars moved into the expanded dialog title, fixed header bar layering |
| 1.2.3 | 2026-11-06 | Restored card bottom rounding, IN/OUT bars changed to left strokes that follow the rounded corner |
| 1.2.2 | 2026-11-06 | IN/OUT bars connected flush at the top, inline highlighting denoising, consistent move annotations |
| 1.2.1 | 2026-11-06 | Removed the duplicate `conversation.chat.node` slot declaration from the official Tool layer |
| 1.2.0 | 2026-11-06 | IN/OUT segment status and colors for command cards and tool-call cards |
| 1.1.1 | 2026-11-06 | Continuous inline character-level highlighting |
| 1.1.0 | 2026-11-06 | File-card language detection, syntax highlighting, and configurable language badge |
| 1.0.1 | 2026-11-05 | Expanded style for search/web tool rows, unified Trace button and wording |
| 1.0.0 | 2026-11-05 | First public open-source release |
| 0.2.2 | 2026-11-03 | Inline highlighting, move ranges, tests |
| 0.2.1 | 2026-11-03 | Installation and styling fixes |
| 0.2.0 | 2026-11-03 | Expanded style and tool-row configuration |
| 0.1.0 | 2026-11-02 | Internal prototype |

For detailed changes, see [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE) © 2026 [Him666233](https://github.com/Him666233)
