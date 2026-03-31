class BudgieCLIIO {

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
  spinner = (type = this.spin, followingText = '', speed = 100, status = () => true) => {
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
  table = (rows: Array<Array<string>>, headers: Array<string> | null = null) => {
    const data    = headers ? [headers, ...rows] : rows;
    const widths  = data[0].map((_, i) => Math.max(...data.map(r => String(r[i]).length)));
    const rowStr  = (r: Array<string>) => '│ ' + r.map((cell, i) => String(cell).padEnd(widths[i])).join(' │ ') + ' │';
    const divLine = (l: string, m: string, r: string) => l + widths.map(w => '─'.repeat(w + 2)).join(m) + r;

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

}

const Console: BudgieCLIIO = new BudgieCLIIO();

export default Console;