import * as vscode from 'vscode';

let fogDecoration: vscode.TextEditorDecorationType | undefined;
let debounceTimer: Serializable | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Focus Fog is active');
    createDecoration();

    let toggleCommand = vscode.commands.registerCommand('focusFog.toggle', () => {
        const config = vscode.workspace.getConfiguration('focusFog');
        const currentState = config.get<boolean>('enabled');
        config.update('enabled', !currentState, vscode.ConfigurationTarget.Global);
    });

    context.subscriptions.push(toggleCommand);

    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(e => {
            triggerUpdateFog();
        }),
        vscode.window.onDidChangeActiveTextEditor(e => {
            triggerUpdateFog();
        }),
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('focusFog')) {
                createDecoration();
                triggerUpdateFog();
            }
        })
    );

    triggerUpdateFog();
}

function createDecoration() {
    if (fogDecoration) {
        fogDecoration.dispose();
    }

    const config = vscode.workspace.getConfiguration('focusFog');
    const opacity = config.get<number>('opacity', 0.3);

    fogDecoration = vscode.window.createTextEditorDecorationType({
        opacity: `${opacity}`,
    });
}

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

    const ranges = await vscode.commands.executeCommand<vscode.FoldingRange[]>(
        'vscode.executeFoldingRangeProvider',
        document.uri
    );

    if (!ranges || ranges.length === 0) {
        activeEditor.setDecorations(fogDecoration, []);
        return;
    }
    const currentLine = cursorPosition.line;
    const validRanges = ranges.filter(r => r.start <= currentLine && r.end >= currentLine);

    if (validRanges.length === 0) {
        activeEditor.setDecorations(fogDecoration, []);
        return;
    }
    validRanges.sort((a, b) => {
        const lenA = a.end - a.start;
        const lenB = b.end - b.start;
        return lenA - lenB;
    });

    const targetRange = validRanges[0];

    const decorations: vscode.Range[] = [];

    if (targetRange.start > 0) {
        decorations.push(new vscode.Range(0, 0, targetRange.start, 0));
    }
    if (targetRange.start > 0) {
        decorations.push(new vscode.Range(0, 0, targetRange.start, 0));
    }
    if (targetRange.end < document.lineCount - 1) {
        decorations.push(new vscode.Range(targetRange.end + 1, 0, document.lineCount, 0));
    }
    activeEditor.setDecorations(fogDecoration, decorations);
}

export function deactivate() {
    if (fogDecoration) {
        fogDecoration.dispose();
    }
}
