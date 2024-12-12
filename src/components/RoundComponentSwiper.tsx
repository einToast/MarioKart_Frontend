import TeamComponent4 from "./Team4";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import {GameReturnDTO} from "../util/api/config/dto";

const RoundComponentSwiper: React.FC<{game:GameReturnDTO, user:any, switchColor:string}> = ({ game, user, switchColor }) => {
    if (!game || !game.teams) return null;

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
                        <SwiperSlide key={index} className={game.teams.some(t =>t.character.characterName === user.character) ? 'loggedIn' : ''}>
                            <TeamComponent4 game={game} team={team} switchColor={switchColor}/>
                        </SwiperSlide>
                        )
                    })}
            </Swiper>
        </div>
    );
};

export default RoundComponentSwiper;
