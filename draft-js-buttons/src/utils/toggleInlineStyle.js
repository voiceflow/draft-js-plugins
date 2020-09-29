import { RichUtils, SelectionState, EditorState } from 'draft-js';

export default (editorState, style) => {
  let state = editorState;
  let selection = state.getSelection();

  if (!selection.isCollapsed()) {
    return RichUtils.toggleInlineStyle(state, style);
  }

  const currentContent = state.getCurrentContent();
  const blockMap = currentContent.getBlockMap();
  const lastBlock = blockMap.last();
  const firstBlock = blockMap.first();
  const lastBlockKey = lastBlock.getKey();
  const firstBlockKey = firstBlock.getKey();
  const lengthOfLastBlock = lastBlock.getLength();
  const prevSelection = selection;

  selection = new SelectionState({
    focusKey: lastBlockKey,
    anchorKey: firstBlockKey,
    focusOffset: lengthOfLastBlock,
    anchorOffset: 0,
  });

  state = EditorState.acceptSelection(state, selection);
  state = RichUtils.toggleInlineStyle(state, style);
  state = EditorState.acceptSelection(state, prevSelection);

  return state;
};
