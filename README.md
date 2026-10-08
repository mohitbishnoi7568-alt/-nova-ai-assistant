# NOVA — Mohit's Personal AI Dashboard

This is a separate standalone cinematic/holographic NOVA website. It is intentionally inspired by futuristic AI dashboards rather than copying a specific movie interface.

## Important microphone limitation
A normal website cannot keep using the microphone invisibly after the browser is backgrounded or the phone is locked. Browser speech recognition also varies by browser/device.

For true background voice: use the Android NOVA app, grant microphone + notification permissions, and start NOVA while the app is visible. Android then keeps a visible foreground-service notification while the microphone service runs.

## Jarvis-like voice
The site uses the device's available Hindi TTS voice. An exact voice clone of a movie character/actor is not included. A cinematic, calm assistant voice can be configured through the Android TTS engine.
