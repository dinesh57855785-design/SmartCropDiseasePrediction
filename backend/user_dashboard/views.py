from django.db.models import Count
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from disease.models import DiseasePrediction


class DashboardStatsView(APIView):
    """
    GET /api/dashboard/stats/
    Returns statistics for the authenticated user's dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        qs = DiseasePrediction.objects.filter(user=user)

        total = qs.count()
        healthy = qs.filter(is_healthy=True).count()
        diseased = total - healthy

        # Disease breakdown (top 5)
        disease_breakdown = (
            qs.filter(is_healthy=False)
            .values('predicted_disease')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        # Recent 5 predictions
        recent = qs.values(
            'id', 'predicted_disease', 'confidence', 'crop_name',
            'is_healthy', 'created_at'
        )[:5]

        return Response({
            'total_predictions': total,
            'healthy_count': healthy,
            'diseased_count': diseased,
            'disease_breakdown': list(disease_breakdown),
            'recent_predictions': list(recent),
        })
