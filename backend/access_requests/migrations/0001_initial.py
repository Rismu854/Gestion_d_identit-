# Generated by Django 5.2 on 2025-04-04 14:09

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Application',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owned_applications', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='AccessRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('justification', models.TextField()),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], default='PENDING', max_length=20)),
                ('request_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('decision_date', models.DateTimeField(blank=True, null=True)),
                ('comments', models.TextField(blank=True)),
                ('approver', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_requests', to=settings.AUTH_USER_MODEL)),
                ('requester', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='access_requests', to=settings.AUTH_USER_MODEL)),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='access_requests', to='access_requests.application')),
            ],
        ),
        migrations.CreateModel(
            name='UserAccess',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('granted_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('expiry_date', models.DateTimeField(blank=True, null=True)),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_accesses', to='access_requests.application')),
                ('granted_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='granted_accesses', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accesses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'User Accesses',
                'unique_together': {('user', 'application')},
            },
        ),
    ]
