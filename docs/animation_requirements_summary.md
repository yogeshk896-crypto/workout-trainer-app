# Animation Assets Requirements Summary

**Generated:** April 30, 2026  
**Phase:** 1.6 — Animation Asset Manifest & Production Checklist  
**Status:** ✅ Asset Specification Complete — Ready for Production

---

## Executive Summary

This document specifies all animation assets required to ship the offline workout trainer app with complete visual guidance for all 76 exercises.

**Production Scope:**
- 75 Lottie animations (.json vector format)
- 3 MP4 fallback videos (.mp4)
- 76 exercise thumbnails (.jpg, 400×300px)
- Total estimated footprint: ~255MB (acceptable for mobile app bundling)

---

## Asset Formats & Standards

### Primary Format: Lottie Animations

**Why Lottie?**
- Vector-based (scalable, no pixelation at any screen size)
- Lightweight JSON files (30–100KB per animation)
- Works offline with no external dependencies
- Smooth 60fps performance on mobile
- Professional motion design possible

**Technical Specs:**
- Resolution: 1920×1080px (renders to device width)
- Frame rate: 60fps
- Duration: 8–12 seconds (isometric holds shorter)
- Loop: Yes (continuous)
- Color palette: Consistent with app theme (neutral grays + accent color)

### Secondary Format: MP4 Fallback

**Why MP4?**
- Lottie too complex for some movements (Turkish get-up, burpees, inchworm)
- Real-person video shows practical form
- Backup in case Lottie rendering issues

**Technical Specs:**
- Resolution: 1080×1920px (vertical, mobile-first)
- Frame rate: 30fps
- Duration: 10–15 seconds (loop-friendly)
- Codec: H.264 (universal support)
- File size: Max 50MB per video
- Audio: None (silent)

### Thumbnail Format: JPG Images

**Why Thumbnails?**
- Exercise list quick preview
- Faster loading than full animations
- UI polish (professional appearance)

**Technical Specs:**
- Resolution: 400×300px
- Format: JPG (compressed)
- File size: 30–80KB per image
- Background: White or light gray
- Subject: Start position (neutral stance)
- Quality: Clear, professional photography or illustration

---

## Complete Asset Inventory

### By Equipment Category

#### Bodyweight (36 exercises)

| Exercise | Lottie | MP4 | Thumbnail | Views | Duration |
|----------|--------|-----|-----------|-------|----------|
| incline_pushup | ✅ | ✅ | ✅ | front, side | 12s |
| pushup | ✅ | ✅ | ✅ | front, side | 12s |
| wide_pushup | ✅ | ✅ | ✅ | front, side | 12s |
| decline_pushup | ✅ | ✅ | ✅ | front, side | 12s |
| diamond_pushup | ✅ | ✅ | ✅ | front, side | 12s |
| wall_sit | ✅ | ✅ | ✅ | front, side | 8s |
| bodyweight_squat | ✅ | ✅ | ✅ | front, side | 12s |
| sumo_squat | ✅ | ✅ | ✅ | front, side | 12s |
| reverse_lunge | ✅ | ✅ | ✅ | front, side | 12s |
| forward_lunge | ✅ | ✅ | ✅ | front, side | 12s |
| bulgarian_split_squat | ✅ | ✅ | ✅ | front, side | 12s |
| glute_bridge | ✅ | ✅ | ✅ | side | 12s |
| single_leg_glute_bridge | ✅ | ✅ | ✅ | side | 12s |
| hip_thrust_bw | ✅ | ✅ | ✅ | side | 12s |
| good_morning_bw | ✅ | ✅ | ✅ | side | 12s |
| superman | ✅ | ✅ | ✅ | side | 12s |
| dead_bug | ✅ | ✅ | ✅ | top, side | 12s |
| bird_dog | ✅ | ✅ | ✅ | side | 12s |
| plank | ✅ | ✅ | ✅ | side, top | 8s |
| side_plank | ✅ | ✅ | ✅ | side | 8s |
| plank_shoulder_tap | ✅ | ✅ | ✅ | side, top | 12s |
| crunch | ✅ | ✅ | ✅ | side | 12s |
| bicycle_crunch | ✅ | ✅ | ✅ | top | 12s |
| leg_raise | ✅ | ✅ | ✅ | side | 12s |
| russian_twist | ✅ | ✅ | ✅ | top | 12s |
| mountain_climbers | ✅ | ✅ | ✅ | side | 12s |
| hollow_body_hold | ✅ | ✅ | ✅ | side | 8s |
| v_up | ✅ | ✅ | ✅ | side | 12s |
| flutter_kicks | ✅ | ✅ | ✅ | side | 12s |
| jumping_jacks | ✅ | ✅ | ✅ | front | 12s |
| high_knees | ✅ | ✅ | ✅ | side | 12s |
| butt_kicks | ✅ | ✅ | ✅ | side | 12s |
| burpees | ❌ | ✅ | ✅ | side | 12s |
| inchworm | ❌ | ✅ | ✅ | side | 12s |
| hip_flexor_stretch | ✅ | ✅ | ✅ | side | 8s |
| cat_cow | ✅ | ✅ | ✅ | side | 12s |

