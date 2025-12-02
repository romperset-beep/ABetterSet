---
description: How to deploy the application to Vercel via GitHub
---

This workflow guides you through the process of deploying your application to Vercel for a durable, professional setup.

1.  **Commit Changes**: Save your current work to Git.
    ```bash
    git add .
    git commit -m "feat: Update dashboard, sidebar, and global stock features"
    ```

2.  **Push to GitHub**: Send your code to the remote repository.
    ```bash
    git push origin main
    ```
    *Note: If this is your first time pushing or if the remote isn't set up, we might need to configure it.*

3.  **Deploy on Vercel**:
    *   Go to [vercel.com](https://vercel.com) and log in (or sign up).
    *   Click **"Add New..."** -> **"Project"**.
    *   Select **"Continue with GitHub"**.
    *   Find your repository (`cine-stock` or similar) and click **"Import"**.
    *   In the "Configure Project" screen, the default settings are usually correct for a Vite/React app.
    *   Click **"Deploy"**.

4.  **Verification**:
    *   Wait for the build to complete (about 1-2 minutes).
    *   Vercel will give you a live URL (e.g., `cine-stock.vercel.app`).
    *   Click the link to verify your application is online!

// turbo
5.  **Check Remote**: Verify if a remote repository is already configured.
    ```bash
    git remote -v
    ```
