# NostrCount

A decentralized life milestone tracker built on the Nostr protocol. Track your progress, celebrate achievements, and share your journey with the world.

## Features

- **Censorship Resistant**: Built on Nostr for decentralized data storage
- **Lightning Zaps**: Support creators with Bitcoin Lightning Network payments
- **Private or Public**: Choose to keep counters private or share them publicly
- **Two Counter Types**: Track "days since" achievements or "days until" events
- **Real-time Updates**: Automatic syncing across devices through Nostr relays
- **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Nostr extension (like Alby, nos2x, or Flamingo) for signing events

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nostrcount.git
cd nostrcount
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

## Usage

### Creating a Counter

1. Connect your Nostr extension by clicking "Login"
2. Go to your Dashboard
3. Click "Create Counter"
4. Fill in the details:
   - **Title**: What you're tracking (e.g., "Quit Smoking")
   - **Date**: The reference date
   - **Type**: "Days Since" or "Days Until"
   - **Visibility**: Public or Private

### Sharing Counters

Public counters can be shared with a direct link. Each counter has a unique URL that others can view and even zap (tip) if they have Lightning Network setup.

### Zapping

Support others on their journey by sending Lightning Network tips. Click the "Zap" button on any public counter to send sats!

## Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Nostr Integration**: NDK (Nostr Development Kit)
- **Date Handling**: Day.js
- **Routing**: React Router
- **Icons**: Lucide React

### Nostr Implementation

- **Event Kind**: 30078 (Parameterized Replaceable Events)
- **Event Tags**:
  - `d`: Unique identifier/slug
  - `type`: "since" or "until"
  - `title`: Human-readable counter name
  - `date`: ISO date string
  - `visibility`: "public" or "private"

### Data Storage

All counter data is stored on Nostr relays as events. No centralized database is required, making the app fully decentralized and censorship-resistant.

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── CounterCard.tsx     # Individual counter display
│   ├── CounterFormModal.tsx # Counter creation/editing
│   ├── Header.tsx          # Navigation header
│   ├── LoadingSpinner.tsx  # Loading component
│   └── ZapButton.tsx       # Lightning zap functionality
├── contexts/           # React contexts
│   └── NDKContext.tsx     # Nostr connection management
├── hooks/              # Custom React hooks
│   └── useCounters.ts     # Counter data management
├── pages/              # Page components
│   ├── CounterDetail.tsx  # Individual counter view
│   ├── Dashboard.tsx      # User dashboard
│   └── Home.tsx          # Landing page
├── types/              # TypeScript types
│   └── index.ts          # Type definitions
├── utils/              # Utility functions
│   ├── date.ts           # Date calculation helpers
│   └── nostr.ts          # Nostr event helpers
└── App.tsx             # Main app component
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Adding New Features

1. **New Counter Types**: Modify the `Counter` type in `src/types/index.ts`
2. **New Relays**: Update `DEFAULT_RELAYS` in `src/utils/nostr.ts`
3. **Styling**: Use Tailwind CSS classes or extend the theme in `tailwind.config.js`

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

### Recommended Hosting

- **Vercel**: Zero-config deployments with automatic HTTPS
- **Netlify**: Simple drag-and-drop deployments
- **GitHub Pages**: Free hosting for open source projects
- **IPFS**: Decentralized hosting matching the decentralized nature of Nostr

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs or request features on GitHub
- **Discussions**: Join the community discussion
- **Zaps**: Support the project with Lightning Network tips

## Acknowledgments

- [Nostr Protocol](https://nostr.com) for the decentralized foundation
- [NDK](https://github.com/nostr-dev-kit/ndk) for the excellent Nostr development kit
- [Tailwind CSS](https://tailwindcss.com) for the amazing styling framework
- All the Nostr relay operators keeping the network running

---

**Built with ⚡ by the Nostr community** 