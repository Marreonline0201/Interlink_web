# Matchmaking Service (FindFriend Step 1)

This directory now powers the `FindFriend` preview flow backed by real persistence. The service accepts a student's availability and returns the most compatible peers. When Supabase credentials are supplied it queries the `match_profiles` and `availability_slots` tables; otherwise it falls back to the bundled sample dataset so local development still works without a database.

## Routes

| Method | Path                      | Description                                   |
| ------ | ------------------------- | --------------------------------------------- |
| GET    | `/matchmaking/health`     | Simple readiness probe. Returns `{ status }`. |
| POST   | `/matchmaking/matches`    | Generates 1:1 or 1:3 match suggestions.       |

The router is mounted in `backend/index.js`, so requests should be sent to `http://localhost:3001/matchmaking/...` when running the backend locally.

## Request Body

```jsonc
{
  "user": {
    "id": "current-user-id",           // optional, used to avoid matching with self
    "name": "Jordan Avery",            // optional, informational only
    "interests": ["ai", "startups"]    // optional, improves shared interest scoring
  },
  "mode": "1-on-1",                     // accepts: "1-on-1", "one-on-one", "1-on-3", "one-on-three"
  "availability": [
    {
      "id": "slot-1",
      "title": "My Wednesday window",  // optional
      "start": "2025-01-15T14:00:00.000Z",
      "end": "2025-01-15T16:00:00.000Z"
    }
  ],
  "filters": {
    "interests": ["ai", "ml"],         // optional, matches peers containing any of these interests
    "majors": ["Computer Science"]     // optional, matches peers whose major is in the list
  }
}
```

All timestamps must be ISO-8601 strings. This format mirrors the `SerializedFreeTimeSlot` objects emitted by the Schedule page.

## Sample Response (1-on-1)

```jsonc
{
  "mode": "one-on-one",
  "generatedAt": "2025-11-08T22:59:32.034Z",
  "seeker": {
    "id": "current-user-id",
    "interests": ["ai", "startups"]
  },
  "availabilitySummary": {
    "totalSlots": 1,
    "totalMinutes": 120
  },
  "datasetSize": 5,
  "matches": [
    {
      "matchId": "current-user-id::user-anna-delgado",
      "participants": [
        {
          "id": "user-anna-delgado",
          "name": "Anna Delgado",
          "email": "anna.delgado@example.edu",
          "major": "Computer Science",
          "graduationYear": 2026,
          "interests": ["ai", "startups", "climbing"],
          "bio": "Peer mentor in the AI society, loves edge-case debugging sessions."
        }
      ],
      "overlapMinutes": 120,
      "overlappingAvailability": [
        {
          "start": "2025-01-15T14:00:00.000Z",
          "end": "2025-01-15T16:00:00.000Z",
          "durationMinutes": 120
        }
      ],
      "sharedInterests": ["ai", "startups"],
      "candidateScheduleSummary": {
        "totalSlots": 3,
        "totalMinutes": 359
      }
    }
  ]
}
```

For 1-on-3 mode the response structure is the same, but `participants` contains three entries and the payload includes `candidateScheduleSummaries` for each peer.

## Connecting to Supabase

1. Ensure the SQL migration in `backend/db/migrations/20251109_matchmaking.sql` has been applied to your Supabase project. It creates `match_profiles` and `availability_slots`.
2. Provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` via `.env` or environment variables.
3. (Optional) Seed the sample dataset into Supabase to verify the end-to-end flow before your ingestion pipeline runs:

   ```bash
   cd backend
   npm run seed:matchmaking
   ```

   The seed script is a no-op when Supabase credentials are not configured.

When the client is configured the matchmaking route returns `debug` logs indicating the live data source (`supabase` vs `sample-dataset`). The schedule APIs also persist availability directly to Supabase so subsequent requests reuse the stored canonical slots.
*** End Patch

