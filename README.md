# TrustMart AI 🚀

TrustMart AI is a modern, AI-powered product review analysis platform designed to help users instantly gauge the authenticity and sentiment of e-commerce reviews. By leveraging machine learning, TrustMart filters out the noise and provides actionable insights for every product.

## ✨ Key Features

- **Fake Review Detection Engine:** A hybrid machine learning model (combining TF-IDF and Random Forest) that detects fake or bot-generated reviews using a combination of textual analysis and numerical features (review length, helpfulness ratio, rating normalization).
- **Sentiment Analysis & Insights:** Automatically categorizes reviews and generates human-readable AI insights explaining the sentiment breakdown (Positive, Neutral, Negative).
- **Comprehensive Trust Score:** Aggregates sentiment metrics and authenticity signals into a single, easy-to-understand product Trust Score.
- **Production-Grade Dashboard:** A highly interactive, dark-themed dashboard featuring glassmorphism, Framer Motion animations, Recharts data visualization, and fully responsive design.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 & Vite
- **Styling:** Tailwind CSS v4 (Custom design tokens & utility-first)
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
- **Fonts:** Inter (UI) & JetBrains Mono (Data/Scores)

### Backend
- **Framework:** FastAPI (Python)
- **Machine Learning:** Scikit-Learn, Pandas, NumPy, Joblib
- **Database:** SQLite & SQLAlchemy
- **Server:** Uvicorn

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies (assuming a `requirements.txt` exists, or install manually based on imports):
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🧠 Architecture Notes
- **Machine Learning:** The core fake-review detection models are pickled. If you need to retrain the model on new data, you can use the included `retrain_model.py` script which applies balanced class weights and a sophisticated multi-condition labeling heuristic.
- **API Integration:** The React frontend interfaces with the backend exclusively via REST endpoints, ensuring a clean decoupling of the client dashboard and the ML inference logic.

## 📝 Recent Updates
- Completely redesigned the frontend architecture to use Tailwind CSS v4 and a component-driven structure.
- Resolved ML class imbalance and prediction thresholding issues to accurately reflect fake review percentages across the platform.
- Fixed a known pickling/unpickling issue by aliasing the model class gracefully in the Uvicorn runtime environment.
screenshots:
<img width="1917" height="878" alt="Screenshot 2026-06-14 014540" src="https://github.com/user-attachments/assets/14e30672-2e03-4889-ad81-4d15aa18fee9" />
<img width="1587" height="587" alt="Screenshot 2026-06-14 014522" src="https://github.com/user-attachments/assets/37d18993-07b1-47e4-8337-a343354a1369" />
<img width="1918" height="950" alt="Screenshot 2026-06-14 014503" src="https://github.com/user-attachments/assets/08bd31bb-e9dd-435d-8877-55bc88268ccf" />
<img width="1912" height="897" alt="Screenshot 2026-06-14 014446" src="https://github.com/user-attachments/assets/55a359cf-856d-4070-8bac-90ba8acb87d6" />
<img width="1918" height="858" alt="Screenshot 2026-06-14 014414" src="https://github.com/user-attachments/assets/f20f7b04-fee7-43bc-a5d0-32c2854bb4e5" />
<img width="1918" height="906" alt="Screenshot 2026-06-14 014316" src="https://github.com/user-attachments/assets/2be6b06c-0898-4246-a090-4a944b1a125b" />
