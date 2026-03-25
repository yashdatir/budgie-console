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

### `spinner(frames, text, speed, statusFn)`

Animates a character sequence in-place using `\r`. Stops and clears the line when `statusFn` returns `false`.

```js
let running = true;

Console.spinner(
  ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  'Loading...',
  80,
  () => running
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

---

### `progress(current, total, width?, color?)`

Renders a progress bar that updates in-place. Call repeatedly from a loop or interval.

```js
let i = 0;
const iv = setInterval(() => {
  Console.progress(i, 50);
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

---

### `table(rows, headers?)`

Prints a bordered table. `rows` is a 2D array, `headers` is an optional 1D array for the header row.

```js
Console.table(
  [
    ['Alice',   28, 'Engineer'],
    ['Bob',     34, 'Designer'],
    ['Charlie', 22, 'Intern'],
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
│ Charlie │ 22  │ Intern   │
└─────────┴─────┴──────────┘
```

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

## Notes

- No external dependencies. Uses only `readline` and `process.stdout` from Node.js core.
- Requires Node.js `>=14.0.0`.
- ANSI codes work out of the box on macOS and Linux. On Windows, they work in Windows Terminal and VS Code's integrated terminal. The classic `cmd.exe` may need VT mode enabled.
- `Blink` is ignored in most modern terminals but kept for completeness.

---

## License

MIT