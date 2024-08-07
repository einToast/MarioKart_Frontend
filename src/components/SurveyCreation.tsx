import {useEffect, useState} from 'react';
import {
    IonButton,
    IonContent, IonIcon,
    IonItem,
    IonModal,
    IonSelect,
    IonSelectOption
} from '@ionic/react';
import axios from "axios";
import "../pages/admin/admin-survey.css";
import "../interface/interfaces"
import {arrowForwardOutline} from "ionicons/icons";

const SurveyCreation = ({ showModal, closeModal, createSurvey }) => {
    const [question, setQuestion] = useState('');
    const [answerType, setAnswerType] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [teams, setTeams] = useState<Team[] | null>(null);
    const [teamName, setTeamName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = () => {
        const survey = {
            question,
            answerType,
            options: answerType === 'Custom Options' ? options : selectedTeam
        };
        createSurvey(survey);
        closeModal();
    };

    const getTeamName = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3000/api/team/all');
            const responseData = response.data as Team[];
            setTeams(responseData);
        } catch (error) {
            console.error(error);
            setError('Fehler beim Laden der Teams');
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTeamName();
    }, []);

    //TODO: publish survey & add to survey Container
    // @ts-ignore
    return (
        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonContent>
                <h4>Neue Abstimmung</h4>
                <form onSubmit={handleSubmit}>

                    <div className="borderContainer">
                        <p>Frage zur Abstimmung</p>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Frage eingeben"
                            required
                        />
                    </div>

                    <div className="borderContainer multipleSelect">
                        <p>Abstimmungsoptionen</p>
                        <IonItem className={"item-background-color"}>
                            <IonSelect value={answerType} onIonChange={(e) => setAnswerType(e.target.value)}>
                                <IonSelectOption value="Freitextfeld">Freitextfeld</IonSelectOption>
                                <IonSelectOption value="Teamauswahl">Teamauswahl</IonSelectOption>
                                <IonSelectOption value="Custom Options">Benutzerdefinierte</IonSelectOption>
                            </IonSelect>
                        </IonItem>
                    </div>
                    {answerType === 'Custom Options' && (
                        <>
                            {options.map((option, index) => (
                                <div key={index} className="form-group">
                                    <label>Option {index + 1}</label>
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1} eingeben`}
                                        required
                                    />
                                </div>
                            ))}
                        </>
                    )}
                    {answerType === 'Teamauswahl' && (
                        <div className="borderContainer multipleSelect">
                            <p>Teams auswählen</p>
                            <IonItem className={"item-background-color"}>
                                <IonSelect multiple value={selectedTeams} onIonChange={(e) => setSelectedTeams(e.detail.value)}>
                                    {teams && teams.map((team) => (
                                        <IonSelectOption key={team.name} value={team.name}>{team.name}</IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>
                        </div>
                    )}
                </form>
                    <div className={"playedContainer"}>

                        <IonButton className={"secondary round"} onClick={closeModal}>
                            <div>
                                <p>Abbrechen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton className={"round"}>
                            <div>
                                <p>Umfrage speichern</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>


                    </div>
            </IonContent>
        </IonModal>
    );
};

export default SurveyCreation;
