# TuneCollab - Music Collaboration Platform TODO

## Phase 1: Foundation & Design System
- [x] Set up retro-futuristic design tokens (dark black background, neon cyan/magenta, scanlines, chromatic aberration)
- [x] Create global CSS with scanline texture, chromatic aberration effects, and theme variables
- [x] Set up Tailwind configuration for neon accent colors and glassmorphism utilities
- [x] Design and implement main layout wrapper with header/footer
- [x] Create reusable UI components (buttons, cards, inputs) with retro-futuristic styling

## Phase 2: Landing Page & Hero Section
- [x] Build immersive landing page with 3D-inspired hero section
- [x] Implement animated waveform visualizer in hero
- [x] Add floating music notes animation
- [x] Implement smooth scroll animations throughout page
- [x] Add chromatic aberration effect to typography
- [x] Create CTA buttons (Sign Up, Login, Explore)
- [x] Add feature showcase section with glassmorphism cards
- [x] Implement responsive design for mobile/tablet

## Phase 3: Authentication System
- [x] Implement login flow with Manus OAuth
- [x] Implement signup flow with user profile creation through Manus OAuth profile initialization
- [x] Implement a first-run onboarding form for new users (avatar, bio, social links)
- [x] Add logout functionality with secure cookie clearing and client session cleanup
- [x] Create auth guards for protected workspace routes
- [x] Add session persistence and error handling through authenticated session cookies, Preview fallback, and query error handling

## Phase 4: Database Schema & Core Models
- [x] Design and create User model (profile, bio, social links, avatar)
- [x] Design and create Track model (title, description, genre, tags, duration, file_key)
- [x] Design and create Collaboration model (project name, contributors, visibility)
- [x] Design and create Playlist model (name, description, tracks)
- [x] Design and create Comment model (text, track/collab/playlist context)
- [x] Design and create Like model (track/playlist likes)
- [x] Design and create Follow model (user-to-user relationships)
- [x] Design and create Notification model (type, recipient, read status)
- [x] Run migrations and verify schema

## Phase 5: File Storage & Upload System
- [x] Set up S3 storage integration for audio files (server endpoint uses storagePut)
- [x] Set up S3 storage integration for cover art images
- [x] Create file upload API endpoints (authenticated multipart endpoint and Upload.tsx client flow)
- [x] Implement audio file validation (audio MIME validation plus 100MB server limit)
- [x] Implement image file validation (jpg, png, webp)
- [x] Create upload progress tracking (progress bar implemented)
- [x] Add error handling for failed uploads (validation and error handling added)

## Phase 6: Track Management
- [x] Create track upload page with form (title, description, genre, tags, cover art)
- [x] Add a tags input to Upload.tsx and submit/persist user-provided tags alongside genre and cover art
- [x] Add regression coverage for multipart uploads with cover art plus explicit tags persistence
- [x] Implement AI-powered metadata generation (descriptions, tags, genre suggestions)
- [x] Implement track detail page with metadata display
- [x] Implement track edit functionality with owner-checked persisted mutation and Dashboard dialog
- [x] Implement track deletion with confirmation and dependent metadata cleanup
- [x] Create user's track library/management page in the Dashboard tracks tab
- [x] Add track visibility settings (public/private/unlisted)

## Phase 7: Audio Player & Waveform Visualizer
- [x] Create interactive audio player component (AudioPlayer.tsx created)
- [x] Implement waveform visualizer (real-time audio visualization)
- [x] Add play/pause controls
- [x] Add seek/progress bar with click-to-seek
- [x] Add volume control with slider
- [x] Add queue management (next/previous)
- [x] Implement shuffle and repeat modes
- [x] Add current time and duration display
- [x] Add keyboard shortcuts (space for play/pause, arrow keys for seek)

## Phase 8: Discovery & Explore Page
- [x] Create explore page layout with filters sidebar
- [x] Implement genre filter functionality
- [x] Implement search functionality (tracks, artists, playlists)
- [x] Create trending tracks section
- [x] Create recommended artists section
- [x] Implement real pagination for search results with server-side page offsets
- [x] Add sorting options (newest, most popular, trending)
- [x] Add regression tests for search pagination and preserved filters/sort state
- [x] Create infinite scroll or load-more functionality (Load more button over the paginated result set)

## Phase 9: User Profiles
- [x] Create user profile page template (Profile.tsx created)
- [x] Display user avatar, bio, social links
- [x] Display user's uploaded tracks
- [x] Display user's collaborations (tab structure)
- [x] Display followers/following counts and lists
- [x] Add follow/unfollow button
- [x] Implement edit profile for own profile
- [x] Add profile follower, following, track, and collaboration statistics

