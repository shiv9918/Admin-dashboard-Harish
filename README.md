# Content Hub - Headless CMS

A production-ready headless CMS built with React, Firebase, and modern web technologies. This CMS provides a complete content management solution with role-based access control, rich text editing, media management, and a powerful page builder.

## Features

### Core Features
- **Role-Based Authentication** - Admin and Editor roles with Firebase Auth
- **Rich Text Editor** - Quill-powered WYSIWYG editor with formatting options
- **Media Manager** - Upload, organize, and manage images and files with Firebase Storage
- **Page Builder** - Block-based content system (Text, Image, Video blocks)
- **SEO Management** - Built-in SEO fields (title, description, keywords)
- **Live Preview** - Side-by-side preview while editing
- **Activity Logs** - Track all content changes and user actions
- **Dashboard Analytics** - Overview of pages, media, and recent activity

### Technical Features
- Modern React 19 with hooks
- Firebase (Auth, Firestore, Storage)
- Shadcn/UI components with Tailwind CSS
- Responsive design (mobile-first)
- Real-time data synchronization
- Type-safe with Zod validation
- Toast notifications with Sonner

## Tech Stack

**Frontend:**
- React 19
- React Router v7
- Firebase SDK (Auth, Firestore, Storage)
- Quill Rich Text Editor
- Shadcn/UI + Tailwind CSS
- Sonner (Toast notifications)
- React Hook Form + Zod

**Backend:**
- FastAPI (Python)
- Firebase Admin SDK (optional)

**Database & Storage:**
- Firebase Firestore (NoSQL database)
- Firebase Storage (File storage)

## Getting Started

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Python** (v3.8 or higher)
3. **Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication, Firestore, and Storage

### Firebase Setup

#### 1. Get Firebase Web Config

1. Go to Firebase Console → Project Settings
2. Under "Your apps", click the Web icon (`</>`)
3. Register your app and copy the config
4. Add to `/app/frontend/.env`:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

#### 2. Enable Firebase Services

**Authentication:**
1. Go to Authentication → Sign-in method
2. Enable Email/Password
3. Add your first user:
   - Go to Authentication → Users
   - Click "Add user"
   - Email: `admin@example.com`
   - Password: `password123`

**Firestore Database:**
1. Go to Firestore Database → Create database
2. Start in production mode
3. Choose your region

**Storage:**
1. Go to Storage → Get started
2. Start in production mode
3. Choose your region

#### 3. Firestore Security Rules

Go to Firestore Database → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Pages collection
    match /pages/{pageId} {
      allow read: if true; // Public read for published pages
      allow create, update, delete: if isAuthenticated();
    }
    
    // Media collection
    match /media/{mediaId} {
      allow read: if true;
      allow create, delete: if isAuthenticated();
    }
    
    // Activity logs
    match /activity_logs/{logId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow delete: if isAdmin();
    }
  }
}
```

#### 4. Storage Security Rules

Go to Storage → Rules and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /media/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

### Installation

#### Frontend Setup

```bash
cd /app/frontend
yarn install
yarn start
```

The frontend will be available at `http://localhost:3000`

#### Backend Setup

```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The backend will be available at `http://localhost:8001`

### First Time Setup

1. **Create Admin User**
   - Go to Firebase Console → Authentication → Users
   - Add user: `admin@example.com` / `password123`

2. **Set User Role**
   - Go to Firestore Database
   - Create collection: `users`
   - Add document with ID = user's UID:
   ```json
   {
     "email": "admin@example.com",
     "role": "admin",
     "createdAt": "2025-01-XX"
   }
   ```

3. **Login to CMS**
   - Go to `http://localhost:3000/admin/login`
   - Login with: `admin@example.com` / `password123`

## Usage

### Admin Routes

- `/admin/login` - Login page
- `/admin/dashboard` - Main dashboard with analytics
- `/admin/pages` - Page management list
- `/admin/pages/new` - Create new page
- `/admin/pages/edit/:id` - Edit existing page
- `/admin/media` - Media library
- `/admin/settings` - Settings page

### Creating Pages

1. Go to `/admin/pages`
2. Click "New Page"
3. Fill in:
   - Title (required)
   - Slug (auto-generated from title)
   - Content (rich text editor)
   - SEO fields (title, description, keywords)
