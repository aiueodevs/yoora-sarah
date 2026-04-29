# YOORA-SARAH Workers

Optional background worker scaffold.

## Role

- Reserved for asynchronous/background processing.
- Not required for the main local development flow.
- Not a production-critical deployment unit unless future features explicitly promote it.

## Local development

From the repository root:

```bash
npm run workers:run
```

## Deployment

Do not deploy this as a required service until a production feature depends on it. Keep it optional to preserve the simple `web + portal + api` deployment model.
