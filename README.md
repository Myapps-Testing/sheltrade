# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0c7bb4f2-f8b8-4b28-abee-ac9ffc967af8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0c7bb4f2-f8b8-4b28-abee-ac9ffc967af8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Option 1: Lovable Deployment
Simply open [Lovable](https://lovable.dev/projects/0c7bb4f2-f8b8-4b28-abee-ac9ffc967af8) and click on Share -> Publish.

### Option 2: Render Deployment (Static Site)

1. **Build the project for production:**
   ```sh
   npm run build
   ```

2. **Create a Render account** at [render.com](https://render.com) if you don't have one.

3. **Connect your GitHub repository** to Render.

4. **Create a new Static Site:**
   - Click "New" > "Static Site"
   - Connect your repository
   - Set the build command: `npm run build`
   - Set the publish directory: `dist`
   - Add environment variables:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key

5. **Deploy** the site.

The site will be available at the URL provided by Render.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
