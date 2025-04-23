from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authsys.urls')),
    path('api/auth/', include('accounts.urls')),
    #NOTE: ROUTER TO CATCH ALL OTHER NOT HANDLED URLS, MUST PUT IN BOTTOM.
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]
