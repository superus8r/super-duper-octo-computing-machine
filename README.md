# Shopping List PWA

A production-ready, mobile-first Progressive Web App for managing shopping lists. Built with Vite + React + TypeScript and deployable to GitHub Pages.

## ✨ Features

- **📱 Mobile-First PWA**: Installable on mobile devices with offline support
- **🎨 Theme Support**: Light, Dark, and System theme modes with persistent settings
- **💾 Offline-First**: Works without internet using IndexedDB with localStorage fallback
- **🛒 Shopping Lists**: Create, edit, and manage multiple shopping lists
- **📊 Smart Statistics**: Track spending patterns and frequently purchased items
- **🔍 Auto-suggestions**: Product name suggestions based on purchase history
- **💰 Multi-Currency**: Support for EUR, USD, GBP with proper formatting
- **♿ Accessible**: WCAG compliant with proper ARIA labels and keyboard navigation
- **📱 Touch-Friendly**: Swipe gestures with accessible alternatives
- **🔄 Real-time Updates**: Live data synchronization across tabs
- **📤 Export Options**: Share lists via URL or export as CSV

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router (HashRouter for GitHub Pages compatibility)  
- **Database**: IndexedDB via `idb` with localStorage fallback
- **Validation**: Zod for schema validation and type safety
- **Styling**: CSS Custom Properties with mobile-first responsive design
- **PWA**: Custom Service Worker with app shell + runtime caching
- **Testing**: Vitest + React Testing Library
- **Deployment**: GitHub Pages via GitHub Actions

## 🛠️ Development

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/superus8r/super-duper-octo-computing-machine.git
cd super-duper-octo-computing-machine

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test
```

### Available Scripts

- `pnpm dev` - Start development server with HMR
- `pnpm build` - Build for production 
- `pnpm preview` - Preview production build locally
- `pnpm test` - Run unit tests with Vitest
- `pnpm lint` - Run ESLint for code quality

## 📱 PWA Features

### Installation
- Installable on iOS, Android, and desktop browsers
- Custom app icons (192x192, 256x256, 512x512, maskable)
- Standalone display mode for native app-like experience

### Offline Support
- App shell caching for instant loading
- Runtime caching for assets (CSS, JS, images)
- IndexedDB storage with optimistic UI updates
- Offline queue for pending operations

### Performance
- Lighthouse PWA score ≥ 90
- Performance score ≥ 90 on mobile
- Optimized bundle splitting and lazy loading

## 🎯 Usage

### Creating Lists
1. Tap "New List" in the bottom navigation
2. Enter list name and optional currency
3. Add initial items (comma-separated) if desired
4. Tap "Create List" to save

### Managing Items
- **Add**: Tap the add button and enter item details
- **Edit**: Tap on an item to edit name, quantity, or price
- **Mark Purchased**: Tap the checkbox or swipe right
- **Delete**: Swipe left or use the delete button
- **Reorder**: Drag and drop (when enabled in settings)

### Smart Features
- **Auto-suggestions**: Product names from purchase history
- **Price Tracking**: Automatic price memory per product
- **Statistics**: View spending patterns and top products
- **Tax Calculation**: Configure tax rate in profile settings

### Export & Sharing
- **Share URL**: Generate shareable link with list data
- **Export CSV**: Download list as spreadsheet
- **Offline Access**: Full functionality without internet

## 🌐 Deployment

### GitHub Pages

The app automatically deploys to GitHub Pages on push to main branch:

1. Enable GitHub Pages in repository settings
2. Push to main branch
3. GitHub Actions will build and deploy automatically
4. Access at `https://username.github.io/repository-name`

### Manual Deployment

```bash
# Build the app
pnpm build

# Deploy the dist/ folder to your hosting provider
```

### Configuration Notes

- Uses HashRouter for client-side routing compatibility
- Service worker scope set to `/` for full PWA functionality
- Manifest configured for standalone PWA installation

## 🎨 Theming

The app supports three theme modes:

- **Light**: Traditional light theme
- **Dark**: Dark theme with high contrast
- **System**: Automatically follows OS preference

Theme selection is persisted and the `theme-color` meta tag updates dynamically for optimal native integration.

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Full keyboard navigation support
- Screen reader compatible with proper ARIA labels
- High contrast color ratios
- Minimum 44px touch targets
- Respects `prefers-reduced-motion`

## 📊 Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- iOS Safari 13+
- Android Chrome 80+

Features gracefully degrade in older browsers with localStorage fallback.

## 🔧 Architecture

```
src/
├── components/        # Reusable UI components
├── features/         # Feature-specific components and pages
│   ├── lists/       # Shopping lists functionality
│   ├── new/         # New list creation
│   └── profile/     # User profile and settings
├── hooks/           # Custom React hooks
├── lib/             # Core utilities and services
│   ├── db.ts       # IndexedDB database layer
│   ├── types.ts    # Zod schemas and TypeScript types
│   ├── theme.ts    # Theme system utilities
│   ├── currency.ts # Currency formatting helpers
│   └── uuid.ts     # UUID generation utility
├── styles/          # Global CSS and design tokens
└── test/           # Test utilities and test files
```

## 🐛 Troubleshooting

### PWA Not Installing
- Ensure HTTPS or localhost
- Check browser PWA installation requirements
- Verify manifest.webmanifest is accessible

### Database Issues
- Clear IndexedDB in browser dev tools
- Check console for storage quota errors
- Verify service worker registration

### Theme Not Persisting  
- Check localStorage permissions
- Verify theme meta tags are updating
- Test in incognito mode for clean state

### GitHub Pages 404s
- Ensure HashRouter is used (not BrowserRouter)
- Check GitHub Pages is enabled in repository settings
- Verify build artifacts are in dist/ folder

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

Built with ❤️ using React, TypeScript, and modern web technologies.