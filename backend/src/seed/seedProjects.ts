import { Project, createProject, createProjectsTable, db } from '../models/project';

// Sample project data
const sampleProjects: Project[] = [
  {
    title: 'E-commerce Website Redesign',
    description: 'Complete redesign of client\'s e-commerce platform with focus on mobile responsiveness and conversion optimization.',
    image_url: 'https://images.unsplash.com/photo-1661956602868-6ae368943878?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    client: 'FashionHub Inc.',
    start_date: '2023-01-15',
    end_date: '2023-04-30',
    status: 'Completed',
    budget: 85000,
    priority: 'High',
    payment_status: 'Paid',
    tech_stack: JSON.stringify(['React', 'Node.js', 'Express', 'MongoDB', 'AWS', 'Stripe API']),
    team_members: JSON.stringify([
      { id: 1, name: 'Sarah Johnson', role: 'Project Manager', email: 'sarah.j@example.com', avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 2, name: 'Alex Chen', role: 'Lead Developer', email: 'alex.c@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/35.jpg' },
      { id: 3, name: 'Jessica Wu', role: 'UI/UX Designer', email: 'jessica.w@example.com', avatarUrl: 'https://randomuser.me/api/portraits/women/63.jpg' },
      { id: 4, name: 'Michael Brown', role: 'Frontend Developer', email: 'michael.b@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg' },
      { id: 5, name: 'David Kim', role: 'Backend Developer', email: 'david.k@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/57.jpg' }
    ]),
    milestones: JSON.stringify([
      { id: 1, title: 'Project Kickoff', description: 'Initial meeting and project planning', due_date: '2023-01-20', status: 'Completed', completion_percentage: 100 },
      { id: 2, title: 'Design Approval', description: 'Client approval of UI/UX designs', due_date: '2023-02-15', status: 'Completed', completion_percentage: 100 },
      { id: 3, title: 'Alpha Release', description: 'Initial version with core features', due_date: '2023-03-10', status: 'Completed', completion_percentage: 100 },
      { id: 4, title: 'Beta Testing', description: 'User testing and feedback incorporation', due_date: '2023-04-05', status: 'Completed', completion_percentage: 100 },
      { id: 5, title: 'Final Launch', description: 'Production deployment and handover', due_date: '2023-04-25', status: 'Completed', completion_percentage: 100 }
    ]),
    phases: JSON.stringify([
      { 
        id: 1, 
        name: 'Discovery & Planning', 
        start_date: '2023-01-15', 
        end_date: '2023-01-25', 
        status: 'Completed',
        description: 'Gathering requirements and planning project scope',
        tasks: [
          { id: 1, title: 'Client interview', status: 'Done', assignee: 'Sarah Johnson', due_date: '2023-01-17' },
          { id: 2, title: 'Competitive analysis', status: 'Done', assignee: 'Jessica Wu', due_date: '2023-01-20' },
          { id: 3, title: 'Project timeline creation', status: 'Done', assignee: 'Sarah Johnson', due_date: '2023-01-25' }
        ]
      },
      { 
        id: 2, 
        name: 'Design', 
        start_date: '2023-01-26', 
        end_date: '2023-02-25', 
        status: 'Completed',
        description: 'Creating wireframes, mockups, and design system',
        tasks: [
          { id: 4, title: 'Wireframing', status: 'Done', assignee: 'Jessica Wu', due_date: '2023-02-05' },
          { id: 5, title: 'UI design', status: 'Done', assignee: 'Jessica Wu', due_date: '2023-02-15' },
          { id: 6, title: 'Design review meeting', status: 'Done', assignee: 'Sarah Johnson', due_date: '2023-02-18' },
          { id: 7, title: 'Design revisions', status: 'Done', assignee: 'Jessica Wu', due_date: '2023-02-25' }
        ]
      },
      { 
        id: 3, 
        name: 'Development', 
        start_date: '2023-02-26', 
        end_date: '2023-04-10', 
        status: 'Completed',
        description: 'Implementing frontend and backend functionality',
        tasks: [
          { id: 8, title: 'Frontend setup', status: 'Done', assignee: 'Michael Brown', due_date: '2023-03-05' },
          { id: 9, title: 'Backend API development', status: 'Done', assignee: 'David Kim', due_date: '2023-03-15' },
          { id: 10, title: 'Payment integration', status: 'Done', assignee: 'Alex Chen', due_date: '2023-03-25' },
          { id: 11, title: 'User authentication', status: 'Done', assignee: 'David Kim', due_date: '2023-04-01' },
          { id: 12, title: 'Product catalog implementation', status: 'Done', assignee: 'Michael Brown', due_date: '2023-04-10' }
        ]
      },
      { 
        id: 4, 
        name: 'Testing & Launch', 
        start_date: '2023-04-11', 
        end_date: '2023-04-30', 
        status: 'Completed',
        description: 'Quality assurance testing and production deployment',
        tasks: [
          { id: 13, title: 'QA testing', status: 'Done', assignee: 'Alex Chen', due_date: '2023-04-20' },
          { id: 14, title: 'Bug fixes', status: 'Done', assignee: 'Michael Brown', due_date: '2023-04-25' },
          { id: 15, title: 'Production deployment', status: 'Done', assignee: 'David Kim', due_date: '2023-04-28' },
          { id: 16, title: 'Client training', status: 'Done', assignee: 'Sarah Johnson', due_date: '2023-04-30' }
        ]
      }
    ]),
    risks: JSON.stringify([
      { id: 1, title: 'Integration Challenges', description: 'Potential issues with third-party API integrations', impact: 'Medium', probability: 'Medium', mitigation_plan: 'Early testing of API endpoints and building fallback mechanisms', status: 'Mitigated' },
      { id: 2, title: 'Timeline Pressure', description: 'Tight deadline for project completion before client\'s peak season', impact: 'High', probability: 'Medium', mitigation_plan: 'Add additional developer resources and prioritize core features', status: 'Closed' },
      { id: 3, title: 'Mobile Responsiveness', description: 'Ensuring consistent experience across all device sizes', impact: 'High', probability: 'Low', mitigation_plan: 'Mobile-first design approach and extensive cross-device testing', status: 'Closed' }
    ]),
    documents: JSON.stringify([
      { id: 1, title: 'Project Brief', url: 'https://example.com/docs/brief.pdf', type: 'Specification', uploaded_at: '2023-01-16' },
      { id: 2, title: 'UI Design System', url: 'https://example.com/docs/design.pdf', type: 'Design', uploaded_at: '2023-02-10' },
      { id: 3, title: 'API Documentation', url: 'https://example.com/docs/api.pdf', type: 'Specification', uploaded_at: '2023-03-05' },
      { id: 4, title: 'User Testing Report', url: 'https://example.com/docs/testing.pdf', type: 'Report', uploaded_at: '2023-04-12' }
    ]),
    success_metrics: JSON.stringify([
      { id: 1, name: 'Conversion Rate', target: '3.5%', current: '4.2%', unit: 'percentage', status: 'On Track' },
      { id: 2, name: 'Mobile Traffic', target: '60%', current: '68%', unit: 'percentage', status: 'On Track' },
      { id: 3, name: 'Page Load Time', target: '< 2 seconds', current: '1.8 seconds', unit: 'time', status: 'On Track' },
      { id: 4, name: 'Cart Abandonment', target: '< 25%', current: '22%', unit: 'percentage', status: 'On Track' }
    ]),
    client_feedback: "The redesigned website looks fantastic and has already improved our sales! The team was professional and responsive throughout the project."
  },
  {
    title: 'CRM System Integration',
    description: 'Implementation of custom CRM solution integrated with existing ERP systems to streamline customer management workflows.',
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    client: 'TechSolutions Ltd.',
    start_date: '2023-03-01',
    end_date: '2023-08-15',
    status: 'In Progress',
    budget: 120000,
    priority: 'High',
    payment_status: 'Partially Paid',
    tech_stack: JSON.stringify(['C#', '.NET', 'SQL Server', 'Azure', 'REST API', 'React']),
    team_members: JSON.stringify([
      { id: 1, name: 'Robert Taylor', role: 'Project Manager', email: 'robert.t@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, name: 'Emma Davis', role: 'Business Analyst', email: 'emma.d@example.com', avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg' },
      { id: 3, name: 'James Wilson', role: 'Lead Developer', email: 'james.w@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg' },
      { id: 4, name: 'Lisa Chen', role: 'Backend Developer', email: 'lisa.c@example.com', avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg' },
      { id: 5, name: 'Ryan Murphy', role: 'Frontend Developer', email: 'ryan.m@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/41.jpg' },
      { id: 6, name: 'Sophia Patel', role: 'QA Engineer', email: 'sophia.p@example.com', avatarUrl: 'https://randomuser.me/api/portraits/women/59.jpg' }
    ]),
    milestones: JSON.stringify([
      { id: 1, title: 'Requirements Gathering', description: 'Collect and document all business requirements', due_date: '2023-03-15', status: 'Completed', completion_percentage: 100 },
      { id: 2, title: 'System Architecture', description: 'Design system architecture and data flow', due_date: '2023-04-01', status: 'Completed', completion_percentage: 100 },
      { id: 3, title: 'Database Design', description: 'Design database schema and migrations', due_date: '2023-04-15', status: 'Completed', completion_percentage: 100 },
      { id: 4, title: 'Core Functionality', description: 'Implement core CRM functionalities', due_date: '2023-06-15', status: 'In Progress', completion_percentage: 75 },
      { id: 5, title: 'ERP Integration', description: 'Connect CRM with existing ERP systems', due_date: '2023-07-15', status: 'Not Started', completion_percentage: 0 },
      { id: 6, title: 'System Launch', description: 'Deploy to production and user training', due_date: '2023-08-10', status: 'Not Started', completion_percentage: 0 }
    ]),
    phases: JSON.stringify([
      { 
        id: 1, 
        name: 'Analysis', 
        start_date: '2023-03-01', 
        end_date: '2023-03-25', 
        status: 'Completed',
        description: 'Requirements gathering and business process analysis',
        tasks: [
          { id: 1, title: 'Stakeholder interviews', status: 'Done', assignee: 'Emma Davis', due_date: '2023-03-10' },
          { id: 2, title: 'Document existing processes', status: 'Done', assignee: 'Emma Davis', due_date: '2023-03-15' },
          { id: 3, title: 'Requirements documentation', status: 'Done', assignee: 'Robert Taylor', due_date: '2023-03-25' }
        ]
      },
      { 
        id: 2, 
        name: 'Design', 
        start_date: '2023-03-26', 
        end_date: '2023-04-20', 
        status: 'Completed',
        description: 'System architecture and database design',
        tasks: [
          { id: 4, title: 'System architecture design', status: 'Done', assignee: 'James Wilson', due_date: '2023-04-05' },
          { id: 5, title: 'Database schema design', status: 'Done', assignee: 'Lisa Chen', due_date: '2023-04-12' },
          { id: 6, title: 'API blueprint creation', status: 'Done', assignee: 'James Wilson', due_date: '2023-04-18' },
          { id: 7, title: 'UI mockups', status: 'Done', assignee: 'Ryan Murphy', due_date: '2023-04-20' }
        ]
      },
      { 
        id: 3, 
        name: 'Development', 
        start_date: '2023-04-21', 
        end_date: '2023-07-15', 
        status: 'In Progress',
        description: 'Implementation of CRM and integration with ERP',
        tasks: [
          { id: 8, title: 'Database implementation', status: 'Done', assignee: 'Lisa Chen', due_date: '2023-05-05' },
          { id: 9, title: 'User authentication', status: 'Done', assignee: 'Lisa Chen', due_date: '2023-05-15' },
          { id: 10, title: 'Customer module', status: 'Done', assignee: 'James Wilson', due_date: '2023-05-30' },
          { id: 11, title: 'Sales pipeline module', status: 'In Progress', assignee: 'James Wilson', due_date: '2023-06-15' },
          { id: 12, title: 'Reporting dashboard', status: 'In Progress', assignee: 'Ryan Murphy', due_date: '2023-06-30' },
          { id: 13, title: 'ERP system connector', status: 'To Do', assignee: 'Lisa Chen', due_date: '2023-07-15' }
        ]
      },
      { 
        id: 4, 
        name: 'Testing & Deployment', 
        start_date: '2023-07-16', 
        end_date: '2023-08-15', 
        status: 'Not Started',
        description: 'Quality assurance and production deployment',
        tasks: [
          { id: 14, title: 'Unit testing', status: 'To Do', assignee: 'Sophia Patel', due_date: '2023-07-25' },
          { id: 15, title: 'Integration testing', status: 'To Do', assignee: 'Sophia Patel', due_date: '2023-08-01' },
          { id: 16, title: 'User acceptance testing', status: 'To Do', assignee: 'Emma Davis', due_date: '2023-08-08' },
          { id: 17, title: 'Production deployment', status: 'To Do', assignee: 'James Wilson', due_date: '2023-08-12' },
          { id: 18, title: 'User training', status: 'To Do', assignee: 'Robert Taylor', due_date: '2023-08-15' }
        ]
      }
    ]),
    risks: JSON.stringify([
      { id: 1, title: 'ERP Integration Complexity', description: 'Legacy ERP systems may have limited API capabilities', impact: 'High', probability: 'High', mitigation_plan: 'Early API evaluation and potential middleware development', status: 'Open' },
      { id: 2, title: 'Data Migration Challenges', description: 'Transferring data from old systems may lead to inconsistencies', impact: 'Medium', probability: 'Medium', mitigation_plan: 'Develop robust validation scripts and conduct thorough testing', status: 'Open' },
      { id: 3, title: 'User Adoption', description: 'Staff resistance to new system and workflows', impact: 'High', probability: 'Medium', mitigation_plan: 'Early stakeholder involvement and comprehensive training program', status: 'Open' },
      { id: 4, title: 'Performance Issues', description: 'System may slow down with large data volumes', impact: 'Medium', probability: 'Low', mitigation_plan: 'Performance testing with production-like data volumes', status: 'Open' }
    ]),
    documents: JSON.stringify([
      { id: 1, title: 'Business Requirements Document', url: 'https://example.com/docs/brd.pdf', type: 'Specification', uploaded_at: '2023-03-20' },
      { id: 2, title: 'System Architecture', url: 'https://example.com/docs/architecture.pdf', type: 'Specification', uploaded_at: '2023-04-05' },
      { id: 3, title: 'Database Schema', url: 'https://example.com/docs/db_schema.pdf', type: 'Specification', uploaded_at: '2023-04-12' },
      { id: 4, title: 'API Documentation', url: 'https://example.com/docs/api_docs.pdf', type: 'Specification', uploaded_at: '2023-04-20' },
      { id: 5, title: 'User Guide Draft', url: 'https://example.com/docs/user_guide.pdf', type: 'Report', uploaded_at: '2023-06-10' }
    ]),
    success_metrics: JSON.stringify([
      { id: 1, name: 'Customer Response Time', target: '< 24 hours', current: '36 hours', unit: 'time', status: 'At Risk' },
      { id: 2, name: 'Sales Pipeline Visibility', target: '100%', current: '60%', unit: 'percentage', status: 'In Progress' },
      { id: 3, name: 'Data Entry Time', target: '< 5 minutes', current: '12 minutes', unit: 'time', status: 'Off Track' },
      { id: 4, name: 'Cross-department Data Sharing', target: '100%', current: '40%', unit: 'percentage', status: 'In Progress' }
    ]),
    client_feedback: "The project is progressing well. We're impressed with the team's technical expertise, but would like to see more frequent updates on progress."
  },
  {
    title: 'Marketing Analytics Dashboard',
    description: 'Development of real-time marketing analytics dashboard with KPI tracking and performance visualization.',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    client: 'MarketPro Agency',
    start_date: '2023-05-10',
    end_date: '2023-07-25',
    status: 'Completed',
    budget: 65000
  },
  {
    title: 'Mobile Banking Application',
    description: 'Design and development of secure mobile banking application with biometric authentication and payment features.',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    client: 'SecureBank Financial',
    start_date: '2023-02-15',
    end_date: '2023-09-30',
    status: 'In Progress',
    budget: 180000
  },
  {
    title: 'Supply Chain Optimization',
    description: 'Implementation of AI-driven supply chain optimization solution to reduce costs and improve delivery times.',
    image_url: 'https://images.unsplash.com/photo-1566363248831-347a2a4cb54b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    client: 'GlobalLogistics Inc.',
    start_date: '2023-04-01',
    end_date: '2023-12-15',
    status: 'Planned',
    budget: 210000
  },
  {
    title: 'Healthcare Patient Portal',
    description: 'Development of HIPAA-compliant patient portal for medical records access and appointment scheduling.',
    image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    client: 'MediCare Systems',
    start_date: '2023-06-10',
    end_date: '2024-01-31',
    status: 'In Progress',
    budget: 145000
  }
];

// Seed function
const seedProjects = async () => {
  // Check if the projects table already has data
  const checkData = () => {
    return new Promise<boolean>((resolve) => {
      db.get('SELECT COUNT(*) as count FROM projects', (err, row: any) => {
        if (err) {
          console.error('Error checking data:', err);
          resolve(false);
        } else {
          resolve(row && row.count > 0);
        }
      });
    });
  };

  // First recreate the table to ensure we have all the new fields
  const dropTable = () => {
    return new Promise<void>((resolve, reject) => {
      db.run('DROP TABLE IF EXISTS projects', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  try {
    await dropTable();
    await createProjectsTable();
    
    const hasData = await checkData();
    
    if (!hasData) {
      console.log('Seeding projects data...');
      for (const project of sampleProjects) {
        await createProject(project);
      }
      console.log('Projects data seeded successfully');
    } else {
      console.log('Projects data already exists, skipping seed');
    }
  } catch (error) {
    console.error('Error seeding projects data:', error);
  }
};

// Execute seed function
seedProjects(); 