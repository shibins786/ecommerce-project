from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

# Swagger / drf-yasg
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="E-commerce API",
      default_version='v1',
      description="API documentation for E-commerce backend",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # =========================
    # API ROUTES
    # =========================
    path('api/users/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payment/', include('payments.urls')),

    path('api/shipping/', include('shipping.urls')),
    path('api/wishlist/', include('wishlist.urls')),
    path('api/reviews/', include('reviews.urls')),
    path("api/newsletter/", include("newsletter.urls")),

    # =========================
    # SWAGGER / DOCS
    # =========================
    re_path(
        r'^swagger(?P<format>\.json|\.yaml)$',
        schema_view.without_ui(cache_timeout=0),
        name='schema-json'
    ),
    path(
        'swagger/',
        schema_view.with_ui('swagger', cache_timeout=0),
        name='schema-swagger-ui'
    ),
    path(
        'redoc/',
        schema_view.with_ui('redoc', cache_timeout=0),
        name='schema-redoc'
    ),
]

# =========================
# MEDIA FILES
# =========================
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)