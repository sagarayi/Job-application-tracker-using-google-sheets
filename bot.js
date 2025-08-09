// WhatsApp Job Application Tracker Bot with Google Sheets Integration
// This bot uses Twilio for WhatsApp and Google Sheets API for data storage

const express = require('express');
const { MessagingResponse } = require('twilio').twiml;
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: false }));

// Google Sheets Configuration
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Initialize Google Sheets
async function initializeGoogleSheet() {
    try {
        const serviceAccountAuth = new JWT({
            email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: GOOGLE_PRIVATE_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        
        let sheet = doc.sheetsByIndex[0];
        
        // Check if sheet has headers, if not add them
        const rows = await sheet.getRows();
        if (rows.length === 0) {
            await sheet.setHeaderRow([
                'Date Applied',
                'Company',
                'Role/Position',
                'Job Link',
                'Status',
                'Notes',
                'Applied Via'
            ]);
            
            // Format headers
            await sheet.loadCells('A1:G1');
            for (let col = 0; col < 7; col++) {
                const cell = sheet.getCell(0, col);
                cell.textFormat = { bold: true };
                cell.backgroundColor = { red: 0.9, green: 0.9, blue: 0.9 };
            }
            await sheet.saveUpdatedCells();
        }
        
        return sheet;
    } catch (error) {
        console.error('Error initializing Google Sheet:', error);
        throw error;
    }
}

// Extract company and job title from URL
async function extractJobInfo(url) {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        let company = '';
        let jobTitle = '';
        
        // Try different selectors based on common job sites
        if (url.includes('linkedin.com')) {
            jobTitle = $('h1').first().text().trim();
            company = $('.topcard__org-name-link').text().trim() || 
                     $('.job-details-jobs-unified-top-card__company-name').text().trim() ||
                     $('[data-test-id="job-details-company-name"]').text().trim();
        } else if (url.includes('indeed.com')) {
            jobTitle = $('[data-testid="jobsearch-JobInfoHeader-title"]').text().trim() || 
                      $('h1.jobsearch-JobInfoHeader-title').text().trim() ||
                      $('h1').first().text().trim();
            company = $('[data-testid="inlineHeader-companyName"]').text().trim() ||
                     $('.icl-u-lg-mr--sm').text().trim() ||
                     $('[data-testid="company-name"]').text().trim();
        } else if (url.includes('glassdoor.com')) {
            jobTitle = $('[data-test="job-title"]').text().trim() ||
                      $('h1').first().text().trim();
            company = $('[data-test="employer-name"]').text().trim() ||
                     $('[data-test="employer-short-name"]').text().trim();
        } else if (url.includes('lever.co')) {
            jobTitle = $('.posting-headline h2').text().trim() ||
                      $('h1').first().text().trim();
            company = $('.main-header-text a').text().trim() ||
                     $('.company-name').text().trim();
        } else if (url.includes('greenhouse.io')) {
            jobTitle = $('#header h1').text().trim() ||
                      $('h1').first().text().trim();
            company = $('#header .company-name').text().trim() ||
                     $('[data-mapped="true"]').first().text().trim();
        } else {
            // Generic extraction
            jobTitle = $('h1').first().text().trim() || 
                      $('title').text().split('|')[0].trim() ||
                      $('title').text().split('-')[0].trim();
            company = $('[class*="company"]').first().text().trim() ||
                     $('[class*="employer"]').first().text().trim() ||
                     $('[class*="organization"]').first().text().trim();
        }
        
        // Clean up extracted text
        jobTitle = jobTitle.replace(/\s+/g, ' ').trim();
        company = company.replace(/\s+/g, ' ').trim();
        
        return {
            company: company || 'Unknown Company',
            jobTitle: jobTitle || 'Unknown Position'
        };
    } catch (error) {
        console.error('Error extracting job info:', error);
        return {
            company: 'Unknown Company',
            jobTitle: 'Unknown Position'
        };
    }
}

// Add job application to Google Sheet
async function addJobApplication(company, role, jobLink, notes = '', appliedVia = 'WhatsApp Bot') {
    try {
        const sheet = await initializeGoogleSheet();
        
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        // Add new row
        await sheet.addRow({
            'Date Applied': currentDate,
            'Company': company,
            'Role/Position': role,
            'Job Link': jobLink,
            'Status': 'Applied',
            'Notes': notes,
            'Applied Via': appliedVia
        });
        
        return true;
    } catch (error) {
        console.error('Error adding job application to Google Sheet:', error);
        return false;
    }
}

// Get application statistics from Google Sheet
async function getApplicationStats() {
    try {
        const sheet = await initializeGoogleSheet();
        const rows = await sheet.getRows();
        
        const totalApps = rows.length;
        const thisWeek = rows.filter(row => {
            const appDate = new Date(row.get('Date Applied'));
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return appDate >= weekAgo;
        }).length;
        
        const thisMonth = rows.filter(row => {
            const appDate = new Date(row.get('Date Applied'));
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return appDate >= monthAgo;
        }).length;
        
        // Get recent applications (last 5)
        const recentApps = rows.slice(-5).reverse().map(row => ({
            date: row.get('Date Applied'),
            company: row.get('Company'),
            role: row.get('Role/Position'),
            status: row.get('Status')
        }));
        
        return {
            total: totalApps,
            thisWeek,
            thisMonth,
            recent: recentApps
        };
    } catch (error) {
        console.error('Error getting application stats:', error);
        return null;
    }
}

// Parse message and extract information
function parseMessage(message) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex);
    
    // Remove URLs from message to get additional text
    const textWithoutUrls = message.replace(urlRegex, '').trim();
    
    return {
        urls: urls || [],
        additionalText: textWithoutUrls
    };
}

