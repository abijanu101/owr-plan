# Intelligent Planner Engine - Evaluation & Test Report

## Overview
This document summarizes the testing and evaluation of the core constraint-based planning pipeline for the OwrPlan application. The engine is responsible for intelligently generating optimized time slots for activities by evaluating temporal availability, hard constraints ("must"), and weighted preferences ("should/can").

## Algorithm Pipeline

The planner engine operates sequentially across the following stages:

1. **Extraction**: Frontend user constraints are normalized into temporal rulesets (include/exclude windows, padding, curfew definitions).
2. **Busy Blocks**: Entity activity histories (both recurring and non-recurring) are converted into concrete absolute `Date`-based busy blocks.
3. **Split Points**: Birth and Death points are calculated by overlapping valid active windows and entity activity boundaries.
4. **Candidate Generation**: Candidates are mapped through pairwise birth × death evaluations, passing through a "free-throughout" validator. Candidates with identical start times but subsets of available attendees are pruned.
5. **Elimination**: Candidates violating hard temporal constraints (`must` duration, `must` curfew, etc.) are rigidly eliminated.
6. **Scoring**: A multi-factor weighted algorithm scores remaining candidates based on:
   - **Attendance** (40% weight)
   - **Duration Fit** (25% weight)
   - **Soft Preferences** (20% weight)
   - **Earliness** (10% weight)
   - **Padding** (5% weight)

---

## Test Cases & Verification

### Test Case 1: Hard Curfews (The "Must" Rules)
* **Objective**: Ensure the planner respects hard boundaries and correctly flags impossible scenarios.
* **Scenario**: 
  - Selected Entity: Ahmed
  - Strict Constraint added: `Must start after 02:00 PM`
  - Planning Window artificially restricted to morning hours (`08:00 AM` to `12:00 PM`).
* **Result: PASS**
  - The planner engine correctly recognized the impossibility of fulfilling both conditions simultaneously.
  - All early candidates were successfully purged during the "Elimination" step.
  - The API gracefully returned an empty results set, properly triggering the frontend "No Plan Results Found" fallback state without crashing.

### Test Case 2: Scoring Preferences (The "Should" Rules)
* **Objective**: Validate the engine's ability to rank multiple valid possibilities based on user preference weights.
* **Scenario**: 
  - Selected Entity: Ahmed
  - Planning Window expanded across a 72-hour continuous period.
  - Soft Constraint added: `Should start after 02:00 PM`.
* **Result: PASS**
  - The candidate generator identified multiple valid blocks of free time across the 3 days.
  - During the scoring phase, slots appearing after 2:00 PM were heavily favored, pushing them to the #1 "Best Option" ranking with >90% match scores.
  - Morning slots were preserved but correctly demoted to the "Alternatives" array with lower comparative scores.

### Test Case 3: Conflict Avoidance & Splitting
* **Objective**: Verify that recurring entity busy blocks successfully fragment candidate windows.
* **Scenario**:
  - Selected Entities: Ahmed and Zoha.
  - Both entities share a seeded recurring `Daily Standup` (09:30 AM - 10:00 AM).
  - Duration Required: `1 Hour`.
* **Result: PASS**
  - The point-generation accurately treated the 09:30-10:00 AM block as a shared "Death" and "Birth" boundary.
  - Resulting candidates were effectively split around this busy block.
  - The planner returned seamless candidates starting *after* the busy block resolved (e.g., 10:00 AM), satisfying the continuous 1-hour requirement.

---

## Resolved Bug Log
During the evaluation phase, the following core issues were identified and permanently resolved:

1. **Empty Result Frontend Crashes**: Mitigated a React crash (`null.score`) triggered when the planner returned no valid combinations. Implemented a robust `hasOptions` guard to render a fallback error state smoothly.
2. **"Late Night" Temporal Starvation**: Identified that default "Today" constraint generation windows caused 0-result returns when executed late at night, as the remaining time until midnight was shorter than the default 1.5-hour duration constraint. Default planning logic was augmented to automatically span a minimum of 48 hours.
3. **JS Numeric Parsing Faults**: Purged node-version-specific numeric separators (`60_000`) in candidate generators that could trigger intermittent startup syntax failures.
