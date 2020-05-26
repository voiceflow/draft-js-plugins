import React from 'react';

const Toolbar = ({ store, children }) => {
  const [OverrideContent, setOverrideContent] = React.useState();

  const childrenProps = {
    getEditorState: store.getItem('getEditorState'),
    setEditorState: store.getItem('setEditorState'),
    onOverrideContent: setOverrideContent,
  };

  return OverrideContent ? (
    <OverrideContent {...childrenProps} />
  ) : (
    children(childrenProps)
  );
};

export default Toolbar;
