# Generated by Django 4.2.23 on 2025-06-15 15:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='submission',
            name='submission_file',
        ),
    ]
