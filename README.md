# budgie-console

A small Node.js utility for making terminal output actually readable. No dependencies, just ANSI escape codes wrapped into something you can use without looking up the spec every time.

Started as a personal tool, cleaned up and published for anyone who finds it useful.

---

## Install

```bash
npm install budgie-console
```

---

## Usage

```js
const Console = require('budgie-console');

Console.log(Console.FgGreen, 'Hello from Budgie');
Console.success('Server running on port 3000');
```

---

## API

### `log(...props)`

The core method. Joins all arguments and resets ANSI formatting at the end so styles don't bleed into the next line.

```js
Console.log(Console.FgRed, 'Something went wrong');
Console.log(Console.Bright + Console.FgCyan, 'Bold cyan text');
Console.log(Console.Underscore + Console.BgYellow, 'Underlined on yellow');
```

---

### Log levels

Four shortcuts with preset colors and icons.

```js
Console.success('Build complete');        // ✔  green
Console.error('Build failed');            // ✖  red
Console.warn('Deprecated API used');      // ⚠  yellow
Console.info('Node ' + process.version); // ℹ  cyan
```

---

### `spinner(frames, text, speed, statusFn, doneMessage?)`

Animates a character sequence in-place using `\r`. Stops and clears the line when `statusFn` returns `false`. If `doneMessage` is provided, a success line is printed immediately after the spinner clears — atomically, so there's no race condition from calling `Console.success()` yourself.

```js
let running = true;

Console.spinner(
  ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  'Loading...',
  80,
  () => running,
  'Done!'        // ← printed as ✔ Done! when spinner stops
);

setTimeout(() => { running = false; }, 3000);
```

You can also pass a simpler frame array if you prefer:

```js
Console.spinner(['-', '\\', '|', '/'], 'Working...', 100, () => running);
```

| Param | Type | Default | Description |
|---|---|---|---|
| `frames` | `string[]` | braille frames | Animation frames, cycled in order |
| `text` | `string` | `''` | Text shown beside the spinner |
| `speed` | `number` | `100` | Milliseconds per frame |
| `statusFn` | `() => boolean` | `() => true` | Return `false` to stop |
| `doneMessage` | `string` | `''` | Optional success message shown when spinner stops |

Returns a cancel function `() => void` you can call to stop the spinner early.

---

### `progress(current, total, width?, color?, doneMessage?)`

Renders a progress bar that updates in-place. Call repeatedly from a loop or interval. When `current >= total` a newline is printed so the next output starts on a fresh line. If `doneMessage` is provided, it's printed as a success line after the bar completes.

```js
let i = 0;
const iv = setInterval(() => {
  Console.progress(i, 50, 30, Console.FgGreen, 'Upload complete');
  if (++i > 50) clearInterval(iv);
}, 40);
```

```
[████████████████░░░░░░░░░░░░░░] 53%
```

| Param | Default | Description |
|---|---|---|
| `current` | — | Current step |
| `total` | — | Total steps |
| `width` | `30` | Width of the bar in characters |
| `color` | `FgGreen` | Color of the filled portion |
| `doneMessage` | `''` | Optional success message shown on completion |

---

### `table(rows, headers?)`

Prints a bordered table. `rows` is a 2D array, `headers` is an optional 1D array for the header row. Cell values don't need to be strings — numbers, booleans, `null`, and `undefined` are all coerced safely.

```js
Console.table(
  [
    ['Alice',   28,   'Engineer'],
    ['Bob',     34,   'Designer'],
    ['Charlie', null, 'Intern'],
  ],
  ['Name', 'Age', 'Role']
);
```

```
┌─────────┬─────┬──────────┐
│ Name    │ Age │ Role     │
├─────────┼─────┼──────────┤
│ Alice   │ 28  │ Engineer │
│ Bob     │ 34  │ Designer │
│ Charlie │     │ Intern   │
└─────────┴─────┴──────────┘
```

---

### `tree(obj, label?)`

Pretty-prints a nested object or array as an indented tree with branch characters, similar to the Unix `tree` command. Useful for debugging config objects, ASTs, or any deeply nested structure.

Primitive values are color-coded: strings in green, numbers in cyan, booleans and null in yellow.

```js
Console.tree({
  server: {
    host: 'localhost',
    port: 3000,
    ssl: false,
  },
  db: {
    name: 'mydb',
    pool: 5,
  },
});
```

```
└── root
    ├── server
    │   ├── host: "localhost"
    │   ├── port: 3000
    │   └── ssl: false
    └── db
        ├── name: "mydb"
        └── pool: 5
```

You can pass an optional label as the second argument (defaults to `'root'`).

```js
Console.tree(configObject, 'config');
```

---

### `diff(oldStr, newStr)`

Prints a line-by-line diff of two strings with no external dependencies. Removed lines are shown in red with a `- ` prefix, added lines in green with `+ `, and unchanged lines are dimmed.

