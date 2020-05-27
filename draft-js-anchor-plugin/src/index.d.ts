import { EditorPlugin } from 'draft-js-plugins-editor';
import { EditorState } from 'draft-js';
import { AnchorHTMLAttributes, ComponentType } from 'react';

export interface AnchorPluginConfig {
  Link: ComponentType<{ href: string }>;
}

export type AnchorPlugin = EditorPlugin & {
  hasLinkAtSelection: (editorState: EditorState) => boolean;
  createLinkAtSelection: (editorState: EditorState, url: string) => EditorState;
  removeLinkAtSelection: (editorState: EditorState) => EditorState;
};

declare const createAnchorPlugin: (config: AnchorPluginConfig) => AnchorPlugin;

export default createAnchorPlugin;
