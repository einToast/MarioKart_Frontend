import React from "react";

import {
  BreakReturnDTO,
  GameReturnDTO,
  QuestionReturnDTO,
  RoundReturnDTO,
  SwitchDTO,
  TeamReturnDTO,
} from "./dto";
import { Message, StompSubscription } from "@stomp/stompjs";
import { FloorPlanElementType } from "../../layout/floorPlan";
import { ProgramIcon } from "../../layout/program";

export type RoundOrBreak = RoundReturnDTO | BreakReturnDTO | null;

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

export interface OcrConfigModalResult {
  ocrConfigChanged?: boolean;
}

export interface RoundHeaderProps {
  title: string;
  onOptionChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedOption: string;
  loading: boolean;
}

export interface UseRoundDataReturn {
  currentRound: RoundOrBreak;
  nextRound: RoundOrBreak;
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
  switches?: SwitchDTO[];
}

export interface RoundDisplayProps {
  round: RoundOrBreak;
  title: string;
  user: User | null;
  viewType: "all" | "personal";
  noGames?: boolean;
  teamsNotInRound: TeamReturnDTO[];
  loading?: boolean;
  switches?: SwitchDTO[];
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
  scheduleCreated: boolean;
  finalScheduleCreated: boolean;
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
  scheduleCreated: boolean;
  finalScheduleCreated: boolean;
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

export interface SkeletonRoundComponentAllProps {
  rows?: number;
  isSwiper?: boolean;
}

export interface SkeletonTeamComponentProps {
  isSwiper?: boolean;
  userTeam?: boolean;
  switchColor?: string;
}

export interface SkeletonTeamStatisticProps {
  rows?: number;
}

export interface ProgramRow {
  key: number;
  entry: ProgramEntry;
}

export interface View {
  scale: number;
  // Offset of the photo inside of its frame
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Drag {
  id: string;
  // Distance between the pointer and the centre of the element when the drag started
  offsetX: number;
  offsetY: number;
}

export interface FloorPlanViewProps {
  plan: FloorPlan;
  switches: SwitchDTO[];
  // The following props turn the plan into the canvas of the editor
  selectedId?: string | null;
  svgRef?: React.Ref<SVGSVGElement>;
  onElementPointerDown?: (event: React.PointerEvent<SVGGElement>, element: FloorPlanElement) => void;
  onElementKeyDown?: (event: React.KeyboardEvent<SVGGElement>, element: FloorPlanElement) => void;
  onElementFocus?: (element: FloorPlanElement) => void;
  onPointerMove?: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp?: (event: React.PointerEvent<SVGSVGElement>) => void;
}

export interface WebSocketProviderProps {
  children: React.ReactNode;
}

export interface FloorPlanElement {
  id: string;
  type: FloorPlanElementType;
  // Centre of the element in plan units
  x: number;
  y: number;
  width: number;
  height: number;
  // Degrees, clockwise
  rotation: number;
  switchIndex?: number;
  text?: string;
}

export interface FloorPlanPoint {
  x: number;
  y: number;
}

export interface FloorPlan {
  version: number;
  elements: FloorPlanElement[];
  // Corners of the room; a plan without an outline is framed by the whole canvas
  outline?: FloorPlanPoint[];
}

export type ElementOverrides = Partial<Omit<FloorPlanElement, 'id' | 'type'>>;

export interface Station {
  // Position of the switch marker; its rotation tilts the name the same way as the screen
  marker: ElementOverrides;
  furniture: { type: FloorPlanElementType; overrides: ElementOverrides }[];
}

export interface ProgramEntry {
  icon: ProgramIcon;
  time: string;
  text: string;
}

export interface GamePhoto {
  file: File;
  // Object URL to show the photo without uploading it
  url: string;
}

export interface TopicListener {
  topic: string;
  callback: (message: Message) => void;
  subscription?: StompSubscription;
}
