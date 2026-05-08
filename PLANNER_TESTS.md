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
   - **Attendance** (35% weight)
   - **Duration Fit** (20% weight)
   - **Soft Preferences** (15% weight)
   - **Peak Time Bonus (2-6 PM)** (15% weight)
   - **Earliness** (10% weight)
   - **Padding** (5% weight)

7. **Diversity Reranking**: The final top 11 results are passed through a diversity filter that penalizes temporal clusters, ensuring a spread of options across different days and times.

---

## Technical Feature: Daily Window Splitting
When a planning range spans multiple days and contains "Must" curfews (e.g., "Must start after 07:00 AM" and "Must end before 11:59 PM"), the engine automatically slices the global range into daily **Operational Windows**. This prevents the generation of candidates that "live" through non-operational hours (nights) and ensures birth/death points are correctly placed at the start and end of every available day.

## Technical Feature: Temporal Resolution & Merging

### Recurring Event Integrity (The "Infinite Block" Fix)
Previously, recurring activities with the same ID were merged into single giant blocks spanning multiple days, effectively "killing" all gaps between them. The engine now uses a **Temporal Merging** strategy that only combines busy blocks if they actually overlap in time, regardless of their source activity ID.

### Precision Split Points
The engine now treats "Must" curfews as primary split points. This ensures that the candidate generator always tries to start a meeting at the exact second a requested availability window begins (e.g., exactly at 7:00 AM).

---

## Test Environment: High-Density Seeding
The engine is now evaluated against a high-density test environment containing **22+ activities** (mix of daily recurring, weekly recurring, and multi-participant non-recurring events). This ensures that candidate generation remains performant and accurate even with complex, overlapping schedules.

---

## Test Cases & Verification

### Test Case 1: Hard Curfews (The "Must" Rules)
* **Objective**: Ensure the planner respects hard boundaries and correctly flags impossible scenarios.
* **Scenario**: 
  - Selected Entity: Ahmed
  - Strict Constraint: `Must start after 02:00 PM`
  - Planning Window: `08:00 AM` to `12:00 PM`
* **Result: PASS**
  - **Technical Output**: `Candidates found: 1 | Candidates passed: 0`
  - The planner correctly identified one raw block but successfully purged it during the "Elimination" step for violating the afternoon curfew.
  - The API returns an empty results set, properly triggering the frontend fallback state.

### Test Case 2: Scoring Preferences (The "Should" Rules)
* **Objective**: Validate the engine's ability to rank multiple valid possibilities based on user preference weights.
* **Scenario**: 
  - Selected Entity: Ahmed
  - Planning Window: 72-hour continuous period
  - Soft Constraint: `Should start after 02:00 PM`
* **Result: PASS**
  - **Technical Output**: `Top score: 75.00`
  - The candidate generator identified multiple valid blocks across the 3 days.
  - During scoring, slots appearing after 2:00 PM were heavily favored, while morning slots were correctly demoted to the "Alternatives" array.

### Test Case 3: Conflict Avoidance & Splitting
* **Objective**: Verify that recurring entity busy blocks successfully fragment candidate windows.
* **Scenario**:
  - Selected Entities: Ahmed and Zoha
  - Seeded Activity: `Daily Standup` (09:30 AM - 10:00 AM)
  - Duration Required: `1 Hour`
* **Result: PASS**
  - **Technical Output**: `Split Points: 4 | Candidates passed: 2`
  - The engine correctly split the 8-hour day into two segments around the 30-minute meeting.
  - Returned candidates for both the pre-meeting and post-meeting slots.

### Test Case 4: Zero/Low Activity Scaling (Multi-Day)
* **Objective**: Ensure birth points are correctly seeded for entities with empty schedules across multi-day ranges.
* **Scenario**:
  - Selected Entities: Ansa (Zero activities) and Abi (Low activity)
  - Planning Range: `2026-05-08 08:00 AM` to `2026-05-10 11:59 PM`
  - Required Duration: `1 Hour 30 Minutes`
  - Operational Hours: `07:00 AM` to `11:59 PM` (Must)
* **Result: PASS**
  - **Technical Output**: `Windows: 3 | Birth pts: 3 | Death pts: 3 | Candidates passed: 3`
  - **Note**: This test case verifies the **Daily Window Splitting** behavior. The 3-day range was automatically sliced into 3 daily operational islands, ensuring candidates were generated for the start/end of every day despite the lack of existing activities.

### Test Case 5: Diversity Reranking & Variety
* **Objective**: Ensure the #1 through #11 results represent a diverse range of times rather than minor variations of the same slot.
* **Scenario**: 
  - Selected Entities: Abi and Ahmed
  - Results Found: 18 valid slots
* **Result: PASS**
  - **Technical Output**: `Diversity Pass complete | 11 items returned`
  - The first result was on May 10th (best score).
  - Other slots on May 10th were penalized, allowing valid slots from May 8th and May 9th to rise into the "Alternatives" list.
  - The UI successfully displays a mix of morning, afternoon, and different days.

### Test Case 6: Peak Time Optimization (2-6 PM)
* **Objective**: Verify that slots in the highly desirable 2-6 PM window outrank earlier or later slots if all other factors are equal.
* **Result: PASS**
  - **Technical Output**: `Breakdown: { peak_time: 100 }`
  - Afternoon slots showed a significant score boost, often becoming the "Best Option" even if slightly later in the week than a morning slot.

---

## UI Verification: Expanded Report Accuracy
* **Insight**: Fixed a regression where the frontend miscalculated end times using target duration.
* **Fix**: The backend now provides an explicit `endTime` string calculated from the absolute temporal boundaries of the selected candidate.
