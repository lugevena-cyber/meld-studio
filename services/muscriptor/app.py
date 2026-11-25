"""Private MuScriptor ASGI endpoint; run behind HTTPS, never expose an unguarded model."""
import os
import secrets
from muscriptor.transcription_model import TranscriptionModel
from muscriptor.server import create_app


def create_service():
    token = os.environ.get('MUSCRIPTOR_TOKEN', '')
    if len(token) < 32:
        raise RuntimeError('Set MUSCRIPTOR_TOKEN to a random secret of at least 32 characters')
    model = TranscriptionModel.load_model(weights_path=os.getenv('MUSCRIPTOR_MODEL', 'small'))
    upstream = create_app(model)

    async def app(scope, receive, send):
        if scope['type'] == 'http':
            headers = dict(scope.get('headers', []))
            expected = ('Bearer ' + token).encode()
            if not secrets.compare_digest(headers.get(b'authorization', b''), expected):
                await send({'type': 'http.response.start', 'status': 401, 'headers': [(b'content-type', b'application/json')]})
                await send({'type': 'http.response.body', 'body': b'{"error":"unauthorized"}'})
                return
        await upstream(scope, receive, send)
    return app
