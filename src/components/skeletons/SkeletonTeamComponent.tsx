import { IonSkeletonText } from '@ionic/react';
import React from 'react';
import { SkeletonTeamComponentProps } from '../../util/api/config/interfaces';
import { switchColorStyle } from '../../util/layout/switches';

const NEUTRAL_COLOR = '#ECECEC';

const SkeletonTeamComponent: React.FC<SkeletonTeamComponentProps> = ({
  isSwiper = false,
  switchColor = NEUTRAL_COLOR,
}) => {

  if (isSwiper) {
    return (
      <div className={`swiper-slide `} style={{ marginBottom: 15 }}>
        <div className="switchColored" style={{ ...switchColorStyle(switchColor), display: 'flex', alignItems: 'center', width: '100%', }}>
          <div className="imageContainer switchColored">
            <IonSkeletonText
              animated
              style={{ width: 70, height: 70, borderRadius: "50%", position: 'absolute', left: 40, top: 10 }}
            />
          </div>
          <div>
            <p>
              <IonSkeletonText animated style={{ width: 180, height: 20, borderRadius: 6 }} />
            </p>
            <p>
              <IonSkeletonText animated style={{ width: 120, height: 14, borderRadius: 6 }} />
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teamContainer slide">
      <div className="switchColored" style={switchColorStyle(switchColor)}>
        <div className={`skeletonContainer `}>
          <IonSkeletonText animated style={{ width: 55, height: 55, borderRadius: '50%' }} />
        </div>
        <div>
          <p>
            <IonSkeletonText animated style={{ width: 210, height: 18, borderRadius: 6 }} />
          </p>
          <p>
            <IonSkeletonText animated style={{ width: 110, height: 14, borderRadius: 6 }} />
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkeletonTeamComponent;

