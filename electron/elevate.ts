import { execFile } from "node:child_process";
import { BrowserWindow, dialog } from "electron";
import { loadSettings } from "./settings";
import type { Settings } from "./types";

const PROMPTS: Record<Settings["language"], string> = {
  "pt-BR": "O Limpa Tudo precisa da sua senha de administrador para continuar.",
  "en-US": "Limpa Tudo needs your administrator password to continue.",
  es: "Limpa Tudo necesita tu contraseña de administrador para continuar.",
};

const CONFIRM: Record<Settings["language"], { message: string; detail: string; ok: string; cancel: string }> = {
  "pt-BR": {
    message: "Estes itens pertencem ao sistema e só podem ser removidos com a senha de administrador:",
    detail: "Eles vão para a Lixeira, como os demais.",
    ok: "Continuar",
    cancel: "Pular estes itens",
  },
  "en-US": {
    message: "These items belong to the system and can only be removed with the administrator password:",
    detail: "They go to the Trash, like the others.",
    ok: "Continue",
    cancel: "Skip these items",
  },
  es: {
    message: "Estos elementos pertenecen al sistema y solo se pueden eliminar con la contraseña de administrador:",
    detail: "Van a la Papelera, como los demás.",
    ok: "Continuar",
    cancel: "Omitir estos elementos",
  },
};

/**
 * Shows exactly which paths will be touched as root, before the OS password
 * prompt appears (docs/04-fluxo-scan-e-remocao.md, step 4). Resolves false
 * if the user skips them.
 */
export async function confirmElevation(paths: string[], permanent: boolean): Promise<boolean> {
  const text = CONFIRM[language()];
  const options = {
    type: "warning" as const,
    message: text.message,
    detail: `${paths.join("\n")}${permanent ? "" : `\n\n${text.detail}`}`,
    buttons: [text.ok, text.cancel],
    defaultId: 0,
    cancelId: 1,
  };
  const window = BrowserWindow.getFocusedWindow();
  const { response } = window ? await dialog.showMessageBox(window, options) : await dialog.showMessageBox(options);
  return response === 0;
}

/** Escapes a path for safe interpolation into a single-quoted shell string. */
export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/** Quotes a value as an AppleScript string literal. */
function appleScriptString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Runs `command` (a /bin/sh command line) as root, asking for the admin
 * password through the OS's own dialog — never our UI:
 * - macOS: `osascript … with administrator privileges` (the native
 *   authorization prompt; works from a signed, hardened app).
 * - Linux: `pkexec`, which shows the desktop's polkit prompt.
 *
 * Rejects if the user cancels the prompt or the command fails. Only called
 * on demand, for one user action (measure a locked item, remove items that
 * need admin) — see docs/00-visao-geral.md and docs/03-arquitetura.md.
 */
export function execElevated(command: string): Promise<string> {
  const [binary, args] =
    process.platform === "darwin"
      ? [
          "/usr/bin/osascript",
          [
            "-e",
            `do shell script ${appleScriptString(command)} with prompt ${appleScriptString(prompt())} with administrator privileges`,
          ],
        ]
      : ["pkexec", ["/bin/sh", "-c", command]];

  return new Promise((resolve, reject) => {
    execFile(binary, args, { maxBuffer: 16 * 1024 * 1024 }, (error, stdout) => {
      if (error) return reject(error);
      resolve(stdout.toString());
    });
  });
}

function prompt(): string {
  return PROMPTS[language()];
}

function language(): Settings["language"] {
  try {
    const lang = loadSettings().language;
    return lang in PROMPTS ? lang : "en-US";
  } catch {
    return "en-US";
  }
}

export function isPermissionError(error: unknown): boolean {
  const code = (error as { code?: string } | undefined)?.code;
  return code === "EPERM" || code === "EACCES";
}
