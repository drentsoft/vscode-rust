import * as vscode from 'vscode';

import { Server } from './server';

const RA_LSP_DEBUG = process.env.__RA_LSP_SERVER_DEBUG;

export class Config {
    public highlightingOn = true;
    public enableEnhancedTyping = true;
    public raLspServerPath = RA_LSP_DEBUG || 'ra_lsp_server';

    private prevEnhancedTyping: null | boolean = null;

    constructor() {
        vscode.workspace.onDidChangeConfiguration(_ =>
            this.userConfigChanged()
        );
        this.userConfigChanged();
    }

    public userConfigChanged() {
        const config = vscode.workspace.getConfiguration('rust-analyzer');
        if (config.has('highlightingOn')) {
            this.highlightingOn = config.get('highlightingOn') as boolean;
        }

        if (!this.highlightingOn && Server) {
            Server.highlighter.removeHighlights();
        }

        if (config.has('enableEnhancedTyping')) {
            this.enableEnhancedTyping = config.get('enableEnhancedTyping') as boolean;

            if (this.prevEnhancedTyping === null) {
                this.prevEnhancedTyping = this.enableEnhancedTyping;
            }
        } else if (this.prevEnhancedTyping === null) {
            this.prevEnhancedTyping = this.enableEnhancedTyping;
        }

        if (this.prevEnhancedTyping !== this.enableEnhancedTyping) {
            const reloadAction = 'Reload now';
            vscode.window.showInformationMessage('Changing enhanced typing setting requires a reload', reloadAction)
                .then(selectedAction => {
                    if (selectedAction === reloadAction) {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
            this.prevEnhancedTyping = this.enableEnhancedTyping;
        }


        if (config.has('raLspServerPath')) {
            this.raLspServerPath =
                RA_LSP_DEBUG || (config.get('raLspServerPath') as string);
        }
    }
}
