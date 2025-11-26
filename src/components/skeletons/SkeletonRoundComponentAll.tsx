import React from 'react';
import { SkeletonRoundComponentAllProps } from '../../util/api/config/interfaces';
import SkeletonTeamComponent from './SkeletonTeamComponent';

const SkeletonRoundComponentAll: React.FC<SkeletonRoundComponentAllProps> = ({ rows = 4, isSwiper = false }) => {
  return (
    <div className="roundContainer">
      {Array.from({ length: rows }).map((_, idx) => (
        <SkeletonTeamComponent
          key={idx}
          isSwiper={isSwiper}
          switchColor={'weiß'}
        />
      ))}
    </div>
  );
};

export default SkeletonRoundComponentAll;
