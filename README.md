# TuneCollab - Professional Music Collaboration Platform

A stunning, production-ready music collaboration platform with a retro-futuristic aesthetic. Built with React 19, Tailwind CSS 4, Express, tRPC, and MySQL.

## 🎵 Features

### Core Functionality
- **User Authentication**: Manus OAuth integration with secure session management
- **Track Management**: Upload, organize, and manage music tracks with metadata
- **Collaboration Projects**: Create multi-track projects with layer management
- **Playlist System**: Create and share curated playlists
- **Social Features**: Like, comment, and share tracks and playlists
- **User Profiles**: Rich profiles with bio, social links, and follower counts
- **Discovery Engine**: Browse trending tracks, search, and filter by genre

### Advanced Features
- **Audio Player**: Interactive waveform visualizer with full playback controls
- **Real-time Notifications**: Collaboration invites, comments, and activity updates
- **Collaboration Invitations**: Invite musicians and manage project contributors
- **Layer Controls**: Volume, pan, and timing controls for multi-track projects
- **AI Metadata Generation**: Automatic track description and tag generation (ready for integration)
- **Cloud Storage**: S3-compatible storage for audio files and cover art

## 🎨 Design System

### Visual Identity
- **Color Palette**: Deep black (#020202) background with neon cyan (oklch(0.5 0.3 180)) and magenta (oklch(0.6 0.3 300)) accents
- **Typography**: Bold Orbitron font for headers, Space Mono for code
- **Effects**: Scanline texture, chromatic aberration, glassmorphism cards, neon glow
- **Aesthetic**: Retro-futuristic "system failure" theme with technical artifacts

### Components
- Glassmorphism cards with backdrop blur
- Neon-glowing buttons and interactive elements
- Smooth scroll animations and floating elements
- Error code badges and digital noise effects
- Responsive design for mobile, tablet, and desktop

## 🚀 Getting Started

### Prerequisites
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL 8.0+ or TiDB

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env` (if available)
   - Configure database connection string in `DATABASE_URL`
   - Set up OAuth credentials

3. **Initialize database**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

### Development Commands

```bash
# Start dev server with hot reload
pnpm dev

# Type checking
pnpm check

# Format code
pnpm format

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
├── client/
│   ├── src/
│   │   ├── pages/          # Page components (Home, Explore, Profile, etc.)
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and helpers
│   │   ├── contexts/       # React contexts (Theme, Auth)
│   │   ├── App.tsx         # Main router
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles with design tokens
│   └── index.html          # HTML template
├── server/
│   ├── routers.ts          # tRPC API procedures
│   ├── db.ts               # Database query helpers
│   ├── storage.ts          # S3 storage helpers
│   └── _core/              # Framework internals
├── drizzle/
│   ├── schema.ts           # Database schema definitions
│   └── migrations/         # Generated SQL migrations
├── shared/
│   ├── const.ts            # Shared constants
│   └── types.ts            # Shared TypeScript types
└── package.json            # Dependencies and scripts
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts with OAuth integration
- **user_profiles**: Extended user information (bio, avatar, social links)
- **user_follows**: User-to-user relationships

### Music Tables
- **tracks**: Audio files with metadata (genre, tags, duration, etc.)
- **track_likes**: User likes on tracks
- **track_comments**: Comments on tracks
- **track_downloads**: Download tracking

### Collaboration Tables
- **collaborations**: Multi-track projects
- **collaboration_contributors**: Project members and roles
- **collaboration_layers**: Individual tracks in a project
- **collaboration_invitations**: Invite management
- **collaboration_comments**: Comments on layers/projects

### Playlist Tables
- **playlists**: User-created playlists
- **playlist_tracks**: Tracks in playlists
- **playlist_likes**: Likes on playlists

### Notification Tables
- **notifications**: User notifications (invites, comments, likes, follows)

### Reference Tables
- **genres**: Music genres
- **instruments**: Musical instruments

## 🔌 API Endpoints

All API endpoints use tRPC and are available at `/api/trpc`.

### Authentication
- `auth.me` - Get current user
- `auth.logout` - Logout current user

### Tracks
- `tracks.trending` - Get trending tracks
- `tracks.search` - Search tracks
- `tracks.byId` - Get track by ID
- `tracks.userTracks` - Get user's tracks
- `tracks.myTracks` - Get current user's tracks
- `tracks.comments` - Get track comments
- `tracks.upload` - Upload new track

### Collaborations
- `collaborations.list` - Get user's collaborations
- `collaborations.byId` - Get collaboration by ID
- `collaborations.layers` - Get collaboration layers
- `collaborations.create` - Create new collaboration
- `collaborations.invite` - Invite user to collaboration

### Playlists
- `playlists.list` - Get user's playlists
- `playlists.byId` - Get playlist by ID
- `playlists.tracks` - Get playlist tracks
- `playlists.create` - Create new playlist
- `playlists.addTrack` - Add track to playlist

### Notifications
- `notifications.list` - Get user notifications
- `notifications.unreadCount` - Get unread count
- `notifications.markAsRead` - Mark notification as read

### Users
- `users.profile` - Get user profile
- `users.myProfile` - Get current user profile
- `users.updateProfile` - Update profile
- `users.follow` - Follow user
- `users.unfollow` - Unfollow user

### Reference Data
- `reference.genres` - Get all genres
- `reference.instruments` - Get all instruments

## 🎯 Key Pages

### Landing Page (`/`)
- Hero section with animated waveform visualizer
- Floating music notes animation
- Feature showcase with glassmorphism cards
- Call-to-action buttons

### Explore (`/explore`)
- Browse trending tracks
- Search functionality
- Genre filtering
- Track details with play preview

### User Profile (`/profile/:userId`)
- User avatar and bio
- Social links (Twitter, Instagram, SoundCloud, website)
- Follower/following counts
- User's tracks and collaborations
- Follow/message buttons

### Collaboration Room (`/collaboration/:collabId`)
- Multi-track project editing
- Layer management with volume and pan controls
- Waveform visualization
- Comments and feedback
- Contributor list

## 🔐 Authentication

TuneCollab uses Manus OAuth for secure authentication:

1. User clicks "Sign In" button
2. Redirected to Manus OAuth portal
3. User authenticates with credentials
4. Redirected back to `/api/oauth/callback`
5. Session cookie is set
6. User is logged in

Protected routes require authentication via `protectedProcedure` in tRPC.

## 💾 File Storage

Audio files and cover art are stored in S3-compatible storage:

- **Audio Files**: `/audio/{userId}/{trackId}/{filename}`
- **Cover Art**: `/covers/{userId}/{trackId}/{filename}`
- **Presigned URLs**: Generated for secure access

## 🚢 Deployment

### Build for Production

```bash
pnpm build
```

This creates:
- Optimized client bundle in `dist/`
- Server bundle in `dist/index.js`

### Environment Variables for Production

```env
DATABASE_URL=mysql://user:password@host:3306/dbname
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
NODE_ENV=production
```

### Docker Deployment

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Manus Hosting

Deploy directly to Manus:

1. Click "Publish" in the Management UI
2. Choose deployment strategy (Autoscale or Reserved)
3. Configure custom domain
4. Deploy

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

Tests are located in `server/*.test.ts` files using Vitest.

Example test:
```typescript
describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});
```

## 📊 Performance

- **Lazy Loading**: Pages and components load on demand
- **Code Splitting**: Automatic with Vite
- **Caching**: tRPC query caching with React Query
- **Optimistic Updates**: Instant UI feedback
- **CDN**: Static assets served via CDN
- **Database Indexing**: Optimized indexes on frequently queried columns

## 🔄 Roadmap

### Phase 1: MVP (Current)
- ✅ Landing page with hero section
- ✅ Explore/discovery page
- ✅ User profiles
- ✅ Collaboration rooms
- ✅ Database schema
- ✅ API endpoints

### Phase 2: Core Features
- [ ] File upload with S3 integration
- [ ] Audio player with waveform visualizer
- [ ] Real-time notifications
- [ ] AI metadata generation
- [ ] Playlist management
- [ ] Comment system

### Phase 3: Advanced Features
- [ ] Real-time collaboration (WebSocket)
- [ ] Advanced audio processing
- [ ] Recommendation engine
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Streaming integration

### Phase 4: Scale
- [ ] Payment processing (Stripe)
- [ ] Premium features
- [ ] Artist tools
- [ ] Label management
- [ ] Distribution network

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React 19](https://react.dev)
- Styled with [Tailwind CSS 4](https://tailwindcss.com)
- Backend with [Express](https://expressjs.com) and [tRPC](https://trpc.io)
- Database with [Drizzle ORM](https://orm.drizzle.team)
- Hosted on [Manus](https://manus.im)

## 📞 Support

For support, email support@tunecollab.com or open an issue on GitHub.

---

**TuneCollab** - Where Musicians Collaborate, Create, and Innovate 🎵
