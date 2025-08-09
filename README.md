# 📱 WhatsApp Job Application Tracker Bot

> A smart WhatsApp bot that automatically tracks your job applications in Google Sheets. Just send a job URL and let the bot extract company info, job title, and organize everything in a beautiful spreadsheet!

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)](https://sheets.google.com/)
[![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=Twilio&logoColor=white)](https://www.twilio.com/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/)

## 🌟 Features

- 🤖 **Smart URL Extraction** - Send any job posting URL, bot extracts company & role automatically
- 📊 **Google Sheets Integration** - All data synced to a Google Sheet you can access anywhere
- 📱 **WhatsApp Interface** - Simple, familiar messaging interface
- 📈 **Application Statistics** - Track your progress with detailed stats
- 🔍 **Multi-Platform Support** - Works with LinkedIn, Indeed, Glassdoor, Lever, Greenhouse, and more
- ✍️ **Manual Entry** - Quick "Company - Role" format for fast logging
- 🌐 **Cloud Ready** - Deploy to Heroku, Railway, or any cloud platform

## 🎯 Demo

Send a message like this:
```
https://linkedin.com/jobs/view/3234567890
Applied through referral, salary range 120-150k
```

And get a response like:
```
✅ Job Application Tracked!

Company: Google
Role: Senior Software Engineer
Date: 08/09/2025
Notes: Applied through referral, salary range 120-150k

Added to your Google Sheet! 📊
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- Twilio Account (free tier available)
- Google Cloud Project (free)
- ngrok (for local development)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/whatsapp-job-tracker.git
cd whatsapp-job-tracker
npm install
```

### 2. Google Sheets Setup
1. Create a [Google Sheet](https://sheets.google.com)
2. Set up [Google Cloud Console](https://console.cloud.google.com/) project
3. Enable Google Sheets API
4. Create Service Account and download JSON key
5. Share your Google Sheet with the service account email

### 3. Twilio WhatsApp Setup
1. Create [Twilio Account](https://console.twilio.com)
2. Set up WhatsApp Sandbox
3. Get Account SID and Auth Token

### 4. Environment Configuration
Create `.env` file:
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----"
PORT=3000
```

### 5. Run the Bot
```bash
# Development
npm run dev

# Production
npm start
```

### 6. Setup Webhook
```bash
# Install ngrok globally
npm install -g ngrok

# Expose local server
ngrok http 3000

# Configure webhook URL in Twilio Console
# https://your-ngrok-url.ngrok.io/webhook
```

## 💬 Usage Examples

| Command | Example | Description |
|---------|---------|-------------|
| **Job URL** | `https://linkedin.com/jobs/view/123` | Auto-extracts company and role |
| **Manual Entry** | `Google - Software Engineer` | Quick manual logging |
| **With Notes** | `Apple - iOS Developer`<br>`Remote, 130k salary` | Add additional context |
| **Statistics** | `status` | View application summary |
| **Sheet Access** | `sheet` | Get Google Sheet link |
| **Help** | `help` | Show all commands |

## 📊 Google Sheet Structure

The bot automatically creates and manages these columns:

| Column | Description | Example |
|--------|-------------|---------|
| Date Applied | Automatic timestamp | 08/09/2025 |
| Company | Extracted or manual | Google |
| Role/Position | Job title | Senior Software Engineer |
| Job Link | URL if provided | https://... |
| Status | Application status | Applied |
| Notes | Your additional notes | Applied through referral |
| Applied Via | Tracking method | WhatsApp Bot |

## 🌐 Supported Job Sites

- ✅ **LinkedIn Jobs** - Full extraction support
- ✅ **Indeed** - Company and title extraction
- ✅ **Glassdoor** - Company and title extraction
- ✅ **Lever** (Company career pages) - Full extraction
- ✅ **Greenhouse** (Company career pages) - Full extraction
- ✅ **Generic Sites** - Basic title extraction
- ✅ **Manual Entry** - Always works as fallback

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook` | POST | Twilio WhatsApp webhook |
| `/health` | GET | Health check and status |

## 📦 Project Structure

```
whatsapp-job-tracker/
├── 📄 bot.js                 # Main application
├── 📄 package.json           # Dependencies & scripts
├── 📄 .env                   # Environment variables
├── 📄 README.md              # This file
├── 📁 node_modules/          # Installed packages
└── 📄 .gitignore             # Git ignore rules
```

## 🚀 Deployment

### Heroku (Recommended)
```bash
# Install Heroku CLI
heroku create your-app-name
git push heroku main

# Set environment variables
heroku config:set TWILIO_ACCOUNT_SID=your_sid
heroku config:set TWILIO_AUTH_TOKEN=your_token
heroku config:set GOOGLE_SHEET_ID=your_sheet_id
heroku config:set GOOGLE_SERVICE_ACCOUNT_EMAIL=your_email
heroku config:set GOOGLE_PRIVATE_KEY="your_private_key"

# Update Twilio webhook to Heroku URL
```

### Railway
```bash
railway login
railway init
railway up
```
Set environment variables in Railway dashboard.

### DigitalOcean App Platform
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy

## 🔒 Security & Privacy

- ✅ Service account with minimal Google Sheets permissions
- ✅ Environment variables for all sensitive data
- ✅ Private Google Sheet (unless you choose to share)
- ✅ Secure webhook endpoints
- ✅ No data stored locally on the bot server

## 🛠️ Troubleshooting

### Common Issues

**"Google Sheets connection failed"**
- Verify service account email is added to sheet with Editor permissions
- Check `GOOGLE_PRIVATE_KEY` format (include `\n` for line breaks)
- Confirm `GOOGLE_SHEET_ID` from sheet URL

**"Bot not responding"**
- Check webhook URL in Twilio console
- Verify ngrok is running (local development)
- Check server logs for errors

**"URL extraction failed"**
- Some sites block automated requests
- Use manual entry: "Company - Role" format
- Bot will still save the URL for reference

### Getting Help

1. Check the [Issues](../../issues) page for similar problems
2. Review server logs: `heroku logs --tail` or console output
3. Test Google Sheets access manually in browser
4. Use Twilio webhook debugger

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
```bash
git clone https://github.com/yourusername/whatsapp-job-tracker.git
cd whatsapp-job-tracker
npm install
cp .env.example .env  # Add your credentials
npm run dev
```

### Adding New Job Sites
To add support for a new job site, modify the `extractJobInfo()` function in `bot.js`:

```javascript
} else if (url.includes('newjobsite.com')) {
    jobTitle = $('h1.job-title').text().trim();
    company = $('.company-name').text().trim();
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Twilio](https://twilio.com) for WhatsApp Business API
- [Google Sheets API](https://developers.google.com/sheets/api) for data storage
- [Cheerio](https://cheerio.js.org/) for web scraping
- [Express.js](https://expressjs.com/) for the web framework

## 📊 Statistics

![GitHub stars](https://img.shields.io/github/stars/yourusername/whatsapp-job-tracker?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/whatsapp-job-tracker?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/whatsapp-job-tracker)
![GitHub license](https://img.shields.io/github/license/yourusername/whatsapp-job-tracker)

---

**Made with ❤️ for job seekers everywhere. Happy job hunting! 🎯**

> ⭐ If this project helped you land a job, please consider giving it a star!