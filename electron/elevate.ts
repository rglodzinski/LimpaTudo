import sudo from "sudo-prompt";

const SUDO_OPTIONS = { name: "Limpa Tudo" };

/** Escapes a path for safe interpolation into a single-quoted shell string. */
export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/**
 * Runs `command` with elevated (admin) privileges, prompting the user for
 * their password via the OS's native authorization dialog (never our own
 * UI). Used only as a fallback when a normal read fails with EPERM/EACCES —
 * see docs/00-visao-geral.md and docs/03-arquitetura.md ("remover.ts").
 */
export function execElevated(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    sudo.exec(command, SUDO_OPTIONS, (error, stdout) => {
      if (error) return reject(error);
      resolve(stdout ? stdout.toString() : "");
    });
  });
}

export function isPermissionError(error: unknown): boolean {
  const code = (error as { code?: string } | undefined)?.code;
  return code === "EPERM" || code === "EACCES";
}
