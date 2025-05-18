import { Project, createProject, createProjectsTable, db } from '../models/project';

// Sample project data (New Projects)
const sampleProjects: Project[] = [
  {
    title: 'KickMates - AI Community Sports Platform',
    description: 'An AI-powered community sports platform that lists and organizes recreational sporting events across Malaysia including football, badminton, pickleball, padel tennis, and more. The system intelligently matches players based on skill level, location preference, and availability. Features include automated team balancing, venue recommendations based on weather forecasts, integrated payment for court bookings, and post-game performance analytics.',
    image_url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Football/Sports theme
    client: 'KickMates Solutions Sdn. Bhd.',
    start_date: '2024-01-15',
    end_date: '2025-07-30', // Adjusted to reflect ongoing development or recent launch
    status: 'In Progress',
    budget: 275000,
    priority: 'High',
    payment_status: 'Partially Paid',
    tech_stack: JSON.stringify(['React Native', 'Node.js', 'Python (AI)', 'PostgreSQL', 'AWS', 'Stripe API', 'Google Maps API']),
    team_members: JSON.stringify([
      { id: 1, name: 'Ahmad Faizal', role: 'Project Manager', email: 'faizal.a@kickmates.com', avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
      { id: 2, name: 'Dr. Siti Aminah', role: 'Lead AI Developer', email: 'sitia@kickmates.com', avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg' },
      { id: 3, name: 'Rajesh Kumar', role: 'Lead Backend Developer', email: 'rajesh.k@kickmates.com', avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg' },
      { id: 4, name: 'Chen Wei Ling', role: 'Lead Frontend Developer', email: 'weiling.c@kickmates.com', avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
      { id: 5, name: 'Ismail Musa', role: 'UI/UX Designer', email: 'ismail.m@kickmates.com', avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
      { id: 6, name: 'Priya Sharma', role: 'QA Engineer', email: 'priya.s@kickmates.com', avatarUrl: 'https://randomuser.me/api/portraits/women/3.jpg' }
    ]),
    milestones: JSON.stringify([
      { id: 1, title: 'Platform Design & AI Concept Finalized', description: 'User flows, UI mockups, and AI matching logic defined.', due_date: '2024-03-15', status: 'Completed', completion_percentage: 100 },
      { id: 2, title: 'Core Backend & Database Setup', description: 'User authentication, event creation, and basic API endpoints.', due_date: '2024-06-30', status: 'Completed', completion_percentage: 100 },
      { id: 3, title: 'AI Matchmaking Engine (Alpha)', description: 'Initial version of skill-based player matching.', due_date: '2024-09-30', status: 'In Progress', completion_percentage: 70 },
      { id: 4, title: 'Frontend MVP (Mobile App)', description: 'Key features like event listing, joining, and profiles.', due_date: '2024-12-15', status: 'In Progress', completion_percentage: 40 },
      { id: 5, title: 'Payment Gateway Integration', description: 'Integration with local payment provider for bookings.', due_date: '2025-02-28', status: 'Planned', completion_percentage: 0 },
      { id: 6, title: 'Beta Launch to Target User Group', description: 'Limited release for feedback and testing.', due_date: '2025-05-15', status: 'Planned', completion_percentage: 0 },
      { id: 7, title: 'Full Public Launch', description: 'Official release of the KickMates platform.', due_date: '2025-07-30', status: 'Planned', completion_percentage: 0 }
    ]),
    phases: JSON.stringify([
      { 
        id: 1, name: 'Discovery & Planning', start_date: '2024-01-15', end_date: '2024-03-15', status: 'Completed', description: 'Requirement gathering, market analysis, and detailed project planning.',
        tasks: [
          { id: 1, title: 'Stakeholder workshops', status: 'Done', assignee: 'Ahmad Faizal', due_date: '2024-02-01' },
          { id: 2, title: 'Competitor analysis for sports platforms', status: 'Done', assignee: 'Ismail Musa', due_date: '2024-02-15' },
          { id: 3, title: 'AI matching algorithm research', status: 'Done', assignee: 'Dr. Siti Aminah', due_date: '2024-02-28' },
          { id: 4, title: 'Define MVP features & roadmap', status: 'Done', assignee: 'Ahmad Faizal', due_date: '2024-03-10' }
        ]
      },
      {
        id: 2, name: 'Core Development & AI Prototyping', start_date: '2024-03-16', end_date: '2024-09-30', status: 'In Progress', description: 'Building the backend, initial frontend, and the first version of the AI engine.',
        tasks: [
          { id: 5, title: 'Develop User Authentication System', status: 'Done', assignee: 'Rajesh Kumar', due_date: '2024-05-15' },
          { id: 6, title: 'Develop Event Management Module', status: 'Done', assignee: 'Rajesh Kumar', due_date: '2024-06-30' },
          { id: 7, title: 'Train initial AI model for player matching', status: 'In Progress', assignee: 'Dr. Siti Aminah', due_date: '2024-09-15' },
          { id: 8, title: 'Design basic app UI/UX', status: 'Done', assignee: 'Ismail Musa', due_date: '2024-06-01' }
        ]
      },
      {
        id: 3, name: 'Frontend Development & Feature Expansion', start_date: '2024-10-01', end_date: '2025-03-31', status: 'Planned', description: 'Developing the mobile application and integrating advanced features.',
        tasks: [
          { id: 9, title: 'Build React Native mobile app shell', status: 'To Do', assignee: 'Chen Wei Ling', due_date: '2024-11-15' },
          { id: 10, title: 'Integrate AI matching into app', status: 'To Do', assignee: 'Chen Wei Ling', due_date: '2025-01-15' },
          { id: 11, title: 'Implement payment gateway (frontend)', status: 'To Do', assignee: 'Chen Wei Ling', due_date: '2025-03-15' },
          { id: 12, title: 'Venue recommendation feature (weather based)', status: 'To Do', assignee: 'Rajesh Kumar', due_date: '2025-02-28' }
        ]
      },
      {
        id: 4, name: 'Testing, Beta & Launch', start_date: '2025-04-01', end_date: '2025-07-30', status: 'Planned', description: 'Comprehensive QA, beta testing, and public rollout.',
        tasks: [
          { id: 13, title: 'End-to-end system testing', status: 'To Do', assignee: 'Priya Sharma', due_date: '2025-04-30' },
          { id: 14, title: 'Conduct beta program with 100 users', status: 'To Do', assignee: 'Ahmad Faizal', due_date: '2025-06-15' },
          { id: 15, title: 'Marketing campaign for launch', status: 'To Do', assignee: 'Ahmad Faizal', due_date: '2025-07-15' },
          { id: 16, title: 'Deploy to app stores', status: 'To Do', assignee: 'Rajesh Kumar', due_date: '2025-07-25' }
        ]
      }
    ]),
    risks: JSON.stringify([
      { id: 1, title: 'AI Accuracy', description: 'Player matching may not be optimal initially, leading to user dissatisfaction.', impact: 'High', probability: 'Medium', mitigation_plan: 'Iterative AI model training with user feedback, offer manual override options.', status: 'Open' },
      { id: 2, title: 'User Adoption in Diverse Sports', description: 'Gaining traction across all listed sports beyond popular ones like football.', impact: 'Medium', probability: 'Medium', mitigation_plan: 'Targeted marketing for each sport community, partnerships with local sports clubs.', status: 'Open' },
      { id: 3, title: 'Payment Gateway Reliability', description: 'Issues with local payment gateway uptime or transaction failures.', impact: 'Medium', probability: 'Low', mitigation_plan: 'Select reputable gateway, implement robust error handling and support.', status: 'Not Started' }
    ]),
    documents: JSON.stringify([
      { id: 1, title: 'Project Charter & Scope', url: 'https://example.com/docs/kickmates_charter.pdf', type: 'Planning', uploaded_at: '2024-01-20' },
      { id: 2, title: 'AI Matchmaking Algorithm v1 Spec', url: 'https://example.com/docs/kickmates_ai_spec_v1.pdf', type: 'Technical', uploaded_at: '2024-03-10' },
      { id: 3, title: 'UI/UX Wireframes & Mockups', url: 'https://example.com/docs/kickmates_ui_ux.pdf', type: 'Design', uploaded_at: '2024-06-05' }
    ]),
    success_metrics: JSON.stringify([
      { id: 1, name: 'Monthly Active Users (MAU)', target: '10000 post-launch', current: '150 (dev testing)', unit: 'users', status: 'Planned' },
      { id: 2, name: 'Successful Events Organized per Week', target: '200 post-launch', current: '5 (internal tests)', unit: 'events', status: 'Planned' },
      { id: 3, name: 'Player Match Satisfaction Rate', target: '>80%', current: 'N/A', unit: 'percentage', status: 'Planned' }
    ]),
    client_feedback: "The progress on the AI matchmaking engine is very promising. We're excited for the beta launch to see it in action with real users."
  },
  {
    title: 'SuaraLokal - Multilingual AI Support Hub',
    description: 'An AI system that provides customer support in Bahasa Malaysia, English, Mandarin, Tamil, and other local dialects. This would be particularly valuable for businesses serving Malaysia\'s diverse population and could include voice recognition for different accents and dialects.',
    image_url: 'https://images.unsplash.com/photo-1558126319-c9feecbf57ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Diverse communication theme
    client: 'Axiata Digital Services',
    start_date: '2023-11-01',
    end_date: '2025-05-30',
    status: 'In Progress',
    budget: 450000,
    priority: 'High',
    payment_status: 'Partially Paid',
    tech_stack: JSON.stringify(['Python (NLP/NLU)', 'Rasa', 'Google Dialogflow', 'Azure Speech Services', 'Java (Backend)', 'React', 'Kubernetes']),
    team_members: JSON.stringify([
      { id: 1, name: 'Zarina Abdullah', role: 'Project Director', email: 'zarina.a@axiata.com', avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg' },
      { id: 2, name: 'Dr. Ken Lee', role: 'Lead NLP Scientist', email: 'ken.lee@axiata.com', avatarUrl: 'https://randomuser.me/api/portraits/men/4.jpg' },
      { id: 3, name: 'Anusha Pillai', role: 'Senior Backend Engineer', email: 'anusha.p@axiata.com', avatarUrl: 'https://randomuser.me/api/portraits/women/5.jpg' },
      { id: 4, name: 'Lim Jun Hao', role: 'Frontend Developer', email: 'junhao.lim@axiata.com', avatarUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
      { id: 5, name: 'Farah Adibah', role: 'Linguistics Specialist (BM, Dialects)', email: 'farah.a@axiata.com', avatarUrl: 'https://randomuser.me/api/portraits/women/6.jpg' },
      { id: 6, name: 'Viknesh Subramaniam', role: 'DevOps Engineer', email: 'viknesh.s@axiata.com', avatarUrl: 'https://randomuser.me/api/portraits/men/6.jpg' }
    ]),
    milestones: JSON.stringify([
      { id: 1, title: 'Data Collection & Annotation (BM, Eng)', description: 'Gathering and preparing datasets for initial languages.', due_date: '2024-02-28', status: 'Completed', completion_percentage: 100 },
      { id: 2, title: 'NLP Model for BM & English (Alpha)', description: 'Intent recognition and entity extraction for 2 core languages.', due_date: '2024-06-15', status: 'Completed', completion_percentage: 100 },
      { id: 3, title: 'Voice Recognition Integration (BM & Eng accents)', description: 'Testing with various Malaysian accents.', due_date: '2024-09-30', status: 'In Progress', completion_percentage: 60 },
      { id: 4, title: 'Mandarin & Tamil NLP Model Development', description: 'Expanding language support.', due_date: '2025-01-31', status: 'In Progress', completion_percentage: 30 },
      { id: 5, title: 'Pilot Program with Internal CS Team', description: 'Real-world testing and feedback.', due_date: '2025-04-15', status: 'Planned', completion_percentage: 0 }
    ]),
    phases: JSON.stringify([
      { 
        id: 1, name: 'Research & Foundational AI Development', start_date: '2023-11-01', end_date: '2024-06-15', status: 'Completed', description: 'Data gathering, initial NLP model training for core languages.',
        tasks: [
          { id: 1, title: 'Define supported dialects and accents', status: 'Done', assignee: 'Farah Adibah', due_date: '2023-12-15' },
          { id: 2, title: 'Secure voice and text data sources', status: 'Done', assignee: 'Zarina Abdullah', due_date: '2024-01-31' },
          { id: 3, title: 'Train NLU models for Bahasa Malaysia', status: 'Done', assignee: 'Dr. Ken Lee', due_date: '2024-05-30' },
          { id: 4, title: 'Train NLU models for English (Malaysian context)', status: 'Done', assignee: 'Dr. Ken Lee', due_date: '2024-06-15' }
        ]
      },
      {
        id: 2, name: 'Voice Integration & Expansion', start_date: '2024-06-16', end_date: '2025-01-31', status: 'In Progress', description: 'Integrating speech-to-text, text-to-speech and expanding to other major languages.',
        tasks: [
          { id: 5, title: 'Integrate Azure Speech for BM & English', status: 'In Progress', assignee: 'Anusha Pillai', due_date: '2024-09-15' },
          { id: 6, title: 'Data collection for Mandarin & Tamil', status: 'In Progress', assignee: 'Farah Adibah', due_date: '2024-10-30' },
          { id: 7, title: 'Develop Mandarin NLU model', status: 'To Do', assignee: 'Dr. Ken Lee', due_date: '2025-01-15' },
          { id: 8, title: 'Develop Tamil NLU model', status: 'To Do', assignee: 'Dr. Ken Lee', due_date: '2025-01-31' }
        ]
      },
      {
        id: 3, name: 'Platform Development & Pilot', start_date: '2025-02-01', end_date: '2025-05-30', status: 'Planned', description: 'Building the agent interface, CRM integrations, and conducting pilot tests.',
        tasks: [
          { id: 9, title: 'Develop agent dashboard', status: 'To Do', assignee: 'Lim Jun Hao', due_date: '2025-03-15' },
          { id: 10, title: 'Integrate with Salesforce CRM API', status: 'To Do', assignee: 'Anusha Pillai', due_date: '2025-04-01' },
          { id: 11, title: 'Setup Kubernetes for deployment', status: 'To Do', assignee: 'Viknesh Subramaniam', due_date: '2025-02-28' },
          { id: 12, title: 'Execute pilot program and gather feedback', status: 'To Do', assignee: 'Zarina Abdullah', due_date: '2025-05-15' }
        ]
      }
    ]),
    risks: JSON.stringify([
      { id: 1, title: 'Dialect Recognition Accuracy', description: 'High variability in local dialects may impact recognition and NLU accuracy.', impact: 'High', probability: 'High', mitigation_plan: 'Extensive dialect-specific data collection, continuous model refinement, human-in-the-loop for ambiguous cases.', status: 'Open' },
      { id: 2, title: 'Integration with Legacy Systems', description: 'Difficulty integrating with diverse client CRM or backend systems.', impact: 'Medium', probability: 'Medium', mitigation_plan: 'Develop flexible API connectors, offer on-premise deployment options if needed.', status: 'Open' },
      { id: 3, title: 'Data Privacy for Voice Data', description: 'Ensuring PDPA compliance for handling sensitive voice recordings.', impact: 'High', probability: 'Medium', mitigation_plan: 'Implement robust data anonymization, encryption, and clear user consent protocols.', status: 'Addressed' }
    ]),
    documents: JSON.stringify([
      { id: 1, title: 'Project SuaraLokal - PID', url: 'https://example.com/docs/suaralokal_pid.pdf', type: 'Planning', uploaded_at: '2023-11-10' },
      { id: 2, title: 'Linguistics Research Report - Malaysian Dialects', url: 'https://example.com/docs/suaralokal_linguistics.pdf', type: 'Research', uploaded_at: '2024-01-15' },
      { id: 3, title: 'AI Model Architecture (v1)', url: 'https://example.com/docs/suaralokal_ai_arch_v1.pdf', type: 'Technical', uploaded_at: '2024-05-20' },
      { id: 4, title: 'Data Privacy Impact Assessment (DPIA)', url: 'https://example.com/docs/suaralokal_dpia.pdf', type: 'Compliance', uploaded_at: '2024-03-01' }
    ]),
    success_metrics: JSON.stringify([
      { id: 1, name: 'First Call Resolution (FCR) Rate', target: '75% (AI assisted)', current: 'N/A', unit: 'percentage', status: 'Planned' },
      { id: 2, name: 'Average Handling Time (AHT) Reduction', target: '20%', current: 'N/A', unit: 'percentage', status: 'Planned' },
      { id: 3, name: 'Supported Language Accuracy (Intent Reco.)', target: '>90% for BM, Eng; >85% for Man, Tam', current: 'BM: 92%, Eng: 90% (Alpha)', unit: 'percentage', status: 'In Progress' },
      { id: 4, name: 'Customer Satisfaction (CSAT) with AI interaction', target: '>4.0/5.0', current: 'N/A', unit: 'score', status: 'Planned' }
    ]),
    client_feedback: "The initial NLU models for Bahasa Malaysia and English are performing beyond expectations. We are keen to see how the system handles the complexities of local accents and dialects during the voice integration phase."
  },
  {
    title: 'JomJalan - AI Personalised Malaysia Travel',
    description: 'An AI platform that creates personalized travel itineraries for exploring Malaysia based on interests, budget, and time constraints. It could recommend lesser-known destinations beyond the typical tourist spots and optimize routes considering local transportation options.',
    image_url: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Travel/Adventure theme
    client: 'JomJalan TravelTech Sdn. Bhd.',
    start_date: '2023-09-01',
    end_date: '2024-08-30',
    status: 'Completed',
    budget: 180000,
    priority: 'Medium',
    payment_status: 'Paid',
    tech_stack: JSON.stringify(['Python (Recommendation Engine)', 'Flask', 'React Native', 'Google Maps API', 'Firebase', 'Heroku']),
    team_members: JSON.stringify([
      { id: 1, name: 'Alia Hassan', role: 'Product Owner', email: 'alia.h@jomjalan.my', avatarUrl: 'https://randomuser.me/api/portraits/women/7.jpg' },
      { id: 2, name: 'Benny Tan', role: 'Lead AI/ML Engineer', email: 'benny.t@jomjalan.my', avatarUrl: 'https://randomuser.me/api/portraits/men/7.jpg' },
      { id: 3, name: 'Shanti Menon', role: 'Full Stack Developer', email: 'shanti.m@jomjalan.my', avatarUrl: 'https://randomuser.me/api/portraits/women/8.jpg' },
      { id: 4, name: 'Azrul Hakim', role: 'Mobile Developer (React Native)', email: 'azrul.h@jomjalan.my', avatarUrl: 'https://randomuser.me/api/portraits/men/8.jpg' },
      { id: 5, name: 'Chloe Lim', role: 'Content & Partnership Manager', email: 'chloe.l@jomjalan.my', avatarUrl: 'https://randomuser.me/api/portraits/women/9.jpg' }
    ]),
    milestones: JSON.stringify([
      { id: 1, title: 'POI Database Curation (Phase 1)', description: 'Aggregated 1000+ points of interest across Malaysia.', due_date: '2023-11-30', status: 'Completed', completion_percentage: 100 },
      { id: 2, title: 'Recommendation Algorithm v1 (Content-Based)', description: 'Initial algorithm based on user interests and POI tags.', due_date: '2024-01-31', status: 'Completed', completion_percentage: 100 },
      { id: 3, title: 'Mobile App Beta Launch (Android & iOS)', description: 'Released to 500 beta testers.', due_date: '2024-05-15', status: 'Completed', completion_percentage: 100 },
      { id: 4, title: 'Integration with Local Transport APIs', description: 'Real-time public transport data for route optimization.', due_date: '2024-07-15', status: 'Completed', completion_percentage: 100 },
      { id: 5, title: 'Official App Launch & Marketing Campaign', description: 'Public release on App Store and Play Store.', due_date: '2024-08-25', status: 'Completed', completion_percentage: 100 }
    ]),
    phases: JSON.stringify([
      { 
        id: 1, name: 'Content Aggregation & AI Foundation', start_date: '2023-09-01', end_date: '2024-01-31', status: 'Completed', description: 'Gathering travel data and building the core recommendation logic.',
        tasks: [
          { id: 1, title: 'Scrape/API integrate POI data', status: 'Done', assignee: 'Shanti Menon', due_date: '2023-10-31' },
          { id: 2, title: 'Develop POI tagging and categorization system', status: 'Done', assignee: 'Chloe Lim', due_date: '2023-11-15' },
          { id: 3, title: 'Design and train content-based filtering model', status: 'Done', assignee: 'Benny Tan', due_date: '2024-01-20' }
        ]
      },
      {
        id: 2, name: 'Mobile App Development & Beta Testing', start_date: '2024-02-01', end_date: '2024-05-30', status: 'Completed', description: 'Building the user-facing mobile application and gathering initial feedback.',
        tasks: [
          { id: 4, title: 'Develop React Native app UI/UX', status: 'Done', assignee: 'Azrul Hakim', due_date: '2024-04-01' },
          { id: 5, title: 'Integrate recommendation API with app', status: 'Done', assignee: 'Azrul Hakim', due_date: '2024-04-30' },
          { id: 6, title: 'Conduct closed beta testing program', status: 'Done', assignee: 'Alia Hassan', due_date: '2024-05-20' }
        ]
      },
      {
        id: 3, name: 'Feature Enhancement & Launch', start_date: '2024-06-01', end_date: '2024-08-30', status: 'Completed', description: 'Adding final features, optimizing, and launching publicly.',
        tasks: [
          { id: 7, title: 'Implement route optimization with transport data', status: 'Done', assignee: 'Benny Tan', due_date: '2024-07-10' },
          { id: 8, title: 'Setup analytics and performance monitoring', status: 'Done', assignee: 'Shanti Menon', due_date: '2024-07-30' },
          { id: 9, title: 'Execute launch marketing plan', status: 'Done', assignee: 'Chloe Lim', due_date: '2024-08-25' }
        ]
      }
    ]),
    risks: JSON.stringify([
      { id: 1, title: 'Outdated Travel Information', description: 'POIs or transport details may become outdated, affecting user experience.', impact: 'Medium', probability: 'Medium', mitigation_plan: 'Regular data updates from reliable sources, user reporting feature for outdated info.', status: 'Mitigated' },
      { id: 2, title: 'Competition', description: 'Competition from established travel planners like Google Maps, Klook, etc.', impact: 'High', probability: 'Medium', mitigation_plan: 'Focus on hyper-local recommendations, unique AI personalization, and community features.', status: 'Closed' },
      { id: 3, title: 'User Trust in AI Recommendations', description: 'Users might be hesitant to trust AI-generated itineraries fully.', impact: 'Low', probability: 'Medium', mitigation_plan: 'Transparent recommendation logic (explain "why"), user reviews for POIs, customizable itineraries.', status: 'Closed' }
    ]),
    documents: JSON.stringify([
      { id: 1, title: 'JomJalan Market Research Report', url: 'https://example.com/docs/jomjalan_market_research.pdf', type: 'Research', uploaded_at: '2023-09-15' },
      { id: 2, title: 'AI Recommendation Engine Design Doc', url: 'https://example.com/docs/jomjalan_ai_design.pdf', type: 'Technical', uploaded_at: '2023-12-10' },
      { id: 3, title: 'Mobile App User Guide', url: 'https://example.com/docs/jomjalan_user_guide.pdf', type: 'User Manual', uploaded_at: '2024-08-20' },
      { id: 4, title: 'Partnership Agreements (Tourism Boards)', url: 'https://example.com/docs/jomjalan_partnerships.pdf', type: 'Legal', uploaded_at: '2024-06-01' }
    ]),
    success_metrics: JSON.stringify([
      { id: 1, name: 'Daily Active Users (DAU)', target: '5000', current: '6200', unit: 'users', status: 'Exceeded' },
      { id: 2, name: 'Personalized Itineraries Generated per Day', target: '1000', current: '1350', unit: 'itineraries', status: 'Exceeded' },
      { id: 3, name: 'User Engagement (Avg. Session Time)', target: '15 minutes', current: '18 minutes', unit: 'time', status: 'On Track' },
      { id: 4, name: 'App Store Rating', target: '4.5 stars', current: '4.6 stars', unit: 'rating', status: 'On Track' }
    ]),
    client_feedback: "JomJalan has revolutionized how tourists and locals discover Malaysia! The AI-powered personalized itineraries are a massive hit, and we've seen incredible user growth since launch. The team delivered a fantastic product."
  },
  // --- Start of SME Digital Transformation Guide ---
  {
    title: 'DigitalNiaga - SME AI Transformation Suite',
    description: 'A tool designed to help Malaysian small and medium enterprises digitize their businesses with step-by-step guidance, document automation, regulatory compliance assistance, and connection to relevant government incentive programs.',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Business/Tech support theme
    client: 'SME Corp Malaysia & MDEC Initiative',
    start_date: '2024-03-01',
    end_date: '2025-09-30',
    status: 'In Progress',
    budget: 320000,
    priority: 'High',
    payment_status: 'Partially Paid',
    tech_stack: JSON.stringify(['Ruby on Rails', 'PostgreSQL', 'React', 'AWS (EC2, S3)', 'DocuSign API', 'Python (NLP for guidance)']),
    team_members: JSON.stringify([
        { id: 1, name: 'Nurul Aini', role: 'Project Lead', email: 'nurul.aini@digitalniaga.gov.my', avatarUrl: 'https://randomuser.me/api/portraits/women/10.jpg' },
        { id: 2, name: 'Dr. Faiz Ibrahim', role: 'AI & Process Automation Lead', email: 'faiz.i@digitalniaga.gov.my', avatarUrl: 'https://randomuser.me/api/portraits/men/10.jpg' },
        { id: 3, name: 'Kevin Low', role: 'Senior Full Stack Developer', email: 'kevin.low@digitalniaga.gov.my', avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg' },
        { id: 4, name: 'Siti Mariam', role: 'Business Analyst (SME Focus)', email: 'siti.m@digitalniaga.gov.my', avatarUrl: 'https://randomuser.me/api/portraits/women/11.jpg' },
        { id: 5, name: 'Arun Singh', role: 'Frontend Developer', email: 'arun.s@digitalniaga.gov.my', avatarUrl: 'https://randomuser.me/api/portraits/men/12.jpg' },
        { id: 6, name: 'Mei Fong Chan', role: 'Content & Compliance Specialist', email: 'meifong.c@digitalniaga.gov.my', avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg' }
    ]),
    milestones: JSON.stringify([
        { id: 1, title: 'SME Needs Assessment & Journey Mapping', description: 'Completed research on key SME pain points in digitalization.', due_date: '2024-05-30', status: 'Completed', completion_percentage: 100 },
        { id: 2, title: 'Core Platform & Guidance Module (Alpha)', description: 'Initial version of the step-by-step guidance system.', due_date: '2024-09-15', status: 'In Progress', completion_percentage: 75 },
        { id: 3, title: 'Document Automation Engine (Selected Docs)', description: 'Automated generation for 5 key business documents.', due_date: '2024-12-31', status: 'In Progress', completion_percentage: 40 },
        { id: 4, title: 'Govt. Incentive Database & API Integration', description: 'Connecting to relevant grant and support program information.', due_date: '2025-03-31', status: 'Planned', completion_percentage: 0 },
        { id: 5, title: 'Pilot Program with 50 SMEs', description: 'Testing the platform with a diverse group of SMEs.', due_date: '2025-07-15', status: 'Planned', completion_percentage: 0 }
    ]),
    phases: JSON.stringify([
        { 
            id: 1, name: 'Research & Prototyping', start_date: '2024-03-01', end_date: '2024-06-30', status: 'Completed', description: 'Understanding SME requirements and building initial prototypes for guidance.',
            tasks: [
                { id: 1, title: 'Conduct SME focus groups & surveys', status: 'Done', assignee: 'Siti Mariam', due_date: '2024-04-15' },
                { id: 2, title: 'Map common SME digitalization pathways', status: 'Done', assignee: 'Siti Mariam', due_date: '2024-05-15' },
                { id: 3, title: 'Develop prototype for AI guidance chatbot', status: 'Done', assignee: 'Dr. Faiz Ibrahim', due_date: '2024-06-20' }
            ]
        },
        {
            id: 2, name: 'Core Platform Development', start_date: '2024-07-01', end_date: '2025-01-31', status: 'In Progress', description: 'Building the main web platform, guidance engine, and initial document automation features.',
            tasks: [
                { id: 4, title: 'Develop Rails backend & database schema', status: 'In Progress', assignee: 'Kevin Low', due_date: '2024-09-30' },
                { id: 5, title: 'Implement React frontend for guidance modules', status: 'In Progress', assignee: 'Arun Singh', due_date: '2024-10-30' },
                { id: 6, title: 'Integrate NLP for interactive guidance', status: 'In Progress', assignee: 'Dr. Faiz Ibrahim', due_date: '2024-11-30' },
                { id: 7, title: 'Develop first set of document templates', status: 'To Do', assignee: 'Mei Fong Chan', due_date: '2024-12-15' }
            ]
        },
        {
            id: 3, name: 'Integrations & Pilot Program', start_date: '2025-02-01', end_date: '2025-08-31', status: 'Planned', description: 'Integrating with external services and running a pilot with SMEs.',
            tasks: [
                { id: 8, title: 'API integration for government incentive lookup', status: 'To Do', assignee: 'Kevin Low', due_date: '2025-03-30' },
                { id: 9, title: 'Setup and manage pilot program logistics', status: 'To Do', assignee: 'Nurul Aini', due_date: '2025-06-15' },
                { id: 10, title: 'Collect and analyze pilot feedback', status: 'To Do', assignee: 'Siti Mariam', due_date: '2025-08-15' }
            ]
        },
        {
            id: 4, name: 'Refinement & Public Launch', start_date: '2025-09-01', end_date: '2025-09-30', status: 'Planned', description: 'Finalizing the platform based on pilot feedback and preparing for public launch.',
            tasks: [
                { id: 11, title: 'Implement changes based on pilot program', status: 'To Do', assignee: 'Kevin Low', due_date: '2025-09-15' },
                { id: 12, title: 'Final UAT and launch preparation', status: 'To Do', assignee: 'Nurul Aini', due_date: '2025-09-25' }
            ]
        }
    ]),
    risks: JSON.stringify([
        { id: 1, title: 'Keeping Regulatory Info Current', description: 'Government regulations and incentives change frequently.', impact: 'High', probability: 'Medium', mitigation_plan: 'Dedicated content team for updates, direct feeds from government portals if possible.', status: 'Open' },
        { id: 2, title: 'SME User Adoption', description: 'SMEs may be slow to adopt new digital tools or find the platform complex.', impact: 'High', probability: 'Medium', mitigation_plan: 'User-friendly design, extensive tutorials & support, highlight clear benefits and success stories.', status: 'Open' },
        { id: 3, title: 'Integration with Diverse Govt Systems', description: 'Varied APIs and data formats across government agencies for incentive programs.', impact: 'Medium', probability: 'Medium', mitigation_plan: 'Phased integration approach, develop adaptable connectors.', status: 'Planned' }
    ]),
    documents: JSON.stringify([
        { id: 1, title: 'SME Digitalization Needs Analysis Report', url: 'https://example.com/docs/digitalniaga_sme_needs.pdf', type: 'Research', uploaded_at: '2024-06-05' },
        { id: 2, title: 'Platform Architecture Document', url: 'https://example.com/docs/digitalniaga_architecture.pdf', type: 'Technical', uploaded_at: '2024-07-15' },
        { id: 3, title: 'Compliance Checklist for SMEs (Draft)', url: 'https://example.com/docs/digitalniaga_compliance_draft.pdf', type: 'Guideline', uploaded_at: '2024-10-01' }
    ]),
    success_metrics: JSON.stringify([
        { id: 1, name: 'Number of Registered SMEs', target: '5000 in first year post-launch', current: 'N/A (Pre-pilot)', unit: 'SMEs', status: 'Planned' },
        { id: 2, name: 'Average Digital Maturity Score Improvement', target: '20% improvement for active users', current: 'N/A', unit: 'percentage', status: 'Planned' },
        { id: 3, name: 'Successful Incentive Applications via Platform', target: '500 in first year', current: 'N/A', unit: 'applications', status: 'Planned' },
        { id: 4, title: 'User Satisfaction Rate (SMEs)', target: '>85%', current: 'N/A', unit: 'percentage', status: 'Planned' }
    ]),
    client_feedback: "The initial findings from the SME Needs Assessment are very insightful. We believe DigitalNiaga will be a crucial tool for empowering Malaysian SMEs. The progress on the guidance module is encouraging."
  },
  // --- End of SME Digital Transformation Guide ---
  // --- Start of Local Talent Marketplace ---
  {
    title: 'KerjaLokal - Malaysian AI Talent Match',
    description: 'An AI-powered platform connecting Malaysian freelancers and professionals with businesses, using smart matching algorithms that understand the nuances of local qualifications, work culture expectations, and salary standards.',
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Team/Collaboration theme
    client: 'KerjaLokal Careers Sdn. Bhd.',
    start_date: '2023-07-15',
    end_date: '2024-05-30',
    status: 'Completed',
    budget: 195000,
    priority: 'High',
    payment_status: 'Paid',
    tech_stack: JSON.stringify(['Python (Django)', 'React', 'PostgreSQL', 'Elasticsearch', 'AWS', 'Scikit-learn']),
    team_members: JSON.stringify([
        { id: 1, name: 'Daniel Yong', role: 'CEO & Product Lead', email: 'daniel.y@kerjalokal.com.my', avatarUrl: 'https://randomuser.me/api/portraits/men/13.jpg' },
        { id: 2, name: 'Dr. Aishah Rahman', role: 'Lead Data Scientist (Matching AI)', email: 'aishah.r@kerjalokal.com.my', avatarUrl: 'https://randomuser.me/api/portraits/women/13.jpg' },
        { id: 3, name: 'Jason Lee', role: 'Senior Backend Developer', email: 'jason.l@kerjalokal.com.my', avatarUrl: 'https://randomuser.me/api/portraits/men/14.jpg' },
        { id: 4, name: 'Amira Binti Khalid', role: 'Frontend Developer', email: 'amira.k@kerjalokal.com.my', avatarUrl: 'https://randomuser.me/api/portraits/women/14.jpg' },
        { id: 5, name: 'Ravi Pillay', role: 'Marketing & Community Manager', email: 'ravi.p@kerjalokal.com.my', avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg' }
    ]),
    milestones: JSON.stringify([
        { id: 1, title: 'Platform MVP (Profiles, Search)', description: 'Core platform with user registration, profile creation, and basic job search.', due_date: '2023-10-30', status: 'Completed', completion_percentage: 100 },
        { id: 2, title: 'AI Matching Algorithm V1 (Skill-based)', description: 'Initial version of AI matching talent to job postings.', due_date: '2024-01-15', status: 'Completed', completion_percentage: 100 },
        { id: 3, title: 'Beta Launch & Feedback Collection', description: 'Launched to a select group of freelancers and employers.', due_date: '2024-03-15', status: 'Completed', completion_percentage: 100 },
        { id: 4, title: 'Public Launch & Initial Marketing', description: 'Platform publicly available with initial marketing campaigns.', due_date: '2024-05-20', status: 'Completed', completion_percentage: 100 }
    ]),
    phases: JSON.stringify([
        { 
            id: 1, name: 'Foundation & MVP Development', start_date: '2023-07-15', end_date: '2023-10-30', status: 'Completed', description: 'Building the core platform functionalities for users and job postings.',
            tasks: [
                { id: 1, title: 'Define user personas (freelancer, employer)', status: 'Done', assignee: 'Daniel Yong', due_date: '2023-08-01' },
                { id: 2, title: 'Develop database schema for profiles & jobs', status: 'Done', assignee: 'Jason Lee', due_date: '2023-08-30' },
                { id: 3, title: 'Build frontend for user registration & profiles', status: 'Done', assignee: 'Amira Binti Khalid', due_date: '2023-10-15' }
            ]
        },
        {
            id: 2, name: 'AI Matching & Beta Testing', start_date: '2023-11-01', end_date: '2024-03-15', status: 'Completed', description: 'Developing and integrating the AI matching algorithm, followed by beta testing.',
            tasks: [
                { id: 4, title: 'Research and select matching algorithm approach', status: 'Done', assignee: 'Dr. Aishah Rahman', due_date: '2023-11-30' },
                { id: 5, title: 'Train and test V1 of matching AI', status: 'Done', assignee: 'Dr. Aishah Rahman', due_date: '2024-01-10' },
                { id: 6, title: 'Integrate AI matching with search functionality', status: 'Done', assignee: 'Jason Lee', due_date: '2024-02-15' },
                { id: 7, title: 'Conduct beta program and gather user feedback', status: 'Done', assignee: 'Ravi Pillay', due_date: '2024-03-10' }
            ]
        },
        {
            id: 3, name: 'Public Launch & Iteration', start_date: '2024-03-16', end_date: '2024-05-30', status: 'Completed', description: 'Refining based on beta feedback and launching to the public.',
            tasks: [
                { id: 8, title: 'Implement key changes from beta feedback', status: 'Done', assignee: 'Amira Binti Khalid', due_date: '2024-04-15' },
                { id: 9, title: 'Final QA and performance testing', status: 'Done', assignee: 'Jason Lee', due_date: '2024-05-01' },
                { id: 10, title: 'Execute launch marketing strategy', status: 'Done', assignee: 'Ravi Pillay', due_date: '2024-05-20' }
            ]
        }
    ]),
    risks: JSON.stringify([
        { id: 1, title: 'Critical Mass Acquisition', description: 'Attracting enough freelancers and businesses simultaneously to make the platform viable.', impact: 'High', probability: 'High', mitigation_plan: 'Targeted launch campaigns for both sides, early adopter incentives, partnerships with industry bodies.', status: 'Mitigated' },
        { id: 2, title: 'AI Match Quality', description: 'Initial AI matches might not be relevant, leading to user churn.', impact: 'Medium', probability: 'Medium', mitigation_plan: 'Continuous learning model, user feedback loop for match relevance, transparent matching criteria.', status: 'Closed' },
        { id: 3, title: 'Competition from Global Platforms', description: 'Competing with established international freelance marketplaces.', impact: 'Medium', probability: 'Medium', mitigation_plan: 'Focus on local market nuances (language, qualifications, culture), local payment integrations, strong local community building.', status: 'Closed' }
    ]),
    documents: JSON.stringify([
        { id: 1, title: 'KerjaLokal Business Plan', url: 'https://example.com/docs/kerjalokal_bizplan.pdf', type: 'Strategy', uploaded_at: '2023-07-10' },
        { id: 2, title: 'AI Matching Algorithm Specification', url: 'https://example.com/docs/kerjalokal_ai_spec.pdf', type: 'Technical', uploaded_at: '2023-12-01' },
        { id: 3, title: 'User Persona Definitions', url: 'https://example.com/docs/kerjalokal_personas.pdf', type: 'Research', uploaded_at: '2023-08-05' },
        { id: 4, title: 'Beta Test Feedback Summary', url: 'https://example.com/docs/kerjalokal_beta_summary.pdf', type: 'Report', uploaded_at: '2024-03-20' }
    ]),
    success_metrics: JSON.stringify([
        { id: 1, name: 'Registered Freelancers', target: '10000 within 6 months', current: '12500', unit: 'users', status: 'Exceeded' },
        { id: 2, name: 'Registered Employers', target: '1000 within 6 months', current: '1350', unit: 'companies', status: 'Exceeded' },
        { id: 3, name: 'Successful Placements via Platform (Monthly)', target: '100', current: '150', unit: 'placements', status: 'On Track' },
        { id: 4, name: 'User Satisfaction (AI Match Relevance)', target: '75% satisfied', current: '82%', unit: 'percentage', status: 'On Track' }
    ]),
    client_feedback: "KerjaLokal has quickly become an indispensable tool for us to find specialized Malaysian talent. The AI matching considering local context is a game-changer. The platform is intuitive and the quality of candidates is high."
  },
  // --- End of Local Talent Marketplace ---
  // --- Start of Traffic & Public Transport Optimizer ---
  {
    title: 'GerakSenang - KL Urban Mobility AI',
    description: 'An application that uses AI to predict traffic patterns in Malaysian urban centers (particularly KL, Penang, and Johor Bahru) and suggests optimal routes combining public transport options, e-hailing services, and walking directions.',
    image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // City/Navigation theme
    client: 'Prasarana Malaysia Berhad & ThinkCity Initiative',
    start_date: '2024-02-01',
    end_date: '2025-08-31',
    status: 'In Progress',
    budget: 280000,
    priority: 'High',
    payment_status: 'Partially Paid',
    tech_stack: JSON.stringify(['Python (AI/ML)', 'GeoPandas', 'Flutter', 'Firebase', 'Google Maps Platform', 'RapidKL API', 'HERE Technologies API']),
    team_members: JSON.stringify([
        { id: 1, name: 'Indra Kumar', role: 'Project Manager (Transport Expert)', email: 'indra.k@geraksenang.my', avatarUrl: 'https://randomuser.me/api/portraits/men/16.jpg' },
        { id: 2, name: 'Dr. Vivian Chow', role: 'Lead AI Scientist (Traffic Prediction)', email: 'vivian.c@geraksenang.my', avatarUrl: 'https://randomuser.me/api/portraits/women/16.jpg' },
        { id: 3, name: 'Fahmi Abdullah', role: 'GIS Specialist & Data Engineer', email: 'fahmi.a@geraksenang.my', avatarUrl: 'https://randomuser.me/api/portraits/men/17.jpg' },
        { id: 4, name: 'Brenda Tan', role: 'Lead Mobile Developer (Flutter)', email: 'brenda.t@geraksenang.my', avatarUrl: 'https://randomuser.me/api/portraits/women/17.jpg' },
        { id: 5, name: 'Samuel David', role: 'Backend Developer', email: 'samuel.d@geraksenang.my', avatarUrl: 'https://randomuser.me/api/portraits/men/18.jpg' }
    ]),
    milestones: JSON.stringify([
        { id: 1, title: 'Data Source Integration (KL Traffic & PT)', description: 'Successfully integrated real-time traffic data and public transport schedules for Kuala Lumpur.', due_date: '2024-06-30', status: 'Completed', completion_percentage: 100 },
        { id: 2, title: 'Traffic Prediction Model (KL - Alpha)', description: 'Initial AI model for predicting KL traffic patterns with 1-hour accuracy.', due_date: '2024-10-30', status: 'In Progress', completion_percentage: 65 },
        { id: 3, title: 'Multi-modal Route Optimization Algorithm V1', description: 'Algorithm combining public transport, e-hailing, and walking.', due_date: '2025-01-31', status: 'Planned', completion_percentage: 10 },
        { id: 4, title: 'Mobile App Beta (KL Focus)', description: 'Beta version of the mobile app for Kuala Lumpur users.', due_date: '2025-05-15', status: 'Planned', completion_percentage: 0 },
        { id: 5, title: 'Expansion Plan for Penang & Johor Bahru', description: 'Data acquisition and model adaptation strategy for other cities.', due_date: '2025-07-31', status: 'Planned', completion_percentage: 0 }
    ]),
    phases: JSON.stringify([
        { 
            id: 1, name: 'Data Acquisition & Predictive Modeling (KL)', start_date: '2024-02-01', end_date: '2024-10-30', status: 'In Progress', description: 'Gathering data for Kuala Lumpur and developing the initial traffic prediction AI.',
            tasks: [
                { id: 1, title: 'Secure access to RapidKL and traffic data APIs', status: 'Done', assignee: 'Indra Kumar', due_date: '2024-03-15' },
                { id: 2, title: 'Develop data processing pipeline for GIS data', status: 'Done', assignee: 'Fahmi Abdullah', due_date: '2024-05-30' },
                { id: 3, title: 'Train and validate traffic prediction models (LSTM, ARIMA)', status: 'In Progress', assignee: 'Dr. Vivian Chow', due_date: '2024-10-15' }
            ]
        },
        {
            id: 2, name: 'Route Optimization & App Development (KL)', start_date: '2024-11-01', end_date: '2025-05-15', status: 'Planned', description: 'Developing the multi-modal routing engine and the user-facing mobile application for KL.',
            tasks: [
                { id: 4, title: 'Design multi-modal routing algorithm logic', status: 'To Do', assignee: 'Dr. Vivian Chow', due_date: '2024-12-15' },
                { id: 5, title: 'Develop Flutter mobile application UI/UX', status: 'To Do', assignee: 'Brenda Tan', due_date: '2025-02-28' },
                { id: 6, title: 'Integrate prediction and routing APIs into app', status: 'To Do', assignee: 'Samuel David', due_date: '2025-04-15' },
                { id: 7, title: 'Prepare for KL beta launch', status: 'To Do', assignee: 'Indra Kumar', due_date: '2025-05-10' }
            ]
        },
        {
            id: 3, name: 'Expansion & Refinement', start_date: '2025-05-16', end_date: '2025-08-31', status: 'Planned', description: 'Gathering feedback from KL beta, refining models, and planning expansion to other cities.',
            tasks: [
                { id: 8, title: 'Collect and analyze KL beta user feedback', status: 'To Do', assignee: 'Indra Kumar', due_date: '2025-06-30' },
                { id: 9, title: 'Data acquisition for Penang & Johor Bahru transport systems', status: 'To Do', assignee: 'Fahmi Abdullah', due_date: '2025-07-15' },
                { id: 10, title: 'Adapt prediction models for new cities', status: 'To Do', assignee: 'Dr. Vivian Chow', due_date: '2025-08-20' }
            ]
        }
    ]),
    risks: JSON.stringify([
        { id: 1, title: 'Real-time Data Accuracy & Availability', description: 'Dependency on third-party APIs for traffic and public transport data, which may have lag or outages.', impact: 'High', probability: 'Medium', mitigation_plan: 'Implement fallback data sources, data quality checks, and transparently communicate data freshness to users.', status: 'Open' },
        { id: 2, title: 'Complexity of Multi-modal Routing', description: 'Optimizing routes across diverse transport modes with real-time changes is computationally intensive.', impact: 'Medium', probability: 'High', mitigation_plan: 'Use efficient graph algorithms, heuristic approaches, and cloud scaling for computation.', status: 'Open' },
        { id: 3, title: 'User Adoption Over Existing Map Apps', description: 'Convincing users to switch from established apps like Google Maps or Waze.', impact: 'High', probability: 'Medium', mitigation_plan: 'Focus on unique value proposition (hyperlocal PT accuracy, AI predictions specific to Malaysian context), partnerships with local authorities.', status: 'Planned' }
    ]),
    documents: JSON.stringify([
        { id: 1, title: 'GerakSenang Project Proposal & Scope', url: 'https://example.com/docs/geraksenang_proposal.pdf', type: 'Planning', uploaded_at: '2024-02-10' },
        { id: 2, title: 'KL Traffic Data Analysis Report', url: 'https://example.com/docs/geraksenang_kl_traffic_report.pdf', type: 'Research', uploaded_at: '2024-07-05' },
        { id: 3, title: 'AI Traffic Prediction Model Architecture V1', url: 'https://example.com/docs/geraksenang_ai_model_v1.pdf', type: 'Technical', uploaded_at: '2024-09-15' }
    ]),
    success_metrics: JSON.stringify([
        { id: 1, name: 'Traffic Prediction Accuracy (KL, 1-hour ahead)', target: '85% MAPE', current: 'N/A (Model in training)', unit: 'percentage', status: 'In Progress' },
        { id: 2, name: 'Average Time Saved per Optimized Route (User Reported)', target: '15 minutes during peak hours', current: 'N/A', unit: 'time', status: 'Planned' },
        { id: 3, name: 'Daily Active Users (KL Beta)', target: '1000', current: 'N/A', unit: 'users', status: 'Planned' },
        { id: 4, title: 'Public Transport Mode Share Increase (among users)', target: '5% increase', current: 'N/A', unit: 'percentage', status: 'Planned' }
    ]),
    client_feedback: "The integration of various KL data sources is a significant first step. We are particularly interested in the accuracy of the AI traffic prediction model as it develops. The potential to optimize commutes in KL is immense."
  },
  // --- End of Traffic & Public Transport Optimizer ---
  // --- Start of Cultural Education Platform ---
  {
    title: 'WarisanKita - Malaysian Cultural AI Tutor',
    description: 'An adaptive learning system teaching Malaysian history, cultural practices, and languages with personalized content for different age groups. This could be marketed to schools, expatriates, and those interested in preserving cultural heritage.',
    image_url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80', // Education/Culture theme
    client: 'WarisanKita Foundation & Ministry of Education',
    start_date: '2023-11-01',
    end_date: '2025-05-30',
    status: 'In Progress',
    budget: 210000, // Adjusted budget
    priority: 'Medium',
    payment_status: 'Partially Paid',
    tech_stack: JSON.stringify(['Python (Django)', 'React', 'PostgreSQL', 'OpenEdX (modified)', 'H5P for interactive content', 'AWS']),
    team_members: JSON.stringify([
        { id: 1, name: 'Datin Sofia Aziz', role: 'Project Director (Cultural Historian)', email: 'sofia.a@warisankita.org', avatarUrl: 'https://randomuser.me/api/portraits/women/18.jpg' },
        { id: 2, name: 'Dr. Chen Long', role: 'Lead EdTech & AI Developer', email: 'chen.l@warisankita.org', avatarUrl: 'https://randomuser.me/api/portraits/men/19.jpg' },
        { id: 3, name: 'Ahmad Kamal', role: 'Senior Content Creator (History & Languages)', email: 'ahmad.k@warisankita.org', avatarUrl: 'https://randomuser.me/api/portraits/men/20.jpg' },
        { id: 4, name: 'Leela Krishnan', role: 'UI/UX Designer (Gamification Focus)', email: 'leela.k@warisankita.org', avatarUrl: 'https://randomuser.me/api/portraits/women/19.jpg' },
        { id: 5, name: 'Yap Swee Lin', role: 'Frontend Developer (React)', email: 'sweelin.y@warisankita.org', avatarUrl: 'https://randomuser.me/api/portraits/women/20.jpg' }
    ]),
    milestones: JSON.stringify([
        { id: 1, title: 'Content Framework & Curriculum Design (Primary School)', description: 'Finalized learning objectives and content outline for primary school module.', due_date: '2024-03-31', status: 'Completed', completion_percentage: 100 },
        { id: 2, title: 'Adaptive Learning Engine V1', description: 'Core engine for personalized content delivery based on learner progress.', due_date: '2024-08-30', status: 'In Progress', completion_percentage: 60 },
        { id: 3, title: 'Interactive Content Development (History Module 1)', description: 'First module of Malaysian history with H5P interactions.', due_date: '2024-11-30', status: 'In Progress', completion_percentage: 40 },
        { id: 4, title: 'Pilot Program with 5 Schools', description: 'Testing the primary school module in selected schools.', due_date: '2025-03-15', status: 'Planned', completion_percentage: 0 },
        { id: 5, title: 'Content Development for Expat Module (Phase 1)', description: 'Curating content on Malaysian culture and basic languages for expatriates.', due_date: '2025-05-15', status: 'Planned', completion_percentage: 0 }
    ]),
    phases: JSON.stringify([
        { 
            id: 1, name: 'Curriculum Development & AI Design', start_date: '2023-11-01', end_date: '2024-04-30', status: 'Completed', description: 'Defining learning paths, content structure, and the adaptive learning AI logic.',
            tasks: [
                { id: 1, title: 'Consult with educators and cultural experts', status: 'Done', assignee: 'Datin Sofia Aziz', due_date: '2024-01-15' },
                { id: 2, title: 'Develop detailed curriculum for primary history & culture', status: 'Done', assignee: 'Ahmad Kamal', due_date: '2024-03-15' },
                { id: 3, title: 'Design adaptive learning algorithms and user profiling', status: 'Done', assignee: 'Dr. Chen Long', due_date: '2024-04-20' }
            ]
        },
        {
            id: 2, name: 'Platform & Content Development (Primary Module)', start_date: '2024-05-01', end_date: '2024-12-31', status: 'In Progress', description: 'Building the learning platform and creating interactive content for the primary school module.',
            tasks: [
                { id: 4, title: 'Customize OpenEdX or build core LMS features', status: 'In Progress', assignee: 'Dr. Chen Long', due_date: '2024-08-15' },
                { id: 5, title: 'Develop interactive H5P content for History Module 1', status: 'In Progress', assignee: 'Ahmad Kamal', due_date: '2024-11-15' },
                { id: 6, title: 'Design gamified UI/UX for engagement', status: 'In Progress', assignee: 'Leela Krishnan', due_date: '2024-09-30' },
                { id: 7, title: 'Frontend development for learner dashboard', status: 'To Do', assignee: 'Yap Swee Lin', due_date: '2024-12-20' }
            ]
        },
        {
            id: 3, name: 'Pilot Testing & Expat Module Development', start_date: '2025-01-01', end_date: '2025-05-30', status: 'Planned', description: 'Running school pilots, gathering feedback, and starting content for the expatriate module.',
            tasks: [
                { id: 8, title: 'Coordinate and execute school pilot program', status: 'To Do', assignee: 'Datin Sofia Aziz', due_date: '2025-03-01' },
                { id: 9, title: 'Analyze pilot feedback and iterate on platform', status: 'To Do', assignee: 'Dr. Chen Long', due_date: '2025-04-15' },
                { id: 10, title: 'Begin content creation for Basic Bahasa Malaysia module (expats)', status: 'To Do', assignee: 'Ahmad Kamal', due_date: '2025-05-15' }
            ]
        }
    ]),
    risks: JSON.stringify([
        { id: 1, title: 'Cultural Sensitivity & Accuracy', description: 'Ensuring content is accurate, respectful, and representative of Malaysia\'s diverse cultures.', impact: 'High', probability: 'Medium', mitigation_plan: 'Rigorous review process involving multiple cultural experts and historians, community feedback channels.', status: 'Open' },
        { id: 2, title: 'Engaging Content for Diverse Age Groups', description: 'Creating content that is engaging for both young students and adult learners (expats).', impact: 'Medium', probability: 'High', mitigation_plan: 'Separate learning paths and content styles, age-appropriate gamification and interactivity.', status: 'Open' },
        { id: 3, title: 'Measuring Learning Outcomes Effectively', description: 'Difficulty in accurately assessing cultural understanding and appreciation via an online platform.', impact: 'Medium', probability: 'Medium', mitigation_plan: 'Use diverse assessment methods (quizzes, scenario-based questions, reflective prompts), focus on engagement and participation metrics as proxies.', status: 'Planned' }
    ]),
    documents: JSON.stringify([
        { id: 1, title: 'WarisanKita Project Charter', url: 'https://example.com/docs/warisankita_charter.pdf', type: 'Planning', uploaded_at: '2023-11-15' },
        { id: 2, title: 'Primary School Curriculum Design Document', url: 'https://example.com/docs/warisankita_primary_curriculum.pdf', type: 'Education', uploaded_at: '2024-04-05' },
        { id: 3, title: 'Adaptive Learning AI Logic V1', url: 'https://example.com/docs/warisankita_ai_logic_v1.pdf', type: 'Technical', uploaded_at: '2024-07-10' },
        { id: 4, title: 'Content Style & Ethics Guide', url: 'https://example.com/docs/warisankita_content_guide.pdf', type: 'Guideline', uploaded_at: '2024-02-01' }
    ]),
    success_metrics: JSON.stringify([
        { id: 1, name: 'Active Learners (Monthly)', target: '2000 (post-pilot)', current: 'N/A', unit: 'learners', status: 'Planned' },
        { id: 2, name: 'Course Completion Rate (Primary Module)', target: '60%', current: 'N/A', unit: 'percentage', status: 'Planned' },
        { id: 3, name: 'Learner Engagement Score (based on interactions, time spent)', target: '7/10', current: 'N/A', unit: 'score', status: 'Planned' },
        { id: 4, title: 'Positive Feedback from Educators/Parents', target: '>80% satisfaction', current: 'N/A', unit: 'percentage', status: 'Planned' }
    ]),
    client_feedback: "The curriculum framework for the primary school module is excellent and well-researched. We are eager to see the adaptive learning engine in action and how it personalizes the journey for young learners. This platform holds great promise for cultural preservation."
  },
  // --- End of Cultural Education Platform ---
  // --- Start of Healthcare Access Navigator ---
  {
    title: 'SihatLink - Malaysian Healthcare AI Guide',
    description: 'A platform that helps Malaysians find appropriate healthcare services based on their symptoms, insurance coverage, location, and preferences (public vs. private facilities). It could include appointment scheduling, medication reminders, and follow-up care management.',
    image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Healthcare/Tech theme
    client: 'SihatLink Technologies Sdn. Bhd. (with MOH support)',
    start_date: '2024-04-15',
    end_date: '2025-11-30',
    status: 'Planned', // Marked as Planned
    budget: 320000,
    priority: 'High',
    payment_status: 'Pending Funding',
    tech_stack: JSON.stringify(['Flutter (Mobile App)', 'Node.js (Express)', 'MongoDB', 'Python (AI Symptom Checker)', 'HL7 FHIR (for interoperability)', 'AWS (HIPAA/PDPA compliant)']),
    team_members: JSON.stringify([
        { id: 1, name: 'Dr. Halim Othman', role: 'CEO & Medical Lead', email: 'halim.o@sihatlink.my', avatarUrl: 'https://randomuser.me/api/portraits/men/21.jpg' },
        { id: 2, name: 'Priya Nair', role: 'CTO', email: 'priya.n@sihatlink.my', avatarUrl: 'https://randomuser.me/api/portraits/women/21.jpg' },
        { id: 3, name: 'Dr. Lee Wei Min', role: 'AI Specialist (Medical NLP)', email: 'weimin.l@sihatlink.my', avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg' },
        { id: 4, name: 'Aina Zulkifli', role: 'Lead Mobile Developer', email: 'aina.z@sihatlink.my', avatarUrl: 'https://randomuser.me/api/portraits/women/22.jpg' },
        { id: 5, name: 'Ramesh Govind', role: 'Healthcare Partnerships Manager', email: 'ramesh.g@sihatlink.my', avatarUrl: 'https://randomuser.me/api/portraits/men/23.jpg' },
        { id: 6, name: 'Tan Siew Kim', role: 'Compliance & Security Officer', email: 'siewkim.t@sihatlink.my', avatarUrl: 'https://randomuser.me/api/portraits/women/23.jpg' }
    ]),
    milestones: JSON.stringify([
        { id: 1, title: 'Secure Seed Funding & Establish Partnerships', description: 'Finalize initial funding round and MOUs with key hospitals/clinics.', due_date: '2024-07-31', status: 'Planned', completion_percentage: 0 },
        { id: 2, title: 'Healthcare Provider Database & API (Phase 1)', description: 'Database of 100+ clinics/hospitals in Klang Valley with basic API access.', due_date: '2024-11-30', status: 'Planned', completion_percentage: 0 },
        { id: 3, title: 'AI Symptom Checker (Alpha - Common Ailments)', description: 'Initial AI model for guiding users based on common symptoms.', due_date: '2025-03-31', status: 'Planned', completion_percentage: 0 },
        { id: 4, title: 'Appointment Booking Feature (Pilot Clinics)', description: 'Integration with booking systems of 5-10 pilot clinics.', due_date: '2025-07-31', status: 'Planned', completion_percentage: 0 },
        { id: 5, title: 'Mobile App Beta Launch (Klang Valley)', description: 'Limited beta release to users in Klang Valley.', due_date: '2025-10-31', status: 'Planned', completion_percentage: 0 }
    ]),
    phases: JSON.stringify([
        { 
            id: 1, name: 'Foundation & Partner Acquisition', start_date: '2024-04-15', end_date: '2024-08-31', status: 'Planned', description: 'Securing funding, legal compliance, and onboarding initial healthcare providers.',
            tasks: [
                { id: 1, title: 'Finalize business plan and investor deck', status: 'To Do', assignee: 'Dr. Halim Othman', due_date: '2024-05-30' },
                { id: 2, title: 'Develop PDPA & Healthcare Data Compliance framework', status: 'To Do', assignee: 'Tan Siew Kim', due_date: '2024-06-30' },
                { id: 3, title: 'Sign up initial cohort of partner clinics/hospitals', status: 'To Do', assignee: 'Ramesh Govind', due_date: '2024-08-15' }
            ]
        },
        {
            id: 2, name: 'Platform Development & AI Prototyping', start_date: '2024-09-01', end_date: '2025-04-30', status: 'Planned', description: 'Building the core platform, healthcare provider database, and the AI symptom checker.',
            tasks: [
                { id: 4, title: 'Develop secure backend and database for patient data', status: 'To Do', assignee: 'Priya Nair', due_date: '2024-12-31' },
                { id: 5, title: 'Train initial NLP model for symptom analysis', status: 'To Do', assignee: 'Dr. Lee Wei Min', due_date: '2025-03-15' },
                { id: 6, title: 'Design mobile app UI/UX for patient journey', status: 'To Do', assignee: 'Aina Zulkifli', due_date: '2025-01-31' }
            ]
        },
        {
            id: 3, name: 'Integration, Beta Testing & Launch Prep', start_date: '2025-05-01', end_date: '2025-11-30', status: 'Planned', description: 'Integrating booking systems, conducting beta tests, and preparing for a wider launch.',
            tasks: [
                { id: 7, title: 'Integrate with clinic EMR/booking systems (pilot group)', status: 'To Do', assignee: 'Priya Nair', due_date: '2025-07-15' },
                { id: 8, title: 'Develop medication reminder and follow-up features', status: 'To Do', assignee: 'Aina Zulkifli', due_date: '2025-08-30' },
                { id: 9, title: 'Conduct security audit and penetration testing', status: 'To Do', assignee: 'Tan Siew Kim', due_date: '2025-09-30' },
                { id: 10, title: 'Plan and execute beta launch in Klang Valley', status: 'To Do', assignee: 'Dr. Halim Othman', due_date: '2025-10-30' }
            ]
        }
    ]),
    risks: JSON.stringify([
        { id: 1, title: 'Accuracy of AI Symptom Checker', description: 'Risk of misdiagnosis or providing incorrect guidance. Clear disclaimers are crucial.', impact: 'High', probability: 'Medium', mitigation_plan: 'Use validated medical knowledge bases, continuous review by medical professionals, prominent disclaimers advising professional consultation.', status: 'Planned' },
        { id: 2, title: 'Healthcare Data Security & PDPA Compliance', description: 'Handling sensitive patient data requires robust security and strict adherence to PDPA.', impact: 'High', probability: 'High', mitigation_plan: 'End-to-end encryption, regular security audits, staff training on data privacy, clear data usage policies.', status: 'Planned' },
        { id: 3, title: 'Integration with Diverse Clinic Systems', description: 'Many clinics use different, often legacy, EMR or booking systems, making integration challenging.', impact: 'Medium', probability: 'High', mitigation_plan: 'Develop flexible API connectors, support standard interoperability formats like HL7 FHIR, phased integration approach.', status: 'Planned' },
        { id: 4, title: 'User Trust and Adoption', description: 'Patients and doctors may be hesitant to adopt a new digital health platform.', impact: 'Medium', probability: 'Medium', mitigation_plan: 'Ensure clinical validation, transparent processes, user-friendly interface, endorsements from medical bodies.', status: 'Planned' }
    ]),
    documents: JSON.stringify([
        { id: 1, title: 'SihatLink Business Plan & Investor Pitch Deck', url: 'https://example.com/docs/sihatlink_bizplan.pdf', type: 'Strategy', uploaded_at: '2024-05-20' }, // Assuming planned upload
        { id: 2, title: 'PDPA Compliance & Data Security Framework', url: 'https://example.com/docs/sihatlink_pdpa_security.pdf', type: 'Compliance', uploaded_at: '2024-06-15' }, // Assuming planned upload
        { id: 3, title: 'AI Symptom Checker - Medical Review Protocol', url: 'https://example.com/docs/sihatlink_ai_review_protocol.pdf', type: 'Guideline', uploaded_at: '2024-09-01' } // Assuming planned upload
    ]),
    success_metrics: JSON.stringify([
        { id: 1, name: 'Successful Healthcare Provider Matches', target: '5000 in first year post-launch', current: 'N/A', unit: 'matches', status: 'Planned' },
        { id: 2, name: 'Appointments Booked via Platform', target: '1000 in first year', current: 'N/A', unit: 'appointments', status: 'Planned' },
        { id: 3, name: 'User Adherence to Medication Reminders', target: '70% for opted-in users', current: 'N/A', unit: 'percentage', status: 'Planned' },
        { id: 4, title: 'Patient Satisfaction Score (Ease of Access)', target: '4.2/5.0', current: 'N/A', unit: 'score', status: 'Planned' }
    ]),
    client_feedback: "The vision for SihatLink is compelling and addresses a critical need in Malaysian healthcare. Securing the necessary partnerships and ensuring robust data security will be key to its success. The proposed phased approach is sensible."
  },
  // --- End of Healthcare Access Navigator ---
  // --- Start of Receipts AI ---
  {
    title: 'ResitKwik - AI Receipt & Invoice Parser',
    description: 'Transform receipts and invoices into organised data instantly with AI. Designed as a SaaS product for SMEs and individuals.',
    image_url: 'https://images.unsplash.com/photo-1583521268328-e4 Dunbar?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Finance/Data theme
    client: 'ResitKwik Solutions (SaaS)',
    start_date: '2023-03-01',
    end_date: '2023-12-20',
    status: 'Completed',
    budget: 95000,
    priority: 'Medium',
    payment_status: 'N/A (Internal Product)',
    tech_stack: JSON.stringify(['Python (Flask)', 'OpenCV', 'Tesseract OCR', 'spaCy (NLP)', 'React', 'Docker', 'AWS (Lambda, S3)']),
    team_members: JSON.stringify([
        { id: 1, name: 'Farhan Idris', role: 'Founder & Lead Developer', email: 'farhan.i@resitkwik.com', avatarUrl: 'https://randomuser.me/api/portraits/men/24.jpg' },
        { id: 2, name: 'Aisha Lim', role: 'AI/OCR Specialist', email: 'aisha.l@resitkwik.com', avatarUrl: 'https://randomuser.me/api/portraits/women/24.jpg' },
        { id: 3, name: 'Vikram Singh', role: 'Frontend Developer (React)', email: 'vikram.s@resitkwik.com', avatarUrl: 'https://randomuser.me/api/portraits/men/25.jpg' }
    ]),
    milestones: JSON.stringify([
        { id: 1, title: 'OCR Engine Evaluation & Selection', description: 'Compared Tesseract, Google Vision, Azure CV for accuracy and cost.', due_date: '2023-04-15', status: 'Completed', completion_percentage: 100 },
        { id: 2, title: 'Data Extraction Model V1 (Common Fields)', description: 'NLP model to extract merchant, date, total, items from receipts.', due_date: '2023-07-30', status: 'Completed', completion_percentage: 100 },
        { id: 3, title: 'Web App MVP with Upload & View', description: 'Users can upload receipts and view extracted data.', due_date: '2023-10-15', status: 'Completed', completion_percentage: 100 },
        { id: 4, title: 'API for Third-Party Integration (Beta)', description: 'API for developers to integrate ResitKwik into other apps.', due_date: '2023-11-30', status: 'Completed', completion_percentage: 100 },
        { id: 5, title: 'Public Launch of SaaS Product', description: 'Official launch of ResitKwik subscription plans.', due_date: '2023-12-15', status: 'Completed', completion_percentage: 100 }
    ]),
    phases: JSON.stringify([
        { 
            id: 1, name: 'Research & Core AI Development', start_date: '2023-03-01', end_date: '2023-07-30', status: 'Completed', description: 'Selecting OCR technology and developing the core data extraction AI.',
            tasks: [
                { id: 1, title: 'Gather diverse Malaysian receipt samples', status: 'Done', assignee: 'Aisha Lim', due_date: '2023-03-31' },
                { id: 2, title: 'Benchmark OCR engines on local receipts', status: 'Done', assignee: 'Aisha Lim', due_date: '2023-04-30' },
                { id: 3, title: 'Train NLP model for key field extraction', status: 'Done', assignee: 'Aisha Lim', due_date: '2023-07-15' }
            ]
        },
        {
            id: 2, name: 'Application Development (Web & API)', start_date: '2023-08-01', end_date: '2023-11-30', status: 'Completed', description: 'Building the user-facing web application and the developer API.',
            tasks: [
                { id: 4, title: 'Develop Python Flask backend for processing', status: 'Done', assignee: 'Farhan Idris', due_date: '2023-09-15' },
                { id: 5, title: 'Build React frontend for receipt management', status: 'Done', assignee: 'Vikram Singh', due_date: '2023-10-10' },
                { id: 6, title: 'Design and implement REST API endpoints', status: 'Done', assignee: 'Farhan Idris', due_date: '2023-11-20' }
            ]
        },
        {
            id: 3, name: 'Testing, Deployment & Launch', start_date: '2023-12-01', end_date: '2023-12-20', status: 'Completed', description: 'Final testing, deploying to cloud, and launching the SaaS product.',
            tasks: [
                { id: 7, title: 'Conduct end-to-end testing with various receipt types', status: 'Done', assignee: 'Aisha Lim', due_date: '2023-12-05' },
                { id: 8, title: 'Deploy application to AWS Lambda and S3', status: 'Done', assignee: 'Farhan Idris', due_date: '2023-12-10' },
                { id: 9, title: 'Setup subscription and payment system', status: 'Done', assignee: 'Farhan Idris', due_date: '2023-12-12' }
            ]
        }
    ]),
    risks: JSON.stringify([
        { id: 1, title: 'Accuracy with Diverse Receipt Formats', description: 'Malaysian receipts have highly variable formats, fonts, and languages (BM/Eng).', impact: 'High', probability: 'Medium', mitigation_plan: 'Continuously train AI on new formats, use image pre-processing, offer manual correction feature.', status: 'Mitigated' },
        { id: 2, title: 'Handling Handwritten or Faded Receipts', description: 'OCR accuracy drops significantly for poor quality or handwritten receipts.', impact: 'Medium', probability: 'Medium', mitigation_plan: 'Set clear expectations on supported receipt quality, explore advanced OCR for handwriting (future).', status: 'Closed' },
        { id: 3, title: 'Scalability for High Volume Processing', description: 'Ensuring the system can handle a large number of concurrent uploads and processing requests.', impact: 'Medium', probability: 'Low', mitigation_plan: 'Use serverless architecture (Lambda), optimize processing pipeline, load testing.', status: 'Closed' }
    ]),
    documents: JSON.stringify([
        { id: 1, title: 'ResitKwik - OCR Engine Evaluation Report', url: 'https://example.com/docs/resitkwik_ocr_eval.pdf', type: 'Research', uploaded_at: '2023-04-20' },
        { id: 2, title: 'Data Extraction Model Architecture', url: 'https://example.com/docs/resitkwik_extraction_model.pdf', type: 'Technical', uploaded_at: '2023-07-25' },
        { id: 3, title: 'ResitKwik API Documentation V1', url: 'https://api.resitkwik.com/docs', type: 'API Specification', uploaded_at: '2023-11-25' },
        { id: 4, title: 'User Guide & FAQ', url: 'https://resitkwik.com/help', type: 'User Manual', uploaded_at: '2023-12-14' }
    ]),
    success_metrics: JSON.stringify([
        { id: 1, name: 'Receipt Processing Accuracy (Key Fields)', target: '>90%', current: '92%', unit: 'percentage', status: 'Exceeded' },
        { id: 2, name: 'Average Processing Time per Receipt', target: '< 10 seconds', current: '8 seconds', unit: 'time', status: 'On Track' },
        { id: 3, name: 'Monthly Active Users (SaaS)', target: '500 after 3 months', current: '650', unit: 'users', status: 'Exceeded' },
        { id: 4, title: 'API Call Volume (Monthly)', target: '10000 after 3 months', current: '12000', unit: 'calls', status: 'On Track' }
    ]),
    client_feedback: "ResitKwik has been a lifesaver for our small business! It drastically cut down the time we spent on manual data entry for expense claims. The accuracy is surprisingly good even on some of our faded thermal receipts."
  }
  // --- End of Receipts AI ---
];

// Seed function
const seedProjects = async () => {
  // Check if the projects table already has data
  const checkData = () => {
    return new Promise<boolean>((resolve) => {
      // Ensure db object is available and query is correct
      if (!db) {
        console.error('Database connection (db) is not available.');
        resolve(true); // Assume data exists or cannot check, to prevent unintended seeding
        return;
      }
      db.get('SELECT COUNT(*) as count FROM projects', (err: Error | null, row: any) => {
        if (err) {
          console.error('Error checking data:', err);
          // If the table doesn't exist, it's fine, we'll create it.
          if (err.message.includes('no such table')) {
            resolve(false);
          } else {
            resolve(true); // On other errors, assume data exists to be safe
          }
        } else {
          resolve(row && row.count > 0);
        }
      });
    });
  };

  // Drop table function
  const dropTable = () => {
    return new Promise<void>((resolve, reject) => {
      if (!db) {
        console.error('Database connection (db) is not available for dropping table.');
        reject(new Error('DB not available'));
        return;
      }
      db.run('DROP TABLE IF EXISTS projects', (err: Error | null) => {
        if (err) {
          console.error('Error dropping projects table:', err);
          reject(err);
        } else {
          console.log('Projects table dropped successfully (if it existed).');
          resolve();
        }
      });
    });
  };

  try {
    // Always drop and recreate the table to ensure schema consistency with new fields/changes
    await dropTable();
    // createProjectsTable should be defined in your models/project file and correctly set up the schema
    // It needs to handle all fields present in the Project interface, including the JSON stringified ones as TEXT.
    await createProjectsTable(); 
    console.log('Projects table created successfully.');

    // After dropping and recreating, the table will be empty, so no need for checkData here if we always want to seed.
    // However, if createProjectsTable is idempotent and doesn't fail if table exists,
    // and you only want to seed if it's TRULY empty (e.g. first run ever), 
    // the original checkData logic could be used *before* drop/create.
    // For this script's purpose of replacing seed data, the current flow (drop, create, then seed) is correct.

    console.log('Seeding projects data...');
    for (const project of sampleProjects) {
      // createProject should be defined in your models/project file
      // It should correctly insert a Project object into the database.
      await createProject(project);
    }
    console.log('Projects data seeded successfully.');

  } catch (error) {
    console.error('Error seeding projects data:', error);
  }
};

// Export the seedProjects function
export { seedProjects };

// Execute seed function if this script is run directly
if (require.main === module) {
  // Ensure DB connection is established before seeding
  // This might involve calling an initialization function if 'db' is not auto-initialized
  // For example:
  // import { initializeDatabase } from '../models/database'; // Assuming you have this
  // initializeDatabase().then(() => {
  //   seedProjects()
  //     .then(() => {
  //       console.log('Projects data seed completed successfully.');
  //       if (db && typeof (db as any).close === 'function') {
  //         (db as any).close((err: Error | null) => {
  //           if (err) {
  //             console.error('Error closing DB:', err.message);
  //             process.exit(1);
  //           }
  //           console.log('Database connection closed.');
  //           process.exit(0);
  //         });
  //       } else {
  //         process.exit(0);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error during projects data seed:', error);
  //       process.exit(1);
  //     });
  // }).catch(dbError => {
  //   console.error('Failed to initialize database for seeding:', dbError);
  //   process.exit(1);
  // });

  // Simpler execution if db is globally available and initialized on import:
  seedProjects()
    .then(() => {
      console.log('Projects data seed process completed.');
      // Attempt to close the database if your db object has a close method (e.g., for sqlite3)
      if (db && typeof (db as any).close === 'function') {
        (db as any).close((err: Error | null) => {
          if (err) {
            return console.error('Error closing DB:',err.message);
          }
          console.log('Database connection closed.');
          process.exit(0);
        });
      } else {
        process.exit(0); // Exit if db doesn't have a close method or isn't defined
      }
    })
    .catch((error) => {
      console.error('Error during projects data seed execution:', error);
      process.exit(1);
    });
}