## Phase 10: Collaboration System
- [x] Create collaboration project creation page (CollaborationHub modal backed by persisted mutation)
- [x] Implement collaboration room/project detail page (CollaborationRoom.tsx created)
- [x] Add invite collaborators functionality (foundation ready)
- [x] Create invitation acceptance/rejection flow in the notifications inbox
- [x] Implement track/stem sharing within collaboration (layer system)
- [x] Add per-track comments in collaboration (comments panel)
- [x] Implement collaboration visibility settings (public/private/invited)
- [x] Implement owner-only collaboration deletion and member management

## Phase 11: Playlists
- [x] Create playlist creation page with persisted modal form
- [x] Implement add/remove tracks from playlist
- [x] Create playlist detail page with track list and playback
- [x] Implement playlist editing (name, description)
- [x] Add playlist sharing functionality
- [x] Implement playlist deletion
- [x] Add playlist visibility settings (public/private)
- [x] Create user's playlist library page

## Phase 12: Social Features
- [x] Implement like functionality for tracks
- [x] Implement persistent like functionality for playlists
- [x] Create comment system for tracks
- [x] Create comment system for collaborations
- [ ] Implement comment deletion and editing
- [x] Add explicit social-media share actions alongside copy-link sharing
- [x] Create a data-backed dashboard recent-activity section from notifications
- [x] Implement like/comment counts display

## Phase 13: Notifications System
- [x] Set up notification database model
- [x] Implement in-app notifications display
- [x] Create notification bell icon with unread count
- [x] Implement notification center/inbox page
- [x] Add mark as read functionality
- [ ] Implement email notification integration (optional)
- [x] Create notification types for collaboration invite, comment, and new track in collaboration
- [ ] Add notification preferences/settings

## Phase 14: Advanced UI Polish
- [ ] Implement loading states and skeletons
- [x] Add error boundaries and error messages
- [ ] Create empty states for all list views
- [ ] Implement toast notifications for user feedback
- [x] Add micro-animations and transitions with reduced-motion support
- [x] Implement persistent light/dark mode toggle
- [x] Add accessibility features including visible focus rings, keyboard audio controls, ARIA labels, and reduced-motion support
- [x] Optimize performance with route-level lazy loading and a shared accessible loading fallback

## Phase 15: Testing & Quality Assurance
- [ ] Write unit tests for API procedures
- [ ] Write component tests for key UI components
- [ ] Test authentication flow end-to-end
- [x] Test file upload and storage helpers (TypeScript, copyright helper, endpoint, storage, and persistence metadata coverage complete)
- [ ] Test search and filtering
- [x] Test collaboration invitation flow and permission-safe layer editing/removal logic
- [ ] Performance testing and optimization
- [ ] Cross-browser testing
- [x] Add a Vitest regression test for authenticated /api/upload-track success and unauthenticated rejection
- [x] Add a server-side test covering invalid file type and duplicate hash rejection
- [x] Add a storage/persistence test verifying fileKey, fileUrl, fileHash, mimeType, and fileSize metadata
- [x] Restore the missing live tables required by track uploads and user profile persistence, then verify schema parity

## Phase 16: Deployment & Launch
- [ ] Create checkpoint for production
- [x] Configure managed environment variables for OAuth, database, storage, and AI services
- [ ] Set up dedicated production monitoring and error tracking beyond managed logs
- [x] Create verified deployment documentation with release, domain, rollback, and security instructions (`DEPLOYMENT.md`)
- [x] Publish website through auto-published checkpoints
- [x] Complete final QA on production routes, uploads, discovery, collaboration, and responsive layouts
- [x] Create user documentation/help guide (`USER_GUIDE.md`)

## Known Constraints & Notes
- All audio/image files stored in S3, referenced via CDN URLs
- Retro-futuristic aesthetic: scanlines, chromatic aberration, neon colors, glassmorphism
- Dark theme with deep black background
- Responsive design for all screen sizes
- AI metadata generation for uploaded tracks
- Real-time notifications for collaboration and social interactions

- [x] Improve mobile responsiveness on Collaboration Hub (prevent heading overflow, stack controls, and make project cards fit narrow screens)
- [x] Improve mobile responsiveness on Upload page (stack form controls and keep file upload UI within viewport)
- [x] Improve mobile responsiveness on shared headers and primary routes (Home, Explore, Dashboard, Collaboration Room)
- [x] Verify responsive behavior at phone and desktop viewports

