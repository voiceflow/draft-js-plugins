import { EditorState, DraftBlockType } from 'draft-js';
import { ComponentType, ReactNode, MouseEventHandler } from 'react';

export interface DraftJsBaseButtonProps {
  children(props: {
    onClick: MouseEventHandler;
    isActive: boolean;
    onMouseDown: MouseEventHandler;
  }): ReactNode;
}

export interface DraftJsBlockAlignmentButtonProps
  extends DraftJsBaseButtonProps {
  alignment: string;

  setAlignment(alignment: string): void;
}

type DraftJsBlockAlignmentButtonType = ComponentType<
  DraftJsBlockAlignmentButtonProps
>;

export const AlignBlockLeftButton: DraftJsBlockAlignmentButtonType;
export const AlignBlockRightButton: DraftJsBlockAlignmentButtonType;
export const AlignBlockCenterButton: DraftJsBlockAlignmentButtonType;
export const AlignBlockDefaultButton: DraftJsBlockAlignmentButtonType;

export interface DraftJsBlockStyleButtonProps extends DraftJsBaseButtonProps {
  setEditorState(editorState: EditorState): void;

  getEditorState(): EditorState;
}

type DraftJsBlockStyleButtonType = ComponentType<DraftJsBlockStyleButtonProps>;

export const createBlockStyleButton: (
  blockType: DraftBlockType
) => DraftJsBlockStyleButtonType;

export const createInlineStyleButton: (
  inlineStyle: string
) => DraftJsBlockStyleButtonType;

export const toggleInlineStyle: (
  editorState: EditorState,
  inlineStyle: string
) => EditorState;

export const createBlockAlignmentButton: (
  alignment: string
) => DraftJsBlockAlignmentButtonType;

export const BlockquoteButton: DraftJsBlockStyleButtonType;
export const CodeBlockButton: DraftJsBlockStyleButtonType;
export const HeadlineOneButton: DraftJsBlockStyleButtonType;
export const HeadlineThreeButton: DraftJsBlockStyleButtonType;
export const HeadlineTwoButton: DraftJsBlockStyleButtonType;
export const CodeButton: DraftJsBlockStyleButtonType;
export const OrderedListButton: DraftJsBlockStyleButtonType;
export const UnorderedListButton: DraftJsBlockStyleButtonType;

export const BoldButton: DraftJsBlockStyleButtonType;
export const ItalicButton: DraftJsBlockStyleButtonType;
export const SubButton: DraftJsBlockStyleButtonType;
export const SupButton: DraftJsBlockStyleButtonType;
export const UnderlineButton: DraftJsBlockStyleButtonType;
