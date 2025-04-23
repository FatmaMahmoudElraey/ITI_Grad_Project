from djoser.email import ActivationEmail, PasswordResetEmail

class CustomActivationEmail(ActivationEmail):
    """Custom activation email that extends Djoser's ActivationEmail"""
    template_name = "email/activation.html"

class CustomPasswordResetEmail(PasswordResetEmail):
    """Custom password reset email that extends Djoser's PasswordResetEmail"""
    template_name = "email/password_reset.html"