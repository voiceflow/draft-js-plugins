import React from 'react';
import { EditorState, Modifier } from 'draft-js';

import { FAKE_SELECTION_ENTITY } from './constants';

import createStore from './utils/createStore';
import getFakeEntityKeys from './utils/getFakeEntityKeys';
import fakeSelectionStrategy from './utils/fakeSelectionStrategy';

import FakeSelection from './components/FakeSelection';

export { FAKE_SELECTION_ENTITY } from './constants';

export default () => {
  const store = createStore({});

  const DecoratedFakeSelection = props => (
    <FakeSelection {...props} store={store} />
  );

  return {
    store,

    decorators: [
      {
        strategy: fakeSelectionStrategy,
        component: DecoratedFakeSelection,
      },
    ],

    initialize: ({ getEditorState, setEditorState }) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);
    },

    applyFakeSelection: editorState => {
      const selectionIsCollapsed = editorState.getSelection().isCollapsed();

      if (selectionIsCollapsed) {
        return editorState;
      }

      let content = editorState.getCurrentContent();

      content = content.createEntity(FAKE_SELECTION_ENTITY, 'MUTABLE', {
        selected: true,
      });

      const key = content.getLastCreatedEntityKey();
      const selection = editorState.getSelection();

      content = Modifier.applyEntity(content, selection, key);

      return EditorState.push(editorState, content, 'apply-entity');
    },

    removeFakeSelection: editorState => {
      const entityKeys = getFakeEntityKeys(editorState);

      let content = editorState.getCurrentContent();

      entityKeys.forEach(key => {
        content = content.mergeEntityData(key, { selected: false });
      });

      return EditorState.forceSelection(
        EditorState.push(editorState, content, 'apply-entity'),
        editorState.getSelection()
      );
    },
  };
};
