# YOORA-SARAH AI Service

Optional standalone AI service scaffold.

## Role

- Reserved for future AI workloads that need to run outside the main `api` service.
- Not required for the main local development flow.
- Not a production-critical deployment unit unless future architecture promotes it.

## Local development

From the repository root:

```bash
npm run ai:run
```

## Deployment

Do not deploy this as a required service until a production feature depends on it. Current production deployment should stay focused on `web`, `portal`, and `api`.
