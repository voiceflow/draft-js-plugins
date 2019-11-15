import decodeOffsetKey from '../utils/decodeOffsetKey';

/**
 * Return tail end of the string matching trigger upto the position.
 */
export default (
  currentBlock,
  blockText,
  trigger,
  suffix,
  anchorOffset,
  editorState,
  activeOffsetKey
) => {
  const selection = editorState.getSelection();
  const content = editorState.getCurrentContent();
  const entityKey = content
    .getBlockForKey(selection.getFocusKey())
    .getEntityAt(selection.getFocusOffset() - trigger.length);

  if (entityKey) {
    const entity = content.getEntity(entityKey);
    let entityPosition;

    currentBlock.findEntityRanges(
      character => {
        if (
          character.getEntity() !== null &&
          content.getEntity(character.getEntity()) === entity
        ) {
          return true;
        }
        return false;
      },
      (start, end) => {
        entityPosition = { start, end };
      }
    );

    return {
      end: entityPosition.end,
      begin: entityPosition.start,
      commit: false,
      matchingString: entity.getData().mention.name,
    };
  }

  const { blockKey, decoratorKey } = decodeOffsetKey(activeOffsetKey);
  const { start, end } = editorState
    .getBlockTree(blockKey)
    .getIn([decoratorKey]);

  const str = blockText.substr(0, end);
  const begin = trigger.length === 0 ? 0 : start;

  const matchingString =
    trigger.length === 0 ? str : str.slice(begin + trigger.length);

  return {
    end: str.length,
    begin,
    commit: blockText.charAt(anchorOffset - 1) === suffix,
    matchingString: matchingString.replace(trigger, '').replace(suffix, ''),
  };
};
