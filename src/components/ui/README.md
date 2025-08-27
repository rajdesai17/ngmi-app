# UI Components and Design System

This directory contains the core UI components and design system for the mobile UI revamp.

## Components

### ScreenContainer
A wrapper component that provides:
- Gradient backgrounds based on screen type (home, stats, profile)
- SafeAreaView handling for mobile devices
- Consistent padding and layout structure
- StatusBar configuration

**Usage:**
```tsx
import { ScreenContainer } from './components/ui'

<ScreenContainer gradient="home">
  {/* Your screen content */}
</ScreenContainer>
```

### Card
A flexible card component with:
- Three variants: primary, secondary, accent
- Optional blur effects
- Rounded corners and shadows
- Press handling for interactive cards

**Usage:**
```tsx
import { Card } from './components/ui'

<Card variant="primary" blur={true} onPress={() => console.log('pressed')}>
  <Text>Card content</Text>
</Card>
```

## Design Tokens

### Color Palette
- **Gradients**: Screen-specific gradient colors (home: purple-pink, stats: blue-cyan, profile: green-teal)
- **Accent Colors**: Success, warning, danger, info colors
- **Text Colors**: Primary, secondary, muted, accent text colors
- **Card Colors**: Background, border, and shadow colors with transparency

### Typography Scale
- Hero: 32px Bold (Screen titles)
- Title: 24px Bold (Section headers)  
- Subtitle: 18px SemiBold (Card titles)
- Body: 16px Regular (Main content)
- Caption: 14px Medium (Metadata)
- Small: 12px Regular (Timestamps)

## Requirements Addressed

This implementation addresses the following requirements from the mobile UI revamp spec:

- **Requirement 7.1**: Vibrant gradient backgrounds for modern mobile app design
- **Requirement 7.3**: Engaging visual elements with blur effects, rounded corners, and shadows
- **Requirement 5.1**: SafeAreaView components to avoid notch and status bar overlaps

## Files

- `colors.ts` - Color palette constants and design tokens
- `ScreenContainer.tsx` - Main screen wrapper component
- `Card.tsx` - Flexible card component with variants
- `types.ts` - TypeScript type definitions
- `index.ts` - Main export file for easy importing
- `demo.tsx` - Demo component showing all components in action
- `ComponentTest.tsx` - Test component for development verification

## Next Steps

These components provide the foundation for implementing the remaining tasks in the mobile UI revamp:
1. Bottom tab navigation structure
2. Home screen with goals and roast display
3. Stats screen with progress visualization
4. Profile screen for user management