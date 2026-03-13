export interface Drama {
  id: string;
  title: string;
  genre: string[];
  year: number;
  episodes: number;
  poster: string;
  summary: string;
  trailerUrl: string;
  rating: number;
  country: string;
}

export interface Review {
  id: string;
  dramaId: string;
  author: string;
  rating: number;
  pros: string[];
  cons: string[];
  finalOpinion: string;
  worthWatching: boolean;
  content: string;
  date: string;
}

export const dramas: Drama[] = [
  {
    id: "1",
    title: "The Untamed",
    genre: ["Historical", "Fantasy", "Mystery"],
    year: 2019,
    episodes: 50,
    poster: "https://picsum.photos/seed/untamed/400/600",
    summary: "In a magical world of inter-clan rivalry, two soulmates face treacherous schemes and uncover a dark mystery linked to a tragic event in the past. A beautifully crafted story of loyalty, sacrifice, and redemption.",
    trailerUrl: "https://www.youtube.com/embed/BfKhREVFLkQ",
    rating: 4.9,
    country: "China"
  },
  {
    id: "2",
    title: "Love Between Fairy and Devil",
    genre: ["Fantasy", "Romance"],
    year: 2022,
    episodes: 36,
    poster: "https://picsum.photos/seed/fairydevil/400/600",
    summary: "A low-ranking fairy accidentally resurrects a powerful demon lord. To regain his freedom, he must protect her, but unexpected feelings begin to bloom between the two sworn enemies.",
    trailerUrl: "https://www.youtube.com/embed/8v_oWq5z7Q8",
    rating: 4.8,
    country: "China"
  },
  {
    id: "3",
    title: "Hidden Love",
    genre: ["Modern", "Romance", "Youth"],
    year: 2023,
    episodes: 25,
    poster: "https://picsum.photos/seed/hiddenlove/400/600",
    summary: "A heartwarming story following a young girl's secret crush on her older brother's friend, which blossoms into a beautiful romance years later when they reunite.",
    trailerUrl: "https://www.youtube.com/embed/example",
    rating: 4.7,
    country: "China"
  },
  {
    id: "4",
    title: "Nirvana in Fire",
    genre: ["Historical", "Political", "Drama"],
    year: 2015,
    episodes: 54,
    poster: "https://picsum.photos/seed/nirvana/400/600",
    summary: "A brilliant strategist returns to the capital under a new identity to clear his family's name and secretly help his childhood friend ascend to the throne.",
    trailerUrl: "https://www.youtube.com/embed/example2",
    rating: 5.0,
    country: "China"
  },
  {
    id: "5",
    title: "The Golden Hairpin",
    genre: ["Historical", "Mystery", "Romance"],
    year: 2024,
    episodes: 40,
    poster: "https://picsum.photos/seed/goldenhairpin/400/600",
    summary: "A talented female detective, framed for her family's murder, disguises herself as a eunuch to solve the case and uncovers a massive conspiracy in the imperial court.",
    trailerUrl: "https://www.youtube.com/embed/example3",
    rating: 4.5,
    country: "China"
  },
  {
    id: "6",
    title: "Khmeng Wat",
    genre: ["Modern", "Drama", "Family"],
    year: 2023,
    episodes: 30,
    poster: "https://picsum.photos/seed/khmengwat/400/600",
    summary: "A touching Khmer drama about a young boy raised in a pagoda who struggles to find his place in modern society while holding onto traditional values.",
    trailerUrl: "https://www.youtube.com/embed/example4",
    rating: 4.6,
    country: "Cambodia"
  }
];

export const reviews: Review[] = [
  {
    id: "r1",
    dramaId: "1",
    author: "DramaCritic",
    rating: 5,
    pros: ["Incredible character development", "Beautiful OST", "Deep emotional impact"],
    cons: ["CGI in early episodes is a bit dated", "Complex plot requires full attention"],
    finalOpinion: "An absolute masterpiece that redefines the xianxia genre. The bond between the leads is unforgettable.",
    worthWatching: true,
    content: "The Untamed is not just a drama; it's an experience. The intricate storytelling weaves a tapestry of political intrigue, magical cultivation, and profound human connection. While the first few episodes might feel overwhelming due to the large cast and complex lore, the payoff is immense. The character arcs are masterfully executed, making you care deeply for even the supporting cast.",
    date: "2023-10-15"
  },
  {
    id: "r2",
    dramaId: "2",
    author: "RomanceLover",
    rating: 4.5,
    pros: ["Stunning visuals and costumes", "Great chemistry between leads", "Unique take on the demon lord trope"],
    cons: ["Some pacing issues in the middle", "Secondary couple storyline is less engaging"],
    finalOpinion: "A visually spectacular fantasy romance that will keep you hooked from start to finish.",
    worthWatching: true,
    content: "Love Between Fairy and Devil took the internet by storm for good reason. The production value is top-notch, with breathtaking sets and costumes. The dynamic between the innocent fairy and the ruthless demon lord is both hilarious and heartwarming. It's a classic enemies-to-lovers trope executed with flair and emotional depth.",
    date: "2023-11-02"
  },
  {
    id: "r3",
    dramaId: "3",
    author: "SliceOfLifeFan",
    rating: 4.5,
    pros: ["Realistic portrayal of a crush", "Healthy relationship dynamics", "Excellent acting"],
    cons: ["Slow burn might not be for everyone", "Low stakes plot"],
    finalOpinion: "A sweet, comforting watch perfect for relaxing weekends.",
    worthWatching: true,
    content: "Hidden Love is a breath of fresh air. It avoids the typical toxic tropes often found in romance dramas, opting instead for a healthy, supportive relationship that develops naturally over time. The transition from a childhood crush to a mature romance is handled with incredible sensitivity and realism.",
    date: "2024-01-20"
  }
];

export const categories = ["Romance", "Historical", "Fantasy", "Modern", "Mystery", "Drama"];
