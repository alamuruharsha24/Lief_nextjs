# Lief-Track: Location-based Time Tracking System

## Overview
Lief-Track is a location-based clock-in/clock-out system designed for care workers. It integrates Firebase authentication and Firestore for real-time tracking and ensures staff members can only clock in at designated work locations. The system includes role-based access control, allowing managers to monitor staff activity while care workers track their shifts.

## Key Features

### Authentication System
- Email/password login and registration
- Google authentication integration
- Role-based access (manager vs. care worker)
- Protected routes based on user roles

### Manager Portal
1. **Analytics Dashboard**
   - Daily clock-ins visualization
   - Average hours worked per day
   - Total hours per staff member over the last week

2. **Staff Monitoring**
   - Real-time view of all clocked-in staff
   - Detailed clock-in/out records with timestamps and locations
   - Filtering by status, name, and date

3. **Perimeter Management**
   - Create location perimeters with custom radius
   - Use current location for quick setup
   - Manage multiple work locations

### Care Worker Portal
1. **Location-based Clock-in/out**
   - Geolocation verification against defined perimeters
   - Optional notes for both clock-in and clock-out
   - Real-time status indicators

2. **Activity History**
   - Personal clock-in/out history
   - Duration calculation for each shift
   - Chronological record of all activities

## Codebase Structure
```
.
├── README.md
├── app
│   ├── api
│   ├── globals.css
│   ├── layout.tsx
│   ├── login
│   ├── manager
│   ├── page.tsx
│   ├── signup
│   └── worker
├── components
│   ├── clock-in-out-history.tsx
│   ├── manager-dashboard.tsx
│   ├── perimeter-settings.tsx
│   ├── protected-route.tsx
│   ├── staff-table.tsx
│   ├── theme-provider.tsx
│   └── ui
├── components.json
├── contexts
│   └── auth-context.tsx
├── hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib
│   ├── firebase.ts
│   └── utils.ts
├── netlify.toml
├── next-env.d.ts
├── next.config.mjs
├── nextjs-app.zip
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public
│   ├── manifest.json
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
├── pwd-next.config.mjs
├── styles
│   └── globals.css
├── tailwind.config.ts
└── tsconfig.json

```

## Cloning & Usage
### Prerequisites
Ensure you have the following installed:
- Node.js (v18+ recommended)
- pnpm or npm
- Firebase project setup (Firestore, Authentication)

### Steps to Clone and Run Locally
1. Clone the repository:
   ```sh
   git clone https://github.com/alamuruharsha24/Lief_nextjs.git
   cd CLOCK-SYSTEM
   ```
2. Install dependencies:
   ```sh
   npm install  # or npm install --legacy-peer-deps
   ```
3. Set up Firebase:
   - Create a Firebase project
   - Configure Firestore and Authentication
   - Add `firebaseConfig.ts` with your Firebase credentials

4. Run the development server:
   ```sh
   npm run dev 
   ```
5. Open `http://localhost:3000` in your browser.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Backend:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Type Safety:** TypeScript
- **Deployment:** Netlify 



## Key Design Decisions
- **Next.js for Performance**: Utilized App Router for improved speed and efficiency.
- **Firebase for Real-Time Syncing**: Firestore enables instant updates across the application.
- **Role-Based Access Control (RBAC)**: Ensures only authorized users can access specific functionalities.
- **Progressive Web App (PWA) Support**: Allows offline use and mobile installation.

## Workflows & User Flow
### Authentication
- Users sign up and log in via Firebase authentication.
- Role assignment determines access to either the Manager or Care Worker dashboard.

### Clock-in/Clock-out
1. Care workers access the clock-in page.
2. Their location is verified against predefined work perimeters.
3. Upon verification, they can clock in and leave optional notes.
4. Clock-out follows the same process.

### Manager Monitoring
1. Managers can view real-time staff activity.
2. Analytics provide daily/hourly breakdowns.
3. History logs allow detailed reviews of each shift.

## Known Issues & Future Improvements
- **Enhance Form Validations:** Ensure proper data integrity in clock-in entries.
- **Optimize Performance:** Improve loading times for large data.
- **Expand PWA Capabilities:** Better offline mode support.
- **Additional Roles & Permissions:** Custom roles beyond manager and care worker.

## Conclusion
Lief-Track provides a complete solution for tracking care worker attendance with location verification, ensuring staff members clock in only when physically present at designated locations. This documentation covers the setup, functionality, and potential improvements for future iterations.

