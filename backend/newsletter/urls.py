from django.urls import path
from .views import Subscribe, Unsubscribe

urlpatterns = [
    path("subscribe/", Subscribe.as_view()),
    path("unsubscribe/", Unsubscribe.as_view()),
]