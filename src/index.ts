type ColorKeys =
  | 'Reset' | 'Bright' | 'Dim' | 'Underscore' | 'Blink' | 'Reverse' | 'Hidden'
  | 'FgBlack' | 'FgRed' | 'FgGreen' | 'FgYellow' | 'FgBlue' | 'FgMagenta' | 'FgCyan' | 'FgWhite'
  | 'BgBlack' | 'BgRed' | 'BgGreen' | 'BgYellow' | 'BgBlue' | 'BgMagenta' | 'BgCyan' | 'BgWhite';

class BudgieCLIIO {
  /**
   * Detect if ANSI colors should be disabled based on environment variables.
   * If the terminal is 'dumb' or NO_COLOR is set, disable colors.
   * This ensures compatibility with environments that don't support ANSI codes.
   */
  constructor() {
    this.detectAnsi();
  }

  /**
   * Checks environment variables to determine if ANSI colors should be disabled.
   * If the terminal is 'dumb' or NO_COLOR is set, it calls disableColors to turn off ANSI codes.
   */
  detectAnsi = () => {
    const isTermDumb = process.env.TERM === 'dumb';
    const isNoColor = process.env.NO_COLOR !== undefined;
    if (isTermDumb || isNoColor) {
      this.disableColors();
    }
  }

  /**
   * Disables ANSI color codes by setting all style and color properties to empty strings.
   */
  disableColors = () => {
    const properties: Array<ColorKeys> = [
      'Reset', 'Bright', 'Dim', 'Underscore', 'Blink', 'Reverse', 'Hidden',
      'FgBlack', 'FgRed', 'FgGreen', 'FgYellow', 'FgBlue', 'FgMagenta', 'FgCyan', 'FgWhite',
      'BgBlack', 'BgRed', 'BgGreen', 'BgYellow', 'BgBlue', 'BgMagenta', 'BgCyan', 'BgWhite'
    ];
    properties.forEach((prop: ColorKeys) => {
      this[prop] = '';
    });
  }

  // Styles
  Reset     :string = '\x1b[0m';
  Bright    :string = '\x1b[1m';
  Dim       :string = '\x1b[2m';
  Underscore:string = '\x1b[4m';
  Blink     :string = '\x1b[5m';
  Reverse   :string = '\x1b[7m';
  Hidden    :string = '\x1b[8m';

  // Foreground
  FgBlack  :string = '\x1b[30m';
  FgRed    :string = '\x1b[31m';
  FgGreen  :string = '\x1b[32m';
  FgYellow :string = '\x1b[33m';
  FgBlue   :string = '\x1b[34m';
  FgMagenta:string = '\x1b[35m';
  FgCyan   :string = '\x1b[36m';
  FgWhite  :string = '\x1b[37m';

  // Background
  BgBlack  :string = '\x1b[40m';
  BgRed    :string = '\x1b[41m';
  BgGreen  :string = '\x1b[42m';
  BgYellow :string = '\x1b[43m';
  BgBlue   :string = '\x1b[44m';
  BgMagenta:string = '\x1b[45m';
  BgCyan   :string = '\x1b[46m';
  BgWhite  :string = '\x1b[47m';

  // Default spinner frames
  spin:Array<string> = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  // Core
  log = (...props: Array<string>) => {
    process.stdout.write(props.join('') + this.Reset + '\n');
  };

  clear = () => {
    process.stdout.write('\x1b[2J\x1b[0f');
  };

  // Log levels
  success = (msg: string) => this.log(`${this.FgGreen}✔  ${msg}`);
  error   = (msg: string) => this.log(`${this.FgRed}✖  ${msg}`);
  warn    = (msg: string) => this.log(`${this.FgYellow}⚠  ${msg}`);
  info    = (msg: string) => this.log(`${this.FgCyan}ℹ  ${msg}`);

  // Divider
  divider = (char = '─', length = 40, color = this.Dim) => {
    this.log(color + char.repeat(length));
  };

