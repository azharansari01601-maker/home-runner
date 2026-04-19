import List "mo:core/List";
import Iter "mo:core/Iter";
import Types "../types";

module {
  public type ScoreEntry = Types.ScoreEntry;

  let MAX_SCORES : Nat = 100;

  /// Insert a new score and keep list sorted descending by score, capped at MAX_SCORES.
  public func insert(scores : List.List<ScoreEntry>, entry : ScoreEntry) {
    scores.add(entry);
    scores.sortInPlace(func(a, b) {
      if (a.score > b.score) { #less }
      else if (a.score < b.score) { #greater }
      else { #equal }
    });
    if (scores.size() > MAX_SCORES) {
      scores.truncate(MAX_SCORES);
    };
  };

  /// Return the top N entries (already sorted descending).
  public func topN(scores : List.List<ScoreEntry>, n : Nat) : [ScoreEntry] {
    let size = scores.size();
    let limit = if (size < n) size else n;
    scores.sliceToArray(0, limit)
  };
};
