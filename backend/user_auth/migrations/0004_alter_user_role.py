# Generated by Django 5.2.2 on 2025-06-08 08:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_auth', '0003_alter_user_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(choices=[('student', 'Student'), ('company', 'Company'), ('admin', 'Administrator')], default='student', max_length=10),
        ),
    ]
