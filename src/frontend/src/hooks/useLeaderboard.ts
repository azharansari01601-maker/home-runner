import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { ScoreEntry } from "../types/game";

// ─── useHighScores ─────────────────────────────────────────────────────────────
export function useHighScores() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<ScoreEntry[]>({
    queryKey: ["highScores"],
    queryFn: async () => {
      if (!actor) return [];
      const results = await actor.getHighScores();
      return results as ScoreEntry[];
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─── useTotalGames ─────────────────────────────────────────────────────────────
export function useTotalGames() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<bigint>({
    queryKey: ["totalGames"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalGames();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─── useSaveScore ──────────────────────────────────────────────────────────────
export function useSaveScore() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<void, Error, { playerName: string; score: number }>({
    mutationFn: async ({ playerName, score }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveScore(playerName, BigInt(score));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["highScores"] });
      queryClient.invalidateQueries({ queryKey: ["totalGames"] });
    },
  });
}

// ─── Convenience composite hook ────────────────────────────────────────────────
export function useLeaderboard() {
  const highScores = useHighScores();
  const totalGames = useTotalGames();
  const saveScore = useSaveScore();

  return {
    highScores: highScores.data ?? [],
    isLoadingScores: highScores.isLoading,
    totalGames: totalGames.data ?? BigInt(0),
    saveScore: saveScore.mutate,
    isSaving: saveScore.isPending,
    saveError: saveScore.error,
  };
}
