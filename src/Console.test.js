const Console = require('../dist/index.js');

// ─── Header ───────────────────────────────────────────────
Console.clear();
Console.box('Welcome to Budgie JS — Extended Test', Console.FgCyan);
Console.divider('─', 44, Console.Dim);

// ─── Semantic Logs ────────────────────────────────────────
Console.success('Server started successfully');
Console.error('Could not connect to database');
Console.warn('Memory usage above 80%');
Console.info('Running Node ' + process.version);

Console.divider('─', 44, Console.Dim);

// ─── Styled log (your original style) ────────────────────
Console.log(Console.Underscore, Console.BgCyan, ' Welcome to Budgie JS ');
Console.log(Console.Bright + Console.FgMagenta, 'Bold Magenta text');
Console.log(Console.Dim + Console.FgYellow, 'Dim Yellow text');

Console.divider('─', 44, Console.Dim);

// ─── Table ────────────────────────────────────────────────
Console.info('User Table:');
Console.table(
  [
    ['Alice',   28, 'Engineer'],
    ['Bob',     34, 'Designer'],
    ['Charlie', 22, 'Intern'  ],
  ],
  ['Name', 'Age', 'Role']
);

Console.divider('─', 44, Console.Dim);

// ─── Progress Bar ─────────────────────────────────────────
Console.info('Simulating progress...');
let i = 0;
const total = 40;
const progressInterval = setInterval(() => {
  Console.progress(i, total);
  i++;
  if (i > total) {
    clearInterval(progressInterval);
    Console.success('Progress complete!');
    Console.divider('─', 44, Console.Dim);

    // ─── Spinner ──────────────────────────────────────────
    Console.info('Spinner running for 3 seconds...');
    let running = true;
    const stop = Console.spinner(
      ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
      'Fetching data...',
      80,
      () => running
    );

    setTimeout(() => {
      running = false;
      setTimeout(() => {
        Console.success('Data fetched!');
        Console.divider('─', 44, Console.Dim);

        // ─── Prompt ───────────────────────────────────────
        Console.prompt('What is your name?').then((name) => {
          Console.log(
            Console.FgGreen + Console.Bright,
            `Hello, ${name}! Welcome to Budgie JS.`
          );
          Console.divider('═', 44, Console.FgCyan);
          Console.box('All tests passed ✔', Console.FgGreen);
        });
      }, 200);
    }, 3000);
  }
}, 40);