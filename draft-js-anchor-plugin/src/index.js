import EditorUtils from 'draft-js-plugins-utils';

import createLink from './utils/createLink';

import linkStrategy, { matchesEntityType } from './linkStrategy';

export default ({ Link }) => {
  const store = {
    getEditorState: undefined,
    setEditorState: undefined,
  };

  return {
    initialize: ({ getEditorState, setEditorState }) => {
      store.getEditorState = getEditorState;
      store.setEditorState = setEditorState;
    },

    decorators: [
      {
        strategy: linkStrategy,
        component: createLink(Link),
        matchesEntityType,
      },
    ],

    createLinkAtSelection: (editorState, url) =>
      EditorUtils.createLinkAtSelection(editorState, url),

    removeLinkAtSelection: editorState =>
      EditorUtils.removeLinkAtSelection(editorState),

    hasLinkAtSelection: editorState =>
      EditorUtils.hasEntity(editorState, 'LINK'),
  };
};
