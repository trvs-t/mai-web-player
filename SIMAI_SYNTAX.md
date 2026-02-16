# Simai Syntax Guide

This document describes the **simai** notation format used for maimai chart data. Simai is a text-based format that defines when and where notes appear in the game.

## Table of Contents

- [Basic Structure](#basic-structure)
- [Button Layout](#button-layout)
- [Timing and BPM](#timing-and-bpm)
- [TAP Notes](#tap-notes)
- [HOLD Notes](#hold-notes)
- [SLIDE Notes](#slide-notes)
- [TOUCH Notes](#touch-notes)
- [EACH (Simultaneous Notes)](#each-simultaneous-notes)
- [Special Notations](#special-notations)

## Basic Structure

A simai chart is a comma-separated sequence of note definitions. Each comma represents a time interval.

```simai
1,2,3,4,5,6,7,8,E
```

- **Commas (`,`)** - Separate notes in time
- **End marker (`E`)** - Signals the end of the chart

### Example: Simple Sequential Taps

```simai
(120){4}
1,2,3,4,5,6,7,8,E
```

This creates 8 taps at quarter-note intervals at 120 BPM.

## Button Layout

Maimai has 8 outer buttons arranged clockwise:

```
    ⑧ ①
  ⑦     ②
  ⑥     ③
    ⑤ ④
```

- Button **1** is at 1 o'clock position
- Numbers increase clockwise
- **Center** is used for some slide types

## Timing and BPM

### Setting BPM

Use `(BPM)` to set the tempo:

```simai
(120)     # Set BPM to 120
(174.5)   # Decimal BPM supported
```

### Setting Note Division

Use `{division}` to set note spacing:

```simai
{4}       # Quarter notes (default)
{8}       # Eighth notes
{16}      # Sixteenth notes
{12}      # Triplet feel
```

### Combined Timing Syntax

BPM and division are often combined:

```simai
(120){4}   # 120 BPM, quarter notes
(174){16}  # 174 BPM, sixteenth notes
```

### Absolute Time

For non-musical timing, use seconds:

```simai
{#0.5}     # Each comma = 0.5 seconds
```

### Example: Changing Timing Mid-Chart

```simai
(120){4}   # Start at 120 BPM, quarter notes
1,2,3,4,   # Four quarter-note taps
(140){8}   # Change to 140 BPM, eighth notes
1,2,3,4,5,6,7,8,E  # Eight eighth-note taps
```

## TAP Notes

Basic tap notes are defined by their button number.

### Simple TAP

```simai
1,      # TAP on button 1
5,      # TAP on button 5
```

### BREAK TAP

Add `b` for BREAK variant (more points, different visual):

```simai
1b,     # BREAK TAP on button 1
5b,     # BREAK TAP on button 5
```

### EX TAP

Add `x` for EX variant (guarantees CRITICAL PERFECT):

```simai
1x,     # EX TAP on button 1
5bx,    # EX BREAK TAP
```

### Star-shaped TAP (Slide Start)

Add `$` to make a star-shaped TAP (usually automatic with slides):

```simai
1$,     # Star TAP on button 1
1$$,    # Rotating star TAP
```

### Prevent Star Conversion

Use `@` to keep a regular TAP even when it's a slide start:

```simai
1@-5[4:1],   # Regular TAP with slide (not star-shaped)
```

## HOLD Notes

HOLD notes require the player to hold the button for a duration.

### Basic HOLD Syntax

```simai
BUTTONh[BEATS:COUNT],
```

Where:
- `BUTTON` - Button number (1-8)
- `h` - HOLD indicator
- `[BEATS:COUNT]` - Duration (e.g., `[4:1]` = 1 quarter note)

### Examples

```simai
1h[4:1],     # HOLD button 1 for 1 quarter note
5h[2:1],     # HOLD button 5 for 1 half note
3h[8:3],     # HOLD button 3 for 3 eighth notes
```

### HOLD with BPM Override

```simai
4h[150#2:1], # HOLD at BPM 150 (overrides current BPM)
```

### HOLD with Absolute Time

```simai
4h[#5.0],    # HOLD for exactly 5 seconds
```

### BREAK HOLD

Add `b` for BREAK variant:

```simai
5hb[2:1],    # BREAK HOLD
5bh[2:1],    # Same (order doesn't matter)
```

### EX HOLD

Add `x` for EX variant:

```simai
3hx[4:1],    # EX HOLD
```

### Pseudo-TAP HOLD

Omit duration for a very short HOLD (looks like a TAP):

```simai
3h,          # Pseudo-TAP (very short HOLD)
```

## SLIDE Notes

SLIDE notes have a star-shaped start point and follow a path around the ring.

### Basic SLIDE Syntax

```simai
START-END[BEATS:COUNT],
```

Where:
- `START` - Starting button (1-8)
- `-` - Slide type symbol
- `END` - Ending button (1-8)
- `[BEATS:COUNT]` - Duration

### SLIDE Types

#### 1. Straight (`-`)

Direct line from start to end:

```simai
1-5[4:1],    # Straight from 1 to 5
```

#### 2. Circle Clockwise (`>`)

Travel clockwise around the outer ring:

```simai
1>5[4:1],    # Circle CW from 1 to 5
1>4[8:3],    # Circle CW from 1 to 4
```

#### 3. Circle Counter-Clockwise (`<`)

Travel counter-clockwise:

```simai
1<5[4:1],    # Circle CCW from 1 to 5
8<3[8:3],    # Circle CCW from 8 to 3
```

#### 4. Auto-Direction Circle (`^`)

Automatically chooses shortest direction:

```simai
1^5[4:1],    # Circle via shortest path
```

#### 5. U-Shape Clockwise (`q`)

U-shaped curve, clockwise around center:

```simai
1q5[4:1],    # U-shape CW from 1 to 5
```

#### 6. U-Shape Counter-Clockwise (`p`)

U-shaped curve, counter-clockwise:

```simai
1p5[4:1],    # U-shape CCW from 1 to 5
```

#### 7. CUP Clockwise (`qq`)

Large curve going around the outside:

```simai
1qq5[4:1],   # CUP CW from 1 to 5
```

#### 8. CUP Counter-Clockwise (`pp`)

```simai
1pp5[4:1],   # CUP CCW from 1 to 5
```

#### 9. Thunder Clockwise (`z`)

Lightning bolt pattern:

```simai
1z5[4:1],    # Thunder CW
```

#### 10. Thunder Counter-Clockwise (`s`)

```simai
1s5[4:1],    # Thunder CCW
```

#### 11. V-Shape (`v`)

Via the center:

```simai
1v5[4:1],    # V-shape from 1 to 5 via center
```

#### 12. L-Shape (`V`)

With a midpoint button:

```simai
1V35[4:1],   # L-shape: 1 -> 3 -> 5
2V68[8:3],   # L-shape: 2 -> 6 -> 8
```

Format: `STARTVMIDEND[duration]`

### SLIDE Durations

Duration notation `[BEATS:COUNT]`:

```simai
[4:1]    # 1 quarter note
[8:3]    # 3 eighth notes
[2:1]    # 1 half note
[16:8]   # 8 sixteenth notes
```

### SLIDE Timing Variations

#### With Wait Time Override

```simai
1-5[3##4:1],     # 3 second wait, then slide
1-5[3##2.0],     # 3 second wait, 2 second slide
```

#### With BPM Override

```simai
1-5[160#4:1],    # Use BPM 160 for this slide
```

#### With Both

```simai
1-5[3##160#4:1], # 3s wait, BPM 160 slide
```

### BREAK SLIDE

Add `b` after the closing bracket:

```simai
1-5[4:1]b,       # BREAK slide
```

### Same-Origin SLIDE (Multi-Slide)

Multiple slides from one star:

```simai
1-5[4:1]*-3[4:1],     # Two slides from button 1
1>5[8:3]*<3[8:3],     # CW and CCW from button 1
```

Use `*` to separate slides with the same origin.

### Connected SLIDE (Chains)

Chain multiple slides into one continuous path:

```simai
1-5q3[4:1],          # 1->5 straight, then 5->3 U-shape
1-4>6[4:1],          # 1->4 straight, then 4->6 circle
```

Format: Connect segments without `*`. Duration at the end applies to entire chain.

#### Individual Durations for Chains

```simai
1-4[2:1]q5[2:1]-3[4:1],  # Each segment has its own duration
```

### Star Visibility Modifiers

#### Fade-in Only (`?`)

```simai
1?-5[4:1],       # Star fades in, no star-shaped TAP
```

#### No Star At All (`!`)

```simai
1!-5[4:1],       # Star appears only when sliding starts
```

## TOUCH Notes

> **Note:** TOUCH notes are **not implemented** in this visualizer. Documented for completeness.

maimai でらっくす added touch sensors on the screen.

### Sensor Layout

```
        A1 A2
      B1     B2
    C1   C   C2
      D1     D2
        E1 E2
```

- **A, B, C, D, E** - Sensor groups
- **C** - Center (single sensor)
- **A, B, D, E** - 8 sensors each (clockwise)

### TOUCH Syntax

```simai
A1,     # TOUCH on A1 sensor
D4,     # TOUCH on D4 sensor
C,      # TOUCH on center
```

### TOUCH HOLD

```simai
Ch[4:1],     # TOUCH HOLD on center
A1h[2:1],    # TOUCH HOLD on A1
```

### Firework Effect

Add `f` for firework visual effect:

```simai
B7f,        # TOUCH with firework
Chf[4:1],   # TOUCH HOLD with firework
```

## EACH (Simultaneous Notes)

EACH notes occur at exactly the same time and are colored yellow.

### Basic EACH Syntax

Separate notes with `/`:

```simai
1/5,        # TAP on 1 and 5 simultaneously
1h[4:1]/5h[4:1],  # HOLD on 1 and 5 simultaneously
```

### Multiple Notes

```simai
1/3/5/7,    # Four simultaneous TAPS
1-5[4:1]/2-6[4:1],  # Two simultaneous slides
```

### Shorthand for TAP EACH

Two simultaneous TAPS can omit the `/`:

```simai
15,         # Same as 1/5,
58,         # Same as 5/8,
```

> **Note:** This only works for two TAPS. Three or more, or any HOLD/SLIDE requires `/`.

### Slide Ordering in EACH

Slides are rendered in the order written:

```simai
1-5[4:1]/2-6[4:1],  # 1-5 appears on top of 2-6
```

## Special Notations

### Pseudo-EACH

Notes that are almost simultaneous but slightly offset:

```simai
1`2,        # TAP 2 is 0.001s after TAP 1
1`2`3/4,    # TAP 2 delayed, then 3/4 EACH
```

Use backtick (`` ` ``) for sub-millisecond delays.

### Rest

Empty commas for timing gaps:

```simai
1,,,,5,     # TAP 1, wait 3 beats, TAP 5
```

### Comments and Whitespace

Whitespace and newlines are ignored:

```simai
(120){4}
1, 2,  3,

4, 5,
E
```

## Complete Example

```simai
# Simple maimai chart example
(130){4}

# Introduction - sequential taps
1,2,3,4,5,6,7,8,

# EACH pairs
1/5,2/6,3/7,4/8,

# Some holds
1h[2:1],3h[2:1],

# Circle slides
1>5[4:1],2<6[4:1],

# U-shape slides
3p7[4:1],4q8[4:1],

# Connected slides
1-5q3[8:3],

# Same-origin slides
2-6[4:1]*-8[4:1],

# Finale with all 8
1/2/3/4/5/6/7/8,

E
```

## Quick Reference Table

| Symbol | Meaning | Example |
|--------|---------|---------|
| `,` | Note separator | `1,2,3,` |
| `E` | End of chart | `...,E` |
| `(BPM)` | Set BPM | `(120)` |
| `{N}` | Note division | `{4}` |
| `b` | BREAK modifier | `1b,` |
| `x` | EX modifier | `1x,` |
| `h` | HOLD indicator | `1h[4:1],` |
| `/` | EACH separator | `1/5,` |
| `*` | Same-origin slide | `1-5*<3` |
| `-` | Straight slide | `1-5[4:1]` |
| `>` | Circle clockwise | `1>5[4:1]` |
| `<` | Circle counter-CW | `1<5[4:1]` |
| `^` | Auto circle | `1^5[4:1]` |
| `p` | U-shape CCW | `1p5[4:1]` |
| `q` | U-shape CW | `1q5[4:1]` |
| `pp` | CUP CCW | `1pp5[4:1]` |
| `qq` | CUP CW | `1qq5[4:1]` |
| `s` | Thunder CCW | `1s5[4:1]` |
| `z` | Thunder CW | `1z5[4:1]` |
| `v` | V-shape | `1v5[4:1]` |
| `V` | L-shape | `1V35[4:1]` |
| `[N:M]` | Duration | `[4:1]`, `[8:3]` |
| `?` | Fade-in star | `1?-5[4:1]` |
| `!` | No star | `1!-5[4:1]` |
| `$` | Star TAP | `1$` |
| `@` | No star conversion | `1@-5[4:1]` |
| `` ` `` | Pseudo-EACH delay | ``1`2`` |

## References

- [Official Simai Wiki (Japanese)](https://w.atwiki.jp/simai/pages/1002.html)
- [Simai Exhibition](https://w.atwiki.jp/simai/pages/270.html)

## Credits

Simai notation was created by **Celeca** in 2013 for the maimai simulator "simai".
