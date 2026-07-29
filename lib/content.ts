/**
 * Единственный источник правды по контенту сайта.
 * Меняйте текст, цены и расписание здесь — вся вёрстка подхватит автоматически.
 */

export const site = {
  name: 'Баня «У Михалыча»',
  shortName: 'У Михалыча',
  legalName: 'Общественная баня «У Михалыча»',
  tagline: 'общественная баня',
  url: 'https://banya-mihalycha.ru',
  locale: 'ru_RU',
  timeZone: 'Europe/Moscow',
} as const;

export const contacts = {
  phone: '+7 (915) 384-02-08',
  phoneHref: 'tel:+79153840208',
  phoneRaw: '+79153840208',
  manager: 'Николай, управляющий',
  managerName: 'Николай',
  city: 'Павловский Посад',
  street: 'Корнево-Юдинский переулок, 10',
  addressFull: 'Павловский Посад, Корнево-Юдинский переулок, 10',
  region: 'Московская область',
  postalCode: '142500',
  coords: { lat: 55.775307, lon: 38.698209 },
  vk: 'https://vk.ru/baniapposad',
} as const;

/** Маршрут в Яндекс.Картах от текущего местоположения пользователя. */
export const routeUrl =
  `https://yandex.ru/maps/?rtext=~${contacts.coords.lat},${contacts.coords.lon}` +
  `&rtt=auto&z=17&pt=${contacts.coords.lon},${contacts.coords.lat}`;

/** Точка на карте (открывается в новой вкладке). */
export const mapUrl =
  `https://yandex.ru/maps/?ll=${contacts.coords.lon}%2C${contacts.coords.lat}` +
  `&z=17&pt=${contacts.coords.lon},${contacts.coords.lat},pm2rdm`;

/** Встраиваемый виджет карты — грузится только по клику пользователя. */
export const mapEmbedUrl =
  `https://yandex.ru/map-widget/v1/?ll=${contacts.coords.lon}%2C${contacts.coords.lat}` +
  `&z=17&pt=${contacts.coords.lon},${contacts.coords.lat},pm2rdm&scroll=false`;

export const hero = {
  titleLines: ['От души.', 'С веничком.', 'По-русски.'] as const,
  description:
    'Общественная баня с дровяной печью-каменкой в Павловском Посаде. Настоящий русский пар, веник, купель и отдых без спешки.',
  claim: 'Пар по-русски. Без ограничения по времени.',
} as const;

export const nav = [
  { id: 'about', label: 'О бане' },
  { id: 'services', label: 'Услуги' },
  { id: 'schedule', label: 'Расписание' },
  { id: 'prices', label: 'Цены' },
  { id: 'contacts', label: 'Контакты' },
] as const;

export type NavItem = (typeof nav)[number];

/* ------------------------------------------------------------------ */
/* Расписание                                                          */
/* ------------------------------------------------------------------ */

export type DayKind = 'men' | 'women' | 'sanitary';

export interface ScheduleDay {
  /** Индекс дня недели как в Date#getDay(): 0 — воскресенье. */
  weekday: number;
  short: string;
  full: string;
  kind: DayKind;
  /** Час открытия по московскому времени, null — закрыто. */
  openHour: number | null;
  closeHour: number | null;
  hours: string;
}

export const kindLabel: Record<DayKind, string> = {
  men: 'Мужской день',
  women: 'Женский день',
  sanitary: 'Санитарный день',
};

export const kindToday: Record<DayKind, string> = {
  men: 'Сегодня мужской день',
  women: 'Сегодня женский день',
  sanitary: 'Сегодня санитарный день',
};

/** Понедельник → воскресенье. */
export const schedule: ScheduleDay[] = [
  {
    weekday: 1,
    short: 'ПН',
    full: 'Понедельник',
    kind: 'sanitary',
    openHour: null,
    closeHour: null,
    hours: '—',
  },
  {
    weekday: 2,
    short: 'ВТ',
    full: 'Вторник',
    kind: 'women',
    openHour: 14,
    closeHour: 23,
    hours: '14:00–23:00',
  },
  {
    weekday: 3,
    short: 'СР',
    full: 'Среда',
    kind: 'men',
    openHour: 11,
    closeHour: 23,
    hours: '11:00–23:00',
  },
  {
    weekday: 4,
    short: 'ЧТ',
    full: 'Четверг',
    kind: 'women',
    openHour: 11,
    closeHour: 23,
    hours: '11:00–23:00',
  },
  {
    weekday: 5,
    short: 'ПТ',
    full: 'Пятница',
    kind: 'men',
    openHour: 11,
    closeHour: 23,
    hours: '11:00–23:00',
  },
  {
    weekday: 6,
    short: 'СБ',
    full: 'Суббота',
    kind: 'women',
    openHour: 9,
    closeHour: 23,
    hours: '09:00–23:00',
  },
  {
    weekday: 0,
    short: 'ВС',
    full: 'Воскресенье',
    kind: 'men',
    openHour: 9,
    closeHour: 23,
    hours: '09:00–23:00',
  },
];

/* ------------------------------------------------------------------ */
/* Цены                                                                */
/* ------------------------------------------------------------------ */

