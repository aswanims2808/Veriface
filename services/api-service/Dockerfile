FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 5000

# Set Python path to /app so we can import from app
ENV PYTHONPATH=/app

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "8", "--timeout", "0", "--chdir", "app", "app:create_app()"]
