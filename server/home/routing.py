from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/socket_server", consumers.ChatConsumer.as_asgi()),
]
