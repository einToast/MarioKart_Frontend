import React from "react";

import {
  BreakReturnDTO,
  GameReturnDTO,
  QuestionReturnDTO,
  RoundReturnDTO,
  TeamReturnDTO,
} from "./dto";

export interface User {
  character: string | null;
  teamId: number;
  name: string | null;
}

export interface LoginProps {
  setUser: (user: User) => void;
}

export interface ShowTab2Props {
  showTab2: boolean;
  setShowTab2: (show: boolean) => void;
}

export interface AdminUser {
  loggedIn: boolean;
  username: string;
  token: string;
}

export interface SurveyModalResult {
  surveyResults?: boolean;
  surveyCreated?: boolean;
  surveyChanged?: boolean;
  surveyDeleted?: boolean;
}

export interface TeamModalResult {
  teamChanged?: boolean;
  teamDeleted?: boolean;
}

export interface BreakModalResult {
  breakChanged?: boolean;
}

export interface NotificationModalResult {
  notificationSent?: boolean;
}

export interface RoundHeaderProps {
  title: string;
  onOptionChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedOption: string;
}

export interface UseRoundDataReturn {
  currentRound: RoundReturnDTO | BreakReturnDTO | null;
  nextRound: RoundReturnDTO | BreakReturnDTO | null;
  teamsNotInCurrentRound: TeamReturnDTO[];
  teamsNotInNextRound: TeamReturnDTO[];
  error: string;
  refreshRounds: () => Promise<void>;
}

export interface GameListProps {
  games: GameReturnDTO[];
  user: User | null;
  viewType: "all" | "personal";
  teamsNotInRound: TeamReturnDTO[];
}

export interface RoundDisplayProps {
  round: RoundReturnDTO | BreakReturnDTO | null;
  title: string;
  user: User | null;
  viewType: "all" | "personal";
  noGames?: boolean;
  teamsNotInRound: TeamReturnDTO[];
}

export interface SurveyAdminListItemProps {
  survey: QuestionReturnDTO;
  onToggleVisibility: (id: number) => void;
  onToggleActive: (id: number) => void;
  onOpenAnswerModal: (survey: QuestionReturnDTO) => void;
  onOpenStatisticsModal: (survey: QuestionReturnDTO) => void;
  onOpenChangeModal: (survey: QuestionReturnDTO) => void;
  onOpenDeleteModal: (survey: QuestionReturnDTO) => void;
}

export interface TeamAdminListItemProps {
  team: TeamReturnDTO;
  matchPlanCreated: boolean;
  finalPlanCreated: boolean;
  onToggleFinalParticipation: (team: TeamReturnDTO) => void;
  onToggleActive: (team: TeamReturnDTO) => void;
  onOpenChangeModal: (team: TeamReturnDTO) => void;
  onOpenDeleteModal: (team: TeamReturnDTO) => void;
}

export interface SurveyAdminContainerProps {
  surveys: QuestionReturnDTO[];
  getQuestions: () => void;
  handleModalClose: (result: SurveyModalResult) => void;
}

export interface TeamAdminContainerProps {
  teams: TeamReturnDTO[];
  matchPlanCreated: boolean;
  finalPlanCreated: boolean;
  setModalClosed: (modalClosed: boolean) => void;
  getTeams: () => void;
  modalClosed: boolean;
}

export interface TeamGraphProps {
  teams: TeamReturnDTO[];
}

export interface QuestionGraphProps {
  question: QuestionReturnDTO;
  answers: number[];
}
export interface ToastProps {
  message: string;
  showToast: boolean;
  setShowToast: (show: boolean) => void;
  isError?: boolean;
}
