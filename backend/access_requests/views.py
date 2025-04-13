# access_requests/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from access_requests.models import Application, AccessRequest, UserAccess
from .serializers import ApplicationSerializer, AccessRequestSerializer, UserAccessSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

class AccessRequestViewSet(viewsets.ModelViewSet):
    serializer_class = AccessRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return AccessRequest.objects.all()
        elif user.role == 'APPROVER':
            return AccessRequest.objects.filter(application__owner=user) | AccessRequest.objects.filter(requester=user)
        else:
            return AccessRequest.objects.filter(requester=user)
    
    def perform_create(self, serializer):
        serializer.save(requester=self.request.user, status='PENDING')
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        access_request = self.get_object()
        
        # Check if user is authorized to approve
        if request.user.role not in ['APPROVER', 'ADMIN'] and request.user != access_request.application.owner:
            return Response({"detail": "Not authorized to approve requests"}, status=status.HTTP_403_FORBIDDEN)
        
        # Update request status
        access_request.status = 'APPROVED'
        access_request.approver = request.user
        access_request.decision_date = timezone.now()
        access_request.comments = request.data.get('comments', '')
        access_request.save()
        
        # Create UserAccess record
        UserAccess.objects.create(
            user=access_request.requester,
            application=access_request.application,
            granted_by=request.user
        )
        
        return Response(AccessRequestSerializer(access_request).data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        access_request = self.get_object()
        
        # Check if user is authorized to reject
        if request.user.role not in ['APPROVER', 'ADMIN'] and request.user != access_request.application.owner:
            return Response({"detail": "Not authorized to reject requests"}, status=status.HTTP_403_FORBIDDEN)
        
        # Update request status
        access_request.status = 'REJECTED'
        access_request.approver = request.user
        access_request.decision_date = timezone.now()
        access_request.comments = request.data.get('comments', '')
        access_request.save()
        
        return Response(AccessRequestSerializer(access_request).data)

class UserAccessViewSet(viewsets.ModelViewSet):
    serializer_class = UserAccessSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return UserAccess.objects.all()
        elif user.role == 'APPROVER':
            return UserAccess.objects.filter(application__owner=user) | UserAccess.objects.filter(user=user)
        else:
            return UserAccess.objects.filter(user=user)
    
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        user_access = self.get_object()
        
        # Check if user is authorized to revoke
        if request.user.role not in ['APPROVER', 'ADMIN'] and request.user != user_access.application.owner:
            return Response({"detail": "Not authorized to revoke access"}, status=status.HTTP_403_FORBIDDEN)
        
        user_access.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)