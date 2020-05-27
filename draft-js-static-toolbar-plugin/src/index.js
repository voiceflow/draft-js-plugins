import React from 'react';
import createStore from './utils/createStore';
import Toolbar from './components/Toolbar';

export default () => {
  const store = createStore({});

  const StaticToolbar = props => <Toolbar {...props} store={store} />;

  return {
    store,

    initialize: ({ getEditorState, setEditorState }) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);
    },

    // Re-Render the text-toolbar on selection change
    onChange: editorState => {
      store.updateItem('selection', editorState.getSelection());

      return editorState;
    },

    Toolbar: StaticToolbar,
  };
};
