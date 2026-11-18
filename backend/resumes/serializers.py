from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = [
            'id', 'file_name', 'file_size', 'file_type', 'file_url',
            'extracted_text', 'parsed_data', 'is_confirmed_by_user',
            'uploaded_at', 'updated_at'
        ]
        read_only_fields = ['id', 'extracted_text', 'file_name', 'file_size', 'file_type', 'uploaded_at']

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
