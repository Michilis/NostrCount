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


### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint


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

