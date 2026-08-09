# HostPro OS — the real Android app

This turns the same app into a proper Android app: a real APK your team installs, its own icon in the app drawer, its own splash screen, no browser anywhere in sight.

You do not need Android Studio, a Mac, or any tooling on your laptop. GitHub builds it for you, free.

---

## Before you start

Get the workspace running first (see the main `SETUP.md`) and have your `/exec` link to hand.

---

## 1. Bake in the workspace link

Open `www/index.html`, find this near the middle of the file:

```js
const BAKED_URL = '';
```

Put your `/exec` link between the quotes:

```js
const BAKED_URL = 'https://script.google.com/macros/s/AKfy…/exec';
```

Now nobody on the team ever sees a setup screen. They open the app and land straight on sign-in. Leave it empty and the app asks each person once — fine, but it's one more thing to explain seven times.

## 2. Put the project on GitHub

1. Create a repository — **Private**, unless you want your workspace link public.
2. Upload this whole folder. Drag-and-drop on github.com works; skip `node_modules` if it's there.

## 3. Get your APK

The build starts on its own. To watch it or run it again:

**Actions ▸ Build Android app ▸ Run workflow.**

It takes about four minutes. When the green tick appears, open the run and download **HostPro-OS-apk** from Artifacts. Inside is `HostPro-OS-<date>.apk`.

## 4. Install it

Send the APK on WhatsApp, or drop it in Drive and share the link.

On the phone: tap the file, Android asks *"allow installing from this source?"* — that's expected for an app that didn't come from the Play Store. Allow it once. It installs, and the HostPro icon appears in the app drawer.

That prompt is the one rough edge of the free route. It shows once per phone, and then never again — including for updates.

## 5. Updating later

Change the code, push to GitHub, download the new APK, send it out. Installing over the top keeps everyone signed in and keeps their data.

Bump `versionCode` in `android/app/build.gradle` each time (1 → 2 → 3) so Android knows it's newer.

---

## If you'd rather build it on your own machine

Install Android Studio, then:

```bash
npm install
npm run build:android
```

The APK lands in `android/app/build/outputs/apk/debug/`. `npm run open:android` opens the project in Android Studio if you want to poke at it.

---

## What about iPhone?

The same project builds an iOS app — `npx cap add ios` and it's there. But shipping it to an actual iPhone needs an Apple Developer account at **$99 a year**, and a Mac to build on. There is no free path; Apple doesn't offer one.

If your onsite team in Accra is on Android, the free APK covers them and the PWA covers anyone on iPhone. That's the sensible split until iOS is worth $99 to you.

---

## Going further

**Play Store listing ($25, one-time).** Removes the "unknown source" prompt and gives you automatic updates. You'd generate a signing key, add it to the repository's secrets, and switch the workflow's `assembleDebug` to `bundleRelease`.

**Push notifications.** The main reason to have gone native. An unanswered Slack issue could buzz the manager's phone instead of waiting to be noticed. It needs Firebase Cloud Messaging wired into the Apps Script side — worth doing once the app itself has settled in.

---

## What's in here

| | |
|---|---|
| `www/` | The app — the same one that runs in the browser |
| `android/` | The native shell. Generated; you rarely touch it |
| `capacitor.config.json` | App name, ID, splash and status bar colours |
| `assets/` | The source icon and splash art at full size |
| `.github/workflows/android.yml` | The cloud build |

`assets/` holds the originals. If you change the icon, replace `assets/icon.png` (1024×1024) and run `npx @capacitor/assets generate --android` to regenerate every size.

One detail worth knowing: the app talks to your Sheet through Capacitor's native HTTP layer rather than the WebView's. That means the request happens outside the browser sandbox, so there's no cross-origin problem to hit — which is the thing that most often breaks a wrapped web app on its first run.
