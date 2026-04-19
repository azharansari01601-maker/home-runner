import List "mo:core/List";
import Types "types";
import ScoresMixin "mixins/scores-api";

actor {
  let scores = List.empty<Types.ScoreEntry>();
  let totalGames = { var count : Nat = 0 };

  include ScoresMixin(scores, totalGames);
};
