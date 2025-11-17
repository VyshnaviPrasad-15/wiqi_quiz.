## Root Dockerfile to build the backend when Render (or other services) run `docker build` at repo root.
# It simply copies the `backend/` directory into the image and starts the FastAPI app.

FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
 && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY backend/ ./

# Install Python deps
RUN pip install --no-cache-dir --upgrade pip && \
    if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

# Expose the port Render will route to (default to 10000)
ENV PORT=10000
EXPOSE ${PORT}

# Default command to run the backend; bind to the runtime $PORT so platforms can set the port
# Use shell form so the env var is expanded at runtime.
CMD sh -c "gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:${PORT} --workers 2"
