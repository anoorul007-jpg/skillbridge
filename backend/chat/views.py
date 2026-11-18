from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer
from .services import generate_ai_career_response

class ChatSessionListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)
        # If no session exists, create a default welcome session
        if not sessions.exists():
            default_session = ChatSession.objects.create(
                user=request.user,
                title="Career Guidance & Mentorship"
            )
            # Add welcoming message
            ai_welcome = generate_ai_career_response(request.user, "hello")
            ChatMessage.objects.create(
                session=default_session,
                sender='AI',
                message=ai_welcome['text'],
                suggested_actions=ai_welcome['actions']
            )
            sessions = ChatSession.objects.filter(id=default_session.id)

        serializer = ChatSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        title = request.data.get('title', 'New Career Mentorship')
        session = ChatSession.objects.create(user=request.user, title=title)
        
        # Initial greeting
        ai_welcome = generate_ai_career_response(request.user, "hello")
        ChatMessage.objects.create(
            session=session,
            sender='AI',
            message=ai_welcome['text'],
            suggested_actions=ai_welcome['actions']
        )
        return Response(ChatSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class ChatSessionDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        session = ChatSession.objects.filter(user=request.user, pk=pk).first()
        if not session:
            return Response({'error': 'Chat session not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ChatSessionSerializer(session).data)

    def delete(self, request, pk):
        session = ChatSession.objects.filter(user=request.user, pk=pk).first()
        if not session:
            return Response({'error': 'Chat session not found.'}, status=status.HTTP_404_NOT_FOUND)
        session.delete()
        return Response({'message': 'Chat session deleted successfully.'})


class SendChatMessageView(views.APIView):
    """
    Submits user query to the AI Career Mentor and returns response.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        session = ChatSession.objects.filter(user=request.user, pk=pk).first()
        if not session:
            return Response({'error': 'Chat session not found.'}, status=status.HTTP_404_NOT_FOUND)

        prompt = request.data.get('message', '').strip()
        if not prompt:
            return Response({'error': 'Message content cannot be blank.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Save User Message
        user_msg = ChatMessage.objects.create(
            session=session,
            sender='USER',
            message=prompt
        )

        # 2. Generate AI Response
        ai_reply_dict = generate_ai_career_response(request.user, prompt)

        # 3. Save AI Message
        ai_msg = ChatMessage.objects.create(
            session=session,
            sender='AI',
            message=ai_reply_dict['text'],
            suggested_actions=ai_reply_dict.get('actions', [])
        )

        # Touch session timestamp
        session.save()

        return Response({
            'user_message': ChatMessageSerializer(user_msg).data,
            'ai_message': ChatMessageSerializer(ai_msg).data,
            'source': ai_reply_dict.get('source', 'AI_ENGINE')
        }, status=status.HTTP_200_OK)