  // Box
  box = (text: string, color: string = this.FgCyan) => {
    const pad   = 2;
    const width = text.length + pad * 2;
    const line  = '─'.repeat(width);
    this.log(`${color}┌${line}┐`);
    this.log(`${color}│${' '.repeat(pad)}${this.Reset}${text}${color}${' '.repeat(pad)}│`);
    this.log(`${color}└${line}┘`);
  };

  // Progress bar
  // Fix #11: prints a newline on completion so subsequent output starts on a fresh line.
  //          Optional doneMessage is shown as a success line after the bar completes.
  progress = (current: number, total: number, width: number = 30, color: string = this.FgGreen, doneMessage: string = '') => {
    const pct    = Math.min(current / total, 1);
    const filled = Math.round(pct * width);
    const bar    = '█'.repeat(filled) + '░'.repeat(width - filled);
    const label  = `${Math.round(pct * 100)}%`;
    process.stdout.write(`\r${color}[${bar}]${this.Reset} ${label}  `);
    if (current >= total) {
      process.stdout.write('\n');
      if (doneMessage) this.success(doneMessage);
    }
  };

  // Spinner
  // Fix #10: added doneMessage param. When statusFn returns false the spinner line is
  //          cleared and—if doneMessage is provided—a success line is printed in its place,
  //          eliminating the race-condition workaround of calling Console.success() manually.
  spinner = (type = this.spin, followingText = '', speed = 100, status = () => true, doneMessage = '') => {
    let x = 0;
    const id = setInterval(() => {
      process.stdout.write(`\r${this.FgCyan}${type[x++ % type.length]}${this.Reset} ${followingText}`);
      if (!status()) {
        clearInterval(id);
        process.stdout.write('\r' + ' '.repeat(followingText.length + 4) + '\r');
        if (doneMessage) this.success(doneMessage);
      }
    }, speed);
    return () => clearInterval(id);
  };

  // Table
  // Fix #12: String(cell) coercion already present for cell values and width calculation,
  //          so numbers, booleans, null, and undefined are all handled safely.
  table = (rows: Array<Array<any>>, headers: Array<string> | null = null) => {
    const data    = headers ? [headers, ...rows] : rows;
    const widths  = data[0].map((_: any, i: number) => Math.max(...data.map((r: Array<any>) => String(r[i]).length)));
    const rowStr  = (r: Array<any>) => '│ ' + r.map((cell, i) => String(cell).padEnd(widths[i])).join(' │ ') + ' │';
    const divLine = (l: string, m: string, r: string) => l + widths.map((w: number) => '─'.repeat(w + 2)).join(m) + r;

    this.log(this.FgCyan + divLine('┌', '┬', '┐'));
    if (headers) {
      this.log(this.Bright + this.FgWhite + rowStr(headers));
      this.log(this.FgCyan + divLine('├', '┼', '┤'));
      rows.forEach(r => this.log(this.Reset + rowStr(r)));
    } else {
      rows.forEach(r => this.log(this.Reset + rowStr(r)));
    }
    this.log(this.FgCyan + divLine('└', '┴', '┘'));
  };

