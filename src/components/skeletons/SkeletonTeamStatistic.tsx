import { IonSkeletonText } from "@ionic/react";
import { SkeletonTeamStatisticProps } from "../../util/api/config/interfaces";

const SkeletonTeamStatistic: React.FC<SkeletonTeamStatisticProps> = ({ rows = 4}) => {
    return (
        <div className="roundContainer">
            {Array.from({ length: rows }, (_, idx) => `skeleton-${idx}`).map((rowKey) => (
                <div className="teamContainer slide" key={rowKey}>
                    <div>
                        <div className={`skeletonContainer `}>
                            <IonSkeletonText animated style={{ width: 55, height: 55, borderRadius: '50%' }} />
                        </div>
                        <div>
                            <p>
                                <IonSkeletonText animated style={{ width: 210, height: 18, borderRadius: 6 }} />
                            </p>
                            <p>
                                <IonSkeletonText animated style={{ width: 110, height: 14, borderRadius: 6 }} />
                                <IonSkeletonText animated style={{ width: 110, height: 14, borderRadius: 6 }} />
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}


export default SkeletonTeamStatistic;
