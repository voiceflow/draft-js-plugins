/* @flow */

import escapeRegExp from 'lodash/escapeRegExp';

const findWithRegex = (trigger, regex, contentBlock, callback) => {
  const contentBlockText = contentBlock.getText();

  // exclude entities, when matching
  contentBlock.findEntityRanges(
    character => !character.getEntity(),
    (nonEntityStart, nonEntityEnd) => {
      const text = contentBlockText.slice(nonEntityStart, nonEntityEnd);
      let matchArr;
      let start;
      let prevLastIndex = regex.lastIndex;

      // Go through all matches in the text and return the indices to the callback
      // Break the loop if lastIndex is not changed
      while ((matchArr = regex.exec(text)) !== null) {
        // eslint-disable-line
        if (regex.lastIndex === prevLastIndex) {
          break;
        }

        prevLastIndex = regex.lastIndex;
        start = nonEntityStart + matchArr.index;

        callback(start, start + matchArr[0].length);
      }
    }
  );
};

export default (
  trigger: string,
  supportWhiteSpace: boolean,
  regExp: string,
  mentionSuffix?: string
) => {
  const suffixRegexp = mentionSuffix ? `${escapeRegExp(mentionSuffix)}?` : '';

  //eslint-disable-line
  const MENTION_REGEX = supportWhiteSpace
    ? new RegExp(
        `${escapeRegExp(trigger)}(${regExp}|\\s){0,}${suffixRegexp}`,
        'g'
      )
    : new RegExp(`${escapeRegExp(trigger)}${regExp}${suffixRegexp}`, 'g');

  return (contentBlock: Object, callback: Function) => {
    findWithRegex(trigger, MENTION_REGEX, contentBlock, callback);
  };
};
