"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BudgieCLIIO {
    constructor() {
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
        this.spinner = (type = this.spin, followingText = '', speed = 100, status = () => true) => {
            let x = 0;
            const id = setInterval(() => {
                process.stdout.write(`\r${this.FgCyan}${type[x++ % type.length]}${this.Reset} ${followingText}`);
                if (!status()) {
                    clearInterval(id);
                    process.stdout.write('\r' + ' '.repeat(followingText.length + 4) + '\r');
                }
            }, speed);
            return () => clearInterval(id);
        };
        // Table
        this.table = (rows, headers = null) => {
            const data = headers ? [headers, ...rows] : rows;
            const widths = data[0].map((_, i) => Math.max(...data.map(r => String(r[i]).length)));
            const rowStr = (r) => '│ ' + r.map((cell, i) => String(cell).padEnd(widths[i])).join(' │ ') + ' │';
            const divLine = (l, m, r) => l + widths.map(w => '─'.repeat(w + 2)).join(m) + r;
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
    }
}
const Console = new BudgieCLIIO();
exports.default = Console;
