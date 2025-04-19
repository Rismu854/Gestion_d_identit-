# access_requests/serializers.py
from rest_framework import serializers
from access_requests.models import Application, AccessRequest, UserAccess
from users.serializers import UserSerializer
from access_requests.models import AccessHistory


class ApplicationSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source='owner.username')
    
    class Meta:
        model = Application
        fields = ['id', 'name', 'description', 'owner', 'owner_name']

class AccessRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.ReadOnlyField(source='requester.username')
    approver_name = serializers.ReadOnlyField(source='approver.username')
    application_name = serializers.ReadOnlyField(source='application.name')
    
    class Meta:
        model = AccessRequest
        fields = ['id', 'requester', 'requester_name', 'application', 'application_name', 
                  'justification', 'status', 'request_date', 'decision_date', 
                  'approver', 'approver_name', 'comments']
        read_only_fields = ['id', 'request_date', 'decision_date', 'status']

class UserAccessSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    application_name = serializers.ReadOnlyField(source='application.name')
    granted_by_name = serializers.ReadOnlyField(source='granted_by.username')
    
    class Meta:
        model = UserAccess
        fields = ['id', 'user', 'user_name', 'application', 'application_name', 
                  'granted_date', 'expiry_date', 'granted_by', 'granted_by_name']
        read_only_fields = ['id', 'granted_date']


# access_requests/serializers.py (ajouter à la fin)
class AccessHistorySerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    application_name = serializers.ReadOnlyField(source='application.name')
    performed_by_name = serializers.ReadOnlyField(source='performed_by.username')
    
    class Meta:
        model = AccessHistory
        fields = ['id', 'user', 'user_name', 'application', 'application_name', 
                  'action', 'timestamp', 'performed_by', 'performed_by_name', 'details']