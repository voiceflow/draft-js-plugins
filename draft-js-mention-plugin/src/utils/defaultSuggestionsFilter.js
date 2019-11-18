// Get the first 5 suggestions that match

const defaultSuggestionsFilter = (
  searchValue,
  suggestions,
  { size = 5, showNotMatched = true } = {}
) => {
  const value = searchValue.toLowerCase();

  let filteredSuggestions = suggestions.filter(
    suggestion => !value || suggestion.name.toLowerCase().includes(value)
  );

  const found = !!filteredSuggestions.length;

  if (filteredSuggestions.length > size) {
    filteredSuggestions = filteredSuggestions.slice(0, size);
  } else if (
    showNotMatched &&
    filteredSuggestions.length < size &&
    suggestions.length > size
  ) {
    suggestions.find(suggestion => {
      if (!filteredSuggestions.find(({ name }) => suggestion.name === name)) {
        filteredSuggestions = [...filteredSuggestions, suggestion];

        return filteredSuggestions.length === 5;
      }

      return false;
    });
  }

  return { found, suggestions: filteredSuggestions };
};

export default defaultSuggestionsFilter;