- [x] Add explicit mobile-responsive layout fixes to Explore.tsx (header, filters, cards, spacing, overflow)
- [x] Add explicit mobile-responsive layout fixes to CollaborationRoom.tsx (header/actions, track panels, chat/export controls, overflow)
- [x] Re-run phone and desktop verification after updating Explore and CollaborationRoom responsive layouts
- [x] Clarify upload copyright copy so SHA-256 is described as exact-duplicate/integrity protection, not a legal ownership guarantee
- [x] Fix mobile title wrapping on Explore, Collaboration Hub, Notifications, and Playlists
- [x] Improve dashboard mobile tab navigation so the active controls remain discoverable without clipped labels
- [x] Fix the Explore mobile header authentication button contrast so its label remains visible
- [x] Remove the Vite warning caused by Google Fonts importing after tw-animate-css output

## Phase 17: User Requested Enhancements (Favorites, Comments, Waveform, Contributor Deletion, Skill Creator)
- [x] Remove track deletion button/option for non-owner contributors in collaboration rooms
- [x] Implement persistent favorites table & tRPC endpoints (toggleFavorite, listFavorites)
- [x] Add favorite heart button on track cards & dedicated Favorites tab in Dashboard
- [x] Enhance AudioPlayer with a real-time interactive waveform visualizer canvas
- [x] Add robust track comment section beneath each track in detail/player view
- [x] Create reusable music collaboration platform skill via skill-creator

## Phase 18: AI Music Studio & Conversational Assistant
- [x] Create server-side tRPC procedures for AI music analysis and conversational prompt tuning (`server/routers.ts`)
- [x] Build AI Music Studio page (`client/src/pages/AiStudio.tsx`) with lyrics input, track selection, and chat customization
- [x] Integrate invokeLLM with structured music-production prompts and streaming/markdown rendering
- [x] Register AI Studio route in `client/src/App.tsx` and add navigation links across headers and dashboards
- [x] Run full test suite, verify compilation, and save final production checkpoint

## Phase 19: Cover Asset & UI Modernization
- [x] Generate professional cyberpunk retro-futuristic cover photo for TuneCollab (`generate`)
- [x] Ensure cover asset is correctly integrated into landing page and app storage
- [x] Refine Home landing page layout with cleaner cards, frosted glassmorphism, and modern typography
- [x] Update header, footer, and navigation to feel sleek, minimal, and responsive across all viewports
- [x] Run full test suite, verify build compilation, and save final production checkpoint

## Phase 20: TuneCol UI Adaptation
- [x] Extract key design attributes from tunecoll.com (color palette, typography, glassmorphism, spacing)
- [x] Update global theme tokens in `client/src/index.css` to match the professional reference aesthetic
- [x] Redesign Home landing page and navigation to mirror the clean, modern structure of the reference
- [x] Verify responsive layouts on desktop and mobile viewports, run tests, and save checkpoint

## Phase 21: AI Studio Upload Customization & Smooth Feed Transitions
- [x] Fix AiStudio.tsx duplicate useState import/pre-transform error
- [x] Implement explicit loading skeleton and smooth transition UX when switching dashboard tabs
- [x] Run pnpm test and pnpm build successfully
- [x] Save final production checkpoint

## Phase 22: Remove Cover Image Section
- [x] Remove the cover image / showcase card from `client/src/pages/Home.tsx`
- [x] Verify test suite and build compilation pass successfully
- [x] Save updated production checkpoint

## Phase 23: Remove Duplicate Recent Tracks in Dashboard
- [x] Inspect `client/src/pages/Dashboard.tsx` to locate duplicated Recent Tracks sections
- [x] Remove the extra duplicate section while keeping clean tab switching and state
- [x] Run test suite, verify compilation, and save final production checkpoint

## Phase 24: Light UI & Dark Mode Redesign
- [x] Implement complete light-first and `.dark` semantic theme tokens in `client/src/index.css`
- [x] Enhance `ThemeContext.tsx` to fully support light/dark toggling with persistence in localStorage and HTML class updates
- [x] Add an accessible Sun/Moon theme toggle to Explore, AI Studio, and Collaboration Room headers
- [x] Apply light/dark-compatible card, button, and pill navigation styling across primary pages
- [x] Verify desktop/mobile themes, run tests, and save the final production checkpoint

## Phase 25: Surface and Color-System Refinement
- [x] Remove glassmorphism-heavy surface treatments from core pages and shared styles
- [x] Establish a restrained, accessible color hierarchy for light and dark themes
- [x] Refine primary layouts and components for a clean professional music-product appearance
- [x] Verify the revised visual system on desktop and mobile, then publish a checkpoint
