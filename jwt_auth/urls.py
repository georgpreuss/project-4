from django.urls import path
from .views import RegisterView, LoginView, ProfileView, UserListView, RankingView, UserView

urlpatterns = [
    path('register', RegisterView.as_view()),
    path('login', LoginView.as_view()),
    path('profile', ProfileView.as_view()),
    path('profile/<int:pk>/', UserView.as_view()),
    path('users', UserListView.as_view()),
    path('users/ranking', RankingView.as_view())
]
