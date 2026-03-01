# Digital Wedding Invitation

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-screen animated digital wedding invitation website
- Opening scene: groom and bride names revealed with elegant fade/slide transitions
- Transition to wedding date reveal (animated countdown or styled date display)
- Transition to wedding location details (venue name, address, map link)
- RSVP section for guests to confirm attendance
- Floral/romantic decorative elements throughout
- Background music toggle (optional ambient wedding music)
- Mobile-responsive layout

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend
- Store wedding details: couple names, wedding date, venue name, venue address
- RSVP data model: guest name, attendance status, message
- Queries: get wedding details, list RSVPs
- Updates: submit RSVP

### Frontend
- Fullscreen scroll/transition-based layout with multiple sections:
  1. Hero section: animated reveal of groom & bride names with decorative elements
  2. Date section: wedding date with animated transition
  3. Location section: venue details with map link
  4. RSVP section: form for guests to submit attendance
- Smooth scroll-triggered animations between sections
- Elegant romantic design with floral motifs
- Countdown timer to the wedding date
