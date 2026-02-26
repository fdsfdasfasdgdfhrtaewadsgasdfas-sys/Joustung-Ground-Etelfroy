# 🚀 How to Put Your Website Online (For Free)

Follow these steps exactly. You don't need any coding experience!

## Phase 0: Upload your Code to GitHub

Before Render can host your site, your code needs to be on GitHub.

1.  **Create a Repository**:
    *   Go to [GitHub](https://github.com/) and log in.
    *   Click the **"+"** icon at the top right and select **"New repository"**.
    *   Name it (e.g., `jousting-arena`), set it to **"Public"** (or Private if you prefer), and click **"Create repository"**.
2.  **Upload the Files**:
    *   **Easiest Way**: On the next page, click the link that says **"uploading an existing file"**.
    *   Drag and drop ALL the files and folders from your `C:\Users\VeritatiS\Desktop\Website` folder into the GitHub window.
    *   **Wait** for them to finish uploading.
    *   Scroll down, type "Initial commit" in the box, and click **"Commit changes"**.
3.  **Done!** Your code is now on GitHub and ready for Render.

## Phase 1: Create your Database (Supabase)

1. Go to [Supabase](https://supabase.com/) and sign up for a free account.
2. Click **"New Project"**. Give it a name (e.g., "JoustingArena") and a strong password. Pick a region near you.
3. Once the project is ready:
   - Go to **SQL Editor** (icon that looks like `>_` on the left sidebar).
   - Click **"New query"**.
   - Copy the entire content of the `supabase/migrations/20240526000000_init.sql` file from this project.
   - Paste it into the SQL Editor and click **"Run"**.
   - *This creates all your tables, Elo logic, and security rules.*

## Phase 2: Host your Website (Render.com or Amvera.ru)

Since Vercel is restricted in Russia, use these reliable alternatives:

### Option A: Render.com (Global, Free Tier)
1. Sign up for a free account on [Render.com](https://render.com/).
2. Connect your GitHub repository.
3. Select **"New"** > **"Web Service"**.
4. Configure:
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `node .next/standalone/server.js` (or `npm start`)
5. Add **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `PORT`: `3000`
6. Click **"Create Web Service"**.

### Option B: Amvera.ru (Russian-based, Easiest in RU)
1. Go to [Amvera Cloud](https://amvera.ru/) and create an account.
2. Click **"Create Project"**.
3. Select **"GitHub"** or **"Git"** as the source.
4. Amvera will detect the `Dockerfile` I've provided automatically.
5. Add your Supabase environment variables in the project settings.
6. Deploy!

### Option C: Manual VPS (Self-Hosting)
If you have a cheap VPS (like Timeweb or Selectel):
1. Install Docker on your server.
2. Use the provided `Dockerfile` to build and run your image:
   ```bash
   docker build -t joust-arena .
   docker run -p 3000:3000 --env-file .env.local joust-arena
   ```

## Phase 3: Setup your first Judge/Admin

Since the website is protected, you need to manually create the first admin user:
1. In **Supabase**, go to **Authentication** > **Users** and click **"Add User"**.
2. Enter an email and password for yourself.
3. Go to **SQL Editor** again and run this command:
   ```sql
   -- Replace the 'user@example.com' with your email
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'admin' 
   FROM auth.users 
   WHERE email = 'user@example.com';
   ```
4. Now you can log in at `your-website.vercel.app/login`!

---

## Technical Maintenance
- **Leaderboard**: Updates automatically every 60 seconds (cached for performance).
- **Undo**: Only works for the most recent match for safety.
- **Ranks**: You can add or change rank tiers in the Admin panel under "Arena Ranks".
