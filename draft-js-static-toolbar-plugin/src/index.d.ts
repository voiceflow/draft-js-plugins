import { EditorPlugin } from 'draft-js-plugins-editor';
import { DraftJsBlockStyleButtonProps } from '@voiceflow/draft-js-buttons';
import { ComponentType, ReactNode } from 'react';

export interface ToolbarProps {
  children(externalProps: DraftJsBlockStyleButtonProps): ReactNode;
}

export type StaticToolBarPlugin = EditorPlugin & {
  Toolbar: ComponentType<ToolbarProps>;
};

declare const createStaticToolbarPlugin: () => StaticToolBarPlugin;

export default createStaticToolbarPlugin;

export interface SeparatorProps {
  className?: string;
}

declare const Separator: (props: SeparatorProps) => JSX.Element;

export { Separator };
