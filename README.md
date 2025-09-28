# Stashlet

![Next.js](https://img.shields.io/badge/Next.js-13+-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS%20S3-Storage-F8911C?logo=amazon-s3&logoColor=white)
![AWS DynamoDB](https://img.shields.io/badge/AWS%20DynamoDB-NoSQL-4053D6?logo=amazon-dynamodb&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS%20Lambda-Serverless-FF9900?logo=aws-lambda&logoColor=white)

Stashlet is a full-stack document vault that combines a modern Next.js dashboard with AWS-native storage. Upload receipts, contracts, IDs, or design assets, tag and filter them with ease, and let AWS S3, DynamoDB, and optionally Lambda handle the heavy lifting behind the scenes.

> **Live Demo** → [stashlet.vercel.app](https://stashlet.vercel.app/)

---

## Table of Contents

1. [Highlights](#highlights)
2. [Use Cases](#use-cases)
3. [Architecture Overview](#architecture-overview)
4. [AWS Services in Play](#aws-services-in-play)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [AWS Resource Setup Checklist](#aws-resource-setup-checklist)
8. [Development Workflow](#development-workflow)
9. [Troubleshooting](#troubleshooting)
10. [Roadmap](#roadmap)

---

## Highlights

- **Intuitive dashboard** for uploading, browsing, and editing document metadata.
- **Powerful filters** across tags, categories, expiry dates, and free-text search.
- **Scalable storage** with AWS S3 plus optional thumbnail generation via Lambda.
- **Server-rendered and client-enhanced** using Next.js App Router and React Server Components.
- **Type-safe data access** through a DynamoDB repository with schema validation.
- **Responsive UI** built with Tailwind CSS and Radix UI primitives.

## Use Cases

- 🧾 **Expense management** – centralize invoices and receipts for finance reviews.
- 🩺 **Personal records** – keep medical documents, insurance cards, and IDs accessible.
- 🏢 **Team knowledge base** – share company policies, templates, and design systems.
- 🗂 **Client deliverables** – archive contracts, proposals, and sign-off forms per client.
- 🎓 **Academic organization** – store lecture slides, research PDFs, and certifications.

## Architecture Overview

```
Client Dashboard (Next.js + Tailwind)
        │
        │ 1. Upload form submission
        ▼
API Route /api/documents (Next.js edge/server runtime)
        │
        ├─► Validates payload & file type
        ├─► Streams file → AWS S3 (documents/{uuid}/...)
        ├─► Persists metadata → DynamoDB table
        └─► (Optional) Invokes AWS Lambda for thumbnail generation

Browser fetches dashboard data
        │
        ▼
Server components query DynamoDB repository and render pages
```

## AWS Services in Play

| Service | Role | Notes |
| --- | --- | --- |
| ![S3](https://img.shields.io/badge/-S3-569A31?logo=amazon-s3&logoColor=white) | Binary storage | Stores original documents and (optionally) generated thumbnails. |
| ![DynamoDB](https://img.shields.io/badge/-DynamoDB-4053D6?logo=amazon-dynamodb&logoColor=white) | Metadata database | Captures document metadata (title, tags, size, timestamps). Auto-provisioned locally via `AWS_AUTO_CREATE_TABLE=true`. |
| ![Lambda](https://img.shields.io/badge/-Lambda-FF9900?logo=aws-lambda&logoColor=white) | Optional thumbnail worker | Triggered after image uploads to produce smaller thumbnail assets. Configure with `AWS_RESIZE_LAMBDA_FUNCTION_NAME`. |
| ![IAM](https://img.shields.io/badge/-IAM-232F3E?logo=amazon-aws&logoColor=white) | Access control | Provide credentials via environment variables or the AWS SDK default provider chain. |

## Getting Started

### Prerequisites

- Node.js **18.17+** (or any runtime compatible with Next.js 13 App Router)
- npm (bundled with Node) or pnpm/yarn if preferred
- An AWS account with rights to S3, DynamoDB, and optionally Lambda

### Installation

```bash
git clone https://github.com/himanshukt03/Stashlet.git
cd Stashlet
npm install
```

Launch the dev server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and log in (or start uploading) once your AWS resources are configured.

## Environment Variables

Create a `.env.local` file in the project root. The sample below covers every supported flag:

```
# Core AWS configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=

# S3 document storage
AWS_S3_BUCKET_NAME=stashlet-dev-bucket
AWS_S3_PUBLIC_URL_BASE=
AWS_S3_FORCE_PUBLIC_READ=false
AWS_S3_THUMBNAIL_PREFIX=thumbnails

# DynamoDB metadata table
AWS_DOCUMENTS_TABLE_NAME=stashlet-documents
AWS_AUTO_CREATE_TABLE=true

# Optional Lambda thumbnail generator
AWS_RESIZE_LAMBDA_FUNCTION_NAME=
```

**Notes**

- Leave the credential fields empty when running on EC2, Lambda, or using AWS SSO/Profiles; the SDK will pick them up automatically.
- When `AWS_AUTO_CREATE_TABLE=true` (default in development), the app will create the DynamoDB table if missing. Disable in production and provision the table manually.
- Buckets with **Object Ownership: Bucket owner enforced** (default for new buckets) block ACLs. Set `AWS_S3_FORCE_PUBLIC_READ=false` so uploads succeed and rely on presigned URLs instead of public objects.

## AWS Resource Setup Checklist

1. **S3 Bucket**
   - Create a bucket (e.g., `stashlet-dev-bucket`) in the same region you configure in `AWS_REGION`.
   - Keep ACLs disabled (Object Ownership enforced). Stashlet will automatically fall back to private uploads.
   - Optional: add a CORS policy if you plan to enable direct client-side uploads later.

2. **DynamoDB Table**
   - Table name must match `AWS_DOCUMENTS_TABLE_NAME`.
   - Primary key: `id` (string).
   - Billing mode: `PAY_PER_REQUEST` works great for sporadic usage.
   - With `AWS_AUTO_CREATE_TABLE=true`, the app will create and wait for the table when it first runs.

3. **Lambda (optional)**
   - Deploy a function capable of creating thumbnails.
   - Grant the role permissions to `s3:GetObject` and `s3:PutObject` on the document bucket.
   - Populate `AWS_RESIZE_LAMBDA_FUNCTION_NAME` with the function name.

4. **IAM / Credentials**
   - Minimal policy needs `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `dynamodb:*` on the documents table, and `lambda:InvokeFunction` (if using Lambda).
   - For local dev, exporting temporary credentials or using `aws configure sso` works well.

## Development Workflow

- **Linting:** `npm run lint`
- **Formatting:** Tailwind & Prettier configs are included; integrate with your editor for on-save formatting.
- **Testing uploads:** Run the dev server, open the dashboard, and upload any PDF or image ≤10MB.
- **Inspecting data:**
  - S3 → verify objects under `documents/<uuid>/...` and optional `thumbnails/` prefix.
  - DynamoDB → scan the table for new records; each entry maps to the UI grid.

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `AWS_REGION environment variable is not set` | Missing region in `.env.local` | Add `AWS_REGION`, restart the dev server. |
| `AWS_DOCUMENTS_TABLE_NAME environment variable is not set` | Missing table name | Populate the variable and restart. |
| `NoSuchBucket` when uploading | Bucket name typo or bucket not created yet | Create the bucket or update `AWS_S3_BUCKET_NAME`. |
| `AccessControlListNotSupported` | Bucket has ACLs disabled | Set `AWS_S3_FORCE_PUBLIC_READ=false` (default recommendation) or enable ACLs plus public access if you need public files. |
| Thumbnails never appear | Lambda not configured or lacks permissions | Deploy the function and ensure it can read/write the S3 bucket. |

## Roadmap

- 🔒 Role-based access control and multi-user tenancy.
- 🔁 Scheduled lifecycle rules for expiring temporary documents.
- 📤 Direct-to-S3 uploads with presigned POST routes.
- 📊 Usage analytics dashboard backed by CloudWatch metrics.

---

Built with ❤️ by the Stashlet team. Contributions, issues, and feature ideas are always welcome—see the [Issues tab](https://github.com/himanshukt03/Stashlet/issues) to get started.
