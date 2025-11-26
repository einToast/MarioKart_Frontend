import { IonSkeletonText } from "@ionic/react";

interface SkeletonTeamStatisticProps {
    rows?: number;
}

const SkeletonTeamStatistic: React.FC<SkeletonTeamStatisticProps> = ({ rows = 25 }) => {

    const switchColor = "weiß"
    const classColor = switchColor.toLowerCase()
    return (
        <div className="roundContainer">
            {Array.from({ length: rows }).map((_, idx) => (
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
