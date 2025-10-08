from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from orders.models import Order
from products.models import Product

class UserAccountManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None, name=None, role='user', **extra_fields):
        if not email:
            raise ValueError('Email address must be provided')
        email = self.normalize_email(email)

        if name is None:
            name = f"{first_name} {last_name}"

        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            name=name,
            role=role,
            is_active=False,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password):
        user = self.create_user(email, first_name, last_name, password, role='admin')
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(using=self._db)
        return user



class UserAccount(AbstractUser):

    ROLE_CHOICES = (
    ('admin', 'Admin'),
    ('user', 'User'),
    ('seller', 'Seller'),
)
    username = None
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    email = models.EmailField(max_length=255,unique=True)
    first_name = models.CharField(("first name"), max_length=150, blank=False)
    last_name = models.CharField(("last name"), max_length=150, blank=False)
    name = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    objects = UserAccountManager()

    USERNAME_FIELD = 'email' 

    REQUIRED_FIELDS = ['first_name', 'last_name']

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        self.name = self.get_full_name()
        super().save(*args, **kwargs)

class Favorite(models.Model):
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorites')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.email} - {self.product.title}"

class UserProfile(models.Model):
    user = models.OneToOneField(UserAccount, on_delete=models.CASCADE, related_name='userprofile')
    bio = models.TextField(blank=True)
    picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    location = models.CharField(max_length=255, blank=True)
    birth_date = models.DateField(null=True, blank=True)

    
    def get_orders(self):
        return Order.objects.filter(user=self.user)


    def __str__(self):
        return self.user.email
    
