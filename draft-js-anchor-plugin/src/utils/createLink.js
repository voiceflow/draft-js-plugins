import React from 'react';

const createLink = Component => ({ children, entityKey, contentState }) => {
  const entity = contentState.getEntity(entityKey);

  const entityData = entity && entity.get('data');
  const href = entityData && entityData.url;

  return href ? <Component href={href}>{children}</Component> : children;
};

export default createLink;
