from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


import logging
import traceback

logger = logging.getLogger(__name__)


def api_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is not None:
        return response

    logger.error("Unhandled API exception: %s", exc, exc_info=True)
    traceback.print_exc()

    error_detail = str(exc) if str(exc).strip() else "Internal server error."
    return Response(
        {
            'error': f'The server could not complete this API request: {error_detail}',
            'detail': error_detail,
        },
        status=500,
    )


def api_not_found(request, exception):
    if request.path.startswith('/api/'):
        return JsonResponse(
            {'error': 'API endpoint not found.'},
            status=404,
        )
    return JsonResponse({'error': 'Page not found.'}, status=404)


def api_server_error(request):
    if request.path.startswith('/api/'):
        return JsonResponse(
            {'error': 'The server could not complete this API request.'},
            status=500,
        )
    return JsonResponse({'error': 'Server error.'}, status=500)