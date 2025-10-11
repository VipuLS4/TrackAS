# TrackAS Design System

## Overview

The TrackAS Design System provides a comprehensive set of design tokens, components, and guidelines for building consistent, accessible, and beautiful user interfaces across the TrackAS Logistics Platform.

## Design Philosophy

- **Modern & Clean**: Contemporary design with ample white space and clean lines
- **Trustworthy**: Professional appearance that builds confidence in logistics operations
- **Accessible**: WCAG compliant with proper contrast ratios and semantic HTML
- **Responsive**: Mobile-first design that works across all device sizes
- **Scalable**: Modular components that can be easily extended and customized

## Color Palette

### Primary Colors
- **Primary Blue**: `#0B69FF` - Main brand color for CTAs and primary actions
- **Primary Dark**: `#0752CC` - Hover states and active elements
- **Accent Teal**: `#00D1B2` - Secondary actions and highlights
- **Accent Dark**: `#008F82` - Accent hover states

### Supporting Colors
- **Warm Orange**: `#FF7A59` - Warnings and special highlights
- **Background**: `#F8FAFC` - Main background color
- **Surface**: `#FFFFFF` - Card and component backgrounds
- **Text**: `#111827` - Primary text color
- **Muted**: `#6B7280` - Secondary text and labels

### Status Colors
- **Success**: `#10B981` - Success states and confirmations
- **Warning**: `#F59E0B` - Warning states and alerts
- **Danger**: `#EF4444` - Error states and destructive actions

### Usage Guidelines
```css
/* Primary actions */
.btn-primary { background-color: var(--color-primary); }

/* Secondary actions */
.btn-secondary { background-color: var(--color-accent); }

/* Text hierarchy */
.text-primary { color: var(--color-text); }
.text-secondary { color: var(--color-muted); }

/* Status indicators */
.status-success { color: var(--color-success); }
.status-warning { color: var(--color-warning); }
.status-danger { color: var(--color-danger); }
```

## Typography

### Font Families
- **Headings**: Poppins (600, 700) - Modern, bold, and professional
- **Body Text**: Inter (400, 500, 600) - Highly readable and versatile

### Font Scale
- **H1**: 48px - Main page titles and hero headings
- **H2**: 36px - Section headings and major titles
- **H3**: 28px - Subsection headings
- **H4**: 20px - Card titles and minor headings
- **Body**: 16px - Default text size
- **Small**: 12px - Labels, captions, and fine print

### Usage Guidelines
```css
/* Heading styles */
.text-h1 { font-family: var(--font-heading); font-size: var(--text-h1); font-weight: 700; }
.text-h2 { font-family: var(--font-heading); font-size: var(--text-h2); font-weight: 700; }
.text-h3 { font-family: var(--font-heading); font-size: var(--text-h3); font-weight: 600; }
.text-h4 { font-family: var(--font-heading); font-size: var(--text-h4); font-weight: 600; }

/* Body text */
.text-body { font-family: var(--font-body); font-size: var(--text-body); font-weight: 400; }
.text-small { font-family: var(--font-body); font-size: var(--text-small); font-weight: 400; }
```

## Spacing Scale

### Spacing Values
- **1**: 4px - Minimal spacing
- **2**: 8px - Small spacing
- **3**: 12px - Medium-small spacing
- **4**: 16px - Standard spacing
- **6**: 24px - Large spacing
- **8**: 32px - Extra large spacing
- **12**: 48px - Section spacing
- **16**: 64px - Major section spacing

### Usage Guidelines
```css
/* Padding examples */
.p-sm { padding: var(--space-4); }
.p-md { padding: var(--space-6); }
.p-lg { padding: var(--space-8); }

/* Margin examples */
.m-sm { margin: var(--space-4); }
.m-md { margin: var(--space-6); }
.m-lg { margin: var(--space-8); }
```

## Border Radius

### Radius Values
- **Small**: 8px - Small components and buttons
- **Medium**: 12px - Cards and larger components
- **Full**: 9999px - Pills and circular elements

### Usage Guidelines
```css
/* Component radius */
.btn { border-radius: var(--radius-sm); }
.card { border-radius: var(--radius-md); }
.pill { border-radius: var(--radius-full); }
```

## Shadows

### Shadow Types
- **Soft**: `0 8px 24px rgba(11, 105, 255, 0.06)` - Subtle elevation
- **Elevated**: `0 12px 40px rgba(2, 6, 23, 0.12)` - Strong elevation

### Usage Guidelines
```css
/* Shadow applications */
.card-soft { box-shadow: var(--shadow-soft); }
.card-elevated { box-shadow: var(--shadow-elevated); }
.hover-lift:hover { box-shadow: var(--shadow-elevated); }
```

## Gradients

### Gradient Types
- **Hero**: `linear-gradient(90deg, #0B69FF 0%, #00D1B2 100%)` - Main hero background
- **Card**: `linear-gradient(135deg, rgba(11, 105, 255, 0.05) 0%, rgba(0, 209, 178, 0.05) 100%)` - Subtle card backgrounds

### Usage Guidelines
```css
/* Gradient applications */
.hero-bg { background: var(--gradient-hero); }
.card-bg { background: var(--gradient-card); }
```

## Components

### PrimaryButton

A versatile button component with multiple variants and sizes.