**Bodyweight Summary:**
- Lottie files: 34
- MP4 files: 2 (burpees, inchworm)
- Thumbnails: 36
- Total assets: 72

---

#### Dumbbell (20 exercises)

| Exercise | Lottie | MP4 | Thumbnail | Views | Duration |
|----------|--------|-----|-----------|-------|----------|
| dumbbell_chest_press | ✅ | ✅ | ✅ | front | 12s |
| dumbbell_chest_fly | ✅ | ✅ | ✅ | front | 12s |
| dumbbell_shoulder_press | ✅ | ✅ | ✅ | front, side | 12s |
| lateral_raise | ✅ | ✅ | ✅ | front | 12s |
| front_raise | ✅ | ✅ | ✅ | front | 12s |
| dumbbell_row | ✅ | ✅ | ✅ | side | 12s |
| renegade_row | ✅ | ✅ | ✅ | side, top | 12s |
| goblet_squat | ✅ | ✅ | ✅ | front, side | 12s |
| dumbbell_rdl | ✅ | ✅ | ✅ | front, side | 12s |
| dumbbell_lunge | ✅ | ✅ | ✅ | front, side | 12s |
| dumbbell_sumo_squat | ✅ | ✅ | ✅ | front, side | 12s |
| dumbbell_stepup | ✅ | ✅ | ✅ | side | 12s |
| farmer_carries | ✅ | ✅ | ✅ | side | 12s |
| dumbbell_swing | ✅ | ✅ | ✅ | side | 12s |
| bicep_curl | ✅ | ✅ | ✅ | front, side | 12s |
| hammer_curl | ✅ | ✅ | ✅ | front, side | 12s |
| concentration_curl | ✅ | ✅ | ✅ | front | 12s |
| overhead_tricep_extension | ✅ | ✅ | ✅ | front, side | 12s |
| tricep_kickback | ✅ | ✅ | ✅ | side | 12s |
| arnold_press | ✅ | ✅ | ✅ | front | 12s |

**Dumbbell Summary:**
- Lottie files: 20
- MP4 files: 0
- Thumbnails: 20
- Total assets: 40

---

#### Resistance Bands (7 exercises)

| Exercise | Lottie | MP4 | Thumbnail | Views | Duration |
|----------|--------|-----|-----------|-------|----------|
| band_pull_apart | ✅ | ✅ | ✅ | front | 12s |
| band_face_pull | ✅ | ✅ | ✅ | front, side | 12s |
| band_bicep_curl | ✅ | ✅ | ✅ | front, side | 12s |
| band_tricep_pushdown | ✅ | ✅ | ✅ | side | 12s |
| band_squat | ✅ | ✅ | ✅ | front, side | 12s |
| band_lateral_walk | ✅ | ✅ | ✅ | side | 12s |
| band_row | ✅ | ✅ | ✅ | side | 12s |

**Band Summary:**
- Lottie files: 7
- MP4 files: 0
- Thumbnails: 7
- Total assets: 14

---

#### Pull-Up Bar (5 exercises)

| Exercise | Lottie | MP4 | Thumbnail | Views | Duration |
|----------|--------|-----|-----------|-------|----------|
| dead_hang | ✅ | ✅ | ✅ | side | 8s |
| negative_pullup | ✅ | ✅ | ✅ | side | 12s |
| pullup | ✅ | ✅ | ✅ | side | 12s |
| chinup | ✅ | ✅ | ✅ | side | 12s |
| hanging_knee_raise | ✅ | ✅ | ✅ | side | 12s |

**Pull-Up Bar Summary:**
- Lottie files: 5
- MP4 files: 0
- Thumbnails: 5
- Total assets: 10

---

#### Barbell (5 exercises)

| Exercise | Lottie | MP4 | Thumbnail | Views | Duration |
|----------|--------|-----|-----------|-------|----------|
| barbell_back_squat | ✅ | ✅ | ✅ | front, side | 12s |
| barbell_deadlift | ✅ | ✅ | ✅ | side | 12s |
| barbell_bench_press | ✅ | ✅ | ✅ | front | 12s |
| barbell_ohp | ✅ | ✅ | ✅ | front, side | 12s |
| barbell_row | ✅ | ✅ | ✅ | side | 12s |

**Barbell Summary:**
- Lottie files: 5
- MP4 files: 0
- Thumbnails: 5
- Total assets: 10

---

#### Kettlebell (4 exercises)

| Exercise | Lottie | MP4 | Thumbnail | Views | Duration |
|----------|--------|-----|-----------|-------|----------|
| kettlebell_swing | ✅ | ✅ | ✅ | side | 12s |
| kettlebell_goblet_squat | ✅ | ✅ | ✅ | front, side | 12s |
| kettlebell_turkish_getup | ❌ | ✅ | ✅ | side | 12s |
| kettlebell_single_arm_row | ✅ | ✅ | ✅ | side | 12s |

