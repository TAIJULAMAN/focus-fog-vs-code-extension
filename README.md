# Focus Fog

**Focus Fog** (Scope Spotlight) is a VS Code extension that helps you stay in the flow by visually dimming everything outside your current code block.

![Focus Fog Demo](https://via.placeholder.com/800x400?text=Focus+Fog+Demo+Placeholder)

## Features

-   **Automatic Focus**: Detects the function, class, or block you are editing and dims the rest.
-   **Debounced Updates**: Performance-optimized to avoid flickering while you type or navigate.
-   **Configurable**: Adjust opacity, delay, or toggle it on/off.
-   **Standard VS Code Folding**: Uses the built-in folding providers for maximum compatibility with TypeScript, Python, C#, etc.

## Configuration

| Setting | Default | Description |
| :--- | :--- | :--- |
| `focusFog.enabled` | `true` | Enable or disable the extension. |
| `focusFog.opacity` | `0.3` | Opacity of the "fog" (0.0 to 1.0). Lower means the background is more transparent/dimmed. |
| `focusFog.delay` | `200` | Milliseconds to wait before updating the fog (debouncing). |

## Commands

-   `Focus Fog: Toggle`: Quickly enable or disable the focus effect.

## How it works

Focus Fog listens to your cursor position and queries VS Code for "Folding Ranges" (the same ones that let you collapse code). It finds the smallest range wrapping your cursor and applies a decoration to everything *before* and *after* that range.

## Known Issues

-   If the language server (e.g., TS Server) is slow to provide folding ranges, the fog might lag slightly when opening a new file.
-   Requires a language that supports folding.

---

**Enjoy your focus!**
