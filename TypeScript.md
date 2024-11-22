# TypeScript Integration

This project has been configured with TypeScript support for better type safety and developer experience. Here's what you need to know:

## Setup Details

- TypeScript configuration is in `tsconfig.json`
- Global type declarations are in `src/types/global.d.ts`
- Shared interfaces and types are in `src/types/portfolio.ts`

## Converted Files

Core Files:

- `src/App.tsx` - Main application component
- `src/index.tsx` - Entry point
- `src/theme.ts` - Theme configuration
- `src/portfolio.ts` - Portfolio data with type definitions
- `src/reportWebVitals.ts` - Performance monitoring

Components:

- `src/components/header/Header.tsx`
- `src/components/footer/Footer.tsx`
- `src/components/socialMedia/SocialMedia.tsx`
- `src/components/softwareSkills/SoftwareSkill.tsx`
- `src/components/topButton/TopButton.tsx`
- `src/components/Loader/LoaderLogo.tsx`
- `src/components/experienceCard/ExperienceCard.tsx`
- `src/components/experienceSectionCard/ExperienceSectionCard.tsx`
- `src/components/mainProjectCard/MainProjectCard.tsx`
- `src/components/sideProjectCard/SideProjectCard.tsx`
- `src/components/projectLanguages/ProjectLanguages.tsx`

Pages and Containers:

- `src/pages/home/HomeComponent.tsx`
- `src/containers/greeting/Greeting.tsx`
- `src/containers/skills/Skills.tsx`
- `src/containers/skills/SkillSection.tsx`

## Type Definitions

Key type definitions in `src/types/portfolio.ts`:

- `Skills` - Interface for skills data structure
- `SoftwareSkill` - Interface for individual skill items
- `SkillCategory` - Interface for skill categories
- `Experience` - Interface for experience items
- `Project` - Interface for project items

## Development Guidelines

1. New components should be created with `.tsx` extension if they contain JSX, or `.ts` if they don't
2. Use TypeScript's type system to catch errors early:

   - Define interfaces for component props
   - Use type annotations for state and variables
   - Leverage TypeScript's built-in types and utility types

3. When converting existing components:

   - Start by creating interfaces for the component's props
   - Add type annotations for hooks and state
   - Convert class components to functional components with proper typing
   - Use React.FC type for functional components

4. Animation typing:
   - Use proper types for react-spring animations
   - Define interfaces for animation styles
   - Type animated components appropriately

## Best Practices

1. Always define proper types for component props
2. Use TypeScript's strict mode for better type safety
3. Avoid using `any` type unless absolutely necessary
4. Create interfaces for reusable types in `src/types/portfolio.ts`
5. Utilize type inference when possible
6. Use const assertions for static data objects
7. Leverage union types for variant handling
8. Add proper type declarations for external resources (images, etc.)

## Converting Remaining Components

To convert remaining JavaScript components to TypeScript:

1. Rename the file extension from `.js` to `.tsx` for React components
2. Import necessary types from `src/types/portfolio.ts`
3. Add proper type annotations for props and state
4. Use the TypeScript compiler to check for type errors: `npx tsc --noEmit`

## Available Scripts

- `npm start` - Starts the development server with TypeScript support
- `npm run build` - Builds the production bundle with TypeScript compilation
- `npm run test` - Runs tests with TypeScript support
- `tsc --noEmit` - Type checks the entire project without generating output files

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript React Starter](https://github.com/Microsoft/TypeScript-React-Starter)
