import React from 'react';

function LockedBadge({ id, labels, className, style }) {
  return (
    <div
      id={id}
      className={`mt-md round-card bg-cp-2-light-c mb-0 ${className}`}
      style={style}
    >
      {labels.map((label, idx) => {
        return <div key={`LockedBadge${id}${idx}`}>{label}</div>;
      })}
    </div>
  );
}

export default LockedBadge;
