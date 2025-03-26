import React from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { TeamReturnDTO } from "../../util/api/config/dto";
import { User } from '../../util/api/config/interfaces';
import PauseComponent from './PauseComponent';

const PauseComponentSwiper: React.FC<{ teams: TeamReturnDTO[], user: User | null }> = ({ teams, user }) => {

    const teamsWithOwnTeamFirst = teams.map(team => {
        const hasLoggedInCharacter = team.id === user?.teamId;
        return {
            ...team,
            isLoggedIn: hasLoggedInCharacter
        };
    }).sort((a, b) => {
        if (a.isLoggedIn && !b.isLoggedIn) return -1;
        if (!a.isLoggedIn && b.isLoggedIn) return 1;
        return 0;
    }
    );
    return (
        <div className="roundContainer">
            <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={50}
                slidesPerView={1}
            >
                {
                    teamsWithOwnTeamFirst.map((team, index) => {
                        return (
                            <SwiperSlide key={index} className={`${teams.some(t => t.id === user?.teamId) ? 'loggedIn' : ''}`}
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
