import React from 'react';
import { RichUtils } from 'draft-js';

export default ({ blockType }) => ({
  children,
  setEditorState,
  getEditorState,
}) => {
  const onClick = React.useCallback(e => {
    e.preventDefault();

    setEditorState(RichUtils.toggleBlockType(getEditorState(), blockType));
  }, []);

  const onMouseDown = React.useCallback(e => {
    e.preventDefault();
  }, []);

  const isActive = React.useMemo(() => {
    if (!getEditorState) {
      return false;
    }

    const editorState = getEditorState();

    const type = editorState
      .getCurrentContent()
      .getBlockForKey(editorState.getSelection().getStartKey())
      .getType();

    return type === blockType;
  }, [getEditorState && getEditorState()]);

  return children({ onClick, isActive, onMouseDown });
};
