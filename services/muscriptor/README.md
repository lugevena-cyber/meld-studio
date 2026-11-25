# Melohum private MuScriptor service

Status: application integration implemented and tested using synthetic SSE. No model weights downloaded and no inference host deployed. Real audio inference and browser end-to-end acceptance remain pending.

The repository code is MIT; model weights are CC BY-NC 4.0. Before downloading, the operator must personally review/accept the relevant Hugging Face model license. Commercial use requires separate permission. Do not automate license acceptance or reuse the public demo as an undocumented API.

1. On a Python >=3.10 inference machine, install requirements.txt into a virtual environment (Windows GPU installs require the appropriate CUDA PyTorch backend; consult upstream).
2. Log in to Hugging Face with `hf auth login` after accepting the model terms on its model page. Keep the token on the server.
3. Set MUSCRIPTOR_TOKEN to a randomly generated secret >=32 characters and MUSCRIPTOR_MODEL=small (CPU trial; medium/large need hardware benchmarking).
4. From this directory, start `uvicorn app:create_service --factory --host 127.0.0.1 --port 8222`. Model weights download on first load. Keep this port private.
5. Put a managed HTTPS reverse proxy in front, forward Authorization, disable response buffering, allow streaming, set upload limit >=26 MiB, long-request timeout and connection limits. Do not disable the bearer-token guard. Restrict inbound access where practical.
6. In Sites runtime secrets, set MUSCRIPTOR_URL to the HTTPS origin (or path prefix) and MUSCRIPTOR_TOKEN to the matching service token. Redeploy Melohum to apply. Do not put secrets in Git, client JavaScript or chat.
7. Sign into Melohum, open arrangement → 音频转可编辑分轨; start with an authorized 15–30 second recording. Verify progress, cancel, downloadable MIDI, notes per instrument, append, edit, save/reload and undo. Existing tracks are preserved. The site maps instruments to approximate available sounds; no source stems or notation files are promised. It preserves source seconds, including rubato; it does not import tempo maps or auto-quantize.

Upstream contract verified against https://github.com/muscriptor/muscriptor (0.4.0): POST /transcribe multipart `file`, `detect_tempo=best-effort`; SSE start/end/progress/transcription_complete. Worker proxies only this fixed configured path and keeps the service secret server-side. Requires site login and same-origin requests; quota 5/hour/account; upload <=25 MiB. Secret presence is configuration status, not model health or proof of real transcription.
