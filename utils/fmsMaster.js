[
  {
    "_id": { "$oid": "69b28bc36a170fd34659521e" },
    "fmsMasterId": 2,

    "fmsCreatedBy": {
      "userID": 1,
      "userEmail": "siddeshdr@ahanait.com",
      "userName": "siddesh"
    },

    "fmsName": "Ahana Library",
    "fmsDescription": "Ahana Library",
    "requestForm": "Ahana Library Request Form",

    "fmsAccess": [
      { "empId": "AS01989", "empName": "siddesh" },
      { "empId": "AS01990", "empName": "Veerana" }
    ],

    "fmsQuestionare": [
      {
        "id": "41c75229-180c-42e7-9d05-49e82eb98bda",
        "question": "Requester Name",
        "required": true,
        "answerType": "TEXT",
        "allowedAnswers": [],
        "isStartDate": false
      },
      {
        "id": "b85fc783-9b42-443a-bdc9-f48ee363ae36",
        "question": "Requester Ahana Mail Id",
        "required": true,
        "answerType": "TEXT",
        "allowedAnswers": [],
        "isStartDate": false
      },
      {
        "id": "c928f167-6f2f-4c30-8a6c-e33a53fd0cfa",
        "question": "Requester Employee Id",
        "required": true,
        "answerType": "TEXT",
        "allowedAnswers": [],
        "isStartDate": false
      },
      {
        "id": "f22805bf-af3c-4d93-b225-eb126ee52442",
        "question": "Requester Contact No",
        "required": true,
        "answerType": "NUMBER",
        "allowedAnswers": [],
        "isStartDate": false
      },
      {
        "id": "4ba18494-b72a-4f42-85ef-ff36b509e7a5",
        "question": "Team",
        "required": false,
        "answerType": "TEXT",
        "allowedAnswers": [],
        "isStartDate": false
      },
      {
        "id": "972c937b-1f06-4e58-a2ee-c41c0dd71bb3",
        "question": "Book list (1st Preference)",
        "required": false,
        "answerType": "TEXT",
        "allowedAnswers": [],
        "isStartDate": false
      },
      {
        "id": "ccc9a901-561a-4adf-8dae-a65ba36f34ca",
        "question": "Book List (2nd Preference)",
        "required": false,
        "answerType": "TEXT",
        "allowedAnswers": [],
        "isStartDate": false
      }
    ],

    "fmsWhats": [
      { "what": "Request for book", "id": 1 },
      { "what": "Check the availability of the requested book & update the requestor", "id": 2 },
      { "what": "Issue the book to the requestor and update the Book Register", "id": 3 },
      { "what": "Receive acknowledgement from the requestor through email", "id": 4 },
      { "what": "Send a reminder on Due/Return Date", "id": 5 },
      { "what": "Collect back the book from requester and update the register", "id": 6 },
      { "what": "Send mail/link for feedback/recommendations", "id": 7 }
    ],

    "fmsSteps": [
      {
        "step": 1,
        "who": {
          "department": [
            {
              "deptId": 2,
              "deptName": "HR",
              "employees": [
                { "empId": "AS01989", "empName": "siddesh" },
                { "empId": "AS01990", "empName": "Veerana" }
              ]
            }
          ]
        },
        "what": { "what": "Request for book", "id": 1 },
        "when": "",
        "how": {
          "type": "NONE",
          "description": "",
          "formStepsQustions": [],
          "miniStepsDetails": []
        },
        "plannedDate": {
          "type": "TAThrs",
          "duration": "2",
          "durationType": "hrs",
          "working": "INSIDE"
        },
        "startTimeType": "A2P"
      },

      {
        "step": 2,
        "who": {
          "department": [
            {
              "deptId": 2,
              "deptName": "HR",
              "employees": [
                { "empId": "AS01989", "empName": "siddesh" },
                { "empId": "AS01990", "empName": "Veerana" }
              ]
            }
          ]
        },
         "status": [
          { "statusId": 1, "statusName": "Available" },
          { "statusId": 2, "statusName": "Not Available" }
        ],
        "what": { "what": "Check the availability of the requested book & update the requestor", "id": 2 },
        "plannedDate": {
          "type": "TAThrs",
          "duration": "12",
          "durationType": "hrs",
          "working": "INSIDE"
        },
        "startTimeType": "A2P"
      },

      {
        "step": 3,
        "who": {
          "department": [
            {
              "deptId": 2,
              "deptName": "HR",
              "employees": [
                { "empId": "AS01989", "empName": "siddesh" },
                { "empId": "AS01990", "empName": "Veerana" }
              ]
            }
          ]
        },
         "status": [
          { "statusId": 1, "statusName": "issued " },
          { "statusId": 2, "statusName": "Not issued" }
        ],
        "what": { "what": "Issue the book to the requestor and update the Book Register", "id": 3 },
        "plannedDate": {
          "type": "TATdays",
          "duration": "1",
          "durationType": "days"
        },
        "how": {
          "type": "NONE",
          "description": "",
          "formStepsQustions": [
          ],
          "miniStepsDetails": []
        },
        "startTimeType": "A2P"
      },

      {
        "step": 4,
        "who": {
          "department": [
            {
              "deptId": 2,
              "deptName": "HR",
              "employees": [
                { "empId": "AS01989", "empName": "siddesh" },
                { "empId": "AS01990", "empName": "Veerana" }
              ]
            }
          ]
        },
        "what": { "what": "Receive acknowledgement from the requestor through email", "id": 4 },
        "plannedDate": {
          "type": "TAThrs",
          "duration": "2",
          "durationType": "hrs",
          "working": "INSIDE"
        },
        "startTimeType": "A2P"
      },

      {
        "step": 5,
        "who": {
          "department": { "deptId": 2, "deptName": "HR" },
          "employees": [
            { "empId": "AS01989", "empName": "siddesh" },
            { "empId": "AS01990", "empName": "Veerana" }
          ]
        },
        "what": { "what": "Send a reminder on Due/Return Date", "id": 5 },
        "plannedDate": {
          "type": "TATdays",
          "duration": "2",
          "durationType": "days"
        },
        "startTimeType": "A2P"
      },

      {
        "step": 6,
        "who": {
          "department": [
            {
              "deptId": 2,
              "deptName": "HR",
              "employees": [
                { "empId": "AS01989", "empName": "siddesh" },
                { "empId": "AS01990", "empName": "Veerana" }
              ]
            }
          ]
        },
        "what": { "what": "Collect back the book from requester and update the register", "id": 6 },
        "plannedDate": {
          "type": "TAThrs",
          "duration": "2",
          "durationType": "hrs",
          "working": "INSIDE"
        },
        "startTimeType": "A2P"
      },

      {
        "step": 7,
        "who": {
          "department": [
            {
              "deptId": 2,
              "deptName": "HR",
              "employees": [
                { "empId": "AS01989", "empName": "siddesh" },
                { "empId": "AS01990", "empName": "Veerana" }
              ]
            }
          ]
        },
        "what": { "what": "Send mail/link for feedback/recommendations", "id": 7 },
        "plannedDate": {
          "type": "TAThrs",
          "duration": "2",
          "durationType": "hrs",
          "working": "INSIDE"
        },
        "startTimeType": "A2P"
      }
    ],

    "createdAt": { "$date": "2026-03-12T09:55:01.143Z" },
    "updatedAt": { "$date": "2026-03-12T09:55:01.143Z" }
  }
]