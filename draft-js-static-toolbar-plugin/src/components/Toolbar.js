import React from 'react';

const Toolbar = ({ store, children }) => {
  const [, forceUpdate] = React.useState(0);
  const [OverrideContent, setOverrideContent] = React.useState();

  React.useEffect(() => {
    const callback = () => forceUpdate(i => i + 1);

    store.subscribeToItem('selection', callback);

    return () => {
      store.unsubscribeFromItem('selection', callback);
    };
  }, []);

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
