# payments/urls.py
from django.urls import path
from .views import PaymentSessionView, PaymentConfirmView, PaymentWebhook

urlpatterns = [
    path('create-session/', PaymentSessionView.as_view(), name='create_payment_session'),
    path('webhook/', PaymentWebhook.as_view(), name='payment_webhook'),
    path('confirm/', PaymentConfirmView.as_view(), name='payment-confirm'),

]
