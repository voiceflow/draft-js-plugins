const fakeSelectionStrategy = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    const entity =
      (entityKey !== null && contentState.getEntity(entityKey).getData()) || {};

    return entity.fakeSelectionApplied;
  }, callback);
};

export default fakeSelectionStrategy;
