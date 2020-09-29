import React from 'react';

import toggleInlineStyle from './toggleInlineStyle';

export default ({ style }) => ({
  children,
  setEditorState,
  getEditorState,
}) => {
  const onClick = React.useCallback(e => {
    e.preventDefault();

    setEditorState(toggleInlineStyle(getEditorState(), style));
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
