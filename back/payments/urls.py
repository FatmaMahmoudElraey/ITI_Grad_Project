# payments/urls.py
from django.urls import path
from .views import PaymentSessionView, PaymentConfirmView, PaymentWebhook, PaymentResponseView

urlpatterns = [
    path('create-session/', PaymentSessionView.as_view(), name='payment_session'),
    path('confirm/', PaymentConfirmView.as_view(), name='payment_confirm'),
    path('webhook/', PaymentWebhook.as_view(), name='payment_webhook'),
    path('response/', PaymentResponseView.as_view(), name='payment_response'),
]