```js
const before = `host: localhost\nport: 3000\ndebug: true`;
const after  = `host: localhost\nport: 8080\ndebug: true\nlogLevel: info`;

Console.diff(before, after);
```

```
  host: localhost
- port: 3000
+ port: 8080
  debug: true
+ logLevel: info
```

---

### `notify(title, message)`

Sends a native OS desktop notification. Useful for alerting you when a long-running task finishes — even if your terminal is buried.

Uses `osascript` on macOS, `notify-send` on Linux, and PowerShell's `NotifyIcon` on Windows. No external npm dependencies required. If the underlying command isn't available, a warning is printed to the terminal instead of throwing.

```js
Console.notify('Build complete', 'Your production bundle is ready.');
```

> **Linux note:** requires `libnotify` (`sudo apt install libnotify-bin` on Debian/Ubuntu).

---

### `box(text, color?)`

Wraps a string in a single-line bordered box.

```js
Console.box('Deployment complete', Console.FgGreen);
```

```
┌──────────────────────┐
│  Deployment complete  │
└──────────────────────┘
```

---

### `divider(char?, length?, color?)`

Prints a horizontal rule. Useful for separating sections in verbose output.

```js
Console.divider();                           // ──────────────────────────── (40 chars, dim)
Console.divider('═', 44, Console.FgCyan);
Console.divider('·', 20, Console.FgMagenta);
```

---

### `prompt(question)` — async

Reads one line of user input. Returns a Promise that resolves to the entered string.

```js
const name = await Console.prompt('Enter your name:');
Console.success(`Hello, ${name}`);
```

---

### `clear()`

Clears the terminal.

```js
Console.clear();
```

---

## Colors and styles

All ANSI codes are exposed as properties so you can compose them freely.

**Styles**

| Property | Effect |
|---|---|
| `Reset` | Remove all formatting |
| `Bright` | Bold |
| `Dim` | Faded |
| `Underscore` | Underline |
| `Blink` | Blink (terminal support varies) |
| `Reverse` | Swap foreground and background |
| `Hidden` | Invisible |

**Foreground**

`FgBlack` `FgRed` `FgGreen` `FgYellow` `FgBlue` `FgMagenta` `FgCyan` `FgWhite`

**Background**

`BgBlack` `BgRed` `BgGreen` `BgYellow` `BgBlue` `BgMagenta` `BgCyan` `BgWhite`

Combine them by concatenating strings:

```js
Console.log(Console.Bright + Console.FgWhite + Console.BgRed, ' ERROR ');
```

---

## Testing locally

### 1. Clone and install

```bash
git clone https://github.com/yashdatir/budgie-console.git
cd budgie-console
npm install
```

### 2. Build the TypeScript source

The published package ships compiled JS from `index.ts`. Run the build before testing:

```bash
npm run build
# or directly: npx tsc
```

This outputs `dist/index.js` and `dist/index.d.ts`.

### 3. Run the test suite

```bash
npm test
```

This runs `Console.test.js` via the test runner configured in `package.json`.

### 4. Try it interactively with a scratch file

Create a `try.js` in the repo root:

```js
const Console = require('./dist/index.js');

// Basics
Console.success('Everything is fine');
Console.warn('Watch out');
Console.error('Something broke');
Console.info('FYI');
Console.divider();

// Table with mixed types
Console.table(
  [['Alice', 28, true], ['Bob', null, false]],
  ['Name', 'Age', 'Active']
);

// Tree
Console.tree({ server: { host: 'localhost', port: 3000 }, ssl: false }, 'config');

// Diff
Console.diff('port: 3000\ndebug: true', 'port: 8080\ndebug: true\nlogLevel: info');

// Spinner with done message
let done = false;
Console.spinner(undefined, 'Processing...', 80, () => !done, 'All done!');
setTimeout(() => { done = true; }, 2000);

// Notify (fires after spinner settles)
setTimeout(() => {
  Console.notify('budgie-console', 'Local test complete!');
}, 2500);
```

Then run:

```bash
node try.js
```

### 5. Link it to another local project (optional)

If you want to test `budgie-console` as a dependency inside another project on your machine:

```bash
# Inside the budgie-console repo
npm link

# Inside your other project
npm link budgie-console
```

Then just `require('budgie-console')` as normal. Run `npm unlink budgie-console` in the other project when you're done.

---

## Notes

- No external dependencies. Uses only `readline`, `child_process`, and `process.stdout` from Node.js core.
- Requires Node.js `>=14.0.0`.
- ANSI codes work out of the box on macOS and Linux. On Windows, they work in Windows Terminal and VS Code's integrated terminal. The classic `cmd.exe` may need VT mode enabled.
- `Blink` is ignored in most modern terminals but kept for completeness.
- `notify` shells out to the OS; it will print a warning (not throw) if the required command isn't found.

---

## License

MIT