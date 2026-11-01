# Add your app to the showcase

The [showcase](https://rootnative.github.io/showcase) lists apps that use the Root Native
libraries. To add your app, open a pull request that adds one file to this folder.

## Who can add an app

Your app can join when all of these are true:

- The app uses at least one `@rootnative/*` package.
- People can get the app now: from a store, a web link, Expo Go, or its source code. The app
  does not have to be open source.
- You own the app, or the owner agrees.
- You have the rights to each image.

The maintainers can remove an app when its links stop working or when it stops using the
libraries.

## Steps

1. Fork this repository.
2. Copy [`_template.ts`](_template.ts) to `showcase/<your-app>.ts`. Use lowercase letters,
   digits and hyphens in the file name.
3. Fill in the fields. The table below gives the rules.
4. Run the checks:

   ```bash
   yarn install
   yarn format
   yarn verify
   yarn showcase:check
   ```

5. Open a pull request.

`yarn showcase:check` downloads each image to check it, so it needs a network connection.

[`reelist.ts`](reelist.ts) is a complete example.

## Fields

| Field | Rule |
| --- | --- |
| `name` | 30 characters or fewer. |
| `tagline` | One sentence, 90 characters or fewer. |
| `author` | Your GitHub user name or organisation, with no `@`. The card shows its avatar. |
| `packages` | The `@rootnative/*` packages that your app uses. |
| `platforms` | One or more of `ios`, `android` and `web`. |
| `links` | At least one of `source`, `web`, `appStore`, `playStore` and `expoGo`. Use `https://` links, and an `exp://` link for `expoGo`. |
| `icon` | The URL of the app icon. |
| `screenshots` | 1 to 4. Each has a `url`, an `alt` text, and an optional `darkUrl`. |
| `added` | The day you open the pull request, as `YYYY-MM-DD`. The newest app shows first. |

## Images

The site loads each image from its URL when a visitor opens the page. To change an image, put
a new file at the same URL. You do not need a new pull request. The new file must follow the
same rules.

- Put each image in a public GitHub repository, or on the host of your `web` link. A file in a
  GitHub repository has a URL of this form:

  ```
  https://raw.githubusercontent.com/<user>/<repository>/main/<path to the file>
  ```

- Use a PNG, JPEG or WebP file.
- Icon: a square of 256 to 1024 px, 200 KB or less.
- Screenshot: 300 KB or less, and 2000 px or less on the long edge. Phone screenshots show
  best.
- `darkUrl`: the same screen in dark mode, at the same size. Visitors who use dark mode see
  this file.
- `alt`: what the screenshot shows. A screen reader reads this text.
