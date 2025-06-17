FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN pip install uvicorn[standard]  # Needed for env support
ENV PORT 8080
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
