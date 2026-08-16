from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint to verify backend, database, and pgvector connectivity."""
    db_status = "ok"
    pgvector_status = "unknown"

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            cursor.execute("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")
            row = cursor.fetchone()
            if row:
                pgvector_status = f"active (v{row[1]})"
            else:
                pgvector_status = "extension not loaded"
    except Exception as exc:
        db_status = f"error: {exc!s}"

    return Response({
        "status": "ok",
        "service": "edusal-backend",
        "database": db_status,
        "pgvector": pgvector_status,
        "message": "Edusal Django API is healthy and connected.",
    })
