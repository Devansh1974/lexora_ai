<div align="center">
  <img src="https://placehold.co/800x200/6366F1/FFFFFF?text=LexoraAI&font=raleway" alt="LexoraAI Banner">
  <h1 align="center">LexoraAI - AI-Powered Meeting Summarizer</h1>
  <p align="center">
    Clarity from conversation. Instantly transform your meeting notes into concise, actionable summaries.
  </p>
  
  <!-- Badges -->
  <p align="center">
    <img src="https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb" alt="MERN Stack">
    <img src="https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge&logo=groq" alt="Groq AI">
    <img src="https://img.shields.io/badge/Google-OAuth-red?style=for-the-badge&logo=google" alt="Google OAuth">
    <img src="https://img.shields.io/badge/TailwindCSS-Styling-cyan?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS">
  </p>
</div>

---

## ✨ Features

LexoraAI is a full-stack application designed to streamline your workflow by leveraging the power of AI to analyze and summarize your meeting transcripts.

-   **🔐 Secure Google Authentication:** Login securely and effortlessly with your Google account. All your data is linked to your account and kept private.
-   **📄 File & Text Input:** Seamlessly upload `.txt` and `.docx` files or simply paste your transcript text directly into the application.
-   **🤖 AI-Powered Summarization:** Utilizes the lightning-fast Groq API to generate high-quality, structured summaries based on your instructions.
-   **📝 Editable Summaries:** The generated summary is fully editable, allowing you to make refinements and corrections before sharing.
-   **📧 Personalized Email Sharing:** Share your final summary via email, sent directly *from your own authenticated Gmail account*.
-   **🔗 Shareable Links:** Generate a unique, public link for any summary to easily share it with colleagues who don't have an account.
-   **🗂️ Personal History:** All your generated summaries are automatically saved to your private history, linked to your account.
-   **🎨 Modern, Animated UI:** A clean, professional user interface built with Tailwind CSS and Framer Motion, featuring a "glassmorphism" theme and smooth animations.

---

## 🛠️ Tech Stack

The application is built with a modern, robust, and scalable tech stack, organized by purpose.

-   **Frontend:**
    -   **Framework:** `React` `Vite`
    -   **Styling:** `Tailwind CSS`
    -   **Animation:** `Framer Motion`
    -   **UI Components:** `Headless UI`
    -   **Icons & Notifications:** `Lucide React` `react-hot-toast`
-   **Backend:**
    -   **Runtime & Framework:** `Node.js` `Express.js`
    -   **Database:** `MongoDB` `Mongoose`
-   **AI & Services:**
    -   **Language Model:** `Groq API`
    -   **Authentication:** `Passport.js` `Google OAuth 2.0`
    -   **Email Service:** `Gmail API`

---

## 📂 Project Structure

The codebase is organized into a clean, modular structure to separate concerns and improve maintainability.

-   📁 **client/** — Contains all Frontend React code
    -   📁 **src/**
        -   📁 **components/** — Reusable UI components (Header, Footer, etc.)
        -   📄 `App.jsx` — Main component, manages state and logic
        -   📄 `api.js` — Centralized Axios instance for API calls
        -   📄 `AuthContext.jsx` — Manages global user authentication state
        -   📄 `main.jsx` — Entry point, sets up routing
        -   📄 `SharedSummary.jsx` — The public page for viewing a shared summary
-   📁 **server/** — Contains all Backend Node.js code
    -   📁 **middleware/** — Custom middleware (e.g., requireLogin)
    -   📁 **models/** — Mongoose schemas (User, Summary)
    -   📁 **routes/** — API endpoint definitions (auth, summaries)
    -   📁 **services/** — Third-party service configurations (Passport.js)
    -   📄 `.env` — Environment variables (API keys, DB URI)
    -   📄 `server.js` — Main server entry point, ties everything together

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   npm
-   A MongoDB Atlas account (for the database)
-   A Google Cloud Platform account (for OAuth and Gmail API credentials)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/lexora-ai.git](https://github.com/your-username/lexora-ai.git)
    cd lexora-ai
    ```

2.  **Setup the Backend:**
    ```sh
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory and add the following variables:
    ```env
    MONGODB_URI="Your MongoDB Atlas connection string"
    GOOGLE_CLIENT_ID="Your Google OAuth Client ID"
    GOOGLE_CLIENT_SECRET="Your Google OAuth Client Secret"
    COOKIE_KEY="A long random string for session encryption"
    GROQ_API_KEY="Your Groq API key"
    ```

3.  **Setup the Frontend:**
    ```sh
    cd ../client
    npm install
    ```

### Running the Application

1.  **Start the backend server:**
    ```sh
    # From the /server directory
    npm run dev
    ```
2.  **Start the frontend development server:**
    ```sh
    # From the /client directory
    npm start
    ```
    The application will be available at `http://localhost:5173`.

---

## 🗺️ Future Roadmap

-   [ ] **Conversational Editing:** Allow users to refine summaries with natural language commands.
-   [ ] **Export Options:** Add functionality to export summaries as PDF, Markdown, or TXT files.
-   [ ] **Custom Prompts:** Allow users to save and manage their own prompt templates.
-   [ ] **Team Collaboration:** Introduce shared workspaces for teams.

---

## 👤 Author

**Devansh Singh**

-   **Email:** [devanshsingh1974@gmail.com](mailto:devanshsingh1974@gmail.com)
-   **LinkedIn:** [linkedin.com/in/devanshsingh2006](https://www.linkedin.com/in/devanshsingh2006/)
