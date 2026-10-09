-- =====================================================================
-- YourClub: demo data
-- Run AFTER schema.sql and policies.sql. Safe to run more than once.
-- Dates are relative to today, so the demo fests are always upcoming.
-- Times are Bangladesh time (Asia/Dhaka).
-- Demo user accounts are created in Supabase Authentication (see README).
-- =====================================================================

-- ========================== ORGANIZATIONS ===========================

insert into public.organizations (id, name, slug, description) values
  ('b0000000-0000-4000-8000-000000000001', 'DRMC IT Club', 'drmc-it-club',
   'Programming, AI and web development activities for DRMC students.'),
  ('b0000000-0000-4000-8000-000000000002', 'DRMC Robotics Society', 'drmc-robotics-society',
   'Building robots, electronics projects and robotics competitions.'),
  ('b0000000-0000-4000-8000-000000000003', 'DRMC Science Club', 'drmc-science-club',
   'Experiments, science fairs and quizzes.')
on conflict (id) do nothing;

-- ============================== FESTS ===============================

insert into public.fests (id, organization_id, title, tagline, description, venue, start_date, end_date) values
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
   'Tech Carnival', 'Innovate. Compete. Create.',
   'The flagship technology festival with contests, workshops and a robotics challenge.',
   'DRMC Campus', current_date + 14, current_date + 17),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001',
   'Winter Tech Fest', 'Learn. Build. Grow.',
   'A winter fest with a hackathon, a tech quiz and hands-on cloud workshops.',
   'DRMC Campus', current_date + 45, current_date + 48),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001',
   'Freshers Tech Fest', 'Welcome. Explore. Belong.',
   'A beginner-friendly fest to welcome first-year students into the tech community.',
   'DRMC Campus', current_date + 75, current_date + 78),
  ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002',
   'Robo Expo', 'Build. Automate. Win.',
   'An expo of student robots with live demonstrations and competitions.',
   'Main Auditorium', current_date + 100, current_date + 102),
  ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000003',
   'Science Week', 'Discover. Experiment. Share.',
   'A week of experiments, exhibitions and science quizzes.',
   'Science Block', current_date + 130, current_date + 133)
on conflict (id) do nothing;

-- ============================== EVENTS ==============================
-- Columns: id, fest_id, title, description, category, venue,
--          start_time, end_time, registration_deadline, capacity, fee

insert into public.events
  (id, fest_id, title, description, category, venue, start_time, end_time, registration_deadline, capacity, fee)
values
  -- Tech Carnival
  ('d0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'AI Web Development Contest',
   'Build a smart club operations platform using any stack and any AI tools.',
   'Programming', 'Computer Lab 1',
   ((current_date + 15) + time '10:00') at time zone 'Asia/Dhaka',
   ((current_date + 15) + time '17:00') at time zone 'Asia/Dhaka',
   ((current_date + 13) + time '23:59') at time zone 'Asia/Dhaka',
   120, 0),
  ('d0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001',
   'Machine Learning Workshop',
   'Hands-on introduction to machine learning with Python and real datasets.',
   'AI & ML', 'Seminar Hall',
   ((current_date + 16) + time '14:00') at time zone 'Asia/Dhaka',
   ((current_date + 16) + time '17:00') at time zone 'Asia/Dhaka',
   ((current_date + 15) + time '23:59') at time zone 'Asia/Dhaka',
   80, 0),
  ('d0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001',
   'Robotics Challenge',
   'Line-follower and obstacle-course robot battle for teams of up to 3.',
   'Robotics', 'Main Auditorium',
   ((current_date + 17) + time '10:00') at time zone 'Asia/Dhaka',
   ((current_date + 17) + time '16:00') at time zone 'Asia/Dhaka',
   ((current_date + 15) + time '23:59') at time zone 'Asia/Dhaka',
   20, 100),
  ('d0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000001',
   'Gaming Tournament',
   'Squad-based esports tournament with prizes for the top 3 teams.',
   'Gaming', 'Gaming Zone, Block B',
   ((current_date + 17) + time '15:00') at time zone 'Asia/Dhaka',
   ((current_date + 17) + time '19:00') at time zone 'Asia/Dhaka',
   ((current_date + 16) + time '23:59') at time zone 'Asia/Dhaka',
   64, 50),

  -- Winter Tech Fest
  ('d0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000002',
   'Winter Hackathon',
   '24-hour hackathon to solve real campus problems with technology.',
   'Programming', 'Innovation Lab',
   ((current_date + 46) + time '09:00') at time zone 'Asia/Dhaka',
   ((current_date + 47) + time '09:00') at time zone 'Asia/Dhaka',
   ((current_date + 43) + time '23:59') at time zone 'Asia/Dhaka',
   100, 0),
  ('d0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000002',
   'Tech Quiz',
   'Fast-paced quiz on technology, science and internet culture.',
   'Quiz', 'Seminar Hall',
   ((current_date + 47) + time '11:00') at time zone 'Asia/Dhaka',
   ((current_date + 47) + time '13:00') at time zone 'Asia/Dhaka',
   ((current_date + 45) + time '23:59') at time zone 'Asia/Dhaka',
   150, 0),
  ('d0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000002',
   'Cloud & DevOps Workshop',
   'Deploy your first app with Git, CI/CD and free cloud tiers.',
   'Workshop', 'Computer Lab 2',
   ((current_date + 48) + time '10:00') at time zone 'Asia/Dhaka',
   ((current_date + 48) + time '13:00') at time zone 'Asia/Dhaka',
   ((current_date + 46) + time '23:59') at time zone 'Asia/Dhaka',
   60, 0),

  -- Freshers Tech Fest
  ('d0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000003',
   'Coding Challenge',
   'Beginner-friendly problem solving contest for first-year students.',
   'Programming', 'Computer Lab 1',
   ((current_date + 76) + time '10:00') at time zone 'Asia/Dhaka',
   ((current_date + 76) + time '13:00') at time zone 'Asia/Dhaka',
   ((current_date + 74) + time '23:59') at time zone 'Asia/Dhaka',
   120, 0),
  ('d0000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-000000000003',
   'AI Workshop',
   'Explore generative AI tools and learn to use them responsibly.',
   'AI & ML', 'Seminar Hall',
   ((current_date + 77) + time '14:00') at time zone 'Asia/Dhaka',
   ((current_date + 77) + time '17:00') at time zone 'Asia/Dhaka',
   ((current_date + 76) + time '23:59') at time zone 'Asia/Dhaka',
   80, 0)
on conflict (id) do nothing;