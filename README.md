# ANTON: Intelligence Engine (v5.0 Pro)

ANTON is a high-performance, full-stack Intelligence Engine designed to transform raw text and PDF documents into actionable insights. It leverages Natural Language Processing (NLP) to deliver deep analytics on sentiment, readability, and factual subjectivity.

## 🚀 Live Demo
* **Frontend:** [https://anton-gilt-iota.vercel.app](https://anton-gilt-iota.vercel.app)
* **API Status:** [https://anton-backend-e4iz.onrender.com/](https://anton-backend-e4iz.onrender.com/)

## 🛠 Features
- **Deep NLP Analysis:** Scores text for Sentiment (Polarity), Subjectivity (Fact vs. Opinion), and Readability (Grade Level).
- **PDF Intelligence:** Native support for PDF document uploads and text extraction.
- **Animated Telemetry:** Interactive React dashboard with animated Recharts for data visualization.
- **Professional Reporting:** Generate and download branded PDF reports of any analysis using `jsPDF`.
- **User Registry:** Secure user accounts and historical data persistence.
- **Admin Panel:** Secret developer view to monitor system registry and user growth.

## 🏗 Tech Stack
- **Frontend:** React, Tailwind CSS, Lucide Icons, Recharts, jsPDF.
- **Backend:** FastAPI (Python), SQLAlchemy, SQLite.
- **NLP Libraries:** TextBlob, NLTK, Textstat.
- **Deployment:** Vercel (Frontend), Render (Backend).

## 💻 Local Setup
1. **Clone the Repo:**
   \`\`\`bash
   git clone [your-repo-url]
   cd "Insight Engine"
   \`\`\`

2. **Backend Setup:**
   \`\`\`bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python download_data.py
   uvicorn app.main:app --reload
   \`\`\`

3. **Frontend Setup:**
   \`\`\`bash
   cd ../frontend
   npm install
   npm run dev
   \`\`\`

## 📝 License
MIT - Created by Devansh Tyagi
