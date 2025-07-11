# Note Taking App - Decoupled Architecture

This project is a cross-platform note-taking application built with a decoupled frontend and backend.

## Project Structure

- `/apps/api`: A standalone Node.js (Express) API service.
- `/apps/web`: A Next.js frontend web application.

Each service is configured for independent deployment.

## Local Development

To run this project locally, you will need to run each service in a separate terminal.

### Running the API

1.  Navigate to the API directory:
    ```bash
    cd apps/api
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file by copying the example:
    ```bash
    cp .env.example .env
    ```
4.  Add your Supabase credentials to the `.env` file.
5.  Start the API server (it will run on port 3001 by default):
    ```bash
    npm start
    ```

### Running the Web App

1.  In a new terminal, navigate to the web app directory:
    ```bash
    cd apps/web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  The web app will automatically connect to the local API server running on port 3001 via the `NEXT_PUBLIC_API_URL` in the `.env.local` file.
4.  Start the web app (it will run on port 3000 by default):
    ```bash
    npm run dev
    ```

## Deployment

Each service can be deployed independently to a platform like Vercel.

-   **API Service**: Deploy the `apps/api` directory. Remember to set the necessary environment variables (Supabase credentials) in your Vercel project settings.
-   **Web App**: Deploy the `apps/web` directory. Set the `NEXT_PUBLIC_API_URL` environment variable in your Vercel project to the URL of your deployed API service.