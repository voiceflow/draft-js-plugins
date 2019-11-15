import getSearchTextAt from './getSearchTextAt';

export default (editorState, selection, trigger, suffix, activeOffsetKey) => {
  const anchorKey = selection.getAnchorKey();
  const anchorOffset = selection.getAnchorOffset();
  const currentContent = editorState.getCurrentContent();
  const currentBlock = currentContent.getBlockForKey(anchorKey);
  const blockText = currentBlock.getText();

  return getSearchTextAt(
    currentBlock,
    blockText,
    trigger,
    suffix,
    anchorOffset,
    editorState,
    activeOffsetKey
  );
};
