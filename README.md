# tabby-advanced-highlight

[![npm version](https://img.shields.io/npm/v/tabby-advanced-highlight.svg)](https://www.npmjs.com/package/tabby-advanced-highlight)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Advanced real-time text and regex highlighting plugin for [Tabby](https://tabby.sh/) terminal.**

Customizable live pattern highlighter designed for network engineers, sysadmins, and developers. Highlight IP addresses, router interface states (`UP`/`DOWN`), error logs, and arbitrary patterns in Truecolor (24-bit ANSI) with an integrated settings panel.

---

## ✨ Features

- **⚡ PCRE / Perl 5 Regular Expression Engine**: Full support for regex patterns including smart word boundaries (`\b`), lookaheads/lookbehinds (`(?<!...)`), non-capturing groups `(?:...)`, character classes, and inline flags `(?i)`.
- **🎨 Visual Color Picker & Quick Swatches**: Visual HTML5 color swatch picker with Hex input, one-click copy, and quick preset color pills.
- **🛠️ Interactive Live Settings Panel**: Edit all highlight rules directly in Tabby's Settings under **Highlight** (`⚡️ Advanced Highlight`), with instant live reload across active terminal tabs.
- **🛡️ Non-Destructive ANSI Injection**: Injects 24-bit Truecolor foreground and background ANSI sequences without breaking existing terminal colors or prompt styling.
- **⏱️ Serial Stream Accumulator (25ms)**: Solves micro-chunk fragmentation on slow serial lines (e.g., Cisco/Huawei UART at 9600 baud) so split words across packets are reconstructed and highlighted accurately.
- **📦 18 Out-of-the-Box Defaults**: Pre-configured with battle-tested rules for network equipment (Cisco, Huawei, Juniper), IPv4 addresses, interfaces (`GigabitEthernet`, `gi`, `vlanif`, `loopback`), log levels (`error`, `warning`, `info`), and interface statuses.

---

## 📋 Rule Syntax

Each rule is written as a comma-separated line in the settings editor:

```csv
"pattern", isRegex, caseSensitive, fgColor, [bgColor], enabled
```

| Field | Type | Description |
|---|---|---|
| `"pattern"` | String | Pattern enclosed in double quotes. Can be plain text or a regex pattern. |
| `isRegex` | `0` or `1` | `1` = Evaluate as regular expression, `0` = Literal text match. |
| `caseSensitive` | `0` or `1` | `1` = Case sensitive match, `0` = Case insensitive (`(?i)`). |
| `fgColor` | Hex | Foreground text color in 6-digit hex (e.g. `FFFFFF`, `DC0000`). |
| `bgColor` | Hex | *(Optional)* Background color in 6-digit hex. Leave empty for transparent background. |
| `enabled` | `0` or `1` | `1` = Rule active (default), `0` = Temporarily disabled. |

### Syntax Examples

```csv
"error:.*", 1, 0, FFFFFF, DC0000, 1
"\bup(?:\(s\))?", 1, 0, 3C9F50, , 1
"\bdown\b", 1, 0, DC0000, , 1
"GigabitEthernet\d/\d/\d{1,2}(\.\d{1,10})?", 1, 0, 5CC7C7, , 1
"(?<![\d.])(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(?:\/\d{1,2})?(?!\.?\d)", 1, 0, ECEC74, , 1
```

---

## ⚡ Performance Considerations

`tabby-advanced-highlight` evaluates rules in real time across the incoming terminal stream in user space:
- **Daily Interactive Use**: Extremely responsive and negligible CPU overhead during standard shell sessions, SSH connections, serial consoles, and router configuration.
- **High-throughput Bulk Streams**: If you continuously dump millions of lines (e.g. continuous kernel debugs or `cat` on multi-gigabyte log files), having dozens of complex regex rules with negative lookbehinds will introduce CPU load in JavaScript. Keep regex patterns concise and disable unused rules when streaming massive datasets.

---

## 🚀 Installation

### From Tabby Settings (Recommended)
1. Open Tabby **Settings** (`Ctrl+,` or `Cmd+,`).
2. Go to **Plugins**.
3. Search for `tabby-advanced-highlight`.
4. Click **Install** and restart Tabby.

### Manual Installation
Download the release tarball and extract it into your Tabby plugins directory:
- **macOS**: `~/Library/Application Support/tabby/plugins/node_modules/tabby-advanced-highlight`
- **Linux**: `~/.config/tabby/plugins/node_modules/tabby-advanced-highlight`
- **Windows**: `%APPDATA%\tabby\plugins\node_modules\tabby-advanced-highlight`

---

## 👤 Author

- **Rubén León**
  - GitHub: [@rubenleonn](https://github.com/rubenleonn)
  - npm: [@rubenleon](https://www.npmjs.com/~rubenleon)

## 📄 License

MIT © [Rubén León](LICENSE)
