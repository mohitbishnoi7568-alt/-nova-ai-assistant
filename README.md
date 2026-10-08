# NOVA No-Password Upgrade

This package removes the private login/password screen and keeps NOVA directly accessible.

## Website
Upload the contents of `website/` to the GitHub Pages repository `-nova-ai-assistant`.

`config.js` already points to:
`https://nova-ai-backend-gamma.vercel.app/api/chat`

## Backend
The `backend/` folder is a Vercel backend. If you replace the current backend, set:
- `OPENAI_API_KEY` = your secret key
- `OPENAI_MODEL` = `gpt-6-astra`
- `ALLOWED_ORIGIN` = `https://mohitbishnoi7568-alt.github.io`

No `NOVA_ACCESS_PASSWORD` is used anywhere.

## Included upgrades
- No password/login
- Larger full-screen futuristic HUD
- Bigger NOVA core and responsive layout
- General AI chat via backend
- Hindi/Hinglish voice output
- Voice wake word: NOVA / नोवा
- Deep-voice pitch/speed controls
- 8 themes
- Fullscreen button
- Phone/Android module buttons
- Quick AI commands
- Jaipur weather/time/date panel
- LocalStorage theme persistence

Phone controls such as Wi-Fi, Bluetooth, Camera and app launching require the native NOVA Android app; a normal GitHub Pages website cannot silently control Android.
