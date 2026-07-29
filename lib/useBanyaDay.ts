'use client';

import { useEffect, useState } from 'react';
import { schedule, site, type ScheduleDay } from './content';

export interface BanyaNow {
  /** Текущий день по расписанию бани. */
  day: ScheduleDay;
  /** Следующий рабочий день (для подсказки, когда сегодня закрыто). */
  next: ScheduleDay;
  isOpenNow: boolean;
  /** Короткий статус: «Открыто до 23:00», «Откроется в 11:00», «Сегодня закрыто». */
  status: string;
  hour: number;
  minute: number;
}

/** Текущее время в часовом поясе бани, без зависимости от локали устройства. */
function moscowParts(date: Date): { weekday: number; hour: number; minute: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: site.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  let weekday = date.getDay();
  let hour = date.getHours();
  let minute = date.getMinutes();

  for (const part of fmt.formatToParts(date)) {
    if (part.type === 'weekday' && part.value in map) weekday = map[part.value];
    if (part.type === 'hour') hour = Number(part.value) % 24;
    if (part.type === 'minute') minute = Number(part.value);
  }

  return { weekday, hour, minute };
}

function dayByWeekday(weekday: number): ScheduleDay {
  return schedule.find((d) => d.weekday === weekday) ?? schedule[0];
}

function nextWorkingDay(weekday: number): ScheduleDay {
  for (let step = 1; step <= 7; step += 1) {
    const candidate = dayByWeekday((weekday + step) % 7);
    if (candidate.openHour !== null) return candidate;
  }
  return schedule[1];
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function computeBanyaNow(date: Date): BanyaNow {
  const { weekday, hour, minute } = moscowParts(date);
  const day = dayByWeekday(weekday);
  const next = nextWorkingDay(weekday);

  let isOpenNow = false;
  let status: string;

  if (day.openHour === null || day.closeHour === null) {
    status = `Сегодня закрыто · ${next.full.toLowerCase()} с ${pad(next.openHour ?? 0)}:00`;
  } else {
    const minutesNow = hour * 60 + minute;
    const opensAt = day.openHour * 60;
    const closesAt = day.closeHour * 60;

    if (minutesNow < opensAt) {
      status = `Откроется в ${pad(day.openHour)}:00`;
    } else if (minutesNow < closesAt) {
      isOpenNow = true;
      status = `Открыто до ${pad(day.closeHour)}:00`;
    } else {
      status = `Закрыто · ${next.full.toLowerCase()} с ${pad(next.openHour ?? 0)}:00`;
    }
  }

  return { day, next, isOpenNow, status, hour, minute };
}

/**
 * Определяет текущий банный день на клиенте.
 * До монтирования возвращает null — разметка при этом не «прыгает»,
 * блоки резервируют высоту заранее.
 */
export function useBanyaDay(): BanyaNow | null {
  const [now, setNow] = useState<BanyaNow | null>(null);

  useEffect(() => {
    const update = () => setNow(computeBanyaNow(new Date()));
    update();

    // Пересчитываем раз в минуту — статус «открыто/закрыто» остаётся честным.
    const timer = window.setInterval(update, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') update();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return now;
}
