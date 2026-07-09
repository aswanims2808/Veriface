# Cloud Run Deployment Commands

Follow these steps to deploy your application. Replace `[PROJECT_ID]` with your actual Google Cloud Project ID.

### 0. Prerequisites
- Install Google Cloud CLI.
- Run `gcloud auth login` and `gcloud config set project [PROJECT_ID]`.
- Enable APIs: `gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com`

---

### 1. Backend Deployment

**Step A: Build and Push Backend Image**
```bash
cd backend
gcloud builds submit --tag gcr.io/[PROJECT_ID]/veriface-backend
```

**Step B: Deploy Backend to Cloud Run**
```bash
gcloud run deploy veriface-backend \
  --image gcr.io/[PROJECT_ID]/veriface-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 5000 \
  --set-env-vars="CORS_ORIGINS=*"
```
> [!NOTE]
> Copy the **Service URL** from the output (e.g., `https://veriface-backend-xxxx-uc.a.run.app`). You will need it for the frontend.

---

### 2. Frontend Deployment

**Step A: Build and Push Frontend Image**
Replace `[BACKEND_URL]` with the URL from Step 1B.
```bash
cd ../frontend
gcloud builds submit --tag gcr.io/[PROJECT_ID]/veriface-frontend --build-arg VITE_API_URL=[BACKEND_URL]
```

**Step B: Deploy Frontend to Cloud Run**
```bash
gcloud run deploy veriface-frontend \
  --image gcr.io/[PROJECT_ID]/veriface-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80
```

---

### 3. Final Step
Once both are deployed, open the **Frontend Service URL** in your browser.
