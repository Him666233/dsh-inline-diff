# Inline Diff

[中文](README.md) | English

> **Originality notice (important)**: This project is **an entirely original work**. It has **no relationship whatsoever** with [JanEickholt/dsh-inline-diff](https://github.com/JanEickholt/dsh-inline-diff) **or any other plugin, repository, or project with the same or a similar name**. This project did not reference, copy, or port any of those projects; the implementation approach, module split, code organization, and final rendering are completely different. Any similarity in part of the functionality (inline diff display in conversations) is **coincidental** — this project only discovered the same-named/similar project when searching for similar plugins after the implementation was already complete. This project is **not** a derivative work, a re-creation, or a fork of any other project.

DeepSeek Harness plugin: renders inline diff cards in place for every `edit` / `write` / `str_replace_editor` call in the conversation, automatically detects the file language (57 languages) and applies red/green-safe syntax highlighting, and provides side-by-side comparison, inline character-level highlighting, moved-block and passive line-number annotations, and Read range display; command, search, web, and generic tool calls can also switch to the expanded style (IN/OUT open by default), and command and tool cards color their input/output status per segment. **Since 1.3.0 the UI and documentation are fully bilingual (Chinese / English), with an independent language switch on the settings page; since 1.4.0 the default is “Follow DSH”, and the release adds card/output/dialog motion plus a built-in version check, update and rollback panel in the settings page.**

- **Author**: [Him666233](https://github.com/Him666233)
- **Repository**: [Him666233/dsh-inline-diff](https://github.com/Him666233/dsh-inline-diff)
- **License**: MIT
- **npm**: `@him666233/dsh-inline-diff`
- **Current version**: 1.4.0

> “Expanded style / Expanded” in the settings means the expanded, flat, transparent output style of modern coding agents; the project contains no third-party product brand names.

## Compatibility

- **DSH version range (`engines.dsh`)**: `>=0.2.2-rc.1 <0.3.0`
- **Tested versions**: `0.2.2-rc.1` (desktop profile) and `0.2.2-rc.2` (Web profile)
- Outside the `engines.dsh` range, the DSH loader refuses to load the plugin and never silently runs an unverified version
- If the desktop app and the Web UI use different profiles, the plugin must be installed separately in each
- Does not shadow the tool-call entries of `conversation.chat.node` (the official Tool layer owns that entry and declares the `tool.call.toolview` sub-slot, and declaring it again throws); only registered tool rows are taken over through keyed `tool.call.toolview`, and unregistered tools keep the official generic row
- Does not take over slots from startup-animation plugins; animation keyframes use a separate namespace (`dsh-inline-diff-*`), and the Read range observer only reacts to Read-row-related DOM changes, avoiding contention with startup animations for the main thread
- Coexists with third-party themes: keyed `tool.call.toolview` uses priority `-100` to avoid duplicate-key conflicts with theme plugins that also register tool views (e.g. claude-style registers at `-1`); card headers carry an `aria-haspopup="false"` exemption and only respond to real user gestures, so a theme replaying a synthetic click when its fold animation ends cannot turn “Expand / Trace / file path” clicks into a card collapse

## Installation

Install from npm in DSH (recommended):

```bash
dsh plugin add @him666233/dsh-inline-diff
```

You can also install it from the DSH Web UI under **Plugins → Add plugin** by entering the package name directly. If the desktop app and the Web UI use different profiles, install in each; refresh the page or restart DSH after the plugin loads. The npm package name is written both in this package's `cordis.patch.yml` (the bundle plugin's module name) and in `client.js` (the browser module id) — never change just one of them.

Other installation methods (the older methods remain available):

- **Local directory / offline install**: hand this directory (`plugin/`) to DSH under **Plugins → Add plugin** (enter the absolute path), or extract `dsh-inline-diff-<version>-plugin.zip` from a Release and select the extracted `plugin/` directory;
- **Manual link (development/debugging)**: see below;
- **Upgrade**: `dsh plugin add @him666233/dsh-inline-diff@<version>`, or uninstall and reinstall from the plugin page; **uninstall**: `dsh plugin remove @him666233/dsh-inline-diff` (or uninstall from the plugin page). Do not keep a link copy and an npm copy in the same profile.

For local development or offline install, install this directory (`plugin/`) as a local plugin, or link it manually:

```bash
cd ~/.dsh/profiles/<profile>
pnpm add link:/absolute/path/to/dsh-inline-diff/plugin
```

Then add the following to the profile's `package.json`:

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

## Features

- Per-edit inline diff for edit / write / str_replace_editor with exact old/new line numbers; each change carries an OLD / NEW legend above its gutter (strictly aligned with the gutter; changes with line numbers on only one side, such as a new file, show only that side), removed lines' old numbers are tinted red and added lines' new numbers tinted green and bolded;
- Compact gutter and clearer card borders: content is inset and code starts further left, while added/removed color bars still run edge to edge;
- Inline character-level highlighting that marks only genuinely changed fragments in deep red/deep green; whitespace and punctuation shared by both sides of a replacement merge into the change region to form one continuous highlight band, and isolated whitespace/punctuation differences are never falsely marked;
- Moved blocks labeled “moved to / moved from old/new Lx–Ly” (single-line moves are judged by display width and annotated only at ≥12 cells); passive line-number shifts explained as `old Lx–Ly → new Lm–Ln · line numbers shifted ±N`;
- Side-by-side dialog and whole-file comparison (backed by the Host's in-memory snapshot); Changes mode groups by change with sticky change headers, and the replay notice banner and “Before / After” bars stay fixed below the title while the scrollbar belongs only to the comparison content;
- Fixed file/change headers; when a Read row is collapsed, the actual line range appears next to the file name (disjoint ranges separated by ` · `, omitted after 4 segments), and expanding it keeps DSH's native presentation;
- Automatic file-language detection (57 languages, by extension, special filenames, and shebang first line) with a language badge in the card header and the expanded dialog (short code / full name / hidden; “Hidden” hides every badge; while badges are visible an unknown language can show a dashed badge; plain text shows a “Plain text” marker);
- Per-language syntax highlighting: code lines in inline cards and the side-by-side dialog are colored consistently; the palette is limited to the blue→purple range (hue 180°–285°) and deliberately avoids red/green/orange/yellow/magenta so it never reads as an added/removed marker; every foreground color reaches ≥ 4.5:1 contrast on the official dark/light code surfaces; when highlighting is off, or the language is unknown or plain text, it falls back to the default foreground color (following light/dark appearance);
- Four syntax-highlighting settings: on/off, language badge (short code / full name / hidden), unknown language (show / hide), and font emphasis (color + font style / color only: keywords etc. bold, comments italic); the settings page can expand to view the 57 supported languages;
- grep / glob / web_search / web_fetch share the expanded style with generic tool calls: category icon, keyword/path/URL summary, match/file/source/HTTP-status badges, and IN/OUT open by default;
- Inline diff cards and all expanded-style tool rows share the same “Trace” pill button;
- The left color bar of command and tool-call cards shows status independently for IN/OUT: IN preparing/awaiting output = theme color (pulsing), input side completed = green, input side failed = red; OUT running = theme color (pulsing, with a “Running…” placeholder), output succeeded = green, execution failed/non-zero exit = red, user aborted = warning color; failures are attributed to the input or output side by error code (falling back to whether the raw arguments form a valid JSON object when the code is missing), and the OUT segment is marked “Skipped” when the input side fails; input-side failures turn IN code red and output-side failures turn OUT code red, while normal text follows the inner tone and light/dark appearance;
- File-change, command, and other tool-call cards all use the “shell + inner” two-tone structure; the shell follows the current theme (including third-party themes) — derived colors resolve at the `body` layer, so both the official stock theme (tokens on `body`) and skin themes (tokens on `:root`) are followed correctly and no tint of the previous theme remains after switching; the inner area uses the code-block surface and matching text color of the official light/dark appearance; the three card types can each configure shell/inner tones (shell: auto / light / dark; inner: auto / light / dark / same as shell);
- Reads the host's actual light/dark appearance (light / dark / follow system); cards and the settings window automatically use readable backgrounds and text colors, so a third-party theme switching to light never produces light-on-light text; dialogs and cards are opaque surfaces and never show the wallpaper through;
- Four independent display options: file cards, command rows, other tool calls, and process folding; the settings dialog has a fixed title bar with independently scrolling content and scrollbars that hug or inset from their regions as appropriate.

## Settings

Bottom of the sidebar → “Diff style”, or the DSH settings page → “Inline Diff”:

**Language (new in 1.3.0; Follow DSH is the default since 1.4.0)**:

| Setting | Options |
| --- | --- |
| Language | 中文 / English / **Follow DSH (default)** |

Changes take effect immediately without a refresh and never modify DSH's global language; the default follows DSH (Chinese when DSH is Chinese, English for other host languages). Old archives that never explicitly picked a language migrate once to Follow DSH; explicit choices are preserved. documentation language: Chinese is the default ([README.md](README.md)), and English is in this file ([README.en.md](README.en.md)). The top of the settings page also shows a prominent originality notice: this project is a fully original work and has no relationship with any same-named/similar plugin (including [JanEickholt/dsh-inline-diff](https://github.com/JanEickholt/dsh-inline-diff)).

**Version & updates (new in 1.4.0)**:

| Action | Description |
| --- | --- |
| Check for updates | The Host reads every published version of `@him666233/dsh-inline-diff` from npm (60s cache) and marks Latest / Installed / Deprecated / Unavailable |
| Update / roll back / reinstall | Pick any version and the action follows the version relationship; on Web it runs the official plugin-install command once (automatic rollback with log on failure) and tells you to restart DSH afterwards; on Desktop a copyable command is shown (quit DSH completely first) |

Four display styles:

| Setting | Expanded / Unfolded | DSH native |
| --- | --- | --- |
| File-change cards | This plugin's inline diff cards | The official file-mutation row |
| Command rows | Flat command row with IN/OUT open | The official bash / pwsh / win_bash row |
| Other tool calls | Generic/details/search/web tools open IN/OUT | The official cards |
| Process folding | Writes the DSH verbose preference | Keeps your existing preference |

When “Other tool calls → Expanded” is enabled while “Process folding” is still DSH native, the plugin automatically switches it to “Unfolded”; otherwise completed tool rows would be hidden by DSH folding groups.

Syntax highlighting and language badge (independent of the table above):

| Setting | Options |
| --- | --- |
| Syntax highlighting | On / Off |
| Language badge | Short code / Full name / Hidden |
| Unknown language | Show “Unknown” / Hide |
| Font emphasis | Color + font style / Color only |

Settings are saved in localStorage (`dsh-inline-diff.settings.v5`); old v4 / v3 / v2 values are migrated automatically and the old keys are removed. The default UI language is “Follow DSH”.

## Data and limitations

By default the plugin makes no network requests and has no telemetry, and the client uses no `innerHTML` / `dangerouslySetInnerHTML` / `eval`; the only exception is when the user explicitly clicks “Check for updates / Install”, where the Host fetches npm registry metadata and invokes the local `dsh` CLI. Those requests contain only the package name/version — never session content, file content, keys or device information. The Host keeps only the before/after text needed for display in in-memory snapshots (LRU: at most 240 entries, 4 MB per side, plus a 64 MB total cap) and never writes it to disk; the Host read-only APIs are protected by the DSH browser trust boundary (`connection` admission, falling back to a local loopback fence when that service is unavailable), with a 1 MB request-body cap, JSON-only bodies, a 10-second request-read timeout, a 15-second file-read timeout, and an 8-concurrent-read limit. Very large files and very long single lines have a materialization budget on the browser side (200k lines / 1,000,000 characters per line); beyond it the plugin automatically degrades to changed hunks with a reason notice and never freezes the page. The Host saves snapshots only for `edit` / `write`, while `str_replace_editor` shows the changed hunks from the tool metadata and tries to locate line numbers — its card and the expanded dialog use a dedicated “this tool call keeps no execution snapshot” notice (not history-replay wording); after an app restart, history replay is likewise explained in the expanded dialog. In extreme cases the plugin falls back step by step: “snapshot → current-file read → tool-metadata changed hunks → explicit explanation”; the UI language, settings storage, and syntax highlighting also have Chinese / default-value fallbacks, so the final outcome is a readable explanation rather than a silent failure. History-replay line numbers are located again in the current file; if the file has since changed and the hunk cannot be located uniquely, “line numbers pending” is shown and the dialog explains that only the changed hunks can be shown. The same card shows the execution snapshot of that edit and does not refresh as the file changes later; the full display behavior (snapshot semantics, refresh rules, line-number legend, dialog layering and scrolling, performance notes) is documented in the repository's [docs/display-behavior.en.md](https://github.com/Him666233/dsh-inline-diff/blob/main/docs/display-behavior.en.md).

Motion: tasteful animations only cover running-card mount, output arrival and dialog opens; historical replay and settled cards render their final state immediately, and everything is disabled when the OS “reduce motion” preference is on.

Version & updates: the panel lists only npm releases; a one-click install replaces the current profile installation with the npm release (a local dev build would be overwritten), and DSH must be restarted afterwards. Desktop v1 has no in-place one-click install and shows a manual command instead.

For the full documentation, internal architecture, and known limitations, see the repository's [README](https://github.com/Him666233/dsh-inline-diff/blob/main/README.en.md).

## License

MIT © 2026 [Him666233](https://github.com/Him666233)
