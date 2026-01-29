# Focus Fog (Scope Spotlight)

> **Stay in the flow. Focus on what you write.**

**Focus Fog** is a Visual Studio Code extension designed to improve your coding concentration. It automatically detects the active code block (function, class, or method) you are working on and visually "dims" everything else. This helps you maintain context without being distracted by the surrounding "spaghetti code."

<!-- ![Focus Fog Demo](https://via.placeholder.com/800x400?text=Focus+Fog+Demo+Placeholder) -->

## Key Features

*   **Automatic Scope Detection**: intelligently identifies the function, class, or logical block under your cursor using VS Code's native folding providers.
*   **Distraction-Free Coding**: Dims irrelevant code above and below your current focus area.
*   **Performance Optimized**: Built with a configurable debounce mechanism to ensure zero lag while typing or scrolling.
*   **Fully Configurable**: Customize the opacity, update delay, and more to match your workflow.
*   **Language Agnostic**: Works effectively with any language that supports code folding (TypeScript, JavaScript, Python, C#, Rust, Go, etc.).

## Configuration

You can customize **Focus Fog** to suit your preferences. Go to **File > Preferences > Settings** (`Ctrl+,`) and search for `focusFog`.

| Setting | Default | Description |
| :--- | :--- | :--- |
| `focusFog.enabled` | `true` | Globally enable or disable the Focus Fog extension. |
| `focusFog.opacity` | `0.3` | The opacity of the dimmed code. Range: `0.0` (invisible) to `1.0` (fully visible). Lower values create a stronger focus effect. |
| `focusFog.delay` | `200` | The delay (in milliseconds) before the fog updates after you stop moving the cursor. Higher values reduce flickering during rapid navigation. |

### Example Configuration (`settings.json`)

```json
{
  "focusFog.opacity": 0.2,
  "focusFog.delay": 150,
  "focusFog.enabled": true
}
```

## Commands

Access these commands via the **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`):

*   **`Focus Fog: Toggle`**: Quickly enable or disable the focus effect without opening settings.

## FAQ

**Q: Why isn't the fog updating immediately?**
A: To prevent performance issues, Focus Fog waits for a short "debounce" period (default 200ms) after you stop typing or moving the cursor. You can adjust this in the `focusFog.delay` setting.

**Q: It's not working for my language!**
A: Focus Fog relies on the language's "Formatting/Folding Range Provider." Ensure that you have a language extension installed (e.g., Python, C#) that supports code folding for your specific file type.

## Release Notes

### 0.0.1
*   Initial release.
*   implemented intelligent scope detection using Folding Ranges.
*   Added configurable opacity and debounce delay.
*   Added `Focus Fog: Toggle` command.

## License

This project is licensed under the MIT License.