// WhatsApp webhook endpoint
app.post('/webhook', async (req, res) => {
    const twiml = new MessagingResponse();
    const message = req.body;
    
    const incomingMessage = message.Body?.trim();
    const fromNumber = message.From;
    
    console.log(`Received message from ${fromNumber}: ${incomingMessage}`);
    
    if (!incomingMessage) {
        twiml.message('Please send a job posting URL or company/role information.');
        return res.type('text/xml').send(twiml.toString());
    }
    
    // Handle different message types
    if (incomingMessage.toLowerCase().includes('help')) {
        const helpMessage = `*Job Tracker Bot Help* 📝

Send me job information in these formats:

1️⃣ *Just a URL:*
   https://linkedin.com/jobs/view/123456

2️⃣ *URL with notes:*
   https://linkedin.com/jobs/view/123456
   Applied through referral

3️⃣ *Company and role:*
   Google - Software Engineer

4️⃣ *Company, role, and notes:*
   Apple - iOS Developer
   Remote position, 120k salary

Commands:
• *help* - Show this help
• *status* - Get summary of applications
• *sheet* - Get Google Sheet link`;

        twiml.message(helpMessage);
    } else if (incomingMessage.toLowerCase().includes('status')) {
        // Get application statistics
        try {
            const stats = await getApplicationStats();
            
            if (stats) {
                let statusMessage = `📊 *Application Summary*

📈 *Statistics:*
• Total Applications: *${stats.total}*
• This Week: *${stats.thisWeek}*
• This Month: *${stats.thisMonth}*

🕒 *Recent Applications:*`;
                
                stats.recent.forEach(app => {
                    statusMessage += `\n• ${app.date} - ${app.company} - ${app.role}`;
                });
                
                statusMessage += '\n\nSend "sheet" to get the Google Sheet link! 📊';
                twiml.message(statusMessage);
            } else {
                twiml.message('Error reading application data. Please check your Google Sheet configuration.');
            }
        } catch (error) {
            twiml.message('Error accessing Google Sheet. Please check your configuration.');
        }
    } else if (incomingMessage.toLowerCase().includes('sheet')) {
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}`;
        twiml.message(`📊 *Your Job Applications Google Sheet:*\n\n${sheetUrl}\n\nYou can view, edit, and share this sheet from anywhere!`);
    } else {
        // Process job application
        const parsed = parseMessage(incomingMessage);
        
        if (parsed.urls.length > 0) {
            // Handle URL-based submission
            const jobUrl = parsed.urls[0];
            
            twiml.message('🔍 Extracting job information from URL...');
            
            try {
                const jobInfo = await extractJobInfo(jobUrl);
                const success = await addJobApplication(
                    jobInfo.company,
                    jobInfo.jobTitle,
                    jobUrl,
                    parsed.additionalText,
                    'WhatsApp Bot'
                );
                
                if (success) {
                    const confirmMessage = `✅ *Job Application Tracked!*

*Company:* ${jobInfo.company}
*Role:* ${jobInfo.jobTitle}
*Date:* ${new Date().toLocaleDateString()}
*Notes:* ${parsed.additionalText || 'None'}

Added to your Google Sheet! 📊
Send "sheet" to view it.`;
                    
                    twiml.message(confirmMessage);
                } else {
                    twiml.message('❌ Error saving to Google Sheet. Please check your configuration.');
                }
            } catch (error) {
                twiml.message('❌ Error processing URL. Please check the link or try manual entry.');
            }
        } else {
            // Handle manual entry (Company - Role format)
            const parts = incomingMessage.split('\n');
            const mainLine = parts[0];
            const notes = parts.slice(1).join(' ').trim();
            
            if (mainLine.includes(' - ') || mainLine.includes(' – ')) {
                const separator = mainLine.includes(' - ') ? ' - ' : ' – ';
                const [company, role] = mainLine.split(separator, 2);
                
                if (company && role) {
                    const success = await addJobApplication(
                        company.trim(),
                        role.trim(),
                        '',
                        notes,
                        'WhatsApp Bot (Manual)'
                    );
                    
                    if (success) {
                        const confirmMessage = `✅ *Job Application Tracked!*

*Company:* ${company.trim()}
*Role:* ${role.trim()}
*Date:* ${new Date().toLocaleDateString()}
*Notes:* ${notes || 'None'}

Added to your Google Sheet! 📊
Send "sheet" to view it.`;
                        
                        twiml.message(confirmMessage);
                    } else {
                        twiml.message('❌ Error saving to Google Sheet. Please check your configuration.');
                    }
                } else {
                    twiml.message('Please use format: "Company - Role" or send a job URL.');
                }
            } else {
                twiml.message(`❓ I didn't understand that format. 

Try:
• Job URL: https://linkedin.com/jobs/view/123
• Manual entry: Google - Software Engineer
• Send "help" for more options`);
            }
        }
    }
    
    res.type('text/xml').send(twiml.toString());
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Bot is running!', 
        timestamp: new Date().toISOString(),
        googleSheetId: GOOGLE_SHEET_ID ? 'Configured' : 'Not configured'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`WhatsApp Job Tracker Bot running on port ${PORT}`);
    console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
    console.log(`Google Sheet ID: ${GOOGLE_SHEET_ID ? 'Configured' : 'NOT CONFIGURED - Please set GOOGLE_SHEET_ID'}`);
    
    // Test Google Sheets connection on startup
    if (GOOGLE_SHEET_ID && GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY) {
        initializeGoogleSheet()
            .then(() => console.log('✅ Google Sheets connection successful'))
            .catch(err => console.error('❌ Google Sheets connection failed:', err.message));
    } else {
        console.log('⚠️ Google Sheets not configured. Please set environment variables.');
    }
});