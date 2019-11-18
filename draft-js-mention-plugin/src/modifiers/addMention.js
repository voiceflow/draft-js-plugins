import { Modifier, EditorState } from 'draft-js';
import getSearchText from '../utils/getSearchText';
import getTypeByTrigger from '../utils/getTypeByTrigger';

const addMention = (
  editorState,
  selectionToReplace,
  mention,
  mentionPrefix,
  mentionSuffix,
  mentionTrigger,
  entityMutability,
  activeOffsetKey,
  spaceAfterNewMention
) => {
  const contentStateWithEntity = editorState
    .getCurrentContent()
    .createEntity(getTypeByTrigger(mentionTrigger), entityMutability, {
      mention,
    });
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

  let mentionReplacedContent;

  if (selectionToReplace) {
    mentionReplacedContent = Modifier.replaceText(
      editorState.getCurrentContent(),
      selectionToReplace,
      `${mentionPrefix}${mention.name}${mentionSuffix}`,
      null, // no inline style needed
      entityKey
    );
  } else {
    const currentSelectionState = editorState.getSelection();
    const { begin, end } = getSearchText(
      editorState,
      currentSelectionState,
      mentionTrigger,
      mentionSuffix,
      activeOffsetKey
    );

    // get selection of the @mention search text
    const mentionTextSelection = currentSelectionState.merge({
      anchorOffset: begin,
      focusOffset: end,
    });

    mentionReplacedContent = Modifier.replaceText(
      editorState.getCurrentContent(),
      mentionTextSelection,
      `${mentionPrefix}${mention.name}${mentionSuffix}`,
      null, // no inline style needed
      entityKey
    );

    // If the mention is inserted at the end, a space is appended right after for
    // a smooth writing experience.
    if (spaceAfterNewMention) {
      const blockKey = mentionTextSelection.getAnchorKey();
      const blockSize = editorState
        .getCurrentContent()
        .getBlockForKey(blockKey)
        .getLength();

      if (blockSize === end) {
        mentionReplacedContent = Modifier.insertText(
          mentionReplacedContent,
          mentionReplacedContent.getSelectionAfter(),
          ' '
        );
      }
    }
  }

  const newEditorState = EditorState.push(
    editorState,
    mentionReplacedContent,
    'insert-mention'
  );
  return EditorState.forceSelection(
    newEditorState,
    mentionReplacedContent.getSelectionAfter()
  );
};

export default addMention;
