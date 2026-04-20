from rest_framework.views import exception_handler
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    view = context.get('view', None)
    if view:
        logger.error(f"Exception in {view.__class__.__name__}: {str(exc)}")

    if response is not None:
        # DON'T break DRF structure
        data = response.data

        if isinstance(data, dict):
            message = data.get('detail') or data
        else:
            message = str(data)

        response.data = {
            "error": True,
            "message": message
        }

    return response