  // Prompt
  prompt = (question: string) => {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
      rl.question(`${this.FgYellow}${question}${this.Reset} `, (answer: string) => {
        rl.close();
        resolve(answer);
      });
    });
  };

  // Fix #13: Console.tree(obj) — pretty-print nested objects/arrays with branch characters,
  //          similar to the Unix `tree` command. Useful for debugging config objects or ASTs.
  tree = (obj: any, label = 'root', prefix = '', isLast = true): void => {
    const connector = isLast ? '└── ' : '├── ';
    const valueStr  = (v: any): string => {
      if (v === null)           return `${this.FgYellow}null${this.Reset}`;
      if (v === undefined)      return `${this.FgYellow}undefined${this.Reset}`;
      if (typeof v === 'boolean') return `${this.FgYellow}${v}${this.Reset}`;
      if (typeof v === 'number')  return `${this.FgCyan}${v}${this.Reset}`;
      if (typeof v === 'string')  return `${this.FgGreen}"${v}"${this.Reset}`;
      return '';
    };

    const isObject = obj !== null && typeof obj === 'object';
    const labelStr = `${this.Bright}${label}${this.Reset}`;

    if (!isObject) {
      process.stdout.write(`${prefix}${connector}${labelStr}: ${valueStr(obj)}\n`);
      return;
    }

    process.stdout.write(`${prefix}${connector}${this.FgMagenta}${label}${this.Reset}\n`);

    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    const keys        = Object.keys(obj);
    keys.forEach((key, idx) => {
      this.tree(obj[key], key, childPrefix, idx === keys.length - 1);
    });
  };

  // Fix #14: Console.diff(oldStr, newStr) — line-by-line colored diff with no external deps.
  //          Removed lines are shown in red with "- " prefix, added lines in green with "+ ",
  //          and unchanged lines are shown dimmed. Great for config change summaries.
  diff = (oldStr: string, newStr: string): void => {
    const oldLines = oldStr.split('\n');
    const newLines = newStr.split('\n');
    const maxLen   = Math.max(oldLines.length, newLines.length);

    // Build a simple LCS-based diff using a two-pointer greedy approach:
    // Walk both line arrays and mark removals (-) and additions (+).
    const oldSet = new Set(oldLines);
    const newSet = new Set(newLines);

    let oi = 0, ni = 0;
    while (oi < oldLines.length || ni < newLines.length) {
      const ol = oldLines[oi];
      const nl = newLines[ni];

      if (oi >= oldLines.length) {
        // Only new lines left
        process.stdout.write(`${this.FgGreen}+ ${nl}${this.Reset}\n`);
        ni++;
      } else if (ni >= newLines.length) {
        // Only old lines left
        process.stdout.write(`${this.FgRed}- ${ol}${this.Reset}\n`);
        oi++;
      } else if (ol === nl) {
        // Matching line
        process.stdout.write(`${this.Dim}  ${ol}${this.Reset}\n`);
        oi++; ni++;
      } else if (!newSet.has(ol)) {
        // Old line was removed
        process.stdout.write(`${this.FgRed}- ${ol}${this.Reset}\n`);
        oi++;
      } else if (!oldSet.has(nl)) {
        // New line was added
        process.stdout.write(`${this.FgGreen}+ ${nl}${this.Reset}\n`);
        ni++;
      } else {
        // Both exist somewhere — treat as removal + addition at this position
        process.stdout.write(`${this.FgRed}- ${ol}${this.Reset}\n`);
        process.stdout.write(`${this.FgGreen}+ ${nl}${this.Reset}\n`);
        oi++; ni++;
      }
    }
  };

  // Fix #15: Console.notify(title, message) — sends a native OS desktop notification.
  //          Uses osascript on macOS, notify-send on Linux, and msg on Windows.
  //          No external dependencies; shells out via Node's child_process.
  notify = (title: string, message: string): void => {
    const { execSync } = require('child_process');
    const platform = process.platform;

    try {
      if (platform === 'darwin') {
        const escaped = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        execSync(`osascript -e 'display notification "${escaped(message)}" with title "${escaped(title)}"'`);
      } else if (platform === 'linux') {
        const escaped = (s: string) => s.replace(/"/g, '\\"');
        execSync(`notify-send "${escaped(title)}" "${escaped(message)}"`);
      } else if (platform === 'win32') {
        // Windows: use PowerShell's BurntToast-style balloon via Msg
        const escaped = (s: string) => s.replace(/"/g, '\\"');
        execSync(
          `powershell -Command "` +
          `Add-Type -AssemblyName System.Windows.Forms; ` +
          `$n = New-Object System.Windows.Forms.NotifyIcon; ` +
          `$n.Icon = [System.Drawing.SystemIcons]::Information; ` +
          `$n.BalloonTipTitle = '${escaped(title)}'; ` +
          `$n.BalloonTipText = '${escaped(message)}'; ` +
          `$n.Visible = $true; ` +
          `$n.ShowBalloonTip(3000)"`
        );
      } else {
        this.warn(`notify: unsupported platform '${platform}'`);
      }
    } catch {
      this.warn(`notify: failed to send notification (is notify-send/osascript available?)`);
    }
  };

}

const Console = new BudgieCLIIO();
export = Console;