4. Add content blocks:
   - Text blocks
   - Image blocks (with URL)
   - Video blocks (with URL)
5. Toggle preview to see live changes
6. Save as draft or publish

### Managing Media

1. Go to `/admin/media`
2. Click "Upload Files"
3. Select one or multiple files
4. Files are uploaded to Firebase Storage
5. Switch between grid/list view
6. Click to copy URL
7. Delete unwanted files

### User Roles

- **Admin**: Full access to all features
- **Editor**: Can create and edit content

## Project Structure

```
/app
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx      # Main layout with sidebar
│   │   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   │   ├── ProtectedRoute.jsx   # Route protection
│   │   │   └── ui/                  # Shadcn components
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── lib/
│   │   │   └── firebase.js          # Firebase initialization
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Dashboard.jsx        # Dashboard
│   │   │   ├── Pages.jsx            # Page list
│   │   │   ├── PageEditor.jsx       # Page editor
│   │   │   ├── Media.jsx            # Media manager
│   │   │   └── Settings.jsx         # Settings
│   │   ├── App.js                   # Main app with routing
│   │   ├── App.css                  # App styles
│   │   └── index.css                # Global styles
│   ├── package.json
│   └── .env                         # Environment variables
├── backend/
│   ├── server.py                    # FastAPI server
│   ├── firebase_init.py             # Firebase Admin setup
│   ├── requirements.txt
│   └── .env
└── README.md
```

## Firestore Collections

### `users`
```json
{
  "email": "user@example.com",
  "role": "admin" | "editor",
  "createdAt": "timestamp"
}
```

### `pages`
```json
{
  "title": "Page Title",
  "slug": "page-url-slug",
  "content": "<p>Rich text content</p>",
  "status": "draft" | "published",
  "seoTitle": "SEO Title",
  "seoDescription": "SEO Description",
  "seoKeywords": "keyword1, keyword2",
  "blocks": [
    {
      "id": "unique-id",
      "type": "text" | "image" | "video",
      "content": "text content",
      "url": "media url"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `media`
```json
{
  "name": "filename.jpg",
  "url": "https://storage.googleapis.com/...",
  "type": "image/jpeg",
  "size": 123456,
  "storagePath": "media/timestamp_filename.jpg",
  "uploadedAt": "timestamp",
  "uploadedBy": "user-uid"
}
```

### `activity_logs`
```json
{
  "action": "Created page: Page Title",
  "userId": "user-uid",
  "timestamp": "timestamp"
}
```

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. Connect your Git repository
2. Set environment variables from `.env`
3. Build command: `yarn build`
4. Output directory: `build`

### Backend Deployment

1. Deploy to any Python hosting (Heroku, AWS, GCP, etc.)
2. Set environment variables
3. Use `uvicorn` or `gunicorn` for production

### Production Checklist

- [ ] Update Firebase security rules
- [ ] Enable Firebase App Check
- [ ] Add custom domain in Firebase Hosting
- [ ] Set up monitoring and alerts
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up backup strategy for Firestore
- [ ] Configure CDN for media files

## Customization

### Adding New Block Types

1. Update `PageEditor.jsx`
2. Add new block type to `addBlock()` function
3. Add rendering logic in blocks map
4. Update preview rendering

### Changing Design Theme

Edit `/app/frontend/src/index.css` to change:
- Color palette (CSS variables)
- Fonts (Google Fonts import)
- Spacing and sizing

### Adding New Features

1. Create new page component in `/src/pages/`
2. Add route in `App.js`
3. Add navigation item in `Sidebar.jsx`
4. Create Firestore collection if needed
5. Update security rules

## Troubleshooting

**Firebase Connection Issues:**
- Check if all environment variables are set correctly
- Verify Firebase project is active
- Check browser console for detailed errors

**Authentication Not Working:**
- Ensure Email/Password auth is enabled in Firebase
- Check if user exists in Authentication tab
- Verify Firestore security rules

**Media Upload Fails:**
- Check Storage is enabled in Firebase
- Verify Storage security rules
- Check file size limits

## License

MIT License - feel free to use this as a template for your projects.

## Support

For issues and questions:
- Check Firebase Console for errors
- Review browser console logs
- Check Firestore and Storage rules

---

Built with ❤️ using React, Firebase, and modern web technologies.
