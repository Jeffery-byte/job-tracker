# Job Tracker - Modern Application Pipeline Management

A beautiful, modern React application for tracking job applications with a comprehensive 17-stage pipeline system.

## ✨ Features

- **17-Stage Pipeline System**: Track your applications from initial research to final decision
- **Beautiful Tile UI**: Modern card-based interface with smooth hover animations
- **Real-time Updates**: Powered by Supabase for instant synchronization
- **Visual Progress Tracking**: Progress bars and phase indicators for each application
- **Quick Actions**: Fast stage transitions with dropdown menus
- **Smart Filtering**: Filter by stage, phase, company, or custom search
- **Responsive Design**: Works perfectly on desktop and mobile
- **Company Logos**: Automatic company logo fetching and caching

## 🎯 Pipeline Stages

### Application Phase
- Company Research
- Application Prep
- Applied
- Application Under Review

### Interview Phase  
- Phone Screening
- Technical Assessment
- First Interview
- Second Interview
- Final Interview
- Reference Check

### Decision Phase
- Pending Decision
- Salary Negotiation
- Offer Received
- Offer Accepted

### Other
- Rejected
- Withdrew Application
- Position Filled

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/job-tracker.git
cd job-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
Run the SQL migration script in your Supabase dashboard:
```sql
-- See simple-pipeline-migration.sql for the complete script
```

5. Start the development server:
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🗄️ Database Schema

The application uses a single `applications` table with the following key columns:
- `pipeline_stage`: Current stage in the application process
- `stage_changed_date`: When the stage was last updated
- `expected_next_step`: Notes about what's expected next
- `interview_notes`: JSONB field for interview details

## 🎨 Tech Stack

- **Frontend**: React 18, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Animations**: CSS transitions and transforms

## 📖 Usage

1. **Add Applications**: Click the "+" button to add new job applications
2. **Track Progress**: Use the visual pipeline to see where each application stands
3. **Update Stages**: Use Quick Actions or the dropdown to move applications through stages
4. **Filter & Search**: Use the search bar and filters to find specific applications
5. **Monitor Timeline**: Track how long applications have been in each stage

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with Create React App
- UI components inspired by modern design principles
- Icons provided by Lucide React

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
