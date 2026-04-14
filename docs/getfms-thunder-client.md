Thunder Client requests and cURL samples for `getFms` APIs

Use these request details in Thunder Client (VS Code extension) or via `curl`.

Base URL: http://localhost:4000

Headers (set for requests that require auth):
- `Authorization`: Bearer <YOUR_JWT_TOKEN>
- `Content-Type`: application/json

Examples

1) Find Single FMS
- Method: POST
- URL: /api/getfms/findSingleFms
- Body (JSON):
  {
    "fmsMasterId": 123
  }

curl:
```bash
curl -X POST http://localhost:4000/api/getfms/findSingleFms \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fmsMasterId":123}'
```

2) Find All FMS
- Method: GET
- URL: /api/getfms/findAllFms

curl:
```bash
curl -X GET http://localhost:4000/api/getfms/findAllFms \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

3) Find FMS Questionnaires For User
- Method: GET
- URL: /api/getfms/findFmsQuestionaresForUser

curl:
```bash
curl -X GET http://localhost:4000/api/getfms/findFmsQuestionaresForUser \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

4) Find Previous Steps Details
- Method: POST
- URL: /api/getfms/findPreviousStepsDetails
- Body (JSON):
  {
    "fmsMasterId": 123,
    "stepId": 3
  }

curl:
```bash
curl -X POST http://localhost:4000/api/getfms/findPreviousStepsDetails \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fmsMasterId":123, "stepId":3}'
```

5) Find Next Steps Details
- Method: POST
- URL: /api/getfms/findNextStepsDetails
- Body (JSON): same shape as previous

6) Find All Details For One Master FMS (test)
- Method: POST
- URL: /api/getfms/findAllDetailsForOneMasterFmstest
- Body (JSON):
  {
    "fmsMasterId": 123
  }

7) Fetch Form Questions (dates)
- Method: POST
- URL: /api/getfms/fetchFormQuestions
- Body (JSON):
  {
    "fmsMasterId": 123
  }

8) Find Historical FMS
- Method: GET
- URL: /api/getfms/findHistoricalFms

9) Find Draft FMS
- Method: GET
- URL: /api/getfms/findDraftFms

10) Find All FMS Question (by master)
- Method: POST
- URL: /api/getfms/findallFmsquestion
- Body (JSON): { "fmsMasterId": 123 }

11) Find All External Employee Steps
- Method: POST
- URL: /api/getfms/findallexternalEmployee
- Body (JSON): { "fmsMasterId": 123 }

Notes
- Ensure server is running (default port 4000 per `.env`).
- Use a valid JWT token in `Authorization` header; the helper `fetchUserDetails` expects a Bearer token and reads company URL and user details from it.
- In Thunder Client: create a new collection, add requests with the methods/URLs above, set a collection or environment variable `{{baseUrl}}` = `http://localhost:4000` and `{{auth}}` = `Bearer <token>` to reuse across requests.
