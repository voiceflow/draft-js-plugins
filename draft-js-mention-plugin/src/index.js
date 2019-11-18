import React from 'react';
import { Map } from 'immutable';
import Mention from './Mention';
import MentionSuggestions from './MentionSuggestions'; // eslint-disable-line import/no-named-as-default
import MentionSuggestionsPortal from './MentionSuggestionsPortal';
import defaultRegExp from './defaultRegExp';
import mentionStrategy from './mentionStrategy';
import mentionSuggestionsStrategy from './mentionSuggestionsStrategy';
import suggestionsFilter from './utils/defaultSuggestionsFilter';
import defaultPositionSuggestions from './utils/positionSuggestions';
import { defaultTheme } from './theme.js';

export { default as MentionSuggestions } from './MentionSuggestions';

export { defaultTheme };

export default (config = {}) => {
  const callbacks = {
    keyBindingFn: undefined,
    handleKeyCommand: undefined,
    handleReturn: undefined,
    handlePastedText: undefined,
    onChange: undefined,
  };

  const ariaProps = {
    ariaHasPopup: 'false',
    ariaExpanded: false,
    ariaOwneeID: undefined,
    ariaActiveDescendantID: undefined,
  };

  let searches = new Map();
  let mentions = new Map();
  let escapedSearch;
  let portalClientRectFunctions = new Map();
  let mentionClientRectFunctions = new Map();

  const store = {
    getEditorState: undefined,
    setEditorState: undefined,
    getPortalClientRect: offsetKey =>
      portalClientRectFunctions.get(offsetKey)(),
    getMentionClientRect: offsetKey =>
      mentionClientRectFunctions.get(offsetKey)(),
    getAllSearches: () => searches,
    getAllMentions: () => mentions,
    getSearch: offsetKey => searches.get(offsetKey),
    isEscaped: offsetKey => escapedSearch === offsetKey,
    escapeSearch: offsetKey => {
      escapedSearch = offsetKey;
    },

    resetEscapedSearch: () => {
      escapedSearch = undefined;
    },

    registerPortal: offsetKey => {
      searches = searches.set(offsetKey, offsetKey);
    },

    updatePortalClientRect: (offsetKey, func) => {
      portalClientRectFunctions = portalClientRectFunctions.set(
        offsetKey,
        func
      );
    },

    unregisterPortal: offsetKey => {
      searches = searches.delete(offsetKey);
      portalClientRectFunctions = portalClientRectFunctions.delete(offsetKey);
    },

    registerMention: offsetKey => {
      mentions = mentions.set(offsetKey, offsetKey);
    },

    updateMentionClientRect: (offsetKey, func) => {
      mentionClientRectFunctions = mentionClientRectFunctions.set(
        offsetKey,
        func
      );
    },

    unregisterMention: offsetKey => {
      mentions = mentions.delete(offsetKey);
      mentionClientRectFunctions = mentionClientRectFunctions.delete(offsetKey);
    },

    getIsOpened: () => searches.size > 0,
  };

  // Styles are overwritten instead of merged as merging causes a lot of confusion.
  //
  // Why? Because when merging a developer needs to know all of the underlying
  // styles which needs a deep dive into the code. Merging also makes it prone to
  // errors when upgrading as basically every styling change would become a major
  // breaking change. 1px of an increased padding can break a whole layout.
  const {
    mentionPrefix = '',
    mentionSuffix = '',
    theme = defaultTheme,
    positionSuggestions = defaultPositionSuggestions,
    mentionComponent,
    mentionSuggestionsComponent: MentionSuggestionsComponent = MentionSuggestions,
    mentionSuggestionsPortalComponent,
    entityMutability = 'SEGMENTED',
    mentionTrigger = '@',
    mentionRegExp = defaultRegExp,
    supportWhitespace = false,
  } = config;
  const mentionSearchProps = {
    ariaProps,
    callbacks,
    theme,
    store,
    entityMutability,
    positionSuggestions,
    mentionTrigger,
    mentionPrefix,
    mentionSuffix,
    mentionRegExp,
    supportWhitespace,
  };
  const DecoratedMentionSuggestionsComponent = React.forwardRef(
    (props, ref) => (
      <MentionSuggestionsComponent
        {...props}
        {...mentionSearchProps}
        ref={ref}
      />
    )
  );
  const DecoratedMention = props => (
    <Mention
      {...props}
      theme={theme}
      store={store}
      mentionComponent={mentionComponent}
    />
  );
  const DecoratedMentionSuggestionsPortal = props => (
    <MentionSuggestionsPortal
      {...props}
      store={store}
      portalComponent={mentionSuggestionsPortalComponent}
    />
  );
  return {
    MentionSuggestions: DecoratedMentionSuggestionsComponent,
    decorators: [
      {
        strategy: mentionStrategy(mentionTrigger),
        component: DecoratedMention,
      },
      {
        strategy: mentionSuggestionsStrategy(
          mentionTrigger,
          supportWhitespace,
          mentionRegExp,
          mentionSuffix
        ),
        component: DecoratedMentionSuggestionsPortal,
      },
    ],
    getAccessibilityProps: () => ({
      role: 'combobox',
      ariaAutoComplete: 'list',
      ariaHasPopup: ariaProps.ariaHasPopup,
      ariaExpanded: ariaProps.ariaExpanded,
      ariaActiveDescendantID: ariaProps.ariaActiveDescendantID,
      ariaOwneeID: ariaProps.ariaOwneeID,
    }),

    initialize: ({ getEditorState, setEditorState }) => {
      store.getEditorState = getEditorState;
      store.setEditorState = setEditorState;
    },

    keyBindingFn: keyboardEvent =>
      callbacks.keyBindingFn && callbacks.keyBindingFn(keyboardEvent),
    handleReturn: keyboardEvent =>
      callbacks.handleReturn && callbacks.handleReturn(keyboardEvent),
    handlePastedText: keyboardEvent =>
      callbacks.handlePastedText && callbacks.handlePastedText(keyboardEvent),
    onChange: editorState => {
      if (callbacks.onChange) return callbacks.onChange(editorState);
      return editorState;
    },
  };
};

export const defaultSuggestionsFilter = suggestionsFilter;
