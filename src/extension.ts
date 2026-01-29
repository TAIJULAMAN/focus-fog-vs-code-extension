import * as vscode from 'vscode';

let fogDecoration: vscode.TextEditorDecorationType | undefined;
let debounceTimer: Serializable | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Focus Fog is active');

    // Initialize decoration based on configuration
    createDecoration();

    // Command to toggle separately from config (optional, but good for keybindings)
    let toggleCommand = vscode.commands.registerCommand('focusFog.toggle', () => {
        const config = vscode.workspace.getConfiguration('focusFog');
        const currentState = config.get<boolean>('enabled');
        config.update('enabled', !currentState, vscode.ConfigurationTarget.Global);
    });

    context.subscriptions.push(toggleCommand);

    // Event Listeners
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(e => {
            triggerUpdateFog();
        }),
        vscode.window.onDidChangeActiveTextEditor(e => {
            triggerUpdateFog();
        }),
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('focusFog')) {
                createDecoration(); // Re-create if opacity/color changes
                triggerUpdateFog();
            }
        })
    );

    // Initial run
    triggerUpdateFog();
}

function createDecoration() {
    // Dispose existing if any
    if (fogDecoration) {
        fogDecoration.dispose();
    }

    const config = vscode.workspace.getConfiguration('focusFog');
    const opacity = config.get<number>('opacity', 0.3);

    fogDecoration = vscode.window.createTextEditorDecorationType({
        opacity: `${opacity}`,
        // filter: 'blur(1px)' // Optional: make configurable later
    });
}

// Debounce wrapper
function triggerUpdateFog() {
    const config = vscode.workspace.getConfiguration('focusFog');
    const delay = config.get<number>('delay', 200);

    if (debounceTimer) {
        clearTimeout(debounceTimer as any);
    }

    debounceTimer = setTimeout(() => {
        updateFog();
    }, delay);
}

// Check type for timeout (Node vs Browser) - simple workaround for TS
type Serializable = any;

async function updateFog() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor || !fogDecoration) {
        return;
    }

    const config = vscode.workspace.getConfiguration('focusFog');
    if (!config.get<boolean>('enabled')) {
        activeEditor.setDecorations(fogDecoration, []);
        return;
    }

    const document = activeEditor.document;
    const cursorPosition = activeEditor.selection.active;

    // 1. Get Folding Ranges
    // We rely on VS Code's built-in folding provider
    const ranges = await vscode.commands.executeCommand<vscode.FoldingRange[]>(
        'vscode.executeFoldingRangeProvider',
        document.uri
    );

    if (!ranges || ranges.length === 0) {
        // No ranges found, clear fog (or maybe fog everything? No, clear is safer)
        activeEditor.setDecorations(fogDecoration, []);
        return;
    }

    // 2. Find the "Best" Range
    // We want the smallest range that strictly contains the cursor.
    // Folding ranges usually cover the whole block.
    // currentLine should be >= start and <= end.
    const currentLine = cursorPosition.line;

    // Filter ranges that contain the cursor
    const validRanges = ranges.filter(r => r.start <= currentLine && r.end >= currentLine);

    if (validRanges.length === 0) {
        activeEditor.setDecorations(fogDecoration, []);
        return;
    }

    // Sort by size (ascending) to find the smallest wrapping scope
    validRanges.sort((a, b) => {
        const lenA = a.end - a.start;
        const lenB = b.end - b.start;
        return lenA - lenB;
    });

    const targetRange = validRanges[0];

    // 3. Create Decorations
    const decorations: vscode.Range[] = [];

    // Fog Before
    // From line 0 to targetRange.start - 1
    // Actually, folding ranges start usually at the function definition line.
    // If the function starts at line 10, we want to fog 0-9.
    // Ensure we don't pass negative line numbers.
    if (targetRange.start > 0) {
        decorations.push(new vscode.Range(0, 0, targetRange.start, 0));
    }

    // Fog After
    // From targetRange.end + 1 to document end.
    if (targetRange.end < document.lineCount - 1) {
        decorations.push(new vscode.Range(targetRange.end + 1, 0, document.lineCount, 0));
    }

    // 4. Apply
    activeEditor.setDecorations(fogDecoration, decorations);
}

export function deactivate() {
    if (fogDecoration) {
        fogDecoration.dispose();
    }
}
