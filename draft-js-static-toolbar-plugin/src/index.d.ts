import { EditorPlugin } from 'draft-js-plugins-editor';
import { DraftJsBlockStyleButtonProps } from '@voiceflow/draft-js-buttons';
import { ComponentType, ReactNode } from 'react';

export interface ToolbarProps {
  children(externalProps: DraftJsBlockStyleButtonProps): ReactNode;
}

export interface ToolBarPluginStore {
  getItem: <T = any>(key: string) => T;
  updateItem: <T = any>(key: string, item: T) => void;
  subscribeToItem: <T = any>(key: string, callback: (item: T) => void) => void;
  unsubscribeFromItem: <T = any>(
    key: string,
    callback: (item: T) => void
  ) => void;
}

export type StaticToolBarPlugin = EditorPlugin & {
  store: ToolBarPluginStore;
  Toolbar: ComponentType<ToolbarProps>;
};

declare const createStaticToolbarPlugin: () => StaticToolBarPlugin;

export default createStaticToolbarPlugin;
