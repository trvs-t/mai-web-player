
## Task 4: Chart Types Validation Tests

### Patterns Learned
- Discriminated unions in TypeScript work well with runtime type guards checking the `type` property
- Chart types have clear hierarchy: Chart -> ChartItem[] -> NoteData (for notes)
- SlideType enum has 7 valid values: "CUP" | "Circle" | "U" | "L" | "Thunder" | "V" | "Straight"
- Direction is a simple union: "cw" | "ccw"
- DurationInBpm has optional bpm field - tests must handle both with/without bpm
- Chart items can be: ChartItem OR arrays of ChartItem (for EACH notation)

### Test Organization Strategy
- Grouped by type: TapChartData, HoldChartData, SlideChartData, etc.
- Separate section for union type discrimination tests
- Dedicated runtime type guards section with 10+ guard tests
- Edge cases section covering: null, undefined, partial objects, empty arrays, invalid values
- Helper function tests for all exported factory functions

### Runtime Type Guards Testing Approach
- Test valid shapes return true from guard checks
- Test invalid/partial shapes return false
- Test null/undefined handling with falsy checks
- Use typeof and Array.isArray for runtime validation
- Check for required properties before accessing nested fields

### Edge Cases Covered
- Zero and negative lane numbers (valid at type level)
- Large division values (128/64)
- Float BPM values (120.5)
- Empty items array (throws error in validateChart)
- Partial DurationInBpm objects
- Missing required fields detection
- Array vs object type distinction

### Statistics
- 53 test cases total (exceeded 20+ requirement)
- 112 expect() calls
- 100% coverage of chart.ts functions
- 12.00ms execution time
- All tests passing

### TypeScript + Bun Testing Tips
- Bun:test types not recognized by LSP but work at runtime
- Type assertions (as any) needed when testing invalid shapes
- Type narrowing with if statements validates discrimination at runtime
- Export types from chart.ts for use in test files
