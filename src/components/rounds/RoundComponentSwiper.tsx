import React from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { GameReturnDTO } from "../../util/api/config/dto";
import { User } from '../../util/api/config/interfaces';
import TeamComponent4 from "./TeamComponent4";

const RoundComponentSwiper: React.FC<{ game: GameReturnDTO, user: User | null, switchColor: string }> = ({ game, user, switchColor }) => {
    if (!game || !game.teams) return null;

    const teamsWithOwnTeamFirst = game.teams.map(team => {
        const hasLoggedInCharacter = team.id === user?.teamId || false;
        return {
            ...team,
            isLoggedIn: hasLoggedInCharacter
        };
    }).sort((a, b) => {
        if (a.isLoggedIn && !b.isLoggedIn) return -1;
        if (!a.isLoggedIn && b.isLoggedIn) return 1;
        return 0;
    });

    return (
        <div className="roundContainer">
            <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={50}
                slidesPerView={1}
            >
                {

                    game.teams.map((team, index) => {
                        return (
                            <SwiperSlide key={index} className={game.teams.some(t => t.id === user?.teamId) ? 'loggedIn' : ''}
                                style={{ opacity: team.active ? 1 : 0.5 }}>
                                <TeamComponent4 game={game} team={team} switchColor={switchColor} key={index} />
                            </SwiperSlide>
                        )
                    })}
            </Swiper>
        </div>
    );
};

export default RoundComponentSwiper;
