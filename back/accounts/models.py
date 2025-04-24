from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.apps import apps

class UserAccountManager(BaseUserManager):
    def create_user(self,email,name,password=None):
        if not email:
            raise ValueError('Email address must be provided')

        email = self.normalize_email(email)#like make it lowercase
        user = self.model(email=email,name=name, is_active=False)

        user.set_password(password)
        user.save(using=self._db)

        return user
    def create_superuser(self, email, name, password):
        user = self.create_user(email, name, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user



class UserAccount(AbstractUser):
    email = models.EmailField(max_length=255,unique=True)

    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    objects = UserAccountManager()

    username = None
    USERNAME_FIELD = 'email' #FIXME: Defualt required login field.

    REQUIRED_FIELDS = ['name']

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name

    def __str__(self):
        return self.email

class UserProfile(models.Model):
    user = models.OneToOneField(UserAccount, on_delete=models.CASCADE, related_name='userprofile')
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    location = models.CharField(max_length=255, blank=True)
    birth_date = models.DateField(null=True, blank=True)

    
    def get_orders(self):
        Order = apps.get_model('orders', 'Order')
        return Order.objects.filter(user=self.user)


    def __str__(self):
        return self.user.email