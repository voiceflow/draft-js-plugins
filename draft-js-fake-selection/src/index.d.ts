import { EditorState } from 'draft-js';
import { EditorPlugin } from 'draft-js-plugins-editor';

export const FAKE_SELECTION_ENTITY: string;

export interface FakeSelectionPluginStore {
  getItem: <T = any>(key: string) => T;
  updateItem: <T = any>(key: string, item: T) => void;
  subscribeToItem: <T = any>(key: string, callback: (item: T) => void) => void;
  unsubscribeFromItem: <T = any>(
    key: string,
    callback: (item: T) => void
  ) => void;
}

export type FakeSelectionPlugin = EditorPlugin & {
  store: FakeSelectionPluginStore;
  applyFakeSelection: (editorState: EditorState) => EditorState;
  removeFakeSelection: (editorState: EditorState) => EditorState;
};

declare const createFakeSelectionPlugin: () => FakeSelectionPlugin;

export default createFakeSelectionPlugin;
