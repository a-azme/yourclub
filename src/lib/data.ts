import type { EventItem, Fest } from '@/types';

export const ORGANIZATIONS = ['DRMC IT Club', 'DRMC Robotics Society', 'DRMC Science Club'];

export const FESTS: Fest[] = [
  { id: 'tech-carnival-2026', title: 'Tech Carnival 2026', tagline: ['Innovate', 'Compete', 'Create'], start: '2026-12-15', end: '2026-12-18', organizer: 'DRMC IT Club', status: 'Upcoming', gradient: 'from-[#06173d] via-[#0b2f7a] to-[#1450c8]' },
  { id: 'winter-tech-fest-2026', title: 'Winter Tech Fest 2026', tagline: ['Learn', 'Build', 'Grow'], start: '2027-01-20', end: '2027-01-23', organizer: 'DRMC IT Club', status: 'Upcoming', gradient: 'from-[#12355b] via-[#3f6c9a] to-[#9fc3e6]' },
  { id: 'freshers-tech-fest-2027', title: 'Freshers Tech Fest 2027', tagline: ['Welcome', 'Explore', 'Belong'], start: '2027-03-05', end: '2027-03-08', organizer: 'DRMC IT Club', status: 'Upcoming', gradient: 'from-[#2b2350] via-[#8a4f6b] to-[#e9965a]' },
  { id: 'robo-expo-2027', title: 'Robo Expo 2027', tagline: ['Build', 'Automate', 'Win'], start: '2027-04-10', end: '2027-04-12', organizer: 'DRMC Robotics Society', status: 'Upcoming', gradient: 'from-[#0f3d2e] via-[#17785a] to-[#4cc9a0]' },
  { id: 'science-week-2027', title: 'Science Week 2027', tagline: ['Discover', 'Experiment', 'Share'], start: '2027-05-18', end: '2027-05-21', organizer: 'DRMC Science Club', status: 'Upcoming', gradient: 'from-[#3a1456] via-[#6b2fa0] to-[#b57be8]' },
];

export const EVENTS: EventItem[] = [
  { id: 'ai-web-development-contest', festId: 'tech-carnival-2026', title: 'AI Web Development Contest', category: 'Programming', start: '2026-12-16T10:00:00', deadline: '2026-12-14T23:59:00', venue: 'Computer Lab 1, DRMC', capacity: 120, registered: 86, featured: true, description: 'Build a smart club operations platform in 3 days using any stack and any AI tools.' },
  { id: 'machine-learning-workshop', festId: 'tech-carnival-2026', title: 'Machine Learning Workshop', category: 'AI & ML', start: '2026-12-17T14:00:00', deadline: '2026-12-16T23:59:00', venue: 'Seminar Hall', capacity: 80, registered: 62, featured: true, description: 'Hands-on introduction to machine learning with Python and real datasets.' },
  { id: 'robotics-challenge', festId: 'tech-carnival-2026', title: 'Robotics Challenge', category: 'Robotics', start: '2026-12-18T10:00:00', deadline: '2026-12-16T23:59:00', venue: 'Main Auditorium', capacity: 40, registered: 40, featured: true, description: 'Line-follower and obstacle-course robot battle for teams of up to 3.' },
  { id: 'gaming-tournament', festId: 'tech-carnival-2026', title: 'Gaming Tournament', category: 'Gaming', start: '2026-12-18T15:00:00', deadline: '2026-12-17T23:59:00', venue: 'Gaming Zone, Block B', capacity: 64, registered: 51, description: 'Squad-based esports tournament with prizes for the top 3 teams.' },
  { id: 'hackathon', festId: 'winter-tech-fest-2026', title: 'Winter Hackathon', category: 'Programming', start: '2027-01-21T09:00:00', deadline: '2027-01-18T23:59:00', venue: 'Innovation Lab', capacity: 100, registered: 45, description: '24-hour hackathon to solve real campus problems with technology.' },
  { id: 'tech-quiz', festId: 'winter-tech-fest-2026', title: 'Tech Quiz', category: 'Quiz', start: '2027-01-22T11:00:00', deadline: '2027-01-20T23:59:00', venue: 'Seminar Hall', capacity: 150, registered: 98, description: 'Fast-paced quiz on technology, science and internet culture.' },
  { id: 'cloud-workshop', festId: 'winter-tech-fest-2026', title: 'Cloud & DevOps Workshop', category: 'Workshop', start: '2027-01-23T10:00:00', deadline: '2027-01-21T23:59:00', venue: 'Computer Lab 2', capacity: 60, registered: 33, description: 'Deploy your first app with Git, CI/CD and free cloud tiers.' },
  { id: 'coding-challenge', festId: 'freshers-tech-fest-2027', title: 'Coding Challenge', category: 'Programming', start: '2027-03-06T10:00:00', deadline: '2027-03-04T23:59:00', venue: 'Computer Lab 1, DRMC', capacity: 120, registered: 40, description: 'Beginner-friendly problem solving contest for first-year students.' },
  { id: 'ai-workshop', festId: 'freshers-tech-fest-2027', title: 'AI Workshop', category: 'AI & ML', start: '2027-03-07T14:00:00', deadline: '2027-03-06T23:59:00', venue: 'Seminar Hall', capacity: 80, registered: 27, description: 'Explore generative AI tools and learn to use them responsibly.' },
];

export const getFest = (id: string) => FESTS.find((f) => f.id === id);
export const getEvent = (id: string) => EVENTS.find((e) => e.id === id);
export const getEventsByFest = (festId: string) => EVENTS.filter((e) => e.festId === festId);