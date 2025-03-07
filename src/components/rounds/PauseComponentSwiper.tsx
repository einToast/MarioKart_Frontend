import React from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { TeamReturnDTO } from "../../util/api/config/dto";
import { User } from '../../util/api/config/interfaces';
import PauseComponent from './PauseComponent';

const PauseComponentSwiper: React.FC<{ teams: TeamReturnDTO[], user: User | null }> = ({ teams, user }) => {

    return (
        <div className="roundContainer">
            <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={50}
                slidesPerView={1}
            >
                {

                    teams.map((team, index) => {
                        return (
                            <SwiperSlide key={index} className={`${teams.some(t => t.character?.characterName === user?.character) ? 'loggedIn' : ''}`}
                                style={{ opacity: team.active ? 1 : 0.5 }}>
                                <PauseComponent team={team} key={index} />
                            </SwiperSlide>
                        )
                    })}
            </Swiper>
        </div>
    );
};

export default PauseComponentSwiper;
