import * as vscode from 'vscode';

let fogDecoration: vscode.TextEditorDecorationType | undefined;
let debounceTimer: Serializable | undefined;
let fogStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    console.log('Focus Fog is active');
    createDecoration();

    let toggleCommand = vscode.commands.registerCommand('focusFog.toggle', () => {
        const config = vscode.workspace.getConfiguration('focusFog');
        const currentState = config.get<boolean>('enabled');
        config.update('enabled', !currentState, vscode.ConfigurationTarget.Global);
    });

    context.subscriptions.push(toggleCommand);

    fogStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    fogStatusBarItem.command = 'focusFog.toggle';
    context.subscriptions.push(fogStatusBarItem);
    updateStatusBarItem();
    fogStatusBarItem.show();

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
                updateStatusBarItem();
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

function updateStatusBarItem() {
    const config = vscode.workspace.getConfiguration('focusFog');
    const enabled = config.get<boolean>('enabled');
    if (enabled) {
        fogStatusBarItem.text = '$(eye) Fog: On';
        fogStatusBarItem.tooltip = 'Click to disable Focus Fog';
    } else {
        fogStatusBarItem.text = '$(eye-closed) Fog: Off';
        fogStatusBarItem.tooltip = 'Click to enable Focus Fog';
        fogStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }
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

    if (targetRange.end < document.lineCount - 1) {
        decorations.push(new vscode.Range(targetRange.end + 1, 0, document.lineCount, 0));
    }
    activeEditor.setDecorations(fogDecoration, decorations);
}

export function deactivate() {
    if (fogDecoration) {
        fogDecoration.dispose();
    }
    if (fogStatusBarItem) {
        fogStatusBarItem.dispose();
    }
}