#### Props
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `loading`: boolean
- `onClick`: function

#### Usage
```tsx
<PrimaryButton variant="primary" size="lg" onClick={handleClick}>
  Get Started
</PrimaryButton>

<PrimaryButton variant="secondary" size="md" disabled>
  Learn More
</PrimaryButton>
```

#### States
- **Default**: Standard appearance
- **Hover**: Slight elevation and color change
- **Active**: Pressed state with reduced opacity
- **Disabled**: Reduced opacity and no interaction
- **Loading**: Spinner animation with disabled state

### Card

A flexible container component for content grouping.

#### Props
- `hover`: boolean - Enable hover effects
- `padding`: 'sm' | 'md' | 'lg'
- `shadow`: 'soft' | 'elevated' | 'none'
- `gradient`: boolean - Apply gradient background

#### Usage
```tsx
<Card hover padding="md" shadow="soft">
  <CardHeader>
    <CardTitle level={3}>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    <PrimaryButton>Action</PrimaryButton>
  </CardFooter>
</Card>
```

#### States
- **Default**: Standard card appearance
- **Hover**: Lift animation and shadow change
- **Focus**: Outline for accessibility

### HeroSection

A full-screen hero component with gradient background and founder profile.

#### Props
- `title`: string - Main heading
- `subtitle`: string - Supporting text
- `tagline`: string - Optional tagline
- `primaryButtonText`: string
- `secondaryButtonText`: string
- `onPrimaryClick`: function
- `onSecondaryClick`: function
- `showFounder`: boolean

#### Usage
```tsx
<HeroSection
  title="TrackAS Logistics Platform"
  subtitle="Revolutionary AI-powered logistics ecosystem"
  tagline="Track smarter, deliver faster, pay safer"
  primaryButtonText="Get Started"
  secondaryButtonText="Learn More"
  onPrimaryClick={handleGetStarted}
  onSecondaryClick={handleLearnMore}
  showFounder={true}
/>
```

## Animations

### Animation Classes
- `animate-fade-in`: Fade in animation
- `animate-slide-up`: Slide up with fade
- `animate-pulse-soft`: Soft pulsing animation
- `transition-smooth`: Smooth transitions
- `hover-lift`: Lift on hover

### Usage Guidelines
```css
/* Animation applications */
.fade-in { animation: fadeIn 0.5s ease-in-out; }
.slide-up { animation: slideUp 0.3s ease-out; }
.pulse-soft { animation: pulseSoft 2s ease-in-out infinite; }
.transition-smooth { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
```

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Responsive Typography
```css
/* Mobile adjustments */
@media (max-width: 768px) {
  :root {
    --text-h1: 36px;
    --text-h2: 28px;
    --text-h3: 24px;
    --text-h4: 18px;
  }
}

/* Small mobile adjustments */
@media (max-width: 480px) {
  :root {
    --text-h1: 28px;
    --text-h2: 24px;
    --text-h3: 20px;
    --text-h4: 16px;
  }
}
```

## Accessibility

### WCAG Compliance
- **Color Contrast**: All color combinations meet WCAG AA standards
- **Focus States**: Clear focus indicators for keyboard navigation
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Alt Text**: Descriptive alt text for all images
- **ARIA Labels**: Proper ARIA labeling for interactive elements

### Focus Management
```css
.focus-ring {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## Implementation

### Setup
1. Import the theme CSS file
2. Configure Tailwind with the design tokens
3. Use the provided components
4. Follow the usage guidelines

### File Structure
```
src/
├── styles/
│   └── theme.css
├── components/
│   └── ui/
│       ├── PrimaryButton.tsx
│       ├── Card.tsx
│       └── HeroSection.tsx
└── pages/
    └── HomePage.tsx
```

### Tailwind Configuration
The design system extends Tailwind CSS with custom tokens for colors, typography, spacing, and other design elements.

## Best Practices

### Do's
- Use semantic HTML elements
- Maintain consistent spacing using the scale
- Apply hover states for interactive elements
- Use the provided color palette consistently
- Follow the typography hierarchy
- Implement proper focus states

### Don'ts
- Don't use arbitrary color values
- Don't skip heading hierarchy
- Don't forget hover and focus states
- Don't use inline styles for design tokens
- Don't ignore responsive design
- Don't skip accessibility considerations

## Examples

### Complete Page Layout
See `HomePage.tsx` for a complete example of how to use all components together to create a cohesive page layout.

### Component Combinations
```tsx
// Feature card with button
<Card hover className="text-center">
  <div className="flex justify-center mb-4">
    <Truck className="w-8 h-8 text-primary" />
  </div>
  <CardTitle level={4} className="mb-2">Smart Fleet Management</CardTitle>
  <CardContent className="mb-4">
    AI-powered vehicle routing and optimization
  </CardContent>
  <PrimaryButton variant="primary" size="sm">
    Learn More
  </PrimaryButton>
</Card>
```

## Updates and Maintenance

The design system is versioned and maintained to ensure consistency across the platform. When making changes:

1. Update the design tokens in `theme.css`
2. Update the Tailwind configuration
3. Update component implementations
4. Update this documentation
5. Test across all breakpoints and devices

## Support

For questions about the design system or to request new components, please contact the design team or create an issue in the project repository.
