import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { CategoryId } from '../data/questions';

/**
 * Session-scoped game state.
 *
 * Holds everything that's meaningful for one "play session" — the two
 * players' names, who's currently asking, what round we're on, and which
 * questions have already been shown. All values reset on resetGame()
 * (called from Reflection's "New Game" button) and are naturally fresh on
 * every cold launch (state is in-memory only, never persisted).
 *
 * Mutations are exposed through named actions (startGame, setFirstAsker,
 * nextRound, markQuestionUsed) rather than raw setters so the call sites
 * read like intent — and the state-update logic for atomic operations
 * (e.g. nextRound increments round AND swaps asker in one update) lives
 * here in one place.
 */

type UsedQuestions = Record<CategoryId, readonly string[]>;

type GameState = {
  /** Player names captured on NameEntry. Empty strings before NameEntry submits. */
  player1: string;
  player2: string;
  /**
   * Which player asks the current round (the other shares). Defaults to 1;
   * the real value lands on FirstPlayerSelection's Continue tap, before any
   * downstream screen reads it.
   */
  askingPlayer: 1 | 2;
  /** 1-indexed round number. Starts at 1, increments via nextRound(). */
  round: number;
  /** Questions already shown this session, keyed by category. */
  usedQuestions: UsedQuestions;
};

const EMPTY_USED: UsedQuestions = {
  justVibing: [],
  digDeep: [],
  waitWhat: [],
};

const INITIAL_STATE: GameState = {
  player1: '',
  player2: '',
  askingPlayer: 1,
  round: 1,
  usedQuestions: EMPTY_USED,
};

type GameContextValue = GameState & {
  /** Set both player names. Called from NameEntry on Continue tap. */
  startGame: (player1: string, player2: string) => void;
  /** Set who asks the first question. Called from FirstPlayerSelection. */
  setFirstAsker: (player: 1 | 2) => void;
  /**
   * Atomically increment round and swap askingPlayer. Called from
   * QuestionCard's "Next Round" button — the back-arrow on QuestionCard does
   * NOT call this (back keeps round/asker unchanged, by design).
   */
  nextRound: () => void;
  /**
   * Append a question to the used list for its category. Idempotent — does
   * nothing if the question is already in the list.
   */
  markQuestionUsed: (category: CategoryId, question: string) => void;
  /**
   * Reset all session state to its initial values. Called from Reflection's
   * "New Game" button so the next game starts fresh.
   */
  resetGame: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const startGame = useCallback((player1: string, player2: string) => {
    setState((prev) => ({ ...prev, player1, player2 }));
  }, []);

  const setFirstAsker = useCallback((player: 1 | 2) => {
    setState((prev) => ({ ...prev, askingPlayer: player }));
  }, []);

  const nextRound = useCallback(() => {
    setState((prev) => ({
      ...prev,
      round: prev.round + 1,
      askingPlayer: prev.askingPlayer === 1 ? 2 : 1,
    }));
  }, []);

  const markQuestionUsed = useCallback(
    (category: CategoryId, question: string) => {
      setState((prev) => {
        if (prev.usedQuestions[category].includes(question)) return prev;
        return {
          ...prev,
          usedQuestions: {
            ...prev.usedQuestions,
            [category]: [...prev.usedQuestions[category], question],
          },
        };
      });
    },
    []
  );

  const resetGame = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // useMemo keeps the context value reference stable across renders when
  // state hasn't changed — prevents unnecessary re-renders of consumers
  // that only read the action functions.
  const value = useMemo<GameContextValue>(
    () => ({
      ...state,
      startGame,
      setFirstAsker,
      nextRound,
      markQuestionUsed,
      resetGame,
    }),
    [state, startGame, setFirstAsker, nextRound, markQuestionUsed, resetGame]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/**
 * Access the game session state. Throws if called outside a <GameProvider>,
 * which surfaces mounting mistakes immediately rather than silently no-oping.
 */
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (ctx === null) {
    throw new Error('useGame must be called inside a <GameProvider>');
  }
  return ctx;
}
