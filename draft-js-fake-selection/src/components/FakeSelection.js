import React from 'react';

export default function FakeSelection({ entityKey, children, contentState }) {
  const data = contentState.getEntity(entityKey).getData();

  return data && data.selected ? (
    <span
      className="fake-selection"
      style={{ backgroundColor: 'rgba(168, 200, 252, 0.85)' }}
    >
      {children}
    </span>
  ) : (
    children
  );
}
