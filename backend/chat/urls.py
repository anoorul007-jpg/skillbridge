from django.urls import path
from .views import ChatSessionListView, ChatSessionDetailView, SendChatMessageView

urlpatterns = [
    path('sessions/', ChatSessionListView.as_view(), name='chat_sessions'),
    path('sessions/<int:pk>/', ChatSessionDetailView.as_view(), name='chat_session_detail'),
    path('sessions/<int:pk>/send/', SendChatMessageView.as_view(), name='chat_send_message'),
]
