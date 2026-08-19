import { Menu, type BrowserWindow, type MenuItemConstructorOptions } from "electron";
import { menuLabels } from "./menuLabels";
import type { Settings } from "./types";

const APP_NAME = "Limpa Tudo";

/**
 * Builds and installs the native app menu, labeled in the app's selected
 * language (not the OS locale) — see docs. "About" opens our own in-app
 * screen instead of the native macOS About panel, via `showAbout`.
 */
export function buildMenu(language: Settings["language"], getMainWindow: () => BrowserWindow | null) {
  const t = menuLabels(language);
  const isMac = process.platform === "darwin";

  function showAbout() {
    getMainWindow()?.webContents.send("show-about");
  }

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: APP_NAME,
            submenu: [
              { label: t.about, click: showAbout },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { label: t.hide, role: "hide" as const },
              { label: t.hideOthers, role: "hideOthers" as const },
              { label: t.showAll, role: "unhide" as const },
              { type: "separator" as const },
              { label: t.quit, role: "quit" as const },
            ],
          },
        ]
      : []),
    {
      label: t.edit,
      submenu: [
        { label: t.undo, role: "undo" },
        { label: t.redo, role: "redo" },
        { type: "separator" },
        { label: t.cut, role: "cut" },
        { label: t.copy, role: "copy" },
        { label: t.paste, role: "paste" },
        { label: t.selectAll, role: "selectAll" },
      ],
    },
    {
      label: t.view,
      submenu: [
        { label: t.reload, role: "reload" },
        { label: t.toggleDevTools, role: "toggleDevTools" },
        { type: "separator" },
        { label: t.resetZoom, role: "resetZoom" },
        { label: t.zoomIn, role: "zoomIn" },
        { label: t.zoomOut, role: "zoomOut" },
        { type: "separator" },
        { label: t.toggleFullscreen, role: "togglefullscreen" },
      ],
    },
    {
      label: t.window,
      submenu: [
        { label: t.minimize, role: "minimize" },
        { label: t.close, role: "close" },
        ...(isMac
          ? [{ type: "separator" as const }, { label: t.front, role: "front" as const }]
          : []),
      ],
    },
    ...(!isMac
      ? [
          {
            label: t.help,
            submenu: [{ label: t.about, click: showAbout }],
          },
        ]
      : []),
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
