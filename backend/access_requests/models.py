# access_requests/models.py
from django.db import models
from django.utils import timezone
from users.models import User

class Application(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_applications')
    
    def __str__(self):
        return self.name

class AccessRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='access_requests')
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='access_requests')
    justification = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    request_date = models.DateTimeField(default=timezone.now)
    decision_date = models.DateTimeField(null=True, blank=True)
    approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_requests')
    comments = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.requester.username} - {self.application.name} ({self.status})"

class UserAccess(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accesses')
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='user_accesses')
    granted_date = models.DateTimeField(default=timezone.now)
    expiry_date = models.DateTimeField(null=True, blank=True)
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='granted_accesses')
    
    class Meta:
        unique_together = ('user', 'application')
        verbose_name_plural = 'User Accesses'
    
    def __str__(self):
        return f"{self.user.username} - {self.application.name}"
    
    # access_requests/models.py (ajouter à la fin)
class AccessHistory(models.Model):
    ACTION_CHOICES = (
        ('GRANTED', 'Access Granted'),
        ('REVOKED', 'Access Revoked'),
        ('REQUESTED', 'Access Requested'),
        ('APPROVED', 'Request Approved'),
        ('REJECTED', 'Request Rejected'),
    )
    
    user = models.ForeignKey('users.User', related_name="history_records", on_delete=models.CASCADE)
    application = models.ForeignKey(Application, related_name="history_records", on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey('users.User', related_name="performed_actions", on_delete=models.CASCADE)
    details = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']