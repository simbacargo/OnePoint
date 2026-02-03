import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        print(self.scope)
        self.user = self.scope["user"]

        # 1. Check if the user is authenticated
        if self.user.is_authenticated:
            # 2. Create a unique group name for this specific user
            self.group_name = f"user_{self.user.id}"

            # Join the user-specific group
            async_to_sync(self.channel_layer.group_add)(
                self.group_name,
                self.channel_name
            )

            self.accept()
            self.send(text_data=json.dumps({
                "message": f"Welcome {self.user.username}, you are connected!"
            }))
        else:
            # Reject the connection if not logged in
            self.close()

    def disconnect(self, close_code):
        # Leave the group on disconnect
        if self.user.is_authenticated:
            async_to_sync(self.channel_layer.group_discard)(
                self.group_name,
                self.channel_name
            )

    def receive(self, text_data):
        # Optional: Check user identity before processing incoming data
        data = json.loads(text_data)
        print(f"Message from {self.user.username}: {data.get('message')}")

    # This method handles messages sent to the Group
    def send_notification(self, event):
        message = event["message"]
        
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            "type": "notification",
            "message": message,
        }))