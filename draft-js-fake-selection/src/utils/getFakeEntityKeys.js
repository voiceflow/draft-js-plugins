import { FAKE_SELECTION_ENTITY } from '../constants';

const getFakeEntityKeys = editorState => {
  const content = editorState.getCurrentContent();
  const blockMap = content.getBlockMap();

  const entityKeys = new Set();

  blockMap.forEach(block => {
    const characterList = block.getCharacterList();

    characterList.forEach(character => {
      const key = character.getEntity();
      const entity =
        key !== null && key !== undefined && content.getEntity(key);

      if (entity && entity.getType() === FAKE_SELECTION_ENTITY) {
        entityKeys.add(key);
      }
    });
  });

  return [...entityKeys];
};

export default getFakeEntityKeys;
