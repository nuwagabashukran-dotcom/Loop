export interface Video {
  id: string;
  url: string;
  thumbnail: string;
  author: {
    id: string;
    username: string;
    avatar: string;
    isFollowing: boolean;
  };
  description: string;
  musicName: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  following: number;
  followers: number;
  likes: number;
}
