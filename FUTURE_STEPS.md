# Future-Proofing: Adding Team Matches (2v2, 3v3)

The current system is designed for 1v1. To extend it to teams, follow these recommendations:

## 1. Schema Changes
Instead of `player_a_id` and `player_b_id` in the `matches` table, move to a more flexible many-to-many relationship:

```sql
-- New table for match participants
CREATE TABLE match_participants (
    match_id UUID REFERENCES matches(id),
    player_id UUID REFERENCES players(id),
    team_id INT, -- 1 for Team A, 2 for Team B
    PRIMARY KEY (match_id, player_id)
);
```

## 2. Rating Calculation (Average vs Composite)
When calculating team Elo:
- **Average Method**: Calculate the average rating of Team A and Team B. Treat them as two "players" in the standard formula. Apply the resulting change to every individual on the team.
- **Weighted Method**: Give higher-rated players less gain for winning against lower-rated players, protecting against "boosting".

## 3. SQL Function Update
Update the `submit_match` function to:
1. Accept arrays of nicknames: `p_a_nicks TEXT[], p_b_nicks TEXT[]`.
2. Loop through participants to calculate the team average.
3. Distribute points fairly among all winners and subtract from all losers.

## 4. UI Extension
The `MatchHistory` component is currently formatted for "A vs B". You should update the layout to display a list of nicknames for each side, which the current `glass` card design can easily accommodate by switching the names to a flex-wrapped list.