**Kettlebell Summary:**
- Lottie files: 3
- MP4 files: 1 (turkish_getup)
- Thumbnails: 4
- Total assets: 8

---

## Production Brief by Asset Type

### Lottie Animations (75 total)

**Design Requirements:**
- Stick figure or stylized human form
- Clear joint articulation (joints highlighted)
- Neutral color palette (dark gray on light or vice versa)
- Accent color for primary movers (e.g., red for working muscle)
- Smooth easing curves (ease-in-out for dynamic moves, linear for static holds)
- Labeled muscle groups optional (can add post-MVP)

**Performance Notes:**
- File size target: 30–100KB per animation
- Loop seamlessly (frame 0 = frame final frame)
- No text overlays required in animation (UI handles cues)

**Delivery Format:**
- .lottie (JSON) files
- Zip file with organized folder structure:
  - `/animations/bodyweight/`
  - `/animations/dumbbell/`
  - `/animations/bands/`
  - `/animations/pullup_bar/`
  - `/animations/barbell/`
  - `/animations/kettlebell/`

---

### MP4 Videos (3 total)

**Only these 3 need video:**
1. **burpees** — Too complex for Lottie (6-phase movement)
2. **inchworm** — Hand walks + plank transition
3. **kettlebell_turkish_getup** — Advanced skill (7 phases)

**Production Requirements:**
- Real person performing exercise (or professional actor)
- Clear lighting (studio or well-lit room)
- Side view primary (front view secondary if space allows)
- Slow motion optional (1–1.5x speed recommended)
- No background distractions (white wall or neutral background)
- Clean, professional video (1080×1920px vertical)
- 10–15 second duration with loop-friendly start/end

**Audio:**
- None required (silent)
- Optional: Upbeat background music (royalty-free)

**Delivery Format:**
- .mp4 (H.264 codec)
- Same folder structure as Lottie

---

### Thumbnails (76 total)

**Design Requirements:**
- One per exercise
- Shows start/neutral position
- Clean white or light gray background
- Person is centered, well-lit
- Professional photography or AI-generated illustration
- 400×300px (landscape)
- High contrast (easy to see at small size)

**Content:**
- Bodyweight: Person in ready stance
- Dumbbell: Person holding light dumbbells in start position
- Barbell: Person at bar, hands gripped
- Kettlebell: Person holding kettlebell at chest or side
- Bands: Person holding band, neutral position
- Pull-up bar: Person hanging or in ready position

**Delivery Format:**
- .jpg (compressed, ~30–80KB each)
- Same folder structure as animations

---

## File Size Estimates

| Asset Type | Count | Avg Size | Total |
|------------|-------|----------|-------|
| Lottie JSON | 75 | 50KB | 3.75 MB |
| MP4 Videos | 3 | 60MB | 180 MB |
| Thumbnails JPG | 76 | 0.7MB | 53 MB |
| **Total Bundle** | 154 | — | **~237 MB** |

**Compression Opportunities:**
- Video: H.265 codec could reduce to ~120MB (vs current 180MB)
- Images: Further JPG compression or WebP format
- Lottie: Gzip compression (built into app bundling)

**Target: < 300MB total** ✅ (Acceptable for app store guidelines)

---

## Production Timeline

### Phase 1: Lottie Animations (Parallel)
- **Duration:** 4–6 weeks
- **Resource:** 1 motion designer + 1 animation artist
- **Deliverable:** 75 .lottie files
- **Milestone:** Week 4 — QA & iterations

### Phase 2: MP4 Videos (After Lottie)
- **Duration:** 1–2 weeks
- **Resource:** 1 videographer + 1 editor
- **Deliverable:** 3 .mp4 files
- **Milestone:** Week 2 — Final edit

### Phase 3: Thumbnails (Parallel with Phase 1)
- **Duration:** 2–3 weeks
- **Resource:** 1 photographer/illustrator
- **Deliverable:** 76 .jpg files
- **Milestone:** Week 3 — Batch QA

**Total Timeline:** 4–6 weeks (parallel execution)

---

## QA Checklist

Before shipping, validate:

- [ ] All 75 Lottie files render correctly on iOS and Android
- [ ] All 3 MP4 files play smoothly without artifacts
- [ ] All 76 thumbnails display crisply at 400×300px
- [ ] Animations loop seamlessly (no frame jump)
- [ ] Video codec compatible with target devices (H.264 minimum)
- [ ] File sizes within budget (< 300MB total)
- [ ] Offline bundling works (no external CDN calls)
- [ ] Loading times < 500ms per asset on 4G
- [ ] All file naming matches exercise IDs (case-sensitive)
- [ ] Folder structure matches app expectations

---

## Delivery Checklist

### Asset Package Contents

---

## Sign-Off

**Animation Requirements:** ✅ COMPLETE  
**Date:** April 30, 2026  
**Status:** Ready for Production  
**Estimated Cost:** $15,000–$25,000 (depending on studio rates)  
**Recommended Studios:** Motion design agencies specializing in fitness/health apps

All 76 exercises have detailed asset specifications. Ready to brief creative team.
