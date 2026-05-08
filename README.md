# OwrPlan Scheduling Engine

The OwrPlan Scheduling Engine is a high-performance, constraint-based planning algorithm designed to find optimal meeting times across complex, multi-entity schedules. It resolves availability conflicts by evaluating hard constraints, soft preferences, and real-time activity data.

## 🚀 Core Features

### 1. Multi-Stage Pipeline
The engine processes a "Plan Request" through a rigorous 7-stage pipeline:
- **Extraction**: Normalizes frontend payloads into rigid temporal rules.
- **Busy Block Resolution**: Expands recurring events into absolute timestamps.
- **Split Point Generation**: Identifies "Birth" and "Death" points for potential gaps.
- **Candidate Mapping**: Evaluates pairwise gaps and prunes redundant overlaps.
- **Elimination**: Enforces "Must" rules (Durations, Curfews, Mandatory People).
- **Scoring**: Weighted ranking based on Attendance, Duration Fit, and Preferences.
- **Diversity Reranking**: Ensures the Top 11 results are temporally distinct.

### 2. Intelligent Temporal Merging
Unlike standard calendars that might merge all occurrences of a recurring event into a single block, our engine uses **Temporal Merging**. It only merges busy blocks if they actually overlap in time, preserving valid "gaps" between meetings on the same day.

### 3. Peak-Time Optimization
The engine includes a **Peak Time Bonus** (2:00 PM - 6:00 PM). It automatically identifies and promotes slots within this highly productive window, ensuring the "Best Option" isn't just the first available slot, but the most desirable one.

### 4. Diversity & Variety Heuristics
To prevent "Result Clustering" (where all top results are on the same afternoon), the engine applies a **Similarity Penalty** to temporal neighbors. This ensures the user sees a diverse spread of options across different days and times.

### 5. Multi-Day Operational Slicing
When a plan spans multiple days, the engine automatically slices the range into daily **Operational Windows** based on your curfew constraints. This prevents candidates from spanning across nights and ensures valid start points for every new day.

## 🛠️ Technology Stack
- **Backend**: Node.js / Mongoose
- **Algorithm**: Deterministic Temporal Logic (Non-AI/LLM based for 100% reliability)
- **Frontend**: React / Tailwind CSS / Framer Motion

## 🧪 Testing
Detailed test cases and evaluation logs can be found in `PLANNER_TESTS.md`.
