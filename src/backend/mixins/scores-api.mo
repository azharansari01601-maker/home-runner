import List "mo:core/List";
import Time "mo:core/Time";
import ScoresLib "../lib/scores";
import Types "../types";

mixin (scores : List.List<Types.ScoreEntry>, totalGames : { var count : Nat }) {

  public func saveScore(playerName : Text, score : Nat) : async () {
    let entry : Types.ScoreEntry = {
      playerName;
      score;
      timestamp = Time.now();
    };
    ScoresLib.insert(scores, entry);
    totalGames.count += 1;
  };

  public query func getHighScores() : async [Types.ScoreEntry] {
    ScoresLib.topN(scores, 10)
  };

  public query func getTotalGames() : async Nat {
    totalGames.count
  };
};
