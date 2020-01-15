import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { genKey, EditorState } from 'draft-js';
import getFragmentFromSelection from 'draft-js/lib/getFragmentFromSelection';
import escapeRegExp from 'lodash/escapeRegExp';
import Entry from './Entry';
import addMention from '../modifiers/addMention';
import decodeOffsetKey from '../utils/decodeOffsetKey';
import getSearchText from '../utils/getSearchText';
import defaultEntryComponent from './Entry/defaultEntryComponent';
import getSelected from '../utils/getSelected';
import getTypeByTrigger from '../utils/getTypeByTrigger';

export class MentionSuggestions extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
    entityMutability: PropTypes.oneOf(['SEGMENTED', 'IMMUTABLE', 'MUTABLE']),
    entryComponent: PropTypes.func,
    onAddMention: PropTypes.func,
    suggestions: PropTypes.array.isRequired,
    suggestOnSelection: PropTypes.bool,
  };

  static defaultProps = {
    suggestOnSelection: true,
  };

  state = {
    focusedOptionIndex: 0,
  };

  constructor(props) {
    super(props);
    this.key = genKey();
    this.props.callbacks.onChange = this.onEditorStateChange;
    this.props.callbacks.keyBindingFn = this.defaultKeyBindingFn;
  }

  componentDidUpdate(prevProps) {
    if (this.creatingMention) {
      return;
    }

    if (this.popover) {
      // In case the list shrinks there should be still an option focused.
      // Note: this might run multiple times and deduct 1 until the condition is
      // not fullfilled anymore.
      const size = this.props.suggestions.length;
      if (size > -1 && this.state.focusedOptionIndex >= size) {
        this.setState({
          focusedOptionIndex: size - 1,
        });
      }

      if (this.selectionToReplace) {
        try {
          const newStyles = this.props.positionSuggestions({
            prevProps,
            decoratorRect: this.selectionToReplaceRect,
            props: this.props,
            popover: this.popover,
          });
          Object.keys(newStyles).forEach(key => {
            this.popover.style[key] = newStyles[key];
          });
        } catch (e) {
          console.warn(e);
        }
      } else if (this.props.store.getAllSearches().has(this.activeOffsetKey)) {
        const decoratorRect = this.props.store.getPortalClientRect(
          this.activeOffsetKey
        );
        const newStyles = this.props.positionSuggestions({
          decoratorRect,
          prevProps,
          props: this.props,
          popover: this.popover,
        });
        Object.keys(newStyles).forEach(key => {
          this.popover.style[key] = newStyles[key];
        });
      } else if (this.props.store.getAllMentions().has(this.activeEntityKey)) {
        const decoratorRect = this.props.store.getMentionClientRect(
          this.activeEntityKey
        );
        const newStyles = this.props.positionSuggestions({
          decoratorRect,
          prevProps,
          props: this.props,
          popover: this.popover,
        });
        Object.keys(newStyles).forEach(key => {
          this.popover.style[key] = newStyles[key];
        });
      }
    }
  }

  componentWillUnmount() {
    this.props.callbacks.onChange = undefined;
  }

  onEditorStateChange = editorState => {
    if (this.creatingMention) {
      return editorState;
    }

    let eState = editorState;
    const searches = this.props.store.getAllSearches();
    const selection = eState.getSelection();

    if (
      this.props.suggestOnSelection &&
      selection.getEndOffset() !== selection.getStartOffset()
    ) {
      if (this.prevSelection === selection) {
        return eState;
      }

      this.prevSelection = selection;

      if (selection.hasFocus) {
        const selected = getFragmentFromSelection(eState);
        const selectionText = selected
          ? selected.map(x => x.getText()).join('\n')
          : '';

        if (selectionText) {
          this.selectionToReplace = selection;
          this.selectedBlock = selected;
          this.lastSearchValue = this.props.searchValueReplaceRegexp
            ? selectionText.replace(this.props.searchValueReplaceRegexp, '')
            : selectionText;

          this.props.onSearchChange({ value: this.lastSearchValue });

          this.selectionToReplaceRect = getSelected()
            .getRangeAt(0)
            .getBoundingClientRect();

          if (!this.props.open) {
            this.openDropdown();
          }

          return eState;
        }
      } else {
        eState = EditorState.moveSelectionToEnd(eState);
      }
    }

    if (!this.props.open) {
      this.selectionToReplace = null;
      this.selectionToReplaceRect = null;
    }

    const content = eState.getCurrentContent();
    const entityKey = content
      .getBlockForKey(selection.getFocusKey())
      .getEntityAt(
        selection.getFocusOffset() - this.props.mentionTrigger.length
      );

    if (entityKey) {
      const entity = content.getEntity(entityKey);

      if (!selection.hasFocus) {
        this.closeDropdown();
      } else if (
        getTypeByTrigger(this.props.mentionTrigger) === entity.getType()
      ) {
        if (this.activeEntityKey !== entityKey) {
          this.activeOffsetKey = null;
          this.selectionToReplace = null;
          this.selectionToReplaceRect = null;
          this.activeEntityKey = entityKey;

          this.lastSearchValue = entity.getData().mention.name;

          this.props.onSearchChange({ value: this.lastSearchValue });

          // make sure the escaped search is reseted in the cursor since the user
          // already switched to another mention search
          this.props.store.resetEscapedSearch();

          this.openDropdown();

          // makes sure the focused index is reseted every time a new selection opens
          // or the selection was moved to another mention search
          this.setState({ focusedOptionIndex: 0 });
        }

        return eState;
      }
    }

    if (searches.size === 0) {
      if (this.props.open) {
        this.closeDropdown();
      }

      // if no search portal is active there is no need to show the popover
      return eState;
    }

    const removeList = () => {
      this.props.store.resetEscapedSearch();
      this.closeDropdown();

      if (!selection.getHasFocus()) {
        return EditorState.moveSelectionToEnd(eState);
      }

      return eState;
    };

    // get the current selection
    const anchorKey = selection.getAnchorKey();
    const anchorOffset = selection.getAnchorOffset();

    // the list should not be visible if a range is selected or the editor has no focus
    if (!selection.isCollapsed() || !selection.getHasFocus())
      return removeList();

    // identify the start & end positon of each search-text
    const offsetDetails = searches.map(offsetKey => decodeOffsetKey(offsetKey));

    // a leave can be empty when it is removed due e.g. using backspace
    // do not check leaves, use full decorated portal text
    const leaves = offsetDetails
      .filter(({ blockKey }) => blockKey === anchorKey)
      .map(({ blockKey, decoratorKey }) =>
        eState.getBlockTree(blockKey).getIn([decoratorKey])
      );

    // if all leaves are undefined the popover should be removed
    if (leaves.every(leave => leave === undefined)) {
      return removeList();
    }

    // Checks that the cursor is after the @ character but still somewhere in
    // the word (search term). Setting it to allow the cursor to be left of
    // the @ causes troubles due selection confusion.
    const plainText = eState.getCurrentContent().getPlainText();
    const selectionIsInsideWord = leaves
      .filter(leave => leave !== undefined)
      .map(
        ({ start, end }) =>
          (anchorOffset === start + this.props.mentionTrigger.length &&
            new RegExp(
              String.raw({ raw: `${escapeRegExp(this.props.mentionTrigger)}` }),
              'g'
            ).test(plainText) &&
            anchorOffset <= end) || // @ is the first character
          (anchorOffset > start + this.props.mentionTrigger.length &&
            anchorOffset <= end) // @ is in the text or at the end
      );

    if (selectionIsInsideWord.every(isInside => isInside === false))
      return removeList();

    this.activeEntityKey = null;
    this.selectionToReplace = null;
    this.selectionToReplaceRect = null;

    const lastActiveOffsetKey = this.activeOffsetKey;
    this.activeOffsetKey = selectionIsInsideWord
      .filter(value => value === true)
      .keySeq()
      .first();

    eState = this.onSearchChange(
      eState,
      selection,
      this.activeOffsetKey,
      lastActiveOffsetKey
    );

    // make sure the escaped search is reseted in the cursor since the user
    // already switched to another mention search
    if (!this.props.store.isEscaped(this.activeOffsetKey)) {
      this.props.store.resetEscapedSearch();
    }

    // If none of the above triggered to close the window, it's safe to assume
    // the dropdown should be open. This is useful when a user focuses on another
    // input field and then comes back: the dropdown will show again.
    if (
      !this.props.open &&
      !this.props.store.isEscaped(this.activeOffsetKey) &&
      this.props.suggestions.length > 0
    ) {
      this.openDropdown();
    }

    // makes sure the focused index is reseted every time a new selection opens
    // or the selection was moved to another mention search
    if (
      this.lastSelectionIsInsideWord === undefined ||
      !selectionIsInsideWord.equals(this.lastSelectionIsInsideWord)
    ) {
      this.setState({ focusedOptionIndex: this.props.creatable ? -1 : 0 });
    }

    this.lastSelectionIsInsideWord = selectionIsInsideWord;

    return eState;
  };

  onSearchChange = (
    editorState,
    selection,
    activeOffsetKey,
    lastActiveOffsetKey
  ) => {
    if (this.creatingMention) {
      return editorState;
    }

    const { commit, matchingString: searchValue } = getSearchText(
      editorState,
      selection,
      this.props.mentionTrigger,
      this.props.mentionSuffix,
      activeOffsetKey
    );

    if (
      this.lastSearchValue !== searchValue ||
      activeOffsetKey !== lastActiveOffsetKey
    ) {
      this.lastSearchValue = searchValue;

      this.props.onSearchChange({ value: searchValue });
    }

    if (commit && this.props.suggestions[0].name === searchValue) {
      return this.addMention(editorState, this.props.suggestions[0]);
    }

    return editorState;
  };

  onDownArrow = keyboardEvent => {
    keyboardEvent.preventDefault();
    const newIndex = this.state.focusedOptionIndex + 1;
    const initialIndex = this.props.creatable ? -1 : 0;

    this.onMentionFocus(
      newIndex >= this.props.suggestions.length ? initialIndex : newIndex
    );
  };

  onTab = keyboardEvent => {
    keyboardEvent.preventDefault();
    this.commitSelection();
  };

  onDelete = () => {
    this.closeDropdown();

    return 'handled';
  };

  onUpArrow = keyboardEvent => {
    keyboardEvent.preventDefault();
    if (this.props.suggestions.length > 0) {
      const newIndex = this.state.focusedOptionIndex - 1;
      const initialIndex = this.props.creatable ? -1 : 0;

      this.onMentionFocus(
        newIndex < initialIndex ? this.props.suggestions.length - 1 : newIndex
      );
    }
  };

  onEscape = keyboardEvent => {
    keyboardEvent.preventDefault();

    const activeOffsetKey = this.lastSelectionIsInsideWord
      .filter(value => value === true)
      .keySeq()
      .first();
    this.props.store.escapeSearch(activeOffsetKey);
    this.closeDropdown();

    // to force a re-render of the outer component to change the aria props
    this.props.store.setEditorState(this.props.store.getEditorState());
  };

  addMention = (editorState, mention) => {
    // Note: This can happen in case a user typed @xxx (invalid mention) and
    // then hit Enter. Then the mention will be undefined.
    if (!mention) {
      return editorState;
    }

    if (this.props.onAddMention) {
      this.props.onAddMention(mention);
    }

    this.closeDropdown();

    const selectionToReplace = this.selectionToReplace;

    this.selectionToReplace = null;
    this.selectionToReplaceRect = null;

    return addMention(
      editorState,
      selectionToReplace,
      mention,
      this.props.mentionPrefix,
      this.props.mentionSuffix,
      this.props.mentionTrigger,
      this.props.entityMutability,
      this.activeOffsetKey,
      this.props.spaceAfterNewMention
    );
  };

  onMentionSelect = mention => {
    this.props.store.setEditorState(
      this.addMention(this.props.store.getEditorState(), mention)
    );
  };

  setFocus = index => {
    const descendant = `mention-option-${this.key}-${index}`;

    this.props.ariaProps.ariaActiveDescendantID = descendant;

    this.setState({ focusedOptionIndex: index });
  };

  onMentionFocus = index => {
    this.setFocus(index);

    // to force a re-render of the outer component to change the aria props
    this.props.store.setEditorState(this.props.store.getEditorState());
  };

  onMentionCreated = mention => {
    this.onMentionSelect(mention);
    this.creatingMention = false;
    this.selectionToReplace = null;
    this.selectionToReplaceRect = null;
    this.selectionBeforeCreateMention = null;
    this.closeDropdown();
  };

  onMentionCreationCanceled = () => {
    this.props.store.setEditorState(
      EditorState.forceSelection(
        this.props.store.getEditorState(),
        this.selectionBeforeCreateMention
      )
    );

    this.creatingMention = false;
    this.selectionToReplace = null;
    this.selectionToReplaceRect = null;
    this.selectionBeforeCreateMention = null;
    this.closeDropdown();
  };

  onCreateMention = () => {
    if (this.props.onCreateMention) {
      this.selectionBeforeCreateMention = this.props.store
        .getEditorState()
        .getSelection();

      this.creatingMention = true;

      this.props.onCreateMention(
        this.onMentionCreated,
        this.onMentionCreationCanceled
      );
    }
  };

  commitSelection = () => {
    if (this.creatingMention) {
      return 'handled';
    }

    if (this.state.focusedOptionIndex === -1) {
      this.onCreateMention();

      return 'handled';
    }

    if (
      (!this.selectionToReplace &&
        !this.props.store.getAllMentions().size &&
        !this.props.store.getIsOpenedSearches()) ||
      this.props.suggestions[this.state.focusedOptionIndex].id === 'EMPTY'
    ) {
      return 'not-handled';
    }

    this.onMentionSelect(this.props.suggestions[this.state.focusedOptionIndex]);
    return 'handled';
  };

  openDropdown = () => {
    // This is a really nasty way of attaching & releasing the key related functions.
    // It assumes that the keyFunctions object will not loose its reference and
    // by this we can replace inner parameters spread over different modules.
    // This better be some registering & unregistering logic. PRs are welcome :)
    this.props.callbacks.handleReturn = this.commitSelection;
    this.props.callbacks.keyBindingFn = keyboardEvent => {
      if (this.creatingMention) {
        return null;
      }

      // arrow down
      if (keyboardEvent.keyCode === 40) {
        this.onDownArrow(keyboardEvent);
        return 'handled';
      }
      // arrow up
      if (keyboardEvent.keyCode === 38) {
        this.onUpArrow(keyboardEvent);
        return 'handled';
      }
      // escape
      if (keyboardEvent.keyCode === 27) {
        this.onEscape(keyboardEvent);
        return 'handled';
      }
      // tab
      if (keyboardEvent.keyCode === 9) {
        this.onTab(keyboardEvent);
        return 'handled';
      }

      // delete
      if (keyboardEvent.keyCode === 127 || keyboardEvent.keyCode === 8) {
        return this.onDelete(keyboardEvent);
      }

      return null;
    };

    const descendant = `mention-option-${this.key}-${this.state.focusedOptionIndex}`;
    this.props.ariaProps.ariaActiveDescendantID = descendant;
    this.props.ariaProps.ariaOwneeID = `mentions-list-${this.key}`;
    this.props.ariaProps.ariaHasPopup = 'true';
    this.props.ariaProps.ariaExpanded = true;
    this.props.onOpenChange(true);
  };

  defaultKeyBindingFn = keyboardEvent => {
    // delete
    if (keyboardEvent.keyCode === 127 || keyboardEvent.keyCode === 8) {
      return this.onDelete(keyboardEvent);
    }

    return null;
  };

  closeDropdown = () => {
    if (this.creatingMention) {
      return;
    }

    this.activeEntityKey = null;

    // make sure none of these callbacks are triggered
    this.props.callbacks.handleReturn = undefined;
    this.props.callbacks.keyBindingFn = this.defaultKeyBindingFn;
    this.props.ariaProps.ariaHasPopup = 'false';
    this.props.ariaProps.ariaExpanded = false;
    this.props.ariaProps.ariaActiveDescendantID = undefined;
    this.props.ariaProps.ariaOwneeID = undefined;
    this.props.onOpenChange(false);
  };

  render() {
    if (!this.props.open) {
      return null;
    }

    const {
      entryComponent,
      popoverComponent = <div />,
      onOpenChange, // eslint-disable-line no-unused-vars
      onAddMention, // eslint-disable-line no-unused-vars, no-shadow
      onSearchChange, // eslint-disable-line no-unused-vars, no-shadow
      suggestions, // eslint-disable-line no-unused-vars
      ariaProps, // eslint-disable-line no-unused-vars
      callbacks, // eslint-disable-line no-unused-vars
      theme = {},
      store, // eslint-disable-line no-unused-vars
      entityMutability, // eslint-disable-line no-unused-vars
      positionSuggestions, // eslint-disable-line no-unused-vars
      mentionTrigger, // eslint-disable-line no-unused-vars
      mentionPrefix, // eslint-disable-line no-unused-vars
      suggestionsMap,
      ...elementProps
    } = this.props;

    return React.cloneElement(
      popoverComponent,
      {
        ...elementProps,
        className: theme.mentionSuggestions,
        role: 'listbox',
        id: `mentions-list-${this.key}`,
        ref: element => {
          this.popover = element;
        },
        onHover: () => this.onMentionFocus(-1),
        isFocused: this.state.focusedOptionIndex === -1,
        onCreateMention: this.onCreateMention,
      },
      this.props.suggestions.map((mention, index) => (
        <Entry
          key={mention.id != null ? mention.id : mention.name}
          onMentionSelect={this.onMentionSelect}
          onMentionFocus={this.onMentionFocus}
          isFocused={this.state.focusedOptionIndex === index}
          mention={mention}
          index={index}
          id={`mention-option-${this.key}-${index}`}
          theme={theme}
          searchValue={this.lastSearchValue}
          entryComponent={entryComponent || defaultEntryComponent}
          suggestionsMap={suggestionsMap}
        />
      ))
    );
  }
}

export default MentionSuggestions;
