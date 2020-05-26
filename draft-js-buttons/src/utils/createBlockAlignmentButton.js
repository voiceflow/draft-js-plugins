import React from 'react';

export default options => ({ alignment, children, setAlignment }) => {
  const onClick = React.useCallback(e => {
    e.preventDefault();

    setAlignment(options.alignment);
  }, []);

  const onMouseDown = React.useCallback(e => {
    e.preventDefault();
  }, []);

  const isActive = options.alignment === alignment;

  return children({ onClick, isActive, onMouseDown });
};
