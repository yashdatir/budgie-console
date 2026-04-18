declare class BudgieCLIIO {
    /**
     * Detect if ANSI colors should be disabled based on environment variables.
     * If the terminal is 'dumb' or NO_COLOR is set, disable colors.
     * This ensures compatibility with environments that don't support ANSI codes.
     */
    constructor();
    /**
     * Checks environment variables to determine if ANSI colors should be disabled.
     * If the terminal is 'dumb' or NO_COLOR is set, it calls disableColors to turn off ANSI codes.
     */
    detectAnsi: () => void;
    /**
     * Disables ANSI color codes by setting all style and color properties to empty strings.
     */
    disableColors: () => void;
    Reset: string;
    Bright: string;
    Dim: string;
    Underscore: string;
    Blink: string;
    Reverse: string;
    Hidden: string;
    FgBlack: string;
    FgRed: string;
    FgGreen: string;
    FgYellow: string;
    FgBlue: string;
    FgMagenta: string;
    FgCyan: string;
    FgWhite: string;
    BgBlack: string;
    BgRed: string;
    BgGreen: string;
    BgYellow: string;
    BgBlue: string;
    BgMagenta: string;
    BgCyan: string;
    BgWhite: string;
    spin: Array<string>;
    log: (...props: Array<string>) => void;
    clear: () => void;
    success: (msg: string) => void;
    error: (msg: string) => void;
    warn: (msg: string) => void;
    info: (msg: string) => void;
    divider: (char?: string, length?: number, color?: string) => void;
    box: (text: string, color?: string) => void;
    progress: (current: number, total: number, width?: number, color?: string, doneMessage?: string) => void;
    spinner: (type?: string[], followingText?: string, speed?: number, status?: () => boolean, doneMessage?: string) => () => void;
    table: (rows: Array<Array<any>>, headers?: Array<string> | null) => void;
    prompt: (question: string) => Promise<unknown>;
    tree: (obj: any, label?: string, prefix?: string, isLast?: boolean) => void;
    diff: (oldStr: string, newStr: string) => void;
    notify: (title: string, message: string) => void;
}
declare const Console: BudgieCLIIO;
export = Console;
