# Generated by Django 5.2 on 2025-05-04 16:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0004_product_is_featured'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='photo',
            field=models.ImageField(blank=True, null=True, upload_to='products/images/'),
        ),
        migrations.DeleteModel(
            name='ProductImage',
        ),
    ]
