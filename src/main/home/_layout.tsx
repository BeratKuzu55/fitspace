import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Header from '../header';
import AiAnalyse from './aiAnalyse';
import Articles from './article';
import AllArticles from './article/allArticles';
import Details from './article/details';
import SingleArticle from './article/singleArticle';
import ChallengesFront from './challenge/challenge';
import ExerciseLibrary from './exercise';
import FriendDetail from './friendship/friendDetail';
import FriendshipFront from './friendship/friendship';
import HomeFront from './index';
import NotificationsFront from './notifications';
import ProgramFront from './program/programFront';
import ProgramSelect from './program/programSelect';
import QuickStart from './quickStart';
import StatisticsFront from './statistics/statistics';

const Stack = createNativeStackNavigator();
const renderCustomHeader = () => <Header />;

type HomeLayoutProps = Record<string, never>;

const HomeLayout: React.FC<HomeLayoutProps> = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        header: renderCustomHeader,
      }}
    >
      <Stack.Screen name="HomeFront" component={HomeFront} />
      <Stack.Screen name="Details" component={Details} />
      <Stack.Screen name="AllArticlesFront" component={AllArticles} />
      <Stack.Screen name="Articles" component={Articles} />
      <Stack.Screen name="SingleArticle" component={SingleArticle} />
      <Stack.Screen name="QuickStart" component={QuickStart} />
      <Stack.Screen name="ProgramFront" component={ProgramFront} />
      <Stack.Screen name="ProgramSelect" component={ProgramSelect} />
      <Stack.Screen name="FriendshipFront" component={FriendshipFront} />
      <Stack.Screen name="FriendDetail" component={FriendDetail} />
      <Stack.Screen name="StatisticsFront" component={StatisticsFront} />
      <Stack.Screen name="NotificationsFront" component={NotificationsFront} />
      <Stack.Screen name="ChallengesFront" component={ChallengesFront} />
      <Stack.Screen name="ExerciseLibraryFront" component={ExerciseLibrary} />
      <Stack.Screen name="AiAnalyseFront" component={AiAnalyse} />
    </Stack.Navigator>
  );
};

export default HomeLayout;
