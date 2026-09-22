export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  MainTabs: undefined;
  AddHabit: undefined;
  HabitDetail: { habitId: number };
  EditHabit: { habitId: number };
};

export type MainTabParamList = {
  Home: undefined;
  Progress: undefined;
  Settings: undefined;
};
