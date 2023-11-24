// https://github.com/microsoft/vscode/blob/74ffbad112afc39917e2bd01c030dc82e0817c21/src/vs/editor/browser/services/codeEditorService.ts

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------*/
import * as monaco from "monaco-editor"

type Event = monaco.IEvent
type ICodeEditor = monaco.editor.ICodeEditor
type IDiffEditor = monaco.editor.IDiffEditor
type IModelDecorationOptions = monaco.editor.IModelDecorationOptions
type ITextModel = monaco.editor.ITextModel
type ITextResourceEditorInput = monaco.editor.ITextResourceEditorInput
type IDisposable = monaco.IDisposable
type URI = monaco.Uri

export const ICodeEditorService = createDecorator<ICodeEditorService>("codeEditorService")

export interface ICodeEditorService {
  readonly _serviceBrand: undefined

  readonly onWillCreateCodeEditor: Event<void>
  readonly onCodeEditorAdd: Event<ICodeEditor>
  readonly onCodeEditorRemove: Event<ICodeEditor>

  readonly onWillCreateDiffEditor: Event<void>
  readonly onDiffEditorAdd: Event<IDiffEditor>
  readonly onDiffEditorRemove: Event<IDiffEditor>

  readonly onDidChangeTransientModelProperty: Event<ITextModel>
  readonly onDecorationTypeRegistered: Event<string>

  willCreateCodeEditor(): void
  addCodeEditor(editor: ICodeEditor): void
  removeCodeEditor(editor: ICodeEditor): void
  listCodeEditors(): readonly ICodeEditor[]

  willCreateDiffEditor(): void
  addDiffEditor(editor: IDiffEditor): void
  removeDiffEditor(editor: IDiffEditor): void
  listDiffEditors(): readonly IDiffEditor[]

  /**
   * Returns the current focused code editor (if the focus is in the editor or in an editor widget) or null.
   */
  getFocusedCodeEditor(): ICodeEditor | null

  registerDecorationType(
    description: string,
    key: string,
    options: IDecorationRenderOptions,
    parentTypeKey?: string,
    editor?: ICodeEditor
  ): void
  listDecorationTypes(): string[]
  removeDecorationType(key: string): void
  resolveDecorationOptions(typeKey: string, writable: boolean): IModelDecorationOptions
  resolveDecorationCSSRules(decorationTypeKey: string): CSSRuleList | null

  setModelProperty(resource: URI, key: string, value: any): void
  getModelProperty(resource: URI, key: string): any

  setTransientModelProperty(model: ITextModel, key: string, value: any): void
  getTransientModelProperty(model: ITextModel, key: string): any
  getTransientModelProperties(model: ITextModel): [string, any][] | undefined

  getActiveCodeEditor(): ICodeEditor | null
  openCodeEditor(
    input: ITextResourceEditorInput,
    source: ICodeEditor | null,
    sideBySide?: boolean
  ): Promise<ICodeEditor | null>
  registerCodeEditorOpenHandler(handler: ICodeEditorOpenHandler): IDisposable
}

export interface ICodeEditorOpenHandler {
  (
    input: ITextResourceEditorInput,
    source: ICodeEditor | null,
    sideBySide?: boolean
  ): Promise<ICodeEditor | null>
}
