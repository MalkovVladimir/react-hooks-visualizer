<div align="center">

# React Hooks Visualizer

**Все 19 хуков React 19 — не описанием сигнатур, а в работе.**<br />
Слева минимальный пример кода, справа живая визуализация того, что этот код делает.

### [→ Открыть демо](https://react-hooks-visualizer.netlify.app/)

![React](https://img.shields.io/badge/React-19.2-7c9cff?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-59e3c8?logo=vite&logoColor=white)
![Зависимостей](https://img.shields.io/badge/рантайм--зависимостей-0-52d98a)
![License](https://img.shields.io/badge/license-MIT-98a2b8)

</div>

---

## Зачем

Документация отвечает на вопрос «что делает хук». Сложность обычно не в этом, а в нюансах: почему
три `setState` подряд дают +1, почему таймер перезапускается на каждое изменение пропа, почему
`useFormStatus` внутри своей же формы возвращает `false`. Такие вещи быстрее понять, если их видно.

Здесь каждый хук — рабочий компонент. Код в левой панели и есть то, что выполняется в правой.

## Как устроено

Одна страница со списком хуков. Клик по названию плавно скроллит к демо и раскрывает его, остальные
сворачиваются; кнопка **«Далее»** делает то же самое для следующего. Открытый хук пишется в адрес
(`#useMemo`) — ссылкой можно поделиться.

Формат демо зависит от природы хука:

| формат | для чего | что видно |
| --- | --- | --- |
| **две панели** «без хука» / «с хуком» | кеш и производительность | счётчики пересчётов и рендеров расходятся на глазах |
| **лента событий** с отметками времени | жизненный цикл | `render → commit → paint → effect → cleanup` в реальном порядке |
| **движущиеся индикаторы** | отзывчивость и анимация | залипает интерфейс или нет |

Ленты пишут то, что действительно произошло в браузере, а не заготовленный сценарий.

## Хуки

Названия ведут прямо на нужное демо.

| # | хук | что показывает демо |
| ---: | --- | --- |
| 1 | [`useState`](https://react-hooks-visualizer.netlify.app/#useState) | три `setState` подряд: по значению → **+1**, через updater → **+3**; счётчик рендеров показывает батчинг |
| 2 | [`useReducer`](https://react-hooks-visualizer.netlify.app/#useReducer) | цепочка `action → reducer → новый state`; возврат того же объекта отменяет ре-рендер |
| 3 | [`useContext`](https://react-hooks-visualizer.netlify.app/#useContext) | значение проходит через два компонента без единого пропа, вложенный Provider перекрывает родителя |
| 4 | [`useRef`](https://react-hooks-visualizer.netlify.app/#useRef) | счётчик в ref не двигает разметку, в state двигает; плюс доступ к DOM-узлу |
| 5 | [`useImperativeHandle`](https://react-hooks-visualizer.netlify.app/#useImperativeHandle) | родитель зовёт `focus/clear/shake`, а `style` и `value` наружу не отданы |
| 6 | [`useEffect`](https://react-hooks-visualizer.netlify.app/#useEffect) | смена комнаты даёт `cleanup → connect`, а несвязанный ре-рендер эффект не трогает |
| 7 | [`useLayoutEffect`](https://react-hooks-visualizer.netlify.app/#useLayoutEffect) | замедленная съёмка кадров: счётчик «кадров с неправильной позицией» — **0** только у layout-эффекта |
| 8 | [`useInsertionEffect`](https://react-hooks-visualizer.netlify.app/#useInsertionEffect) | один и тот же значок измеряется как **142px** или **50px** — в зависимости от момента вставки `<style>` |
| 9 | [`useEffectEvent`](https://react-hooks-visualizer.netlify.app/#useEffectEvent) | полоска прогресса сбрасывается при каждой смене шага слева и не сбивается справа |
| 10 | [`useMemo`](https://react-hooks-visualizer.netlify.app/#useMemo) | клики по несвязанной кнопке: **3** пересчёта против **1** |
| 11 | [`useCallback`](https://react-hooks-visualizer.netlify.app/#useCallback) | `memo`-компонент: **4** рендера против **1**, каждый со вспышкой |
| 12 | [`useTransition`](https://react-hooks-visualizer.netlify.app/#useTransition) | тяжёлый список: поле ввода и анимация остаются живыми, список догоняет |
| 13 | [`useDeferredValue`](https://react-hooks-visualizer.netlify.app/#useDeferredValue) | `query` и `deferredQuery` расходятся при наборе, устаревший результат приглушается |
| 14 | [`useDebugValue`](https://react-hooks-visualizer.netlify.app/#useDebugValue) | имитация панели DevTools: сырые `true / 24` против читаемой подписи |
| 15 | [`useId`](https://react-hooks-visualizer.netlify.app/#useId) | две копии одной формы, клик по label фокусирует именно свой input |
| 16 | [`useSyncExternalStore`](https://react-hooks-visualizer.netlify.app/#useSyncExternalStore) | наивная подписка показывает прочерк, правильная — значение с первого кадра |
| 17 | [`useActionState`](https://react-hooks-visualizer.netlify.app/#useActionState) | `isPending`, ошибка валидации и счётчик попыток из предыдущего состояния |
| 18 | [`useOptimistic`](https://react-hooks-visualizer.netlify.app/#useOptimistic) | сообщение появляется пунктиром и откатывается, если сервер ответил ошибкой |
| 19 | [`useFormStatus`](https://react-hooks-visualizer.netlify.app/#useFormStatus) <sup>`react-dom`</sup> | один и тот же компонент внутри формы видит `pending`, снаружи — нет |

## Запуск

```bash
npm install
```

```bash
npm run dev
```

| команда | что делает |
| --- | --- |
| `npm run dev` | дев-сервер на `localhost:5173` |
| `npm run build` | прод-сборка в `dist/` |
| `npm run preview` | локальный просмотр прод-сборки |
| `npm run typecheck` | проверка типов без сборки |

## Про версии: нужен React 19, а не 18

Список из 19 хуков в React 18 не собрать — четырёх из них там просто нет:

| хук | появился |
| --- | --- |
| `useId`, `useTransition`, `useDeferredValue`, `useSyncExternalStore`, `useInsertionEffect` | React 18 |
| `useActionState`, `useOptimistic`, `useFormStatus` | React 19.0 |
| `useEffectEvent` | React 19.2 |

Проект собран на React 19.2. `useFormStatus` импортируется из `react-dom`, все остальные — из
`react`.

`<StrictMode>` намеренно выключен в [`src/main.tsx`](src/main.tsx): в dev-режиме он вызывает эффекты
дважды, и ленты событий в демо жизненного цикла читались бы вдвое.

## Структура

```
src/
├── App.tsx          список хуков, аккордеон, плавный скролл
├── types.ts         контракт демо: код примера + компонент + нюансы
├── demos/           по одному файлу на хук
└── ui/
    ├── kit.tsx      панели, лента событий, индикация ре-рендеров, сигналы
    └── Code.tsx     подсветка кода без внешних зависимостей
```

Рантайм-зависимости — только `react` и `react-dom`. Подсветка синтаксиса, UI-примитивы и
лента событий написаны в проекте.

### Как добавить хук

Создать файл в `src/demos/` с объектом `HookDemo` и включить его в `src/demos/index.ts`:

```ts
export const useSomethingDemo: HookDemo = {
  id: 'useSomething',
  pkg: 'react',
  tagline: 'одна строка: зачем он нужен',
  code,        // минимальный пример — то, что слева
  Demo,        // живая визуализация — то, что справа
  notes: [],   // нюансы, ради которых обычно и лезут в доку
}
```

## Лицензия

[MIT](LICENSE)
