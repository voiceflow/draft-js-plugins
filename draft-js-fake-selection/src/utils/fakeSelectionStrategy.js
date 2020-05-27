import { FAKE_SELECTION_ENTITY } from '../constants';

const fakeSelectionStrategy = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();

    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === FAKE_SELECTION_ENTITY
    );
  }, callback);
};

export default fakeSelectionStrategy;
