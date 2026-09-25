from rest_framework import generics, permissions
from .models import Crop
from .serializers import CropSerializer


class CropListView(generics.ListAPIView):
    """GET /api/crop/ – List all available crops (public)."""
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    permission_classes = [permissions.AllowAny]


class CropDetailView(generics.RetrieveAPIView):
    """GET /api/crop/<id>/ – Retrieve a single crop."""
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    permission_classes = [permissions.AllowAny]
