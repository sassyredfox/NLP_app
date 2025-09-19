# My-NLP-App - Advanced Natural Language Processing Application

A comprehensive full-stack web application that provides advanced Natural Language Processing (NLP) features through a unified and user-friendly interface with AI model integration and user authentication.

## 🚀 Features

### Core NLP Capabilities
- **Real-time Text Translation** - Translate between 100+ languages with high accuracy
- **Advanced Text Summarization** - Generate concise summaries with customizable length
- **Speech-to-Text** - Convert spoken words to text with live transcription
- **Text-to-Speech** - Transform text into natural-sounding speech
- **Operation History** - Track all NLP operations with search and filtering
- **PDF Export** - Download operation history as PDF documents

### Authentication & Database
- **User Authentication** - Secure login/register with JWT tokens
- **Database Integration** - Supabase backend with PostgreSQL
- **Session Management** - Secure session handling and token refresh
- **User Profiles** - Personal operation history and preferences
- PS - The database function hasn't been setup please config code accordingly

### AI Model Integration
- **Custom AI Models** - Integrate your own AI models via REST API (I have used a free DeepSeek and Google Cloud API to make the neccesary NLP tasks)

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **Supabase** for database and authentication
- **JWT** for token-based authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Database
- **PostgreSQL** via Supabase
- **Row Level Security (RLS)** for data protection
- **Optimized indexes** for performance

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Your AI model API endpoint 

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd my-nlp-app
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env

### 3. Start the Application
```bash
# Start the frontend (development)
npm run dev

# Start the backend server
cd server
npm install
npm run dev
```

## 🤖 AI Model Integration

### API Endpoints Your Model Should Provide

#### Translation
```
POST /translate
{
  "text": "Hello world",
  "source_language": "en",
  "target_language": "es"
}
```

#### Summarization
```
POST /summarize
{
  "text": "Long text to summarize...",
  "max_tokens": 150,
  "length_preference": "medium"
}
```

#### Speech-to-Text
```
POST /speech-to-text
Content-Type: multipart/form-data
- audio: [audio file]
- language: "en"
```

#### Text-to-Speech
```
POST /text-to-speech
{
  "text": "Text to convert to speech",
  "voice": "default",
}
```

## 🎨 Design Features

- **Apple-level aesthetics** with attention to detail
- **Responsive design** for all device sizes
- **Dark/Light theme** support
- **Smooth animations** and micro-interactions
- **Glass-morphism effects** and gradients
- **Accessible UI** with proper contrast ratios

## 📱 Responsive Design

The application is fully responsive with breakpoints optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1280px+)

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend Deployment
Deploy the server to any Node.js hosting platform:
```bash
cd server
npm start
```

### Environment Variables for Production
Update your production environment with:
- Supabase production credentials
- Your AI model production endpoint
- Secure JWT secret
- Production CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API integration guide
- Test with the included fallback system
- Ensure all environment variables are properly configured

## 🔄 Updates

The application is designed to be easily extensible:
- Add new NLP operations by extending the API
- Customize the UI theme and components
- Integrate additional AI model providers
- Add new authentication methods

---

Built with ❤️ using modern web technologies and best practices.