export const prices = {
  headline: 'Один билет — отдых до закрытия',
  note: 'Время посещения ограничено только часами работы бани. Почасовой оплаты нет.',
  items: [
    {
      id: 'full',
      title: 'Общий билет',
      value: '800',
      currency: '₽',
      note: 'Взрослый билет на одно посещение',
    },
    {
      id: 'reduced',
      title: 'Льготный билет',
      value: '600',
      currency: '₽',
      note: 'Пенсионеры, инвалиды, дети — по документу',
    },
  ],
  extras: [
    'Веник и массаж оплачиваются отдельно на месте',
    'Оплата наличными и картой',
    'Предварительная запись не нужна — приходите в свой день',
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Услуги                                                              */
/* ------------------------------------------------------------------ */

export interface Service {
  id: string;
  title: string;
  titleLines: [string, string];
  text: string;
  art: string;
  alt: string;
  icon: 'steam' | 'leaf' | 'drop' | 'hands' | 'mug';
}

export const services: Service[] = [
  {
    id: 'stove',
    title: 'Парная на дровах',
    titleLines: ['Парная', 'на дровах'],
    text: 'Кирпичная печь-каменка топится дровами. Камень набирает жар медленно и держит его весь день — пар выходит мягким и плотным.',
    art: '/art/stove.svg',
    alt: 'Дровяная печь-каменка с открытой топкой и живым огнём',
    icon: 'steam',
  },
  {
    id: 'venik',
    title: 'Русский пар и веник',
    titleLines: ['Русский пар', 'и веник'],
    text: 'Дубовые и берёзовые веники запариваем перед заходом. Просите пар — поддадим; просите легче — сделаем легче.',
    art: '/art/venik.svg',
    alt: 'Связка дубовых веников на деревянной стене предбанника',
    icon: 'leaf',
  },
  {
    id: 'kupel',
    title: 'Купель',
    titleLines: ['Купель', '(небольшая)'],
    text: 'Компактная холодная купель сразу у парной. Три ступени, поручень, вода меняется каждый банный день.',
    art: '/art/kupel.svg',
    alt: 'Небольшая деревянная купель с холодной водой и поручнем',
    icon: 'drop',
  },
  {
    id: 'massage',
    title: 'Массаж',
    titleLines: ['Массаж', 'после пара'],
    text: 'Классический массаж после парной. Договаривайтесь на месте с мастером — работает в банные дни.',
    art: '/art/massage.svg',
    alt: 'Свёрнутые полотенца и масла для массажа на деревянной лавке',
    icon: 'hands',
  },
  {
    id: 'beer',
    title: 'Пиво и закуски',
    titleLines: ['Пиво', 'и закуска'],
    text: 'Холодное разливное пиво, квас и простая закуска в предбаннике. Сидим, остываем, разговариваем.',
    art: '/art/beer.svg',
    alt: 'Кружка холодного пива и закуски на столе в предбаннике',
    icon: 'mug',
  },
];

/* ------------------------------------------------------------------ */
/* Блок «Не SPA»                                                       */
/* ------------------------------------------------------------------ */

export const about = {
  eyebrow: 'О бане',
  title: ['Не SPA.', 'Настоящая русская баня.'] as const,
  lead: 'У нас нет панорамных бассейнов, джакузи и халатов с монограммой. Есть кирпичная каменка, дрова, жар, веник и небольшая купель — всё, ради чего в баню и ходят.',
  points: [
    {
      title: 'Печь топится дровами',
      text: 'Никаких электрокаменок. Дрова, кирпич и камень — жар живой и ровный.',
    },
    {
      title: 'Общая баня, а не кабинет',
      text: 'Мужские и женские дни, общий полок, банная очередь и разговоры на лавке.',
    },
    {
      title: 'Честная цена',
      text: '800 ₽ за вход и никакой платы за минуты. Один билет — весь день до закрытия.',
    },
  ],
  quote: 'Приходите с веником и без спешки.',
} as const;

/* ------------------------------------------------------------------ */
/* Информационная панель                                               */
/* ------------------------------------------------------------------ */

export const infoBar = {
  timeTitle: 'Время посещения',
  timeText: 'Не ограничено, кроме часов работы бани',
  addressTitle: 'Адрес',
} as const;

export const cta = {
  schedule: 'Узнать расписание',
  call: 'Позвонить',
  route: 'Построить маршрут',
  vk: 'Группа VK',
} as const;

export const footer = {
  note: 'Общественная баня в Павловском Посаде. Работаем по расписанию мужских и женских дней.',
  copyright: `© ${new Date().getFullYear()} Баня «У Михалыча»`,
} as const;

export const seo = {
  title: 'Баня «У Михалыча» — общественная баня в Павловском Посаде',
  description:
    'Общественная баня с дровяной печью-каменкой в Павловском Посаде. Настоящий русский пар, веник, купель, массаж. Билет 800 ₽, льготный 600 ₽, без ограничения по времени.',
  keywords: [
    'баня Павловский Посад',
    'общественная баня',
    'русская баня на дровах',
    'баня у Михалыча',
    'мужской день баня',
    'женский день баня',
    'купель',
    'веник',
  ],
} as const;
