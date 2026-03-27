---
name: data-visualization
description: Choose the right chart, design for clarity, and tell compelling stories with data.
---

# Data Visualization Best Practices

## Core Purpose

A good data visualization answers a specific question faster and more clearly than a table of numbers ever could. Every design decision should serve comprehension, not decoration.

---

## The Visualization Design Process

1. **Identify the question**: What decision or insight should this answer?
2. **Know the audience**: Expert analyst vs. executive vs. general public?
3. **Choose the right chart type**: Match encoding to data structure
4. **Eliminate noise**: Remove everything that doesn't serve the question
5. **Guide attention**: Use color, size, and annotation to tell the story
6. **Test comprehension**: Can someone unfamiliar read it correctly in 10 seconds?

---

## Chart Type Selection Framework

### Comparing Values
- **Bar chart**: Best for categorical comparison (always start at zero)
- **Dot plot**: Better than bar chart when many categories exist
- **Grouped bar**: Side-by-side comparison of subcategories (max 3 groups)
- **Lollipop chart**: Cleaner bar chart for many items

### Showing Change Over Time
- **Line chart**: Continuous data over time (always preferred over bar for trends)
- **Area chart**: Emphasizes cumulative volume; stack with care
- **Slope chart**: Compares start vs. end state across categories
- **Bump chart**: Ranking changes over time

### Showing Composition / Parts of a Whole
- **Stacked bar**: Composition comparison across categories
- **100% stacked bar**: Proportional comparison when absolute values mislead
- **Pie chart**: Only when showing 2–3 slices to a general audience
- **Treemap**: Nested hierarchy of proportions
- **Waffle chart**: More readable than pie for proportional stories

### Showing Distribution
- **Histogram**: Frequency distribution of a continuous variable
- **Box plot**: Distribution comparison across categories (median, quartiles, outliers)
- **Violin plot**: Richer distribution shape than box plot
- **Strip plot**: Shows individual data points (small datasets)
- **Density plot**: Smooth distribution for large datasets

### Showing Relationships / Correlation
- **Scatterplot**: Relationship between two continuous variables
- **Bubble chart**: Adds a third dimension via point size (use carefully)
- **Heatmap**: Correlation matrix or two-variable intensity
- **Connected scatterplot**: Relationship over time (experimental)

### Showing Geographic Data
- **Choropleth map**: Color-coded regions (normalize by population/area)
- **Dot density map**: Absolute counts as dots
- **Proportional symbol map**: Scaled circles over locations
- **Flow map**: Movement between locations

---

## When NOT to Use Common Chart Types

### Avoid Pie Charts When:
- More than 3–4 slices
- Slices are similar in size (impossible to compare)
- Changes over time are being shown
- Audience needs precise values

### Avoid 3D Charts Always
- 3D distorts perceived values due to perspective
- No data type requires 3D to be accurately represented
- Replace 3D pie with bar chart; 3D bar with 2D bar

### Avoid Dual-Axis Charts (Usually)
- Different scales mislead readers into seeing false relationships
- If you must use dual axis: same zero line, clear labeling, different mark types

---

## Color Accessibility

### The Accessibility Baseline
8% of men and 0.5% of women have some form of color vision deficiency. Design for them.

### Color-Safe Palettes

**Sequential (low-to-high)**:
- Light to dark single hue: reliable, intuitive
- Viridis, Magma, Cividis: perceptually uniform, colorblind-safe

**Diverging (negative-neutral-positive)**:
- Two hues meeting at a neutral midpoint
- Blue-White-Red is common but Blue-White-Orange is more colorblind-safe
- Ensure midpoint is visually neutral (white, light gray)

**Categorical (distinct groups)**:
- Maximum 7 distinct categories — beyond that, use texture or labels
- Colorblind-safe categorical: ColorBrewer qualitative palettes
- Okabe-Ito palette: scientifically validated colorblind-safe set

### Color Rules
- Never use color as the only encoding — pair with shape, pattern, or label
- Saturated colors draw attention — use intentionally for highlighted values
- Gray is your most powerful neutral — use for context data
- Background: white or very light gray for print; dark for screen dashboards

