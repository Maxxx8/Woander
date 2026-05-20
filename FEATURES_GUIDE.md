# Enhanced Features Guide

This guide explains the new dynamic media library, expanded quotes system, and advanced animations implemented in your travel web app.

## Overview

The app now includes:
- **Dynamic Background Media**: Integration with Pexels and Unsplash APIs for stunning images and videos
- **Expanded Quotes Library**: 65+ inspirational travel quotes with categories and moods
- **Advanced Animations**: Scroll-triggered reveals, parallax effects, and cinematic transitions
- **Database-Backed System**: All media and quotes stored in Supabase for performance

## Setting Up API Keys

To enable the full media library functionality, add these environment variables to your `.env` file:

```env
VITE_PEXELS_API_KEY=your_pexels_api_key_here
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

### Getting API Keys:

1. **Pexels API Key** (Free):
   - Visit: https://www.pexels.com/api/
   - Sign up for a free account
   - Get your API key from the dashboard
   - Free tier: 200 requests/hour, 20,000 requests/month

2. **Unsplash Access Key** (Free):
   - Visit: https://unsplash.com/developers
   - Register your application
   - Get your Access Key from the dashboard
   - Free tier: 50 requests/hour

## Features

### 1. Dynamic Background Media

The `BackgroundMedia` component supports:
- **Images** with Ken Burns effect (slow zoom/pan)
- **Videos** with autoplay and loop
- **Lazy loading** with thumbnail placeholders
- **Mobile optimization** (falls back to images on mobile)
- **Smooth transitions** between media

Usage:
```tsx
<BackgroundMedia
  url={mediaUrl}
  type="image"
  kenBurns={true}
  overlay={true}
  overlayOpacity={0.5}
/>
```

### 2. Enhanced Quote Section

Features:
- **Carousel navigation** with previous/next buttons
- **Auto-rotation** configurable interval
- **Favorite system** for logged-in users
- **Share functionality** via Web Share API or clipboard
- **Glassmorphism design** with backdrop blur
- **Category badges** and mood indicators
- **Paired with relevant media** from the library

The `EnhancedQuoteSection` component automatically:
- Fetches quotes from the database
- Pairs them with appropriate background media
- Tracks usage statistics
- Supports user favorites

### 3. Scroll-Triggered Animations

The `ScrollReveal` component provides:
- Multiple animation types: fade-in, fade-in-up, slide-in, scale-in, etc.
- Configurable delays for stagger effects
- Threshold control for when animations trigger
- "Trigger once" option to prevent re-animation

Usage:
```tsx
<ScrollReveal animation="fade-in-up" delay={200}>
  <YourContent />
</ScrollReveal>
```

### 4. Parallax Effects

The `ParallaxSection` component creates:
- Depth and motion on scroll
- Configurable speed multiplier
- Smooth performance with requestAnimationFrame

Usage:
```tsx
<ParallaxSection speed={0.5}>
  <YourContent />
</ParallaxSection>
```

### 5. Advanced CSS Animations

Available animation classes:
- `animate-fade-in-up`, `animate-fade-in-down`
- `animate-fade-in-left`, `animate-fade-in-right`
- `animate-scale-in`, `animate-zoom-in`
- `animate-rotate-in`, `animate-slide-in-up`
- `animate-float`, `animate-pulse`
- `animate-ken-burns` (for images)
- `animate-gradient-shift` (for text)
- `animate-shimmer` (loading effect)

Delay classes:
- `animation-delay-100` through `animation-delay-800`

Utility classes:
- `glassmorphism`, `glassmorphism-dark`
- `hover-lift`, `hover-glow`
- `smooth-transition`, `smooth-transition-slow`
- `text-gradient`, `text-gradient-animate`

## Database Schema

### Tables Created:

1. **media_library**: Stores images and videos from APIs
   - Tracks usage count, ratings, photographer attribution
   - Categorized by type (mountains, coastal, urban, etc.)
   - Supports both images and videos

2. **quotes_library**: Expanded quote collection
   - Categories: travel, adventure, wanderlust, courage, etc.
   - Moods: inspiring, reflective, bold, peaceful, etc.
   - Linked to background media
   - Tracks usage and favorites

3. **user_favorite_quotes**: User's saved quotes
   - Links users to their favorite quotes
   - Secured with Row Level Security

4. **media_cache**: API response caching
   - Reduces external API calls
   - Improves performance
   - Automatic expiration

## Initialization

To populate the database with quotes (one-time setup):

```typescript
import { initializeAppData } from './utils/initializeData';

// Run once to seed the database
await initializeAppData();
```

To fetch and cache media from APIs (optional, can be done periodically):

```typescript
import { fetchMediaLibrary } from './utils/initializeData';

// Fetches media from Pexels and Unsplash
await fetchMediaLibrary();
```

## Services

### MediaService

Methods:
- `getRandomMedia(type?, category?, limit)` - Get random media
- `getMediaByCategory(category, limit)` - Get media by category
- `incrementMediaUsage(mediaId)` - Track media usage
- `fetchAndCacheMedia(keywords, includeVideos)` - Fetch from APIs

### QuotesService

Methods:
- `getRandomQuotes(count, category?)` - Get random quotes
- `getQuotesByCategory(category, limit)` - Filter by category
- `getQuotesByMood(mood, limit)` - Filter by mood
- `searchQuotes(searchTerm, limit)` - Search quotes
- `addFavoriteQuote(userId, quoteId)` - Add to favorites
- `removeFavoriteQuote(userId, quoteId)` - Remove from favorites
- `getUserFavoriteQuotes(userId)` - Get user's favorites
- `incrementQuoteUsage(quoteId)` - Track usage

## Performance Optimizations

1. **Lazy Loading**: Images and videos load only when needed
2. **Thumbnail Placeholders**: Fast initial load with blur-up technique
3. **Database Caching**: Reduces API calls to external services
4. **Intersection Observer**: Efficient scroll-triggered animations
5. **Request Throttling**: Prevents API rate limiting
6. **Mobile Optimization**: Videos replaced with images on mobile
7. **Reduced Motion Support**: Respects user accessibility preferences

## Browser Support

- Modern browsers with ES6+ support
- Intersection Observer API (polyfill available if needed)
- CSS Grid and Flexbox
- CSS Custom Properties
- Backdrop Filter (with fallbacks)

## Accessibility

- `prefers-reduced-motion` support
- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast text with proper overlays
- Focus indicators

## Future Enhancements

Potential additions:
- User-uploaded media support
- Quote submission system
- More animation presets
- AI-powered quote recommendations
- Integration with more stock photo APIs
- Advanced caching strategies
- PWA offline media support

---

Enjoy creating an amazing visual experience with your enhanced travel web app!
