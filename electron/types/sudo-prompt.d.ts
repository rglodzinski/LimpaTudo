declare module "sudo-prompt" {
  interface SudoOptions {
    name?: string;
    icns?: string;
  }

  export function exec(
    command: string,
    options: SudoOptions,
    callback: (error: Error | null, stdout?: string | Buffer, stderr?: string | Buffer) => void,
  ): void;
}
