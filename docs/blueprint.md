# **App Name**: SchoolFix

## Core Features:

- Secure Authentication: Implement Firebase Authentication (email/password) with role-based access control to ensure only authorized users can access the application.
- Report Submission: Enable students and teachers to submit reports including category, room number, damage type, description, and photo upload.
- Image Compression and Storage: Automatically compress images before uploading to Firebase Storage, ensuring efficient storage and faster loading times.
- Role-Based Access: Restrict data access based on user roles (student, teacher, admin) using Firestore security rules, ensuring students/teachers can only view their reports, while admins can view all.
- Admin Dashboard: Provide a secure admin interface to view pending, in-progress, and completed reports, and enable status updates, priority setting, and adding internal notes.
- Analytics Dashboard: Present data visualizations, showcasing most reported rooms, frequent damage categories, and report counts by status.
- Categorize Report with AI: Use an AI tool to categorize the report with the reporter's input as context. Suggested categories include: 'chair', 'fan', 'window', 'light', 'sanitation', 'other'.

## Style Guidelines:

- Primary color: Primary Blue: (#1F4FD8), evoking a sense of trust and reliability.
- Background color: Clean Neutral (#F7F9FC), providing a clean and calm backdrop.
- Accent color: A slightly more saturated blue-green (#4DB6AC), used for highlighting interactive elements and important actions.
- Font: 'PT Sans' sans-serif for headings and body text. PT Sans provides a modern and easily-readable user experience.
- Use a consistent set of icons to represent categories and status indicators, ensuring intuitive navigation and visual clarity.
- Design a mobile-first, responsive layout that adapts seamlessly to various screen sizes, ensuring optimal usability across devices.
- Implement subtle animations, such as smooth transitions and loading indicators, to enhance user engagement and provide feedback on actions.
- Status Colors: Pending: #FACC15 (Soft Yellow), In Progress: #38BDF8 (Sky Blue), Completed: #22C55E (Green).
- Priority Colors: Low: #22C55E (Green), Moderate: #FACC15 (Soft Yellow), Urgent: #EF4444 (Red).
- Category Accent Colors: Chairs: #64748B (Slate), Fans: #38BDF8 (Sky Blue), Windows: #0EA5E9 (Cyan), Lights: #FACC15 (Soft Yellow), Sanitation: #22C55E (Green), Others: #94A3B8 (Gray).