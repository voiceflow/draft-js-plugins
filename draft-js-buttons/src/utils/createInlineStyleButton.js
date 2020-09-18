import React from 'react';
import { RichUtils, SelectionState, EditorState } from 'draft-js';

export default ({ style }) => ({
  children,
  setEditorState,
  getEditorState,
}) => {
  const onClick = React.useCallback(e => {
    e.preventDefault();

    let editorState = getEditorState();
    let selection = editorState.getSelection();

    if (selection.isCollapsed()) {
      const currentContent = editorState.getCurrentContent();
      const blockMap = currentContent.getBlockMap();
      const lastBlock = blockMap.last();
      const firstBlock = blockMap.first();
      const lastBlockKey = lastBlock.getKey();
      const firstBlockKey = firstBlock.getKey();
      const lengthOfLastBlock = lastBlock.getLength();
      const prevSelection = selection;

      selection = new SelectionState({
        focusKey: lastBlockKey,
        anchorKey: firstBlockKey,
        focusOffset: lengthOfLastBlock,
        anchorOffset: 0,
      });

      editorState = EditorState.acceptSelection(editorState, selection);
      editorState = RichUtils.toggleInlineStyle(editorState, style);
      editorState = EditorState.acceptSelection(editorState, prevSelection);

      setEditorState(editorState);
    } else {
      setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    }
  }, []);

  const onMouseDown = React.useCallback(e => {
    e.preventDefault();
  }, []);

  const isActive = React.useMemo(() => {
    if (!getEditorState) {
      return false;
    }

    return getEditorState()
      .getCurrentInlineStyle()
      .has(style);
  }, [getEditorState && getEditorState()]);

  return children({ onClick, isActive, onMouseDown });
};
