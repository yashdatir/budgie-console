"use strict";
class BudgieCLIIO {
    /**
     * Detect if ANSI colors should be disabled based on environment variables.
     * If the terminal is 'dumb' or NO_COLOR is set, disable colors.
     * This ensures compatibility with environments that don't support ANSI codes.
     */
    constructor() {
        /**
         * Checks environment variables to determine if ANSI colors should be disabled.
         * If the terminal is 'dumb' or NO_COLOR is set, it calls disableColors to turn off ANSI codes.
         */
        this.detectAnsi = () => {
            const isTermDumb = process.env.TERM === 'dumb';
            const isNoColor = process.env.NO_COLOR !== undefined;
            if (isTermDumb || isNoColor) {
                this.disableColors();
            }
        };
        /**
         * Disables ANSI color codes by setting all style and color properties to empty strings.
         */
        this.disableColors = () => {
            const properties = [
                'Reset', 'Bright', 'Dim', 'Underscore', 'Blink', 'Reverse', 'Hidden',
                'FgBlack', 'FgRed', 'FgGreen', 'FgYellow', 'FgBlue', 'FgMagenta', 'FgCyan', 'FgWhite',
                'BgBlack', 'BgRed', 'BgGreen', 'BgYellow', 'BgBlue', 'BgMagenta', 'BgCyan', 'BgWhite'
            ];
            properties.forEach((prop) => {
                this[prop] = '';
            });
        };
        // Styles
        this.Reset = '\x1b[0m';
        this.Bright = '\x1b[1m';
        this.Dim = '\x1b[2m';
        this.Underscore = '\x1b[4m';
        this.Blink = '\x1b[5m';
        this.Reverse = '\x1b[7m';
        this.Hidden = '\x1b[8m';
        // Foreground
        this.FgBlack = '\x1b[30m';
        this.FgRed = '\x1b[31m';
        this.FgGreen = '\x1b[32m';
        this.FgYellow = '\x1b[33m';
        this.FgBlue = '\x1b[34m';
        this.FgMagenta = '\x1b[35m';
        this.FgCyan = '\x1b[36m';
        this.FgWhite = '\x1b[37m';
        // Background
        this.BgBlack = '\x1b[40m';
        this.BgRed = '\x1b[41m';
        this.BgGreen = '\x1b[42m';
        this.BgYellow = '\x1b[43m';
        this.BgBlue = '\x1b[44m';
        this.BgMagenta = '\x1b[45m';
        this.BgCyan = '\x1b[46m';
        this.BgWhite = '\x1b[47m';
        // Default spinner frames
        this.spin = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        // Core
        this.log = (...props) => {
            process.stdout.write(props.join('') + this.Reset + '\n');
        };
        this.clear = () => {
            process.stdout.write('\x1b[2J\x1b[0f');
        };
        // Log levels
        this.success = (msg) => this.log(`${this.FgGreen}✔  ${msg}`);
        this.error = (msg) => this.log(`${this.FgRed}✖  ${msg}`);
        this.warn = (msg) => this.log(`${this.FgYellow}⚠  ${msg}`);
        this.info = (msg) => this.log(`${this.FgCyan}ℹ  ${msg}`);
        // Divider
        this.divider = (char = '─', length = 40, color = this.Dim) => {
            this.log(color + char.repeat(length));
        };
        // Box
        this.box = (text, color = this.FgCyan) => {
            const pad = 2;
            const width = text.length + pad * 2;
            const line = '─'.repeat(width);
            this.log(`${color}┌${line}┐`);
            this.log(`${color}│${' '.repeat(pad)}${this.Reset}${text}${color}${' '.repeat(pad)}│`);
            this.log(`${color}└${line}┘`);
        };
        // Progress bar
        // Fix #11: prints a newline on completion so subsequent output starts on a fresh line.
        //          Optional doneMessage is shown as a success line after the bar completes.
        this.progress = (current, total, width = 30, color = this.FgGreen, doneMessage = '') => {
            const pct = Math.min(current / total, 1);
            const filled = Math.round(pct * width);
            const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
            const label = `${Math.round(pct * 100)}%`;
            process.stdout.write(`\r${color}[${bar}]${this.Reset} ${label}  `);
            if (current >= total) {
                process.stdout.write('\n');
                if (doneMessage)
                    this.success(doneMessage);
            }
        };
        // Spinner
        // Fix #10: added doneMessage param. When statusFn returns false the spinner line is
        //          cleared and—if doneMessage is provided—a success line is printed in its place,
        //          eliminating the race-condition workaround of calling Console.success() manually.
        this.spinner = (type = this.spin, followingText = '', speed = 100, status = () => true, doneMessage = '') => {
            let x = 0;
            const id = setInterval(() => {
                process.stdout.write(`\r${this.FgCyan}${type[x++ % type.length]}${this.Reset} ${followingText}`);
                if (!status()) {
                    clearInterval(id);
                    process.stdout.write('\r' + ' '.repeat(followingText.length + 4) + '\r');
                    if (doneMessage)
                        this.success(doneMessage);
                }
            }, speed);
            return () => clearInterval(id);
        };
        // Table
        // Fix #12: String(cell) coercion already present for cell values and width calculation,
        //          so numbers, booleans, null, and undefined are all handled safely.
        this.table = (rows, headers = null) => {
            const data = headers ? [headers, ...rows] : rows;
            const widths = data[0].map((_, i) => Math.max(...data.map((r) => String(r[i]).length)));
            const rowStr = (r) => '│ ' + r.map((cell, i) => String(cell).padEnd(widths[i])).join(' │ ') + ' │';
            const divLine = (l, m, r) => l + widths.map((w) => '─'.repeat(w + 2)).join(m) + r;
            this.log(this.FgCyan + divLine('┌', '┬', '┐'));
            if (headers) {
                this.log(this.Bright + this.FgWhite + rowStr(headers));
                this.log(this.FgCyan + divLine('├', '┼', '┤'));
                rows.forEach(r => this.log(this.Reset + rowStr(r)));
            }
            else {
                rows.forEach(r => this.log(this.Reset + rowStr(r)));
            }
            this.log(this.FgCyan + divLine('└', '┴', '┘'));
        };
        // Prompt
        this.prompt = (question) => {
            const readline = require('readline');
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            return new Promise(resolve => {
                rl.question(`${this.FgYellow}${question}${this.Reset} `, (answer) => {
                    rl.close();
                    resolve(answer);
                });
            });
        };
        // Fix #13: Console.tree(obj) — pretty-print nested objects/arrays with branch characters,
        //          similar to the Unix `tree` command. Useful for debugging config objects or ASTs.
        this.tree = (obj, label = 'root', prefix = '', isLast = true) => {
            const connector = isLast ? '└── ' : '├── ';
            const valueStr = (v) => {
                if (v === null)
                    return `${this.FgYellow}null${this.Reset}`;
                if (v === undefined)
                    return `${this.FgYellow}undefined${this.Reset}`;
                if (typeof v === 'boolean')
                    return `${this.FgYellow}${v}${this.Reset}`;
                if (typeof v === 'number')
                    return `${this.FgCyan}${v}${this.Reset}`;
                if (typeof v === 'string')
                    return `${this.FgGreen}"${v}"${this.Reset}`;
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
            const keys = Object.keys(obj);
            keys.forEach((key, idx) => {
                this.tree(obj[key], key, childPrefix, idx === keys.length - 1);
            });
        };
        // Fix #14: Console.diff(oldStr, newStr) — line-by-line colored diff with no external deps.
        //          Removed lines are shown in red with "- " prefix, added lines in green with "+ ",
        //          and unchanged lines are shown dimmed. Great for config change summaries.
        this.diff = (oldStr, newStr) => {
            const oldLines = oldStr.split('\n');
            const newLines = newStr.split('\n');
            const maxLen = Math.max(oldLines.length, newLines.length);
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
                }
                else if (ni >= newLines.length) {
                    // Only old lines left
                    process.stdout.write(`${this.FgRed}- ${ol}${this.Reset}\n`);
                    oi++;
                }
                else if (ol === nl) {
                    // Matching line
                    process.stdout.write(`${this.Dim}  ${ol}${this.Reset}\n`);
                    oi++;
                    ni++;
                }
                else if (!newSet.has(ol)) {
                    // Old line was removed
                    process.stdout.write(`${this.FgRed}- ${ol}${this.Reset}\n`);
                    oi++;
                }
                else if (!oldSet.has(nl)) {
                    // New line was added
                    process.stdout.write(`${this.FgGreen}+ ${nl}${this.Reset}\n`);
                    ni++;
                }
                else {
                    // Both exist somewhere — treat as removal + addition at this position
                    process.stdout.write(`${this.FgRed}- ${ol}${this.Reset}\n`);
                    process.stdout.write(`${this.FgGreen}+ ${nl}${this.Reset}\n`);
                    oi++;
                    ni++;
                }
            }
        };
        // Fix #15: Console.notify(title, message) — sends a native OS desktop notification.
        //          Uses osascript on macOS, notify-send on Linux, and msg on Windows.
        //          No external dependencies; shells out via Node's child_process.
        this.notify = (title, message) => {
            const { execSync } = require('child_process');
            const platform = process.platform;
            try {
                if (platform === 'darwin') {
                    const escaped = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                    execSync(`osascript -e 'display notification "${escaped(message)}" with title "${escaped(title)}"'`);
                }
                else if (platform === 'linux') {
                    const escaped = (s) => s.replace(/"/g, '\\"');
                    execSync(`notify-send "${escaped(title)}" "${escaped(message)}"`);
                }
                else if (platform === 'win32') {
                    // Windows: use PowerShell's BurntToast-style balloon via Msg
                    const escaped = (s) => s.replace(/"/g, '\\"');
                    execSync(`powershell -Command "` +
                        `Add-Type -AssemblyName System.Windows.Forms; ` +
                        `$n = New-Object System.Windows.Forms.NotifyIcon; ` +
                        `$n.Icon = [System.Drawing.SystemIcons]::Information; ` +
                        `$n.BalloonTipTitle = '${escaped(title)}'; ` +
                        `$n.BalloonTipText = '${escaped(message)}'; ` +
                        `$n.Visible = $true; ` +
                        `$n.ShowBalloonTip(3000)"`);
                }
                else {
                    this.warn(`notify: unsupported platform '${platform}'`);
                }
            }
            catch (_a) {
                this.warn(`notify: failed to send notification (is notify-send/osascript available?)`);
            }
        };
        this.detectAnsi();
    }
}
const Console = new BudgieCLIIO();
module.exports = Console;
