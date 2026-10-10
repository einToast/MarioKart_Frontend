import React from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { GameReturnDTO, SwitchDTO } from "../../util/api/config/dto";
import { User } from '../../util/api/config/interfaces';
import TeamComponent4 from "./TeamComponent4";

const RoundComponentSwiper: React.FC<{ game: GameReturnDTO, user: User | null, gameSwitch: SwitchDTO }> = ({ game, user, gameSwitch }) => {
    if (!game?.teams) return null;

    return (
        <div className="roundContainer">
            <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={50}
                slidesPerView={1}
            >
                {

                    game.teams.map((team) => {
                        return (
                            <SwiperSlide key={team.id} className={game.teams.some(t => t.id === user?.teamId) ? 'loggedIn' : ''}
                                style={{ opacity: team.active ? 1 : 0.5 }}>
                                <TeamComponent4 game={game} team={team} gameSwitch={gameSwitch} />
                            </SwiperSlide>
                        )
                    })}
            </Swiper>
        </div>
    );
};

export default RoundComponentSwiper;
