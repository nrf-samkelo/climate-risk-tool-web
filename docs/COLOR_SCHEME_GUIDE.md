# Climate Index Color Scheme Guide

Based on SAEON authoritative guidance for climate anomaly visualization.

## Quick Reference

### Color Palette Types

**Diverging Palettes** (for anomalies from baseline):
- Used for all 27 climate indices
- Shows deviation from 1995-2014 baseline
- White/neutral center = no change
- Colors indicate direction and magnitude of change

## Color Schemes by Index

### 🔴 Red = BAD (Increased Risk)

**RdBu_r** (Red-White-Blue Reversed):
- `cdd` - Consecutive Dry Days (drought risk)
- `txge30` - Hot Days ≥30°C (heat stress)
- `txx` - Hottest Day (extreme heat)
- `tnx` - Hottest Night (heat stress)
- `wsdi` - Warm Spell Duration (heatwaves)
- `tx90p` - Hot Day Percentage (heat frequency)
- `tn90p` - Warm Night Percentage (heat stress)

**Interpretation**: Positive anomalies (red) = worse conditions

### 🔵 Blue = GOOD (Increased Water)

**BuRd** (Blue-White-Red):
- `cwd` - Consecutive Wet Days (water availability)
- `prcptot` - Total Precipitation (rainfall)
- `r10mm` - Heavy Rain Days (water supply)
- `r20mm` - Very Heavy Rain Days
- `r95p` - Extreme Wet Day Total
- `r95ptot` - % from Very Wet Days
- `r99p` - Extremely Wet Day Total
- `r99ptot` - % from Extreme Days
- `sdii` - Daily Intensity Index
- `rx1day` - Max 1-Day Rainfall
- `rx5day` - Max 5-Day Rainfall

**Interpretation**: Positive anomalies (blue) = more rainfall

### ❄️ Cold/Warming Indicators

**RdBu** (Red-White-Blue):
- `fd` - Frost Days (red = warming, fewer frost)
- `csdi` - Cold Spell Duration (red = warming)
- `tn10p` - Cold Night % (red = warming)
- `tx10p` - Cool Day % (red = warming)
- `tnn` - Coldest Night (red = warmer minimum)
- `txn` - Coldest Day (red = warmer maximum)

**Interpretation**: Red = warming signal, Blue = colder conditions

## JavaScript Implementation

### Using Chroma.js

```javascript
import chroma from 'chroma-js';

// Heat/Drought indices (positive = bad)
const heatScale = chroma.scale(['#2166ac', '#f7f7f7', '#b2182b']) // Blue-White-Red
  .domain([-20, 0, 20]);

// Precipitation indices (positive = good)
const precipScale = chroma.scale(['#b2182b', '#f7f7f7', '#2166ac']) // Red-White-Blue
  .domain([-100, 0, 100]);

// Cold indices (red = warming)
const coldScale = chroma.scale(['#2166ac', '#f7f7f7', '#b2182b'])
  .domain([-10, 0, 10]);
```

### Using D3

```javascript
import { scaleSequential } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';

// Heat indices (reversed)
const heatScale = scaleSequential(interpolateRdBu)
  .domain([20, -20]); // Reversed domain

// Precipitation indices
const precipScale = scaleSequential(interpolateRdBu)
  .domain([-100, 100]); // Normal domain
```

### MapLibre/Leaflet Example

```javascript
// For GeoJSON styling with MapLibre GL JS
const getColor = (value, indexCode) => {
  const heatIndices = ['cdd', 'txge30', 'txx', 'tnx', 'wsdi', 'tx90p', 'tn90p'];

  if (heatIndices.includes(indexCode)) {
    // Red-White-Blue reversed (red = bad)
    return value > 10 ? '#b2182b' :
           value > 5  ? '#ef8a62' :
           value > 1  ? '#fddbc7' :
           value > -1 ? '#f7f7f7' :
           value > -5 ? '#d1e5f0' :
           value > -10 ? '#67a9cf' : '#2166ac';
  } else {
    // Blue-White-Red (blue = good)
    return value > 50  ? '#2166ac' :
           value > 20  ? '#67a9cf' :
           value > 5   ? '#d1e5f0' :
           value > -5  ? '#f7f7f7' :
           value > -20 ? '#fddbc7' :
           value > -50 ? '#ef8a62' : '#b2182b';
  }
};
```

## API Response Format

The `/api/indices/:code` endpoint now returns:

```json
{
  "success": true,
  "data": {
    "index_code": "cdd",
    "index_name": "Consecutive Dry Days",
    "color_scheme": "RdBu_r",
    "color_palette_type": "diverging",
    "anomaly_direction": "positive_bad",
    "interpretation": "Longest drought period in a year. Red indicates more dry days (drought risk), Blue indicates fewer dry days (improved water availability)."
  }
}
```

## ColorBrewer Schemes Reference

- **RdBu**: Red (negative) → White → Blue (positive)
- **RdBu_r**: Red (positive) → White → Blue (negative) [REVERSED]
- **BuRd**: Blue (negative) → White → Red (positive)

## Risk Assessment Guide

### High Risk Indicators (Red zones):
1. **CDD** > 5 days: Increased drought frequency
2. **PRCPTOT** < -50mm: Significant rainfall decrease
3. **TXge30** > 30 days: Extreme heat exposure
4. **WSDI** > 20 days: Extended heatwave periods

### Example: Dr Beyers Naude under SSP585 far-term
```
CDD:     +8.58 days   → 🔴 RED (severe drought risk)
PRCPTOT: -44.6 mm     → 🔴 RED (major rainfall decline)
TXge30:  +75.7 days   → 🔴 RED (extreme heat danger)
WSDI:    +48.7 days   → 🔴 RED (dangerous heatwaves)
```

## Notes

- All values are **anomalies** from 1995-2014 baseline
- Positive anomaly ≠ always bad (depends on index)
- Use `anomaly_direction` field to determine color mapping
- Always show units and baseline period in legends