### Contrast Requirements
- Data labels on colored backgrounds: minimum 4.5:1 contrast ratio (WCAG AA)
- Large text on backgrounds: minimum 3:1
- Test with Stark, Color Oracle, or Sim Daltonism

---

## Labeling and Annotation

### Direct Labeling vs. Legend
- Direct labels on data are almost always better than a legend
- Legends force the reader's eye to travel back and forth
- Exception: when many series overlap and labels would clutter

### Annotation Hierarchy
1. **Title**: Tells the story or asks the question ("Revenue grew 40% after redesign")
2. **Subtitle**: Provides context (time range, data source, units)
3. **Axis labels**: Minimal — label what isn't obvious
4. **Data labels**: For key values, not every point
5. **Callout annotations**: Arrow + note for key events or turning points
6. **Source line**: Always credit the data source

### Writing Better Titles
- Action title: "Sales peaked in Q3 despite low inventory" (tells insight)
- Topic title: "Quarterly Sales 2023–2024" (neutral, describes data)
- Use action titles for presentations; topic titles for dashboards readers explore

### Numbers in Visualizations
- Round to fewest significant figures needed (1.2M not 1,247,832)
- Use K/M/B suffixes on axes
- Align numbers right in tables; center in chart labels
- Currency: include symbol once (on axis), not on every label

---

## Reducing Noise: The Data-Ink Ratio

Remove everything that doesn't carry information:

### What to Eliminate
- **Chartjunk**: Decorative graphics, clip art, background images
- **Grid lines**: Use light gray or eliminate entirely for simple charts
- **Tick marks**: Often unnecessary when grid lines exist
- **Borders/boxes**: Around charts, around legends — usually unnecessary
- **Redundant axis labels**: If labeled directly, remove axis
- **3D effects, shadows, gradients**: Never informative

### What to Keep
- The data marks (bars, lines, points)
- Axis labels when needed
- Title and subtitle
- Source and notes

### Minimal Chart Aesthetic Checklist
- [ ] No background color (or very light neutral)
- [ ] No border around chart area
- [ ] Horizontal grid lines only (for bar/line charts) and light gray
- [ ] Tick marks removed when grid lines present
- [ ] Legend replaced with direct labels where possible
- [ ] Y-axis label replaced with contextual title where possible

---

## Storytelling with Data

### The Story Arc for Data Narratives
1. **Context**: What was happening before this data?
2. **Conflict**: What changed, or what's the problem?
3. **Resolution**: What the data reveals or recommends

### Visual Hierarchy for Presentations
- One key message per slide or chart
- Highlight the important data point (brighter color, larger, annotated)
- Gray out supporting/context data
- Let the eye go where the story is

### Before/After Comparisons
- Show data states side-by-side at same scale
- Use consistent colors for same entities across slides
- Never change scales mid-presentation without explicit notation

---

## Common Pitfalls

### Truncated Y-Axis
- Bar charts MUST start at zero — truncating exaggerates differences visually
- Line charts and scatter plots CAN start at non-zero to show variation
- Always check: does the visual impression match the actual magnitude?

### Misleading Area vs. Length
- Area encoding is less accurately perceived than length
- Bubble charts: encode as area (πr²), not radius — most software does this wrong
- Never encode negative values as bubbles (area can't be negative visually)

### Correlation vs. Causation
- A scatterplot showing correlation does not imply cause
- Add explicit annotation when causality is or is not implied
- Spurious correlations mislead — filter for meaningful relationships

### Overplotting in Scatterplots
- Reduce opacity (0.2–0.4 alpha) when points overlap
- Jitter categorical x-values slightly
- Use 2D density heatmap for very large datasets

---

## Final Checklist

- [ ] Chart type matches the data relationship being shown
- [ ] Y-axis starts at zero (for bar charts)
- [ ] Color palette is colorblind-safe
- [ ] Color is not the only differentiating encoding
- [ ] Direct labels used instead of legend where possible
- [ ] Title communicates the insight, not just the topic
- [ ] Source credited
- [ ] Chartjunk removed (no 3D, no decorative elements)
- [ ] Readable at intended display size (print or screen)
- [ ] Tested for comprehension with someone unfamiliar with the data
