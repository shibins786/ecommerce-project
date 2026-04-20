from django.urls import path
from .views import (
    CreateOrder,
    CreateOrderAfterPayment,
    UserOrders,
    CancelOrder,
    DeleteOrder,
    UpdateOrderStatus
)

urlpatterns = [
    path('create/', CreateOrder.as_view()),
    path('create-after-payment/', CreateOrderAfterPayment.as_view()),
    path('', UserOrders.as_view()),
    path('<int:pk>/cancel/', CancelOrder.as_view()),
    path('<int:pk>/delete/', DeleteOrder.as_view()),
    path('<int:pk>/status/', UpdateOrderStatus.as_view()),
]