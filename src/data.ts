import { Video, User } from './types';

export const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    thumbnail: 'https://images.pexels.com/photos/3006240/pexels-photo-3006240.jpeg?auto=compress&cs=tinysrgb&w=400',
    author: {
      id: 'u1',
      username: 'dance_queen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dance_queen',
      isFollowing: false,
    },
    description: 'Feeling the rhythm today! 💃 #dance #vibe #energy',
    musicName: 'Original Audio - Dance Queen',
    likes: 12500,
    comments: 420,
    shares: 1100,
    tags: ['dance', 'vibe', 'energy', 'trending', 'loopviral'],
  },
  {
    id: '2',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnail: 'https://images.pexels.com/photos/4204561/pexels-photo-4204561.jpeg?auto=compress&cs=tinysrgb&w=400',
    author: {
      id: 'u2',
      username: 'nature_explorer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nature_explorer',
      isFollowing: true,
    },
    description: 'Golden hour hits different. ✨ #nature #travel #peace #summer2024',
    musicName: 'Melodic Sunset - Loft Vibes',
    likes: 8400,
    comments: 156,
    shares: 890,
    tags: ['nature', 'travel', 'peace', 'summer2024', 'goldenhour'],
  },
  {
    id: '3',
    url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    thumbnail: 'https://images.pexels.com/photos/4493393/pexels-photo-4493393.jpeg?auto=compress&cs=tinysrgb&w=400',
    author: {
      id: 'u3',
      username: 'chef_vibe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef_vibe',
      isFollowing: false,
    },
    description: 'Quick morning breakfast idea! 🍳 #cooking #foodie #morning #lifehacks',
    musicName: 'Upbeat Morning - Cooking Hits',
    likes: 25000,
    comments: 1200,
    shares: 4500,
    tags: ['cooking', 'foodie', 'morning', 'lifehacks', 'recipe'],
  },
  {
    id: '4',
    url: 'https://media.w3.org/2010/05/video/movie_300.mp4',
    thumbnail: 'https://images.pexels.com/photos/4051397/pexels-photo-4051397.jpeg?auto=compress&cs=tinysrgb&w=400',
    author: {
      id: 'u4',
      username: 'dev_life',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev_life',
      isFollowing: false,
    },
    description: 'Setup tour 2024. 💻 #coding #setup #developer #tech',
    musicName: 'Lofi Beats - Coding Focus',
    likes: 15000,
    comments: 530,
    shares: 1200,
    tags: ['coding', 'setup', 'developer', 'tech', 'programmer'],
  }
];

export const CURRENT_USER: User = {
  id: 'me',
  username: 'creative_soul',
  name: 'Alex Rivera',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
  bio: 'Capturing moments and spreading good vibes. ✨',
  following: 128,
  followers: 4500,
  likes: 12500,
};

export const MOCK_SONGS = [
  { id: 's1', title: 'Believer', artist: 'Imagine Dragons', duration: '3:24', cover: 'https://picsum.photos/seed/song1/100/100' },
  { id: 's2', title: 'Stay', artist: 'The Kid LAROI', duration: '2:21', cover: 'https://picsum.photos/seed/song2/100/100' },
  { id: 's3', title: 'Bad Habits', artist: 'Ed Sheeran', duration: '3:51', cover: 'https://picsum.photos/seed/song3/100/100' },
  { id: 's4', title: 'Montero', artist: 'Lil Nas X', duration: '2:17', cover: 'https://picsum.photos/seed/song4/100/100' },
  { id: 's5', title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', cover: 'https://picsum.photos/seed/song5/100/100' },
];
