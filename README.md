# Keepsake

Keepsake is a personal wishlist for products found around the web. Save a page from the browser extension, organize it by category, and return to the collection from the website.

## What It Does

- Create an account, sign in, sign out, and request a password-reset email with Firebase Authentication.
- Save a page title, URL, price, and category from the Chrome extension.
- Browse saved items on the website, search by title or category, filter by category, and remove items.
- Keep each signed-in user's wishlist under that user's Firebase UID.

## Project Layout

- `frontend/`: React website, Firebase Authentication and Firestore client.
- `backend/`: Express API hosted on Render; verifies Firebase ID tokens and writes extension saves to Firestore using Firebase Admin.
- `extension/`: Chrome Manifest V3 popup for signing in and saving the active page.
- `firestore.rules`: Owner-only Firestore read and delete rules for wishlist items.
- `.github/workflows/pages.yml`: builds `frontend/` and deploys it to GitHub Pages on pushes to `main`.

## How Data Moves

1. The website signs users in with Firebase Authentication and reads or deletes `wishlists/{uid}/items` directly from Firestore. Firestore rules require the signed-in UID to match `{uid}`.
2. The extension signs in with the same Firebase email/password account. It sends the active page details and a Firebase ID token to `POST /api/add-item`.
3. The Express backend verifies the ID token with Firebase Admin and uses the verified token UID as the Firestore path. It does not accept a caller-supplied user ID.

The Firebase web API key in the frontend and extension is public client configuration, not a service-account credential. Never put the Firebase Admin private key in either client; keep it in backend environment variables.

## Run Locally

Requirements: Node.js 20 or newer, npm, and access to the Firebase project.

### Website

```sh
cd frontend
npm ci
npm start
```

Create React App serves the development site at `http://localhost:3000` (or the next available port). The production build is created in `frontend/build`:

```sh
npm test -- --watchAll=false
npm run build
```

### Backend

In another terminal:

```sh
cd backend
npm install
npm start
```

Configure these environment variables in `backend/.env` for local development and in Render's environment settings for deployment:

- `FIREBASE_PROJECT_ID`: Firebase project ID.
- `FIREBASE_CLIENT_EMAIL`: service account client email.
- `FIREBASE_PRIVATE_KEY`: service account private key. Preserve newlines or use `\\n` between key lines.
- `PORT`: optional; Render supplies this automatically.

Keep `.env` out of Git. The backend health endpoint is `GET /`; item saves use `POST /api/add-item` and require `Authorization: Bearer <Firebase ID token>`.

## Firebase Setup

1. In Firebase Console, enable **Authentication → Sign-in method → Email/Password**.
2. Add the website hostname to **Authentication → Settings → Authorized domains**. For GitHub Pages this is `laieileen.github.io`; for local development Firebase generally includes `localhost` by default.
3. Deploy the Firestore rules from the repository root:

   ```sh
   firebase deploy --only firestore:rules --project wishlist-tracker-3486e
   ```

4. Create a Firebase service account for the backend and set its credentials as Render environment variables. Never commit the downloaded service-account JSON.

## Using Keepsake (No Coding Required)

### What It Does

Keepsake is a personal place to collect products you might want later. The website shows your saved items. The Chrome extension lets you save the page you are currently browsing, along with a price and category. It does not automatically detect the product price, so enter that yourself when saving.

### Create an Account

1. Open the [Keepsake website](https://laieileen.github.io/wishlist/).
2. Choose **Create account**, enter your email, and create a password with at least six characters.
3. Use this same email and password in the Chrome extension.
4. If you forget your password, choose **Forgot password?** on the website or extension and follow the reset email instructions.

### Install the Chrome Extension

The extension is currently a local, unpacked Chrome extension, not an item in the Chrome Web Store. Chrome must be pointed to its folder on your computer, so these setup steps are needed once for each computer or Chrome profile.

1. On the GitHub project page, choose **Code → Download ZIP**, then unzip the downloaded folder somewhere you can find it again.
2. In Chrome, open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select the `extension` folder inside the unzipped project folder. Select the `extension` folder itself, not the outer project folder.
5. Open Chrome's Extensions menu (the puzzle-piece icon). You can pin Keepsake there for easier access.

### Save and Find Something

1. Visit a regular product page starting with `https://` or `http://`. Chrome does not let extensions read special pages such as `chrome://` pages or the Chrome Web Store.
2. Open Keepsake from Chrome's Extensions menu.
3. Sign in using your Keepsake account if asked.
4. Enter the item's price and category, then choose **Save to wishlist**. The page title and address are filled in from the page you are viewing.
5. Open the Keepsake website using the same account. The item should appear in your collection; use search or category filters to find it, or choose **Remove** to delete it.

When the extension is updated, open `chrome://extensions` and choose its reload icon. If you move or delete the unzipped project folder, Chrome will no longer be able to load the extension until you select its new location.

## Deployments

- **Website:** GitHub Actions builds the React app and deploys it to `https://laieileen.github.io/wishlist/`. The repository's Pages source must be set to **GitHub Actions** under **Settings → Pages**.
- **Backend:** Render runs the Node service from `backend/`. Set the service root directory to `backend`, use `npm install` for dependencies, and `npm start` for the start command. Add the Firebase Admin environment variables above.
- **Extension:** Load the `extension/` directory locally during development. Updates require reloading the unpacked extension from `chrome://extensions`.

The extension currently targets `https://wishlist-yu2x.onrender.com/api/add-item`; change `API_URL` in `extension/popup.js` if the Render service URL changes.
