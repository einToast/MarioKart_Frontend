import React from 'react';
import SkeletonTeamComponent from './SkeletonTeamComponent';

interface SkeletonRoundComponentAllProps {
  rows?: number;
  isSwiper?: boolean;
}

const SkeletonRoundComponentAll: React.FC<SkeletonRoundComponentAllProps> = ({ rows = 4, isSwiper = false }) => {
  return (
    <div className="roundContainer">
      {Array.from({ length: rows }).map((_, idx) => (
        <SkeletonTeamComponent
          key={idx}
          isSwiper={isSwiper}
          userTeam={idx === 0}
          switchColor={'weiß'}
        />
      ))}
    </div>
  );
};

export default SkeletonRoundComponentAll;
