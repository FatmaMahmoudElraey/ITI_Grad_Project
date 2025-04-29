import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatMessage, UserAccount
from asgiref.sync import sync_to_async
import logging

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Get username from URL route
            self.other_username = self.scope['url_route']['kwargs']['username']
            self.user = self.scope.get('user', None)
            
            # Log connection attempt
            logger.info(f"WebSocket connection attempt: user={self.user}, other_user={self.other_username}")
            
            # Check if user is authenticated
            if self.user.is_anonymous:
                logger.warning(f"Anonymous user tried to connect to chat")
                await self.close(code=4001)
                return
                
            # Get the other user
            self.other_user = await self.get_user_by_email(self.other_username)
            if not self.other_user:
                logger.warning(f"Other user not found: {self.other_username}")
                await self.close(code=4002)
                return
                
            # Create a unique room name based on the two users' emails
            user_email_safe = self.user.email.replace('@', '_at_')
            other_email_safe = self.other_username.replace('@', '_at_')
            self.room_name = f"chat_{min(user_email_safe, other_email_safe)}_{max(user_email_safe, other_email_safe)}"
            self.room_group_name = f"chat_{self.room_name}"

            logger.info(f"Joining room: {self.room_group_name}")
            
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
            
            # Mark messages as read when connecting
            await self.mark_messages_as_read()
            logger.info(f"WebSocket connection established for {self.user.email} with {self.other_username}")
        except Exception as e:
            logger.error(f"Error in connect: {str(e)}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        # Leave room group
        try:
            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
                logger.info(f"WebSocket disconnected: code={close_code}")
        except Exception as e:
            logger.error(f"Error in disconnect: {str(e)}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            
            # Handle authentication message
            if 'token' in data:
                # Token handling is done by middleware
                logger.info("Received token in message")
                return
                
            # Handle chat message
            if 'message' in data:
                message = data['message']
                sender = self.user
                receiver = await self.get_user_by_email(self.other_username)

                if not receiver:
                    logger.warning(f"Receiver not found: {self.other_username}")
                    return

                # Save message to database
                await self.save_message(sender, receiver, message)
                logger.info(f"Message saved: {sender.email} -> {receiver.email}")

                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'sender_email': sender.email,
                    }
                )
        except Exception as e:
            logger.error(f"Error in receive: {str(e)}")

    async def chat_message(self, event):
        try:
            message = event['message']
            sender_email = event['sender_email']

            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'message': message,
                'sender': sender_email,
            }))
            logger.info(f"Message sent to client: {sender_email}")
        except Exception as e:
            logger.error(f"Error in chat_message: {str(e)}")

    @sync_to_async
    def save_message(self, sender, receiver, message):
        try:
            return ChatMessage.objects.create(
                user=sender,
                sender=sender,
                reciever=receiver,
                message=message
            )
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            return None
        
    @sync_to_async
    def get_user_by_email(self, email):
        try:
            return UserAccount.objects.get(email=email)
        except UserAccount.DoesNotExist:
            logger.warning(f"User not found with email: {email}")
            return None
        except Exception as e:
            logger.error(f"Error getting user by email: {str(e)}")
            return None
            
    @sync_to_async
    def mark_messages_as_read(self):
        try:
            # Mark all messages from other_user to current user as read
            if self.other_user and self.user:
                updated = ChatMessage.objects.filter(
                    sender=self.other_user,
                    reciever=self.user,
                    is_read=False
                ).update(is_read=True)
                logger.info(f"Marked {updated} messages as read")
        except Exception as e:
            logger.error(f"Error marking messages as read: {str(e)}")
