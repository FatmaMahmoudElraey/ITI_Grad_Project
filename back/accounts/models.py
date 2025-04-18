from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin, BaseUserManager

class UserAccountManager(BaseUserManager):
    def create_user(self,email,name,password=None):
        if not email:
            raise ValueError('Email address must be provided')

        email = self.normalize_email(email)#like make it lowercase
        user = self.model(email=email,name=name, is_active=True)

        user.set_password(password)
        user.save(using=self._db)

        return user
    def create_superuser(self, email, name, password):
        user = self.create_user(email, name, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user



class UserAccount(AbstractUser,PermissionsMixin):
    email = models.EmailField(max_length=255,unique=True)

    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    objects = UserAccountManager()

    username = None
    USERNAME_FIELD = 'email' # Defualt required login field.

    REQUIRED_FIELDS = ['name']

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name

    def __str__(self):
        return self.email
