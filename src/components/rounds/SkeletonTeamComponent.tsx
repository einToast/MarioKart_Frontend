import React from 'react';
import { IonSkeletonText } from '@ionic/react';

interface SkeletonTeamComponentProps {
  isSwiper?: boolean;
  userTeam?: boolean;
  switchColor?: string; // e.g., "weiß", "grün", etc.
}

const SkeletonTeamComponent: React.FC<SkeletonTeamComponentProps> = ({
  isSwiper = false,
  userTeam = false,
  switchColor = 'weiß',
}) => {
  const classColor = switchColor.toLowerCase();

  isSwiper = false

  if (isSwiper) {
    return (
      <div className={`swiper-slide ${userTeam ? 'loggedIn' : ''}`}>
        <div className={classColor} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div className={`imageContainer ${classColor}`}>
            <IonSkeletonText
              animated
              style={{ width: 70, height: 70, borderRadius: '50%', position: 'absolute', left: 45, top: 20 }}
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
    <div className={`teamContainer ${switchColor} slide`}>
      <div className={classColor}>
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

