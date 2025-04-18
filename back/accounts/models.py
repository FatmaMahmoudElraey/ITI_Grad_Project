from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin


class UserAccount(AbstractUser,PermissionsMixin):
    email = models.EmailField(max_length=255,unique=True)

    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    username = None
    USERNAME_FIELD = 'email' # Defualt required login field.

    REQUIRED_FIELDS = ['name']

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name

    def __str__(self):
        return self.email
