/**
 * Configurația rutelor aplicației „NorvegiaTa”.
 *
 * Fiecare rută definește:
 *   - path      → adresa URL din browser
 *   - exact     → potrivire strictă (doar pentru rute fără sub-pagini)
 *   - component → componenta React afișată la acea adresă
 *
 * Rutele sunt grupate pe secțiuni pentru ușurința în mentenanță.
 */

import React from 'react';
import { Redirect } from 'react-router-dom';
import HomePage from '../modules/layout/Home/HomePage';
import DiscoverCards from '../modules/discover/DiscoverCards';
import NorthernLights from '../modules/discover/NorthernLights';
import Fjords from '../modules/discover/Fjords';
import RightToNature from '../modules/discover/RightToNature';
import Traditions from '../modules/discover/Traditions';
import Pronunciation from '../modules/pronunciation/Pronunciation';
import PracticeGame from '../modules/exercises/PracticeGame';
import Challenge30 from '../modules/exercises/challenge30/Challenge30';
import LessonProgram from '../modules/lessons/norwegian-program/LessonProgram';
import JobsCards from '../modules/jobs/JobsCards';
import Documents from '../modules/jobs/Documents';
import WhatYouNeedToKnow from '../modules/jobs/WhatYouNeedToKnow';
import NorwegianSystem from '../modules/jobs/NorwegianSystem';
import HowToGetHired from '../modules/jobs/HowToGetHired';
import WeatherPage from '../modules/weather/WeatherPage';
import News from '../modules/news/News';
import LearningHub from '../modules/lessons/LearningHub';
import NorwayLifeHub from '../modules/discover/NorwayLifeHub';
import NotFound from '../modules/layout/NotFound';
import ReviewPage from '../modules/lessons/ReviewPage';
import GuideArticle from '../modules/discover/GuideArticle';

const LearningRedirect = () => <Redirect to="/invata#practica" />;
const QuizPractice = () => <PracticeGame game="quiz" />;
const OrderPractice = () => <PracticeGame game="order" />;
const WordPractice = () => <PracticeGame game="word" />;

/** Rutele aplicației, ordonate după secțiune */
const routes = [
  // ── Pagina principală ──────────────────────────────────────────────
  {
    path: '/',
    exact: true,
    component: HomePage,
  },

  // ── Descoperă Norvegia ─────────────────────────────────────────────
  {
    path: '/descopera',
    exact: true,
    component: DiscoverCards,
  },
  {
    path: '/viata-in-norvegia/ghid/:slug',
    component: GuideArticle,
  },
  {
    path: '/descopera/ghid/:slug',
    component: GuideArticle,
  },
  {
    path: '/descopera/aurore-boreale',
    component: NorthernLights,
  },
  {
    path: '/descopera/fiorduri',
    component: Fjords,
  },
  {
    path: '/descopera/dreptul-la-natura',
    component: RightToNature,
  },
  {
    path: '/descopera/traditii',
    component: Traditions,
  },

  // ── Învață limba (exerciții și lecții) ─────────────────────────────
  {
    path: '/invata',
    exact: true,
    component: LearningHub,
  },
  {
    path: '/exerseaza',
    exact: true,
    component: LearningRedirect,
  },
  // Adresă veche păstrată pentru compatibilitate
  {
    path: '/invata-limba',
    exact: true,
    component: LearningHub,
  },
  {
    path: '/pronuntie',
    component: Pronunciation,
  },
  {
    path: '/hangman',
    component: WordPractice,
  },
  {
    path: '/chestionar',
    component: QuizPractice,
  },
  {
    path: '/drag',
    component: OrderPractice,
  },
  {
    path: '/challenge30',
    component: Challenge30,
  },
  {
    path: '/recapitulare',
    exact: true,
    component: ReviewPage,
  },
  {
    path: '/curs/a1/:lessonId',
    component: LessonProgram,
  },
  {
    path: '/program-norvegiana',
    component: LessonProgram,
  },

  // ── Utile (joburi și viața în Norvegia) ────────────────────────────
  {
    path: '/joburi',
    exact: true,
    component: JobsCards,
  },
  {
    path: '/joburi/acte',
    component: Documents,
  },
  {
    path: '/joburi/cum-te-angajezi',
    component: HowToGetHired,
  },
  {
    path: '/joburi/ce-trebuie-sa-stii',
    component: WhatYouNeedToKnow,
  },
  {
    path: '/joburi/sistemul-norvegian',
    component: NorwegianSystem,
  },

  // ── Informații utile (vreme și știri) ──────────────────────────────
  {
    path: '/weather',
    component: WeatherPage,
  },
  // Redirect vechi pentru compatibilitate (typo „wheather”)
  {
    path: '/wheather',
    component: WeatherPage,
  },
  {
    path: '/news',
    component: News,
  },
  {
    path: '/viata-in-norvegia',
    exact: true,
    component: NorwayLifeHub,
  },
  {
    path: '*',
    component: NotFound,
  },
];

export default routes;
