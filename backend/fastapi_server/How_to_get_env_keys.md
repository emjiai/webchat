# How to Get All Environment Keys for Google RAG Integration

This guide provides step-by-step instructions to obtain all the required environment variables for integrating with Google's Vertex AI RAG Engine.

## Prerequisites

- Google Cloud Platform account
- Project with billing enabled
- Basic familiarity with Google Cloud Console

## =Ë Required Environment Variables

```env
GOOGLE_GENAI_USE_VERTEXAI=1
GOOGLE_API_KEY=YOUR_VALUE_HERE
GOOGLE_CLOUD_PROJECT=YOUR_VALUE_HERE
GOOGLE_CLOUD_LOCATION=YOUR_VALUE_HERE
RAG_CORPUS=YOUR_VALUE_HERE
STAGING_BUCKET=YOUR_VALUE_HERE
AGENT_ENGINE_ID=YOUR_VALUE_HERE
```

---

## =' Step-by-Step Setup

### 1. Get Your Google Cloud Project ID

**Option A: From Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top of the page
3. Copy your **Project ID** (not the project name)

**Option B: Using gcloud CLI**
```bash
# Install gcloud CLI first: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config get-value project
```

**Set in .env:**
```env
GOOGLE_CLOUD_PROJECT=your-actual-project-id
```

### 2. Set Google Cloud Location

**Recommended location for RAG Engine:**
```env
GOOGLE_CLOUD_LOCATION=us-central1
```

**Other supported locations:**
- `us-east1`
- `us-west1` 
- `europe-west1`
- `asia-southeast1`

=Ö **Reference:** [Vertex AI locations](https://cloud.google.com/vertex-ai/docs/general/locations)

### 3. Enable Required APIs

**Enable APIs via Cloud Console:**
1. Go to [APIs & Services](https://console.cloud.google.com/apis/library)
2. Search and enable:
   - **Vertex AI API**
   - **Cloud Storage API**
   - **Cloud Resource Manager API**

**Or via gcloud CLI:**
```bash
gcloud services enable aiplatform.googleapis.com
gcloud services enable storage-component.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

### 4. Set Up Authentication

**Option A: Application Default Credentials (Recommended for development)**
```bash
gcloud auth application-default login
```

**Option B: Service Account Key (Recommended for production)**

1. Go to [IAM & Admin ’ Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **Create Service Account**
3. Fill in details and click **Create and Continue**
4. Grant these roles:
   - **Vertex AI User** (`roles/aiplatform.user`)
   - **Storage Admin** (`roles/storage.admin`)
5. Click **Done**
6. Click on the created service account
7. Go to **Keys** tab ’ **Add Key** ’ **Create New Key** ’ **JSON**
8. Download the JSON file
9. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
   ```

### 5. Get Google API Key (Optional - for ML Dev backend)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the generated key

**Set in .env:**
```env
GOOGLE_API_KEY=your-api-key-here
```

**Note:** Keep `GOOGLE_GENAI_USE_VERTEXAI=1` to use Vertex AI (required for RAG)

### 6. Create a RAG Corpus

**Option A: Using the Google RAG sample script**
```bash
cd backend/gemini_rag
cp .env.example .env
# Edit .env with your project details

# Install dependencies
uv sync

# Run the corpus setup script
uv run python rag/shared_libraries/prepare_corpus_and_data.py
```

**Option B: Create manually via Python**
```python
import vertexai
from vertexai import rag

# Initialize
vertexai.init(project="your-project-id", location="us-central1")

# Create corpus
corpus = rag.create_corpus(
    display_name="my_chatbot_corpus",
    description="RAG corpus for chatbot knowledge base"
)

print(f"Created corpus: {corpus.name}")
```

**Copy the corpus resource name (format: `projects/123/locations/us-central1/ragCorpora/456`):**
```env
RAG_CORPUS=projects/your-project/locations/us-central1/ragCorpora/your-corpus-id
```

=Ö **Reference:** [RAG Engine quickstart](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-quickstart)

### 7. Create a Staging Bucket

**Via Google Cloud Console:**
1. Go to [Cloud Storage](https://console.cloud.google.com/storage)
2. Click **Create Bucket**
3. Choose a globally unique name (e.g., `your-project-rag-staging`)
4. Select **Region** ’ **us-central1** (match your location)
5. Choose **Standard** storage class
6. Click **Create**

**Via gcloud CLI:**
```bash
gsutil mb -l us-central1 gs://your-project-rag-staging
```

**Set in .env:**
```env
STAGING_BUCKET=gs://your-project-rag-staging
```

=Ö **Reference:** [Create a bucket](https://cloud.google.com/storage/docs/creating-buckets)

### 8. Deploy Agent to Get Engine ID (Optional)

**If you want to deploy the Google RAG agent:**

1. **Navigate to the Google RAG directory:**
   ```bash
   cd backend/gemini_rag
   ```

2. **Deploy the agent:**
   ```bash
   uv run python deployment/deploy.py
   ```

3. **Copy the Agent Engine ID from the output:**
   ```
   Deployed agent to Vertex AI Agent Engine successfully, 
   resource name: projects/123/locations/us-central1/reasoningEngines/456
   ```

**Set in .env:**
```env
AGENT_ENGINE_ID=projects/123/locations/us-central1/reasoningEngines/456
```

=Ö **Reference:** [Deploy an agent](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/deploy)

---

##  Final Configuration Verification

Your `.env` file should look like this:

```env
# Google RAG Configuration
GOOGLE_GENAI_USE_VERTEXAI=1
GOOGLE_API_KEY=your-api-key-here
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
RAG_CORPUS=projects/123/locations/us-central1/ragCorpora/456
STAGING_BUCKET=gs://your-project-rag-staging
AGENT_ENGINE_ID=projects/123/locations/us-central1/reasoningEngines/789

# FastAPI Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=True
CORS_ORIGINS=["http://localhost:3005"]
LOG_LEVEL=INFO
```

## >ê Test Your Configuration

**Test RAG functionality:**
```bash
cd backend/gemini_rag
uv run adk run rag
```

**Test FastAPI server:**
```bash
cd backend/fastapi_server
python start_server.py
```

**Health check:**
```bash
curl http://localhost:8000/api/v1/health/rag
```

---

## =à Troubleshooting

### Common Issues

**1. Authentication Error:**
```
google.auth.exceptions.DefaultCredentialsError
```
**Solution:** Run `gcloud auth application-default login`

**2. Permission Denied:**
```
403 Forbidden: The caller does not have permission
```
**Solution:** Add required IAM roles to your account/service account

**3. RAG Corpus Not Found:**
```
RAG service is not configured
```
**Solution:** Verify your `RAG_CORPUS` value and corpus exists

**4. Staging Bucket Access Error:**
```
AccessDenied: Access denied to staging bucket
```
**Solution:** Check bucket permissions and ensure it exists

### Getting Help

- **Google Cloud Support:** [Cloud Console Support](https://console.cloud.google.com/support)
- **Vertex AI Documentation:** [Vertex AI docs](https://cloud.google.com/vertex-ai/docs)
- **ADK Documentation:** [Agent Development Kit](https://google.github.io/adk-docs/)

---

## =Ú Additional Resources

- [Vertex AI RAG Engine Overview](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-overview)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Cloud Storage Best Practices](https://cloud.google.com/storage/docs/best-practices)
- [IAM Roles for Vertex AI](https://cloud.google.com/vertex-ai/docs/general/access-control)

---

**Last Updated:** November 2024  
**Next Review:** Check for API updates and new regions quarterly